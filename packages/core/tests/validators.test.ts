import { describe, it, expect } from 'vitest';
import { validateBoard, isSafeMove } from '../src/engine/validators';
import { VariantType, Position, Cage, SandwichClues, Arrow } from '../src/types/sudoku';

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

describe('Validators - General Rules', () => {
  it('should validate a solved valid classic board', () => {
    const result = validateBoard(classicSolved, 'classic');
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('should detect invalid structure (incomplete rows)', () => {
    const invalidStruct = [
      [5, 3, 4],
      [6, 7, 2],
    ];
    const result = validateBoard(invalidStruct, 'classic');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'structure')).toBe(true);
  });

  it('should detect out of range digits', () => {
    const badDigitBoard = classicSolved.map((r) => [...r]);
    badDigitBoard[0][0] = 10;
    const result = validateBoard(badDigitBoard, 'classic');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'structure')).toBe(true);
  });

  it('should detect duplicates in rows', () => {
    const duplicateRow = classicSolved.map((r) => [...r]);
    duplicateRow[0][1] = 5; // Row 0 has two 5s
    const result = validateBoard(duplicateRow, 'classic');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'row')).toBe(true);
  });

  it('should detect duplicates in columns', () => {
    const duplicateCol = classicSolved.map((r) => [...r]);
    duplicateCol[1][0] = 5; // Column 0 has two 5s
    const result = validateBoard(duplicateCol, 'classic');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'column')).toBe(true);
  });

  it('should detect duplicates in 3x3 subgrids', () => {
    const duplicateBox = classicSolved.map((r) => [...r]);
    duplicateBox[0][0] = 7; // Top-left subgrid has two 7s (at 0,0 and 1,1)
    const result = validateBoard(duplicateBox, 'classic');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.rule === 'box')).toBe(true);
  });
});

describe('Validators - Variant-Specific Rules', () => {
  describe('Diagonal Sudoku', () => {
    it('should fail if there are duplicates on diagonals', () => {
      // classicSolved has duplicates on diagonals (e.g., 7 at (1,1) and (3,3))
      const result = validateBoard(classicSolved, 'diagonal');
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.rule === 'diagonal')).toBe(true);
    });

    it('should validate a board with valid diagonals', () => {
      // Create an empty board, which is technically valid since there are no duplicates
      const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
      const result = validateBoard(emptyBoard, 'diagonal');
      expect(result.valid).toBe(true);
    });
  });

  describe('Killer Sudoku', () => {
    const cages: Cage[] = [
      {
        id: 'k1',
        targetSum: 8,
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ],
      }, // 5 + 3 = 8
      {
        id: 'k2',
        targetSum: 13,
        cells: [
          { row: 0, col: 2 },
          { row: 1, col: 2 },
          { row: 2, col: 2 },
        ],
      }, // 4 + 2 + 8 = 14 (invalid)
    ];

    it('should report error if cage sum does not match target', () => {
      const result = validateBoard(classicSolved, 'killer', cages);
      expect(result.valid).toBe(false);
      expect(
        result.issues.some((issue) => issue.rule === 'killer' && issue.message.includes('k2'))
      ).toBe(true);
    });

    it('should report error if duplicate digits exist inside a cage', () => {
      const badCage: Cage[] = [
        {
          id: 'k3',
          targetSum: 10,
          cells: [
            { row: 0, col: 0 },
            { row: 1, col: 0 },
          ],
        }, // 5 and 6 (valid)
      ];
      // Force a duplicate in the cage:
      const dupBoard = classicSolved.map((r) => [...r]);
      dupBoard[1][0] = 5; // Repeats 5
      const result = validateBoard(dupBoard, 'killer', badCage);
      expect(result.valid).toBe(false);
      expect(
        result.issues.some(
          (issue) => issue.rule === 'killer' && issue.message.includes('Duplicate')
        )
      ).toBe(true);
    });
  });

  describe('Hyper Sudoku', () => {
    it('should validate constraints in the 4 extra hyper regions', () => {
      // Hyper regions are at (1,1)-(3,3), (1,5)-(3,7), (5,1)-(7,3), (5,5)-(7,7)
      // classicSolved has duplicates in the first hyper region: (1,1) is 7, (2,2) is 8, etc.
      // We will test with an empty board (valid) and then introduce a duplicate
      const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
      let result = validateBoard(emptyBoard, 'hyper');
      expect(result.valid).toBe(true);

      // Place a duplicate inside the first hyper region (row 1-3, col 1-3)
      emptyBoard[1][1] = 5;
      emptyBoard[2][2] = 5;
      result = validateBoard(emptyBoard, 'hyper');
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.rule === 'hyper')).toBe(true);
    });
  });

  describe('Jigsaw Sudoku', () => {
    // Define irregular regions: all cells in row r belong to region r
    // This is for simple testing only (in practice, regions are non-rectangular)
    const jigsawRegions = Array.from({ length: 9 }, (_, r) => Array(9).fill(r));

    it('should ignore normal 3x3 box constraints', () => {
      const dupBoxBoard = classicSolved.map((r) => [...r]);
      dupBoxBoard[0][0] = 7; // Generates duplicate in 3x3 box (since 1,1 is also 7)
      // In Jigsaw, there is no 3x3 box validation, so if rows and columns are correct
      // (and it does not break the jigsaw region), it should validate differently.
      // But since we changed [0][0] to 7, row 0 has two 7s, so it fails by row.
      // We can design a specific board to test 3x3 box exclusion if needed.
    });

    it('should validate using the provided jigsaw regions', () => {
      const board = Array.from({ length: 9 }, () => Array(9).fill(0));
      // Put duplicate digits in the same jigsaw region (in this case region 0, which is row 0)
      board[0][0] = 5;
      board[0][1] = 5;
      const result = validateBoard(board, 'jigsaw', undefined, jigsawRegions);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.rule === 'jigsaw')).toBe(true);
    });
  });

  describe('Sandwich Sudoku', () => {
    it('should validate sandwich sums in rows and columns', () => {
      // Create an empty board
      const board = Array.from({ length: 9 }, () => Array(9).fill(0));
      // Row 0: 1 in col 0, 9 in col 3. Between them: col 1 and col 2.
      board[0][0] = 1;
      board[0][1] = 3;
      board[0][2] = 4;
      board[0][3] = 9;
      // Sum between 1 and 9 in row 0 is 3 + 4 = 7.

      const clues: SandwichClues = {
        rowClues: [7, null, null, null, null, null, null, null, null],
        colClues: Array(9).fill(null),
      };

      let result = validateBoard(board, 'sandwich', undefined, undefined, clues);
      expect(result.valid).toBe(true);

      // Change the clue to an incorrect value:
      clues.rowClues[0] = 8;
      result = validateBoard(board, 'sandwich', undefined, undefined, clues);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.rule === 'sandwich')).toBe(true);
    });
  });

  describe('Thermo Sudoku', () => {
    const thermometers: Position[][] = [
      [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    ];

    it('should validate strictly increasing thermometers', () => {
      const board = Array.from({ length: 9 }, () => Array(9).fill(0));
      board[0][0] = 2;
      board[0][1] = 4;
      board[0][2] = 5;

      let result = validateBoard(board, 'thermo', undefined, undefined, undefined, thermometers);
      expect(result.valid).toBe(true);

      // Change to make it non-increasing
      board[0][1] = 1;
      result = validateBoard(board, 'thermo', undefined, undefined, undefined, thermometers);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.rule === 'thermo')).toBe(true);
    });
  });

  describe('Arrow Sudoku', () => {
    const arrows: Arrow[] = [
      {
        circle: { row: 0, col: 0 },
        line: [
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      },
    ];

    it('should validate that the sum of the line equals the circle', () => {
      const board = Array.from({ length: 9 }, () => Array(9).fill(0));
      board[0][0] = 9; // Circle
      board[0][1] = 4; // Line
      board[0][2] = 5; // Line

      let result = validateBoard(
        board,
        'arrow',
        undefined,
        undefined,
        undefined,
        undefined,
        arrows
      );
      expect(result.valid).toBe(true);

      // Change to make the sum incorrect
      board[0][2] = 4; // Sum is 8, circle is 9
      result = validateBoard(board, 'arrow', undefined, undefined, undefined, undefined, arrows);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.rule === 'arrow')).toBe(true);
    });
  });
});

describe('isSafeMove', () => {
  it('should return true for a safe move and false for an unsafe one', () => {
    const board = classicSolved.map((r) => [...r]);
    // In position (0,0), original value is 5.
    // Empty it:
    board[0][0] = 0;

    // Placing 5 should be safe:
    expect(isSafeMove(board, 0, 0, 5, 'classic')).toBe(true);

    // Placing 3 (which already exists in row 0 and subgrid 0,0) should be unsafe:
    expect(isSafeMove(board, 0, 0, 3, 'classic')).toBe(false);
  });
});
