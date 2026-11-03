// photo-halftone: a photograph printed whole as a one-ink halftone, the way a good magazine or poster
// prints it: round dots of the page's ink (or its accent) on the page's surface as paper (so the frame
// reads as a sheet), on one 45 degree screen, small in the light and merging into round holes in the
// shadows. The print has its own tone curve, so a light (high-key) photograph keeps clean paper where
// it is near white and solid ink in its deepest shadows instead of a grey veil of dots; clarity and a
// dotted outline from the photograph's edge map keep a pale object on a pale wall. The canvas
// renders up to 2 canvas px per CSS px, so the dots stay crisp on a sharp screen.
// Under the cursor (a tap on a phone) a loupe: a round lens with a hairline rim and a soft shadow shows
// the photograph itself, in its own colours, a little magnified. At rest it is still (no frames run).
// No entry animation: the print is there from its first frame, never half developed.
import { photoGL } from '../photo-kit/photo.js';

const params = {
  pitch:    { default: 5,    min: 3,   max: 16,  step: 0.5 },  // dot spacing, CSS px (finer in small frames; never under 4 canvas px)
  angle:    { default: 45,   min: 0,   max: 90,  step: 1 },    // the screen's angle, degrees
  tint:     { default: 0,    min: 0,   max: 1,   step: 1 },    // the dots' colour: 0 the page's ink, 1 its accent
  ground:   { default: 1,    min: 0,   max: 1,   step: 1 },    // the paper: 1 the page's surface (the frame reads as a print on its own sheet), 0 the page itself
  clean:    { default: 0.1,  min: 0,   max: 0.4, step: 0.01 }, // ink shares under this print no dot at all: the light parts stay clean paper
  outline:  { default: 0.4,  min: 0,   max: 1,   step: 0.01 }, // dots along the photograph's edges, so a pale object keeps its outline on a pale wall
  magnify:  { default: 1.35, min: 1,   max: 3,   step: 0.05 }, // the loupe's magnification of the photograph under it
  radius:   { default: 120,  min: 60,  max: 260, step: 1 },    // the loupe, CSS px (smaller in small frames)
  clarity:  { default: 0.3,  min: 0,   max: 1,   step: 0.01 }, // local contrast, so a pale object parts from a pale wall
  contrast: { default: 0.1,  min: 0,   max: 1,   step: 0.01 },
  exposure: { default: 0,    min: -1,  max: 1,   step: 0.01 },
  focusX:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 }, // the subject's place (else the <img>'s object-position)
  focusY:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// the screen: a sum of cosines, 1 at a dot's middle and -1 between dots (one dot per unit of s)
float spot(vec2 s) { return 0.5 * (cos(6.2831853 * s.x) + cos(6.2831853 * s.y)); }
// the spot level that inks a share c of the cell: round dots below 50%, round holes above
float level(float c) {
  float a = min(c, 1.0 - c);
  float t = 1.0 - 3.1415927 * a + 2.2831853 * a * a;
  return c <= 0.5 ? t : -t;
}
// ink coverage of the screen at screen point s for a share c; px: canvas px per dot there. Edges are
// antialiased over one canvas px; a dot under about a pixel across prints its tint instead of a speck
float screenAt(vec2 s, float c, float px) {
  if (c <= 0.002) return 0.0;
  if (c >= 0.998) return 1.0;
  float v = spot(s);
  vec2 sn = sin(6.2831853 * s);
  float g = 3.1415927 * length(sn) / px;
  float edge = clamp((v - level(c)) / max(g, 1e-4) + 0.5, 0.0, 1.0);
  float r = sqrt(min(c, 1.0 - c) / 3.1415927) * px;
  return mix(c, edge, smoothstep(0.45, 0.95, r));
}
// the print's tone curve: the share of ink for tone t (0 the photograph's darkest, 1 its lightest).
// Coverage follows the tone as seen (a 50% grey prints a 50% dot), so a light photograph does not
// print as a grey veil; shares under u_clean print nothing, the deepest few per cent print solid, and a
// slight curve keeps the shadows open (a dark bowl of beans keeps its beans)
float inkShare(float t) {
  float c = u_paperLight > 0.5 ? 1.0 - t : t;
  return pow(clamp((c - u_clean) / max(0.1, 0.97 - u_clean), 0.0, 1.0), 1.12);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float pitch = max(4.0, u_pitch * u_fit * u_dpr);
  float a = radians(u_angle);
  vec2 s = mat2(cos(a), sin(a), -sin(a), cos(a)) * p / pitch;
  // the tone over most of a dot's cell, with the print's clarity, exposure and contrast
  float t = pk_shadeOf(pk_photo(p, pitch * 0.7), p, pitch);
  float c = inkShare(t);
#ifdef PK_STATS
  // the photograph's edges (its Sobel map), read over about a dot: a pale shade on a pale wall, a white
  // bowl on a white table keep a dotted outline where the tone alone would print nothing
  float lodS = log2(max(pitch * 0.6 * 512.0 * pk_vis().x / (u_res.x * u_zoom), 1.0));
  c = max(c, u_outline * smoothstep(0.1, 0.45, PK_LOD(u_stats, pk_uv(p), lodS).r));
#endif
  float k = screenAt(s, c, pitch);
  vec3 inkC = mix(u_ink, u_accent, u_tint);
  vec3 paperC = pk_paper();
  vec3 col = fx_srgb(mix(fx_lin(paperC), fx_lin(inkC), k));

  // the loupe: a round lens that grows in with the hover and shows the photograph itself
  float h = u_mouse.z;
  float e = h * h * (3.0 - 2.0 * h);
  if (e > 0.001) {
    float R = u_radius * u_fit * u_dpr * mix(0.4, 1.0, e);
    vec2 v = p - u_mouse.xy;
    float d = length(v);
    if (d < R + 2.0) {
      float mg = mix(1.0, u_magnify, e);
      float rr = d / R;
      vec2 q = u_mouse.xy + v / mg * (1.0 + 0.06 * rr * rr);   // a faint barrel toward the rim
      vec3 lensCol = PK_LOD(u_img, pk_uv(q), log2(max(pk_tpp() / mg, 1.0))).rgb;
      float inside = 1.0 - smoothstep(R - 0.75 * u_dpr, R + 0.75 * u_dpr, d);
      col = mix(col, lensCol, inside * e);
      float rim = 1.0 - smoothstep(0.35 * u_dpr, 1.1 * u_dpr, abs(d - R));
      col = mix(col, u_paperLight > 0.5 ? u_ink : vec3(1.0), rim * 0.35 * e);
    }
    // the lens's soft shadow on the print
    float sh = smoothstep(R + 16.0 * u_dpr, R, d) * step(R, d);
    col = mix(col, vec3(0.0), sh * 0.12 * e);
  }
  fxColor = vec4(fx_dither(col), 1.0);
}
`;

export default {
  id: 'photo-halftone',
  name: 'Halftone photograph',
  kind: 'photo',
  params,
  frag,
  mount(el, { palette, src, params: given, seed } = {}) {
    return photoGL(el, {
      name: 'photo-halftone', frag, schema: params, params: given, palette, src, seed,
      entry: 0, maxScale: 2, stats: true,
    });
  },
};
