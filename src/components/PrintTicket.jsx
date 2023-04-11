import React , {useEffect, useState, useRef} from 'react'

const PrintTicket = ({closeCart}) => {

    const timeout = ms => new Promise(res => setTimeout(res, ms))

    const [print, setPrint] = useState(false)

    const message = useRef('')

    const wrapUpCart = () => closeCart()

    const selection = (type)=>{
        console.log('Print Type Selected >> ', type)
        if (type == "paper") message.current='Stampa del tagliando in corso...'
        if (type == "mobile") message.current='Lo scontrino sara inviato al tuo cellulare'
        setPrint(true)
        timeout(3000).then(()=>{
          console.log('printing processed....')
          setPrint(false)
          wrapUpCart()
        })

    }

    
  
   
  
      console.log('PrintTicket view')
      if (print) return (<div>{message.current}</div>)
      return(
      <>
      <div className="flex flex-col h-grow w-full bg-white p-3 mt-4 rounded-2xl shadow-xl items-center justify-center gap-4">    
          
      <span className='text-zinc-800 font-thin text-3xl text-center align-middle h-[15rem] w-[50rem] mt-5 pt-[5rem] border border-zinc-600 rounded-xl'>Il tuo pagamento é stato processato con successo!</span>
          
        
        <div className="flex flex-row h-full w-full items-center justify-center gap-4 ml-2">
  
          <div onClick={()=>selection('paper')} className="flex flex-col h-[12rem] items-center justify-center p-4 text-2xl bg-stone-600 rounded-xl shadow-lg">
              <i className="fa-solid fa-print fa-2x text-white"></i>
              <span className='text-white font-thin text-3xl text-center py-3 px-3 w-[10rem]'>Stampato, per favore </span>
          </div>
          <div onClick={()=>selection('mobile')} className="flex flex-col h-[12rem] w-[22rem] items-center justify-center p-4 text-2xl bg-green-600 rounded-xl shadow-lg">
              <i className="fa-solid fa-leaf fa-2x text-white"></i>
              <span className='text-white font-thin text-3xl text-center py-3 px-3 w-[18rem]'>Nel mio cellulare, cosí proteggiamo l'ambiente </span>
          </div>
            
        </div>
      </div>
      </>
  
      )
}

export default PrintTicket