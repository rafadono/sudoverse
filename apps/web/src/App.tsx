import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isSafeMove,
  Puzzle,
  validateBoard,
  VariantType,
  generatePuzzle,
  Difficulty,
  Language,
  getTranslation,
  TRANSLATIONS,
} from '@sudoku/core';
import { SudokuBoard } from './components/SudokuBoard';
import { NumberPad } from './components/NumberPad';
import { VariantSelector } from './components/VariantSelector';

function deepClone(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

function boardComplete(board: number[][]): boolean {
  return board.every((row) => row.every((v) => v !== 0));
}

function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

type StatusState = {
  key: keyof typeof TRANSLATIONS.en;
  param?: string;
};

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
  const [statusState, setStatusState] = useState<StatusState>({ key: 'ready' });
  const [bestTime, setBestTime] = useState<number | null>(null);

  const loadNewPuzzle = useCallback((v: VariantType, d: Difficulty) => {
    const p = generatePuzzle(v, d);
    setPuzzle(p);
    setBoard(deepClone(p.givens));
    setSolvedBoard(deepClone(p.solution || []));
    setSelected(null);
    setSeconds(0);
    setIsSolved(false);
    setStatusState({ key: 'readyToPlay' });

    const key = `sudoku-record-${v}-${d}`;
    const saved = localStorage.getItem(key);
    setBestTime(saved ? Number(saved) : null);
  }, []);

  useEffect(() => {
    loadNewPuzzle(variant, difficulty);
  }, [variant, difficulty, loadNewPuzzle]);

  useEffect(() => {
    if (isSolved) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isSolved]);

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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!selected || isSolved) return;
      if (event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        applyValue(Number(event.key));
      }
      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        event.preventDefault();
        clearCell();
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const dRow = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
        const dCol = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
        setSelected({
          row: Math.min(8, Math.max(0, selected.row + dRow)),
          col: Math.min(8, Math.max(0, selected.col + dCol)),
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, applyValue, clearCell, isSolved]);

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
      const key = `sudoku-record-${variant}-${difficulty}`;
      const currentBest = localStorage.getItem(key);
      if (!currentBest || seconds < Number(currentBest)) {
        localStorage.setItem(key, String(seconds));
        setBestTime(seconds);
        setStatusState({ key: 'newRecord', param: String(seconds) });
      } else {
        setStatusState({ key: 'solvedCorrectly', param: String(seconds) });
      }
    }
  }, [board, validation.valid, variant, difficulty, seconds, isSolved]);

  const resetBoard = () => {
    setBoard(deepClone(puzzle.givens));
    setSelected(null);
    setSeconds(0);
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
          <button type="button" onClick={() => loadNewPuzzle(variant, difficulty)}>
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
        onSelect={(row, col) => setSelected({ row, col })}
      />

      <NumberPad onInput={applyValue} onClear={clearCell} lang={lang} />

      <section className="status">
        <strong>{getTranslation('status', lang)}:</strong> {currentStatusText}
      </section>
    </main>
  );
}
