import type { SlotOptions } from "./slotText.js";
import { TUNING } from "./constants.js";

const { animation, glyph, variation, width } = TUNING;

export interface ResolvedSlotOptions {
  direction: "up" | "down";
  stagger: number;
  duration: number;
  exitOffset: number;
  easing: string;
  bounce: number;
  color?: string | ((segmentIndex: number, segmentCount: number) => string);
  colorFade: number;
  skipUnchanged: boolean;
  interrupt: boolean;
}

export interface GlyphTiming {
  durationMs: number;
  startDelayMs: number;
  startingTiltDegrees: number;
}

export interface WidthTiming {
  durationMs: number;
  startDelayMs: number;
}

export function resolveAnimationOptions(
  options: SlotOptions,
): ResolvedSlotOptions {
  return {
    direction: options.direction ?? animation.direction,
    stagger: options.stagger ?? animation.stagger,
    duration: options.duration ?? animation.duration,
    exitOffset: options.exitOffset ?? animation.exitOffset,
    easing: options.easing ?? animation.easing,
    bounce: options.bounce ?? animation.bounce,
    color: options.color,
    colorFade: options.colorFade ?? animation.colorFade,
    skipUnchanged: options.skipUnchanged ?? animation.skipUnchanged,
    interrupt: options.interrupt ?? animation.interrupt,
  };
}

/** Return stable pseudo-random variation in the range -1 to 1. */
function getDeterministicVariation(
  segmentIndex: number,
  variationChannel: number,
) {
  // Start at one so the first grapheme never uses a zero seed.
  const oneBasedSegmentIndex = segmentIndex + 1;
  const pseudoRandomSeed =
    Math.sin(
      oneBasedSegmentIndex * variation.indexFrequency +
        variationChannel * variation.channelFrequency,
    ) * variation.seedScale;
  const zeroToOne = pseudoRandomSeed - Math.floor(pseudoRandomSeed);
  // Stretch 0..1 to 0..2, then center it around zero to get -1..1.
  return zeroToOne * 2 - 1;
}

export function calculateGlyphTiming(
  segmentIndex: number,
  targetSegmentCount: number,
  isTrailingSlot: boolean,
  options: Pick<
    ResolvedSlotOptions,
    "duration" | "stagger" | "bounce"
  >,
): GlyphTiming {
  const { duration, stagger, bounce } = options;
  const variationMultiplier = (strength: number, channel: number) =>
    1 + bounce * strength * getDeterministicVariation(segmentIndex, channel);
  const durationMs = Math.round(
    duration *
      (isTrailingSlot ? glyph.tailDurationMultiplier : 1) *
      variationMultiplier(glyph.durationVariationStrength, variation.durationChannel),
  );
  const staggerPosition = isTrailingSlot
    ? targetSegmentCount * glyph.tailStaggerStartMultiplier +
      (segmentIndex - targetSegmentCount) *
        glyph.tailStaggerStepMultiplier
    : segmentIndex;
  const startingTiltDegrees = Number(
    (
      bounce *
      glyph.maximumTiltDegrees *
      getDeterministicVariation(
        segmentIndex,
        variation.tiltChannel,
      )
    ).toFixed(glyph.tiltDecimalPlaces),
  );

  return {
    durationMs,
    startDelayMs: Math.round(
      staggerPosition *
        stagger *
        variationMultiplier(glyph.staggerVariationStrength, variation.staggerChannel),
    ),
    startingTiltDegrees,
  };
}

export function calculateWidthTiming(
  currentSegment: string,
  targetSegment: string,
  timing: GlyphTiming,
): WidthTiming {
  const scaledDuration = (multiplier: number) =>
    Math.max(
      width.minimumTransitionMs,
      Math.round(timing.durationMs * multiplier),
    );

  if (targetSegment === "") {
    return {
      startDelayMs:
        timing.startDelayMs +
        Math.round(timing.durationMs * width.tailCollapseDelayMultiplier),
      durationMs: scaledDuration(width.tailCollapseDurationMultiplier),
    };
  }

  if (currentSegment === "") {
    return {
      startDelayMs: timing.startDelayMs,
      durationMs: scaledDuration(width.newSlotExpansionDurationMultiplier),
    };
  }

  return {
    startDelayMs: timing.startDelayMs,
    durationMs: timing.durationMs,
  };
}
