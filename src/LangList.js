import React from "react";

const LangList = function (props) {
  const buttonStyle = { fontSize: 40, padding: 10, margin: 20 };
  return (
    <>
      <div>
        <button
          name="langSelection"
          value="polish"
          style={buttonStyle}
          onClick={({ target }) => {
            props.handleLangChange(target.value);
          }}
        >
          Polski
        </button>
      </div>
      <div>
        <button
          name="langSelection"
          value="nato"
          style={buttonStyle}
          onClick={({ target }) => {
            props.handleLangChange(target.value);
          }}
        >
          Nato
        </button>
      </div>
    </>
  );
};
export default LangList;
