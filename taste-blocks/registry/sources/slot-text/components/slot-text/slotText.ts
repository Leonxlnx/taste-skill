import { TUNING } from "./constants.js";
import {
  addMissingCharacterSlots,
  canRenderSlotLayout,
  getCharacterSlots,
  isSlotLayoutReady,
  measureChangedSlots,
  measureCharacterHeight,
  prepareSlotAnimation,
  renderPlainText,
  renderCharacterSlots,
  scheduleSlotAnimation,
} from "./dom.js";
import { segmentTextIntoGraphemes } from "./text.js";
import { resolveAnimationOptions } from "./timing.js";

const { chromatic: chromaticTuning, lifecycle } = TUNING;

/**
 * Browser-only text-roll animation. Each grapheme owns one clipped slot; the
 * previous face rolls out while the next face rolls in.
 */
/** Options shared by the low-level animation and all framework adapters. */
export interface SlotOptions {
  /** "down" rolls glyphs downward (enter from top); "up" rolls upward. */
  direction?: "up" | "down";
  /** Per-character stagger in ms (default 45). */
  stagger?: number;
  /** Slide duration per character in ms (default 300). */
  duration?: number;
  /** How long the incoming glyph trails the outgoing one, in ms (default 50). */
  exitOffset?: number;
  /** Easing — defaults to a springy, overshooting "back" curve. */
  easing?: string;
  /**
   * Per-letter personality: 0 makes every glyph move identically; 1 adds the
   * strongest timing variation and tilt. Default 0.6.
   */
  bounce?: number;
  /**
   * Incoming glyph tint. Pass one CSS color, or return a color for each
   * `(segmentIndex, segmentCount)` pair.
   */
  color?: string | ((segmentIndex: number, segmentCount: number) => string);
  /** Tint fade duration in ms (default 280). */
  colorFade?: number;
  /**
   * Keep graphemes that are identical at the same index static. Disable this
   * when differently sized strings are not positionally aligned.
   */
  skipUnchanged?: boolean;
  /**
   * true interrupts the running roll. false lets it finish, then plays only
   * the latest queued target. Default true.
   */
  interrupt?: boolean;
}

export interface ChromaticOptions {
  /** Starting hue in degrees. Default 0. */
  from?: number;
  /** Hue distance from first to last grapheme. Default 320 degrees. */
  spread?: number;
  /** HSL saturation percentage. Default 92. */
  saturation?: number;
  /** HSL lightness percentage. Default 60. */
  lightness?: number;
}

/** Build a color function that sweeps a hue range across the text. */
export function chromatic({
  from = chromaticTuning.hueStartDegrees,
  spread = chromaticTuning.hueSpreadDegrees,
  saturation = chromaticTuning.saturationPercent,
  lightness = chromaticTuning.lightnessPercent,
}: ChromaticOptions = {}) {
  return (segmentIndex: number, segmentCount: number) => {
    const lastSegmentIndex = segmentCount - 1;
    const progress =
      segmentCount <= 1 ? 0 : segmentIndex / lastSegmentIndex;
    const hueDegrees =
      (from + progress * spread) % chromaticTuning.fullHueRotationDegrees;
    return `hsl(${hueDegrees} ${saturation}% ${lightness}%)`;
  };
}

interface AnimationState {
  timerIds: number[];
  targetText: string;
  pendingAnimation?: { text: string; options: SlotOptions };
}

const animationStates = new WeakMap<HTMLElement, AnimationState>();
const initializedContainers = new WeakSet<HTMLElement>();

function shouldReduceMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function cancelRunningAnimation(container: HTMLElement) {
  const animationState = animationStates.get(container);
  if (!animationState) return undefined;
  animationState.timerIds.forEach((timerId) => window.clearTimeout(timerId));
  animationStates.delete(container);
  return animationState;
}

/** Render settled text, falling back to plain text until the CSS is ready. */
export function renderTextWithCssFallback(
  container: HTMLElement,
  text: string,
) {
  initializedContainers.add(container);
  if (canRenderSlotLayout()) renderCharacterSlots(container, text);
  else renderPlainText(container, text);
}

function finishRunningAnimationImmediately(container: HTMLElement) {
  const animationState = cancelRunningAnimation(container);
  if (animationState) {
    renderTextWithCssFallback(container, animationState.targetText);
  }
}

/** Build slot markup immediately and cancel any animation that owns it. */
export function buildSlotText(container: HTMLElement, text: string) {
  cancelRunningAnimation(container);
  initializedContainers.add(container);
  renderCharacterSlots(container, text);
}

function scheduleAnimationTask(
  animationState: AnimationState,
  callback: () => void,
  delayMs: number,
) {
  const timerId = window.setTimeout(callback, delayMs);
  animationState.timerIds.push(timerId);
}

export function animateSlotText(
  container: HTMLElement,
  targetText: string,
  options: SlotOptions = {},
) {
  if (shouldReduceMotion()) {
    cancelRunningAnimation(container);
    renderTextWithCssFallback(container, targetText);
    return;
  }

  const resolvedOptions = resolveAnimationOptions(options);
  const runningAnimation = animationStates.get(container);

  if (runningAnimation && !resolvedOptions.interrupt) {
    runningAnimation.pendingAnimation =
      targetText === runningAnimation.targetText
        ? undefined
        : { text: targetText, options };
    return;
  }

  finishRunningAnimationImmediately(container);

  let characterSlots = getCharacterSlots(container);
  if (characterSlots.length === 0) {
    if (!initializedContainers.has(container)) {
      renderTextWithCssFallback(container, targetText);
      return;
    }

    if (!canRenderSlotLayout()) {
      renderPlainText(container, targetText);
      return;
    }

    renderCharacterSlots(container, container.textContent ?? "");
    characterSlots = getCharacterSlots(container);
  }

  const firstCharacterSlot = characterSlots[0];
  if (firstCharacterSlot && !isSlotLayoutReady(firstCharacterSlot)) {
    renderPlainText(container, targetText);
    return;
  }

  const currentSegments = characterSlots.map((slot) => slot.dataset.char ?? "");
  const targetSegments = segmentTextIntoGraphemes(targetText);
  if (
    !resolvedOptions.interrupt &&
    currentSegments.length === targetSegments.length &&
    currentSegments.every(
      (segment, index) => segment === targetSegments[index],
    )
  ) {
    return;
  }

  const requiredSlotCount = Math.max(currentSegments.length, targetSegments.length);
  addMissingCharacterSlots(container, characterSlots, requiredSlotCount);

  const containerStyle = getComputedStyle(container);
  const characterHeight = measureCharacterHeight(container, characterSlots, containerStyle);
  const restingColor = resolvedOptions.color ? containerStyle.color : "";
  const changedSlotMeasurements = measureChangedSlots(
    characterSlots,
    currentSegments,
    targetSegments,
    resolvedOptions.skipUnchanged,
  );

  if (changedSlotMeasurements.length === 0) {
    renderCharacterSlots(container, targetText);
    return;
  }

  const animationState: AnimationState = { timerIds: [], targetText };
  animationStates.set(container, animationState);
  const preparedSlotAnimations = changedSlotMeasurements.map((measurement) =>
    prepareSlotAnimation(
      measurement,
      targetSegments.length,
      characterHeight,
      resolvedOptions,
    ),
  );

  // Commit every start style with one layout flush instead of one per glyph.
  void container.offsetWidth;
  preparedSlotAnimations.forEach((preparedSlotAnimation) =>
    scheduleSlotAnimation(
      preparedSlotAnimation,
      characterHeight,
      restingColor,
      resolvedOptions,
      (callback, delayMs) =>
        scheduleAnimationTask(animationState, callback, delayMs),
    ),
  );

  const completionDelayMs =
    Math.max(...preparedSlotAnimations.map(({ completionTimeMs }) => completionTimeMs)) +
    lifecycle.completionBufferMs;
  scheduleAnimationTask(animationState, () => {
    if (animationStates.get(container) !== animationState) return;
    const pendingAnimation = animationState.pendingAnimation;
    animationStates.delete(container);
    renderTextWithCssFallback(container, targetText);
    if (pendingAnimation) {
      animateSlotText(container, pendingAnimation.text, pendingAnimation.options);
    }
  }, completionDelayMs);
}

export function clearSlotText(container: HTMLElement, text = "") {
  cancelRunningAnimation(container);
  initializedContainers.delete(container);
  renderPlainText(container, text);
}
