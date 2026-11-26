// gradient-mesh: a gradient mesh. Twelve colour points (a 4 x 3 grid, jittered and turned) in six
// tones of the page palette blend with Gaussian weights in OKLab into separate colour islands; a slow
// warp folds the plane and the fold is lit, so the folds read. With `lines` set, the warped grid that
// shapes it is drawn over it in thin lines with small points at the joins, like a mesh in a design
// tool, bunching where the surface folds. By default there is no grid.
import { shader, color } from '../fx.js';

const packedColour = {default:0,min:0,max:16777215,step:1};
const params = {
  show:{default:0,min:0,max:1,step:1}, phase:{default:0,min:0,max:1,step:.01},
  field: {default:0,min:0,max:1,step:1},
  zone: {default:1,min:0,max:3,step:1},
  sweep:{default:0,min:0,max:1,step:1},
  base: packedColour, bright: packedColour, middle: packedColour, edge: packedColour,
  x:{default:.75,min:-.25,max:1.25}, y:{default:.7,min:-.25,max:1.25},
  w:{default:1,min:.01,max:4}, h:{default:1,min:.01,max:4},
  speed:    { default: 0.06, min: 0,   max: 0.4, step: 0.01 }, // drift; 0.06 gives a 48-second loop
  lines:    { default: 0,    min: 0,   max: 16,  step: 1 },    // grid lines across the height; 0 (the default) for none, 6 to 10 for a design-tool mesh
  warp:     { default: 0.35, min: 0,   max: 1,   step: 0.01 }, // how deeply the plane folds
  relief:   { default: 0.22,  min: 0,   max: 1,   step: 0.01 }, // light and shade on the folds
  softness: { default: 0.78, min: 0,   max: 1,   step: 0.01 }, // 0 distinct islands .. 1 long blends
  joins:    { default: 1,    min: 0,   max: 1,   step: 1 },    // small points where the grid lines meet
  angle:    { default: -12,  min: -90, max: 90,  step: 1 },    // turns the mesh, degrees
  tint:     { default: 0.6,  min: 0,   max: 1,   step: 0.01 }, // how strong the accent islands are
  calm:     { default: 0.4,  min: 0,   max: 1,   step: 0.01 }, // quieter area of the ground where text sits
  calmX:    { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:    { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

const N = 12;
const ADD = Array.from({ length: N }, (_, i) => `  MESH_ADD(u_q${i}, u_k${i}, ${i}.0)`).join('\n');

const frag = /* glsl */ `
// the warp in two octaves; its slopes are taken from the broad octave only (half the cost)
vec2 warpLo(vec2 q, float t) {
  return vec2(fx_noise(q * 0.85 + vec2(0.0, t * 0.13)), fx_noise(q * 0.85 + vec2(5.2, 1.3) - vec2(t * 0.11, 0.0)));
}
vec2 warpHi(vec2 q, float t) {
  return 0.45 * vec2(fx_noise(q * 1.9 + vec2(3.7, -t * 0.17)), fx_noise(q * 1.9 + vec2(-2.1 + t * 0.15, 6.4)));
}
#define MESH_ADD(Q, K, I) { vec2 c_ = Q.xy + Q.w * vec2(sin(t * (0.83 + 0.07 * I) + Q.z), sin(t * (0.61 + 0.09 * I) + Q.z * 1.7 + 1.3)); vec2 e_ = pw - c_; float w_ = exp(-dot(e_, e_) * is2); acc += w_ * K; ws += w_; }

void main() {
  vec2 uv = fx_uv();
  vec2 p = fx_p();
  float t = sin(u_time * 6.2831853 / 48.0 * (u_speed / 0.06)) + u_seed * 0.0731;
  vec2 so = vec2(u_seed * 0.0131, u_seed * 0.0217);
  float px = 1.0 / u_res.y;                      // one canvas pixel in height units

  // the fold: a slow warp of the plane, and its slopes (for the light and for even line widths)
  float e = 0.02;
  float k = u_warp * 0.42;
  vec2 wl = warpLo(p + so, t);
  vec2 w = wl + warpHi(p + so, t);
  vec2 wx = (warpLo(p + so + vec2(e, 0.0), t) - wl) / e;
  vec2 wy = (warpLo(p + so + vec2(0.0, e), t) - wl) / e;
  vec2 pw = p + w * k;

  // Gaussian weights: smooth islands, no plateaus or seams
  float sg = u_sigma * (0.6 + 0.8 * u_softness);
  float is2 = 1.0 / (2.0 * sg * sg);
  vec3 acc = vec3(0.0);
  float ws = 1e-6;
${ADD}
  vec3 col = acc / ws;

  // light on the folds: the warp's slope along a light direction
  float slope = dot(wx * 0.6 + wy * 0.8, vec2(-0.8, 0.6));
  float rl = clamp(slope * u_relief * 1.4, -1.0, 1.0);
  col = mix(col, u_hi, max(rl, 0.0) * 0.4);
  col = mix(col, u_lo, max(-rl, 0.0) * 0.3);

  // the calm area for text: toward the ground colour, keeping a trace of the mesh
  // (wide, since text runs sideways)
  vec2 cd = (uv - vec2(u_calmX, u_calmY)) * vec2(u_res.x / u_res.y * 0.55, 1.0);
  float cr = 0.24 + 0.36 * u_calm;
  float m = (1.0 - smoothstep(cr * 0.4, cr, length(cd))) * min(1.0, u_calm * 2.2);
  col = mix(col, u_ground, m * 0.9);

  // the mesh: lines of the warped, turned grid, a constant width in pixels wherever the grid stretches
  if (u_lines > 0.5) {
    vec2 g = vec2(dot(pw, u_rot), dot(pw, vec2(-u_rot.y, u_rot.x))) * u_lines + so * 3.0;
    // gradients of the two grid coordinates (per height unit)
    mat2 J = mat2(1.0 + k * wx.x, k * wx.y, k * wy.x, 1.0 + k * wy.y);   // columns: d(pw)/dx, d(pw)/dy
    vec2 gu = vec2(dot(J[0], u_rot), dot(J[1], u_rot)) * u_lines;
    vec2 gv = vec2(dot(J[0], vec2(-u_rot.y, u_rot.x)), dot(J[1], vec2(-u_rot.y, u_rot.x))) * u_lines;
    vec2 f = abs(fract(g + 0.5) - 0.5);
    vec2 dpx = f / vec2(length(gu), length(gv)) / px;               // distance to the nearest line, px
    float lw = 0.55 * u_dpr;
    float line = max(1.0 - smoothstep(lw - 0.5, lw + 0.7, dpx.x), 1.0 - smoothstep(lw - 0.5, lw + 0.7, dpx.y));
    float rj = 1.9 * u_dpr;
    float join = u_joins * (1.0 - smoothstep(rj - 0.7, rj + 0.7, length(dpx)));
    float show = 1.0 - m;
    col = mix(col, u_line, line * u_lineA * show);
    col = mix(col, u_line, join * min(1.0, u_lineA * 3.2) * show);
  }
  fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
}
`;

const L = c => color.lab(c)[0];
const at = (c, l) => color.withLightness(c, Math.min(0.98, Math.max(0.04, l)));
const sat = (c, k) => color.saturate(c, k);

// the tones of the mesh: [ground, highlight, accent, accent light, deep, middle], the fold light and
// shade, and the line colour. Every one a mix, tint or shade of the page colours; an accent far in hue
// from a coloured ground is kept out of the blends (they would pass through grey).
function tones(P, prm, kind) {
  const { bg, surface, ink, muted, accent } = P;
  const tn = prm.tint;
  const Lb = L(bg);
  const neutral = color.chroma(bg) < 0.035;
  const far = !neutral && color.chroma(accent) > 0.035 && color.hueDistance(bg, accent) > 55;
  if (kind === 'dark') {
    const acc = far ? at(sat(bg, 1.8), 0.6) : accent;
    const La = Math.max(0.55, L(acc));
    const k = [
      color.mix(bg, surface, 0.4),                                   // ground
      sat(color.mix(acc, ink, 0.55), 0.8),                           // ice, the highlight
      sat(at(acc, La - 0.04 * (1 - tn)), 1.05),                      // accent
      sat(at(color.mix(acc, muted, 0.3), Lb + 0.3), 0.9),            // slate accent
      sat(at(acc, Lb + 0.07), 1.2),                                  // deep accent
      sat(at(color.mix(bg, acc, 0.5), Lb + 0.18), 1.0),              // middle
    ];
    return { k, hi: color.mix(acc, ink, 0.75), lo: at(bg, Math.max(0.02, Lb - 0.03)), ground: k[0], line: color.mix(ink, acc, 0.25), lineA: 0.2 };
  }
  if (kind === 'colour') {
    const light = L(ink) > Lb ? ink : sat(color.lighten(bg, Math.min(0.2, 0.98 - Lb)), 0.5);
    const acc = far ? color.mix(bg, light, 0.3) : accent;
    const k = [
      bg,                                                            // ground
      color.mix(bg, light, 0.72),                                    // pale highlight
      sat(color.mix(bg, acc, 0.45 + 0.35 * tn), 1.05),               // accent or a light step
      sat(color.lighten(bg, 0.07), 1.1),                             // bright ground
      sat(color.lighten(bg, -0.16), 1.0),                            // deep
      color.mix(bg, light, 0.35),                                    // middle
    ];
    return { k, hi: color.mix(bg, light, 0.85), lo: color.lighten(bg, -0.22), ground: bg, line: light, lineA: 0.24 };
  }
  const acc = far ? at(sat(bg, 1.4), Lb - 0.25) : accent;
  const La = Math.min(Lb - 0.25, Math.max(0.42, L(acc)));
  const k = [
    sat(color.lighten(bg, 0.02), 1.05),                              // ground
    sat(at(bg, Math.min(0.985, Lb + 0.085)), 0.6),                   // highlight, near white
    sat(at(acc, La + 0.05 * (1 - tn)), 1.05),                        // accent
    sat(color.mix(bg, acc, 0.42), 1.25),                             // accent light
    sat(at(acc, La - 0.12), 1.0),                                    // deep accent (a shade, not ink: no mud)
    sat(color.lighten(bg, -0.075), 1.7),                             // a deeper step of the ground
  ];
  return { k, hi: at(bg, Math.min(0.99, Lb + 0.1)), lo: sat(at(acc, La - 0.16), 0.9), ground: k[0], line: color.mix(ink, acc, 0.3), lineA: 0.16 };
}

// the tone of each grid point: the ground near the calm area, then the others dealt so that no two
// neighbours share a tone
const TONE_BY_DISTANCE = [0, 0, 0, 0, 0, 4, 4, 5, 5, 3, 2, 1];
function uniforms({ palette, params, rng, kind, width, height }) {
  const r = rng;
  const T = tones(palette, params, kind);
  const asp = width && height ? width / height : 4 / 3;
  const a = (params.angle * Math.PI) / 180;
  const C = 4, R = 3, sx = (asp * 1.2) / C, sy = 1.2 / R;
  const pts = [];
  for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
    let x = ((i + 0.5) / C - 0.5) * asp * 1.2 + (r() - 0.5) * sx * 0.5;
    let y = ((j + 0.5) / R - 0.5) * 1.2 + (r() - 0.5) * sy * 0.5;
    [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    pts.push([x, y]);
  }
  const calm = [(params.calmX - 0.5) * asp, 0.5 - params.calmY];
  const dist = s => Math.hypot(s[0] - calm[0], s[1] - calm[1]);
  // Neighbouring points share a tone. The far side holds the only accent and highlight.
  const ordered = pts.map((point, index) => ({index, distance:dist(point)}))
    .sort((a,b) => a.distance-b.distance);
  const tone = [];
  ordered.forEach(({index}, rank) => { tone[index] = TONE_BY_DISTANCE[rank]; });
  // the grid is turned a little off the mesh angle, so its lines never run square to the frame
  const ga = a * 0.5 + (r() - 0.5) * 0.3;
  const u = {
    u_sigma: Math.min(sx, sy) * 0.53,
    u_rot: [Math.cos(ga), Math.sin(ga)],
    u_hi: color.labVec(T.hi), u_lo: color.labVec(T.lo), u_ground: color.labVec(T.ground),
    u_line: color.labVec(T.line), u_lineA: T.lineA,
  };
  pts.forEach((s, n) => {
    u['u_q' + n] = [s[0], s[1], r() * 6.283, 0.05 + 0.05 * r()];
    u['u_k' + n] = color.labVec(T.k[tone[n]]);
  });
  return u;
}

export default {
  id: 'gradient-mesh',
  name: 'Gradient mesh',
  family: 'mesh',
  params,
  mount(el, { palette, params: given, seed }) {
    if(given?.show){
      const frag=`void main(){
        vec2 uv=fx_uv();
        float aspect=u_res.x/u_res.y;
        uv.x*=min(1.,aspect/(320./168.));
        uv.y=(uv.y-.5)*min(1.,(320./168.)/aspect)+.5;
        float drift=.10*sin(u_time*6.2831853/48.);
        float u=uv.x+.16*sin(uv.y*5.+uv.x*3.+u_phase+drift);
float v=uv.y+.18*sin(uv.x*5.-uv.y*2.+drift);
vec2 p=vec2(u,v);
float w0=exp(-17.*dot(p-vec2(.48,-.12),p-vec2(.48,-.12)));
float w1=exp(-17.*dot(p-vec2(.91,.05),p-vec2(.91,.05)));
float w2=exp(-17.*dot(p-vec2(.71,.43),p-vec2(.71,.43)));
float w3=exp(-17.*dot(p-vec2(1.16,.55),p-vec2(1.16,.55)));
float w4=exp(-17.*dot(p-vec2(.81,.96),p-vec2(.81,.96)));
float mesh=(w0*.32+w1+w2*.03+w3*.6+w4*.9)/(w0+w1+w2+w3+w4);
float relief=.32*sin(8.*u-5.*v+2.8*sin(3.*v))+.21*sin(8.*v+3.*u);
float value=clamp(.52*mesh+.22+.68*relief,0.,1.)*4.;
vec3 tint=mix(u_base,u_first,clamp(value,0.,1.));
tint=mix(tint,u_second,clamp(value-1.,0.,1.));
tint=mix(tint,u_third,clamp(value-2.,0.,1.));
tint=mix(tint,u_last,clamp(value-3.,0.,1.));
        vec3 rgb=mix(fx_rgb(u_base),fx_rgb(tint),.065+.935*smoothstep(.38,.67,uv.x));
        fxColor=vec4(fx_dither(rgb),1.);
      }`;
      return shader(el,{frag,palette,seed,maxDpr:1.25,still:0,
        uniforms:({palette})=>({u_phase:given.phase??0,u_base:color.labVec(palette.bg),u_first:color.labVec(palette.accent),
          u_second:color.labVec(palette.surface),u_third:color.labVec(palette.muted),u_last:color.labVec(palette.accentInk)}),
        fallback:({palette})=>`linear-gradient(110deg,${palette.bg} 38%,${palette.accent},${palette.surface},${palette.muted},${palette.accentInk})`
      });
    }
    if (given?.field) {
      const {x,y,w,h,zone,sweep}=given;
      const [base,bright,edge,middle]=[given.base,given.bright,given.edge,given.middle].map(n=>'#'+n.toString(16).padStart(6,'0'));
      const veil = zone===0?'':zone===3?`linear-gradient(90deg, ${base}00, ${base} 25% 75%, ${base}00), `:`linear-gradient(${zone===2?180:90}deg, ${base} 38%, ${base}00 78%), `;
      const angular=sweep?`conic-gradient(at 108% 110%, ${bright}00 252deg, ${bright}1f 288deg, ${bright}00 324deg), `:'';
      const field = `void main() {
        vec2 uv = fx_uv();
        float phase = u_time * 6.2831853 / 48.0;
        vec2 drift = vec2(sin(phase), 1.0 - cos(phase)) * 0.025;
        float r = length((uv - u_focus - drift) / u_radius);
        vec3 col = mix(u_bright, u_mid, clamp(r / 0.4, 0.0, 1.0));
        col = mix(col, u_base, clamp((r - 0.4) / 0.46, 0.0, 1.0));
        col = mix(col, u_edge, clamp((r - 0.86) / 0.14, 0.0, 1.0));
        if (u_sweep > 0.5) {
          vec2 delta=(uv-vec2(1.08,1.10))*u_res;
          float degreesAround=mod(degrees(atan(delta.x,-delta.y))+360.0,360.0);
          float intensity=max(0.0,1.0-abs(degreesAround-288.0)/36.0)*0.12;
          col=mix(col,u_bright,intensity);
        }
        float axis = u_zone == 2.0 ? uv.y : uv.x;
        float veil = u_zone == 3.0 ? min(clamp(axis * 4.0,0.0,1.0),clamp((1.0-axis)*4.0,0.0,1.0)) : clamp((0.78-axis)/0.4,0.0,1.0);
        col = mix(col, u_base, u_zone == 0.0 ? 0.0 : veil);
        fxColor = vec4(fx_dither(fx_rgb(col)), 1.0);
      }`;
      return shader(el, {frag:field, palette, seed, maxDpr:1.25, still:0,
        uniforms:()=>({u_focus:[x,y],u_radius:[w,h],u_bright:color.labVec(bright),u_mid:color.labVec(middle),u_base:color.labVec(base),u_edge:color.labVec(edge),u_zone:zone,u_sweep:sweep}),
        fallback:()=>`${veil}${angular}radial-gradient(${w*100}% ${h*100}% at ${x*100}% ${y*100}%, ${bright}, ${middle} 40%, ${base} 86%, ${edge})`
      });
    }
    return shader(el, {
      frag,
      schema: params,
      params: given,
      palette,
      seed,
      uniforms,
      maxDpr: 1.25,
      still: 6,
      fallback: ({ palette: P, params: prm, kind }) => {
        const T = tones(P, prm, kind);
        const k = T.k;
        const cx = Math.round(prm.calmX * 100), cy = Math.round(prm.calmY * 100);
        const ln = color.mix(k[0], T.line, T.lineA);
        const cell = prm.lines > 0 ? Math.round(400 / prm.lines) : 0;
        const grid = cell ? `repeating-linear-gradient(0deg, ${ln} 0 1px, transparent 1px ${cell}px), repeating-linear-gradient(90deg, ${ln} 0 1px, transparent 1px ${cell}px), ` : '';
        // a still patchwork of the mesh tones under a straight grid, the ground where the calm area is
        return `${grid}radial-gradient(38% 50% at ${cx}% ${cy}%, ${k[0]}, transparent 75%), radial-gradient(40% 55% at ${100 - cx}% ${100 - cy}%, ${k[2]}, transparent 72%), radial-gradient(36% 48% at ${(cx + 50) % 100}% ${cy}%, ${k[1]}, transparent 72%), radial-gradient(42% 50% at ${100 - cx}% ${cy}%, ${k[4]}, transparent 72%), radial-gradient(40% 52% at ${cx}% ${100 - cy}%, ${k[3]}, transparent 72%), ${k[5]}`;
      },
    });
  },
};
