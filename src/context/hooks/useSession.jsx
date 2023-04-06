import React, { useState, useEffect , useRef, useReducer, useMemo, useCallback} from 'react'

import { formatDate, getMinutesBetweenDates } from '../../utils/functions';


  function deviceId()
    {
    var dev = sessionStorage.getItem("deviceId");
      // if it is the first time that this page is loaded
    if (dev == null)
        
        var id = crypto.randomUUID()
          // new computed value are saved in localStorage and in sessionStorage
        
          localStorage.setItem("deviceId",id);

          return id;
        
        
    }


    let sessionModel =  {
            exists:false,
        data:{
            date:'',
            sequential_id:'',
            device_id:'',
            timestamp:'',
            opened_at:'',
            closed_at:'' 
        }
    }

  const useSession = () => {

    const runOnce = useRef(null)
    const sessionReducer = (state, action) => {

    
        console.log('session reducer' , state, action)
        let date =new Date()
        let utcTime = date.getTime() + date.getTimezoneOffset()
        
        switch (action.type) {
    
        
          case 'CREATE':
            console.log('create session')
    
               
            let formattedDate = formatDate(new Date(utcTime))
    
            let newSession = {
                date:formattedDate,
                session_id:crypto.randomUUID(),
                device_id:deviceId(),
                sequential_id:new Date(utcTime).toISOString().replace(/\D/g, ''),
                opened_at:new Date(utcTime).toISOString()
                
            }

            localStorage.setItem('session', JSON.stringify({
                exists:true,
                data:newSession
            }))

            
            return {
                ...state,
                exists:true,
                data:{...state.data , ...newSession}
                
            }
    
            case 'LOAD':
                console.log('Load session', action.data)
                           
                return {
                    
                    ...action.data
                    
                }
    
            case 'CLOSE':

            console.log('close session ')
            localStorage.removeItem('session')

            
            let closeDate = new Date(utcTime).toISOString()

            var closedSession = {
                ...state,
                //list: state.list.filter((item) => item.entry_id !== action.id),
                exists:false,
                data: {...state.data, closed_at:closeDate}
              
              }; 
            
            localStorage.setItem('closed_session', JSON.stringify(closedSession))
           
            return {
              ...state,
              exists:false,
              data:{duration:getMinutesBetweenDates(
                state.data.opened_at,
                closeDate
              )}
            }; 
    
          
          default:
            throw new Error();
        }
    
        
      };



      const [session, dispatchSession] = useReducer(sessionReducer, sessionModel)


    //console.log('session',session)

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



    const closeSession = ()=> dispatchSession({type:'CLOSE'})


    useEffect(() => {
      (async ()=>{
        if (session.exists) return;
         var sessionInStorage = await readLocalStorage("session");
         var closedSession = await readLocalStorage("closed_session");
         if(closedSession) return;
         //console.log('useSession sessionInStorage', sessionInStorage, sessionInStorage==null)
         if (sessionInStorage == null){
             //console.log('usSession init create new session')
             dispatchSession({type:'CREATE'})
             
             }else{
             
             dispatchSession({type:'LOAD', data:sessionInStorage})
     
             }
     })()
    
      return () => {
        //console.log('useEffect unmount session', session)
      }
    }, [])
    
  

    
    return {session, closeSession}

  }

  export default useSession