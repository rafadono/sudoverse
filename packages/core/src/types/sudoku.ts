export type VariantType =
  | 'classic'
  | 'diagonal'
  | 'killer'
  | 'hyper'
  | 'jigsaw'
  | 'sandwich'
  | 'thermo'
  | 'arrow';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  row: number;
  col: number;
}

export interface Cage {
  id: string;
  targetSum: number;
  cells: Position[];
}

export interface SandwichClues {
  rowClues: (number | null)[];
  colClues: (number | null)[];
}

export interface Arrow {
  circle: Position;
  line: Position[];
}

export interface Puzzle {
  id: string;
  variant: VariantType;
  givens: number[][];
  solution?: number[][];
  cages?: Cage[];
  jigsawRegions?: number[][]; // 9x9 grid mapping each cell to region 0-8
  sandwichClues?: SandwichClues;
  thermometers?: Position[][]; // Array of thermometers (paths from bulb to tip)
  arrows?: Arrow[]; // Array of arrows (circle + line)
}

export interface ValidationIssue {
  rule: string;
  cells: Position[];
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
