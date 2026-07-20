/**
 * webgl/msdf/worker.ts — off-main-thread MSDF rasterization entry.
 *
 * CLAUDE.md rule 1: atlas generation is the Tier-1 analog of static analysis and
 * MUST run in a worker, never on the main thread, never per frame. This is a
 * thin transport wrapper around the pure `generateMSDF`; the client (client.ts)
 * matches responses by id and falls back to an inline synchronous call when no
 * Worker exists (SSR / tests). The heavy pixel loop is CPU-only, so it runs the
 * same code in either context. Where `OffscreenCanvas` is available a future
 * revision can move the raster to a GPU jump-flood behind this same message
 * contract — the client does not care.
 */
import type { PathCommand } from '../../core/types';
import type { MSDFOptions, MSDFBitmap } from './generator';
import { generateMSDF } from './generator';

export interface MsdfRequest {
  id: number;
  glyphId: string;
  commands: PathCommand[];
  options: MSDFOptions;
}

export interface MsdfResponse {
  id: number;
  glyphId: string;
  bitmap: MSDFBitmap;
}

/** Run one request (shared by worker + inline fallback). */
export function handleMsdfRequest(req: MsdfRequest): MsdfResponse {
  const bitmap = generateMSDF(req.commands, req.options);
  return { id: req.id, glyphId: req.glyphId, bitmap };
}

// Wire up as a module worker when running in a Worker global scope. Guarded so
// importing this module on the main thread (for `handleMsdfRequest`) is inert.
declare const self: {
  onmessage?: (ev: { data: MsdfRequest }) => void;
  postMessage?: (msg: MsdfResponse, transfer?: unknown[]) => void;
} | undefined;

if (
  typeof self !== 'undefined' &&
  typeof (self as { postMessage?: unknown }).postMessage === 'function' &&
  typeof (globalThis as { window?: unknown }).window === 'undefined'
) {
  self.onmessage = (ev: { data: MsdfRequest }) => {
    const res = handleMsdfRequest(ev.data);
    // Transfer the pixel buffer to avoid a copy.
    self.postMessage?.(res, [res.bitmap.data.buffer]);
  };
}
