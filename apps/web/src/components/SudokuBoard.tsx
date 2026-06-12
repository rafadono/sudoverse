import { Arrow, Cage, Position, SandwichClues } from '@sudoku/core';

interface SudokuBoardProps {
  board: number[][];
  givens: number[][];
  selected: Position | null;
  cages?: Cage[];
  jigsawRegions?: number[][];
  sandwichClues?: SandwichClues;
  thermometers?: Position[][];
  arrows?: Arrow[];
  conflictSet: Set<string>;
  onSelect: (row: number, col: number) => void;
}

const cagePalette = ['#f6bd60', '#84a59d', '#f28482', '#90be6d', '#43aa8b', '#577590'];

function key(row: number, col: number): string {
  return `${row}-${col}`;
}

function buildCageMaps(cages?: Cage[]) {
  const firstCellLabel = new Map<string, string>();
  const cageColor = new Map<string, string>();

  if (!cages) return { firstCellLabel, cageColor };

  cages.forEach((cage, index) => {
    const color = cagePalette[index % cagePalette.length];
    cageColor.set(cage.id, color);

    if (cage.cells.length > 0) {
      const first = cage.cells[0];
      firstCellLabel.set(key(first.row, first.col), String(cage.targetSum));
    }
  });

  return { firstCellLabel, cageColor };
}

function findCage(cages: Cage[] | undefined, row: number, col: number): Cage | undefined {
  return cages?.find((cage) => cage.cells.some((cell) => cell.row === row && cell.col === col));
}

function isHyperCell(row: number, col: number): boolean {
  const inRowRange = (row >= 1 && row <= 3) || (row >= 5 && row <= 7);
  const inColRange = (col >= 1 && col <= 3) || (col >= 5 && col <= 7);
  return inRowRange && inColRange;
}

function cellCenterPercent(pos: Position): { x: string; y: string } {
  const x = `${(pos.col + 0.5) * (100 / 9)}%`;
  const y = `${(pos.row + 0.5) * (100 / 9)}%`;
  return { x, y };
}

export function SudokuBoard({
  board,
  givens,
  selected,
  cages,
  jigsawRegions,
  sandwichClues,
  thermometers,
  arrows,
  conflictSet,
  onSelect,
}: SudokuBoardProps) {
  const { firstCellLabel, cageColor } = buildCageMaps(cages);

  const boardEl = (
    <div className="board-wrapper" style={{ position: 'relative' }}>
      <div className="board" role="grid" aria-label="Sudoku board">
        {board.map((rowValues, row) =>
          rowValues.map((value, col) => {
            const isGiven = givens[row][col] !== 0;
            const isSelected = selected?.row === row && selected?.col === col;
            const isConflict = conflictSet.has(key(row, col));
            const cage = findCage(cages, row, col);
            const label = firstCellLabel.get(key(row, col));
            const isHyper = isHyperCell(row, col);

            // Background coloring
            let cellBg = undefined;
            if (isSelected) {
              cellBg = '#dbeafe';
            } else if (isConflict) {
              cellBg = '#fee2e2';
            } else if (isHyper) {
              cellBg = '#f5f3ff'; // Soft violet
            }

            // Dynamic border styling for irregular jigsaw regions
            const borderTopWidth = jigsawRegions
              ? row === 0 || jigsawRegions[row - 1][col] !== jigsawRegions[row][col]
                ? 3
                : 1
              : row % 3 === 0
                ? 3
                : 1;
            const borderLeftWidth = jigsawRegions
              ? col === 0 || jigsawRegions[row][col - 1] !== jigsawRegions[row][col]
                ? 3
                : 1
              : col % 3 === 0
                ? 3
                : 1;
            const borderRightWidth = jigsawRegions
              ? col === 8 || jigsawRegions[row][col + 1] !== jigsawRegions[row][col]
                ? 3
                : 1
              : col === 8
                ? 3
                : 1;
            const borderBottomWidth = jigsawRegions
              ? row === 8 || jigsawRegions[row + 1][col] !== jigsawRegions[row][col]
                ? 3
                : 1
              : row === 8
                ? 3
                : 1;

            return (
              <button
                key={key(row, col)}
                type="button"
                className={[
                  'cell',
                  isGiven ? 'given' : 'editable',
                  isSelected ? 'selected' : '',
                  isConflict ? 'conflict' : '',
                ].join(' ')}
                onClick={() => onSelect(row, col)}
                aria-label={`row ${row + 1} col ${col + 1}`}
                style={{
                  borderTopWidth,
                  borderLeftWidth,
                  borderRightWidth,
                  borderBottomWidth,
                  backgroundColor: cellBg,
                  boxShadow: cage ? `inset 0 0 0 2px ${cageColor.get(cage.id)}` : undefined,
                }}
              >
                {label ? <span className="cage-label">{label}</span> : null}
                <span>{value === 0 ? '' : value}</span>
              </button>
            );
          })
        )}
      </div>

      {/* SVG Canvas overlay for Thermo and Arrow */}
      {(thermometers || arrows) && (
        <svg
          className="board-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
            </marker>
          </defs>

          {/* Render Thermometers */}
          {thermometers?.map((thermo, tIndex) => {
            const bulb = cellCenterPercent(thermo[0]);
            return (
              <g key={`thermo-${tIndex}`}>
                {/* Thermometer Bulb */}
                <circle
                  cx={bulb.x}
                  cy={bulb.y}
                  r="3.2%"
                  fill="#94a3b8"
                  opacity="0.5"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                {/* Thermometer Line path */}
                {thermo.map((cell, idx) => {
                  if (idx === 0) return null;
                  const prev = cellCenterPercent(thermo[idx - 1]);
                  const curr = cellCenterPercent(cell);
                  return (
                    <line
                      key={`thermo-line-${tIndex}-${idx}`}
                      x1={prev.x}
                      y1={prev.y}
                      x2={curr.x}
                      y2={curr.y}
                      stroke="#94a3b8"
                      strokeWidth="2.2%"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Render Arrows */}
          {arrows?.map((arrow, aIndex) => {
            const circle = cellCenterPercent(arrow.circle);
            return (
              <g key={`arrow-${aIndex}`}>
                {/* Circle representing the sum target */}
                <circle
                  cx={circle.x}
                  cy={circle.y}
                  r="3.2%"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                {/* Line showing sum cells */}
                {arrow.line.map((cell, idx) => {
                  const prev = idx === 0 ? circle : cellCenterPercent(arrow.line[idx - 1]);
                  const curr = cellCenterPercent(cell);
                  const isEnd = idx === arrow.line.length - 1;
                  return (
                    <line
                      key={`arrow-line-${aIndex}-${idx}`}
                      x1={prev.x}
                      y1={prev.y}
                      x2={curr.x}
                      y2={curr.y}
                      stroke="#64748b"
                      strokeWidth="1.2%"
                      strokeLinecap="round"
                      markerEnd={isEnd ? 'url(#arrowhead)' : undefined}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );

  if (sandwichClues) {
    return (
      <div className="sandwich-outer-wrapper">
        <div className="sandwich-top-clues">
          <div className="sandwich-corner-cell" />
          {sandwichClues.colClues.map((clue, idx) => (
            <div key={`col-clue-${idx}`} className="sandwich-clue-cell col-clue">
              {clue !== null ? clue : '0'}
            </div>
          ))}
        </div>
        <div className="sandwich-middle-row">
          <div className="sandwich-left-clues">
            {sandwichClues.rowClues.map((clue, idx) => (
              <div key={`row-clue-${idx}`} className="sandwich-clue-cell row-clue">
                {clue !== null ? clue : '0'}
              </div>
            ))}
          </div>
          {boardEl}
        </div>
      </div>
    );
  }

  return boardEl;
}
