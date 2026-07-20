/**
 * Shared animation constants for SmoothUI components.
 *
 * Spring configs follow project guidelines:
 * - Duration 0.2–0.25s for UI elements
 * - Bounce ≤ 0.1 for standard UI (higher only for playful/drag interactions)
 *
 * Easing curves use cubic-bezier arrays compatible with Motion's `ease` property.
 */

/** Default spring for most UI animations */
export const SPRING_DEFAULT = {
  type: "spring" as const,
  duration: 0.25,
  bounce: 0.1,
};

/** Snappy spring for quick, no-overshoot transitions */
export const SPRING_SNAPPY = {
  type: "spring" as const,
  duration: 0.2,
  bounce: 0,
};

/** Ease-out curve for entering elements — cubic-bezier(.23, 1, .32, 1) */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Ease-in-out curve for moving elements — cubic-bezier(0.645, 0.045, 0.355, 1) */
export const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const;

/** Instant transition for reduced-motion contexts */
export const DURATION_INSTANT = { duration: 0 };

/** Standard animation durations (seconds) */
export const DURATION = {
  fast: 0.15,
  default: 0.25,
  slow: 0.3,
  complex: 0.4,
} as const;

export type SpringConfig = typeof SPRING_DEFAULT;
export type EasingCurve = readonly [number, number, number, number];
