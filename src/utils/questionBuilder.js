import { normalizeAnswer } from "./normalize.js";

const DIACRITIC_SENSITIVE_POLISH_LETTERS = new Set(["Ą", "Ć", "Ę", "Ł", "Ń", "Ó", "Ś", "Ź", "Ż"]);

const uniqueByNormalized = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const normalized = normalizeAnswer(item);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

export const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);

const startsWithLetter = (word, letter) =>
  normalizeAnswer(word).startsWith(normalizeAnswer(letter));

const containsLetter = (word, letter) =>
  normalizeAnswer(word).includes(normalizeAnswer(letter));

const startsWithExactLetter = (word, letter) =>
  ((word || "").trim().toUpperCase()).startsWith((letter || "").trim().toUpperCase());

const containsExactLetter = (word, letter) =>
  ((word || "").trim().toUpperCase()).includes((letter || "").trim().toUpperCase());

const shouldUseExactPolishLetterMatching = (alphabetKey, letter) =>
  alphabetKey === "polish" &&
  DIACRITIC_SENSITIVE_POLISH_LETTERS.has((letter || "").trim().toUpperCase());

const collectCandidates = ({ question, alphabetKey, allItems, distractorPool }) => {
  const correctWord = normalizeAnswer(question.txt);
  const letter = question.char;
  const poolWords = distractorPool?.[letter] || [];
  const otherWords = allItems.map((item) => item.txt).filter((txt) => normalizeAnswer(txt) !== correctWord);
  const merged = uniqueByNormalized([...poolWords, ...otherWords]).map((word) =>
    (word || "").trim().toUpperCase()
  );
  const useExactPolishMatching = shouldUseExactPolishLetterMatching(alphabetKey, letter);
  const startsWithMatcher = useExactPolishMatching ? startsWithExactLetter : startsWithLetter;
  const containsMatcher = useExactPolishMatching ? containsExactLetter : containsLetter;

  const startsWith = merged.filter((word) => startsWithMatcher(word, letter));
  if (startsWith.length > 0) {
    return startsWith;
  }

  if (alphabetKey === "polish") {
    return merged.filter((word) => containsMatcher(word, letter));
  }

  return [];
};

export const buildMcqOptions = ({
  question,
  alphabetKey,
  allItems,
  distractorPool,
  optionCount = 4,
}) => {
  const correct = (question.txt || "").trim().toUpperCase();
  const correctNormalized = normalizeAnswer(correct);
  const scopedCandidates = shuffleArray(
    collectCandidates({ question, alphabetKey, allItems, distractorPool }).filter(
      (word) => normalizeAnswer(word) !== correctNormalized
    )
  );
  const allPoolWords = uniqueByNormalized(
    Object.values(distractorPool || {}).flat().concat(allItems.map((item) => item.txt))
  )
    .map((word) => (word || "").trim().toUpperCase())
    .filter((word) => normalizeAnswer(word) !== correctNormalized);

  const fallbackCandidates = shuffleArray(
    allPoolWords.filter(
      (word) => !scopedCandidates.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(word))
    )
  );
  const filteredFallbackCandidates =
    alphabetKey === "polish"
      ? fallbackCandidates.filter((word) => {
          const useExactPolishMatching = shouldUseExactPolishLetterMatching(
            alphabetKey,
            question.char
          );
          const containsMatcher = useExactPolishMatching ? containsExactLetter : containsLetter;
          return containsMatcher(word, question.char);
        })
      : fallbackCandidates;

  const neededDistractors = Math.max(optionCount - 1, 0);
  const chosen = [...scopedCandidates, ...filteredFallbackCandidates].slice(0, neededDistractors);
  const options = shuffleArray(uniqueByNormalized([correct, ...chosen]));
  return options.slice(0, optionCount);
};

export const buildQuestionSet = (items) => shuffleArray(items).map((item) => ({ ...item }));
