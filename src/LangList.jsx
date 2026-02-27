import React, { useEffect, useState } from "react";
import { SESSION_DURATION_OPTIONS } from "./config/session.js";

const LangList = function (props) {
  const {
    selectedAlphabet,
    mode,
    timedMode,
    sessionDurationSeconds,
    onAlphabetChange,
    onModeChange,
    onTimedModeChange,
    onSessionDurationChange,
    onStart,
    t,
  } = props;

  const [step, setStep] = useState(selectedAlphabet ? 2 : 1);
  const [modeSelected, setModeSelected] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);

  useEffect(() => {
    if (!selectedAlphabet) {
      setStep(1);
      setModeSelected(false);
      setTimeSelected(false);
    }
  }, [selectedAlphabet]);

  const handleAlphabetSelect = (alphabet) => {
    onAlphabetChange(alphabet);
    setModeSelected(false);
    setTimeSelected(false);
    setStep(2);
  };

  const handleModeSelect = (selectedMode) => {
    onModeChange(selectedMode);
    setModeSelected(true);
    setStep(3);
  };

  const handleNoLimit = () => {
    onTimedModeChange(false);
    setTimeSelected(true);
  };

  const handleTimedLimit = (seconds) => {
    onTimedModeChange(true);
    onSessionDurationChange(seconds);
    setTimeSelected(true);
  };

  return (
    <section className="card">
      <div className="card-head">
        <h1 className="card-title">{t("appTitle")}</h1>
      </div>
      {step === 1 && (
        <>
          <p className="card-subtitle">{t("setupStepAlphabet")}</p>
          <div className="selector-grid">
            <button
              name="langSelection"
              value="polish"
              className={selectedAlphabet === "polish" ? "option-btn is-selected" : "option-btn"}
              onClick={() => handleAlphabetSelect("polish")}
            >
              {t("alphabetPolish")}
            </button>
            <button
              name="langSelection"
              value="nato"
              className={selectedAlphabet === "nato" ? "option-btn is-selected" : "option-btn"}
              onClick={() => handleAlphabetSelect("nato")}
            >
              {t("alphabetNato")}
            </button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <p className="card-subtitle">{t("setupStepMode")}</p>
          <div className="selector-grid">
            <button
              className={modeSelected && mode === "typed" ? "option-btn is-selected" : "option-btn"}
              onClick={() => handleModeSelect("typed")}
            >
              {t("modeTyped")}
            </button>
            <button
              className={
                modeSelected && mode === "multipleChoice" ? "option-btn is-selected" : "option-btn"
              }
              onClick={() => handleModeSelect("multipleChoice")}
            >
              {t("modeMultipleChoice")}
            </button>
          </div>
          <button className="secondary-btn" onClick={() => setStep(1)}>
            {t("backLabel")}
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <p className="card-subtitle">{t("setupStepTimeLimit")}</p>
          <div className="selector-grid">
            <button
              className={!timedMode && timeSelected ? "option-btn is-selected" : "option-btn"}
              onClick={handleNoLimit}
            >
              {t("noLimit")}
            </button>
            {SESSION_DURATION_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                className={
                  timeSelected && timedMode && sessionDurationSeconds === seconds
                    ? "option-btn is-selected"
                    : "option-btn"
                }
                onClick={() => handleTimedLimit(seconds)}
              >
                {Math.floor(seconds / 60)} {t("minutesShort")}
              </button>
            ))}
          </div>
          <div className="step-actions">
            <button className="secondary-btn" onClick={() => setStep(2)}>
              {t("backLabel")}
            </button>
            <button className="primary-btn" disabled={!timeSelected} onClick={onStart}>
              {t("startQuiz")}
            </button>
          </div>
        </>
      )}
    </section>
  );
};
export default LangList;
