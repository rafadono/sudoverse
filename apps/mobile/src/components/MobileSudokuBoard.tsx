import { memo, useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Arrow, Cage, Position, SandwichClues, VariantType } from '@sudoku/core';

interface MobileSudokuBoardProps {
  board: number[][];
  givens: number[][];
  variant: VariantType;
  selected: Position | null;
  conflictSet: Set<string>;
  isSolved: boolean;
  cages?: Cage[];
  jigsawRegions?: number[][];
  sandwichClues?: SandwichClues;
  thermometers?: Position[][];
  arrows?: Arrow[];
  onFocusCell: (row: number, col: number) => void;
  onChangeCell: (row: number, col: number, text: string) => void;
}

const cagePalette = ['#f6bd60', '#84a59d', '#f28482', '#90be6d', '#43aa8b', '#577590'];

function key(row: number, col: number): string {
  return `${row}-${col}`;
}

function isHyperCell(row: number, col: number): boolean {
  const inRowRange = (row >= 1 && row <= 3) || (row >= 5 && row <= 7);
  const inColRange = (col >= 1 && col <= 3) || (col >= 5 && col <= 7);
  return inRowRange && inColRange;
}

export const MobileSudokuBoard = memo(function MobileSudokuBoard({
  board,
  givens,
  variant,
  selected,
  conflictSet,
  isSolved,
  cages,
  jigsawRegions,
  sandwichClues,
  thermometers,
  arrows,
  onFocusCell,
  onChangeCell,
}: MobileSudokuBoardProps) {
  const { cellCage, cageLabel, cageColor } = useMemo(() => {
    const cellCage = new Map<string, Cage>();
    const cageLabel = new Map<string, number>();
    const cageColor = new Map<string, string>();
    if (!cages) return { cellCage, cageLabel, cageColor };

    cages.forEach((cage, index) => {
      cageColor.set(cage.id, cagePalette[index % cagePalette.length]);
      cage.cells.forEach((cell) => cellCage.set(key(cell.row, cell.col), cage));
      if (cage.cells.length > 0) {
        const first = cage.cells[0];
        cageLabel.set(key(first.row, first.col), cage.targetSum);
      }
    });
    return { cellCage, cageLabel, cageColor };
  }, [cages]);

  const { thermoBulbs, thermoBodies } = useMemo(() => {
    const thermoBulbs = new Set<string>();
    const thermoBodies = new Set<string>();
    thermometers?.forEach((path) => {
      path.forEach((p, i) => {
        if (i === 0) thermoBulbs.add(key(p.row, p.col));
        else thermoBodies.add(key(p.row, p.col));
      });
    });
    return { thermoBulbs, thermoBodies };
  }, [thermometers]);

  const { arrowCircles, arrowLines } = useMemo(() => {
    const arrowCircles = new Set<string>();
    const arrowLines = new Set<string>();
    arrows?.forEach((arrow) => {
      arrowCircles.add(key(arrow.circle.row, arrow.circle.col));
      arrow.line.forEach((p) => arrowLines.add(key(p.row, p.col)));
    });
    return { arrowCircles, arrowLines };
  }, [arrows]);

  function getCellBorders(row: number, col: number) {
    const isSel = selected?.row === row && selected?.col === col;

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

    return {
      borderTopWidth,
      borderLeftWidth,
      borderRightWidth,
      borderBottomWidth,
      borderColor: isSel ? '#3b82f6' : '#0f172a',
    };
  }

  const grid = (
    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
      {sandwichClues && (
        <View style={styles.sandwichLeftCol}>
          {sandwichClues.rowClues.map((clue, idx) => (
            <Text key={`row-clue-${idx}`} style={styles.sandwichRowClue}>
              {clue !== null ? clue : '0'}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.grid}>
        {board.map((rowValues, row) =>
          rowValues.map((value, col) => {
            const cellKey = key(row, col);
            const given = givens[row][col] !== 0;
            const isConflict = conflictSet.has(cellKey);
            const isDiagonal = variant === 'diagonal' && (row === col || row === 8 - col);
            const isHyper = variant === 'hyper' && isHyperCell(row, col);
            const cage = cellCage.get(cellKey);
            const label = cageLabel.get(cellKey);

            const isThermoBulb = thermoBulbs.has(cellKey);
            const isThermoBody = thermoBodies.has(cellKey);
            const isArrowCircle = arrowCircles.has(cellKey);
            const isArrowLine = arrowLines.has(cellKey);

            let cellBg = 'white';
            if (given) {
              cellBg = '#f1f5f9';
            } else if (isConflict) {
              cellBg = '#fee2e2';
            } else if (isHyper) {
              cellBg = '#f5f3ff';
            } else if (isDiagonal) {
              cellBg = '#e0f2fe';
            } else if (cage) {
              cellBg = `${cageColor.get(cage.id)}22`;
            } else if (isThermoBody) {
              cellBg = '#f1f5f9';
            } else if (isArrowLine) {
              cellBg = '#fafaf9';
            }

            let textColor = '#2563eb';
            if (given) {
              textColor = '#0f172a';
            } else if (isConflict) {
              textColor = '#dc2626';
            }

            return (
              <View
                key={cellKey}
                style={[
                  styles.cellContainer,
                  getCellBorders(row, col),
                  { backgroundColor: cellBg },
                ]}
              >
                {label !== undefined && <Text style={styles.cageLabel}>{label}</Text>}
                {isThermoBulb && <View style={styles.thermoBulb} />}
                {isArrowCircle && <View style={styles.arrowCircle} />}
                {isArrowLine && <View style={styles.arrowLineDot} />}

                <TextInput
                  style={[styles.cellInput, { color: textColor }]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={value === 0 ? '' : String(value)}
                  editable={!given && !isSolved}
                  onFocus={() => onFocusCell(row, col)}
                  onChangeText={(text) => onChangeCell(row, col, text)}
                />
              </View>
            );
          })
        )}
      </View>
    </View>
  );

  if (sandwichClues) {
    return (
      <View>
        <View style={styles.sandwichTopRow}>
          {sandwichClues.colClues.map((clue, idx) => (
            <Text key={`col-clue-${idx}`} style={styles.sandwichColClue}>
              {clue !== null ? clue : '0'}
            </Text>
          ))}
        </View>
        {grid}
      </View>
    );
  }

  return grid;
});

const styles = StyleSheet.create({
  grid: {
    width: 324,
    height: 324,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0f172a',
  },
  cellContainer: {
    width: 36,
    height: 36,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    padding: 0,
  },
  cageLabel: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 8,
    fontWeight: '800',
    color: '#334155',
    zIndex: 10,
  },
  thermoBulb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#94a3b8',
    opacity: 0.5,
    zIndex: 1,
  },
  arrowCircle: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#64748b',
    zIndex: 1,
  },
  arrowLineDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748b',
    opacity: 0.6,
    zIndex: 1,
  },
  sandwichTopRow: {
    flexDirection: 'row',
    width: 324,
    marginLeft: 24,
    justifyContent: 'space-around',
  },
  sandwichLeftCol: {
    flexDirection: 'column',
    height: 324,
    width: 20,
    justifyContent: 'space-around',
    marginRight: 4,
  },
  sandwichColClue: {
    width: 36,
    textAlign: 'center',
    fontWeight: '800',
    color: '#475569',
    fontSize: 12,
  },
  sandwichRowClue: {
    height: 36,
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: '800',
    color: '#475569',
    fontSize: 12,
  },
});
