/**
 * stimuli/proximity.ts — 0..1 proximity of the pointer to an element.
 *
 * `value` is 1 when the pointer is on/inside the element and falls to 0 at
 * `radius` px away. Uses CACHED rects (R4): the rect is measured in the READ
 * phase and invalidated by ResizeObserver + scroll delta — NEVER in a handler
 * (R3). Pointer events only; touch and pen input intentionally stay static.
 * With multiple active mouse pointers the NEAREST one wins.
 */
import type { Ticker } from '../ticker';
import type { Disposable, RectSource, Stimulus } from './types';

interface PointerSample {
  x: number;
  y: number;
}

export interface ProximityOptions {
  element: RectSource;
  /** Distance in px at which proximity reaches 0. Default 240. */
  radius?: number;
  /** Target for pointermove/leave (default: window). */
  pointerTarget?: EventTarget;
  /** Target whose scroll invalidates the cached rect (default: window). */
  scrollTarget?: EventTarget;
  /** Injectable ResizeObserver factory (default: global ResizeObserver). */
  resizeObserverFactory?: (cb: () => void) => Disposable;
}

function resolveWindow(): (Window & typeof globalThis) | undefined {
  return typeof window !== 'undefined' ? window : undefined;
}

export function createProximityStimulus(opts: ProximityOptions): Stimulus {
  const win = resolveWindow();
  const el = opts.element;
  const radius = opts.radius ?? 240;
  const pointerTarget: EventTarget | undefined = opts.pointerTarget ?? win;
  const scrollTarget: EventTarget | undefined = opts.scrollTarget ?? win;

  // Nearest-wins across multiple pointers.
  const pointers = new Map<number, PointerSample>();
  let rect: { left: number; right: number; top: number; bottom: number } | null = null;
  let value = 0;

  let tickerRef: Ticker | null = null;
  let unsubRead: (() => void) | null = null;
  let unsubUpdate: (() => void) | null = null;
  let ro: Disposable | null = null;
  let listening = false;

  const measure = (): void => {
    rect = el.getBoundingClientRect();
  };

  const invalidate = (): void => {
    rect = null;
    tickerRef?.wake();
  };

  const onMove = (e: Event): void => {
    // Record raw pointer position only — NO layout read here (R3).
    const pe = e as PointerEvent;
    if (pe.pointerType && pe.pointerType !== 'mouse') return;
    const id = typeof pe.pointerId === 'number' ? pe.pointerId : 0;
    pointers.set(id, { x: pe.clientX, y: pe.clientY });
    tickerRef?.wake();
  };

  const onLeave = (e: Event): void => {
    const pe = e as PointerEvent;
    if (pe.pointerType && pe.pointerType !== 'mouse') return;
    const id = typeof pe.pointerId === 'number' ? pe.pointerId : 0;
    pointers.delete(id);
    tickerRef?.wake();
  };

  const onRead = (): void => {
    if (!rect) measure();
  };

  const onUpdate = (): void => {
    if (!rect || pointers.size === 0) {
      value = 0;
      return;
    }
    let best = 0;
    for (const p of pointers.values()) {
      const cx = Math.max(rect.left, Math.min(p.x, rect.right));
      const cy = Math.max(rect.top, Math.min(p.y, rect.bottom));
      const d = Math.hypot(p.x - cx, p.y - cy);
      const prox = Math.max(0, 1 - d / radius);
      if (prox > best) best = prox;
    }
    value = best;
  };

  const makeRO = (cb: () => void): Disposable | null => {
    if (opts.resizeObserverFactory) return opts.resizeObserverFactory(cb);
    if (typeof ResizeObserver !== 'undefined') {
      const obs = new ResizeObserver(() => cb());
      return { observe: (t) => obs.observe(t as Element), disconnect: () => obs.disconnect() };
    }
    return null;
  };

  return {
    get value() {
      return value;
    },
    attach(ticker) {
      if (listening) this.detach();
      tickerRef = ticker;
      rect = null; // measured lazily in READ
      if (pointerTarget) {
        pointerTarget.addEventListener('pointermove', onMove, { passive: true } as AddEventListenerOptions);
        pointerTarget.addEventListener('pointerleave', onLeave, { passive: true } as AddEventListenerOptions);
        pointerTarget.addEventListener('pointercancel', onLeave, { passive: true } as AddEventListenerOptions);
      }
      if (scrollTarget) {
        scrollTarget.addEventListener('scroll', invalidate, { passive: true } as AddEventListenerOptions);
      }
      ro = makeRO(invalidate);
      ro?.observe(el);
      unsubRead = ticker.read(onRead);
      unsubUpdate = ticker.update(onUpdate);
      listening = true;
    },
    detach() {
      if (pointerTarget) {
        pointerTarget.removeEventListener('pointermove', onMove);
        pointerTarget.removeEventListener('pointerleave', onLeave);
        pointerTarget.removeEventListener('pointercancel', onLeave);
      }
      if (scrollTarget) scrollTarget.removeEventListener('scroll', invalidate);
      ro?.disconnect();
      ro = null;
      unsubRead?.();
      unsubUpdate?.();
      unsubRead = null;
      unsubUpdate = null;
      tickerRef = null;
      pointers.clear();
      rect = null;
      value = 0;
      listening = false;
    },
  };
}
