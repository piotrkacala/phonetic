import { buildMcqOptions } from './questionBuilder';
import { normalizeAnswer } from './normalize';

describe('buildMcqOptions', () => {
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
});
