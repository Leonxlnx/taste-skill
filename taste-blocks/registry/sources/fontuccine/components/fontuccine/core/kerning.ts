/**
 * kerning.ts — advances + kerning in STRETCHED space (RESEARCH §5.6).
 *
 * ── The rule (functional decision, surfaced to the user via the architect) ──
 * Empty space — left/right side bearings AND inter-glyph kerning — is treated
 * as fully-stretchy (flex = 1), exactly like an empty slice in the flex model.
 * A glyph's INK also grows to W·stretch in total (invariant I1), with its
 * internal distribution protecting strokes/serifs. Since ink-extent, side
 * bearings and kerns all scale by the same ratio, a horizontal stretch of
 * ratio r multiplies every glyph advance and every kern by exactly r:
 *
 *     stretchedAdvance = advanceWidth · r
 *     stretchedKern    = kernBefore   · r
 *     runWidth         = r · Σ(advanceWidth + kernBefore)
 *
 * At r === 1 this reproduces the native metrics EXACTLY (regression anchor).
 * The per-glyph frame origin `penX` is offset so the glyph's own remap
 * (anchored at bounds.min) lands its ink at the stretched left side bearing:
 *
 *     penX = cursor + bounds.min·(r − 1)     // renderer draws penX + remap(x)
 *
 * This is deliberately simple and easy to change: if a future design wants
 * side bearings to stay RIGID (ink-only stretch), only this file changes —
 * set stretchedKern = kernBefore and penX/advance accordingly.
 */
import type { Bounds1D } from './types';
import { buildRemap } from './lut';
import type { Remap } from './types';

export interface LayoutGlyph {
  /** Static flex profile for the layout axis. */
  profile: Float32Array;
  /** Ink bounds along the layout axis (glyph coordinate space). */
  bounds: Bounds1D;
  /** Advance width (pen advance) in glyph units. */
  advanceWidth: number;
  /** Kerning applied BEFORE this glyph (0 for the first). */
  kernBefore?: number;
}

export interface LayoutGlyphResult {
  /** Frame origin: render outline points as penX + remap(pointX). */
  penX: number;
  /** Stretched advance for this glyph. */
  advance: number;
  /** Stretched kern applied before this glyph. */
  kern: number;
  /** Stretched ink left/right edges in run space. */
  inkLeft: number;
  inkRight: number;
  /** The glyph's per-frame remap (origin anchored at bounds.min). */
  remap: Remap;
}

export interface LayoutRunOptions {
  axis?: 'x';
  stretch: number;
  /** Run origin (default 0). */
  origin?: number;
}

export interface LayoutRunResult {
  glyphs: LayoutGlyphResult[];
  /** Total stretched run width = Σ(advance + kern). */
  width: number;
}

/**
 * Lay out a run of glyphs in stretched space.
 * Only axis 'x' (horizontal) is implemented; 'y' would mirror using vertical
 * metrics, which glyphs here do not carry.
 */
export function layoutRun(glyphs: LayoutGlyph[], options: LayoutRunOptions): LayoutRunResult {
  const { stretch, origin = 0 } = options;
  const axis = options.axis ?? 'x';
  if (axis !== 'x') {
    throw new Error(`layoutRun: axis '${axis}' not supported (only 'x')`);
  }

  const out: LayoutGlyphResult[] = [];
  let cursor = origin;

  for (const g of glyphs) {
    const kern = (g.kernBefore ?? 0) * stretch; // empty → fully stretchy
    cursor += kern;

    const remap = buildRemap(g.profile, {
      min: g.bounds.min,
      max: g.bounds.max,
      stretch,
    });

    // remap anchors ink-left at bounds.min; shift the frame so it lands at the
    // stretched left side bearing.
    const penX = cursor + g.bounds.min * (stretch - 1);
    const inkLeft = penX + remap.remap(g.bounds.min);
    const inkRight = penX + remap.remap(g.bounds.max);

    const advance = g.advanceWidth * stretch;

    out.push({ penX, advance, kern, inkLeft, inkRight, remap });
    cursor += advance;
  }

  return { glyphs: out, width: cursor - origin };
}
