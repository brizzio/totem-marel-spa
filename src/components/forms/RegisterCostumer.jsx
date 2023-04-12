import React, { useRef, useEffect } from "react";
import KeyboardComponent from "../common/KeyboardComponent";


const RegisterCostumer = ({formRef}) => {

    
   

  
  return (
    <>
      
      <KeyboardComponent
    
        keyboardRef={formRef}
        inputNames={["firstName", "lastName"]}
      />
    </>
  );
};

      
   
    


export default RegisterCostumer