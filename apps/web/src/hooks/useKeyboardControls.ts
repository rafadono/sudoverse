import { useEffect } from 'react';

interface SelectedCell {
  row: number;
  col: number;
}

interface UseKeyboardControlsOptions {
  selected: SelectedCell | null;
  isSolved: boolean;
  onDigit: (value: number) => void;
  onClear: () => void;
  onMove: (next: SelectedCell) => void;
}

/** Wires digit entry, clearing, and arrow-key navigation to the keyboard. */
export function useKeyboardControls({
  selected,
  isSolved,
  onDigit,
  onClear,
  onMove,
}: UseKeyboardControlsOptions) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!selected || isSolved) return;

      if (event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        onDigit(Number(event.key));
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        event.preventDefault();
        onClear();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        const dRow = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
        const dCol = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
        onMove({
          row: Math.min(8, Math.max(0, selected.row + dRow)),
          col: Math.min(8, Math.max(0, selected.col + dCol)),
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, isSolved, onDigit, onClear, onMove]);
}
