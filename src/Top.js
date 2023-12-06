import React, { useState, useEffect, useRef } from "react";

const Top = function (props) {
  const [step, setStep] = useState(0);
  const [inputText, setInputText] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [gotHint, setGotHint] = useState(0);

  const textInput = useRef(null);
  useEffect(() => {
    textInput.current.focus();
  }, []);

  const characters = props.charArray;

  const handleInputChange = ({ target }) => {
    const txt = target.value.trim().toUpperCase();
    if (txt === characters[step].txt) {
      setInputText("");
      setShowHelp(false);
      setStep((prev) => prev + 1);
    } else {
      setInputText(target.value);
    }
  };

  const handleShowChange = () => {
    setGotHint((prev) => prev + 1);
    setShowHelp((prev) => !prev);
  };

  const calcAccuracy = function () {
    const gotRight = characters.length - gotHint;
    const fraction = gotRight / characters.length;
    return Math.round(fraction * 100);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <progress value={step} max={characters.length} />
      {step >= characters.length && <p>{calcAccuracy()}%</p>}
      {step < characters.length && (
        <>
          <input
            value={inputText}
            onChange={handleInputChange}
            style={{ fontSize: "2rem", padding: "0.5rem" }}
            ref={textInput}
          />
          <p>{characters[step].char}</p>
          {!showHelp && (
            <button style={{ alignSelf: "center" }} onClick={handleShowChange}>
              ❓
            </button>
          )}
          {showHelp && <p style={{ margin: 0 }}>{characters[step].txt}</p>}
        </>
      )}
    </div>
  );
};

export default Top;
