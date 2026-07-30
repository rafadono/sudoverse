import { Arrow, Cage, Position, SandwichClues, VariantType } from '../types/sudoku';
import { isSafeMove } from './validators';
import { shuffleArray } from './random';

/**
 * Finds the empty cell with Minimum Remaining Values (MRV heuristic).
 * This prunes invalid search branches much faster than linear scanning.
 */
function findEmptyMRV(
  board: number[][],
  variant: VariantType,
  cages?: Cage[],
  jigsawRegions?: number[][],
  sandwichClues?: SandwichClues,
  thermometers?: Position[][],
  arrows?: Arrow[]
): [number, number, number[]] | null {
  let minCandidates: number[] | null = null;
  let bestPos: [number, number] | null = null;

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] === 0) {
        const candidates: number[] = [];
        for (let n = 1; n <= 9; n += 1) {
          if (
            isSafeMove(
              board,
              r,
              c,
              n,
              variant,
              cages,
              jigsawRegions,
              sandwichClues,
              thermometers,
              arrows
            )
          ) {
            candidates.push(n);
          }
        }

        // Dead end: no valid candidate for this cell!
        if (candidates.length === 0) {
          return [r, c, []];
        }

        if (minCandidates === null || candidates.length < minCandidates.length) {
          minCandidates = candidates;
          bestPos = [r, c];
          if (minCandidates.length === 1) {
            return [bestPos[0], bestPos[1], minCandidates];
          }
        }
      }
    }
  }

  if (!bestPos || !minCandidates) return null;
  return [bestPos[0], bestPos[1], minCandidates];
}

export function solveBoard(
  board: number[][],
  variant: VariantType,
  cages?: Cage[],
  jigsawRegions?: number[][],
  sandwichClues?: SandwichClues,
  thermometers?: Position[][],
  arrows?: Arrow[]
): boolean {
  let steps = 0;
  const maxSteps = 5000;

  function solve(): boolean {
    steps += 1;
    if (steps > maxSteps) return false;

    const empty = findEmptyMRV(
      board,
      variant,
      cages,
      jigsawRegions,
      sandwichClues,
      thermometers,
      arrows
    );
    if (!empty) return true;

    const [row, col, candidates] = empty;
    if (candidates.length === 0) return false;

    const randomizedCandidates = shuffleArray(candidates);

    for (const n of randomizedCandidates) {
      board[row][col] = n;
      if (solve()) return true;
      board[row][col] = 0;
    }

    return false;
  }

  return solve();
}

export interface SolutionCount {
  count: number;
  /** True if the search hit the step budget before it could fully determine the count. */
  truncated: boolean;
}

/**
 * Same search as `countSolutions`, but also reports whether the step budget was
 * exhausted before the search could finish — `count` is unreliable when `truncated`
 * is true, since the search may have stopped short of exploring every branch.
 */
export function countSolutionsDetailed(
  board: number[][],
  variant: VariantType,
  cages?: Cage[],
  jigsawRegions?: number[][],
  sandwichClues?: SandwichClues,
  thermometers?: Position[][],
  arrows?: Arrow[],
  limit = 2,
  maxSteps = 2500
): SolutionCount {
  let total = 0;
  let steps = 0;
  let truncated = false;

  function search(): void {
    steps += 1;
    if (steps > maxSteps) {
      truncated = true;
      return;
    }
    if (total >= limit) return;

    const empty = findEmptyMRV(
      board,
      variant,
      cages,
      jigsawRegions,
      sandwichClues,
      thermometers,
      arrows
    );
    if (!empty) {
      total += 1;
      return;
    }

    const [row, col, candidates] = empty;
    if (candidates.length === 0) return;

    for (const n of candidates) {
      board[row][col] = n;
      search();
      board[row][col] = 0;
      if (truncated) return;
    }
  }

  search();
  return { count: total, truncated };
}

export function countSolutions(
  board: number[][],
  variant: VariantType,
  cages?: Cage[],
  jigsawRegions?: number[][],
  sandwichClues?: SandwichClues,
  thermometers?: Position[][],
  arrows?: Arrow[],
  limit = 2
): number {
  return countSolutionsDetailed(
    board,
    variant,
    cages,
    jigsawRegions,
    sandwichClues,
    thermometers,
    arrows,
    limit
  ).count;
}
