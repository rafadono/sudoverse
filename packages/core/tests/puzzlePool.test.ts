import { describe, it, expect } from 'vitest';
import { puzzlePoolManager } from '../src/generator/puzzlePool';

describe('PuzzlePoolManager', () => {
  it('should deliver a puzzle instantly for classic variant', () => {
    const puzzle = puzzlePoolManager.getPuzzle('classic', 'easy');
    expect(puzzle).toBeDefined();
    expect(puzzle.variant).toBe('classic');
    expect(puzzle.givens).toHaveLength(9);
  });

  it('should prewarm pool and deliver pre-cached puzzles without errors', async () => {
    puzzlePoolManager.prewarmPool(['killer', 'jigsaw'], 'medium');
    // Wait brief time for async background generation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const p1 = puzzlePoolManager.getPuzzle('killer', 'medium');
    const p2 = puzzlePoolManager.getPuzzle('jigsaw', 'medium');

    expect(p1.variant).toBe('killer');
    expect(p2.variant).toBe('jigsaw');
  });
});
