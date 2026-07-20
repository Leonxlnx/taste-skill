/**
 * webgl/gl/shared.ts — the ONE shared WebGL2 backend for the whole page.
 *
 * RESEARCH §2: one shared canvas/context for every instance (layer-memory
 * discipline) — NEVER a context per element. This ref-counted singleton creates
 * exactly one fixed, full-viewport, pointer-inert canvas + one WebGL2 backend;
 * every renderer draws into its own screen region via scissor. The single
 * `contextCreationCount` is asserted by test/webgl-context.test.ts.
 *
 * A backend factory is injectable so tests substitute a mock (no GPU in Node).
 */
import type { RenderBackend } from './device';
import { WebGL2Backend } from './device';

/** Page-global slice-grid resolution (all instances share one grid). */
export const DEFAULT_GRID_SLICES = 96;

export type BackendFactory = (slices: number) => RenderBackend | null;

let factory: BackendFactory | null = null;
let backend: RenderBackend | null = null;
let refCount = 0;
let gridSlices = DEFAULT_GRID_SLICES;
/** Requested resolutions we've already warned about (dedupe: warn once each). */
const warnedFinerSlices = new Set<number>();

/** Inject a backend factory (tests). Pass null to restore the default. */
export function setBackendFactory(fn: BackendFactory | null): void {
  factory = fn;
}

function defaultFactory(slices: number): RenderBackend | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-fontuccine', 'webgl-shared');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2147483646',
  } as CSSStyleDeclaration);
  document.body?.appendChild(canvas);
  const b = new WebGL2Backend(canvas, slices);
  return b.supported ? b : null;
}

/**
 * Acquire the shared backend (creating it once). `slices` is the caller's grid
 * resolution; the shared grid is sized to the MAX requested so a coarser
 * instance is always exact and a finer one never under-samples a stretch bend.
 * Returns null when WebGL2 is unavailable (engine drops to the SVG tier).
 */
export function acquireSharedBackend(slices = DEFAULT_GRID_SLICES): RenderBackend | null {
  if (slices > gridSlices && backend && !warnedFinerSlices.has(slices)) {
    // A finer instance arrived after the grid was built. The grid is page-global
    // and rebuilding it mid-session is out of scope for this phase, so the coarser
    // existing grid is kept. Warn once per distinct requested resolution so a page
    // with many instances doesn't flood the console. Coarser instances are fine.
    warnedFinerSlices.add(slices);
    // eslint-disable-next-line no-console
    console.warn(
      `[fontuccine/webgl] requested lutResolution ${slices} is finer than the active ` +
        `shared grid resolution ${gridSlices}. The WebGL tier's slice grid is page-global ` +
        `(shared across all instances), so the coarser existing grid of ${gridSlices} is used ` +
        `for this instance. Raise DEFAULT_GRID_SLICES if a finer grid is needed page-wide.`,
    );
  }
  if (!backend) {
    gridSlices = Math.max(gridSlices, slices);
    backend = (factory ?? defaultFactory)(gridSlices);
  }
  if (backend) refCount++;
  return backend;
}

/** Release one reference; destroys the backend when the last instance leaves. */
export function releaseSharedBackend(): void {
  if (!backend) return;
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    backend.destroy();
    backend = null;
    gridSlices = DEFAULT_GRID_SLICES;
    warnedFinerSlices.clear();
  }
}

/** Test hook: force-reset the singleton (does NOT run destroy). */
export function __resetSharedBackend(): void {
  backend = null;
  refCount = 0;
  gridSlices = DEFAULT_GRID_SLICES;
  warnedFinerSlices.clear();
}
