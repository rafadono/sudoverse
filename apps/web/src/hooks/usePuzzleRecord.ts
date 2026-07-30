import { useCallback, useState } from 'react';
import { Difficulty, VariantType } from '@sudoku/core';

function recordKey(variant: VariantType, difficulty: Difficulty): string {
  return `sudoku-record-${variant}-${difficulty}`;
}

/** Tracks the best solve time per variant/difficulty, backed by localStorage. */
export function usePuzzleRecord() {
  const [bestTime, setBestTime] = useState<number | null>(null);

  const loadRecord = useCallback((variant: VariantType, difficulty: Difficulty) => {
    const saved = localStorage.getItem(recordKey(variant, difficulty));
    const value = saved ? Number(saved) : null;
    setBestTime(value);
    return value;
  }, []);

  /** Persists `seconds` as the new record if it beats the stored one. Returns whether it did. */
  const saveRecordIfBest = useCallback(
    (variant: VariantType, difficulty: Difficulty, seconds: number): boolean => {
      const key = recordKey(variant, difficulty);
      const currentBest = localStorage.getItem(key);
      if (currentBest && seconds >= Number(currentBest)) return false;

      localStorage.setItem(key, String(seconds));
      setBestTime(seconds);
      return true;
    },
    []
  );

  return { bestTime, loadRecord, saveRecordIfBest };
}
