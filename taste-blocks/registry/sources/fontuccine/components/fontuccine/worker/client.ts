/**
 * worker/client.ts — main-thread AnalysisClient.
 *
 *  - Spawns the analysis Worker (or a caller-injected one) and matches
 *    responses to requests by id.
 *  - LRU cache keyed by (glyphId, axes, params) so a glyph/axis is analyzed
 *    once. Analysis is static, so cache hits are always valid.
 *  - Synchronous INLINE FALLBACK (calls analyzeGlyph directly) when no Worker
 *    is available — SSR, tests, or environments without Worker support.
 *  - Never touches the DOM and never forces layout.
 */
import type { AnalyzeRequest, AnalyzeResponse, AnalyzeParams, Axis, PathCommand } from '../core/types';
import { DEFAULT_PARAMS } from '../core/types';
import { analyzeGlyph } from './analyze';

export interface AnalysisClientOptions {
  /** Provide a Worker instance factory; omit to use the inline fallback. */
  workerFactory?: () => Worker;
  /** Force the synchronous inline path even if a Worker exists. */
  inline?: boolean;
  /** Max cached glyph/axis analyses (LRU). Default 512. */
  cacheSize?: number;
}

export interface AnalyzeGlyphInput {
  glyphId: string;
  commands: PathCommand[];
  advanceWidth: number;
  axes: Axis[];
  params?: Partial<AnalyzeParams>;
}

interface Pending {
  resolve: (r: AnalyzeResponse) => void;
  reject: (e: unknown) => void;
}

function paramsKey(p: AnalyzeParams): string {
  return `${p.slices}:${p.k}:${p.interiorSamples}:${p.smooth}:${p.samplesPerSegment}`;
}

export class AnalysisClient {
  private worker: Worker | null = null;
  private readonly pending = new Map<number, Pending>();
  private readonly cache = new Map<string, AnalyzeResponse>();
  private readonly cacheSize: number;
  private nextId = 1;
  private inline: boolean;
  private readonly opts: AnalysisClientOptions;

  constructor(opts: AnalysisClientOptions = {}) {
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
        : new Worker(new URL('./analysis-worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (ev: MessageEvent) => {
        const res = ev.data as AnalyzeResponse;
        const p = this.pending.get(res.id);
        if (p) {
          this.pending.delete(res.id);
          p.resolve(res);
        }
      };
      this.worker.onerror = (err: unknown) => {
        for (const [, p] of this.pending) p.reject(err);
        this.pending.clear();
      };
    } catch {
      // Worker construction failed → permanently fall back to inline.
      this.inline = true;
      this.worker = null;
    }
    return this.worker;
  }

  private cacheGet(key: string): AnalyzeResponse | undefined {
    const v = this.cache.get(key);
    if (v) {
      this.cache.delete(key);
      this.cache.set(key, v); // move to MRU
    }
    return v;
  }

  private cacheSet(key: string, v: AnalyzeResponse): void {
    this.cache.set(key, v);
    while (this.cache.size > this.cacheSize) {
      const oldest = this.cache.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.cache.delete(oldest);
    }
  }

  /** Analyze one glyph for the requested axes (cached, off-thread when possible). */
  analyze(input: AnalyzeGlyphInput): Promise<AnalyzeResponse> {
    const params: AnalyzeParams = { ...DEFAULT_PARAMS, ...input.params };
    const axes = [...input.axes].sort();
    const key = `${input.glyphId}|${axes.join(',')}|${paramsKey(params)}`;

    const cached = this.cacheGet(key);
    if (cached) return Promise.resolve(cached);

    const id = this.nextId++;
    const req: AnalyzeRequest = {
      id,
      glyphId: input.glyphId,
      commands: input.commands,
      axes,
      params,
      advanceWidth: input.advanceWidth,
    };

    const worker = this.ensureWorker();
    if (!worker) {
      // Inline synchronous fallback.
      const res = analyzeGlyph(req);
      this.cacheSet(key, res);
      return Promise.resolve(res);
    }

    return new Promise<AnalyzeResponse>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (r) => {
          this.cacheSet(key, r);
          resolve(r);
        },
        reject,
      });
      worker.postMessage(req);
    });
  }

  /** Number of cached analyses (for diagnostics/tests). */
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
