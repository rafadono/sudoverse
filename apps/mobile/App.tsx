import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Puzzle,
  validateBoard,
  VariantType,
  puzzlePoolManager,
  Difficulty,
  Language,
  getTranslation,
} from '@sudoku/core';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MobileSudokuBoard } from './src/components/MobileSudokuBoard';
import { Calculator } from './src/components/Calculator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useGameTimer } from './src/hooks/useGameTimer';
import { usePuzzleRecord } from './src/hooks/usePuzzleRecord';

function deepClone(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

function boardComplete(board: number[][]): boolean {
  return board.every((row) => row.every((value) => value !== 0));
}

const VARIANTS: VariantType[] = [
  'classic',
  'diagonal',
  'killer',
  'hyper',
  'jigsaw',
  'sandwich',
  'thermo',
  'arrow',
];

function AppInner() {
  const [lang, setLang] = useState<Language>('en');
  const [variant, setVariant] = useState<VariantType>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<Puzzle>(() =>
    puzzlePoolManager.getPuzzle('classic', 'medium')
  );
  const [board, setBoard] = useState<number[][]>(() => deepClone(puzzle.givens));
  const [solvedBoard, setSolvedBoard] = useState<number[][] | null>(() =>
    deepClone(puzzle.solution)
  );
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const { seconds, resetSeconds } = useGameTimer(isSolved);
  const { bestTime, loadRecord, saveRecordIfBest } = usePuzzleRecord();

  useEffect(() => {
    // Pre-warm the pool in background on startup, same engine as web/desktop.
    puzzlePoolManager.prewarmPool();
    loadRecord(variant, difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (boardComplete(board) && validation.valid && !isSolved) {
      setIsSolved(true);
      saveRecordIfBest(variant, difficulty, seconds);
    }
  }, [board, validation.valid, variant, difficulty, seconds, isSolved, saveRecordIfBest]);

  const loadNewGame = useCallback(
    (v: VariantType, d: Difficulty) => {
      const p = puzzlePoolManager.getPuzzle(v, d);
      setPuzzle(p);
      setBoard(deepClone(p.givens));
      setSolvedBoard(deepClone(p.solution));
      setSelected(null);
      resetSeconds();
      setIsSolved(false);
      loadRecord(v, d);
    },
    [resetSeconds, loadRecord]
  );

  function handleVariantChange(next: VariantType) {
    setVariant(next);
    loadNewGame(next, difficulty);
  }

  function handleDifficultyChange(next: Difficulty) {
    setDifficulty(next);
    loadNewGame(variant, next);
  }

  const updateCell = useCallback(
    (row: number, col: number, text: string) => {
      if (isSolved) return;
      if (puzzle.givens[row][col] !== 0) return;
      const digit = text.replace(/[^1-9]/g, '').slice(-1);

      setBoard((prev) => {
        const clone = deepClone(prev);
        clone[row][col] = digit ? Number(digit) : 0;
        return clone;
      });
    },
    [isSolved, puzzle.givens]
  );

  const onFocusCell = useCallback((row: number, col: number) => {
    setSelected({ row, col });
  }, []);

  function resetBoard() {
    setBoard(deepClone(puzzle.givens));
    setSelected(null);
    resetSeconds();
    setIsSolved(false);
  }

  function solveCurrent() {
    if (solvedBoard) {
      setBoard(deepClone(solvedBoard));
      setIsSolved(true);
    }
  }

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

  const formatTime = (time: number) => {
    return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
  };

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
          {VARIANTS.map((v) => (
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

        <MobileSudokuBoard
          board={board}
          givens={puzzle.givens}
          variant={variant}
          selected={selected}
          conflictSet={conflictSet}
          isSolved={isSolved}
          cages={variant === 'killer' ? puzzle.cages : undefined}
          jigsawRegions={variant === 'jigsaw' ? puzzle.jigsawRegions : undefined}
          sandwichClues={variant === 'sandwich' ? puzzle.sandwichClues : undefined}
          thermometers={variant === 'thermo' ? puzzle.thermometers : undefined}
          arrows={variant === 'arrow' ? puzzle.arrows : undefined}
          onFocusCell={onFocusCell}
          onChangeCell={updateCell}
        />

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
          <TouchableOpacity
            style={[styles.actionBtn, showCalculator && styles.actionBtnActive]}
            onPress={() => setShowCalculator((prev) => !prev)}
          >
            <Text style={styles.actionBtnText}>{getTranslation('calculator', lang)}</Text>
          </TouchableOpacity>
        </View>

        {showCalculator && (
          <View style={styles.calculatorWrapper}>
            <Calculator onClose={() => setShowCalculator(false)} lang={lang} />
          </View>
        )}

        <TouchableOpacity
          style={styles.kofiBtn}
          onPress={() => Linking.openURL('https://ko-fi.com')}
        >
          <Text style={styles.kofiBtnText}>{getTranslation('supportKofi', lang)}</Text>
        </TouchableOpacity>

        {/* Score & Timer metadata */}
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            {getTranslation('time', lang)}: {formatTime(seconds)}
          </Text>
          {bestTime !== null && (
            <Text style={[styles.metaText, { color: '#059669' }]}>
              {getTranslation('record', lang)}: {formatTime(bestTime)}
            </Text>
          )}
        </View>

        <Text style={styles.status} accessibilityLiveRegion="polite" accessibilityRole="text">
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
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
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnActive: { backgroundColor: '#93c5fd' },
  actionBtnText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  calculatorWrapper: { marginTop: 4 },
  kofiBtn: {
    backgroundColor: '#ff5e5b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  kofiBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
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
