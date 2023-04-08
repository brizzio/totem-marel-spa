import React , { useCallback, useEffect, useMemo, useRef, useState }from 'react';

//https://dev.to/link2twenty/react-using-native-dialogs-to-make-a-modal-popup-4b25

//https://www.tutorialspoint.com/javascript/javascript_dialog_boxes.htm

///https://github.com/gpietro/react-numpad

const PaymentModal = ({ btnTitle, update, total }) =>{ 
    
    const modalRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [locked, setLocked] = useState(true);

    const [paymentMethod, setPaymentMethod] = useState('default')
    
    
    
  const confirmBtn = useRef(null);

  const onClose = useCallback(() => {
    console.log("Payment Modal value", modalRef.current.returnValue);
    update(modalRef.current.returnValue);
    setIsOpen(false);
    setLocked(true);
  }, []);
  // Eventlistener: trigger onclose when cancel detected
  const onCancel = useCallback(
    (e) => {
      e.preventDefault();
      if (!locked) onClose();
    },
    [locked, onClose]
  );

  // Eventlistener: trigger onclose when click outside
  const onClick = useCallback(
    ({ target }) => {
      const { current: el } = modalRef;
      if (target === el && !locked) onClose();
    },
    [locked, onClose]
  );

  // when open changes run open/close command
  useEffect(() => {
    const { current: el } = modalRef;
    !!isOpen ? !el.open && el.showModal() : el?.close();
  }, [isOpen]);


  useEffect(() => {
    console.log('payment changed')
  }, [paymentMethod]);
 

  const changeValue = (str)=>{
    setPaymentMethod(str)
    confirmBtn.current.value = str
  }

  


  return (
    <>
      {!isOpen ? (
        <button 
        className={`bg-teal-600  py-4 mx-2 rounded-lg shadow-md text-white font-semibold w-full text-2xl disabled:bg-stone-400`}
             disabled={total==0}
        onClick={() => setIsOpen(true)}>
          {btnTitle.toUpperCase()}
        </button>
      ) : (
        <dialog
          ref={modalRef}
          aria-label={"Dialog"}
          onClose={onClose}
          onCancel={onCancel}
          onClick={onClick}
          className="relative w-[40rem] h-[40rem] shadow-2xl rounded-2xl flex flex-col items-center "
        >
          <form className="w-full flex flex-col items-center gap-6 "
                method="dialog">
            <button className="absolute top-0 right-3 p-3" value="cancel"><span className="text-xl font-semibold">X</span></button>
            
            <span className=' absolute top-0 left-0 mt-4 text-white font-thin text-2xl px-6 py-3 text-left w-{8rem} bg-sky-700 rounded-tr-xl rounded-br-xl shadow-xl'>Scegli la forma di pagamento</span>
            
            <div className='flex flex-col items-center justify-center  h-[32rem] mt-5 '>
        
                  
              
                  <div className="flex flex-wrap gap-4">
                    <PaymentCard icon='fa-solid fa-credit-card'
                    title='Bancomat o Carte da Credito'
                    id={'bancomat'}
                    action={changeValue}
                    selected={paymentMethod}
                    
                    />
                    <PaymentCard icon='fa-solid fa-gifts'
                    title='Carte Bonus o Gift Cards'
                    id={'giftCard'}
                    action={changeValue}
                    selected={paymentMethod}
                    
                    />
                          
                  </div>
                  <div className="flex flex-wrap gap-4 mt-5">
                    <PaymentCard icon='fas fa-hamburger'
                    title='Buono Alimentare'
                    id={'buonoAlimentare'}
                    action={changeValue}
                    selected={paymentMethod}
                    
                    />
                    <PaymentCard icon='fa-solid fa-money-check-dollar'
                    title='Altri metodi di pagamento'
                    id={'altro'}
                    action={changeValue}
                    selected={paymentMethod}
                    
                    />
                  </div>
            </div> 
              
                
            
            <button className={`rounded-xl text-white p-4 ${paymentMethod == 'default'?'bg-stone-400':'bg-teal-600'}`}
              ref={confirmBtn} value={paymentMethod} disabled={paymentMethod == 'default'}>
                    CONFERMA
            </button>
                
          </form>
         
        </dialog>
      )}
    </>
  );
}


const PaymentCard = ({icon, title, id, action, selected}) =>{

  
const [color, setColor] = useState('white')

const updatePaymentMethod = ()=>{
  console.log('vai mudar view', id)
  action(id)
}

useEffect(()=>{
  if(selected == id){
    setColor('bg-teal-300')
  }else{
    setColor('white')
  }
})

  return(
      <div className={`flex flex-col items-center justify-center border border-zinc-200 ${color} shadow-xl rounded-2xl gap-4 h-[12rem] w-[14rem]`}
      onClick={updatePaymentMethod}>
          <i className={`${icon} fa-3x`}></i>
          <span className='text-blue font-thin text-2xl px-3 leading-5 text-center '>{title}</span>
          {color} {selected}
      </div>
  )

}

 /*/usage: 

 <Numpad read={changeValue}/>

 const changeValue = (str)=>{
  inputRef.current.value=str
  confirmBtn.current.value = str
}*/

const Numpad = ({read})=>{

   const [str, setStr] = useState("")

   const onBtnClick = (v)=>{
    setStr(prev => prev + v.toString())
  } 

   const onShift = () => console.log('shifted')

   const removeLast = (v)=>{
    setStr(prev => prev.slice(0, -1))
    
  } 

  useEffect(()=>{
    console.log('string has changed', str)
    read(str)
  },[str])

     return( <div className="grid grid-cols-3 gap-2 mt-4">
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl" onClick={()=>onBtnClick('1')}>1</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('2')}>2</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('3')}>3</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('4')}>4</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('5')}>5</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('6')}>6</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('7')}>7</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('8')}>8</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('9')}>9</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onShift()}>shift</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>onBtnClick('0')}>0</button>
       <button className=" text-center text-stone-700 font-thin text-2xl py-4 px-8 bg-white border border-orange-500 border-2 rounded-lg shadow-xl " onClick={()=>removeLast()}>del</button>
       </div>   
  )

}


export default PaymentModal;