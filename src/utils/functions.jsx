export const idFromMillis = () => {

    // create Date object for current location
var date = new Date();

// convert to milliseconds, add local time zone offset and get UTC time in milliseconds
var utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);

// time offset for New Zealand is +12
//var timeOffset = 12;

// create new Date object for a different timezone using supplied its GMT offset.
return  new Date(utcTime).toISOString().replace(/\D/g, '');


}

export const alphaIdGenerator = ()=>{
  return (+new Date).toString(36).slice(-6) + "-" + Math.random().toString(36).slice(-3)
}


export const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
      
  let result = localStorage.getItem(key)  
  
  if (result === undefined) {
      reject();
  } else {
      resolve(JSON.parse(result));
  }
   
  });
};



export const getLocalStorageCollectionDataByKey = async (key) => {

    try {
        var existing = localStorage.getItem(key);

        // If no existing data, create an array
        // Otherwise, convert the localStorage string to an array
        existing = existing ? JSON.parse(existing) : [];

        return existing;

    } catch (error) {
        console('getLocalStorageCollectionDataByKey error', error)
    }
   
    

};


function isObjEmpty (obj) {
  return Object.keys(obj).length === 0;
}


export function deviceId()
    {
    var iPageTabID = sessionStorage.getItem("deviceId");
      // if it is the first time that this page is loaded
    if (iPageTabID == null)
        {
        var iLocalTabID = localStorage.getItem("deviceId");
          // if tabID is not yet defined in localStorage it is initialized to 1
          // else tabId counter is increment by 1
        var iPageTabID = (iLocalTabID == null) ? alphaIdGenerator() : iLocalTabID;
          // new computed value are saved in localStorage and in sessionStorage
        
          localStorage.setItem("deviceId",iPageTabID);

          return iPageTabID;
        
        }
    }

export const getLocalStorageKeySync = (key) => {

    try {
        var existing = localStorage.getItem(key);

        // If no existing data, create an array
        // Otherwise, convert the localStorage string to an array
        existing = existing ? JSON.parse(existing) : undefined;

        return existing;

    } catch (error) {
        console('getLocalStorageKeySync error', error)
    }

};

export const updateCollectionLS = async (collection, updatedObject)=>{

    let data = await getLocalStorageCollectionDataByKey(collection)

    const index = data.findIndex(obj => {
        return obj.id === updatedObject.id;
      });
      console.log(index); // 👉️ -1
      
      if (index !== -1) {
        data[index] = updatedObject;
        localStorage.setItem(collection, JSON.stringify(data))
      }
      

}

export const findBagItemInLSItems = async ()=>{


    let res = null
    let data = await getLocalStorageCollectionDataByKey('items')

    const index = data.findIndex(obj => {
        return obj.id === 145;
      });
      //console.log('findBagItemInLSItems', data[index]); // 👉️ -1
      //console.log('findBagItemInLSItems', index, index > -1); // 👉️ -1
      
      return index > -1?data[index]:undefined

      
      

}


export const removeItemFromCollectionLSById = async (entryId, collection)=>{


    const col = collection? collection:'items'

    let data = await getLocalStorageCollectionDataByKey(col)

    const index = data.findIndex(obj => {
       
        return obj.entry_id == entryId;
      });
      console.log('removeItem id',entryId, entryId==entryId);
      console.log('removeItem',index); // 👉️ -1
      
      if (index > -1) {
        data.splice(index,1)
        localStorage.setItem('items', JSON.stringify(data))
      }
      

}

export const upsertCollectionLS = async (collection, updatedObject)=>{

    let data = await getLocalStorageCollectionDataByKey(collection)

    const index = data.findIndex(obj => {
        return obj.id === updatedObject.id;
      });
      console.log(index); // 👉️ -1
      
      if (index !== -1) {
        data[index] = updatedObject;
        localStorage.setItem(collection, JSON.stringify(data))
      }else{
        data.push(updatedObject)
        localStorage.setItem(collection, JSON.stringify(data))
      }
      

}

export const addItemToCollectionLS = async (collection, item)=>{

    let data = await getLocalStorageCollectionDataByKey(collection)
    data.push(item)
    localStorage.setItem(collection, JSON.stringify(data))
    
}

export const updateLocalStorageItem = async (key, keyValueObj)=>{

    let data = await getLocalStorageKey(key)

    let updated = {...data, ...keyValueObj}
   
    localStorage.setItem(key, JSON.stringify(updated))
      

}

export const itemBuilder = async(item, index, quantity)=>{
    
    try {

      let date =new Date()
      let utcTime = date.getTime() + date.getTimezoneOffset()

      item.entry_id = Math.random()
      item.deleted = false
      item.date_added= formatDate(date)
      item.time_added= utcTime
      item.order=`${index}/${quantity}`
      item.quantity=index
      console.log('itemBuilder', item)
      return item

      
    } catch (error) {
      console.log('item builder error', error)
    }
    

    
    

    

}

export const getCartValue = (items) =>{
    return sumArrayByProp(items,'calculated_price')
}

export function wait(duration){
  return new Promise(resolve=>setTimeout(resolve, duration))
}





//==================================================
//HELPERS
//====================================================

export function getMinutesBetweenDates(startISOString, endISOString) {

  let startDate = new Date(startISOString)
  let endDate = new Date(endISOString)

  const diff = endDate.getTime() - startDate.getTime();

  return (diff / 60000);
}

const add = (function () {
  let counter = 1;
  return function () {counter += 1; return counter}
})();


async function uuid() {
  try {
    return 'xxxxxxyxx-xxxx-yxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  } catch (error) {
    console.log('uuid error', error)
  }
  
}

//console.log('unique', uuid)

// ✅ Format a date to YYYY-MM-DD (or any other format)
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  export function formatDate(date) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-');
  }


  const sumArrayByProp = (arr, prop) =>{
    return arr.reduce((a,item)=> a + item[prop],0)
  }

  export function checkEan(eanCode) {
    let result = {
      read_id:crypto.randomUUID(),
      isEan:true,
      inputCode:eanCode,
      outputCode:'',
      digits:0,
      evaluationType:'',
      error:false,
      errorMsg:''
    }
    eanCode = eanCode.trim();
    if ([8,12,13,14].indexOf(eanCode.length) == -1 ) {
      result.isEan=false
      result.error=true
      result.errorMsg= eanCode.length + 'is an invalid number of digits'
      result.digits = eanCode.length
      result.evaluationType='OTHER'
      return result; 
    }
    //if (eanCode.length < l) {
    //eanCode = Array(14 - eanCode.length).join(0) + eanCode; //add 0's as padding
    
    //if (!eanCode.match(/[\d]{eanCode.length}/))
    //{
    // alert('Illegal characters');
    //return false; }
    var total=0;
    var a=eanCode.split('');
    for (var i in a)
    {
    if(i<(a.length-1))
    {
    total+=
    a[i] * (1 + (i % 2) * 2);
    }
    }
    total = eanCode.length == 13
              ?total%10
              :eanCode.length == 8
                ?check8(eanCode)
                :total
    if (total != eanCode.substring(eanCode.length - 1)) {
    // alert('Wrong checksum');
      result.isEan=false
      result.error=true
      result.errorMsg= total + ' Wrong checksum'
      result.digits = eanCode.length
      result.evaluationType='OTHER'
      return result; 
    }
      result.isEan=true;
      result.digits = eanCode.length;
      result.evaluationType='EAN-'+ eanCode.length;
      result.outputCode = Array(14 - eanCode.length).join(0) + eanCode;
      return result; 
    }

    function checksum(code) {
      const sum = code.split('').reverse().reduce((sum, char, idx) => {
          let digit = Number.parseInt(char);
          let weight = (idx + 1) % 2 === 0 ? 1 : 3;
          let partial = digit * weight;
          return sum + partial;
      }, 0);
      console.log('checksum', sum)
      const remainder = sum % 10;
      const checksum = remainder ? (10 - remainder) : 0;
  
      return checksum;
  }

  function check8(code){
    code = reverseString(code).split('')
    let sum1 = code[1]*1 + code[3]*1 + code[5]*1+  code[7]*1 //odd
    let sum2 = code[2]*1 + code[4]*1 + code[6]*1//even
    let checksum_value = sum1 + sum2;

    //console.log('check8 odd', code[1], code[3], code[5] , code[7] , sum1 )
    //console.log('check8 even', code[2] ,code[4] ,code[6] , sum2)
    //console.log('check8 sum', (3* sum1 + sum2))

    //console.log('check8 checksum_value', ( 10 - [ (3* sum1 + sum2) % 10 ]) % 10)
    
    return ( 10 - [ (3* sum1 + sum2) % 10 ]) % 10
    
  }

  function reverseString(str) {
    return (str === '') ? '' : reverseString(str.substr(1)) + str.charAt(0);
  }


  