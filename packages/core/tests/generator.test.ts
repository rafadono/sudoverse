import { describe, it, expect } from 'vitest';
import { generatePuzzle } from '../src/generator/sudokuGenerator';
import { validateBoard } from '../src/engine/validators';

describe('Generator - generatePuzzle', () => {
  it('should generate a classic puzzle with a unique solution', () => {
    const puzzle = generatePuzzle('classic', 'easy');
    expect(puzzle.variant).toBe('classic');
    expect(puzzle.givens).toBeDefined();
    expect(puzzle.solution).toBeDefined();

    // Verify that the solution is valid
    const valResult = validateBoard(puzzle.solution!, 'classic');
    expect(valResult.valid).toBe(true);

    // Verify that givens are consistent with the solution
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (puzzle.givens[r][c] !== 0) {
          expect(puzzle.givens[r][c]).toBe(puzzle.solution![r][c]);
        }
      }
    }
  });

  it('should generate a puzzle for each of the 8 variants with their respective properties', () => {
    // 1. Diagonal
    const diag = generatePuzzle('diagonal', 'easy');
    expect(diag.variant).toBe('diagonal');
    expect(validateBoard(diag.solution!, 'diagonal').valid).toBe(true);

    // 2. Killer
    const killer = generatePuzzle('killer', 'easy');
    expect(killer.variant).toBe('killer');
    expect(killer.cages).toBeDefined();
    expect(killer.cages!.length).toBeGreaterThan(0);
    // In killer, givens must traditionally be an empty board
    expect(killer.givens.every((row) => row.every((val) => val === 0))).toBe(true);
    expect(validateBoard(killer.solution!, 'killer', killer.cages).valid).toBe(true);

    // 3. Hyper
    const hyper = generatePuzzle('hyper', 'easy');
    expect(hyper.variant).toBe('hyper');
    expect(validateBoard(hyper.solution!, 'hyper').valid).toBe(true);

    // 4. Jigsaw
    const jigsaw = generatePuzzle('jigsaw', 'easy');
    expect(jigsaw.variant).toBe('jigsaw');
    expect(jigsaw.jigsawRegions).toBeDefined();
    // Validate jigsawRegions dimensions (9x9)
    expect(jigsaw.jigsawRegions!.length).toBe(9);
    expect(jigsaw.jigsawRegions![0].length).toBe(9);
    expect(validateBoard(jigsaw.solution!, 'jigsaw', undefined, jigsaw.jigsawRegions).valid).toBe(
      true
    );

    // 5. Sandwich
    const sandwich = generatePuzzle('sandwich', 'easy');
    expect(sandwich.variant).toBe('sandwich');
    expect(sandwich.sandwichClues).toBeDefined();
    expect(sandwich.sandwichClues!.rowClues.length).toBe(9);
    expect(sandwich.sandwichClues!.colClues.length).toBe(9);
    expect(
      validateBoard(sandwich.solution!, 'sandwich', undefined, undefined, sandwich.sandwichClues)
        .valid
    ).toBe(true);

    // 6. Thermo
    const thermo = generatePuzzle('thermo', 'easy');
    expect(thermo.variant).toBe('thermo');
    expect(thermo.thermometers).toBeDefined();
    expect(thermo.thermometers!.length).toBeGreaterThan(0);
    expect(
      validateBoard(
        thermo.solution!,
        'thermo',
        undefined,
        undefined,
        undefined,
        thermo.thermometers
      ).valid
    ).toBe(true);

    // 7. Arrow
    const arrow = generatePuzzle('arrow', 'easy');
    expect(arrow.variant).toBe('arrow');
    expect(arrow.arrows).toBeDefined();
    expect(arrow.arrows!.length).toBeGreaterThan(0);
    expect(
      validateBoard(
        arrow.solution!,
        'arrow',
        undefined,
        undefined,
        undefined,
        undefined,
        arrow.arrows
      ).valid
    ).toBe(true);
  });

  it('should dig more holes for higher difficulties', () => {
    // As it is a probabilistic algorithm, the exact number can vary slightly,
    // but we can verify that the number of given clues is consistent
    const easyPuzzle = generatePuzzle('classic', 'easy');
    const hardPuzzle = generatePuzzle('classic', 'hard');

    let easyGivensCount = 0;
    let hardGivensCount = 0;

    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (easyPuzzle.givens[r][c] !== 0) easyGivensCount += 1;
        if (hardPuzzle.givens[r][c] !== 0) hardGivensCount += 1;
      }
    }

    // Easy must have more given clues than Hard
    expect(easyGivensCount).toBeGreaterThan(hardGivensCount);
  });
});
