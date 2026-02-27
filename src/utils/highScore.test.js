import { getHighScores, updateHighScoreForAlphabet } from "./highScore";
import { vi } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
});

test("returns default high scores when storage is empty", () => {
  expect(getHighScores()).toEqual({ nato: 0, polish: 0 });
});

test("updates only matching alphabet and keeps max value", () => {
  let scores = updateHighScoreForAlphabet({ alphabet: "nato", score: 1200 });
  expect(scores).toEqual({ nato: 1200, polish: 0 });

  scores = updateHighScoreForAlphabet({ alphabet: "nato", score: 900 });
  expect(scores).toEqual({ nato: 1200, polish: 0 });

  scores = updateHighScoreForAlphabet({ alphabet: "polish", score: 1500 });
  expect(scores).toEqual({ nato: 1200, polish: 1500 });
});

test("returns current value when storage write fails", () => {
  updateHighScoreForAlphabet({ alphabet: "nato", score: 1000 });
  const setItemSpy = vi.spyOn(window.localStorage.__proto__, "setItem");
  setItemSpy.mockImplementation(() => {
    throw new Error("quota exceeded");
  });

  const scores = updateHighScoreForAlphabet({ alphabet: "nato", score: 1200 });
  expect(scores).toEqual({ nato: 1000, polish: 0 });

  setItemSpy.mockRestore();
});
