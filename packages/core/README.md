# SudoVerse Core Engine (`@sudoku/core`)

This package houses the shared logic, solver, puzzle generators, and rule validation engine for **SudoVerse**. It is a pure, framework-agnostic TypeScript library designed to be consumed by web, desktop, and mobile frontends.

## Features

- **8 Game Variants**: Implementation of specific logic constraints for Classic, Diagonal (X), Killer, Hyper (Windoku), Jigsaw (Irregular), Sandwich, Thermo, and Arrow Sudokus.
- **Backtracking Solver**: High-performance solver with candidate analysis and search step limits.
- **Procedural Generator**: Custom algorithms (including irregular region partitioning via flood-fill and pathfinding for thermometers/arrows) to generate valid puzzles with unique solutions.
- **Dynamic Validator**: Rules verification engine returning comprehensive diagnostic reports, mapping out conflicting coordinates.
- **Internalization Support (i18n)**: Fully localized board validation diagnostics and terminology in both English and Spanish.

## Architecture

- **`src/types/sudoku.ts`**: Common interfaces for game objects, cages, sandwich clues, thermometers, and validation outputs.
- **`src/engine/validators.ts`**: Constraint-satisfaction logic checking all active variant rules.
- **`src/engine/solver.ts`**: Solutions counter and solving engine.
- **`src/generator/`**: Specialized engines creating empty and solved boards dynamically.
- **`src/variants/catalog.ts`**: Metadata detailing individual game variations.
- **`src/i18n/`**: Shared dictionary and translation helpers.

## Development

### Running Typechecks

To check typings across files:

```bash
npm run typecheck
```

### Running Tests

To run the Vitest test suite:

```bash
npm run test
```
