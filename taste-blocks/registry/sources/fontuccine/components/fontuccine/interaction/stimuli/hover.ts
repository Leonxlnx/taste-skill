/**
 * stimuli/hover.ts — hover enter/leave → 0 | 1 target.
 *
 * `value` is a raw 0/1 target; the controller's spring smooths the transition
 * so an abrupt hover on/off still animates like motion design (R6). Pointer
 * events only (obligation #6). Touch and pen input intentionally stay static;
 * handlers record raw mouse-hover state only (R3).
 */
import type { Ticker } from '../ticker';
import type { Stimulus } from './types';

export interface HoverOptions {
  /** Element (EventTarget) whose hover state is tracked. */
  element: EventTarget;
  /** Enter event name (default 'pointerenter'). */
  enterEvent?: string;
  /** Leave event name (default 'pointerleave'). */
  leaveEvent?: string;
}

export function createHoverStimulus(opts: HoverOptions): Stimulus {
  const el = opts.element;
  const enterEvent = opts.enterEvent ?? 'pointerenter';
  const leaveEvent = opts.leaveEvent ?? 'pointerleave';

  let value = 0;
  let tickerRef: Ticker | null = null;
  let listening = false;

  const isMouse = (event: Event): boolean => {
    const pointerType = (event as PointerEvent).pointerType;
    return !pointerType || pointerType === 'mouse';
  };
  const onEnter = (event: Event): void => {
    if (!isMouse(event)) return;
    value = 1;
    tickerRef?.wake();
  };
  const onLeave = (event: Event): void => {
    if (!isMouse(event)) return;
    value = 0;
    tickerRef?.wake();
  };

  return {
    get value() {
      return value;
    },
    attach(ticker) {
      if (listening) this.detach();
      tickerRef = ticker;
      el.addEventListener(enterEvent, onEnter, { passive: true } as AddEventListenerOptions);
      el.addEventListener(leaveEvent, onLeave, { passive: true } as AddEventListenerOptions);
      el.addEventListener('pointercancel', onLeave, { passive: true } as AddEventListenerOptions);
      listening = true;
    },
    detach() {
      el.removeEventListener(enterEvent, onEnter);
      el.removeEventListener(leaveEvent, onLeave);
      el.removeEventListener('pointercancel', onLeave);
      tickerRef = null;
      value = 0;
      listening = false;
    },
  };
}
