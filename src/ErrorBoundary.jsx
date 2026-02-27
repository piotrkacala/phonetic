import React from "react";
import { createTranslator } from "./i18n/index.js";

const UI_LANGUAGE_STORAGE_KEY = "phonetic.uiLanguage";

const detectUiLanguage = () => {
  if (typeof window === "undefined") {
    return "en";
  }
  try {
    const stored = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
    if (stored === "pl" || stored === "en") {
      return stored;
    }
  } catch (error) {
    // Ignore local storage read failures.
  }
  const documentLanguage = document.documentElement.lang?.slice(0, 2).toLowerCase();
  return documentLanguage === "pl" ? "pl" : "en";
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep runtime failures visible in developer tools.
    console.error("Unhandled app error:", error);
  }

  render() {
    if (this.state.hasError) {
      const t = createTranslator(detectUiLanguage());
      return (
        <section className="card">
          <h2 className="card-title">{t("errorBoundaryTitle")}</h2>
          <p className="card-subtitle">
            {t("errorBoundaryMessage")}
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
