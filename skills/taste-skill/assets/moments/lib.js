/*
  moments/lib.js - the few helpers every moment shares (taste-skill). One ES module, no dependencies.

  reduced()            true under prefers-reduced-motion: a moment then shows its finished state only
  phone()              true on a phone: under 640px wide, or a touch screen in landscape under 500px tall
                       (a phone turned sideways). A moment shows its finished state there too.
  still()              reduced() || phone(): the one question every moment asks. The loader (moments.js)
                       hands each moment a lib whose reduced() answers still(), so a moment written
                       against reduced() is already static on a phone, and sets data-moment-still on its
                       host ("reduced" or "phone"). The answer is taken once, when the page loads.
  coarse()             true on a touch screen (no hover moments there)
  inCard(el)           true when el is, or sits in, a card, a plan, a result or a bento cell: nothing
                       on a card ever moves on scroll, so the loader leaves such a moment still
  scrub(el, fn, opts)  calls fn(progress, rect) from a requestAnimationFrame while el is near the
                       screen. mode 'hold' (default): 0 when el's top reaches the viewport top, 1 when
                       its bottom reaches the viewport bottom (a pinned stage's run). mode 'view': 0 when
                       el's top enters at the bottom edge, 1 when its bottom leaves at the top.
                       Returns { destroy, update }. Nothing is captured: the page scrolls natively.
  once(el, fn, opts)   fn once: when `threshold` of el is on screen, or el covers that share of the screen (a
                       target taller than the screen can never show it), or part of it has stayed on screen
                       for opts.rescue ms (3000), or the observer has not reported at all after 1.5 s of a
                       visible page. Nothing waits for ever. Returns { destroy }.
  split(el, unit)      wraps the words ('words') or letters ('chars') of el in spans
                       (.mo-w, .mo-c, each with an inner .mo-i that moves) and keeps the text readable:
                       the host gets aria-label, the spans aria-hidden. Returns the inner spans.
  lines(words)         groups word spans into lines by their offsetTop; returns an array of arrays.
  fontsReady(ms)       resolves when the fonts are loaded, or after ms.
  clamp, lerp, ease    the maths.
*/
const rq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
export const reduced = () => !!(rq && rq.matches);
const pq = typeof matchMedia === 'function' ? [matchMedia('(max-width: 639px)'), matchMedia('(pointer: coarse) and (max-height: 499px) and (max-width: 959px)')] : [];
export const phone = () => pq.some(q => q.matches);
export const still = () => reduced() || phone();
export const stillWhy = () => (reduced() ? 'reduced' : phone() ? 'phone' : '');
export const inCard = el => !!(el && el.closest && el.closest('.card, .plan, .result, .knock, [data-card], .bento > *'));
export const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = {
  out: t => 1 - Math.pow(1 - t, 3),
  quint: t => 1 - Math.pow(1 - t, 5),
  expo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  smooth: (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); },
};

export function scrub(el, fn, { mode = 'hold', margin = '25% 0px' } = {}) {
  // on from the start, with the scroll listener: an observer that never reports (a dead stub, a page it cannot reach) leaves the
  // moment following the scroll instead of frozen at its first state; the observer turns it off when the target is far away
  let on = true, raf = 0, last = -1;
  const tick = () => {
    raf = 0;
    if (!on) return;
    const r = el.getBoundingClientRect(), vh = innerHeight;
    let p = mode === 'view' ? (vh - r.top) / (vh + r.height) : -r.top / Math.max(1, r.height - vh);
    p = clamp(p);
    if (p !== last) { last = p; fn(p, r); }
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const io = new IntersectionObserver(es => {
    on = es[es.length - 1].isIntersecting;
    removeEventListener('scroll', req); removeEventListener('resize', req);
    if (on) { addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); req(); }
  }, { rootMargin: margin });
  io.observe(el);
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); req();
  return {
    update: () => { last = -1; req(); },
    destroy() { io.disconnect(); removeEventListener('scroll', req); removeEventListener('resize', req); if (raf) cancelAnimationFrame(raf); },
  };
}

export function once(el, fn, { threshold = 0.35, margin = '0px', rescue = 3000 } = {}) {
  // fn runs once when `threshold` of el is on screen, or el covers that share of the screen (a target taller
  // than the screen can never show `threshold` of itself), or any part of it has stayed on screen for `rescue`
  // ms. An observer that has not reported at all after 1.5 s of a visible page runs fn too: nothing waits for ever
  let timer = 0, starve = 0, done = false;
  const go = () => { if (done) return; done = true; clearTimeout(timer); clearTimeout(starve); io.disconnect(); fn(); };
  const steps = [0];
  for (let t = 0.1; t < threshold - 1e-6; t += 0.1) steps.push(+t.toFixed(2));
  steps.push(threshold);
  const io = new IntersectionObserver(es => {
    clearTimeout(starve);
    const e = es[es.length - 1];
    if (!e.isIntersecting) { clearTimeout(timer); timer = 0; return; }
    const vh = e.rootBounds ? e.rootBounds.height : innerHeight;
    if (e.intersectionRatio >= threshold || e.intersectionRect.height >= vh * threshold) return go();
    if (!timer) timer = setTimeout(go, rescue);
  }, { threshold: steps, rootMargin: margin });
  const wait = () => { starve = setTimeout(() => (document.hidden ? wait() : go()), 1500); };
  wait();
  io.observe(el);
  return { destroy() { done = true; clearTimeout(timer); clearTimeout(starve); io.disconnect(); } };
}

export function split(el, unit = 'words') {
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const inners = [];
  const wrap = (text, cls) => {
    const s = document.createElement('span');
    s.className = cls;
    const i = document.createElement('span');
    i.className = 'mo-i';
    i.textContent = text;
    s.append(i);
    inners.push(i);
    return s;
  };
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          if (unit === 'chars') {
            const w = document.createElement('span');
            w.className = 'mo-w';
            for (const ch of part) w.append(wrap(ch, 'mo-c'));
            frag.append(w);
          } else frag.append(wrap(part, 'mo-w'));
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('mo-w')) walk(n);
    });
  };
  walk(el);
  el.querySelectorAll('.mo-w').forEach(w => w.setAttribute('aria-hidden', 'true'));
  return inners;
}

export function lines(words) {
  const out = [];
  let top = null;
  for (const w of words) {
    const t = w.offsetTop;
    if (top === null || Math.abs(t - top) > 2) { out.push([]); top = t; }
    out[out.length - 1].push(w);
  }
  return out;
}

export const fontsReady = (ms = 900) => Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, ms))]);

/*
  blocks(root, skip)   the section's words and pictures as whole blocks, for a moment that uncovers a section with a
                       clip (a disc, a line): a block is a heading, paragraph, list item, button, link, picture, UI
                       window or any element that carries text of its own, outermost first (a frame with its own
                       text is one block). A clip that slices through a block cuts its words mid-move, so such a
                       moment keeps each block invisible until the clip has passed the whole of it, then fades it
                       in whole. Returns { list, measure, set, release }:
    list      [{ el, l, t, r, b }] with the box of each block in root's own coordinates (set by measure)
    measure() reads the boxes again (call when the root's size changes or the fonts arrive)
    set(fn)   fn(block) -> opacity 0-1 for every block; 1 puts the element's own inline opacity back
    release() every block as it was
  skip: elements (the moment's own layers) that are never a block.
*/
const BLOCK = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,label,a,button,img,picture,video,canvas,svg,table,figure,.frame,.dw,[data-moment-block]';
export function blocks(root, skip = []) {
  const list = [];
  const walk = el => {
    for (const c of el.children) {
      if (skip.includes(c) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(c.tagName)) continue;
      const own = [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (c.matches(BLOCK) || own) list.push({ el: c, was: c.style.opacity, l: 0, t: 0, r: 0, b: 0 });
      else walk(c);
    }
  };
  walk(root);
  const measure = () => {
    const rr = root.getBoundingClientRect();
    for (const b of list) {
      const r = b.el.getBoundingClientRect();
      b.l = r.left - rr.left; b.t = r.top - rr.top; b.r = r.right - rr.left; b.b = r.bottom - rr.top;
    }
  };
  measure();
  const set = fn => { for (const b of list) { const o = fn(b); b.el.style.opacity = o >= 0.999 ? b.was : (o <= 0 ? '0' : o.toFixed(3)); } };
  const release = () => { for (const b of list) b.el.style.opacity = b.was; };
  return { list, measure, set, release };
}
