/*
  liquid-hover - the pointer pushes a photograph like the surface of water: wherever it moves, the
  picture is displaced along the pointer's direction with a wet shine and a hair of colour split, and
  the ripple diffuses and dies out within a second or two, back to the plain picture (the flow map is
  drained by a small dead zone each step, so an 8-bit residue never freezes a warp in the picture,
  and both flow buffers are cleared when the ripple is spent; decay and drain go by wall time, so a
  slow machine shows the same ripple for the same time). One WebGL context, mounted only while
  the frame is near the screen and freed when it leaves; the frame loop runs only while the ripple is
  alive. The photograph is shown plain on touch screens, under reduced motion, without WebGL and when
  the shader fails to compile.

    <figure class="frame frame--photo" data-moment="liquid-hover" data-moment-opts='{"strength": 0.7}'>
      <img src="…" alt="…" width="1800" height="1200">
    </figure>

  The host sets the size; the photograph fills it (cover). The picture must be readable by WebGL:
  same origin, or served with CORS and marked crossorigin="anonymous". It needs edges and detail (a
  coast, a building, a street): a flat sea or sky shows no ripple.
  opts: strength 0.1-1 (how far the picture is pushed, default 0.7), radius 0.05-0.3 (the brush,
        default 0.14), decay (how long a ripple lives, per 16.7 ms of wall time whatever the frame
        rate, 0.9-0.995, default 0.985: a ripple fades in a second or two).
*/
const VERT = 'attribute vec2 a_pos; varying vec2 v_uv; void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }';
// the flow map: a 2-channel vector field stored around 0.5 in 8 bits; each frame it diffuses, decays,
// loses a dead zone of 1.5 levels (so a stored value within a level of the centre drains to zero) and
// takes the pointer's velocity under a gaussian brush
const FLOW = `precision mediump float; varying vec2 v_uv;
uniform sampler2D u_prev; uniform vec2 u_pointer; uniform vec2 u_vel; uniform float u_decay; uniform float u_drain; uniform float u_radius; uniform vec2 u_texel; uniform float u_aspect;
void main() {
  vec4 c = texture2D(u_prev, v_uv);
  vec4 n = texture2D(u_prev, v_uv + vec2(u_texel.x, 0.0)) + texture2D(u_prev, v_uv - vec2(u_texel.x, 0.0)) + texture2D(u_prev, v_uv + vec2(0.0, u_texel.y)) + texture2D(u_prev, v_uv - vec2(0.0, u_texel.y));
  vec2 enc = mix(c.xy, n.xy * 0.25, 0.42);
  vec2 fl = (enc - 0.5) * 2.0 * u_decay;
  fl = sign(fl) * max(abs(fl) - vec2(u_drain), vec2(0.0));
  vec2 d = (v_uv - u_pointer) * vec2(u_aspect, 1.0);
  float g = exp(-dot(d, d) / (u_radius * u_radius));
  fl += u_vel * g;
  fl = clamp(fl, -1.0, 1.0);
  gl_FragColor = vec4(fl * 0.5 + 0.5, 0.0, 1.0);
}`;
// the picture, displaced by the flow (the same dead zone, so a resting map draws the plain picture),
// with a hair of colour split along the push and a wet shine: the slope of the flow's strength is
// lit from the upper left, so a ripple has a bright crest and a shaded trough like water does
const DRAW = `precision mediump float; varying vec2 v_uv;
uniform sampler2D u_img; uniform sampler2D u_flow; uniform vec2 u_cover; uniform float u_amp; uniform vec2 u_ftex;
vec2 flow(vec2 p) { vec2 f = (texture2D(u_flow, p).xy - 0.5) * 2.0; return sign(f) * max(abs(f) - vec2(1.5 / 255.0), vec2(0.0)); }
void main() {
  vec2 fl = flow(v_uv);
  float m = length(fl);
  float sx = length(flow(v_uv + vec2(u_ftex.x, 0.0))) - length(flow(v_uv - vec2(u_ftex.x, 0.0)));
  float sy = length(flow(v_uv + vec2(0.0, u_ftex.y))) - length(flow(v_uv - vec2(0.0, u_ftex.y)));
  float shine = clamp((sy - sx) * 2.5, -0.12, 0.28);
  vec2 uv = (v_uv - 0.5) * u_cover + 0.5;
  vec2 o = fl * u_amp;
  vec3 col;
  col.r = texture2D(u_img, uv - o * 1.01).r;
  col.g = texture2D(u_img, uv - o).g;
  col.b = texture2D(u_img, uv - o * 0.99).b;
  col += shine + smoothstep(0.03, 0.5, m) * 0.06;
  gl_FragColor = vec4(col, 1.0);
}`;
const FS = 128;

export default function (root, opts, lib) {
  const img = root.querySelector('img');
  if (!img) return {};
  root.classList.add('mo-lq');
  if (lib.reduced() || lib.coarse() || root.dataset.momentOff != null) return {};
  const amp = 0.2 * lib.clamp(+opts.strength || 0.7, 0.1, 1);
  const radius = lib.clamp(+opts.radius || 0.14, 0.05, 0.3);
  const decay = lib.clamp(+opts.decay || 0.985, 0.9, 0.995);
  let canvas = null, gl = null, progFlow = null, progDraw = null, tex = null, fbo = [], raf = 0, near = false, dead = false, energy = 0, ping = 0, freeTimer = 0, lastT = 0;
  const pt = { x: 0.5, y: 0.5, vx: 0, vy: 0, has: false };
  // the page's one count of live WebGL contexts (window.__tpGl, at most __tpGlMax or 4): refused, the photograph stays as it is
  const tpMax = () => window.__tpGlMax || 4;
  let held = false;
  const take = () => { const n = window.__tpGl || 0; if (n >= tpMax()) return false; window.__tpGl = n + 1; held = true; return true; };
  const give = () => { if (held) { window.__tpGl = Math.max(0, (window.__tpGl || 0) - 1); held = false; } };
  const fail = why => { give(); if (canvas) { try { gl?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* gone */ } canvas.remove(); } canvas = gl = null; fbo = []; root.dataset.momentFallback = why; dead = true; };

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader'); return s; };
  const program = frag => { const p = gl.createProgram(); gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag)); gl.bindAttribLocation(p, 0, 'a_pos'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link'); return p; };
  const target = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, FS, FS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { t, f };
  };
  // both flow buffers to the centre value: no flow anywhere
  const clear = () => {
    if (!gl) return;
    gl.clearColor(0.5, 0.5, 0, 1);
    for (const { f } of fbo) { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clear(gl.COLOR_BUFFER_BIT); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  const size = () => {
    const w = root.clientWidth, h = root.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const cap = Math.sqrt(1.2e6 / Math.max(1, w * h));          // about 1.2 megapixels at most
    const s = Math.min(dpr, cap);
    canvas.width = Math.max(2, Math.round(w * s)); canvas.height = Math.max(2, Math.round(h * s));
  };
  const mount = () => {
    if (dead || canvas || !img.naturalWidth) return;
    if (!take()) return;
    canvas = document.createElement('canvas');
    canvas.className = 'mo-lq__gl';
    canvas.setAttribute('aria-hidden', 'true');
    const attrs = { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' };
    gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    if (!gl) return fail('no-webgl');
    try {
      progFlow = program(FLOW); progDraw = program(DRAW);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (gl.getError() !== gl.NO_ERROR) throw new Error('texture');
      fbo = [target(), target()];
      clear();
    } catch (e) { console.warn('liquid-hover:', e.message); return fail('shader-error'); }
    size();
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); free(); }, { once: true });
    root.append(canvas);
    draw();
  };
  const free = () => { give(); if (!canvas) return; try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* gone */ } canvas.remove(); canvas = gl = null; fbo = []; if (raf) cancelAnimationFrame(raf); raf = 0; energy = 0; };
  const u = (p, n) => gl.getUniformLocation(p, n);
  const draw = () => {
    if (!gl) return;
    const ca = canvas.width / canvas.height, ia = img.naturalWidth / img.naturalHeight;
    // the decay and the drain are per 16.7 ms of wall time, not per frame, so a ripple lives about a
    // second on a slow machine too (a dropped frame decays as the frames it stood for, 6 at most)
    const now = performance.now(), frames = lastT ? Math.min(6, Math.max(0.25, (now - lastT) / 16.67)) : 1;
    lastT = now;
    const decayF = Math.pow(decay, frames), drain = Math.min(0.04, 1 / 255 * frames);
    // the flow step
    gl.useProgram(progFlow);
    gl.viewport(0, 0, FS, FS);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - ping].f);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbo[ping].t);
    gl.uniform1i(u(progFlow, 'u_prev'), 0);
    gl.uniform2f(u(progFlow, 'u_pointer'), pt.x, pt.y);
    gl.uniform2f(u(progFlow, 'u_vel'), pt.vx, pt.vy);
    gl.uniform1f(u(progFlow, 'u_decay'), decayF);
    gl.uniform1f(u(progFlow, 'u_drain'), drain);
    gl.uniform1f(u(progFlow, 'u_radius'), radius);
    gl.uniform2f(u(progFlow, 'u_texel'), 1 / FS, 1 / FS);
    gl.uniform1f(u(progFlow, 'u_aspect'), ca);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ping = 1 - ping;
    // the picture
    gl.useProgram(progDraw);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fbo[ping].t);
    gl.uniform1i(u(progDraw, 'u_img'), 0);
    gl.uniform1i(u(progDraw, 'u_flow'), 1);
    gl.uniform2f(u(progDraw, 'u_cover'), ia > ca ? ca / ia : 1, ia > ca ? 1 : ia / ca);
    gl.uniform1f(u(progDraw, 'u_amp'), amp);
    gl.uniform2f(u(progDraw, 'u_ftex'), 1 / FS, 1 / FS);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // the strongest flow the map can still hold: what this frame injected plus what was there, decayed
    // and drained exactly as the shader does it (diffusion only lowers it further), so the loop stops
    // only once the map is really empty. The pointer's push is spent over a few frames whatever the
    // frame rate, so a slow machine injects the same push in fewer, larger steps.
    energy = Math.min(1, Math.max(0, energy * decayF - drain) + Math.hypot(pt.vx, pt.vy));
    pt.vx *= 0.55; pt.vy *= 0.55;
  };
  const loop = () => {
    raf = 0;
    if (!gl || !near || document.hidden) return;
    draw();
    if (energy > 0) raf = requestAnimationFrame(loop);
    else { pt.vx = pt.vy = 0; clear(); draw(); energy = 0; lastT = 0; }   // the ripple spent: no flow, the plain picture
  };
  const wake = () => { if (!raf && gl && near) { if (!energy) lastT = 0; raf = requestAnimationFrame(loop); } };
  const move = e => {
    const r = root.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    if (pt.has) { pt.vx = lib.clamp(pt.vx + (x - pt.x) * 4.0, -1, 1); pt.vy = lib.clamp(pt.vy + (y - pt.y) * 4.0, -1, 1); }
    pt.x = x; pt.y = y; pt.has = true;
    wake();
  };
  const leave = () => { pt.has = false; };
  const io = new IntersectionObserver(es => {
    near = es[es.length - 1].isIntersecting;
    clearTimeout(freeTimer);
    if (near) { if (img.complete && img.naturalWidth) mount(); else img.addEventListener('load', mount, { once: true }); wake(); }
    else freeTimer = setTimeout(free, 4000);
  }, { rootMargin: '20% 0px' });
  io.observe(root);
  const ro = new ResizeObserver(() => { if (canvas) { size(); draw(); } });
  ro.observe(root);
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerleave', leave);
  const vis = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', vis);
  return { destroy() { io.disconnect(); ro.disconnect(); clearTimeout(freeTimer); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', vis); free(); } };
}
