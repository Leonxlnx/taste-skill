/**
 * webgl/gl/shaders.ts — Tier-1 GLSL ES 3.00 program source.
 *
 * Derived from refs/examples/03 (vertex) + 04 (fragment). Two DELIBERATE changes
 * from 03, both required by this tier's obligations (flagged in the report):
 *   1. STRETCH-INDEPENDENT LUT: the texture stores normalized cumulative FLEX
 *      C(u); the ratio is applied via `u_stretch` so nothing is re-uploaded per
 *      frame (parity.ts explains the algebra & exactness envelope). This keeps
 *      the locked "remap through a cumulative LUT texture; UVs original" design.
 *   2. INSTANCED, static per-glyph attributes + a per-glyph LUT ROW packed into
 *      ONE texture, so a whole run draws with zero rebinds and zero per-frame
 *      buffer uploads — only `u_stretch`/`u_origin` (+ effect scalars) change.
 *
 * The LUT is sampled with an explicit two-tap texelFetch `mix()` (not hardware
 * LINEAR) so we never depend on OES_texture_float_linear for R32F.
 *
 * Post-fx (fragment) are branchless when their intensity is 0 (obligation 3):
 * grain, chromatic aberration (∝ velocity, along the stretch axis), and a
 * displacement noise-texture UV warp. Output is PREMULTIPLIED alpha for correct
 * compositing over arbitrary page backgrounds (obligation 2).
 */

export const VERTEX_SHADER = /* glsl */ `#version 300 es
precision highp float;

// Shared subdivided-quad grid (slice-grid.ts): box coords in [0,1]^2.
in vec2 a_boxCoord;

// Instanced, STATIC per-glyph attributes (uploaded once; never per frame).
in float a_glyphOrigin;   // origin factor: inkLeft = u_origin + u_stretch*a_glyphOrigin
in float a_glyphWidth;    // W = bounds.max - bounds.min (unstretched ink width, px)
in vec2  a_glyphY;        // (yTop_px from run top, height_px) SVG-down placement (no stretch)
in vec2  a_atlasUVOrigin; // atlas UV at box (0,0)  (image-space, may carry flipped V)
in vec2  a_atlasUVSize;   // atlas UV delta across the box (size.y may be negative)
in float a_lutRow;        // this glyph's row in the packed LUT texture

uniform sampler2D u_lut;      // R32F, (N+1) x glyphCount, NEAREST; holds C(u)
uniform ivec2 u_lutSize;      // (N+1, glyphCount)
uniform float u_stretch;      // horizontal stretch ratio (1 = identity)
uniform float u_origin;       // run origin in device px
uniform vec2  u_viewport;     // device px viewport (for clip mapping)

out vec2 v_atlasUV;

// Two-tap linear sample of the cumulative-flex LUT at normalized u for this row.
float sampleCumFlex(float u, int row) {
  int N = u_lutSize.x - 1;              // boundary count
  float f = clamp(u, 0.0, 1.0) * float(N);
  int i = int(floor(f));
  i = min(i, N - 1);
  float t = f - float(i);
  float a = texelFetch(u_lut, ivec2(i, row), 0).r;
  float b = texelFetch(u_lut, ivec2(i + 1, row), 0).r;
  return mix(a, b, t);
}

void main() {
  float uOrig = a_boxCoord.x;                       // original normalized column
  float C = sampleCumFlex(uOrig, int(a_lutRow + 0.5));
  // remapped normalized position: identity at stretch=1, flex-weighted growth.
  float remapped = uOrig + (u_stretch - 1.0) * C;

  float inkLeft = u_origin + u_stretch * a_glyphOrigin;
  float posX = inkLeft + a_glyphWidth * remapped;
  // Glyph geometry is SVG-down (y increases downward, like the SVG tier): box y=0
  // is the glyph's visual top (bbox.minY), box y=1 its visual bottom (bbox.maxY).
  // a_glyphY = (yTop_px = top offset from run top, height_px); place straight down.
  float posY = a_glyphY.x + a_boxCoord.y * a_glyphY.y;

  v_atlasUV = a_atlasUVOrigin + a_boxCoord * a_atlasUVSize;

  vec2 clip = vec2(posX / u_viewport.x * 2.0 - 1.0, 1.0 - posY / u_viewport.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_atlasUV;
out vec4 fragColor;

uniform sampler2D u_msdfAtlas;
uniform vec4  u_color;         // straight-alpha ink color
uniform float u_pxRange;       // msdf distance range in atlas texels
uniform vec2  u_atlasSize;     // atlas texture size (texels)

// Post-fx (all optional; each is a no-op branch when its scalar is ~0).
uniform float u_grainIntensity;   // 0..1 film grain
uniform float u_aberration;       // channel split (px), ∝ velocity
uniform vec2  u_stretchDir;       // unit vector of the active stretch axis
uniform float u_time;
uniform float u_dispIntensity;    // displacement warp strength (px)
uniform vec2  u_dispScale;        // noise sampling scale
uniform sampler2D u_noise;        // displacement noise texture
uniform int   u_hasNoise;         // 1 when a displacement texture is bound

float median3(vec3 v) { return max(min(v.r, v.g), min(max(v.r, v.g), v.b)); }
float sampleSD(vec2 uv) { return median3(texture(u_msdfAtlas, uv).rgb) - 0.5; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + u_time) * 43758.5453); }

void main() {
  vec2 uv = v_atlasUV;

  // Displacement: warp the sampling UV by a noise texture BEFORE distance
  // sampling — the distance field stays continuous so edges do not tear.
  if (u_dispIntensity > 0.001 && u_hasNoise == 1) {
    vec2 n = texture(u_noise, uv * u_dispScale + u_time * 0.05).rg - 0.5;
    uv += n * (u_dispIntensity / u_atlasSize);
  }

  vec2 unitRange = vec2(u_pxRange) / u_atlasSize;
  vec2 screenTexSize = vec2(1.0) / fwidth(uv);
  float screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);

  float alpha;
  if (u_aberration > 0.001) {
    // Chromatic aberration: split channels along the stretch axis.
    vec2 off = u_stretchDir * u_aberration / u_atlasSize;
    float r = clamp(sampleSD(uv - off) * screenPxRange + 0.5, 0.0, 1.0);
    float g = clamp(sampleSD(uv)       * screenPxRange + 0.5, 0.0, 1.0);
    float b = clamp(sampleSD(uv + off) * screenPxRange + 0.5, 0.0, 1.0);
    float a = max(max(r, g), b) * u_color.a;
    // premultiplied output
    fragColor = vec4(u_color.rgb * vec3(r, g, b) * u_color.a, a);
    alpha = a;
  } else {
    float d = clamp(sampleSD(uv) * screenPxRange + 0.5, 0.0, 1.0);
    alpha = d * u_color.a;
    fragColor = vec4(u_color.rgb * alpha, alpha); // premultiplied
  }

  if (u_grainIntensity > 0.001 && alpha > 0.0) {
    float g = (hash(gl_FragCoord.xy) - 0.5) * u_grainIntensity;
    fragColor.rgb += g * alpha; // stays premultiplied (scaled by coverage)
  }
}
`;
