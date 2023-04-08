import React, { useState, useEffect , useRef, useReducer} from 'react'
import RenderListItem from '../components/RenderList'
import useStore from '../context/hooks/useStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLocalStorageCollectionDataByKey, getCartValue } from '../utils/functions'

import useCart from '../context/hooks/useCart'
import usePrices from '../context/hooks/usePrices'





const listReducer = (state, action) => {

    
    console.log('reducer' ,state, action)
    console.log('no reducer', Math.random())
    
    
    switch (action.type) {

    
      case 'ADD_ITEM':
        console.log('action Add', action.newItem)
        action.newItem.entry_id = Math.random()
        return {
            ...state,
            list: [...state.list, action.newItem],
            
            
        }

      case 'REMOVE_ITEM':
        var item = state.list[action.key]
        console.log('to delete', item)
        return {
          ...state,
          //list: state.list.filter((item) => item.entry_id !== action.id),
          list:state.list.map((el,i)=>
              i==action.key
              ?{...el, deleted:true}
              :el
          )
        
        };

      
      default:
        throw new Error();
    }

    
  };

const views = [
  'default',
  'payment'
]
  


const Home = () => {

  const { bags } = useStore()
  const [ prices , loading ] = usePrices()
  const [view, setView] = useState(views[0])

  const [listData, dispatchListData]=useReducer(listReducer,{
    list:[],
    total:0,
  })

  
  const [isScannerOn, setIsScannerOn] = useState(false)
 
 
  const hasSerial = useRef(!!('serial' in navigator))
  
  const port = useRef(null)
  const portInfo = useRef(null)
  

  const navigate = useNavigate()

  const { currentCart, 
          insertItem, 
          removeItem, 
          createCart 
        } = useCart()

  
  
 //console.log('hasSerial', hasSerial.current)
 console.log('loading', loading)

// get fiscal code from previus page
const { state } = useLocation();
const { code } = state || {};
console.log('location state', state)
console.log('location code', code)



  let start = async () => {
    
    if (!hasSerial.current) return; 

    //Create a new cart if we dont have one 
    const cartIsEmpty = (!currentCart.id && !currentCart.closed_at)

    console.log('cartIsEmpty',cartIsEmpty, currentCart)

    if (cartIsEmpty) {createCart({fiscal_code:code})}
        
    // The Web Serial API is supported.
    console.log('Awesome, The serial port is supported.');
    console.log('Port is active?',port.current);

    // Get all serial ports the user has previously granted the website access to.
    const ports = await navigator.serial.getPorts();
    console.log(ports);

    if (!port.current){
    console.log('we dont have any port selected, lets get one!!');
    port.current = await navigator.serial.requestPort();
    // Wait for the serial port to open.
    await port.current.open({ baudRate:9600 });
    setIsScannerOn(true)
    }
    
    console.log('Now we have an opened port ... ', port.current.getInfo());

    await connect();
    
  };

  

  const connect = async () => {

    // connect & listen to port messages
    console.log(port.current.getInfo());
    portInfo.current = port.current.getInfo()
    let scanned = '';
    let end = false
    while (port.current.readable) {
      // Listen to data coming from the serial device.
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.current.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      
      while (true) {
        const scan = await reader.read();
        
        console.log(scan);
        console.log(JSON.stringify(scan))

         end = (JSON.stringify(scan).indexOf('r')>-1)
         scanned = scanned + scan.value
         console.log('end?', end);
         console.log('scanned on end',scanned, end);
         if(end){
            var nitem = {}
            console.log('at end>>', scanned, scan)
            var it

            insertItem(scanned.replace(/\W/g, ""))

            /* addItem(scanned.replace(/\W/g, "")).then(res=>{

                nitem = res
                nitem.entry_id = Math.random()
                console.log('before dispatch', nitem)
                dispatchListData({
                                type:'ADD_ITEM',
                                newItem:nitem
                            })

            }) */
            scanned=''
            end=false
            //scan.done = true
         }
         
         //console.log('list', list.current)
          
        if (scan.done) {
          // Allow the serial port.current to be closed later.
          console.log('done', scan.done);
          reader.releaseLock();
          break;
        }
        // value is a string will be streaming here.
      }
    }
  };



  
  const payment = ()=>{

    console.log('payment')
    navigate('/payment')


  }

  const removeFromList = (key)=>{

    removeItem(key)
  }

  /* const total = () => listData.list.reduce((a,e)=>{
    let val = e.deleted?0:e['calculated_price']
    return a + val
  },0).toFixed(2)
 */

  console.log('body listData', listData)

  if (view === views[0]) return(<DefaultView 
    currentCart={currentCart} 
    scan ={isScannerOn}
    bags={bags}
    initPort={start}
    onTrash={removeFromList}/>)
  
}

export default Home


const DefaultView = ({currentCart, scan, bags, initPort, onTrash})=>{

  const changeView = () => {console.log('change view')}

  const activate = () => {
    console.log('activate')
    initPort()
  }

  const removeItem = (i) => {
    console.log('remove')
    onTrash(i)
  }

  return(
    <>
    
   
    <div className='flex flex-col items-start justify-start  border-zinc-600 w-1/2 bg-white mx-2 mt-4 rounded-tl-2xl rounded-tr-2xl'>
            <div className='flex items-center  w-full bg-teal-600 py-3 rounded-tl-2xl rounded-tr-2xl pr-2'>
                <span className='text-white text-lg pl-3'>LA TUA SPESA</span>
                
                <span className="text-white text-lg pl-3">Cliente: 58659</span>  
                
                <span className="text-white text-lg pl-3">26/12/2022</span>  

                <span className="text-white text-lg pl-3">0</span> 
            </div>
            <div className="flex flex-col w-full h-[30rem] items-start overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               {currentCart.items.length
                ? currentCart.items.map((el,i)=>!el.deleted &&<RenderListItem 
                key={i} 
                item={el}
                onTrashClick={()=>removeItem(i)}
                />)
                :<span className='text-blue font-thin text-3xl px-3 w-[16rem] my-3'>Passa i prodotti nello scanner...</span>}
                {/*  Array.from(list.current).length>0
                ? list.current.map((el,i)=><div key={i}>{el}</div>)
                :<span className='text-blue font-thin text-3xl px-3 w-[16rem] my-3'>Passa i prodotti nello scanner...</span>*/}
            </div>

        </div>

        <div className='static flex flex-col items-left justify-start  border-zinc-600 w-1/2 gap-5 ml-3 mt-4'>
            
            {/*  <div className=" flex flex-row items-center justify-center border border-black w-full">
                 
                     <span className='mt-3 text-indigo-800 font-thin text-3xl px-3 self-center  '>Importo Totale:</span>
                     <span className='text-zinc-900 font-normal text-4xl self-center '> $ 12,90</span>
             </div>
 
             <div className=" -mt-5 flex flex-row items-center justify-center border border-black w-full">
                 
                     <span className='text-indigo-800 font-thin text-3xl px-3 self-center  '>Prodotti nel Carrello:</span>
                     <span className='text-zinc-900 font-normal text-4xl self-center '>18</span>
             </div>
  */}
 
 {
    scan &&
 
            <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
                <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
                <div className=" flex flex-col w-full ">
                    <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Il scanner non legge il prodotto?</span>
                    <button className='bg-indigo-500  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl'
                    onClick={()=>navigate('/search')}>CLICCA
                    </button>
                </div>   
            </div>
}

{
    !scan &&
 
            <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
                <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
                <div className=" flex flex-col w-full ">
                    <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Seleziona la porta</span>
                    <button className='bg-red-500  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl'
                    onClick={activate}>ATTIVARE
                    </button>
                </div>   
            </div>
}
           
 
 
             <div className=" absolute top-8 right-24 flex flex-col h-[8rem] items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-[8rem] pb-6 ">
 
                 
                 <img  className="  w-[5rem]" src='/lotteryIcon.png'/>
 
                 <span className='text-blue font-thin text-xl px-3 text-center w-[10rem] leading-6'>LOTTERIA SCONTRINI</span>
                     
             </div>
             
            
             <span className='flex items-center justify-start mt-3 text-indigo-800 font-thin text-3xl px-3 text-left w-full'>Ti occorre qualcos'altro?</span>
 
 
             <div className=" flex flex-col h-fit items-center border-zinc-600  w-full gap-3 ">
 
                 <div className=" flex flex-row w-full gap-3 items-center">
                     <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] " >
                         <i className="fa-solid fa-mobile-screen-button fa-3x"></i>
                         <span className='text-blue font-thin text-2xl px-3 w-full'>Ricarica Telefono</span>
                     </div>
                     <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] ">
                         <i className="fa-solid fa-percent fa-3x"></i>
                         <span className='text-blue font-thin text-2xl px-3 
                         w-full'>Applica Sconto</span>
                     </div>
                     <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] ">
                         <i className="fa-solid fa-basket-shopping fa-3x"></i>
                         <span className='text-blue font-thin text-2xl px-3 w-full '>La Mia Borsa</span>
                     </div>
                 </div> 
 
             </div>
 
             <div className=" flex flex-row h-fit items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-full ">
                 <span className='text-zinc-900 font-normal text-4xl text-center py-3 px-1 '> € </span>
                     <span className='text-zinc-900 font-normal text-4xl text-center py-3 '> {currentCart.total}</span>
             </div>
             
             <button className={`bg-teal-600  py-6 mx-2 rounded-lg shadow-md text-white font-semibold w-full text-2xl ${currentCart.total==0?'disabled':''}`}
             onClick={changeView}>PROCEDI COL PAGAMENTO
             </button>
 
         </div>

   
    
    </>
  )




}


const DefaultViewOld = (currentCart, bags)=>{

  return (
    <>
        
        <div className='flex flex-col items-start justify-start  border-zinc-600 w-1/2 bg-white mx-2 mt-4 rounded-tl-2xl rounded-tr-2xl'>
            <div className='flex items-center  w-full bg-teal-600 py-3 rounded-tl-2xl rounded-tr-2xl pr-2'>
                <span className='text-white text-lg pl-3'>LA TUA SPESA</span>
                
                <span className="text-white text-lg pl-3">Cliente: 58659</span>  
                
                <span className="text-white text-lg pl-3">26/12/2022</span>  

                <span className="text-white text-lg pl-3">{bags}</span> 
            </div>
            <div className="flex flex-col w-full h-[30rem] items-start overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               {currentCart.items.length
                ? currentCart.items.map((el,i)=>!el.deleted &&<RenderListItem 
                key={i} 
                item={el}
                onTrashClick={()=>removeFromList(i)}
                />)
                :<span className='text-blue font-thin text-3xl px-3 w-[16rem] my-3'>Passa i prodotti nello scanner...</span>}
                {/*  Array.from(list.current).length>0
                ? list.current.map((el,i)=><div key={i}>{el}</div>)
                :<span className='text-blue font-thin text-3xl px-3 w-[16rem] my-3'>Passa i prodotti nello scanner...</span>*/}
            </div>

        </div>



        <div className='static flex flex-col items-left justify-start  border-zinc-600 w-1/2 gap-5 ml-3 mt-4'>
            
           {/*  <div className=" flex flex-row items-center justify-center border border-black w-full">
                
                    <span className='mt-3 text-indigo-800 font-thin text-3xl px-3 self-center  '>Importo Totale:</span>
                    <span className='text-zinc-900 font-normal text-4xl self-center '> $ 12,90</span>
            </div>

            <div className=" -mt-5 flex flex-row items-center justify-center border border-black w-full">
                
                    <span className='text-indigo-800 font-thin text-3xl px-3 self-center  '>Prodotti nel Carrello:</span>
                    <span className='text-zinc-900 font-normal text-4xl self-center '>18</span>
            </div>
 */}

 {
    isScannerOn &&
 
            <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
                <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
                <div className=" flex flex-col w-full ">
                    <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Il scanner non legge il prodotto?</span>
                    <button className='bg-indigo-500  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl'
                    onClick={()=>navigate('/search')}>CLICCA
                    </button>
                </div>   
            </div>
}

{
    !isScannerOn &&
 
            <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
                <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
                <div className=" flex flex-col w-full ">
                    <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Seleziona la porta</span>
                    <button className='bg-red-500  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl'
                    onClick={start}>ATTIVARE
                    </button>
                </div>   
            </div>
}

            <div className=" absolute top-8 right-24 flex flex-col h-[8rem] items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-[8rem] pb-6 ">

                
                <img  className="  w-[5rem]" src='/lotteryIcon.png'/>

                <span className='text-blue font-thin text-xl px-3 text-center w-[10rem] leading-6'>LOTTERIA SCONTRINI</span>
                    
            </div>
            
           
            <span className='flex items-center justify-start mt-3 text-indigo-800 font-thin text-3xl px-3 text-left w-full'>Ti occorre qualcos'altro?</span>


            <div className=" flex flex-col h-fit items-center border-zinc-600  w-full gap-3 ">

                <div className=" flex flex-row w-full gap-3 items-center">
                    <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] " >
                        <i className="fa-solid fa-mobile-screen-button fa-3x"></i>
                        <span className='text-blue font-thin text-2xl px-3 w-full'>Ricarica Telefono</span>
                    </div>
                    <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] ">
                        <i className="fa-solid fa-percent fa-3x"></i>
                        <span className='text-blue font-thin text-2xl px-3 
                        w-full'>Applica Sconto</span>
                    </div>
                    <div className=" flex flex-col items-center justify-center h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] ">
                        <i className="fa-solid fa-basket-shopping fa-3x"></i>
                        <span className='text-blue font-thin text-2xl px-3 w-full '>La Mia Borsa</span>
                    </div>
                </div> 

                {/*  <div className=" flex flex-row w-full gap-3 ">
                    <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] ">
                        <span className='text-blue font-thin text-2xl px-3 self-center w-[16rem] my-3'>La Mia Borsa</span>
                    </div>
                    <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[12rem] ">
                        <span className='text-blue font-thin text-2xl px-3 self-center w-[16rem] my-3'>Il scanner non legge il prodotto?</span>
                    </div>
                </div>    */}
            </div>

            <div className=" flex flex-row h-fit items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-full ">
                <span className='text-zinc-900 font-normal text-4xl text-center py-3 px-1 '> € </span>
                    <span className='text-zinc-900 font-normal text-4xl text-center py-3 '> {currentCart.total}</span>
            </div>
            
            <button className={`bg-teal-600  py-6 mx-2 rounded-lg shadow-md text-white font-semibold w-full text-2xl ${currentCart.total==0?'disabled':''}`}
            onClick={payment}>PROCEDI COL PAGAMENTO
            </button>

        </div>

    </>
  )





}