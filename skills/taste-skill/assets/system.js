/*
  taste-skill system.js - the page behaviour every build shares. Load it once, at the end of <body>:
    <script type="module" src="assets/system.js"></script>
  Write no second script for any of this.

  - nav: hover menus are CSS; this adds the phone sheet, the accordion, Escape and aria-expanded, and
    closes the sheet after a tap on any link in it.
  - tabs: [role=tablist] with [role=tab][aria-controls] and [role=tabpanel]. aria-controls may name
    several ids (the tab's text and its screen in a frame); they are shown and hidden together.
  - text highlight: none. <p data-hl> (older markup) stays plain ink from the first frame; nothing
    changes colour on load (MO-62).
  - FAQ: every .faq answer is open (ST-47): a <details> in .faq is opened and stays open.
  - opening hours: <dl class="hours" data-tz="Europe/Berlin"> marks today's dt and dd .is-today in the
    venue's time zone (each dt names its days, "Mon to Fri", "Sat and Sun", "Daily", or carries
    data-days="mon-fri" / "sat,sun"). Without data-tz no row is marked: never the visitor's clock,
    and an .is-today written in the markup is taken out (it would be wrong six days a week). A
    [data-open-now] line reads "Open now, until 16:00" or "Closed, opens Tuesday at 7:30" from them.
  - moments: a page with [data-moment] loads assets/moments/moments.js (references/moments.md), which
    mounts the dealt moments once; data-ready waits for them.
  - peek: [data-peek] holds rows [data-peek-to="key"] and photographs [data-peek-for="key"] (all but
    the first hidden); the photograph changes at once (MO-07) to the row under the pointer, the
    keyboard focus or a tap. A place's or a service's one moment (references/sections.md).
  - visuals (assets/effects/fx.js and assets/ui/ui.js are loaded only when the page has any):
    * mounts every [data-fx] ground; only a ground inside the hero (.hero) moves, and not when its frame
      holds an object or a scene ([data-print], [data-scene], assets/objects). Every other one is
      drawn once when it nears the screen, kept as a plain picture and its WebGL context freed
      (ui.grounds), so a page holds at most
      3 live WebGL contexts (4 while an object moves on screen); a ground a fragment drives (the
      slider) stays live near the screen. The featured plan's lit border (data-glow="edge-glow",
      data-glow-params) rests on a quiet hairline and runs one light round its edge on hover or
      focus;
    * lights every ground that holds UI (a .panel, .panel__screen or .frame) and the closing band's
      (.frame--cta > .frame__fx) with the page's lit ground: <html data-ground="sand|sky|sage|painting">
      (system.css --ground-*), on light and dark pages alike; without data-ground the page palette
      picks one. data-fx-palette on the element wins; --hue on it changes only its accent;
    * starts every pasted [data-ui] fragment (assets/ui/<name>/fragment.html, its names, numbers and
      logos rewritten to the client's) and loads every [data-ui-load] one (the kit's sample text: a
      draft only, never shipped). Each holds its
      finished picture (system.js marks it data-ui-still, so ui.js holds it the moment its own load
      resolves) unless it, or an element around it, carries data-ui-loop (one per card group) or
      data-ui-cycles. On a phone (under 640px), on kind other (<meta name="site-kind"
      content="other">) and on a place nothing loops, voice included, and the hero's ground is drawn
      once: every fragment holds its finished picture and plays only while the pointer is on its card;
    * pause buttons: ui.js puts one on every loop when it starts to move (a 32px disc 12px in from
      the bottom-right corner of its panel or frame); system.js gives the hero's moving ground the
      same button, shared with a loop in that frame. A box that already holds a .loop-pause (a loop
      the page runs itself) gets none;
    * sets <html data-ready="1"> when all of it is drawn (shoot.mjs and consistency.mjs wait for it).
  - page tone: <html data-tone="dark|light"> from the palette's base (a dark footer stays dark).
  - pictures: lazy images are fetched once the page has loaded, so no photograph shows as an empty
    frame; one that fails to load is outlined in red and counted (<html data-broken>).
  - guards: a [bracketed placeholder], a "(sample)" tag, a line that explains or apologises ("Names
    and figures on this page are examples") or a printed .example address gets a red dashed outline
    and <html data-placeholders="n">; an effect id in more than two sections sets <html data-fx-repeat>.
*/
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HERE = new URL('./', import.meta.url);
/* kind other (a cafe, a shop, a studio, a service firm) and a place: nothing moves by itself (MO-07) */
const kindOther = () => {
  const m = document.querySelector('meta[name="site-kind"]');
  return document.documentElement.dataset.type === 'place' || (!!m && m.content.trim().toLowerCase() === 'other');
};

function nav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const toggle = nav.querySelector('.nav__toggle');
  const bars = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const cross = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-locked', open);
    if (toggle) { toggle.setAttribute('aria-expanded', String(open)); toggle.innerHTML = open ? cross : bars; }
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__item').forEach(item => {
    if (!item.querySelector('.nav__menu')) return;
    let btn = item.querySelector('.nav__expand');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'nav__expand';
      btn.type = 'button';
      btn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      item.querySelector('.nav__link').after(btn);
    }
    const label = item.querySelector('.nav__link')?.textContent.trim() || 'section';
    btn.setAttribute('aria-label', `Show ${label} links`);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-expanded');
      item.classList.toggle('is-expanded', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('is-open')) { setOpen(false); toggle?.focus(); return; }
    if (nav.contains(document.activeElement)) document.activeElement.blur();
  });
  // a tap on any link in the open sheet closes it (a top-level word, a menu link, an action, an
  // in-page #anchor alike), so the page it leads to is never left under the sheet
  nav.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && e.target.closest?.('a[href]')) setOpen(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
}

function tabs() {
  const parts = t => (t.getAttribute('aria-controls') || '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)).filter(Boolean);
  document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    let first = true;
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        parts(t).forEach(el => {
          const was = el.hidden;
          el.hidden = !on;
          // a panel or a screen in a frame fades in on a chosen tab only (opacity only, nothing moves;
          // the panel shown at load is there on the first frame, MO-62)
          if (on && was && !first && !reduced()) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
        });
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
    first = false;
  });
}

/* every FAQ answer open, for good: a <details> in .faq is opened and its summary no longer closes it */
function faq() {
  document.querySelectorAll('.faq details').forEach(d => {
    d.open = true;
    d.addEventListener('toggle', () => { if (!d.open) d.open = true; });
    const s = d.querySelector(':scope > summary');
    if (s) s.addEventListener('click', e => e.preventDefault());
  });
}

/* ------------------------------------------------------------------ opening hours
   today's row in the venue's time zone, from data-tz on the dl; never the visitor's clock */
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function daySet(text) {
  const t = String(text || '').toLowerCase().replace(/\bweekdays\b/g, 'mon to fri').replace(/\bweekends?\b/g, 'sat and sun');
  if (/\b(daily|every day|all week|mon(day)?\s*(?:-|–|to)\s*sun(day)?)\b/.test(t)) return new Set(DAYS);
  const hits = [...t.matchAll(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?/g)];
  if (!hits.length) return null;
  const set = new Set();
  for (let i = 0; i < hits.length; i++) {
    const a = DAYS.indexOf(hits[i][1]);
    const next = hits[i + 1];
    const between = next ? t.slice(hits[i].index + hits[i][0].length, next.index) : '';
    if (next && /^\s*(?:-|–|to|till|until|through)\s*$/.test(between)) {
      const b = DAYS.indexOf(next[1]);
      for (let d = a; ; d = (d + 1) % 7) { set.add(DAYS[d]); if (d === b) break; }
      i++;
    } else set.add(DAYS[a]);
  }
  return set;
}
function hours() {
  document.querySelectorAll('dl.hours').forEach(dl => {
    dl.querySelectorAll('.is-today').forEach(el => el.classList.remove('is-today'));
    const tz = dl.dataset.tz;
    if (!tz) return;
    let today;
    try { today = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(new Date()).slice(0, 3).toLowerCase(); }
    catch { console.warn(`system.js: hours: unknown time zone ${tz}`); return; }
    for (const dt of dl.querySelectorAll('dt')) {
      const days = daySet(dt.dataset.days ? dt.dataset.days.replace(/,/g, ' and ') : dt.textContent);
      if (!days?.has(today)) continue;
      dt.classList.add('is-today');
      for (let dd = dt.nextElementSibling; dd && dd.tagName === 'DD'; dd = dd.nextElementSibling) dd.classList.add('is-today');
      break;
    }
  });
  openNow();
}
/* [data-open-now] (a line in the visit block or the hero's notice) reads "Open now, until 16:00" or
   "Closed, opens Tuesday at 7:30" from the first dl.hours with data-tz, in the venue's time zone; its
   own text stays when the hours cannot be read (no data-tz, a row without times) */
const DAY_NAMES = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };
function openNow() {
  const outs = document.querySelectorAll('[data-open-now]');
  const dl = document.querySelector('dl.hours[data-tz]');
  if (!outs.length || !dl) return;
  let parts;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: dl.dataset.tz })
      .formatToParts(new Date()).map(p => [p.type, p.value]));
  } catch { return; }
  const today = DAYS.indexOf(parts.weekday.slice(0, 3).toLowerCase());
  const nowMin = (+parts.hour % 24) * 60 + +parts.minute;
  const span = day => {
    for (const dt of dl.querySelectorAll('dt')) {
      const days = daySet(dt.dataset.days ? dt.dataset.days.replace(/,/g, ' and ') : dt.textContent);
      if (!days?.has(DAYS[day])) continue;
      const dd = dt.nextElementSibling;
      const m = dd && dd.tagName === 'DD' && dd.textContent.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:to|-|–|until)\s*(\d{1,2})(?:[:.](\d{2}))?/);
      return m ? { open: +m[1] * 60 + (+m[2] || 0), close: +m[3] * 60 + (+m[4] || 0), from: m[1] + (m[2] ? ':' + m[2] : ''), to: m[3] + (m[4] ? ':' + m[4] : ':00') } : { closed: true };
    }
    return null;
  };
  const t = span(today);
  let text = null;
  if (t && !t.closed && nowMin >= t.open && nowMin < t.close) text = `Open now, until ${t.to}`;
  else {
    for (let k = 0; k < 8 && !text; k++) {
      const d = (today + k) % 7, s2 = span(d);
      if (!s2 || s2.closed || (k === 0 && nowMin >= s2.open)) continue;
      text = `Closed, opens ${k === 0 ? 'today' : k === 1 ? 'tomorrow' : DAY_NAMES[DAYS[d]]} at ${s2.from}`;
    }
  }
  if (text) outs.forEach(o => { o.textContent = text; });
}

/* ------------------------------------------------------------------ peek
   a list beside one photograph that changes to the row under the pointer, the focus or a tap */
function peek() {
  document.querySelectorAll('[data-peek]').forEach(root => {
    const rows = [...root.querySelectorAll('[data-peek-to]')];
    const pics = [...root.querySelectorAll('[data-peek-for]')];
    if (!rows.length || !pics.length) return;
    let cur = null;
    // the swap is instant (MO-07): the row's photograph shows, the others hide, nothing fades
    const show = row => {
      const pic = pics.find(p => p.dataset.peekFor === row.dataset.peekTo);
      if (!pic || row === cur) return;
      cur = row;
      // the row on show is marked beside its photograph only (from 1024); stacked, the list stays plain
      const wide = matchMedia('(min-width: 1024px)').matches;
      rows.forEach(r => r.classList.toggle('is-on', wide && r === row));
      pics.forEach(p => { p.hidden = p !== pic; });
    };
    // every photograph is fetched now, so a swap never shows an empty frame
    pics.forEach(p => { if (p.loading === 'lazy') p.loading = 'eager'; });
    show(rows.find(r => pics.some(p => !p.hidden && p.dataset.peekFor === r.dataset.peekTo)) || rows[0]);
    rows.forEach(r => {
      r.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(r); });
      r.addEventListener('focusin', () => show(r));
      r.addEventListener('click', e => { if (!e.target.closest('a, button, input, select, textarea')) show(r); });
    });
  });
}

/* ------------------------------------------------------------------ visuals */
let probe;
function rgb(value) {
  value = (value || '').trim();
  if (!value) return null;
  probe = probe || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return d[3] ? [d[0], d[1], d[2]] : null;
}
const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

// The page's lit ground (references/cards.md: sand, sky, sage or painting, <html data-ground>, picked at
// random from the three on a tech page; a page of kind other has none, it is flat). Without data-ground the
// page palette picks one, so two sites never share it by default.
const GROUNDS = ['sand', 'sky', 'sage'];
function groundTokens() {
  const html = document.documentElement;
  if (!html.dataset.ground) {
    const first = document.querySelector('.card [data-fx], .frame [data-fx], .frame[data-fx]');
    const root = getComputedStyle(html);
    const key = `${root.getPropertyValue('--p-bg')}${root.getPropertyValue('--p-accent')}`.replace(/\s/g, '');
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    html.dataset.ground = first?.dataset.fx === 'painterly-landscape' ? 'painting' : GROUNDS[h % GROUNDS.length];
  }
  const cs = getComputedStyle(html);
  const t = k => cs.getPropertyValue(`--ground-${k}`).trim();
  return { bg: t('bg'), surface: t('surface'), ink: t('ink'), muted: t('muted'), accent: t('accent') };
}
// every ground that holds UI, and the closing band's, takes the lit ground on light and dark pages
// alike: clearly lighter than a dark card, a clear step darker than white UI, so page, card, panel and
// UI are never four near-black layers. data-fx-palette on the element wins; --hue changes its accent.
function lightGrounds() {
  const g = groundTokens();
  document.querySelectorAll('[data-fx]').forEach(el => {
    if (el.dataset.fxPalette) return;
    const band = el.matches('.frame--cta > .frame__fx');
    if (!band && !el.matches('.panel, .panel__screen, .frame')) return;
    const hue = rgb(getComputedStyle(el).getPropertyValue('--hue'));
    el.dataset.fxPalette = JSON.stringify({ ...g, ...(hue ? { accent: hex(hue) } : {}) });
    // the box itself takes the lit colour too: an effect that keeps its host's own background (a
    // frame's dark surface on a dark page) then still draws on the lit ground, and nothing flashes dark
    if (!band) el.style.backgroundColor = g.bg;
  });
}

// the featured plan's lit border (cards.css .plan.is-featured): it rests on a quiet accent hairline;
// on hover or keyboard focus one light runs round its edge (edge-glow, mounted for that lap, then
// faded and freed), so nothing moves on its own or because the page scrolled
function glowOnHover(fx, els) {
  for (const el of els) {
    let busy = false;
    const lap = async () => {
      if (busy || reduced()) return;
      busy = true;
      try {
        let params = {};
        try { params = JSON.parse(el.dataset.glowParams || '{}'); } catch { /* defaults */ }
        const c = await fx.mount(el, el.dataset.glow, { palette: fx.readPalette(el), params, seed: 2 });
        const r = el.getBoundingClientRect(), per = 2 * (r.width + r.height);
        await new Promise(res => setTimeout(res, per / Math.max(40, Math.min(c.params?.speed || 400, per / 4)) * 1000));
        el.classList.add('is-fading');
        await new Promise(res => setTimeout(res, 650));
        c.destroy();
      } catch (e) { console.warn('system.js: glow', e); }
      el.classList.remove('is-fading');
      busy = false;
    };
    el.addEventListener('pointerenter', lap);
    el.addEventListener('focusin', lap);
    fx.load(el.dataset.glow).catch(() => {});
  }
}

async function visuals() {
  // a lit border written as data-fx="edge-glow" is the hover light (data-glow), never a ground
  document.querySelectorAll('[data-fx="edge-glow"]').forEach(el => {
    el.dataset.glow = 'edge-glow';
    if (el.dataset.fxParams && !el.dataset.glowParams) el.dataset.glowParams = el.dataset.fxParams;
    el.removeAttribute('data-fx');
  });
  const grounds = [...document.querySelectorAll('[data-fx]')];
  const glows = [...document.querySelectorAll('[data-glow]')];
  const frags = [...document.querySelectorAll('[data-ui-load], [data-ui]')].filter(el => !el.parentElement?.closest('[data-ui-load]'));
  if (!grounds.length && !frags.length && !glows.length) return;
  // only the hero's ground moves, and not when its frame holds an object (assets/objects: data-print),
  // which is then that visual's one motion and its pause button the only one in the corner. On a phone
  // (under 640px), on kind other and on a place nothing loops: the hero's ground is drawn once like the
  // rest and every fragment holds its finished picture (as most good sites cut motion there), so no
  // pause button covers the UI. A held fragment still plays while the pointer is on its card.
  const phone = window.matchMedia('(max-width: 639px)').matches || kindOther();
  const box = el => el.closest('.frame, .panel__screen, .panel') || el;
  const moving = phone ? [] : grounds.filter(el => el.closest('.hero, .section--hero') && !box(el).querySelector('[data-print], [data-scene]'));
  const live = el => moving.includes(el);
  const [fx, ui] = await Promise.all([
    grounds.length || glows.length ? import(new URL('effects/fx.js', HERE).href).then(m => m.default) : null,
    import(new URL('ui/ui.js', HERE).href).then(m => m.default),
  ]);
  const name = el => el.dataset.uiLoad || el.dataset.ui || '';
  const loops = el => !phone && !!el.closest('[data-ui-loop], [data-ui-cycles]');
  // a fragment that does not loop is held on its finished picture as soon as its own load resolves
  frags.forEach(el => { if (!loops(el)) el.setAttribute('data-ui-still', ''); });
  const opts = el => { try { return JSON.parse(el.dataset.uiOpts || '{}'); } catch { return {}; } };
  const run = el => (el.dataset.uiLoad ? ui.load(el, el.dataset.uiLoad, opts(el)) : ui.start(el)).catch(e => console.warn(e));

  if (fx) lightGrounds();
  await Promise.all([
    // the hero's ground moves and keeps its context; every other ground is baked to a picture
    fx && Promise.all(moving.map(el => fx.mountAll(el))),
    fx && grounds.length && ui.grounds(document, fx, { skip: live }),
    ...frags.map(run),
  ]);
  // the hero's ground moves, so it gets the pause button every loop has (one per frame, shared)
  if (fx && ui) moving.forEach(el => { const c = fx.get(el); if (c) ui.pausable(el.closest('.panel__screen, .panel, .frame') || el, c); });
  if (fx && glows.length) glowOnHover(fx, glows);
}

/* ------------------------------------------------------------------ page tone
   <html data-tone="dark|light"> from the palette's base, so a dark footer stays dark on a dark page
   (system.css .footer--dark) instead of turning into the light inverse */
function tone() {
  const c = rgb(getComputedStyle(document.documentElement).getPropertyValue('--p-bg'));
  if (!c) return;
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  document.documentElement.dataset.tone = L < 0.18 ? 'dark' : 'light';
}

/* ------------------------------------------------------------------ pictures always draw
   A photograph never shows as an empty frame: once the page has loaded, every lazy image is fetched
   (so one far down the page is there when a visitor or a screenshot reaches it), and one that fails
   to load is outlined in red and counted (<html data-broken="n">), like a placeholder. */
function pictures() {
  const html = document.documentElement;
  let broken = 0;
  const fail = img => {
    if (img.dataset.broken != null) return;
    img.dataset.broken = '';
    img.setAttribute('data-placeholder', '');
    html.dataset.broken = String(++broken);
    console.warn(`system.js: a picture did not load: ${img.currentSrc || img.src}`);
  };
  document.querySelectorAll('img').forEach(img => {
    // an SVG with only a viewBox reports no natural width though it draws: decode() tells
    if (img.complete && img.getAttribute('src') && !img.naturalWidth) img.decode().catch(() => fail(img));
    else img.addEventListener('error', () => fail(img), { once: true });
  });
  const eager = () => document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
  const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
  if (document.readyState === 'complete') idle(eager);
  else window.addEventListener('load', () => idle(eager), { once: true });
}

/* ------------------------------------------------------------------ guards
   Faults that shipped before: a [bracketed placeholder] or a "(sample)" tag in visible text, a line that
   explains or apologises ("Names and figures on this page are examples", "made in code", "photographs
   follow"), a printed .example address, and one effect in more than two sections. Each is marked so it
   shows in every screenshot and the checker can read it: [data-placeholder] (a red dashed outline,
   system.css) and <html data-placeholders="n">; <html data-fx-repeat="id ...">. */
const PLACEHOLDER = /\[[^\]\n]{1,60}\]|\((?:sample|placeholder|example)[^)]{0,30}\)|\bsample (?:figure|price|name|quote|number|photo|page)s?\b|\bplaceholder\b|\bnames and figures\b|\b(?:are|is) (?:examples?|illustrative|invented)\b|\bfor illustration\b|\b(?:made|drawn|rendered) in code\b|\bphotographs? (?:follow|to follow|coming)\b|\bto be replaced\b|[\w.+-]+@[\w-]+\.example\b|\bwww\.[\w-]+\.example\b/i;
function guards() {
  const html = document.documentElement;
  let n = 0;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: t => (t.parentElement?.closest('script, style, template, noscript') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    if (PLACEHOLDER.test(t.textContent)) { t.parentElement.setAttribute('data-placeholder', ''); n++; }
  }
  document.querySelectorAll('img[alt]').forEach(img => { if (PLACEHOLDER.test(img.alt)) { img.setAttribute('data-placeholder', ''); n++; } });
  // the old figures note, whatever its words
  document.querySelectorAll('.figures-note').forEach(el => { if (!el.hasAttribute('data-placeholder')) { el.setAttribute('data-placeholder', ''); n++; } });
  if (n) { html.dataset.placeholders = String(n); console.warn(`system.js: ${n} placeholder, sample tag, apology or .example address left in visible text`); }
  // an effect id in at most two sections (a card group counts once; the closing band is a section)
  const seen = new Map();
  document.querySelectorAll('[data-fx]').forEach(el => {
    if (el.closest('.nav')) return;   // the menu card's panel is hidden until hover: not counted
    const sec = el.closest('section, footer') || el;
    if (!seen.has(el.dataset.fx)) seen.set(el.dataset.fx, new Set());
    seen.get(el.dataset.fx).add(sec);
  });
  const repeat = [...seen].filter(([, s]) => s.size > 2).map(([id]) => id);
  if (repeat.length) { html.dataset.fxRepeat = repeat.join(' '); console.warn(`system.js: effect in more than two sections: ${repeat.join(', ')}`); }
}

/* ------------------------------------------------------------------ moments
   The page's one or two dealt moments (assets/moments, references/moments.md): loaded only when the page
   holds a [data-moment]; data-ready waits for them. mount is idempotent, so nothing mounts twice. */
async function moments() {
  if (!document.querySelector('[data-moment]')) return;
  const m = await import(new URL('moments/moments.js', HERE).href);
  await m.ready;
}

function init() {
  try { tone(); } catch (e) { console.warn('system.js: tone', e); }
  nav();
  tabs();
  try { faq(); } catch (e) { console.warn('system.js: faq', e); }
  try { hours(); } catch (e) { console.warn('system.js: hours', e); }
  try { peek(); } catch (e) { console.warn('system.js: peek', e); }
  try { pictures(); } catch (e) { console.warn('system.js: pictures', e); }
  try { guards(); } catch (e) { console.warn('system.js: guards', e); }
  Promise.all([
    visuals().catch(e => console.warn('system.js: visuals', e)),
    moments().catch(e => console.warn('system.js: moments', e)),
  ]).finally(() => { document.documentElement.dataset.ready = '1'; });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

export default { init };
