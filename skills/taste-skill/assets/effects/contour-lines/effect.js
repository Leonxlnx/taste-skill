// contour-lines: a topographic map of an imaginary terrain. Line width is measured in screen pixels
// from the field's gradient, so lines stay hairline-thin and even at any zoom; every n-th line is an
// index line in a step of the accent, the land between index lines carries stepped elevation tints
// (the page ground lifting toward the accent on high ground), and a faint hillshade gives relief.
// Tiny closed loops at summits and pits are faded, so the map has no specks. The terrain breathes
// through a very slow domain warp.
import { shader, color, rng as makeRng } from '../fx.js';

const params = {
  levels:     { default: 24,   min: 6,    max: 60,  step: 1 },     // contour levels over the terrain's height
  scale:      { default: 1.6,  min: 0.4,  max: 5,   step: 0.05 },  // size of the hills (higher: smaller)
  lineWidth:  { default: 1,    min: 0.5,  max: 3,   step: 0.1 },   // line width in CSS px
  indexEvery: { default: 5,    min: 0,    max: 10,  step: 1 },     // every n-th line heavier, 0 for none
  opacity:    { default: 0.35, min: 0.05, max: 1,   step: 0.01 },  // ink strength of the lines
  speed:      { default: 0.02, min: 0,    max: 0.2, step: 0.005 }, // breathing of the terrain
  octaves:    { default: 3,    min: 1,    max: 4,   step: 1 },     // detail of the terrain
  tint:       { default: 0.6,  min: 0,    max: 1,   step: 0.01 },  // elevation tints and accent index lines
  shade:      { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // hillshade of the ground (1 is about 0.05 lightness)
  edge:       { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // fade of the lines toward the edges
  calm:       { default: 0.75, min: 0,    max: 1,   step: 0.01 },  // fade the lines where text sits
  calmX:      { default: 0.25, min: 0,    max: 1,   step: 0.01 },
  calmY:      { default: 0.7,  min: 0,    max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
float ct_height(vec2 p, float t) {
  // very slow breathing: the field bends a little in place instead of sliding away
  vec2 w = vec2(fx_noise(p * 0.42 + vec2(t, 3.7)), fx_noise(p * 0.42 + vec2(-2.9, 1.3 - t * 0.83)));
  p += w * 0.38;
  float s = 0.0, a = 1.0, nrm = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) > u_octaves - 0.5) break;
    s += a * fx_noise(p);
    nrm += a;
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + vec2(5.3, 1.9);
    a *= 0.42;
  }
  return s / sqrt(nrm);
}
float ct_field(vec2 fc, float t) {
  vec2 p = (fc - 0.5 * u_res) / u_res.y * u_scale * 0.62 + u_off;
  return ct_height(p, t) * u_levels;
}

void main() {
  vec2 uv = fx_uv();
  float t = u_time * u_speed * 1.6;
  float f = ct_field(gl_FragCoord.xy, t);
#if __VERSION__ >= 300
  vec2 g = vec2(dFdx(f), dFdy(f));
#else
  vec2 g = vec2(ct_field(gl_FragCoord.xy + vec2(1.0, 0.0), t) - f, ct_field(gl_FragCoord.xy + vec2(0.0, 1.0), t) - f);
#endif
  float gl = max(length(g), 1e-5);

  // distance in device px to the nearest contour, and which contour it is
  float idx = floor(f + 0.5);
  float dpx = abs(f - idx) / gl;
  float every = max(u_indexEvery, 1.0);
  float isIdx = u_indexEvery > 0.5 ? 1.0 - step(0.5, mod(idx, every)) : 0.0;

  float w = u_lineWidth * u_dpr * mix(1.0, 1.85, isIdx);
  float cov = clamp(max(w, 1.0) * 0.5 + 0.5 - dpx, 0.0, 1.0) * min(w, 1.0);
  // where lines crowd closer than a few pixels they fade instead of turning into moire
  float gap = mix(1.0, every, isIdx) / gl;
  cov *= smoothstep(1.5 * u_dpr, 4.0 * u_dpr, gap);

  // tiny closed loops (a summit or pit just crossing a level) read as specks. They sit where the
  // field is nearly flat, so only there: step about 5 CSS px up and down the slope; on a normal slope
  // the field keeps changing at its rate, around a tiny loop it has already turned over
  float g0 = u_res.y / (u_scale * 0.62 * u_levels);
  if (cov > 0.0 && 1.0 / gl > 2.5 * g0) {
    vec2 n = g / gl;
    float s = 5.0 * u_dpr;
    float up = ct_field(gl_FragCoord.xy + n * s, t) - f;
    float dn = f - ct_field(gl_FragCoord.xy - n * s, t);
    cov *= smoothstep(0.15, 0.55, min(up, dn) / (gl * s));
  }

  float a = cov * u_opacity * mix(1.0, 1.45, isIdx);

  // fade toward the edges and in the calm area
  float asp = u_res.x / u_res.y;
  float e = min(min(uv.x, 1.0 - uv.x) * asp, min(uv.y, 1.0 - uv.y));
  a *= mix(1.0, smoothstep(0.0, 0.3, e), u_edge);
  a *= 1.0 - u_calm * fx_calm(uv, vec2(u_calmX, u_calmY), 0.32 + 0.4 * u_calm);

  // the ground: stepped elevation tints between index lines (high ground lifts toward the accent,
  // low ground deepens a touch toward the ink), then a hillshade lit from the upper left
  float band = floor(f / every + 0.5);
  float el = clamp(band / 3.0, -1.0, 1.0);
  vec3 gnd = el > 0.0 ? mix(u_kGround, u_kHigh, el * u_tint) : mix(u_kGround, u_kLow, -el * u_tint);
  vec2 gn = g / u_dpr;
  float lit = clamp(dot(gn, vec2(0.7, -0.7)) * 9.0, -1.0, 1.0);
  gnd.x += u_shade * 0.05 * lit * u_shadeDir;

  vec3 ink = mix(u_kInk, u_kIdx, isIdx * u_tint);
  vec3 lab = mix(gnd, ink, a);
  fxColor = vec4(fx_dither(fx_rgb(lab)), 1.0);
}
`;

function tones(P) {
  const { bg, ink, accent } = P;
  const dark = color.isDark(bg);
  // an accent that barely shows on the ground is replaced by a step of the ink
  const acc = color.contrast(bg, accent) < 1.35 ? color.mix(bg, ink, 0.7) : accent;
  return {
    ground: bg,
    ink,
    // index lines: halfway to the accent, so they still read as ink
    idx: color.mix(ink, acc, 0.6),
    high: color.mix(bg, acc, dark ? 0.16 : 0.13),
    low: color.mix(bg, ink, dark ? 0.05 : 0.045),
  };
}

function uniforms({ palette, seed }) {
  const k = tones(palette);
  const off = [((seed * 0.0173) % 37) + 3.1, ((seed * 0.0291) % 41) - 7.7];
  return {
    u_kGround: color.labVec(k.ground),
    u_kInk: color.labVec(k.ink),
    u_kIdx: color.labVec(k.idx),
    u_kHigh: color.labVec(k.high),
    u_kLow: color.labVec(k.low),
    // lighter relief on dark grounds goes up, on light grounds it goes down a little less
    u_shadeDir: color.isDark(palette.bg) ? 0.8 : 1,
    u_off: off,
  };
}

// CSS stand-in: a few smooth closed contours around one hill, as an SVG (no repeating rings, so no moire)
function fallback({ palette: P, params: prm, seed }) {
  const k = tones(P);
  const r = makeRng(`contour-fb:${seed}`);
  const W = 1000, H = 625;
  const cx = W * (0.55 + r() * 0.25), cy = H * (0.25 + r() * 0.3);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const line = color.mix(P.bg, P.ink, Math.min(0.9, prm.opacity * 0.9));
  const idx = color.mix(P.bg, k.idx, Math.min(1, prm.opacity * 1.3));
  const paths = [];
  for (let n = 0; n < 16; n++) {
    const R = 26 + n * 44 + n * n * 1.6;
    const pts = [];
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const q = 1 + 0.2 * Math.sin(2 * a + ph[0] + n * 0.11) + 0.09 * Math.sin(3 * a + ph[1] - n * 0.17) + 0.05 * Math.sin(5 * a + ph[2] + n * 0.3);
      pts.push([cx + Math.cos(a) * R * q * 1.25, cy + Math.sin(a) * R * q]);
    }
    // closed Catmull-Rom curve as cubic Beziers
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    const heavy = prm.indexEvery > 0 && (n + 1) % prm.indexEvery === 0;
    paths.push(`<path d='${d}' stroke='${heavy ? idx : line}' stroke-width='${heavy ? 1.7 : 1}' vector-effect='non-scaling-stroke'/>`);
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='xMidYMid slice'><g fill='none'>${paths.join('')}</g></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}")`;
  return `${url} center / cover no-repeat, radial-gradient(60% 70% at ${(cx / W * 100).toFixed(0)}% ${(cy / H * 100).toFixed(0)}%, ${k.high}, ${P.bg} 70%), ${P.bg}`;
}

export default {
  id: 'contour-lines',
  name: 'Topographic contours',
  family: 'pattern',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, { frag, schema: params, params: given, palette, seed, uniforms, still: 5, fallback });
  },
};
