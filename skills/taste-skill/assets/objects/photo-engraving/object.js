// photo-engraving: a photograph printed whole as a hand-coloured engraving: diagonal lines in the page's
// ink over a light wash of the picture's own colours on the page's surface as paper, each line swelling
// where the picture is dark and tapering to a hairline in the light, bent over the forms (offset by the
// softened picture, so they curve round a shade or a shoulder). A part lighter than the paper prints as
// bare paper and a colour cast in the light parts is let go. Under the cursor the lines part around it
// as under a lens and the photograph shows through, while the picture itself stays put. At rest it is
// still (no frames run) and there is no entry: the plate is finished from its first frame. colour 0
// leaves out the wash. Lines thinner than a device pixel are drawn a pixel wide and lighter, so they
// taper instead of breaking into dashes.
import { photoGL } from '../photo-kit/photo.js';

const params = {
  ground:   { default: 1,    min: 0,   max: 1,   step: 1 },    // the paper: 1 the page's surface (the frame reads as a print on its own sheet), 0 the page itself
  colour:   { default: 1,    min: 0,   max: 1,   step: 0.01 }, // the wash of the photograph's own colours under the lines (0: ink lines on bare paper)
  pitch:    { default: 4.5,  min: 3,   max: 12,  step: 0.5 },  // line spacing, CSS px (finer in small frames; never under 3.5 canvas px)
  angle:    { default: 30,   min: -90, max: 90,  step: 1 },    // degrees from horizontal
  bend:     { default: 0.6,  min: 0,   max: 1,   step: 0.01 }, // how far the forms bend the lines (1: up to about twelve line widths)
  push:     { default: 0.7,  min: 0,   max: 1,   step: 0.01 }, // how far the lines part around the cursor
  radius:   { default: 160,  min: 60,  max: 420, step: 1 },    // the lens, CSS px (smaller in small frames)
  light:    { default: 0,    min: 0,   max: 1,   step: 0.01 }, // a slow light passing over the plate at rest (0: still, no frames at rest)
  speed:    { default: 1,    min: 0,   max: 2,   step: 0.01 },
  clarity:  { default: 0.2,  min: 0,   max: 1,   step: 0.01 }, // local contrast in the lines, so a pale object parts from a pale wall
  contrast: { default: 0.1,  min: 0,   max: 1,   step: 0.01 },
  exposure: { default: 0,    min: -1,  max: 1,   step: 0.01 },
  focusX:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 },
  focusY:   { default: 0.5,  min: 0,   max: 1,   step: 0.01 },
};

const frag = /* glsl */ `
// coverage of a set of lines at phase ph (one line per unit; fw: phase per canvas px) with half width
// w in lines. A line under a pixel wide is drawn a pixel wide and lighter, so its ink is kept and it
// tapers smoothly instead of breaking up.
float lines(float ph, float w, float fw) {
  if (w <= 0.0005) return 0.0;
  float d = abs(fract(ph) - 0.5);
  float wd = max(w, 0.55 * fw);
  float cov = clamp((wd - d) / fw + 0.5, 0.0, 1.0) - clamp((-wd - d) / fw + 0.5, 0.0, 1.0);
  return cov * (w / wd);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  // a big frame (a hero) takes slightly wider lines, so they still read as engraved at its size
  float big = clamp(sqrt(min(u_frame.x, u_frame.y) / 560.0), 1.0, 1.25);
  float pitch = max(3.5, u_pitch * u_fit * big * u_dpr);
  float a = radians(u_angle);
  vec2 along = vec2(cos(a), sin(a)), across = vec2(-sin(a), cos(a));

  vec3 photo = pk_sharp(p);
  float m = pk_rest(p, pk_tone(pk_photo(p, pitch * 2.0)));

  // the lens: the picture turns over under the cursor, and the lines (not the picture) are read from
  // points pulled toward it, so they part around it
  float R = u_radius * u_fit * u_dpr;
  vec2 v = p - u_mouse.xy;
  float lens = u_mouse.z * exp(-dot(v, v) / (R * R * 0.45));
  m = mix(m, pk_flip(m), smoothstep(0.05, 0.6, lens));
  vec2 q = p - v * lens * u_push * 0.55;

  // the forms bend the lines: offset by the picture softened at two sizes, several line widths
  float B = 0.7 * pk_tone(pk_photo(q, pitch * 18.0)) + 0.3 * pk_tone(pk_photo(q, pitch * 6.0)) - 0.5;
  float k = dot(q, across) / pitch + u_bend * 12.0 * B;
  float fw = max(PK_FW(k), 1e-4);

  // entry (on load only): each line is cut in along its length, from its own moment
  if (u_enter < 1.0) {
    float pos = clamp(dot(p / u_res - 0.5, along) / (abs(along.x) + abs(along.y)) + 0.5, 0.0, 1.0);
    float e = u_enter * 1.7 - 0.45 * fx_hash(vec2(floor(k), 3.0)) - 0.95 * pos;
    m = mix(1.0, m, clamp(e * 14.0, 0.0, 1.0));
  }
  if (m <= 0.002) { fxColor = vec4(fx_dither(photo), 1.0); return; }

  // the picture over half a line (outlines stay crisp), steered by the tone params
  vec3 ph = pk_steer(pk_photo(p, pitch * 0.5), p, pitch);
  vec3 lab = fx_oklab(ph);
  // the wash: the picture's own colour, lightened toward the paper (darkened on dark paper); the lines
  // in the ink carry the rest of the tone, so lines and wash average back to the photograph
  float Lp = u_paperLab.x;
  // (never past the paper: a part lighter than the paper prints as bare paper, not as a whiter sheet)
  float Lw = u_paperLight > 0.5 ? min(max(lab.x, mix(lab.x, Lp, 0.5)), Lp) : max(min(lab.x, mix(lab.x, Lp, 0.5)), Lp);
  // the wash keeps the picture's colour in its body and lets a cast go in its light parts, so a white
  // table under cool light stays the paper's white instead of a blue-grey sheet
  vec3 washLab = mix(u_paperLab, vec3(Lw, lab.yz * mix(1.05, 0.35, smoothstep(0.72, 0.94, lab.x))), u_colour);
  float thin = smoothstep(0.5, 1.0, m);
  vec3 wash = clamp(fx_rgb(mix(washLab, u_paperLab, thin)), 0.0, 1.0);
  float Yw = dot(fx_lin(clamp(fx_rgb(washLab), 0.0, 1.0)), PK_Y), Yc = dot(fx_lin(ph), PK_Y), Yi = dot(fx_lin(u_ink), PK_Y);
  float den = Yw - Yi;
  float c = abs(den) < 1e-3 ? 0.0 : clamp((Yw - Yc) / den, 0.0, 1.0);
  c *= 1.0 - thin;
  // the slow light (off by default): a broad soft band that crosses the plate and thins the lines
  if (u_light > 0.0) {
    float u = 0.7 * p.x / u_res.x + 0.3 * (1.0 - p.y / u_res.y);
    float band = (u - (fract(u_time * u_speed / 20.0) * 2.2 - 0.6)) / 0.32;
    c *= 1.0 - u_light * 0.16 * exp(-band * band);
  }
  vec3 engraved = mix(wash, u_ink, lines(k, 0.5 * c, fw));
  // the engraving comes in over the photograph it matches
  fxColor = vec4(fx_dither(mix(photo, engraved, smoothstep(0.0, 0.5, m))), 1.0);
}
`;

export default {
  id: 'photo-engraving',
  name: 'Engraved photograph',
  kind: 'photo',
  params,
  frag,
  mount(el, { palette, src, params: given, seed } = {}) {
    return photoGL(el, {
      name: 'photo-engraving', frag, schema: params, params: given, palette, src, seed, entry: 0, maxScale: 2,
      uniforms: ({ palette: P, params: p, color }) => ({ u_paperLab: color.lab(p.ground > 0.5 ? P.surface : P.bg) }),
      restMotion: p => p.light > 0 && p.speed > 0,
    });
  },
};
