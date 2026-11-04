/*
  taste-skill layout-check.js - the layout v4 checks, run in the page (references/layout-v4.md, sections 1c and 2).
  A plain script with no imports, so a checker can evaluate its source in any page:
      const src = fs.readFileSync('<skill>/assets/layout/layout-check.js', 'utf8');
      await page.evaluate(src + '; window.lyCheck()')      // -> { vw, vh, L, R, nav, sections, findings }
  assets/layout/check.mjs runs it in one headless Chrome at 1440x900 and 390x844.

  Rules checked (each finding: { rule, where, detail }):
    edge-left / edge-right   a block of the page (text column, frame, card, grid, button row, the nav's
                             logo and actions, the footer) starts or ends off the page's lines: L, R
                             and the 12 column lines between them. A centred block is centred on the page
                             axis; a full-bleed one runs edge to edge.
    bleed-one-side           a block runs out to one viewport edge only (house rule: left and right edges
                             always the same): it stands on the lines or runs edge to edge.
    lines                    section-level text starts on more than two left lines (L and one split line).
    spill                    a block runs past L or R without reaching the viewport edge.
    one-sided                a section's visuals stop short of R (or of L) while the text holds the other
                             line, and the composition is not centred.
    screen-short             a section is shorter than one screen (the fixed header lies over its top).
    screen-height            a section is not exactly one or two screens tall (at 1280 and wider, and on a
                             phone; from 640 to 1279 a section may grow, but never past two screens).
    sparse                   a section's content fills under 50% of it (the aim is 55%).
    neighbour                with a section framed as the judge frames it (its top at the top of the
                             screen, and again one screen down when it is two screens tall), ink of
                             another section shows.
    neighbour-ground         ... or another section's own ground (a colour band) shows.
    hero-fold                the hero does not fill the first screen, runs past it (taller than one
                             screen), or the next section shows on it.
  Elements inside a visual (cards, frames, panels, stages, UI fragments, a collage) are not page edges.
  data-edge-free on an element skips it; data-screen="free" on a section skips the screen rules.
*/
window.lyCheck = function lyCheck(opts = {}) {
  const tol = opts.tol ?? 1.5;
  const vw = document.documentElement.clientWidth, vh = innerHeight, sy = scrollY;
  const out = [], add = (rule, where, detail) => out.push({ rule, where, detail });
  const R1 = n => Math.round(n * 10) / 10;
  const name = el => {
    if (!el) return '?';
    const sec = el.closest('main > *, header, footer');
    const sid = sec ? (sec.id ? '#' + sec.id : sec.tagName.toLowerCase() + (sec.className ? '.' + String(sec.className).trim().split(/\s+/).slice(0, 2).join('.') : '')) : '';
    const own = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    return `${sid} ${own}${txt ? ` "${txt}"` : ''}`.trim();
  };
  const shown = el => {
    const c = getComputedStyle(el);
    if (c.display === 'none' || c.visibility === 'hidden') return false;
    for (let e = el; e && e !== document.body; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) === 0 || e.hasAttribute('inert')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };

  /* the lines */
  const box = document.querySelector('main :is(.wrap, .container)') || document.querySelector('.wrap, .container');
  if (!box) return { vw, vh, findings: [{ rule: 'container', where: 'page', detail: 'no .wrap' }] };
  const bc = getComputedStyle(box), br = box.getBoundingClientRect();
  const L = br.left + parseFloat(bc.paddingLeft), R = br.right - parseFloat(bc.paddingRight);
  const gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24;
  const cols = 12;   // system.css's .grid has 12 columns at every width (a phone spans them all, a footer column six)
  const col = (R - L - (cols - 1) * gut) / cols;
  const starts = [], ends = [];
  for (let k = 0; k < cols; k++) { starts.push(L + k * (col + gut)); ends.push(L + k * (col + gut) + col); }
  const onStart = x => starts.some(s => Math.abs(x - s) <= tol);
  const onEnd = x => ends.some(e => Math.abs(x - e) <= tol);
  const centred = r => Math.abs((r.left + r.right) / 2 - vw / 2) <= tol + 0.5;

  /* the blocks: page-level elements, never what sits inside a visual */
  const INSIDE = 'ul, ol, dl, [role="img"], [aria-hidden="true"], .card, .tile, .ui, [data-ui], [data-ui-load], .stage, .nav__menu, .menu-card, .frame, .panel, figure, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-collage, .btn-row, svg, [data-edge-free], table, .photo-band__text .btn-row, details';
  const SEL = 'main section > :is(.wrap, .container) > *, main .hero-text > *, main .grid > *, main :is(h1, h2, h3, p, .btn-row, figure, .frame, .panel, .card, .tile, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-collage, .hero__facts, table, ul, ol, dl), footer :is(.wrap, .container) > *, footer .grid > *';
  const TEXT = /^(H1|H2|H3|H4|P|UL|OL|DL|BLOCKQUOTE)$/;
  const VISUAL = 'img, video, canvas, picture, iframe, table, .card, .frame, .panel, .tile, .grid, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-collage, .ly-piece';
  // words in a solid box (the photo hero's box, a photo band's box): the box stands on the line and its
  // words sit its padding in, so they are measured as the box, not as a page column
  const inBox = el => {
    for (let a = el.parentElement; a && !a.matches('main > *, body'); a = a.parentElement) {
      const cs = getComputedStyle(a), bg = cs.backgroundColor;
      if (parseFloat(cs.paddingLeft) > 0 && bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) return true;
    }
    return false;
  };
  const blocks = [...new Set(document.querySelectorAll(SEL))].filter(el => {
    if (el.matches('[data-edge-free], script, style, template')) return false;
    if (el.parentElement && el.parentElement.closest(INSIDE)) return false;
    if (inBox(el)) return false;
    const p = getComputedStyle(el).position;
    if (p === 'absolute' || p === 'fixed') return false;
    if (getComputedStyle(el).display.startsWith('inline') && !el.matches('.btn-row')) return false;
    return shown(el);
  });
  const bySection = new Map();
  for (const el of blocks) {
    const r = el.getBoundingClientRect();
    const full = r.left <= 0.5 && r.right >= vw - 0.5;
    const bleedR = !full && r.right >= vw - 0.5, bleedL = !full && r.left <= 0.5;
    // a text block (a heading, a paragraph, a list, a button row, or a wrapper holding only those) must start on a
    // line; only frames, cards, grids and pictures must also end on one
    const text = TEXT.test(el.tagName) || el.matches('.section-head, .hero__text, .btn-row, .hero__head > div') || ((el.textContent || '').trim().length > 0 && !el.querySelector(VISUAL));
    const cen = centred(r) && (getComputedStyle(el).textAlign === 'center' || el.parentElement && getComputedStyle(el.parentElement).textAlign === 'center' || getComputedStyle(el.parentElement || el).justifyItems === 'center' || Math.abs(r.width - (R - L)) > 2);
    const sec = el.closest('main > *');
    if (sec) { if (!bySection.has(sec)) bySection.set(sec, []); bySection.get(sec).push({ el, r, full, bleedR, bleedL, text, cen }); }
    if (full) continue;
    if (bleedR) { add('bleed-one-side', name(el), `runs from x ${R1(r.left)} out to the right viewport edge; the left side stays at ${R1(L)}`); continue; }
    if (bleedL) { add('bleed-one-side', name(el), `runs from the left viewport edge to x ${R1(r.right)}; the right side stays at ${R1(vw - R)} from the edge`); continue; }
    if (r.left < L - tol || r.right > R + tol) {
      if (!(cen && el.closest('[data-bleed], .bleed-r, .bleed-l'))) add('spill', name(el), `x ${R1(r.left)} to ${R1(r.right)}, the page runs ${R1(L)} to ${R1(R)}`);
      continue;
    }
    if (cen && !(Math.abs(r.left - L) <= tol)) continue;      // centred on the axis: fine both sides
    if (!onStart(r.left)) add('edge-left', name(el), `starts at x ${R1(r.left)}; the lines are ${R1(L)} and the column starts`);
    if (!text && !onEnd(r.right)) add('edge-right', name(el), `ends at x ${R1(r.right)}; the right line is ${R1(R)}`);
  }

  /* one-sided sections: visuals that stop short of the right line while text holds the left one */
  for (const [sec, list] of bySection) {
    const vis = list.filter(b => !b.text && !b.full && b.el.matches('figure, .frame, .panel, .card, .tile, .grid, .hero__media, .hero__art, .hero__stage, .ly-collage, .hero__window, .hero__facts, img, video, canvas, table'));
    if (!vis.length) continue;
    const uL = Math.min(...vis.map(b => b.r.left)), uR = Math.max(...vis.map(b => b.r.right));
    const all = list.filter(b => !b.full);
    const aL = Math.min(...all.map(b => b.r.left));
    const sym = Math.abs((uL - L) - (R - uR)) <= tol + 1;
    if (!sym && uR < R - tol && !vis.some(b => b.bleedR) && aL <= L + tol) add('one-sided', name(sec), `its visuals end at x ${R1(uR)}, short of the right line ${R1(R)}`);
  }

  /* left lines: every page heading and lead starts on L or on one split line (the same on every split) */
  const heads = [...document.querySelectorAll('main :is(h1, h2, .hero__lead, .section-head > p)')].filter(e => shown(e) && !e.closest(INSIDE.replace(', .btn-row', '')) || (e.matches('h1') && shown(e)));
  const lefts = [];
  for (const e of heads) {
    const r = e.getBoundingClientRect(), ta = getComputedStyle(e).textAlign;
    if (ta === 'center' || centred(r) && Math.abs(r.left - L) > tol) continue;
    if (e.closest('.hero__media, .hero__over') || inBox(e)) continue;   // words inside a picture (the film's frame) or a solid box are not a page line
    if (!lefts.some(x => Math.abs(x - r.left) <= 4)) lefts.push(r.left);
  }
  const extra = lefts.filter(x => Math.abs(x - L) > 4);
  if (extra.length > 1) add('lines', 'page', `headings and leads start on ${lefts.length} lines (x ${lefts.map(R1).join(', ')}); the page has ${R1(L)} and one split line`);

  /* nav and footer edges */
  const navEl = document.querySelector('header.nav, .nav');
  const logo = navEl && navEl.querySelector('.nav__logo');
  // nav-split puts the name on the page's centre line (sections-library.md); every other nav starts it on L
  const logoMid = logo && navEl.matches('.nav--split') && (r => Math.abs((r.left + r.right) / 2 - (L + R) / 2) <= tol + 0.5)(logo.getBoundingClientRect());
  if (logo && shown(logo) && !logoMid && Math.abs(logo.getBoundingClientRect().left - L) > tol) add('edge-left', 'nav logo', `at x ${R1(logo.getBoundingClientRect().left)}, the page's left line is ${R1(L)}${navEl.matches('.nav--split') ? ', or its centre on the centre line ' + R1((L + R) / 2) : ''}`);
  const acts = navEl && [...navEl.querySelectorAll('.nav__actions > *, .nav__toggle')].filter(shown);
  if (acts && acts.length) {
    const right = Math.max(...acts.map(a => a.getBoundingClientRect().right));
    if (Math.abs(right - R) > tol) add('edge-right', 'nav actions', `end at x ${R1(right)}, the page's right line is ${R1(R)}`);
  }

  /* screens */
  const navPos = navEl ? getComputedStyle(navEl).position : 'static';
  const navH = navEl && (navPos === 'sticky' || navPos === 'fixed') ? navEl.getBoundingClientRect().height : 0;
  // one screen is the whole viewport: the header is fixed over the top of every section (system.css)
  const screen = navPos === 'fixed' ? vh : Math.min(vh - navH, 1200);
  const secs = [...document.querySelectorAll('main > section, main > div.section')].filter(shown);
  // a picture's own frame (role=img, a figure) is content too, so a framed visual counts at its full size
  const INK = 'h1, h2, h3, h4, p, li, dt, dd, blockquote, img, video, canvas, svg, .btn, .card, .frame, .panel, .tile, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-piece, hr, .ly-rule, table, figure, [role="img"]';
  const doc = r => ({ top: r.top + sy, bottom: r.bottom + sy, left: r.left, right: r.right });
  // ink: every visual, and every element that holds text of its own (a <strong> or <span> in a stat counts)
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  // a piece cut by a frame (overflow hidden or clip) counts only where it shows
  const clipped = (e, stop) => {
    const r = e.getBoundingClientRect(); let t = r.top, b = r.bottom, l = r.left, rr = r.right;
    for (let p = e.parentElement; p && p !== stop.parentElement; p = p.parentElement) {
      const o = getComputedStyle(p); if (o.overflow === 'visible' && o.overflowX === 'visible' && o.overflowY === 'visible') continue;
      const q = p.getBoundingClientRect(); t = Math.max(t, q.top); b = Math.min(b, q.bottom); l = Math.max(l, q.left); rr = Math.min(rr, q.right);
    }
    return { top: t, bottom: b, left: l, right: rr };
  };
  const inkOf = sec => [...sec.querySelectorAll('*')].filter(e => (e.matches(INK) || ownText(e)) && shown(e) && !e.closest('[data-edge-free]')).map(e => doc(clipped(e, sec))).filter(r => r.bottom - r.top > 1 && r.right > 0 && r.left < vw && r.right - r.left > 1);
  const bgOf = el => { const c = getComputedStyle(el); return c.backgroundImage !== 'none' ? 'image' : (/rgba\(.*,\s*0\)$|transparent/.test(c.backgroundColor) ? null : c.backgroundColor); };
  const info = secs.map(s => {
    const r = doc(s.getBoundingClientRect());
    const ink = inkOf(s);
    const cTop = ink.length ? Math.min(...ink.map(i => i.top)) : r.top, cBot = ink.length ? Math.max(...ink.map(i => i.bottom)) : r.bottom;
    return { el: s, r, ink, cTop, cBot, bg: bgOf(s), free: s.matches('[data-screen="free"]') };
  });
  const pageBg = getComputedStyle(document.body).backgroundColor;
  const footer = document.querySelector('body > footer, footer.footer');
  info.forEach((s, i) => {
    const h = s.r.bottom - s.r.top;
    if (!s.free && h < screen - tol) add('screen-short', name(s.el), `${Math.round(h)}px tall; one screen under the nav is ${Math.round(screen)}px`);
    const exact = vw >= 1280 || vw < 640, off = Math.min(Math.abs(h - screen), Math.abs(h - 2 * screen));
    if (!s.free && i > 0 && ((exact && off > tol) || h > 2 * screen + tol)) add('screen-height', name(s.el), `${Math.round(h)}px, ${(h / screen).toFixed(2)} screens; a section is exactly one or two (--h)`);
    if (!s.free && i > 0 && s.ink.length && (s.cBot - s.cTop) / h < 0.5) add('sparse', name(s.el), `its content fills ${Math.round(100 * (s.cBot - s.cTop) / h)}% of its screen; merge it or give it its visual (0.55 is the aim)`);
    const ch = s.cBot - s.cTop;
    // frame the section as the judge does: its top at the top of the screen (the hero at scroll 0), and a
    // second frame one screen down when it is two screens tall; with a header that is not fixed, its top
    // under the nav
    const y0 = i === 0 ? 0 : (navPos === 'fixed' ? s.r.top : s.r.top - navH);
    s.frame = Math.max(0, Math.round(y0));
    const ys = [y0]; if (h > screen * 1.5 && i > 0) ys.push(y0 + screen);
    for (const y of ys) {
    const top = y + navH, bot = y + vh;
    info.forEach((o, j) => {
      if (j === i) return;
      const hit = o.ink.filter(k => k.bottom > top + 2 && k.top < bot - 2);
      if (hit.length) {
        const px = Math.max(...hit.map(k => Math.min(k.bottom, bot) - Math.max(k.top, top)));
        add('neighbour', name(s.el), `framed, ${Math.round(px)}px of ${name(o.el)} shows`);
      } else if (o.bg && o.bg !== s.bg && o.bg !== pageBg && o.r.bottom > top + 2 && o.r.top < bot - 2) {
        const px = Math.min(o.r.bottom, bot) - Math.max(o.r.top, top);
        add('neighbour-ground', name(s.el), `framed, ${Math.round(px)}px of ${name(o.el)}'s ground shows`);
      }
    });
    if (footer && !s.free) {
      const fr = doc(footer.getBoundingClientRect());
      if (fr.top < bot - 2 && fr.bottom > top) add('neighbour', name(s.el), `framed, ${Math.round(Math.min(fr.bottom, bot) - Math.max(fr.top, top))}px of the footer shows`);
    }
    }
  });
  if (info.length) {
    const hero = info[0];
    if (hero.r.top > navH + tol + (navPos === 'static' && navEl ? navEl.getBoundingClientRect().height : 0)) add('hero-fold', name(hero.el), `starts at y ${Math.round(hero.r.top)}, not under the nav`);
    if (hero.r.bottom < vh - tol) add('hero-fold', name(hero.el), `ends at y ${Math.round(hero.r.bottom)}, above the fold (${vh})`);
    // taller than one screen: a long h1 or lead pushed it past the fold (test heroes ran 1.2 to 1.38 screens)
    if (hero.r.bottom > vh + tol) add('hero-fold', name(hero.el), `ends at y ${Math.round(hero.r.bottom)}, past the fold (${vh}): ${((hero.r.bottom - hero.r.top) / screen).toFixed(2)} screens tall`);
    const next = info[1];
    if (next) {
      const hit = next.ink.filter(k => k.top < vh - 2);
      if (hit.length) add('hero-fold', name(next.el), `shows on the first screen from y ${Math.round(Math.min(...hit.map(k => k.top)))}`);
    }
  }
  /* the hero's numbers (heroes.json "at1440" / "at390"), measured, not read from the CSS */
  let hero = null;
  const hs = document.querySelector('main > section');
  if (hs) {
    const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height) }; };
    const h1 = hs.querySelector('h1'), lead = hs.querySelector('.hero__lead');
    // the lines of text: every text node's boxes, less the live word's waiting words (stacked under the slot)
    const lineCount = e => {
      if (!e) return 0;
      const fs = parseFloat(getComputedStyle(e).fontSize), tops = [];
      const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.textContent.trim() || n.parentElement.closest('.ly-word > .is-next, .ly-word > .is-out')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) { if (q.width < 2) continue; if (!tops.some(t => Math.abs(t - q.top) < fs * 0.5)) tops.push(q.top); }
      }
      return tops.length;
    };
    const btns = [...hs.querySelectorAll('.btn')].filter(shown);
    hero = {
      height: Math.round(hs.getBoundingClientRect().height),
      h1: h1 && { size: parseFloat(getComputedStyle(h1).fontSize), leading: R1(parseFloat(getComputedStyle(h1).lineHeight) / parseFloat(getComputedStyle(h1).fontSize) * 100) / 100, lines: lineCount(h1), ...box(h1) },
      lead: lead && { size: parseFloat(getComputedStyle(lead).fontSize), lineHeight: parseFloat(getComputedStyle(lead).lineHeight), lines: lineCount(lead), ...box(lead) },
      buttons: btns.length ? { n: btns.length, h: Math.round(btns[0].getBoundingClientRect().height), first: box(btns[0]) } : null,
      visual: box(hs.querySelector('.hero__media, .hero__art, .hero__stage, .ly-collage, .hero__window')),
    };
  }
  return {
    vw, vh, L: R1(L), R: R1(R), nav: Math.round(navH), screen: Math.round(screen), hero,
    sections: info.map(s => ({ where: name(s.el), top: Math.round(s.r.top), height: Math.round(s.r.bottom - s.r.top), content: Math.round(s.cBot - s.cTop), frame: s.frame })),
    findings: out,
  };
};
