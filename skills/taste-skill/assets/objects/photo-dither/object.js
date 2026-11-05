// photo-dither: a photograph printed whole as a three-colour dither of crisp square cells, like a riso
// print of it: the picture's deepest colour, its most colourful one and the page's surface as paper
// (k-means over the picture finds them), the tone spread over the photograph's own range and dithered as
// light by a blue-noise threshold (an even grain) or the 8 x 8 Bayer cross-hatch (retro). Its near-whites
// print as clean paper (clean), so a white wall carries no stray grain. Under the cursor, and along a
// quick stroke's fading trail, the photograph develops through the grain with a grainy rim. At rest it is
// still (no frames run) and there is no entry: the print is finished from its first frame. colour 0
// dithers in the page's ink and accent.
import { photoGL, blueNoise, photoPalette } from '../photo-kit/photo.js';

const params = {
  colour:   { default: 1,    min: 0,   max: 1,   step: 1 },    // 1 the photograph's deepest and most colourful colours, 0 the page's ink and accent
  ground:   { default: 1,    min: 0,   max: 1,   step: 1 },    // the paper: 1 the page's surface (the frame reads as a print on its own sheet), 0 the page itself
  clean:    { default: 0.1,  min: 0,   max: 0.3, step: 0.01 }, // the lightest share of tones prints as bare paper (no stray dots in a white wall)
  tones:    { default: 3,    min: 2,   max: 3,   step: 1 },    // 3: ink, a colour and paper; 2: ink and paper
  cell:     { default: 2,    min: 1,   max: 10,  step: 1 },    // dither cell, CSS px: 1 a fine grain; 3 and up coarse and retro
  pattern:  { default: 1,    min: 0,   max: 1,   step: 1 },    // 1 blue noise (an even grain), 0 Bayer 8 x 8 (a retro cross-hatch)
  radius:   { default: 150,  min: 60,  max: 420, step: 1 },    // the turned-over area, CSS px at a 560 px frame (scales with the frame)
  breathe:  { default: 0,    min: 0,   max: 1,   step: 0.01 }, // the threshold's slow breathing at rest (0: still, no frames at rest)
  speed:    { default: 1,    min: 0,   max: 2,   step: 0.01 },
  clarity:  { default: 0.15, min: 0,   max: 1,   step: 0.01 }, // local contrast in the grain
  contrast: { default: 0.1,  min: 0,   max: 1,   step: 0.01 },
  exposure: { default: 0,    min: -1,  max: 1,   step: 0.01 },
  focusX:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 }, // the part of the photograph kept in frame
  focusY:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
float thr(vec2 cell) {
  // the map's 256 levels as thresholds strictly inside 0..1 (its top level read as 1.0 would ink a
  // grain of the middle colour in bare paper: a sparse dust over every white wall)
  if (u_pattern > 0.5) return PK_LOD(u_noise, (cell + 0.5) / 64.0, 0.0).r * (255.0 / 256.0) + 0.5 / 256.0;
  return fx_bayer(cell) + 0.5 / 64.0;
}
// colour c printed in ink, the middle colour and paper, its luminance dithered as light at threshold th
vec3 print3(vec3 c, float th) {
  vec3 P = pk_paper();
  float Yi = dot(fx_lin(u_inkC), PK_Y), Yp = dot(fx_lin(P), PK_Y), Ym = dot(fx_lin(u_midC), PK_Y);
  // the share of paper: the tone over the photograph's own range (its lightest prints as bare paper, so
  // a light photograph never prints as a grey veil), as light; the tones nearest the paper (the lightest
  // u_clean on light paper, the darkest on dark) print no dot, so a white wall has no stray grain
  float t = pk_tone(c);
  float s = u_paperLight > 0.5 ? pk_lin(clamp(t / (1.0 - u_clean), 0.0, 1.0)) : 1.0 - pk_lin(clamp((t - u_clean) / (1.0 - u_clean), 0.0, 1.0));
  float sm = clamp((Ym - Yi) / (Yp - Yi), 0.05, 0.95);
  if (u_tones < 2.5) return s > th ? P : u_inkC;
  if (s < sm) return s / sm > th ? u_midC : u_inkC;
  return (s - sm) / (1.0 - sm) > th ? P : u_midC;
}
// the state at rest (with the breathing, when on), and on load the photograph developing out of the grain
float stateAt(vec2 c, float cs) {
  float m = pk_rest(c, pk_tone(pk_photo(c, cs * 4.0)));
  if (u_breathe > 0.0 && m > 0.002) {
    float s = u_time * u_speed;
    m += u_breathe * (0.04 * sin(s * 0.55) + 0.08 * fx_noise(c / (u_res.y * 0.45) + vec2(s * 0.03, -s * 0.018)));
  }
  if (u_enter < 1.0) {
    float dev = clamp(u_enter * 1.7 - 0.7 * fx_vnoise(c / (u_res.y * 0.11) + 3.1), 0.0, 1.0);
    m = mix(0.8, m, dev * dev * (3.0 - 2.0 * dev));
  }
  return clamp(m, 0.0, 1.0);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float cs = max(1.0, floor(u_cell * max(u_fit, 0.7) * u_dpr + 0.5));
  // the turned-over area scales with the frame, so it reads the same in a card and in a hero
  float R = u_radius * u_dpr * clamp(min(u_frame.x, u_frame.y) / 560.0, 0.75, 1.5);
  float f = pk_reach(p, R);
  // a grainy rim: the turn-over is decided cell by cell against the coarse cell's threshold
  float cs2 = cs * 2.0;
  float over = f > 0.001 ? step(thr(floor(p / cs2) + 17.0), f * 1.5 - 0.15) : 0.0;
  float s = over > 0.5 ? cs2 : cs;
  vec2 cell = floor(p / s);
  vec2 c = (cell + 0.5) * s;
  float m = stateAt(c, s);
  if (over > 0.5) m = pk_flip(m);
  vec3 photo = pk_sharp(p);
  // the photograph dissolves into the dither cell by cell, then the cells drop out into the paper
  if (m <= 0.002 || thr(cell + vec2(51.0, 13.0)) > smoothstep(0.0, 0.5, m) * 1.002) { fxColor = vec4(photo, 1.0); return; }
  if (thr(cell + vec2(23.0, 37.0)) < smoothstep(0.5, 1.0, m)) { fxColor = vec4(pk_paper(), 1.0); return; }
  vec3 cc = pk_steer(pk_photo(c, s), c, s);
  fxColor = vec4(print3(cc, thr(cell)), 1.0);
}
`;

const FLAT = { data: new Uint8Array([128, 128, 128, 255]), width: 1, height: 1, filter: 'nearest', wrap: 'repeat', key: 'flat' };
// the print's ink and middle colour (sRGB 0..1): from the photograph's palette, or the page's ink and
// accent (colour 0, or a photograph that cannot be read). The ink is the picture's deepest colour (its
// lightest on dark paper), held well apart from the paper; the middle is its most colourful one, held
// between ink and paper in lightness, so the scale stays in order
function inks(image, P, p, color) {
  const paper = color.lab(p.ground > 0.5 ? P.surface : P.bg), light = color.lab(P.bg)[0] >= color.lab(P.ink)[0];
  const pal = p.colour > 0.5 && image ? photoPalette(image, 8) : null;
  let ink = color.lab(P.ink), mid = color.lab(P.accent);
  if (pal) {
    ink = (light ? pal[0] : pal[pal.length - 1]).slice();
    const chroma = c => Math.hypot(c[1], c[2]);
    const inner = pal.slice(1, -1).sort((a, b) => chroma(b) - chroma(a));
    mid = inner[0] && chroma(inner[0]) > 0.035 ? inner[0].slice() : [(ink[0] + paper[0]) / 2, (ink[1] + paper[1]) / 2, (ink[2] + paper[2]) / 2];
  }
  // the ink at least 0.55 from the paper in lightness; the middle between, a quarter of the way in from each
  ink[0] = light ? Math.min(ink[0], paper[0] - 0.55) : Math.max(ink[0], paper[0] + 0.55);
  const lo = Math.min(ink[0], paper[0]), hi = Math.max(ink[0], paper[0]);
  mid[0] = Math.min(hi - 0.25 * (hi - lo), Math.max(lo + 0.25 * (hi - lo), mid[0]));
  return { u_inkC: color.rgb(color.fromLab ? color.fromLab(ink) : ink), u_midC: color.rgb(color.fromLab ? color.fromLab(mid) : mid) };
}

export default {
  id: 'photo-dither',
  name: 'Dithered photograph',
  kind: 'photo',
  params,
  frag,
  mount(el, { palette, src, params: given, seed } = {}) {
    return photoGL(el, {
      name: 'photo-dither', frag, schema: params, params: given, palette, src, seed,
      crisp: true, trail: 8, entry: 0,
      restMotion: p => p.breathe > 0 && p.speed > 0,
      uniforms: ({ image, palette: P, params: p, color }) => inks(image, P, p, color),
      textures: ({ params: p }) => ({ u_noise: p.pattern > 0.5 ? blueNoise() : FLAT }),
    });
  },
};
