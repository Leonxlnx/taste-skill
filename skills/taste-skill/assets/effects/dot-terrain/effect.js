// dot-terrain: rolling land drawn as a cloud of points, like a laser scan, seen in perspective and
// heaving in slow waves. Drawn per pixel: the pixel's ray is intersected with the waved ground (a few
// fixed-point steps), the ground's slope there is lit from the front left, and the nearest points of
// three rows are projected and drawn as anti-aliased discs. Every point sits a little off the grid, so
// no columns or rows line up into stripes. Lit slopes carry more and larger points on dark grounds,
// shaded slopes on light grounds (like a stipple drawing), so the land reads as form, and the crests
// take the accent. Where the rows crowd toward the horizon the points blend into their average tone.
import { shader, color, paletteKind } from '../fx.js';

const params = {
  spacing:   { default: 14,   min: 8,    max: 40,  step: 1 },     // point spacing at the bottom edge, CSS px
  dot:       { default: 3,    min: 1,    max: 6,   step: 0.1 },   // point size at the bottom edge, CSS px
  amplitude: { default: 0.17, min: 0,    max: 0.25, step: 0.01 }, // wave height
  waveScale: { default: 0.8,  min: 0.2,  max: 3,   step: 0.05 },  // wave size (higher: shorter waves)
  speed:     { default: 0.08, min: 0,    max: 0.5, step: 0.005 }, // wave speed
  opacity:   { default: 0.85, min: 0.1,  max: 1,   step: 0.01 },  // ink strength of the points
  shade:     { default: 0.75, min: 0,    max: 1,   step: 0.01 },  // how much the light shapes the land
  crest:     { default: 0.85, min: 0,    max: 1,   step: 0.01 },  // accent colour on the wave crests
  horizon:   { default: 0.24, min: 0.12, max: 0.6, step: 0.01 },  // horizon height, 0 top .. 1 bottom
  fog:       { default: 0.4,  min: 0,    max: 1,   step: 0.01 },  // how fast far points fade
  haze:      { default: 0.35, min: 0,    max: 1,   step: 0.01 },  // soft light over the horizon
  calm:      { default: 0.9,  min: 0,    max: 1,   step: 0.01 },  // fade the points where text sits (below 0.8 dots stay under the words)
  calmX:     { default: 0.25, min: 0,    max: 1,   step: 0.01 },
  calmY:     { default: 0.7,  min: 0,    max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
float dt_wave(vec2 w, float t) {
  float h = fx_noise(w + vec2(0.23 * t, -t) + u_off) * 1.3;
  h += 0.38 * sin(dot(w, u_dir) * 2.1 + t * 1.7);
  return h; // about -1.3..1.3
}
// waves calm down with distance, which also keeps the ray solve stable near the horizon
float dt_att(float z, float z0) { return 1.0 / (1.0 + 0.6 * max(z / z0 - 1.0, 0.0)); }

void main() {
  vec2 uv = fx_uv();
  float H = u_res.y;
  float hy = u_horizon * H;
  float sp = u_spacing * u_dpr;
  float F = 0.62 * H;                   // focal length, px (a wide lens, so rows crowd late)
  float z0 = F / sp;                    // depth of the row at the bottom edge (grid units)
  float camH = (H - hy) * 1.02 / sp;    // camera height (grid units), bottom row just below the frame
  float A = u_amplitude * (0.42 * camH + 16.5);  // wave height (grid units)
  float k = u_waveScale / 13.0;
  float t = u_time * u_speed * 1.5;

  float sx = gl_FragCoord.x - 0.5 * u_res.x;
  float sy = (H - gl_FragCoord.y) - hy; // px below the horizon

  // ground with a soft, wide lift over the horizon (wide enough never to read as a band)
  vec3 col = u_kGround;
  float hz = exp(-abs(sy) / ((sy < 0.0 ? 0.16 : 0.07) * H));
  col = mix(col, u_kHaze, hz * hz * u_haze);

  float calmM = 1.0 - u_calm * fx_calm(uv, vec2(u_calmX, u_calmY), 0.3 + 0.4 * u_calm);
  if (sy > 0.5) {
    // where this pixel's ray meets the waved ground
    float z = F * camH / sy;
    for (int i = 0; i < 3; i++) {
      float x = sx * z / F;
      float h = A * dt_att(z, z0) * dt_wave(vec2(x, z) * k, t);
      z = max(F * (camH - h) / sy, 1.0);
    }
    float xw = sx * z / F;
    // the slope there, lit from the front left: 0 in shadow .. 1 fully lit
    float att = A * dt_att(z, z0);
    float h0 = dt_wave(vec2(xw, z) * k, t);
    float hx = dt_wave(vec2(xw + 0.7, z) * k, t);
    float hz2 = dt_wave(vec2(xw, z + 0.7) * k, t);
    vec3 nrm = normalize(vec3(-(hx - h0) * att / 0.7, 1.0, -(hz2 - h0) * att / 0.7));
    float lit = clamp(dot(nrm, vec3(-0.46, 0.5, -0.73)) * 1.5 - 0.05, 0.0, 1.0);
    // dark grounds: points are light, so the lit side carries them; light grounds: the shaded side
    float tone = mix(1.0 - lit, lit, u_dark);
    float sizeK = mix(1.0, mix(0.62, 1.3, tone), u_shade);

    // the nearest points of three rows; each point is jittered off the grid by its own hash
    float j0 = floor(z + 0.5);
    float cov = 0.0;
    for (int m = -1; m <= 1; m++) {
      float zr = max(j0 + float(m), 1.0);
      float xr = sx * zr / F;
      float hr = A * dt_att(zr, z0) * dt_wave(vec2(xr, zr) * k, t);
      float r = max(0.5 * u_dot * u_dpr * z0 / zr * sizeK, 0.42 * u_dpr);
      float rr = max(r, 0.6);
      float ib = floor(xr);
      for (int n = 0; n < 2; n++) {
        float i = ib + float(n);
        vec2 jit = fx_hash2(vec2(i, zr) + 71.0) - 0.5;
        float xi = i + jit.x * 0.62, zi = max(zr + jit.y * 0.5, 0.6);
        vec2 dp = vec2(F * xi / zi, F * (camH - hr) / zi);
        float d = length(vec2(sx, sy) - dp);
        cov = max(cov, clamp(rr + 0.5 - d, 0.0, 1.0) * (r * r) / (rr * rr));
      }
    }
    // rows or columns closer than a few pixels: the points turn into a fine stipple of their average
    // tone (half dithered single pixels, half flat), so the land stays grainy up to the haze
    float gapY = F * camH / (z * z);
    float gapX = F / z;
    float r = 0.5 * u_dot * u_dpr * z0 / z * sizeK;
    float avg = min(1.0, 3.14159 * r * r / (gapX * gapY) * 1.7);
    float stip = step(fx_hash(gl_FragCoord.xy + 13.0), avg * 1.6);
    // (less stipple on dark grounds, where single bright pixels read as static)
    cov = mix(cov, mix(avg, stip * 0.8, mix(0.6, 0.3, u_dark)), smoothstep(2.6 * u_dpr, 1.0 * u_dpr, min(gapX, gapY)));
    // fog: near points full, far points fade into the ground
    float fog = pow(clamp(sy / (H - hy), 0.0, 1.0), 0.3 + 1.05 * u_fog);
    // crests catch the accent
    float cr = smoothstep(0.1, 0.85, h0 / 1.3);
    float a = min(1.0, cov * fog * u_opacity * 1.3 * mix(1.0, mix(0.2, 1.4, tone), u_shade) * (0.85 + 0.4 * cr)) * calmM;
    vec3 dotc = mix(u_kInk, u_kAcc, cr * u_crest * smoothstep(0.05 * H, 0.2 * H, sy));
    col = mix(col, dotc, a);
  }
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

function tones(P) {
  const { bg, ink, accent } = P;
  const kind = paletteKind(P);
  const dark = color.lab(ink)[0] > color.lab(bg)[0];
  // the accent marks the crests; one that clashes with a colour ground or barely shows on it is
  // replaced by a strong step of the ink
  let acc = accent;
  if ((kind === 'colour' && color.hueDistance(bg, accent) > 55 && color.contrast(bg, accent) < 2) || color.contrast(bg, accent) < 1.35) acc = color.mix(bg, ink, 0.85);
  return {
    dark,
    ground: bg,
    ink,
    acc,
    // a gentle lift over the horizon: a little lighter on light grounds, a little toward the ink otherwise
    haze: dark || kind === 'colour' ? color.mix(bg, color.mix(ink, acc, 0.4), 0.1) : color.mix(bg, '#ffffff', 0.35),
  };
}

function uniforms({ palette, seed }) {
  const k = tones(palette);
  const a = (seed * 2.399) % (Math.PI * 2);
  return {
    u_kGround: color.labVec(k.ground),
    u_kInk: color.labVec(k.ink),
    u_kAcc: color.labVec(k.acc),
    u_kHaze: color.labVec(k.haze),
    u_dark: k.dark ? 1 : 0,
    u_dir: [Math.cos(a) * 0.4, Math.sin(a) * 0.4 + 0.92],
    u_off: [((seed * 0.0173) % 31) + 2.3, ((seed * 0.0291) % 29) - 5.1],
  };
}

// CSS stand-in: rows of points in perspective (smaller, closer and fainter toward the horizon) under a
// soft lift of light; one background layer per row
function fallback({ palette: P, params: prm, height }) {
  const k = tones(P);
  const Hpx = height || 500, hz = prm.horizon * 100;
  const Hb = Hpx * (1 - prm.horizon);              // px from the horizon to the bottom edge
  const layers = [];
  // rows in perspective: each one deeper by about one point spacing on screen, smaller and fainter
  let d = 1, n = 0, y = 100;
  for (; n < 30; n++) {
    y = hz + (100 - hz) * (0.985 / d);
    const s = Math.max(2.5, prm.spacing / d);
    const r = Math.max(0.5, (prm.dot / 2) / d);
    const fog = Math.pow(Math.max(0, (y - hz) / (100 - hz)), 0.3 + 1.05 * prm.fog);
    const c = color.mix(k.ground, n < 6 && prm.crest > 0 ? color.mix(k.ink, k.acc, 0.3) : k.ink, Math.min(1, prm.opacity * fog));
    const off = (n * 7.3) % s;
    layers.push(`radial-gradient(circle, ${c} ${r.toFixed(2)}px, ${c}00 ${(r + 0.7).toFixed(2)}px) ${off.toFixed(1)}px ${y.toFixed(2)}% / ${s.toFixed(2)}px ${s.toFixed(2)}px repeat-x`);
    d += Math.max(0.05, (0.8 * prm.spacing * d) / Hb);
    if (s <= 2.6) break;
  }
  // beyond the last row: the points' average tone fading into the haze
  const far = color.mix(k.ground, k.ink, Math.min(0.3, prm.opacity * 0.22));
  layers.push(`linear-gradient(to bottom, ${k.ground} 0, ${k.haze} ${hz.toFixed(1)}%, ${far} ${Math.min(99, y).toFixed(1)}%, ${k.ground}00 ${Math.min(100, y + 2).toFixed(1)}%)`);
  layers.push(k.ground);
  return layers.join(', ');
}

export default {
  id: 'dot-terrain',
  name: 'Dot terrain',
  family: 'pattern',
  params,
  mount(el, { palette, params: given, seed }) {
    return shader(el, { frag, schema: params, params: given, palette, seed, uniforms, still: 4, fallback });
  },
};
