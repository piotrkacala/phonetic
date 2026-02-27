import React, { useMemo } from "react";
import LangList from "./LangList.jsx";
import Top from "./Top.jsx";
import ReviewRound from "./ReviewRound.jsx";
import { polish, nato } from "./data.js";
import { useQuiz } from "./context/QuizContext.jsx";
import { createTranslator } from "./i18n/index.js";
import { createEmptyResults } from "./config/session.js";

const LangSelect = function () {
  const {
    state,
    setAlphabet,
    setMode,
    setTimedMode,
    setSessionDurationSeconds,
    setSessionStatus,
    setResults,
    constants,
  } = useQuiz();
  const {
    alphabet,
    uiLanguage,
    mode,
    timedMode,
    sessionDurationSeconds,
    sessionStatus,
    results,
  } = state;
  const t = useMemo(() => createTranslator(uiLanguage), [uiLanguage]);

  const alphabetData = useMemo(
    () => ({
      polish,
      nato,
    }),
    []
  );

  const handleStart = function () {
    if (!alphabet || !alphabetData[alphabet]) {
      return;
    }
    setResults(createEmptyResults());
    setSessionStatus(constants.SESSION_STATUS.RUNNING);
  };

  const handleBack = () => {
    setAlphabet(null);
    setSessionStatus(constants.SESSION_STATUS.IDLE);
  };

  return (
    <>
      {sessionStatus !== constants.SESSION_STATUS.IDLE && (
        <button className="icon-btn" onClick={handleBack} aria-label={t("backToSetup")}>
          {"\u2190 "}
          {t("backLabel")}
        </button>
      )}
      {sessionStatus === constants.SESSION_STATUS.IDLE && (
        <LangList
          selectedAlphabet={alphabet}
          mode={mode}
          timedMode={timedMode}
          sessionDurationSeconds={sessionDurationSeconds}
          onAlphabetChange={setAlphabet}
          onModeChange={setMode}
          onTimedModeChange={setTimedMode}
          onSessionDurationChange={setSessionDurationSeconds}
          onStart={handleStart}
          t={t}
        />
      )}
      {sessionStatus === constants.SESSION_STATUS.RUNNING && (
        <Top charArray={alphabetData[alphabet] || []} />
      )}
      {sessionStatus === constants.SESSION_STATUS.REVIEW && (
        <ReviewRound questions={results.mistakes || []} />
      )}
      {sessionStatus === constants.SESSION_STATUS.FINISHED && (
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">{t("sessionSummary")}</h2>
          </div>
          <div className="stats-grid">
            <p className="stat-tile"><span>{t("score")}</span><strong>{results.score}</strong></p>
            <p className="stat-tile"><span>{t("accuracy")}</span><strong>{results.accuracy}%</strong></p>
            <p className="stat-tile"><span>{t("correct")}</span><strong>{results.correct}</strong></p>
            <p className="stat-tile"><span>{t("wrong")}</span><strong>{results.wrong}</strong></p>
            <p className="stat-tile"><span>{t("hints")}</span><strong>{results.hints}</strong></p>
            <p className="stat-tile"><span>{t("unanswered")}</span><strong>{results.unanswered}</strong></p>
            <p className="stat-tile"><span>{t("timeSpent")}</span><strong>{results.durationSeconds}s</strong></p>
            <p className="stat-tile"><span>{t("timePenalty")}</span><strong>-{results.timePenalty}</strong></p>
            <p className="stat-tile"><span>{t("highScore")}</span><strong>{results.highScore}</strong></p>
            <p className="stat-tile"><span>{t("bestStreak")}</span><strong>{results.bestStreak}</strong></p>
            <p className="stat-tile"><span>{t("finalStreak")}</span><strong>{results.finalStreak}</strong></p>
            <p className="stat-tile"><span>{t("hintMistakes")}</span><strong>{results.hintMistakes}</strong></p>
            <p className="stat-tile"><span>{t("wrongMistakes")}</span><strong>{results.wrongMistakes}</strong></p>
            {results.timedOut && <p className="warning-line">{t("timeExpired")}</p>}
          </div>
          {Boolean(results.reviewRecovered) && (
            <p className="success-line">{t("reviewRecovered")}: +{results.reviewRecovered}</p>
          )}
          {!results.reviewCompleted && (results.mistakes || []).length > 0 && (
            <button
              className="primary-btn wide-btn"
              onClick={() => setSessionStatus(constants.SESSION_STATUS.REVIEW)}
            >
              {t("reviewMistakes")}
            </button>
          )}
          {!results.reviewCompleted && (results.mistakes || []).length === 0 && (
            <p className="success-line">{t("noMistakesToReview")}</p>
          )}
          <button className="secondary-btn wide-btn" onClick={handleBack}>
            {t("backToSetup")}
          </button>
        </section>
      )}
    </>
  );
};

export default LangSelect;
