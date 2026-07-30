import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isSafeMove,
  Puzzle,
  validateBoard,
  VariantType,
  Difficulty,
  Language,
  getTranslation,
  TRANSLATIONS,
} from '@sudoku/core';
import { SudokuBoard } from './components/SudokuBoard';
import { NumberPad } from './components/NumberPad';
import { VariantSelector } from './components/VariantSelector';
import { Calculator } from './components/Calculator';
import { useGameTimer } from './hooks/useGameTimer';
import { usePuzzleRecord } from './hooks/usePuzzleRecord';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { puzzleWorkerClient } from './workers/puzzleWorkerClient';

function deepClone(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

function boardComplete(board: number[][]): boolean {
  return board.every((row) => row.every((v) => v !== 0));
}

function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function emptyPuzzlePlaceholder(): Puzzle {
  const blank = Array.from({ length: 9 }, () => Array(9).fill(0));
  return { id: 'placeholder', variant: 'classic', givens: blank, solution: blank };
}

type StatusState = {
  key: keyof typeof TRANSLATIONS.en;
  param?: string;
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [variant, setVariant] = useState<VariantType>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<Puzzle>(emptyPuzzlePlaceholder);
  const [board, setBoard] = useState<number[][]>(() => deepClone(puzzle.givens));
  const [solvedBoard, setSolvedBoard] = useState<number[][] | null>(null);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [statusState, setStatusState] = useState<StatusState>({ key: 'ready' });
  const [showCalculator, setShowCalculator] = useState(false);
  // Starts true: the mount effect immediately requests the first puzzle from
  // the worker, so the placeholder board above is never actually painted.
  const [isGeneratingPuzzle, setIsGeneratingPuzzle] = useState(true);

  const { seconds, resetSeconds } = useGameTimer(isSolved);
  const { bestTime, loadRecord, saveRecordIfBest } = usePuzzleRecord();

  useEffect(() => {
    // Pre-warm the worker's pool in background on startup
    puzzleWorkerClient.prewarm();
  }, []);

  const loadNewPuzzle = useCallback(
    (v: VariantType, d: Difficulty) => {
      setIsGeneratingPuzzle(true);
      // Generation runs in a Web Worker so it never blocks the main thread,
      // even for the slower variants (e.g. Jigsaw) or a pool cache-miss.
      puzzleWorkerClient
        .getPuzzle(v, d)
        .then((p) => {
          setPuzzle(p);
          setBoard(deepClone(p.givens));
          setSolvedBoard(deepClone(p.solution));
          setSelected(null);
          resetSeconds();
          setIsSolved(false);
          setStatusState({ key: 'readyToPlay' });
          loadRecord(v, d);
        })
        .catch((err) => {
          console.error('Failed to generate puzzle:', err);
          setStatusState({ key: 'generationFailed' });
        })
        .finally(() => {
          setIsGeneratingPuzzle(false);
        });
    },
    [resetSeconds, loadRecord]
  );

  useEffect(() => {
    loadNewPuzzle(variant, difficulty);
  }, [variant, difficulty, loadNewPuzzle]);

  const applyValue = useCallback(
    (value: number) => {
      if (isSolved || !selected) return;
      if (puzzle.givens[selected.row][selected.col] !== 0) return;

      setBoard((prev) => {
        const clone = deepClone(prev);
        clone[selected.row][selected.col] = value;
        return clone;
      });

      if (
        !isSafeMove(
          board,
          selected.row,
          selected.col,
          value,
          variant,
          puzzle.cages,
          puzzle.jigsawRegions,
          puzzle.sandwichClues,
          puzzle.thermometers,
          puzzle.arrows,
          lang
        )
      ) {
        setStatusState({ key: 'invalidMove' });
      } else {
        setStatusState({ key: 'moveApplied' });
      }
    },
    [selected, board, variant, puzzle, isSolved, lang]
  );

  const clearCell = useCallback(() => {
    if (isSolved || !selected) return;
    if (puzzle.givens[selected.row][selected.col] !== 0) return;

    setBoard((prev) => {
      const clone = deepClone(prev);
      clone[selected.row][selected.col] = 0;
      return clone;
    });
    setStatusState({ key: 'cellCleared' });
  }, [selected, puzzle, isSolved]);

  useKeyboardControls({
    selected,
    isSolved,
    onDigit: applyValue,
    onClear: clearCell,
    onMove: setSelected,
  });

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
      issue.cells.forEach((cell) => set.add(cellKey(cell.row, cell.col)))
    );
    return set;
  }, [validation.issues]);

  useEffect(() => {
    if (boardComplete(board) && validation.valid && !isSolved) {
      setIsSolved(true);
      const isNewRecord = saveRecordIfBest(variant, difficulty, seconds);
      setStatusState(
        isNewRecord
          ? { key: 'newRecord', param: String(seconds) }
          : { key: 'solvedCorrectly', param: String(seconds) }
      );
    }
  }, [board, validation.valid, variant, difficulty, seconds, isSolved, saveRecordIfBest]);

  const onSelectCell = useCallback((row: number, col: number) => {
    setSelected({ row, col });
  }, []);

  const resetBoard = () => {
    setBoard(deepClone(puzzle.givens));
    setSelected(null);
    resetSeconds();
    setIsSolved(false);
    setStatusState({ key: 'boardReset' });
  };

  const solveCurrent = () => {
    if (solvedBoard) {
      setBoard(deepClone(solvedBoard));
      setIsSolved(true);
      setStatusState({ key: 'puzzleSolved' });
    } else {
      setStatusState({ key: 'couldNotSolve' });
    }
  };

  const hint = () => {
    if (isSolved || !selected) {
      setStatusState({ key: 'selectCellHint' });
      return;
    }

    if (puzzle.givens[selected.row][selected.col] !== 0) {
      setStatusState({ key: 'cellFixed' });
      return;
    }

    if (solvedBoard) {
      const correctVal = solvedBoard[selected.row][selected.col];
      if (correctVal !== 0) {
        applyValue(correctVal);
        setStatusState({ key: 'hintApplied' });
      } else {
        setStatusState({ key: 'noHintForCell' });
      }
    } else {
      setStatusState({ key: 'noSolutionForHint' });
    }
  };

  const formatTime = (time: number) => {
    return `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
  };

  const currentStatusText = useMemo(() => {
    return getTranslation(statusState.key, lang).replace('{time}', statusState.param || '');
  }, [statusState, lang]);

  return (
    <main className="app">
      <section className="header">
        <h1>{getTranslation('title', lang)}</h1>
        <p>{getTranslation('subtitle', lang)}</p>
      </section>

      <section className="controls">
        <div className="selectors-row">
          <VariantSelector value={variant} onChange={setVariant} lang={lang} />

          <label className="difficulty-selector">
            {getTranslation('difficulty', lang)}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">{getTranslation('easy', lang)}</option>
              <option value="medium">{getTranslation('medium', lang)}</option>
              <option value="hard">{getTranslation('hard', lang)}</option>
            </select>
          </label>

          <label className="language-selector">
            {getTranslation('selectLanguage', lang)}
            <select value={lang} onChange={(e) => setLang(e.target.value as Language)}>
              <option value="en">{getTranslation('languageNameEn', lang)}</option>
              <option value="es">{getTranslation('languageNameEs', lang)}</option>
            </select>
          </label>
        </div>

        <div className="buttons">
          <button
            type="button"
            disabled={isGeneratingPuzzle}
            onClick={() => loadNewPuzzle(variant, difficulty)}
          >
            {getTranslation('newGame', lang)}
          </button>
          <button type="button" onClick={resetBoard}>
            {getTranslation('reset', lang)}
          </button>
          <button type="button" onClick={hint}>
            {getTranslation('hint', lang)}
          </button>
          <button type="button" onClick={solveCurrent}>
            {getTranslation('solve', lang)}
          </button>
          <button
            type="button"
            className={showCalculator ? 'btn-calc active' : 'btn-calc'}
            onClick={() => setShowCalculator((prev) => !prev)}
          >
            {getTranslation('calculator', lang)}
          </button>
          <a
            href="https://ko-fi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kofi"
          >
            {getTranslation('supportKofi', lang)}
          </a>
        </div>

        <div className="meta">
          <span>
            {getTranslation('time', lang)}: {formatTime(seconds)}
          </span>
          {bestTime !== null && (
            <span className="best-time">
              {getTranslation('record', lang)}: {formatTime(bestTime)}
            </span>
          )}
          <span>
            {validation.valid
              ? getTranslation('noConflicts', lang)
              : `${getTranslation('conflicts', lang)}: ${validation.issues.length}`}
          </span>
        </div>
      </section>

      <div className="game-layout">
        <div className="board-container">
          {isGeneratingPuzzle ? (
            <div className="board-loading" role="status" aria-live="polite">
              {getTranslation('generatingPuzzle', lang)}
            </div>
          ) : (
            <SudokuBoard
              board={board}
              givens={puzzle.givens}
              selected={selected}
              cages={variant === 'killer' ? puzzle.cages : undefined}
              jigsawRegions={variant === 'jigsaw' ? puzzle.jigsawRegions : undefined}
              sandwichClues={variant === 'sandwich' ? puzzle.sandwichClues : undefined}
              thermometers={variant === 'thermo' ? puzzle.thermometers : undefined}
              arrows={variant === 'arrow' ? puzzle.arrows : undefined}
              conflictSet={conflictSet}
              onSelect={onSelectCell}
            />
          )}
        </div>

        <aside className="side-panel">
          <NumberPad onInput={applyValue} onClear={clearCell} lang={lang} />
          {showCalculator && <Calculator onClose={() => setShowCalculator(false)} lang={lang} />}
        </aside>
      </div>

      <section className="status" aria-live="polite" role="status">
        <strong>{getTranslation('status', lang)}:</strong> {currentStatusText}
      </section>
    </main>
  );
}
