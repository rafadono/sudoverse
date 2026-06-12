import { Arrow, Cage, Position, SandwichClues, VariantType } from '../types/sudoku';
import { isSafeMove } from './validators';

function findEmpty(board: number[][]): [number, number] | null {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function shuffledDigits(): number[] {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

    const empty = findEmpty(board);
    if (!empty) return true;

    const [row, col] = empty;
    const candidates = shuffledDigits();

    for (const n of candidates) {
      if (
        isSafeMove(
          board,
          row,
          col,
          n,
          variant,
          cages,
          jigsawRegions,
          sandwichClues,
          thermometers,
          arrows
        )
      ) {
        board[row][col] = n;
        if (solve()) return true;
        board[row][col] = 0;
      }
    }

    return false;
  }

  return solve();
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
  let total = 0;
  let steps = 0;
  const maxSteps = 2500;

  function search(): void {
    steps += 1;
    if (steps > maxSteps || total >= limit) return;

    const empty = findEmpty(board);
    if (!empty) {
      total += 1;
      return;
    }

    const [row, col] = empty;
    for (let n = 1; n <= 9; n += 1) {
      if (
        isSafeMove(
          board,
          row,
          col,
          n,
          variant,
          cages,
          jigsawRegions,
          sandwichClues,
          thermometers,
          arrows
        )
      ) {
        board[row][col] = n;
        search();
        board[row][col] = 0;
      }
    }
  }

  search();
  return total;
}
