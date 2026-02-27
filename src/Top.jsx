import React, { useState, useEffect, useRef } from "react";
import { useQuiz } from "./context/QuizContext.jsx";
import { isExactMatch } from "./utils/normalize.js";
import { buildMcqOptions, buildQuestionSet } from "./utils/questionBuilder.js";
import { natoDistractors, polishDistractors } from "./data.js";
import {
  formatSeconds,
  getRemainingSeconds,
  hasTimedOut,
} from "./utils/timer.js";
import { finalizeSessionStats } from "./utils/scoring.js";
import { getHighScores, updateHighScoreForAlphabet } from "./utils/highScore.js";
import { createTranslator } from "./i18n/index.js";
import {
  AUTO_ADVANCE_DELAY_MS,
  DEFAULT_SESSION_DURATION_SECONDS,
} from "./config/session.js";

const Top = function (props) {
  const { state, setSessionStatus, setResults, constants } = useQuiz();
  const { mode, alphabet, timedMode, sessionDurationSeconds, uiLanguage } = state;
  const t = React.useMemo(() => createTranslator(uiLanguage), [uiLanguage]);
  const [step, setStep] = useState(0);
  const [inputText, setInputText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintedQuestions, setHintedQuestions] = useState({});
  const [wrongCountedQuestions, setWrongCountedQuestions] = useState({});
  const [mistakeMap, setMistakeMap] = useState({});
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(
    sessionDurationSeconds || DEFAULT_SESSION_DURATION_SECONDS
  );

  const textInput = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(Date.now());
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (mode === constants.QUIZ_MODES.TYPED && textInput.current) {
      textInput.current.focus();
    }
  }, [mode, step, constants.QUIZ_MODES.TYPED]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setRemainingSeconds(sessionDurationSeconds || DEFAULT_SESSION_DURATION_SECONDS);
  }, [sessionDurationSeconds]);

  const characters = React.useMemo(() => buildQuestionSet(props.charArray), [props.charArray]);
  const currentQuestion = characters[step];

  const mcqOptions = React.useMemo(() => {
    if (!currentQuestion || mode !== constants.QUIZ_MODES.MULTIPLE_CHOICE) {
      return [];
    }
    return buildMcqOptions({
      question: currentQuestion,
      alphabetKey: alphabet,
      allItems: characters,
      distractorPool: alphabet === "polish" ? polishDistractors : natoDistractors,
    });
  }, [alphabet, characters, constants.QUIZ_MODES.MULTIPLE_CHOICE, currentQuestion, mode]);

  const finalize = React.useCallback(
    (timeExpired = false) => {
      if (finalizedRef.current) {
        return;
      }
      finalizedRef.current = true;
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
      const durationSeconds = timedMode
        ? Math.min(elapsedSeconds, sessionDurationSeconds || DEFAULT_SESSION_DURATION_SECONDS)
        : elapsedSeconds;
      const stats = finalizeSessionStats({
        total: characters.length,
        correct: correctCount,
        hints: hintCount,
        wrong: wrongCount,
        answered: step,
        durationSeconds,
        timeExpired,
      });
      const savedHighScore = getHighScores()[alphabet] || 0;
      const nextHighScores = updateHighScoreForAlphabet({ alphabet, score: stats.score });
      setResults({
        ...stats,
        mistakes: Object.values(mistakeMap),
        accuracy: characters.length ? Math.round((stats.correct / characters.length) * 100) : 0,
        durationSeconds,
        highScore: nextHighScores[alphabet] || savedHighScore,
        bestStreak,
        finalStreak: currentStreak,
        hintMistakes: Object.values(mistakeMap).filter((item) => item.hinted).length,
        wrongMistakes: Object.values(mistakeMap).filter((item) => item.wrongAttempts > 0).length,
        timedOut: timeExpired,
        completedAt: new Date().toISOString(),
      });
      setSessionStatus(constants.SESSION_STATUS.FINISHED);
    },
    [
      characters.length,
      constants.SESSION_STATUS.FINISHED,
      correctCount,
      hintCount,
      setResults,
      setSessionStatus,
      step,
      wrongCount,
      mistakeMap,
      alphabet,
      sessionDurationSeconds,
      timedMode,
      bestStreak,
      currentStreak,
    ]
  );

  useEffect(() => {
    if (!timedMode || finalizedRef.current) {
      return;
    }
    const timer = setInterval(() => {
      const remaining = getRemainingSeconds({
        startedAtMs: startedAtRef.current,
        durationSeconds: sessionDurationSeconds || DEFAULT_SESSION_DURATION_SECONDS,
      });
      setRemainingSeconds(remaining);
      if (hasTimedOut({ remainingSeconds: remaining })) {
        clearInterval(timer);
        finalize(true);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [finalize, sessionDurationSeconds, timedMode]);

  const handleNextStep = () => {
    setInputText("");
    setFeedback("");
    setFeedbackTone("");
    setIsTransitioning(false);
    setStep((prev) => prev + 1);
  };

  const scheduleNextStep = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleNextStep, AUTO_ADVANCE_DELAY_MS);
  };

  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  const submitTypedAnswer = (candidateValue = inputText) => {
    if (!currentQuestion || isTransitioning) {
      return;
    }
    if (isExactMatch(candidateValue, currentQuestion.txt, { ignoreDiacritics: true })) {
      setCorrectCount((prev) => prev + 1);
      if (!wrongCountedQuestions[step] && !hintedQuestions[step]) {
        setCurrentStreak((prev) => {
          const next = prev + 1;
          setBestStreak((best) => (next > best ? next : best));
          return next;
        });
      } else {
        setCurrentStreak(0);
      }
      setFeedback(t("feedbackCorrect"));
      setFeedbackTone("correct");
      setIsTransitioning(true);
      scheduleNextStep();
    } else {
      if (!wrongCountedQuestions[step]) {
        setWrongCount((prev) => prev + 1);
        setWrongCountedQuestions((prev) => ({ ...prev, [step]: true }));
      }
      setMistakeMap((prev) => ({
        ...prev,
        [step]: {
          ...currentQuestion,
          reason: prev[step]?.hinted ? "hint" : "wrong",
          wrongAttempts: (prev[step]?.wrongAttempts || 0) + 1,
          hinted: Boolean(prev[step]?.hinted),
        },
      }));
      setCurrentStreak(0);
      setFeedback(t("feedbackWrong"));
      setFeedbackTone("wrong");
    }
  };

  const handleMcqSelect = (option) => {
    if (!currentQuestion || isTransitioning) {
      return;
    }
    if (isExactMatch(option, currentQuestion.txt, { ignoreDiacritics: true })) {
      setCorrectCount((prev) => prev + 1);
      if (!wrongCountedQuestions[step] && !hintedQuestions[step]) {
        setCurrentStreak((prev) => {
          const next = prev + 1;
          setBestStreak((best) => (next > best ? next : best));
          return next;
        });
      } else {
        setCurrentStreak(0);
      }
      setFeedback(t("feedbackCorrect"));
      setFeedbackTone("correct");
    } else {
      if (!wrongCountedQuestions[step]) {
        setWrongCount((prev) => prev + 1);
        setWrongCountedQuestions((prev) => ({ ...prev, [step]: true }));
      }
      setMistakeMap((prev) => ({
        ...prev,
        [step]: {
          ...currentQuestion,
          reason: prev[step]?.hinted ? "hint" : "wrong",
          wrongAttempts: (prev[step]?.wrongAttempts || 0) + 1,
          hinted: Boolean(prev[step]?.hinted),
        },
      }));
      setCurrentStreak(0);
      setFeedback(t("feedbackWrong"));
      setFeedbackTone("wrong");
    }
    setIsTransitioning(true);
    scheduleNextStep();
  };

  const handleInputChange = ({ target }) => {
    const value = target.value;
    setInputText(value);
    if (isExactMatch(value, currentQuestion?.txt, { ignoreDiacritics: true })) {
      submitTypedAnswer(value);
    }
  };

  const handleShowChange = () => {
    if (!currentQuestion || hintedQuestions[step]) {
      return;
    }
    setHintCount((prev) => prev + 1);
    setHintedQuestions((prev) => ({ ...prev, [step]: true }));
    setMistakeMap((prev) => ({
      ...prev,
      [step]: {
        ...currentQuestion,
        reason: "hint",
        wrongAttempts: prev[step]?.wrongAttempts || 0,
        hinted: true,
      },
    }));
    setCurrentStreak(0);
  };

  useEffect(() => {
    if (step >= characters.length && characters.length > 0) {
      finalize(false);
    }
  }, [characters.length, finalize, step]);

  return (
    <section className={`card ${feedbackTone ? `card-feedback-${feedbackTone}` : ""}`}>
      <div className="quiz-head">
        <progress className="progress" value={step} max={characters.length} />
        {timedMode && <p className="timer">{formatSeconds(remainingSeconds)}</p>}
      </div>
      {step < characters.length && (
        <div className="quiz-body">
          <p className="prompt-letter">{currentQuestion.char}</p>
          {mode === constants.QUIZ_MODES.TYPED && (
            <div className="typed-wrap">
              <input
                className="text-input"
                value={inputText}
                onChange={handleInputChange}
                ref={textInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitTypedAnswer(event.currentTarget.value);
                  }
                }}
              />
            </div>
          )}
          {mode === constants.QUIZ_MODES.MULTIPLE_CHOICE && (
            <div className="answers-grid">
              {mcqOptions.map((option) => (
                <button
                  className="answer-btn"
                  key={option}
                  onClick={() => handleMcqSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <div className="hint-slot">
            {!hintedQuestions[step] ? (
              <button className="hint-btn" onClick={handleShowChange} aria-label={t("showHint")}>
                {t("showHint")}
              </button>
            ) : (
              <p className="help-line">{currentQuestion.txt}</p>
            )}
          </div>
          <div className="feedback-slot">
            <p className={feedback ? "feedback-line is-visible" : "feedback-line"} aria-live="polite">
              {feedback || "\u00A0"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Top;
