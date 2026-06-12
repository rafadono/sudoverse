import { countSolutions, solveBoard } from '../engine/solver';
import { Difficulty } from '../types/sudoku';

function emptyBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function holesByDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 38;
    case 'medium':
      return 48;
    case 'hard':
      return 54;
    default:
      return 48;
  }
}

function randomCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      cells.push([r, c]);
    }
  }

  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  return cells;
}

export function generateClassicPuzzle(difficulty: Difficulty = 'medium'): {
  givens: number[][];
  solution: number[][];
} {
  const solution = emptyBoard();
  solveBoard(solution, 'classic');

  const givens = solution.map((row) => [...row]);
  const targets = holesByDifficulty(difficulty);
  let removed = 0;

  for (const [r, c] of randomCells()) {
    if (removed >= targets) break;
    const backup = givens[r][c];
    givens[r][c] = 0;

    const clone = givens.map((row) => [...row]);
    const solutionCount = countSolutions(
      clone,
      'classic',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      2
    );

    if (solutionCount !== 1) {
      givens[r][c] = backup;
    } else {
      removed += 1;
    }
  }

  return { givens, solution };
}
