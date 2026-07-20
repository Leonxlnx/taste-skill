/**
 * webgl/parity.ts — the JS MIRROR of the Tier-1 vertex shader's LUT remap.
 *
 * This is the load-bearing cross-tier parity contract (CLAUDE.md rule 3). The
 * GPU never runs in Node, so the ONLY way to prove the WebGL tier reproduces the
 * SVG tier's stretched geometry is to mirror the exact arithmetic the vertex
 * shader performs and diff it against `buildRemap().remap` (which the SVG tier's
 * on-curve positions equal). `test/webgl-parity.test.ts` does exactly that on
 * real glyphs at 1×/2.5×/4.5×.
 *
 * ── Design note (STRETCH-INDEPENDENT LUT) — flagged decision, see report ──
 * refs/examples/03 bakes the FULLY-normalized remap (`toNormalizedLUT()`) into
 * the texture and multiplies by `stretch` in the shader. That baked LUT is
 * stretch-DEPENDENT (its texels move as the ratio changes), so shipping 03
 * verbatim forces a per-glyph LUT rebuild + re-upload EVERY frame — which
 * violates this tier's perf obligation ("no buffer re-uploads during
 * steady-state animation; frame JS ≤ 2ms"; RESEARCH §2 "keep per-frame JS
 * thin").
 *
 * We keep the locked design ("vertex remap through a cumulative LUT texture;
 * UVs original; MSDF median+fwidth in the fragment") but store the
 * stretch-INDEPENDENT normalized cumulative FLEX  C(u) = cumsum(flex)/sum(flex)
 * in the texture and apply the ratio via the `u_stretch` uniform:
 *
 *     remapped(u) = u + (stretch - 1) · C(u)                    // shader
 *     pos.x       = inkLeft + W · remapped(u)
 *     inkLeft     = u_origin + stretch · glyphOrigin_i          // static attr
 *
 * This is ALGEBRAICALLY identical to the core's `min + W·(u + (stretch-1)·C)`
 * remap, so the LUT texture, geometry buffers and per-glyph attributes are ALL
 * static — only the `u_stretch` / `u_origin` scalars change per frame.
 *
 * Exactness envelope (measured, test/webgl-parity):
 *   • stretch ≥ 1  → exact vs SVG tier (float-noise ~1e-12 font units).
 *   • stretch < 1  → exact WHILE the core compression guard is inactive; once
 *     the guard clamps a rigid slice (strong compression) the linear-in-stretch
 *     form cannot reproduce the guard's nonlinear redistribution and the GPU
 *     tier diverges from the SVG tier. Heavy compression belongs on the SVG
 *     (vector-fidelity) tier. `C` still satisfies the FlexLUT contract shape
 *     (Float32 N+1, 0→1, monotonic) so nothing about the cross-tier contract is
 *     forked — this is a different, contract-shaped texture derived from the
 *     SAME frozen flex profile.
 */
import type { FlexLUT } from '../core/types';

/**
 * Normalized cumulative flex  C(u) = cumsum(flex)/sum(flex)  as an (N+1) LUT.
 * Mirrors the core's own per-slice distribution (`lut.ts`: e[i] = E·flex[i]/ΣF
 * ⇒ C[i+1]-C[i] = flex[i]/ΣF), so it is exactly the flex portion of the remap.
 * Fully-rigid glyphs (ΣF≈0) degrade to the uniform ramp C[i]=i/N (matching the
 * core's uniform-scaling fallback). Endpoints are pinned 0/1 for assertLUT.
 */
export function buildFlexCumulative(flex: Float32Array | number[]): FlexLUT {
  const N = flex.length;
  const C = new Float32Array(N + 1);
  let sum = 0;
  for (let i = 0; i < N; i++) sum += flex[i];
  if (sum < 1e-9) {
    for (let i = 0; i <= N; i++) C[i] = i / N; // uniform fallback
  } else {
    let acc = 0;
    for (let i = 0; i < N; i++) {
      acc += flex[i] / sum;
      C[i + 1] = acc;
    }
  }
  C[0] = 0;
  C[N] = 1; // pin against float drift (assertLUT-exact)
  return C;
}

/**
 * Sample a normalized LUT with piecewise-linear interpolation — the CPU
 * equivalent of the vertex shader's two-tap `mix(lut[i], lut[i+1], frac)` on an
 * (N+1)-wide texture. u ∈ [0,1] addresses boundary 0..N.
 */
export function sampleNormalizedLUT(lut: FlexLUT, u: number): number {
  const N = lut.length - 1;
  if (N <= 0) return 0;
  if (u <= 0) return lut[0];
  if (u >= 1) return lut[N];
  const f = u * N;
  const i = Math.min(N - 1, Math.floor(f));
  const t = f - i;
  return lut[i] * (1 - t) + lut[i + 1] * t;
}

/**
 * CPU mirror of the vertex shader's horizontal position for an ORIGINAL glyph
 * x-coordinate, through the static cumulative-flex LUT path the GPU uses.
 *
 * @param cumFlex  normalized cumulative flex LUT (buildFlexCumulative)
 * @param x        original glyph x-coordinate (font units)
 * @param min      ink bounds.min (font units)
 * @param max      ink bounds.max (font units)
 * @param inkLeft  glyph frame left edge in run space (== layoutRun inkLeft = penX + min)
 * @param stretch  current stretch ratio
 */
export function gpuRemapX(
  cumFlex: FlexLUT,
  x: number,
  min: number,
  max: number,
  inkLeft: number,
  stretch: number,
): number {
  const W = max - min;
  if (W <= 0) return inkLeft;
  const u = (x - min) / W;
  const C = sampleNormalizedLUT(cumFlex, u);
  return inkLeft + W * (u + (stretch - 1) * C);
}

/**
 * Static per-glyph horizontal origin factor so the shader can compute
 * `inkLeft = u_origin + stretch · glyphOrigin` with NO per-frame attribute
 * upload. Derived to match `layoutRun` exactly:
 *   inkLeft_i = origin + stretch·(prefixAdvance_i + min_i)
 * where prefixAdvance_i = kernBefore_i + Σ_{j<i}(advanceWidth_j + kernBefore_j).
 */
export function glyphOriginFactor(prefixAdvance: number, min: number): number {
  return prefixAdvance + min;
}
