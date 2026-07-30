import { useCallback, useEffect, useState } from 'react';

export function useGameTimer(isSolved: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isSolved) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isSolved]);

  const resetSeconds = useCallback(() => setSeconds(0), []);

  return { seconds, resetSeconds };
}
