import React , {useState, useEffect} from 'react'
import Spinner from '../components/spinner/Spinner'
import BizerbaLogoSVG from '../components/common/BizerbaLogoSVG'

const AppLayout = ({children}) => {

    const loading  = false

   

    console.log('loading',loading)

    if(loading){

        return(

        <div className="flex justify-center items-center w-screen h-screen bg-white">
    
            <div className="flex justify-center items-center w-[84rem] h-[38rem] bg-teal-900 bg-opacity-50 box-border border-zinc-300 rounded-2xl shadow shadow-2xl">

               <Spinner/>

            </div>

        </div>
            
        )
    }

    /* style={{background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"}} */
  return (
    <>
    <div id='modal'></div>
    <div className="flex justify-center items-center w-screen h-screen bg-white">
        
        <div className="relative flex justify-center items-center w-11/12 h-5/6 p-3 bg-stone-100 box-border border-zinc-300 rounded-2xl shadow shadow-2xl"
        >
            
                {children} 
            

        </div>

        
    </div>

    
    </>
  )
}

export default AppLayout