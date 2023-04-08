import React, { useState, useEffect , useRef, useMemo} from 'react'
import CartList from './List Displayers/Cart Items List Displayer/CartList'
import Bags from './Bags'
import useStore from '../context/hooks/useStore'

import { getLocalStorageCollectionDataByKey, readLocalStorage} from '../utils/functions'
import {insertData, fetchData} from '../api/api'

import Timer from './common/Timer'


//{cart.payment_method=='bancomat' && <Bancomat total={cart.total}/>}




const ClosingCart = (props) => {

    const cart = props.cart

    const paymentStat = (value)=>{
      props.payStatus(value)
    }

  return (
    <>
    <div className="absolute top-0 left-0 flex flex-row items-center " >
        <img  className="w-[6rem] p-2" src='/marel-logo.png'/>
        <Timer cn="font-xs text-gray-500 leading-3 text-[11px] mt-2"/>
    </div>
    
    
    <div className='flex flex-col items-start justify-start  border-zinc-600 w-1/2 bg-white mx-2 mt-4 rounded-tl-2xl rounded-tr-2xl'>
        <CartList list={cart.items} />
    </div>

    <div className="flex flex-col justify-start h-[30rem] w-1/2 bg-white p-3 mt-4 rounded-2xl shadow-xl">       
      <div className=" flex flex-row h-fit items-center justify-center border-zinc-600 bg-white shadow-lg rounded-2xl  w-full ">
        <span className='text-zinc-900 font-normal text-4xl text-center py-3 px-1 '> € </span>
        <span className='text-zinc-900 font-normal text-4xl text-center py-3 '> {cart.total.toFixed(2)}</span>
      </div>
      {cart.payment_method=='bancomat' && <Bancomat 
      total={cart.total}
      payStatus={paymentStat}
      />}
    </div>
    

    
    
    </>
    
  )
}

export default ClosingCart





const timeout = ms => new Promise(res => setTimeout(res, ms))



const Bancomat = ({total, payStatus})=>{

  const messages=[
    "Inserire la carta quando l'importo sia visibile sul POS...",
    "stabilendo connessione...",
    "verificando dati...",
    "operazione conclusa con successo...",
  ]
   const [step, setStep] = useState(0)

   
   while (step < messages.lenght) {
    timeout(1000).then(()=>{setStep(step => step + 1)})
  }
    
    /* const shuffle = useCallback(() => {
        setStep(step => step + 1)
    }, []);

    useEffect(() => {
      const intervalID = setInterval(shuffle, 1000);
      return () => clearInterval(intervalID);
    }, [shuffle]) */

    useEffect(() => {
      timeout(2000).then(()=>{
        console.log('processou bancomat....', total, payStatus)
        payStatus('fulfilled')
      })
    }, []);
     

    console.log('bancomat step' , step)

    return(
        
      <div className="flex flex-row h-full w-full items-center ">
          <img className="w-[16rem] h-auto justify-center" src={'pos.gif'} alt='Profile'/>
          <div className="flex flex-row h-full items-center justify-end pr-4 text-2xl">
           {messages[step]}
          </div>
      </div>
   
    )
  }

  const PrintTicket = (props)=>{

    

    useEffect(()=>{

        
            console.log('PrintTicket effect')
            
    
              
          
        return ()=>{
            console.log('PrintTicket effect unmount navigate')
            setTimeout(() => {
               
             }, 3000)
        }
      },[])

    console.log('PrintTicket props' , props)

    return(
    <>
    <div className="flex flex-col h-grow w-1/2 bg-white p-3 mt-4 rounded-2xl shadow-xl items-center justify-center">    
        
    <span className='flex items-center text-zinc-800 font-thin text-3xl text-center py-3 px-8 h-[20rem] w-[30rem]  border border-zinc-600 rounded-xl'>Il tuo pagamento é stato processato con successo!</span>
        
        
           
      
      
      <div className="flex flex-row h-full w-full items-center gap-4 ml-2">

        <div className="flex flex-col h-[12rem] items-center justify-center p-4 text-2xl bg-stone-600 rounded-xl shadow-lg">
            <i className="fa-solid fa-print fa-2x text-white"></i>
            <span className='text-white font-thin text-3xl text-center py-3 px-3 w-[10rem]'>Stampato, per favore </span>
        </div>
        <div className="flex flex-col h-[12rem] w-[22rem] items-center justify-center p-4 text-2xl bg-green-600 rounded-xl shadow-lg">
            <i className="fa-solid fa-leaf fa-2x text-white"></i>
            <span className='text-white font-thin text-3xl text-center py-3 px-3 w-[18rem]'>Nel mio cellulare, cosí proteggiamo l'ambiente </span>
        </div>
          
      </div>
    </div>
    </>

    )
  }