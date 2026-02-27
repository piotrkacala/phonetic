import "./App.css";
import { useEffect, useMemo } from "react";
import LangSelect from "./LangSelect.jsx";
import { QuizProvider, useQuiz } from "./context/QuizContext.jsx";
import { createTranslator } from "./i18n/index.js";
import ErrorBoundary from "./ErrorBoundary.jsx";

function AppShell() {
  const {
    state: { uiLanguage },
    setUiLanguage,
  } = useQuiz();
  const t = useMemo(() => createTranslator(uiLanguage), [uiLanguage]);

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

  return (
    <div className="App">
      <header className="App-shell">
        <div className="app-toolbar">
          <label className="app-language-label" htmlFor="uiLanguageGlobal">{t("uiLanguage")}:</label>
          <select
            className="app-language-select"
            id="uiLanguageGlobal"
            value={uiLanguage}
            onChange={(event) => setUiLanguage(event.target.value)}
          >
            <option value="en">{t("uiLanguageEnglish")}</option>
            <option value="pl">{t("uiLanguagePolish")}</option>
          </select>
        </div>
        <div className="app-stage">
          <LangSelect />
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <QuizProvider>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </QuizProvider>
  );
}

export default App;
