import React, { useState, useEffect , useRef, useReducer, useMemo} from 'react'
import { formatDate } from '../../utils/functions';
import api from '../../api/api';



  const pricesModel = {
    isSet:false,
    loading:false,
    price_date:'',
    data:[]
}
   
  const usePrices = () => {

    const runOnce = useRef(null)
    const pricesReducer = (state, action) => {

    
        //console.log('prices reducer' , state, action)

        let date =new Date()
        let utcTime = date.getTime() + date.getTimezoneOffset()

        let formattedDate = formatDate(new Date(utcTime))
        
        
        switch (action.type) {
    
        
          case 'UPDATE_LOCAL_STORAGE':
            console.log('update prices')
    
           
    
            localStorage.setItem('prices', JSON.stringify({
                price_date:formattedDate,
                data:action.data
            }))

            
            return {
                ...state,
                isSet:true,
                loading:false,
                price_date:formattedDate,
                data:action.data
            }
    
            case 'LOAD':
                console.log('Load prices', action.pricesInStorage)
                       
                return {
                    ...state,
                    data:action.pricesInStorage.data,
                    price_date:action.pricesInStorage.price_date,
                    loading:false,
                    isSet:true
                    
                }
    
            case 'REMOVE':

            console.log('remove prices ')
            localStorage.removeItem('prices')
        
            return pricesModel; 

          
          default:
            throw new Error();
        }
    
        
      };



      const [prices, dispatchPrices] = useReducer(pricesReducer, {...pricesModel, loading:true})
      //console.log('usePrices prices',prices)

    const readLocalStorage = async (key) => {
        return new Promise((resolve, reject) => {
            
        let result = localStorage.getItem(key)  
        
        if (result === undefined) {
            reject();
        } else {
            resolve(JSON.parse(result));
        }
         
        });
      };


    const evaluate = async ()=>{
        //console.log('usePrices evaluate ',prices, prices.isSet)
        if (prices.isSet) return;
        var pricesInStorage = await readLocalStorage("prices");
        //console.log('usePrices pricesInStorage', pricesInStorage, pricesInStorage==null)
        if (pricesInStorage == null){
            //console.log('usePrices get price list')
            api.get('priceList').then(result => {
                dispatchPrices({type:'UPDATE_LOCAL_STORAGE', data:result})
            
           
            })}else{
              dispatchPrices({type:'LOAD', pricesInStorage})
             
            }
    }

   useMemo(() => evaluate(), [runOnce.current])
    
   

    /* const init = ()=>{

        var sessionInStorage = JSON.parse(sessionStorage.getItem("session"));
        // if it is the first time that this page is loaded

        console.log('usSession sessionInStorage', sessionInStorage, sessionInStorage==null)


        if (sessionInStorage == null){
        console.log('usSession init create new session')
        dispatchSession({type:'CREATE'})
        
        }else{
        
        dispatchSession({type:'LOAD', data:sessionInStorage})

        }



    }
 */
    return {prices}

  }

  export default usePrices