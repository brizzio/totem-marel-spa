import React from 'react'
import IdiomSelector from '../components/common/IdiomSelector'
import BizerbaLogoSVG from '../components/common/BizerbaLogoSVG'




const Start = () => {

   
    

  return (
    <>
    {/* Header */}
    <div className="flex justify-end"> 
       <IdiomSelector/>
    </div>
   
    {/* Content page to display */}
    <div className="w-full h-5/6"> 
      <div className=" flex flex-row h-[8rem]  border-zinc-600 bg-white shadow-lg rounded-2xl  w-[26rem] ">
          <img  className="  h-[8rem] p-3 " src='/scanner.gif'/>
          <div className=" flex flex-col w-full ">
              <span className='text-blue font-thin text-3xl px-3 self-center w-[16rem] my-3'>Seleziona la porta</span>
              <button className='bg-red-500  py-2 mx-2 rounded-lg shadow-xl text-white font-semibold w-[14rem] text-2xl'
             >ATTIVARE
              </button>
          </div>   
      </div>
    </div>
    {/* footer */}
    <div className='flex justify-between w-full h-[2.4rem]border border-2'>
        <img  className=" p-2 w-[6rem] " src='/marel-logo.png'/>
        <BizerbaLogoSVG cn="pr-3"/> 
    </div>   
    </>
    
    
  )
}

export default Start