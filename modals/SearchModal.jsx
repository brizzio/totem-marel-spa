import React , { useCallback, useEffect, useMemo, useRef, useState }from 'react';


const SearchModal = ({ btnTitle }) =>{ 
    
    const modalRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [locked, setLocked] = useState(true);
    
    
    const onClose = useCallback(() => {
      setIsOpen(false);
      setLocked(true);
    },[])
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
      !!isOpen? el.showModal() : el?.close();
    }, [isOpen]);
  
    
    return (
      <>
       
       {!isOpen? <button 
       className="bg-teal-700  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl"
        type="button" 
        onClick={()=>setIsOpen(true)}>{btnTitle.toUpperCase()}</button>
        :
        <dialog
          ref={modalRef}
          aria-label={'Dialog'}
          onClose={onClose}
          onCancel={onCancel}
          onClick={onClick}
        >
          <div>
          <p>I'm a locked modal, there's no escaping me.</p>
            <p>Once unlocked clicking outside or pressing esc will close me.</p>
            <button onClick={() => setLocked((b) => !b)}>
              {locked ? "Unlock" : "Lock"}
            </button>
            <button onClick={() => onClose()}>
              CLOSE
            </button>
          </div>
        </dialog>
        }
      </>
      
    );
}
export default SearchModal;