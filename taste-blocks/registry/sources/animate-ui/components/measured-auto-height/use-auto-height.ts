'use client';

import * as React from 'react';

type AutoHeightOptions = {
  includeParentBox?: boolean;
  includeSelfBox?: boolean;
};

export function useAutoHeight<T extends HTMLElement = HTMLDivElement>(
  deps: React.DependencyList = [],
  options: AutoHeightOptions = {
    includeParentBox: true,
    includeSelfBox: false,
  },
) {
  const ref = React.useRef<T | null>(null);
  const roRef = React.useRef<ResizeObserver | null>(null);
  const [height, setHeight] = React.useState<number>();

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return 0;

    const base = el.getBoundingClientRect().height || 0;

    let extra = 0;

    if (options.includeParentBox && el.parentElement) {
      const cs = getComputedStyle(el.parentElement);
      const paddingY =
        (parseFloat(cs.paddingTop || '0') || 0) +
        (parseFloat(cs.paddingBottom || '0') || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || '0') || 0) +
        (parseFloat(cs.borderBottomWidth || '0') || 0);
      const isBorderBox = cs.boxSizing === 'border-box';
      if (isBorderBox) {
        extra += paddingY + borderY;
      }
    }

    if (options.includeSelfBox) {
      const cs = getComputedStyle(el);
      const paddingY =
        (parseFloat(cs.paddingTop || '0') || 0) +
        (parseFloat(cs.paddingBottom || '0') || 0);
      const borderY =
        (parseFloat(cs.borderTopWidth || '0') || 0) +
        (parseFloat(cs.borderBottomWidth || '0') || 0);
      const isBorderBox = cs.boxSizing === 'border-box';
      if (isBorderBox) {
        extra += paddingY + borderY;
      }
    }

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const total = Math.ceil((base + extra) * dpr) / dpr;

    return total;
  }, [options.includeParentBox, options.includeSelfBox]);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    setHeight(measure());

    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }

    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      const next = measure();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setHeight(next));
    });

    ro.observe(el);

    roRef.current = ro;

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      roRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, measure]);

  React.useLayoutEffect(() => {
    if (height === undefined) {
      const next = measure();
      setHeight(next);
    }
  }, [height, measure]);

  return { ref, height } as const;
}
