import { Language } from '../i18n/translations';
import {
  Arrow,
  Cage,
  Position,
  SandwichClues,
  ValidationIssue,
  ValidationResult,
  VariantType,
} from '../types/sudoku';

const SIZE = 9;
const BOX = 3;

function inBounds(n: number): boolean {
  return n >= 0 && n < SIZE;
}

function isDigit(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 9;
}

function checkDuplicates(
  cells: Position[],
  board: number[][],
  rule: string,
  message: string
): ValidationIssue[] {
  const seen = new Map<number, Position>();
  const issues: ValidationIssue[] = [];

  for (const cell of cells) {
    const value = board[cell.row][cell.col];
    if (value === 0) continue;
    if (seen.has(value)) {
      issues.push({
        rule,
        cells: [seen.get(value)!, cell],
        message,
      });
    } else {
      seen.set(value, cell);
    }
  }

  return issues;
}

function rowCells(row: number): Position[] {
  return Array.from({ length: SIZE }, (_, col) => ({ row, col }));
}

function colCells(col: number): Position[] {
  return Array.from({ length: SIZE }, (_, row) => ({ row, col }));
}

function boxCells(boxRow: number, boxCol: number): Position[] {
  const cells: Position[] = [];
  const startRow = boxRow * BOX;
  const startCol = boxCol * BOX;

  for (let r = 0; r < BOX; r += 1) {
    for (let c = 0; c < BOX; c += 1) {
      cells.push({ row: startRow + r, col: startCol + c });
    }
  }

  return cells;
}

function diagonalCells(main: boolean): Position[] {
  return Array.from({ length: SIZE }, (_, i) => ({ row: i, col: main ? i : SIZE - 1 - i }));
}

function validateStructure(board: number[][], lang: Language): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!Array.isArray(board) || board.length !== SIZE) {
    return [
      {
        rule: 'structure',
        cells: [],
        message: lang === 'es' ? 'El tablero debe tener 9 filas.' : 'The board must have 9 rows.',
      },
    ];
  }

  for (let row = 0; row < SIZE; row += 1) {
    const current = board[row];
    if (!Array.isArray(current) || current.length !== SIZE) {
      issues.push({
        rule: 'structure',
        cells: [{ row, col: 0 }],
        message:
          lang === 'es' ? 'Cada fila debe tener 9 columnas.' : 'Each row must have 9 columns.',
      });
      continue;
    }

    for (let col = 0; col < SIZE; col += 1) {
      if (!isDigit(current[col])) {
        issues.push({
          rule: 'structure',
          cells: [{ row, col }],
          message:
            lang === 'es'
              ? 'Cada celda debe tener un numero entre 0 y 9.'
              : 'Each cell must contain a number between 0 and 9.',
        });
      }
    }
  }

  return issues;
}

function validateKiller(
  cages: Cage[] | undefined,
  board: number[][],
  lang: Language
): ValidationIssue[] {
  if (!cages || cages.length === 0) {
    return [
      {
        rule: 'killer',
        cells: [],
        message:
          lang === 'es'
            ? 'Killer Sudoku requiere jaulas (cages).'
            : 'Killer Sudoku requires cages.',
      },
    ];
  }

  const issues: ValidationIssue[] = [];

  for (const cage of cages) {
    const digits = new Set<number>();
    let sum = 0;
    let complete = true;

    for (const cell of cage.cells) {
      if (!inBounds(cell.row) || !inBounds(cell.col)) {
        issues.push({
          rule: 'killer',
          cells: [cell],
          message:
            lang === 'es' ? 'Celda fuera de rango en una jaula.' : 'Cell out of bounds in a cage.',
        });
        continue;
      }

      const value = board[cell.row][cell.col];
      if (value === 0) {
        complete = false;
        continue;
      }

      sum += value;
      if (digits.has(value)) {
        issues.push({
          rule: 'killer',
          cells: [cell],
          message:
            lang === 'es'
              ? 'No se permite repetir digitos dentro de una jaula.'
              : 'Duplicate digits are not allowed within a cage.',
        });
      }
      digits.add(value);
    }

    if (sum > cage.targetSum) {
      issues.push({
        rule: 'killer',
        cells: cage.cells,
        message:
          lang === 'es'
            ? `La suma de la jaula ${cage.id} excede ${cage.targetSum}.`
            : `The sum of cage ${cage.id} exceeds ${cage.targetSum}.`,
      });
    } else if (complete && sum !== cage.targetSum) {
      issues.push({
        rule: 'killer',
        cells: cage.cells,
        message:
          lang === 'es'
            ? `La jaula ${cage.id} debe sumar ${cage.targetSum}.`
            : `Cage ${cage.id} must sum up to ${cage.targetSum}.`,
      });
    }
  }

  return issues;
}

function hyperRegionCells(regIndex: number): Position[] {
  const startRow = regIndex < 2 ? 1 : 5;
  const startCol = regIndex % 2 === 0 ? 1 : 5;
  const cells: Position[] = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      cells.push({ row: startRow + r, col: startCol + c });
    }
  }
  return cells;
}

function validateJigsaw(board: number[][], regions: number[][], lang: Language): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let reg = 0; reg < 9; reg += 1) {
    const cells: Position[] = [];
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (regions[r][c] === reg) {
          cells.push({ row: r, col: c });
        }
      }
    }
    issues.push(
      ...checkDuplicates(
        cells,
        board,
        'jigsaw',
        lang === 'es'
          ? `Region irregular ${reg + 1} contiene digitos repetidos.`
          : `Irregular region ${reg + 1} contains duplicate digits.`
      )
    );
  }
  return issues;
}

function validateSandwich(
  board: number[][],
  clues: SandwichClues,
  lang: Language
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Row checks
  for (let r = 0; r < 9; r += 1) {
    const clue = clues.rowClues[r];
    if (clue === null || clue === undefined) continue;

    const rowVals = board[r];
    const idx1 = rowVals.indexOf(1);
    const idx9 = rowVals.indexOf(9);

    if (idx1 !== -1 && idx9 !== -1) {
      const start = Math.min(idx1, idx9) + 1;
      const end = Math.max(idx1, idx9);
      let sum = 0;
      let hasZero = false;

      for (let i = start; i < end; i += 1) {
        sum += rowVals[i];
        if (rowVals[i] === 0) hasZero = true;
      }

      if (sum > clue) {
        issues.push({
          rule: 'sandwich',
          cells: Array.from({ length: end - start }, (_, i) => ({ row: r, col: start + i })),
          message:
            lang === 'es'
              ? `Suma Sandwich en fila ${r + 1} (${sum}) excede el objetivo ${clue}.`
              : `Sandwich sum in row ${r + 1} (${sum}) exceeds target of ${clue}.`,
        });
      } else if (!hasZero && sum !== clue) {
        issues.push({
          rule: 'sandwich',
          cells: Array.from({ length: end - start }, (_, i) => ({ row: r, col: start + i })),
          message:
            lang === 'es'
              ? `Suma Sandwich en fila ${r + 1} debe ser ${clue}, pero es ${sum}.`
              : `Sandwich sum in row ${r + 1} must be ${clue}, but is ${sum}.`,
        });
      }
    }
  }

  // Col checks
  for (let c = 0; c < 9; c += 1) {
    const clue = clues.colClues[c];
    if (clue === null || clue === undefined) continue;

    const colVals = Array.from({ length: 9 }, (_, r) => board[r][c]);
    const idx1 = colVals.indexOf(1);
    const idx9 = colVals.indexOf(9);

    if (idx1 !== -1 && idx9 !== -1) {
      const start = Math.min(idx1, idx9) + 1;
      const end = Math.max(idx1, idx9);
      let sum = 0;
      let hasZero = false;

      for (let i = start; i < end; i += 1) {
        sum += colVals[i];
        if (colVals[i] === 0) hasZero = true;
      }

      if (sum > clue) {
        issues.push({
          rule: 'sandwich',
          cells: Array.from({ length: end - start }, (_, i) => ({ row: start + i, col: c })),
          message:
            lang === 'es'
              ? `Suma Sandwich en columna ${c + 1} (${sum}) excede el objetivo ${clue}.`
              : `Sandwich sum in column ${c + 1} (${sum}) exceeds target of ${clue}.`,
        });
      } else if (!hasZero && sum !== clue) {
        issues.push({
          rule: 'sandwich',
          cells: Array.from({ length: end - start }, (_, i) => ({ row: start + i, col: c })),
          message:
            lang === 'es'
              ? `Suma Sandwich en columna ${c + 1} debe ser ${clue}, pero es ${sum}.`
              : `Sandwich sum in column ${c + 1} must be ${clue}, but is ${sum}.`,
        });
      }
    }
  }

  return issues;
}

function validateThermo(
  board: number[][],
  thermometers: Position[][],
  lang: Language
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const thermo of thermometers) {
    for (let i = 0; i < thermo.length - 1; i += 1) {
      const p1 = thermo[i];
      const p2 = thermo[i + 1];
      const v1 = board[p1.row][p1.col];
      const v2 = board[p2.row][p2.col];

      if (v1 !== 0 && v2 !== 0 && v2 <= v1) {
        issues.push({
          rule: 'thermo',
          cells: [p1, p2],
          message:
            lang === 'es'
              ? `Restriccion de termometro violada: ${v2} debe ser mayor que ${v1}.`
              : `Thermometer constraint violated: ${v2} must be greater than ${v1}.`,
        });
      }
    }
  }
  return issues;
}

function validateArrow(board: number[][], arrows: Arrow[], lang: Language): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const arrow of arrows) {
    const circleVal = board[arrow.circle.row][arrow.circle.col];
    let sum = 0;
    let hasZero = false;

    for (const cell of arrow.line) {
      const val = board[cell.row][cell.col];
      sum += val;
      if (val === 0) hasZero = true;
    }

    if (circleVal !== 0) {
      if (sum > circleVal) {
        issues.push({
          rule: 'arrow',
          cells: [arrow.circle, ...arrow.line],
          message:
            lang === 'es'
              ? `Suma de flecha (${sum}) excede el valor del circulo (${circleVal}).`
              : `Arrow sum (${sum}) exceeds circle value (${circleVal}).`,
        });
      } else if (!hasZero && sum !== circleVal) {
        issues.push({
          rule: 'arrow',
          cells: [arrow.circle, ...arrow.line],
          message:
            lang === 'es'
              ? `Suma de flecha (${sum}) debe ser igual al circulo (${circleVal}).`
              : `Arrow sum (${sum}) must equal circle value (${circleVal}).`,
        });
      }
    }
  }
  return issues;
}

export function validateBoard(
  board: number[][],
  variant: VariantType,
  cages?: Cage[],
  jigsawRegions?: number[][],
  sandwichClues?: SandwichClues,
  thermometers?: Position[][],
  arrows?: Arrow[],
  lang: Language = 'en'
): ValidationResult {
  const issues: ValidationIssue[] = [];
  issues.push(...validateStructure(board, lang));
  if (issues.length > 0) return { valid: false, issues };

  for (let row = 0; row < SIZE; row += 1) {
    issues.push(
      ...checkDuplicates(
        rowCells(row),
        board,
        'row',
        lang === 'es'
          ? `Fila ${row + 1} contiene digitos repetidos.`
          : `Row ${row + 1} contains duplicate digits.`
      )
    );
  }

  for (let col = 0; col < SIZE; col += 1) {
    issues.push(
      ...checkDuplicates(
        colCells(col),
        board,
        'column',
        lang === 'es'
          ? `Columna ${col + 1} contiene digitos repetidos.`
          : `Column ${col + 1} contains duplicate digits.`
      )
    );
  }

  // Jigsaw Sudoku suppresses the default 3x3 box constraint!
  if (variant !== 'jigsaw') {
    for (let br = 0; br < BOX; br += 1) {
      for (let bc = 0; bc < BOX; bc += 1) {
        issues.push(
          ...checkDuplicates(
            boxCells(br, bc),
            board,
            'box',
            lang === 'es'
              ? 'Subcuadro 3x3 contiene digitos repetidos.'
              : '3x3 subgrid contains duplicate digits.'
          )
        );
      }
    }
  }

  if (variant === 'diagonal') {
    issues.push(
      ...checkDuplicates(
        diagonalCells(true),
        board,
        'diagonal',
        lang === 'es'
          ? 'Diagonal principal contiene repetidos.'
          : 'Main diagonal contains duplicate digits.'
      )
    );
    issues.push(
      ...checkDuplicates(
        diagonalCells(false),
        board,
        'diagonal',
        lang === 'es'
          ? 'Diagonal secundaria contiene repetidos.'
          : 'Secondary diagonal contains duplicate digits.'
      )
    );
  }

  if (variant === 'killer') {
    issues.push(...validateKiller(cages, board, lang));
  }

  if (variant === 'hyper') {
    for (let i = 0; i < 4; i += 1) {
      issues.push(
        ...checkDuplicates(
          hyperRegionCells(i),
          board,
          'hyper',
          lang === 'es'
            ? `Region extra Hyper ${i + 1} contiene repetidos.`
            : `Extra Hyper region ${i + 1} contains duplicate digits.`
        )
      );
    }
  }

  if (variant === 'jigsaw' && jigsawRegions) {
    issues.push(...validateJigsaw(board, jigsawRegions, lang));
  }

  if (variant === 'sandwich' && sandwichClues) {
    issues.push(...validateSandwich(board, sandwichClues, lang));
  }

  if (variant === 'thermo' && thermometers) {
    issues.push(...validateThermo(board, thermometers, lang));
  }

  if (variant === 'arrow' && arrows) {
    issues.push(...validateArrow(board, arrows, lang));
  }

  return { valid: issues.length === 0, issues };
}

export function isSafeMove(
  board: number[][],
  row: number,
  col: number,
  value: number,
  variant: VariantType,
  cages?: Cage[],
  jigsawRegions?: number[][],
  sandwichClues?: SandwichClues,
  thermometers?: Position[][],
  arrows?: Arrow[],
  lang: Language = 'en'
): boolean {
  if (value < 1 || value > 9) return false;
  if (!inBounds(row) || !inBounds(col)) return false;

  const clone = board.map((r) => [...r]);
  clone[row][col] = value;
  return validateBoard(
    clone,
    variant,
    cages,
    jigsawRegions,
    sandwichClues,
    thermometers,
    arrows,
    lang
  ).valid;
}
