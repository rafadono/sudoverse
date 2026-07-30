import { Difficulty, Puzzle, VariantType } from '../types/sudoku';
import { generatePuzzle } from './sudokuGenerator';

const ALL_VARIANTS: VariantType[] = [
  'classic',
  'diagonal',
  'killer',
  'hyper',
  'jigsaw',
  'sandwich',
  'thermo',
  'arrow',
];

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

class PuzzlePool {
  private pool: Map<string, Puzzle[]> = new Map();
  private generating: Set<string> = new Set();

  private makeKey(variant: VariantType, difficulty: Difficulty): string {
    return `${variant}:${difficulty}`;
  }

  /**
   * Returns a puzzle instantly from the pre-generated pool if available,
   * otherwise generates one synchronously and triggers background pre-refill.
   */
  public getPuzzle(variant: VariantType, difficulty: Difficulty = 'medium'): Puzzle {
    const key = this.makeKey(variant, difficulty);
    const list = this.pool.get(key);

    let puzzle: Puzzle;

    if (list && list.length > 0) {
      puzzle = list.shift()!;
    } else {
      puzzle = generatePuzzle(variant, difficulty);
    }

    // Trigger background generation for the next puzzle in this variant/difficulty
    this.enqueueBackgroundRefill(variant, difficulty);

    return puzzle;
  }

  /**
   * Pre-warms the pool asynchronously for all combinations of variants and difficulties.
   */
  public prewarmPool(
    variants: VariantType[] = ALL_VARIANTS,
    difficulties: Difficulty | Difficulty[] = ALL_DIFFICULTIES
  ): void {
    const diffList: Difficulty[] = Array.isArray(difficulties) ? difficulties : [difficulties];
    let delay = 10;
    variants.forEach((variant) => {
      diffList.forEach((difficulty) => {
        setTimeout(() => {
          this.enqueueBackgroundRefill(variant, difficulty);
        }, delay);
        delay += 50;
      });
    });
  }

  private enqueueBackgroundRefill(variant: VariantType, difficulty: Difficulty): void {
    const key = this.makeKey(variant, difficulty);
    const list = this.pool.get(key) || [];

    // Keep up to 2 pre-generated puzzles in pool per (variant, difficulty)
    if (list.length >= 2 || this.generating.has(key)) return;

    this.generating.add(key);

    setTimeout(() => {
      try {
        const newPuzzle = generatePuzzle(variant, difficulty);
        const current = this.pool.get(key) || [];
        current.push(newPuzzle);
        this.pool.set(key, current);
      } catch (err) {
        console.error(`Failed background puzzle generation for ${key}:`, err);
      } finally {
        this.generating.delete(key);
      }
    }, 10);
  }
}

export const puzzlePoolManager = new PuzzlePool();
