import React , {useEffect, useState, useRef} from 'react'
import { useReactToPrint } from 'react-to-print';

const PrintTicket = ({closeCart, cart}) => {

    const componentRef = useRef();
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

    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
    });
    
      console.log('PrintTicket view')
      if (print) return (<div>{message.current}</div>)
      
      
      
      return(
      
      
     
          
        
        <div className="flex flex-row h-full w-full items-center justify-center gap-4 ml-2">
           <div className="flex flex-col min-h-[33rem] w-full items-center justify-center rounded rounded-2xl bg-white">
      
            <ComponentToPrint ref={componentRef} cart={cart}/>
    
          </div>

        

        <div className="flex flex-col w-fit h-fit gap-6">
          <div onClick={handlePrint} className="flex flex-col h-[12rem] items-center justify-center p-4 text-2xl bg-stone-600 rounded-xl shadow-lg">
              <i className="fa-solid fa-print fa-2x text-white"></i>
              <span className='text-white font-thin text-3xl text-center py-3 px-3 w-[10rem]'>Stampato, per favore </span>
          </div>
          <div onClick={handlePrint} className="flex flex-col h-[12rem] w-[22rem] items-center justify-center p-4 text-2xl bg-green-600 rounded-xl shadow-lg">
              <i className="fa-solid fa-leaf fa-2x text-white"></i>
              <span className='text-white font-thin text-3xl text-center py-3 px-3 w-[18rem]'>Nel mio cellulare, cosí proteggiamo l'ambiente </span>
          </div>

        </div>
          
            
        </div>
      
    
  
      )
}

export default PrintTicket

const ComponentToPrint = React.forwardRef(({cart}, ref) => {
  return (
    <div ref={ref} className="flex-col mt-3 min-h-[31rem] w-[25rem] border-x-4 border-zinc-300 items-start overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] bg-white">
      <div className="text-center w-full text-xl font-semibold">
        Supermarket Marel Srl
      </div>
      <div className="text-center w-full font-semibold">
        Partita Iva: 23404309203
      </div>
      <div className="flex flex-row justify-between items-center w-full font-thin mt-3 px-3">
        <div>PRODOTTO</div>
        <div className="flex flex-row justify-between items-center w-[12rem] h-fit font-thin">
          <div>
            TYP
          </div>
          <div>
            QUANT
          </div>
          <div>
            PREZZO
          </div>
        </div>
      </div>

      { cart.items?.map((el,i)=>{
        
        if(!el.deleted) return(

          <div key={i} className="flex flex-row justify-between items-center w-full font-thin mt-3 px-3">
            <div>{el.product_name}</div>
            <div className="flex flex-row justify-between items-center w-[12rem] h-fit font-thin">
              <div>
                {el.promo_type>0?"P":"R"}
              </div>
              <div>
                {el.order}
              </div>
              <div>
                {el.calculated_price}
              </div>
            </div>
          </div>
        )
            
      }
      
      )};

      <div className="flex flex-row justify-between items-center w-full font-thin mt-3 px-3">
        <div>Totale Spesa:</div>
        <div>{cart.total.toFixed(2)}</div>
      </div>

    </div>
  );
});