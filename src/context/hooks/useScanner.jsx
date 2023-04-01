import React, { useState, useEffect , useRef, useReducer, useCallback} from 'react'

const useScanner = () => {

const [isScannerOn, setIsScannerOn] = useState(false)
const [readed, setReaded] = useState({code:'', count:0})
const counter = useRef(0)

const hasSerial = useRef(!!('serial' in navigator))
const port = useRef(null)
const portInfo = useRef(null)
const isReady = useRef(false)


let start = async () => {
    
    if (!hasSerial.current || isScannerOn) return; 

    // The Web Serial API is supported.
    console.log('Awesome, The serial port is supported.');
    console.log('Port is active?',port.current);

    // Get all serial ports the user has previously granted the website access to.
    const ports = await navigator.serial.getPorts();
    console.log(ports);

    if (!port.current){
    console.log('we dont have any port selected, lets get one!!');
    port.current = await navigator.serial.requestPort();
    // Wait for the serial port to open.
    await port.current.open({ baudRate:9600 });
    setIsScannerOn(true)
    }
    
    console.log('Now we have an opened port ... ', port.current.getInfo());

    await connect();
    
  };

  

  const connect = async () => {

    // connect & listen to port messages
    //console.log(port.current.getInfo());
    portInfo.current = port.current.getInfo()
    let scanned = '';
    let end = false
    while (port.current.readable) {
      // Listen to data coming from the serial device.
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.current.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      
      while (true) {
        const scan = await reader.read();
        
        //console.log(scan);
        //console.log(JSON.stringify(scan))

         end = (JSON.stringify(scan).indexOf('r')>-1)
         scanned = scanned + scan.value
         //console.log('end?', end);
         //console.log('scanned on end',scanned, end);
         if(end){
            var nitem = {}
            console.log('at end>>', scanned, scan)
            var it
            counter.current=counter.current+1
            setReaded({...readed, code:scanned.replace(/\W/g, ""), count:counter.current})
            

            scanned =''
            end=false
            //scan.done = true
         }
         
         //console.log('list', list.current)
          
        if (scan.done) {
          // Allow the serial port.current to be closed later.
          //console.log('done', scan.done);
          reader.releaseLock();
          break;
        }
        // value is a string will be streaming here.
      }
    }
  };



  return (
    {portInfo, readed, start, isScannerOn}
  )
}

export default useScanner