import React, { useState } from "react";
import LangList from "./LangList.js";
import Top from "./Top.js";
import { polish, nato } from "./data.js";

const LangSelect = function () {
  const [lang, setLang] = useState("");
  const [randArray, setRandArray] = useState([]);

  const handleLangChange = function (value) {
    let selectedArr;
    if (value === "polish") {
      selectedArr = polish;
    } else if (value === "nato") {
      selectedArr = nato;
    } else {
      selectedArr = [];
    }
    const rand = selectedArr.sort(() => Math.random() - 0.5);
    setRandArray(rand);
    setLang(value);
  };

  return (
    <>
      {lang !== "" && (
        <button
          onClick={() => {
            setLang("");
          }}
          style={{
            fontSize: 40,
            margin: "0 4rem 4rem 4rem",
            alignSelf: "start",
          }}
        >
          ⬅️
        </button>
      )}
      {lang === "" && <LangList handleLangChange={handleLangChange} />}
      {lang !== "" && <Top charArray={randArray}></Top>}
    </>
  );
};

export default LangSelect;
