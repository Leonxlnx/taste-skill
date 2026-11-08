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
                             phone; from 640 to 1279 a section may grow, but never past two screens). A live
                             photo-chapters section (.is-live) is a whole number of screens, up to four.
    sparse                   a section's content fills under 50% of it (the aim is 55%); a dealt statement
                             moment's own section (.statement holding a data-moment, or any section holding word-highlight) is type by design.
    neighbour                with a section framed as the judge frames it (its top at the top of the
                             screen, and again one screen down when it is two screens tall), ink of
                             another section shows.
    neighbour-ground         ... or another section's own ground (a colour band) shows.
    hero-fold                the hero does not fill the first screen, runs past it (taller than one
                             screen), or the next section shows on it.
  Elements inside a visual (cards, frames, panels, stages, UI fragments, a collage) are not page edges.
  data-edge-free on an element skips it; data-screen="free" on a section skips the screen rules.

  window.lyFinish({ reveal, wide }) (async: it scrolls) - the finish checks, the faults the 2.5.2 test builds
  shipped. Each finding: { rule, where, detail, fix, sev } (sev 'WARN' never blocks; no sev is a FAIL).
    empty-band       the empty strip under a section's lowest content (text, picture, control, a box with its own
                     ground) is over 25% of the section's height (FAIL), over 15% (WARN). A section that holds a
                     pinned moment or a scene is left out: it holds its screens on purpose.
    blank-screen     one screen of a section (its first, or its second when it is two screens tall) shows
                     nothing, after the check scrolled to it and waited for what reveals there.
    placeholder      a [data-placeholder] element, or an .example address or domain printed in the page's words.
    moment-target    a [data-moment] root that lacks what its moment needs (picture-develops: one <img> as its
                     direct child), so the moment does nothing or hides what it holds.
    moment-hidden    a dealt moment that shows nothing once it is scrolled into view.
    moment-idle      (WARN) a moment whose root the page left exactly as written after it came into view.
    motion-visible   at 1280 and wider: no dealt moment, scene or effect starts within the first three screens.
    reveal-none      the kit reveals sections (reveal: true) and this page has no revealed section.
    subject-repeat   (WARN) different photographs with one data-subject in two sections or more (the same file
                     twice is the checker's photo-repeat, which the gate holds as a FAIL).
    number-repeat    (WARN) one UI number ("2,412 ms", "$48") printed in three sections or more.
    heading-repeat   (WARN) two headings with the same words, or one holding the whole of the other.
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
    // a live photo-chapters section is (hold + 1) screens by design, three or four (moments.md): whole screens, up to four
    const chapters = s.matches('[data-moment="photo-chapters"].is-live') || !!s.querySelector('[data-moment="photo-chapters"].is-live');
    // a dealt statement moment's own section (one statement alone in its screen, sections.md) is type on its ground by
    // design, as the checker reads it: never sparse
    const stmt = (s.matches('.statement, [class*="section--statement"], [data-statement]') && (s.matches('[data-moment]') || !!s.querySelector('[data-moment]')))
      || s.matches('[data-moment="word-highlight"]') || !!s.querySelector('[data-moment="word-highlight"]');
    return { el: s, r, ink, cTop, cBot, bg: bgOf(s), free: s.matches('[data-screen="free"]'), most: chapters ? 4 : 2, stmt };
  });
  const pageBg = getComputedStyle(document.body).backgroundColor;
  const footer = document.querySelector('body > footer, footer.footer');
  info.forEach((s, i) => {
    const h = s.r.bottom - s.r.top;
    if (!s.free && h < screen - tol) add('screen-short', name(s.el), `${Math.round(h)}px tall; one screen under the nav is ${Math.round(screen)}px`);
    // a phone section is at least its screens and grows with what it holds (system.css): taller than a screen and
    // filled by its content (0.7 of it or more, the rest is its padding) it is not off its count; one that grows
    // past two screens still is (--hm: 2 and two groups, or less content)
    const grown = vw < 640 && h > screen + tol && h <= 2 * screen + tol && (s.cBot - s.cTop) / h >= 0.7;
    // a live photo-chapters section is sized in whole viewports by its own CSS, whatever the nav, so it is counted in
    // viewports too (under a sticky nav a screen is the viewport less the nav)
    const u = s.most > 2 ? vh : screen;
    const exact = (vw >= 1280 || vw < 640) && !grown, off = Math.min(...Array.from({ length: s.most }, (_, k) => Math.abs(h - (k + 1) * u)));
    if (!s.free && i > 0 && ((exact && off > tol) || h > s.most * u + tol)) add('screen-height', name(s.el), `${Math.round(h)}px, ${(h / u).toFixed(2)} screens; ${s.most > 2 ? 'a live photo-chapters section is a whole number of screens, four at most' : `a section is exactly one or two (--h)${vw < 640 ? ', or on a phone at least one that its content fills' : ''}`}`);
    if (!s.free && !s.stmt && i > 0 && s.ink.length && (s.cBot - s.cTop) / h < 0.5) add('sparse', name(s.el), `its content fills ${Math.round(100 * (s.cBot - s.cTop) / h)}% of its screen; merge it or give it its visual (0.55 is the aim)`);
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

window.lyFinish = async function lyFinish(opts = {}) {
  const vw = document.documentElement.clientWidth, vh = innerHeight, sy0 = scrollY;
  const out = [], add = (rule, where, detail, fix, sev) => out.push(sev ? { rule, where, detail, fix, sev } : { rule, where, detail, fix });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const go = async (y, ms) => { scrollTo(0, Math.max(0, y)); await wait(ms); };
  const pct = x => Math.round(100 * x) + '%';
  const secs = [...document.querySelectorAll('main > section, main > div.section')].filter(s => { const c = getComputedStyle(s); return c.display !== 'none' && s.getBoundingClientRect().height > 40; });
  const secName = s => {
    if (!s) return 'page';
    if (s.id) return 'section#' + s.id;
    const cls = typeof s.className === 'string' && s.className.trim() ? '.' + s.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return `section${cls} (section ${secs.indexOf(s) + 1})`;
  };
  const secOf = el => el.closest('main > section, main > div.section');
  const opaque = el => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) < 0.05) return false; return true; };
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const INK = 'h1, h2, h3, h4, h5, h6, p, li, dt, dd, blockquote, figcaption, img, video, canvas, svg, iframe, button, input, select, textarea, .btn, .card, .frame, .panel, .tile, table, hr, [role="img"]';
  const filled = c => c.backgroundImage !== 'none' || !/rgba\([^)]*,\s*0\)$|transparent/.test(c.backgroundColor);
  // the boxes that show in a section, clipped by every frame above them and by the section itself; seen: only what is
  // not faded out (opacity) at this moment, else what takes its place (a piece waiting for its reveal still counts)
  const inkOf = (sec, seen) => {
    const sr = sec.getBoundingClientRect(), sa = sr.width * sr.height, list = [];
    for (const e of sec.querySelectorAll('*')) {
      if (e.closest('script, style, template, noscript')) continue;   // data-edge-free frees edges, its content still counts
      const c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden') continue;
      const r0 = e.getBoundingClientRect(); if (r0.width < 2 || r0.height < 2) continue;
      if (!(e.matches(INK) || ownText(e) || (filled(c) && r0.width * r0.height < 0.9 * sa))) continue;
      let t = r0.top, b = r0.bottom, l = r0.left, rr = r0.right;
      for (let p = e.parentElement; p && p !== sec.parentElement; p = p.parentElement) {
        const o = getComputedStyle(p); if (o.overflow === 'visible' && o.overflowX === 'visible' && o.overflowY === 'visible' && p !== sec) continue;
        const q = p.getBoundingClientRect(); t = Math.max(t, q.top); b = Math.min(b, q.bottom); l = Math.max(l, q.left); rr = Math.min(rr, q.right);
      }
      t = Math.max(t, sr.top); b = Math.min(b, sr.bottom);
      if (b - t < 2 || rr - l < 2 || rr <= 0 || l >= vw) continue;
      if (seen && !opaque(e)) continue;
      list.push({ e, top: t + scrollY, bottom: b + scrollY });
    }
    return list;
  };
  // a section that holds its screens on purpose: a scene, or a moment that pins (sticky) while it plays
  const PINNED = new Set(['photo-chapters', 'pinned-chapters', 'closing-lift', 'giant-type-pass', 'iris-opens', 'line-carries-colour']);
  const pins = s => !!(s.matches('[data-big-scene], [data-scene]') || s.querySelector('[data-big-scene], [data-scene]')
    || [s, ...s.querySelectorAll('[data-moment]')].some(m => m.matches('[data-moment]') && (PINNED.has(m.dataset.moment) || getComputedStyle(m).position === 'sticky' || !!m.querySelector('.is-pinned, [data-pin]'))));
  const ground = s => getComputedStyle(s).backgroundImage !== 'none';

  /* empty-band and blank-screen, section by section */
  for (const s of secs) {
    const r = s.getBoundingClientRect(), top = r.top + scrollY, h = r.height, bot = top + h;
    if (ground(s)) continue;   // a photograph or a drawn ground fills the section
    const ink = inkOf(s, false), pinned = pins(s);
    // the hero is judged by its own fold and fill checks (hero-fill, hero-fold): its air is designed per form
    if (ink.length && !pinned && !s.matches('.hero')) {
      // the empty strips: under the lowest content, and between two pieces of it (a split that space-between pulled
      // apart: a 550px hole between the h2 and the cards on a phone); the strip above the first piece is the
      // section's top padding under the header, never counted
      const iv = ink.map(i => [Math.max(top, i.top), Math.min(bot, i.bottom)]).sort((x, y) => x[0] - y[0]);
      let end = iv[0][1], gap = { px: 0 };
      for (const [a, z] of iv.slice(1)) { if (a - end > gap.px) gap = { px: a - end, from: end, to: a }; end = Math.max(end, z); }
      const band = bot - end, f = Math.max(band, gap.px) / h, inner = gap.px > band;
      if (f > 0.15) add('empty-band', secName(s), inner
        ? `a strip of ${Math.round(gap.px)}px (${pct(f)} of its ${Math.round(h)}px) between two pieces of its content is empty (y ${Math.round(gap.from - top)} to ${Math.round(gap.to - top)} in the section)`
        : `the last ${Math.round(band)}px (${pct(f)} of its ${Math.round(h)}px) under its lowest content are empty`,
      inner ? 'close the hole: keep the heading and what follows together (no justify-content: space-between across a tall section), or make the section a screen shorter (--h / --hm)'
        : 'fill the section: let the picture or the card grow to the foot of the longer column (align-self: stretch), add the visual it lacks, or make the section a screen shorter (--h) and merge it with its neighbour', f > 0.25 ? undefined : 'WARN');
    }
    // its screens, one by one (a short last piece under 40% of a screen is padding). A pinned moment or a scene moves
    // its content with the scroll, so its screens are read only on screen
    const n = Math.max(1, Math.floor(h / vh + 0.6));
    for (let k = 0; k < n && k < 4; k++) {
      const a = top + k * vh, z = Math.min(bot, a + vh), need = Math.min(40, (z - a) * 0.08), nth = ['first', 'second', 'third', 'fourth'][k];
      const over = list => list.filter(i => Math.min(i.bottom, z) - Math.max(i.top, a) >= need);
      if (!pinned && !over(ink).length) { add('blank-screen', secName(s), `its ${nth} screen (y ${Math.round(a)} to ${Math.round(z)}) holds nothing at all`, 'put the section\'s content back in that screen (a moment on the wrong element can hide it: see moment-target), or make the section one screen shorter'); continue; }
      if (!pinned && over(inkOf(s, true)).length) continue;
      await go(a, 900);   // what reveals there gets its time, then it is read again
      const seen = inkOf(s, true).filter(i => i.bottom > scrollY + 2 && i.top < scrollY + vh - 2);
      if (!(pinned ? seen : over(seen)).length) add('blank-screen', secName(s), `its ${nth} screen (y ${Math.round(a)} to ${Math.round(z)}) shows nothing after 0.9 s on screen`, 'make what is in that screen show: a reveal or a moment that never ends hides it, or a moment sits on the wrong element (moment-target); data-still on the section keeps it standing');
    }
  }

  /* placeholders */
  for (const e of document.querySelectorAll('[data-placeholder]')) add('placeholder', `${secName(secOf(e))} ${e.tagName.toLowerCase()}[data-placeholder]`, 'a stand-in marked data-placeholder is on the page; every visitor sees its dashed outline', 'replace it with the real thing (the brief\'s address, the photograph), or take the element out; never ship data-placeholder');
  {
    const EX = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.example\b|\b[\w-]+\.example(?:\.\w+)?\b|\bexample\.(?:com|org|net)\b/i;
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seen = new Set();
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      const m = t.textContent.match(EX), p = t.parentElement;
      if (!m || !p || p.closest('script, style, template, noscript, code, pre') || seen.has(m[0])) continue;
      const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || p.getBoundingClientRect().width < 2) continue;
      seen.add(m[0]);
      add('placeholder', `${secName(secOf(p)) === 'page' ? (p.closest('footer') ? 'footer' : 'page') : secName(secOf(p))} "${m[0]}"`, `a stand-in address is printed on the page ("${m[0]}"): no visitor can use it`, 'never print the address: a button that names the action ("Email an order") whose mailto: is on .example, which the report lists (copy.md)');
    }
  }

  /* the moments: what each needs on its root, and that each shows once it is on screen */
  const NEEDS = {
    'picture-develops': [el => !!el.querySelector(':scope > img') && el.querySelectorAll('img').length === 1, 'one <img> as its direct child, and no other picture', '<figure data-moment="picture-develops"><img src=... alt=...></figure> on the one photograph; three pictures want no moment, or each its own figure'],
    'window-parallax': [el => el.querySelectorAll('img').length === 1, 'exactly one <img>', '<figure data-moment="window-parallax"><img ...></figure> on one photograph'],
    'liquid-hover': [el => el.querySelectorAll('img').length === 1, 'exactly one <img>', '<figure data-moment="liquid-hover"><img ...></figure> on one photograph'],
    'photo-chapters': [el => !!el.querySelector('.mo-ph__list') && [...el.querySelectorAll('.mo-ph__ch')].length >= 2 && [...el.querySelectorAll('.mo-ph__ch')].every(c => c.querySelector('.mo-ph__pic')), '.mo-ph__list with two or more .mo-ph__ch, each holding a .mo-ph__pic', 'copy the markup of assets/moments/photo-chapters/demo.html'],
    'pinned-chapters': [el => !!el.querySelector('.mo-pc__visuals') && [...el.querySelectorAll('.mo-pc__step')].length >= 2 && [...el.querySelectorAll('.mo-pc__step')].every(st => st.querySelector('.mo-pc__visual')), '.mo-pc__visuals and two or more .mo-pc__step, each holding a .mo-pc__visual', 'copy the markup of assets/moments/pinned-chapters/demo.html'],
    'closing-lift': [el => ['.mo-cl__sheet', '.mo-cl__under', '.mo-cl__img', '.mo-cl__band'].every(q => el.querySelector(q)), '.mo-cl__sheet, .mo-cl__under, .mo-cl__img and .mo-cl__band', 'copy the markup of assets/moments/closing-lift/demo.html'],
    'counter-rolls': [el => el.matches('[data-count], .t-stat') || !!el.querySelector('[data-count], .t-stat'), 'a number marked data-count or .t-stat', 'mark each figure: <strong class="t-stat" data-count>48</strong>'],
    'marquee-row': [el => { const t = el.querySelector('.mo-mq__track') || el.firstElementChild; return !!t && t.children.length >= 2; }, 'a .mo-mq__track with two or more items', 'copy the markup of assets/moments/marquee-row/demo.html'],
    'word-highlight': [el => el.matches('p, h2, h3, blockquote') || !!el.querySelector('.mo-wh__text, p, h2, h3, blockquote'), 'a paragraph, h2, h3 or blockquote of words', 'put it on the statement section that holds the words'],
  };
  for (const id of ['headline-arrives', 'lines-rise', 'letters-assemble', 'giant-type-pass', 'liquid-type']) NEEDS[id] = [el => el.matches('h1, h2') || !!el.querySelector('h1, h2'), 'an h1 or h2', 'put it on the section (or heading) whose h1 or h2 it moves'];
  const moms = [...document.querySelectorAll('[data-moment]')].filter(el => !el.parentElement?.closest('[data-moment]'));
  let srcDoc = null;
  try { srcDoc = new DOMParser().parseFromString(await (await fetch(location.href, { cache: 'force-cache' })).text(), 'text/html'); } catch { /* a dev server that will not serve it twice */ }
  const srcMoms = srcDoc ? [...srcDoc.querySelectorAll('[data-moment]')].filter(el => !el.parentElement?.closest('[data-moment]')) : [];
  const shape = el => { const c = el.cloneNode(true); for (const x of [c, ...c.querySelectorAll('*')]) { for (const a of ['data-moment-mounted', 'data-moment-still', 'data-moment-failed']) x.removeAttribute(a); } return c.outerHTML.replace(/\s+/g, ' '); };
  for (const [k, el] of moms.entries()) {
    const id = el.dataset.moment, where = `${secName(secOf(el) || el)} [data-moment="${id}"]`;
    // read as written (a mounted moment rebuilds its root: photo-chapters moves its list into a stage)
    const need = NEEDS[id], as = srcMoms[k] && srcMoms[k].dataset.moment === id ? srcMoms[k] : el;
    if (need && !need[0](as)) { add('moment-target', where, `${id} needs ${need[1]}; this ${as.tagName.toLowerCase()} holds ${as.querySelectorAll('img').length} img in ${as.children.length} children`, need[2]); continue; }
    const r = el.getBoundingClientRect(), top = r.top + scrollY;
    await go(top - Math.max(0, (vh - Math.min(r.height, vh)) / 2), 1300);
    const vis = getComputedStyle(el).visibility !== 'hidden' && opaque(el) && r.width > 2 && r.height > 2;
    const now = inkOf(el, true).filter(i => i.bottom > scrollY && i.top < scrollY + vh);
    if (!vis || (!now.length && !el.matches(INK) && !ownText(el))) add('moment-hidden', where, `${id} shows nothing once it is on screen (1.3 s after it came in)`, `give it what assets/moments/${id}/demo.html gives it, or take data-moment off and deal another`);
    else if (vw >= 1024 && !el.dataset.momentStill && !el.dataset.momentFailed && srcMoms[k] && srcMoms[k].dataset.moment === id && shape(el) === shape(srcMoms[k]))
      add('moment-idle', where, `${id} left its root exactly as written once it was on screen: it found nothing to move`, `compare the markup with assets/moments/${id}/demo.html`, 'WARN');
  }

  /* motion in the first three screens, and the section reveals */
  if (vw >= 1280) {
    const MOVE = '[data-moment]:not([data-moment-failed]), [data-big-scene], [data-scene], [data-effect], [data-fx]';
    const early = [...document.querySelectorAll(MOVE)].filter(e => { const r = e.getBoundingClientRect(); return r.height > 2 && r.top + scrollY < 3 * vh; });
    // a page with no moment, scene or effect at all is moment-none's (the checker's, held as a FAIL by the gate); the
    // hero demos are heroes only. Here: the page has its motion, but all of it past the third screen
    const later = early.length ? [] : [...document.querySelectorAll(MOVE)].map(e => `${e.dataset.moment || e.dataset.bigScene || e.dataset.scene || e.dataset.effect || e.dataset.fx || '?'} at screen ${Math.floor((e.getBoundingClientRect().top + scrollY) / vh) + 1}`);
    if (later.length) add('motion-visible', 'page', `after the hero's entrance nothing moves in the first three screens (the page's motion: ${later.join(', ')})`, 'move the first dealt moment (start.mjs plan names it) into the second or third section, on the element its demo.html names');
  }
  if (opts.reveal && secs.length > 2) {
    const R = '[data-reveal], [data-revealed], [data-m-reveal], .m-reveal, .is-revealed';
    if (!document.querySelector(R) && !secs.every(s => s.matches('[data-still]'))) add('reveal-none', 'page', 'no section reveals: the kit reveals each section\'s h2 and its lead photograph once as it comes in, and this page has none', 'load assets/motion/motion.js as the starter does (<script type="module" src="assets/motion/motion.js"></script>) and keep data-still for the few sections that must stand');
  }

  /* repeats: one subject twice, one UI number in three sections, one heading twice */
  {
    const stem = u => String(u || '').split(/[?#]/)[0].split('/').pop().replace(/[-_@](\d{2,4}w?|\d+x\d+|\dx)(?=\.\w+$)/i, '').replace(/\.\w+$/, '');
    const by = new Map();
    for (const i of document.images) {
      const sub = (i.getAttribute('data-subject') || '').trim().toLowerCase(); if (!sub || /^(product|stand-in|detail|client|photo|picture|image|illustration|person|people)$/.test(sub)) continue;
      const r = i.getBoundingClientRect(); if (r.width < 120 || r.height < 80) continue;
      if (!by.has(sub)) by.set(sub, new Map());
      const m = by.get(sub), f = stem(i.currentSrc || i.getAttribute('src')); if (!m.has(f)) m.set(f, i);
    }
    // data-subject is often a broad word ("bar", "part"): two pictures of it may be two views, so this only WARNs
    for (const [sub, m] of by) if (m.size > 1 && new Set([...m.values()].map(secOf)).size > 1) add('subject-repeat', `data-subject "${sub}"`, `${m.size} different photographs show "${sub}" in ${new Set([...m.values()].map(secOf)).size} sections (${[...new Set([...m.values()].map(i => secName(secOf(i))))].join(', ')})`, 'one photograph per subject a page: when two show the same thing (the oven twice), give the second section a picture of what it says', 'WARN');
    const NUM = /(?:[$€£¥]\s?\d[\d.,]*|\b\d{1,3}(?:[,.]\d{3})+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s?(?:ms|µs|s|min|h|%|kb|mb|gb|tb|k|m|x|fps|rpm|kg|g|km|mm|cm)\b|\b\d{3,}\b)/gi;
    const nums = new Map();
    for (const s of secs) {
      const set = new Set((s.innerText || '').match(NUM) || []);
      for (const n of set) { const k = n.replace(/\s+/g, ' ').toLowerCase(); if (/^(19|20)\d\d$/.test(k)) continue; if (!nums.has(k)) nums.set(k, new Set()); nums.get(k).add(s); }
    }
    // one finding per set of sections: five figures of one mock shown three times are one repeat
    const groups = new Map();
    for (const [n, set] of nums) if (set.size >= 3) { const key = [...set].map(s => secs.indexOf(s)).join(','); if (!groups.has(key)) groups.set(key, { set, list: [] }); groups.get(key).list.push(n); }
    for (const { set, list } of groups.values()) add('number-repeat', list.slice(0, 3).map(n => `"${n}"`).join(', ') + (list.length > 3 ? ` +${list.length - 3}` : ''), `${list.length > 1 ? 'these figures are' : 'this figure is'} printed in ${set.size} sections (${[...set].map(secName).slice(0, 4).join(', ')})`, 'each section shows its own state or view: change the figures in the repeats, or let one section carry them', 'WARN');
    const norm = t => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    const hs = [...document.querySelectorAll('main :is(h1, h2, h3)')].filter(h => h.getBoundingClientRect().width > 2 && !h.closest('[aria-hidden="true"], .card, .tile, li')).map(h => ({ h, t: norm(h.innerText || h.textContent) })).filter(x => x.t.split(' ').length >= 2);
    for (let a = 0; a < hs.length; a++) for (let b = a + 1; b < hs.length; b++) {
      const A = hs[a].t, B = hs[b].t, short = A.length <= B.length ? A : B, long = short === A ? B : A;
      if (A === B || (short.split(' ').length >= 3 && (' ' + long + ' ').includes(' ' + short + ' '))) add('heading-repeat', `${secName(secOf(hs[b].h))} ${hs[b].h.tagName.toLowerCase()}`, `"${hs[b].t.slice(0, 50)}" repeats the ${hs[a].h.tagName.toLowerCase()} "${hs[a].t.slice(0, 50)}"`, 'say the next thing in the second heading, not the first one again (references/copy.md)', 'WARN');
    }
  }
  scrollTo(0, sy0);
  return out;
};
