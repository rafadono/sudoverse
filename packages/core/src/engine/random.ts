import { Position } from '../types/sudoku';

/** Fisher-Yates shuffle. Returns a new array, does not mutate the input. */
export function shuffleArray<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

/** The (up to 4) orthogonally adjacent cells of `pos` within a `size`x`size` grid. */
export function orthogonalNeighbors(pos: Position, size = 9): Position[] {
  const candidates = [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ];
  return candidates.filter((c) => c.row >= 0 && c.row < size && c.col >= 0 && c.col < size);
}

/** Every cell of a `size`x`size` grid, in random order. */
export function shuffledCells(size = 9): Position[] {
  const cells: Position[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      cells.push({ row, col });
    }
  }
  return shuffleArray(cells);
}
