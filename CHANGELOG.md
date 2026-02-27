# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-02-26

### Added

- 3-step setup flow (alphabet, mode, time limit with `no limit`).
- Scoring system with weighted penalties and time penalty.
- Per-alphabet high score persistence (`nato`, `polish`).
- Error boundary for runtime failure fallback UI.
- ESLint + Prettier + CI quality gates.

### Changed

- Migrated build and test stack from Create React App to Vite + Vitest.
- Refined multiple-choice UI for stronger visual hierarchy and feedback.
- Improved Polish distractor generation for diacritic-sensitive letters.

### Fixed

- Prevented setup step visual state leakage between runs.
- Removed layout jumps on hint and feedback rendering.
- Hardened localStorage read/write failure handling.

