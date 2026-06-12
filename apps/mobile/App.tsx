import { useEffect, useMemo, useState } from 'react';
import {
  Puzzle,
  solveBoard,
  validateBoard,
  VariantType,
  generatePuzzle,
  Difficulty,
  Language,
  getTranslation,
} from '@sudoku/core';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function deepClone(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

function boardComplete(board: number[][]): boolean {
  return board.every((row) => row.every((value) => value !== 0));
}

const cagePalette = ['#f6bd60', '#84a59d', '#f28482', '#90be6d', '#43aa8b', '#577590'];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [variant, setVariant] = useState<VariantType>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle('classic', 'medium'));
  const [board, setBoard] = useState<number[][]>(() => deepClone(puzzle.givens));
  const [solvedBoard, setSolvedBoard] = useState<number[][] | null>(null);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [records, setRecords] = useState<Record<string, number>>({});

  const validation = useMemo(
    () =>
      validateBoard(
        board,
        variant,
        puzzle.cages,
        puzzle.jigsawRegions,
        puzzle.sandwichClues,
        puzzle.thermometers,
        puzzle.arrows,
        lang
      ),
    [board, variant, puzzle, lang]
  );

  const conflictSet = useMemo(() => {
    const set = new Set<string>();
    validation.issues.forEach((issue) =>
      issue.cells.forEach((cell) => set.add(`${cell.row}-${cell.col}`))
    );
    return set;
  }, [validation.issues]);

  // Precalculate solution
  useEffect(() => {
    setSolvedBoard(deepClone(puzzle.solution || []));
  }, [puzzle]);

  // Timer effect
  useEffect(() => {
    if (isSolved) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isSolved]);

  // Win condition checker
  useEffect(() => {
    if (boardComplete(board) && validation.valid && !isSolved) {
      setIsSolved(true);
      const key = `${variant}-${difficulty}`;
      const record = records[key];
      if (!record || seconds < record) {
        setRecords((prev) => ({ ...prev, [key]: seconds }));
      }
    }
  }, [board, validation.valid, variant, difficulty, seconds, isSolved]);

  function loadNewGame(v: VariantType, d: Difficulty) {
    const p = generatePuzzle(v, d);
    setPuzzle(p);
    setBoard(deepClone(p.givens));
    setSolvedBoard(deepClone(p.solution || []));
    setSelected(null);
    setSeconds(0);
    setIsSolved(false);
  }

  function handleVariantChange(next: VariantType) {
    setVariant(next);
    loadNewGame(next, difficulty);
  }

  function handleDifficultyChange(next: Difficulty) {
    setDifficulty(next);
    loadNewGame(variant, next);
  }

  function updateCell(row: number, col: number, text: string) {
    if (isSolved) return;
    if (puzzle.givens[row][col] !== 0) return;
    const digit = text.replace(/[^1-9]/g, '').slice(-1);

    setBoard((prev) => {
      const clone = deepClone(prev);
      clone[row][col] = digit ? Number(digit) : 0;
      return clone;
    });
  }

  function resetBoard() {
    setBoard(deepClone(puzzle.givens));
    setSelected(null);
    setSeconds(0);
    setIsSolved(false);
  }

  function solveCurrent() {
    if (solvedBoard) {
      setBoard(deepClone(solvedBoard));
      setIsSolved(true);
    }
  }

  // Help Pista (Hint)
  function hint() {
    if (isSolved || !selected) return;
    if (puzzle.givens[selected.row][selected.col] !== 0) return;
    if (solvedBoard) {
      const val = solvedBoard[selected.row][selected.col];
      if (val !== 0) {
        setBoard((prev) => {
          const clone = deepClone(prev);
          clone[selected.row][selected.col] = val;
          return clone;
        });
      }
    }
  }

  const cageColorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!puzzle.cages) return map;
    puzzle.cages.forEach((cage, index) => {
      map.set(cage.id, cagePalette[index % cagePalette.length]);
    });
    return map;
  }, [puzzle.cages]);

  function getCageForCell(row: number, col: number) {
    if (variant !== 'killer' || !puzzle.cages) return null;
    return puzzle.cages.find((cage) =>
      cage.cells.some((cell) => cell.row === row && cell.col === col)
    );
  }

  function getCageLabel(row: number, col: number) {
    if (variant !== 'killer' || !puzzle.cages) return null;
    const cage = getCageForCell(row, col);
    if (!cage) return null;
    const first = cage.cells[0];
    if (first.row === row && first.col === col) {
      return cage.targetSum;
    }
    return null;
  }

  function isHyperCell(row: number, col: number): boolean {
    const inRowRange = (row >= 1 && row <= 3) || (row >= 5 && row <= 7);
    const inColRange = (col >= 1 && col <= 3) || (col >= 5 && col <= 7);
    return inRowRange && inColRange;
  }

  function getCellBorders(row: number, col: number) {
    const isSel = selected?.row === row && selected?.col === col;

    // Check Jigsaw border thick outline
    const borderTopWidth = puzzle.jigsawRegions
      ? row === 0 || puzzle.jigsawRegions[row - 1][col] !== puzzle.jigsawRegions[row][col]
        ? 3
        : 1
      : row % 3 === 0
        ? 3
        : 1;
    const borderLeftWidth = puzzle.jigsawRegions
      ? col === 0 || puzzle.jigsawRegions[row][col - 1] !== puzzle.jigsawRegions[row][col]
        ? 3
        : 1
      : col % 3 === 0
        ? 3
        : 1;
    const borderRightWidth = puzzle.jigsawRegions
      ? col === 8 || puzzle.jigsawRegions[row][col + 1] !== puzzle.jigsawRegions[row][col]
        ? 3
        : 1
      : col === 8
        ? 3
        : 1;
    const borderBottomWidth = puzzle.jigsawRegions
      ? row === 8 || puzzle.jigsawRegions[row + 1][col] !== puzzle.jigsawRegions[row][col]
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

  const formatTime = (time: number) => {
    return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
  };

  const activeRecord = records[`${variant}-${difficulty}`] || null;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{getTranslation('title', lang)}</Text>
        <Text style={styles.subtitle}>{getTranslation('subtitle', lang)}</Text>

        {/* Variant Select Button Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.variantScroll}
          contentContainerStyle={styles.variantRow}
        >
          {(
            [
              'classic',
              'diagonal',
              'killer',
              'hyper',
              'jigsaw',
              'sandwich',
              'thermo',
              'arrow',
            ] as VariantType[]
          ).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.variantBtn, v === variant && styles.variantBtnActive]}
              onPress={() => handleVariantChange(v)}
            >
              <Text style={[styles.variantText, v === variant && styles.variantTextActive]}>
                {getTranslation(v, lang)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Difficulty Selector Row */}
        <View style={styles.difficultyRow}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.diffBtn, d === difficulty && styles.diffBtnActive]}
              onPress={() => handleDifficultyChange(d)}
            >
              <Text style={[styles.diffText, d === difficulty && styles.diffTextActive]}>
                {getTranslation(d, lang)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Selector Row */}
        <View style={styles.languageRow}>
          {(['en', 'es'] as Language[]).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langBtn, l === lang && styles.langBtnActive]}
              onPress={() => setLang(l)}
            >
              <Text style={[styles.langText, l === lang && styles.langTextActive]}>
                {getTranslation(l === 'en' ? 'languageNameEn' : 'languageNameEs', lang)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sandwich Clues rendering logic */}
        {puzzle.sandwichClues && (
          <View style={styles.sandwichTopRow}>
            {puzzle.sandwichClues.colClues.map((clue, idx) => (
              <Text key={`col-clue-${idx}`} style={styles.sandwichColClue}>
                {clue !== null ? clue : '0'}
              </Text>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          {puzzle.sandwichClues && (
            <View style={styles.sandwichLeftCol}>
              {puzzle.sandwichClues.rowClues.map((clue, idx) => (
                <Text key={`row-clue-${idx}`} style={styles.sandwichRowClue}>
                  {clue !== null ? clue : '0'}
                </Text>
              ))}
            </View>
          )}

          {/* Grid Display */}
          <View style={styles.grid}>
            {board.map((rowValues, row) =>
              rowValues.map((value, col) => {
                const given = puzzle.givens[row][col] !== 0;
                const isConflict = conflictSet.has(`${row}-${col}`);
                const isDiagonal = variant === 'diagonal' && (row === col || row === 8 - col);
                const isHyper = variant === 'hyper' && isHyperCell(row, col);
                const cage = getCageForCell(row, col);
                const cageLabel = getCageLabel(row, col);

                // Thermometers
                const isThermoBulb = puzzle.thermometers?.some(
                  (path) => path[0].row === row && path[0].col === col
                );
                const isThermoBody = puzzle.thermometers?.some((path) =>
                  path.some((p, i) => i > 0 && p.row === row && p.col === col)
                );

                // Arrows
                const isArrowCircle = puzzle.arrows?.some(
                  (arrow) => arrow.circle.row === row && arrow.circle.col === col
                );
                const isArrowLine = puzzle.arrows?.some((arrow) =>
                  arrow.line.some((p) => p.row === row && p.col === col)
                );

                // Background calculation
                let cellBg = 'white';
                if (given) {
                  cellBg = '#f1f5f9';
                } else if (isConflict) {
                  cellBg = '#fee2e2';
                } else if (isHyper) {
                  cellBg = '#f5f3ff'; // violet
                } else if (isDiagonal) {
                  cellBg = '#e0f2fe'; // blue
                } else if (cage) {
                  cellBg = `${cageColorMap.get(cage.id)}22`;
                } else if (isThermoBody) {
                  cellBg = '#f1f5f9'; // shade thermometer path
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
                    key={`${row}-${col}`}
                    style={[
                      styles.cellContainer,
                      getCellBorders(row, col),
                      { backgroundColor: cellBg },
                    ]}
                  >
                    {cageLabel !== null && <Text style={styles.cageLabel}>{cageLabel}</Text>}
                    {isThermoBulb && <View style={styles.thermoBulb} />}
                    {isArrowCircle && <View style={styles.arrowCircle} />}
                    {isArrowLine && <View style={styles.arrowLineDot} />}

                    <TextInput
                      style={[styles.cellInput, { color: textColor }]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={value === 0 ? '' : String(value)}
                      editable={!given && !isSolved}
                      onFocus={() => setSelected({ row, col })}
                      onChangeText={(txt) => updateCell(row, col, txt)}
                    />
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Buttons Row */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => loadNewGame(variant, difficulty)}
          >
            <Text style={styles.actionBtnText}>{getTranslation('newBtn', lang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={resetBoard}>
            <Text style={styles.actionBtnText}>{getTranslation('reset', lang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={hint}>
            <Text style={styles.actionBtnText}>{getTranslation('hint', lang)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={solveCurrent}>
            <Text style={styles.actionBtnText}>{getTranslation('solve', lang)}</Text>
          </TouchableOpacity>
        </View>

        {/* Score & Timer metadata */}
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            {getTranslation('time', lang)}: {formatTime(seconds)}
          </Text>
          {activeRecord !== null && (
            <Text style={[styles.metaText, { color: '#059669' }]}>
              {getTranslation('record', lang)}: {formatTime(activeRecord)}
            </Text>
          )}
        </View>

        <Text style={styles.status}>
          {validation.valid
            ? boardComplete(board)
              ? getTranslation('solvedCorrectly', lang).replace('{time}', String(seconds))
              : getTranslation('noConflicts', lang)
            : `${getTranslation('conflicts', lang)}: ${validation.issues.length}`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, gap: 10, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 2 },
  variantScroll: { width: '100%', maxHeight: 50 },
  variantRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 4 },
  variantBtn: {
    backgroundColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  variantBtnActive: { backgroundColor: '#2563eb' },
  variantText: { color: '#1e293b', fontWeight: '700' },
  variantTextActive: { color: '#ffffff', fontWeight: '700' },
  difficultyRow: { flexDirection: 'row', gap: 10, marginVertical: 4 },
  diffBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  diffBtnActive: { backgroundColor: '#475569' },
  diffText: { color: '#334155', fontWeight: '700' },
  diffTextActive: { color: '#ffffff', fontWeight: '700' },
  languageRow: { flexDirection: 'row', gap: 10, marginVertical: 2 },
  langBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langBtnActive: { backgroundColor: '#2563eb' },
  langText: { color: '#334155', fontWeight: '700' },
  langTextActive: { color: '#ffffff', fontWeight: '700' },
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
    marginLeft: 24, // aligned offset for left row clues
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
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 6,
  },
  actionBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  status: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
    fontSize: 15,
  },
});
