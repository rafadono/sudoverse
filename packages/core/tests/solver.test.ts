import { describe, it, expect } from 'vitest';
import { solveBoard, countSolutions } from '../src/engine/solver';
import { validateBoard } from '../src/engine/validators';

const classicSolved = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

describe('Solver - solveBoard & countSolutions', () => {
  it('should solve a partially empty classic board', () => {
    // Take the solved board and empty some cells
    const board = classicSolved.map((r) => [...r]);
    board[0][0] = 0;
    board[1][1] = 0;
    board[4][4] = 0;
    board[8][8] = 0;

    const success = solveBoard(board, 'classic');
    expect(success).toBe(true);

    // The solved board must be valid
    const validation = validateBoard(board, 'classic');
    expect(validation.valid).toBe(true);
  });

  it('should return false for an impossible board', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    // Impossible configuration: two 5s in the same row/column
    board[0][0] = 5;
    board[0][1] = 5;

    const success = solveBoard(board, 'classic');
    expect(success).toBe(false);
  });

  it('should count multiple solutions on a board with few numbers', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    // Empty board has many solutions
    const count = countSolutions(
      board,
      'classic',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      2
    );
    expect(count).toBe(2); // Returns the limit
  });

  it('should count exactly 1 solution for a nearly complete board with a unique solution', () => {
    const board = classicSolved.map((r) => [...r]);
    board[0][0] = 0; // Only one digit missing, unique solution

    const count = countSolutions(
      board,
      'classic',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      2
    );
    expect(count).toBe(1);
  });

  it('should count 0 solutions for a board with no possible solution', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    board[0][0] = 5;
    board[0][1] = 5; // Direct conflict

    const count = countSolutions(
      board,
      'classic',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      2
    );
    expect(count).toBe(0);
  });
});
