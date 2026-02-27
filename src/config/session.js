export const DEFAULT_SESSION_DURATION_SECONDS = 5 * 60;
export const AUTO_ADVANCE_DELAY_MS = 700;
export const SESSION_DURATION_OPTIONS = [60, 180, 300];

export const createEmptyResults = () => ({
  score: 0,
  timePenalty: 0,
  correct: 0,
  wrong: 0,
  hints: 0,
  unanswered: 0,
  highScore: 0,
  mistakes: [],
  reviewRecovered: 0,
  reviewCompleted: false,
  accuracy: 0,
  durationSeconds: 0,
  bestStreak: 0,
  finalStreak: 0,
  hintMistakes: 0,
  wrongMistakes: 0,
  reviewHistory: [],
  timedOut: false,
  completedAt: null,
});
