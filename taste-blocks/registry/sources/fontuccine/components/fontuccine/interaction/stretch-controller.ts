/**
 * stretch-controller.ts — composes a stimulus + a smoother into the per-frame
 * stretch scalar that feeds the core `buildRemap`/`layoutRun`.
 *
 * This layer OWNS ticker + stimuli + springs + gating. It does NOT render:
 * renderers subscribe to the ticker's RENDER phase and read `.value` (R2).
 *
 * Honors the README config fields: `trigger`, `axis`, `maxStretchRatio`,
 * `minStretchRatio`, `velocityToStretch`, `proximityRadius`,
 * `physics{stiffness,damping}` OR `easingCurve`/`easingDuration`,
 * `respectReducedMotion`.
 * Target is clamped to [minStretchRatio, maxStretchRatio]; under reduced motion
 * output is pinned to the resting value (R7).
 *
 * Sleep (R5/battery): the controller registers a liveness predicate
 * `() => !smoother.settled`, so once the stretch settles the ticker stops.
 * Input handlers in the stimuli call `ticker.wake()`.
 */
import type { Ticker } from './ticker';
import { ticker as sharedTicker } from './ticker';
import type { Smoother } from './spring';
import { createSpring } from './spring';
import { createBezierSmoother } from './easing';
import { prefersReducedMotion } from './reduced-motion';
import { observeVisibility } from './gating';
import type { IntersectionObserverLike, IntersectionEntryLike } from './gating';
import type { RectSource, Stimulus } from './stimuli/types';
import { createScrollVelocityStimulus } from './stimuli/scroll-velocity';
import { createProximityStimulus } from './stimuli/proximity';
import { createHoverStimulus } from './stimuli/hover';

export type Trigger = 'scroll-velocity' | 'mouse-proximity' | 'hover' | 'custom';
export type StretchAxis = 'horizontal' | 'vertical' | 'dual';

export interface StretchControllerConfig {
  trigger?: Trigger;
  axis?: StretchAxis;

  maxStretchRatio?: number;
  minStretchRatio?: number;
  velocityToStretch?: number;
  proximityRadius?: number;

  /** Critically-damped spring params (default). Mutually exclusive with easingCurve. */
  physics?: { stiffness?: number; damping?: number };
  /** cubic-bezier easing string (alternative to physics). */
  easingCurve?: string;
  /** Tween duration for easingCurve, seconds (default 0.3). */
  easingDuration?: number;

  respectReducedMotion?: boolean;

  // ---- injectable deps (not part of the README schema) ----
  /** Element for pointer/proximity/hover stimuli and visibility gating. */
  element?: (RectSource & EventTarget) | null;
  /** Ticker to bind to (default: the shared library ticker). */
  ticker?: Ticker;
  /** Provide a stimulus explicitly (overrides `trigger`-based construction). */
  stimulus?: Stimulus | null;
  /** Override reduced-motion detection (for tests). */
  isReducedMotion?: () => boolean;
  /** Resting (no-stretch) value. Default 1. */
  restingValue?: number;
  /** Enable IntersectionObserver gating when an element is present. Default true. */
  gate?: boolean;
  /** Injectable IO factory for gating (tests / custom roots). */
  intersectionObserverFactory?: (
    cb: (entries: IntersectionEntryLike[]) => void,
  ) => IntersectionObserverLike;
}

export interface StretchController {
  /** Current smoothed stretch scalar. Read in the RENDER phase. */
  readonly value: number;
  /** Current (clamped) target the smoother is chasing. */
  readonly target: number;
  readonly axis: StretchAxis;
  readonly trigger: Trigger;
  /** Manual drive (trigger: 'custom'). Value is clamped to [min,max]. */
  set(value: number): void;
  /** True while attached to the ticker (visible). */
  readonly active: boolean;
  /** Tear down: stimulus, subscriptions, gate. Leaks nothing. */
  destroy(): void;
}

const MAX_DT = 0.064;

export function createStretchController(config: StretchControllerConfig = {}): StretchController {
  const ticker = config.ticker ?? sharedTicker;
  const axis: StretchAxis = config.axis ?? 'horizontal';
  const trigger: Trigger = config.trigger ?? 'custom';
  const resting = config.restingValue ?? 1;
  const min = config.minStretchRatio ?? 1;
  const max = config.maxStretchRatio ?? 4.5;
  const velocityToStretch = config.velocityToStretch ?? 0.002;
  const respectRM = config.respectReducedMotion ?? true;
  const isRM = config.isReducedMotion ?? prefersReducedMotion;

  const clamp = (t: number): number => (t < min ? min : t > max ? max : t);

  const smoother: Smoother = config.easingCurve
    ? createBezierSmoother({
        curve: config.easingCurve,
        duration: config.easingDuration ?? 0.3,
        initial: resting,
      })
    : createSpring({
        stiffness: config.physics?.stiffness ?? 170,
        damping: config.physics?.damping,
        initial: resting,
      });

  const stimulus: Stimulus | null =
    config.stimulus !== undefined ? config.stimulus : buildStimulus();

  function buildStimulus(): Stimulus | null {
    switch (trigger) {
      case 'scroll-velocity':
        return createScrollVelocityStimulus();
      case 'mouse-proximity':
        return config.element
          ? createProximityStimulus({ element: config.element, radius: config.proximityRadius })
          : null;
      case 'hover':
        return config.element ? createHoverStimulus({ element: config.element }) : null;
      case 'custom':
      default:
        return null;
    }
  }

  let manualTarget = resting;
  let lastT = 0;
  let active = false;
  const phaseUnsubs: Array<() => void> = [];

  function deriveTarget(): number {
    if (respectRM && isRM()) return clamp(resting);
    switch (trigger) {
      case 'scroll-velocity': {
        const vraw = stimulus ? stimulus.value : 0;
        const extra = Math.min(max - resting, Math.abs(vraw) * velocityToStretch);
        return clamp(resting + extra);
      }
      case 'mouse-proximity':
      case 'hover': {
        const p = stimulus ? stimulus.value : 0;
        return clamp(resting + p * (max - resting));
      }
      case 'custom':
      default:
        return clamp(manualTarget);
    }
  }

  function onUpdate(now: number): void {
    const dt = lastT ? Math.min(MAX_DT, (now - lastT) / 1000) : 1 / 60;
    lastT = now;
    smoother.set(deriveTarget());
    smoother.step(dt);
  }

  function activate(): void {
    if (active) return;
    active = true;
    lastT = 0;
    // Stimulus subscribes its phases FIRST so its value is fresh before onUpdate reads it.
    stimulus?.attach(ticker);
    phaseUnsubs.push(ticker.update(onUpdate));
    phaseUnsubs.push(ticker.onActivity(() => !smoother.settled));
    ticker.wake();
  }

  function deactivate(): void {
    if (!active) return;
    active = false;
    for (const u of phaseUnsubs) u();
    phaseUnsubs.length = 0;
    stimulus?.detach();
  }

  // ---- lifecycle: gate on visibility if we have an element ----
  const gateEnabled = (config.gate ?? true) && !!config.element;
  let gateDispose: () => void = () => {};

  if (gateEnabled && config.element) {
    gateDispose = observeVisibility(
      config.element,
      (visible) => (visible ? activate() : deactivate()),
      config.intersectionObserverFactory ? { factory: config.intersectionObserverFactory } : {},
    );
  } else {
    activate();
  }

  return {
    get value() {
      return smoother.value;
    },
    get target() {
      return smoother.target;
    },
    axis,
    trigger,
    get active() {
      return active;
    },
    set(value: number) {
      manualTarget = value;
      ticker.wake();
    },
    destroy() {
      gateDispose();
      deactivate();
    },
  };
}
