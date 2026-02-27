import { DEFAULT_SESSION_DURATION_SECONDS } from "../config/session.js";
import { formatSeconds, getRemainingSeconds, hasTimedOut } from "./timer";

test('default session duration is 5 minutes', () => {
  expect(DEFAULT_SESSION_DURATION_SECONDS).toBe(300);
});

test('calculates remaining seconds and timeout state', () => {
  const startedAtMs = 1000;
  const remaining = getRemainingSeconds({ startedAtMs, nowMs: 121000, durationSeconds: 150 });
  expect(remaining).toBe(30);
  expect(hasTimedOut({ remainingSeconds: remaining })).toBe(false);
  expect(hasTimedOut({ remainingSeconds: 0 })).toBe(true);
});

test('formats seconds as mm:ss', () => {
  expect(formatSeconds(5)).toBe('00:05');
  expect(formatSeconds(125)).toBe('02:05');
});
