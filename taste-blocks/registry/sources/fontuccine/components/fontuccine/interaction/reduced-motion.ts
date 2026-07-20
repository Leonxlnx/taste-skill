/**
 * reduced-motion.ts — `prefers-reduced-motion` query + change subscription.
 *
 * R7: under reduced motion, stimuli clamp to their resting value (static
 * output). This module only reports the preference; the controller does the
 * pinning. All access is guarded so it is a safe no-op in Node/SSR.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

/** True if the user prefers reduced motion. Returns false when unavailable. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' ? matchMedia(QUERY).matches : false;
}

/** Subscribe to reduced-motion preference changes. Returns an unsubscribe fn. */
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  if (typeof matchMedia === 'undefined') return () => {};
  const mql = matchMedia(QUERY);
  const handler = () => cb(mql.matches);
  // Older Safari exposes addListener/removeListener; guard both APIs.
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }
  const legacy = mql as unknown as {
    addListener?: (h: () => void) => void;
    removeListener?: (h: () => void) => void;
  };
  legacy.addListener?.(handler);
  return () => legacy.removeListener?.(handler);
}
