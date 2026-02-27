import { calculateScore, finalizeSessionStats, calculateTimePenalty } from './scoring';

test('calculateTimePenalty applies 5 points per full 10 seconds', () => {
  expect(calculateTimePenalty({ durationSeconds: 0 })).toBe(0);
  expect(calculateTimePenalty({ durationSeconds: 9 })).toBe(0);
  expect(calculateTimePenalty({ durationSeconds: 10 })).toBe(5);
  expect(calculateTimePenalty({ durationSeconds: 121 })).toBe(60);
});

test('calculateScore applies weighted penalties and clamps to zero', () => {
  expect(calculateScore({ correct: 20, hints: 2, wrong: 3, durationSeconds: 120 })).toBe(1770);
  expect(calculateScore({ correct: 0, hints: 10, wrong: 10, durationSeconds: 600 })).toBe(0);
});

test('finalizeSessionStats counts unanswered as wrong on timeout', () => {
  const result = finalizeSessionStats({
    total: 30,
    correct: 20,
    hints: 2,
    wrong: 3,
    answered: 23,
    durationSeconds: 120,
    timeExpired: true,
  });

  expect(result.unanswered).toBe(7);
  expect(result.wrong).toBe(10);
  expect(result.timePenalty).toBe(60);
  expect(result.score).toBe(1490);
});
