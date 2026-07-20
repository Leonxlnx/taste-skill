/**
 * ticker.ts — the single shared ticker for the whole library.
 *
 * Decision-record rules enforced here:
 *  R1  ONE loop for every instance/stimulus/renderer. Never a per-element rAF.
 *  R2  Strict phase order every frame: READ → UPDATE → RENDER. All DOM
 *      measurement in READ, all pure math in UPDATE, all writes in RENDER.
 *  R8  External driver support: `drive()` hands the loop to GSAP's ticker or
 *      Lenis' raf; the internal rAF is disabled while driven.
 *
 * Battery/perf: the ticker sleeps when no registered activity predicate is
 * live (all springs settled, all stimuli idle) — no idle rAF churn — and wakes
 * on input via `wake()`. A settled-but-still-attached instance keeps its
 * `() => !settled` predicate registered, so the loop PARKS (running, 0 pending
 * rAF) and resumes on `wake()`. If no activity predicate is registered, the
 * loop stops after its pending frame even when a gated renderer still has phase
 * subscribers. A later `attach()`/`drive()`/`onActivity` restarts it.
 *
 * Testability: `frame(now)` is directly invokable and the scheduler/clock is
 * injectable, so phase ordering and sleep behaviour are deterministic with NO
 * real rAF (Node has none). `createTicker(scheduler)` builds an isolated ticker
 * for tests; the module-level `ticker` singleton is what the library shares.
 */

export type FrameCallback = (now: number) => void;
export type Phase = (now: number) => void;
export type ActivityPredicate = () => boolean;

/** Injectable clock + frame scheduler (defaults to rAF / performance.now). */
export interface FrameScheduler {
  requestFrame(cb: FrameCallback): number;
  cancelFrame(handle: number): void;
  now(): number;
}

export interface Ticker {
  /** READ phase: DOM measurement only (getBoundingClientRect, scrollY). */
  read(fn: Phase): () => void;
  /** UPDATE phase: pure math only (springs, target derivation, LUT rebuilds). */
  update(fn: Phase): () => void;
  /** RENDER phase: writes only (GL draw, `d` attr, style). Renderers subscribe here. */
  render(fn: Phase): () => void;
  /**
   * Register a liveness predicate. While ANY predicate returns true the loop
   * keeps scheduling frames; when all are false the loop sleeps. Returns an
   * unsubscribe fn.
   */
  onActivity(pred: ActivityPredicate): () => void;
  /** Ensure the loop is running/awake (called by input handlers — cheap, no layout). */
  wake(): void;
  /** Start the internal rAF loop (no-op while externally driven). */
  start(): void;
  /** Stop the loop and cancel any pending frame. */
  stop(): void;
  /**
   * Hand the loop to an external driver (GSAP ticker / Lenis raf). The internal
   * rAF is disabled; call the returned `frame(now)` once per external tick:
   *   const tick = ticker.drive();
   *   gsap.ticker.add((t) => tick(t * 1000)); // GSAP time is seconds
   */
  drive(): FrameCallback;
  /** Re-enable the internal rAF after `drive()` (undoes external mode). */
  undrive(): void;
  /** Run one frame deterministically. Exposed for external drivers and tests. */
  frame(now: number): void;
  readonly running: boolean;
  readonly awake: boolean;
  readonly external: boolean;
}

function makeDefaultScheduler(): FrameScheduler {
  return {
    requestFrame(cb) {
      return typeof requestAnimationFrame !== 'undefined'
        ? requestAnimationFrame(cb)
        : 0;
    },
    cancelFrame(handle) {
      if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(handle);
    },
    now() {
      return typeof performance !== 'undefined' ? performance.now() : Date.now();
    },
  };
}

export function createTicker(scheduler: FrameScheduler = makeDefaultScheduler()): Ticker {
  const reads = new Set<Phase>();
  const updates = new Set<Phase>();
  const renders = new Set<Phase>();
  const activity = new Set<ActivityPredicate>();

  let running = false;
  let external = false;
  let awake = false;
  let handle = 0;

  function hasLiveActivity(): boolean {
    for (const p of activity) if (p()) return true;
    return false;
  }

  function schedule(): void {
    if (external || !running || awake) return;
    awake = true;
    handle = scheduler.requestFrame(frame);
  }

  function frame(now: number): void {
    // R2: strict phase order. Never interleave reads and writes.
    for (const f of reads) f(now);
    for (const f of updates) f(now);
    for (const f of renders) f(now);

    if (external) return; // the external owner reschedules
    awake = false;
    if (running && hasLiveActivity()) {
      awake = true;
      handle = scheduler.requestFrame(frame);
    } else if (activity.size === 0) {
      // No activity owner remains: fully stop even if a gated renderer keeps
      // inert READ/RENDER subscriptions. A later controller activation restarts
      // the loop through onActivity()/wake().
      // A settled-but-still-attached instance keeps its `() => !settled`
      // predicate registered (activity.size > 0), so it PARKS here with
      // running=true and resumes on wake() — it never reaches this branch.
      running = false;
    }
  }

  function start(): void {
    if (running) return;
    running = true;
    if (!external) schedule();
  }

  function stop(): void {
    running = false;
    awake = false;
    if (handle) scheduler.cancelFrame(handle);
    handle = 0;
  }

  function wake(): void {
    if (external) return;
    if (!running) {
      start();
      return;
    }
    schedule();
  }

  function subscribe(set: Set<Phase>, fn: Phase): () => void {
    set.add(fn);
    start();
    return () => set.delete(fn);
  }

  return {
    read: (fn) => subscribe(reads, fn),
    update: (fn) => subscribe(updates, fn),
    render: (fn) => subscribe(renders, fn),
    onActivity(pred) {
      activity.add(pred);
      // A newly live instance should be able to wake a sleeping loop.
      wake();
      return () => activity.delete(pred);
    },
    wake,
    start,
    stop,
    drive() {
      external = true;
      if (handle) scheduler.cancelFrame(handle);
      handle = 0;
      awake = false;
      running = true;
      return frame;
    },
    undrive() {
      if (!external) return;
      external = false;
      // Resume the internal loop if there is work to do.
      if (running) {
        awake = false;
        schedule();
      }
    },
    frame,
    get running() {
      return running;
    },
    get awake() {
      return awake;
    },
    get external() {
      return external;
    },
  };
}

/** The one shared ticker every Fontuccine instance uses (R1). */
export const ticker: Ticker = createTicker();
