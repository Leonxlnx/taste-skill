/**
 * webgl/msdf/atlas.ts — the shared MSDF glyph atlas: a fixed grid of uniform
 * cells with LRU eviction (RESEARCH §5.4 — GPU memory on mobile). PURE slot
 * bookkeeping + UV math; it holds NO GL handle, so LRU behaviour and packing are
 * Node-testable. The renderer owns the actual texture and flushes `dirtyCells`.
 *
 * Uniform grid cells (sized from a DPR-aware raster size) trade a little texel
 * waste for O(1) allocation, O(1) eviction, and a stable UV per slot — exactly
 * the discipline "one shared canvas/context, atlas LRU eviction, DPR-aware
 * sizing". A DPR change recomputes the cell size ⇒ the atlas is rebuilt and
 * glyphs re-rastered lazily (obligation 6).
 */

export interface AtlasCellUV {
  /** Slot index [0, capacity). */
  slot: number;
  /** Atlas UV rect (0..1) for the glyph's raster sub-region within its cell. */
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface AtlasEntry extends AtlasCellUV {
  key: string;
  /** True the frame it was (re)assigned a slot — the renderer must upload it. */
  isNew: boolean;
}

export interface MsdfAtlasOptions {
  /** Atlas texture size in texels (square). Default 1024. */
  size?: number;
  /** Uniform cell size in texels (raster + padding fits inside). Default 64. */
  cellSize?: number;
  /** Device pixel ratio this atlas was sized for (for lazy re-raster on change). */
  dpr?: number;
}

export interface DirtyCell {
  slot: number;
  /** Texel origin of the cell in the atlas. */
  x: number;
  y: number;
  key: string;
}

export class MsdfAtlas {
  readonly size: number;
  readonly cellSize: number;
  readonly cols: number;
  readonly capacity: number;
  dpr: number;

  private readonly byKey = new Map<string, AtlasEntry>();
  /** slot → key (null = free). */
  private readonly slotKey: Array<string | null>;
  /** LRU order: keys, most-recently-used last. */
  private readonly lru: string[] = [];
  private readonly dirty: DirtyCell[] = [];

  constructor(opts: MsdfAtlasOptions = {}) {
    this.size = opts.size ?? 1024;
    this.cellSize = opts.cellSize ?? 64;
    this.dpr = opts.dpr ?? 1;
    this.cols = Math.max(1, Math.floor(this.size / this.cellSize));
    this.capacity = this.cols * this.cols;
    this.slotKey = new Array(this.capacity).fill(null);
  }

  /** Texel origin (x,y) of a slot's cell. */
  cellOrigin(slot: number): { x: number; y: number } {
    const c = slot % this.cols;
    const r = Math.floor(slot / this.cols);
    return { x: c * this.cellSize, y: r * this.cellSize };
  }

  private touch(key: string): void {
    const i = this.lru.indexOf(key);
    if (i >= 0) this.lru.splice(i, 1);
    this.lru.push(key);
  }

  /**
   * Get (or assign) a slot for `key`. `rasterW/H` are the glyph raster size in
   * texels (≤ cellSize); they set the UV sub-rect. Marks the entry `isNew` and
   * queues a dirty upload when a (re)assignment happens. Touches LRU.
   */
  acquire(key: string, rasterW: number, rasterH: number): AtlasEntry {
    const existing = this.byKey.get(key);
    if (existing) {
      this.touch(key);
      existing.isNew = false;
      return existing;
    }

    let slot = this.slotKey.indexOf(null);
    if (slot < 0) {
      // Evict least-recently-used.
      const victim = this.lru.shift();
      if (victim === undefined) throw new Error('MsdfAtlas: no slot and no LRU victim');
      const v = this.byKey.get(victim)!;
      slot = v.slot;
      this.byKey.delete(victim);
      this.slotKey[slot] = null;
    }

    const { x, y } = this.cellOrigin(slot);
    const w = Math.min(rasterW, this.cellSize);
    const h = Math.min(rasterH, this.cellSize);
    const entry: AtlasEntry = {
      key,
      slot,
      isNew: true,
      u0: x / this.size,
      v0: y / this.size,
      u1: (x + w) / this.size,
      v1: (y + h) / this.size,
    };
    this.slotKey[slot] = key;
    this.byKey.set(key, entry);
    this.touch(key);
    this.dirty.push({ slot, x, y, key });
    return entry;
  }

  /** Entries queued for GPU upload since the last flush. */
  takeDirty(): DirtyCell[] {
    const d = this.dirty.slice();
    this.dirty.length = 0;
    return d;
  }

  has(key: string): boolean {
    return this.byKey.has(key);
  }

  get count(): number {
    return this.byKey.size;
  }

  /** Full reset — used on DPR change / context loss (renderer re-rasterizes). */
  clear(): void {
    this.byKey.clear();
    this.slotKey.fill(null);
    this.lru.length = 0;
    this.dirty.length = 0;
  }
}
