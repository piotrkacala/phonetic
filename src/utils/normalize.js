const normalizeText = (value) =>
  (value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const normalizeAnswer = (value) => normalizeText(value);

export const isExactMatch = (input, expected, options = {}) => {
  const { ignoreDiacritics = true } = options;
  if (!ignoreDiacritics) {
    return (input || "").trim().toUpperCase() === (expected || "").trim().toUpperCase();
  }
  return normalizeText(input) === normalizeText(expected);
};
