// painterly-landscape: a soft, defocused landscape in the page colours, painted in broad dabs: a sky that
// lightens toward the horizon, hazy far hills, a middle ridge and a near hill whose crest catches the light.
// The ground for a UI window on a feature card. Light palettes get a pale day sky, dark ones a dusk that is
// light only near the horizon, colour palettes a sky of the page colour over a field.
// The picture is soft, so it renders at about half resolution; the film grain is a full-resolution CSS layer.
import { shader, color, grainCSS } from '../fx.js';

const params = {
  horizon: { default: 0.45, min: 0.3,  max: 0.7,  step: 0.01 }, // far horizon, 0 top .. 1 bottom
  slope:   { default: 14,   min: 0,    max: 30,   step: 1 },    // how steeply the near hill rises, degrees
  side:    { default: 0,    min: -1,   max: 1,    step: 1 },    // side the hill rises toward: -1 left, 1 right, 0 away from the calm area
  hillY:   { default: 0.12, min: -0.1, max: 0.35, step: 0.01 }, // near hill below the horizon at the centre
  blur:    { default: 0.6,  min: 0,    max: 1,    step: 0.01 }, // defocus of edges and dabs
  brush:   { default: 0.6,  min: 0,    max: 1,    step: 0.01 }, // strength of the brush dabs
  grain:   { default: 0.03, min: 0,    max: 0.1,  step: 0.005 },// film grain (a CSS layer)
  drift:   { default: 0.02, min: 0,    max: 0.2,  step: 0.005 },// how fast the light and the dabs move
  calm:    { default: 0.4,  min: 0,    max: 1,    step: 0.01 }, // a quiet patch of the page ground where text sits
  calmX:   { default: 0.5,  min: 0,    max: 1,    step: 0.01 },
  calmY:   { default: 0.55, min: 0,    max: 1,    step: 0.01 },
};

const frag = /* glsl */ `
// soft steps: plateaus joined by soft edges, so noise reads as separate dabs of paint
float dabs(float n, float k, float soft) {
  float q = n * k;
  return (floor(q) + smoothstep(0.5 - soft, 0.5 + soft, fract(q))) / k;
}
// brush dabs along direction d: long in d, narrow across it; about -1..1. off moves them in their own
// frame (off.x along the stroke), so a drift never shears them
float strokes(vec2 p, vec2 d, float len, float wid, vec2 off, float soft) {
  vec2 r = vec2(dot(p, d), dot(p, vec2(-d.y, d.x))) + off;
  float n = fx_noise(vec2(r.x * len, r.y * wid)) + 0.5 * fx_noise(vec2(r.x * len * 2.3, r.y * wid * 2.2) + 5.3);
  return dabs(n, 2.5, soft);
}

void main() {
  vec2 uv = fx_uv();
  float asp = u_res.x / u_res.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y);              // x centred, both in height units, y down
  float t = u_time * u_drift + u_seed * 0.0137;
  vec2 so = vec2(u_seed * 0.0213, u_seed * 0.0119);
  float bl = 0.25 + 0.75 * u_blur;
  float soft = 0.1 + 0.32 * u_blur;
  float hz = u_horizon;

  // the calm patch where text sits: wide, with a ragged edge like a cloud shadow or a bank of mist
  vec2 cd = (uv - vec2(u_calmX, u_calmY)) * vec2(asp * 0.45, 1.0);
  float cr = (0.2 + 0.32 * u_calm) * (1.0 + 0.4 * fx_fbm(p * vec2(1.4, 4.5) + so + vec2(t, 0.0)));
  float calm = (1.0 - smoothstep(cr * 0.45, cr, length(cd))) * min(1.0, u_calm * 2.5);
  float bk = u_brush * (1.0 - 0.85 * calm);

  // sky: deep at the top, lighter toward the horizon, a broad glow on the open side
  float sy = clamp(uv.y / hz, 0.0, 1.0);
  vec3 col = mix(u_skyTop, u_skyMid, smoothstep(0.0, 0.75, sy));
  col = mix(col, u_skyLow, pow(smoothstep(0.3, 1.0, sy), 1.5));
  vec2 sun = u_sun + vec2(0.16 * sin(t * 2.1), 0.0);
  vec2 ds = (p - sun) * vec2(0.45, 1.0);
  float glow = exp(-dot(ds, ds) * 5.0);
  col = mix(col, u_glow, glow * 0.65);
  // sky dabs: long and nearly level, a touch lighter and warmer where they catch the glow
  float sk = strokes(p, normalize(vec2(1.0, 0.1 * sin(p.x * 1.3 + so.x))), 1.2, 7.5, so + vec2(t * 0.5, 0.0), soft);
  col = mix(col, u_glow, clamp(sk, 0.0, 1.0) * 0.22 * bk * (0.3 + 0.7 * sy));
  col.x -= clamp(-sk, 0.0, 1.0) * 0.035 * bk;

  // far hills: a hazy band at the horizon, almost in focus
  float farY = hz + 0.035 * fx_fbm(vec2(p.x * 1.8 + 3.1, 1.7) + so) + 0.01 * fx_noise(vec2(p.x * 7.0, 4.0) + so);
  float wf = 0.003 + 0.01 * bl;
  vec3 farCol = mix(u_far, u_skyLow, 0.3 * glow);
  col = mix(col, farCol, smoothstep(farY - wf, farY + wf, uv.y));

  // a middle ridge, rising gently on the other side, a step deeper
  float hm = hz + 0.07 + u_dir * 0.1 * p.x + 0.035 * fx_fbm(vec2(p.x * 1.4 + 9.1, 2.3) + so);
  float wm = 0.005 + 0.025 * bl;
  vec3 midCol = mix(u_mid, u_near, smoothstep(hm, hm + 0.35, uv.y) * 0.5);
  float ms = strokes(p, normalize(vec2(1.0, u_dir * 0.1)), 2.2, 15.0, so + 3.0 + vec2(t * 0.1, 0.0), soft);
  midCol = mix(midCol, u_far, clamp(ms, 0.0, 1.0) * 0.35 * bk);
  col = mix(col, midCol, smoothstep(hm - wm, hm + wm, uv.y));

  // the near hill: one long diagonal, the most defocused plane, its crest lit
  float ta = tan(radians(u_slope));
  float hy = hz + u_hillY - u_dir * ta * p.x + 0.065 * fx_fbm(vec2(p.x * 1.1 + 7.3, 4.2) + so);
  float wn = 0.008 + 0.05 * bl;
  float near = smoothstep(hy - wn, hy + wn * 0.6, uv.y);
  float into = clamp((uv.y - hy) / 0.45, 0.0, 1.0);
  float sx = (p.x - sun.x) * 0.6;
  float lit = 0.6 + 0.4 * exp(-sx * sx);
  vec3 nearCol = mix(u_nearLit, u_near, smoothstep(0.0, 0.5, into / lit));
  nearCol = mix(nearCol, u_deep, smoothstep(0.4, 1.0, into));
  // brush: dabs along the slope that trade lit and shade tones, so the grass reads as paint
  vec2 dv = normalize(vec2(1.0, -u_dir * ta));
  float b = 0.7 * strokes(p, dv, 2.4, 15.0, so + 7.0 + vec2(t * 0.12, 0.0), soft)
          + 0.45 * strokes(p, normalize(dv + vec2(0.0, 0.3 * u_dir)), 5.0, 28.0, so + 11.0, soft);
  nearCol = mix(nearCol, u_nearLit, clamp(b, 0.0, 1.0) * 0.6 * bk * (1.0 - 0.6 * into));
  nearCol = mix(nearCol, u_deep, clamp(-b, 0.0, 1.0) * 0.5 * bk);
  col = mix(col, nearCol, near);

  // soft fall-off toward the lower corners, like a lens
  vec2 v = (uv - vec2(0.5, 0.42)) * vec2(1.0, 1.2);
  col.x -= 0.05 * smoothstep(0.4, 1.0, length(v));

  // the calm patch: lightness held on the page ground's side of the text colour (darker under light
  // text, lighter under dark text), colour drawn toward the ground
  float held = u_capDir > 0.0 ? max(col.x, u_cap) : min(col.x, u_cap);
  float lift = abs(held - col.x);
  col.x = mix(col.x, held, calm);
  col.yz = mix(col.yz, u_ground.yz, calm * min(0.85, 0.45 + 2.5 * lift));
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

const L = c => color.lab(c)[0];
const at = (c, l) => color.withLightness(c, Math.min(0.98, Math.max(0.04, l)));
const sat = (c, k) => color.saturate(c, k);

// every tone is a mix, shade or tint of the page colours
function tones(P, kind) {
  const { bg, ink, muted, accent } = P;
  const acc = color.chroma(accent) > 0.03 ? accent : color.mix(ink, muted, 0.4);
  const Lb = L(bg);
  if (kind === 'dark') {
    // dusk: a deep sky that lights up only near the horizon, hills as dark shapes with a lit crest
    return {
      skyTop: color.mix(bg, acc, 0.05),
      skyMid: sat(color.mix(bg, acc, 0.18), 0.9),
      skyLow: sat(at(color.mix(acc, ink, 0.3), Math.max(0.72, Lb + 0.5)), 0.85),
      glow: at(color.mix(ink, acc, 0.35), Math.max(0.84, Lb + 0.6)),
      far: sat(at(color.mix(acc, muted, 0.55), Lb + 0.3), 0.5),
      mid: sat(at(color.mix(muted, acc, 0.3), Lb + 0.14), 0.45),
      nearLit: sat(at(color.mix(acc, muted, 0.35), Lb + 0.26), 0.6),
      near: sat(at(color.mix(bg, muted, 0.4), Lb + 0.07), 0.6),
      deep: at(bg, Lb + 0.01),
      ground: bg,
    };
  }
  if (kind === 'colour') {
    // a sky of the page colour, blue-ish far hills in its deeper shade, a field of the accent when it
    // sits far in hue (yellow on cobalt), else a deep shade of the ground
    const accFar = color.chroma(acc) > 0.04 && color.hueDistance(bg, acc) > 55;
    const light = L(ink) > Lb ? ink : sat(color.lighten(bg, Math.min(0.16, 0.98 - Lb)), 0.5);
    const field = accFar ? acc : color.lighten(bg, -0.2);
    const Ll = Math.min(0.8, Math.max(L(field), Lb + 0.12));
    return {
      skyTop: color.lighten(bg, -0.06),
      skyMid: bg,
      skyLow: color.mix(bg, light, 0.45),
      glow: color.mix(bg, light, 0.72),
      far: sat(color.mix(bg, light, 0.22), 0.8),
      mid: sat(color.lighten(bg, -0.1), 0.85),
      nearLit: sat(at(field, Ll), 0.82),
      near: sat(at(field, Ll - 0.24), 0.85),
      deep: color.mix(at(field, Ll - 0.38), color.lighten(bg, -0.2), 0.35),
      ground: bg,
    };
  }
  // light: a pale, almost neutral sky (no accent in it), hazy far hills, a hill of the accent whose crest
  // is lit warm; the hill sits at least a quarter of the lightness scale below the sky
  const cool = sat(color.mix(bg, ink, 0.12), 0.25);
  const Ls = Math.min(0.97, Lb + 0.05);
  const Llit = Math.min(Ls - 0.28, Math.max(0.52, L(acc) + 0.12));
  return {
    skyTop: at(cool, Lb - 0.07),
    skyMid: sat(color.lighten(bg, 0.02), 0.35),
    skyLow: sat(at(bg, Ls), 0.5),
    glow: at(bg, Math.min(0.99, Lb + 0.09)),
    far: sat(at(color.mix(bg, acc, 0.3), Ls - 0.12), 0.5),
    mid: sat(at(color.mix(bg, acc, 0.6), Ls - 0.22), 0.75),
    nearLit: sat(at(color.mix(acc, bg, 0.3), Llit), 1.3),
    near: sat(at(acc, Llit - 0.14), 1.05),
    deep: sat(at(acc, Llit - 0.25), 0.95),
    ground: bg,
  };
}

function uniforms({ palette, params, rng, kind, width, height }) {
  const k = tones(palette, kind);
  const asp = width && height ? width / height : 1.6;
  const r = rng;
  const coin = r() < 0.5 ? -1 : 1;
  // the hill rises away from the calm area (where text sits); a centred calm area lets the seed choose
  const dir = params.side !== 0 ? Math.sign(params.side) : Math.abs(params.calmX - 0.5) > 0.12 ? (params.calmX < 0.5 ? 1 : -1) : coin;
  // the calm patch keeps the ground on the far side of the text colour from the ink
  const inkLight = color.lab(palette.ink)[0] > color.lab(palette.bg)[0];
  const Lg = color.lab(palette.bg)[0];
  const u = {
    u_dir: dir, u_sun: [-dir * asp * (0.16 + 0.14 * r()), params.horizon - 0.06 - 0.06 * r()],
    u_cap: inkLight ? Lg + (kind === 'dark' ? 0.08 : 0.03) : Lg - 0.02, u_capDir: inkLight ? -1 : 1,
  };
  for (const [name, c] of Object.entries(k)) u['u_' + name] = color.labVec(c);
  return u;
}

// film grain as a CSS layer at full resolution, blended soft-light so it shades both ways
function grainLayer(amount) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='1 1'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>`;
  const url = `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/ /g, '%20')}")`;
  const d = document.createElement('div');
  d.className = 'fx-grain';
  d.setAttribute('aria-hidden', 'true');
  Object.assign(d.style, {
    position: 'absolute', inset: '0', zIndex: '-1', pointerEvents: 'none', borderRadius: 'inherit',
    backgroundImage: url, mixBlendMode: 'soft-light', opacity: String(Math.min(1, amount * 9)),
  });
  return d;
}

export default {
  id: 'painterly-landscape',
  name: 'Painterly landscape',
  family: 'mesh',
  params,
  mount(el, { palette, params: given, seed }) {
    const ctrl = shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      maxDpr: 0.6,
      still: 4,
      fallback: ({ palette: P, kind, params: prm, rng }) => {
        const k = tones(P, kind);
        const h = prm.horizon * 100;
        const dir = prm.side !== 0 ? Math.sign(prm.side) : Math.abs(prm.calmX - 0.5) > 0.12 ? (prm.calmX < 0.5 ? 1 : -1) : rng() < 0.5 ? -1 : 1;
        const ang = 180 + dir * (8 + prm.slope * 0.8);
        // a still landscape: the near hill as an angled band over sky and far hills
        return `${grainCSS(0.05)}, linear-gradient(${ang}deg, transparent ${h + prm.hillY * 100 - 2}%, ${k.nearLit} ${h + prm.hillY * 100 + 4}%, ${k.near} ${h + prm.hillY * 100 + 22}%, ${k.deep}), linear-gradient(${k.skyTop}, ${k.skyMid} ${h * 0.6}%, ${k.skyLow} ${h - 1}%, ${k.far} ${h + 1}%, ${k.mid} ${h + 9}%)`;
      },
    });
    let grain = null;
    const sync = p => {
      if (el.dataset.fxFallback || p.grain <= 0) { grain?.remove(); grain = null; return; }
      // above the canvas (which fx.shader puts first), under the content
      if (!grain) { grain = grainLayer(p.grain); const cv = el.querySelector(':scope > canvas.fx-canvas'); el.insertBefore(grain, cv ? cv.nextSibling : el.firstChild); }
      grain.style.opacity = String(Math.min(1, p.grain * 9));
    };
    sync({ grain: (given && given.grain != null) ? +given.grain : params.grain.default });
    return {
      pause: () => ctrl.pause(),
      resume: () => ctrl.resume(),
      redraw: () => ctrl.redraw(),
      set(next) { const p = ctrl.set(next); sync(p); return p; },
      setPalette: p => ctrl.setPalette(p),
      destroy() { ctrl.destroy(); grain?.remove(); grain = null; },
      get canvas() { return ctrl.canvas; },
      get info() { return ctrl.info; },
    };
  },
};
