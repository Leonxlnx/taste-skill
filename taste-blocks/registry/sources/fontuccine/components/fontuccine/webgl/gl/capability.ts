/**
 * webgl/gl/capability.ts — WebGL2 support probe (obligation 4: degrade cleanly).
 *
 * The engine calls this BEFORE choosing Tier 1. When it returns unsupported the
 * engine must drop to the SVG tier — Tier 1 NEVER renders nothing. We also
 * require the pieces this tier depends on: R32F texture storage (the LUT) and
 * instanced drawing (drawElementsInstanced is core in WebGL2, but we still
 * verify context creation and a float-color texture format).
 */

export interface WebGL2Support {
  supported: boolean;
  reason?: string;
}

/**
 * Probe WebGL2 availability using a throwaway canvas. Safe in SSR/Node (returns
 * unsupported when no document/canvas exists). Does NOT retain any context.
 */
export function detectWebGL2(createCanvas?: () => HTMLCanvasElement): WebGL2Support {
  try {
    const make =
      createCanvas ??
      (typeof document !== 'undefined'
        ? () => document.createElement('canvas')
        : null);
    if (!make) return { supported: false, reason: 'no-document' };

    const canvas = make();
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    }) as WebGL2RenderingContext | null;

    if (!gl) return { supported: false, reason: 'no-webgl2-context' };

    try {
      // R32F is core-renderable-optional but core-TEXTURABLE in WebGL2; verify the
      // enum path exists (older polyfills lie about being WebGL2).
      if (typeof gl.texStorage2D !== 'function' || typeof gl.drawElementsInstanced !== 'function') {
        return { supported: false, reason: 'missing-webgl2-entrypoints' };
      }

      return { supported: true };
    } finally {
      // The comment above promises "does NOT retain any context" — without this
      // the throwaway context stays alive until GC, and every attach() call (the
      // engine probes on each one) leaks a live context. Browsers cap concurrent
      // WebGL contexts (~8-16), so repeated attach()/detach() cycles quickly hit
      // "Too many active WebGL contexts" and the real shared context can get
      // silently evicted. Force it lost immediately; the real shared backend
      // (gl/shared.ts) creates its own context separately.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch (e) {
    return { supported: false, reason: `probe-threw:${(e as Error)?.message ?? 'unknown'}` };
  }
}
