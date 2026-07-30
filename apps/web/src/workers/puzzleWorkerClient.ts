import type { Difficulty, Puzzle, VariantType } from '@sudoku/core';
import type { PuzzleWorkerResponse } from './puzzleWorkerProtocol';

interface PendingRequest {
  resolve: (puzzle: Puzzle) => void;
  reject: (err: Error) => void;
}

/**
 * Runs puzzle generation in a dedicated Web Worker so a slow generation
 * (e.g. Jigsaw) never blocks the main thread / UI. Works unchanged inside
 * the Tauri desktop shell too, since its WebView supports Web Workers the
 * same as any browser.
 */
class PuzzleWorkerClient {
  private worker: Worker;
  private nextRequestId = 0;
  private pending = new Map<number, PendingRequest>();

  constructor() {
    this.worker = new Worker(new URL('./puzzle.worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (event: MessageEvent<PuzzleWorkerResponse>) => {
      const { requestId, puzzle } = event.data;
      const pending = this.pending.get(requestId);
      if (!pending) return;
      this.pending.delete(requestId);
      pending.resolve(puzzle);
    };

    this.worker.onerror = (event) => {
      const err = new Error(event.message || 'Puzzle worker crashed');
      this.pending.forEach((p) => p.reject(err));
      this.pending.clear();
    };
  }

  getPuzzle(variant: VariantType, difficulty: Difficulty): Promise<Puzzle> {
    const requestId = this.nextRequestId++;
    return new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      this.worker.postMessage({ type: 'getPuzzle', requestId, variant, difficulty });
    });
  }

  prewarm(): void {
    this.worker.postMessage({ type: 'prewarm' });
  }
}

export const puzzleWorkerClient = new PuzzleWorkerClient();
