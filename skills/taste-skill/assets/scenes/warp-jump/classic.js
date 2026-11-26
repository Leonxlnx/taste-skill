// assets/scenes/warp-jump/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / warp-jump.js — a manifesto over a warp field that heats up with the scroll, then
// a jump through the vanishing point into the brand colour.
//
// The stage holds while a full-bleed canvas of radial streaks speeds up with the scroll: more rays,
// longer and thicker trails, and the streaks heat from the ink colour into the accent. The streaks leave
// from the edge of a dark mouth, an ellipse around the type, so the statement stands on clean ground at
// the end of a tunnel. Over it a centred uppercase manifesto changes in timed beats: letters arrive out
// of the vanishing point and leave by flying past the camera. An anchor word with two or three endings,
// then a ring of short principles (the mouth closes and the streaks rush in between them), then a final
// line. At the end the camera jumps: a disc of the accent opens inside the mouth and swallows the
// field, and the reader lands in the next section, which carries the accent on. For one long statement
// on a tech, research or launch page, or (enter: 'photo') as the portal from a photographic chapter to
// an abstract one. Write the copy fresh for the subject.
//
// DOM. The script adds the canvas, the exit layer with the ink copy of the final line, the count and the
// photo copies.
//
//   <section class="scene" data-scene="warp-jump" aria-label="What we hold to" data-options='{}'>
//     <div class="scene-stage">
//       <div class="warp-copy">
//         <div class="warp-statement">
//           <h2 class="warp-anchor">A star</h2>             1-2 words, 10 letters or fewer
//           <p class="warp-tail">in a steel box</p>        2-3 endings of 2-4 words, one line each: 16 letters
//           <p class="warp-tail">on the grid</p>            or fewer (12 keeps the full size on a phone)
//         </div>
//         <ol class="warp-points">                         3-12 principles: two short sentences, 4-8 words,
//           <li class="warp-point">Measure twice. Fire once.</li>      40 letters or fewer; each sentence
//           …                                                          is set on its own line
//         </ol>
//         <p class="warp-final">See you at first light</p> 3-6 words, two lines
//       </div>
//     </div>
//   </section>
//   <section style="background: var(--accent)">…</section>  the next section continues in the accent
//
//   enter 'photo' adds, inside .scene-stage before .warp-copy:
//     <figure class="warp-photo"><img src="…" alt="…" width="2000" height="1250"></figure>   1600px+ wide:
//                                                           aerial, terrain, machine, a city at night
//     <p class="warp-lead">One sentence of 8-16 words, read over the photograph.</p>
//
// Any part may be left out (no endings, no points, no final line); the beats close up. With no final
// line, whatever is on the stage when the jump starts flies past the camera, so the disc opens on the
// bare field and the stage still lands flat accent. The principles come four at most to a beat (5-6
// make two beats of three, 12 make three of four), so the hold grows with them, one screen a beat.
// Each statement line is fitted to the stage on its own: a longer ending than the guide is set smaller
// (never under 0.6 of the anchor; past that it breaks into two balanced lines) and never shrinks the
// anchor, which keeps at least 0.8 of its size. The final line takes a wider measure first, then a smaller size down to 0.6,
// then a third line (live and at rest alike).
//
// Tokens (on :root or the section): --warp-ground (default var(--ground-dark, #050607): a near-black, or
// the page's darkest tone), --warp-ink (var(--ink-light, #eeeeea)), --warp-accent (var(--accent, #ff5b24):
// any hue but violet, indigo or purple, light enough to read as a 1px line on black, L* 55 or more),
// --font-display (the uppercase display face; a wide or heavy grotesk, 800, wdth 112 if it has the axis),
// --font-text. The final line is set in the ground colour on the accent, or in the ink when the ground
// would fall under 4.5:1 there. The section after the scene takes var(--warp-accent) as its background.
//
// Options (data-options JSON). Default, then range:
//   exit       'disc'    'disc' a disc of the accent opens at the vanishing point and swallows the field;
//                        'flood' the streaks turn accent, lengthen and thicken into a tunnel, and the
//                        accent rises between them from the rim toward the mouth (84-88%, the white line
//                        still on the dark); then the accent closes over the mouth like an iris
//                        (88.5-95%, with the scroll) and each letter turns to the exit ink as the edge
//                        passes it, to the pixel; the stage is flat accent from 95%;
//                        'release' no exit, the field holds at full speed and the page scrolls on (the
//                        next section can be any colour)
//   enter      'field'   'field' the scene opens on the running field with the first statement read;
//                        'photo' it opens on .warp-photo with .warp-lead read, then zooms through the
//                        picture into the field (adds one screen to the hold)
//   speed      1         0.5-1.4  clock of the field; with accentMax it is the restraint dial:
//                        0.5 / 0.25 calm and mostly ink, 1 / 0.5 the default, 1.4 / 0.7 a loud launch
//   accentMax  0.5       0.2-0.7  most of the rays the accent may take
//   rays       1100      600-1600 rays at full speed on desktop (under 1024px 700; phones 800); 60%
//                        of them are already drawn at 0
//   hold       auto      3-8      screens held on desktop; auto = beats (+1 for 'photo'): one screen a beat
//   phoneHold  auto      3-7      screens held under 768px; auto = beats (+1 for 'photo')
//   phone      'same'    'same' runs the phone plan (fewer rays, a centred column of principles);
//                        'rest' shows the finished composition on phones
//   scrub      0.5       seconds of catch-up, or true
//   count      true      a plain "2 of 4" in the bottom-left corner while the beats run
//   progressVar false    true keeps the stage's --p on the section. Off by default: --p changes on every
//                        scrolled frame, and a custom property changing on the section restyles every
//                        letter inside it (2-3ms a frame); nothing in this scene reads it
//
// Progress map (desktop 1440x900, 2 endings + 4 points + final = 4 beats, hold 4: one screen a beat,
// the jump inside the last). Beat k starts at
// k x 0.84 / beats: 0, 0.21, 0.42, 0.63; the jump runs 0.84 to 1. Field speed d = (p / 0.84)^0.9;
// rays drawn = rays x (0.6 + 0.4d); trail = 0.24 + 0.33d^1.1 (+0.4 in the jump); rim width 4 + 2.8d px
// (narrower toward the vanishing point, never under 2px: a streak is a line that is the content). The
// field is at warp speed from the first frame. The type never needs a scrim: the streaks leave from the
// edge of the mouth, an ellipse through the corners of the widest statement line and the final line
// (with a margin), each ray at its own jittered radius, and the first 30% of a streak outside it is drawn
// at 0.38 of its alpha, so the edge of the dark is soft without a gradient or a blur. The text changes
// in timed beats when the playhead crosses a start, never scrubbed: the leaving words go first (0.32s
// out) and the next arrive only once they are gone (0.3s later, 0.6s in), so two beats never share
// pixels, even for the length of a swap, and every rest shows whole words at full opacity; each change
// of beat also surges the field's speed.
//   0%    anchor + ending 1 read, centred in the dark mouth; 660 streaks already running around it (rim
//         streaks about 220px long, 4px wide; the field never stops: it has its own clock, and
//         scrolling pushes it), mostly ink, 15% accent. "1 of 4".
//   21%   ending 1 flies past the camera, then ending 2 arrives out of the centre; the anchor stays.
//   25%   anchor + ending 2; about 810 rays, rim streaks about 300px and 4.9px wide, 27% accent.
//   42%   the statement flies out; then four principles stream out of the centre onto ground plates
//         (0.9) around the vanishing point, 0.09s apart, settled within 0.9s. Over 42-46% the mouth
//         closes to a small dark core and the streaks rush in between the plates (field at 0.88). On an
//         upright stage (a phone, a tablet held upright) the plates stand in a centred column instead,
//         and the mouth does not close: it takes the column's shape, so the column stands on the clean
//         ground with the streaks around it, never behind its words.
//   50%   the principles fly past: each drifts outward along its ray (-1.5% to +6% of the width) and
//         grows from 0.9 to 1.25 over its beat, as if the camera passed between them.
//   59-63% the mouth opens again around where the final line will stand.
//   63%   the principles leave, each fading outward along its own ray (apart from the others, never
//         over them); then the final line arrives and pushes from scale 1 to 1.06 until 84%.
//   75%   dense, long, thick rays (about 470px at the rim, 6.5px wide), 47% accent, all around the mouth.
//   82%   the field accelerates into the jump (trails run from the mouth to the rim).
//   84%   the count fades; the accent disc opens at the vanishing point (power1.in, radius growing with
//         the square of time: the fall accelerates) under the final line, whose letters turn to the exit
//         ink inside it, to the pixel. (No final line: the last beat's text flies out here.)
//   90%   disc radius about 157px inside the dark mouth; the canvas lurches forward (scale to 1.12);
//         nothing is drawn under the disc.
//   98%   the disc covers the stage and a flat accent layer takes over; the canvas stops at 98.5%.
//   100%  a flat accent stage with the final line in the exit ink; the next section carries on.
// Phone (390x844): hold 4, 800 rays at DPR 1 (480 at 0), rim width x 0.85 (3.4 to 5.8px), type
// min(11vw, 7.5svh) fitted to 90% of the width; the mouth is wider than the screen, so it reads as a
// dark slot across the tunnel. The principles stand in a centred column (four at most a beat) inside a
// mouth of the column's shape, char stagger 0.012s, canvas lurch 1.08. Same fractions. A tablet held
// upright (768x1024) runs the desktop plan with the phone's column and a larger type,
// min(10vw, 7.5svh).
//
// Cost. The field is one WebGL canvas: every streak is a quad in one vertex buffer, drawn with a single
// call (about 0.2ms of script a frame, no garbage, next to nothing for the GPU); without WebGL it falls
// back to canvas 2D with the same picture. The exit disc is drawn by the field too, so the jump never
// redraws a full-screen layer; only the ink copy of the final line is clipped, in its own small box.
// The field draws only while the scene is near the screen. The copy sits on a layer of its own, the
// size of the stage; while the playhead moves, the drifting plates and the final line's push ride on
// layers too (dropped when the reader stops, so the type is drawn crisp at rest). The letters of a beat
// change fly as Web Animations on the compositor (the principles word by word), so no frame redraws
// text in flight and no tween is built per letter (that cost 20-40ms in the frame of the change); a
// letter at rest carries no inline style and no animation. Nothing on a scrolled frame reads layout,
// and the section's --p is kept off (see progressVar). A machine that keeps dropping frames
// steps down on its own (fewer rays; a coarser canvas only at the last step, only on phones or without
// WebGL, and only when the reader stops scrolling, so the canvas is never reallocated mid-scroll) and
// steps back up after about 120 clean frames. On a 120Hz or faster display the field is drawn every
// other frame (60-72 pictures a second), and a machine that has stepped down draws it about 50, then 40
// times a second; the page, the type and the lurch still move on every frame.
//
// Finished composition (reduced motion, no script, a failed CDN, phone 'rest'): an ordinary section on
// the dark ground: the anchor as the one display line with the endings under it in the text face, the
// principles in a grid, the final line in a full-width accent panel that meets the accent section after
// it (fitted to two lines when the script runs). With script, the field is drawn once, still, around the
// statement's mouth.
//
// House rules applied to the source idea: no monospace HUD, no 01/04 counter, no hairline progress bar,
// no scrim, gradient or fan (the dark around the type is the mouth the streaks leave from), no glow
// ('lighter' blending or shadowBlur), no numbers on the principles, no violet, no streak under 2px.
//
// crosses words: `.warp-exit` recolours the final line only (the jump, from 84%)
//   Its ink copy of the line, set in register on the white line, shows inside the accent's edge to the
//   pixel, so every letter stays whole on its own ground; then the flat accent holds the stage with the
//   ink copy on it.
(() => {
  const ID = 'warp-jump';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d);
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const JUMP = 0.84;
  // exit 'flood': the tunnel is solid accent by FLOOD_END; from IRIS0 to IRIS1 the accent closes over the
  // mouth like an iris (scrubbed), and the final line turns to the exit ink exactly at its edge
  const FLOOD_END = 0.91, IRIS0 = 0.885, IRIS1 = 0.95;

  const settings = (o = {}) => ({
    exit: ['disc', 'flood', 'release'].includes(o.exit) ? o.exit : 'disc',
    enter: o.enter === 'photo' ? 'photo' : 'field',
    speed: num(o.speed, 1, 0.5, 1.4),
    accentMax: num(o.accentMax, 0.5, 0.2, 0.7),
    rays: Math.round(num(o.rays, 1100, 600, 1600)),
    hold: num(o.hold, 0, 3, 8),
    phoneHold: num(o.phoneHold, 0, 3, 7),
    phone: o.phone === 'rest' ? 'rest' : 'same',
    scrub: o.scrub === true ? true : num(o.scrub, 0.5, 0, 2),
    count: o.count !== false,
    progressVar: o.progressVar === true,
  });

  // ---------- colour: tokens resolved to rgb, mixed in JS (a canvas cannot read var()) ----------

  const scratch = document.createElement('canvas').getContext('2d');
  function rgbOf(root, prop, fallback) {
    const probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;visibility:hidden;color:' + fallback;
    probe.style.color = 'var(' + prop + ', ' + fallback + ')';
    root.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    scratch.fillStyle = fallback;
    scratch.fillStyle = c;
    const s = String(scratch.fillStyle);
    if (s[0] === '#') return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
    const m = s.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  }
  const lum = (rgb) => {
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  };
  const contrast = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
  const css = (rgb) => 'rgb(' + rgb.map((n) => Math.round(n)).join(' ') + ')';

  // ---------- the field: radial streaks on one canvas, batched by tone and width ----------

  const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // The field is drawn with WebGL when the browser has it: every streak is a quad in one vertex buffer,
  // drawn with one call, its long edges antialiased in the fragment shader. (Canvas 2D drew the same
  // picture as a thousand rotated rectangles a frame, which the GPU process had to replay one by one:
  // 1.5ms of GPU work a frame and most of the scene's dropped frames.) Without WebGL the field falls
  // back to canvas 2D with the same geometry.
  const VS = 'attribute vec2 a_p;attribute vec2 a_e;attribute vec4 a_c;uniform vec2 u_s;uniform float u_d;varying vec2 v_e;varying vec4 v_c;' +
    'void main(){v_e=a_e*u_d;v_c=a_c;gl_Position=vec4(a_p.x*u_s.x-1.0,1.0-a_p.y*u_s.y,0.0,1.0);}';
  const FS = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec2 v_e;varying vec4 v_c;' +
    'void main(){float k=clamp(v_e.y-abs(v_e.x)+0.5,0.0,1.0);gl_FragColor=vec4(v_c.rgb,1.0)*(v_c.a*k);}';
  const LE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
  const pack = (rgb, a) => {
    const r = Math.round(rgb[0]) & 255, g = Math.round(rgb[1]) & 255, b = Math.round(rgb[2]) & 255, A = Math.round(clamp(a, 0, 1) * 255);
    return (LE ? (r | (g << 8) | (b << 16) | (A << 24)) : ((r << 24) | (g << 16) | (b << 8) | A)) >>> 0;
  };
  function makeGL(canvas, maxQuads) {
    let gl = null;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (!gl) return null;
    // 4 vertices a quad: x, y (CSS px), across, half width (CSS px), rgba (bytes): 20 bytes
    const buf = new ArrayBuffer(maxQuads * 80), f32 = new Float32Array(buf), u32 = new Uint32Array(buf);
    const R = { gl, f32, u32, ok: false, prog: null, uS: null, uD: null, w: -1, h: -1, dpr: -1 };
    R.init = () => {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { R.ok = false; return false; }
      gl.useProgram(prog);
      const vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, buf.byteLength, gl.DYNAMIC_DRAW);
      const idx = new Uint16Array(maxQuads * 6);
      for (let q = 0, v = 0; q < maxQuads; q++, v += 4) idx.set([v, v + 1, v + 2, v, v + 2, v + 3], q * 6);
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      const aP = gl.getAttribLocation(prog, 'a_p'), aE = gl.getAttribLocation(prog, 'a_e'), aC = gl.getAttribLocation(prog, 'a_c');
      gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(aE); gl.vertexAttribPointer(aE, 2, gl.FLOAT, false, 20, 8);
      gl.enableVertexAttribArray(aC); gl.vertexAttribPointer(aC, 4, gl.UNSIGNED_BYTE, true, 20, 16);
      R.uS = gl.getUniformLocation(prog, 'u_s'); R.uD = gl.getUniformLocation(prog, 'u_d');
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      R.prog = prog; R.w = R.h = R.dpr = -1; R.ok = true;
      return true;
    };
    // a lost context draws nothing (the stage's ground shows) until the browser restores it
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); R.ok = false; });
    canvas.addEventListener('webglcontextrestored', () => { R.init(); });
    if (!R.init()) return null;
    // one frame: the ground, then every quad in buffer order, in one draw
    R.render = (W, H, dpr, ground, quads) => {
      if (!R.ok) return;
      if (R.w !== canvas.width || R.h !== canvas.height) { R.w = canvas.width; R.h = canvas.height; gl.viewport(0, 0, R.w, R.h); }
      if (R.dpr !== dpr || R.cw !== W || R.ch !== H) { R.dpr = dpr; R.cw = W; R.ch = H; gl.uniform2f(R.uS, 2 / W, 2 / H); gl.uniform1f(R.uD, dpr); }
      gl.clearColor(ground[0] / 255, ground[1] / 255, ground[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!quads) return;
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, f32.subarray(0, quads * 20));
      gl.drawElements(gl.TRIANGLES, quads * 6, gl.UNSIGNED_SHORT, 0);
    };
    return R;
  }

  function makeField(canvas) {
    const MAX = 1600;
    const rnd = mulberry32(7);
    const cos = new Float32Array(MAX), sin = new Float32Array(MAX), phi = new Float32Array(MAX), k = new Float32Array(MAX), pick = new Float32Array(MAX), mj = new Float32Array(MAX);
    for (let i = 0; i < MAX; i++) {
      // golden-angle order: the first n rays always cover the circle evenly as the field fills
      const th = i * 2.399963 + (rnd() * 2 - 1) * 0.01;
      cos[i] = Math.cos(th); sin[i] = Math.sin(th);
      phi[i] = rnd(); k[i] = 0.7 + 0.6 * rnd(); pick[i] = rnd();
      mj[i] = 0.9 + 0.2 * rnd();   // where this ray leaves the mouth (a ragged edge, never a drawn ring)
    }
    // 3 tones x 4 widths x 2 alphas (full, and the softened stretch just outside the mouth); each bucket
    // holds (ray, tail radius, head radius) triples, filled anew every frame without allocating
    const segs = Array.from({ length: 24 }, () => new Float32Array(MAX * 3));
    const counts = new Int32Array(24);
    // width per radius bin: the streaks near the vanishing point are farther away, so thinner, but a
    // streak is a line that is the content, so never under 2px (4px rims: the innermost is 2.6px; a
    // phone's 3.4px rims: 2.2px)
    const BIN = [0.65, 0.75, 0.88, 1];
    // u^2.4 from a table (the head's ease along its ray, a thousand times a frame)
    const PN = 2048, POW = new Float32Array(PN + 2);
    for (let i = 0; i <= PN + 1; i++) POW[i] = Math.pow(Math.min(1, i / PN), 2.4);
    const RING = 160;   // segments of the flood's elliptical edge
    const gl = makeGL(canvas, MAX * 2 + RING * 4 + 8);
    const f = {
      canvas, gl, ctx: gl ? null : canvas.getContext('2d', { alpha: false }),
      W: 0, H: 0, dpr: 1, cx: 0, cy: 0, R: 1, Rc: 1,
      N: 1100, wScale: 1, speed: 1, accentMax: 0.5, exit: 'disc',
      p: 0, lastP: 0, travel: 0.37, kick: 0, dim: 1, cover: 0, disc: 0,
      // the mouth: an ellipse around the statement that the streaks leave from, so the type stands on
      // the clean ground (no scrim, no halo). ma/mb are its half-axes open; open 0 shrinks it to the core.
      // col 0-1 turns it into the mouth around a column of principles (colA/colB), on an upright stage.
      ma: 0, mb: 0, open: 1, shut: 0, col: 0, colA: 0, colB: 0,
      ground: 'rgb(5 6 7)', tones: ['#fff', '#fff', '#fff'], alphas: [0.9, 0.85, 1], accent: '#ff5b24',
      groundRgb: [5, 6, 7], accentRgb: [255, 91, 36], toneRgb: [[238, 238, 234], [246, 164, 135], [255, 91, 36]],
    };
    const gmix = [0, 0, 0];

    f.size = (W, H, dpr) => {
      W = Math.max(1, Math.round(W)); H = Math.max(1, Math.round(H));
      const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      f.W = W; f.H = H; f.dpr = dpr;
    };
    // vanishing point and reach; the head runs out to R / (1 - L) so a tail leaves the corner as it wraps
    f.aim = (cx, cy) => {
      f.cx = cx; f.cy = cy;
      f.Rc = Math.hypot(Math.max(cx, f.W - cx), Math.max(cy, f.H - cy));
      f.R = 1.05 * f.Rc;
    };
    // the mouth around a box of text (the statement, the final line): an ellipse that holds the box's
    // corners with a margin, never wider than the stage allows
    const mouthOf = (boxW, boxH, pad, capB) => {
      const a = Math.min((boxW / 2) * 1.16 + pad, f.W * 0.62);
      // the ellipse through the box corner (boxW/2, boxH/2) with half-axis a
      const q = Math.min(0.92, Math.pow(boxW / 2 / a, 2));
      const b = Math.min((boxH / 2) / Math.sqrt(1 - q) + pad * 0.6, f.H * capB);
      return [a, b];
    };
    f.mouthFor = (boxW, boxH, pad) => { [f.ma, f.mb] = mouthOf(boxW, boxH, pad, 0.42); };
    // a column of principles is tall and narrow: its mouth may reach nearer the top and bottom
    f.columnFor = (boxW, boxH, pad) => { [f.colA, f.colB] = mouthOf(boxW, boxH, pad, 0.47); };

    // The field is already at warp speed at 0: half the rays, trails a fifth of the radius, 4px rims.
    // d rises quickly (t^0.9), so a quarter of the way in the field is dense and long. (One state object,
    // rewritten every frame.)
    const S = { d: 0, j: 0, L: 0, w: 0, acc: 0, fl: 0, still: false, n: 0, v: 0, r0: 0 };
    f.state = (p, still) => {
      const t = Math.min(1, p / JUMP), d = Math.pow(t, 0.9);
      const j = still || f.exit === 'release' ? 0 : ss(0.82, 0.92, p);
      const fl = !still && f.exit === 'flood' ? ss(JUMP, FLOOD_END, p) : 0;
      let L = Math.min(0.9, 0.24 + 0.33 * Math.pow(d, 1.1) + 0.4 * j);
      let w = (4 + 2.8 * d) * f.wScale;
      let acc = Math.min(f.accentMax, 0.15 + 0.35 * d);
      if (fl) { L += (0.95 - L) * fl; w += (9 * f.wScale - w) * fl; acc += (1 - acc) * fl; }
      S.d = d; S.j = j; S.L = L; S.w = w; S.acc = acc; S.fl = fl; S.still = !!still;
      S.n = Math.min(MAX, Math.round(f.N * (0.6 + 0.4 * d)));
      S.v = (0.1 + 0.5 * d) * f.speed + 1.6 * j;
      // the void opens with the jump only where the disc covers it ('flood' keeps the tunnel whole)
      S.r0 = (0.005 + (f.exit === 'disc' ? 0.115 : 0) * j) * f.R;
      return S;
    };

    f.draw = (st) => {
      const dpr = f.dpr, cx = f.cx, cy = f.cy, R = f.R, Rc = f.Rc;
      const gr = f.groundRgb, ar = f.accentRgb;
      const keep = 1 - st.L, span = R / keep - st.r0, r0 = st.r0;
      const acc = st.acc, tint = Math.min(1, acc * 1.6);
      const b1 = 0.25 * R, b2 = 0.5 * R, b3 = 0.75 * R, travel = f.travel, cover = f.cover;
      // the mouth: from a small core (open 0) to the ellipse around the text (open 1)
      const core = 0.035 * R, op = clamp(f.open, 0, 1), cm = f.colA > 0 ? clamp(f.col, 0, 1) : 0;
      let ma0 = core + (Math.max(core, f.ma) - core) * op, mb0 = core + (Math.max(core, f.mb) - core) * op;
      // (an upright stage: the mouth takes the column's shape while the principles stand in it)
      if (cm) { ma0 += (Math.max(core, f.colA) - ma0) * cm; mb0 += (Math.max(core, f.colB) - mb0) * cm; }
      // 'flood': the iris (shut 0 to 1) closes the whole mouth, its core too
      const shut = st.fl ? clamp(f.shut, 0, 1) : 0, iris = 1 - shut;
      const ma = Math.max(0.5, ma0 * iris), mb = Math.max(0.5, mb0 * iris);
      // the ground turns to the accent once the iris has closed (nothing of the mouth is left)
      const g = shut >= 0.999 ? 1 : 0;
      for (let c = 0; c < 3; c++) gmix[c] = gr[c] + (ar[c] - gr[c]) * g;
      // 'flood': the accent rises between the streaks from the rim toward the mouth (a flat field with a
      // hard edge, under the streaks), stops a little outside it, and as the iris starts to close it
      // closes up to the mouth's edge and carries it inward
      let fs = 0;
      f.irisA = f.irisB = Infinity;
      if (st.fl > 0.3) {
        const s0 = Math.hypot(f.W / 2 / ma0, f.H / 2 / mb0) * 1.02;
        fs = s0 + (1.35 - s0) * ss(0.3, 0.8, st.fl);
        fs += (1 - fs) * clamp(shut * 3, 0, 1);
        f.irisA = ma * fs; f.irisB = mb * fs;
      }
      // while the iris closes, no streak starts inside its edge (the ragged start is pulled out to it)
      const pull = clamp(shut * 3, 0, 1);
      const ab = ma * mb, ma2 = ma * ma, mb2 = mb * mb, SOFT = 1.3;
      counts.fill(0);
      for (let i = 0; i < st.n; i++) {
        let u = phi[i] + travel * k[i];
        u -= Math.floor(u);
        const x = u * PN, xi = x | 0;
        const rh = r0 + span * (POW[xi] + (POW[xi + 1] - POW[xi]) * (x - xi));
        if (rh <= cover) continue;
        let rt = rh * keep;
        if (rt < r0) rt = r0;
        if (rt < cover) rt = cover;
        if (rt >= Rc) continue;
        // a streak starts outside the mouth; the stretch just outside it is drawn fainter, so the
        // dark around the type has a soft edge made of the streaks themselves
        const c = cos[i], s = sin[i];
        const jm = mj[i], rm = (ab / Math.sqrt(mb2 * c * c + ma2 * s * s)) * (jm < 1 ? jm + (1 - jm) * pull : jm);
        if (rh <= rm + 0.5) continue;
        if (rt < rm) rt = rm;
        if (rh - rt < 0.5) continue;
        const tone = (pick[i] < acc ? 2 : pick[i] < tint ? 1 : 0) * 8;
        const soft = rm * SOFT;
        let b, a, m;
        if (rt < soft) {
          const e = rh < soft ? rh : soft;
          b = tone + (e < b1 ? 0 : e < b2 ? 2 : e < b3 ? 4 : 6) + 1;
          a = segs[b]; m = counts[b]++ * 3; a[m] = i; a[m + 1] = rt; a[m + 2] = e;
          if (rh > soft + 0.5) {
            b = tone + (rh < b1 ? 0 : rh < b2 ? 2 : rh < b3 ? 4 : 6);
            a = segs[b]; m = counts[b]++ * 3; a[m] = i; a[m + 1] = soft; a[m + 2] = rh;
          }
        } else {
          b = tone + (rh < b1 ? 0 : rh < b2 ? 2 : rh < b3 ? 4 : 6);
          a = segs[b]; m = counts[b]++ * 3; a[m] = i; a[m + 1] = rt; a[m + 2] = rh;
        }
      }
      if (gl) {
        // WebGL: every streak a quad (widened by a device pixel for the shader's antialiased edges),
        // written straight into the vertex buffer in the same order canvas 2D would paint them
        const F = gl.f32, U = gl.u32, pad = 0.75 / dpr;
        let o = 0, q = 0;
        if (fs) {
          // the flood: a ring from the ellipse out past the corners. Its inner edge is a band 8px wide
          // whose 'across' value runs from 8 + pad (inside the edge, clear) to 0, so the shader feathers
          // the edge over one device pixel; outside the band the ring is solid.
          const A = ma * fs, B = mb * fs, far = 2 * Math.hypot(f.W, f.H), col = pack(ar, 1), BAND = 8;
          const vert = (x, y, e) => { F[o] = x; F[o + 1] = y; F[o + 2] = e; F[o + 3] = BAND; U[o + 4] = col; o += 5; };
          for (let s = 0; s < RING; s++) {
            const t0 = (s / RING) * Math.PI * 2, t1 = ((s + 1) / RING) * Math.PI * 2;
            const c0 = A * Math.cos(t0), s0 = B * Math.sin(t0), c1 = A * Math.cos(t1), s1 = B * Math.sin(t1);
            const l0 = Math.hypot(c0, s0), l1 = Math.hypot(c1, s1);
            const ia = (l0 - pad) / l0, ib = (l1 - pad) / l1, oa = (l0 + BAND) / l0, ob = (l1 + BAND) / l1;
            vert(cx + c0 * ia, cy + s0 * ia, BAND + pad); vert(cx + c0 * oa, cy + s0 * oa, 0);
            vert(cx + c1 * ob, cy + s1 * ob, 0); vert(cx + c1 * ib, cy + s1 * ib, BAND + pad);
            const fa = far / l0, fb = far / l1;
            vert(cx + c0 * oa, cy + s0 * oa, 0); vert(cx + c0 * fa, cy + s0 * fa, 0);
            vert(cx + c1 * fb, cy + s1 * fb, 0); vert(cx + c1 * ob, cy + s1 * ob, 0);
            q += 2;
          }
        }
        for (let t = 0; t < 3; t++) {
          const rgb = f.toneRgb[t];
          for (let b4 = 0; b4 < 8; b4++) {
            const b = t * 8 + b4, m = counts[b] * 3;
            if (!m) continue;
            const col = pack(rgb, f.alphas[t] * f.dim * (b4 & 1 ? 0.38 : 1));
            const a = segs[b], hw = (st.w * BIN[b4 >> 1]) / 2, ex = hw + pad;
            for (let s = 0; s < m; s += 3) {
              const i = a[s], co = cos[i], si = sin[i], rt = a[s + 1], rh = a[s + 2];
              const nx = -si * ex, ny = co * ex;
              const tx = cx + co * rt, ty = cy + si * rt, hx = cx + co * rh, hy = cy + si * rh;
              F[o] = tx + nx; F[o + 1] = ty + ny; F[o + 2] = ex; F[o + 3] = hw; U[o + 4] = col;
              F[o + 5] = hx + nx; F[o + 6] = hy + ny; F[o + 7] = ex; F[o + 8] = hw; U[o + 9] = col;
              F[o + 10] = hx - nx; F[o + 11] = hy - ny; F[o + 12] = -ex; F[o + 13] = hw; U[o + 14] = col;
              F[o + 15] = tx - nx; F[o + 16] = ty - ny; F[o + 17] = -ex; F[o + 18] = hw; U[o + 19] = col;
              o += 20; q++;
            }
          }
        }
        if (f.disc > 0) {
          // the exit disc of the accent over the field, its rim feathered over one device pixel
          const r = f.disc, col = pack(ar, 1), BAND = Math.min(8, r);
          const vert = (x, y, e) => { F[o] = x; F[o + 1] = y; F[o + 2] = e; F[o + 3] = BAND; U[o + 4] = col; o += 5; };
          const ri = r - BAND, ro = r + pad;
          for (let s = 0; s < RING; s++) {
            const t0 = (s / RING) * Math.PI * 2, t1 = ((s + 1) / RING) * Math.PI * 2;
            const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
            if (ri > 0) { vert(cx, cy, 0); vert(cx, cy, 0); vert(cx + c1 * ri, cy + s1 * ri, 0); vert(cx + c0 * ri, cy + s0 * ri, 0); q++; }
            vert(cx + c0 * Math.max(0, ri), cy + s0 * Math.max(0, ri), 0); vert(cx + c0 * ro, cy + s0 * ro, BAND + pad);
            vert(cx + c1 * ro, cy + s1 * ro, BAND + pad); vert(cx + c1 * Math.max(0, ri), cy + s1 * Math.max(0, ri), 0);
            q++;
          }
        }
        gl.render(f.W, f.H, dpr, gmix, q);
        return;
      }
      // canvas 2D: each streak is a rectangle along its ray (fillRect under a rotation)
      const ctx = f.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g ? css(gmix) : f.ground;
      ctx.fillRect(0, 0, f.W, f.H);
      if (fs) {
        ctx.fillStyle = f.accent;
        ctx.beginPath();
        ctx.rect(0, 0, f.W, f.H);
        ctx.ellipse(cx, cy, ma * fs, mb * fs, 0, 0, Math.PI * 2);
        ctx.fill('evenodd');
      }
      const cxd = cx * dpr, cyd = cy * dpr;
      for (let t = 0; t < 3; t++) {
        ctx.fillStyle = f.tones[t];
        for (let b4 = 0; b4 < 8; b4++) {
          const b = t * 8 + b4, m = counts[b] * 3;
          if (!m) continue;
          ctx.globalAlpha = f.alphas[t] * f.dim * (b4 & 1 ? 0.38 : 1);
          const a = segs[b], hw = (st.w * BIN[b4 >> 1]) / 2, w2 = hw * 2;
          for (let s = 0; s < m; s += 3) {
            const i = a[s], co = cos[i] * dpr, si = sin[i] * dpr, rt = a[s + 1];
            ctx.setTransform(co, si, -si, co, cxd + co * rt, cyd + si * rt);
            ctx.fillRect(0, -hw, a[s + 2] - rt, w2);
          }
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      if (f.disc > 0) {
        ctx.fillStyle = f.accent;
        ctx.beginPath();
        ctx.arc(cx, cy, f.disc, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // one live frame: the clock never stops, scrolling pushes it forward, a beat change kicks it
    f.step = (dt) => {
      const st = f.state(f.p);
      const dp = Math.abs(f.p - f.lastP);
      f.lastP = f.p;
      const push = Math.min(dp * 4 * (0.5 + st.d), 0.015 + 0.045 * st.d);
      f.kick *= Math.pow(0.5, dt / 0.3);
      f.travel += st.v * dt + push + f.kick * dt;
      f.draw(st);
    };
    f.still = (p) => { f.draw(f.state(p, true)); };
    return f;
  }

  // ---------- text: words and characters in inline-blocks, no line mask (letters fly past the camera) ----------

  // sentences: each sentence in its own .warp-line (a principle's two sentences set as two lines)
  function split(el, sentences) {
    if (el.__warpChars) return el.__warpChars;
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'warp-sr';
    sr.textContent = text;
    const vis = document.createElement('span');
    vis.className = 'warp-vis';
    vis.setAttribute('aria-hidden', 'true');
    const chars = [];
    const parts = sentences ? text.split(/(?<=[.!?])\s+(?=\S)/) : [text];
    parts.forEach((part, li) => {
      let box = vis;
      if (sentences) {
        if (li) vis.append(' ');
        box = document.createElement('span');
        box.className = 'warp-line';
        vis.append(box);
      }
      part.split(' ').forEach((word, i) => {
        if (i) box.append(' ');
        const w = document.createElement('span');
        w.className = 'warp-w';
        for (const ch of Array.from(word)) {
          const c = document.createElement('span');
          c.className = 'warp-c';
          c.textContent = ch;
          w.append(c);
          chars.push(c);
        }
        box.append(w);
      });
    });
    el.append(sr, vis);
    el.__warpChars = chars;
    return chars;
  }

  const posIn = (el, anc) => {
    let x = 0, y = 0, n = el;
    while (n && n !== anc) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  };

  // eases of the timed text beats (same curves as GSAP's expo.out, power3.in, power2.in/out, power1.in)
  const EASES = [
    (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    (t) => t * t * t,
    (t) => t * t,
    (t) => 1 - (1 - t) * (1 - t),
    (t) => t,
  ];
  const E_EXPO_OUT = 0, E_P3_IN = 1, E_P2_IN = 2, E_P2_OUT = 3, E_LIN = 4;

  // ---------- the scene ----------

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const o = settings(opts);
    const $ = (s) => root.querySelector(s);
    const $$ = (s) => [...root.querySelectorAll(s)];
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const statement = $('.warp-statement');
    const anchor = $('.warp-anchor');
    const tails = $$('.warp-tail');
    const points = $$('.warp-point');
    const final = $('.warp-final');
    const photo = o.enter === 'photo' ? $('.warp-photo') : null;
    const photoImg = photo && photo.querySelector('img');
    const lead = o.enter === 'photo' ? $('.warp-lead') : null;
    const isPhoto = !!(photo && photoImg);
    if (!isPhoto) root.classList.remove('warp-enter-photo'); else root.classList.add('warp-enter-photo');
    root.classList.add('warp-exit-' + o.exit);

    // The stage writes --p on the section on every scrolled frame. A custom property that changes on the
    // section restyles every element inside it, and this scene holds a few hundred letters: 2-3ms of
    // style work a frame, most of the main thread's budget at 120Hz. Nothing here reads --p (the
    // playhead drives the scene), so it stays off this section unless the page asks for it
    // (progressVar: true). (A stage change would be better: write --p only for scenes that read it.)
    if (!o.progressVar && !root.__warpNoP) {
      root.__warpNoP = true;
      const st = root.style, set = st.setProperty;
      Object.defineProperty(st, 'setProperty', { configurable: true, value(k, v, pr) { if (k === '--p') return undefined; return set.call(st, k, v, pr); } });
    }

    // script-owned layers
    let canvas = $('.warp-field');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'warp-field';
      canvas.setAttribute('aria-hidden', 'true');
      stage.prepend(canvas);
    }
    // The exit layer: 'disc' and 'flood' always have one (the accent itself is drawn by the field; this
    // layer turns flat accent once the stage is covered, so it lands flat accent even with no final line),
    // carrying an ink copy of the final line when there is one, clipped to the accent's edge; 'release'
    // has none.
    let exitEl = $('.warp-exit'), exitCopy = null, inkFinal = null;
    if (o.exit === 'release') {
      if (exitEl) exitEl.style.display = 'none';
      exitEl = null;
    } else {
      if (!exitEl) {
        exitEl = document.createElement('div');
        exitEl.className = 'warp-exit';
        stage.append(exitEl);
      }
      exitEl.setAttribute('aria-hidden', 'true');
      if (final) {
        exitCopy = exitEl.querySelector('.warp-exit-copy');
        if (!exitCopy) {
          exitCopy = document.createElement('div');
          exitCopy.className = 'warp-exit-copy';
          exitEl.append(exitCopy);
        }
      }
    }
    let countEl = $('.warp-count'), countText = null;
    if (!countEl && o.count) {
      countEl = document.createElement('p');
      countEl.className = 'warp-count';
      countEl.setAttribute('aria-hidden', 'true');
      countText = document.createElement('span');
      countEl.append(countText);
      stage.append(countEl);
    } else if (countEl) countText = countEl.firstElementChild || countEl;
    const zooms = [];
    if (isPhoto) {
      for (let i = 0; i < 3; i++) {
        const z = document.createElement('div');
        z.className = 'warp-zoom';
        z.setAttribute('aria-hidden', 'true');
        const im = document.createElement('img');
        im.alt = '';
        im.decoding = 'async';
        im.src = photoImg.currentSrc || photoImg.src;
        z.append(im);
        photo.after(z);
        zooms.push(z);
      }
    }

    const field = makeField(canvas);
    field.speed = o.speed; field.accentMax = o.accentMax; field.exit = o.exit;

    // ---------- the plan: which text each beat shows, and when it starts ----------

    function makePlan(phone) {
      const beats = [];
      const groups = new Map();
      if (isPhoto && lead) { groups.set('lead', { kind: 'lead', el: lead }); }
      if (anchor) groups.set('anchor', { kind: 'chars', el: anchor });
      tails.forEach((t, i) => groups.set('tail' + i, { kind: 'chars', el: t }));
      // at most four principles a beat (desktop and phone): 5-6 make two beats of three, 12 three of four
      const pointGroups = [];
      for (let g = 0, nG = Math.ceil(points.length / 4), at = 0; g < nG; g++) {
        const size = Math.ceil((points.length - at) / (nG - g));
        pointGroups.push(points.slice(at, at + size));
        at += size;
      }
      pointGroups.forEach((g, i) => groups.set('points' + i, { kind: 'points', items: g }));
      if (final) groups.set('final', { kind: 'final', el: final });
      const story = [];
      if (tails.length) tails.forEach((t, i) => story.push(anchor ? ['anchor', 'tail' + i] : ['tail' + i]));
      else if (anchor) story.push(['anchor']);
      pointGroups.forEach((g, i) => story.push(['points' + i]));
      if (final) story.push(['final']);
      const base = isPhoto ? 0.16 : 0;
      const slot = story.length ? (JUMP - base) / story.length : JUMP;
      if (isPhoto) {
        beats.push({ keys: lead ? ['lead'] : [], start: 0, n: 0 });
        beats.push({ keys: [], start: 0.05, n: 0 });
      }
      story.forEach((keys, i) => beats.push({ keys, start: base + i * slot, n: i + 1 }));
      // no final line: the last beat's text flies past the camera as the jump starts, so the exit opens
      // on the bare field and never under words still being read
      if (!final && story.length && o.exit !== 'release') beats.push({ keys: [], start: JUMP, n: 0 });
      if (!beats.length) beats.push({ keys: [], start: 0, n: 0 });
      for (const g of groups.values()) g.on = false;
      const at = (key) => beats.find((b) => b.keys.includes(key));
      return { beats, groups, pointGroups, slot, total: story.length, at, base };
    }
    const countBeats = (phone) => makePlan(phone).total;
    // one screen a beat (the jump runs inside the last one); 'photo' adds the screen of the picture
    const holdDesk = o.hold || clamp(countBeats(false) + (isPhoto ? 1 : 0), 3, 8);
    const holdPhone = o.phoneHold || clamp(countBeats(true) + (isPhoto ? 1 : 0), 3, 7);

    // ---------- state ----------

    let plan = makePlan(false);
    let live = false, phone = false, cur = null, instantUntil = 0, visible = false;
    let W = 0, H = 0;
    const pos = [];          // base centre of each principle in stage px, with its unit vector from the centre
    let colours = null;
    let splitDone = false;
    let inkBox = null;

    function readColours() {
      const ground = rgbOf(root, '--warp-ground', '#050607');
      const ink = rgbOf(root, '--warp-ink', '#eeeeea');
      const accent = rgbOf(root, '--warp-accent', '#ff5b24');
      const tint = ink.map((c, i) => (c + accent[i]) / 2);
      field.ground = css(ground);
      field.groundRgb = ground; field.accentRgb = accent; field.accent = css(accent);
      field.tones = [css(ink), css(tint), css(accent)];
      field.toneRgb = [ink, tint, accent];
      const groundOnAccent = contrast(ground, accent) >= 4.5;
      root.style.setProperty('--warp-exit-ink', groundOnAccent ? 'var(--warp-ground)' : 'var(--warp-ink)');
      colours = { ground, ink, accent, exitInk: groundOnAccent ? ground : ink };
    }

    function ensureSplit() {
      if (splitDone) return;
      splitDone = true;
      for (const el of [lead, anchor, ...tails, final]) if (el) split(el);
      for (const li of points) {
        if (li.querySelector(':scope > .warp-plate')) continue;
        const plate = document.createElement('span');
        plate.className = 'warp-plate';
        while (li.firstChild) plate.append(li.firstChild);
        li.append(plate);
        split(plate, true);
      }
      if (final && exitCopy && !inkFinal) {
        inkFinal = document.createElement('p');
        inkFinal.className = final.className;
        inkFinal.textContent = final.querySelector('.warp-sr') ? final.querySelector('.warp-sr').textContent : final.textContent;
        exitCopy.append(inkFinal);
        split(inkFinal);
        inkFinal.querySelector('.warp-sr').remove();
      }
    }

    const charsOf = (el) => (el && el.__warpChars) || [];
    const visOf = (el) => (el && el.querySelector(':scope > .warp-vis')) || null;

    // ---------- measuring: fitted type, the principles' places, char centres, the mouth ----------

    // The final line first takes a wider measure (12ch up to 22ch), and only then a smaller size of its
    // own, down to 0.6 (a longer line than the guide then takes a third line); only a single word wider
    // than the stage goes further. Used live and in the finished composition (setFit/setMeasure write the
    // two custom properties the CSS reads).
    function fitFinal(el, avail, maxLines, setFit, setMeasure, lines) {
      const widestWord = () => [...el.querySelectorAll('.warp-w')].reduce((m, w) => Math.max(m, w.offsetWidth), 0);
      setFit(1);
      for (const ch of [12, 14, 16, 18, 22]) {
        setMeasure(ch);
        if (lines() <= maxLines) break;
      }
      let s = 1;
      for (let i = 0; i < 12; i++) {
        const wide = widestWord() > avail;
        if (!wide && !(lines() > maxLines && s > 0.6)) break;
        s *= Math.min(0.94, avail / Math.max(1, widestWord()));
        if (!wide) s = Math.max(0.6, s);
        setFit(s);
      }
    }

    // Each statement line is fitted on its own, inside 90% of the width. The anchor keeps at least 0.8
    // of the full size (under that it may break between its words). An ending that would have to go
    // under 0.6 of the anchor stays at that floor and breaks into two balanced lines instead, so one long
    // ending never shrinks the anchor or the other endings.
    function fit() {
      const avail = W * 0.9;
      const lines = [anchor, ...tails].filter(Boolean);
      for (const el of lines) { el.style.removeProperty('--warp-fit'); el.classList.remove('warp-wrap'); }
      const widths = lines.map((el) => el.offsetWidth);   // all read at full size on one line
      let sa = 1;
      lines.forEach((el, i) => {
        let s = Math.min(1, avail / Math.max(1, widths[i]));
        const floor = el === anchor ? 0.8 : 0.6 * sa;
        if (s < floor) { s = floor; el.classList.add('warp-wrap'); }
        if (el === anchor) sa = s;
        el.style.setProperty('--warp-fit', s.toFixed(4));
      });
      if (final) {
        fitFinal(final, avail, 2,
          (s) => root.style.setProperty('--warp-final-fit', s.toFixed(4)),
          (ch) => root.style.setProperty('--warp-final-measure', ch + 'ch'),
          () => Math.round(final.offsetHeight / ((parseFloat(getComputedStyle(final).fontSize) || 40) * 0.9)));
      }
    }
    // the lines a block of text sets in, from its line boxes (works on the plain text of the finished
    // composition as well as on split letters)
    function lineCount(el) {
      const fs = parseFloat(getComputedStyle(el).fontSize) || 40;
      const r = document.createRange();
      r.selectNodeContents(el);
      const tops = [...r.getClientRects()].filter((b) => b.width > 1 && b.height > 1).map((b) => b.top).sort((a, b) => a - b);
      let n = 0, last = -Infinity;
      for (const t of tops) if (t - last > fs * 0.5) { n++; last = t; }
      return n;
    }

    // A plate is as wide as its longest balanced line (a block would keep the full measure and leave a
    // ragged empty end on the plate).
    function sizePlates() {
      for (const li of points) {
        const plate = li.querySelector(':scope > .warp-plate');
        if (!plate) continue;
        plate.style.width = '';
        const words = plate.querySelectorAll('.warp-w');
        if (!words.length) continue;
        const cs = getComputedStyle(plate);
        let l = Infinity, r = 0;
        for (const w of words) { l = Math.min(l, w.offsetLeft); r = Math.max(r, w.offsetLeft + w.offsetWidth); }
        plate.style.width = Math.ceil(r - l + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 1) + 'px';
      }
    }

    // The principles' pass-by: each drifts outward along its ray and grows, as if the camera flew
    // between them. Start and end offsets as fractions of the stage width, and the scales.
    const DRIFT = { from: -0.015, to: 0.06, s0: 0.9, s1: 1.25 };
    const DRIFT_PHONE = { from: 0, to: 0, s0: 0.96, s1: 1.06 };
    // An upright stage (a phone, a tablet held upright) has no room for a ring of plates: they stand in
    // a centred column instead
    let column = false;
    const drift = () => (column ? DRIFT_PHONE : DRIFT);
    function placePoints() {
      pos.length = 0;
      const m = phone ? 16 : 24;
      const reserve = countEl && o.count ? (phone ? 48 : 64) : 0;
      if (!column) {
        // each beat's principles (four at most) on an ellipse around the void, placed so that the end of
        // the drift (outward, at the larger scale) still lies inside the stage
        const rx = 0.3 * W, ry = 0.27 * H, cx = W / 2, cy = H / 2, D = DRIFT.to * W, S = DRIFT.s1;
        for (const g of plan.pointGroups) {
          const n = g.length;
          g.forEach((li, j) => {
            const i = points.indexOf(li);
            const deg = -66 + (j * 360) / n + (j % 2 ? 64 / n : 0);
            const a = (deg * Math.PI) / 180;
            const w = li.offsetWidth, h = li.offsetHeight;
            const dx = rx * Math.cos(a), dy = ry * Math.sin(a), len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len;
            const ex = clamp(cx + dx + D * ux, m + (w * S) / 2, W - m - (w * S) / 2);
            const ey = clamp(cy + dy + D * uy, m + (h * S) / 2, H - m - (h * S) / 2 - reserve);
            pos[i] = { x: ex - D * ux, y: ey - D * uy, w, h, ux, uy };
          });
        }
        return;
      }
      const gap = 14;
      for (const g of plan.pointGroups) {
        const hs = g.map((li) => li.offsetHeight);
        let y = H / 2 - (hs.reduce((a, b) => a + b, 0) + gap * (g.length - 1)) / 2;
        g.forEach((li, j) => {
          const i = points.indexOf(li);
          pos[i] = { x: W / 2, y: y + hs[j] / 2, w: li.offsetWidth, h: hs[j], ux: 0, uy: 0 };
          y += hs[j] + gap;
        });
      }
    }

    // Every group becomes a flat list of animated items (letters, plates, the lead's plate), each with
    // its vector from the vanishing point, and typed arrays for the animator (allocated here, once a
    // layout, never in a frame).
    function measureChars() {
      const vx = W / 2, vy = H / 2;
      const item = (el, twin, kind, base) => {
        if (kind !== 'c') return { el, twin: null, kind, x: 0, y: 0 };
        const q = base(el);
        return { el, twin, kind, x: q.x + el.offsetWidth / 2 - vx, y: q.y + el.offsetHeight / 2 - vy };
      };
      for (const [, g] of plan.groups) {
        if (g.list) stopGroup(g);
        const items = [];
        g.runs = [];   // [from, to) index ranges of letters that stagger together
        g.vis = [];
        if (g.kind === 'points') {
          g.plates = [];
          for (const li of g.items) {
            const i = points.indexOf(li), plate = li.querySelector('.warp-plate'), p = pos[i] || { x: vx, y: vy, w: 0, h: 0 };
            const base = (c) => { const q = posIn(c, li); return { x: q.x + p.x - p.w / 2, y: q.y + p.y - p.h / 2 }; };
            g.plates.push(items.length);
            // (a plate leaves outward along its own ray: its unit vector from the vanishing point)
            items.push(Object.assign(item(plate, null, 'p'), { ux: p.ux || 0, uy: p.uy || 0 }));
            const from = items.length;
            // the principles' words travel whole (a plate's few words, not every letter, each its own layer)
            for (const c of plate.querySelectorAll('.warp-w')) items.push(item(c, null, 'c', base));
            g.runs.push([from, items.length]);
            const v = visOf(plate); if (v) g.vis.push(v);
          }
        } else {
          const base = (c) => posIn(c, stage);
          if (g.kind === 'lead') items.push(item(g.el, null, 'l'));
          const from = items.length;
          const twins = g.kind === 'final' ? charsOf(inkFinal) : [];
          charsOf(g.el).forEach((c, i) => items.push(item(c, twins[i] || null, 'c', base)));
          g.runs.push([from, items.length]);
          const v = visOf(g.el); if (v) g.vis.push(v);
          if (g.kind === 'final' && inkFinal) { const vi = visOf(inkFinal); if (vi) g.vis.push(vi); }
        }
        const m = items.length;
        g.list = items;
        g.cur = new Float32Array(m * 4);
        g.from = new Float32Array(m * 4);
        g.to = new Float32Array(m * 4);
        g.delay = new Float32Array(m);
        g.dur = new Float32Array(m);
        g.durO = new Float32Array(m);
        g.eT = new Uint8Array(m);
        g.eO = new Uint8Array(m);
        g.done = new Uint8Array(m);
        g.anims = new Array(m).fill(null);
        // every item written to the rest of its group's state, so the record and the page agree
        for (let i = 0; i < m; i++) {
          const it = items[i], op = it.kind === 'c' || g.on ? 1 : 0;
          it.el.style.transform = ''; it.el.style.opacity = op ? '' : '0';
          if (it.twin) { it.twin.style.transform = ''; it.twin.style.opacity = ''; }
          g.cur[i * 4 + 2] = 1; g.cur[i * 4 + 3] = op;
        }
        showVis(g, g.on);
      }
    }

    function layout() {
      if (!live) return;
      settleText();
      W = stage.clientWidth || window.innerWidth;
      H = stage.clientHeight || window.innerHeight;
      column = phone || W < H;
      root.classList.toggle('warp-column', column);
      fit();
      sizePlates();
      placePoints();
      measureChars();
      readColours();
      resLevel = level;
      sizeField();
      // the mouth holds the widest line and the tallest block of any statement beat and of the final
      // line at its pushed-in scale
      const box = textBox();
      field.mouthFor(Math.min(box.w, W), box.h, Math.min(W, H) * 0.035);
      // an upright stage: the mouth of the principles is the tallest column of plates at its largest
      if (column && plan.pointGroups.length) {
        const cb = columnBox();
        field.columnFor(Math.min(cb.w, W), cb.h, Math.min(W, H) * 0.035);
      } else { field.colA = field.colB = 0; }
      // the final line's box on the stage (the ink copy sits in the same place in the exit layer, which is
      // out of the render tree until the jump, so it is measured on the white line)
      if (final) { const q = posIn(final, stage); inkBox = { x: q.x, y: q.y, w: final.offsetWidth, h: final.offsetHeight }; }
      if (exitEl) { inkClip = ''; if (o.exit === 'disc') disc(field.p); }
      quiet(300);
    }
    // the ink extent of the statement lines and the final line (the line boxes, not the full measure)
    function textBox() {
      let w = 0, h = 0;
      const lines = [anchor, ...tails].filter(Boolean);
      const lh = (el) => el.offsetHeight;
      const wide = (el) => { let l = Infinity, r = -Infinity; for (const x of el.querySelectorAll('.warp-w')) { l = Math.min(l, x.offsetLeft); r = Math.max(r, x.offsetLeft + x.offsetWidth); } return r > l ? r - l : el.offsetWidth; };
      const aw = anchor ? wide(anchor) : 0, ah = anchor ? lh(anchor) : 0;
      for (const t of tails) { w = Math.max(w, aw, wide(t)); h = Math.max(h, ah + lh(t)); }
      if (!tails.length && anchor) { w = aw; h = ah; }
      if (final) { const s = final.querySelectorAll('.warp-w').length ? 1.06 : 1; w = Math.max(w, wide(final) * s); h = Math.max(h, final.offsetHeight * s); }
      if (lead && !lines.length && !final) { w = lead.offsetWidth; h = lead.offsetHeight; }
      return { w: Math.max(w, W * 0.2), h: Math.max(h, 40) };
    }
    // the principles' column on an upright stage: its widest plate and its tallest beat, at the end of
    // the drift's growth (the gap is placePoints' 14px)
    function columnBox() {
      let w = 0, h = 0;
      const s = DRIFT_PHONE.s1;
      for (const g of plan.pointGroups) {
        let gh = 0;
        for (const li of g) { w = Math.max(w, li.offsetWidth); gh += li.offsetHeight; }
        h = Math.max(h, gh + 14 * (g.length - 1));
      }
      return { w: w * s, h: h * s };
    }

    // ---------- quality: step down when frames drop, back up after a long clean stretch ----------

    // The streaks are drawn at the CSS pixel (DPR capped at 1.5; phones at 1). A machine that keeps
    // dropping frames steps down: fewer rays at once, and a coarser canvas only at a rest point (the
    // reader has stopped scrolling and no letters are moving), because reallocating the canvas costs a
    // frame. After about 120 counted frames that keep up with the display it steps back up; each step
    // up that has to be taken back doubles the stretch the next one needs. Frames within 300ms of a beat
    // change, a resize or the first drawn frame are not counted (a beat change is a known, short cost).
    let level = 0, resLevel = 0;
    const LEVELS = [{ res: 1, rays: 1 }, { res: 1, rays: 0.8 }, { res: 0.75, rays: 0.6 }];
    // the shortest gap between two drawings of the field, per level (ms): every frame up to 100Hz (every
    // other frame above), then about 50 and 40 a second
    const DRAW_GAP = [10, 19, 24];
    const Q = { n: 0, sum: 0, slow: 0, un: 0, usum: 0, uslow: 0, need: 120, last: 0, quietUntil: 0, vs: 16.7, vsMin: 1e9, vsN: 0, moved: 0 };
    function quiet(ms) {
      Q.quietUntil = Math.max(Q.quietUntil, performance.now() + ms);
      Q.n = Q.sum = Q.slow = 0;
      Q.un = Q.usum = Q.uslow = 0;
    }
    function setLevel(l, dir) {
      if (dir < 0 && Q.last > 0) Q.need = Math.min(960, Q.need * 2);
      Q.last = dir;
      level = l;
      field.N = rayCount();
      Q.n = Q.sum = Q.slow = 0;
      Q.un = Q.usum = Q.uslow = 0;
    }
    function quality(now, dt) {
      // the display's frame interval: the shortest frame of the last 120
      if (dt > 4) Q.vsMin = Math.min(Q.vsMin, dt);
      if (++Q.vsN >= 120) { Q.vs = clamp(Q.vsMin, 5, 34); Q.vsMin = 1e9; Q.vsN = 0; }
      if (now < Q.quietUntil) return;
      Q.n++; Q.sum += dt; if (dt > 34) Q.slow++;
      if (Q.n >= 30) {
        if (level < LEVELS.length - 1 && (Q.sum / Q.n > (phone ? 24 : 22) || Q.slow >= 6)) { setLevel(level + 1, -1); return; }
        Q.n = Q.sum = Q.slow = 0;
      }
      if (level > 0) {
        Q.un++; Q.usum += dt; if (dt > 34) Q.uslow++;
        if (Q.un >= Q.need) {
          if (Q.usum / Q.un < Math.max(12, Q.vs * 1.2) && Q.uslow <= 1) setLevel(level - 1, 1);
          Q.un = Q.usum = Q.uslow = 0;
        }
      }
    }
    function sizeField() {
      // (with WebGL a desktop canvas keeps its full resolution: filling it costs the GPU next to nothing,
      // and a coarser field would only blur the streaks and the disc's rim)
      const L = LEVELS[resLevel];
      const dpr = phone ? (resLevel >= 2 ? 0.75 : 1) : Math.min(1.5, window.devicePixelRatio || 1) * (field.gl ? 1 : L.res);
      field.size(W, H, dpr);
      field.aim(W / 2, H / 2);
    }
    function rayCount(width = W) {
      if (phone) return level || (navigator.deviceMemory && navigator.deviceMemory <= 2) ? 480 : 800;
      const n = width < 1024 ? Math.min(700, o.rays) : o.rays;
      return Math.round(n * LEVELS[level].rays);
    }

    // ---------- the timed text beats: one small animator, no tween per letter ----------

    // A beat change starts one transition per group. The scene keeps a small model of every item (its
    // start, end, delay, duration and ease) and hands each flight to the browser as a Web Animation of
    // transform and opacity, which runs on the compositor: a flying letter is its own layer for the
    // flight, so nothing is drawn again while letters cross the stage (redrawing the copy behind
    // letters in flight was most of the scene's per-frame cost), and nothing is written per frame. The
    // model only says when a flight is over, and where an interrupted one stands (a fling back mid-change
    // starts the new flight from there). Without Web Animations the same model writes the styles frame
    // by frame. The principles' letters travel word by word (a few dozen layers a beat, not a hundred).
    // A letter that has arrived carries no inline style and no animation; a group that has left is
    // hidden whole (its aria-hidden letters, never the screen reader text, which stays in the reading
    // order).
    const running = new Set();
    const each = () => (phone ? 0.012 : 0.016);
    const clock = () => performance.now() / 1000;
    const WA = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
    // the same curves as EASES, for the browser
    const CSS_E = ['cubic-bezier(0.16, 1, 0.3, 1)', 'cubic-bezier(0.32, 0, 0.67, 0)', 'cubic-bezier(0.11, 0, 0.5, 0)', 'cubic-bezier(0.5, 1, 0.89, 1)', 'linear'];
    // (letters and plates move and scale; the lead only scales)
    const tfOf = (it, x, y, s) => (it.kind === 'c'
      ? 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')'
      : it.kind === 'p' ? 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')'
        : 'scale(' + s.toFixed(4) + ')');

    function stopItem(g, i) {
      const a = g.anims && g.anims[i];
      if (!a) return;
      for (const x of a) x.cancel();
      g.anims[i] = null;
    }
    function stopGroup(g) { if (g.anims) for (let i = 0; i < g.anims.length; i++) stopItem(g, i); }
    // one item's flight from its model start to its model end, as Web Animations
    function launch(g, i) {
      stopItem(g, i);
      const it = g.list[i], k = i * 4, F = g.from, T = g.to, d = g.delay[i] * 1000, a = [];
      const tf = [tfOf(it, F[k], F[k + 1], F[k + 2]), tfOf(it, T[k], T[k + 1], T[k + 2])], op = [F[k + 3], T[k + 3]];
      const one = g.dur[i] === g.durO[i] && g.eT[i] === g.eO[i];
      for (const el of it.twin ? [it.el, it.twin] : [it.el]) {
        if (one) a.push(el.animate({ transform: tf, opacity: op }, { duration: g.dur[i] * 1000, delay: d, easing: CSS_E[g.eT[i]], fill: 'both' }));
        else {
          a.push(el.animate({ transform: tf }, { duration: g.dur[i] * 1000, delay: d, easing: CSS_E[g.eT[i]], fill: 'both' }));
          a.push(el.animate({ opacity: op }, { duration: g.durO[i] * 1000, delay: d, easing: CSS_E[g.eO[i]], fill: 'both' }));
        }
      }
      g.anims[i] = a;
    }
    // where every item of a group in flight stands now, by the model (into g.cur, nothing written)
    function sample(g, now) {
      const F = g.from, T = g.to, c = g.cur;
      for (let i = 0; i < g.list.length; i++) {
        if (g.done[i]) continue;
        const lt = Math.max(0, now - g.t0 - g.delay[i]), k = i * 4;
        const eT = EASES[g.eT[i]](Math.min(1, lt / g.dur[i])), eO = EASES[g.eO[i]](Math.min(1, lt / g.durO[i]));
        c[k] = F[k] + (T[k] - F[k]) * eT; c[k + 1] = F[k + 1] + (T[k + 1] - F[k + 1]) * eT;
        c[k + 2] = F[k + 2] + (T[k + 2] - F[k + 2]) * eT; c[k + 3] = F[k + 3] + (T[k + 3] - F[k + 3]) * eO;
      }
    }
    // an item's inline style straight to rest (shown) or hidden, whatever the record says
    function rest0(g, i, on) {
      const it = g.list[i], op = it.kind === 'c' || on ? '' : '0';
      it.el.style.transform = ''; it.el.style.opacity = op;
      if (it.twin) { it.twin.style.transform = ''; it.twin.style.opacity = op; }
      const k = i * 4; g.cur[k] = 0; g.cur[k + 1] = 0; g.cur[k + 2] = 1; g.cur[k + 3] = op ? 0 : 1;
    }

    function put(g, i, x, y, s, o) {
      const c = g.cur, k = i * 4;
      const tChanged = c[k] !== x || c[k + 1] !== y || c[k + 2] !== s, oChanged = c[k + 3] !== o;
      if (!tChanged && !oChanged) return;
      const it = g.list[i];
      if (tChanged) {
        const tf = x === 0 && y === 0 && s === 1 ? '' : tfOf(it, x, y, s);
        it.el.style.transform = tf;
        if (it.twin) it.twin.style.transform = tf;
        c[k] = x; c[k + 1] = y; c[k + 2] = s;
      }
      if (oChanged) {
        const op = o >= 1 ? '' : o <= 0 ? '0' : o.toFixed(3);
        it.el.style.opacity = op;
        if (it.twin) it.twin.style.opacity = op;
        c[k + 3] = o;
      }
    }
    const showVis = (g, on) => {
      for (const v of g.vis || []) v.style.visibility = on ? '' : 'hidden';
      // the scrubbed blocks of the group on the stage (see .warp-moving in the CSS)
      if (g.kind === 'points') for (const li of g.items) li.classList.toggle('warp-on', on);
      else if (g.kind === 'final') g.el.classList.toggle('warp-on', on);
    };

    // a group straight to its rest, in or out (a refresh, a load mid-scene, a fling's settle)
    function setGroup(g, on) {
      running.delete(g);
      g.on = on;
      if (!g.list) return;
      if (WA) { stopGroup(g); for (let i = 0; i < g.list.length; i++) rest0(g, i, on); }
      else for (let i = 0; i < g.list.length; i++) put(g, i, 0, 0, 1, g.list[i].kind === 'c' || on ? 1 : 0);
      showVis(g, on);
    }
    function settleText() {
      for (const g of [...running]) setGroup(g, g.on);
    }

    // stagger delays of one run of letters: 'center' (in) or 'edges' (out)
    function stagger(g, from, to, base, step, edges) {
      const n = to - from, mid = (n - 1) / 2;
      for (let i = from; i < to; i++) {
        const dist = Math.abs(i - from - mid);
        g.delay[i] = base + (edges ? mid - dist : dist) * step;
      }
    }
    function setItem(g, i, delay, dur, durO, eT, eO, tx, ty, ts, to) {
      const k = i * 4, c = g.cur, F = g.from, T = g.to;
      if (delay !== null) g.delay[i] = delay;
      g.dur[i] = dur; g.durO[i] = durO; g.eT[i] = eT; g.eO[i] = eO;
      F[k] = c[k]; F[k + 1] = c[k + 1]; F[k + 2] = c[k + 2]; F[k + 3] = c[k + 3];
      T[k] = tx; T[k + 1] = ty; T[k + 2] = ts; T[k + 3] = to;
      g.done[i] = 0;
    }

    function enterGroup(g, delay) {
      if (!g.list) return;
      g.on = true;
      g.out = false;
      const L = g.list;
      // the letters arrive out of the vanishing point: every item first jumps to its start (unseen; with
      // Web Animations the start is only the model's, and the style stays at rest under the animation)
      if (WA) stopGroup(g);
      for (let i = 0; i < L.length; i++) {
        const it = L[i], k = i * 4;
        const x = it.kind === 'c' ? -it.x * 0.45 : 0, y = it.kind === 'c' ? -it.y * 0.45 : 0;
        const s = it.kind === 'c' ? (g.kind === 'points' ? 0.6 : 0.35) : it.kind === 'p' ? 0.9 : 1;
        if (WA) { rest0(g, i, true); g.cur[k] = x; g.cur[k + 1] = y; g.cur[k + 2] = s; g.cur[k + 3] = 0; }
        else put(g, i, x, y, s, 0);
      }
      if (g.kind === 'points') {
        // one after another, but the whole beat settles within about 0.9s
        const n = g.plates.length, gap = n > 1 ? Math.min(0.09, 0.3 / (n - 1)) : 0;
        g.plates.forEach((pi, j) => {
          const d = delay + j * gap;
          setItem(g, pi, d, 0.4, 0.4, E_P2_OUT, E_P2_OUT, 0, 0, 1, 1);
          const [a, b] = g.runs[j];
          const step = Math.min(each(), 0.1 / Math.max(1, (b - a) / 2));
          stagger(g, a, b, d, step, false);
          for (let i = a; i < b; i++) setItem(g, i, null, 0.6, 0.6, E_EXPO_OUT, E_EXPO_OUT, 0, 0, 1, 1);
        });
      } else {
        if (g.kind === 'lead') setItem(g, 0, delay, 0.3, 0.3, E_P2_OUT, E_P2_OUT, 0, 0, 1, 1);
        const [a, b] = g.runs[0];
        const step = Math.min(each(), 0.3 / Math.max(1, (b - a) / 2));
        stagger(g, a, b, delay, step, false);
        for (let i = a; i < b; i++) setItem(g, i, null, 0.6, 0.6, E_EXPO_OUT, E_EXPO_OUT, 0, 0, 1, 1);
      }
      showVis(g, true);
      g.t0 = clock();
      if (WA) for (let i = 0; i < L.length; i++) launch(g, i);
      running.add(g);
    }
    function exitGroup(g) {
      if (!g.list) return;
      const now = clock();
      // an interrupted flight leaves from where it stands
      if (WA && running.has(g)) sample(g, now);
      g.on = false;
      g.out = true;
      const L = g.list;
      if (g.kind === 'points') {
        // the plates fall away past the camera, each outward along its own ray, so they part from each
        // other as they fade and never grow into a neighbour (a column only fades); their letters ride
        // on them
        const D = column ? 0 : 0.05 * W, S = column ? 1.02 : 1.06;
        for (let i = 0; i < L.length; i++) {
          if (L[i].kind === 'p') setItem(g, i, 0, 0.25, 0.25, E_P2_IN, E_P2_IN, L[i].ux * D, L[i].uy * D, S, 0);
          else g.done[i] = 1;
        }
      } else {
        if (g.kind === 'lead') setItem(g, 0, 0.05, 0.3, 0.3, E_LIN, E_LIN, 0, 0, 1, 0);
        const [a, b] = g.runs[0];
        stagger(g, a, b, 0, phone ? 0.006 : 0.008, true);
        // letters fly outward along their own ray, past the camera
        for (let i = a; i < b; i++) setItem(g, i, null, 0.32, 0.26, E_P3_IN, E_LIN, L[i].x * 0.6, L[i].y * 0.6, 2.4, 0);
      }
      g.t0 = now;
      if (WA) for (let i = 0; i < L.length; i++) if (!g.done[i]) launch(g, i);
      running.add(g);
    }
    function animate(now) {
      if (WA) {
        // the browser moves the items; the model only says when each flight is over
        for (const g of running) {
          let left = 0;
          for (let i = 0; i < g.list.length; i++) {
            if (g.done[i]) continue;
            if (now - g.t0 - g.delay[i] >= Math.max(g.dur[i], g.durO[i]) + 0.02) {
              const k = i * 4; g.done[i] = 1;
              g.cur[k] = g.to[k]; g.cur[k + 1] = g.to[k + 1]; g.cur[k + 2] = g.to[k + 2]; g.cur[k + 3] = g.to[k + 3];
            } else left++;
          }
          // a group that has arrived drops its animations (its styles are at rest); one that has left
          // is hidden whole
          if (!left) { running.delete(g); setGroup(g, !g.out); }
        }
        return;
      }
      for (const g of running) {
        const F = g.from, T = g.to, m = g.list.length;
        let left = 0;
        for (let i = 0; i < m; i++) {
          if (g.done[i]) continue;
          const lt = now - g.t0 - g.delay[i];
          if (lt < 0) { left++; continue; }
          const tT = Math.min(1, lt / g.dur[i]), tO = Math.min(1, lt / g.durO[i]);
          const eT = EASES[g.eT[i]](tT), eO = EASES[g.eO[i]](tO), k = i * 4;
          if (tT >= 1 && tO >= 1) { put(g, i, T[k], T[k + 1], T[k + 2], T[k + 3]); g.done[i] = 1; continue; }
          put(g, i, F[k] + (T[k] - F[k]) * eT, F[k + 1] + (T[k + 1] - F[k + 1]) * eT, F[k + 2] + (T[k + 2] - F[k + 2]) * eT, F[k + 3] + (T[k + 3] - F[k + 3]) * eO);
          left++;
        }
        // a group that has left is hidden whole, and its letters drop their styles
        if (!left) { running.delete(g); if (g.out) setGroup(g, false); }
      }
    }

    function showCount() {
      if (!countText) return;
      const b = cur === null ? null : plan.beats[cur];
      if (!b || !b.n) { countText.style.visibility = 'hidden'; return; }
      countText.style.visibility = '';
      countText.textContent = b.n + ' of ' + plan.total;
    }

    function go(k, instant) {
      const want = new Set(plan.beats[k].keys);
      const had = new Set(cur === null ? [] : plan.beats[cur].keys);
      if (instant) {
        for (const [key, g] of plan.groups) setGroup(g, want.has(key));
      } else {
        let leaving = false;
        for (const key of had) if (!want.has(key)) { exitGroup(plan.groups.get(key)); leaving = true; }
        // the next words arrive only once the leaving ones are gone (0.32s out): two beats never share
        // pixels, even for the length of a swap
        for (const key of want) if (!had.has(key)) enterGroup(plan.groups.get(key), leaving ? 0.3 : 0);
        // a fling that skipped beats: anything else still showing leaves too
        for (const [key, g] of plan.groups) if (g.on && !want.has(key)) exitGroup(g);
        // a surge of speed with every change of beat, halving every 0.3s
        field.kick += 0.8;
        quiet(300);
      }
      cur = k;
      showCount();
    }
    // exit 'flood': the ink copy of the final line shows outside the iris, the accent's inner edge as the
    // field drew it this frame (scaled on screen by the canvas's lurch), so the letters turn to the exit
    // ink exactly where the accent reaches them
    function floodInk() {
      if (!inkFinal || !inkBox) return;
      const A0 = field.irisA, B0 = field.irisB, b = inkBox, m = b.h * 0.3;
      let clip = 'circle(0px at 0px 0px)';
      if (A0 < 1e5) {
        const t = clamp((field.p - JUMP) / 0.14, 0, 1), lurch = 1 + (phone ? 0.08 : 0.12) * t * t;
        const s = (window.gsap && gsap.getProperty(inkFinal, 'scale')) || 1, ox = b.w / 2, oy = b.h / 2;
        const vx = ox + (W / 2 - b.x - ox) / s, vy = oy + (H / 2 - b.y - oy) / s;
        const a = (A0 * lurch) / s, e = (B0 * lurch) / s;
        const inE = (x, y) => ((x - vx) / a) ** 2 + ((y - vy) / e) ** 2 <= 1;
        if (a < 1 || e < 1) clip = 'none';
        else if (!(inE(-m, -m) && inE(b.w + m, -m) && inE(-m, b.h + m) && inE(b.w + m, b.h + m))) {
          const n = (v) => v.toFixed(2);
          clip = 'path(evenodd, "M' + n(-m) + ' ' + n(-m) + 'H' + n(b.w + m) + 'V' + n(b.h + m) + 'H' + n(-m) + 'Z M' + n(vx - a) + ' ' + n(vy) +
            'a' + n(a) + ' ' + n(e) + ' 0 1 0 ' + n(2 * a) + ' 0a' + n(a) + ' ' + n(e) + ' 0 1 0 ' + n(-2 * a) + ' 0Z")';
        }
      }
      if (clip !== inkClip) { inkClip = clip; inkFinal.style.clipPath = clip; }
    }
    const beatAt = (p) => { let k = 0; const b = plan.beats; for (let i = 0; i < b.length; i++) if (p >= b[i].start) k = i; return k; };
    function check(p) {
      let k = beatAt(p);
      if (cur !== null && k !== cur) {
        k = k > cur ? beatAt(p - 0.004) : beatAt(p + 0.004);
        if (k === cur) return;
      }
      if (k !== cur) go(k, cur === null || performance.now() < instantUntil);
    }

    // ---------- the frame: playhead, beats, letters, then the field (only near the screen) ----------

    let playhead = null, exitOn = null, wasDrawing = false, wasMoving = false, lastDraw = 0;
    const drawing = () => live && visible && !document.hidden && (field.p <= 0.985 || o.exit === 'release');
    function tick(time, deltaTime) {
      if (!live) return;
      // Read the playhead every frame: ScrollTrigger re-seats it on refresh with its events suppressed,
      // and beats are changed here, never inside a refresh (which would put their styles back).
      if (playhead) { const t = clamp(playhead.time(), 0, 1); if (t !== field.p) onP(t); }
      check(field.p);
      const now = performance.now();
      if (running.size) animate(now / 1000);
      // the scrubbed text rides on layers while the playhead moves (see the CSS), and is drawn crisp again
      // once it has stood still for a moment
      const moving = now - Q.moved < 180;
      if (moving !== wasMoving) { wasMoving = moving; root.classList.toggle('warp-moving', moving); }
      const on = drawing();
      if (on !== wasDrawing) { wasDrawing = on; if (on) quiet(300); }
      if (!on) return;
      quality(now, deltaTime);
      // a coarser (or finer) canvas waits for a rest point, and is drawn in the same frame
      if (resLevel !== level && now - Q.moved > 250 && !running.size) { resLevel = level; sizeField(); lastDraw = 0; quiet(300); }
      // On a fast display (120Hz and up) the field is drawn every other frame, 60 to 72 new pictures a
      // second: the streaks read the same, and the GPU hands the page half as many fresh canvases (a new
      // canvas on every 7ms frame was what still dropped frames on a busy machine). Scrolling, the type
      // and the lurch still move on every frame.
      // A machine that has stepped down also draws the field less often (about 50, then 40 pictures a
      // second): the page keeps scrolling on every frame while the GPU gets room to breathe.
      const since = now - lastDraw;
      if (lastDraw && since >= 0 && since < DRAW_GAP[level]) return;
      field.step(Math.min(0.05, (lastDraw && since > 0 ? since : deltaTime) / 1000));
      lastDraw = now;
      // the ink copy follows the accent exactly as this frame drew it
      if (o.exit === 'disc' && exitEl) discInk();
      else if (o.exit === 'flood') floodInk();
    }
    if (window.gsap) gsap.ticker.add(tick);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; }, { rootMargin: '100px 0px' }).observe(root);
    } else visible = true;

    function onP(p) {
      const prev = field.p;
      field.p = p;
      // (the last crawl of the scrub's catch-up, under half a pixel of scroll a frame, counts as stopped)
      if (Math.abs(p - prev) > 0.0001) Q.moved = performance.now();
      if (isPhoto && prev < 0.08 && p >= 0.08) field.kick += 1.2;
      // the exit layer stays out of the render tree until the jump: a full-screen layer, even clipped
      // to nothing, costs compositing on every scrolled frame
      if (exitEl) { const on = p >= JUMP - 0.01; if (on !== exitOn) { exitOn = on; exitEl.style.display = on ? 'block' : 'none'; } }
      if (o.exit === 'disc' && exitEl) disc(p);
      if (o.exit === 'flood' && exitEl) {
        // the iris closes with the scroll; once it has, the flat accent layer holds the stage
        field.shut = ss(IRIS0, IRIS1, p);
        const full = p >= IRIS1;
        if (full !== fullOn) { fullOn = full; exitEl.classList.toggle('is-full', full); }
      }
    }

    // The exit disc. The accent disc itself is drawn by the field, on the canvas, so its growth costs
    // nothing on the page (a full-screen layer clipped to a growing circle had to be drawn again on every
    // frame of the jump). Over it, only the ink copy of the final line is clipped to the same circle, in
    // its own small box, so the letters turn to the exit ink exactly at the rim. The radius grows with
    // the square of time (the fall accelerates) and covers the stage at 0.98, where the flat accent
    // layer takes over and the canvas stops.
    let fullOn = null, inkClip = '';
    function disc(p) {
      const t = clamp((p - JUMP) / 0.14, 0, 1), e = t * t, lurch = 1 + (phone ? 0.08 : 0.12) * e;
      const r = e * (Math.hypot(W / 2, H / 2) + 4);   // on screen
      field.disc = r / lurch;                           // in the canvas, which is scaled by the lurch
      field.cover = Math.max(0, field.disc - 8);
      const full = t >= 1;
      if (full !== fullOn) { fullOn = full; exitEl.classList.toggle('is-full', full); }
      // past the drawing (a reload or a fling to the end) the copy is simply whole
      if (full || !drawing()) discInk();
    }
    // the ink copy clipped to the disc as the canvas shows it now: the radius the field last drew, times
    // the canvas's lurch at this moment, in the copy's own box (which is scaled about its centre)
    function discInk() {
      if (!inkFinal || !inkBox) return;
      const t = clamp((field.p - JUMP) / 0.14, 0, 1), lurch = 1 + (phone ? 0.08 : 0.12) * t * t;
      const r = field.disc * lurch, full = fullOn || !drawing();
      const s = (window.gsap && gsap.getProperty(inkFinal, 'scale')) || 1, b = inkBox;
      const ox = b.w / 2, oy = b.h / 2;
      const vx = ox + (W / 2 - b.x - ox) / s, vy = oy + (H / 2 - b.y - oy) / s, rl = r / s;
      const far = Math.hypot(Math.max(vx, b.w - vx), Math.max(vy, b.h - vy)) + b.h * 0.3;
      const clip = full || rl > far ? 'none' : 'circle(' + rl.toFixed(2) + 'px at ' + vx.toFixed(2) + 'px ' + vy.toFixed(2) + 'px)';
      if (clip !== inkClip) { inkClip = clip; inkFinal.style.clipPath = clip; }
    }

    // ---------- the finished composition: the field drawn once, still, behind the statement ----------

    function restDraw() {
      if (live || !canvas.getContext) return;
      // the final line's panel: two lines at most, in a wider measure first, then a smaller size
      if (final && o.exit !== 'release') {
        fitFinal(final, (final.clientWidth || window.innerWidth) * 0.9, 2,
          (s) => final.style.setProperty('--warp-rest-fit', s.toFixed(4)),
          (ch) => final.style.setProperty('--warp-rest-measure', ch + 'ch'),
          () => lineCount(final));
      }
      root.classList.add('warp-drawn');
      readColours();
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      field.N = rayCount(w);
      field.wScale = phone ? 0.85 : 1;
      field.size(w, h, phone ? 1 : Math.min(1.5, window.devicePixelRatio || 1));
      const cr = canvas.getBoundingClientRect();
      const sr = (statement || final || canvas).getBoundingClientRect();
      const cx = clamp(sr.left + sr.width / 2 - cr.left, 0, w);
      const cy = clamp(sr.top + sr.height / 2 - cr.top, h * 0.2, h * 0.6);
      field.aim(cx, cy);
      field.dim = 1; field.open = 1; field.col = 0;
      // the mouth around the statement's ink (the block is a centred measure wider than its lines)
      let l = Infinity, r = -Infinity;
      for (const el of [anchor, ...tails, ...(statement ? [] : [final])].filter(Boolean)) {
        const rg = document.createRange(); rg.selectNodeContents(el);
        const b = rg.getBoundingClientRect();
        if (b.width) { l = Math.min(l, b.left); r = Math.max(r, b.right); }
      }
      field.mouthFor(Math.min(r > l ? r - l : sr.width, w), sr.height, Math.min(w, h) * 0.035);
      field.travel = 0.37;
      field.still(0.75);
    }
    let restRaf = 0;
    const restLater = () => { cancelAnimationFrame(restRaf); restRaf = requestAnimationFrame(restDraw); };

    // resize: the canvas follows the stage at once (no stretched frame); measures redo on refresh
    let lastW = 0, lastH = 0;
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        if (!live) { restLater(); return; }
        const w = stage.clientWidth, h = stage.clientHeight;
        if (Stage.touch && w === lastW && Math.abs(h - lastH) < 120) return; // the phone's URL bar
        lastW = w; lastH = h;
        W = w; H = h;
        resLevel = level;
        sizeField();
        quiet(300);
      }).observe(stage);
    }
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', () => { if (live && window.ScrollTrigger) ScrollTrigger.refresh(); else restLater(); });
    }
    if (window.ScrollTrigger) {
      ScrollTrigger.addEventListener('refreshInit', () => { if (live) layout(); });
      ScrollTrigger.addEventListener('refresh', () => { if (live) instantUntil = Math.max(instantUntil, performance.now() + 250); });
    }

    // ---------- the scrubbed timeline ----------

    function build(tl, ctx) {
      live = true;
      phone = ctx.phone;
      root.classList.remove('warp-drawn');
      ensureSplit();
      clearText();
      plan = makePlan(phone);
      field.wScale = phone ? 0.85 : 1;
      W = stage.clientWidth || window.innerWidth;
      H = stage.clientHeight || window.innerHeight;
      lastW = W; lastH = H;
      field.N = rayCount();
      field.dim = 1; field.open = 1; field.shut = 0; field.col = 0;
      layout();
      if (photoImg && photoImg.decode) photoImg.decode().catch(() => {});

      // The playhead itself drives the field and the beats. (A driver fromTo would also call its
      // onUpdate from the start values it re-applies on every refresh, and report 0 mid-scene.)
      tl.to({}, { duration: 1 }, 0);
      playhead = tl;
      tl.eventCallback('onUpdate', () => onP(clamp(tl.time(), 0, 1)));

      const ps = plan.pointGroups.length ? plan.at('points0').start : null;
      const fs = final ? plan.at('final').start : JUMP;
      const slot = plan.slot;

      // the principles' rest: the plates (ground at 0.9) carry the reading, so the field stays nearly at
      // full strength and the mouth closes to its core: the streaks rush in to the vanishing point
      // between the plates, as if the camera had gone deeper down the tunnel
      if (ps !== null) {
        // it closes once the statement has flown out, and is open again before the final line arrives
        // (with no final line the principles are the last beat, and the mouth stays shut to the end).
        // An upright stage keeps it open (open stays 1): there it takes the shape of the column of
        // plates as they arrive (col), and the final line's shape only once they have left, so the
        // column stands on the clean ground and no streak runs behind its words. Function values: a
        // tablet turned between upright and wide changes the layout on refresh.
        const back = (final ? fs : JUMP) - 0.04;
        const upright = () => (column ? 1 : 0);
        tl.fromTo(field, { dim: 1, open: 1 }, { dim: 0.88, open: upright, duration: 0.04 }, ps)
          .fromTo(field, { dim: 0.88, open: upright }, { dim: 1, open: () => (final || column ? 1 : 0), duration: 0.04, immediateRender: false }, back)
          .fromTo(field, { col: 0 }, { col: upright, duration: 0.04 }, ps);
        if (final) tl.fromTo(field, { col: upright }, { col: 0, duration: 0.03, immediateRender: false }, fs);
        // function values: a tablet turned between upright and wide changes the layout on refresh
        const dr = { get from() { return drift().from; }, get to() { return drift().to; } };
        plan.pointGroups.forEach((g, gi) => {
          const start = plan.at('points' + gi).start;
          g.forEach((li) => {
            const i = points.indexOf(li);
            tl.fromTo(li,
              { xPercent: -50, yPercent: -50, x: () => pos[i].x + dr.from * W * pos[i].ux, y: () => pos[i].y + dr.from * W * pos[i].uy, scale: () => drift().s0 },
              { xPercent: -50, yPercent: -50, x: () => pos[i].x + dr.to * W * pos[i].ux, y: () => pos[i].y + dr.to * W * pos[i].uy, scale: () => drift().s1, duration: slot },
              start);
          });
        });
      }
      // the final line pushes in while it is read; its ink copy moves with it
      if (final) tl.fromTo(inkFinal ? [final, inkFinal] : [final], { scale: 1 }, { scale: 1.06, duration: Math.min(slot, JUMP - fs) || 0.01 }, fs);

      // the photograph: a zoom blur made of three scaled copies over a picture that is already blurring
      // and darkening, then the field takes over
      if (isPhoto) {
        const to = [[0.35, 1.53], [0.25, 1.71], [0.15, 1.89]];
        zooms.forEach((z, i) => {
          tl.fromTo(z, { autoAlpha: 0 }, { autoAlpha: to[i][0], duration: 0.05 }, 0.04)
            .fromTo(z, { scale: 1 }, { scale: to[i][1], duration: 0.12 }, 0.04)
            .fromTo(z, { autoAlpha: to[i][0] }, { autoAlpha: 0, duration: 0.06, immediateRender: false }, 0.09);
        });
        tl.fromTo(photoImg, { filter: 'blur(0px) brightness(1)' }, { filter: 'blur(12px) brightness(0.4)', duration: 0.08 }, 0.03)
          .fromTo(photo, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.04 }, 0.12)
          .fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.08);
      }

      // the jump
      if (o.exit !== 'release') {
        if (countEl) tl.fromTo(countEl, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.03 }, JUMP);
        // the camera lurches forward (the disc itself is drawn by the field and the ink copy clipped to
        // it, frame by frame, in disc())
        // ('flood': the streaks thicken into an accent tunnel and the accent rises between them toward
        // the mouth, which keeps the white line on the dark ground; then the accent closes over the mouth
        // like an iris and the line turns to the exit ink at its edge: onP, the field and floodInk())
        tl.fromTo(canvas, { scale: 1 }, { scale: phone ? 1.08 : 1.12, duration: 0.14, ease: 'power1.in' }, JUMP);
      }

      // the text at the current progress, without entrances (a refresh or a load mid-scene)
      cur = null;
      exitOn = null;
      fullOn = null; inkClip = '';
      instantUntil = performance.now() + 900;
      onP(clamp(tl.time(), 0, 1));
      check(field.p);
      return tl;
    }

    // every inline style the beats wrote, gone (the finished composition, or a fresh build)
    function clearText() {
      running.clear();
      for (const g of plan.groups.values()) if (g.list) stopGroup(g);
      if (!splitDone) return;
      for (const c of $$('.warp-c, .warp-plate .warp-w')) { c.style.transform = ''; c.style.opacity = ''; }
      for (const v of $$('.warp-vis')) v.style.visibility = '';
      for (const p of $$('.warp-plate')) { p.style.transform = ''; p.style.opacity = ''; }
      if (lead) { lead.style.transform = ''; lead.style.opacity = ''; }
      for (const g of plan.groups.values()) { g.list = null; g.on = false; }
    }

    function rest(ctx) {
      live = false;
      playhead = null;
      exitOn = null;
      if (exitEl) { exitEl.style.removeProperty('display'); exitEl.classList.remove('is-full'); }
      if (inkFinal) inkFinal.style.removeProperty('clip-path');
      fullOn = null; inkClip = ''; field.disc = 0; field.cover = 0;
      wasMoving = false; root.classList.remove('warp-moving');
      phone = !!(ctx && ctx.phone);
      cur = null;
      field.shut = 0; field.open = 1; field.col = 0;
      clearText();
      if (splitDone) for (const pl of $$('.warp-plate')) pl.style.removeProperty('width');
      restLater();
    }

    return Stage.scene(root, {
      hold: holdDesk,
      scrub: o.scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : { hold: holdPhone, build },
      rest,
    });
  };
})();
