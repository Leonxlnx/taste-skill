// assets/scenes/dither-field-opener/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / dither-field-opener.js — a huge numeral turns slowly inside a field of one-bit dots.
//
// The opening screen of a page with no photograph. One mark (an issue number, a year, an initial, set in
// the page's display face) turns slowly inside a drifting noise field, and the whole field, mark and all,
// is printed as a strict one-bit dither of square dots: every dot is the ground, the ink or the accent,
// nothing in between, so it reads as live print rather than a picture. Scroll speed is the disturbance: a
// fast scroll sends horizontal bands of accent dots across the mark (each band slips its row sideways by
// whole dots as its head passes), and they settle back to ink within about half a second of the page
// coming to rest. Phones get the whole effect, since a flick is a scroll. A pointer trail of accent dots is
// an optional desktop extra (`trail`). The headline, its sentence and the action sit on a clear run of
// ground: the dots are masked out around them and dissolve back in over `feather` px, so no word is ever
// set on dots, and no band or trail ever reaches them. Calm: one mark, one field, one accent.
// A load-triggered opener, not a pinned scrub: hold 0 (the section is one screen tall and scrolls away).
// crosses words: none (the copy is masked clear of the field, the bands and the trail at every moment).
//
// Crispness. The field is drawn one canvas pixel per dot (WebGL, a canvas of cols x rows) and scaled up by
// a whole number of device pixels with image-rendering: pixelated: the dot is rounded to whole device
// pixels (4px at devicePixelRatio 1.25 is 5 device px, at 2 it is 8), so the grid sits on the device
// pixel grid, is as sharp at DPR 2 or 3 as at 1, and never drifts by a fraction of a pixel. Only the
// noise drifts through the grid; the grid itself never moves except with the page, and a band's slip is
// always a whole number of dots. Nothing smooth is ever shown: the soft field under the dots exists only
// as the threshold they are cut from (8x8 Bayer), so no gradient ever reaches the screen.
//
// Needs gsap + ScrollTrigger (for the stage), stage.js and dither-field-opener.css. No SplitText, no
// libraries for the field: plain WebGL 1.
//
// DOM (the CSS draws the finished composition from the same markup; the script adds the canvas):
//   <section class="scene" data-scene="dither-field-opener" aria-label="Haar, issue nine"
//            data-options='{"mark": "9", "dot": 4, "speed": 1, "nav": ".bar"}'>
//     <div class="scene-stage">
//       <div class="df-mark" aria-hidden="true">9</div>            the mark: 1-4 characters (a numeral,
//                                                                   a year, an initial). Its box is where
//                                                                   the mark is drawn (fitted inside it, and
//                                                                   never wider than 66-75% of the stage's
//                                                                   narrower axis, by its length, so it is
//                                                                   whole at every width); without the
//                                                                   script it is set as type
//       <div class="df-copy">
//         <h1 class="df-title">Nine stories from the sea fog</h1>   two lines at most (h2 mid-page)
//         <p class="df-text">One sentence of 14-30 words.</p>
//         <a class="df-action" href="#order">Order issue nine</a>   the one action (optional)
//       </div>
//     </div>
//   </section>
//   A mark of more than one character sets style="--df-chars: 2" (or 4) on .df-mark, so the type of the
//   finished composition fits its box without the script. The header bar of the page goes over the stage
//   (position absolute or fixed); give its selector as `nav` so its words are kept clear of the dots too.
//
// Tokens (on :root or the section): --ground (the ground, and the dots' ground), --ink (the dots and the
// copy), --accent (the disturbance, the trail and the action's fill), --on-accent (the action's label,
// --ink by default), --font-display (the mark and the headline), --font-text, --display-weight (the mark
// and the headline; 600 when the page sets none), --mark-weight (the mark alone, if it should differ),
// --df-top (the room the header bar takes over the stage, 88px; 72px on a phone), --df-gutter.
// One ground, one ink, one accent: the scene draws nothing in any other colour.
//
// Options (data-options JSON). Default, then range:
//   mark          ''       the mark's text; empty takes the text of .df-mark
//   dot           4        CSS px per dot (3-6), rounded to whole device pixels
//   phoneDot      4        the same under 768px (3-6)
//   speed         1        the field's drift (0-3; 0 holds the field still, the mark still turns)
//   turn          24       degrees the mark swings either way about its upright (0-40)
//   phoneTurn     16       the same under 768px (0-30)
//   period        20       seconds for one full swing (8-60)
//   field         0.4      the field's densest share of dots (0.1-0.6); the mark is drawn at `ink`
//   ink           0.86     share of dots in the mark (0.6-1; 1 prints it solid)
//   grain         1        size of the field's clouds (0.5-2; larger is broader)
//   sensitivity   1800     px/s of scroll for the full disturbance (600-8000); it starts at 25% of this
//   phoneSensitivity 3000  the same under 768px (touch flicks run faster than a wheel)
//   clear         '.df-copy'   selector of the boxes kept clear of dots (each matching element's box; a
//                          box within the feather of a side of the stage runs out to that side)
//   nav           ''       selector of a header bar over the stage, kept clear too
//   pad           28       px of clear ground around each clear box (0-96)
//   feather       64       px over which the dots dissolve back in past the pad (0-200; the width wanders
//                          between about half and one and a half of this, so the edge is ragged)
//   foot          0.16     share of the stage height over which the field dissolves at its foot (0-0.5),
//                          so the opener melts into the section after (the mark is never faded)
//   trail         false    true: a short accent trail follows a fine pointer (desktop only)
//   still         -16      the mark's turn, in degrees, in the still frame (reduced motion, phone 'rest',
//                          no GSAP)
//   intro         1.1      seconds the dots take to print in on load (0-3; 0 shows them at once)
//   seed          7        the field's shapes (any whole number)
//   phone         'same'   'same' runs the phone plan below; 'rest' shows the still frame on phones
//
// Timeline. No scrub: the clock and the scroll speed drive it. 0-1.1s the dots print in (density rises
// through the Bayer order, so the light parts of the field appear first and the mark last). Then the mark
// swings +-turn degrees about its upright on a sine of `period` seconds, with a 2.5 degree roll on a
// longer one, in perspective (the near side grows about 5%), its face a little denser on the side turned
// away; the field drifts and folds slowly through the grid, thinning away from the mark. Scroll speed
// over 25% of `sensitivity` starts bands, the first at once, then up to 14 a second at full speed: 2-9
// dots tall, three in four across the mark's rows, each sent across the screen in 0.2-0.4 s with the
// scroll's direction (down: left to right). Behind its head the row's ink dots turn accent, a sparse run
// of accent dots crosses the bare ground, and the row slips 1-12 whole dots sideways. While the page keeps
// moving a band fades over about a second; once it is still, every band settles back to ink through the
// Bayer order within about 0.7 s.
// Phone (under 768px): the mark sits above the copy in one column (CSS), phoneDot dots, a smaller turn,
// the field drawn at 30 frames a second, the bands tuned to touch flicks; no pointer trail.
//
// Finished composition (reduced motion, phone 'rest', GSAP missing): the same layout with one still
// dithered frame (the mark turned `still` degrees, no bands). Without WebGL (or with no script at all)
// the mark is set as plain type in the ink in its box, beside the copy: a clean typographic opener. With
// the script but before its first frame, the type waits hidden for up to 2.5 s so it never flashes in
// and out (the CSS shows it after that whatever happens).
(() => {
  const ID = 'dither-field-opener';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && isFinite(n) ? clamp(n, a, b) : d; };
  const str = (v, d) => (typeof v === 'string' && v.trim() ? v.trim() : d);
  const MAX_CLEAR = 8, MAX_TRAIL = 12, DEG = Math.PI / 180;

  const settings = (o = {}) => ({
    mark: str(o.mark, ''),
    dot: num(o.dot, 4, 3, 6),
    phoneDot: num(o.phoneDot, 4, 3, 6),
    speed: num(o.speed, 1, 0, 3),
    turn: num(o.turn, 24, 0, 40),
    phoneTurn: num(o.phoneTurn, 16, 0, 30),
    period: num(o.period, 20, 8, 60),
    field: num(o.field, 0.4, 0.1, 0.6),
    ink: num(o.ink, 0.86, 0.6, 1),
    grain: num(o.grain, 1, 0.5, 2),
    sensitivity: num(o.sensitivity, 1800, 600, 8000),
    phoneSensitivity: num(o.phoneSensitivity, 3000, 600, 10000),
    clear: str(o.clear, '.df-copy'),
    nav: str(o.nav, ''),
    pad: num(o.pad, 28, 0, 96),
    feather: num(o.feather, 64, 0, 200),
    foot: num(o.foot, 0.16, 0, 0.5),
    trail: o.trail === true,
    still: num(o.still, -16, -40, 40),
    intro: num(o.intro, 1.1, 0, 3),
    seed: num(o.seed, 7, 0, 1e6) | 0,
    phone: o.phone === 'rest' ? 'rest' : 'same',
  });

  // ---------- the field, in one fragment shader: one fragment per dot ----------

  const VERT = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';
  const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uGrid;            // dots across, dots down
uniform float uCell;           // CSS px per dot
uniform vec2 uStage;           // the stage, CSS px
uniform float uTime;           // the field's clock (seconds x speed)
uniform vec2 uSeed;
uniform float uScale;          // CSS px per unit of noise
uniform float uField;          // the field's densest share of dots
uniform float uInk;            // the mark's share of dots
uniform float uIntro;          // 0-1, the print-in
uniform vec2 uMarkC;           // the mark's centre, CSS px
uniform vec2 uMarkH;           // half the size of the glyph's box, CSS px
uniform vec3 uEx;              // the mark's plane: its axes and normal
uniform vec3 uEy;
uniform vec3 uN;
uniform float uD;              // the eye's distance, CSS px
uniform float uLit;            // sin(turn): which side of the face is turned away
uniform sampler2D uGlyph;
uniform sampler2D uBands;      // one row per dot row: amount, slip, direction | head (16 bit)
uniform float uBandsOn;
uniform vec4 uClear[${MAX_CLEAR}];     // x0, y0, x1, y1 (CSS px, padded)
uniform float uClearN;
uniform float uFeather;
uniform float uFoot;
uniform vec4 uTrail[${MAX_TRAIL}];     // x, y, radius (CSS px), strength
uniform float uTrailN;
uniform vec3 uGround;
uniform vec3 uInkC;
uniform vec3 uAccent;

float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = m * p; a *= 0.5; }
  return s / 0.9375;
}
// ordered dither thresholds, 64 levels
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

float field(vec2 q) {
  vec2 s = q / uScale + uSeed;
  float t = uTime;
  vec2 w = vec2(fbm(s * 0.8 + vec2(0.0, t * 0.035)), fbm(s * 0.8 + vec2(5.2, 1.3) - vec2(t * 0.03, 0.0)));
  float f = fbm(s + 1.7 * w + vec2(t * 0.045, -t * 0.012));
  return uField * smoothstep(0.42, 0.8, f);
}

// the mark: the view ray through this dot meets the turned plane; read the glyph there
float glyph(vec2 q, out float u) {
  vec3 dir = vec3(q - uMarkC, uD);
  float dn = dot(uN, dir);
  u = 0.5;
  if (dn <= 0.0) return 0.0;
  vec3 h = vec3(0.0, 0.0, -uD) + (uN.z * uD / dn) * dir;
  vec2 uv = vec2(dot(h, uEx), dot(h, uEy)) / (2.0 * uMarkH) + 0.5;
  u = uv.x;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  return texture2D(uGlyph, uv).a;
}

void main() {
  vec2 c = vec2(gl_FragCoord.x - 0.5, uGrid.y - gl_FragCoord.y - 0.5);   // this dot, top-left origin
  vec2 p = (c + 0.5) * uCell;

  // a band in this row: its head runs across the screen; behind it the row is accent and slips sideways
  // by whole dots, until the band settles back to ink
  float a = 0.0, slip = 0.0;
  if (uBandsOn > 0.5) {
    float row = (c.y + 0.5) / uGrid.y;
    vec4 b0 = texture2D(uBands, vec2(0.25, row));
    vec4 b1 = texture2D(uBands, vec2(0.75, row));
    if (b0.r > 0.0) {
      float dir = b0.b > 0.5 ? 1.0 : -1.0;
      float head = (b1.r * 65280.0 + b1.g * 255.0) / 16.0 - 512.0;
      float behind = dir * (head - (c.x + 0.5));
      if (behind >= 0.0) {
        a = b0.r;
        slip = floor(b0.g * 255.0 + 0.5) - 128.0;
      }
    }
  }
  vec2 q = p - vec2(slip * uCell, 0.0);

  // clear ground: the copy and the bar, padded; the field dissolves back in over the feather, the mark
  // only keeps out of the padded box (the layout keeps it clear of that; a feathered mark reads as cut)
  // (the dissolve's width wanders between about half and one and a half feathers, so its edge is ragged
  // like the field, never a ruled line; the padded box itself stays clear)
  float keep = 1.0, hard = 1.0;
  float rag = uFeather * (0.45 + 1.1 * fbm(p / 72.0 + uSeed * 2.0));
  for (int i = 0; i < ${MAX_CLEAR}; i++) {
    if (float(i) >= uClearN) break;
    vec4 R = uClear[i];
    vec2 dd = max(R.xy - p, p - R.zw);
    float sd = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0);
    keep = min(keep, smoothstep(0.0, rag, sd));
    hard = min(hard, step(0.0, sd));
  }

  float u;
  float m = glyph(q, u);
  float face = uInk - 0.1 * uLit * (u - 0.5) * 2.0 + 0.08 * (fbm(q / 64.0 + uSeed + uTime * 0.05) - 0.5);
  // the field gathers about the mark, thins away from it and dissolves at the stage's foot
  vec2 e = (q - uMarkC) / (uMarkH * vec2(2.2, 1.25));
  float fd = field(q) * mix(0.3, 1.0, 1.0 - smoothstep(0.7, 1.6, length(e)));
  fd *= keep * (1.0 - smoothstep(uStage.y - uFoot, uStage.y, p.y));
  float d = mix(fd, clamp(face, 0.5, 0.98) * hard, m) * uIntro;

  // the trail
  float tr = 0.0;
  for (int i = 0; i < ${MAX_TRAIL}; i++) {
    if (float(i) >= uTrailN) break;
    vec4 T = uTrail[i];
    tr = max(tr, T.w * (1.0 - smoothstep(0.25, 1.0, length(p - T.xy) / T.z)));
  }
  a *= keep;
  tr *= keep;

  float B = bayer8(c) + 0.0078;
  vec3 col = uGround;
  if (d > B) {
    col = uInkC;
    if (a > bayer8(c + vec2(3.0, 5.0)) + 0.0078 || tr > B) col = uAccent;
  } else if (a * 0.28 > B || tr * 0.5 > B) {
    col = uAccent;
  }
  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { const log = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error(log || 'shader'); }
    return s;
  }

  function initGL(r) {
    const attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' };
    let gl = null;
    try { gl = r.canvas.getContext('webgl', attrs) || r.canvas.getContext('experimental-webgl', attrs); } catch { gl = null; }
    if (!gl) return null;
    try {
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.bindAttribLocation(prog, 0, 'a');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const U = {};
      for (const n of ['uGrid', 'uCell', 'uStage', 'uTime', 'uSeed', 'uScale', 'uField', 'uInk', 'uIntro', 'uMarkC', 'uMarkH', 'uEx', 'uEy', 'uN', 'uD', 'uLit', 'uGlyph', 'uBands', 'uBandsOn', 'uClear', 'uClearN', 'uFeather', 'uFoot', 'uTrail', 'uTrailN', 'uGround', 'uInkC', 'uAccent']) U[n] = gl.getUniformLocation(prog, n);
      const tex = (unit) => {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, unit ? gl.NEAREST : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, unit ? gl.NEAREST : gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
        return t;
      };
      const tGlyph = tex(0), tBands = tex(1);
      gl.uniform1i(U.uGlyph, 0);
      gl.uniform1i(U.uBands, 1);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      return { gl, prog, U, tGlyph, tBands, bandRows: 0 };
    } catch (err) {
      console.warn('[' + ID + '] WebGL could not draw the field, showing the type instead: ' + (err && err.message));
      return null;
    }
  }

  // ---------- reading the page ----------

  // a CSS colour (any syntax the browser knows) as sRGB 0-1, read back from a 1px canvas
  let probe = null;
  const rgbOf = (value, fallback) => {
    if (!probe) { const c = document.createElement('canvas'); c.width = c.height = 1; probe = c.getContext('2d', { willReadFrequently: true }); }
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = fallback;
    if (value && value.trim()) probe.fillStyle = value.trim();
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  function setup(root, o) {
    if (root.__df) return root.__df;
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const markEl = root.querySelector('.df-mark');
    if (!stage || !markEl) { console.warn('[' + ID + '] needs .scene-stage > .df-mark'); return null; }
    if (o.mark) markEl.textContent = o.mark;
    const text = markEl.textContent.trim() || '0';
    markEl.style.setProperty('--df-chars', String(Math.max(1, [...text].length)));
    const canvas = document.createElement('canvas');
    canvas.className = 'df-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.prepend(canvas);
    const r = {
      root, stage, markEl, canvas, text,
      token: 0, running: false, live: false, phone: false, visible: true,
      glyph: { key: '', w: 1, h: 1, iw: 1, ih: 1 },
      grid: { cols: 0, rows: 0, cell: 4, w: 0, h: 0, dpr: 0 },
      bands: null, trail: [], v: 0, lastY: 0, energy: 0, carry: 0, dirY: 1,
      clear: new Float32Array(MAX_CLEAR * 4), clearN: 0,
      trailData: new Float32Array(MAX_TRAIL * 4),
    };
    r.G = initGL(r);
    root.classList.toggle('df-flat', !r.G);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); r.G = null; root.classList.remove('df-drawn'); });
    canvas.addEventListener('webglcontextrestored', () => { r.G = initGL(r); r.glyph.key = ''; r.grid.cols = 0; root.classList.toggle('df-flat', !r.G); if (!r.running) r.redraw && r.redraw(); });
    root.__df = r;
    return r;
  }

  // The dot grid: whole device pixels per dot, one canvas pixel per dot, scaled up crisply.
  function layoutGrid(r, dot) {
    const dpr = window.devicePixelRatio || 1;
    const w = r.stage.clientWidth, h = r.stage.clientHeight;
    const dev = Math.max(2, Math.round(dot * dpr));
    const cell = dev / dpr;
    const cols = Math.max(1, Math.ceil(w / cell)), rows = Math.max(1, Math.ceil(h / cell));
    const g = r.grid;
    if (g.cols === cols && g.rows === rows && g.cell === cell && g.w === w && g.h === h && g.dpr === dpr) return false;
    Object.assign(g, { cols, rows, cell, w, h, dpr });
    r.canvas.width = cols;
    r.canvas.height = rows;
    r.canvas.style.width = cols * cell + 'px';
    r.canvas.style.height = rows * cell + 'px';
    if (r.G) {
      const { gl } = r.G;
      gl.viewport(0, 0, cols, rows);
      r.bands = { amt: new Float32Array(rows), slip: new Float32Array(rows), head: new Float32Array(rows), speed: new Float32Array(rows), dir: new Int8Array(rows), data: new Uint8Array(rows * 8), live: false };
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, r.G.tBands);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, r.bands.data);
      r.G.bandRows = rows;
    }
    return true;
  }

  // The glyph: the mark set in the display face, cropped to its ink, as a texture. Redrawn when the font
  // arrives or the face changes.
  function drawGlyph(r) {
    const cs = getComputedStyle(r.markEl);
    const fam = cs.fontFamily, weight = cs.fontWeight, style = cs.fontStyle, stretch = cs.fontStretch;
    const font = (s) => `${style} ${weight} ${s}px ${fam}`;
    const ready = !document.fonts || document.fonts.check(font(100), r.text);
    const key = [fam, weight, style, stretch, r.text, ready].join('|');
    if (key === r.glyph.key) return;
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    const S = 800;
    g.font = font(S);
    try { if ('fontStretch' in g && stretch && /%$/.test(stretch)) g.fontStretch = ({ '62.5%': 'ultra-condensed', '75%': 'extra-condensed', '87.5%': 'semi-condensed', '100%': 'normal', '112.5%': 'semi-expanded', '125%': 'expanded' })[stretch] || 'normal'; } catch {}
    if ('letterSpacing' in g && cs.letterSpacing && cs.letterSpacing !== 'normal') g.letterSpacing = (parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)) * S + 'px';
    const m = g.measureText(r.text);
    const L = Math.ceil(m.actualBoundingBoxLeft || 0), R = Math.ceil(m.actualBoundingBoxRight || m.width);
    const A = Math.ceil(m.actualBoundingBoxAscent || S * 0.72), D = Math.ceil(m.actualBoundingBoxDescent || 0);
    const pad = 8, iw = Math.max(1, L + R), ih = Math.max(1, A + D);
    c.width = iw + 2 * pad;
    c.height = ih + 2 * pad;
    g.font = font(S);
    if ('letterSpacing' in g && cs.letterSpacing && cs.letterSpacing !== 'normal') g.letterSpacing = (parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)) * S + 'px';
    g.fillStyle = '#fff';
    g.textBaseline = 'alphabetic';
    g.fillText(r.text, pad + L, pad + A);
    r.glyph = { key, w: c.width, h: c.height, iw, ih };
    if (r.G) {
      const { gl } = r.G;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, r.G.tGlyph);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    }
  }

  // Everything measured from the page: colours, the mark's box, the clear boxes. Cheap; read each frame
  // for the clear boxes (a fixed bar moves against the stage), on resize for the rest.
  function measure(r, o) {
    const cs = getComputedStyle(r.root);
    r.colours = {
      ground: rgbOf(cs.getPropertyValue('--df-ground'), '#e8e8e3'),
      ink: rgbOf(cs.getPropertyValue('--df-ink'), '#161513'),
      accent: rgbOf(cs.getPropertyValue('--df-accent'), '#ff4a1f'),
    };
    const s = r.canvas.getBoundingClientRect(), b = r.markEl.getBoundingClientRect();
    // The mark is sized from the stage's narrower axis and the length of the mark, then fitted to its box:
    // on a narrow or portrait screen the box runs the full width, and a word fitted to it ended a gutter
    // from the screen's edge, where its last letter (a little larger when turned toward the eye, the field
    // running on past it) read as sliced (r5-p27, 'stet' at 768 and 390). One character spans at most 66%
    // of the narrower axis, a word of four 75%, so the mark is whole on clear ground at 1440, 768 and 390.
    const chars = Math.min(4, Math.max(1, [...r.text].length));
    const side = Math.min(r.grid.w || s.width, r.grid.h || s.height);
    const wide = Math.min(b.width * 0.94, side * (0.63 + 0.03 * chars));
    const k = Math.min(wide / r.glyph.iw, (b.height * 0.94) / r.glyph.ih);
    r.mark = { cx: b.left - s.left + b.width / 2, cy: b.top - s.top + b.height / 2, hw: (r.glyph.w * k) / 2, hh: (r.glyph.h * k) / 2 };
    r.mark.D = 2.6 * Math.max(r.mark.hw, r.mark.hh) * 2;
    r.scale = Math.min(r.grid.w, r.grid.h) * 0.42 * o.grain;
  }
  function measureClear(r, o) {
    const s = r.canvas.getBoundingClientRect();
    let n = 0;
    const add = (el) => {
      if (n >= MAX_CLEAR || !el) return;
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) return;
      let x0 = b.left - s.left - o.pad, y0 = b.top - s.top - o.pad, x1 = b.right - s.left + o.pad, y1 = b.bottom - s.top + o.pad;
      if (x1 < 0 || y1 < 0 || x0 > s.width || y0 > s.height) return;
      // a clear box that comes within two feathers of a side of the stage runs out to it: no thin
      // column of stray dots between the copy and the edge
      const W = r.grid.w, H = r.grid.h, F = o.feather + 1;
      if (x0 < 2 * F) x0 = -F;
      if (y0 < 2 * F) y0 = -F;
      if (x1 > W - 2 * F) x1 = W + F;
      if (y1 > H - 2 * F) y1 = H + F;
      r.clear.set([x0, y0, x1, y1], n * 4);
      n++;
    };
    try { for (const el of r.root.querySelectorAll(o.clear)) add(el); } catch {}
    if (o.nav) { try { for (const el of document.querySelectorAll(o.nav)) add(el); } catch {} }
    r.clearN = n;
  }

  // ---------- one frame ----------

  function draw(r, o, f) {
    const G = r.G;
    if (!G) return false;
    const { gl, U } = G;
    const g = r.grid, mk = r.mark, col = r.colours;
    const yaw = f.yaw, roll = f.roll;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cr = Math.cos(roll), sr = Math.sin(roll);
    gl.useProgram(G.prog);
    gl.uniform2f(U.uGrid, g.cols, g.rows);
    gl.uniform1f(U.uCell, g.cell);
    gl.uniform2f(U.uStage, g.w, g.h);
    gl.uniform1f(U.uTime, f.time);
    gl.uniform2f(U.uSeed, (o.seed % 97) * 1.37 + 3.1, (o.seed % 89) * 0.71 + 1.9);
    gl.uniform1f(U.uScale, r.scale);
    gl.uniform1f(U.uField, o.field);
    gl.uniform1f(U.uInk, o.ink);
    gl.uniform1f(U.uIntro, f.intro);
    gl.uniform2f(U.uMarkC, mk.cx, mk.cy);
    gl.uniform2f(U.uMarkH, mk.hw, mk.hh);
    gl.uniform3f(U.uEx, cy * cr, cy * sr, -sy);
    gl.uniform3f(U.uEy, -sr, cr, 0);
    gl.uniform3f(U.uN, sy * cr, sy * sr, cy);
    gl.uniform1f(U.uD, mk.D);
    gl.uniform1f(U.uLit, sy);
    gl.uniform1f(U.uBandsOn, f.bands ? 1 : 0);
    gl.uniform4fv(U.uClear, r.clear);
    gl.uniform1f(U.uClearN, r.clearN);
    gl.uniform1f(U.uFeather, Math.max(1, o.feather));
    gl.uniform1f(U.uFoot, Math.max(1, o.foot * g.h));
    gl.uniform4fv(U.uTrail, r.trailData);
    gl.uniform1f(U.uTrailN, f.trailN || 0);
    gl.uniform3fv(U.uGround, col.ground);
    gl.uniform3fv(U.uInkC, col.ink);
    gl.uniform3fv(U.uAccent, col.accent);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, G.tGlyph);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, G.tBands);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!r.root.classList.contains('df-drawn')) r.root.classList.add('df-drawn');
    return true;
  }

  // ---------- the disturbance: bands from scroll speed ----------

  function spawn(r, E) {
    const B = r.bands, g = r.grid, mk = r.mark;
    if (!B) return;
    const h = 2 + Math.floor(Math.pow(Math.random(), 1.4) * 8);
    let y0;
    if (Math.random() < 0.75) {
      const top = Math.max(0, Math.floor((mk.cy - mk.hh) / g.cell)), bot = Math.min(g.rows - h, Math.ceil((mk.cy + mk.hh) / g.cell) - h);
      y0 = top + Math.floor(Math.random() * Math.max(1, bot - top));
    } else y0 = Math.floor(Math.random() * Math.max(1, g.rows - h));
    const dir = (Math.random() < 0.8 ? 1 : -1) * r.dirY;
    const amt = 0.6 + 0.4 * E;
    const speed = g.cols * (2.4 + Math.random() * 2);
    const head = dir > 0 ? -Math.random() * g.cols * 0.25 : g.cols * (1 + Math.random() * 0.25);
    const slip = dir * Math.round((1 + Math.random() * 11) * (0.4 + 0.6 * E));
    for (let y = Math.max(0, y0); y < Math.min(g.rows, y0 + h); y++) {
      if (B.amt[y] > amt * 0.8) continue;
      B.amt[y] = amt; B.dir[y] = dir; B.speed[y] = speed; B.head[y] = head + (Math.random() - 0.5) * 3; B.slip[y] = slip;
    }
  }

  function stepBands(r, dt, still) {
    const B = r.bands;
    if (!B) return false;
    const n = B.amt.length, d = B.data;
    // while the page is moving a band lingers; once it is still they all go back to ink fast
    const fade = Math.exp(-dt / (still ? 0.2 : 0.5)), slipFade = Math.exp(-dt / (still ? 0.12 : 0.35));
    let any = false;
    for (let y = 0; y < n; y++) {
      const i = y * 8;
      if (B.amt[y] > 0) {
        B.head[y] += B.dir[y] * B.speed[y] * dt;
        B.amt[y] *= fade;
        B.slip[y] *= slipFade;
        if (B.amt[y] < 0.04) { B.amt[y] = 0; B.slip[y] = 0; }
      }
      if (B.amt[y] > 0) {
        any = true;
        const head = clamp(Math.round((B.head[y] + 512) * 16), 0, 65535);
        d[i] = Math.round(B.amt[y] * 255); d[i + 1] = clamp(128 + Math.round(B.slip[y]), 0, 255); d[i + 2] = B.dir[y] > 0 ? 255 : 0; d[i + 3] = 255;
        d[i + 4] = head >> 8; d[i + 5] = head & 255; d[i + 6] = 0; d[i + 7] = 255;
      } else if (d[i]) { d[i] = 0; d[i + 1] = 128; }
    }
    if (any || B.live) {
      const { gl } = r.G;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, r.G.tBands);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2, n, gl.RGBA, gl.UNSIGNED_BYTE, d);
    }
    B.live = any;
    return any;
  }

  // ---------- live ----------

  function start(r, o, phone) {
    stop(r);
    const token = ++r.token;
    r.live = true;
    r.phone = phone;
    if (!r.G) { r.root.classList.add('df-flat'); return; }
    const dot = phone ? o.phoneDot : o.dot;
    const turn = (phone ? o.phoneTurn : o.turn) * DEG;
    const sens = phone ? o.phoneSensitivity : o.sensitivity;
    const frameMs = phone ? 31 : 0;
    const t0 = performance.now();
    const phase = r.phase ?? (r.phase = -0.12 * o.period);   // the first frame shows the mark already turned
    let last = t0, lastDraw = 0, dirty = true, clock = r.clock || 0;
    r.lastY = window.scrollY || 0;
    r.v = 0;
    const intro0 = r.introDone || o.intro === 0 ? 1 : 0;

    const ro = new ResizeObserver(() => { dirty = true; });
    ro.observe(r.stage);
    const io = new IntersectionObserver((es) => { for (const e of es) r.visible = e.isIntersecting; if (r.visible) wake(); }, { rootMargin: '64px 0px' });
    io.observe(r.root);
    const onVis = () => { if (!document.hidden) wake(); };
    document.addEventListener('visibilitychange', onVis);
    const onFont = () => { dirty = true; };
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', onFont);
    const fine = !phone && o.trail && window.matchMedia('(pointer: fine)').matches;
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const s = r.canvas.getBoundingClientRect();
      const x = e.clientX - s.left, y = e.clientY - s.top;
      const p = r.trail[0];
      if (p && Math.hypot(p.x - x, p.y - y) < 6) return;
      r.trail.unshift({ x, y, s: 1 });
      if (r.trail.length > MAX_TRAIL) r.trail.length = MAX_TRAIL;
      wake();
    };
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });

    const frame = (now) => {
      r.raf = 0;
      if (token !== r.token) return;
      if (!r.root.classList.contains('is-live')) { stop(r); settleSoon(r); return; }
      if (!r.visible || document.hidden) { r.clock = clock; return; }   // asleep until it comes back
      r.raf = requestAnimationFrame(frame);
      const dt = clamp((now - last) / 1000, 0, 0.1);
      last = now;
      // scroll speed, smoothed over about 50ms
      const y = window.scrollY || 0;
      const raw = dt > 0 ? (y - r.lastY) / dt : 0;
      if (y !== r.lastY) r.dirY = y > r.lastY ? 1 : -1;
      r.lastY = y;
      r.v += (raw - r.v) * (1 - Math.exp(-dt / 0.05));
      const E = clamp((Math.abs(r.v) - sens * 0.25) / (sens * 0.75), 0, 1);
      clock += dt * o.speed;
      if (frameMs && now - lastDraw < frameMs) return;   // the phone draws at 30 frames a second
      const step = lastDraw ? Math.min(0.1, (now - lastDraw) / 1000) : dt;
      lastDraw = now;
      if (!r.G) return;
      if (dirty) { dirty = false; layoutGrid(r, dot); drawGlyph(r); measure(r, o); }
      measureClear(r, o);
      // the first band goes the moment the page moves fast; then about 14 a second at full speed
      if (E > 0.01 && r.mark) { r.carry = (r.energy > 0.01 ? r.carry : 1) + E * 14 * step; while (r.carry >= 1) { spawn(r, E); r.carry -= 1; } } else r.carry = 0;
      r.energy = E;
      const bands = stepBands(r, step, E < 0.01);
      let trailN = 0;
      if (fine) {
        const k = Math.exp(-step / 0.28);
        r.trail = r.trail.filter((p) => (p.s *= k) > 0.04);
        r.trail.forEach((p, i) => { r.trailData.set([p.x, p.y, 44, p.s], i * 4); });
        trailN = r.trail.length;
      }
      const t = (now - t0) / 1000;
      const intro = intro0 === 1 ? 1 : clamp(t / o.intro, 0, 1);
      if (intro >= 1) r.introDone = true;
      const ease = 1 - Math.pow(1 - intro, 3);
      const w = (2 * Math.PI) / o.period;
      const T = clock + phase;
      draw(r, o, { time: clock, yaw: turn * Math.sin(w * T), roll: 2.5 * DEG * Math.sin((w / 1.618) * T + 1), intro: ease, bands, trailN });
    };
    const wake = () => { if (token === r.token && !r.raf && r.running) { last = performance.now(); r.lastY = window.scrollY || 0; r.raf = requestAnimationFrame(frame); } };
    r.running = true;
    r.stopLive = () => {
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (document.fonts && document.fonts.removeEventListener) document.fonts.removeEventListener('loadingdone', onFont);
      if (fine) window.removeEventListener('pointermove', onMove);
      r.clock = clock;
    };
    r.raf = requestAnimationFrame(frame);
  }

  function stop(r) {
    r.token++;
    r.running = false;
    if (r.raf) cancelAnimationFrame(r.raf);
    r.raf = 0;
    if (r.stopLive) { r.stopLive(); r.stopLive = null; }
    r.trail = [];
    r.trailN = 0;
    if (r.bands) { r.bands.amt.fill(0); r.bands.slip.fill(0); }
  }

  // ---------- the finished composition: one still frame ----------

  function still(r, o) {
    stop(r);
    r.live = false;
    if (!r.G) { r.root.classList.add('df-flat'); return; }
    const phone = window.matchMedia('(max-width: 767px)').matches;
    const paint = () => {
      if (r.running || !r.G) return;
      layoutGrid(r, phone ? o.phoneDot : o.dot);
      drawGlyph(r);
      measure(r, o);
      measureClear(r, o);
      draw(r, o, { time: 12, yaw: o.still * DEG, roll: 0, intro: 1, bands: false, trailN: 0 });
    };
    r.redraw = paint;
    paint();
    // fonts and sizes change the frame: paint again (once per change, never a loop)
    if (!r.restWatch) {
      r.restWatch = true;
      let raf = 0;
      const again = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!r.running && r.redraw) r.redraw(); }); };
      new ResizeObserver(again).observe(r.stage);
      if (document.fonts) { document.fonts.ready.then(again); if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', again); }
    }
  }

  const settleSoon = (r) => requestAnimationFrame(() => { if (!r.root.classList.contains('is-live') && !r.running && r.rest) r.rest(); });

  // ---------- the scene ----------

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    if (!window.Stage) return null;
    const o = settings(opts);
    const r = setup(root, o);
    if (!r) return null;
    r.rest = () => still(r, o);
    if (document.fonts && document.fonts.load) {
      // ask for the mark's face at once, so the first frame is set in it
      const cs = getComputedStyle(r.markEl);
      document.fonts.load(`${cs.fontStyle} ${cs.fontWeight} 100px ${cs.fontFamily}`, r.text).catch(() => {});
    }
    const mm = Stage.scene(root, {
      hold: 0,
      scrub: true,
      build: () => start(r, o, false),
      phone: o.phone === 'rest' ? 'rest' : { hold: 0, build: () => start(r, o, true) },
      rest: () => r.rest(),
    });
    // Stage gap: gsap.matchMedia runs no callback on a desktop with reduced motion, so the scene shows its
    // still frame itself, now and whenever reduced motion is switched on while the page is open.
    if (!root.classList.contains('is-live')) settleSoon(r);
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setTimeout(() => settleSoon(r), 0);
    if (rm.addEventListener) rm.addEventListener('change', onMotion); else if (rm.addListener) rm.addListener(onMotion);
    return mm;
  };
})();
