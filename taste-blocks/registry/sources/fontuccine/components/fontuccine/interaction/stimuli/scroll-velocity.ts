/**
 * stimuli/scroll-velocity.ts — scroll velocity in px/s, exponentially smoothed.
 *
 * `value` is SIGNED scroll velocity (px/s); the controller maps its magnitude
 * through `velocityToStretch`. The scroll handler records raw velocity only —
 * reading `scrollY` is cheap and forces no layout (R3). Smoothing and decay
 * happen in the UPDATE phase; velocity decays to 0 when scrolling stops so the
 * spring settles and the ticker sleeps.
 */
import type { Ticker } from '../ticker';
import type { NowMs, Stimulus } from './types';
import { defaultNow } from './types';

export interface ScrollVelocityOptions {
  /** Event target that emits scroll (default: window). */
  target?: EventTarget;
  /** Read the current scroll offset (default: window.scrollY). Cheap, no layout. */
  getScrollY?: () => number;
  /** Exponential smoothing factor toward raw velocity (0..1). Default 0.12. */
  smoothing?: number;
  /** Per-frame decay of raw velocity toward 0 when idle. Default 0.86. */
  decay?: number;
  /** Scroll event name (default 'scroll'). */
  eventName?: string;
  /** Injectable clock (default performance.now). */
  now?: NowMs;
}

function resolveWindow(): (Window & typeof globalThis) | undefined {
  return typeof window !== 'undefined' ? window : undefined;
}

export function createScrollVelocityStimulus(opts: ScrollVelocityOptions = {}): Stimulus {
  const win = resolveWindow();
  const target: EventTarget | undefined = opts.target ?? win;
  const getScrollY = opts.getScrollY ?? (() => (win ? win.scrollY : 0));
  const smoothing = opts.smoothing ?? 0.12;
  const decay = opts.decay ?? 0.86;
  const eventName = opts.eventName ?? 'scroll';
  const now = opts.now ?? defaultNow;

  let raw = 0;
  let value = 0;
  let lastY = 0;
  let lastT = 0;
  let tickerRef: Ticker | null = null;
  let unsubUpdate: (() => void) | null = null;
  let listening = false;

  const onScroll = (): void => {
    const t = now();
    const y = getScrollY(); // scroll offset read is cheap; forces no layout (R3)
    const dt = Math.max(1, t - lastT);
    raw = ((y - lastY) / dt) * 1000; // px/s
    lastY = y;
    lastT = t;
    tickerRef?.wake();
  };

  const onUpdate = (): void => {
    value += (raw - value) * smoothing;
    raw *= decay;
    if (Math.abs(raw) < 1e-3) raw = 0;
    if (Math.abs(value) < 1e-3) value = 0;
  };

  return {
    get value() {
      return value;
    },
    attach(ticker) {
      if (listening) this.detach();
      tickerRef = ticker;
      lastT = now();
      lastY = getScrollY();
      if (target) target.addEventListener(eventName, onScroll, { passive: true } as AddEventListenerOptions);
      unsubUpdate = ticker.update(onUpdate);
      listening = true;
    },
    detach() {
      if (target) target.removeEventListener(eventName, onScroll);
      unsubUpdate?.();
      unsubUpdate = null;
      tickerRef = null;
      listening = false;
      raw = 0;
      value = 0;
    },
  };
}
