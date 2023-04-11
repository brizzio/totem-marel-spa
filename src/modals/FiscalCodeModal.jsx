import React , { useCallback, useEffect, useMemo, useRef, useState }from 'react';

//https://dev.to/link2twenty/react-using-native-dialogs-to-make-a-modal-popup-4b25

//https://www.tutorialspoint.com/javascript/javascript_dialog_boxes.htm

///https://github.com/gpietro/react-numpad

const FiscalCodeModal = ({ btnTitle, update }) =>{ 
    
    const modalRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [locked, setLocked] = useState(true);
    
    
    const inputRef = useRef(null)
  const confirmBtn = useRef(null);

  const onClose = useCallback(() => {
    console.log("Fiscal Code Value", modalRef.current.returnValue);
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

 

  const changeValue = (str)=>{
    inputRef.current.value=str
    confirmBtn.current.value = str
  }

  return (
    <>
      {!isOpen ? (
        <button 
        className="text-blue font-thin text-xl px-3 text-center w-[10rem] leading-6"
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
          className="relative w-[40rem] h-5/6 shadow-2xl rounded-2xl flex flex-col items-center "
        >
          <form className="w-[30rem] h-auto flex flex-col items-center gap-6 "
                method="dialog">
            
            <button className="absolute top-0 right-0 p-3" value="cancel"><span className="text-xl font-semibold">X</span></button>
            <p className=" text-left text-blue font-thin text-3xl px-3 self-center w-[18rem] my-3 ">Inserisci il tuo codice fiscale.</p>
            <div className="flex flex-row gap-3 w-full justify-center">
                <input 
                className="bg-white border border-3 rounded-xl text-right text-3xl font-thin p-4 ml-3 w-[15rem]"
                ref={inputRef}/>
           
            
                
                <button 
                className="bg-teal-600 rounded-xl text-white p-4"
                ref={confirmBtn} value={inputRef?.current?.value}>
                    OK
                </button>
                


            </div>
            
          </form>
          <Numpad read={changeValue}/>
        </dialog>
      )}
    </>
  );
}

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


export default FiscalCodeModal;