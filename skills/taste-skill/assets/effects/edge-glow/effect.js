// edge-glow: light runs around the edge of a card or prompt box. A bright head travels the border
// (measured by arc length, at a steady speed in px per second, capped on small boxes) with a long tail
// that fades evenly behind it; the whole border keeps a faint idle glow, and the head throws a soft
// wash of its colour into the box as it passes. By default the element itself is the card (inset 0):
// put the content straight inside it. With inset > 0 the effect draws its own card that many px inside
// the element and the glow also blooms outward into that margin.
import { shader, color } from '../fx.js';

const params = {
  radius:      { default: 14,   min: 0,    max: 48,  step: 1 },     // corner radius, CSS px (match the element's)
  width:       { default: 1.4,  min: 0.5,  max: 3,   step: 0.1 },   // border width, CSS px
  glow:        { default: 26,   min: 0,    max: 48,  step: 1 },     // glow spread, CSS px
  bloom:       { default: 0.6,  min: 0,    max: 1,   step: 0.01 },  // glow strength
  segment:     { default: 0.4,  min: 0.1,  max: 0.7, step: 0.01 },  // length of the tail, share of the edge
  speed:       { default: 140,  min: 20,   max: 400, step: 5 },     // CSS px per second (at most a quarter lap per second)
  count:       { default: 1,    min: 1,    max: 2,   step: 1 },     // one head, or two on opposite sides
  idle:        { default: 0.35, min: 0,    max: 1,   step: 0.01 },  // the faint glow along the rest of the border
  wash:        { default: 0.5,  min: 0,    max: 1,   step: 0.01 },  // light the head throws into the box
  inset:       { default: 0,    min: 0,    max: 80,  step: 1 },     // 0: the element is the card; else the card edge, CSS px inside
  fill:        { default: 0,    min: 0,    max: 1,   step: 1 },     // 1 fills the card with the surface colour, 0 with the page colour
};

const frag = /* glsl */ `
const float FX_PI = 3.14159265359;
float sdRR(vec2 q, vec2 b, float r) {
  vec2 d = abs(q) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}
// arc-length position of the nearest edge point, clockwise from the left end of the top side (y down)
float arcPos(vec2 q, vec2 b, float r, out float per) {
  vec2 c = max(b - r, vec2(0.0));
  float qa = 0.5 * FX_PI * r;
  per = 4.0 * (c.x + c.y) + 4.0 * qa;
  vec2 a = abs(q);
  bool inX = a.x <= c.x;
  bool inY = a.y <= c.y;
  if (inX && inY) {
    if (b.y - a.y < b.x - a.x) inY = false; else inX = false;
  }
  if (inX) return q.y < 0.0 ? q.x + c.x : 2.0 * c.x + 2.0 * c.y + 2.0 * qa + (c.x - q.x);
  if (inY) return q.x > 0.0 ? 2.0 * c.x + qa + (q.y + c.y) : 4.0 * c.x + 2.0 * c.y + 3.0 * qa + (c.y - q.y);
  vec2 cc = sign(q) * c;
  float th = atan(q.y - cc.y, q.x - cc.x);
  if (q.x > 0.0 && q.y < 0.0) return 2.0 * c.x + r * (th + 0.5 * FX_PI);
  if (q.x > 0.0) return 2.0 * c.x + 2.0 * c.y + qa + r * th;
  if (q.y > 0.0) return 4.0 * c.x + 2.0 * c.y + 2.0 * qa + r * (th - 0.5 * FX_PI);
  return 4.0 * c.x + 4.0 * c.y + 3.0 * qa + r * (th + FX_PI);
}
// the edge point at arc length s (the inverse of arcPos)
vec2 pointAt(float s, vec2 b, float r) {
  vec2 c = max(b - r, vec2(0.0));
  float qa = 0.5 * FX_PI * r;
  float s1 = 2.0 * c.x, s2 = s1 + qa, s3 = s2 + 2.0 * c.y, s4 = s3 + qa;
  float s5 = s4 + 2.0 * c.x, s6 = s5 + qa, s7 = s6 + 2.0 * c.y;
  float rr = max(r, 1e-3);
  if (s < s1) return vec2(-c.x + s, -b.y);
  if (s < s2) { float th = -0.5 * FX_PI + (s - s1) / rr; return vec2(c.x, -c.y) + r * vec2(cos(th), sin(th)); }
  if (s < s3) return vec2(b.x, -c.y + (s - s2));
  if (s < s4) { float th = (s - s3) / rr; return c + r * vec2(cos(th), sin(th)); }
  if (s < s5) return vec2(c.x - (s - s4), b.y);
  if (s < s6) { float th = 0.5 * FX_PI + (s - s5) / rr; return vec2(-c.x, c.y) + r * vec2(cos(th), sin(th)); }
  if (s < s7) return vec2(-b.x, c.y - (s - s6));
  float th = FX_PI + (s - s7) / rr;
  return -c + r * vec2(cos(th), sin(th));
}
// the tail: full at the head, fading evenly (linearly) over L behind it, a short fade in front
float segWin(float s, float head, float per, float L) {
  float ds = mod(s - head + 0.5 * per, per) - 0.5 * per;
  float tail = clamp(1.0 + ds / L, 0.0, 1.0);
  float front = 1.0 - smoothstep(0.0, 0.04 * L + 6.0, ds);
  return tail * front;
}

void main() {
  float dpr = u_dpr;
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 q = px - 0.5 * u_res;
  float hw = 0.5 * u_width * dpr;
  float ins = min(u_inset * dpr, 0.45 * min(u_res.x, u_res.y));
  // with inset 0 the line sits just inside the element's own edge, so none of it is clipped
  float pad = max(ins, hw + 0.5);
  vec2 b = max(0.5 * u_res - pad, vec2(4.0));
  float rr = min(max(u_radius * dpr - (pad - ins), 0.0), min(b.x, b.y));
  float d = sdRR(q, b, rr);

  float per;
  float s = arcPos(q, b, rr, per);
  // steady px per second, at most a quarter lap per second on small boxes
  float v = min(u_speed, 0.25 * per / dpr) * dpr;
  float head = mod(u_time * v + u_seed * 37.0, per);
  float L = u_segment * per;
  float win = segWin(s, head, per, L);
  float h2 = mod(head + 0.5 * per, per);
  if (u_count > 1.5) win = max(win, segWin(s, h2, per, L));
  vec3 segCol = mix(u_cA, u_cB, win);

  float stroke = 1.0 - smoothstep(hw - 0.75, hw + 0.75, abs(d));
  float outside = smoothstep(-0.6, 0.6, d);
  float g = max(u_glow * dpr, 1.0);
  float dout = max(d, 0.0), din = max(-d, 0.0);
  float bloomOut = 0.55 * exp(-dout / (g * 0.35)) + 0.45 * exp(-dout * dout / (g * g) * 2.0);
  float edgeD = min(min(px.x, u_res.x - px.x), min(px.y, u_res.y - px.y));
  bloomOut *= smoothstep(0.0, max(ins * 0.85, 1.0), edgeD) * step(0.5, ins);
  float bloomIn = exp(-din / (g * 0.3)) * (1.0 - outside);
  float glowA = (bloomOut * outside + bloomIn) * u_bloom;

  // the wash: soft light thrown into the box around the head (and the middle of its tail)
  float R = 0.32 * min(b.x, b.y) + 3.0 * g;
  vec2 hp = pointAt(head, b, rr);
  vec2 tp = pointAt(mod(head - 0.3 * L + per, per), b, rr);
  float wsh = exp(-dot(q - hp, q - hp) / (R * R)) + 0.45 * exp(-dot(q - tp, q - tp) / (R * R));
  if (u_count > 1.5) {
    vec2 hp2 = pointAt(h2, b, rr);
    wsh += exp(-dot(q - hp2, q - hp2) / (R * R));
  }
  wsh *= u_wash * (1.0 - outside) * 0.6;

  vec3 col = mix(u_cardFill, u_bg, outside);
  col = mix(col, u_glowC, clamp(wsh, 0.0, 1.0) * u_glowK);
  // idle: the whole border holds a faint line and glow
  col = mix(col, u_glowC, clamp(glowA * u_idle * 0.5, 0.0, 1.0) * u_glowK);
  col = mix(col, u_line, stroke * (0.35 + 0.65 * u_idle));
  // the moving light: glow and line along the tail, white-hot at the head
  col = mix(col, u_glowC, clamp(win * (0.4 + 0.6 * win) * glowA * 1.4, 0.0, 1.0) * u_glowK);
  // the line swells a little toward the head
  float hwH = hw * (1.0 + 0.8 * smoothstep(0.6, 1.0, win));
  float strokeH = 1.0 - smoothstep(hwH - 0.75, hwH + 0.75, abs(d));
  col = mix(col, segCol, strokeH * win);
  col = mix(col, u_hot, strokeH * smoothstep(0.8, 1.0, win) * 0.9);
  col.x += fx_grain(gl_FragCoord.xy, floor(u_time * 24.0)) * 0.005;
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

// a neighbour hue of c, turned away from violet
function neighbour(c, deg = 40) {
  const h = color.lch(c)[2];
  const dist = x => { const d = Math.abs(((x % 360) + 360) % 360 - 305) % 360; return d > 180 ? 360 - d : d; };
  const turn = dist(h + deg) >= dist(h - deg) ? deg : -deg;
  return color.adjust(c, { h: turn });
}

// true when mixing ground into c in OKLab passes through violet or lavender (hue 275..335)
function crossesViolet(ground, c) {
  for (let t = 0.1; t < 1; t += 0.1) {
    const [, C, h] = color.lch(color.mix(ground, c, t));
    if (C > 0.012 && h >= 275 && h <= 335) return true;
  }
  return false;
}
// turn c's hue away from violet, a step at a time, until its mix with the ground stays clear of it
function clearOfViolet(ground, c) {
  const h = color.lch(c)[2];
  const dir = h >= 305 || h < 125 ? 1 : -1;
  for (let i = 0; i < 6 && crossesViolet(ground, c); i++) c = color.adjust(c, { h: 15 * dir });
  return c;
}

export function tones(P, prm) {
  const { bg, surface, ink, accent } = P;
  const [Lb] = color.lab(bg);
  const fill = prm.fill >= 0.5 ? surface : bg;
  // a grey accent: the light takes the ink instead, so it still reads as light, not as a smudge;
  // an accent whose mix with the ground would pass through lavender is turned a little away from it
  const src = clearOfViolet(fill, color.chroma(accent) < 0.03 ? color.withLightness(ink, 0.75) : accent);
  if (Lb < 0.6) {
    // dark: the tail is the accent, the head a lighter neighbour, white-hot at the tip
    const a = color.withLightness(color.saturate(src, 1.1), Math.max(0.68, color.lab(src)[0]));
    const b2 = clearOfViolet(fill, color.lighten(neighbour(a), 0.1));
    return {
      bg, fill, a, b: b2,
      line: color.mix(fill, ink, 0.3),
      hot: color.mix(b2, color.withLightness(ink, 0.98), 0.6),
      glow: color.mix(a, b2, 0.5),
      glowK: 1,
    };
  }
  // light: a saturated, mid-light accent line, and a glow that tints the ground toward a light
  // tint of the accent (never a darkened shadow colour)
  const [, Cs, hs] = color.lch(src);
  const Cl = Math.min(0.2, Math.max(Cs * 1.4, 0.13));
  const a = color.fromLch([0.6, Cl, hs]);
  const b2 = clearOfViolet(fill, color.withLightness(neighbour(a), 0.7));
  const tint = color.fromLch([Math.min(0.96, Math.max(Lb - 0.02, 0.8)), Math.min(0.13, Cl * 0.7), hs]);
  return {
    bg, fill, a: b2, b: a,
    line: color.mix(fill, ink, 0.22),
    hot: color.withLightness(color.saturate(a, 1.1), 0.6),
    glow: clearOfViolet(fill, tint),
    glowK: 1,
  };
}

function uniforms({ palette, params }) {
  const k = tones(palette, params);
  return {
    u_bg: color.labVec(k.bg), u_cardFill: color.labVec(k.fill), u_line: color.labVec(k.line),
    u_cA: color.labVec(k.a), u_cB: color.labVec(k.b), u_hot: color.labVec(k.hot), u_glowC: color.labVec(k.glow), u_glowK: k.glowK,
  };
}

export default {
  id: 'edge-glow',
  name: 'Edge glow',
  family: 'light',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      still: 1.5,
      fallback: ({ palette: P, params: prm }) => {
        const k = tones(P, prm);
        const i = prm.inset;
        const glow = `radial-gradient(45% 55% at 26% ${i}px, ${color.mix(k.fill, k.glow, 0.7)}, transparent 70%)`;
        // inset 0: the element (and its own rounded corners) is the card; otherwise a flat inner card
        if (!i) return `${glow}, ${k.fill}`;
        return `${glow}, linear-gradient(${k.fill}, ${k.fill}) center / calc(100% - ${2 * i}px) calc(100% - ${2 * i}px) no-repeat, `
          + `linear-gradient(${k.line}, ${k.line}) center / calc(100% - ${2 * i - 2}px) calc(100% - ${2 * i - 2}px) no-repeat, ${k.bg}`;
      },
    });
  },
};
