export const calculateTimePenalty = ({ durationSeconds = 0 }) =>
  Math.floor(Math.max(durationSeconds, 0) / 10) * 5;

export const calculateScore = ({ correct = 0, hints = 0, wrong = 0, durationSeconds = 0 }) => {
  const rawScore =
    correct * 100 -
    wrong * 40 -
    hints * 25 -
    calculateTimePenalty({ durationSeconds });
  return Math.max(rawScore, 0);
};

export const finalizeSessionStats = ({
  total = 0,
  correct = 0,
  hints = 0,
  wrong = 0,
  answered = 0,
  durationSeconds = 0,
  timeExpired = false,
}) => {
  const unanswered = timeExpired ? Math.max(total - answered, 0) : 0;
  const totalWrong = wrong + unanswered;
  const timePenalty = calculateTimePenalty({ durationSeconds });
  const score = calculateScore({ correct, hints, wrong: totalWrong, durationSeconds });
  return {
    total,
    correct,
    hints,
    wrong: totalWrong,
    unanswered,
    durationSeconds,
    timePenalty,
    score,
  };
};
