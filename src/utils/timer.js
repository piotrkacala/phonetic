import { DEFAULT_SESSION_DURATION_SECONDS } from "../config/session.js";

export const getRemainingSeconds = ({
  startedAtMs,
  nowMs = Date.now(),
  durationSeconds = DEFAULT_SESSION_DURATION_SECONDS,
}) => {
  const elapsedSeconds = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.max(durationSeconds - elapsedSeconds, 0);
};

export const hasTimedOut = ({ remainingSeconds }) => remainingSeconds <= 0;

export const formatSeconds = (seconds) => {
  const safe = Math.max(seconds, 0);
  const mins = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};
