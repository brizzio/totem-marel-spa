import React, { useState, useEffect } from 'react'



const Payment = ({total, nav}) => {

  const [paymentMethod, setPaymentMethod] = useState(0)

  
  const updatePaymentMethod = (n)=>{
      console.log('vai mudar view', n)
      setPaymentMethod(n)
  }

  const PaymentCard = ({icon, title, id}) =>{

    return(
        <div className=" flex flex-col items-center justify-center h-[8rem]  border border-zinc-200 bg-white shadow-xl rounded-2xl  w-full gap-2" 
        onClick={()=>setPaymentMethod(id)}>
            <i className={`${icon} fa-3x`}></i>
            <span className='text-blue font-thin text-2xl px-3 leading-5 text-center '>{title}</span>
        </div>
    )

  }

    console.log('paymentMethod', paymentMethod)

    if(paymentMethod == 1) return(<Bancomat view={updatePaymentMethod}/>)
    if(paymentMethod == 4) return(<PrintTicket view={updatePaymentMethod}/>)
    if(paymentMethod == 5) return(<WrapUpCart view={updatePaymentMethod} nav={(a)=>nav(a)}/>)   


  return (
    <div className='flex flex-col items-start justify-start  border-zinc-600 w-1/2 bg-white mx-2 mt-4 rounded-tl-2xl rounded-tr-2xl'>
        
    <span className='flex items-center justify-start mt-4 text-white font-thin text-2xl px-6 py-3 text-left w-{8rem} bg-sky-700 rounded-tr-xl rounded-br-xl shadow-xl'>Scegli la forma di pagamento</span>


    <div className=" flex flex-col h-fit items-center border-zinc-600  w-full gap-3 ">

        <div className=" grid grid-flow-row-dense grid-cols-3 grid-rows-1 gap-3 w-full p-3 mt-2">
            <PaymentCard icon='fa-solid fa-credit-card'
            title='Bancomat o Carte da Credito'
            id={1}/>
            <PaymentCard icon='fa-solid fa-gifts'
            title='Carte Bonus o Gift Cards'
            id={2}/>
            <PaymentCard icon='fa-solid fa-money-check-dollar'
            title='Altri metodi di pagamento'
            id={3}/>
            
            
        </div> 
    </div>
    <div className=" flex flex-row h-fit items-center justify-center border-zinc-600 bg-indigo-200 shadow-lg rounded-2xl  w-fit mt-4 px-[15rem] mx-4 ">
            <span className='text-zinc-900 font-normal text-4xl text-center py-3 px-1 '> € </span>
                <span className='text-zinc-900 font-normal text-4xl text-center py-3 '> {total}</span>
    </div>

    <div onClick={()=>navigate('/home')} className=" flex flex-row h-fit items-center justify-center border-zinc-600 bg-teal-800 shadow-xl rounded-2xl  w-fit mt-4 mx-4 px-[4.5rem] py-6">
                <span className='text-white font-thin text-3xl text-center py-3 '> Torna indietro per aggiungere altri prodotti</span>
    </div>
    
</div>

    
  )
}

export default Payment









const Bancomat = ({view})=>{

    
    

    useEffect(()=>{

         console.log('bancomat effect unmount navigate')
            setTimeout(() => {
                view(4)
             }, 3000)
        
           
      },[])

    console.log('bancomat view' , view)

    return(
    <>
    <div className="flex flex-row h-grow w-1/2 bg-white p-3 mt-4 rounded-2xl shadow-xl">       
      
      <div className="flex flex-row h-full w-full items-center ">
          <img className="w-[12rem] h-auto justify-center" src={'pos.gif'} alt='Profile'/>
          <div className="flex flex-row h-full items-center justify-end pr-4 text-2xl">
           Inserire la carta quando l'importo sia visibile sul POS...
          </div>
      </div>
    </div>
    </>

    )
  }

  const PrintTicket = ({view})=>{

    

    useEffect(()=>{

      console.log('PrintTicket effect unmount navigate')
       setTimeout(() => {
          view(5)
       }, 3000)
          
      },[])

    console.log('PrintTicket view' , view)

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


  const WrapUpCart = ({view, nav})=>{

    

    useEffect(()=>{

      console.log('WrapUpCart effect unmount navigate')
       setTimeout(() => {
          nav(0)
       }, 3000)
          
      },[])

    console.log('WrapUpCart view' , view)

    return(
    <>
    <div className="flex flex-col h-grow w-1/2 bg-white p-3 mt-4 rounded-2xl shadow-xl items-center justify-center">    
        
    <span className='flex items-center text-zinc-800 font-thin text-3xl text-center py-3 px-8 h-[20rem] w-[30rem]  border border-zinc-600 rounded-xl'>grazie!</span>
        
      
      
    </div>
    </>

    )
  }