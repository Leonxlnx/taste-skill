// Round 10 (r9-p44, a Berlin roastery that won 6 to 4 and still read as a template): what the page shows once it rests.
// inspect.mjs runs restLook() at each screen of a second walk, after the film, and at the end of every running scene;
// scenes.mjs runs it at the settled steps of a scene. heroStack() and visitBlocks() run once at the top of the page.
// Every function here runs in the page and returns plain JSON.

// restLook: one look at a screen at rest, in two phases. Phase 0 notes text cut off by a box that clips it
// (clipped-text), the pictures in view (repeated-picture) and the headings and short labels in view (restated-heading,
// repeated-label). Phase 1, a short scroll later, keeps only what held still: it moved with the page, or stayed put
// while the page moved under it. So a mask on its way, a picture still flying in, a ticker or a parallax layer is not
// counted. Text in a running scene that has not reached its end is skipped for clipped-text (its masks are mid-way);
// the scene's end is looked at on its own. Round 10, part B: a pale or coloured veil on a photograph in view (gradient),
// and on tablets and phones a held stage's heading cut off above the screen (held-heading-cut), each kept when the
// second look finds it again.
//   opts.phase   0 or 1
//   opts.root    [selector, index]: one scene only (scenes.mjs), with its own unfinished state allowed (opts.inScene)
//   opts.clipOnly  the clipped-text part alone, in one phase (scenes.mjs: its steps are settled already)
export function restLook(opts = {}) {
  const W = innerWidth, H = innerHeight, sy = Math.round(scrollY || document.scrollingElement.scrollTop || 0);
  const scope = opts.root ? document.querySelectorAll(opts.root[0])[opts.root[1]] : document.body;
  if (!scope) return null;
  const S = (window.__tsRest = window.__tsRest || { n: 0, ids: new WeakMap(), els: new Map() });
  const idOf = (el) => { let k = S.ids.get(el); if (k == null) { k = ++S.n; S.ids.set(el, k); S.els.set(k, new WeakRef(el)); } return k; };
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const opMemo = new Map();
  const opacityOf = (el) => { if (!el || el.nodeType !== 1) return 1; if (opMemo.has(el)) return opMemo.get(el); const cs = css(el); const v = cs.visibility === 'hidden' || cs.display === 'none' ? 0 : +cs.opacity * opacityOf(el.parentElement); opMemo.set(el, v); return v; };
  const desc = (e) => e.tagName.toLowerCase() + (e.classList && e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : e.id ? '#' + e.id : '');
  const words = (t) => (t.trim().match(/\S+/g) || []).length;
  const norm = (t) => t.replace(/\s+/g, ' ').trim();
  // the scene or pinned stage an element is in, and whether it has reached its end (its foot on the screen)
  const sceneOf = (el) => el.closest('.scene.is-live, .pin-spacer');
  const unfinished = (s) => { if (!s) return false; const r = s.getBoundingClientRect(); return r.top < H && r.bottom > H + 2; };
  const sceneKey = (el) => { const s = el.closest('.scene, [data-scene], .pin-spacer'); return s ? (s.dataset.scene || s.id || 'scene') + ':' + idOf(s) : ''; };
  // the innermost section an element is in (restated-heading compares headings within one; a page wrapped in one
  // <article> is not one section)
  const sectionOf = (el) => { let top = null; for (let e = el; e && e !== document.body && e.tagName !== 'MAIN'; e = e.parentElement) { if (/^(SECTION|ARTICLE|ASIDE|FOOTER)$/.test(e.tagName) || e.hasAttribute('data-scene')) return e; top = e; } return top; };
  // the site's bar: a <header> outside the page's sections and under 30% of the screen tall (a hero set in a <header>,
  // or a section's own <header>, holds headings and pictures like any other block)
  const bar = (el) => { const b = el.closest('header'); if (!b || b.parentElement?.closest('main, section, article, aside, [data-scene]')) return false; return b.getBoundingClientRect().height < H * 0.3; };

  // --- the boxes that clip an element: overflow hidden or clip on an axis, paint containment, clip-path, along the
  // element's chain of containing blocks (an absolutely placed box escapes the boxes between it and the box it is
  // placed in; a fixed one escapes all of them unless one is transformed)
  // (lengths are the element's own, before its transform: scaled by sx and sy, product-assembles' window at 1.6)
  const insetOf = (cp, r, sx = 1, sy = 1) => {
    const whole = { l: r.left, r: r.right, t: r.top, b: r.bottom };
    const m = /^inset\(([^()]*)\)$/.exec(cp.trim()); if (!m) return whole;
    const p = m[1].split(/\s+round\s+/)[0].trim().split(/\s+/); const v = (s, len, k) => (s.endsWith('%') ? (parseFloat(s) / 100) * len : parseFloat(s) * k);
    const [a, b = a, c = a, d = b] = p; const box = { t: r.top + v(a, r.height, sy), r: r.right - v(b, r.width, sx), b: r.bottom - v(c, r.height, sy), l: r.left + v(d, r.width, sx) };
    return Object.values(box).every(Number.isFinite) ? box : whole;
  };
  const ownClip = (e) => {
    const cs = css(e); if (cs.display === 'contents' || cs.display === 'inline') return null;
    const hid = (v) => v === 'hidden' || v === 'clip', paint = /paint|strict|content/.test(cs.contain);
    const x = hid(cs.overflowX) || paint, y = hid(cs.overflowY) || paint, cp = cs.clipPath !== 'none';
    if (!x && !y && !cp) return null;
    const r = e.getBoundingClientRect(); const sx = e.offsetWidth ? r.width / e.offsetWidth : 1, sy = e.offsetHeight ? r.height / e.offsetHeight : 1;
    const box = cp ? insetOf(cs.clipPath, r, sx, sy) : { l: r.left, r: r.right, t: r.top, b: r.bottom };
    return { e, l: x || cp ? box.l : -Infinity, r: x || cp ? box.r : Infinity, t: y || cp ? box.t : -Infinity, b: y || cp ? box.b : Infinity, w: r.width, h: r.height, rect: r };
  };
  const holdsFixed = (p) => { const c = css(p); return c.transform !== 'none' || c.perspective !== 'none' || c.filter !== 'none' || c.translate !== 'none' || c.scale !== 'none' || c.rotate !== 'none' || /transform|perspective|filter/.test(c.willChange) || /paint|layout|strict|content/.test(c.contain); };
  const chainMemo = new Map();
  const clipsOf = (el) => {
    if (chainMemo.has(el)) return chainMemo.get(el);
    const out = []; const own = ownClip(el); if (own) out.push(own);
    for (let cur = el; cur && cur !== document.body && cur !== document.documentElement;) {
      const pos = css(cur).position; let cb = cur.parentElement;
      if (pos === 'absolute' || pos === 'fixed') while (cb && cb !== document.body && cb !== document.documentElement && !(pos === 'absolute' ? css(cb).position !== 'static' || holdsFixed(cb) : holdsFixed(cb))) cb = cb.parentElement;
      if (!cb || cb === document.body || cb === document.documentElement) break;
      const c = ownClip(cb); if (c) out.push(c);
      cur = cb;
    }
    chainMemo.set(el, out); return out;
  };
  const meet = (cs) => cs.reduce((a, c) => ({ l: Math.max(a.l, c.l), r: Math.min(a.r, c.r), t: Math.max(a.t, c.t), b: Math.min(a.b, c.b) }), { l: -Infinity, r: Infinity, t: -Infinity, b: Infinity });

  // --- what paints over a point (hit-testing with pointer-events opened up): a picture, a filled ground
  const paints = (e) => {
    if (opacityOf(e) < 0.35) return false;
    if (/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE|OBJECT|EMBED)$/.test(e.tagName) || e instanceof SVGElement) return true;
    const cs = css(e); if (cs.backgroundImage !== 'none') return true;
    const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const p = m ? m[1].split(/[,\s/]+/).filter(Boolean) : [];
    return p.length >= 3 && (p.length < 4 || parseFloat(p[3]) >= 0.6);
  };
  const shownAt = (el, x, y) => {
    if (!(x >= 0 && x < W && y >= 0 && y < H)) return false;
    for (const e of document.elementsFromPoint(x, y)) {
      if (e === el || el.contains(e)) return true;
      if (e.contains(el)) continue; // an ancestor (its own ground, its ::before or ::after) lies round it, not on it
      if (paints(e)) return false;
    }
    return false;
  };
  const hitStyle = document.createElement('style');
  hitStyle.textContent = '*, *::before, *::after { pointer-events: auto !important; }';
  document.head.appendChild(hitStyle);

  try {
    // --- clipped text: each block of visible words (not aria-hidden, opacity over 0.1) whose letters run more than 4px
    // past a box that clips them while that box is on screen. A line's letters are its band from the baseline to the
    // cap height (the middle of the line box, 0.35em up and down), so a tight mask round a display line that only
    // trims the glyph box is not a cut. Words wholly outside their box count only when the box shows other words
    // (a list cut off under a picture); a line that has left through its own mask has left.
    // Round 11f (r14-p63's sun hours, 23 and 3 at 490px in a box 0.56em tall): a figure is read whole. Its digits count
    // one by one, a rolling figure's visible copy too (its spoken copy is the screen reader's), and a figure is never a
    // crop at the screen's side or at the foot of its box, as a word may be (figure: true)
    const FIG = /^[\p{N}\s.,:%+\-−–\u200b]+$/u;
    const clipped = () => {
      const units = new Map(), showing = new Set();
      const UNIT = 'h1, h2, h3, h4, h5, h6, p, li, dt, dd, figcaption, td, th, blockquote, a, button, label, summary';
      // (moved by a transform between the words and the box: a track, a caption or a statement carried out of its stage;
      // a transform that moves nothing, the translate(0px, 0px) GSAP leaves on what it lifted in, carries nothing)
      const carried = (el, stop) => {
        for (let e = el; e && e !== stop && e !== document.body; e = e.parentElement) {
          const c = css(e);
          if (c.translate !== 'none' && !/^0px(\s+0px){0,2}$/.test(c.translate)) return true;
          if (c.transform !== 'none') { try { if (!new DOMMatrixReadOnly(c.transform).isIdentity) return true; } catch { return true; } }
        }
        return false;
      };
      const bodyPx = parseFloat(css(document.body).fontSize) || 16;
      const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let k = 0;
      for (let n = tw.nextNode(); n && k < 5000; n = tw.nextNode()) {
        const t = norm(n.nodeValue); const el = n.parentElement;
        if (!el || el.closest('script, style, noscript, template, svg, select, textarea, [data-ui], [inert]')) continue;
        const cs = css(el); const size = parseFloat(cs.fontSize) || 16;
        // (a figure at display size, 24px and up: its digits one by one, the copy a visitor sees as well)
        const fig = size >= 24 && /\p{N}/u.test(t) && FIG.test(t);
        if ((t.length < 2 && !fig) || (!fig && el.closest('[aria-hidden="true"]'))) continue;
        k++;
        if (!opts.inScene && unfinished(sceneOf(el))) continue;
        const op = opacityOf(el); if (op <= 0.1) continue;
        rg.selectNodeContents(n); const rects = [...rg.getClientRects()].filter((r) => r.width >= 2 && r.height >= 2);
        if (!rects.length) continue;
        const cl = clipsOf(el); if (!cl.length) continue;
        const box = meet(cl);
        const unit = el.closest(UNIT) || el;
        let u = units.get(unit);
        for (const r of rects) {
          const mid = (r.top + r.bottom) / 2, ink = { l: r.left, r: r.right, t: mid - size * 0.35, b: mid + size * 0.35 };
          const inside = Math.min(ink.r, box.r) - Math.max(ink.l, box.l) > 1 && Math.min(ink.b, box.b) - Math.max(ink.t, box.t) > 1;
          // the box that cuts deepest into this line, and how far the letters run past it
          let past = 0, by = null, side = '';
          for (const c of cl) for (const [s, v] of [['top', c.t - ink.t], ['bottom', ink.b - c.b], ['left', c.l - ink.l], ['right', ink.r - c.r]]) if (Number.isFinite(v) && v > past) { past = v; by = c; side = s; }
          if (inside) for (const c of cl) showing.add(c.e);
          if (!by || past <= 4) { if (!u) units.set(unit, (u = { unit, lines: 0, cut: 0, past: 0, inside: 0, fig: '' })); u.lines++; if (inside) u.inside++; continue; }
          // the cutting box: on screen, not collapsed shut (a closed panel), not a deliberate shortening (an ellipsis, a
          // line clamp, a faded edge). A box shrunk to screen-reader-only size hides its words on purpose (a skip link,
          // a label for a button), unless it is one of a set whose others show: then a list has been cut short
          // (r9-p44's phone: the coffee panel kept Huila and Guji and put Cerrado and Decaf in 1px boxes)
          const cr = by.rect, ccs = css(by.e);
          const onScreen = Math.min(cr.right, W) - Math.max(cr.left, 0) >= Math.min(40, cr.width) && Math.min(cr.bottom, H) - Math.max(cr.top, 0) >= Math.min(40, cr.height);
          const srOnly = cr.width <= 2 || cr.height <= 2 || ccs.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%\)/.test(ccs.clipPath);
          const shut = !srOnly && (side === 'top' || side === 'bottom' ? cr.height : cr.width) < 8;
          const meant = ccs.textOverflow === 'ellipsis' || cs.textOverflow === 'ellipsis' || (ccs.webkitLineClamp && ccs.webkitLineClamp !== 'none') || (ccs.maskImage && ccs.maskImage !== 'none') || (ccs.webkitMaskImage && ccs.webkitMaskImage !== 'none');
          // (a set: its siblings of the same tag and class show; a box named for screen readers is one on purpose)
          const cutShort = srOnly && !/sr-only|visually-?hidden|screen-?reader|a11y|offscreen|assistive/i.test(String(by.e.className)) && [...(by.e.parentElement ? by.e.parentElement.children : [])].some((s) => { if (s === by.e || s.tagName !== by.e.tagName || String(s.className) !== String(by.e.className) || opacityOf(s) <= 0.1) return false; const q = s.getBoundingClientRect(); return q.width >= 8 && q.height >= 8 && norm(s.textContent || '').length > 1; });
          // a line a transform carried wholly out of its box has left it (the caption before, a statement gone by), and a
          // digit wholly outside its box is a rolling figure's spare
          if (!inside && !cutShort && (fig || carried(el, by.e))) continue;
          if (!u) units.set(unit, (u = { unit, lines: 0, cut: 0, past: 0, inside: 0, fig: '' }));
          u.lines++; if (inside) u.inside++;
          // (a crop: display type on one line that its box cuts at the screen's side or at its foot, as the library deals
          // it in heroes.json one-word-cropped and sections.json showcase-object-in-front-of-type; never a figure)
          const bleed = !fig && size >= Math.max(56, bodyPx * 3) && rects.length === 1 && ((side === 'right' && cr.right >= W - 2) || (side === 'left' && cr.left <= 2) || side === 'bottom');
          if (!onScreen || shut || meant || bleed || (srOnly && !cutShort)) continue;
          u.cut++; if (fig) u.fig += t.replace(/\u200b/g, ''); else u.words = true;
          if (past > u.past) { u.past = past; u.by = by; u.side = side; u.size = size; u.op = op; u.short = cutShort; }
        }
      }
      const out = [], items = new Set();
      for (const u of units.values()) {
        if (!u.cut) continue;
        // (an item of a set cut short is named once, by the whole item)
        if (u.short) { if (items.has(u.by.e)) continue; items.add(u.by.e); u.unit = u.by.e; }
        // wholly outside its box: counted when that box shows other words (a list run on past the foot of its panel),
        // or when it is an item of a set cut short
        if (!u.inside && !u.short && !showing.has(u.by.e)) continue;
        const r = u.unit.getBoundingClientRect();
        // (a figure cut through its digits, and no words cut with it, is named by the digits it shows)
        const figure = !!u.fig && !u.words;
        out.push({ id: idOf(u.unit), text: figure ? u.fig : norm(u.unit.innerText || u.unit.textContent || '').slice(0, 60), past: Math.round(u.past), side: u.side, by: desc(u.by.e), size: Math.round(u.size), lines: u.lines, cut: u.cut, whole: !u.inside, short: !!u.short, figure, top: Math.round(r.top), op: +u.op.toFixed(2) });
        if (out.length >= 24) break;
      }
      return out;
    };
    if (opts.clipOnly) {
      // (scenes.mjs: the same two looks, a short scroll apart, for the clipped-text part alone)
      const clip = clipped();
      if (opts.phase === 0) { window.__tsRestC = { sy, clip }; return { y: sy, n: clip.length }; }
      if (opts.phase !== 1) return { y: sy, clipped: clip };
      const A = window.__tsRestC; window.__tsRestC = null; if (!A) return null;
      const dy = sy - A.sy, C = new Map(clip.map((x) => [x.id, x]));
      return { y: A.sy, dy, clipped: A.clip.filter((a) => { const b = C.get(a.id); return b && (Math.abs(b.top - a.top) <= 2 || Math.abs(b.top - (a.top - dy)) <= 2) && Math.abs(a.past - b.past) <= 3 && Math.abs(a.op - b.op) <= 0.1; }) };
    }

    // --- pictures in view: an img, a video or a box with a photograph for its background, by its file (the query and
    // size suffixes taken off: -800w, @2x, _1600x900), its visible part (its box within the screen and its clipping
    // boxes, sampled for what lies on it) at 1% of the screen or more
    const keyOf = (u) => {
      if (!u || /^data:/.test(u) && u.length < 4000) return null;
      if (/^data:/.test(u)) return 'data:' + u.length;
      let p = u; try { const x = new URL(u, location.href); p = (x.origin === location.origin ? '' : x.host) + decodeURIComponent(x.pathname); } catch { p = u.split(/[?#]/)[0]; }
      const parts = p.split('/'); let last = parts.pop() || '';
      last = last.toLowerCase().replace(/\.(jpe?g|png|webp|avif|gif|jxl|heic|mp4|webm|mov)$/, '').replace(/([-_@.](\d{2,5}w|\d{2,5}x\d{2,5}|\d(\.\d)?x|small|medium|large|thumb|sm|md|lg|xl|xxl))+$/, '');
      return [...parts, last].join('/');
    };
    // (a file named by numbers, as picsum's id/869/900/1600 is, is named by its last numbers and the word before them)
    const fileName = (key) => { const p = key.split('/'); let i = p.length - 1; while (i > 0 && p.length - i <= 3 && /^\d+$/.test(p[i])) i--; if (i < p.length - 1 && (/^(id|seed)$/i.test(p[i]) || /\./.test(p[i]))) i++; return p.slice(i).join('/').slice(-48); };
    const pics = [];
    let scanned = 0;
    for (const el of scope.querySelectorAll('*')) {
      if (++scanned > 6000) break;
      const tag = el.tagName; let src = null;
      if (tag === 'IMG') src = el.complete && el.naturalWidth ? el.currentSrc || el.src : null;
      else if (tag === 'VIDEO') src = el.currentSrc || el.getAttribute('poster') || (el.querySelector('source') || {}).src || null;
      else if (!/^(SCRIPT|STYLE|SOURCE|PICTURE|BR|svg)$/.test(tag) && !(el instanceof SVGElement)) {
        // a background is a picture when it keeps its proportions (cover, contain, or set once); a repeating tile or an
        // image stretched to the box (a paper, a perforation) is a surface
        const ecs = css(el), bi = ecs.backgroundImage;
        if (bi && bi !== 'none') { const m = bi.match(/url\(["']?([^"')]+)/); const size = ecs.backgroundSize.split(',')[0].trim(); const stretched = /^\S+\s+\S+$/.test(size) && !/auto|cover|contain/.test(size); if (m && !stretched && (/cover|contain|%/.test(size) || /no-repeat/.test(ecs.backgroundRepeat))) src = m[1]; }
      }
      // (photographs and films: a drawn SVG is not a picture here)
      if (!src || /^data:image\/svg|\.svg(\?|#|$)/i.test(src) || el.closest('[data-ui], nav, [role=banner]') || bar(el)) continue;
      const r = el.getBoundingClientRect(); if (r.width < 24 || r.height < 24 || r.bottom <= 0 || r.top >= H || r.right <= 0 || r.left >= W) continue;
      const op = opacityOf(el); if (op < 0.5) continue;
      // its frame (the picture within the boxes that clip it: a photograph zooming inside its card keeps one frame), and
      // the part of that frame on the screen
      const c = meet(clipsOf(el)); const fb = { l: Math.max(r.left, c.l), r: Math.min(r.right, c.r), t: Math.max(r.top, c.t), b: Math.min(r.bottom, c.b) };
      const vb = { l: Math.max(fb.l, 0), r: Math.min(fb.r, W), t: Math.max(fb.t, 0), b: Math.min(fb.b, H) };
      if (vb.r - vb.l < 24 || vb.b - vb.t < 24) continue;
      let hits = 0; for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.2, 0.5, 0.8]) if (shownAt(el, vb.l + (vb.r - vb.l) * fx, vb.t + (vb.b - vb.t) * fy)) hits++;
      const area = ((vb.r - vb.l) * (vb.b - vb.t) * hits) / 9;
      if (hits < 3 || area < W * H * 0.01) continue;
      const key = keyOf(src); if (!key) continue;
      pics.push({ id: idOf(el), key, file: fileName(key), l:Math.round(fb.l), t: Math.round(fb.t), w: Math.round(fb.r - fb.l), h: Math.round(fb.b - fb.t), area: +(area / (W * H)).toFixed(3), hits, op: +op.toFixed(2), scene: sceneKey(el) });
      if (pics.length >= 60) break;
    }

    // --- headings and short labels in view, by the words a visitor can see (a line hidden by its mask is not read):
    // h1 to h4 and text at display size (28px and up, and 1.6 times the body text) for restated-heading; those of four
    // words or fewer and short standalone labels (no figures, outside links, buttons, lists of values and the bar) for
    // repeated-label
    const bodySize = parseFloat(getComputedStyle(document.body).fontSize) || 16;
    const display = (s) => s >= 28 && s >= bodySize * 1.6;
    // (a value in a row, a sibling with words beside it on the same line, is a cell: "Closed" beside "Monday" in an
    // hours list built from flex rows is not a label)
    const cell = (el) => {
      const p = el.parentElement; if (!p) return false; const r = el.getBoundingClientRect();
      return [...p.children].some((s) => { if (s === el || !norm(s.textContent || '')) return false; const q = s.getBoundingClientRect(); return q.width > 0 && Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top) > Math.min(q.height, r.height) * 0.5 && (q.right <= r.left + 2 || q.left >= r.right - 2); });
    };
    const heads = new Map();
    const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT); let k = 0;
    for (let n = tw.nextNode(); n && k < 5000; n = tw.nextNode()) {
      const t = norm(n.nodeValue); const el = n.parentElement;
      if (t.length < 2 || !el || el.closest('script, style, noscript, template, svg, select, textarea, option, [data-ui], nav, footer, [role=banner], dialog, form') || bar(el)) continue;
      k++;
      const size = parseFloat(css(el).fontSize) || 16;
      // (a word or a tag set as its own inline box is a piece of its block: a statement split one span a word for a
      // scroll fill is one paragraph, not twenty labels; "Vegan" on a menu card belongs to the card)
      let blk = el; while (blk && blk !== scope && /^inline/.test(css(blk).display)) blk = blk.parentElement;
      const piece = (u) => /^inline/.test(css(u).display) && blk && !u.contains(blk) && words(blk.innerText || blk.textContent || '') > words(u.innerText || u.textContent || '');
      let unit = el.closest('h1, h2, h3, h4'), kind = unit ? 'h' : '';
      if (!unit && display(size) && !el.closest('a, button, h5, h6, li, dd, td, th, label')) {
        // the display text's own block: up while the box keeps its size and stays a few words
        unit = el; kind = 'd';
        for (let p = el.parentElement; p && p !== scope && !/^(SECTION|ARTICLE|MAIN|BODY)$/.test(p.tagName); p = p.parentElement) { if (Math.abs(parseFloat(css(p).fontSize) - size) > 1 || words(p.innerText || p.textContent || '') > 14) break; unit = p; }
        if (piece(unit)) continue;
      }
      if (!unit && words(t) <= 4 && !/\d/.test(t) && !piece(el) && !cell(el) && !el.closest('a, button, li, dd, dt, td, th, label, legend, figcaption, summary, [role=button]')) {
        // a short label standing on its own: the element holds these words and nothing else
        const own = norm(el.innerText || el.textContent || ''); if (own === t && el.childElementCount === 0) { unit = el; kind = 'l'; }
      }
      if (!unit || heads.has(unit)) continue;
      heads.set(unit, kind);
    }
    // (a unit inside another is part of it: the unit "km/h" inside the figure "20 km/h")
    { const us = [...heads.keys()]; for (const u of us) if (us.some((o) => o !== u && o.contains(u))) heads.delete(u); }
    const headList = [];
    for (const [unit, kind] of heads) {
      if (opacityOf(unit) < 0.5) continue;
      const r = unit.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= H || r.width < 2) continue;
      // the words that show: each text node with a line whose middle is hit on this element (a copy of the same words
      // laid on them, as a scene's layers are, reads once)
      const seen = [], laid = []; const ut = document.createTreeWalker(unit, NodeFilter.SHOW_TEXT); const rg = document.createRange();
      for (let n = ut.nextNode(); n; n = ut.nextNode()) {
        if (!n.nodeValue.trim() || !n.parentElement || opacityOf(n.parentElement) < 0.5) continue;
        rg.selectNodeContents(n);
        const q = [...rg.getClientRects()].find((x) => x.width >= 2 && shownAt(n.parentElement, (x.left + x.right) / 2, (x.top + x.bottom) / 2));
        if (!q) continue;
        const tt = norm(n.nodeValue);
        if (laid.some((b) => b.t === tt && Math.min(b.q.right, q.right) - Math.max(b.q.left, q.left) > q.width * 0.5 && Math.min(b.q.bottom, q.bottom) - Math.max(b.q.top, q.top) > q.height * 0.5)) continue;
        laid.push({ t: tt, q }); seen.push(n.nodeValue);
      }
      const text = norm(seen.join(' ')); if (text.length < 2) continue;
      const size = parseFloat(css(unit).fontSize) || 16;
      const sec = sectionOf(unit);
      headList.push({ id: idOf(unit), text: text.slice(0, 80), full: norm(unit.innerText || unit.textContent || '').slice(0, 160), kind, size: Math.round(size), tag: unit.tagName.toLowerCase(), t: Math.round(r.top), l: Math.round(r.left), whole: r.top >= -2 && r.bottom <= H + 2, section: sec ? idOf(sec) : 0, sectionName: sec ? (sec.id || sec.dataset.scene || desc(sec)) : '', scene: sceneKey(unit) });
      if (headList.length >= 80) break;
    }

    // --- round 10, part B. A veil on a photograph in view (gradient): a translucent fill that is pale or coloured, or a
    // blurred one, lying on 12% of the picture's frame or more, the element's own ground or its ::before or ::after. A
    // solid box on a picture is a box (framed-elements), and a dark neutral scrim that keeps words legible is not a veil
    // (r9-p43: white at 50% and at 80%, blurred, fogging the lower left of the full-bleed fjord).
    const veilOf = (e, onlyPseudo) => {
      if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(e.tagName) || e instanceof SVGElement) return null;
      const op = opacityOf(e); if (op < 0.1) return null;
      for (const ps of onlyPseudo ? ['::after'] : [null, '::before', '::after']) {
        const cs = ps ? getComputedStyle(e, ps) : css(e);
        if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
        const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); if (!m) continue;
        const c = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); const a = (c.length > 3 ? c[3] : 1) * op * (ps ? +cs.opacity : 1);
        const blur = /blur\(/.test(cs.filter) || /blur\(/.test(cs.backdropFilter || '');
        if (a < 0.1 || (a >= 0.92 && !blur)) continue;
        const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), pale = (mx + mn) / 510 >= 0.6, tinted = mx - mn >= 48;
        if (pale || tinted) return { what: desc(e) + (ps || ''), colour: `rgba(${c.slice(0, 3).join(', ')}, ${a.toFixed(2)})`, how: pale ? 'a pale veil' : 'a tint', blur };
      }
      return null;
    };
    const veils = [];
    for (const p of pics) {
      // (a running scene's weather or haze on its way is looked at once the scene has reached its end)
      const el = S.els.get(p.id)?.deref(); if (!el || p.area < 0.04 || unfinished(sceneOf(el))) continue;
      const fb = { l: Math.max(p.l, 0), r: Math.min(p.l + p.w, W), t: Math.max(p.t, 0), b: Math.min(p.t + p.h, H) };
      let n = 0, on = 0, by = null;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        const stack = document.elementsFromPoint(fb.l + ((fb.r - fb.l) * (i + 0.5)) / 6, fb.t + ((fb.b - fb.t) * (j + 0.5)) / 6);
        const at = stack.indexOf(el); if (at < 0) continue;
        n++;
        for (const e of stack.slice(0, at)) { if (el.contains(e)) continue; const v = veilOf(e, e.contains(el)); if (v) { on++; by = by || v; break; } }
      }
      if (n >= 8 && on / n >= 0.12 && by) veils.push({ media: p.file, share: +(on / n).toFixed(2), ...by });
    }
    // --- a held stage's heading cut off above the screen (held-heading-cut), on tablets and phones: a replay's stage, a
    // running scene's stage or a pinned block, a third of the screen tall or more, whose first heading runs above the top
    // of the screen (or under a filled bar fixed there; a clear bar hides nothing), or has gone above it while the stage
    // still fills the screen. A heading the scene carries out by a transform is leaving, not cut (r9-p41 at 390: "Find
    // the note you" above the screen, "half remember" on it, while the replay held).
    const cutHeads = [];
    if (W < 1100) {
      const topLine = (() => { let b = 0; const at = document.elementsFromPoint(W / 2, 2); for (const e of at) { const c = css(e); if (/fixed|sticky/.test(c.position)) { const r = e.getBoundingClientRect(); const fill = (x) => { const m = (x.backgroundColor || '').match(/rgba?\(([^)]+)\)/); const v = m ? m[1].split(/[ ,/]+/).filter(Boolean).map(Number) : []; return v.length >= 3 && (v.length < 4 || v[3] >= 0.5); }; const solid = fill(c) || fill(getComputedStyle(e, '::before')) || (c.backdropFilter && c.backdropFilter !== 'none') || at.some((x) => x !== e && e.contains(x) && fill(css(x))); if (solid && r.top <= 2 && r.height < H * 0.3 && r.width > W * 0.5) b = Math.max(b, r.bottom); } } return b; })();
      const moved = (el, stop) => { for (let e = el; e && e !== stop; e = e.parentElement) { const c = css(e); if (c.translate !== 'none' && !/^0px(\s+0px){0,2}$/.test(c.translate)) return true; if (c.transform !== 'none') { try { if (!new DOMMatrixReadOnly(c.transform).isIdentity) return true; } catch { return true; } } } return false; };
      for (const st of scope.querySelectorAll('.replay-stage, .scene.is-live .scene-stage, .pin-spacer > *')) {
        const r = st.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= H || r.height < H * 0.3) continue;
        const h = st.querySelector('h1, h2, h3'); if (!h || opacityOf(h) < 0.5 || moved(h, st)) continue;
        const hr = h.getBoundingClientRect(); if (hr.height < 4) continue;
        const past = topLine - hr.top;
        if ((past > 4 && hr.bottom > topLine + 4) || (hr.bottom <= topLine && r.top < topLine - 4 && r.bottom > H * 0.6)) cutHeads.push({ id: idOf(h), text: norm(h.innerText || h.textContent || '').slice(0, 60), stage: desc(st), past: Math.round(past), whole: hr.bottom <= topLine, st: Math.round(r.top) });
      }
    }
    // --- round 11: an object that runs into one side of the screen (edge-run): a product window, a box with a fill or an
    // outline, or a picture, in view, whose frame (its box within the boxes that clip it) reaches the left or the right
    // edge of the screen but not both (r9-p41's product window, flush with the right edge while the page kept 58px on
    // the left). Something that spans both edges is full-bleed. Only the outermost of a stack counts; a row that scrolls
    // sideways, a ticker and a running scene that has not reached its end are left out.
    const edges = [];
    {
      const rgb = (v) => { const s = String(v || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
      const ground = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgb(css(e).backgroundColor); if (c && c[3] >= 0.9) return c; } return [255, 255, 255, 1]; };
      const sides = (e) => { const c = css(e); return ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(c[`border${s}Width`]) >= 1 && c[`border${s}Style`] !== 'none' && (rgb(c[`border${s}Color`]) || [0, 0, 0, 0])[3] > 0.05).length; };
      const radius = (e) => Math.min(...['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'].map((k) => parseFloat(css(e)[k]) || 0));
      const found = []; let n2 = 0;
      for (const el of scope.querySelectorAll('*')) {
        if (++n2 > 7000) break;
        if (el instanceof SVGElement || /^(SCRIPT|STYLE|SOURCE|BR|HR|INPUT|SELECT|TEXTAREA|BUTTON|LABEL|OPTION|SPAN|EM|STRONG|B|I|SMALL|SUP|SUB)$/.test(el.tagName)) continue;
        if (el.closest('nav, dialog, [role=dialog], .marquee, [class*=marquee i], [class*=ticker i]') || bar(el) || (el.parentElement && el.parentElement.closest('[data-ui]'))) continue;
        let kind = null;
        if (el.matches('[data-ui]')) kind = 'a product window';
        else if (/^(IMG|VIDEO|CANVAS)$/.test(el.tagName)) kind = 'a picture';
        else if (el.tagName !== 'PICTURE') {
          const c = css(el);
          if (/url\(/.test(c.backgroundImage) && /cover|contain|%/.test(c.backgroundSize) && !/\.svg/i.test(c.backgroundImage)) kind = 'a picture';
          else { const f = rgb(c.backgroundColor); if ((f && f[3] >= 0.5 && [0, 1, 2].some((i) => Math.abs(f[i] - ground(el.parentElement || document.body)[i]) >= 6)) || sides(el) >= 3) kind = 'a box'; }
        }
        if (!kind || opacityOf(el) < 0.5) continue;
        let r = el.getBoundingClientRect();
        // (a product window drawn by what is inside it, its own box clear: its extent is what it draws)
        if (kind === 'a product window') {
          const painted = (x) => { const c = css(x), f = rgb(c.backgroundColor); return (f && f[3] >= 0.5) || sides(x) >= 1 || c.boxShadow !== 'none' || /url\(/.test(c.backgroundImage) || /^(IMG|VIDEO|CANVAS)$/.test(x.tagName); };
          if (!painted(el)) { const rs = [...el.querySelectorAll('*')].slice(0, 400).filter((x) => painted(x) || [...x.childNodes].some((t) => t.nodeType === 3 && t.nodeValue.trim())).map((x) => x.getBoundingClientRect()).filter((q) => q.width > 2 && q.height > 2); if (!rs.length) continue; r = { left: Math.min(...rs.map((q) => q.left)), right: Math.max(...rs.map((q) => q.right)), top: Math.min(...rs.map((q) => q.top)), bottom: Math.max(...rs.map((q) => q.bottom)) }; r.width = r.right - r.left; r.height = r.bottom - r.top; }
        }
        if (r.bottom <= 0 || r.top >= H || r.width < 120 || r.height < 56 || r.width * r.height < W * H * 0.02) continue;
        if (/fixed|sticky/.test(css(el).position) && r.height < H * 0.3) continue;
        // (a row that scrolls sideways is the sideways-rail's business; a running scene is looked at at its end)
        let rail = false; for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) if (/auto|scroll/.test(css(e).overflowX) && e.scrollWidth > e.clientWidth + 8) { rail = true; break; }
        if (rail || unfinished(sceneOf(el))) continue;
        const c = meet(clipsOf(el)); const fb = { l: Math.max(r.left, c.l), r: Math.min(r.right, c.r), t: Math.max(r.top, c.t), b: Math.min(r.bottom, c.b) };
        if (fb.r - fb.l < 120 || fb.b - fb.t < 56) continue;
        const L = fb.l <= 1, R = fb.r >= W - 1;
        if (L === R) continue;
        // (shown where it lies: three of nine points of its frame on the screen are its own, not under a layer or a cover)
        const vb = { l: Math.max(fb.l, 0), r: Math.min(fb.r, W), t: Math.max(fb.t, 0), b: Math.min(fb.b, H) };
        if (vb.r - vb.l < 24 || vb.b - vb.t < 24) continue;
        let hits = 0; for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.2, 0.5, 0.8]) if (shownAt(el, vb.l + (vb.r - vb.l) * fx, vb.t + (vb.b - vb.t) * fy)) hits++;
        if (hits < 3) continue;
        // (a band of panels side by side from edge to edge, r8-p39's three rooms, is full-bleed as a row)
        // (the panels each painted: a fill, a photograph for a background, or a picture over most of it; a column of text
        // beside a picture is a split, not a band)
        const panel = (s) => { const c = css(s), f = rgb(c.backgroundColor); if ((f && f[3] >= 0.5) || /url\(/.test(c.backgroundImage) || /^(IMG|VIDEO|CANVAS|PICTURE)$/.test(s.tagName)) return true; const q = s.getBoundingClientRect(); return [...s.querySelectorAll('img, video, canvas')].some((m) => { const p = m.getBoundingClientRect(); return p.width * p.height >= q.width * q.height * 0.6; }); };
        // (round 11, the demos: a row of pictures carried past both sides, speed-bent-row's prints, is a band too: the walk
        // goes up to the row's own list, six levels, and the panels stand side by side, not one behind the other)
        let band = false;
        for (let e = el, i = 0; e && e.parentElement && e.parentElement !== document.body && i < 6 && !band; e = e.parentElement, i++) {
          const row = [...e.parentElement.children].filter(panel).map((s) => s.getBoundingClientRect()).filter((q) => q.width > 8 && Math.min(q.bottom, fb.b) - Math.max(q.top, fb.t) > (fb.b - fb.t) * 0.5).sort((a, b) => a.left - b.left);
          const side = row.every((q, k) => !k || q.left >= row[k - 1].right - 8);
          if (row.length >= 2 && side && row[0].left <= 1 && Math.max(...row.map((q) => q.right)) >= W - 1) band = true;
        }
        if (band) continue;
        // (a row of its kind carried past one side by a scene, speed-bent-row's prints at the end of their run, is the scene's
        // travel; a still row cut by one side, outside a scene, is counted)
        if (sceneKey(el)) {
          let kin = false;
          for (let e = el, i = 0; e && e.parentElement && e.parentElement !== document.body && i < 6 && !kin; e = e.parentElement, i++) {
            const q = e.getBoundingClientRect();
            kin = [...e.parentElement.children].some((s) => { if (s === e || s.tagName !== e.tagName || String(s.className) !== String(e.className)) return false; const o = s.getBoundingClientRect(); return o.width > 8 && Math.min(o.bottom, q.bottom) - Math.max(o.top, q.top) > Math.min(o.height, q.height) * 0.5 && (o.left >= q.right - 8 || q.left >= o.right - 8) && Math.abs(o.width - q.width) <= Math.max(o.width, q.width) * 0.5; });
          }
          if (kin) continue;
        }
        // (a field of colour as tall as its section is that section's ground split in two, not an object: a sticky half of
        // a features section)
        // (and a sticky field that fills the screen's height, R2's "Fixed output, live controls" left half, is that ground held)
        if (kind === 'a box' && r.width >= W * 0.3) {
          const s = el.parentElement?.closest('section, [data-scene], footer, header, main > *'); const q = s ? s.getBoundingClientRect() : null;
          if (q && Math.abs(r.top - q.top) <= 4 && Math.abs(r.bottom - q.bottom) <= 4) continue;
          let held = false; for (let e = el, i = 0; e && e !== document.body && i < 3; e = e.parentElement, i++) if (css(e).position === 'sticky') { held = true; break; }
          if (held && r.height >= H * 0.85) continue;
        }
        // (how far its frame runs past the side: a picture sized past a window that clips it flush with the screen's side,
        // scroll-turned-drum's last picture, is flush, not cut)
        // (a frame as tall as its section, as tall as the screen from its top to its foot (scroll-turned-drum's last picture
        // while its stage holds), or held sticky at the screen's height, is half of a split: the half-bleed picture that
        // edge-run warns on; a picture in the middle of its section, ground above and under it, is an object)
        const sq = el.parentElement?.closest('section, [data-scene], footer, header, main > *')?.getBoundingClientRect();
        let stuck = false; for (let e = el, i = 0; e && e !== document.body && i < 3; e = e.parentElement, i++) if (css(e).position === 'sticky') { stuck = true; break; }
        const fullH = (!!sq && Math.abs(fb.t - sq.top) <= 4 && Math.abs(fb.b - sq.bottom) <= 4) || (fb.t <= 1 && fb.b >= H - 1) || (stuck && fb.b - fb.t >= H * 0.85);
        found.push({ el, kind, r, fb, side: L ? 'left' : 'right', past: Math.round(L ? Math.max(0, -Math.max(r.left, c.l)) : Math.max(0, Math.min(r.right, c.r) - W)), round: radius(el) >= 4, fullH });
      }
      for (const f of found) {
        if (found.some((g) => g !== f && g.el.contains(f.el))) continue;
        // (a box round the product's window, both at the same edge, is the window's own frame)
        if (f.kind !== 'a product window' && found.some((g) => g !== f && f.el.contains(g.el) && g.kind === 'a product window' && g.side === f.side)) f.kind = 'a product window';
        const inner = Math.round(f.side === 'left' ? W - f.fb.r : f.fb.l);
        edges.push({ id: idOf(f.el), what: f.kind, text: norm(f.el.getAttribute('alt') || (f.el.innerText || '')).slice(0, 40) || desc(f.el), side: f.side, past: f.past, round: f.round, fullH: f.fullH, w: Math.round(f.fb.r - f.fb.l), h: Math.round(f.fb.b - f.fb.t), share: +((f.fb.r - f.fb.l) / W).toFixed(2), inner, t: Math.round(f.fb.t), fl: Math.round(f.fb.l), fr: Math.round(f.fb.r), scene: sceneKey(f.el) });
        if (edges.length >= 12) break;
      }
    }
    // --- round 11f: a button whose ground is a photograph (button-on-photo; r14-p63's Send request on a moor, away from
    // its form): a link or a button drawn as one (an opaque fill or an outline on three sides), 28 to 96px tall and of
    // six words or fewer, wholly on the screen, with a photograph or a film under three quarters of 16 points on a ring
    // 16px round it. The inspector photographs the screen and measures how busy the picture is round it (photoBusy), the
    // words, the controls and the drawings that stand round the button left out (its mask): a line over a calm sky and the
    // button beside it are not the photograph
    const strands = [];
    {
      let marks = null;
      const marksOf = () => {
        if (marks) return marks; marks = [];
        const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT), rg = document.createRange(); let k = 0;
        for (let n = tw.nextNode(); n && k < 4000; n = tw.nextNode()) { const e = n.parentElement; if (!e || !n.nodeValue.trim() || e.closest('script, style, noscript, template') || opacityOf(e) <= 0.1) continue; k++; rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width >= 1 && q.bottom > 0 && q.top < H) marks.push(q); }
        // (a control or a drawing the size of a button or an icon, never a link round a picture)
        for (const e of scope.querySelectorAll('a[href], button, [role=button], input, select, textarea, svg')) { const q = e.getBoundingClientRect(); if (q.width >= 4 && q.height >= 4 && q.height <= 160 && q.width <= W * 0.6 && q.bottom > 0 && q.top < H && opacityOf(e) > 0.1 && !e.querySelector('img, video, picture')) marks.push(q); }
        return marks;
      };
      const fill = (e) => { const m = css(e).backgroundColor.match(/rgba?\(([^)]+)\)/); const p = m ? m[1].split(/[,\s/]+/).filter(Boolean).map(Number) : []; return p.length >= 3 && (p.length < 4 || p[3] >= 0.5); };
      const outlined = (e) => { const c = css(e); return ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(c[`border${s}Width`]) >= 1 && c[`border${s}Style`] !== 'none').length >= 3; };
      const photo = (e) => /^(IMG|VIDEO)$/.test(e.tagName) ? !/\.svg(\?|#|$)/i.test(e.currentSrc || e.src || '') : /url\(/.test(css(e).backgroundImage) && !/\.svg/i.test(css(e).backgroundImage) && /cover|contain|%/.test(css(e).backgroundSize);
      for (const el of scope.querySelectorAll('a[href], button, [role=button], input[type=submit]')) {
        if (strands.length >= 8) break;
        if (el.closest('nav, dialog, [role=dialog], [data-ui], [aria-hidden=true], [role=banner]') || bar(el) || opacityOf(el) < 0.5) continue;
        const r = el.getBoundingClientRect(); if (r.height < 28 || r.height > 96 || r.width < 40 || r.width > W * 0.6 || r.top < 0 || r.bottom > H || r.left < 0 || r.right > W) continue;
        const text = norm(el.innerText || el.value || ''); if (!/\p{L}/u.test(text) || words(text) > 6 || el.querySelector('img, video, picture, h1, h2, h3, h4')) continue;
        if (!fill(el) && !outlined(el) && ![...el.children].some((c) => { const q = c.getBoundingClientRect(); return q.height >= r.height * 0.8 && (fill(c) || outlined(c)); })) continue;
        let n = 0, on = 0, media = null;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2, x = (r.left + r.right) / 2 + Math.cos(a) * (r.width / 2 + 16), y = (r.top + r.bottom) / 2 + Math.sin(a) * (r.height / 2 + 16);
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          n++;
          for (const e of document.elementsFromPoint(x, y)) { if (e === el || el.contains(e)) continue; if (opacityOf(e) >= 0.5 && photo(e)) { on++; media = media || (e.currentSrc || e.src || (css(e).backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1] || '').split('/').pop().split('?')[0].slice(0, 48); break; } if (paints(e)) break; }
        }
        if (n < 10 || on / n < 0.75) continue;
        // (a submit button that stands outside the form it sends)
        const away = !!el.form && !el.form.contains(el);
        const mask = marksOf().filter((q) => q.right > r.left - 44 && q.left < r.right + 44 && q.bottom > r.top - 44 && q.top < r.bottom + 44).slice(0, 80).map((q) => [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)]);
        strands.push({ id: idOf(el), text: text.slice(0, 40), media, away, l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), mask, scene: sceneKey(el) });
      }
    }
    const clip = clipped();
    // each running scene or pinned stage in view: where its words and pictures are (a picture by its frame), so phase 1
    // can tell a stage resting on a step from one in the middle of a change (cards in flight, words coming in)
    const stageOf = (el) => { const s = el.closest('.scene.is-live, .pin-spacer'); return s ? idOf(s) : 0; };
    for (const p of pics) p.stage = stageOf(S.els.get(p.id)?.deref() || document.body);
    for (const x of headList) x.stage = stageOf(S.els.get(x.id)?.deref() || document.body);
    for (const x of edges) x.stage = stageOf(S.els.get(x.id)?.deref() || document.body);
    for (const x of strands) x.stage = stageOf(S.els.get(x.id)?.deref() || document.body);
    const stages = [...document.querySelectorAll('.scene.is-live, .pin-spacer')].filter((s) => { const r = s.getBoundingClientRect(); return r.bottom > 0 && r.top < H; });
    const snap = (list) => list.map(([e, s]) => {
      const media = /^(IMG|VIDEO|CANVAS)$/.test(e.tagName); let r = e.getBoundingClientRect();
      if (media) { const c = meet(clipsOf(e)); r = { left: Math.max(r.left, c.l), top: Math.max(r.top, c.t), width: Math.min(r.right, c.r) - Math.max(r.left, c.l), height: Math.min(r.bottom, c.b) - Math.max(r.top, c.t) }; }
      return [e, s, [r.left, r.top, r.width, r.height, opacityOf(e)].map((v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0))];
    });
    if (opts.phase !== 1) {
      const parts = [];
      for (const s of stages) { let n = 0; for (const e of s.querySelectorAll('*')) { if (++n > 600) break; if (/^(IMG|VIDEO|CANVAS)$/.test(e.tagName) || [...e.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim())) parts.push([e, idOf(s)]); } }
      window.__tsRestA = { sy, clip, pics, heads: headList, parts: snap(parts), seen: [...headList.map((x) => x.text), ...pics.map((p) => 'pic:' + p.id)], veils, cutHeads, edges, strands };
      return { y: sy, n: clip.length + pics.length + headList.length };
    }
    // --- phase 1: keep what held still since phase 0 (it moved with the page, by the scroll between the two looks, or
    // stayed where it was), with phase 0's numbers. A stage on which anything changed is between two steps: nothing on
    // it is at rest.
    const A = window.__tsRestA; window.__tsRestA = null;
    if (!A) return null;
    const dy = sy - A.sy;
    const still = (t0, t1) => Math.abs(t1 - t0) <= 2 || Math.abs(t1 - (t0 - dy)) <= 2;
    const moving = new Set();
    for (const [[e, s, a], [, , b]] of A.parts.map((x) => [x, snap([[x[0], x[1]]])[0]])) {
      if (moving.has(s) || (a[4] < 0.05 && b[4] < 0.05) || (a[2] < 1 && b[2] < 1)) continue;
      if (!(still(a[1], b[1]) && Math.abs(a[0] - b[0]) <= 2 && Math.abs(a[2] - b[2]) <= 2 && Math.abs(a[3] - b[3]) <= 2 && Math.abs(a[4] - b[4]) <= 0.05)) moving.add(s);
    }
    const by = (list) => new Map(list.map((x) => [x.id, x]));
    const C = by(clip), P = by(pics), Hd = by(headList);
    return {
      y: A.sy, dy, seen: A.seen, moving: moving.size,
      clipped: A.clip.filter((a) => { const b = C.get(a.id); return b && still(a.top, b.top) && Math.abs(a.past - b.past) <= 3 && Math.abs(a.op - b.op) <= 0.1; }),
      pics: A.pics.filter((a) => { const b = P.get(a.id); return b && !moving.has(a.stage) && still(a.t, b.t) && Math.abs(a.l - b.l) <= 2 && Math.abs(a.w - b.w) <= 3 && Math.abs(a.h - b.h) <= 3 && Math.abs(a.hits - b.hits) <= 2 && Math.abs(a.op - b.op) <= 0.1; }),
      heads: A.heads.filter((a) => { const b = Hd.get(a.id); return b && !moving.has(a.stage) && still(a.t, b.t) && Math.abs(a.l - b.l) <= 2 && a.text === b.text; }),
      // (a veil seen in both looks; a heading cut while its stage held still, the page moving under it)
      veils: (A.veils || []).filter((a) => veils.some((b) => b.media === a.media && b.what === a.what)),
      cutHeads: (A.cutHeads || []).filter((a) => { const b = cutHeads.find((x) => x.id === a.id); return b && dy !== 0 && Math.abs(b.st - a.st) <= 2; }),
      // (an object at one side of the screen in both looks, its frame where it was: it moved with the page or held)
      edges: (A.edges || []).filter((a) => { const b = edges.find((x) => x.id === a.id); return b && !moving.has(a.stage) && still(a.t, b.t) && Math.abs(a.fl - b.fl) <= 2 && Math.abs(a.fr - b.fr) <= 2; }),
      // (a button on a photograph in both looks, where it stands now: the inspector photographs this screen)
      strands: (A.strands || []).map((a) => { const b = strands.find((x) => x.id === a.id); return b && !moving.has(a.stage) && still(a.t, b.t) && Math.abs(a.l - b.l) <= 2 ? b : null; }).filter(Boolean),
    };
  } finally { hitStyle.remove(); }
}

// How busy a photograph is round each button restLook() found on one (button-on-photo), from a screenshot: the band 8 to
// 40px outside the button, sampled every 2px, as the mean change of luma between a pixel and the ones 2px right of it
// and under it (0 to 255: a clear sky or fog under 4, a meadow or a hillside 6 to 11, scrub or stones 12 and over).
// The photograph alone: a pixel within 4px of the words, controls or drawings in its mask is left out (round 11f).
// Runs inside any page; takes [dataUrl, rects].
export async function photoBusy([src, rects]) {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
  const luma = (i, j) => { const k = (j * W + i) * 4; return 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]; };
  return rects.map((r) => {
    let sum = 0, n = 0;
    const masked = (i, j) => (r.mask || []).some(([l, t, rr, b]) => i >= l - 4 && i <= rr + 4 && j >= t - 4 && j <= b + 4);
    for (let j = Math.max(0, r.t - 40); j < Math.min(H - 2, r.t + r.h + 40); j += 2) for (let i = Math.max(0, r.l - 40); i < Math.min(W - 2, r.l + r.w + 40); i += 2) {
      if ((i > r.l - 8 && i < r.l + r.w + 8 && j > r.t - 8 && j < r.t + r.h + 8) || masked(i, j)) continue;
      const v = luma(i, j); sum += (Math.abs(v - luma(i + 2, j)) + Math.abs(v - luma(i, j + 2))) / 2; n++;
    }
    return n >= 200 ? Math.round((sum / n) * 10) / 10 : null;
  });
}

// Where to stop for a look at rest: the walk's screens, and the end of each running scene or pinned stage (its foot
// on the foot of the screen, where its last frame holds).
// A stop just before a stage starts to hold is moved onto the hold, so the short scroll after the first look does not
// carry the stage from the flow into its hold (everything on it would seem to move).
export function restStops(stride) {
  const H = innerHeight, max = Math.max(0, document.scrollingElement.scrollHeight - H), sy = scrollY || 0, nudge = Math.max(24, Math.round(H * 0.03));
  const held = [...document.querySelectorAll('.scene.is-live, .pin-spacer')].map((s) => { const r = s.getBoundingClientRect(); return { top: Math.round(r.top + sy), bottom: Math.round(r.bottom + sy), id: s.dataset.scene || s.id || 'scene' }; });
  const ys = [];
  for (let y = 0; y <= max + 1; y += stride * H) { let v = Math.min(max, Math.round(y)); for (const s of held) if (v > s.top - nudge - 16 && v < s.top + 4) v = Math.min(max, s.top + 4); ys.push(v); }
  if (ys[ys.length - 1] < max - H * 0.15) ys.push(max);
  const ends = held.map((s) => ({ y: Math.min(max, Math.max(0, s.bottom - H)), id: s.id })).filter((e) => e.y > 0);
  return { ys, ends };
}

// Scroll to y and let the page come to rest: smooth scrolling put to the spot at once, then every running finite
// animation, transition and tween (GSAP) waited out, two seconds at most.
export async function restGo(y) {
  const L = (window.Stage && window.Stage.lenis) || window.lenis || window.__lenis || null;
  try { if (L && L.scrollTo) L.scrollTo(y, { immediate: true, force: true }); else window.scrollTo({ top: y, behavior: 'instant' }); } catch { window.scrollTo(0, y); }
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await frame();
  const busy = () => {
    const css = (document.getAnimations ? document.getAnimations() : []).some((a) => a.playState === 'running' && a.effect && (a.effect.getComputedTiming().endTime || 0) !== Infinity && !(a.timeline && a.timeline.constructor && /ScrollTimeline|ViewTimeline/.test(a.timeline.constructor.name)));
    let tw = false;
    try { tw = !!(window.gsap && gsap.globalTimeline.getChildren(true, true, false).some((t) => t.isActive() && t.totalDuration() < 30 && (t.repeat ? t.repeat() !== -1 : true))); } catch {}
    return css || tw;
  };
  const t0 = performance.now();
  await new Promise((r) => setTimeout(r, 450));
  while (busy() && performance.now() - t0 < 2000) await new Promise((r) => setTimeout(r, 120));
  await frame();
  return Math.round(scrollY || document.scrollingElement.scrollTop || 0);
}

// template-hero: the first screen as the generic stack. A centred h1 (centred text whose lines sit within 5% of the
// screen's middle, or a block of lines centred so and not running edge to edge), a line under it, two actions side by
// side under that (a button and a text link, or two buttons), and a picture card under or beside them that is
// rounded (8px or more) and narrower than the screen (under 94% of it: r9-p44's card was 93% at 1440). Round 11
// (r10-p47): the actions are optional, and a row of two or three cards under the line stands for the picture card. The
// headline, the line and the card or cards together are the stack.
export function heroStack() {
  const W = innerWidth, H = innerHeight;
  const seen = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.5) return false; } const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const words = (t) => (norm(t).match(/\S+/g) || []).length;
  const h1 = [...document.querySelectorAll('h1')].find((h) => { const r = h.getBoundingClientRect(); return r.top < H * 0.9 && r.bottom > 0 && seen(h); });
  if (!h1) return null;
  const rg = document.createRange(); rg.selectNodeContents(h1);
  const lines = [...rg.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
  if (!lines.length) return null;
  const U = { l: Math.min(...lines.map((r) => r.left)), r: Math.max(...lines.map((r) => r.right)), t: Math.min(...lines.map((r) => r.top)), b: Math.max(...lines.map((r) => r.bottom)) };
  const mid = (U.l + U.r) / 2, hcs = getComputedStyle(h1), size = parseFloat(hcs.fontSize);
  const centred = Math.abs(mid - W / 2) <= W * 0.05 && (hcs.textAlign === 'center' || U.l > W * 0.1);
  const out = { h1: norm(h1.innerText).slice(0, 60), centred, size: Math.round(size) };
  const overlapX = (a, b) => Math.max(0, Math.min(a.right, b.r) - Math.max(a.left, b.l));
  // the line under it: four words or more, smaller, starting within a quarter of a screen under the headline, in its column
  // (the site's bar is outside the hero; a hero set in a <header> is the hero)
  const bar = (el) => { const b = el.closest('header'); return !!b && !b.contains(h1) && b.getBoundingClientRect().height < H * 0.3; };
  const outside = (el) => bar(el) || el.closest('nav, footer, [role=banner], [data-ui], dialog') || h1.contains(el);
  const sub = [...document.querySelectorAll('p, h2, div, span')].filter((el) => {
    if (outside(el) || el.closest('a, button') || !seen(el)) return false;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(' ');
    if (words(own) < 4 || parseFloat(getComputedStyle(el).fontSize) > size * 0.8) return false;
    const r = el.getBoundingClientRect(); return r.top >= U.b - 4 && r.top - U.b <= H * 0.25 && overlapX(r, U) >= r.width * 0.5;
  }).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  if (!sub) return out;
  const S = sub.getBoundingClientRect();
  out.sub = norm(sub.innerText).slice(0, 60);
  // two actions side by side under it, one of them at least a button (a filled or outlined box, or a <button>)
  const bg = (cs) => { const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const p = m ? m[1].split(/[,\s/]+/).filter(Boolean) : []; return p.length >= 3 && (p.length < 4 || parseFloat(p[3]) >= 0.5); };
  const buttonLike = (el) => { const cs = getComputedStyle(el); return el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || bg(cs) || (parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== 'none' && parseFloat(cs.borderLeftWidth) >= 1); };
  const acts = [...document.querySelectorAll('a[href], button')].filter((el) => {
    if (outside(el) || el.parentElement?.closest('a, button') || !seen(el)) return false;
    const n = words(el.innerText); if (n < 1 || n > 7) return false;
    const r = el.getBoundingClientRect(); return r.top >= S.bottom - 4 && r.top - S.bottom <= H * 0.25 && r.top < H;
  }).map((el) => ({ el, r: el.getBoundingClientRect() }));
  let row = null;
  for (const a of acts) {
    const same = acts.filter((b) => Math.abs((b.r.top + b.r.bottom) / 2 - (a.r.top + a.r.bottom) / 2) <= 14);
    if (same.length === 2 && same.some((x) => buttonLike(x.el))) { row = same.sort((p, q) => p.r.left - q.r.left); break; }
  }
  // (round 11, r10-p47: the actions are not needed; the stack is the centred headline and line over the cards)
  const R = row ? { l: Math.min(...row.map((x) => x.r.left)), r: Math.max(...row.map((x) => x.r.right)), t: Math.min(...row.map((x) => x.r.top)), b: Math.max(...row.map((x) => x.r.bottom)) } : { l: S.left, r: S.right, t: S.top, b: S.bottom };
  if (row) out.actions = row.map((x) => norm(x.el.innerText).slice(0, 30) + (buttonLike(x.el) ? ' (button)' : ' (link)'));
  // the picture card: a photograph (img, video, a box with a photograph for its background) in a frame rounded 8px or
  // more that is about the picture's own size, a quarter of the width or more, starting on the first screen, under the
  // actions (within about a third of a screen) or beside the stack
  const stack = { l: Math.min(U.l, S.left, R.l), r: Math.max(U.r, S.right, R.r), t: U.t, b: R.b };
  const radius = (cs) => Math.min(...['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'].map((k) => parseFloat(cs[k]) || 0));
  let card = null;
  // (a file named by numbers, picsum's id/869/900/1600, by its numbers and the word before them)
  const srcName = (u) => { const p = String(u).replace(/^url\(["']?/, '').split(/[?#)"']/)[0].split('/'); let i = p.length - 1; while (i > 0 && p.length - i <= 3 && /^\d+$/.test(p[i])) i--; if (i < p.length - 1 && (/^(id|seed)$/i.test(p[i]) || /\./.test(p[i]))) i++; return p.slice(i).join('/').slice(-48); };
  const pics = [...document.querySelectorAll('img, video, picture, canvas, figure, div, section, a')].filter((el) => {
    if (bar(el) || el.closest('nav, [role=banner], [data-ui]')) return false;
    if (/^(IMG|VIDEO|CANVAS)$/.test(el.tagName)) return true;
    if (el.tagName === 'PICTURE') return false;
    return /url\(/.test(getComputedStyle(el).backgroundImage);
  });
  for (const p of pics) {
    if (!seen(p)) continue;
    const pr = p.getBoundingClientRect();
    for (let e = p, i = 0; e && i < 4 && e !== document.body; e = e.parentElement, i++) {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      const shown = (Math.min(r.right, pr.right) - Math.max(r.left, pr.left)) * (Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top));
      if (!(shown > 0) || r.width * r.height > shown * 1.3) break; // a frame much larger than the picture is a band, not its card
      const rad = radius(cs);
      if (rad < 8) continue;
      if (r.width < W * 0.25 || r.height < H * 0.15 || r.top >= H || r.width >= W * 0.94) break;
      const under = r.top >= R.b - 8 && r.top - R.b <= H * 0.35;
      const beside = overlapX(r, stack) < r.width * 0.2 && Math.min(r.bottom, stack.b) - Math.max(r.top, stack.t) > 0;
      if (under || beside) card = { src: srcName(p.currentSrc || p.src || getComputedStyle(p).backgroundImage || ''), radius: Math.round(rad), w: +(r.width / W).toFixed(2), where: under ? 'under them' : 'beside them' };
      break;
    }
    if (card) break;
  }
  if (card) out.card = card;
  // a row of two or three cards under the stack (r10-p47: two portrait pictures, "For brands" and "For studios", under
  // the centred name): side by side, each a quarter of the screen tall or more and under 45% of its width, each a picture
  // or a box with a fill, starting within a third of a screen under the line or the actions and on the first screen
  if (!card) {
    const filled = (el) => bg(getComputedStyle(el)) && (() => { const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/); const p = m ? m[1].split(/[,\s/]+/).filter(Boolean).map(Number) : []; let g = null; for (let e = el.parentElement; e && !g; e = e.parentElement) { const n = getComputedStyle(e).backgroundColor.match(/rgba?\(([^)]+)\)/); const q = n ? n[1].split(/[,\s/]+/).filter(Boolean).map(Number) : []; if (q.length >= 3 && (q.length < 4 || q[3] >= 0.9)) g = q; } g = g || [255, 255, 255]; return [0, 1, 2].some((i) => Math.abs(p[i] - g[i]) >= 6); })();
    const cand = [...document.querySelectorAll('a, article, li, figure, div, span')].filter((el) => {
      if (bar(el) || el.closest('nav, [role=banner], [data-ui], dialog') || !seen(el)) return false;
      const r = el.getBoundingClientRect(); if (r.top < R.b - 8 || r.top - R.b > H * 0.35 || r.top >= H * 0.92 || r.height < H * 0.25 || r.width < W * 0.12 || r.width > W * 0.45) return false;
      return !!el.querySelector('img, video, picture, canvas') || /url\(/.test(getComputedStyle(el).backgroundImage) || filled(el);
    }).map((el) => ({ el, r: el.getBoundingClientRect() }));
    // (the outermost of each card; a box that holds two cards side by side is the row, not a card)
    const row2 = (c) => { const ins = cand.filter((d) => d !== c && c.el.contains(d.el)); return ins.some((a) => ins.some((b) => a !== b && !a.el.contains(b.el) && !b.el.contains(a.el) && (b.r.left >= a.r.right - 4 || a.r.left >= b.r.right - 4))); };
    const cards = cand.filter((c) => !row2(c));
    const outer = cards.filter((c) => !cards.some((d) => d !== c && d.el.contains(c.el)));
    for (const a of outer) {
      const rowC = outer.filter((b) => Math.abs(b.r.top - a.r.top) <= 16 && Math.abs(b.r.height - a.r.height) <= a.r.height * 0.25);
      if (rowC.length >= 2 && rowC.length <= 3) { const img = rowC[0].el.querySelector('img, video'); out.cards = { n: rowC.length, w: +(rowC[0].r.width / W).toFixed(2), src: img ? srcName(img.currentSrc || img.src || '') : rowC[0].el.tagName.toLowerCase(), radius: Math.round(radius(getComputedStyle(rowC[0].el))) }; break; }
    }
  }
  out.stack = !!(out.centred && out.sub && (out.card || out.cards));
  return out;
}

// visit-without-directions: a block that reads as a visit (a heading such as Visit, Find us, Opening hours, Hours,
// Besuch, Anfahrt, Getting here over days, a time, a phone or an email; or a run of opening hours) with no link to a
// maps service and no street or district line, in it or in the footer, and no street or map link anywhere else on the
// page. A city alone ("Open in Berlin") is not an address.
export function visitBlocks() {
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const seen = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 2 && r.height > 2; };
  const HEAD = /^\s*(visit\b|visiting\b|find us\b|finding us\b|how to find us\b|where to find us\b|where we are\b|opening (hours|times)\b|hours\b|our hours\b|getting (here|there)\b|how to get (here|there)\b|location\b|directions\b|besuch|anfahrt\b|so finden sie uns\b|öffnungszeiten\b|wegbeschreibung\b)/i;
  // day names written out (any case), or shortened with a capital (Mon, Tue; Mo–Fr): "sun" and "do" in a sentence are not days
  const DAY = /\b([Mm]onday|[Tt]uesday|[Ww]ednesday|[Tt]hursday|[Ff]riday|[Ss]aturday|[Ss]unday|[Ww]eekdays|[Ww]eekends|[Dd]aily|[Mm]ontag|[Dd]ienstag|[Mm]ittwoch|[Dd]onnerstag|[Ff]reitag|[Ss]amstag|[Ss]onntag|[Ll]undi|[Mm]ardi|[Mm]ercredi|[Jj]eudi|[Vv]endredi|[Ss]amedi|[Dd]imanche|Mon|Tues?|Wed|Thu(rs?)?|Fri|Sat|Sun)\b|\b(Mo|Di|Mi|Do|Fr|Sa|So)\b(?=\.?\s*([–—-]|\d|,))/g;
  const TIME = /\b\d{1,2}([:.]\d{2})?\s*(am|pm|h|uhr)?\s*[–—-]\s*\d{1,2}([:.]\d{2})?\s*(am|pm|h|uhr)?\b|\b(closed|geschlossen|ruhetag)\b/gi;
  const MAPS = /(google\.[a-z.]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl|maps\.apple\.com|openstreetmap\.org|\bosm\.org|bing\.com\/maps|wego\.here\.com|\bhere\.com|citymapper\.com|waze\.com)/i;
  const STREET = [
    /\b[\p{L}.'-]*(stra(ß|ss)e|str\.|weg|platz|allee|gasse|damm|ufer|ring|chaussee|steig|markt|zeile|graben|kai|berg)\s+\d{1,4}\s?[a-z]?\b/iu,
    // (14 Mercer Street, 221B Baker Street, 350 Fifth Avenue: the name words capitalised, the street word either way)
    new RegExp(`\\b\\d{1,5}[a-zA-Z]?,?\\s+(\\p{Lu}[\\p{L}'.-]*\\s+){1,4}(${['street', 'st', 'road', 'rd', 'avenue', 'ave', 'lane', 'ln', 'boulevard', 'blvd', 'drive', 'dr', 'way', 'place', 'pl', 'square', 'sq', 'court', 'ct', 'terrace', 'row', 'quay', 'parade', 'crescent', 'close', 'hill', 'walk', 'highway', 'hwy', 'broadway'].map((w) => `[${w[0].toUpperCase()}${w[0]}]${w.slice(1)}`).join('|')})\\b\\.?`, 'u'),
    /\b\d{1,4}(bis|ter)?,?\s+(rue|avenue|boulevard|bd|place|quai|chemin|impasse|allée|cours|via|viale|piazza|corso|calle|avenida|plaza|paseo|carrer|rua)\b/i,
    /\b(rue|avenue|boulevard|place|quai|via|viale|piazza|corso|calle|avenida|plaza|paseo|carrer|rua)\s+[\p{L}' -]{2,40}?,?\s+\d{1,4}\b/iu,
    /\b[\p{L}-]+(straat|laan|gracht|plein|kade|weg|vej|gade|gatan|vägen|gata|veien|gate|stræti|strasse|braut|stígur|vegur|tie|katu|utca|ulica|ulice)\s+\d{1,4}\s?[a-z]?\b/iu,
    // a postcode and a town at the head of a line or after a comma: 10961 Berlin (not "2026 Kaffee Klee", "1800 MASL",
    // "1200 Bags")
    /(^|[,\n]\s*)(?!(19|20)\d\d\b)\d{4,5}\s+\p{Lu}\p{Ll}+/u,
    /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/, // a British postcode
  ];
  // a street named without its number, as the house rule writes it ("Bergmannstraße, Kreuzberg", "on Mercer Street",
  // "rue de Bretagne"), or the road to a remote place ("Route 61"): read in the block and the footer only
  const NAMED = [
    /\b\p{Lu}[\p{L}-]*(straße|strasse|str\.|allee|gasse|damm|chaussee|ufer|platz)(?=[\s,.;)]|$)/u,
    /\b(\p{Lu}[\p{L}'.-]*\s+){1,3}(Street|St\.|Road|Rd\.|Avenue|Ave\.|Lane|Boulevard|Blvd\.|Drive|Square|Terrace|Quay|Parade|Crescent|Broadway)\b/u,
    /\b([Rr]ue|[Vv]ia|[Vv]iale|[Cc]orso|[Pp]iazza|[Cc]alle|[Aa]venida|[Pp]laza|[Pp]aseo|[Cc]arrer|[Rr]ua|[Qq]uai)\s+((de la|de|du|des|del|della|di|da|do|dos|das)\s+|d['’])?\p{Lu}/u,
    /\b\p{Lu}[\p{L}-]*(straat|laan|gracht|plein|kade|vej|gade|gatan|vägen|gata|veien|katu|utca)\b/u,
    /\b(Route|Road|Highway|Hwy|Ruta|Bundesstraße|Landstraße)\s+\d{1,4}\b/u,
  ];
  const AREA = /\b(district|bezirk|kiez|neighbou?rhood|quarter|viertel|arrondissement|barrio|corner of|ecke|u-?bahn|s-?bahn|tram|metro|subway|underground|tube|station|haltestelle|bahnhof|bus stop|minutes?['’]? walk|gehminuten|minutes?['’]? drive|drive from|by car|parking|parkplatz|car park)\b/i;
  const foot = document.querySelector('footer');
  // (area words, a stop or a district, count in the block and the footer; a street or a map link anywhere on the page:
  // a street set on the hero's picture is still the address)
  const directions = (el, area = true) => {
    if (!el) return false;
    if ([...el.querySelectorAll('a[href], iframe[src]')].some((a) => MAPS.test(a.getAttribute('href') || a.getAttribute('src') || ''))) return true;
    if (el.querySelector('[itemprop=streetAddress], [itemprop=postalCode]')) return true;
    // the block's own lines, its headings aside (a heading "Getting here" is not a direction)
    const lines = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) { const p = n.parentElement; if (!p || p.closest('h1, h2, h3, h4, h5, h6, script, style, nav, [aria-hidden=true]') || !seen(p)) continue; const t = norm(n.nodeValue); if (t) lines.push(t); }
    const all = lines.join(' \n ');
    // (an <address> with a number once its email and phone are taken out: a phone and an email are not directions)
    return STREET.some((re) => re.test(all)) || (area && (AREA.test(all) || NAMED.some((re) => re.test(all)))) || [...el.querySelectorAll('address')].some((a) => /\d/.test(a.textContent.replace(/\S+@\S+/g, ' ').replace(/\+?\d[\d\s()./-]{6,}\d/g, ' ')));
  };
  const anywhere = directions(document.body, false);
  const blockOf = (el) => el.closest('section, article, aside, footer, [data-scene]') || el.parentElement?.parentElement || el.parentElement;
  const blocks = new Map();
  for (const h of document.querySelectorAll('h1, h2, h3, h4')) {
    if (!seen(h) || h.closest('nav, header, [data-ui], dialog')) continue;
    const t = norm(h.innerText); if (!HEAD.test(t) || t.split(' ').length > 6) continue;
    // (a block about a place to go also says when or how to reach it: two days, a time, a phone or an email, "open";
    // "Hours, counted for you" on a time sheet and "Location stays on the phone" are not visits)
    const b = blockOf(h), bt = b ? norm(b.innerText) : '';
    const venue = b && ((bt.match(DAY) || []).length >= 2 || (bt.match(TIME) || []).length >= 1 || !!b.querySelector('a[href^="tel:"], a[href^="mailto:"]') || /\b(open|opens|geöffnet|ouvert|abierto)\b/i.test(bt));
    if (venue && !blocks.has(b)) blocks.set(b, { head: t.slice(0, 50), why: 'its heading' });
  }
  for (const s of document.querySelectorAll('section, article, aside, footer, main > div, [data-scene]')) {
    if (blocks.has(s) || s.parentElement?.closest('section, article, aside, footer') || !seen(s) || s.closest('[data-ui]')) continue;
    const text = norm(s.innerText);
    const days = (text.match(DAY) || []).length, times = (text.match(TIME) || []).length;
    if (days >= 3 && times >= 2) { const h = s.querySelector('h1, h2, h3, h4'); blocks.set(s, { head: norm(h ? h.innerText : '').slice(0, 50) || 'opening hours', why: 'a run of opening hours' }); }
  }
  const out = [];
  for (const [b, v] of blocks) {
    if (anywhere || directions(b) || (foot && b !== foot && !foot.contains(b) && directions(foot))) continue;
    const text = norm(b.innerText);
    const days = (text.match(DAY) || []).length, times = (text.match(TIME) || []).length;
    out.push({ ...v, hours: days >= 3 && times >= 2, mail: !!b.querySelector('a[href^="mailto:"]'), phone: !!b.querySelector('a[href^="tel:"]') });
  }
  return out;
}
