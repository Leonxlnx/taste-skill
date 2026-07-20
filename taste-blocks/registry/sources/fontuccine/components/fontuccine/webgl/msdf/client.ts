/**
 * webgl/msdf/client.ts — main-thread MSDF generation client.
 *
 * Mirrors the analysis-core `AnalysisClient` (src/worker/client.ts): spawns the
 * MSDF worker (or a caller-injected one), matches responses by id, LRU-caches
 * generated bitmaps keyed by (glyphId, fontSize, pxRange, dpr), and falls back
 * to a synchronous INLINE call when no Worker is available (SSR / tests). MSDF
 * for a glyph at a raster size is static, so cache hits are always valid; a DPR
 * change changes the key, which drives the lazy re-raster (obligation 6).
 */
import type { PathCommand } from '../../core/types';
import type { MSDFOptions, MSDFBitmap } from './generator';
import type { MsdfRequest, MsdfResponse } from './worker';
import { handleMsdfRequest } from './worker';

export interface MsdfClientOptions {
  workerFactory?: () => Worker;
  inline?: boolean;
  /** Max cached bitmaps (LRU). Default 512. */
  cacheSize?: number;
}

export interface MsdfGlyphInput {
  glyphId: string;
  commands: PathCommand[];
  options: MSDFOptions;
  /** Device pixel ratio (part of the cache key so DPR changes re-raster). */
  dpr?: number;
}

interface Pending {
  resolve: (b: MSDFBitmap) => void;
  reject: (e: unknown) => void;
}

function keyOf(input: MsdfGlyphInput): string {
  const o = input.options;
  return `${input.glyphId}|${o.fontSize}|${o.pxRange ?? 4}|${o.unitsPerEm ?? 1000}|${input.dpr ?? 1}`;
}

export class MsdfClient {
  private worker: Worker | null = null;
  private readonly pending = new Map<number, Pending>();
  private readonly cache = new Map<string, MSDFBitmap>();
  private readonly cacheSize: number;
  private nextId = 1;
  private inline: boolean;
  private readonly opts: MsdfClientOptions;

  constructor(opts: MsdfClientOptions = {}) {
    this.opts = opts;
    this.cacheSize = opts.cacheSize ?? 512;
    const canSpawn = !!opts.workerFactory || (typeof Worker !== 'undefined' && !opts.inline);
    this.inline = !canSpawn || !!opts.inline;
  }

  private ensureWorker(): Worker | null {
    if (this.inline) return null;
    if (this.worker) return this.worker;
    try {
      this.worker = this.opts.workerFactory
        ? this.opts.workerFactory()
        : new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (ev: MessageEvent) => {
        const res = ev.data as MsdfResponse;
        const p = this.pending.get(res.id);
        if (p) {
          this.pending.delete(res.id);
          p.resolve(res.bitmap);
        }
      };
      this.worker.onerror = (err: unknown) => {
        for (const [, p] of this.pending) p.reject(err);
        this.pending.clear();
      };
    } catch {
      this.inline = true;
      this.worker = null;
    }
    return this.worker;
  }

  private cacheGet(key: string): MSDFBitmap | undefined {
    const v = this.cache.get(key);
    if (v) {
      this.cache.delete(key);
      this.cache.set(key, v);
    }
    return v;
  }

  private cacheSet(key: string, v: MSDFBitmap): void {
    this.cache.set(key, v);
    while (this.cache.size > this.cacheSize) {
      const oldest = this.cache.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.cache.delete(oldest);
    }
  }

  /** Synchronously return a cached bitmap, or undefined if not yet generated. */
  peek(input: MsdfGlyphInput): MSDFBitmap | undefined {
    return this.cache.get(keyOf(input));
  }

  /** Generate (or fetch cached) MSDF for a glyph at a raster size. */
  generate(input: MsdfGlyphInput): Promise<MSDFBitmap> {
    const key = keyOf(input);
    const cached = this.cacheGet(key);
    if (cached) return Promise.resolve(cached);

    const id = this.nextId++;
    const req: MsdfRequest = {
      id,
      glyphId: input.glyphId,
      commands: input.commands,
      options: input.options,
    };

    const worker = this.ensureWorker();
    if (!worker) {
      const res = handleMsdfRequest(req);
      this.cacheSet(key, res.bitmap);
      return Promise.resolve(res.bitmap);
    }

    return new Promise<MSDFBitmap>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (b) => {
          this.cacheSet(key, b);
          resolve(b);
        },
        reject,
      });
      worker.postMessage(req);
    });
  }

  get cacheCount(): number {
    return this.cache.size;
  }

  clearCache(): void {
    this.cache.clear();
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pending.clear();
    this.cache.clear();
  }
}
