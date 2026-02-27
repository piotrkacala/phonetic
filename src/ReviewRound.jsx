import React, { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { useQuiz } from "./context/QuizContext.jsx";
import { isExactMatch } from "./utils/normalize.js";
import { buildMcqOptions, buildQuestionSet } from "./utils/questionBuilder.js";
import { natoDistractors, polishDistractors } from "./data.js";
import { createTranslator } from "./i18n/index.js";
import { getHighScores, updateHighScoreForAlphabet } from "./utils/highScore.js";

const ReviewRound = ({ questions }) => {
  const { state, setResults, setSessionStatus, constants } = useQuiz();
  const { alphabet, mode, uiLanguage, results } = state;
  const t = useMemo(() => createTranslator(uiLanguage), [uiLanguage]);
  const [step, setStep] = useState(0);
  const [inputText, setInputText] = useState("");
  const [recovered, setRecovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("");
  const [history, setHistory] = useState([]);
  const timeoutRef = useRef(null);
  const items = useMemo(() => buildQuestionSet(questions || []), [questions]);
  const currentQuestion = items[step];

  const mcqOptions = useMemo(() => {
    if (!currentQuestion || mode !== constants.QUIZ_MODES.MULTIPLE_CHOICE) {
      return [];
    }
    return buildMcqOptions({
      question: currentQuestion,
      alphabetKey: alphabet,
      allItems: items,
      distractorPool: alphabet === "polish" ? polishDistractors : natoDistractors,
    });
  }, [alphabet, constants.QUIZ_MODES.MULTIPLE_CHOICE, currentQuestion, items, mode]);

  const next = () => {
    setInputText("");
    setFeedback("");
    setFeedbackTone("");
    setStep((prev) => prev + 1);
  };

  const markCorrect = (answer) => {
    setRecovered((prev) => prev + 1);
    setHistory((prev) => [
      ...prev,
      { char: currentQuestion.char, txt: currentQuestion.txt, answer, correct: true },
    ]);
    setFeedback(t("feedbackCorrect"));
    setFeedbackTone("correct");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      next();
    }, 500);
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleTyped = () => {
    if (!currentQuestion) {
      return;
    }
    if (isExactMatch(inputText, currentQuestion.txt, { ignoreDiacritics: true })) {
      markCorrect(inputText);
    } else {
      setHistory((prev) => [
        ...prev,
        { char: currentQuestion.char, txt: currentQuestion.txt, answer: inputText, correct: false },
      ]);
      setFeedback(t("feedbackWrong"));
      setFeedbackTone("wrong");
    }
  };

  const handleMcq = (option) => {
    if (!currentQuestion) {
      return;
    }
    if (isExactMatch(option, currentQuestion.txt, { ignoreDiacritics: true })) {
      markCorrect(option);
    } else {
      setHistory((prev) => [
        ...prev,
        { char: currentQuestion.char, txt: currentQuestion.txt, answer: option, correct: false },
      ]);
      setFeedback(t("feedbackWrong"));
      setFeedbackTone("wrong");
    }
  };

  useEffect(() => {
    if (items.length === 0 || step < items.length) {
      return;
    }
    const finalScore = (results.score || 0) + recovered;
    const savedHighScore = getHighScores()[alphabet] || 0;
    const nextHighScores = updateHighScoreForAlphabet({ alphabet, score: finalScore });
    setResults({
      score: finalScore,
      reviewRecovered: recovered,
      reviewCompleted: true,
      reviewHistory: history,
      highScore: nextHighScores[alphabet] || savedHighScore,
    });
    setSessionStatus(constants.SESSION_STATUS.FINISHED);
  }, [
    constants.SESSION_STATUS.FINISHED,
    items.length,
    recovered,
    history,
    alphabet,
    results.score,
    setResults,
    setSessionStatus,
    step,
  ]);

  if (items.length === 0) {
    return (
      <section className="card">
        <h3>{t("reviewTitle")}</h3>
        <p>{t("noMistakesToReview")}</p>
        <button
          className="secondary-btn"
          onClick={() => setSessionStatus(constants.SESSION_STATUS.FINISHED)}
        >
          {t("backLabel")}
        </button>
      </section>
    );
  }

  if (step >= items.length) {
    return <p>{t("reviewDone")}</p>;
  }

  return (
    <section className={`card ${feedbackTone ? `card-feedback-${feedbackTone}` : ""}`}>
      <div className="card-head">
        <h3 className="card-title">{t("reviewTitle")}</h3>
      </div>
      <div className="quiz-head">
        <progress className="progress" value={step} max={items.length} />
      </div>
      <div className="quiz-body">
        <p className="prompt-letter">{currentQuestion.char}</p>
        <p className="help-line">
          {t("reasonLabel")}: {currentQuestion.reason === "hint" ? t("reasonHint") : t("reasonWrong")}
        </p>
      {mode === constants.QUIZ_MODES.TYPED && (
        <div className="typed-wrap">
          <input
            className="text-input"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleTyped();
              }
            }}
          />
          <button className="primary-btn" onClick={handleTyped}>{t("check")}</button>
        </div>
      )}
      {mode === constants.QUIZ_MODES.MULTIPLE_CHOICE && (
        <div className="answers-grid">
          {mcqOptions.map((option) => (
            <button className="answer-btn" key={option} onClick={() => handleMcq(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="feedback-slot">
        <p className={feedback ? "feedback-line is-visible" : "feedback-line"} aria-live="polite">
          {feedback || "\u00A0"}
        </p>
      </div>
      </div>
    </section>
  );
};

export default ReviewRound;
