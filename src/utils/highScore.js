const HIGH_SCORE_STORAGE_KEY = "phonetic.highScores";

const DEFAULT_HIGH_SCORES = {
  nato: 0,
  polish: 0,
};

export const getHighScores = () => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_HIGH_SCORES };
  }
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_HIGH_SCORES };
    }
    const parsed = JSON.parse(raw);
    return {
      nato: Number(parsed?.nato) || 0,
      polish: Number(parsed?.polish) || 0,
    };
  } catch (error) {
    return { ...DEFAULT_HIGH_SCORES };
  }
};

export const updateHighScoreForAlphabet = ({ alphabet, score }) => {
  const current = getHighScores();
  if (!alphabet || !(alphabet in current)) {
    return current;
  }
  const nextScores = { ...current };
  nextScores[alphabet] = Math.max(current[alphabet], Math.max(score || 0, 0));
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(nextScores));
    } catch (error) {
      return current;
    }
  }
  return nextScores;
};
