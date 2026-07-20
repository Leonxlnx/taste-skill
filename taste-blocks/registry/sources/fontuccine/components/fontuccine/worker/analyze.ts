/**
 * worker/analyze.ts — the PURE analysis entry point.
 *
 * No DOM, no Worker globals: this is what BOTH the tests and the worker call.
 * Given an AnalyzeRequest it samples the outline ONCE, then computes a flex
 * profile per requested axis (static — stretch amount is never an input).
 */
import type { AnalyzeRequest, AnalyzeResponse, AxisProfile, Axis } from '../core/types';
import { sampleOutline, sampleBounds } from '../core/sampling/outline';
import { computeFlexProfile, buildFlexField } from '../core/flex-profile';

export function analyzeGlyph(req: AnalyzeRequest): AnalyzeResponse {
  const { params } = req;
  const outline = sampleOutline(req.commands, { samplesPerSegment: params.samplesPerSegment });
  const bb = sampleBounds(outline);
  const bbox =
    Number.isFinite(bb.minX)
      ? bb
      : { minX: 0, minY: 0, maxX: 0, maxY: 0 }; // blank/empty glyph

  // Sample, winding-filter and build the k-d tree ONCE; both axes share it.
  const field = buildFlexField(outline);
  const profiles: { x?: AxisProfile; y?: AxisProfile } = {};

  for (const axis of req.axes as Axis[]) {
    const bounds =
      axis === 'x' ? { min: bbox.minX, max: bbox.maxX } : { min: bbox.minY, max: bbox.maxY };
    const crossBounds =
      axis === 'x' ? { min: bbox.minY, max: bbox.maxY } : { min: bbox.minX, max: bbox.maxX };
    const flex = computeFlexProfile(outline, {
      axis,
      slices: params.slices,
      k: params.k,
      bounds,
      crossBounds,
      interiorSamples: params.interiorSamples,
      smooth: params.smooth,
      field,
    });
    profiles[axis] = { flex, bounds };
  }

  return {
    id: req.id,
    glyphId: req.glyphId,
    advanceWidth: req.advanceWidth,
    bbox,
    profiles,
  };
}

/** Collect the transferable ArrayBuffers in a response (flex profiles). */
export function collectTransferables(res: AnalyzeResponse): ArrayBuffer[] {
  const buffers: ArrayBuffer[] = [];
  if (res.profiles.x) buffers.push(res.profiles.x.flex.buffer as ArrayBuffer);
  if (res.profiles.y) buffers.push(res.profiles.y.flex.buffer as ArrayBuffer);
  return buffers;
}
