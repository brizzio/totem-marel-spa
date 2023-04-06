import React, {useReducer, useMemo, useRef, useEffect, useCallback} from 'react'
import { useMutation } from '@tanstack/react-query';
import Payment from './pages/Payment';

import useSession from './context/hooks/useSession';
import usePrices from './context/hooks/usePrices';
import useScanner from './context/hooks/useScanner';
import useCart from './context/hooks/useCart';

import AppLayout from './layouts/AppLayout';
import Start from './pages/Start';

import IdiomSelector from './components/common/IdiomSelector';
import BizerbaLogoSVG from './components/common/BizerbaLogoSVG';

import { checkEan } from './utils/functions';

import { fetchQuery } from './api/api';

import SearchModal from '../modals/SearchModal';



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

const starting = useRef(true)

const ctxModel={
  session:{},
  hasSerial:false,
  port:null,
  user:{},
  prices:[],
  carts:[],
  currentCart:{},
  currentRead:{},
  view:0
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
        console.log('init session', session)
        starting.current = false
      return {

        ...ctxModel,
        session:JSON.parse(localStorage.getItem('session')),
        prices:prices.data,
        view:0
        
        

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

          let items = [...state.currentCart.items, item]
          
          newState.currentCart.items = items
          newState.currentCart.total= summarize(items,'calculated_price')

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
              total:summarize(removedList,'calculated_price')
              
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
  
  const init = () => {
      console.log('starting?', starting.current)
      if(starting.current) dispatch({type:'init'})
    }
  
  
 

  useEffect(() => {
    console.log('init state')
    init()
  
   
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

  const removeListItem =(index)=>dispatch({type:'removeItemFromCartList' , key:index})

  const clearCart = () =>dispatch({type:'clearCurrentCart'})

  const newCart = ()=>{
    dispatch({type:'clearRead'})
    createCart()
  }

  if(!ctx.session.exists) return ( <AppLayout><Start ctx={ctx} nav={nav} closeSession={closeSession}/></AppLayout>)

  if(ctx.view == 1) return (
    <>
      <Payment total={2.44} nav={nav} />
    </>
  )

  


  console.log('state no App', ctx)
  
  
  
  return (

   
   <AppLayout>
    
    
    {/* Absolute positioned items */}
    <div className="absolute top-0 right-0"> 
       <IdiomSelector/>
    </div>
    <BizerbaLogoSVG cn="absolute -bottom-1 right-3 pr-3"/> 
   
    {/* Content page to display */}
    <div className="flex justify-center items-center w-full "> 
      
      {!ctx.isScannerOn && <ScannerDisplay init={start} read={readed} port={portInfo} isOn={isScannerOn}/>}

      {ctx.port && 
      !ctx.currentCart.cart_id && 
      <InitCart current={ctx.currentCart} newCart={newCart}/>}
   
     {ctx.port && 
      ctx.currentCart.cart_id && 
      <Main cart={ctx.currentCart} 
            trash={removeListItem}
            clear={clearCart}
            closeCart={closeCartWrapper}/>}
   

       

    </div>
   
    







   
   
   

   </AppLayout>
   
   
      
       
      
    
    
  )
}


const Main = ( {cart, trash, clear, closeCart})=>{

  
  console.log('main cart ', cart, !!cart.items)
  const remove = (index)=>trash(index)
  const clearCart = ()=> clear()
  const closeCurrentCart = ()=>{
    console.log('closing cart')
    //console.log('session', JSON.stringify(session))
    //console.log('cart', JSON.stringify(cart))
    closeCart()

  }

  const getData = (iso) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("it-IT").format(date);
    // Expected output: "12/20/2020"
  };

  return(
  
  <div className='flex flex-row justify-center w-full h-fit '>


    <div className='flex flex-col items-center justify-center  border-zinc-600 w-1/2 h-full bg-white mx-2 mt-4 rounded-tl-2xl rounded-tr-2xl ' >
            <div className='flex items-center  w-full h-[2.5rem] bg-teal-600 py-3 rounded-tl-2xl rounded-tr-2xl pr-2'>
            <img  className=" w-[6rem] p-2" src='/marel-logo.png'/>
                <span className='text-white text-lg font-semibold pl-3'>LA TUA SPESA</span>
                
                <span className="text-white text-lg pl-3">Cliente:--</span>  
                
                <span className="text-white text-lg pl-3">{getData(cart.created_at)}</span>  

                <span className="text-white text-lg pl-3">0</span> 
            </div>
            <div className="flex flex-col w-full h-[30rem] items-start overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               {!!cart.items
                ? cart.items.map((el,i)=>!el.deleted &&<ListItemRender 
                key={i} 
                item={el}
                onTrashClick={()=>remove(i)}
                />)
                :<span className='text-blue font-thin text-3xl px-3 w-[16rem] my-3'>Passa i prodotti nello scanner...</span>}
                
            </div>

        </div>

        <div className='flex flex-col items-left justify-center w-1/2  gap-5 ml-3 mt-4'>
            
           
 
 
            <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
                <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
                <div className=" flex flex-col w-full ">
                    <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Il scanner non legge il prodotto?</span>
                    <SearchModal btnTitle='clicca'/>
                   
                </div>               
            </div>


             <div className=" absolute top-8 right-28 flex flex-col h-[8rem] items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-[8rem] pb-6 ">
 
                 
                 <img  className="  w-[5rem]" src='/lotteryIcon.png'/>
 
                 <span className='text-blue font-thin text-xl px-3 text-center w-[10rem] leading-6'>LOTTERIA SCONTRINI</span>
                     
             </div>
             
            
             <span className='flex items-center justify-start mt-3 text-indigo-800 font-thin text-3xl px-3 text-left w-full'>Ti occorre qualcos'altro?</span>
 
 
             <div className=" flex flex-col h-fit items-center border-zinc-600  w-full gap-3 ">
 
                 <div className=" flex flex-row w-full justify-between items-center">
                     <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[13rem] " >
                         <i className="fa-solid fa-mobile-screen-button fa-3x"></i>
                         <span className='text-blue font-thin text-2xl px-3 w-full text-center'>Ricarica Telefono</span>
                     </div>
                     <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[13rem] ">
                         <i className="fa-solid fa-percent fa-3x"></i>
                         <span className='text-blue font-thin text-2xl px-3 
                         w-full text-center'>Applica Sconto</span>
                     </div>
                     <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[13rem] ">
                         <i className="fa-solid fa-basket-shopping fa-3x"></i>
                         <span className='text-blue font-thin text-2xl px-3 w-full text-center'>La Mia Borsa</span>
                     </div>
                 </div> 
 
             </div>
 
             <div className=" flex flex-row h-fit items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-full ">
                 <span className='text-zinc-900 font-normal text-4xl text-center py-3 px-1 '> € </span>
                     <span className='text-zinc-900 font-normal text-4xl text-center py-3 '> {cart.total.toFixed(2)}</span>
             </div>
             
             <button className={`bg-teal-600  py-6 mx-2 rounded-lg shadow-md text-white font-semibold w-full text-2xl ${cart.total==0?'disabled':''}`}
             onClick={closeCurrentCart}>PROCEDI COL PAGAMENTO
             </button>
 
         </div>
    </div>

  )
}


const ListItemRender = (props) => {
  

  const { item, onTrashClick}  = props
  

  var total = item.calculated_price?parseFloat(item.calculated_price):0
  var priceType = item.promo_type>0?"P":"R"

 
  

  return (
  <div className='flex flex-row w-full px-3 py-0.5 items-center justify-between text-xs text-gray-900 border-b border-gray-400'>
      <div className='flex flex-row items-center'>
          <span className="px-2">{item.upc}</span> 
          <span className="px-2">{item.product_name}</span>       
          <span className="pl-2">{item.weight}</span>
          <span>{item.weight_unit}</span>          
      </div>  
      <div className="py-1 px-1">
          <div className="flex flex-row py-1 px-1 items-center gap-1">
              <span>{item.currency}</span>
              <span>{total.toFixed(2)}</span>
              <span className="px-2">{priceType}</span> 
              <button id={item.entry_id} 
                      onClick={onTrashClick}>
                  <i className="fa-regular fa-trash-can"></i>
              </button>
          </div>          
      </div>
  </div>
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
    
    <div className="relative flex items-center justify-center w-4/6 min-h-full border-zinc-600 bg-white shadow-lg rounded-2xl"> 
      <div className=" flex flex-row items-center justify-center h-[26rem] w-[30rem] ">
          <img  className="  h-[18rem] " src='/scanner.gif'/>
          <div className=" flex flex-col w-full ">
              <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Clicca qui per registrare lo scanner su questo dispositivo.</span>
              <button className='bg-red-500  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl' onClick={initScanner}
             >ATTIVARE
              </button>
          </div>  

           <img  className=" absolute top-3 left-0 w-[6rem] p-2" src='/marel-logo.png'/>
      </div>
    </div>
    
    
    
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

    <div className='relative flex flex-col h-[32rem] w-full items-center justify-center bg-teal-300 rounded-xl gap-4'
    style={{background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"}}>
        
        <div className=" px-6">
          <h2 className="text-4xl font-bold mb-2 text-white text-center">
            Clicca per iniziare il cassa!
          </h2>
          <h3 className="text-2xl mb-8 text-gray-200">
            Scannerizza i prodotti del tuo carrello e poi paga direttamente qui, senza perdere tempo!
          </h3>
      </div>

      <button className="bg-orange-500  text-2xl rounded-full py-3 px-20 shadow-lg uppercase tracking-wider text-white"
      onClick={create}>
          INIZIO
        </button>
       

        <img  className=" absolute top-3 left-0 w-[6rem] p-2" src='/marel-logo.png'/>

    </div>
    
   
  
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
