import { solveBoard, countSolutionsDetailed } from '../engine/solver';
import { orthogonalNeighbors, shuffledCells } from '../engine/random';
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
  const SIZE = 9;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(-1));
    let success = true;

    for (let regId = 0; regId < SIZE - 1; regId += 1) {
      let start: Position | null = null;
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          if (grid[r][c] === -1) {
            start = { row: r, col: c };
            break;
          }
        }
        if (start) break;
      }

      if (!start) {
        success = false;
        break;
      }

      const regionCells: Position[] = [start];
      grid[start.row][start.col] = regId;
      let regionSuccess = false;

      for (let growAttempt = 0; growAttempt < 50; growAttempt += 1) {
        for (const cell of regionCells) {
          grid[cell.row][cell.col] = -1;
        }
        regionCells.length = 0;
        regionCells.push(start);
        grid[start.row][start.col] = regId;

        while (regionCells.length < SIZE) {
          const neighbors: Position[] = [];
          const seen = new Set<string>();

          for (const cell of regionCells) {
            for (const a of orthogonalNeighbors(cell, SIZE)) {
              if (grid[a.row][a.col] === -1) {
                const key = `${a.row}-${a.col}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  neighbors.push(a);
                }
              }
            }
          }

          if (neighbors.length === 0) break;
          const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
          grid[chosen.row][chosen.col] = regId;
          regionCells.push(chosen);
        }

        if (regionCells.length === SIZE) {
          regionSuccess = true;
          break;
        }
      }

      if (!regionSuccess) {
        success = false;
        break;
      }
    }

    if (success) {
      const lastCells: Position[] = [];
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          if (grid[r][c] === -1) {
            grid[r][c] = SIZE - 1;
            lastCells.push({ row: r, col: c });
          }
        }
      }

      if (lastCells.length === SIZE) {
        const visited = new Set<string>();
        const queue: Position[] = [lastCells[0]];
        visited.add(`${lastCells[0].row}-${lastCells[0].col}`);
        let count = 0;

        while (queue.length > 0) {
          const curr = queue.shift()!;
          count += 1;

          for (const a of orthogonalNeighbors(curr, SIZE)) {
            if (grid[a.row][a.col] === SIZE - 1) {
              const key = `${a.row}-${a.col}`;
              if (!visited.has(key)) {
                visited.add(key);
                queue.push(a);
              }
            }
          }
        }

        if (count === SIZE) {
          return grid;
        }
      }
    }
  }

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
    const startCell = shuffledCells().find((cell) => !used[cell.row][cell.col]);
    if (!startCell) continue;

    const path: Position[] = [startCell];
    used[startCell.row][startCell.col] = true;

    const targetLen = 3 + Math.floor(Math.random() * 2); // 3 or 4
    let curr = startCell;

    for (let len = 1; len < targetLen; len += 1) {
      const currVal = solution[curr.row][curr.col];
      const nextCandidates = orthogonalNeighbors(curr).filter(
        (n) => !used[n.row][n.col] && solution[n.row][n.col] > currVal
      );

      if (nextCandidates.length === 0) break;
      const next = nextCandidates[Math.floor(Math.random() * nextCandidates.length)];
      path.push(next);
      used[next.row][next.col] = true;
      curr = next;
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
    // Scan every eligible cell (shuffled) instead of a fixed number of random
    // guesses, so a valid circle is always found when one exists.
    const circleCell = shuffledCells(8).find(
      (cell) => !used[cell.row][cell.col] && solution[cell.row][cell.col] >= 3
    );
    if (!circleCell) continue;

    const circleVal = solution[circleCell.row][circleCell.col];
    let foundPath: Position[] | null = null;
    const pathUsed = Array.from({ length: 9 }, () => Array(9).fill(false));
    pathUsed[circleCell.row][circleCell.col] = true;

    function dfs(pos: Position, currentSum: number, path: Position[]): boolean {
      if (currentSum === circleVal) {
        foundPath = [...path];
        return true;
      }
      if (currentSum > circleVal || path.length >= 3) return false;

      for (const n of orthogonalNeighbors(pos)) {
        if (!used[n.row][n.col] && !pathUsed[n.row][n.col]) {
          pathUsed[n.row][n.col] = true;
          const val = solution[n.row][n.col];
          path.push(n);
          if (dfs(n, currentSum + val, path)) return true;
          path.pop();
          pathUsed[n.row][n.col] = false;
        }
      }
      return false;
    }

    if (dfs(circleCell, 0, [])) {
      arrows.push({ circle: circleCell, line: foundPath! });
      used[circleCell.row][circleCell.col] = true;
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
      let curr: Position = { row: r, col: c };

      for (let step = 1; step < targetSize; step += 1) {
        const validNeighbors = orthogonalNeighbors(curr).filter((n) => !visited[n.row][n.col]);
        if (validNeighbors.length === 0) break;

        const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
        // Ensure we don't repeat digits in the same cage
        const nextVal = solution[next.row][next.col];
        const hasDigit = cageCells.some((cell) => solution[cell.row][cell.col] === nextVal);
        if (hasDigit) break;

        cageCells.push(next);
        visited[next.row][next.col] = true;
        targetSum += nextVal;
        curr = next;
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

  for (const { row: r, col: c } of shuffledCells()) {
    if (removed >= targetHoles) break;
    const backup = givens[r][c];
    givens[r][c] = 0;

    const clone = givens.map((row) => [...row]);
    const { count: solCount, truncated } = countSolutionsDetailed(
      clone,
      variant,
      cages,
      jigsawRegions,
      sandwichClues,
      thermometers,
      arrows,
      2
    );

    if (truncated) {
      console.warn(
        `[sudoku/generator] countSolutions hit its step budget while digging (${variant}, ${difficulty}) at [${r},${c}]; keeping the given to stay safe.`
      );
    }

    if (truncated || solCount !== 1) {
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
