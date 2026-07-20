/**
 * worker/analysis-worker.ts — thin Worker wrapper (off-main-thread analysis).
 *
 * troika precedent: all heavy glyph analysis runs here. Flex-profile
 * Float32Array buffers are TRANSFERRED back (zero-copy) in postMessage.
 *
 * Import-safe: guarded so bundling / SSR importing this module is a no-op when
 * there is no Worker scope.
 */
import { analyzeGlyph, collectTransferables } from './analyze';
import type { AnalyzeRequest } from '../core/types';

// `self` exists in a DedicatedWorkerGlobalScope. Guard for other environments.
declare const self: {
  onmessage: ((ev: { data: AnalyzeRequest }) => void) | null;
  postMessage: (msg: unknown, transfer?: ArrayBuffer[]) => void;
} | undefined;

if (typeof self !== 'undefined' && self && 'postMessage' in self) {
  self.onmessage = (ev: { data: AnalyzeRequest }) => {
    const res = analyzeGlyph(ev.data);
    self.postMessage(res, collectTransferables(res));
  };
}
