import type { Difficulty, Puzzle, VariantType } from '@sudoku/core';

export type PuzzleWorkerRequest =
  | { type: 'getPuzzle'; requestId: number; variant: VariantType; difficulty: Difficulty }
  | { type: 'prewarm' };

export interface PuzzleWorkerResponse {
  requestId: number;
  puzzle: Puzzle;
}
