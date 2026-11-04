// ruled-grounds: a fine dot ruling on a grainy tonal ground. Every dot sits on a whole device pixel, every
// n-th node carries a small cross, and the ruling thins out toward the text and fades before the edges.
// A wide soft light wanders slowly across the far side and brings the dots it passes forward (stronger,
// a touch larger, leaning to the accent), so the ground reads as lit paper, never as blinking.
import { shader, color, grainCSS } from '../fx.js';

const params = {
  cell:  { default: 16,   min: 12, max: 28, step: 1 },    // dot pitch in CSS px (snapped to whole device px)
  major: { default: 4,    min: 0,  max: 8,  step: 1 },    // every n-th node carries a small cross; under 3 none
  ink:   { default: 0.5,  min: 0,  max: 1,  step: 0.01 }, // strength of the ruling
  focus: { default: 0.6,  min: 0,  max: 1,  step: 0.01 }, // how much the wandering light brings the dots forward
  speed: { default: 0.8,  min: 0,  max: 2,  step: 0.01 }, // 1 = one sweep across in 25 s
  reach: { default: 0.5,  min: 0,  max: 1,  step: 0.01 }, // how far the ruling reaches toward the text side
  grain: { default: 0.5,  min: 0,  max: 1,  step: 0.01 }, // still paper grain on the ground
  calm:  { default: 0.5,  min: 0,  max: 1,  step: 0.01 }, // clear the ruling and the light where text sits
  calmX: { default: 0.25, min: 0,  max: 1,  step: 0.01 },
  calmY: { default: 0.7,  min: 0,  max: 1,  step: 0.01 },
};

const frag = /* glsl */ `
void main() {
  vec2 uv = fx_uv();
  vec2 hs = vec2(u_res.x / u_res.y, 1.0);
  vec2 p = uv * hs;                                    // height units, y down
  float dpr = max(1.0, u_dpr);
  float c = max(8.0, floor(u_cell * dpr + 0.5));       // pitch in whole device px
  // nodes sit on pixel centres, one of them in the middle of the frame
  vec2 rel = gl_FragCoord.xy - (floor(0.5 * u_res) + 0.5);
  vec2 k = floor(rel / c + 0.5);                       // the nearest node
  vec2 d = rel - k * c;                                // whole device px from it

  // where the ruling shows: thinner toward the text, gone before the edges and in the calm area
  float s = length(p - u_calmP) / u_span;              // 0 at the text, 1 at the far corner
  float dens = mix(smoothstep(0.08, 0.85, s), 1.0, u_floor);
  vec2 e = min(uv, 1.0 - uv) * hs;
  float edge = smoothstep(0.0, 0.12, min(e.x, e.y));
  float calm = min(1.0, u_calm * 1.6) * fx_calm(uv, vec2(u_calmX, u_calmY), 0.25 + 0.35 * u_calm);
  float field = dens * edge * (1.0 - calm);

  // the focus: a wide soft light on a slow open path across the far side, never behind the text
  float tt = u_time * u_speed * 0.2513 + u_ph.x;
  vec2 lp = u_pc + vec2(u_amp.x * sin(tt), u_amp.y * sin(tt * 0.647 + u_ph.y));
  vec2 dl = p - lp;
  float g = exp(-dot(dl, dl) / (u_pr * u_pr)) * (1.0 - calm);
  float lit = u_focus * g;

  // a round dot, anti-aliased by its coverage of this pixel; a little larger in the light
  float r = (0.6 + 0.35 * lit) * dpr + 0.3;
  float a = clamp(r + 0.5 - length(d), 0.0, 1.0) * u_aDot;
  // a small cross on every n-th node, in whole device pixels
  if (u_major > 2.5) {
    vec2 m = abs(k - u_major * floor(k / u_major + 0.5));
    if (m.x < 0.5 && m.y < 0.5) {
      float lo = -floor((u_lw - 1.0) * 0.5), hi = lo + u_lw - 1.0;
      float hb = step(lo - 0.5, d.y) * step(d.y, hi + 0.5) * step(abs(d.x), u_arm + 0.5);
      float vb = step(lo - 0.5, d.x) * step(d.x, hi + 0.5) * step(abs(d.y), u_arm + 0.5);
      a = max(a, max(hb, vb) * u_aMark);
    }
  }
  // faint everywhere, brought forward under the light (about three times at the default focus)
  a = min(a * field * (1.0 - 0.8 * u_focus + 2.6 * lit), 0.55);

  // the ground: a tonal ramp from the text side to the far corner, lifted where the light is
  vec3 col = mix(u_kNear, u_kFar, smoothstep(0.0, 1.0, s));
  col = mix(col, u_kPool, min(0.85, lit * 1.3));
  vec3 lc = mix(u_kLine, u_kGlow, min(1.0, g) * 0.7);
  col = mix(col, lc, a);

  // still grain on lightness, softer near white and black
  float amp = u_grainAmp * (1.0 - 0.6 * smoothstep(0.86, 1.0, col.x)) * (1.0 - 0.5 * smoothstep(0.22, 0.0, col.x));
  col.x += fx_grain(gl_FragCoord.xy, 0.0) * amp;

  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

// the violet guard: no derived colour, and no mix the shader makes between two of them, may land in the
// violet or lavender band (OKLCH hue 274-336 with any real chroma)
const inBand = c => { const [, C, h] = color.lch(c); return C > 0.025 && h > 274 && h < 336; };
const clean = (a, b) => { for (let i = 1; i <= 10; i++) if (inBand(color.mix(a, b, i / 10))) return false; return true; };
// the ground's own hue at another lightness, nearly grey (a hue at the band's edge leans a little bluer)
const step = (bg, L, cmax = 0.02) => {
  const [, C, h] = color.lch(bg);
  return color.fromLch([Math.min(1, Math.max(0, L)), Math.min(C, cmax), h > 262 && h < 276 ? 262 : h]);
};

// every colour is the palette's own: the ink for the ruling, steps of the ground for the ramp, and the
// accent for the light only when it sits with the ground
function tones(P, kind) {
  const { bg, surface, ink, accent } = P;
  const Lb = color.lab(bg)[0], Li = color.lab(ink)[0];
  const up = Li > Lb ? 1 : -1;                         // toward the ink
  const neutral = color.chroma(bg) < 0.02;
  const line = clean(bg, ink) ? ink : step(bg, Li);
  const accOk = color.chroma(accent) > 0.03 && !inBand(accent) && clean(bg, accent) && (neutral || color.hueDistance(bg, accent) < 55);
  let T;
  if (kind === 'dark') {
    const lift = color.lighten(color.mix(bg, surface, 0.7), 0.008);
    T = {
      near: bg, aDot: 0.3, grain: 0.018,
      far: accOk ? color.mix(lift, accent, 0.05) : lift,
      pool: accOk ? color.lighten(color.mix(bg, accent, 0.2), 0.015) : step(bg, Lb + 0.07, 0.03),
      glow: accOk ? color.adjust(accent, { l: 0.06, c: 0.85 }) : color.lighten(line, 0.03),
    };
  } else if (kind === 'colour') {
    T = {
      near: bg, aDot: 0.3, grain: 0.02,
      far: color.lighten(bg, -0.03 * up),
      pool: color.withLightness(color.saturate(bg, 1.05), Lb + 0.08 * up),
      glow: accOk ? color.adjust(accent, { l: 0.04 * up, c: 0.85 }) : color.lighten(line, 0.02 * up),
    };
  } else {
    // light: the light is a paler sheen on the paper (tinted by the accent when it fits) under darker dots
    const white = Lb > 0.97;
    const deep = color.mix(bg, ink, 0.055);
    const sheen = Math.min(0.995, Lb + 0.035);
    T = {
      near: white ? bg : color.lighten(bg, 0.012), aDot: 0.28, grain: 0.02,
      far: accOk ? color.mix(deep, accent, 0.03) : deep,
      pool: accOk ? color.withLightness(color.mix(bg, accent, 0.1), sheen) : color.withLightness(bg, sheen),
      glow: accOk ? color.darken(accent, 0.04) : line,
    };
  }
  T.line = line;
  for (const k of ['far', 'pool', 'glow']) if (!clean(bg, T[k]) || inBand(T[k])) T[k] = k === 'glow' ? line : step(bg, color.lab(T[k])[0]);
  return T;
}

// composition shared by the shader and the CSS stand-in (positions in height units, y down)
function geometry(prm, r, asp) {
  const C = [prm.calmX * asp, prm.calmY];
  const corners = [[0, 0], [asp, 0], [0, 1], [asp, 1]];
  // the corner farthest from the text; a tie (text in the middle) goes to the lower right
  const far = c => Math.hypot(c[0] - C[0], c[1] - C[1]) + 0.002 * c[1] + 0.001 * c[0];
  const corner = corners.reduce((a, b) => (far(b) > far(a) ? b : a));
  const span = Math.max(0.4, Math.hypot(corner[0] - C[0], corner[1] - C[1]));
  // the light wanders across the side away from the text
  const pc = [asp * 0.5 + (asp * 0.5 - C[0]) * 0.35, Math.min(0.7, Math.max(0.3, 0.5 + (0.5 - C[1]) * 0.5))];
  const ph = [r() * 6.283, r() * 6.283];
  return { C, corner, span, pc, amp: [0.28 * asp, 0.12], pr: 0.38 + 0.06 * r(), ph };
}
const lightAt = (g, prm, t) => {
  const tt = t * prm.speed * 0.2513 + g.ph[0];
  return [g.pc[0] + g.amp[0] * Math.sin(tt), g.pc[1] + g.amp[1] * Math.sin(tt * 0.647 + g.ph[1])];
};

function uniforms({ palette, params, rng, kind, dpr, width, height }) {
  const asp = width && height ? width / height : 16 / 9;
  const g = geometry(params, rng, asp);
  const T = tones(palette, kind);
  const s = 0.4 + 1.2 * params.ink;
  const D = Math.max(1, dpr || 1);
  const u = {
    u_calmP: g.C,
    u_span: g.span,
    u_floor: 0.25 + 0.6 * params.reach,
    u_pc: g.pc,
    u_amp: g.amp,
    u_pr: g.pr,
    u_ph: g.ph,
    u_aDot: Math.min(0.5, T.aDot * s),
    u_aMark: Math.min(0.5, T.aDot * s * 0.8),
    u_lw: Math.max(1, Math.floor(D + 0.3)),            // one CSS px in whole device px
    u_arm: Math.max(2, Math.round(3 * D)),             // cross arm, 3 CSS px
    u_grainAmp: T.grain * (0.4 + 1.2 * params.grain),
  };
  for (const key of ['near', 'far', 'pool', 'line', 'glow']) u['u_k' + key[0].toUpperCase() + key.slice(1)] = color.labVec(T[key]);
  return u;
}

// the CSS stand-in: the same ramp, light (where it stands in the still frame), dots, crosses, calm area and grain
function fallback({ palette: P, params: prm, kind, rng, width, height }) {
  const asp = width && height ? width / height : 16 / 9;
  const g = geometry(prm, rng, asp);
  const T = tones(P, kind);
  const s = 0.4 + 1.2 * prm.ink;
  const rgba = (c, a) => { const [r, gg, b] = color.rgb(c).map(v => Math.round(v * 255)); return `rgba(${r},${gg},${b},${a.toFixed(3)})`; };
  const pct = (x, y) => `${((x / asp) * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;
  const c = prm.cell;
  const dot = color.mix(T.near, T.line, Math.min(0.5, T.aDot * s * 0.9));
  const at = pct(g.C[0], g.C[1]);
  const ang = (Math.atan2(g.corner[0] - g.C[0], -(g.corner[1] - g.C[1])) * 180) / Math.PI;
  const R = 0.3 + 0.4 * prm.calm;
  const L = lightAt(g, prm, 6);
  const layers = [
    grainCSS(0.05),
    `radial-gradient(${((R / asp) * 100).toFixed(1)}% ${(R * 100).toFixed(1)}% at ${at}, ${rgba(T.near, Math.min(1, prm.calm * 1.6))} 35%, transparent 100%)`,
    `linear-gradient(${ang.toFixed(1)}deg, ${rgba(T.near, 0.75 - 0.6 * prm.reach)}, transparent 75%)`,
    `radial-gradient(ellipse 58% 60% at 50% 50%, transparent 72%, ${rgba(P.bg, 0.92)} 100%)`,
  ];
  if (prm.major > 2.5) {
    const M = c * prm.major, h = M / 2;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${M}' height='${M}'><path d='M${h - 3} ${h + 0.5}h7M${h + 0.5} ${h - 3}v7' stroke='${color.mix(T.near, T.line, Math.min(0.5, T.aDot * s * 0.8))}' stroke-width='1' shape-rendering='crispEdges'/></svg>`;
    layers.push(`url("data:image/svg+xml,${encodeURIComponent(svg)}") calc(50% - ${h}px) calc(50% - ${h}px) / ${M}px ${M}px`);
  }
  layers.push(
    `radial-gradient(circle at 50% 50%, ${dot} 0.8px, transparent 1.3px) 50% 50% / ${c}px ${c}px`,
    `radial-gradient(${((g.pr * 1.6 / asp) * 100).toFixed(1)}% ${(g.pr * 160).toFixed(1)}% at ${pct(L[0], L[1])}, ${rgba(T.pool, prm.focus * 0.8)}, transparent 72%)`,
    `linear-gradient(${ang.toFixed(1)}deg, ${T.near}, ${color.mix(T.near, T.far, 0.5)} 55%, ${T.far})`,
  );
  return `${layers.join(', ')}, ${P.bg}`;
}

export default {
  id: 'ruled-grounds',
  name: 'Ruled dot ground',
  family: 'pattern',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      fallback,
      crisp: true,   // dots and crosses on whole device pixels, never resampled
      maxDpr: 3,     // so 3x and 2.6x screens are drawn 1:1, never pixel-upscaled
      fps: 30,       // the light moves a few pixels a frame; 30 frames are plenty
      still: 6,
    });
  },
};
