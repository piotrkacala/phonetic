import { buildMcqOptions } from './questionBuilder';
import { normalizeAnswer } from './normalize';
import { polish, polishDistractors } from '../data';

describe('buildMcqOptions', () => {
  test('Polish alphabet includes Ó as ÓSEMKA between O and P', () => {
    expect(polish).toContainEqual({ char: 'Ó', txt: 'ÓSEMKA' });

    const letters = polish.map((item) => item.char);
    expect(letters.indexOf('O')).toBeLessThan(letters.indexOf('Ó'));
    expect(letters.indexOf('Ó')).toBeLessThan(letters.indexOf('P'));
  });

  test('Polish Ó distractors use exact Ó examples', () => {
    expect(polishDistractors['Ó']).toEqual(expect.arrayContaining(['ŁÓDŹ', 'ÓWCZESNY']));
    polishDistractors['Ó'].forEach((word) => expect(word).toContain('Ó'));
  });

  test('uses same-letter distractors when available', () => {
    const question = { char: 'A', txt: 'ALFA' };
    const allItems = [question, { char: 'B', txt: 'BRAVO' }];
    const distractorPool = {
      A: ['ATOM', 'ADAM', 'ALLOW'],
    };

    const options = buildMcqOptions({
      question,
      alphabetKey: 'nato',
      allItems,
      distractorPool,
    });

    expect(options).toHaveLength(4);
    expect(options).toContain('ALFA');
    const wrong = options.filter((opt) => opt !== 'ALFA');
    wrong.forEach((opt) => expect(opt.startsWith('A')).toBe(true));
  });

  test('uses contains-letter fallback for polish letters with no startsWith candidates', () => {
    const question = { char: 'Ą', txt: 'KĄT' };
    const allItems = [question, { char: 'B', txt: 'BARBARA' }];
    const distractorPool = {
      'Ą': ['WĄTROBA', 'LĄD', 'STĄD'],
    };

    const options = buildMcqOptions({
      question,
      alphabetKey: 'polish',
      allItems,
      distractorPool,
    });

    expect(options).toHaveLength(4);
    expect(options).toContain('KĄT');
    const wrong = options.filter((opt) => normalizeAnswer(opt) !== normalizeAnswer('KĄT'));
    wrong.forEach((opt) => expect(normalizeAnswer(opt).includes(normalizeAnswer('Ą'))).toBe(true));
  });

  test('does not use unrelated global fallback words for polish', () => {
    const question = { char: 'Ą', txt: 'KĄT' };
    const allItems = [
      question,
      { char: 'B', txt: 'BARBARA' },
      { char: 'C', txt: 'CELINA' },
      { char: 'D', txt: 'DOMINIK' },
    ];
    const distractorPool = {
      Ą: ['WĄTEK'],
      B: ['BASIA', 'BATON', 'BIBLIA'],
      C: ['CEBULA', 'CISZA', 'CYPRYS'],
    };

    const options = buildMcqOptions({
      question,
      alphabetKey: 'polish',
      allItems,
      distractorPool,
    });

    const wrong = options.filter((opt) => normalizeAnswer(opt) !== normalizeAnswer('KĄT'));
    wrong.forEach((opt) => expect(normalizeAnswer(opt).includes(normalizeAnswer('Ą'))).toBe(true));
  });

  test('for Polish Ą, distractors must include exact Ą (not plain A)', () => {
    const question = { char: 'Ą', txt: 'KĄT' };
    const allItems = [
      question,
      { char: 'A', txt: 'ADAM' },
      { char: 'A', txt: 'ATLAS' },
      { char: 'Ć', txt: 'ĆWIKŁA' },
    ];
    const distractorPool = {
      Ą: ['WĄTEK', 'STĄD', 'LĄD', 'MĄKA'],
      A: ['ADAM', 'ATLAS', 'AKTOR', 'ALARM'],
      Ć: ['ĆWIKŁA', 'ĆMIEL', 'ĆWIERK'],
    };

    const options = buildMcqOptions({
      question,
      alphabetKey: 'polish',
      allItems,
      distractorPool,
    });

    expect(options).toContain('KĄT');
    const wrong = options.filter((opt) => normalizeAnswer(opt) !== normalizeAnswer('KĄT'));
    wrong.forEach((opt) => expect(opt.includes('Ą')).toBe(true));
  });

  test('for Polish Ó, distractors must include exact Ó (not plain O)', () => {
    const question = { char: 'Ó', txt: 'ÓSEMKA' };
    const allItems = [
      question,
      { char: 'O', txt: 'OLGA' },
      { char: 'O', txt: 'OKNO' },
    ];
    const distractorPool = {
      Ó: ['ŁÓDŹ', 'ÓWCZESNY', 'MIÓD'],
      O: ['OKNO', 'OLA', 'OGIEŃ', 'ORZECH'],
    };

    const options = buildMcqOptions({
      question,
      alphabetKey: 'polish',
      allItems,
      distractorPool,
    });

    expect(options).toContain('ÓSEMKA');
    const wrong = options.filter((opt) => normalizeAnswer(opt) !== normalizeAnswer('ÓSEMKA'));
    wrong.forEach((opt) => expect(opt).toContain('Ó'));
  });
});
