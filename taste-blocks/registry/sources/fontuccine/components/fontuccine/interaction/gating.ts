/**
 * gating.ts — IntersectionObserver visibility gate (R5).
 *
 * Offscreen or document-hidden instances must go fully idle: the controller
 * uses this to suspend its ticker subscriptions + stimulus listeners and resume
 * only when both gates are visible. When IntersectionObserver is unavailable
 * (Node/SSR) the viewport gate is treated as visible.
 */

export interface IntersectionEntryLike {
  isIntersecting: boolean;
}

export interface IntersectionObserverLike {
  observe(target: unknown): void;
  unobserve(target: unknown): void;
  disconnect(): void;
}

export interface VisibilityOptions {
  /** Injectable observer factory (default: global IntersectionObserver). */
  factory?: (cb: (entries: IntersectionEntryLike[]) => void) => IntersectionObserverLike;
  threshold?: number | number[];
  root?: unknown;
  rootMargin?: string;
}

/**
 * Observe `el`'s viewport and document visibility. `cb(visible)` fires on every
 * change (and once synchronously if no observer is available). Returns a
 * teardown fn.
 */
export function observeVisibility(
  el: unknown,
  cb: (visible: boolean) => void,
  opts: VisibilityOptions = {},
): () => void {
  const doc =
    (el as { ownerDocument?: Document } | null)?.ownerDocument ??
    (typeof document !== 'undefined' ? document : undefined);
  let intersecting = !opts.factory && typeof IntersectionObserver === 'undefined';
  let documentVisible = doc?.visibilityState !== 'hidden';
  const emit = (): void => cb(intersecting && documentVisible);
  const handler = (entries: IntersectionEntryLike[]): void => {
    for (const e of entries) {
      intersecting = e.isIntersecting;
      emit();
    }
  };
  const onDocumentVisibility = (): void => {
    documentVisible = doc?.visibilityState !== 'hidden';
    emit();
  };
  doc?.addEventListener('visibilitychange', onDocumentVisibility);

  const cleanup = (io?: IntersectionObserverLike): void => {
    io?.disconnect();
    doc?.removeEventListener('visibilitychange', onDocumentVisibility);
  };

  if (opts.factory) {
    const io = opts.factory(handler);
    io.observe(el);
    return () => cleanup(io);
  }

  if (typeof IntersectionObserver === 'undefined') {
    emit(); // headless: assume viewport-visible, while still honoring a document.
    return cleanup;
  }

  const io = new IntersectionObserver(
    (entries) => handler(entries as unknown as IntersectionEntryLike[]),
    { threshold: opts.threshold ?? 0, root: (opts.root ?? null) as Element | null, rootMargin: opts.rootMargin ?? '0px' },
  );
  io.observe(el as Element);
  return () => cleanup(io);
}
