import React , {useState, useEffect}from 'react'



const Bags = ({list, edit}) => {

    let bagsArr = list.filter(o=>o.product_id==145)
    let bagsCount = bagsArr?bagsArr.length:0
    
    const [count, setCount] = useState(bagsCount)

    
    
   
    

    function increment() {

          
        setCount(function (prevCount) {
          
          return (prevCount += 1);
        });

        edit('add')


        
      }
  
      function decrement() {
        
        setCount(function (prevCount) {
          if (prevCount > 0) {
            
            return (prevCount -= 1); 
          } else {
            return 0;
          }
        });

        edit('remove')
        
      }

      

  return (
    <div className='flex items-center text-xl  bg-white  rounded-lg h-[4rem] py-1 px-1 shadow-md '>
         <button onClick={decrement}>
            <i className="fa-solid fa-minus text-left w-16 pl-2"></i>
        </button>
        <img  className=" h-10" src='/bag.png'/>
        <span className={`text-4xl font-thin pl-3`}>{count}</span>
        <button onClick={increment}>
            <i className="fa-solid fa-plus text-right w-16 pr-2"></i>
        </button>
    </div>
  )
}

export default Bags