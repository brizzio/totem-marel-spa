import {useReducer, useMemo, useRef, useEffect, useCallback} from 'react'

import { useMutation } from '@tanstack/react-query';
import Payment from './pages/Payment';





import useSession from './context/hooks/useSession';
import usePrices from './context/hooks/usePrices';
import useScanner from './context/hooks/useScanner';


import useCart from './context/hooks/useCart';

import { checkEan } from './utils/functions';

import { fetchQuery } from './api/api';



const scanType = Object.freeze({
  PRODUCT: 'PRODUCT',
  OTHER: 'OTHER'
})





function App() {

  const { prices } = usePrices()
  const {session, closeSession } = useSession()
  const {start, readed, portInfo, isScannerOn } = useScanner()

  
  const {
    currentCart,
    
    insertItem,
    removeItem,
    createCart,
    deleteCart,
    addFiscalCode,
    searchCode

} = useCart()

const started = useRef(false)

const ctxModel={
  session:{},
  hasSerial:false,
  port:null,
  user:{},
  prices:[],
  carts:[],
  currentCart:{},
  currentRead:{}
}


  const ctxReducer = (state, action) =>{

    console.log('CTX reducer', state, action)

    let date =new Date()
    let utcTime = date.getTime() + date.getTimezoneOffset()

    const summarize = (arr, field) => arr.reduce((a,e)=>{
      let val = e.deleted?0:e[field]
      return a + val
    },0)

    switch (action.type){

      case 'init':
        console.log('init', state, action)
        console.log('init prices', prices)
        started.current = true
      return {

        ...ctxModel,
        session:session,
        prices:prices.data,
        
        

      }

      case 'onRead':
        //console.log('onRead state - action', state, action.readed)
        const obj = action.readed.code?checkEan(action.readed.code):{}
        const gotRef = searchCode(readed.code)

        //console.log('onread reference current cart', !!gotRef , state.currentCart.cart_id, !!gotRef && state.currentCart.cart_id !== '')

        let newState = {
          ...state,
          currentRead:{...action.readed, 
                       ...obj,
                       reference:!!gotRef?gotRef:{},
                       isListed:!!gotRef,
                       type:!!gotRef?'PRODUCT':'OTHER'
                      }
          
  
        }

        

        const cartIsOpen = (!!state.currentCart.cart_id && !state.closed_at)

        //console.log('onread cartIsOpen', !!state.currentCart.cart_id ,!state.closed_at, cartIsOpen)

        //console.log('onread evaluate cart', !!gotRef ,cartIsOpen, !!gotRef && cartIsOpen)

        if (!!gotRef && cartIsOpen){
          

          let item ={
            ...gotRef,
            code_type:obj.evaluationType,
            read_id:obj.read_id,
            digits:obj.digits,
            entry_id:new Date(utcTime).toISOString().replace(/\D/g, ''),
            deleted:false,
            date_added: date,
            time_added: utcTime,
            order:'1/1',
            quantity:1,

          }

          let items = state.currentCart.items
         
          newState.currentCart.items =[...items, item]
          newState.currentRead={}
          
        }

        


      return newState

            
      case 'onPortOpen':
                           
            return {
              ...state,
              ...action.data
            } 
      
      case 'onCurrentCartUpdate':
                           
            return {
              ...state,
              currentCart:action.cart
            } 
      
      case 'clearCurrentCart':
                           
            return {
              ...state,
              currentCart:{}
            } 

      case 'removeItemFromCartList':

        var item = state.currentCart.items[action.key]
        console.log('to delete', item)

        const removedList = state.currentCart.items.map((el,i)=>
            i==action.key
            ?{...el, deleted:true}
            :el
        )

        
        const removedState = {
            ...state,
            currentCart:{
              ...currentCart,
              items:removedList,
              
            }
            
        }

      return removedState;
      
      case 'changeView':
        console.log('change view ...', action.id)
                    
      return {
        ...state,
        view:action.id
      } 
      
      case 'clearRead':
            console.log('clear last reading...')
                    
            return {
              ...state,
              currentRead:{}
            } 
      
      /* 
      payment methods {
        debit:'debit',
        credit:'credit',
        cash:'cash',
        other:'other'
      }
      
      payment status {
        pending:'pending',
        done:'done',
        rejected:'rejected',
        aborted:'aborted'
      }
      
      */
      case 'selectPaymentMethod':
        console.log('selectPaymentMethod...', action.payment)
                
        return  {
          ...state,
          currentCart:{
            ...currentCart,
            payment_method:action.payment.method,
            payment_status:action.payment.status,
            payment_value:action.payment.value,
            
          }
          
      }


      /* 
      CLOSE CART ROUTINE
      
      */
      case 'startClosingCartProcess':
        console.log('startClosingCartProcess...')

       
                
        return  {
          ...state,
          currentCart:{
            ...currentCart,
            status:'closed',
            closed_at: new Date(utcTime).toISOString()

            
          }
          
      }

      case 'closeCartWrapper':
        console.log('closeCartWrapper...')

        let c = state.currentCart
        c.closed_at= new Date(utcTime).toISOString()
        c.count= c.items.length
        c.purchase_items_count= c.items.filter(e=>!e.deleted).length
        c.total=summarize(c.items,'calculated_price')


        function postCartPayload(){

          let sessionInfo = {
            session_id:session.data.session_id,
            device_id: session.data.device_id
          }
        
          let cartInfo = {
            cart_id:c.cart_id,
            cart_date: c.date,
            cart_created_at:c.created_at,
            cart_closed_at:c.closed_at,
            user_fiscal_code:c.fiscal_code,
            cart_origin:c.origin
          }
        
          let arr =[]

          for (item in c.items){
            
            arr.push({
              ...sessionInfo,
              ...cartInfo,
              ...c.items[item]
            })
          }
        
          return arr
        
        
        }

        const requestBody ={
          table:'totem',
          payload:postCartPayload()
        }
        fetchQuery(requestBody).then((res)=>console.log('database sync', res))

        


        return  {
          ...state,
          carts: [...state.carts, c],
          currentCart:{},
          currentRead:{}
          
      }
  
         
    }

  }
  
  const [ctx, dispatch] = useReducer(ctxReducer, ctxModel)
  
  const init = useCallback(
    () => {
      if(!started.current) dispatch({type:'init'})
    },
    [started.current],
  )

  
  
  

  useEffect(() => {
    console.log('init state')
    init()
  
    return () => {
      console.log('init state useEffect')
    }
  }, [])
  
  
  useMemo(() => {
    
    console.log('readed changed', readed)
    if(readed.code !== '') dispatch({type:'onRead', readed})
      
  }, [readed])

  useMemo(() => {
    
    console.log('open port useMemot', portInfo.current)
    dispatch({type:'onPortOpen', data:{
      hasSerial:true,
      port:portInfo.current,
      isScannerOn:isScannerOn
    }})
    
  }, [portInfo.current])

  useMemo(() => {

    
       console.log('current cart useMemo', portInfo.current)
       dispatch({type:'onCurrentCartUpdate', cart:currentCart})
    
   
  }, [currentCart])
  
  //const exposeScannerReading = (readed)=> dispatch({type:'onRead', readed})

  //if (loading) return(<Render/>)

  
  const nav = (view)=>dispatch({type:'changeView', id:view})

  const closeCart= ()=>dispatch({type:'startClosingCartProcess'})
  
  const closeCartWrapper=()=>dispatch({type:'closeCartWrapper'})

  const newCart = ()=>{
    dispatch({type:'clearRead'})
    createCart()
  }

  if(ctx.view == 1) return (
    <>
      <Payment total={2.44} nav={nav} />
    </>
  )

  console.log('state no App', ctx)
  return (

   <>
   
   <SessionDisplay active={session} onClose={closeSession}/>
   <div>------------------------------------------------------------</div>
   <ScannerDisplay init={start} read={readed} port={portInfo} isOn={isScannerOn}/>
   <ReadedDisplay read={readed}  />
   <div>------------------------------------------------------------</div>
    <CtxDisplay state={ctx}/>
   <div>===============================================================</div>
   <div>APPLICATION</div>
   <div>===============================================================</div>
   <div>{ctx.port
      &&<InitCart current={ctx.currentCart} newCart={newCart}/>}
   </div>
   <div>{ctx.port
      &&<ListDisplay cart={ctx.currentCart} deleteCart={()=>dispatch({type:'clearCurrentCart'})} 
      removeItem={(index)=>dispatch({type:'removeItemFromCartList' , key:index})}/>}
   </div>

   <div>{ctx.port
      &&<CloseCartDisplay ctx={ctx} nav={nav} dispatch={closeCartWrapper}/>}
   </div>
   
   </>
      
       
      
    
    
  )
}





const SessionDisplay =({active, onClose})=>{

  
  


  const close = ()=> onclose()


  return(
    <>
    
    
    <div>
      {`Session: ${JSON.stringify(active)}`}
    </div>

    <button onClick={close}>close session</button>

   
    </>
  )
}


const ScannerDisplay =(props)=>{

 //const {start, readed, portInfo } = useScanner()
   
  const initScanner = async ()=>{
    console.log('init scanner')
    await props.init()
  }

  


  return(
    <>
    
    <div>
      {props.isOn?'Scanner is ON':'Scanner is OFF'}<br/>
      {`Port: ${JSON.stringify(props.port.current)}`}
    </div>
    
    <div>
      <p>{`Session Reading Count: ${JSON.stringify(props.read.count)}`}</p>
      {`Code: ${JSON.stringify(props.read.code)}`}
    </div>
    <br/>
    {
      !props.port.current&&<button onClick={initScanner}>Activate Scanner</button>
    }
    
    
    
    
    </>
  )
}

const InitCart =({current, newCart})=>{

  
  

  const create = () => {
    newCart({origin:'totem'})
  }
   
  

 if (current.cart_id) return(
  <div>
  <p>We have an opened cart</p>
  <p>Cart Id: {current.cart_id}</p>
  <p>Cart Started At: {current.created_at}</p>
  <p>Items: {current.items.length}</p>

  </div>

 )

  return(
    <>
    <button onClick={create}>NEW CART</button>
    <br/>   
    </>
  )
}


const ReadedDisplay =({read})=>{

  //console.log('symbol', Symbol(read.count).description)

  return(
    <>
    <div>
      Last Reading: {JSON.stringify(read)}
      <br/>
    </div>

    
    </>
  )
}

const CtxDisplay =({state})=>{

  

  return(
    <>
    <div>
      Current Reading: {JSON.stringify(state?.currentRead)}
      
    </div>

    
    </>
  )
}

const ListDisplay =({cart, deleteCart, removeItem})=>{

 
const cartDelete = ()=>deleteCart()

const itemDelete = (pos)=>removeItem(pos)


const total = (arr, field) => arr.reduce((a,e)=>{
  let val = e.deleted?0:e[field]
  return a + val
},0).toFixed(2)

if (!cart.cart_id) return(
  <>
  <p>In agguardo di un nuovo cliente</p>
  </>
 )
   
 if (!cart.items?.length) return(
  <>
  {JSON.stringify(!!cart.cart_id)}
  <p>Passa i prodotti nello scanner</p>
  </>
 )

  return(
    <>
    <div>
      CART HEADER<br/>
      TOTAL: {total(cart.items, 'calculated_price')}
    </div>

    <div>
      {cart.items.map((el, i)=>{
        return(
          !el.deleted && <div key={i}>
            <span>{i}</span>
            <span>{el.internal_code}</span>
            <span>{el.product_name}</span>
            <button onClick={()=>itemDelete(i)}>DEL</button>
          </div>
        )
      })}
    </div>
        
    <div>
      <button onClick={()=>cartDelete()}>Delete Cart</button>
    </div>
    
    </>
  )
}

const CloseCartDisplay =({ctx, nav, dispatch})=>{

  //console.log('symbol', Symbol(read.count).description)
  const {session} = useSession()
  const cart = ctx.currentCart
  const status =ctx.currentCart.status?ctx.currentCart.status:'open'
  const close = ()=>{
      console.log('closing cart')
      //console.log('session', JSON.stringify(session))
      //console.log('cart', JSON.stringify(cart))
      dispatch()
  }

  return(
    <>
    <div>
      {!!cart.items?.length && <button onClick={close}>CLOSE CART   </button>}
      __STATUS: {status}

    </div>
    

    
    </>
  )
}


export default App
