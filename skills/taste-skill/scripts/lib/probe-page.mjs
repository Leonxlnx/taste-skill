// Round 10, part B (r9-p41 a notes app, r9-p42 Haulet, r9-p43 Hvít: three pages that won and still read as templates):
// the page as it is built. inspect.mjs runs pageBuild() once at the top of the page after the walk, and once more on the
// reduced-motion page for the scenes' finished compositions; deadControls() runs last, since it uses the page. Every
// function here runs in the page and returns plain JSON.

// pageBuild: what each section is built from and what the page repeats.
//   framed       per section, the framed elements in it: a box with a fill unlike the ground it stands on, a box
//                outlined on three sides or more, or a product window (framed-elements). Buttons, fields, pictures and
//                bands from edge to edge are not frames; boxes that touch are one frame; only the outermost counts.
//   stats        a row of three or more big figures or words, each over a short label (stats-band)
//   emailFields  the email fields on the page outside dialogs (duplicate-form)
//   splits       on desktop, each section in order: a picture beside its text (and how wide the picture is), or not
//                (repeated-split)
//   runOn        on desktop, a split whose left column ends while the right one runs on (empty-left)
//   credits      the pictures shown, the entries of the page's credits list, and the pictures no entry names (credits)
//   opts.scenes  only what is inside scenes (the reduced-motion page shows their finished compositions)
export async function pageBuild(opts = {}) {
  const W = innerWidth, H = innerHeight, sy = scrollY || 0, B = document.body || document.documentElement;
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const visible = (el) => { const cs = css(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const words = (t) => (norm(t).match(/\S+/g) || []).length;
  const textOf = (el) => norm(el.innerText || el.textContent || '');
  // (a fill set with color-mix(), the dealt overlapping cards' tone steps, computes to color(srgb r g b), 0 to 1)
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const groundOf = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.9) return c; } return [255, 255, 255, 1]; };
  const differs = (a, b, d = 6) => !!a && !!b && [0, 1, 2].some((i) => Math.abs(a[i] - b[i]) >= d);
  const sides = (el) => { const cs = css(el); return ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none' && (rgba(cs[`border${s}Color`]) || [0, 0, 0, 0])[3] > 0.05).length; };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const desc = (e) => e.tagName.toLowerCase() + (e.classList && e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '');
  const inScene = (el) => !!el.closest('.scene, [data-scene], .pin-spacer');
  // (a live scene shows a moment of its run, not its composition: it is looked at on the reduced-motion page)
  const keep = (el) => (opts.scenes ? inScene(el) : !inScene(el) || !!el.closest('.scene.is-rest'));
  const headOf = (s) => { const h = s.querySelector('h1, h2, h3, [role=heading]'); return textOf(h || s).slice(0, 50); };
  // (the site's bar: a <header> outside the page's sections)
  const siteBar = (el) => { const b = el.closest('header'); return !!b && !b.parentElement?.closest('main, section, article, [data-scene]'); };
  const bodyPx = parseFloat(css(B).fontSize) || 16;
  const out = {};

  // --- the sections: the page's parts, the nearest section, scene or footer (or a child of main when there is none)
  const sectionOf = (el) => el.closest('section, [data-scene], footer') || [...(document.querySelector('main') || B).children].find((c) => c.contains(el)) || null;

  // --- framed elements, per section. Round 11 (Leon: cards are wanted, they show what belongs together): a card on a
  // fill, a picture-led card, a product window are fine in any number. What is reported: a frame with another frame
  // inside it (boxes in boxes), a box laid on a photograph, a box cut to a shape by a mask or a clip-path (a perforated
  // ticket, a notch), and frames drawn by their outline alone.
  out.framed = [];
  {
    // (a card set as a link counts like any card; buttons and fields are controls)
    const SKIP = /^(BUTTON|INPUT|SELECT|TEXTAREA|LABEL|OPTION|IMG|VIDEO|PICTURE|CANVAS|IFRAME|SVG|HR|BR|SCRIPT|STYLE|SUMMARY)$/i;
    const picTile = (e, r) => [...e.querySelectorAll('img, video, picture, canvas')].some((p) => { const q = p.getBoundingClientRect(); return q.width * q.height >= r.width * r.height * 0.6; });
    // the photographs on the page (an img, a film, a canvas, a box with a photograph for its background), by their frame
    // (a canvas is a scene's field, the dither opener's, not a photograph: as hero-in-card has it)
    const photos = [...B.querySelectorAll('img, video, div, section, figure, span, a, li, article')].filter((p) => {
      if (p.closest('nav, dialog, [role=dialog], [data-ui]') || !visible(p)) return false;
      if (/^(IMG|VIDEO)$/.test(p.tagName)) return !/\.svg(\?|#|$)/i.test(p.currentSrc || p.src || '');
      const bi = css(p).backgroundImage; return !!bi && /url\(/.test(bi) && !/\.svg/i.test(bi) && /cover|contain|%/.test(css(p).backgroundSize);
    }).map((p) => ({ p, r: p.getBoundingClientRect() })).filter((x) => x.r.width * x.r.height >= W * H * 0.04);
    // a box laid on a photograph: half of it or more over a picture that is not inside it and is half as large again (the
    // picture is a frame, so the box is a box in a box: r9-p43's note in the corner of the fjord). A card that overlaps a
    // picture's corner with less than half of itself is the overlapping card the sheet deals.
    const onPhoto = (e, r) => photos.find(({ p, r: q }) => {
      if (e.contains(p) || q.width * q.height < r.width * r.height * 1.5) return false;
      // (a band across the picture's whole width at its foot or its top, a third of its height at most, is a card's foot:
      // R2's poster card, its name on a solid foot of the surface tone)
      if (r.width >= q.width * 0.95 && (Math.abs(r.bottom - q.bottom) <= 4 || Math.abs(r.top - q.top) <= 4) && r.height <= q.height * 0.35) return false;
      const ix = Math.min(q.right, r.right) - Math.max(q.left, r.left), iy = Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top);
      return ix > 0 && iy > 0 && ix * iy >= r.width * r.height * 0.5;
    });
    // a box cut to a shape: a mask, or a clip-path that is not a rectangle (rounded corners are a radius, not a shape)
    const plainClip = (v) => v === 'none' || /^inset\(/.test(v) || (/^polygon\(/.test(v) && v.replace(/^polygon\(|\)$/g, '').split(',').every((pt) => pt.trim().split(/\s+/).every((n) => /^(0|0px|0%|100%|calc\(100%\s*[-+]\s*0px\))$/.test(n))));
    const shapedBy = (e, r) => { for (let x = e, i = 0; x && i < 3; i++) { const c = css(x); if ((c.maskImage && c.maskImage !== 'none') || (c.webkitMaskImage && c.webkitMaskImage !== 'none')) return 'a mask'; if (!plainClip(c.clipPath)) return 'a clip-path'; const kids = [...x.children].filter(visible); if (kids.length !== 1) break; const q = kids[0].getBoundingClientRect(); if (q.width * q.height < r.width * r.height * 0.8) break; x = kids[0]; } return null; };
    const framed = (e) => {
      if (e.matches('[data-ui]') && !e.parentElement?.closest('[data-ui]')) { const g = groundOf(e.parentElement || B), drawn = (x) => { const c = rgba(css(x).backgroundColor); return (c && c[3] >= 0.5 && differs(c, g)) || sides(x) >= 3 || css(x).boxShadow !== 'none'; }; return drawn(e) || (e.children.length === 1 && drawn(e.children[0])) ? 'a product window' : null; }
      const c = rgba(css(e).backgroundColor);
      if (c && c[3] >= 0.5 && differs(c, groundOf(e.parentElement || B))) return 'filled ' + hex(c);
      if (sides(e) >= 3) return 'outlined';
      // (a box in the ground's own colour still reads as a box where it lies on a photograph)
      if (c && c[3] >= 0.5 && onPhoto(e, e.getBoundingClientRect())) return 'ground ' + hex(c);
      return null;
    };
    // a frame inside a frame: a box of its own size class (a fifth of the outer's width or 120px, 40px tall), not a
    // control, not a chip, and not the outer box drawn again (nine tenths of it)
    const innerFrame = (outer, ro) => {
      let k2 = 0;
      for (const x of outer.querySelectorAll('*')) {
        if (++k2 > 600) break;
        if (SKIP.test(x.tagName) || x instanceof SVGElement || /^(TABLE|THEAD|TBODY|TFOOT|TR|TD|TH|CAPTION)$/.test(x.tagName)) continue;
        // (a button drawn as a link inside the card is a control; a table's striped rows are the table's)
        const ctl = x.closest('a, button, [role=button]'); if (ctl && ctl !== outer && outer.contains(ctl) && ctl.getBoundingClientRect().height < 64) continue;
        const q = x.getBoundingClientRect();
        if (q.width < Math.max(80, ro.width * 0.2) || q.height < 40 || q.width * q.height >= ro.width * ro.height * 0.9 || !visible(x)) continue;
        // (a field drawn as one box with its button, a newsletter card's email pill, is a control)
        if (q.height <= 96 && (x.matches('form, [role=search]') || x.querySelector('input:not([type=hidden]), select, textarea'))) continue;
        if (x.parentElement?.closest('[data-ui]') && x.parentElement.closest('[data-ui]') !== outer) continue;
        if (!x.matches('[data-ui]') && picTile(x, q)) continue;
        const how = x.matches('[data-ui]') ? 'a product window' : (() => { const c = rgba(css(x).backgroundColor); if (c && c[3] >= 0.5 && differs(c, groundOf(x.parentElement || outer))) return 'filled ' + hex(c); return sides(x) >= 3 ? 'outlined' : null; })();
        if (how && (textOf(x) || x.querySelector('img, video, canvas, picture'))) return `${textOf(x).slice(0, 24) || desc(x)} (${how}, ${Math.round(q.width)}x${Math.round(q.height)})`;
      }
      return null;
    };
    const bySec = new Map(); const counted = [];
    let k = 0;
    for (const e of B.querySelectorAll('*')) {
      if (++k > 9000) break;
      if (SKIP.test(e.tagName) || e instanceof SVGElement || counted.some((c) => c.contains(e))) continue;
      // (the inside of a product's window is its own interface, judged by fragment-boxes; a bare crop is no frame)
      if (e.closest('nav, dialog, [role=dialog], [aria-hidden=true], header[role=banner]') || e.parentElement?.closest('form, [data-ui]') || siteBar(e) || !keep(e)) continue;
      const cs = css(e); if (/fixed|sticky/.test(cs.position) && e.getBoundingClientRect().height < H * 0.3) continue;
      const r = e.getBoundingClientRect();
      if (r.width < 120 || r.height < 56 || r.width * r.height < W * H * 0.012 || r.width >= W * 0.94) continue;
      // (a link drawn as a button, a few words in a box up to 64px tall, is a control)
      if (e.matches('a, [role=button]') && r.height <= 64 && (textOf(e).match(/\S+/g) || []).length <= 5) continue;
      const how = framed(e); if (!how || !visible(e)) continue;
      if (how !== 'a product window' && picTile(e, r)) continue;
      if (!textOf(e) && !e.querySelector('img, video, canvas, picture')) continue;
      const sec = sectionOf(e); if (!sec || sec === e) continue;
      counted.push(e);
      const it = { e, r, how };
      // (a field that runs to the screen's side and holds the product's window is a ground for it, not a box round it)
      const field = (r.left <= 1 || r.right >= W - 1) && r.width >= W * 0.4;
      if (how !== 'a product window') { it.nested = field ? null : innerFrame(e, r); const ph = onPhoto(e, r); if (ph) it.photo = desc(ph.p); it.shaped = shapedBy(e, r); }
      const list = bySec.get(sec) || []; list.push(it); bySec.set(sec, list);
    }
    const label = (it) => `${textOf(it.e).slice(0, 28) || desc(it.e)} (${it.how}, ${Math.round(it.r.width)}x${Math.round(it.r.height)})`;
    for (const [sec, items] of bySec) {
      // (boxes that touch are drawn as one frame: a ticket's body and its stub, a window's panes)
      const groups = [];
      for (const it of items) {
        const g = groups.find((x) => x.some((y) => y.e.parentElement === it.e.parentElement && Math.max(y.r.left - it.r.right, it.r.left - y.r.right, y.r.top - it.r.bottom, it.r.top - y.r.bottom) <= 3));
        if (g) g.push(it); else groups.push([it]);
      }
      const nested = items.filter((x) => x.nested), photo = items.filter((x) => x.photo), shaped = items.filter((x) => x.shaped);
      const outlined = groups.filter((g) => g.every((x) => x.how === 'outlined'));
      if (groups.length < 2 && !nested.length && !photo.length && !shaped.length) continue;
      const parents = new Map(); for (const g of groups) parents.set(g[0].e.parentElement, (parents.get(g[0].e.parentElement) || 0) + 1);
      out.framed.push({ head: headOf(sec), n: groups.length, list: Math.max(...parents.values()) >= 3, y: Math.round(sec.getBoundingClientRect().top + sy), items: groups.slice(0, 5).map((g) => label(g[0])),
        outlined: outlined.length, nested: nested.slice(0, 3).map((x) => `${label(x)} holds ${x.nested}`), onPhoto: photo.slice(0, 3).map((x) => `${label(x)} on ${x.photo}`), shaped: shaped.slice(0, 3).map((x) => `${label(x)} cut by ${x.shaped}`), shapedN: shaped.length });
      if (out.framed.length >= 8) break;
    }
    // the product windows on the first screen, at the top of the page (r8-p38: four windows round the title, "cluttered,
    // nowhere to look"): the [data-ui] roots that meet the first screen, a clear one drawn by its parts included (two
    // of r8-p38's four are clear wrappers round filled query cards)
    out.heroWindows = [];
    if (!opts.scenes && sy < 2) for (const e of B.querySelectorAll('[data-ui]')) {
      if (e.parentElement?.closest('[data-ui]') || e.closest('nav, dialog, [role=dialog], [aria-hidden=true]') || !visible(e)) continue;
      const r = e.getBoundingClientRect(); if (r.width < 120 || r.height < 56 || r.top >= H || r.bottom <= 0) continue;
      out.heroWindows.push(`${textOf(e).slice(0, 24) || desc(e)} (${Math.round(r.width)}x${Math.round(r.height)})`);
    }
  }
  if (opts.scenes) return out;

  // --- a stats band: a row of three or more items, each a big figure or a word or two set large over a short label
  out.stats = [];
  {
    const big = Math.max(28, bodyPx * 1.6);
    const parts = (item) => {
      const by = []; const tw = document.createTreeWalker(item, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const t = norm(n.nodeValue); if (!t || !n.parentElement || !visible(n.parentElement)) continue; by.push({ t, size: parseFloat(css(n.parentElement).fontSize) || 16 }); }
      if (!by.length) return null;
      const max = Math.max(...by.map((x) => x.size));
      const head = norm(by.filter((x) => x.size === max).map((x) => x.t).join(' ')), rest = norm(by.filter((x) => x.size < max).map((x) => x.t).join(' '));
      const restMax = Math.max(0, ...by.filter((x) => x.size < max).map((x) => x.size));
      if (max < big || !rest || restMax > max * 0.6) return null;
      if (!(words(head) <= 2 || (/\d/.test(head) && words(head) <= 3)) || words(rest) > 8) return null;
      return { head: head.slice(0, 24), rest: rest.slice(0, 40) };
    };
    const seen = [];
    let k = 0;
    for (const p of B.querySelectorAll('*')) {
      if (++k > 9000 || out.stats.length >= 4) break;
      if (p.childElementCount < 3 || p.childElementCount > 8 || seen.some((s) => s.contains(p) || p.contains(s))) continue;
      if (p.closest('nav, footer, form, dialog, [data-ui], [aria-hidden=true], table, .replay') || !keep(p) || !visible(p)) continue;
      const items = [...p.children].filter(visible);
      if (items.length < 3 || items.some((i) => words(textOf(i)) > 14)) continue;
      const ok = items.map((i) => ({ i, r: i.getBoundingClientRect(), x: parts(i) })).filter((x) => x.x);
      if (ok.length < 3 || ok.length < items.length * 0.6) continue;
      if (ok.filter((x) => /^[€$£¥]\s?\d|\d\s?(€|kr|eur|usd|chf)\b/i.test(x.x.head)).length >= 2) continue;
      // (three of them on one row)
      const row = ok.filter((a) => ok.filter((b) => Math.abs(a.r.top - b.r.top) <= 16).length >= 3);
      if (row.length < 3) continue;
      seen.push(p);
      out.stats.push({ n: ok.length, head: headOf(sectionOf(p) || p), items: ok.slice(0, 4).map((x) => `"${x.x.head}" over "${x.x.rest}"`) });
    }
  }

  // --- email fields outside dialogs: one sign-up per page
  out.emailFields = [];
  for (const f of document.querySelectorAll('input[type=email], input[autocomplete=email], input[name*=mail i]')) {
    if (f.type === 'hidden' || f.closest('dialog, [role=dialog], [hidden], details:not([open]), [aria-hidden=true]')) continue;
    if (!f.getClientRects().length || css(f).visibility === 'hidden') continue;
    const form = f.closest('form, section, footer') || f.parentElement;
    const label = (f.labels && f.labels[0] ? textOf(f.labels[0]) : '') || f.placeholder || f.getAttribute('aria-label') || '';
    const btn = form ? [...form.querySelectorAll('button, input[type=submit]')].map((b) => textOf(b) || b.value).find(Boolean) : '';
    out.emailFields.push({ label: label.slice(0, 40), button: (btn || '').slice(0, 24), where: headOf(sectionOf(f) || form || f), y: Math.round(f.getBoundingClientRect().top + sy) });
  }

  // --- the picture/text split of each section, in order (desktop): a picture (a photograph, a film or the product's
  // window) at 6% of the screen or more beside the section's text, in it, or held beside it by a sticky stage in the
  // block round it (r9-p42: the hero, the bike and the loads beside one sticky photograph, then the ride beside its own)
  out.splits = [];
  if (W >= 1100) {
    // (a section may be a column of its own beside a sticky picture: r9-p42's sections are 44% of the width)
    const qual = (s) => { if (!visible(s) || s.closest('nav, dialog, header[role=banner]')) return false; const r = s.getBoundingClientRect(); return r.height >= 160 && r.width >= W * 0.3; };
    const secs = [...document.querySelectorAll('section, [data-scene], [data-hero], main > div, main > article')].filter(qual).filter((s, i, a) => !a.some((o) => o !== s && s.contains(o))).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 30);
    const docR = (r) => ({ l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy });
    const MEDIA = 'img, video, canvas, [data-ui]';
    const pics = [...document.querySelectorAll(MEDIA)].filter((m) => !m.parentElement?.closest('[data-ui]') && !m.closest('nav, dialog, header[role=banner], footer') && m.getClientRects().length).map((m) => {
      // (the picture within the boxes that clip it: a crop zoomed inside its frame keeps the frame)
      const q0 = m.getBoundingClientRect(); const r = { left: q0.left, right: q0.right, top: q0.top, bottom: q0.bottom };
      for (let e = m.parentElement, i = 0; e && e !== B && i < 8; e = e.parentElement, i++) { const c = css(e); if (c.overflowX !== 'visible' || c.overflowY !== 'visible' || c.clipPath !== 'none') { const q = e.getBoundingClientRect(); r.left = Math.max(r.left, q.left); r.right = Math.min(r.right, q.right); r.top = Math.max(r.top, q.top); r.bottom = Math.min(r.bottom, q.bottom); } }
      r.width = r.right - r.left; r.height = r.bottom - r.top;
      if (r.width <= 0 || r.height <= 0 || r.width * r.height < W * H * 0.06) return null;
      // (held by a sticky stage: beside everything in the block that holds the stage)
      let span = docR(r), held = false;
      for (let e = m, i = 0; e && e !== B && i < 5; e = e.parentElement, i++) if (css(e).position === 'sticky' && e.parentElement) { const p = docR(e.parentElement.getBoundingClientRect()); span = { l: r.left, r: r.right, t: p.t, b: p.b }; held = true; break; }
      return { m, span, held };
    }).filter(Boolean);
    for (const s of secs) {
      const sr = docR(s.getBoundingClientRect());
      if (s.closest('.scene.is-live, .pin-spacer')) { out.splits.push({ head: headOf(s), kind: 'scene' }); continue; }
      const tr = []; const tw = document.createTreeWalker(s, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n, k = 0;
      while ((n = tw.nextNode()) && k < 800) { const el = n.parentElement; if (!norm(n.nodeValue) || !el || el.closest('[data-ui], figcaption, button, nav') || !visible(el)) continue; k++; rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 8 && q.height > 4) tr.push(docR(q)); }
      if (tr.length < 2) { out.splits.push({ head: headOf(s), kind: 'none' }); continue; }
      const T = { l: Math.min(...tr.map((q) => q.l)), r: Math.max(...tr.map((q) => q.r)), t: Math.min(...tr.map((q) => q.t)), b: Math.max(...tr.map((q) => q.b)) };
      const beside = pics.filter(({ m, span, held }) => (s.contains(m) || held) && Math.min(span.b, sr.b) - Math.max(span.t, sr.t) >= Math.min(sr.b - sr.t, span.b - span.t) * 0.5);
      if (!beside.length) { out.splits.push({ head: headOf(s), kind: 'none' }); continue; }
      const P = { l: Math.min(...beside.map((x) => x.span.l)), r: Math.max(...beside.map((x) => x.span.r)) };
      const ov = Math.min(P.r, T.r) - Math.max(P.l, T.l), pw = P.r - P.l, tw2 = T.r - T.l;
      if (ov > Math.min(pw, tw2) * 0.15 || pw < W * 0.2 || tw2 < W * 0.15) { out.splits.push({ head: headOf(s), kind: 'other' }); continue; }
      // (the text's column: the section itself when the picture is held beside it, else the text's own width)
      const col = beside.every((x) => !s.contains(x.m)) ? Math.max(tw2, sr.r - sr.l) : tw2;
      out.splits.push({ head: headOf(s), kind: 'split', side: P.l < T.l ? 'left' : 'right', share: +(pw / (pw + col)).toFixed(2) });
    }
  }

  // --- a column that runs out (desktop): in a split of two columns, the left one ends while the right one runs on for
  // a third of a screen or more, so the rest of the right column has nothing beside it (r9-p42's order list)
  out.runOn = [];
  if (W >= 1100) {
    const content = (el) => {
      const rs = []; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n, k = 0;
      while ((n = tw.nextNode()) && k < 600) { if (!norm(n.nodeValue) || !n.parentElement || !visible(n.parentElement)) continue; k++; rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 1 && q.height > 1) rs.push(q); }
      for (const m of el.querySelectorAll('img, video, canvas, [data-ui], input, select, textarea')) if (visible(m)) rs.push(m.getBoundingClientRect());
      return rs;
    };
    let k = 0;
    for (const row of B.querySelectorAll('*')) {
      if (++k > 6000 || out.runOn.length >= 4) break;
      if (row.childElementCount < 2 || row.closest('header, nav, footer, [data-ui], dialog, .scene, [data-scene], [data-hero], table')) continue;
      const rr = row.getBoundingClientRect(); if (rr.width < W * 0.55 || rr.height < 200) continue;
      const kids = [...row.children].filter((c) => visible(c) && !/absolute|fixed/.test(css(c).position));
      if (kids.length !== 2) continue;
      const [a, b] = kids.map((c) => c.getBoundingClientRect()).map((r, i) => ({ el: kids[i], r }));
      const [L, R] = a.r.left <= b.r.left ? [a, b] : [b, a];
      if (Math.min(L.r.right, R.r.right) - Math.max(L.r.left, R.r.left) > 8 || L.r.width < W * 0.15) continue;
      if ([L.el, ...L.el.querySelectorAll('*')].some((e) => css(e).position === 'sticky')) continue;
      const lc = content(L.el), rc = content(R.el); if (!lc.length || rc.length < 4) continue;
      const lb = Math.max(...lc.map((q) => q.bottom)), rb = Math.max(...rc.map((q) => q.bottom)), lt = Math.min(...lc.map((q) => q.top)), rt = Math.min(...rc.map((q) => q.top));
      const media = rc.filter((q) => q.width * q.height > W * H * 0.04).reduce((t, q) => t + q.height, 0);
      if (rb - lb < Math.max(280, H * 0.3) || lt > rt + 60 || media > (rb - rt) * 0.5) continue;
      out.runOn.push({ head: textOf(L.el.querySelector('h1, h2, h3, h4') || L.el).slice(0, 40), gap: Math.round(rb - lb), y: Math.round(lb + sy) });
    }
  }

  // --- credits: the page's credits list (a dialog, list or section named for credits) against the pictures it shows.
  // A picture is named by an entry when its file's words, or the title its assets/credits.json record gives it, are in
  // the entry. Pictures the page shows that no entry names, when there are more pictures than entries, or a recorded
  // picture whose source no entry names, are reported.
  out.credits = null;
  {
    const CRED = /credit|bildnachweis|fotonachweis|image sources|picture sources|photo sources|photographs? by/i;
    const named = (el) => CRED.test([el.id, typeof el.className === 'string' ? el.className : '', el.getAttribute('aria-label') || '', el.getAttribute('aria-labelledby') ? textOf(document.getElementById(el.getAttribute('aria-labelledby')) || el).slice(0, 40) : '', textOf(el.querySelector('h1, h2, h3, h4') || document.createElement('i'))].join(' '));
    const conts = [...document.querySelectorAll('dialog, section, aside, div, ul, ol, details')].filter((el) => named(el) && !el.closest('nav'));
    const entriesOf = (c) => [...c.querySelectorAll('li, p')].filter((e) => !e.querySelector('li, p') && (e.querySelector('a[href]') || /\bby\b|\bcc\b|public domain|unsplash|pexels|wikimedia|commons|licen[cs]e/i.test(textOf(e))) && words(textOf(e)) >= 2);
    const best = conts.map((c) => ({ c, e: entriesOf(c) })).filter((x) => x.e.length).sort((p, q) => q.e.length - p.e.length)[0];
    if (best) {
      const fold = (s) => String(s || '').toLowerCase().replace(/ð/g, 'd').replace(/þ/g, 'th').replace(/æ/g, 'ae').replace(/[øœ]/g, 'o').replace(/ß/g, 'ss').replace(/ł/g, 'l').normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
      const dec = (u) => { try { return decodeURIComponent(u); } catch { return u; } };
      const entries = best.e.map((e) => fold(textOf(e) + ' ' + [...e.querySelectorAll('a[href]')].map((a) => dec(a.getAttribute('href'))).join(' ')));
      // the pictures shown: photographs at 64px or more, outside dialogs and the product's windows, by file
      const keyOf = (u) => { let p = u; try { const x = new URL(u, location.href); p = (x.origin === location.origin ? '' : x.host) + decodeURIComponent(x.pathname); } catch { p = String(u).split(/[?#]/)[0]; } return p; };
      const base = (k) => (k.split('/').filter(Boolean).slice(-1)[0] || '').replace(/\.[a-z0-9]{2,5}$/i, '');
      const shown = new Map();
      for (const el of B.querySelectorAll('img, video, [style*="background-image"], figure, div, section, span')) {
        if (el.closest('dialog, [role=dialog], [data-ui], nav, header[role=banner]')) continue;
        let src = null;
        if (el.tagName === 'IMG') src = el.currentSrc || el.src; else if (el.tagName === 'VIDEO') src = el.getAttribute('poster') || el.currentSrc; else { const bi = css(el).backgroundImage; const m = bi && bi.match(/url\(["']?([^"')]+)/); if (m && /cover|contain/.test(css(el).backgroundSize)) src = m[1]; }
        if (!src || /^data:|\.svg(\?|#|$)/i.test(src)) continue;
        if (!el.getClientRects().length || css(el).display === 'none') continue;
        const r = el.getBoundingClientRect(); if (r.width < 64 || r.height < 48) continue;
        const k = keyOf(src); if (!shown.has(k)) shown.set(k, base(k));
      }
      // (the record assets.mjs keeps of each picture it fetched: its file and the source's title and page)
      let ledger = [];
      for (const p of ['assets/credits.json', 'credits.json', 'images/credits.json', 'img/credits.json']) { try { const res = await fetch(p, { cache: 'no-store' }); if (res.ok) { const j = await res.json(); if (Array.isArray(j)) { ledger = j; break; } } } catch {} }
      const GENERIC = new Set(['photo', 'photos', 'image', 'images', 'picture', 'pictures', 'hero', 'cover', 'crop', 'cropped', 'wide', 'tall', 'square', 'small', 'large', 'phone', 'mobile', 'desktop', 'tablet', 'thumb', 'final', 'edit', 'copy', 'retouched', 'background', 'still', 'poster', 'portrait', 'landscape', 'detail', 'close', 'closeup', 'night', 'morning', 'evening', 'summer', 'winter', 'spring', 'autumn', 'january', 'february', 'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);
      const unmatched = [], ledgerMiss = [];
      for (const [k, b] of shown) {
        // (recorded: an entry names its title, its author or its page; "Rooms: photographs by Bekah Russom, Mark Solarski
        // and Ali Inay" credits three)
        const rec = ledger.find((l) => l && l.file && base(String(l.file)) === b);
        if (rec) {
          const t = fold(rec.title).slice(0, 40), pg = fold(dec(rec.page || '')).slice(-40), by = fold(rec.creator).split(' ').slice(0, 2).join(' ');
          if (!entries.some((e) => (t && e.includes(t)) || (pg && e.includes(pg)) || (by.length >= 5 && e.includes(by)))) ledgerMiss.push(b + (rec.title ? ` ("${String(rec.title).slice(0, 40)}")` : ''));
          continue;
        }
        // (not recorded: a word of its file name that one entry alone carries, or the service it came from)
        const toks = fold(b).split(' ').filter((w) => (w.length >= 4 && !GENERIC.has(w) && !/^\d+$/.test(w)) || /^\d{3,}$/.test(w));
        const host = /^[a-z0-9.-]+\.[a-z]{2,}\//i.test(k) ? fold(k.split('/')[0].replace(/^www\./, '').split('.').slice(-2, -1)[0] || '') : '';
        const one = (w) => entries.filter((e) => e.includes(w)).length === 1;
        if (!toks.some(one) && !(host.length >= 4 && entries.some((e) => e.includes(host)))) unmatched.push(b);
      }
      // (an entry may credit several pictures: "Roasted beans by …, pour-over by …, café table by …")
      const capacity = best.e.reduce((t, e) => { const s = textOf(e); const src = [...e.querySelectorAll('a[href]')].filter((a) => !/creativecommons\.org\/(licenses|publicdomain)|\/licen[cs]e/i.test(a.getAttribute('href'))).length; return t + Math.max(1, (s.match(/\bby\b/g) || []).length + (s.match(/\s+and\s+\p{Lu}/gu) || []).length, src); }, 0);
      out.credits = { entries: entries.length, capacity, pictures: shown.size, unmatched: unmatched.slice(0, 8), ledgerMiss: ledgerMiss.slice(0, 6), where: desc(best.c), shown: [...shown.values()].slice(0, 16) };
    }
  }
  return out;
}

// Round 11 (Leon, 29 October: "you scroll and the next section is already there, sometimes already in the first view"):
// space() is run at the top of the page after the walk, so every reveal has landed where it rests.
//   hero   the first screen: the block that holds the h1 (the page's blocks as layout() takes them) and what of the block
//          after it shows on the first screen: its words, a picture, a box, or its ground where it differs from the
//          hero's, 8px or more above the foot of the screen (hero-not-alone); and the h1's words that run on under the foot
//          of the screen (hero-cut)
//   air    on desktop, the empty height between one block's last content and the next one's first (words, pictures,
//          controls, boxes), under 12% of the screen; a scene or a pinned stage, whose content moves, is left out, and
//          so are the parts of one block (section-air)
export function space() {
  const W = innerWidth, H = innerHeight, SY = scrollY || 0, B = document.body, D = document.documentElement;
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const shown = (el) => { for (let p = el, i = 0; p && p !== B && i < 30; p = p.parentElement, i++) { const cs = css(p); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; if (i < 4 && (cs.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%\)/.test(cs.clipPath))) return false; } return true; };
  const layered = (el) => { for (let p = el; p && p !== B; p = p.parentElement) if (/fixed/.test(css(p).position)) return true; return false; };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const groundOf = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.9) return c; if (css(e).backgroundImage !== 'none' && /url\(/.test(css(e).backgroundImage)) return 'picture'; } return [255, 255, 255, 1]; };
  const same = (a, b) => (a === 'picture' || b === 'picture' ? a === b : [0, 1, 2].every((i) => Math.abs(a[i] - b[i]) < 6));
  const sel = (el) => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')).slice(0, 50);
  const headOf = (s) => { const h = s.querySelector('h1, h2, h3, [role=heading]'); return norm(h ? h.innerText : s.innerText).slice(0, 48); };
  // the page's blocks: down through single wrappers, a tall block split into its parts (the parts of one block keep its
  // group), the site's bar and fixed layers left out
  // (a site bar 120px tall or more, a masthead laid over the hero, is the bar, not a block)
  const tall = (c) => { const r = c.getBoundingClientRect(); return r.height >= 120 && r.width >= W * 0.6 && css(c).position !== 'fixed' && shown(c) && !(c.matches('header, [role=banner]') && !c.querySelector('h1') && r.height < H * 0.3); };
  let root = B;
  for (let i = 0; i < 12; i++) { const kids = [...root.children].filter(tall); if (kids.length === 1) root = kids[0]; else break; }
  let blocks = [...root.children].filter(tall).map((el) => ({ el, group: el }));
  // (the parts of a section are one section; the parts of a wrapper, main or a div, are blocks of their own)
  const SECTION = 'section, article, aside, footer, [data-scene], [data-hero]';
  for (let pass = 0; pass < 2; pass++) blocks = blocks.flatMap((b) => { const k = [...b.el.children].filter(tall); return b.el.getBoundingClientRect().height > H * 1.6 && k.length >= 2 ? k.map((el) => ({ el, group: b.group !== b.el ? b.group : b.el.matches(SECTION) ? b.el : el })) : [b]; });
  blocks.sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
  // what a block shows: its words, pictures, controls and boxes (a fill narrower than the screen), in the flow
  const contentOf = (blk) => {
    const out = []; const tw = document.createTreeWalker(blk, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n, k = 0;
    while ((n = tw.nextNode()) && k < 1500) {
      const el = n.parentElement; if (!norm(n.nodeValue) || !el || el.closest('script, style, noscript, template, [aria-hidden=true]') || layered(el) || !shown(el)) continue;
      k++; rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2) out.push({ what: el.closest('h1, h2, h3, h4') ? 'heading' : 'text', el, t: q.top, b: q.bottom, l: q.left, r: q.right, text: norm(el.closest('h1, h2, h3, h4, p, li, a, button, figcaption, blockquote, dt, dd, span, div')?.innerText || n.nodeValue).slice(0, 40) });
    }
    let m = 0;
    for (const el of blk.querySelectorAll('img, video, canvas, picture, iframe, svg, input, select, textarea, button, div, section, figure, a, li, article, span, aside')) {
      if (++m > 3000) break;
      if (el.parentElement?.closest('svg') || layered(el)) continue;
      const r = el.getBoundingClientRect(); if (r.width < 24 || r.height < 24) continue;
      let what = null;
      if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|svg)$/.test(el.tagName)) what = 'picture';
      else if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName)) what = 'control';
      else { const cs = css(el); if (/url\(/.test(cs.backgroundImage)) what = 'picture'; else if (r.width < W * 0.94) { const c = rgba(cs.backgroundColor); if (c && c[3] >= 0.5 && !same(c, groundOf(el.parentElement || B))) what = 'box'; } }
      if (what && shown(el)) out.push({ what, el, tag: el.tagName, t: r.top, b: r.bottom, l: r.left, r: r.right, text: (el.getAttribute('alt') || norm(el.innerText) || sel(el)).slice(0, 40) });
    }
    return out;
  };
  const moving = (el) => !!(el.closest('.scene, [data-scene], .pin-spacer') || el.querySelector('.scene, [data-scene], .pin-spacer') || [...el.querySelectorAll('*')].slice(0, 400).some((e) => css(e).position === 'sticky' && e.getBoundingClientRect().height > H * 0.5));
  const out = { blocks: blocks.length, hero: null, air: [] };
  // --- the first screen alone
  const h1 = [...document.querySelectorAll('h1')].find((h) => { const r = h.getBoundingClientRect(); return r.width > 2 && r.top + SY < H * 0.9 && shown(h); });
  // (a title set in a bar between two parts of the first screen, r8-p38's rail: the last block that starts on the top half)
  let hi = h1 ? blocks.findIndex((b) => b.el.contains(h1)) : -1;
  if (hi < 0) blocks.forEach((b, i) => { if (b.el.getBoundingClientRect().top + SY < H * 0.5) hi = i; });
  // (on a phone the first screen is the small viewport, the address bar shown: 100svh)
  let F = H;
  if (W < 600) { const p = document.createElement('div'); p.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none'; B.appendChild(p); const v = p.getBoundingClientRect().height; p.remove(); if (v > 200 && v < H) F = Math.round(v); }
  if (hi >= 0 && SY < 2) {
    const hero = blocks[hi], next = blocks.slice(hi + 1).find((b) => b.group !== hero.group && b.el.getBoundingClientRect().top + SY >= hero.el.getBoundingClientRect().top + SY + 40);
    out.hero = { sel: sel(hero.el), bottom: Math.round(hero.el.getBoundingClientRect().bottom + SY), fold: F, next: null, cut: null, title: null };
    // round 11d: the hero's own title across the fold, a line of the h1 that starts on the first screen and whose letters
    // end more than 6px under its foot, however large the type (hero-cut; r12-p56's "Kaffee Klee", set to cross the fold
    // over its photograph, read as cut off). A line ends where its letters do: its box less the font's descent, plus what
    // its own letters reach under the baseline (a line of capitals ends on its baseline, a "g" counts to its tail). Its
    // words are the title's business, not the cut's below (hero-not-alone)
    if (h1) {
      const ls = []; const tw = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n;
      const ctx = document.createElement('canvas').getContext('2d');
      while ((n = tw.nextNode())) {
        const pe = n.parentElement; if (!norm(n.nodeValue) || !pe || !shown(pe)) continue;
        const cs = css(pe); ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const m = ctx.measureText(cs.textTransform === 'uppercase' ? norm(n.nodeValue).toUpperCase() : norm(n.nodeValue)), box = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
        rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 2 && q.height > 2) ls.push({ t: q.top, b: box > 0 ? q.bottom - (m.fontBoundingBoxDescent - Math.max(0, m.actualBoundingBoxDescent)) * ((q.bottom - q.top) / box) : q.bottom, text: norm(n.nodeValue) });
      }
      const under = ls.filter((q) => q.b > F + 6);
      if (under.length && ls.some((q) => q.t < F - 8)) out.hero.title = { text: norm(h1.innerText).slice(0, 48), under: [...new Set(under.map((q) => q.text))].join(' ').slice(0, 40), px: Math.round(Math.max(...under.map((q) => q.b)) - F) };
    }
    if (next) {
      const nr = next.el.getBoundingClientRect();
      let seen = null;
      if (nr.top < F - 8) {
        // (shown where it lies: a layer of the next scene held behind the hero, a fixed world, is under it, not in view)
        const hitStyle = document.createElement('style'); hitStyle.textContent = '*, *::before, *::after { pointer-events: auto !important; }'; document.head.appendChild(hitStyle);
        // (the item itself is what paints first at one of five points: a sheet or a cover of the scene's own laid over it,
        // through-the-openings' arch sheet over its cloister photograph, hides it)
        const paints = (e) => { const cs = css(e); if (+cs.opacity < 0.35) return false; if (/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE|OBJECT|EMBED)$/.test(e.tagName) || e instanceof SVGElement) return true; if (cs.backgroundImage !== 'none') return true; const c = rgba(cs.backgroundColor); return !!c && c[3] >= 0.6; };
        const onTop = (c) => { const l = Math.max(c.l, 0), r = Math.min(c.r, W), t = Math.max(c.t, 0), b = Math.min(c.b, F - 1); if (r - l < 2 || b - t < 2) return false; for (const [fx, fy] of [[0.5, 0.5], [0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) { for (const e of document.elementsFromPoint(l + (r - l) * fx, t + (b - t) * fy)) { if (layered(e) || e === D || e === B) continue; if (e === c.el || c.el.contains(e)) { if (next.el.contains(e)) return true; break; } if (e.contains(c.el)) continue; if (paints(e)) break; } } return false; };
        let inView = [];
        // (named by what reads first: a heading, then words, then a picture or a box)
        const rank = { heading: 0, text: 1, picture: 2, box: 3, control: 4 };
        try { inView = contentOf(next.el).filter((c) => c.t < F - 8 && c.b > 0 && c.r > 0 && c.l < W && onTop(c)).sort((a, b) => rank[a.what] - rank[b.what] || a.t - b.t); } finally { hitStyle.remove(); }
        if (inView.length) seen = { what: inView[0].what, text: inView[0].text, px: Math.round(F - Math.max(0, inView[0].t)) };
        // its ground, where it differs from the hero's: what paints at the foot of the screen belongs to it
        if (!seen) {
          const hg = groundOf(hero.el);
          for (const fx of [0.1, 0.3, 0.5, 0.7, 0.9]) {
            const at = document.elementsFromPoint(W * fx, F - 6).find((e) => !layered(e) && e !== D && e !== B);
            if (!at || !next.el.contains(at)) continue;
            const g = groundOf(at);
            if (!same(g, hg)) { seen = { what: 'ground', text: g === 'picture' ? 'a picture' : `rgb(${g.slice(0, 3).join(', ')})`, px: Math.round(F - Math.max(0, nr.top)) }; break; }
          }
        }
      }
      out.hero.next = { sel: sel(next.el), head: headOf(next.el), top: Math.round(nr.top + SY), seen };
    }
    // the first screen's foot cutting through what comes next inside the hero: a line of words across the fold, or a
    // picture or box that starts in the lowest fifth of the screen and runs on under it (r9-p41: "2.6 Markdown Offline"
    // showing the tops of its letters under the product window)
    // (a canvas or a drawing may paint nothing where its box lies, and a layer laid on a picture that fills the first
    // screen is part of that picture: words are looked at there, not boxes)
    const hc = contentOf(hero.el);
    const filledBy = hc.some((c) => c.what === 'picture' && c.tag !== 'CANVAS' && c.tag !== 'svg' && (Math.min(c.r, W) - Math.max(c.l, 0)) * (Math.min(c.b, F) - Math.max(c.t, 0)) >= W * F * 0.9);
    // (other display type of 56px or more that shows half its line or more, a word set large behind the title, is left to
    // the eye; under half shows only the tops of the letters of what comes next. The title is hero-cut's, above)
    const cut = hc.filter((c) => (c.what === 'text' || c.what === 'heading' ? c.t < F - 8 && c.b > F + 2 && !((c.b - c.t) >= 56 && F - c.t >= (c.b - c.t) * 0.5) && !(h1 && h1.contains(c.el)) :!filledBy && !/^(CANVAS|svg|IFRAME)$/.test(c.tag) && c.t >= F * 0.8 && c.t < F - 8 && c.b > F + 2) && c.r > 0 && c.l < W).sort((a, b) => a.t - b.t);
    if (cut.length) out.hero.cut = { what: cut[0].what, text: cut[0].text, px: Math.round(F - cut[0].t), n: cut.length };
  }
  // --- the air between blocks (desktop)
  if (W >= 1100) {
    const parts = blocks.map((b) => { const c = contentOf(b.el).map((x) => ({ ...x, t: x.t + SY, b: x.b + SY })); return { ...b, moving: moving(b.el), first: c.length ? Math.min(...c.map((x) => x.t)) : null, last: c.length ? Math.max(...c.map((x) => x.b)) : null }; });
    for (let i = 1; i < parts.length; i++) {
      const a = parts[i - 1], b = parts[i];
      if (a.group === b.group || a.moving || b.moving || a.last == null || b.first == null) continue;
      const gap = Math.round(b.first - a.last);
      if (gap < H * 0.12) out.air.push({ a: headOf(a.el), b: headOf(b.el), aSel: sel(a.el), bSel: sel(b.el), gap, y: Math.round(a.last) });
      if (out.air.length >= 8) break;
    }
  }
  return out;
}

// navBar: the site's bar on the first screen (round 11; Leon: an info strip over the navigation is not modern, and r8-p38
// carried a sentence in its bar). The bar is the <header> outside the page's sections, the [role=banner], or the strip
// round the first <nav> with two links or more; when it is taller than a strip, the strip round its links.
//   items     links and buttons in the bar of more than three words (the wordmark's own link aside)
//   sentences text in the bar that is not a link: four words or more, or a sentence that ends in a full stop
//   above     words above the bar's row of links, when that row sits near the top of the page: an announcement or info
//             strip (the wordmark of a bar stacked in two rows aside)
export function navBar() {
  const W = innerWidth, H = innerHeight, SY = scrollY || 0, B = document.body;
  const shows = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1 || e.hidden) return false; } const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); return !(cs.clip === 'rect(0px, 0px, 0px, 0px)' || /inset\(50%\)/.test(cs.clipPath) || (r.width <= 2 && r.height <= 2)); };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  // (a word has a letter: a phone number or opening hours, "+49 30 1234 5678", are not a sentence)
  const words = (t) => (norm(t).match(/\S*\p{L}\S*/gu) || []).length;
  const strip = (el) => { const r = el.getBoundingClientRect(); return r.width >= W * 0.5 && r.height <= Math.max(160, H * 0.25) && r.height >= 16; };
  const home = (a) => { const h = (a.getAttribute('href') || '').trim(); if (['#', '#top', '/', './', 'index.html', './index.html'].includes(h) || a.matches('[data-wordmark], [rel=home]')) return true; try { const u = new URL(h, location.href); return u.origin === location.origin && u.pathname.replace(/index\.html?$/, '') === location.pathname.replace(/index\.html?$/, '') && (!u.hash || u.hash === '#top'); } catch { return false; } };
  const inSections = (el) => !!el.parentElement?.closest('main, section, article, [data-scene]');
  const linksIn = (el) => [...el.querySelectorAll('a[href], button')].filter((a) => !a.closest('dialog, [role=dialog], [hidden], [aria-hidden=true]') && shows(a));
  const heads = [...document.querySelectorAll('header, [role=banner]')].filter((h) => !inSections(h) && shows(h) && linksIn(h).length >= 1 && h.getBoundingClientRect().top < H);
  const nav = [...document.querySelectorAll('nav')].find((n) => !n.closest('dialog, [role=dialog], [hidden], footer') && shows(n) && linksIn(n).length >= 2 && n.getBoundingClientRect().top < H);
  // (the header that holds the nav first; a hero set in a <header> with one button, the nav standing apart, is not the bar)
  let bar = (nav && heads.find((h) => h.contains(nav))) || heads.find((h) => !nav || strip(h) || linksIn(h).length >= 2) || null;
  if (!bar && nav) { bar = nav; for (let e = nav; e && e !== B; e = e.parentElement) { if (strip(e)) bar = e; else if (e.getBoundingClientRect().height > Math.max(160, H * 0.25)) break; } }
  if (!bar) return null;
  // a bar taller than a strip (a hero set in the header): the strip round its links, or round its first link or button
  // at its top when the links are folded away (a phone); none there, no bar to judge
  if (!strip(bar)) {
    const top0 = bar.getBoundingClientRect().top;
    const anchor = nav && bar.contains(nav) ? nav : linksIn(bar).filter((a) => a.getBoundingClientRect().top < top0 + 120).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    if (!anchor) return null;
    let s = null; for (let e = anchor; e && e !== bar; e = e.parentElement) if (strip(e)) s = e;
    bar = s || anchor;
  }
  const br = bar.getBoundingClientRect();
  const out = { bar: (bar.tagName.toLowerCase() + (bar.className && typeof bar.className === 'string' ? '.' + bar.className.trim().split(/\s+/)[0] : '')).slice(0, 40), top: Math.round(br.top + SY), h: Math.round(br.height), items: [], sentences: [], above: [] };
  const links = linksIn(bar);
  // (an article is not counted: "Ask for a room" is three words; an icon button's label nobody sees is not read)
  for (const a of links) { if (a.matches('a') && home(a)) continue; const t = norm(a.innerText || ''); if (words(t.replace(/\b(a|an|the)\b/gi, ' ')) > 3) out.items.push(t.slice(0, 60)); }
  // the words in the bar outside its links and buttons, by block
  const seen = new Set(); const tw = document.createTreeWalker(bar, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) {
    const el = n.parentElement; if (!norm(n.nodeValue) || !el || el.closest('a, button, script, style, dialog, [role=dialog], [hidden], [aria-hidden=true], .sr-only, .visually-hidden') || !shows(el)) continue;
    let blk = el; while (blk.parentElement && blk.parentElement !== bar && /^inline/.test(getComputedStyle(blk).display)) blk = blk.parentElement;
    if (seen.has(blk)) continue; seen.add(blk);
    if (blk.closest('a, button')) continue;
    const t = norm(blk.innerText || blk.textContent); const nw = words(t);
    if (nw >= 4 || (nw >= 2 && /[.!?](\s|$)/.test(t))) out.sentences.push(t.slice(0, 70));
  }
  // the bar's row of links (the row with the most), and anything with words above it while it sits near the top
  const rows = []; for (const a of links) { const r = a.getBoundingClientRect(), c = (r.top + r.bottom) / 2; const row = rows.find((x) => Math.abs(x.c - c) <= 12); if (row) { row.n++; row.top = Math.min(row.top, r.top); row.els.push(a); } else rows.push({ c, n: 1, top: r.top, els: [a] }); }
  const row = rows.sort((a, b) => b.n - a.n || b.c - a.c)[0];
  // (a row of two items or more, the wordmark and a menu button at least; the box that holds the row is the bar's own,
  // and words in it are the bar's, not a strip over it: a side index stacks its links and has no row)
  let rowBox = row ? row.els[0] : null; if (row) while (rowBox && !row.els.every((a) => rowBox.contains(a))) rowBox = rowBox.parentElement;
  // (the wordmark's own row is the bar's too: a bar that wraps on a phone sets the name and the action over the links)
  const mark = links.find((a) => a.matches('a') && home(a)) || bar.querySelector('[data-wordmark]');
  const markC = mark ? (() => { const q = mark.getBoundingClientRect(); return (q.top + q.bottom) / 2; })() : null;
  if (row && row.n >= 2 && row.top + SY >= 20 && row.top + SY <= 200) {
    const tw2 = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); const rg = document.createRange(); const blocks = new Set();
    while ((n = tw2.nextNode())) {
      const el = n.parentElement; if (!norm(n.nodeValue) || !el || el.closest('script, style, noscript, template, dialog, [role=dialog], [hidden], [aria-hidden=true]') || !shows(el)) continue;
      rg.selectNodeContents(n); const q = rg.getBoundingClientRect(); if (q.bottom > row.top + 2 || q.top < -2 || q.width < 2) continue;
      const a = el.closest('a'); if ((a && home(a)) || (rowBox && rowBox !== B && rowBox.contains(el)) || (markC != null && bar.contains(el) && Math.abs((q.top + q.bottom) / 2 - markC) <= 14)) continue;
      const blk = el.closest('p, div, li, span, a, button, h1, h2, h3, h4, h5, h6, aside, section') || el;
      if (blocks.has(blk)) continue; blocks.add(blk);
      out.above.push(norm(blk.innerText || n.nodeValue).slice(0, 60));
      if (out.above.length >= 4) break;
    }
  }
  return out;
}

// crops: pictures whose crop cuts away a large part of them while they carry lettering, or are the work itself (round 11,
// r10-p47: ZUIDKAI, KAAP and "Pelik" shown cut). A picture carries lettering when its alt text speaks of a name, a word,
// letters, capitals, a title, a logo or a sign; it is the work when it sits under a heading or in a block named for the
// work (work, projects, case studies, frames, stills, portfolio, selected). The crop: what object-fit cover and the boxes that
// clip it take off its width or height, or, for a file that is a crop of another the page loaded (pelikaan-tall.png of
// pelikaan.png), how much of the other's width or height it keeps.
export function crops() {
  const W = innerWidth, H = innerHeight;
  // (not "type", "text" or "caps": a camera turned toward the text or a row of bottle caps has no words to cut)
  const LETTER = /\b(names?|words?|letters?|lettering|capitals|typeface|titles?|headline|logo|wordmark|signs?|signage|poster|ident|captions?)\b/i;
  // (not "works" or "cases": "How it works" and "Use cases" are not the work)
  const WORK = /\b(work|projects?|case[- ]stud\w*|frames?|stills?|portfolio|selected|showreel|reel|gallery)\b/i;
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const shows = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false; } return true; };
  const fileOf = (u) => { try { return decodeURIComponent(new URL(u, location.href).pathname); } catch { return String(u).split(/[?#]/)[0]; } };
  const SUFFIX = /[-_.](tall|wide|square|portrait|landscape|crop|cropped|phone|mobile|desktop|tablet|vertical|horizontal|sm|md|lg|xl|small|medium|large|thumb|card|cover|hero|\d{2,4}w|\d{2,4}x\d{2,4})$/i;
  const stemOf = (f) => { let s = f.replace(/\.(jpe?g|png|webp|avif|gif)$/i, ''); for (let i = 0; i < 3 && SUFFIX.test(s); i++) s = s.replace(SUFFIX, ''); return s; };
  // the other files the page loaded, by their stems, with their sizes where an img on the page shows them
  const loaded = new Map();
  for (const im of document.images) if (im.naturalWidth && im.currentSrc) { const f = fileOf(im.currentSrc); loaded.set(f, { w: im.naturalWidth, h: im.naturalHeight }); }
  const out = [];
  for (const im of document.images) {
    if (!im.naturalWidth || !im.currentSrc || /\.svg/i.test(im.currentSrc) || im.closest('nav, dialog, [role=dialog], [data-ui], header[role=banner]') || !shows(im)) continue;
    const r = im.getBoundingClientRect(); if (r.width * r.height < W * H * 0.02) continue;
    const alt = norm(im.getAttribute('alt'));
    // (named for the work by the section's id or heading, or by the picture's folder: a class such as "rw-frame" names a
    // frame of the layout, not the work)
    const sec = im.closest('section, [data-scene]'), hd = sec?.querySelector('h1, h2, h3');
    const work = WORK.test([sec?.id, hd ? hd.innerText : '', fileOf(im.currentSrc).split('/').slice(-2, -1)[0] || ''].join(' '));
    const lettering = LETTER.test(alt);
    // (a picture across the whole width is a ground, cropped by nature, unless it carries lettering)
    if (!lettering && (!work || r.width >= W * 0.9)) continue;
    const cs = getComputedStyle(im);
    // object-fit: the share of the picture's width and height the box shows
    let kw = 1, kh = 1;
    if (cs.objectFit === 'cover') { const s = Math.max(r.width / im.naturalWidth, r.height / im.naturalHeight); kw = r.width / (im.naturalWidth * s); kh = r.height / (im.naturalHeight * s); }
    // the boxes that clip it (a frame narrower than the picture)
    let cl = { l: r.left, r: r.right, t: r.top, b: r.bottom };
    for (let e = im.parentElement, i = 0; e && e !== document.body && i < 6; e = e.parentElement, i++) { const c = getComputedStyle(e); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const q = e.getBoundingClientRect(); cl = { l: Math.max(cl.l, q.left), r: Math.min(cl.r, q.right), t: Math.max(cl.t, q.top), b: Math.min(cl.b, q.bottom) }; } }
    if (cl.r > cl.l && cl.b > cl.t) { kw *= (cl.r - cl.l) / r.width; kh *= (cl.b - cl.t) / r.height; }
    // a file that is a crop of another the page loaded
    let from = null;
    const f = fileOf(im.currentSrc), stem = stemOf(f), bare = (x) => x.replace(/\.(jpe?g|png|webp|avif|gif)$/i, '');
    // (only a file named as a crop, pelikaan-tall, of the file named plainly, pelikaan)
    for (const [g, s] of stem !== bare(f) ? loaded : []) {
      if (g === f || bare(g) !== stem) continue;
      const a0 = s.w / s.h, a1 = im.naturalWidth / im.naturalHeight;
      const keep = a1 < a0 ? a1 / a0 : a0 / a1; // the share of the wider one's width (or the taller one's height) kept
      if (keep < 0.85 && s.w * s.h > im.naturalWidth * im.naturalHeight * 0.5) { from = { file: g.split('/').pop(), keep, axis: a1 < a0 ? 'width' : 'height' }; break; }
    }
    const cutW = 1 - kw, cutH = 1 - kh, cutFrom = from ? 1 - from.keep : 0;
    const cut = Math.max(cutW, cutH, cutFrom);
    if (cut < 0.15) continue;
    out.push({ file: f.split('/').pop().slice(0, 48), cut: +cut.toFixed(2), axis: cutFrom >= Math.max(cutW, cutH) ? from.axis : cutW >= cutH ? 'width' : 'height', from: cutFrom >= Math.max(cutW, cutH) && from ? from.file : null, lettering, work, alt: alt.slice(0, 80) });
    if (out.length >= 8) break;
  }
  return out;
}

// Round 11b (the round-11 test pages: r11-p51, a motion designer's portfolio on seven grounds and panels, its work shown
// as type cards, its footer read by the judge as one credit line). Each runs at the top of the page after the walk, on
// desktop, but groundPoints(), which runs at every screen of the walk.
// Round 11d (r12-p57 passed on four grounds, the ink over 4.7 screens and a veil in the accent among them; r12-p58 on
// three, one a band sampled from its closing photograph): the grounds are counted by the screens a visitor sees them on.
//   groundPoints  at one screen of the walk, once it rests: what paints at 48 points of the screen (8 by 6) under the
//              words, the topmost fill of a section, a panel or a layer laid over the screen (a veil, a band), else the
//              page's own. A picture, a film or a canvas is no ground and neither is a frame or a veil over one; the site's
//              bar is the navigation's; a product window counts by its own frame, and what is inside it is the product's.
//              Each point is 1/48 of a screen, with the section a fill across the width grounds there (the section, the
//              footer or the scene round it, else the block of the page it stands in, so one section built of several
//              fills is one and a chapter of several sections in one wrapper is several), and whether a scene paints it
//              (surface-count)
export function groundPoints() {
  const W = innerWidth, H = innerHeight, B = document.body, D = document.documentElement;
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const desc = (e) => e.tagName.toLowerCase() + (e.classList && e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '');
  // (faded: under half its opacity with its ancestors', a layer on its way out is not a ground)
  const faded = (el) => { let o = 1; for (let e = el; e && e !== D; e = e.parentElement) { const cs = css(e); if (cs.visibility === 'hidden') return true; o *= +cs.opacity; } return o < 0.5; };
  // (the site's bar: the nearest layer fixed or sticky round it is under a third of the screen tall)
  const bar = (el) => { for (let e = el; e && e !== B; e = e.parentElement) if (/fixed|sticky/.test(css(e).position)) return e.getBoundingClientRect().height < H * 0.3; return false; };
  const PIC = /^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|OBJECT|EMBED)$/;
  const own = [B, D].map((e) => rgba(css(e).backgroundColor)).find((c) => c && c[3] >= 0.9) || [255, 255, 255, 1];
  const tones = new Map();
  // (the blocks across the width each tone grounds, by a number each keeps for the whole walk)
  const ids = window.__groundIds || (window.__groundIds = { map: new WeakMap(), next: 1 });
  const idOf = (e) => { let k = ids.map.get(e); if (!k) { k = ids.next++; ids.map.set(e, k); } return k; };
  const secOf = (e) => { const s = e.closest('section, footer, article, aside, [data-scene]'); if (s) return s; let x = e; while (x.parentElement && x.parentElement !== B && x.parentElement.tagName !== 'MAIN') x = x.parentElement; return x; };
  // (a veil or a band lets the pointer through: the points are hit-tested with every layer taking it)
  const hit = document.createElement('style'); hit.textContent = '*, *::before, *::after { pointer-events: auto !important; }'; document.head.appendChild(hit);
  try {
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) {
      const stack = document.elementsFromPoint((W * (i + 0.5)) / 8, (H * (j + 0.5)) / 6);
      let tone = own, at = null, picture = false;
      for (const e of stack) {
        if (e === D || e === B) break;
        if (PIC.test(e.tagName)) { if (!faded(e)) { picture = true; break; } continue; }
        if (e instanceof SVGElement || bar(e) || faded(e)) continue;
        let ui = e.closest('[data-ui]'); while (ui && ui.parentElement?.closest('[data-ui]')) ui = ui.parentElement.closest('[data-ui]');
        if (ui && ui !== e) continue;
        const cs = css(e);
        if (/url\(/.test(cs.backgroundImage)) { picture = true; break; }
        const c = rgba(cs.backgroundColor); if (!c || c[3] < 0.9) continue;
        // (a frame behind a picture, or one that lays its own veil over it, is the picture)
        if (stack.some((p) => PIC.test(p.tagName) && e.contains(p) && !faded(p))) { picture = true; break; }
        tone = c; at = e; break;
      }
      if (picture) continue;
      // (where the page's own ground shows, the section under the point is the one it grounds)
      const top = at || stack.find((e) => e !== D && e !== B && !bar(e));
      const k = hex(tone), t = tones.get(k), wide = !at || at.getBoundingClientRect().width >= W * 0.94, block = wide && top ? idOf(secOf(top)) : null, scene = !!at && !!at.closest('[data-scene], .scene');
      if (t) { t.n++; t.wide = t.wide || wide; t.scene = t.scene || scene; if (block && !t.blocks.includes(block)) t.blocks.push(block); } else tones.set(k, { hex: k, n: 1, where: at ? desc(at) : 'page', wide, scene, blocks: block ? [block] : [] });
    }
  } finally { hit.remove(); }
  return { page: hex(own), tones: [...tones.values()] };
}

//   grounds    the walk's ground points (groundPoints() at each screen, summed) as tones: the screens each grounds and the
//              sections across the width it grounds, tones a step apart taken as one (the page's with the largest tone a
//              step from it, its surface or a tint), which of them is the page's, its surface, the ink, the accent or a
//              dealt field (the dealt palette's, else the text's and the fill the buttons carry most), and the dealt piece
//              that asks for it (asked: a veil or a window in the accent, the ground and the ink swapped, a scene's ground
//              sampled from its photograph) (surface-count)
export function grounds([pal, seen, asked]) {
  const W = innerWidth, B = document.body;
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const fromHex = (h) => (/^#[0-9a-f]{6}$/i.test(h || '') ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : null);
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  // the distance between two tones in CIE Lab: under 8 is a step of one tone, under 3 the same tone to the eye
  const lab = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const [r, g, b] = c.slice(0, 3).map(f); const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); const x = t((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047), y = t(r * 0.2126 + g * 0.7152 + b * 0.0722), z = t((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883); return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const near = (a, b) => dist(a, b) < 8;
  if (!seen || !seen.tones?.length) return [];
  // (the page's own ground is the one it opened on: one it swaps to later is another ground)
  const tones = seen.tones.map((t) => ({ ...t, lab: lab(fromHex(t.hex)), where: t.hex === seen.page ? 'page' : t.where === 'page' ? 'body' : t.where }));
  // the ink, the accent and the dealt fields: the dealt palette's, else the page's text and the fill its buttons carry most
  const ink = fromHex(pal?.ink) || rgba(getComputedStyle(B).color); let accent = fromHex(pal?.accent);
  if (!accent) { const n = new Map(); for (const a of document.querySelectorAll('a, button')) { const c = rgba(getComputedStyle(a).backgroundColor), r = a.getBoundingClientRect(); if (!c || c[3] < 0.9 || r.height < 32 || r.height > 96 || r.width > W * 0.5) continue; n.set(hex(c), (n.get(hex(c)) || 0) + 1); } const top = [...n.entries()].sort((a, b) => b[1] - a[1])[0]; if (top) accent = fromHex(top[0]); }
  const surface = fromHex(pal?.surface);
  const surfaceLab = surface ? lab(surface) : null, inkLab = ink ? lab(ink) : null, accentLab = accent ? lab(accent) : null, fieldLabs = (pal?.fields || []).map(fromHex).filter(Boolean).map(lab);
  // tones a step apart are one, each joined to the largest tone of its group and never along a chain (greys stepped
  // down the page one by one are each a ground): a fill across the width joins a tone under 3 from it, a panel one
  // under 8 (a card a step off its ground reads as that ground's surface)
  const groups = [];
  for (const t of [...tones].sort((a, b) => b.n - a.n)) {
    const at = groups.map((g) => [g, dist(g[0].lab, t.lab)]).filter(([, d]) => d < (t.wide ? 3 : 8)).sort((a, b) => a[1] - b[1])[0];
    if (at) at[0].push(t); else groups.push([t]);
  }
  const of = (g, l) => !!l && g.some((x) => near(x.lab, l));
  // (each group with its sections across the width and its tones by their screens; the page's with the largest tone a
  // step from its own, 3 or more from it, its surface or a tint)
  const sc = (n) => +(n / 48).toFixed(2);
  return groups.map((g) => {
    const p = g.find((x) => x.where === 'page'), scene = g.some((x) => x.scene);
    const role = p ? 'page' : of(g, surfaceLab) ? 'surface' : fieldLabs.some((f) => of(g, f)) ? 'field' : of(g, inkLab) ? 'ink' : of(g, accentLab) ? 'accent' : null;
    return { hex: g[0].hex, where: p ? 'page' : g[0].where, n: g.length, screens: sc(g.reduce((s, x) => s + x.n, 0)), role,
      sections: new Set(g.flatMap((x) => x.blocks || [])).size, tones: g.map((x) => [x.hex, sc(x.n)]), scene,
      asked: (role === 'accent' && asked?.accent) || (asked?.ink && of(g, inkLab) && role !== 'page' && asked.ink) || (role === null && scene && asked?.sampled) || null,
      step: p ? g.filter((x) => x !== p && dist(x.lab, p.lab) >= 3).map((x) => [x.hex, sc(x.n)])[0] || null : undefined };
  });
}

//   footing    the site's footer as built: the last <footer> or [role=contentinfo] outside the page's sections (else the
//              last block named for a footer, else the last <footer> anywhere but in an article, a quote or a dialog: one
//              built inside <main>), its height and the rows its words stand on (footer-not-as-dealt)
export function footing() {
  const SY = scrollY || 0;
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const shows = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false; } return el.getClientRects().length > 0; };
  const outside = (f) => !f.parentElement?.closest('main, section, article, footer, [data-scene], dialog, [role=dialog]');
  const foot = [...document.querySelectorAll('footer, [role=contentinfo]')].filter((f) => outside(f) && shows(f)).pop()
    || [...document.querySelectorAll('[class*=footer i], [id*=footer i]')].filter((f) => outside(f) && shows(f) && f.getBoundingClientRect().height >= 16).pop()
    || [...document.querySelectorAll('footer, [role=contentinfo]')].filter((f) => !f.parentElement?.closest('article, blockquote, dialog, [role=dialog]') && shows(f)).pop();
  if (!foot) return { found: false };
  // its rows: the lines its words stand on, by their middles, 8px apart
  const rows = []; const tw = document.createTreeWalker(foot, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n;
  while ((n = tw.nextNode())) {
    if (!norm(n.nodeValue) || !n.parentElement || n.parentElement.closest('dialog, [role=dialog], [aria-hidden=true], .sr-only, .visually-hidden') || !shows(n.parentElement)) continue;
    rg.selectNodeContents(n); for (const q of rg.getClientRects()) { if (q.width < 2 || q.height < 2) continue; const m = (q.top + q.bottom) / 2 + SY; if (!rows.some((x) => Math.abs(x - m) <= 8)) rows.push(m); }
  }
  const r = foot.getBoundingClientRect();
  return { found: true, sel: foot.tagName.toLowerCase() + (typeof foot.className === 'string' && foot.className.trim() ? '.' + foot.className.trim().split(/\s+/)[0] : ''), h: Math.round(r.height), rows: rows.length, text: norm(foot.innerText).slice(0, 60) };
}

//   work       on a portfolio page: the sections named for the work (by their id, label or first heading; never the hero,
//              whose title is the page's, nor a heading about working, "How I work", "Let's work together", nor a block
//              that holds other sections), the pictures of the work they show (a photograph or a film of 2% of a screen
//              or more, each file once, shown or waiting on a hover), the slots marked for the client's own pictures
//              anywhere on the page (data-slot="work", 2% of a screen or more, no picture in them yet) and the pieces
//              set in type instead, a frame of words with no picture in it (portfolio-without-work)
export function workShown() {
  const W = innerWidth, H = innerHeight, SY = scrollY || 0;
  const WORK = /\b(work|projects?|case[- ]stud\w*|frames?|stills?|portfolio|selected|showreel|reel|gallery)\b/i;
  const NOT = /\b(how|way|where|why|when|what) (i|we) work\b|\bwork(ing)? (with|together)\b|\blet['’]?s work\b/gi;
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const named = (s) => WORK.test([s.id.replace(/[-_]+/g, ' '), s.getAttribute('aria-label') || '', norm(document.getElementById(s.getAttribute('aria-labelledby') || '')?.innerText), norm(s.querySelector('h1, h2, h3')?.innerText)].join(' ').replace(NOT, ' '));
  const hero = (s) => s.getBoundingClientRect().top + SY < H * 0.5;
  const all = [...document.querySelectorAll('section, article, [data-scene], div[id]')].filter((s) => !s.closest('nav, footer, dialog, [role=dialog]') && !(s.tagName === 'DIV' && s.querySelector('section, [data-scene]')) && !hero(s) && named(s));
  const secs = all.filter((s) => !all.some((o) => o !== s && o.contains(s)));
  const files = new Set(), held = new Set(); let typeset = 0;
  const slotted = (f) => f.closest('[data-slot="work"]') || f.querySelector('[data-slot="work"]');
  for (const s of secs) {
    for (const el of s.querySelectorAll('img, video, div, figure, a, li, span')) {
      if (el.closest('[data-ui]') || getComputedStyle(el).display === 'none') continue;
      const r = el.getBoundingClientRect(); if (r.width * r.height < W * H * 0.02) continue;
      let src = null;
      if (el.tagName === 'IMG') src = el.currentSrc || el.src; else if (el.tagName === 'VIDEO') src = el.currentSrc || el.getAttribute('src') || el.getAttribute('poster'); else { const m = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)/); if (m) src = m[1]; }
      if (src && !/^data:|\.svg(\?|#|$)/i.test(src)) { files.add(src.split(/[?#]/)[0]); held.add(el); }
    }
    for (const f of s.querySelectorAll('[data-ui], figure[role=img]')) if (!f.parentElement?.closest('[data-ui]') && !f.querySelector('img, video, picture') && !slotted(f) && norm(f.innerText)) typeset++;
  }
  // a marked slot counts as a piece of the work until the client's picture is in it (then the picture counts)
  const slots = [...document.querySelectorAll('[data-slot="work"]')].filter((f) => { const r = f.getBoundingClientRect(); return r.width * r.height >= W * H * 0.02 && getComputedStyle(f).display !== 'none' && ![...held].some((e) => f.contains(e)); }).length;
  // (each file by its name, as pictureCredits() names it)
  const dec = (u) => { try { return decodeURIComponent(u); } catch { return u; } };
  return { sections: secs.map((s) => norm(s.querySelector('h1, h2, h3')?.innerText || s.id).slice(0, 40)), pictures: files.size, files: [...files].map((f) => (dec(f).split('/').filter(Boolean).pop() || '').replace(/\.[a-z0-9]{2,5}$/i, '')), slots, typeset };
}

// Round 11d (r12-p55 showed another maker's bike with its name on the frame as the product, r12-p58 two named hotels'
// rooms as its own, r12-p57 another artist's pen display in its work slots; the round-11b checks passed all three). On
// desktop, at the top of the page after the walk.
//   pictureCredits  every picture shown (a photograph or a film of 64px or more, outside dialogs and the bar) that is shown
//              as the client's, and its credit: the record assets.mjs kept of it (assets/credits.json: title, author,
//              notes) and the entry of the page's credits list that names it. Shown as the client's: in a slot marked for
//              their own picture (data-slot), captioned with their name, among the pictures of a portfolio's work
//              (workShown()'s, marked or not), in a section named for the rooms or the house or alt-texted as a room, on a
//              café's, a restaurant's or a house's page in a section named for its own place (its roastery, its bar, its
//              kitchen: r10-p45 showed another roastery's roaster as "The roastery"), or anywhere on a page that sells one
//              product of its own. A record is found by the picture's file or any file of its srcset, its film and its
//              poster, else by the same name at another size ("hero-1440" for "hero-2880"), else by its width, height and
//              bytes. Each says whether the credit names the client as its author, or another's (a record of its fetch, a
//              licence or a source in its entry, or an author who is not the client), or no credit at all where the
//              client gave no pictures; with the credits no picture shown matches (credit-names-business,
//              portfolio-without-work). Round 11f: one shown as an item the page sells by name (its alt, caption or
//              title names a drink or a dish its section prices: r14-p66's flat white beside "Flat white 3.80 €") is
//              shown as the menu's (room-not-theirs, menu-not-theirs)
export async function pictureCredits({ client = null, product = false, place = false, own: hasOwn = false, work = [] } = {}) {
  const B = document.body;
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const dec = (u) => { try { return decodeURIComponent(u); } catch { return u; } };
  const base = (u) => (dec(String(u).split(/[?#]/)[0]).split('/').filter(Boolean).pop() || '').replace(/\.[a-z0-9]{2,5}$/i, '');
  // (a file's name without its size: "hero-1440" and "hero-2880@2x" are one picture)
  const stem = (f) => f.replace(/(?:[-_@](?:\d{3,4}(?:w|px)?|\d{3,4}x\d{3,4}|[1-4]x|small|medium|large|thumb))+$/i, '');
  const named = (s) => norm([s.id.replace(/[-_]+/g, ' '), s.getAttribute('aria-label') || '', norm(document.getElementById(s.getAttribute('aria-labelledby') || '')?.innerText), norm(s.querySelector('h1, h2, h3')?.innerText)].join(' '));
  // (rooms: a section or one round it named for them, never "Book a room"; or a picture alt-texted or captioned as one.
  // The house: a section named for it. The client's own place: a section named for its roastery, its bar, its kitchen)
  const ROOMS = /\b(rooms|suites|bedrooms|cabins|apartments|dorms)\b|\bthe (room|suite|cabin|apartment)\b/i, ROOM = /\b(room|bedroom|suite|dorm)\b/i;
  const HOUSE = /\b(?:the|our) (?:house|home|guesthouse|cottage|lodge|farmhouse)\b/i;
  const PLACE = /\b(?:roastery|bakery|brewery|kitchen|bar|counter|dining room|inside|interior|the (?:caf[eé]|restaurant|shop|space|place|room)|our (?:caf[eé]|restaurant|shop|space|place|room))\b/i;
  const within = (el, re) => { for (let s = el.closest('section, article, [data-scene]'); s; s = s.parentElement?.closest('section, article, [data-scene]')) if (re.test(named(s))) return true; return false; };
  const own = client ? new RegExp('(^|[^\\p{L}])' + client.replace(/[.*+?^$|()[\]{}\\]/g, '\\$&') + '($|[^\\p{L}])', 'iu') : null;
  // the page's credits list (a dialog, list or section named for credits) and its entries, with the files their links name
  const CRED = /credit|bildnachweis|fotonachweis|image sources|picture sources|photo sources|photographs? by/i;
  const conts = [...document.querySelectorAll('dialog, section, aside, div, ul, ol, details')].filter((el) => !el.closest('nav') && CRED.test([el.id, typeof el.className === 'string' ? el.className : '', el.getAttribute('aria-label') || '', norm(el.querySelector('h1, h2, h3, h4')?.textContent)].join(' ')));
  const entries = conts.flatMap((c) => [...c.querySelectorAll('li, p')].filter((e) => !e.querySelector('li, p') && /\bby\b|\bcc\b|public domain|unsplash|pexels|wikimedia|commons|licen[cs]e|\.(jpe?g|png|webp|avif)\b/i.test(e.textContent)))
    .map((e) => { const text = norm(e.textContent), files = [...e.querySelectorAll('a[href]')].map((a) => base(a.getAttribute('href')).replace(/^File:/, '').replace(/_/g, ' ')).filter((f) => f.length > 3); return { text: [text, ...files].join(' · '), f: ' ' + fold([text, ...files].join(' ')) + ' ' }; })
    .filter((e, i, a) => a.findIndex((x) => x.f === e.f) === i);
  let ledger = [];
  for (const p of ['assets/credits.json', 'credits.json', 'images/credits.json', 'img/credits.json']) { try { const res = await fetch(p, { cache: 'no-store' }); if (res.ok) { const j = await res.json(); if (Array.isArray(j)) { ledger = j; break; } } } catch {} }
  const recs = ledger.filter((l) => l && l.file).map((l) => ({ l, f: base(String(l.file)) }));
  const recOf = (files, el) => {
    const exact = recs.find((r) => files.includes(r.f)); if (exact) return exact.l;
    const sized = recs.filter((r) => stem(r.f).length >= 3 && files.some((f) => stem(f) === stem(r.f))); if (sized.length === 1) return sized[0].l;
    // (a copy saved under another name: the width, height and bytes of one record alone)
    const w = el.naturalWidth || el.videoWidth || 0, h = el.naturalHeight || el.videoHeight || 0, at = el.currentSrc || el.src;
    const bytes = w && at ? performance.getEntriesByName(new URL(at, location.href).href)[0]?.decodedBodySize || 0 : 0;
    const same = bytes ? recs.filter((r) => +r.l.width === w && +r.l.height === h && +r.l.bytes === bytes) : [];
    return same.length === 1 ? same[0].l : null;
  };
  // the items the page sells by name: a price (with its currency) and the words set apart before it in its row of twelve
  // words or fewer, an amount ("250 g") aside, in their section
  const PRICE = /[€$£]\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?(?:€|(?:EUR|USD|GBP|CHF|kr|NOK|DKK|SEK)\b)/;
  const secOf = (e) => e.closest('section, [data-scene]') || B;
  const items = [];
  { const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let j = 0;
    for (let n = tw.nextNode(); n && j < 400; n = tw.nextNode()) {
      const m = n.nodeValue.match(PRICE); if (!m || !n.parentElement || n.parentElement.closest('script, style, dialog, nav, footer')) continue; j++;
      let row = n.parentElement; while (row && row !== B && !/\p{L}{3}/u.test(norm(row.innerText).replace(PRICE, ''))) row = row.parentElement;
      if (!row || row === B || norm(row.innerText).split(' ').length > 12) continue;
      const before = []; const rw = document.createTreeWalker(row, NodeFilter.SHOW_TEXT); for (let t = rw.nextNode(); t && t !== n; t = rw.nextNode()) before.push(t.nodeValue);
      const name = norm([...before, n.nodeValue.slice(0, m.index)].join(' ')).replace(/[\d.,:–-]+\s*(?:g|kg|ml|cl|l|oz|pcs?)?\s*$/i, '').trim();
      if (before.some((t) => /\p{L}{3}/u.test(t)) && /\p{L}{3}/u.test(name) && name.split(' ').length <= 4) items.push({ name, f: fold(name), price: norm(n.nodeValue.slice(m.index)).slice(0, 12), sec: secOf(row) });
    } }
  const out = [], seen = new Set(), usedRec = new Set(), usedEntry = new Set(); let k = 0;
  for (const el of B.querySelectorAll('img, video, [style*="background-image"], figure, div, section, span')) {
    if (el.closest('dialog, [role=dialog], [data-ui], nav, header[role=banner]')) continue;
    // its files: what it shows, its source and every size of its srcset and its picture's, a film's clip and its poster
    const srcs = [];
    if (el.tagName === 'IMG') { srcs.push(el.currentSrc, el.getAttribute('src')); for (const s of [el, ...(el.parentElement?.tagName === 'PICTURE' ? el.parentElement.querySelectorAll('source') : [])]) for (const c of String(s.getAttribute('srcset') || '').split(',')) srcs.push(c.trim().split(/\s+/)[0]); }
    else if (el.tagName === 'VIDEO') srcs.push(el.currentSrc, el.getAttribute('src'), ...[...el.querySelectorAll('source')].map((s) => s.getAttribute('src')), el.getAttribute('poster'));
    else { const cs = getComputedStyle(el), m = cs.backgroundImage.match(/url\(["']?([^"')]+)/); if (m && /cover|contain/.test(cs.backgroundSize)) srcs.push(m[1]); }
    const urls = srcs.filter((u) => u && !/^data:|\.svg(\?|#|$)/i.test(u)), files = [...new Set(urls.map(base).filter(Boolean))];
    if (!files.length || !el.getClientRects().length || getComputedStyle(el).display === 'none') continue;
    const r = el.getBoundingClientRect(); if (r.width < 64 || r.height < 48) continue;
    // (one picture by its host and path: two library pictures at one size, /id/691/1600/1000 and /id/1060/1600/1000,
    // share their last part and are two pictures, each named from its id on as restLook names it; round 11f)
    const at = (() => { try { const u = new URL(urls[0], location.href); return u.host + dec(u.pathname); } catch { return files[0]; } })();
    const p = at.split('/'); let i = p.length - 1; while (i > 0 && p.length - i <= 3 && /^\d+$/.test(p[i])) i--; if (i < p.length - 1 && /^(id|seed)$/i.test(p[i])) i++;
    const file = i < p.length - 1 ? p.slice(i).join('/') : files[0];
    if (seen.has(at) || ++k > 120) continue;
    seen.add(at);
    const rec = recOf(files, el);
    const t = rec ? fold(rec.title).slice(0, 40) : '', pg = rec ? fold(base(rec.page || '').replace(/^File:/, '').replace(/_/g, ' ')).slice(-40) : '';
    const entry = entries.find((e) => (t.length >= 8 && e.f.includes(t)) || (pg.length >= 8 && e.f.includes(pg)) || files.some((f) => { const n = fold(f); return n.length >= 4 && e.f.includes(' ' + n + ' '); })) || null;
    if (rec) usedRec.add(rec);
    if (entry) usedEntry.add(entry);
    // what it is shown as: the slot marked on it, a caption with the client's name, the work, a room, the house, the
    // client's own place, the page's own product
    const fig = el.closest('figure'), caption = norm(fig?.querySelector('figcaption')?.textContent), alt = norm(el.getAttribute('alt') || el.getAttribute('aria-label'));
    const mark = el.closest('[data-slot]')?.getAttribute('data-slot') || '';
    const sec = el.closest('section, article, [data-scene]');
    const said = ' ' + fold([alt, caption, rec ? rec.title : ''].join(' ')) + ' ', dish = items.find((x) => x.sec === secOf(el) && x.f.length >= 3 && said.includes(' ' + x.f + ' '));
    const slot = mark ? (/product/i.test(mark) ? 'product' : /work|piece|project/i.test(mark) ? 'work' : /house|home/i.test(mark) ? 'house' : /room|stay/i.test(mark) ? 'room' : mark)
      : own && own.test(caption + ' ' + alt) ? 'caption' : files.some((f) => work.includes(f)) ? 'work' : within(el, ROOMS) || ROOM.test(caption + ' ' + alt) ? 'room' : within(el, HOUSE) ? 'house' : dish ? 'menu' : place && within(el, PLACE) ? 'place' : product ? 'product page' : null;
    if (!slot || out.length >= 24) continue;
    // (whose it is: the client's by its record's author, else by the entry's; another's by a record of its fetch, a
    // licence or a source in its entry, or an author who is not the client)
    const author = rec ? String(rec.creator || '') : norm(entry?.text.match(/\bby\s+([^,;.·]+)/)?.[1]);
    const theirs = !!own && own.test(author);
    const third = !theirs && (!!rec || !!author || /\bcc[ -]?(?:by|0)\b|\bcc0\b|\blicen[cs]ed?\b|public domain|unsplash|pexels|pixabay|wikimedia|commons|openverse|flickr|\bvia\b/i.test(entry?.text || ''));
    out.push({ file, files, slot, ...(slot === 'menu' && dish ? { item: `${dish.name}, ${dish.price}` } : {}), theirs, third, uncredited: !rec && !entry && !hasOwn, head: sec ? named(sec).slice(0, 40) : '', alt: alt.slice(0, 80), caption: caption.slice(0, 80), record: rec ? { title: String(rec.title || '').slice(0, 120), creator: String(rec.creator || '').slice(0, 80), file: base(rec.page || '').replace(/^File:/, '').replace(/_/g, ' ').slice(0, 120), notes: (rec.notes || []).join(' ').slice(0, 300) } : null, entry: entry ? entry.text.slice(0, 400) : null });
  }
  // (the credits no picture shown matches: a picture cropped or renamed from one of them is shown without its credit)
  const credits = [...recs.filter((r) => !usedRec.has(r.l)).map((r) => ({ title: String(r.l.title || '').slice(0, 120), creator: String(r.l.creator || '').slice(0, 80), file: base(r.l.page || '').replace(/^File:/, '').replace(/_/g, ' ').slice(0, 120), notes: '' })), ...entries.filter((e) => !usedEntry.has(e)).map((e) => ({ entry: e.text.slice(0, 300) }))].slice(0, 40);
  return { shown: out, credits };
}

// Round 11c (Leon: three button shapes at one size, a plain bar that hides on scroll; r12-p53's three unrelated buttons,
// r12-p54's six sections of a heading, a line and a list panel, r12-p52's page of slate boxes). On desktop.
//   navForm    the navigation in view now, at load, past the hero on the way down and after a short scroll back up: the
//              links and buttons of the site's bar (a header or nav outside the sections, at load) and of every layer fixed
//              to the screen or sticky outside the sections, on top where they lie, read as one form: a dock at the
//              bottom, a side index (three links or more to the page's own sections stacked at one side), a masthead (the
//              wordmark alone on its row and centred over the links; at load), a centred wordmark, corners (a group in
//              each top corner, nothing between them and no band behind them), a top bar, or none; whether a band lies
//              behind the top groups; whether the top group is the toolbar of the hero's product window (at load; round
//              11f), and whether it was read from that window's own header, the page having no bar of its own (fromWin);
//              and whether a scene or a sticky stage holds the screen (nav-not-as-dealt)
export function navForm(phase = 'load') {
  const W = innerWidth, H = innerHeight, B = document.body, D = document.documentElement;
  const css = (e) => getComputedStyle(e);
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const inSections = (el) => !!el.parentElement?.closest('main, section, article, [data-scene]');
  // (on top where it lies: on the screen, not faded, and what the screen shows at its middle)
  const onTop = (el) => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom <= 0 || r.top >= H || r.right <= 0 || r.left >= W) return false; for (let e = el; e && e !== D; e = e.parentElement) { const cs = css(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.5) return false; } const hit = document.elementFromPoint(Math.min(W - 1, Math.max(0, r.left + r.width / 2)), Math.min(H - 1, Math.max(0, r.top + r.height / 2))); return !!hit && (el.contains(hit) || hit.contains(el)); };
  // the layer that pins it: its outermost ancestor fixed to the screen, or sticky outside the sections (a sticky stage in a
  // section is the section's); any sticky one for a side index, which may stand in the page's grid
  const pinOf = (el, any = false) => { let p = null; for (let e = el; e && e !== B; e = e.parentElement) { const pos = css(e).position; if (pos === 'fixed' || (pos === 'sticky' && (any || !inSections(e)))) p = e; } return p; };
  const home = (a) => { const h = (a.getAttribute('href') || '').trim(); if (['#', '#top', '/', './', 'index.html', './index.html'].includes(h) || a.matches('[data-wordmark], [rel=home]')) return true; try { const u = new URL(h, location.href); return u.origin === location.origin && u.pathname.replace(/index\.html?$/, '') === location.pathname.replace(/index\.html?$/, '') && (!u.hash || u.hash === '#top'); } catch { return false; } };
  const inBar = (el) => { const b = el.closest('header, [role=banner]'); return !!el.closest('nav') || (!!b && !inSections(b)); };
  const clear = (e) => { const c = css(e).backgroundColor, a = c.match(/^rgba\(.*,\s*([\d.]+)\)$/); return c === 'transparent' || (!!a && +a[1] < 0.5); };
  const items = [], side = [], wins = [];
  for (const a of document.querySelectorAll('a[href], button, [role=button]')) {
    // (a product window's own controls are not the site's, unless a header or a nav in it is pinned to the screen: the
    // window's toolbar as the site's bar, round 11f; at load, one that scrolls with the window stands as the bar where the
    // page has no bar of its own (fromWin), so a toolbar that leaves with the hero is read as hiding)
    const win = !!a.closest('[data-ui]') && !!a.closest('header, nav, [role=banner], [role=navigation]');
    if (a.closest('dialog, [role=dialog], [aria-hidden=true], footer') || (a.closest('[data-ui]') && !win) || !norm(a.innerText || a.getAttribute('aria-label')) || !onTop(a)) continue;
    const q = a.getBoundingClientRect(), it = { a, l: q.left, r: q.right, t: q.top, b: q.bottom, mark: a.matches('a') && home(a), pin: pinOf(a) };
    if (win && !it.pin) { if (phase === 'load') wins.push(it); continue; }
    if (it.pin || (phase === 'load' && inBar(a))) items.push(it);
    if (/^#[^#\s]+$/.test(a.getAttribute('href') || '') && !it.mark && pinOf(a, true)) side.push(it);
  }
  const fromWin = !items.some((x) => x.t < 140) && wins.some((x) => x.t < 140);
  if (fromWin) items.push(...wins);
  const mid = (x) => (x.l + x.r) / 2;
  let form = 'none', band = false, toolbar = false;
  // a dock: two items or more fixed in the lowest band of the screen, in one group (an action and a Top tab in the two
  // bottom corners are corners)
  const dock = items.filter((x) => x.pin && css(x.pin).position === 'fixed' && x.t > H * 0.6 && x.b > H - 160);
  if (dock.length && Math.max(...dock.map((x) => x.r)) - Math.min(...dock.map((x) => x.l)) > W * 0.6) dock.length = 0;
  // a side index: three links or more to the page's sections, stacked on one left edge, at one side of the screen
  const stack = side.filter((x) => x.r <= W * 0.3 || x.l >= W * 0.7).filter((x, i, a) => a.filter((y) => Math.abs(y.l - x.l) <= 16).length >= 3);
  const top = items.filter((x) => x.t < 140 && x.b < H * 0.3);
  // the wordmark: the bar's link home (a monogram may link home too), else a mark named so in it
  const marks = top.filter((x) => x.mark);
  let mark = marks[0] || null;
  if (!mark && top.length) { const m = [...document.querySelectorAll('[data-wordmark], header [class*=wordmark i], header [class*=logo i], nav [class*=wordmark i], nav [class*=logo i]')].find((e) => onTop(e) && e.getBoundingClientRect().top < 140); if (m) { const q = m.getBoundingClientRect(); mark = { l: q.left, r: q.right, t: q.top, b: q.bottom, a: m }; } }
  if (dock.length >= 2 && new Set(dock.map((x) => x.pin)).size === 1) form = 'bottom dock';
  else if (stack.length >= 3) form = 'side index';
  else if (top.length) {
    const rest = top.filter((x) => x !== mark && !(mark && mark.a.contains(x.a)));
    const markRow = mark ? rest.filter((x) => Math.abs((x.t + x.b) / 2 - (mark.t + mark.b) / 2) <= 12) : [];
    // (the links under the wordmark, the action at the end of their row aside)
    const under = mark ? rest.filter((x) => x.t >= mark.b - 2) : [];
    const links = under.filter((x) => clear(x.a));
    const span = links.length ? [Math.min(...links.map((x) => x.l)), Math.max(...links.map((x) => x.r))] : null;
    // (a band behind the groups: a fill across half the screen or more round all of them)
    if (top.length >= 2) { let c = top[0].a.parentElement; while (c && !top.every((x) => c.contains(x.a))) c = c.parentElement; for (let e = c; e && e !== B && e !== D; e = e.parentElement) { const q = e.getBoundingClientRect(); if (q.width >= W * 0.5 && q.top < 140 && !clear(e)) { band = true; break; } if (q.height > H * 0.3) break; } }
    // round 11f: a toolbar on the hero's product window (window-toolbar), at load: the top group, over three quarters of
    // the width at most, sits on the top edge of the window, its body starting within 24px under the group and as wide
    // as the group or wider (to 80% of the screen), a third of the screen tall or more, drawn as a box or marked as the
    // product's; or the window holds the group, its top within 24px over the group's (a toolbar laid over the window's
    // own top 64px, panes under it). Read beside the form, so a bar dealt as a bar that stands over a window is still a bar
    const tl = Math.min(...top.map((x) => x.l)), tr = Math.max(...top.map((x) => x.r)), tt = Math.min(...top.map((x) => x.t)), tb = Math.max(...top.map((x) => x.b));
    const body = (e) => { const q = e.getBoundingClientRect(); return q.left <= tl + 8 && q.right >= tr - 8 && q.width <= W * 0.8 && q.top >= tb - 8 && q.top <= tb + 24 && q.height >= H * 0.33 && (!!e.closest('[data-ui]') || !clear(e) || /^(IMG|VIDEO|CANVAS)$/.test(e.tagName)); };
    const holds = (e) => { const q = e.getBoundingClientRect(); return q.left <= tl + 8 && q.right >= tr - 8 && q.width <= W * 0.8 && q.top >= tt - 24 && q.top <= tt + 2 && q.height >= H * 0.33 && (!!e.closest('[data-ui]') || !clear(e)); };
    toolbar = phase === 'load' && top.length >= 2 && tr - tl <= W * 0.75 && [...document.elementsFromPoint((tl + tr) / 2, Math.min(H - 1, tb + 32))].some((e) => { for (let x = e; x && x !== B && x !== D; x = x.parentElement) if (body(x) || holds(x)) return true; return false; });
    if (phase === 'load' && mark && !markRow.length && links.length >= 2 && Math.abs(mid(mark) - (span[0] + span[1]) / 2) <= Math.max(48, (span[1] - span[0]) * 0.15) && mid(mark) > W * 0.15) form = 'masthead';
    else if ((marks.length ? marks : [mark]).some((m) => m && Math.abs(mid(m) - W / 2) <= W * 0.04)) form = 'centred wordmark';
    else if (top.some((x) => x.r <= W * 0.4) && top.some((x) => x.l >= W * 0.6) && top.every((x) => x.r <= W * 0.4 || x.l >= W * 0.6) && !band) form = 'corners';
    else form = 'top bar';
  }
  // the screen held by a scene or a sticky stage (a side index or a dock may step aside while one holds it)
  let held = false;
  for (let e = document.elementFromPoint(W / 2, H / 2); e && e !== B && e !== D; e = e.parentElement) { const q = e.getBoundingClientRect(); if ((css(e).position === 'sticky' || e.matches('.pin-spacer, [data-scene], .scene')) && q.height >= H * 0.8 && q.top <= 2) { held = true; break; } }
  return { phase, form, band, held, ...(toolbar ? { toolbar } : {}), ...(fromWin ? { fromWin } : {}), n: items.length, top: top.length, mark: mark ? norm(mark.a.innerText || mark.a.getAttribute('aria-label')).slice(0, 30) : null, items: top.slice(0, 6).map((x) => norm(x.a.innerText || x.a.getAttribute('aria-label')).slice(0, 20)) };
}

//   buttonShapes  the page's buttons by shape: every link or button drawn as one (a fill unlike its ground, or an outline
//              on three sides), or holding a drawn part half its height or more beside its label (a circle with an arrow),
//              by its corner (square to 3px, soft to 12px, round, pill, circle) and its kind (filled, outlined), with the
//              heights it is built at (the sheet sizes the one button to the bar, a card or a form, so a height is no shape
//              of its own); and every link or button set in type that stands alone as an action (not in a sentence or a
//              list, not the bar's links or the footer's). Controls that are not actions are left out: icons with no word,
//              labels over six words, tabs, switches and toggles (an accordion's rows), the skip link, the wordmark or a
//              monogram linking home, a card or a band set as a link (a heading or a 48px picture in it, or over 96px
//              tall), and the bar's own cells (of three drawn items or more in the bar, only the last is its action)
//              (button-family). Round 11e (r13-p60 passed with folder tabs over its questions and a round monogram in its
//              bar): a tab or a toggle (a disclosure's row too, the bar's menu button aside) drawn as a folder tab (its top
//              corners round, its foot square) and a link home drawn round (a monogram in a circle, a name in a pill) count;
//              a mark in a square or soft tile, as many dealt bars carry, does not. A link to a bare "#" is the mark only
//              where it carries the client's name or initials; { bar: true } reads the bar alone, as it stands past the
//              hero. Round 11f: a square block with one corner cut off by a clip-path (the dog-ear) is a folded corner
export function buttonShapes({ bar: barOnly = false, client = null } = {}) {
  const W = innerWidth, SY = scrollY || 0, B = document.body;
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const groundOf = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.9) return c; } return [255, 255, 255, 1]; };
  const differs = (a, b, d = 6) => !!a && !!b && [0, 1, 2].some((i) => Math.abs(a[i] - b[i]) >= d);
  const sides = (el) => { const cs = css(el); return ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none' && (rgba(cs[`border${s}Color`]) || [0, 0, 0, 0])[3] > 0.2).length; };
  // (shown on the page: laid out, at a third of its opacity or more, and not parked off the screen like a skip link)
  const shown = (el) => { for (let e = el, i = 0; e && e !== B && i < 30; e = e.parentElement, i++) { const cs = css(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.3) return false; } const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.right > 0 && r.left < W && r.bottom + SY > 0; };
  const drawn = (e) => { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.5 && differs(c, groundOf(e.parentElement || B))) return 'filled'; return sides(e) >= 3 ? 'outlined' : null; };
  // (round 11f: a block whose clip-path polygon cuts off one corner, on itself or a wrapper of its size, is a folded
  // corner, the dog-ear, at any depth of its fold: 20px at 56px and 14px at 44px are one shape, its sibling with it)
  const len = (s, size) => { let v = 0, sign = 1; for (const t of s.replace(/^calc\((.*)\)$/, '$1').split(/\s+/)) { if (t === '+' || t === '-') { sign = t === '-' ? -1 : 1; continue; } const n = parseFloat(t); if (!Number.isFinite(n)) return NaN; v += sign * (t.endsWith('%') ? (n / 100) * size : n); } return v; };
  const folded = (e, q) => {
    for (let x = e, i = 0; x && i < 2; x = x.parentElement, i++) {
      const p = x.getBoundingClientRect(); if (i && (Math.abs(p.width - q.width) > 2 || Math.abs(p.height - q.height) > 2)) break;
      const m = css(x).clipPath.match(/^polygon\((.*)\)$/); if (!m) continue;
      const pts = m[1].split(',').map((pt) => (pt.match(/calc\([^)]*\)|[-\d.]+(?:px|%)?/g) || []).map((s, k) => len(s, k ? p.height : p.width)));
      if (pts.some((pt) => pt.length !== 2 || !pt.every(Number.isFinite))) continue;
      const kept = [[0, 0], [p.width, 0], [p.width, p.height], [0, p.height]].filter(([cx, cy]) => pts.some(([px, py]) => Math.abs(px - cx) <= 1.5 && Math.abs(py - cy) <= 1.5)).length;
      return kept === 3;
    }
    return false;
  };
  const corner = (e, q) => { const cs = css(e), px = (v) => (/%/.test(v) ? (parseFloat(v) / 100) * Math.min(q.width, q.height) : parseFloat(v) || 0); const r = px(cs.borderTopLeftRadius); if (r <= 3 && folded(e, q)) return 'folded corner'; if (r > 3 && px(cs.borderTopRightRadius) > 3 && px(cs.borderBottomLeftRadius) <= 3 && px(cs.borderBottomRightRadius) <= 3) return 'folder tab'; if (r >= q.height / 2 - 1) return Math.abs(q.width - q.height) <= 4 ? 'circle' : 'pill'; return r <= 3 ? 'square' : r <= 12 ? 'soft' : 'round'; };
  const inBar = (el) => { const b = el.closest('header, [role=banner]'); return !!el.closest('nav') || (!!b && !b.parentElement?.closest('main, section, article, [data-scene]')); };
  // (a link home, read as navForm reads the wordmark)
  const home = (a) => { const h = (a.getAttribute('href') || '').trim(); if (['#', '#top', '/', './', 'index.html', './index.html'].includes(h)) return true; try { const u = new URL(h, location.href); return u.origin === location.origin && u.pathname.replace(/index\.html?$/, '') === location.pathname.replace(/index\.html?$/, '') && (!u.hash || u.hash === '#top'); } catch { return false; } };
  // (the client's name or initials in a label: a placeholder "#" in the bar is no mark without them)
  const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, '');
  const name = fold(client), initials = fold(String(client || '').split(/\s+/).map((w) => w[0]).join(''));
  const brand = (el, text) => { const t = fold(`${text} ${el.getAttribute('aria-label') || ''}`), w = fold(text); return !!name && (t.includes(name) || (!!w && w.length <= 3 && (name.startsWith(w) || w === initials))); };
  const shapes = new Map(), bar = [];
  const add = (key, label, h = 0) => { const s = shapes.get(key) || { n: 0, labels: [], h: [] }; s.n++; if (s.labels.length < 2 && !s.labels.includes(label)) s.labels.push(label); if (h) s.h.push(Math.round(h)); shapes.set(key, s); };
  for (const el of document.querySelectorAll('a[href], button, [role=button], input[type=submit], input[type=button], summary')) {
    if (el.closest('[data-ui], dialog, [role=dialog], [aria-hidden=true]') || el.parentElement?.closest('summary') || el.matches('[role=switch]') || (el.matches('[aria-expanded], summary') && inBar(el)) || !shown(el) || (barOnly && !inBar(el))) continue;
    // (the words counted on the whole label, before it is cut for the report)
    const text = norm(el.innerText || el.value || ''), label = text.slice(0, 30);
    // (a tab or a toggle only where drawn as a folder tab; the wordmark or a monogram linking home only where drawn round)
    const tab = !!el.closest('[role=tablist]') || el.matches('[role=tab], [aria-pressed], [aria-expanded], summary'), mark = el.matches('[data-wordmark], [rel=home]') || (el.matches('a') && inBar(el) && home(el) && ((el.getAttribute('href') || '').trim() !== '#' || brand(el, text)));
    if (!/\p{L}/u.test(text) || text.split(' ').length > 6 || /^skip\b/i.test(text)) continue;
    const q = el.getBoundingClientRect(); if (q.height > 96 || q.width > W * 0.6 || el.querySelector('h1, h2, h3, h4, h5, h6, [role=heading]') || [...el.querySelectorAll('img, picture, video, canvas')].some((m) => m.getBoundingClientRect().height >= 48)) continue;
    let how = drawn(el), box = el;
    if (!how) for (const c of el.querySelectorAll('*')) { const k = drawn(c), p = c.getBoundingClientRect(); if (k && p.height >= q.height * 0.5 && p.width >= 16) { how = k; box = c; break; } }
    const shape = how && corner(box, box.getBoundingClientRect());
    if ((tab && shape !== 'folder tab') || (mark && !['circle', 'pill'].includes(shape))) continue;
    if (how) {
      const p = box.getBoundingClientRect(), key = `${shape} ${how}${box !== el ? ', beside its label' : ''}`;
      if (inBar(el) && !mark) bar.push({ key, label, x: q.left, h: p.height }); else add(key, label, p.height);
      continue;
    }
    // set in type: an action standing alone (a sentence's link and a list's are not)
    if (inBar(el) || el.closest('footer, li') || el.matches('a[href^="mailto:"], a[href^="tel:"]')) continue;
    const host = el.parentElement?.closest('p, dd, dt, td, th, h1, h2, h3, h4, h5, h6, figcaption, blockquote, label');
    if (host && norm(host.innerText).length > text.length + 2) continue;
    add('type', label);
  }
  for (const b of bar.length <= 2 ? bar : [bar.sort((x, y) => y.x - x.x)[0]]) add(b.key, b.label, b.h);
  return [...shapes].map(([key, s]) => ({ key, n: s.n, labels: s.labels, ...(s.h.length ? { h: [Math.min(...s.h), Math.max(...s.h)] } : {}) }));
}

//   structures each section's structure after the hero (the hero and the footer too, marked): where its heading stands
//              against the rest (over it, beside it), how many columns it makes at its widest row, and the largest group
//              it holds (a list, a list in a product window, cards, one panel, a product window, a picture or pictures, a
//              form, a table, or text), read as one word (split for a heading beside the rest, columns for two or more
//              under it, grid, gallery, list, table, single-picture, panel, tool, statement), and whether that group
//              stands in a box (cards, a panel, or a window drawn on a fill unlike its section's). A scene that shows
//              nothing yet but its heading is left out (same-structure, boxed-page)
export function structures() {
  const W = innerWidth, H = innerHeight, SY = scrollY || 0, B = document.body;
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const visible = (el) => { for (let e = el, i = 0; e && e !== B && i < 30; e = e.parentElement, i++) { const cs = css(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const words = (t) => (norm(t).match(/\S+/g) || []).length;
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const groundOf = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.9) return c; } return [255, 255, 255, 1]; };
  const differs = (a, b, d = 6) => !!a && !!b && [0, 1, 2].some((i) => Math.abs(a[i] - b[i]) >= d);
  const filled = (e) => { const c = rgba(css(e).backgroundColor); return !!c && c[3] >= 0.5 && differs(c, groundOf(e.parentElement || B)); };
  const area = (q) => Math.max(0, Math.min(W, q.right) - Math.max(0, q.left)) * Math.max(0, q.bottom - q.top);
  const union = (els) => { const rs = els.map((e) => e.getBoundingClientRect()); return { left: Math.min(...rs.map((q) => q.left)), right: Math.max(...rs.map((q) => q.right)), top: Math.min(...rs.map((q) => q.top)), bottom: Math.max(...rs.map((q) => q.bottom)) }; };
  // the sections as the splits take them (the innermost of section, scene, hero, a child of main), the footer aside
  const qual = (s) => { if (!visible(s) || s.closest('nav, footer, dialog, header[role=banner]')) return false; const r = s.getBoundingClientRect(); return r.height >= 160 && r.width >= W * 0.3; };
  const secs = [...document.querySelectorAll('section, [data-scene], [data-hero], main > div, main > article')].filter(qual).filter((s, i, a) => !a.some((o) => o !== s && s.contains(o))).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 30);
  // round 11f (r14-p64: a row of three grey cards in two sections and again in its footer): the site's footer, a designed
  // section now, is read like one (foot), as footing() finds it
  const outside = (f) => !f.parentElement?.closest('main, section, article, footer, [data-scene], dialog, [role=dialog]');
  const foot = [...document.querySelectorAll('footer, [role=contentinfo]')].filter((f) => outside(f) && visible(f)).pop();
  if (foot && foot.getBoundingClientRect().height >= 160 && foot.getBoundingClientRect().width >= W * 0.3 && !secs.some((s) => foot.contains(s) || s.contains(foot))) secs.push(foot);
  const out = [];
  for (const s of secs) {
    const sr = s.getBoundingClientRect(), hero = s !== foot && (!!s.querySelector('h1') || sr.top + SY < H * 0.5);
    // (the footer is read by what it holds: a card's own heading is no heading over the footer)
    const h = s === foot ? null : [...s.querySelectorAll(hero ? 'h1, h2' : 'h2, h3, [role=heading]')].find((x) => visible(x) && !x.closest('[data-ui]'));
    // the head block: the heading and the short text with it, up to the box that also holds a list, a picture or a form
    let hb = h;
    if (h) for (let e = h.parentElement; e && e !== s && s.contains(e); e = e.parentElement) { if (e.matches('ul, ol, dl, table, [role=list], form') || e.querySelector('img, video, canvas, [data-ui], ul, ol, dl, table, form, input, [role=list]') || words(e.innerText) > words(h.innerText) + 60) break; hb = e; }
    const hr = hb ? hb.getBoundingClientRect() : null;
    const apart = (el) => !(hb && (hb.contains(el) || el.contains(hb)));
    // (a band over the heading, a ticker, is not what the section holds; nor a link drawn as a button)
    const above = (q) => !!hr && q.bottom <= hr.top + 2;
    const parts = []; const part = (q) => { const l = Math.max(0, q.left), r = Math.min(W, q.right); if (r - l >= 4 && q.bottom - q.top >= 4 && !above(q)) parts.push({ l, r, t: q.top, b: q.bottom }); };
    const tw = document.createTreeWalker(s, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n, k = 0;
    while ((n = tw.nextNode()) && k < 800) { const el = n.parentElement; if (!norm(n.nodeValue) || !el || !apart(el) || el.closest('[aria-hidden=true]') || !visible(el)) continue; k++; rg.selectNodeContents(n); for (const q of rg.getClientRects()) part(q); }
    for (const m of s.querySelectorAll('img, video, canvas, [data-ui], input, textarea, select')) if (apart(m) && visible(m) && area(m.getBoundingClientRect()) > 400) part(m.getBoundingClientRect());
    const boxes = [...s.querySelectorAll('div, article, li, figure, aside, a, ul, ol')].filter((e) => { if (!apart(e) || !visible(e) || !filled(e)) return false; const q = e.getBoundingClientRect(); return q.width >= 80 && q.height >= 40 && q.width < W * 0.94 && !above(q) && !(e.matches('a') && q.height <= 64 && words(e.innerText) <= 5); });
    for (const e of boxes) part(e.getBoundingClientRect());
    const rec = { head: s === foot ? 'the footer' : norm(h ? h.innerText : s.id).slice(0, 40), y: Math.round(sr.top + SY), hero, ...(s === foot ? { foot: true } : {}) };
    if (!parts.length) { if (s.closest('.scene, [data-scene], .pin-spacer')) continue; out.push({ ...rec, word: 'statement', lead: 'none', boxed: false }); continue; }
    const body = { l: Math.min(...parts.map((p) => p.l)), r: Math.max(...parts.map((p) => p.r)), t: Math.min(...parts.map((p) => p.t)) };
    rec.pos = !hr ? 'none' : hr.right <= body.l + 8 || hr.left >= body.r - 8 ? 'beside' : hr.bottom <= body.t + 8 ? 'over' : 'mixed';
    // its columns: the most parts side by side at one height (the head block among them where it stands beside)
    const ps = hr && rec.pos === 'beside' ? [...parts, { l: Math.max(0, hr.left), r: Math.min(W, hr.right), t: hr.top, b: hr.bottom }] : parts;
    rec.cols = 0;
    for (const p of ps) { const y = (p.t + p.b) / 2, iv = ps.filter((q) => q.t <= y && q.b >= y).map((q) => [q.l, q.r]).sort((a, b) => a[0] - b[0]), m = []; for (const [l, r] of iv) { const c = m[m.length - 1]; if (c && l <= c[1] + 16) c[1] = Math.max(c[1], r); else m.push([l, r]); } rec.cols = Math.max(rec.cols, m.filter((c) => c[1] - c[0] >= W * 0.06).length); }
    // its groups: lists (three items or more; a list of filled items is cards), product windows (a list when they hold
    // one), cards or one panel, pictures, a form
    const groups = [];
    const itemsOf = (l) => [...l.children].filter((c) => visible(c) && !(hb && c.contains(hb)));
    // (an item is filled by itself or by the frame that holds most of it: a piece of work's coloured frame)
    const itemFilled = (c) => filled(c) || [...c.children].some((x) => filled(x) && area(x.getBoundingClientRect()) >= area(c.getBoundingClientRect()) * 0.6);
    const lists = [...s.querySelectorAll('ul, ol, dl, table, [role=list]')].filter((l) => !(hb && hb.contains(l)) && visible(l) && !l.closest('[data-ui]') && itemsOf(l).length >= 3);
    for (const l of lists) { if (lists.some((o) => o !== l && o.contains(l))) continue; const kids = itemsOf(l), boxed = kids.filter(itemFilled).length >= kids.length * 0.6; groups.push({ kind: boxed ? 'cards' : l.matches('table') ? 'table' : 'list', el: l, q: l.getBoundingClientRect(), boxed }); }
    for (const u of s.querySelectorAll('[data-ui]')) { if (u.parentElement?.closest('[data-ui]') || !apart(u) || !visible(u)) continue; groups.push({ kind: [...u.querySelectorAll('ul, ol, table, [role=list]')].some((l) => [...l.children].filter(visible).length >= 3) ? 'list' : 'window', el: u, q: u.getBoundingClientRect(), boxed: [...u.querySelectorAll('div, article, li, figure, aside')].filter((e) => filled(e) && visible(e) && e.getBoundingClientRect().width >= 80 && e.getBoundingClientRect().height >= 40).length >= 2 }); }
    const outer = boxes.filter((e) => !boxes.some((o) => o !== e && o.contains(e)) && !e.closest('[data-ui]') && !e.querySelector('[data-ui]') && !lists.some((l) => l.contains(e) || e.contains(l)) && norm(e.innerText));
    // (the footer holds cards only as a row of three or more alike, each 120px tall or more: two halves across the width,
    // keys or a fill behind its links are the dealt footer's own build)
    const row = s !== foot ? outer : outer.filter((e) => { const q = e.getBoundingClientRect(); return q.height >= 120 && outer.filter((o) => { const p = o.getBoundingClientRect(); return p.height >= 120 && Math.abs(p.top - q.top) <= 24 && p.width <= q.width * 1.3 && q.width <= p.width * 1.3; }).length >= 3; });
    if (s === foot ? row.length >= 3 : outer.length) groups.push({ kind: row.length >= 2 ? 'cards' : 'panel', el: row[0], q: union(row), boxed: true });
    const pics = [...s.querySelectorAll('img, video, canvas')].filter((m) => apart(m) && visible(m) && !m.closest('[data-ui]') && area(m.getBoundingClientRect()) >= W * H * 0.04);
    if (pics.length) groups.push({ kind: pics.length >= 3 ? 'pictures' : 'picture', el: pics[0], q: union(pics) });
    const fields = [...s.querySelectorAll('form, input:not([type=hidden]), select, textarea')].filter((f) => apart(f) && visible(f) && !f.closest('[data-ui]'));
    if (fields.length) groups.push({ kind: 'tool', el: fields[0], q: union(fields) });
    const lead = groups.filter((g) => !above(g.q)).sort((a, b) => area(b.q) - area(a.q))[0];
    rec.lead = lead ? lead.kind : 'text';
    rec.word = rec.cols >= 2 && rec.pos !== 'beside' && /cards|pictures/.test(rec.lead) ? (rec.lead === 'pictures' ? 'gallery' : 'grid') : rec.pos === 'beside' ? 'split' : rec.cols >= 2 ? 'columns' : { list: 'list', table: 'table', window: 'single-picture', picture: 'single-picture', pictures: 'gallery', cards: 'grid', panel: 'panel', tool: 'tool', text: 'statement' }[rec.lead];
    // in a box: cards or a panel, a window of boxes, or a list or window on a fill unlike the section's, inside the margins
    rec.boxed = !!lead && (!!lead.boxed || (/list|window|table/.test(lead.kind) && (() => { for (let e = lead.el; e && e !== s; e = e.parentElement) if (filled(e) && e.getBoundingClientRect().width < W * 0.94) return true; return false; })()));
    out.push(rec);
  }
  return out;
}

// Round 11e (review-006: two buttons to one place on four pages of six, where the sheet forbade it; r13-p59's footer
// linked to three word processors and three style guides). On desktop.
//   samePlace  two ways to one place on one screen, in one block or two: a button (drawn, as buttonShapes() reads one) and
//              another button or a link standing alone (not in a sentence, nor an address shown as itself) to the same
//              place (the same address once normalised: a page, an anchor, a mail address and its subject, a phone number;
//              or the same label), or two such links to one address under one label. An action tile counts at any height,
//              a card set as a link (a heading or a 48px picture in it) does not. The bar's links and the footer's lists
//              are the site's index: the bar counts only its buttons (its action and the hero's button to one place fail),
//              a footer list only within the footer. Cards of one group under one label, each with its own address or none
//              (a plan's own sign-up, an Add on each), are each card's own action. At the top of the page after the walk
//              it reads what stands in the page within one screen's height; { screen: true }, at each screen of the walk,
//              what is on the screen then, the bar, a chip and a sticky stage where they stand. Each action keeps one
//              number across the calls, so one finding read twice is one (duplicate-action)
export function samePlace({ screen = false } = {}) {
  const W = innerWidth, H = innerHeight, SY = scrollY || 0, B = document.body;
  const memo = new Map(); const css = (e) => { let c = memo.get(e); if (!c) { c = getComputedStyle(e); memo.set(e, c); } return c; };
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const groundOf = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.9) return c; } return [255, 255, 255, 1]; };
  const differs = (a, b, d = 6) => !!a && !!b && [0, 1, 2].some((i) => Math.abs(a[i] - b[i]) >= d);
  const sides = (el) => { const cs = css(el); return ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none' && (rgba(cs[`border${s}Color`]) || [0, 0, 0, 0])[3] > 0.2).length; };
  const shown = (el) => { for (let e = el, i = 0; e && e !== B && i < 30; e = e.parentElement, i++) { const cs = css(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.3) return false; } const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.right > 0 && r.left < W && r.bottom + SY > 0; };
  const drawn = (e) => { const c = rgba(css(e).backgroundColor); if (c && c[3] >= 0.5 && differs(c, groundOf(e.parentElement || B))) return true; return sides(e) >= 3; };
  const home = (a) => { const h = (a.getAttribute('href') || '').trim(); if (['#', '#top', '/', './', 'index.html', './index.html'].includes(h)) return true; try { const u = new URL(h, location.href); return u.origin === location.origin && u.pathname.replace(/index\.html?$/, '') === location.pathname.replace(/index\.html?$/, '') && (!u.hash || u.hash === '#top'); } catch { return false; } };
  // (pinned to the screen: fixed or sticky, itself or a box round it)
  const pinned = (el) => { for (let e = el; e && e !== B; e = e.parentElement) if (['fixed', 'sticky'].includes(css(e).position)) return true; return false; };
  // (on the screen now: half its height or more inside it)
  const inView = (q) => Math.min(q.bottom, H) - Math.max(q.top, 0) >= q.height / 2 && q.right > 0 && q.left < W;
  // (the label as read aloud: words hidden from it, a rolling copy, left out)
  const said = (el) => { let t = ''; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) if (!n.parentElement?.closest('[aria-hidden=true]')) t += ' ' + n.nodeValue; return norm(t) || norm(el.getAttribute('aria-label') || el.value || ''); };
  const key = (t) => t.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const ids = window.__tastePlaces || (window.__tastePlaces = { map: new WeakMap(), n: 0 });
  const idOf = (el) => { let i = ids.map.get(el); if (!i) ids.map.set(el, (i = ++ids.n)); return i; };
  // (where it goes: a mail address with its subject, a phone's digits, a page and its anchor without tracking)
  const placeOf = (el) => {
    const h = el.getAttribute('href'); if (h == null) return null;
    try {
      const u = new URL(h, location.href);
      if (u.protocol === 'mailto:') { const s = norm(u.searchParams.get('subject')).toLowerCase(); return 'mailto:' + decodeURIComponent(u.pathname).toLowerCase() + (s ? '?' + s : ''); }
      if (u.protocol === 'tel:') return 'tel:' + u.pathname.replace(/\D/g, '');
      for (const k of [...u.searchParams.keys()]) if (/^utm_/.test(k)) u.searchParams.delete(k);
      return u.origin + u.pathname.replace(/\/index\.html?$/, '/').replace(/\/$/, '') + u.search + u.hash;
    } catch { return h; }
  };
  const short = (p) => { let s = p.replace(/^https?:\/\/(www\.)?/, '').replace(location.host + location.pathname.replace(/\/index\.html?$/, '/').replace(/\/$/, ''), ''); try { s = decodeURIComponent(s); } catch {} return s.replace(/\+/g, ' ').slice(0, 50).replace(/[\s,;:&=?/-]+$/, ''); };
  // (the block: the site's footer, the bar, else the outermost section, scene or hero round it. The bar is a header under a
  // third of the screen tall outside the sections or holding the links or the wordmark (a hero built as a header is the
  // hero), else a layer fixed to the screen as low that holds them (a bar built of a div), else a nav)
  const barOf = (el) => {
    const h = el.closest('header, [role=banner]'), low = !!h && h.getBoundingClientRect().height < H / 3, n = el.closest('nav'), holds = (e) => !!e.querySelector('nav, [data-wordmark]') || [...e.querySelectorAll('a[href]')].some(home);
    if (low && (n ? h.contains(n) : !h.parentElement?.closest('main, section, article, [data-scene]') || holds(h))) return h;
    let p = null; for (let e = el; e && e !== B; e = e.parentElement) if (css(e).position === 'fixed') p = e;
    return p && p.getBoundingClientRect().height < H / 3 && holds(p) ? p : n;
  };
  const blockOf = (el) => {
    const f = el.closest('footer, [role=contentinfo]');
    if (f && !f.closest('article, blockquote')) { let o = f; for (let e = f.parentElement; e; e = e.parentElement) if (e.matches('footer, [role=contentinfo]')) o = e; return o; }
    const b = barOf(el); if (b) return b;
    let o = null, top = null;
    for (let e = el; e && e !== B; e = e.parentElement) { if (e.matches('section, [data-scene], [data-hero]')) o = e; if (e.parentElement === B || e.parentElement?.matches('main')) top = e; }
    return o || top || el.parentElement;
  };
  // (two cards of one group: in one block, the children of the box that holds both, round each action, of one tag and
  // sharing a class or built alike, as a picked plan or a staggered card is)
  const cards = (x, y) => {
    if (x.block !== y.block) return false;
    let p = x.el.parentElement; while (p && !p.contains(y.el)) p = p.parentElement; if (!p) return false;
    const kid = (e) => { while (e.parentElement !== p) e = e.parentElement; return e; }, cx = kid(x.el), cy = kid(y.el);
    if (cx === cy || cx === x.el || cy === y.el || cx.tagName !== cy.tagName) return false;
    const built = (e) => [...e.children].map((c) => c.tagName).join();
    return [...cx.classList].some((c) => cy.classList.contains(c)) || (cx.children.length > 1 && built(cx) === built(cy));
  };
  const acts = [];
  for (const el of document.querySelectorAll('a[href], button, [role=button], input[type=submit], input[type=button]')) {
    const q = el.getBoundingClientRect();
    if ((screen && !inView(q)) || el.closest('[data-ui], dialog, [role=dialog], [aria-hidden=true], [role=tablist], summary') || el.matches('[role=tab], [role=switch], [aria-pressed], [aria-expanded], [data-wordmark], [rel=home]') || !shown(el)) continue;
    if ((!screen && pinned(el)) || (el.matches('a') && home(el))) continue;
    const text = said(el);
    if (!/\p{L}/u.test(text) || text.split(' ').length > 6 || /^skip\b/i.test(text) || /@|^\+?[\d\s().\/-]{6,}$|^(https?:\/\/|www\.)/i.test(text)) continue;
    if (q.width > W * 0.6 || el.querySelector('h1, h2, h3, h4, h5, h6, [role=heading]') || [...el.querySelectorAll('img, picture, video, canvas')].some((m) => m.getBoundingClientRect().height >= 48)) continue;
    let button = drawn(el);
    if (!button) for (const c of el.querySelectorAll('*')) { const p = c.getBoundingClientRect(); if (drawn(c) && p.height >= q.height * 0.5 && p.width >= 16) { button = true; break; } }
    // (a sentence's link is no action of its own)
    const host = el.parentElement?.closest('p, dd, dt, td, th, h1, h2, h3, h4, h5, h6, figcaption, blockquote, label');
    if (!button && host && norm(host.innerText).length > text.length + 2) continue;
    const block = blockOf(el), bar = block === barOf(el);
    acts.push({ el, id: idOf(el), button, bar, index: !button && (bar || (block.matches('footer, [role=contentinfo]') && !!el.closest('nav, ul, ol'))), label: text.slice(0, 30), k: key(text), place: placeOf(el), block, t: q.top + SY, b: q.bottom + SY });
    if (acts.length >= 200) break;
  }
  const found = [];
  for (let i = 0; i < acts.length; i++) for (let j = i + 1; j < acts.length; j++) {
    const a = acts[i], b = acts[j];
    if ((!screen && Math.max(a.b, b.b) - Math.min(a.t, b.t) > H) || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const href = !!a.place && a.place === b.place, named = !!a.k && a.k === b.k;
    // (the index: the bar counts only its buttons, a footer's list only within the footer)
    if (!(a.button || b.button ? href || named : href && named) || ((a.bar || b.bar) && !(a.button && b.button)) || (a.block !== b.block && (a.index || b.index))) continue;
    if (!href && cards(a, b)) continue;
    // (three ways to one place are one finding)
    const g = found.find((x) => x.items.includes(a) || x.items.includes(b));
    if (g) { for (const x of [a, b]) if (!g.items.includes(x)) g.items.push(x); g.place = g.place || (href ? a.place : null); } else found.push({ items: [a, b], place: href ? a.place : null });
  }
  const where = (x) => { const blk = x.block, pin = pinned(x.el); if (blk.matches('footer, [role=contentinfo]')) return 'the footer'; if (x.bar) return 'the bar'; const r = blk.getBoundingClientRect(); if (blk.querySelector('h1') || (!pin && r.top + SY < H * 0.5)) return 'the hero'; if (pin && blk === x.el) return 'a button fixed to the screen'; const h = blk.querySelector('h2, h3, [role=heading]'); return `"${norm(h ? h.innerText : blk.id || blk.className).slice(0, 36)}"`; };
  return found.slice(0, 8).map((g) => ({ items: g.items.map((x) => ({ id: x.id, label: x.label, button: x.button, where: where(x) })), place: g.place ? short(g.place) : null, screen: (screen ? Math.round(SY / H) : Math.floor(Math.min(...g.items.map((x) => x.t)) / H)) + 1 }));
}

//   footerLinks the footer's links to other sites (the footer as footing() finds it): every link to another address on the
//              web that is not the client's own (their name in its address, or the domain of the page's own mail), a map, a
//              profile on a social network, nor a picture's credit (in a credits list or a line naming an author or a
//              licence, or to a picture library or a licence) (footer-other-sites)
export function footerLinks({ client = null } = {}) {
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const shows = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) return false; } return el.getClientRects().length > 0; };
  const outside = (f) => !f.parentElement?.closest('main, section, article, footer, [data-scene], dialog, [role=dialog]');
  const foot = [...document.querySelectorAll('footer, [role=contentinfo]')].filter((f) => outside(f) && shows(f)).pop()
    || [...document.querySelectorAll('[class*=footer i], [id*=footer i]')].filter((f) => outside(f) && shows(f) && f.getBoundingClientRect().height >= 16).pop()
    || [...document.querySelectorAll('footer, [role=contentinfo]')].filter((f) => !f.parentElement?.closest('article, blockquote, dialog, [role=dialog]') && shows(f)).pop();
  if (!foot) return [];
  const fold = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '');
  const name = fold(client);
  // (the client's own domains: those of the page's mail addresses)
  const own = new Set([...document.querySelectorAll('a[href^="mailto:" i]')].map((a) => (a.getAttribute('href').slice(7).split('?')[0].split('@')[1] || '').toLowerCase().replace(/^www\./, '')).filter(Boolean));
  const MAPS = /(google\.[a-z.]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl|maps\.apple\.com|openstreetmap\.org|\bosm\.org|bing\.com\/maps|wego\.here\.com|\bhere\.com|citymapper\.com|waze\.com)/i;
  const SOCIAL = /(^|\.)(instagram|facebook|twitter|x|linkedin|youtube|tiktok|threads|pinterest|vimeo|github|dribbble|behance|bsky|spotify|soundcloud|bandcamp|tumblr)\.[a-z.]+$/i;
  const SOURCE = /unsplash|pexels|pixabay|wikimedia|wikipedia|openverse|flickr|rawpixel|creativecommons|publicdomain/i;
  const CRED = /credit|bildnachweis|fotonachweis|image sources|picture sources|photo sources|photographs? by/i;
  const out = [];
  for (const a of foot.querySelectorAll('a[href]')) {
    if (a.closest('dialog, [role=dialog], [aria-hidden=true]') || !shows(a)) continue;
    let u; try { u = new URL(a.getAttribute('href'), location.href); } catch { continue; }
    if (!/^https?:$/.test(u.protocol) || u.origin === location.origin) continue;
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    if ((name.length >= 3 && fold(host + u.pathname).includes(name)) || [...own].some((d) => host === d || host.endsWith('.' + d))) continue;
    if (MAPS.test(host + u.pathname) || SOCIAL.test(host) || SOURCE.test(host)) continue;
    // (a credit's link: in a box named for the credits, or in a line naming an author or a licence)
    let credit = false;
    for (let e = a.parentElement; e && e !== foot && !credit; e = e.parentElement) credit = CRED.test([e.id, typeof e.className === 'string' ? e.className : '', e.getAttribute('aria-label') || ''].join(' ')) || (e.matches('p, li, small, figcaption') && /\bby\b|\bcc[ -]?(?:by|0)\b|public domain|licen[cs]/i.test(norm(e.textContent).slice(0, 300)));
    if (!credit) out.push({ text: norm(a.innerText || a.getAttribute('aria-label')).slice(0, 40), host });
  }
  return out.slice(0, 12);
}

// deadControls: the controls of the first screen that change nothing when used (dead-control). A button, a field or a
// link to "#" on the first screen, and in a product window anything drawn as a control (a field outlined round a few
// words, a filled button of one to four words), is clicked once: it is alive when the page changes beyond what changes
// by itself in the same time (attributes, nodes, text), when focus lands in a field that takes typing, or when the
// address, the scroll or an open dialog changes. r9-p41: the hero's search box and its New note button looked usable
// and did nothing. Runs last; it may leave a menu open.
export async function deadControls() {
  const W = innerWidth, H = innerHeight;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch { window.scrollTo(0, 0); }
  await wait(500);
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const words = (t) => (norm(t).match(/\S+/g) || []).length;
  const rgba = (c) => { const s = String(c || ''); const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return [k[1] * 255, k[2] * 255, k[3] * 255, k[4] != null ? +k[4] : 1]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const groundOf = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c[3] >= 0.9) return c; } return [255, 255, 255, 1]; };
  const shows = (el) => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= +getComputedStyle(e).opacity; if (o < 0.5) return false; const r = el.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.top < H * 0.95 && r.bottom > 0 && r.left < W && r.right > 0; };
  const label = (el) => norm(el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || el.textContent || '').slice(0, 40);
  // (drawn as a control inside a product window: a field outlined round a few words, or a filled box of one to four)
  // (a list's row, a marked word in a sentence or a chip inside running text is not a control)
  const drawn = (el) => {
    if (el.childElementCount > 1 || [...el.children].some((c) => !/^(SVG|SPAN|I|B|KBD|IMG)$/i.test(c.tagName)) || /^(LI|TR|TD|TH|DT|DD|MARK|EM|STRONG|U|P|H\d)$/.test(el.tagName)) return null;
    if (el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && norm(n.nodeValue).length > 1)) return null;
    // (a figure in a filled tile is a value, not a button)
    const t = norm(el.textContent); if (!t || words(t) > 4 || /^[£$€¥+\-−]?\s?[\d.,\s:%]+\s?[a-z%€£$]{0,4}$/i.test(t)) return null;
    const r = el.getBoundingClientRect(); if (r.height < 22 || r.height > 64 || r.width < 40 || r.width > W * 0.7) return null;
    const cs = getComputedStyle(el), c = rgba(cs.backgroundColor), g = groundOf(el.parentElement);
    const filled = c && c[3] >= 0.5 && [0, 1, 2].some((i) => Math.abs(c[i] - g[i]) >= 8);
    const outlined = ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none').length >= 4;
    if (outlined && (words(t) >= 2 || /search|find|type|ask|email|name/i.test(t))) return 'field';
    if (filled && words(t) <= 4 && parseFloat(cs.borderTopLeftRadius) >= 2) return 'button';
    return null;
  };
  const cands = [];
  for (const el of document.querySelectorAll('button, [role=button], input:not([type=hidden]), select, textarea, a[href="#"], a[href=""], [data-ui] *')) {
    if (cands.length >= 10) break;
    // (the site's bar, a header outside the page's sections or a bar fixed at the top, is the navigation's business)
    const bar = el.closest('header'); if (bar && !bar.parentElement?.closest('main, section, article, [data-scene]')) continue;
    if (el.closest('nav, header[role=banner], dialog, [role=dialog], footer') || el.disabled || !shows(el)) continue;
    if ((() => { for (let e = el, i = 0; e && e !== document.body; e = e.parentElement, i++) { const p = getComputedStyle(e).position, r = e.getBoundingClientRect(); if ((p === 'fixed' || p === 'sticky') && r.top <= 2 && r.height < H * 0.2) return true; if (i < 3 && e !== el && e.querySelector(':scope > nav') && r.top < H * 0.15 && r.height < H * 0.2) return true; } return false; })()) continue;
    if (cands.some((c) => c.el.contains(el) || el.contains(c.el))) continue;
    const inUi = !!el.closest('[data-ui]');
    if (inUi && !el.matches('button, [role=button], input, select, textarea, a')) { const k = drawn(el); if (k) cands.push({ el, what: 'drawn ' + k }); continue; }
    if (el.matches('input, textarea, select')) cands.push({ el, what: 'field' }); else cands.push({ el, what: el.matches('a') ? 'link' : 'button' });
  }
  // what the page shows: its words, the classes and states of its elements, open dialogs and menus (a pressed state on
  // the control itself counts; its hover and focus do not)
  const snap = () => { let s = (document.body.innerText || '').slice(0, 60000) + '|' + [...document.querySelectorAll('video, audio')].map((m) => (m.paused ? 'p' : 'r')).join('') + '|'; let k = 0; for (const e of document.body.querySelectorAll('*')) { if (++k > 5000) break; s += (typeof e.className === 'string' ? e.className : '') + (e.getAttribute('aria-pressed') || '') + (e.getAttribute('aria-expanded') || '') + (e.getAttribute('aria-selected') || '') + (e.getAttribute('aria-checked') || '') + (e.hidden ? 'h' : '') + ','; } return s + '|' + document.querySelectorAll('dialog[open]').length; };
  const out = []; let unsure = 0;
  for (const c of cands) {
    // (a control an earlier click took off the page, a list drawn again, is not there to judge)
    if (!c.el.isConnected || !shows(c.el)) continue;
    // a page that changes by itself in the same time (a ticker, a replay, a typing line) cannot be judged: left out
    const s1 = snap(); await wait(350); const s2 = snap();
    if (s1 !== s2) { unsure++; continue; }
    const attrs = () => [c.el, ...c.el.querySelectorAll('*')].map((e) => [...e.attributes].filter((a) => a.name !== 'style').map((a) => a.name + '=' + a.value).join(' ')).join('|');
    const before = { href: location.href, y: Math.round(scrollY), pressed: c.el.getAttribute('aria-pressed') + '|' + c.el.getAttribute('aria-expanded'), attrs: attrs() };
    let answered = false; const onSubmit = (e) => { answered = true; e.preventDefault(); }, onInvalid = () => { answered = true; };
    document.addEventListener('submit', onSubmit, true); document.addEventListener('invalid', onInvalid, true);
    try { c.el.focus({ preventScroll: true }); } catch {}
    try { c.el.click(); } catch {}
    await wait(450);
    const typed = c.el.matches('input, textarea, select') && document.activeElement === c.el && !c.el.readOnly;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch {}
    await wait(60);
    const changed = snap() !== s2;
    const moved = (location.href !== before.href && !/#$/.test(location.href)) || Math.abs(Math.round(scrollY) - before.y) > 4;
    document.removeEventListener('submit', onSubmit, true); document.removeEventListener('invalid', onInvalid, true);
    const toggled = answered || (c.el.getAttribute('aria-pressed') + '|' + c.el.getAttribute('aria-expanded')) !== before.pressed || attrs() !== before.attrs;
    if (!changed && !typed && !moved && !toggled) out.push({ what: c.what, text: label(c.el) });
    if (location.href !== before.href && /#/.test(location.href)) { try { history.replaceState(null, '', before.href); } catch {} }
    if (Math.abs(Math.round(scrollY) - before.y) > 4) { try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch {} await wait(250); }
  }
  return { tested: cands.length, unsure, dead: out };
}
