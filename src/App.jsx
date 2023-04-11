import React, {useReducer, useMemo, useRef, useEffect, useCallback} from 'react'
import { useMutation } from '@tanstack/react-query';

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

import Timer from './components/common/Timer'

//components
import RenderList from './components/RenderList';
import ClosingCart from './components/ClosingCart';
import PrintTicket from './components/PrintTicket';
import Bags from './components/Bags';

import SearchModal from './modals/SearchModal';
import FiscalCodeModal from './modals/FiscalCodeModal';
import PaymentModal from './modals/PaymentModal';



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
  search:'',
  view:0,
  showRegisterForm:false
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

      case 'searchItemByUPC':

      //console.log('onRead state - action', state, action.readed)
      const upcDetails = action.searchString?checkEan(action.searchString):{}
      const searchResult = searchCode(action.searchString)

      let items = [...state.currentCart.items]

      if (!!searchResult){
          

        let item ={
          ...searchResult,
          code_type:'upc',
          read_id:'manual',
          digits:upcDetails.digits,
          entry_id:new Date(utcTime).toISOString().replace(/\D/g, ''),
          deleted:false,
          date_added: date,
          time_added: utcTime,
          order:'1/1',
          quantity:1,

        }

        let items = [...items, item]
        
      }

     
      return {
        ...state,
        search:action.searchString,
        searchItem:{
                     ...upcDetails,
                     reference:!!searchResult?searchResult:{},
                     isListed:!!searchResult,
                     type:!!searchResult?'PRODUCT':'OTHER'
                    },
        currentCart:{
                      ...currentCart,
                      items:items,
                      total:summarize(items,'calculated_price')
                      
                    },
        currentRead:{}
        

      }

        


            
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
              currentCart:{},
              search:'',
              searchItem:{}
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
*/
      case 'updateFiscalCode':

      return {
        ...state,
        currentCart:{
          ...currentCart,
          costumer:{
            id:crypto.randomUUID(),
            fiscal_code:action.fiscalCode
          }

          
        }
        
    }

    case 'insertOrRemoveBag':

    let newBag ={
      ...state.prices.find(item => item.product_id === 145),
      code_type:'upc',
      read_id:'bag_insertion',
      digits:'',
      entry_id:new Date(utcTime).toISOString().replace(/\D/g, ''),
      deleted:false,
      date_added: date,
      time_added: utcTime,
      order:'1/1',
      quantity:1,

    }

    let list = []


    if(action.toDo == 'add'){
      list = [...state.currentCart.items, newBag]
    }

    if(action.toDo == 'remove'){
      const arr = state.currentCart.items
      const index = arr.findIndex(obj => {
        return obj.product_id == 145;
      });
      console.log('bag index',index); // 👉️ -1
      
      if (index !== -1) {
        arr.splice(index,1)
        list = arr
        console.log('list', list)
        
      }
      
    }


      return {

          ...state,
          currentCart:{
            ...currentCart,
            items:list,
            total:summarize(list,'calculated_price')
            
          }

      }

      case 'showRegisterCostumerForm':

      return{
        ...state,
        showRegisterForm: !state.showRegisterForm
      }
 

      /* 
      CLOSE CART ROUTINE
      
      */

      case 'paymentMethod':

      return  {
        ...state,
        currentCart:{
          ...currentCart,
          status:'closing',
          payment_method:action.method,
          payment_status:'pending'
        }
        
    }


    case 'paymentStatus':

      return  {
        ...state,
        currentCart:{
          ...currentCart,
          status:'closing',
          payment_status:action.status
        }
        
    }


      case 'startClosingCartProcess':
        console.log('startClosingCartProcess...')
       
        return  {
          ...state,
          currentCart:{
            ...currentCart,
            status:'closing',
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

  const willCloseCart= ()=>dispatch({type:'startClosingCartProcess'})
  
  const closeCartWrapper=()=>dispatch({type:'closeCartWrapper'})

  const removeListItem =(index)=>dispatch({type:'removeItemFromCartList' , key:index})

  const clearCart = () =>dispatch({type:'clearCurrentCart'})

  const searchItem = (upc)=> dispatch({type:'searchItemByUPC', searchString:upc})

  const insertFiscalCode = (code)=>dispatch({type:'updateFiscalCode', fiscalCode:code})

  const paymentModalAction = (value)=>{
    console.log('paymentModalAction', value)
    dispatch({type:'paymentMethod', method:value})
  }

  const paymentStatusChange = (value)=>{
    console.log('paymentStatusChange', value)
    dispatch({type:'paymentStatus', status:value})
  }

  const newCart = ()=>{
    dispatch({type:'clearRead'})
    createCart()
  }

  const bagger = (value)=>{
    //the value is add or remove
    console.log('edit bags action ', value)
    dispatch({type:'insertOrRemoveBag', toDo:value })
  }

  const toggleRegisterForm = ()=>{
    console.log('toggleRegisterForm isVisible', ctx.showRegisterForm)
    dispatch({type:'showRegisterCostumerForm'})
  }
  const registerCostumer = (payload)=>{
    console.log('register costumer', payload)
    dispatch({type:'registerCostumer'})
  }

  /* if(!ctx.session.exists) return ( <AppLayout><Start ctx={ctx} nav={nav} closeSession={closeSession}/></AppLayout>)

  if(ctx.view == 1) return (
    <>
      <Payment total={2.44} nav={nav} />
    </>
  )
 */
  


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
      
      {!ctx.isScannerOn && 
      <ScannerDisplay 
      init={start} 
      read={readed} 
      port={portInfo} 
      isOn={isScannerOn}/>}

      {ctx.isScannerOn && !ctx.currentCart.cart_id && 
      <InitCart current={ctx.currentCart} newCart={newCart}/>}
   
     {ctx.currentCart.status=='active' && 
     !ctx.showRegisterForm &&
      <Main cart={ctx.currentCart} 
            trash={removeListItem}
            clear={clearCart}
            closeCart={willCloseCart}
            search={searchItem}
            fiscal={insertFiscalCode}
            paymentAction={paymentModalAction}
            editBags={bagger}
            toggleForm={toggleRegisterForm}/>}
   
    

    {ctx.currentCart.status=='closing' && 
    ctx.currentCart.payment_status=='pending' && 
      <ClosingCart 
      cart={ctx.currentCart} 
      payStatus={paymentStatusChange} />}

    {ctx.currentCart.status=='closing' && 
    ctx.currentCart.payment_status=='fulfilled' && 
     <PrintTicket closeCart={closeCartWrapper}/>}
   
   {ctx.showRegisterForm && 
   <div>
    
    <div>
      costumer form
    </div>
    <button onClick={()=>toggleRegisterForm()}>close form</button>
    
    </div>}
    
    
    
    </div>
   
   

   </AppLayout>
   
   
  )
}


const Main = ( {
  cart, 
  trash, 
  clear, 
  closeCart, 
  search,
  fiscal,
  paymentAction,
  editBags,
  toggleForm
})=>{

  
  console.log('main cart ', cart, !!cart.items)
  const remove = (index)=>trash(index)
  const clearCart = ()=> clear()
  const closeCurrentCart = ()=>{
    console.log('starting the cart close process')
    //console.log('session', JSON.stringify(session))
    //console.log('cart', JSON.stringify(cart))
    closeCart()

  }

  const getData = (iso) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("it-IT").format(date);
    // Expected output: "12/20/2020"
  };

  const lottery = ()=>{
    console.log('lottery clicked')
  }

  return(
  

  <div className='flex flex-row justify-center w-full h-fit '>
    <div className="absolute top-0 left-0 flex flex-row items-center " >
        <img  className="w-[6rem] p-2" src='/marel-logo.png'/>
        <Timer cn="font-xs text-gray-500 leading-3 text-[11px] mt-2"/>
    </div>
    
    <div className='flex flex-col items-center justify-center  border-zinc-600 w-1/2 h-full mx-2 mt-4 rounded-tl-2xl rounded-tr-2xl ' >
           <RenderList cart={cart} 
                       toggle={toggleForm}/>
            <div className='flex flex-row items-center mt-5 w-full h-[3.5rem] justify-between'>
                <button className="bg-red-500  py-4 rounded-lg shadow-xl text-white font-semibold w-[10rem] text-2xl"
              onClick={clearCart}>
                CANCELLA
              </button>
              <Bags list={cart.items}
            edit={editBags} />

            </div>
           
        </div>

        <div className='flex flex-col items-left justify-center w-1/2  gap-5 ml-3 mt-4'>
            
           
 
 
            <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
                <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
                <div className=" flex flex-col w-full ">
                    <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Lo scanner non legge il prodotto?</span>
                    <SearchModal btnTitle='clicca'
                    update={search}/>
                   
                </div>               
            </div>


             <div className=" absolute top-8 right-28 flex flex-col h-[8rem] items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-[8rem] pb-6 "
             onClick={lottery}>
 
                 
                 <img  className="  w-[5rem]" src='/lotteryIcon.png'/>
                 <FiscalCodeModal btnTitle='LOTTERIA SCONTRINI' update={fiscal} />
               
                     
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
             <PaymentModal 
             btnTitle='PROCEDI COL PAGAMENTO'
             update={paymentAction}
             total={cart.total}
             />
             
 
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
