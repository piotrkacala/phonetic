import logo from "./logo.svg";
import "./App.css";
import { polish } from "./data.js";
import LangSelect from "./LangSelect.js";
import Top from "./Top.js";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <LangSelect />
      </header>
    </div>
  );
}

export default App;
