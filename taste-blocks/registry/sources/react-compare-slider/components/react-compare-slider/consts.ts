export const ReactCompareSliderClip = {
  all: 'all',
  itemOne: 'itemOne',
  itemTwo: 'itemTwo',
} as const;

export type ReactCompareSliderClipValue =
  (typeof ReactCompareSliderClip)[keyof typeof ReactCompareSliderClip];

export const ReactCompareSliderCssVars = {
  /** The unclamped position of the slider as a percentage. */
  rawPosition: '--rcs-raw-position',
  /** The clamped position of the slider with bounds padding applied. */
  currentPosition: '--rcs-current-position',
  /** The `boundsPadding` prop value. */
  boundsPadding: '--rcs-bounds-padding',
  /** The color of the handle border and arrows. */
  handleColor: '--rcs-handle-color',
} as const;
