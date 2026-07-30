import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty, VariantType } from '@sudoku/core';

function recordKey(variant: VariantType, difficulty: Difficulty): string {
  return `sudoku-record-${variant}-${difficulty}`;
}

/** Tracks the best solve time per variant/difficulty, persisted via AsyncStorage. */
export function usePuzzleRecord() {
  const [bestTime, setBestTime] = useState<number | null>(null);

  const loadRecord = useCallback(async (variant: VariantType, difficulty: Difficulty) => {
    try {
      const saved = await AsyncStorage.getItem(recordKey(variant, difficulty));
      const value = saved ? Number(saved) : null;
      setBestTime(value);
      return value;
    } catch (err) {
      console.error('Failed to load puzzle record:', err);
      setBestTime(null);
      return null;
    }
  }, []);

  /** Persists `seconds` as the new record if it beats the stored one. Returns whether it did. */
  const saveRecordIfBest = useCallback(
    async (variant: VariantType, difficulty: Difficulty, seconds: number): Promise<boolean> => {
      const key = recordKey(variant, difficulty);
      try {
        const currentBest = await AsyncStorage.getItem(key);
        if (currentBest && seconds >= Number(currentBest)) return false;

        await AsyncStorage.setItem(key, String(seconds));
        setBestTime(seconds);
        return true;
      } catch (err) {
        console.error('Failed to save puzzle record:', err);
        return false;
      }
    },
    []
  );

  return { bestTime, loadRecord, saveRecordIfBest };
}
