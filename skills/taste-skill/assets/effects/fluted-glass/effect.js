// fluted-glass: a pane of reeded glass over a soft colour field. Every rib is a small cylinder lens that
// shows a narrow, mirrored slice of what is behind it, with a thin highlight on its lit side and a dark
// seam where two ribs meet. The field behind is part of the same shader, so it is one pass.
import { shader, color, fallbackCSS } from '../fx.js';

const params = {
  ribWidth:   { default: 28,   min: 10, max: 80,  step: 1 },    // CSS px
  angle:      { default: 0,    min: -45, max: 45, step: 1 },    // rib angle in degrees, 0 vertical
  distortion: { default: 0.5,  min: 0,  max: 1,   step: 0.01 }, // how far each rib bends the view
  highlight:  { default: 0.15, min: 0,  max: 1,   step: 0.01 }, // thin light line on each rib
  shadow:     { default: 0.16, min: 0,  max: 1,   step: 0.01 }, // dark seam between ribs
  background: { default: 0,    min: 0,  max: 1,   step: 1 },    // 0 a soft mesh of the page colours, 1 one bold shape
  blur:       { default: 0.1,  min: 0,  max: 1,   step: 0.01 }, // frost: softens the view through the glass
  speed:      { default: 0.03, min: 0,  max: 0.3, step: 0.005 },// how fast the field behind moves
  clear:      { default: 0,    min: 0,  max: 0.6, step: 0.01 }, // share of the width on the calm side with no glass
  calm:       { default: 0.4,  min: 0,  max: 1,   step: 0.01 }, // flatten the field where text sits
  calmX:      { default: 0.25, min: 0,  max: 1,   step: 0.01 },
  calmY:      { default: 0.7,  min: 0,  max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
float sq(float x) { return x * x; }

// a soft shape: flat core, edge from firm to soft; c.xy centre, c.z vertical stretch, r radius
float shape(vec2 p, vec3 c, float r, float firm) {
  float d = length((p - c.xy) * vec2(1.0, c.z)) / r;
  return 1.0 - smoothstep(firm, 1.0, d);
}
vec3 moveShape(vec4 b, float t) {
  return vec3(b.xy + 0.16 * vec2(sin(t + b.w), cos(t * 0.8 + b.w * 1.7)), 1.0 + 0.12 * sin(t * 0.6 + b.w));
}

// the field behind the glass, in OKLab; q in centred height units (y up), already warped
vec3 field(vec2 q, vec3 c0, vec3 c1, vec3 c2) {
  float s = dot(q - u_calmP, u_dir) / u_span;
  vec3 col = mix(u_kNear, u_kFar, smoothstep(-0.05, 0.9, s));
  float bold = step(0.5, u_background);
  // the main shape, a smaller deeper one overlapping its edge, and a pale glint; their edges are
  // firm enough for the ribs to break them visibly
  col = mix(col, u_k0, shape(q, c0, u_b0.z, mix(u_firm0, 0.86, bold)));
  col = mix(col, u_k1, shape(q, c1, u_b1.z, 0.55) * (1.0 - bold * 0.4) * 0.92);
  col = mix(col, u_k2, shape(q, c2, u_b2.z, 0.35) * (1.0 - bold) * 0.85);
  return col;
}

void main() {
  vec2 css = gl_FragCoord.xy / u_dpr;                   // CSS px, y up
  vec2 res = u_res / u_dpr;
  vec2 uv = fx_uv();
  float t = u_time * u_speed * 1.6 + u_seed * 0.21;
  float a = radians(u_angle);
  vec2 across = vec2(cos(a), -sin(a));                  // perpendicular to the ribs
  float x = dot(css, across);
  float W = max(4.0, u_ribWidth);
  float u = fract(x / W);
  float cu = u - 0.5;

  // glass or clear: the clear part sits on the calm side
  float edgeX = u_calmX < 0.5 ? res.x * u_clear : res.x * (1.0 - u_clear);
  float sideD = u_calmX < 0.5 ? css.x - edgeX : edgeX - css.x;   // > 0 inside the glass
  float glass = u_clear > 0.001 ? smoothstep(-0.5, 0.5, sideD) : 1.0;

  // cylinder lens: the slope of the rib surface grows toward its edges, and so does the bend
  float slope = cu / sqrt(0.3 - cu * cu);
  float bend = -u_distortion * 4.2 * slope * W * glass;
  vec2 sp = css + across * bend;
  vec2 p = (sp - 0.5 * res) / res.y;
  // slow organic warp of the field, once per pixel (the blur taps share it)
  p += 0.08 * vec2(fx_noise(p * 1.3 + vec2(t * 0.6, 0.0)), fx_noise(p * 1.3 + vec2(4.1, -t * 0.5)));
  vec3 c0 = moveShape(u_b0, t), c1 = moveShape(u_b1, t * 1.1), c2 = moveShape(u_b2, t * 0.9);
  vec3 col;
  if (u_blur > 0.001) {
    vec2 o = across * (u_blur * W * 0.6) / res.y;
    col = 0.5 * (field(p + o, c0, c1, c2) + field(p - o, c0, c1, c2));
  } else col = field(p, c0, c1, c2);

  // calm area: the field flattens toward the near tone
  float m = fx_calm(uv, vec2(u_calmX, u_calmY), 0.4 + 0.45 * u_calm) * u_calm;
  col = mix(col, u_kNear, m * 0.85);

  // light on the ribs: a soft roll across each rib, a thin line on the lit side, a seam where ribs meet
  float roll = -slope * 0.5;
  float hl = exp(-sq((u - 0.16) / 0.055)) + 0.35 * exp(-sq((u - 0.05) / 0.03));
  float seam = exp(-sq((1.0 - u) / 0.075)) + exp(-sq(u / 0.04)) * 0.5;
  float calmRib = 1.0 - 0.6 * m;
  float lightAmt = (roll * 0.018 * (0.4 + u_highlight) + hl * u_highlight * 0.3) * glass * calmRib;
  float shadowAmt = (seam * u_shadow * 0.15 + max(0.0, -roll) * u_shadow * 0.03) * glass * calmRib;
  col.x += lightAmt * u_lightK - shadowAmt;
  col.yz *= 1.0 - 0.25 * hl * u_highlight * glass;

  // the edge of the pane when part is clear: a bright bevel and a soft shadow beside it
  if (u_clear > 0.001) {
    float bev = exp(-sq(sideD / 1.2));
    float sh = exp(-max(0.0, -sideD) / 10.0) * step(sideD, 0.0);
    col.x += bev * 0.06 - sh * 0.025 * u_shadow * 3.0;
  }

  col.x += fx_grain(gl_FragCoord.xy, 0.0) * 0.006;
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

// a tone of c at lightness L; a light blue that leans violet is turned toward azure and a light
// purple-magenta toward pink, so no tint reads periwinkle, lavender or orchid
function lit(c, L, ck = 1) {
  let [, C, h] = color.lch(c);
  if (C > 0.03 && L >= 0.5) {
    if (h > 250 && h < 300) h = Math.max(236, h - 26);
    else if (h >= 300 && h < 340) h = Math.min(352, h + 20);
  }
  return color.fromLch([L, C * ck, h]);
}

// every colour is a tint or shade of the accent or the page background; the ink is never mixed in
// (an ink mixed into a colour field is what turns it khaki)
function tones(P, prm, kind) {
  const { bg, ink, accent } = P;
  const bold = prm.background > 0.5;
  const [Lb] = color.lab(bg), [Li] = color.lab(ink);
  const away = Li > Lb ? -1 : 1;
  const near = color.lighten(bg, away * 0.015);
  if (kind === 'dark') {
    // a lit accent, a deeper shade of it and a pale glint, on the dark page
    const La = color.lab(accent)[0];
    return {
      near, far: color.mix(bg, accent, 0.08), lightK: 1.15,
      k: [color.mix(bg, lit(accent, Math.max(0.55, Math.min(0.7, La))), bold ? 0.85 : 0.6), color.mix(bg, lit(accent, 0.4, 0.9), 0.75), color.mix(bg, lit(accent, 0.86, 0.5), 0.55)],
    };
  }
  if (kind === 'colour') {
    // the accent as one firm shape, and a deeper and a lighter tone of the page colour
    const Lbg = Lb;
    return {
      near, far: color.lighten(bg, -away * 0.05), lightK: 1.1,
      k: [accent, lit(bg, Math.max(0.2, Lbg - 0.14), 1.0), lit(bg, Math.min(0.9, Lbg + 0.2), 0.9)],
    };
  }
  // light: the accent mixed half back into the page (a full accent through ribs reads as a barcode),
  // a deeper accent shade that is small, and a white glint
  return {
    near, far: color.mix(bg, accent, 0.06), lightK: 1.0,
    // (the half-strength accent is a lighter, softer accent, not a mix with the page: a page of another
    // hue would turn it grey or mauve)
    k: [bold ? accent : lit(accent, color.lab(color.mix(bg, accent, 0.5))[0], 0.62), color.mix(bg, lit(accent, Math.min(0.5, color.lab(accent)[0]), 0.9), 0.62), color.mix(bg, '#ffffff', 0.7)],
  };
}

function uniforms({ palette, params, rng, kind, width, height }) {
  const r = rng;
  const set = tones(palette, params, kind);
  const asp = width && height ? width / height : 4 / 3;
  const calm = [(params.calmX - 0.5) * asp, 0.5 - params.calmY];
  // the shapes sit across from the calm area
  const far = [calm[0] < 0 ? asp / 2 : -asp / 2, calm[1] < 0 ? 0.5 : -0.5];
  const span = Math.max(0.3, Math.hypot(far[0] - calm[0], far[1] - calm[1]));
  const dir = [(far[0] - calm[0]) / span, (far[1] - calm[1]) / span];
  const sx = calm[0] < 0 ? 1 : -1;
  const clamp = (v, a) => Math.max(-a, Math.min(a, v));
  const bold = params.background > 0.5;
  const b0 = bold
    ? [clamp(sx * asp * (0.16 + 0.08 * r()), asp / 2 - 0.25), 0.04 + 0.12 * (r() - 0.5), 0.36 + 0.06 * r(), r() * 6.283]
    : [clamp(sx * asp * (0.16 + 0.1 * r()), asp / 2 - 0.15), 0.06 + 0.16 * (r() - 0.5), 0.36 + 0.08 * r(), r() * 6.283];
  // the deeper shape sits on the main one's edge, toward the middle; the glint on its far side
  const b1 = [b0[0] - sx * (0.18 + 0.1 * r()), b0[1] + (r() < 0.5 ? 1 : -1) * (0.2 + 0.08 * r()), 0.2 + 0.08 * r(), r() * 6.283];
  const b2 = [clamp(b0[0] + sx * (0.22 + 0.12 * r()), asp / 2), b0[1] - 0.26 - 0.1 * r(), 0.2 + 0.07 * r(), r() * 6.283];
  return {
    u_kNear: color.labVec(set.near),
    u_kFar: color.labVec(set.far),
    u_k0: color.labVec(set.k[0]),
    u_k1: color.labVec(set.k[1]),
    u_k2: color.labVec(set.k[2]),
    u_lightK: set.lightK,
    // a main shape far in hue from the field (a navy shape on mustard) gets a firm edge: a wide soft
    // edge between two far hues is a band of grey
    u_firm0: color.hueDistance(palette.bg, set.k[0]) > 80 ? 0.8 : 0.45,
    u_calmP: calm,
    u_dir: dir,
    u_span: span,
    u_b0: b0,
    u_b1: b1,
    u_b2: b2,
  };
}

export default {
  id: 'fluted-glass',
  name: 'Fluted glass',
  family: 'material',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      still: 5,
      fallback: ({ palette: P, params: prm, kind }) => {
        const k = tones(P, prm, kind).k;
        const ribs = `repeating-linear-gradient(${90 + prm.angle}deg, rgba(255,255,255,0.07) 0 1px, transparent 1px ${prm.ribWidth - 2}px, rgba(0,0,0,0.08) ${prm.ribWidth - 1}px ${prm.ribWidth}px)`;
        return `${ribs}, ${fallbackCSS({ ...P, accent: k[0] }, { at: `${(1 - prm.calmX) * 100}% 45%`, tint: 1 })}`;
      },
    });
  },
};
