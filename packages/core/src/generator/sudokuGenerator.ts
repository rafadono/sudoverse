import { solveBoard, countSolutions } from '../engine/solver';
import {
  Arrow,
  Cage,
  Position,
  SandwichClues,
  VariantType,
  Difficulty,
  Puzzle,
} from '../types/sudoku';

function emptyBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function holesByDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 35;
    case 'medium':
      return 45;
    case 'hard':
      return 52;
    default:
      return 45;
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

const JIGSAW_TEMPLATES = [
  [
    [4, 4, 4, 5, 5, 5, 5, 5, 8],
    [4, 4, 4, 5, 2, 5, 5, 5, 8],
    [4, 0, 4, 2, 2, 2, 8, 8, 8],
    [4, 0, 0, 2, 2, 2, 8, 8, 8],
    [0, 0, 0, 2, 2, 1, 1, 1, 8],
    [0, 0, 0, 6, 6, 6, 1, 3, 3],
    [7, 7, 7, 6, 1, 1, 1, 1, 3],
    [7, 7, 7, 6, 6, 1, 3, 3, 3],
    [7, 7, 7, 6, 6, 6, 3, 3, 3],
  ],
  [
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [3, 3, 3, 4, 4, 4, 5, 5, 5],
    [3, 3, 3, 4, 4, 4, 5, 5, 5],
    [3, 3, 3, 4, 4, 4, 5, 5, 5],
    [6, 6, 6, 7, 7, 7, 8, 8, 8],
    [6, 6, 6, 7, 7, 7, 8, 8, 8],
    [6, 6, 6, 7, 7, 7, 8, 8, 8],
  ],
];

function generateJigsawRegions(): number[][] {
  const template = JIGSAW_TEMPLATES[Math.floor(Math.random() * JIGSAW_TEMPLATES.length)];
  return template.map((row) => [...row]);
}

// Generate Sandwich Clues (sums between 1 and 9)
function generateSandwichClues(solution: number[][]): SandwichClues {
  const rowClues = Array(9).fill(null);
  const colClues = Array(9).fill(null);

  for (let r = 0; r < 9; r += 1) {
    const idx1 = solution[r].indexOf(1);
    const idx9 = solution[r].indexOf(9);
    const start = Math.min(idx1, idx9) + 1;
    const end = Math.max(idx1, idx9);
    let sum = 0;
    for (let i = start; i < end; i += 1) {
      sum += solution[r][i];
    }
    rowClues[r] = sum;
  }

  for (let c = 0; c < 9; c += 1) {
    const colVals = Array.from({ length: 9 }, (_, r) => solution[r][c]);
    const idx1 = colVals.indexOf(1);
    const idx9 = colVals.indexOf(9);
    const start = Math.min(idx1, idx9) + 1;
    const end = Math.max(idx1, idx9);
    let sum = 0;
    for (let i = start; i < end; i += 1) {
      sum += colVals[i];
    }
    colClues[c] = sum;
  }

  return { rowClues, colClues };
}

// Generate increasing thermometers
function generateThermometers(solution: number[][]): Position[][] {
  const thermometers: Position[][] = [];
  const used = Array.from({ length: 9 }, () => Array(9).fill(false));

  for (let t = 0; t < 4; t += 1) {
    let startR = -1;
    let startC = -1;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (!used[r][c]) {
        startR = r;
        startC = c;
        break;
      }
    }
    if (startR === -1) continue;

    const path: Position[] = [{ row: startR, col: startC }];
    used[startR][startC] = true;

    const targetLen = 3 + Math.floor(Math.random() * 2); // 3 or 4
    let currR = startR;
    let currC = startC;

    for (let len = 1; len < targetLen; len += 1) {
      const currVal = solution[currR][currC];
      const nextCandidates: { r: number; c: number }[] = [];
      const neighbors = [
        { r: currR - 1, c: currC },
        { r: currR + 1, c: currC },
        { r: currR, c: currC - 1 },
        { r: currR, c: currC + 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < 9 && n.c >= 0 && n.c < 9 && !used[n.r][n.c]) {
          if (solution[n.r][n.c] > currVal) {
            nextCandidates.push(n);
          }
        }
      }

      if (nextCandidates.length > 0) {
        const next = nextCandidates[Math.floor(Math.random() * nextCandidates.length)];
        path.push({ row: next.r, col: next.c });
        used[next.r][next.c] = true;
        currR = next.r;
        currC = next.c;
      } else {
        break;
      }
    }

    if (path.length >= 2) {
      thermometers.push(path);
    }
  }

  return thermometers;
}

// Generate Arrows (circle sum = line digits)
function generateArrows(solution: number[][]): Arrow[] {
  const arrows: Arrow[] = [];
  const used = Array.from({ length: 9 }, () => Array(9).fill(false));

  for (let a = 0; a < 3; a += 1) {
    let circleR = -1;
    let circleC = -1;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const r = Math.floor(Math.random() * 8);
      const c = Math.floor(Math.random() * 8);
      const val = solution[r][c];
      if (!used[r][c] && val >= 3) {
        circleR = r;
        circleC = c;
        break;
      }
    }
    if (circleR === -1) continue;

    const circleVal = solution[circleR][circleC];
    let foundPath: Position[] | null = null;
    const pathUsed = Array.from({ length: 9 }, () => Array(9).fill(false));
    pathUsed[circleR][circleC] = true;

    function dfs(r: number, c: number, currentSum: number, path: Position[]): boolean {
      if (currentSum === circleVal) {
        foundPath = [...path];
        return true;
      }
      if (currentSum > circleVal || path.length >= 3) return false;

      const neighbors = [
        { r: r - 1, c },
        { r: r + 1, c },
        { r, c: c - 1 },
        { r, c: c + 1 },
      ];
      for (const n of neighbors) {
        if (n.r >= 0 && n.r < 9 && n.c >= 0 && n.c < 9 && !used[n.r][n.c] && !pathUsed[n.r][n.c]) {
          pathUsed[n.r][n.c] = true;
          const val = solution[n.r][n.c];
          path.push({ row: n.r, col: n.c });
          if (dfs(n.r, n.c, currentSum + val, path)) return true;
          path.pop();
          pathUsed[n.r][n.c] = false;
        }
      }
      return false;
    }

    if (dfs(circleR, circleC, 0, [])) {
      arrows.push({
        circle: { row: circleR, col: circleC },
        line: foundPath!,
      });
      used[circleR][circleC] = true;
      foundPath!.forEach((p) => {
        used[p.row][p.col] = true;
      });
    }
  }

  return arrows;
}

// Procedural cages generator for Killer Sudoku
function generateKillerCages(solution: number[][]): Cage[] {
  const cages: Cage[] = [];
  const visited = Array.from({ length: 9 }, () => Array(9).fill(false));
  let cageId = 1;

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (visited[r][c]) continue;

      const cageCells: Position[] = [{ row: r, col: c }];
      visited[r][c] = true;
      let targetSum = solution[r][c];

      // Try expanding cage to size 2 or 3
      const targetSize = 2 + Math.floor(Math.random() * 2); // 2 or 3
      let currR = r;
      let currC = c;

      for (let step = 1; step < targetSize; step += 1) {
        const neighbors = [
          { r: currR - 1, c: currC },
          { r: currR + 1, c: currC },
          { r: currR, c: currC - 1 },
          { r: currR, c: currC + 1 },
        ];

        const validNeighbors = neighbors.filter(
          (n) => n.r >= 0 && n.r < 9 && n.c >= 0 && n.c < 9 && !visited[n.r][n.c]
        );

        if (validNeighbors.length > 0) {
          const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
          // Ensure we don't repeat digits in the same cage
          const nextVal = solution[next.r][next.c];
          const hasDigit = cageCells.some((cell) => solution[cell.row][cell.col] === nextVal);

          if (!hasDigit) {
            cageCells.push({ row: next.r, col: next.c });
            visited[next.r][next.c] = true;
            targetSum += nextVal;
            currR = next.r;
            currC = next.c;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      cages.push({
        id: `K${cageId++}`,
        targetSum,
        cells: cageCells,
      });
    }
  }

  return cages;
}

export function generatePuzzle(variant: VariantType, difficulty: Difficulty = 'medium'): Puzzle {
  const solution = emptyBoard();

  // Step 1: Generate a fully solved board satisfying the variant constraints
  let cages: Cage[] | undefined;
  let jigsawRegions: number[][] | undefined;
  let sandwichClues: SandwichClues | undefined;
  let thermometers: Position[][] | undefined;
  let arrows: Arrow[] | undefined;

  if (variant === 'jigsaw') {
    jigsawRegions = generateJigsawRegions();
  }

  // Solve the board using empty board + current constraints
  let solved = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const tempBoard = emptyBoard();
    if (solveBoard(tempBoard, variant, undefined, jigsawRegions)) {
      for (let r = 0; r < 9; r += 1) {
        solution[r] = [...tempBoard[r]];
      }
      solved = true;
      break;
    }
  }

  if (!solved) {
    // Fallback: solve classic board
    solveBoard(solution, 'classic');
  }

  // Step 2: Build variant shapes from the solution
  if (variant === 'killer') {
    cages = generateKillerCages(solution);
  } else if (variant === 'sandwich') {
    sandwichClues = generateSandwichClues(solution);
  } else if (variant === 'thermo') {
    thermometers = generateThermometers(solution);
  } else if (variant === 'arrow') {
    arrows = generateArrows(solution);
  }

  // Step 3: Dig holes while preserving unique solution
  const givens = solution.map((row) => [...row]);

  if (variant === 'killer') {
    // Killer Sudoku is traditionally played with a blank board (all cages provide clues)
    const blankGivens = emptyBoard();
    return {
      id: `killer-${difficulty}-${Date.now()}`,
      variant: 'killer',
      givens: blankGivens,
      solution,
      cages,
    };
  }

  const targetHoles = holesByDifficulty(difficulty);
  let removed = 0;

  for (const [r, c] of randomCells()) {
    if (removed >= targetHoles) break;
    const backup = givens[r][c];
    givens[r][c] = 0;

    const clone = givens.map((row) => [...row]);
    const solCount = countSolutions(
      clone,
      variant,
      cages,
      jigsawRegions,
      sandwichClues,
      thermometers,
      arrows,
      2
    );

    if (solCount !== 1) {
      givens[r][c] = backup;
    } else {
      removed += 1;
    }
  }

  return {
    id: `${variant}-${difficulty}-${Date.now()}`,
    variant,
    givens,
    solution,
    cages,
    jigsawRegions,
    sandwichClues,
    thermometers,
    arrows,
  };
}
