import { isExactMatch, normalizeAnswer } from './normalize';

test('normalizeAnswer strips spaces and diacritics', () => {
  expect(normalizeAnswer('  Żółć ')).toBe('ZOŁC');
});

test('isExactMatch supports diacritic-insensitive exact matching', () => {
  expect(isExactMatch('zaba', 'ŻABA')).toBe(true);
  expect(isExactMatch('zaba!', 'ŻABA')).toBe(false);
});
