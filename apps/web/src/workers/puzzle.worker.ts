/// <reference lib="webworker" />
import { puzzlePoolManager } from '@sudoku/core';
import type { PuzzleWorkerRequest, PuzzleWorkerResponse } from './puzzleWorkerProtocol';

self.onmessage = (event: MessageEvent<PuzzleWorkerRequest>) => {
  const msg = event.data;

  if (msg.type === 'prewarm') {
    puzzlePoolManager.prewarmPool();
    return;
  }

  const puzzle = puzzlePoolManager.getPuzzle(msg.variant, msg.difficulty);
  const response: PuzzleWorkerResponse = { requestId: msg.requestId, puzzle };
  self.postMessage(response);
};
