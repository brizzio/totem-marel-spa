import React , {useState, useEffect} from 'react'


const RenderList = ({cart, toggle})=>{
console.log('render list cart costumer exist', JSON.stringify(cart.costumer), !JSON.stringify(cart.costumer)=='{}')

const costumerExist = JSON.stringify(cart.costumer)!=='{}'
console.log('costumerExist', costumerExist)
    return (
  
      <>
      <div className='flex items-center  w-full h-[2.5rem] bg-teal-600 py-3 rounded-tl-2xl rounded-tr-2xl justify-between px-4'>
              
              <span className='text-white text-lg font-semibold'>LA TUA SPESA</span>
              
              <span className="text-white text-lg pl-3">{costumerExist?Object.values(cart.costumer).join(" "):
              <button className=" text-slate-50 text-lg pl-3" 
              onClick={()=>toggle()}>
                Identificati Ora!
              </button>
              }</span>  
              
              <span className="text-white text-lg pl-3">{cart.items?cart.items.length:0}</span> 
          </div>
          <div className="flex flex-col w-full h-[24rem] items-start overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] bg-white">
             {!!cart.items
              ? cart.items.map((el,i)=>!el.deleted &&<ListItemRender 
              key={i} 
              item={el}
              onTrashClick={()=>remove(i)}
              />)
              :<span className='text-blue font-thin text-3xl px-3 w-[16rem] my-3'>Passa i prodotti nello scanner...</span>}
              
          </div>
      
      
      </>
  
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

export default RenderList