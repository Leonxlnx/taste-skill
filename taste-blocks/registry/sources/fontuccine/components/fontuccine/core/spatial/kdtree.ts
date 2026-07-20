/**
 * spatial/kdtree.ts — static 2D k-d tree for nearest-boundary lookup.
 *
 * Replaces the reference's O(n) brute-force nearestSample with O(log n)
 * average queries. Built in-house (no dependency), stored in flat typed
 * arrays for cache locality.
 *
 * PARITY GUARANTEE: nearest() returns the SAME sample index as brute force,
 * including ties — ties are broken toward the LOWEST index, and pruning uses
 * `<=` so equal-distance branches are still explored. This is required: the
 * accelerated path must not alter flex results (see the T2 parity test).
 */

export class KDTree {
  private readonly xs: Float64Array;
  private readonly ys: Float64Array;
  private readonly idx: Int32Array; // node order → original sample index
  private readonly axisOf: Uint8Array; // split axis per node position
  private readonly n: number;

  constructor(points: ArrayLike<{ x: number; y: number }>) {
    this.n = points.length;
    this.xs = new Float64Array(this.n);
    this.ys = new Float64Array(this.n);
    this.idx = new Int32Array(this.n);
    this.axisOf = new Uint8Array(this.n);
    const order = new Int32Array(this.n);
    for (let i = 0; i < this.n; i++) {
      this.xs[i] = points[i].x;
      this.ys[i] = points[i].y;
      order[i] = i;
    }
    if (this.n > 0) this.build(order, 0, this.n, 0);
  }

  /** Recursively partition `order[lo,hi)` into a balanced tree (median split). */
  private build(order: Int32Array, lo: number, hi: number, depth: number): void {
    if (lo >= hi) return;
    const axis = depth & 1; // 0 = x, 1 = y
    const mid = (lo + hi) >> 1;
    this.nthElement(order, lo, hi, mid, axis);
    // Node stored at position `mid`: remember its original index + split axis.
    this.idx[mid] = order[mid];
    this.axisOf[mid] = axis;
    this.build(order, lo, mid, depth + 1);
    this.build(order, mid + 1, hi, depth + 1);
  }

  private coord(sampleIndex: number, axis: number): number {
    return axis === 0 ? this.xs[sampleIndex] : this.ys[sampleIndex];
  }

  /** Quickselect: partition so order[k] holds the k-th smallest along axis. */
  private nthElement(order: Int32Array, lo: number, hi: number, k: number, axis: number): void {
    let l = lo;
    let r = hi - 1;
    while (l < r) {
      const pivot = this.coord(order[(l + r) >> 1], axis);
      let i = l;
      let j = r;
      while (i <= j) {
        while (this.coord(order[i], axis) < pivot) i++;
        while (this.coord(order[j], axis) > pivot) j--;
        if (i <= j) {
          const t = order[i];
          order[i] = order[j];
          order[j] = t;
          i++;
          j--;
        }
      }
      if (k <= j) r = j;
      else if (k >= i) l = i;
      else break;
    }
  }

  /**
   * Nearest sample index to (qx,qy). Returns -1 if the tree is empty.
   * Exact; lowest-index tie-break to match brute force.
   */
  nearest(qx: number, qy: number): number {
    if (this.n === 0) return -1;
    this.bestDist = Infinity;
    this.bestIdx = -1;
    this.search(0, this.n, qx, qy);
    return this.bestIdx;
  }

  private bestDist = Infinity;
  private bestIdx = -1;

  private search(lo: number, hi: number, qx: number, qy: number): void {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    const si = this.idx[mid];
    const dx = this.xs[si] - qx;
    const dy = this.ys[si] - qy;
    const d = dx * dx + dy * dy;
    if (d < this.bestDist || (d === this.bestDist && si < this.bestIdx)) {
      this.bestDist = d;
      this.bestIdx = si;
    }
    const axis = this.axisOf[mid];
    const delta = axis === 0 ? qx - this.xs[si] : qy - this.ys[si];
    const near = delta < 0;
    // Descend the near side first.
    if (near) this.search(lo, mid, qx, qy);
    else this.search(mid + 1, hi, qx, qy);
    // Explore the far side only if the splitting plane is within best radius.
    // `<=` (not `<`) keeps equal-distance candidates reachable for tie-break.
    if (delta * delta <= this.bestDist) {
      if (near) this.search(mid + 1, hi, qx, qy);
      else this.search(lo, mid, qx, qy);
    }
  }
}
