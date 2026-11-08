// assets/scenes/room-walk-track/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / room-walk-track.js — "Sideways walk through rooms".
//
// A full-height row of flat-coloured rooms is held on screen and walked sideways at one screen of width
// per screen of scroll. Each room carries its own scrubbed moment: a photo that swaps inside a frame,
// two portraits that open while a statement brightens line by line, a vertical word that climbs as the
// row runs left, three value words that shear apart and meet, then a relay of project strips that open
// one after another. The walk stops on a held column that turns into a stack of photos while a question
// builds beside it; a coral room slides over the still column, frames a photo swap, and the whole row
// pulls away like a sheet to uncover a still closing headline in the next section's colour.
// Use it for studio, architecture or project-tour chapters with a dozen strong photographs.
//
// Needs gsap + ScrollTrigger (no SplitText: the few headings it splits are split here). Load after
// stage.js. Only transform, opacity and clip-path move; the relay is made of strips that are laid out
// open and overlap each other, so nothing is laid out again while it plays.
//
// ── DOM (rooms are optional except the track and the ground; keep this order) ────────────────────
// <section class="scene" data-scene="room-walk-track" id="walk" aria-labelledby="rw-title">
//  <div class="scene-stage">
//   <div class="rw-chrome">                                     optional, walk mode only; first, so the
//     <a class="rw-chip rw-mark" href="#top">Wordmark</a>                        skip link is an early tab stop
//     <a class="rw-chip rw-skip" href="#after">Skip the walk</a></div>
//   (A .rw-where chip, the room's name with "n of 8" and a filling bar, was a counter and a progress readout:
//    since fix-002 it is hidden and never written. Leave it out; pages that still carry it keep working.)
//   <div class="rw-track">
//    <article class="rw-room rw-threshold" data-name="Varde">                              80vw, paper
//      <h2 id="rw-title" class="rw-h1"><span class="rw-line">Line one</span><span class="rw-line">Line two</span></h2>
//      <p class="rw-lede">25-35 words.</p></article>
//    <article class="rw-room rw-photo" data-name="Ring Library">                           90vw, paper
//      <figure class="rw-bleed"><img></figure>                    wide picture, srcset up to 2400px
//      <figure class="rw-flip"><div class="rw-flip__b"><img></div><div class="rw-flip__a"><img></div></figure>
//      <div class="rw-copy"><h3><span class="rw-line">Line one</span><span class="rw-line">line two</span></h3><p>about 30 words</p></div></article>
//                         a short two-line heading (10 and 7 characters), set large beside the frame
//    <article class="rw-room rw-ink" data-name="On stairs">                                90vw, ink
//      <figure class="rw-pic rw-pic--a"><img></figure><figure class="rw-pic rw-pic--b"><img></figure>   3:4 portraits
//      <p class="rw-read"><span class="rw-rl">one line</span> … five lines, 35-45 words</p></article>
//    <div class="rw-band" aria-hidden="true"><div class="rw-band__col">Word * Word * Word * Word *</div></div>   15vw, one run of text
//                         (optional, and best left out: a repeated word is filler, not a room; the demo has none)
//    <article class="rw-room rw-values" data-name="Three rules">                           110vw, powder
//      <h3 class="rw-sr">Three rules</h3>
//      <ol class="rw-vals"><li class="rw-val">Word</li> ×3 (13 characters or fewer)</ol>
//      <p class="rw-vals__note">30 words or fewer.</p></article>
//    <div class="rw-relay" data-name="Projects">                                           2-11 cards
//      <article class="rw-card" style="--block: var(--rw-oat)">
//        <figure class="rw-card__photo"><img></figure>                          landscape, subject centred
//        <div class="rw-card__block"><span class="rw-card__year">2018</span><span class="rw-card__place">Antwerp</span>   year and place sit together, top left in the walk, under the name in the column
//          <h3 class="rw-card__name">Name, 14 characters</h3><a class="rw-card__link" href="…">Action</a></div>
//      </article> …</div>
//    <div class="rw-hold" data-name="How we work">                                         the held column
//      <article class="rw-card rw-card--last" style="--block: …"><div class="rw-stack">
//        <figure class="rw-card__photo"><img></figure><div class="rw-card__block">…as above…</div>
//        <figure class="rw-stack__pic"><img></figure><figure class="rw-stack__pic"><img></figure>
//        <a class="rw-stack__all" href="…">All 38 projects</a></div></article>
//      <section class="rw-question"><div class="rw-underlay"></div>
//        <h3 class="rw-q"><span class="rw-line">Line one</span><span class="rw-line">line two</span></h3>
//        <p class="rw-q__body"><span class="rw-rl">line</span> ×4, 40-60 words</p></section></div>
//    <article class="rw-room rw-coral" data-name="Hollin Yard">                            100vw, coral
//      <figure class="rw-window"><div class="rw-window__pan"><div class="rw-flip">
//        <div class="rw-flip__b"><img></div><div class="rw-flip__a"><img></div></div></div></figure>   16:9
//      <p class="rw-cap"><span>Caption one</span><span>Caption two</span></p></article>
//   </div>
//   <div class="rw-ground" data-name="Contact">                       the still stage under the track
//     <div class="rw-exit"><h2 class="rw-exit__title"><span class="rw-line">Bring us</span><span class="rw-line">your site</span></h2>
//       <p class="rw-exit__foot">One line.</p></div></div>
//  </div>
// </section>
// <section id="after" style="background: <the ground colour>">…</section>       continues the ground
//
// The hold is measured from the rooms: 10.5 screens for the full set above with five cards (each extra
// card adds 0.6). Pictures: 14 for the full set, in colour and in one grade (one shoot, or one warm or
// cool cast throughout); give each a srcset whose sizes are what it is drawn at (a card 60vw, a portrait
// 29vw, the coral window 64vw; a 3:2 picture covering the bleed's 67vw x 100vh box is drawn about 94vw
// wide on a 16:10 screen), so nothing is decoded far above or below its size. The photo room's two
// framed pictures are two views of one room, close and wide, or the swap reads as a cut. The close one
// may be the wide picture zoomed (`.rw-flip__a img { scale: 2.3; transform-origin: … }`; each layer
// clips its own picture), but never a crop of the bleed beside it: on a phone the frame overlaps the
// bleed, and the same picture twice reads as a glitch.
//
// Text that is set on one line shrinks to fit its room once the fonts are in (--rw-fit, never above
// 1): the title lines, the photo room's heading, the question lines, the card names and the value
// words. Below these lengths nothing shrinks: title lines 18 characters, photo heading lines 10 and 7
// (the second is indented), question lines 24 and 18, card names 14, value words 9. Longer lines still
// fit; they just get smaller.
//
// ── Options (data-options='{"rate":1.1}') ────────────────────────────────────────────────────────
//   rate    0.8-1.25  screen widths walked per screen of scroll (1.25 since fix-002, which trims the demo's
//                     walk from 11.6 screens toward 8; 1 before)
//   ramp    0.15-0.35 screens the walk takes to start and stop (0.25)
//   open    50-66     width of an open project card, vw (60); the question panel is 100 - open
//   closed  12-18     width of a waiting strip, vw (15)
//   stack   0.5-1.2   screens the walk holds on the column while its photos stack (0.7)
//   swap    0.5-1     screens it holds on the coral room for the photo swap (0.5)
//   rest    0.2-0.6   screens of still closing headline before the page moves on (0.2; 0.3 before fix-002)
//   scrub   true | 0.1-1.5   catch-up in seconds (0.3 when Lenis runs, else 0.6)
//   intro   true      the threshold title rises once when the walk is on screen at load
//
// Walk mode needs a wide landscape screen: (min-width: 900px) and (min-aspect-ratio: 5/4). Narrower
// or portrait screens get the rooms as a vertical column in the same colour order, each with its own
// small scrubbed move (no pin). Letters are the exception: the card names and the question's letters
// rise on a clock of under a second once half of them is on screen, so a name is whole wherever the
// reader stops. Reduced motion and no script get that column finished and still.
(() => {
  const ID = 'room-walk-track';
  const WIDE = '(min-width: 900px) and (min-aspect-ratio: 5/4)';
  const ROOM = { threshold: 80, photo: 90, ink: 90, band: 15, values: 110, coral: 100 };
  const TYPES = Object.keys(ROOM);
  const SLIDE = 17.5;          // vw the held column narrows by when the question opens (--rw-slide in the CSS)
  const EDGE = 0;              // vw of extra exit travel after the coral (6 while it drew a shade; it no longer does)
  const BLOCK = 34, SHUT = 13; // card colour block, open and closed, % of the stage height
  const DRIFT = [-4, 5, -4];   // threshold title lines, vw over the first screen (never past the room's 6vw margin)
  const PHOTO_DRIFT = [[10, -4], [18, -6]];   // photo room heading lines, vw across the room's crossing
  const SHEAR = [[-14, 14], [10, -10], [-22, 22]];  // value words, vw across the room's crossing
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v)) ? clamp(+v, a, b) : d);
  const vw = () => window.innerWidth / 100;

  // ── DOM preparation (idempotent; harmless to the finished composition) ───────────────────────────
  const inner = (el) => {
    if (el.__in) return el.__in;
    const s = document.createElement('span');
    s.className = 'rw-in';
    while (el.firstChild) s.appendChild(el.firstChild);
    el.appendChild(s);
    el.__in = s;
    return s;
  };
  const splitChars = (el) => {
    if (el.__chars) return el.__chars;
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    const out = [];
    el.textContent = '';
    text.split(' ').forEach((w, i, all) => {
      const word = document.createElement('span');
      word.className = 'rw-w';
      word.setAttribute('aria-hidden', 'true');
      for (const ch of w) {
        const c = document.createElement('span');
        c.className = 'rw-ch';
        c.textContent = ch;
        word.appendChild(c);
        out.push(c);
      }
      el.appendChild(word);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.__chars = out;
    return out;
  };
  const prep = (root) => {
    if (root.__rwPrep) return;
    root.__rwPrep = true;
    root.querySelectorAll('.rw-card__name, .rw-q').forEach((h) => h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()));
    root.querySelectorAll('.rw-line, .rw-rl, .rw-card__year, .rw-card__place').forEach(inner);
    root.querySelectorAll('.rw-card__name').forEach((n) => { n.__chars = splitChars(n); });
    root.querySelectorAll('.rw-q .rw-line').forEach((l) => { l.__chars = splitChars(l.__in); });
    // the band word is one run of text, so it sets as one line down the strip (and across it on a phone)
    root.querySelectorAll('.rw-band__col').forEach((c) => {
      const words = c.children.length ? [...c.children].map((k) => k.textContent.trim()) : c.textContent.split(/\s+/);
      c.textContent = words.filter(Boolean).join(' ');
    });
  };
  // A staggered fromTo placed later in a scrubbed timeline only applies its start to the first target,
  // so the start is set on all of them first.
  const stag = (tl, targets, from, to, pos) => {
    if (!targets || !targets.length) return;
    gsap.set(targets, from);
    tl.fromTo(targets, from, to, pos);
  };
  // ── Fit: the lines set on one line at a fixed size (title, question, card names, value words) shrink,
  // never grow, until the longest one fits its room. --rw-fit scales their font-size in the CSS; it is
  // measured after the fonts are in and again on every refresh, so a long line never runs out of its room.
  const textWidth = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.data.trim() ? 1 : 3) });
    const first = w.nextNode();
    if (!first) return 0;
    let last = first;
    for (let n = w.nextNode(); n; n = w.nextNode()) last = n;
    const r = document.createRange();
    r.setStart(first, 0);
    r.setEnd(last, last.data.length);
    return r.getBoundingClientRect().width;
  };
  const pad = (el, side) => parseFloat(getComputedStyle(el)['padding' + side]) || 0;
  const fitTo = (host, pairs) => {
    let k = 1;
    for (const [el, room] of pairs) { const w = textWidth(el); if (w > 0 && room > 0) k = Math.min(k, room / w); }
    if (k < 0.999) host.style.setProperty('--rw-fit', clamp(k, 0.4, 1).toFixed(4));
  };
  const fit = (root) => {
    const hosts = root.querySelectorAll('.rw-h1, .rw-copy h3, .rw-q, .rw-vals, .rw-card__name');
    hosts.forEach((h) => h.style.removeProperty('--rw-fit'));
    const walkMode = root.classList.contains('rw-walk');
    if (!root.classList.contains('is-live') || (!walkMode && !root.classList.contains('rw-v'))) return;
    const u = vw();
    const q = root.querySelector('.rw-q');
    if (q) fitTo(q, [...q.querySelectorAll('.rw-line')].map((l) => [l, q.clientWidth - pad(l, 'Left')]));
    const vals = root.querySelector('.rw-vals');
    // the words shear by up to 22vw (walk) or 10vw (column) and must stay inside their room
    if (vals) fitTo(vals, [...vals.querySelectorAll('.rw-val')].map((v) => [v, walkMode ? 48 * u : vals.clientWidth - 10 * u]));
    const h1 = root.querySelector('.rw-h1'), thr = root.querySelector('.rw-threshold');
    // in the walk the title lines drift by up to 8vw and stay clear of the photo sliver
    if (h1 && thr) fitTo(h1, [...h1.querySelectorAll('.rw-line')].map((l) => [l, walkMode ? thr.clientWidth - 16 * u : h1.clientWidth]));
    if (!walkMode) return;
    // the photo room's heading: each line inside the paper column beside the picture
    const ch = root.querySelector('.rw-copy h3');
    if (ch) fitTo(ch, [...ch.querySelectorAll('.rw-line')].map((l) => [l, ch.clientWidth - pad(l, 'Left')]));
    root.querySelectorAll('.rw-card__name').forEach((n) => {
      const b = n.closest('.rw-card__block');
      if (b) fitTo(n, [[n, b.clientWidth - pad(b, 'Left') - pad(b, 'Right')]]);
    });
  };

  // A photo swap inside a frame: the top picture slides up and out, the one under it settles down.
  const swap = (tl, flip, pos, dur, extra = {}) => {
    const a = flip.querySelector('.rw-flip__a'), b = flip.querySelector('.rw-flip__b');
    if (a) tl.fromTo(a, { yPercent: 0 }, { ...extra, yPercent: -105, ease: 'power2.inOut', duration: dur }, pos);
    if (b) tl.fromTo(b, { yPercent: -10 }, { ...extra, yPercent: 0, ease: 'power2.out', duration: dur }, pos);
  };

  // ── The plan: rooms, their end-state left edges (vw), and the walk in screens of scroll ───────────
  // Every card is laid out open; while it waits it is a strip because the next card overlaps it. So
  // the left edges never change, and timing follows one rule: a room whose left edge is L reaches
  // screen position p (vw) when the walk's x is p - L.
  const plan = (root, o) => {
    const track = root.querySelector('.rw-track');
    const O = o.open, V = 100 * o.rate;
    const segs = [], cards = [], chapters = [];
    let L = 0;
    const name = (el, at) => { if (el.dataset.name) chapters.push({ name: el.dataset.name, el, L: at }); };
    for (const el of track ? [...track.children] : []) {
      if (el.classList.contains('rw-relay')) {
        const first = L;
        for (const c of el.children) {
          if (!c.classList.contains('rw-card')) continue;
          const sg = { type: 'card', el: c, L, w: O };
          segs.push(sg); cards.push(sg); L += O;
        }
        if (L > first) name(el, first);
        continue;
      }
      if (el.classList.contains('rw-hold')) {
        const card = el.querySelector(':scope > .rw-card'), qn = el.querySelector(':scope > .rw-question');
        const w = (card ? O : 0) + (qn ? 100 - O : 0);
        if (!w) continue;
        segs.push({ type: 'hold', el, card, qn, L, w });
        if (card) cards.push({ type: 'card', el: card, L, w: O, inHold: true });
        name(el, L);
        L += w;
        continue;
      }
      const t = TYPES.find((k) => el.classList.contains('rw-' + k));
      if (!t) continue;
      segs.push({ type: t, el, L, w: ROOM[t] });
      name(el, L);
      L += ROOM[t];
    }
    const end = L;
    const hold = segs.find((s) => s.type === 'hold');
    const coral = segs.find((s) => s.type === 'coral' && (!hold || s.L >= hold.L + hold.w));

    // the walk: ramps that match the walking speed at their joints, linear in between, and holds
    const keys = [];
    let s = 0, x = 0;
    const go = (to) => {
      const D = x - to;
      if (D <= 0.01) return;
      const rd = Math.min((V * o.ramp) / 2, D / 2), r = (2 * rd) / V, lin = (D - 2 * rd) / V;
      keys.push({ s, x0: x, x1: to, rd, r, lin });
      s += 2 * r + lin;
      x = to;
    };
    const stops = {};
    if (hold) { go(-hold.L); stops.hold = s; s += o.stack; stops.holdEnd = s; }
    if (coral) { stops.coralIn = s; go(-coral.L); stops.coral = s; s += o.swap; stops.coralEnd = s; }
    stops.exitIn = s;
    go(-(end + (coral ? EDGE : 0)));
    stops.exit = s;
    s += o.rest;
    const T = Math.max(s, 1);

    const xAt = (t) => {
      let xv = 0;
      for (const k of keys) {
        if (t <= k.s) return k.x0;
        const dt = t - k.s;
        if (dt < k.r) return k.x0 - k.rd * (dt / k.r) ** 2;
        if (dt < k.r + k.lin) return k.x0 - k.rd - V * (dt - k.r);
        if (dt < 2 * k.r + k.lin) { const u = (2 * k.r + k.lin - dt) / k.r; return k.x1 + k.rd * u * u; }
        xv = k.x1;
      }
      return xv;
    };
    // first moment the walk's x reaches xv (it only ever decreases)
    const sAtX = (xv) => {
      if (xv >= 0) return 0;
      let lo = 0, hi = T;
      for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; if (xAt(m) > xv) lo = m; else hi = m; }
      return hi;
    };
    if (coral) stops.coralIn = hold ? stops.holdEnd : sAtX(100 - coral.L);
    // a chapter starts when its room's left edge passes the middle of the screen
    for (const c of chapters) c.s = sAtX(50 - c.L);
    const ground = root.querySelector('.rw-ground');
    if (ground && ground.dataset.name) chapters.push({ name: ground.dataset.name, el: ground, L: end, s: sAtX(50 - end) });
    chapters.sort((a, b) => a.s - b.s);
    if (chapters.length) chapters[0].s = 0;
    return { segs, cards, hold, coral, end, keys, T, stops, chapters, xAt, sAtX, open: O };
  };

  // ── Walk mode: the pinned sideways walk ──────────────────────────────────────────────────────────
  const walk = (tl, ctx, o) => {
    const { root, stage } = ctx;
    // Everything that moves for long has its own layer in the CSS (will-change). The small things the
    // walk moves (letters, lines, captions) stay 2D, so starting and ending their tweens never creates
    // and drops layers mid-walk; they repaint inside their room's layer instead. F() marks the tweens on
    // elements; the walk's proxies ({ x }, { v }) are plain objects, which have no force3D.
    const F = (v) => ({ force3D: false, ...v });
    root.__rwTl = tl;
    prep(root);
    root.classList.remove('rw-v');
    root.classList.add('rw-walk');
    root.style.setProperty('--rw-open', o.open + 'vw');
    const P = plan(root, o);
    const { T, sAtX, stops } = P;
    const O = o.open, GAP = o.open - o.closed;
    const at = (s) => clamp(s, 0, T) / T;
    const dd = (s) => Math.max(s, 0.001) / T;
    const sAt = (sg, p) => sAtX(p - sg.L);
    const vh = () => stage.clientHeight / 100;
    const seg = (type) => P.segs.find((s) => s.type === type);
    // A block of words set inside a room shows only while every word of it is wholly on screen (its ink,
    // measured where it is drawn, moving lines included, 1vw clear of both edges), and arrives on a 0.3s
    // clock and leaves on a 0.2s one: a sideways walk never shows words cut by the screen's edge, and a stopped scroll never
    // shows them half faded. (Before fix-006 the fade was scrubbed at fixed points, which let the photo
    // room's drifting heading and the threshold title meet the edge first, and stood half faded at a stop.)
    // `from`: not before this moment of the walk.
    const edged = [];
    const edgeFade = (el, sg, from = 0) => {
      if (!el) return;
      gsap.set(el, { autoAlpha: 0 });
      const tw = gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.inOut', paused: true, immediateRender: false });
      edged.push({ el, sg, from, tw, on: null });
    };
    // the words' own ink (their text, not the boxes of the lines that carry them), where it is drawn now
    const inkBox = (b, rg) => {
      if (!b.nodes) {
        const w = document.createTreeWalker(b.el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.data.trim() ? 1 : 3) });
        b.nodes = [];
        for (let n = w.nextNode(); n; n = w.nextNode()) b.nodes.push(n);
      }
      let l = Infinity, r = -Infinity;
      for (const n of b.nodes) {
        rg.selectNodeContents(n);
        const rc = rg.getBoundingClientRect();
        if (rc.width > 0) { l = Math.min(l, rc.left); r = Math.max(r, rc.right); }
      }
      return { left: l, right: r, width: r > l ? r - l : 0 };
    };
    const track = root.querySelector('.rw-track');

    // Pictures far to the right of a transformed track are not reliably lazy-loaded: load them all now,
    // in walk order, so each has decoded long before it arrives.
    root.querySelectorAll('img').forEach((img) => {
      if (img.loading === 'lazy') img.loading = 'eager';
      if (img.decode) img.decode().catch(() => {});
    });

    // the walk itself is a proxy in vw; place() writes it (and the relay) to the DOM in whole pixels
    const st = { x: 0 };
    for (const k of P.keys) {
      const a = k.x0 - k.rd, b = k.x1 + k.rd;
      tl.fromTo(st, { x: k.x0 }, { x: a, ease: 'power1.in', duration: dd(k.r), immediateRender: false }, at(k.s));
      if (k.lin > 0) tl.fromTo(st, { x: a }, { x: b, ease: 'none', duration: dd(k.lin), immediateRender: false }, at(k.s + k.r));
      tl.fromTo(st, { x: b }, { x: k.x1, ease: 'power1.out', duration: dd(k.r), immediateRender: false }, at(k.s + k.r + k.lin));
    }

    // threshold: the title lines drift apart as the walk starts
    const thr = seg('threshold');
    let titleLines = [];
    if (thr) {
      titleLines = [...thr.el.querySelectorAll('.rw-h1 .rw-line')];
      const s1 = sAt(thr, -77.5);
      titleLines.forEach((ln, i) => tl.fromTo(ln, { x: 0 }, F({ x: () => DRIFT[i % 3] * vw(), duration: dd(s1) }), 0));
      // the title and the lede leave before the screen's left edge reaches them (they were sliced,
      // "oms that let / e city slow down", as the room left)
      edgeFade(thr.el.querySelector('.rw-h1'), thr);
      edgeFade(thr.el.querySelector('.rw-lede'), thr);
    }

    // photo room: counter-parallax in the bleed; the heading's lines rise as the room comes in and
    // travel slower than the walk, the indented one slowest, so they arrive behind the room and meet
    // their places just as it reaches the reading position; the framed pair swaps
    const ph = seg('photo');
    if (ph) {
      const img = ph.el.querySelector('.rw-bleed img');
      const s0 = sAt(ph, 100), s1 = sAt(ph, -7.5);
      if (img) tl.fromTo(img, { x: () => -15 * vw() }, F({ x: 0, duration: dd(s1 - s0) }), at(s0));
      const lines = [...ph.el.querySelectorAll('.rw-copy h3 .rw-line')];
      const d0 = sAt(ph, 70), d1 = sAt(ph, -50);
      lines.forEach((ln, i) => {
        const [a, b] = PHOTO_DRIFT[i % 2];
        tl.fromTo(ln, { x: () => a * vw() }, F({ x: () => b * vw(), duration: dd(d1 - d0) }), at(d0));
      });
      stag(tl, lines.map((l) => l.__in).filter(Boolean), { yPercent: 110 }, F({ yPercent: 0, ease: 'power2.out', duration: dd(0.26), stagger: dd(0.08) }), at(sAt(ph, 46)));
      const fl = ph.el.querySelector('.rw-flip');
      if (fl) swap(tl, fl, at(sAt(ph, 17.5)), dd(0.55), F({}));
      // the copy (57-87vw of the room, its heading lines drifting) shows only while the whole of it is on
      // screen: never cut by an edge, and gone before its drifting heading reaches the left edge
      edgeFade(ph.el.querySelector('.rw-copy'), ph);
    }

    // ink room: two portraits open from the bottom, then the statement brightens line by line
    const ink = seg('ink');
    if (ink) {
      const reveal = (fig, s) => {
        if (!fig) return;
        tl.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', duration: dd(0.4) }, at(s));
        const im = fig.querySelector('img');
        if (im) tl.fromTo(im, { scale: 1.25 }, F({ scale: 1, ease: 'power2.out', duration: dd(0.4) }), at(s));
      };
      reveal(ink.el.querySelector('.rw-pic--a'), sAt(ink, 97.5));
      reveal(ink.el.querySelector('.rw-pic--b'), sAt(ink, 82.5));
      // the statement brightens from 40%, never fainter, so the lines still to come stay readable
      stag(tl, [...ink.el.querySelectorAll('.rw-read .rw-rl')], { opacity: 0.4 }, { opacity: 1, duration: dd(0.2), stagger: dd(0.075) }, at(sAt(ink, 40)));
      // the statement (49-85vw of the room) shows only while the whole of it is on screen
      edgeFade(ink.el.querySelector('.rw-read'), ink);
    }

    // band: the vertical word climbs while the walk runs left
    const band = seg('band');
    if (band) {
      const col = band.el.querySelector('.rw-band__col');
      const s0 = sAt(band, 95), s1 = sAt(band, -15);
      if (col) tl.fromTo(col, { y: () => 75 * vh() }, F({ y: 0, duration: dd(s1 - s0) }), at(s0));
    }

    // values: three words shear across the room's whole crossing and line up flush-left halfway
    const val = seg('values');
    if (val) {
      const s0 = sAt(val, 100), s1 = sAt(val, -110);
      // each word rides inside the powder room and shows only while the whole word is on screen: it fades
      // in once its right edge is in and out before its left edge meets the screen's edge, on a clock (they
      // were cut mid-word, "Da", "Patie", "Weigh", at 20-31% of the walk)
      val.el.querySelectorAll('.rw-val').forEach((w, i) => {
        const [a, b] = SHEAR[i % 3];
        tl.fromTo(w, { x: () => a * vw() }, F({ x: () => b * vw(), duration: dd(s1 - s0) }), at(s0));
        edgeFade(w, val);
      });
      // the note: on the same clock, while it is wholly on screen (it was scrubbed in and caught half faded)
      edgeFade(val.el.querySelector('.rw-vals__note'), val);
    }

    // relay: each card opens while its left edge walks from 80vw to 80 - open; the strip waiting to its
    // right creeps at closed/open of the walking speed, then opens in turn
    const IMG0 = (-GAP / (2 * O)) * 100, BLK0 = ((BLOCK - SHUT) / BLOCK) * 100;
    const cards = P.cards.map((c) => {
      const img = c.el.querySelector('.rw-card__photo img'), block = c.el.querySelector('.rw-card__block');
      return { ...c, e: { v: 0 }, setX: c.inHold ? null : gsap.quickSetter(c.el, 'x', 'px'), imgX: img ? gsap.quickSetter(img, 'xPercent') : null, blockY: block ? gsap.quickSetter(block, 'yPercent') : null };
    });
    // A card's words never ride the scroll: keyed to it, a name stood half-drawn ("Kad", "Chapel Libr")
    // wherever the reader stopped, half under the strip still covering it. They play on a clock of under a
    // second once the card is three quarters open (its whole name uncovered), and drop back below that.
    cards.forEach((c) => {
      const ws = sAtX(80 - c.L), we = Math.max(sAtX(80 - O - c.L), ws + 0.05), u = we - ws;
      c.ws = ws; c.we = we; c.on = false; c.at = ws + 0.65 * u;
      tl.fromTo(c.e, { v: 0 }, { v: 1, ease: 'power1.inOut', duration: dd(u), immediateRender: false }, at(ws));
      const words = gsap.timeline({ paused: true });
      const yp = [...c.el.querySelectorAll('.rw-card__year > .rw-in, .rw-card__place > .rw-in')];
      stag(words, yp, { yPercent: 105, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.35 }), 0);
      const nm = c.el.querySelector('.rw-card__name');
      stag(words, (nm && nm.__chars) || [], { yPercent: 110, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.35, stagger: { amount: 0.25 } }), 0.1);
      const link = c.el.querySelector('.rw-card__link');
      if (link) stag(words, [link], { yPercent: 100, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.3 }), 0.4);
      c.words = words;
    });

    // hold: a paper underlay narrows the column, the question builds, the column's photos stack up.
    // The question starts while the panel is still arriving, so it never stands as a large empty field.
    const H = P.hold;
    if (H) {
      const sA = stops.hold;
      const under = H.el.querySelector('.rw-underlay');
      // the underlay covers the column's edge first, so the headline that reaches over it never sits on a
      // photo; it slides while the last card opens, so the column grows straight to its held width
      if (under && H.card && H.qn) tl.fromTo(under, { x: 0 }, F({ x: () => -SLIDE * vw(), ease: 'power1.inOut', duration: dd(0.3) }), at(sA - 0.75));
      // every line rises out of its own mask (a line dropping from above would hang its first strokes under
      // the descenders of the line over it), on a clock once the whole panel is in, never half-drawn at a stop
      // and never cut by the screen edge;
      // the lines of the body follow
      const qch = [...H.el.querySelectorAll('.rw-q .rw-line')].flatMap((ln) => ln.__chars || []);
      const qWords = gsap.timeline({ paused: true });
      stag(qWords, qch, { yPercent: 110, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power3.out', duration: 0.4, stagger: { amount: 0.4 } }), 0);
      const qBody = [...H.el.querySelectorAll('.rw-q__body .rw-rl > .rw-in')];
      stag(qWords, qBody, { yPercent: 100, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.4, stagger: 0.06 }), 0.35);
      H.words = qWords; H.on = false; H.at = sA - 0.04;   // once the whole panel is on screen
      // the question leaves before the coral sheet's edge reaches it, so no line is ever cut mid-word
      const qText = [H.el.querySelector('.rw-q'), H.el.querySelector('.rw-q__body')].filter(Boolean);
      if (qText.length) tl.fromTo(qText, { opacity: 1 }, { opacity: 0, ease: 'power1.in', duration: dd(0.08), immediateRender: false }, at(stops.holdEnd - 0.1));
      const stack = H.el.querySelector('.rw-stack');
      if (stack) {
        // two lifts that share the held stretch (0.3 + 0.25 of the default 0.7), so the column is at
        // rest before the coral starts to slide in, whatever the stack option
        const lift = () => Math.max(0, stack.offsetHeight - stage.clientHeight);
        const l1 = 0.43 * o.stack, l2 = 0.36 * o.stack;
        tl.fromTo(stack, { y: 0 }, F({ y: () => -lift() / 2, ease: 'power1.inOut', duration: dd(l1) }), at(sA));
        tl.fromTo(stack, { y: () => -lift() / 2 }, F({ y: () => -lift(), ease: 'power1.inOut', duration: dd(l2), immediateRender: false }), at(sA + l1));
        const pics = [...stack.querySelectorAll('.rw-stack__pic img')];
        if (pics.length) tl.fromTo(pics, { scale: 1.15 }, F({ scale: 1, duration: dd(l1 + l2) }), at(sA));
      }
    }

    // coral: slides over the still column with its picture panning in, holds for a swap, then leaves
    const K = P.coral;
    if (K) {
      const sIn = stops.coralIn, sC = stops.coral;
      const pan = K.el.querySelector('.rw-window__pan');
      if (pan) tl.fromTo(pan, { xPercent: -100 }, F({ xPercent: 0, duration: dd(sC - sIn) }), at(sIn));
      const caps = [...K.el.querySelectorAll('.rw-cap > span')];
      if (caps[0]) tl.fromTo(caps[0], { yPercent: 105, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power2.out', duration: dd(0.25) }), at(sC - 0.25));
      const fl = K.el.querySelector('.rw-flip');
      if (fl) swap(tl, fl, at(sC + 0.05), dd(0.35), F({}));
      if (caps[0] && caps[1]) {
        tl.fromTo(caps[0], { yPercent: 0, opacity: 1 }, F({ yPercent: -105, opacity: 0, ease: 'power2.inOut', duration: dd(0.35), immediateRender: false }), at(sC + 0.05));
        tl.fromTo(caps[1], { yPercent: 105, opacity: 0 }, F({ yPercent: 0, opacity: 1, ease: 'power2.inOut', duration: dd(0.35) }), at(sC + 0.05));
      }
      // the caption leaves before the screen's left edge reaches it as the room pulls away (it stood 3px
      // from the edge at 89% of the walk)
      edgeFade(K.el.querySelector('.rw-cap'), K);
    }

    // exit: the still stage settles as the last room pulls away
    const exit = root.querySelector('.rw-exit');
    if (exit) tl.fromTo(exit, { x: () => 6 * vw(), scale: 1.04 }, F({ x: 0, scale: 1, ease: 'power2.out', duration: dd(stops.exit - stops.exitIn) }), at(stops.exitIn));
    // the closing headline lies under the whole walk. It shows on a 0.4s clock, and only once every room
    // is 8px clear of its words (the last room's trailing edge cut "Bring us your site" to "g us / r site"
    // when it was shown as soon as that room started to pull away); place() plays it and drops it back
    const exitB = exit ? { el: exit, on: null, from: Math.max(0, stops.exitIn - 0.02) } : null;
    if (exitB) {
      gsap.set(exit, { autoAlpha: 0 });
      exitB.tw = gsap.fromTo(exit, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power1.inOut', paused: true, immediateRender: false });
    }
    // the chips belong to the walk: they leave during the closing rest instead of riding up into the next
    // section. The chips fade, not their full-stage wrapper, so nothing that moves lies over the rooms.
    const chips = [...root.querySelectorAll('.rw-chrome > .rw-chip:not(.rw-where)')];
    const fade = Math.min(0.15, o.rest * 0.6);
    if (chips.length) tl.fromTo(chips, { autoAlpha: 1 }, { autoAlpha: 0, duration: dd(fade) }, at(T - fade));

    // ── place(): the walk, the relay and the chrome, in whole pixels, once per render ──
    const setTrack = gsap.quickSetter(track, 'x', 'px');
    const firstCard = P.segs.findIndex((s) => s.type === 'card' || s.type === 'hold');
    P.segs.forEach((sg, i) => { if (firstCard > -1 && i > firstCard && sg.type !== 'card' && sg.type !== 'hold') sg.set = gsap.quickSetter(sg.el, 'x', 'px'); });
    const setHold = H ? gsap.quickSetter(H.el, 'x', 'px') : null;
    const setQ = H && H.qn ? gsap.quickSetter(H.qn, 'x', 'px') : null;
    // zero-time sets record the untouched inline styles, so reverting the scene (reduced motion turned
    // on, the window made narrow) also clears everything place() writes
    const slid = [track, ...P.segs.filter((s) => s.set).map((s) => s.el), ...cards.filter((c) => c.setX).map((c) => c.el), H && H.el, H && H.qn].filter(Boolean);
    tl.set(slid, F({ x: 0 }), 0);
    const imgs = cards.map((c) => c.el.querySelector('.rw-card__photo img')).filter(Boolean);
    const blocks = cards.map((c) => c.el.querySelector('.rw-card__block')).filter(Boolean);
    if (imgs.length) tl.set(imgs, F({ xPercent: 0 }), 0);
    if (blocks.length) tl.set(blocks, F({ yPercent: 0 }), 0);
    const paint = (c) => { const k = 1 - c.e.v; if (c.imgX) c.imgX(IMG0 * k); if (c.blockY) c.blockY(BLK0 * k); };

    // The "where" chip (room name, "n of 8" and a filling bar) was a counter and a progress readout: it is
    // no longer written, and the CSS hides it on pages that still carry it. What place() does instead at
    // every update: play or drop back the words that run on a clock (each card's, the question's).
    const clocked = [...cards, H].filter((c) => c && c.words);
    // The held column's own card rides up with the stack towards the chips at the top of the screen: its
    // words drop back (in about 0.4s) while its block is still a sixth of the screen below the chips, and
    // come back when the stack comes down. They were drawn under the wordmark ("Varde" over "2024").
    const held = cards.find((c) => c.inHold && c.words);
    const heldBlock = held && held.el.querySelector('.rw-card__block');
    // Only a chip at the top that lies over the block counts: the "Skip the walk" chip at the foot is
    // never over it (counted, it kept the held card blank on desktop).
    const clearOfChips = () => {
      if (!heldBlock || !chips.length) return true;
      const b = heldBlock.getBoundingClientRect();
      let floor = 0;
      for (const ch of chips) {
        const r = ch.getBoundingClientRect();
        if (r.height && r.top < stage.clientHeight / 2 && r.left < b.right && r.right > b.left) floor = Math.max(floor, r.bottom);
      }
      return !floor || b.top >= floor + stage.clientHeight / 6;
    };
    const chrome = (s) => {
      for (const c of clocked) {
        const on = s >= c.at && (c !== held || clearOfChips());
        if (on === c.on) continue;
        c.on = on;
        if (on) c.words.timeScale(1).play(); else c.words.timeScale(c === held ? 2 : 1).reverse();
      }
    };

    // the blocks of words that show only while wholly on screen: read where they are drawn now (a room off
    // the screen is not read), then play or drop back their clocks; the first reading of a build jumps
    const rg = document.createRange();
    // (1vw clear of each edge, and out in 0.2s, so a stop just past the point still ends on the block whole
    // and gone; a wider margin cost the value room words it keeps whole at the 23% and 29% steps)
    const edges = (s) => {
      const Wpx = window.innerWidth, m = Wpx / 100;
      for (const b of edged) {
        let on = false;
        if (!b.sg.off && s >= b.from) { const r = inkBox(b, rg); on = r.width > 0 && r.left >= m && r.right <= Wpx - m; }
        if (on === b.on) continue;
        const first = b.on === null;
        b.on = on;
        if (first) b.tw.progress(on ? 1 : 0).pause();
        else if (on) b.tw.timeScale(1).play(); else b.tw.timeScale(1.5).reverse();
      }
      // the closing headline: shown once the trailing edge of every room on screen is 8px left of its words
      if (exitB) {
        let on = false;
        if (s >= exitB.from) {
          const r = inkBox(exitB, rg);
          let right = -Infinity;
          for (const sg of P.segs) if (!sg.off) right = Math.max(right, sg.el.getBoundingClientRect().right);
          on = r.width > 0 && r.left >= right + 8;
        }
        if (on !== exitB.on) {
          const first = exitB.on === null;
          exitB.on = on;
          if (first) exitB.tw.progress(on ? 1 : 0).pause();
          else if (on) exitB.tw.timeScale(1).play(); else exitB.tw.timeScale(1.5).reverse();
        }
      }
    };

    const ground = root.querySelector('.rw-ground');
    const place = () => {
      if (root.__rwPlace !== place || !root.classList.contains('is-live')) return;
      const u = vw();
      const tpx = Math.round(st.x * u);
      setTrack(tpx);
      let un = 0, ci = 0, centre = null;
      // the room across the middle of the screen (the last one wins: later rooms lie on top)
      const over = (sg, shift, el) => {
        const l = sg.L + st.x + shift;
        if (l <= 50 && l + sg.w > 50) centre = el;
        // a room wholly off the screen is hidden, words and all, so nothing reads it as words cut by the edge
        const off = l >= 100.5 || l + sg.w <= -0.5;
        if (off !== sg.off) { sg.off = off; sg.el.style.visibility = off ? 'hidden' : ''; }
      };
      for (const sg of P.segs) {
        if (sg.type === 'card') {
          const c = cards[ci++];
          c.setX(Math.round(-GAP * un * u));
          paint(c);
          over(sg, -GAP * un, sg.el);
          un += 1 - c.e.v;
        } else if (sg.type === 'hold') {
          // while the coral slides over it, the column moves against the walk, so it stays pixel-still
          const mirror = K ? clamp(Math.round(-sg.L * u) - tpx, 0, Math.round(K.w * u)) : 0;
          setHold(Math.round(-GAP * un * u) + mirror);
          over(sg, -GAP * un + mirror / u, sg.card && sg.L + st.x - GAP * un + mirror / u + O > 50 ? sg.card : sg.qn || sg.el);
          if (sg.card) {
            const c = cards[ci++];
            paint(c);
            const left = 1 - c.e.v;
            if (setQ) setQ(Math.round(-GAP * left * u));
            un += left;
          }
        } else {
          if (sg.set) sg.set(Math.round(-GAP * un * u));
          over(sg, sg.set ? -GAP * un : 0, sg.el);
        }
      }
      root.__rwRoom = centre || ground;
      chrome(tl.time() * T);
      edges(tl.time() * T);
    };
    root.__rwPlace = place;
    root.__rwPlan = P;
    tl.eventCallback('onUpdate', place);
    fit(root);
    place();
    intro(root, titleLines, o);
  };

  // The threshold title rises once, only when the walk is the first thing on screen at load.
  const intro = (root, lines, o) => {
    if (!o.intro || root.__rwIntro || !lines.length) return;
    root.__rwIntro = true;
    const r = root.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.35 || r.top < -window.innerHeight * 0.05) return;
    gsap.fromTo(lines.map((l) => l.__in).filter(Boolean), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.1 });
  };

  // ── Column mode: phones, portrait and narrow screens. No pin, no sideways travel. ────────────────
  const vertical = (tl, ctx) => {
    const { root, q } = ctx;
    prep(root);
    root.classList.remove('rw-walk');
    root.classList.add('rw-v');
    root.querySelectorAll('.rw-track > *, .rw-relay > .rw-card').forEach((el) => { el.style.visibility = ''; });
    root.__rwPlace = null;
    const S = (trigger, start, end) => gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger, start, end, scrub: 0.4, invalidateOnRefresh: true } });
    // Letters never ride the scroll here: a name keyed to the scroll stands half-drawn wherever the reader
    // stops ("O  e"), which the inspector fails (letters-mid-reveal). They play on a clock of under a
    // second once half of `el` is on screen, and drop back when it goes below the screen again.
    const C = (el) => gsap.timeline({ scrollTrigger: { trigger: el, start: () => `top bottom-=${Math.round(el.offsetHeight / 2)}`, toggleActions: 'play none none reverse', invalidateOnRefresh: true } });
    const one = (sel) => root.querySelector(sel);
    fit(root);

    // the title is read at rest, then its lines shear apart as it leaves the top of the screen
    const h1 = one('.rw-h1');
    if (h1) {
      const t = S(h1, 'top 30%', 'bottom top');
      h1.querySelectorAll('.rw-line').forEach((ln, i) => t.fromTo(ln, { x: 0 }, { x: () => [-7, 9, -12][i % 3] * vw() }, 0));
    }
    const bleed = one('.rw-bleed img');
    if (bleed) S(bleed.parentElement, 'top bottom', 'bottom top').fromTo(bleed, { yPercent: -8 }, { yPercent: 0 });
    const flip = one('.rw-photo .rw-flip');
    if (flip) swap(S(flip, 'top 80%', 'top 35%'), flip, 0, 1);

    // the two portraits open from the bottom as they come up, the second a little after the first
    q('.rw-pic').forEach((fig) => {
      const t = S(fig, 'top 98%', 'top 52%');
      t.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out' }, 0);
      const im = fig.querySelector('img');
      if (im) t.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'power2.out' }, 0);
    });
    const read = one('.rw-read');
    if (read) stag(S(read, 'top 88%', 'top 45%'), [...read.querySelectorAll('.rw-rl')], { opacity: 0.4 }, { opacity: 1, duration: 0.5, stagger: 0.12 }, 0);

    const band = one('.rw-band'), col = one('.rw-band__col');
    if (band && col) S(band, 'top bottom', 'bottom top').fromTo(col, { xPercent: 0 }, { xPercent: -50 });

    const vals = q('.rw-val');
    if (vals.length) {
      const t = S(one('.rw-values'), 'top bottom', 'bottom top');
      const VX = [[6, -6], [-4, 4], [10, -10]];
      vals.forEach((v, i) => { const [a, b] = VX[i % 3]; t.fromTo(v, { x: () => a * vw() }, { x: () => b * vw() }, 0); });
    }

    for (const card of q('.rw-card')) {
      const ph = card.querySelector('.rw-card__photo'), img = ph && ph.querySelector('img');
      if (ph) {
        const t = S(ph, 'top bottom', 'top 30%');
        t.fromTo(ph, { clipPath: 'inset(0% 0% 32% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0);
        if (img) t.fromTo(img, { scale: 1.2 }, { scale: 1 }, 0);
      }
      const blk = card.querySelector('.rw-card__block');
      if (!blk) continue;
      // the name's letters, then the year and place under it, then the link, in 0.75s once half the name
      // is on screen
      const nm = blk.querySelector('.rw-card__name');
      const t = C(nm || blk);
      if (nm && nm.__chars) stag(t, nm.__chars, { yPercent: 110 }, { yPercent: 0, duration: 0.35, ease: 'power3.out', stagger: { amount: 0.25 } }, 0);
      const yp = blk.querySelectorAll('.rw-card__year > .rw-in, .rw-card__place > .rw-in');
      if (yp.length) t.fromTo(yp, { yPercent: 105 }, { yPercent: 0, duration: 0.35, ease: 'power3.out' }, 0.2);
      const link = blk.querySelector('.rw-card__link');
      if (link) t.fromTo(link, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.45);
    }

    // every line rises from below, as in the walk, its letters in 0.85s once half the question is on screen
    // They do not drop back while the question is still on screen: they reset at once when the whole question
    // has gone below the screen again, out of sight, so no moment (a reader scrolling back up, a tool that
    // jumps to the top and measures) catches the letters half dropped, at three heights across two lines.
    const qh = one('.rw-q');
    if (qh) {
      const qch = [...qh.querySelectorAll('.rw-line')].flatMap((ln) => ln.__chars || []);
      if (qch.length) {
        const t = gsap.timeline({ scrollTrigger: { trigger: qh, start: () => `top bottom-=${Math.round(qh.offsetHeight / 2)}`, toggleActions: 'play none none none', invalidateOnRefresh: true } });
        stag(t, qch, { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: 'power3.out', stagger: { amount: 0.4 } }, 0);
        ScrollTrigger.create({ trigger: qh, start: 'top bottom', onLeaveBack: () => t.progress(0).pause() });
      }
    }

    const win = one('.rw-window');
    if (win) {
      // the window opens out of the coral as it arrives, then frames the swap
      const pan = win.querySelector('.rw-window__pan');
      const o = S(win, 'top bottom', 'center 72%');
      o.fromTo(win, { clipPath: 'inset(14% 12% 14% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out' }, 0);
      if (pan) o.fromTo(pan, { scale: 1.18 }, { scale: 1, ease: 'power2.out' }, 0);
      const fl = win.querySelector('.rw-flip');
      if (fl) swap(S(win, 'center 70%', 'center 40%'), fl, 0, 1);
      // the captions trade places over a shorter stretch than the pictures, so a reader who stops while
      // the pictures are still sliding never meets two half-hidden lines
      const caps = [...root.querySelectorAll('.rw-cap > span')];
      if (caps[1]) {
        const c = S(win, 'center 70%', 'center 58%');
        c.fromTo(caps[0], { yPercent: 0 }, { yPercent: -105, duration: 1 }, 0);
        c.fromTo(caps[1], { yPercent: 105 }, { yPercent: 0, duration: 1 }, 0);
      }
    }

    const exit = one('.rw-exit__title');
    if (exit) stag(S(exit, 'top 94%', 'top 64%'), [...exit.querySelectorAll('.rw-line > .rw-in')], { yPercent: 100 }, { yPercent: 0, stagger: 0.15 }, 0);

    // the section's height just changed from the pinned length to the column's own
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  // ── Focus: a link inside a room that is off to the side scrolls the walk to that room ────────────
  const focusTime = (P, el) => {
    if (el.closest('.rw-ground')) return P.T;
    // the column's lower photos and its tile are on screen once the stack has lifted, before the coral comes
    if (el.closest('.rw-stack') && !el.closest('.rw-stack > .rw-card__block, .rw-stack > .rw-card__photo')) return P.stops.holdEnd - 0.05;
    const card = el.closest('.rw-card');
    if (card) { const c = P.cards.find((k) => k.el === card); if (c) return P.sAtX(80 - P.open - c.L) + 0.05; }
    if (el.closest('.rw-question')) return P.stops.holdEnd - 0.05;
    if (el.closest('.rw-coral')) return P.stops.coral + 0.3;
    const sg = P.segs.find((s) => s.el.contains(el));
    return sg ? P.sAtX(6 - sg.L) : null;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    if (!root || !window.Stage) return null;
    const o = {
      rate: num(opts.rate, 1.25, 0.8, 1.25),
      ramp: num(opts.ramp, 0.25, 0.15, 0.35),
      open: num(opts.open, 60, 50, 66),
      closed: num(opts.closed, 15, 12, 18),
      stack: num(opts.stack, 0.7, 0.5, 1.2),
      swap: num(opts.swap, 0.5, 0.5, 1),
      rest: num(opts.rest, 0.2, 0.2, 0.6),
      scrub: opts.scrub === true ? true : num(opts.scrub, Stage.lenis ? 0.3 : 0.6, 0.1, 1.5),
      intro: opts.intro !== false,
    };
    const mqWide = window.matchMedia(WIDE);
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqPhone = window.matchMedia('(max-width: 767px)');
    let mm = null;
    const make = () => {
      if (mm) mm.revert();
      const P = plan(root, o);
      mm = Stage.scene(root, {
        hold: +P.T.toFixed(3),
        scrub: o.scrub,
        build: (tl, ctx) => (mqWide.matches ? walk(tl, ctx, o) : vertical(tl, ctx)),
        phone: { hold: 1, build: (tl, ctx) => vertical(tl, ctx) },
      });
    };
    make();
    if (!Stage.live) return null;

    // Leaving the walk (reduced motion turned on, a narrow or portrait window): reverting the timeline
    // renders it once more while the scene is still live, so the pixel offsets place() wrote are cleared
    // here, after the stage has finished switching.
    const settle = () => {
      if (root.classList.contains('is-live') && root.classList.contains('rw-walk')) return;
      root.__rwPlace = null;
      const P = root.__rwPlan;
      if (!P) return;
      gsap.set([root.querySelector('.rw-track'), ...P.segs.map((s) => s.el), ...P.cards.map((c) => c.el), P.hold && P.hold.qn].filter(Boolean), { x: 0 });
      root.querySelectorAll('.rw-track > *, .rw-relay > .rw-card').forEach((el) => { el.style.visibility = ''; });
      for (const c of P.cards) {
        const img = c.el.querySelector('.rw-card__photo img'), block = c.el.querySelector('.rw-card__block');
        if (img) gsap.set(img, { xPercent: 0 });
        if (block) gsap.set(block, { yPercent: 0 });
      }
    };

    // Switching between the walk and the column changes the section's height by several screens, and by
    // the time a media query reports the change the page may already have moved (the stage's CSS drops
    // the pinned height the moment reduced motion turns on). So where the reader is is kept every frame:
    // the room across the middle of the screen, or how far past the scene they are; at a switch the last
    // one from before it is frozen and brought back once the new layout has its heights.
    // In the walk the anchor also holds the walk's progress, so a plain resize (the section's height is
    // in screens, so it changes with the window while the scroll position in pixels does not) brings the
    // reader back to the same moment of the walk instead of another room.
    const geo = { top: 0, h: 0, rooms: null };
    const measure = () => { geo.top = root.getBoundingClientRect().top + window.scrollY; geo.h = root.offsetHeight; geo.rooms = null; };
    // lastWalk: where the walk was when the reader last walked, so a trip to the column and straight back
    // (reduced motion on and off, a window narrowed and widened) returns to that very moment
    let anchor = null, lastWalk = null, frozen = null, keep = null, lastY = -1, timer = 0, keepTimer = 0;
    const track = () => {
      if (frozen || keep) return;
      const y = window.scrollY, H = window.innerHeight, mid = y + H / 2, end = geo.top + geo.h;
      const walking = !!root.__rwPlace && root.classList.contains('rw-walk');
      if (y === lastY && !walking) return;
      lastY = y;
      if (mid < geo.top) anchor = null;                       // above the scene: nothing there moves
      else if (walking ? y > end - H + 1 : mid >= end) anchor = { below: y - end, walk: walking };
      else if (walking) {
        const st = root.__rwTl && root.__rwTl.scrollTrigger;
        anchor = { room: root.__rwRoom || null, p: st && y >= geo.top - 1 ? st.progress : null, walk: true };
        if (anchor.room && anchor.p != null) lastWalk = anchor;
      } else {
        if (!geo.rooms) geo.rooms = [...root.querySelectorAll('.rw-track > :not(.rw-relay):not(.rw-hold), .rw-relay > .rw-card, .rw-hold > *, .rw-ground')].map((el) => [el, el.getBoundingClientRect().top + y]);
        // the lowest row of rooms that has started above the middle (cards sit two to a row on a wide
        // column); its first room, so the walk comes back to the card that is read first
        let top = -Infinity;
        for (const [, t] of geo.rooms) if (t <= mid && t > top) top = t;
        const row = geo.rooms.filter(([, t]) => Math.abs(t - top) <= 1).map(([el]) => el);
        anchor = row.length ? { room: row[0], row } : null;
      }
    };
    const restore = () => {
      measure();
      const a = frozen;
      if (!a || (a.below == null && !a.room && a.p == null)) return;
      let y = null;
      const walking = root.__rwPlace && root.classList.contains('rw-walk') && root.__rwPlan;
      if (a.below != null) y = geo.top + geo.h + a.below;
      else if (walking && a.p != null) y = geo.top + clamp(a.p, 0, 1) * (geo.h - window.innerHeight);   // still walking: the same moment
      else if (walking && a.room) {
        // back from the column: the moment the walk was left, if the reader is still on that room
        const P = root.__rwPlan, back = lastWalk && (a.row || [a.room]).includes(lastWalk.room);
        const s = back ? null : focusTime(P, a.room);
        if (back) y = geo.top + clamp(lastWalk.p, 0, 1) * (geo.h - window.innerHeight);
        else if (s != null) y = geo.top + (clamp(s, 0, P.T) / P.T) * (geo.h - window.innerHeight);
      } else if (a.room && a.room.isConnected) y = a.room.getBoundingClientRect().top + window.scrollY;
      if (y == null) return;
      y = Math.max(0, Math.round(y));
      if (Math.abs(y - window.scrollY) < 2) return false;     // nothing moved (a refresh that changed no height)
      // Lenis measures the page on its own (debounced) clock: bring its limit up to date first, or a
      // taller page would be clamped to the old one
      if (Stage.lenis) { if (Stage.lenis.resize) Stage.lenis.resize(); Stage.lenis.scrollTo(y, { immediate: true, force: true }); }
      else window.scrollTo(0, y);
      return true;
    };
    const switched = () => {
      if (!frozen) frozen = anchor || {};
      requestAnimationFrame(() => { settle(); restore(); });
      // once more after the stage's own refresh has measured the new heights
      clearTimeout(timer);
      timer = setTimeout(() => { ScrollTrigger.refresh(); restore(); frozen = null; lastY = -1; }, 450);
    };
    ScrollTrigger.addEventListener('refresh', measure);
    measure();
    gsap.ticker.add(track);
    // The stage switches on its own phone query (767px); the walk also needs a wide landscape screen,
    // so crossing that line rebuilds the scene.
    mqWide.addEventListener('change', () => { switched(); make(); ScrollTrigger.refresh(); });
    mqReduce.addEventListener('change', switched);
    mqPhone.addEventListener('change', switched);
    // A resize, or any other refresh, while walking: the anchor from the frame before it is kept (the
    // resize event comes before the next frame, so it still matches the old heights) and brought back
    // once the refresh has measured the new ones. A layout switch takes over with its own anchor.
    const pin = () => {
      if (!frozen && !keep && anchor && anchor.walk) keep = anchor;
      clearTimeout(keepTimer);
      keepTimer = setTimeout(() => { keep = null; }, 1500);  // no refresh came: let the anchor follow again
    };
    window.addEventListener('resize', pin);
    ScrollTrigger.addEventListener('refreshInit', () => { fit(root); pin(); });
    ScrollTrigger.addEventListener('refresh', () => {
      if (root.__rwPlace) root.__rwPlace();
      const a = keep;
      keep = null;
      clearTimeout(keepTimer);
      if (!a || frozen || !root.__rwPlace) return;
      frozen = a;
      const moved = restore();
      frozen = null;
      lastY = -1;
      // land on it at once rather than scrubbing back from where the new heights had put the walk
      const st = moved && root.__rwTl && root.__rwTl.scrollTrigger;
      if (st) { st.update(); const tw = st.getTween && st.getTween(); if (tw) tw.progress(1); }
    });
    // late fonts change every line's width: fit again, and let the column measure its new heights. A web
    // font is fetched only once text using it is laid out, so `status` can read "loaded" before it has even
    // been asked for: wait for fonts.ready always, and fit again whenever a later font finishes loading
    if (document.fonts) {
      const refit = () => { fit(root); ScrollTrigger.refresh(); };
      document.fonts.ready.then(refit);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
    }

    root.addEventListener('focusin', (e) => {
      const P = root.__rwPlan;
      if (!P || !root.__rwPlace || !root.classList.contains('is-live') || e.target.closest('.rw-chrome')) return;
      const s = focusTime(P, e.target);
      if (s == null) return;
      const go = () => {
        const top = root.getBoundingClientRect().top + window.scrollY;
        const y = Math.round(top + (clamp(s, 0, P.T) / P.T) * (root.offsetHeight - window.innerHeight));
        if (Stage.lenis) { if (Stage.lenis.resize) Stage.lenis.resize(); Stage.lenis.scrollTo(y, { immediate: true, force: true }); }
        else window.scrollTo(0, y);
      };
      go();
      // once more after the browser's own scroll to the focused link, which reads the walk's layout of
      // the moment (a link low in the unlifted column would otherwise pull the page past its room)
      requestAnimationFrame(go);
    });
    return mm;
  };
})();
