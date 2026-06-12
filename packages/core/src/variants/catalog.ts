import { Puzzle } from '../types/sudoku';

const CLASSIC_SOLUTION = [
  [4, 3, 5, 2, 6, 9, 7, 8, 1],
  [6, 8, 2, 5, 7, 1, 4, 9, 3],
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9],
];

function buildKillerCagesFromSolution(solution: number[][]) {
  const cages: Puzzle['cages'] = [];
  let id = 1;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 2) {
      if (col === 8) {
        const value = solution[row][col];
        cages.push({
          id: `K${id++}`,
          targetSum: value,
          cells: [{ row, col }],
        });
      } else {
        const a = solution[row][col];
        const b = solution[row][col + 1];
        cages.push({
          id: `K${id++}`,
          targetSum: a + b,
          cells: [
            { row, col },
            { row, col: col + 1 },
          ],
        });
      }
    }
  }

  return cages;
}

export const PUZZLE_CATALOG: Puzzle[] = [
  {
    id: 'classic-starter',
    variant: 'classic',
    givens: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: CLASSIC_SOLUTION,
  },
  {
    id: 'hyper-starter',
    variant: 'hyper',
    givens: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'jigsaw-starter',
    variant: 'jigsaw',
    givens: Array.from({ length: 9 }, () => Array(9).fill(0)),
    jigsawRegions: [
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 3, 1, 1, 4, 2, 2, 5],
      [0, 3, 3, 1, 4, 4, 2, 5, 5],
      [0, 3, 6, 6, 4, 7, 7, 5, 5],
      [3, 3, 6, 6, 4, 7, 7, 8, 5],
      [3, 6, 6, 6, 4, 7, 8, 8, 8],
      [3, 6, 1, 4, 4, 7, 8, 8, 2],
      [1, 1, 1, 4, 7, 7, 8, 2, 2],
      [1, 1, 7, 7, 7, 8, 8, 2, 2],
    ],
  },
  {
    id: 'sandwich-starter',
    variant: 'sandwich',
    givens: Array.from({ length: 9 }, () => Array(9).fill(0)),
    sandwichClues: {
      rowClues: [35, 0, 8, 15, 20, 5, 12, 0, 19],
      colClues: [12, 18, 0, 26, 15, 6, 9, 30, 0],
    },
  },
  {
    id: 'thermo-starter',
    variant: 'thermo',
    givens: Array.from({ length: 9 }, () => Array(9).fill(0)),
    thermometers: [
      [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
      ],
      [
        { row: 5, col: 5 },
        { row: 6, col: 5 },
        { row: 6, col: 6 },
        { row: 7, col: 6 },
      ],
    ],
  },
  {
    id: 'arrow-starter',
    variant: 'arrow',
    givens: Array.from({ length: 9 }, () => Array(9).fill(0)),
    arrows: [
      {
        circle: { row: 0, col: 0 },
        line: [
          { row: 0, col: 1 },
          { row: 1, col: 1 },
        ],
      },
      {
        circle: { row: 4, col: 4 },
        line: [
          { row: 4, col: 5 },
          { row: 5, col: 5 },
          { row: 5, col: 4 },
        ],
      },
    ],
  },
];

export function getPuzzleByVariant(variant: Puzzle['variant']): Puzzle {
  const found = PUZZLE_CATALOG.find((p) => p.variant === variant);
  if (!found) throw new Error(`No puzzle found for variant: ${variant}`);

  return {
    ...found,
    givens: found.givens.map((row) => [...row]),
    solution: found.solution?.map((row) => [...row]),
    cages: found.cages?.map((cage) => ({
      ...cage,
      cells: cage.cells.map((cell) => ({ ...cell })),
    })),
    jigsawRegions: found.jigsawRegions?.map((row) => [...row]),
    sandwichClues: found.sandwichClues
      ? {
          rowClues: [...found.sandwichClues.rowClues],
          colClues: [...found.sandwichClues.colClues],
        }
      : undefined,
    thermometers: found.thermometers?.map((path) => path.map((cell) => ({ ...cell }))),
    arrows: found.arrows?.map((arrow) => ({
      circle: { ...arrow.circle },
      line: arrow.line.map((cell) => ({ ...cell })),
    })),
  };
}
