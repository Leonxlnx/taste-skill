// assets/scenes/panels-reproportion-on-arrival/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / panels-reproportion-on-arrival.js — "Panels re-proportion as they arrive".
//
// A typographic statement holds at display size in a solid column of the page's ground, as tall as the
// stage, while four to six large panels arrive one at a time beside it. Every panel is one picture over a
// band of the page's own ground. A panel arrives in the main slot (about 42% of the width) split half and
// half, its name on one line; as the reader scrolls, the picture grows by its clip to 70% of the panel and
// pushes the band down, and the name re-sets onto two lines in large type: the change happens in view, at
// full size, and it is the thing on screen. When the next panel comes, the settled one steps left into a
// narrower slot beside the column, still whole and still named, and the one that was there slides away
// behind the column. So the screen holds at most two panels: the one just settled, whole, and the one
// coming into focus. The first panel, with nothing settled beside it yet, arrives across the whole window
// right of the column and narrows into the slot when the second comes. The last frame is the last panel
// settled beside the column, whose foot holds the sentence and the one action as a plain button on the
// page ground.
//
// What follows the scroll and what runs on a clock: the change of each panel (its picture's share, its
// zoom, its band) follows the scroll. The hand-over between two panels runs on a clock (0.8 s) once the
// scroll passes it, and plays back when the reader scrolls back: the panel that leaves slides whole
// behind the column (off the left edge on a portrait tablet), the settled one steps left and narrows,
// the next slides in from the right edge. While it runs, a panel crossing the column's edge or the
// screen's edge fades with the share of it still in view, and an arriving panel's name rises only once
// it has landed. So no resting frame ever shows a panel as a strip or a name cut by an edge, and every
// frame after the first panel has settled shows one panel settled whole with its name. The names re-set
// on a clock too (0.55 s, the old version out before the new one rises) the moment a panel passes
// half-way.
//
// Needs gsap + ScrollTrigger (no SplitText: the two lines are built here). Load after stage.js. Only
// transform, opacity and clip-path move: the picture grows by its clip, the band and the panels move by
// transforms, a panel narrows by its clip. Nothing is laid out again while it plays.
//
// ── DOM ──────────────────────────────────────────────────────────────────────────────────────────
// <section class="scene" data-scene="panels-reproportion-on-arrival" id="workshops"
//          aria-labelledby="pr-title" data-options='{}'>
//   <div class="scene-stage">
//     <div class="pr-held">                                         the statement's column
//       <h2 class="pr-statement" id="pr-title">A statement of 4-7 words.</h2>   (h1 on a first screen)
//       <p class="pr-sub">Optional: one sentence of 8-18 words.</p>
//     </div>
//     <div class="pr-rail">
//       <article class="pr-panel" style="--pr-pos: 50% 50%; --pr-pos-phone: 50% 40%">   4-6 of them
//         <figure class="pr-picture"><img src="…" alt="…" width="…" height="…" loading="eager"></figure>
//         <div class="pr-band">
//           <h3 class="pr-name">Two words</h3>          2-3 words, 8-20 characters, no word over 10
//           <p class="pr-line">What it is, 3-6 words</p>             optional, one short line
//         </div>
//       </article> …
//     </div>
//     <a class="pr-action" href="#…">The one action</a>              optional, after the rail
//   </div>
// </section>
// The statement is set as large as two lines in its column allow (about 100px at 1440x900 for a line of
// eight characters), so keep its longest line short: "A year / by hand." It never takes a third line.
// On wide screens the column's foot holds the sentence and, under it, the action as a plain button,
// level with the panels' short lines; on a portrait tablet the action stands under the sentence at the
// top right; on a phone and in the finished composition it follows the last panel, under its name.
// The name is split onto two lines at the word break that balances them (an author's <br> wins). The
// script draws both versions (span.pr-name__one and span.pr-name__two, aria-hidden) beside the heading,
// which stays as written and is what screen readers hear; while the stage runs it is visually hidden,
// and in the finished composition it is the name on screen. A one-word name stays on one line. A panel
// may be an <a class="pr-panel" href="…"> instead of an article: focusing it brings it into the main slot.
// Pictures: one a panel, never repeated, in one grade (same light, same colour treatment: grade the files
// together before they go in). The settled picture is about square in the main slot and a tall portrait
// in the narrow slot (the same picture, its middle shown), so keep the subject in the middle. The first
// picture also fills the whole window as it arrives (about 1.6:1 at 1440x900, its middle third in the
// narrow slot): put a landscape picture whose middle holds up first. Frame each
// with --pr-pos (and --pr-pos-phone). Give them loading="eager": the rail moves them before they would
// scroll into view.
//
// ── Options (data-options JSON), default and range ────────────────────────────────────────────────
//   pace     0.42   screens of scroll per panel (0.3-0.7): a still moment after it arrives, the change,
//                   then a rest with it settled; the hold is panels x pace + rest, kept to 2.5 screens
//   from     0.5    share of the panel the picture fills as it arrives (0.4-0.56)
//   grow     0.7    share it fills once settled (0.62-0.78)
//   column   0.33   share of the width the statement's column keeps on wide screens (0.26-0.4)
//   panel    0.42   share of the width a panel takes in the main slot (0.36-0.46); the narrow slot beside
//                   the column takes what is left, at least 16%
//   zoom     1.06   picture scale as it arrives, settling to 1 (1-1.15)
//   rest     0.1    screens of still end frame (0-0.5)
//   hand     0.8    seconds the hand-over between two panels takes (0.5-1.2)
//   scrub    true with smooth scrolling, else 0.4
//   phone    'same' (the stacked plan below) | 'rest' (the finished composition)
// The number of panels comes from the markup: 4-5 read best, 3 runs, 6 is the most. With fewer than 3 the
// section shows its finished composition.
//
// Page tokens: --ground (the stage, the column and every band), --ink (the type), --muted, --accent and
// --accent-ink (the action), --font-display, --font-text, --display-weight (the statement and the names;
// 500 when the page sets none), --strong-weight (600), --text-weight (400), --radius (the action's
// corners, 0). Scene tokens: per panel --pr-pos and --pr-pos-phone.
//
// Wide screens (at least 1000px and 5:4 or wider): the column on the left, the narrow slot beside it,
// the main slot on the right. Narrower screens from 768px (a portrait tablet): the statement across the
// top, the two slots under it at full width, panels leaving off the left edge.
//
// Phone (below 768px): no pin and no sideways travel. The statement stands at the top and the panels
// stack, each about half a screen tall, arriving split half and half; as a panel's top edge crosses the
// middle of the screen it re-proportions on a clock (0.7 s): the picture grows to 70%, the band moves
// down and the name re-sets onto two lines. Scrolling back above the middle plays it back. The panels are
// short enough that a settled panel is whole on screen wherever the reader stops. The action follows the
// last panel.
// Reduced motion and no script: the finished composition, the statement over a row of settled panels
// (a column on a phone), each picture over its name, the action under them. Nothing is hidden.
(() => {
  const ID = 'panels-reproportion-on-arrival';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const num = (v, d, lo, hi) => (v === undefined || v === null || v === '' || typeof v === 'boolean' || !Number.isFinite(+v) ? d : clamp(+v, lo, hi));
  const sio = (t) => -(Math.cos(Math.PI * t) - 1) / 2;   // sine.inOut
  const OUT = 0.2, IN = 0.34;                            // the name's clock: out, then in (seconds)
  const LH = 1.02;                                       // the names' line height (the CSS uses the same)
  const LEAD = 0.14, CHANGE = 0.6;                       // of each panel's pace: still after it arrives, then the change

  const mk = (tag, cls, text) => { const e = document.createElement(tag); e.className = cls; if (text != null) e.textContent = text; return e; };
  const textOf = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const held = stage ? stage.querySelector('.pr-held') : null;
    const rail = stage ? stage.querySelector('.pr-rail') : null;
    const els = rail ? [...rail.querySelectorAll(':scope > .pr-panel')] : [];
    const action = stage ? stage.querySelector(':scope > .pr-action') : null;
    const N = els.length;
    if (!stage || !rail || N < 3) {
      if (!stage || !rail) console.warn(ID + ': needs a .scene-stage holding .pr-held and a .pr-rail of .pr-panel');
      return Stage.scene(root, { build: null, phone: 'rest' });
    }

    const o = {
      pace: num(opts.pace, 0.42, 0.3, 0.7),
      from: num(opts.from, 0.5, 0.4, 0.56),
      grow: num(opts.grow, 0.7, 0.62, 0.78),
      column: num(opts.column, 0.33, 0.26, 0.4),
      panel: num(opts.panel, 0.42, 0.36, 0.46),
      zoom: num(opts.zoom, 1.06, 1, 1.15),
      rest: num(opts.rest, 0.1, 0, 0.5),
      hand: num(opts.hand, 0.8, 0.5, 1.2),
    };
    if (o.from > o.grow - 0.1) o.from = o.grow - 0.1;
    o.pace = Math.min(o.pace, (2.5 - o.rest) / N);
    const hold = N * o.pace + o.rest;
    const scrub = opts.scrub !== undefined ? opts.scrub : Stage.lenis ? true : 0.4;
    root.style.setProperty('--pr-grow', o.grow);

    // ── the names: one heading, drawn twice (one line, and two lines), the text kept for readers ──────
    const P = els.map((el, i) => {
      el.style.setProperty('--i', i);
      el.classList.toggle('pr-first', i === 0);
      const pic = el.querySelector('.pr-picture');
      const q = { el, i, pic, img: pic ? pic.querySelector('img') : null, band: el.querySelector('.pr-band'), name: el.querySelector('.pr-name'), line: el.querySelector('.pr-line'), one: [], two: [], text: '', lines2: [], state: null, k: -1, ke: 0, pos: { x: NaN, v: NaN }, role: null, textDelay: 0 };
      const name = q.name;
      if (name) {
        const html = name.innerHTML;
        const parts = html.split(/<br\s*\/?>/i).map(textOf).filter(Boolean);
        const text = parts.join(' ') || textOf(html);
        let two = parts.length > 1 ? [parts[0], parts.slice(1).join(' ')] : null;
        if (!two) {
          const words = text.split(' ');
          if (words.length < 2) two = [text];
          else {
            let best = 1, score = Infinity;
            for (let s = 1; s < words.length; s++) {
              const a = words.slice(0, s).join(' ').length, b = words.slice(s).join(' ').length;
              if (Math.max(a, b) < score) { score = Math.max(a, b); best = s; }
            }
            two = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
          }
        }
        q.text = text; q.lines2 = two;
        // the heading stays as written (and is what readers hear); the two drawn versions sit beside it
        let v1 = name.parentElement.querySelector(':scope > .pr-name__one'), v2 = name.parentElement.querySelector(':scope > .pr-name__two');
        if (!v1 || !v2) {
          v1 = mk('span', 'pr-name__one'); v1.setAttribute('aria-hidden', 'true');
          const m1 = mk('span', 'pr-mask'); m1.append(mk('span', 'pr-ln', text)); v1.append(m1);
          v2 = mk('span', 'pr-name__two'); v2.setAttribute('aria-hidden', 'true');
          for (const t of two) { const m = mk('span', 'pr-mask'); m.append(mk('span', 'pr-ln', t)); v2.append(m); }
          name.after(v1, v2);
        }
        q.one = [...v1.querySelectorAll('.pr-ln')];
        q.two = [...v2.querySelectorAll('.pr-ln')];
      }
      if (q.img && q.img.decode) q.img.decode().catch(() => {});   // decoded before they move
      return q;
    });
    const allText = P.flatMap((q) => [...q.one, ...q.two, q.line]).filter(Boolean);

    // a hidden ruler in the names' face, for fitting them (in a 1px box, so it never widens the page)
    const meterBox = stage.querySelector(':scope > .pr-meter-box') || mk('span', 'pr-meter-box');
    meterBox.setAttribute('aria-hidden', 'true');
    const meter = meterBox.firstElementChild || mk('span', 'pr-meter');
    meterBox.append(meter);
    stage.append(meterBox);
    const at100 = (t) => { meter.textContent = t; return meter.getBoundingClientRect().width || 1; };
    const statement = held ? held.querySelector('.pr-statement') : null;
    const sub = held ? held.querySelector('.pr-sub') : null;

    // live state
    const S = { live: false, phone: false, side: false, W: 0, H: 0, w: 0, w0: 0, n: 0, g: 0, m: 0, Hp: 0, xL: 0, xM: 0, xR: 0, xG: 0, cut: 0, t: 0, s: -1, tl: null };

    // One size for every name in each version. The two-line name as large as the narrow slot allows
    // (each line inside it; both lines and the short line inside the settled band), since a settled panel
    // keeps its name there; the one-line name whole on one line in the main slot and at most two thirds
    // of the two-line size, so the re-set reads as the name coming into focus.
    const fit = (w2, w1, Hp) => {
      const pad = Math.round(clamp(0.035 * w1, 12, 22));
      root.style.setProperty('--pr-pad', pad + 'px');
      root.style.setProperty('--pr-w', w1 + 'px');
      root.style.setProperty('--pr-n', w2 + 'px');
      const innerW1 = w1 - Math.max(4, Math.round(0.03 * w1));
      // on a phone the panel is wide and short: the short line stands beside the two-line name, at the
      // band's foot on the right, so the name keeps the band's height
      const innerW2 = S.phone ? Math.floor(0.56 * w1) : w2 - Math.max(6, Math.round(0.05 * w2));
      let descH = 0;
      if (!S.phone) for (const q of P) if (q.line) descH = Math.max(descH, q.line.getBoundingClientRect().height);
      const bandH = (1 - o.grow) * Hp;
      const gap = descH ? Math.max(8, Math.round(pad * 0.6)) : 0;
      let s2 = 400, s1 = 400;
      for (const q of P) {
        if (!q.name) continue;
        for (const t of q.lines2) s2 = Math.min(s2, (innerW2 / at100(t)) * 100);
        s1 = Math.min(s1, (innerW1 / at100(q.text)) * 100);
      }
      s2 = Math.min(s2, (bandH - pad - gap - descH - pad * 0.6) / (2 * LH + 0.1), 128);
      // the statement stays the largest type on the stage
      const sFs = statement ? parseFloat(getComputedStyle(statement).fontSize) : 0;
      if (sFs) s2 = Math.min(s2, 0.8 * sFs);
      s2 = Math.max(18, Math.floor(s2 * 0.97));
      s1 = Math.max(14, Math.floor(Math.min(s1 * 0.97, 0.66 * s2)));
      root.style.setProperty('--pr-two', s2 + 'px');
      root.style.setProperty('--pr-one', s1 + 'px');
    };

    // The statement as large as two lines in its box allow: from the largest size down until it takes two
    // lines and no word runs past the box.
    const fitStatement = (maxFs, minFs) => {
      if (!statement) return;
      statement.style.removeProperty('font-size');
      const lines = () => {
        const lh = parseFloat(getComputedStyle(statement).lineHeight) || parseFloat(statement.style.fontSize);
        return Math.round(statement.getBoundingClientRect().height / lh);
      };
      let fs = Math.floor(maxFs);
      for (; fs > minFs; fs -= 2) {
        statement.style.fontSize = fs + 'px';
        if (lines() <= 2 && statement.scrollWidth <= statement.clientWidth + 1) break;
      }
      statement.style.fontSize = Math.max(fs, minFs) + 'px';
    };

    // Wide screens: the column on the left, the narrow slot beside it, the main slot on the right.
    // Narrower screens: the statement across the top, the two slots across the full width under it.
    const layout = () => {
      const W = stage.clientWidth, H = stage.clientHeight;
      if (!W || !H) return;
      // one gutter for the margins and the gaps: a waiting panel then stands exactly past the screen's edge
      const m = Math.round(clamp(0.02 * W, 16, 32));
      const g = m;
      const side = W / H >= 1.25 && W >= 1000;
      root.classList.toggle('pr-side', side);
      root.classList.toggle('pr-stack', !side);
      root.style.setProperty('--pr-gutter', m + 'px');
      root.style.setProperty('--pr-foot', action ? Math.round(action.offsetHeight + 22) + 'px' : '0px');
      if (action) { action.style.removeProperty('left'); action.style.removeProperty('top'); }
      let w, n, top, Hp, C;
      if (side) {
        C = Math.round(clamp(o.column * W, 320, 720));
        root.style.setProperty('--pr-col', C + 'px');
        w = Math.round(o.panel * W);
        n = W - C - w - g - m;
        if (n < 0.16 * W) { n = Math.round(0.16 * W); w = W - C - g - m - n; }
        fitStatement(Math.min(170, 0.2 * H), 44);
        top = m; Hp = H - 2 * m;
        S.cut = C; S.xL = C;
      } else {
        root.style.removeProperty('--pr-col');
        C = 0;
        w = Math.round(0.54 * W);
        n = W - 2 * m - w - g;
        fitStatement(Math.min(132, 0.12 * H), 40);
        // the action stands under the sentence
        if (action && sub) {
          const rs = stage.getBoundingClientRect(), r = sub.getBoundingClientRect();
          action.style.left = Math.round(r.left - rs.left) + 'px';
          action.style.top = Math.round(r.bottom - rs.top + 18) + 'px';
        }
        let below = held ? held.offsetTop + held.offsetHeight : 0;
        if (action) below = Math.max(below, action.offsetTop + action.offsetHeight);
        Hp = Math.round(Math.max(240, Math.min(H - below - 2 * m, w / 0.52)));
        top = H - m - Hp;
        S.cut = 0; S.xL = m;
      }
      S.xM = S.xL + n + g;
      // the first panel arrives across the whole window (nothing has settled yet, so nothing stands in
      // the narrow slot): it is laid out that wide, and narrows by its clip like the others
      const w0 = W - m - S.xL;
      root.style.setProperty('--pr-w0', w0 + 'px');
      S.w0 = w0;
      S.xR = S.xM + w + g;              // the screen's right edge: waiting panels stand just past it
      S.xG = S.xL - n - g;              // wholly behind the column (or past the left edge)
      root.style.setProperty('--pr-h', Hp + 'px');
      root.style.setProperty('--pr-top', top + 'px');
      root.style.setProperty('--pr-cut', S.cut + 'px');
      S.W = W; S.H = H; S.w = w; S.n = n; S.g = g; S.m = m; S.Hp = Hp; S.side = side;
      fit(n, w, Hp);
    };

    // ── painting one moment ──────────────────────────────────────────────────────────────────────────
    // the picture: its zoom follows the change, and in the narrow slot it shifts so its middle shows
    const boxW = (q) => (q.i === 0 ? S.w0 : S.w);
    const applyImg = (q) => {
      if (!q.img) return;
      const z = o.zoom + (1 - o.zoom) * q.ke;
      const dx = S.phone || !Number.isFinite(q.pos.v) ? 0 : -(boxW(q) - q.pos.v) / 2;
      q.img.style.transform = `translate3d(${dx.toFixed(2)}px,0,0) scale(${z.toFixed(4)})`;
    };
    // where the panel stands and how much of its width shows (a narrowed panel is clipped from the right)
    const applyPos = (q) => {
      q.el.style.transform = `translate3d(${q.pos.x.toFixed(2)}px,0,0)`;
      const cut = boxW(q) - q.pos.v;
      q.el.style.clipPath = cut > 0.5 ? `inset(0px ${cut.toFixed(2)}px 0px 0px)` : '';
      // while a hand-over carries a panel across the column's edge or the screen's edge it fades with the
      // share of it still in view, so a piece passing an edge is faint, never a hard strip
      const inView = Math.max(0, Math.min(q.pos.x + q.pos.v, S.W) - Math.max(q.pos.x, S.cut)) / Math.max(1, q.pos.v);
      const op = clamp((inView - 0.2) / 0.55, 0, 1);
      if (Math.abs(op - (q.op ?? -1)) > 0.004) { q.op = op; q.el.style.opacity = op >= 0.999 ? '' : op.toFixed(3); }
      applyImg(q);
    };
    // the change itself, ke from 0 (arriving) to 1 (settled), already eased
    const applyK = (q, ke, force) => {
      if (!force && Math.abs(ke - q.k) < 0.0004) return;
      q.k = ke; q.ke = ke;
      const share = o.from + (o.grow - o.from) * ke;
      if (q.pic) q.pic.style.clipPath = `inset(0px 0px ${((1 - share / o.grow) * 100).toFixed(3)}% 0px)`;
      if (q.band) q.band.style.transform = `translate3d(0,${(-(o.grow - share) * S.Hp).toFixed(2)}px,0)`;
      applyImg(q);
    };
    // The name's state: 'hidden' (the panel is away), 'one' (arriving) or 'two' (past half-way). A change
    // runs on a clock: what leaves goes first, what comes rises after it, so the two versions never share
    // pixels and no frame shows a name half re-set once the clock has run.
    const visible = (e) => +gsap.getProperty(e, 'opacity') > 0.01;
    const setText = (q, st, instant, delay = 0) => {
      if (q.state === st && !instant) return;
      const prev = q.state;
      q.state = st;
      const lines = [...q.one, ...q.two];
      gsap.killTweensOf([...lines, q.line].filter(Boolean));
      const on1 = st === 'one', on2 = st === 'two';
      if (instant || prev === null) {
        gsap.set(q.one, { yPercent: on1 ? 0 : 110, autoAlpha: on1 ? 1 : 0 });
        gsap.set(q.two, { yPercent: on2 ? 0 : 110, autoAlpha: on2 ? 1 : 0 });
        if (q.line) gsap.set(q.line, { autoAlpha: st === 'hidden' ? 0 : 1 });
        return;
      }
      const forward = !(prev === 'two' && on1);           // scrolling back re-sets the other way
      const outs = [...(on1 ? [] : q.one), ...(on2 ? [] : q.two)];
      const going = outs.filter(visible);
      { const hide = outs.filter((e) => !visible(e)); if (hide.length) gsap.set(hide, { yPercent: 110, autoAlpha: 0 }); }
      if (going.length) gsap.to(going, { yPercent: forward ? -110 : 110, autoAlpha: 0, duration: OUT, ease: 'power2.in' });
      const ins = on1 ? q.one : on2 ? q.two : [];
      if (ins.length) gsap.fromTo(ins, { yPercent: forward ? 110 : -110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: IN, ease: 'power3.out', delay: delay + (going.length ? OUT : 0), stagger: 0.05 });
      if (q.line) gsap.to(q.line, { autoAlpha: st === 'hidden' ? 0 : 1, duration: st === 'hidden' ? 0.15 : 0.25, delay: st === 'hidden' ? 0 : delay + OUT });
    };

    // Where each panel stands once the s-th panel has come in: the one before it settled in the narrow
    // slot, those before that behind the column, those after it waiting past the right edge. The first
    // panel arrives across the whole window beside the column (no panel has settled yet, so nothing
    // stands in the narrow slot), and narrows into it when the second comes.
    const roleOf = (j, s) => (j < s - 1 ? 'gone' : j === s - 1 ? 'left' : j === s ? 'main' : 'off');
    const target = (j, s) => {
      const r = roleOf(j, s);
      if (r === 'gone') return { x: S.xG, v: S.n };
      if (r === 'left') return { x: S.xL, v: S.n };
      if (r === 'main') return s === 0 ? { x: S.xL, v: S.w0 } : { x: S.xM, v: S.w };
      return { x: S.xR + (j - s - 1) * (S.w + S.g), v: S.w };
    };
    // the hand-over: on a clock, every panel at once, so they move as one rail
    const place = (instant) => {
      for (const q of P) {
        const r = roleOf(q.i, S.s), tg = target(q.i, S.s);
        const was = q.role;
        q.role = r;
        gsap.killTweensOf(q.pos);
        if (instant || !Number.isFinite(q.pos.x)) { q.pos.x = tg.x; q.pos.v = tg.v; applyPos(q); }
        else if (Math.abs(q.pos.x - tg.x) > 0.5 || Math.abs(q.pos.v - tg.v) > 0.5) gsap.to(q.pos, { x: tg.x, v: tg.v, duration: o.hand, ease: 'power3.inOut', onUpdate: () => applyPos(q) });
        // a panel coming in (from past the right edge, or back out from behind the column) shows its name
        // once it has arrived, so no name is ever cut by an edge
        q.textDelay = !instant && (was === 'gone' || was === 'off') ? o.hand * 0.62 : 0;
      }
    };
    const paint = (instant) => {
      if (!S.live || S.phone || !S.w) return;
      const pos = clamp(S.t, 0, 1) * hold;
      const s = clamp(Math.floor(pos / o.pace + 1e-6), 0, N - 1);
      if (instant || s !== S.s) { S.s = s; place(instant); }
      for (const q of P) {
        const kr = clamp((pos - (q.i + LEAD) * o.pace) / (CHANGE * o.pace), 0, 1);
        applyK(q, sio(kr), instant);
        setText(q, q.role === 'gone' || q.role === 'off' ? 'hidden' : kr >= 0.5 ? 'two' : 'one', instant, q.textDelay);
        q.textDelay = 0;
      }
    };

    const cleanup = () => {
      S.live = false; S.phone = false; S.tl = null; S.s = -1;
      for (const q of P) {
        if (window.gsap) gsap.killTweensOf(q.pos);
        q.el.style.transform = '';
        q.el.style.clipPath = '';
        q.el.style.opacity = ''; q.op = undefined;
        if (q.pic) q.pic.style.clipPath = '';
        if (q.img) q.img.style.transform = '';
        if (q.band) q.band.style.transform = '';
        q.state = null; q.k = -1; q.ke = 0; q.pos = { x: NaN, v: NaN }; q.role = null; q.on = undefined;
        if (q.proxy) gsap.killTweensOf(q.proxy);
      }
      if (statement) statement.style.removeProperty('font-size');
      if (action) { action.style.removeProperty('left'); action.style.removeProperty('top'); }
      if (window.gsap && allText.length) { gsap.killTweensOf(allText); gsap.set(allText, { clearProps: 'transform,opacity,visibility' }); }
      root.classList.remove('pr-side', 'pr-stack', 'pr-phone');
      for (const v of ['--pr-w', '--pr-w0', '--pr-n', '--pr-h', '--pr-top', '--pr-cut', '--pr-col', '--pr-gutter', '--pr-pad', '--pr-one', '--pr-two', '--pr-foot']) root.style.removeProperty(v);
    };

    // ── desktop and tablet: the held stage ───────────────────────────────────────────────────────────
    const build = (tl) => {
      cleanup();
      S.live = true; S.phone = false; S.tl = tl;
      layout();
      const prog = { t: 0 };
      tl.to(prog, { t: 1, duration: 1, ease: 'none', onUpdate: () => { S.t = prog.t; paint(); } }, 0);
      const st = tl.scrollTrigger;
      S.t = st ? clamp(st.progress, 0, 1) : 0;
      paint(true);
      if (gsap.context) gsap.context(() => () => { if (S.tl === tl) cleanup(); });
    };

    // ── phone: the stack, each panel re-proportioning on a clock as its top crosses the middle ────────
    const buildPhone = () => {
      cleanup();
      S.live = true; S.phone = true;
      root.classList.add('pr-phone');
      const measure = () => {
        const r0 = els[0].getBoundingClientRect();
        S.w = r0.width; S.Hp = r0.height;
        if (S.w && S.Hp) fit(S.w, S.w, S.Hp);
        for (const q of P) if (q.proxy) applyK(q, q.proxy.k, true);
      };
      measure();
      for (const q of P) {
        q.proxy = { k: 0 };
        q.on = undefined;
        q.settle = (on, instant) => {
          if (q.on === on && !instant) return;
          q.on = on;
          gsap.killTweensOf(q.proxy);
          if (instant) { q.proxy.k = on ? 1 : 0; applyK(q, q.proxy.k, true); setText(q, on ? 'two' : 'one', true); return; }
          gsap.to(q.proxy, { k: on ? 1 : 0, duration: 0.7, ease: 'power2.inOut', onUpdate: () => applyK(q, q.proxy.k) });
          setText(q, on ? 'two' : 'one');
        };
        ScrollTrigger.create({ trigger: q.el, start: 'top 50%', end: 'max', onToggle: (self) => q.settle(self.isActive) });
      }
      const half = window.innerHeight / 2;
      for (const q of P) q.settle(q.el.getBoundingClientRect().top <= half, true);
      S.measure = measure;
      if (gsap.context) gsap.context(() => () => { if (S.phone) cleanup(); });
    };

    // a refresh (fonts, pictures, a resize) measures the stage again before the timelines are measured,
    // and paints the moment again after them, without a clock
    if (window.ScrollTrigger) {
      ScrollTrigger.addEventListener('refreshInit', () => { if (S.live && !S.phone) layout(); });
      ScrollTrigger.addEventListener('refresh', () => {
        if (!S.live) return;
        if (S.phone) { if (S.measure) S.measure(); return; }
        if (S.tl && S.tl.scrollTrigger) S.t = clamp(S.tl.scrollTrigger.progress, 0, 1);
        paint(true);
      });
    }

    // a link or button in a panel that is not in the main slot brings it there, settled, before the
    // reader reads on
    root.addEventListener('focusin', (e) => {
      if (!S.live || S.phone || !S.tl || !S.tl.scrollTrigger) return;
      const k = els.findIndex((el) => el.contains(e.target));
      if (k < 0) return;
      const st = S.tl.scrollTrigger;
      const at = Math.min(hold, (k + LEAD + CHANGE) * o.pace + 0.02);
      const y = Math.round(st.start + (at / hold) * (st.end - st.start));
      if (Math.abs(window.scrollY - y) < 4) return;
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    return Stage.scene(root, {
      hold,
      scrub,
      build: (tl) => build(tl),
      phone: opts.phone === 'rest' ? 'rest' : { hold: 0, build: () => buildPhone() },
      rest: () => cleanup(),
    });
  };
})();
