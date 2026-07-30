# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-07-30

### Added

- Desktop app (Tauri/Rust) for Linux (AppImage, .deb, .rpm, Flathub, Snap Store) and Windows (NSIS/MSI, no store).
- PWA support for the web client (installable, offline-capable via service worker).
- MIT license.

### Changed

- `isSafeMove` now validates only the row/column/region/variant constraints touching the placed cell instead of re-validating the entire board, drastically speeding up the solver and generator.
- `SudokuBoard`, `NumberPad`, and `VariantSelector` are memoized to avoid re-rendering the whole board every timer tick.
- `App.tsx` game logic extracted into `useGameTimer`, `usePuzzleRecord`, and `useKeyboardControls` hooks.

### Fixed

- `generatePuzzle` no longer silently produces under-filled boards when the solution-counting search hits its step budget; it now logs and treats the result as unverified.
- `generateArrows` could occasionally produce zero arrows for the Arrow variant due to a limited random-sampling search; it now scans all eligible cells.

## [0.1.0] - 2026-06-15

### Added

- Initial monorepo: shared `@sudoku/core` engine, Web (React/Vite) client, and Mobile (Expo/React Native) client.
- 8 Sudoku variants: Classic, Diagonal, Killer, Hyper, Jigsaw, Sandwich, Thermo, Arrow.
- English and Spanish localization.
