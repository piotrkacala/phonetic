# Phonetic Alphabet Trainer - NATO & Polish

A focused, minimal web app for learning and drilling phonetic alphabets. Built for anyone who needs to reliably recall NATO or Polish phonetic codes under pressure: pilots, radio operators, dispatchers, or curious learners.

## How it works

The trainer walks you through every letter in the chosen alphabet, presenting each one as either a multiple choice question or a typed answer challenge. You configure the session upfront: pick your alphabet, your answer mode, and whether you want a time limit. From there it's just you and the letters.

Hints are available but costly. Using one shaves points off your final score, so leaning on them is a trade-off rather than a free pass. Wrong answers hurt more than hints, and unanswered questions on timeout count as wrong, so letting the clock run out is never the safe option.

At the end of each session you get a summary: your score, your streak, and a review of every letter you got wrong. You leave knowing exactly what to practice next time.

The app ships in English and Polish, making it practical for both international users following NATO standard and Polish speakers learning their native phonetic system.

## Stack

- React 18
- Vite 5
- Vitest + Testing Library

## Features

- Two alphabets: `nato` and `polish`
- Two answer modes: typed and multiple choice
- Setup flow:
  1. choose alphabet
  2. choose mode
  3. choose time limit (`no limit`, `1`, `3`, `5` min)
- UI language selection: English / Polish
- Session summary with streaks and mistake review
- Per-alphabet high score persisted in `localStorage`

## Scoring

Each alphabet tracks its own high score independently, stored locally in the browser, so NATO and Polish progress never interfere with each other.

Final score:

`score = (correct * 100) - (wrong * 40) - (hints * 25) - timePenalty`

Time penalty:

`timePenalty = floor(totalSeconds / 10) * 5`

Rules:

- unanswered questions (on timeout) count as wrong
- score is clamped to a minimum of `0`
- high score is tracked separately for `nato` and `polish`

## Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Preview production build:

```bash
npm run preview
```

## Deployment

GitHub Pages deployment is configured via:

- `homepage`: `https://piotrkacala.github.io/phonetic/`
- Vite base path: `/phonetic/`

Deploy command:

```bash
npm run deploy
```

This publishes the `dist/` directory using `gh-pages`.

## Release

- Current version: `1.0.0`
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
- Release process: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

## License

GPL-3.0-only