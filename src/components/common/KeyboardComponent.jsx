import React, { useState } from "react";
import Keyboard from "react-simple-keyboard";

import "react-simple-keyboard/build/css/index.css";

import "./KeyboardStyles.css"

const KeyboardComponent = props => {
  const { keyboardRef: keyboard, 
          inputNames = ["default"]
        } = props;
  const [inputs, setInputs] = useState({});
  const [inputName, setInputName] = useState(inputNames[0]);
  const [layoutName, setLayoutName] = useState("default");

  const onChangeAll = inputs => {
    /**
     * Here we spread the inputs into a new object
     * If we modify the same object, react will not trigger a re-render
     */
    setInputs({ ...inputs });
    console.log("Inputs changed", inputs, keyboard);
  };

  const onChangeInput = event => {
    const inputVal = event.target.value;

    setInputs({
      ...inputs,
      [inputName]: inputVal
    });

    keyboard.current.setInput(inputVal);
  };

  const handleShift = () => {
    const newLayoutName = layoutName === "default" ? "shift" : "default";
    setLayoutName(newLayoutName);
  };

  const getInputValue = inputName => {
    return inputs[inputName] || "";
  };

  const onKeyPress = button => {
    console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const keyboardProps = {
    keyboardRef: r => (keyboard.current = r),
    onChangeAll,
    inputName,
    onKeyPress,
    layoutName
  };

  return (
    <div>
      {inputNames.map(input => (
        <input
          key={input}
          placeholder={input}
          id={input}
          value={getInputValue(input)}
          onFocus={() => setInputName(input)}
          onChange={onChangeInput}
        />
      ))}
      <Keyboard {...keyboardProps} />
    </div>
  );
};

export default KeyboardComponent;