/*
  scenes/lib.js - the helpers every big scene shares (taste-skill, references/scenes.md). One ES module, no
  dependencies, no GSAP: a scene is a function of the scroll position, drawn with transforms, opacity
  and clip-paths only. The page always scrolls natively: nothing captures the wheel, the scrollbar
  tells the truth, keyboard and trackpad work as everywhere else.

  scene(root, spec)     the held stage. root is the <section data-big-scene>; its first child (.sc__stage)
                        is the stage. While the scene fits (motion allowed, no reduced motion, the phone
                        plan allows it) root gets .is-live and --sc-hold: the section is (hold + 1) screens
                        tall, the stage sticks for `hold` screens, and spec.update(p, ctx) is called from a
                        requestAnimationFrame whenever the smoothed progress p (0 at the top of the hold,
                        1 at its end) changes. Otherwise root gets .is-rest and the CSS shows the finished
                        composition (spec.rest(ctx) is called so the scene clears its inline styles).
                        spec: hold (1; whole screens: the section is hold + 1 screens, so 1 keeps it at two and the page rhythm holds), phone ('rest' | { hold }: phones get the
                        finished composition or a light version, never the full scene; 'same' is for tests only), tau (seconds of smoothing, 0.07;
                        0 locks p to the scrollbar), minWidth, minHeight, start(ctx) once (return false to
                        rest), enter(ctx) on every move to live (after a resize across 768px or a
                        reduced-motion change the scene is rebuilt: split the text again here, since
                        rest() has put it back), measure(ctx) after enter, on resize and on ready(),
                        update(p, ctx), rest(ctx), destroy(ctx). ctx = { root, stage, q(sel), phone, vw, vh, p, hold, v }
                        (v: progress per second, signed, for scenes that read the pace).
                        Live, the stage carries data-edge-free (the layout check skips a held stage: it is one screen of a two-screen section and its pieces move);
                        at rest the attribute goes and the finished composition is checked like any section.
                        Returns { ctx, p, refresh(), at(p), destroy() }.
  ready()               fonts and the scenes' pictures decoded, then every live scene measured again.
  seg(p, a, b, e)       0 before a, 1 after b, eased between (linear without e): every frame is built from it.
  track(p, keys, e)     a value keyframed as [[p, v], ...].
  ease                  linear, in, out, inOut, in2, out2, out5, quint, expo, back, outBack, smooth(t), smoothstep(a, b, x)
  clamp, lerp, mix, damp
  split(el, { chars })  wraps the words of el in <span class="w"> (and the letters in <span class="c">);
                        the host keeps its text for readers (aria-label). Returns the spans.
  unsplit(el)           puts the plain text back.
  fitLine(el, w, opts)  the font size at which el's text fits one line in width w.
  fontsReady(ms)        resolves when the fonts are in, or after ms.
  gl(canvas, frag, opts) one WebGL context drawing a full-screen fragment shader. Returns
                        { draw(uniforms), resize(), destroy, lost } or null when WebGL or the shader fails
                        (the scene then shows its still fallback). Uniforms: numbers, [x, y], [x, y, z],
                        [x, y, z, w]; u_res and u_time are set by draw. Never pass a reserved GLSL word as
                        a name. One context a scene; free it with destroy() when the scene is far away.
  glBudget              the page's shared count of live WebGL contexts (window.__tpGl, max 4, shared with
                        the moments and the objects when they read it): take() is false when the page is
                        full, free() gives one back, held the number held now. gl() uses it; fx.js, print3d.js and liquid-hover count in it too.
  near(ctx, isNear)     a spec hook: called when the section comes within a screen of the viewport and
                        when it leaves (a scene mounts its WebGL object on near, destroys it on far).
  hex(c)                a CSS colour string to [r, g, b] in 0..1 (reads the page's palette tokens).
  token(el, name, fb)   the computed value of a custom property on el (or :root), trimmed.
  phone()               true under 768px.  reduced()  true under prefers-reduced-motion.  coarse()  touch.
*/
const HAS_DOM = typeof window !== 'undefined';
const mq = q => (HAS_DOM && window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {}, removeEventListener() {} });
const rq = mq('(prefers-reduced-motion: reduce)');
const pq = mq('(max-width: 767px)');
const prq = mq('print');   // printing (or saving a PDF): every scene shows its finished composition, nothing waits for a scroll
export const reduced = () => rq.matches;
export const phone = () => pq.matches;
export const isPhone = phone;
export const coarse = () => mq('(pointer: coarse)').matches;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = lerp;
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const ease = {
  linear: t => t,
  lin: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  in2: t => t * t,
  out2: t => 1 - (1 - t) * (1 - t),
  out5: t => 1 - Math.pow(1 - t, 5),
  quint: t => 1 - Math.pow(1 - t, 5),
  expo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  back: t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  outBack: t => { const c = 1.70158, d = c + 1; return 1 + d * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  smooth: t => t * t * (3 - 2 * t),
  smoothstep: (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); },
};
export const seg = (p, a, b, e) => { const t = clamp((p - a) / (b - a)); return e ? e(t) : t; };
export function track(p, keys, e = ease.inOut) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, e((p - a) / (b - a))); }
  }
  return keys[keys.length - 1][1];
}
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const fontsReady = (ms = 900) => Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(ms)]);

export function token(el, name, fb = '') {
  const v = getComputedStyle(el || document.documentElement).getPropertyValue(name).trim();
  return v || fb;
}
export function hex(c) {
  if (!c) return [0, 0, 0];
  c = c.trim();
  if (c[0] === '#') {
    const h = c.slice(1);
    const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
    return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255);
  }
  const m = c.match(/[\d.]+/g);
  if (m && m.length >= 3 && /^rgb/i.test(c)) return m.slice(0, 3).map(Number).map(v => v / 255);
  // a colour the page wrote in another notation (oklch, color-mix): let the browser resolve it
  const d = document.createElement('i');
  d.style.color = c; document.body.appendChild(d);
  const r = getComputedStyle(d).color; d.remove();
  const mm = r.match(/[\d.]+/g);
  return mm ? mm.slice(0, 3).map(Number).map(v => v / 255) : [0, 0, 0];
}

/* ------------------------------------------------------------------ the held stage */
const scenes = new Set();
export function scene(root, spec = {}) {
  if (!HAS_DOM || !root) return null;
  root.classList.add('sc');
  const stageEl = root.querySelector(':scope > .sc__stage') || root.firstElementChild;
  const q = sel => [...root.querySelectorAll(sel)];
  const tau = spec.tau ?? 0.07;
  const minWidth = spec.minWidth ?? 0, minHeight = spec.minHeight ?? 420;
  const ctx = { root, stage: stageEl, q, phone: false, vw: 0, vh: 0, p: 0, v: 0, hold: spec.hold ?? 1 };
  let live = false, raf = 0, target = 0, shown = -1, last = 0, near = true, top = 0, range = 1, built = false;

  const measure = () => {
    ctx.vw = window.innerWidth; ctx.vh = window.innerHeight;
    const r = root.getBoundingClientRect();
    top = r.top + window.scrollY; range = Math.max(1, r.height - ((live && stageEl && stageEl.offsetHeight) || ctx.vh));   // the stage sticks for the section less its own height
  };
  const progress = () => clamp((window.scrollY - top) / range);
  const step = now => {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60; last = now;
    const k = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;
    let p = ctx.p + (target - ctx.p) * k;
    if (Math.abs(target - p) < 0.0006) p = target;
    if (p !== shown) {
      ctx.v = dt > 0 ? (p - ctx.p) / dt : 0;
      ctx.p = p; shown = p;
      root.style.setProperty('--p', p.toFixed(4));
      try { spec.update && spec.update(p, ctx); } catch (e) { console.error('scene', root.dataset.bigScene, e); }
    } else ctx.v = 0;
    if (p !== target) raf = requestAnimationFrame(step); else last = 0;
  };
  const tick = () => { if (!live) return; target = progress(); if (!raf && (target !== shown || shown < 0)) raf = requestAnimationFrame(step); };
  const onScroll = () => { if (near) tick(); };
  const remeasure = () => { try { spec.measure && spec.measure(ctx); } catch (e) { console.error('scene measure', root.dataset.bigScene, e); } };
  const onResize = () => { if (!live) return; measure(); remeasure(); shown = -1; tick(); };

  const toRest = () => {
    if (live) { live = false; window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); if (raf) cancelAnimationFrame(raf); raf = 0; }
    root.classList.remove('is-live'); root.classList.add('is-rest');
    root.style.removeProperty('--sc-hold'); root.style.removeProperty('--p');
    if (stageEl) stageEl.removeAttribute('data-edge-free');
    try { spec.rest && spec.rest(ctx); } catch (e) { console.error('scene rest', e); }
  };
  const toLive = hold => {
    root.classList.remove('is-rest'); root.classList.add('is-live');
    ctx.hold = hold; root.style.setProperty('--sc-hold', String(hold));
    // live, the stage is one screen of a two-screen section and its pieces move with the scroll: the layout check (assets/layout/layout-check.js) would read it as a sparse section and judge its pieces by their edges at one instant; data-edge-free tells it to skip the live stage (the finished composition at rest is checked like any section)
    if (stageEl) stageEl.setAttribute('data-edge-free', '');
    live = true; shown = -1; last = 0;
    measure();
    try { spec.enter && spec.enter(ctx); } catch (e) { console.error('scene enter', root.dataset.bigScene, e); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    target = progress(); ctx.p = target; shown = -1;
    step(performance.now());
  };
  const fits = () => !reduced() && !prq.matches && window.innerWidth >= minWidth && window.innerHeight >= minHeight;
  const build = () => {
    ctx.phone = phone();
    const plan = ctx.phone
      ? ((spec.phone && typeof spec.phone === 'object') ? { hold: spec.phone.hold ?? 1 } : spec.phone === 'same' ? { hold: spec.hold ?? 1 } : null)   // default: the finished composition
      : { hold: spec.hold ?? 1 };
    if (!fits() || !plan) { toRest(); return; }
    measure();
    let ok = true;
    if (!built) { built = true; try { ok = spec.start ? spec.start(ctx) !== false : true; } catch (e) { console.error('scene start', root.dataset.bigScene, e); ok = false; } }
    if (!ok) { toRest(); return; }
    toLive(plan.hold);
    remeasure(); shown = -1; tick();
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (live) { measure(); remeasure(); shown = -1; tick(); } });
  };
  // the stage runs only while the section is within a screen of the viewport; spec.near hears both edges
  const io = new IntersectionObserver(es => {
    const was = near; near = es[es.length - 1].isIntersecting;
    if (near) { measure(); tick(); }
    if (near !== was) { try { spec.near && spec.near(ctx, near); } catch (e) { console.error('scene near', root.dataset.bigScene, e); } }
  }, { rootMargin: '100% 0px' });
  io.observe(root);
  let t = 0;
  const onMedia = () => { clearTimeout(t); t = setTimeout(() => { toRest(); build(); }, 60); };
  // print: the section goes to rest (the finished picture and its copy, in the page's flow) and goes live again afterwards
  const onPrint = e => { clearTimeout(t); if (e && e.matches === false) onMedia(); else if (!e || e.matches) { toRest(); } };
  const beforePrint = () => { clearTimeout(t); toRest(); }, afterPrint = () => onMedia();
  rq.addEventListener('change', onMedia);
  pq.addEventListener('change', onMedia);
  prq.addEventListener('change', onPrint);
  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', afterPrint);
  build();
  const ctrl = {
    ctx,
    get p() { return ctx.p; },
    get live() { return live; },
    get near() { return near; },
    refresh() { if (live) { measure(); remeasure(); shown = -1; tick(); } },
    /** a page scroll position for a progress 0..1 (shoot scripts, "skip" links) */
    at(p) { measure(); return top + range * clamp(p); },
    destroy() {
      io.disconnect(); rq.removeEventListener('change', onMedia); pq.removeEventListener('change', onMedia); prq.removeEventListener('change', onPrint);
      window.removeEventListener('beforeprint', beforePrint); window.removeEventListener('afterprint', afterPrint);
      toRest(); root.classList.remove('is-rest'); scenes.delete(ctrl);
      try { spec.destroy && spec.destroy(ctx); } catch (_) { /* gone */ }
    },
  };
  scenes.add(ctrl);
  return ctrl;
}
export const stage = scene;

/** fonts and the scenes' pictures, then every live scene measured again */
export function ready() {
  if (!HAS_DOM) return Promise.resolve();
  const imgs = [...document.querySelectorAll('.sc img')].map(i => (i.complete ? null : i.decode().catch(() => {}))).filter(Boolean);
  return Promise.all([document.fonts ? document.fonts.ready : null, ...imgs]).then(() => { for (const s of scenes) s.refresh(); });
}

/* ------------------------------------------------------------------ text */
export function split(el, { chars = false, cls = 'w', ccls = 'c' } = {}) {
  if (!el || el.dataset.split) return [...el.querySelectorAll(chars ? '.' + ccls : '.' + cls)];
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  el.dataset.split = chars ? 'chars' : 'words';
  const frag = document.createDocumentFragment();
  const out = [];
  text.split(' ').forEach((w, i) => {
    if (i) frag.appendChild(document.createTextNode(' '));
    const ws = document.createElement('span'); ws.className = cls; ws.setAttribute('aria-hidden', 'true');
    if (chars) { for (const ch of [...w]) { const cs = document.createElement('span'); cs.className = ccls; cs.textContent = ch; ws.appendChild(cs); out.push(cs); } }
    else { ws.textContent = w; out.push(ws); }
    frag.appendChild(ws);
  });
  el.replaceChildren(frag);
  return out;
}
export function unsplit(el) {
  if (!el || !el.dataset.split) return;
  el.textContent = el.getAttribute('aria-label') || el.textContent;
  el.removeAttribute('aria-label'); delete el.dataset.split;
}
/** the font size (px) at which el's text fits one line in width w */
export function fitLine(el, w, { min = 24, max = 200 } = {}) {
  el.style.fontSize = max + 'px';
  el.style.whiteSpace = 'nowrap';
  const need = el.scrollWidth;
  const size = clamp(Math.floor(max * (w / Math.max(1, need))), min, max);
  el.style.fontSize = size + 'px';
  return size;
}

/* ------------------------------------------------------------------ WebGL */
const VERT = 'attribute vec2 a_p;varying vec2 v_uv;void main(){v_uv=a_p*0.5+0.5;gl_Position=vec4(a_p,0.0,1.0);}';
const RESERVED = /\b(flat|smooth|sample|centroid|patch|input|output|filter|packed|precise|subroutine|common|partition|active|asm|class|union|enum|typedef|template|this|resource|goto|inline|noinline|public|static|extern|external|interface|long|short|half|fixed|unsigned|superp|hvec[234]|dvec[234]|fvec[234]|sampler3DRect|sizeof|cast|namespace|using)\b/;
export function glslCheck(src) {
  // the strict words a laptop GPU rejects and SwiftShader lets through: never a reserved word as a name
  const stripped = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const names = stripped.match(/\b(?:float|int|bool|vec[234]|mat[234]|ivec[234]|bvec[234]|sampler2D)\s+([A-Za-z_]\w*)/g) || [];
  for (const d of names) { const n = d.split(/\s+/).pop(); if (RESERVED.test(n)) return `reserved word used as a name: ${n}`; }
  const fields = stripped.match(/\.\s*([A-Za-z_]\w*)/g) || [];
  for (const f of fields) { const n = f.replace(/^\.\s*/, ''); if (RESERVED.test(n)) return `reserved word used as a field: ${n}`; }
  if (/__/.test(stripped)) return 'a name with a double underscore';
  return null;
}
/* the page's shared budget of live WebGL contexts: at most 4 on a page (an integrated GPU's limit). One
   counter on window, so the scenes, the moments and the objects of a page can share it. */
const GL_MAX = 4;
export const glBudget = {
  get max() { return (HAS_DOM && window.__tpGlMax) || GL_MAX; },
  get held() { return (HAS_DOM && window.__tpGl) || 0; },
  take() { if (!HAS_DOM) return false; const n = window.__tpGl || 0; if (n >= glBudget.max) return false; window.__tpGl = n + 1; return true; },
  free() { if (!HAS_DOM) return; window.__tpGl = Math.max(0, (window.__tpGl || 0) - 1); },
};
export function gl(canvas, frag, { alpha = true, premultipliedAlpha = true, scale = 1 } = {}) {
  const bad = glslCheck(frag);
  if (bad) { console.warn('scenes: shader refused: ' + bad); return null; }
  if (!glBudget.take()) { console.warn('scenes: the page holds its 4 WebGL contexts; the scene shows its still'); return null; }
  let g = null;
  try { g = canvas.getContext('webgl', { alpha, premultipliedAlpha, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' }); } catch { g = null; }
  if (!g) { glBudget.free(); return null; }
  const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) { console.warn('scenes: shader failed: ' + g.getShaderInfoLog(s)); return null; } return s; };
  const drop = () => { try { const x = g.getExtension('WEBGL_lose_context'); x && x.loseContext(); } catch { /* gone */ } glBudget.free(); return null; };
  const vs = sh(g.VERTEX_SHADER, VERT), fs = sh(g.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return drop();
  const prog = g.createProgram(); g.attachShader(prog, vs); g.attachShader(prog, fs); g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) { console.warn('scenes: program failed: ' + g.getProgramInfoLog(prog)); return drop(); }
  g.useProgram(prog);
  const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, 'a_p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const u = {}; const U = n => (u[n] ??= g.getUniformLocation(prog, n));
  const t0 = performance.now();
  let lost = false;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; });
  const api = {
    get lost() { return lost; },
    resize(w = canvas.clientWidth, h = canvas.clientHeight) {
      const W = Math.max(1, Math.round(w * scale)), H = Math.max(1, Math.round(h * scale));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      g.viewport(0, 0, W, H);
    },
    draw(uni = {}) {
      if (lost) return false;
      api.resize();
      g.uniform2f(U('u_res'), canvas.width, canvas.height);
      g.uniform1f(U('u_time'), (performance.now() - t0) / 1000);
      for (const [k, v] of Object.entries(uni)) {
        const l = U(k); if (l == null) continue;
        if (typeof v === 'number') g.uniform1f(l, v);
        else if (v.length === 2) g.uniform2f(l, v[0], v[1]);
        else if (v.length === 3) g.uniform3f(l, v[0], v[1], v[2]);
        else if (v.length === 4) g.uniform4f(l, v[0], v[1], v[2], v[3]);
      }
      g.drawArrays(g.TRIANGLES, 0, 3);
      return true;
    },
    destroy() { if (lost) return; try { const x = g.getExtension('WEBGL_lose_context'); x && x.loseContext(); } catch { /* gone */ } lost = true; glBudget.free(); },
  };
  return api;
}
