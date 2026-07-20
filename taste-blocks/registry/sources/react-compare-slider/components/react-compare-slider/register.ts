'use client';

import { ReactCompareSliderCssVars } from './consts';

export const register = () => {
  try {
    if (typeof CSS !== 'undefined') {
      /**
       * We use a custom property to optimise the transition performance of the slider. It ensures the
       * transitions fire smoothly at the exact same time on different elements. Otherwise, the handle
       * and item transitions may not move in sync. This is especially noticeable in Safari.
       */
      CSS.registerProperty({
        name: ReactCompareSliderCssVars.rawPosition,
        syntax: '<percentage>',
        inherits: true,
        initialValue: '50%',
      });
    }
  } catch {}
};
