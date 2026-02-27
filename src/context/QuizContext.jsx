import React, { createContext, useContext, useMemo, useReducer } from "react";
import { createEmptyResults, DEFAULT_SESSION_DURATION_SECONDS } from "../config/session.js";

const QUIZ_MODES = {
  TYPED: "typed",
  MULTIPLE_CHOICE: "multipleChoice",
};

const SESSION_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  REVIEW: "review",
  FINISHED: "finished",
};

const SUPPORTED_UI_LANGUAGES = ["en", "pl"];
const UI_LANGUAGE_STORAGE_KEY = "phonetic.uiLanguage";

const getSavedUiLanguage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const persistUiLanguage = (uiLanguage) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, uiLanguage);
  } catch (error) {
    // Ignore storage write failures (private mode/quota).
  }
};

const detectInitialUiLanguage = () => {
  const savedLanguage = getSavedUiLanguage();
  if (savedLanguage && SUPPORTED_UI_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }
  const browserLanguage =
    (typeof navigator !== "undefined" && navigator.language?.slice(0, 2).toLowerCase()) || "en";
  if (SUPPORTED_UI_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }
  return "en";
};

const initialState = {
  uiLanguage: detectInitialUiLanguage(),
  alphabet: null,
  mode: QUIZ_MODES.TYPED,
  timedMode: false,
  sessionDurationSeconds: DEFAULT_SESSION_DURATION_SECONDS,
  sessionStatus: SESSION_STATUS.IDLE,
  results: createEmptyResults(),
};

const QuizContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case "setUiLanguage":
      return { ...state, uiLanguage: action.payload };
    case "setAlphabet":
      return { ...state, alphabet: action.payload };
    case "setMode":
      return { ...state, mode: action.payload };
    case "setTimedMode":
      return { ...state, timedMode: action.payload };
    case "setSessionDurationSeconds":
      return { ...state, sessionDurationSeconds: action.payload };
    case "setSessionStatus":
      return { ...state, sessionStatus: action.payload };
    case "setResults":
      return { ...state, results: { ...state.results, ...action.payload } };
    case "resetSession":
      return { ...state, sessionStatus: SESSION_STATUS.IDLE, results: initialState.results };
    default:
      return state;
  }
};

export const QuizProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      state,
      setUiLanguage: (uiLanguage) => {
        persistUiLanguage(uiLanguage);
        dispatch({ type: "setUiLanguage", payload: uiLanguage });
      },
      setAlphabet: (alphabet) => dispatch({ type: "setAlphabet", payload: alphabet }),
      setMode: (mode) => dispatch({ type: "setMode", payload: mode }),
      setTimedMode: (timedMode) =>
        dispatch({ type: "setTimedMode", payload: timedMode }),
      setSessionDurationSeconds: (seconds) =>
        dispatch({ type: "setSessionDurationSeconds", payload: seconds }),
      setSessionStatus: (status) =>
        dispatch({ type: "setSessionStatus", payload: status }),
      setResults: (results) => dispatch({ type: "setResults", payload: results }),
      resetSession: () => dispatch({ type: "resetSession" }),
      constants: {
        QUIZ_MODES,
        SESSION_STATUS,
        SUPPORTED_UI_LANGUAGES,
      },
    }),
    [state]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }
  return context;
};
