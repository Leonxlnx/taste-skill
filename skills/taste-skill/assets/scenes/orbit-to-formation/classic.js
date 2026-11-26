// assets/scenes/orbit-to-formation/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / orbit-to-formation.js — one set of square photographs rides a single invisible
// wheel that changes its settings as the page scrolls. First it is a huge arch turning over the opening
// statement; then the arch curls into an elliptical ring round one big figure; then the ring rolls to
// the left edge (on phones it sinks) and keeps turning as a half-wheel while a column of big figures
// rises past it, each row lighting as it crosses the reading line. Runs on stage.js
// (references/scenes.md); one render function, sin/cos maths, the cards are never tweened themselves.
//
// DOM (the classes are the contract, the tags are free):
//   <section class="scene" data-scene="orbit-to-formation" style="--n:14" data-options='{"hold":4}'>
//     <div class="scene-stage">
//       <h2 class="orbit-lede">The statement, 4-9 words (about 48 characters or fewer)</h2>
//                     it is the title at progress 0 and a headline, so it is set on two lines at most:
//                     a statement that would take three lines, or run past the bottom edge under the
//                     arch, is set smaller (40px at the least, 28px on phones; in the finished layout it
//                     first takes the full width, then steps down to 32px, 28px on phones), and the arch
//                     rises when it still would not fit. About 48 characters keep two lines on every
//                     screen down to a 360px phone. Longer text cannot keep the two-line rule there: at
//                     the floor size about 64 characters set three lines on a phone, and 90 or more set
//                     three lines on a laptop too, so keep the statement short
//       <div class="orbit-wheel" role="list" aria-label="…">
//         <figure class="orbit-card" role="listitem" style="--i:0">
//           <img class="orbit-img" src="…" alt="…" width="560" height="560" decoding="async">
//         </figure>
//         … 12-16 cards (3-24 work: a short set is repeated whole), --i = 0 … n-1, --n on the section.
//         Square photographs of at least 560px in one grade, the subject inside the central 60%.
//       </div>
//       <div class="orbit-anchor">
//         <p class="orbit-figure">1987 <span class="orbit-figure-line">the first winter</span></p>
//                     4 glyphs or fewer; the optional second line (3 words or fewer) makes the figure a
//                     two-line headline inside the ring (the line stays on one line, set smaller when it
//                     would not fit the ring's clear middle, in the live and the finished ring alike)
//         <p class="orbit-caption">Caption of 12 words or fewer</p>
//       </div>
//       <ul class="orbit-stats">
//         <li class="orbit-stat"><span class="orbit-stat-figure" data-value="365">365</span>
//           <span class="orbit-stat-label">Label of 4 words or fewer</span></li>
//         … 4 rows (2-6 work); figures like 17, 340+, 6°, 2.4k (data-value is the number to count to);
//         every figure takes the width of the widest, so the labels start on one edge
//       </ul>
//     </div>
//   </section>
//
// Options (data-options JSON on the section, or the second argument); default, range:
//   hold        4        screens the stage is held on desktop (4-7)
//   phoneHold   4        screens the stage is held on phones (3-6)
//   scrub       auto     true when Lenis smooths the wheel, else 0.6 (seconds of catch-up)
//   radius      1        arch radius as a share of the stage width: 0.7 (steep, 5 cards) - 1.6 (flat, 8 cards).
//                        It shapes the wide stage; a tall stage (phone, portrait tablet) uses 0.9 at the
//                        least, since a steeper arch there closes into a full ring under the statement
//   crest       0.24     height of the arch's top card, share of the stage height (0.18-0.30); the
//                        statement is placed a fixed gap under the arch's lowest edge, wherever that is
//                        (and the arch rises toward 0.18 only if the statement at 40px still would not fit)
//   phoneCrest  'auto'   tall stages (phones, portrait tablets): 'auto' centres the arch and the statement
//                        together on the screen; or a share of the height (0.14-0.44). Either way the
//                        arch rises when the statement would not fit under it on a short screen
//   ring        0.46     the locked ring's width as a share of the stage width (0.36-0.48), its height
//                        in proportion (0.42H at 0.46). At 0.44 and up the ring spills past the frame and
//                        the side and top cards crop at the screen edges. Under a fixed or sticky bar at
//                        the top of the window the scene finds the bar itself, keeps the ring at 0.40 or
//                        less and lowers it, so no card passes under the bar during the ring hold.
//   stagger     0.2      how far the cards peel off one after another as the arch curls (0-0.5); lowered
//                        automatically when it would leave the screen without a readable text
//   wind        'close'  'close': the ring closes at the bottom; 'spring': it winds in from one side
//   tilt        1        1: faces follow the wheel (upside down at the bottom); 0.2-0.9: faces stay
//                        near upright and swing at most tilt x 90deg
//   dim         0.4      opacity of a figure row away from the reading line (0.4-0.8)
//   count       false    true: each figure counts up from 0 as it reaches the reading line (until then
//                        the row shows its label only, so a waiting row never reads a false 0)
//   phone       'same'   'same': the phone version (ring, then the wheel sinks); 'rest': the finished
//                        composition on phones
//   phoneCards  10       cards used on phones, the first ones (6-14)
//
// Timeline (fractions of the hold): 0-0.20 the arch turns under the statement; 0.20-0.40 the arch
// curls into the ring: the crown lifts away while the statement fades (0.20-0.27), the flanks sweep up
// the screen edges and the ring closes at the bottom last; the figure arrives inside the closing ring
// (0.27-0.36). Both handovers are checked against the curl itself whenever the stage is measured: the
// statement fades earlier and the figure arrives later when a steep arch, a heavy stagger or a small
// ring would bring a card across them, and the stagger is eased off until the two handovers meet.
// 0.40-0.60 the ring turns; 0.60-0.74 the wheel rolls to the left edge (on a tall stage, a phone or a
// portrait tablet, it sinks to the bottom edge instead; the section gets .orbit-tall). The figure rides
// out with the hub and shrinks with the wheel, so no card reaches it, and fades before the screen edge
// would cut it. 0.69-0.93 the column of figures rises into its place beside the turning half-wheel (on a
// tall stage, out from behind the sunk wheel) while a reading line runs down it: the row on the line is
// lit, the others wait at the dim value; a row only shows where no card is under it and once it is
// 16px clear of the bottom edge. 0.925-0.97 every row lights and the column holds until the pin releases. Text layers
// only fade, so they stay in the accessibility tree; a layer under 2% opacity gets .orbit-faded, which
// clips it to nothing so it never catches the pointer, a text selection or a hit test.
// Cost per frame: one style write per card on the stage (a card that stays off the stage is not
// restyled), plus the text layers that changed; no layout is read or written while scrolling, and the
// CSS keeps the stage's --p from restyling the whole scene on every frame.
//
// The finished composition (reduced motion, phone 'rest', no GSAP) is the CSS without .is-live; the script
// only fits the statement to two lines and the figure's second line into the ring there. Whenever the
// section stops being live while the page is open (the visitor turns reduced motion on, the window
// crosses the phone width with phone 'rest'), every inline style the live scene wrote is removed, so the
// finished composition shows whole. (stage.js's gsap.matchMedia runs no callback when reduced motion is
// on at a desktop width, so it never calls rest() there; the scene watches its own .is-live instead.)
(() => {
  if (!window.Stage) return;
  const TAU = Math.PI * 2;
  const DEG = 180 / Math.PI;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const wrap = (v) => v - Math.floor(v + 0.5); // into [-0.5, 0.5)
  const num = (v, d) => (v === undefined || v === null || v === '' || isNaN(+v) ? d : +v);

  // spin keys, in turns of the loop: the arch conveyor ends at SPIN_A (the curl happens there), the
  // ring turns on to SPIN_B, the half-wheel to SPIN_C. Spin never moves while the arch curls.
  const SPIN_A = 0.28, SPIN_B = 0.5, SPIN_C = 0.8;
  // the statement's fade: it ends at LEDE_END at the latest (earlier when a card would reach it sooner)
  const LEDE_END = 0.27, LEDE_FADE = 0.07;
  // the figure arrives from ANCHOR_START (later when a card would still cross it)
  const ANCHOR_START = 0.27, ANCHOR_IN = 0.09;
  // the roll, the figure's exit, and the column of figures
  const ROLL_AT = 0.6, ROLL = 0.14, ANCHOR_OUT_AT = 0.61, ANCHOR_OUT = 0.09;
  const STATS_AT = 0.68, COL_AT = 0.69, COL_END = 0.93, ALL_AT = 0.925, ALL = 0.045;
  // the most the figure may arrive after the statement has gone (fraction of the hold); with the two fades
  // that leaves at most about 0.05 of the hold without a text at full strength
  const MAX_GAP = 0.012;

  // "340+" → { pre: '', value: 340, dec: 0, suf: '+' }; data-value wins over the text for the number
  const parseFigure = (el) => {
    if (!el) return null;
    if (el.dataset.final === undefined) el.dataset.final = el.textContent.trim();
    const text = el.dataset.final;
    const m = text.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return null;
    const src = el.dataset.value !== undefined && !isNaN(parseFloat(el.dataset.value)) ? String(el.dataset.value) : m[2];
    return { el, text, pre: m[1], suf: m[3], value: parseFloat(src), dec: (src.split('.')[1] || '').length };
  };
  const writeFigure = (f, v) => {
    const t = f.pre + (f.dec ? v.toFixed(f.dec) : String(Math.round(v))) + f.suf;
    if (f.el.textContent !== t) f.el.textContent = t;
  };

  // Ramanujan's perimeter of an ellipse
  const perimeter = (a, b) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));

  // how many lines a block of text sets (its line boxes, read from a Range)
  const lineCount = (el, rg = document.createRange()) => {
    rg.selectNodeContents(el);
    const mids = [];
    for (const q of rg.getClientRects()) {
      if (q.width < 1 || q.height < 1) continue;
      const m = (q.top + q.bottom) / 2;
      if (!mids.some((v) => Math.abs(v - m) < q.height / 2)) mids.push(m);
    }
    return mids.length;
  };
  // the largest font size from hi down to lo (px) at which ok() holds; lo when none does
  const fitSize = (el, lo, hi, ok) => {
    const trial = (fs) => { el.style.fontSize = fs.toFixed(1) + 'px'; return ok(); };
    if (lo < hi && trial(lo)) for (let k = 0; k < 8 && hi - lo > 0.5; k++) { const mid = (lo + hi) / 2; if (trial(mid)) lo = mid; else hi = mid; }
    trial(lo);
    return lo;
  };

  // The finished composition: the statement keeps two lines (it takes the full width first, then steps
  // down to 32px, 28px on a phone) and the figure's second line stays on one line inside the ring's clear
  // middle. Runs whenever the section is not live; the CSS alone already does this for text inside the
  // header's lengths.
  const fitFinished = (root) => {
    if (root.classList.contains('is-live')) return;
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const lede = root.querySelector('.orbit-lede');
    if (lede) {
      lede.style.fontSize = ''; lede.style.maxWidth = '';
      if (lede.offsetWidth && lineCount(lede) > 2) {
        lede.style.maxWidth = 'none';
        if (lineCount(lede) > 2) {
          const fs0 = parseFloat(getComputedStyle(lede).fontSize) || 32;
          fitSize(lede, Math.min(fs0, narrow ? 28 : 32), fs0, () => lineCount(lede) <= 2);
        }
      }
    }
    const line = root.querySelector('.orbit-anchor .orbit-figure-line');
    const wheel = root.querySelector('.orbit-wheel');
    const card = wheel && [...wheel.querySelectorAll('.orbit-card')].find((c) => c.offsetWidth);
    if (line && card) {
      line.style.fontSize = '';
      // the ring's clear radius: from its centre to a card's inner edge (the cards point outward)
      const wr = wheel.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const wx = wr.left + wr.width / 2, wy = wr.top + wr.height / 2;
      const inner = Math.hypot(cr.left + cr.width / 2 - wx, cr.top + cr.height / 2 - wy) - card.offsetWidth / 2 - 12;
      const lr = line.getBoundingClientRect();
      const dy = Math.max(Math.abs(lr.top - wy), Math.abs(lr.bottom - wy));
      const room = 2 * Math.sqrt(Math.max(0, inner * inner - dy * dy));
      if (room > 0 && lr.width > room) {
        const fs = parseFloat(getComputedStyle(line).fontSize) || 16;
        line.style.fontSize = Math.max(14, Math.floor((fs * room) / lr.width * 2) / 2) + 'px';
      }
    }
  };

  // The bottom edge of a fixed or sticky bar held at the top of the window (a site header), 0 if none.
  const barBottom = (root) => {
    let b = 0;
    const seen = new Set();
    const list = [...document.querySelectorAll('header, nav, [role="banner"], [role="navigation"]'), ...(document.body ? document.body.children : [])];
    for (const el of list) {
      if (seen.has(el) || root.contains(el) || el.contains(root)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if ((cs.position !== 'fixed' && cs.position !== 'sticky') || cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 * window.innerWidth || r.height <= 0 || r.height > 0.25 * window.innerHeight) continue;
      const top = cs.position === 'sticky' ? parseFloat(cs.top) : r.top;
      if (isNaN(top) || top > 1 || top + r.height <= 0) continue;
      b = Math.max(b, Math.max(0, top) + r.height);
    }
    return b;
  };

  function setup(root, ctx, o) {
    if (root.__orbit) root.__orbit.dispose();
    const { stage, phone } = ctx;
    const wheel = root.querySelector('.orbit-wheel');
    const lede = root.querySelector('.orbit-lede');
    const anchor = root.querySelector('.orbit-anchor');
    const figLine = anchor ? anchor.querySelector('.orbit-figure-line') : null;
    const statsEl = root.querySelector('.orbit-stats');
    const rows = [...root.querySelectorAll('.orbit-stat')];
    const figs = rows.map((r) => parseFigure(r.querySelector('.orbit-stat-figure')));
    const own = wheel ? [...wheel.children].filter((c) => c.classList.contains('orbit-card') && !c.hasAttribute('data-orbit-clone')) : [];
    const nAttr = root.style.getPropertyValue('--n');

    // the cards this wheel uses; a set too short to close a ring is repeated whole
    const keep = Math.min(own.length, phone ? o.phoneCards : 24);
    const used = own.slice(0, keep);
    own.slice(keep).forEach((c) => c.classList.add('is-spare'));
    const cards = used.slice();
    const need = phone ? 7 : 10;
    if (used.length && used.length < need) {
      for (let t = 1, times = Math.ceil(need / used.length); t < times; t++) {
        for (const c of used) {
          const k = c.cloneNode(true);
          k.setAttribute('data-orbit-clone', '');
          k.setAttribute('aria-hidden', 'true');
          k.removeAttribute('role');
          k.querySelectorAll('img').forEach((i) => { i.alt = ''; });
          wheel.appendChild(k);
          cards.push(k);
        }
      }
    }
    const n = cards.length;
    root.style.setProperty('--n', n);
    root.style.setProperty('--orbit-rows', Math.max(1, rows.length));

    let inst = null;

    // every picture is decoded before it moves; nothing is lazy in the live mode (cards swing in from off-screen)
    const imgs = cards.flatMap((c) => [...c.querySelectorAll('img')]);
    imgs.forEach((i) => { if (i.loading === 'lazy') i.loading = 'eager'; });
    Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null))).then(() => { if (root.__orbit === inst) render(); });

    // ---- geometry, cached; render() never reads layout ----
    let D = o.stagger;
    const G = { W: 0, H: 0 };
    const d = new Float32Array(n);
    const measure = () => {
      const W = stage.clientWidth || window.innerWidth;
      const H = stage.clientHeight || window.innerHeight;
      if (!W || !H) return false;
      G.W = W; G.H = H;
      // A tall stage (a phone, a portrait tablet) has no room for a half-wheel beside the figures: there the
      // arch and the statement sit together in the middle and, at the end, the wheel sinks to the bottom
      // edge with the figures standing above it.
      const tall = phone || H > 1.1 * W;
      if (root.classList.contains('orbit-tall') !== tall) root.classList.toggle('orbit-tall', tall);
      const bar = barBottom(root);
      // the column of figures starts below a fixed bar at the top of the window (CSS reads --orbit-bar)
      root.style.setProperty('--orbit-bar', bar.toFixed(0) + 'px');
      let sA, RA, crest, B, C, rC, roll;
      if (!tall) {
        sA = clamp(0.16 * W, 160, 280);
        RA = o.radius * W;
        crest = o.crest * H;
        // the locked ring fills the frame: at the default it spills past the side edges and the top
        const ring = bar ? Math.min(o.ring, 0.4) : o.ring;
        B = { cx: 0.5 * W, cy: 0.5 * H + bar / 2, rx: ring * W, ry: 0.913 * ring * H };
        rC = Math.min(0.5 * H, 0.31 * W);
        C = { cx: 0, cy: 0.5 * H, rx: rC, ry: rC };
        roll = (B.cx - C.cx) / (TAU * rC);
      } else {
        // big cards: on a phone the crest photograph is half the screen wide, and its neighbours stand
        // tilted at both edges, so the screen shows a curve of pictures rather than one picture
        sA = phone ? clamp(0.5 * W, 104, 220) : clamp(0.4 * W, 104, 220);
        // a steeper arch than 0.9 closes into a full ring on a tall screen (its loop seam would come up
        // from below the fold), and that ring's lower half would run under the statement: tall stages
        // keep the radius at 0.9 or more
        RA = 1.1 * Math.max(o.radius, 0.9) * W;
        crest = (o.phoneCrest === 'auto' ? 0.36 : o.phoneCrest) * H;
        const ring = bar ? Math.min(o.ring, 0.4) : o.ring;
        B = { cx: 0.5 * W, cy: 0.5 * H + bar / 2, rx: 0.913 * ring * W, ry: 0.74 * ring * H };
        // the sunk wheel is smaller on a short phone, so its cap leaves the column of figures room
        rC = Math.min(0.58 * W, 0.36 * H);
        C = { cx: 0.5 * W, cy: 1.04 * H, rx: rC, ry: rC };
        roll = 0.15;
      }
      const A = { cx: 0.5 * W, cy: crest + RA, rx: RA, ry: RA, sp: TAU };
      // the arch: cards 1.25 card-widths apart (1.15 on a tall stage, where fewer fit across); its loop
      // seam must stay off-screen with one pitch to spare
      const pitch = ((tall ? 1.15 : 1.25) * sA) / RA;
      const half = Math.asin(Math.min(1, (0.5 * W + sA) / RA)) + pitch + 0.03;
      const spread = () => {
        A.sp = Math.min(TAU, Math.max(n * pitch, 2 * half));
        // a steep arch on a tall screen can bring the loop's seam (u = +/-0.5) up from below the fold; then
        // the arch closes into a full circle, where the seam cannot show
        if (A.sp < TAU) {
          const ph = -Math.PI / 2 + A.sp / 2, xs = A.cx + A.rx * Math.cos(ph), ys = A.cy + A.ry * Math.sin(ph);
          if (ys - 0.75 * sA < H && xs - 0.75 * sA < W) A.sp = TAU;
        }
      };
      // The arch keeps one fixed shape while it turns, so the statement's clearance is set, not lucky:
      // find the lowest card edge over the statement's span for every position a card can take on the
      // arch, and put the statement a fixed gap below it.
      const x0 = tall ? 16 : 0.1 * W, x1 = W - x0;
      const archLow = () => {
        const hh = sA / 2;
        let low = 0;
        for (let a = -A.sp / 2; a <= A.sp / 2; a += pitch / 12) {
          const x = A.cx + A.rx * Math.sin(a), y = A.cy - A.ry * Math.cos(a);
          if (x < x0 - sA || x > x1 + sA || y > H) continue;
          const r = o.tilt < 1 ? (o.tilt * Math.PI / 2) * Math.sin(a) : a;
          const cr = Math.cos(r), sr = Math.sin(r);
          const q = [[-hh, -hh], [hh, -hh], [hh, hh], [-hh, hh]].map(([dx, dy]) => [x + dx * cr - dy * sr, y + dx * sr + dy * cr]);
          for (let k = 0; k < 4; k++) {
            const [ax, ay] = q[k], [bx, by] = q[(k + 1) % 4];
            if (ax >= x0 && ax <= x1) low = Math.max(low, ay);
            for (const xe of [x0, x1]) if ((ax - xe) * (bx - xe) < 0) low = Math.max(low, ay + ((xe - ax) / (bx - ax)) * (by - ay));
          }
        }
        return low;
      };
      spread();
      const gapL = (tall ? 0.045 : 0.07) * H;
      const crest0 = crest;
      const setCrest = (c) => { crest = c; A.cy = crest + RA; spread(); };
      const ledeAt = (min) => clamp(archLow() + gapL, min * H, 0.72 * H);
      // the highest the arch may rise to make room for the statement
      const crestTop = Math.max((tall ? 0.14 : 0.18) * H, bar ? bar + 8 + sA / 2 : 0);
      // the statement sits a fixed gap under the arch's lowest edge; on a tall stage the arch and the
      // statement are one block, centred on the screen (and clear of a bar)
      const placeLede = () => {
        setCrest(crest0);
        if (tall) {
          if (o.phoneCrest === 'auto') {
            const below = archLow() - crest + gapL + lede.offsetHeight;
            setCrest(clamp((H - (sA / 2 + below)) / 2 + sA / 2, 0.14 * H, 0.44 * H));
          }
          if (crest < bar + 8 + sA / 2) setCrest(bar + 8 + sA / 2);
        }
        // an arch set so low (a high crest value on a short screen) that the statement could not sit
        // under it rises until it can
        const low = archLow() + gapL - 0.72 * H;
        if (low > 0 && crest > crestTop) setCrest(Math.max(crestTop, crest - low));
        G.ledeTop = ledeAt(tall ? 0.3 : 0.36);
      };
      if (lede) {
        // The statement is the title at progress 0 and a headline, so it is fitted: when it would set
        // three lines or more, or run past the bottom edge (24px to spare), its size steps down to the
        // largest that keeps two lines and fits, to 40px at the least (28px on a tall stage). A statement
        // too long for two lines at that size stays there (the fewest lines it can take). If it still
        // runs past the bottom edge, the arch rises (its crest to 0.18 of the height at the highest, 0.14
        // on a tall stage) and the statement with it.
        lede.style.fontSize = ''; lede.style.maxWidth = '';
        placeLede();
        const room = H - 24;
        // the text's real extent: with a line height under 1 the glyph boxes reach past the block
        const rg = document.createRange();
        const extent = () => {
          rg.selectNodeContents(lede);
          const top = lede.getBoundingClientRect().top;
          let b = lede.offsetHeight;
          for (const q of rg.getClientRects()) if (q.height > 1) b = Math.max(b, q.bottom - top);
          return b;
        };
        const fits = () => lineCount(lede, rg) <= 2 && G.ledeTop + extent() <= room;
        if (!fits()) {
          const fs0 = parseFloat(getComputedStyle(lede).fontSize) || 40;
          fitSize(lede, Math.min(fs0, tall ? 28 : 40), fs0, () => { if (tall) placeLede(); return fits(); });
          const over = G.ledeTop + extent() - room;
          if (over > 0 && crest > crestTop) { setCrest(Math.max(crestTop, crest - over)); G.ledeTop = ledeAt(tall ? 0.24 : 0.28); }
        }
        root.style.setProperty('--orbit-lede-top', G.ledeTop.toFixed(1) + 'px');
      }
      // ring cards at about 0.8 of the arch size, never closer than about a quarter card apart
      let sB = Math.min(0.8 * sA, Math.round((0.76 * perimeter(B.rx, B.ry)) / n));
      // under a bar at the top of the window, the ring's top card stays below it
      if (bar) B.ry = Math.max(0.2 * H, Math.min(B.ry, B.cy - bar - 8 - 0.5 * sB));
      // the figure's second line is fitted on one line into the ring's inner width (with room to spare, so
      // the cards closing the ring never brush it and the figure can arrive early in the curl)
      if (figLine) {
        figLine.style.fontSize = '';
        const inner = Math.max(96, 1.6 * (B.rx - 0.5 * sB - 8));
        root.style.setProperty('--orbit-inner-w', inner.toFixed(0) + 'px');
        const lw = figLine.offsetWidth;
        if (lw > inner) {
          const fs = parseFloat(getComputedStyle(figLine).fontSize) || 16;
          figLine.style.fontSize = Math.max(14, Math.floor((fs * inner) / lw * 2) / 2) + 'px';
        }
      }
      // the figure fits inside the ring (cards upright, with tilt < 1, reach further in)
      const ab = anchorBox();
      if (ab) {
        const f = o.tilt < 1 ? 0.71 : 0.5;
        const fits = (s) => { const ri = B.rx - f * s - 8, rj = B.ry - f * s - 8; return ri > 0 && rj > 0 && (ab.w / 2 / ri) ** 2 + (ab.h / 2 / rj) ** 2 <= 1; };
        while (sB > 0.5 * sA && !fits(sB)) sB -= 2;
      }
      // The column of figures: each row's text box and centre where it rests; the column rises Y0 into that
      // place while the reading line runs from the first row to the last.
      G.rows = null;
      // every figure keeps the width of the widest final figure: the labels start on one edge whatever
      // the figures are (2.4k beside 6°), and a counting figure never shifts its label as digits are added
      const fl = figs.filter(Boolean);
      if (fl.length) {
        fl.forEach((f) => { f.el.style.minWidth = ''; });
        let wide = 0;
        for (const f of fl) {
          const el = f.el, cur = el.textContent;
          if (cur !== f.text) el.textContent = f.text;
          wide = Math.max(wide, el.getBoundingClientRect().width);
          if (cur !== f.text) el.textContent = cur;
        }
        fl.forEach((f) => { f.el.style.minWidth = Math.ceil(wide) + 'px'; });
      }
      if (statsEl && rows.length) {
        const L = statsEl.offsetLeft, T = statsEl.offsetTop;
        // the glyph boxes too: big figures set at a line height under 1 reach past their layout box
        // (read relative to the column, so its current transform cancels out)
        const sr = statsEl.getBoundingClientRect(), rg = document.createRange();
        G.rows = rows.map((r) => {
          const kids = [...r.children].filter((k) => k.offsetParent);
          const box = kids.length ? kids : [r];
          const R = {
            l: L + Math.min(...box.map((k) => k.offsetLeft)),
            t: T + Math.min(...box.map((k) => k.offsetTop)),
            r: L + Math.max(...box.map((k) => k.offsetLeft + k.offsetWidth)),
            b: T + Math.max(...box.map((k) => k.offsetTop + k.offsetHeight)),
            c: T + r.offsetTop + r.offsetHeight / 2,
          };
          rg.selectNodeContents(r);
          for (const q of rg.getClientRects()) {
            if (q.width < 1 || q.height < 1) continue;
            R.t = Math.min(R.t, T + q.top - sr.top); R.b = Math.max(R.b, T + q.bottom - sr.top);
            R.l = Math.min(R.l, L + q.left - sr.left); R.r = Math.max(R.r, L + q.right - sr.left);
          }
          return R;
        });
        const m = G.rows.length;
        G.pitch = m > 1 ? (G.rows[m - 1].c - G.rows[0].c) / (m - 1) : 0.2 * H;
        G.Y0 = clamp(2.2 * G.pitch, (tall ? 0.2 : 0.25) * H, (tall ? 0.4 : 0.5) * H);
        G.L0 = G.rows[0].c + G.Y0;
        G.L1 = G.rows[m - 1].c;
        G.gap = tall ? Math.max(16, 0.02 * H) : Math.max(24, 0.025 * W);
      }
      // the half-wheel's cards grow a little as it comes to the edge (and never crowd its circle)
      const sC = Math.min(0.9 * sA, Math.round((0.8 * TAU * rC) / n));
      // on a tall stage the wheel sinks until its top cap (a card turned 45deg at most) clears the last row
      // of figures by the clearance render() asks for, so every row ends lit, on any phone height
      if (tall) {
        const end = G.rows ? G.rows[G.rows.length - 1].b + G.gap : 0.72 * H;
        C.cy = Math.max(C.cy, end + 0.71 * sC + rC);
      }
      Object.assign(G, { sA, A, B, C, sB, sC, roll, tall, bar, ab });
      // the figure's room inside the locked ring, so render() can shrink it with the wheel
      G.in0x = Math.max(1, B.rx - 0.5 * sB - 8);
      G.in0y = Math.max(1, B.ry - 0.5 * sB - 8);
      G.aRoom = ab ? Math.min(B.cx - ab.w / 2, W - B.cx - ab.w / 2, B.cy - ab.h / 2, H - B.cy - ab.h / 2) : 0;
      root.style.setProperty('--sa', sA.toFixed(1) + 'px');
      shown.fill(1);
      curlTiming();
      return true;
    };

    // The statement holds into the curl (to 0.27 of the hold) and is gone before any card reaches it. The
    // figure blooms inside the closing ring: for every step of the curl, the largest scale (up to 1) at
    // which it clears every card is kept in G.aMax, render() never lets it grow past that, and it
    // arrives as soon as the statement has gone and it can show at FIG_MIN of its size or more. All of
    // this is found by running the curl here, card by card. When the two still leave a stretch without
    // a readable text (a steep arch, a heavy stagger), the stagger is eased off until they meet.
    const CURL_STEPS = 40, FIG_MIN = 0.55;
    G.aMax = new Float32Array(CURL_STEPS + 1).fill(1);
    const curlTiming = () => {
      let lines = [];
      if (lede) {
        const lr = lede.getBoundingClientRect();
        const rg = document.createRange();
        rg.selectNodeContents(lede);
        lines = [...rg.getClientRects()].filter((q) => q.width > 1 && q.height > 1)
          .map((q) => [lede.offsetLeft + q.left - lr.left, G.ledeTop + q.top - lr.top - 0.04 * G.H, lede.offsetLeft + q.right - lr.left, G.ledeTop + q.bottom - lr.top]);
      }
      const ab = G.ab, B = G.B;
      const at = {};
      const P = Array.from({ length: n }, () => ({}));
      // does the figure, scaled by s round the ring's centre (8px to spare), clear every card in P?
      const clear = (s) => {
        const hw = (s * ab.w) / 2 + 8, hh = (s * ab.h) / 2 + 8, bx = [B.cx - hw, B.cy - hh, B.cx + hw, B.cy + hh];
        for (const c of P) if (cardHits(c.x, c.y, c.rot / DEG, c.size / 2, bx)) return false;
        return true;
      };
      for (D = o.stagger; ; D = Math.max(0, D - 0.05)) {
        // curl order: by distance from the crest at the moment of the curl (or by side, for 'spring')
        const order = [...Array(n).keys()].map((i) => ({ i, u: wrap(i / n - SPIN_A) }));
        order.sort((a, b) => (o.wind === 'spring' ? a.u - b.u : Math.abs(a.u) - Math.abs(b.u)));
        order.forEach((e, rank) => { d[e.i] = n > 1 ? (D * rank) / (n - 1) : 0; });
        G.ledeEnd = LEDE_END;
        if (lines.length) {
          search: for (let s = 0; s <= CURL_STEPS; s++) {
            for (let i = 0; i < n; i++) {
              place(i, SPIN_A, s / CURL_STEPS, 0, at);
              for (const b of lines) {
                if (cardHits(at.x, at.y, at.rot / DEG, at.size / 2, b)) { G.ledeEnd = clamp(0.2 + 0.2 * (s / CURL_STEPS) - 0.012, 0.16, LEDE_END); break search; }
              }
            }
          }
        }
        G.anchorStart = ANCHOR_START;
        if (ab) {
          let first = -1;
          for (let s = 0; s <= CURL_STEPS; s++) {
            for (let i = 0; i < n; i++) place(i, SPIN_A, s / CURL_STEPS, 0, P[i]);
            let lo = 0, hi = 1;
            if (clear(1)) lo = 1;
            else for (let k = 0; k < 10; k++) { const mid = (lo + hi) / 2; if (clear(mid)) lo = mid; else hi = mid; }
            G.aMax[s] = lo;
          }
          // a scale that only holds for a moment would make the figure pulse: from each step on, the figure
          // may only be as large as every later step allows
          for (let s = CURL_STEPS - 1; s >= 0; s--) G.aMax[s] = Math.min(G.aMax[s], G.aMax[s + 1]);
          for (let s = 0; s <= CURL_STEPS; s++) if (G.aMax[s] >= Math.min(FIG_MIN, G.aMax[CURL_STEPS])) { first = s; break; }
          const t = 0.2 + (0.2 * Math.max(0, first)) / CURL_STEPS;
          G.anchorStart = clamp(Math.max(t, G.ledeEnd - 0.004), 0.2, 0.36);
        }
        if (G.anchorStart - G.ledeEnd <= MAX_GAP || D <= 0) break;
      }
      G.D = D;
      G.aFit = ab ? G.aMax[CURL_STEPS] : 1;
      if (inst && inst.ledeTw && Math.abs(inst.ledeTw.startTime() - (G.ledeEnd - LEDE_FADE)) > 1e-4) inst.ledeTw.startTime(G.ledeEnd - LEDE_FADE);
      if (inst && inst.anchorTw && Math.abs(inst.anchorTw.startTime() - G.anchorStart) > 1e-4) inst.anchorTw.startTime(G.anchorStart);
    };
    // the figure and caption's extent inside the anchor layer (layout sizes, transforms ignored)
    const anchorBox = () => {
      const kids = anchor ? [...anchor.children].filter((k) => k.offsetParent) : [];
      if (!kids.length) return null;
      const top = Math.min(...kids.map((k) => k.offsetTop)), bottom = Math.max(...kids.map((k) => k.offsetTop + k.offsetHeight));
      return { w: Math.max(...kids.map((k) => k.offsetWidth)), h: bottom - top };
    };
    // does a card (centre x, y, rotation r in radians, half size hs) overlap the box [x0, y0, x1, y1]? (separating axes)
    const cardHits = (x, y, r, hs, [x0, y0, x1, y1]) => {
      const cr = Math.cos(r), sr = Math.sin(r), ac = Math.abs(cr), as = Math.abs(sr), e = hs * (ac + as);
      if (x + e < x0 || x - e > x1 || y + e < y0 || y - e > y1) return false;
      const bw = (x1 - x0) / 2, bh = (y1 - y0) / 2, dx = (x0 + x1) / 2 - x, dy = (y0 + y1) / 2 - y;
      if (Math.abs(dx * cr + dy * sr) > hs + bw * ac + bh * as) return false;
      if (Math.abs(-dx * sr + dy * cr) > hs + bw * as + bh * ac) return false;
      return true;
    };

    // Equal arc spacing on an ellipse: the angle theta whose arc from 3 o'clock is phi/2pi of the
    // perimeter, read from a quarter table of the arc length (Simpson steps), rebuilt only when the radii
    // change. The first-order correction theta = phi + 0.5c sin 2phi leaves the neighbour chords +/-18%
    // apart on a wide, low ring (1280x640); this keeps them within about 5%.
    const QK = 24, qs = new Float64Array(QK + 1), QH = Math.PI / 2 / QK;
    let qa = -1, qb = -1;
    const evenTheta = (phi, a, b) => {
      if (Math.abs(a - b) < 0.5) return phi;
      if (a !== qa || b !== qb) {
        qa = a; qb = b;
        const f = (t) => Math.sqrt(a * a * Math.sin(t) ** 2 + b * b * Math.cos(t) ** 2);
        for (let k = 0; k < QK; k++) { const t = k * QH; qs[k + 1] = qs[k] + (QH / 6) * (f(t) + 4 * f(t + QH / 2) + f(t + QH)); }
      }
      const q = Math.floor(phi / (Math.PI / 2));
      const odd = (q & 1) === 1;
      let r = phi - q * (Math.PI / 2);
      if (odd) r = Math.PI / 2 - r;
      const target = (r / (Math.PI / 2)) * qs[QK];
      let k = 0;
      while (k < QK - 1 && qs[k + 1] < target) k++;
      const t = k * QH + (QH * (target - qs[k])) / (qs[k + 1] - qs[k] || 1);
      return q * (Math.PI / 2) + (odd ? Math.PI / 2 - t : t);
    };

    // ---- the one render function ----
    // spin, curl and roll for the wheel; figure in and out; the column's fade-in, rise and final light
    const w = { spin: 0, m1: 0, m2: 0, aIn: 0, aOut: 0, sIn: 0, col: 0, all: 0 };
    const tilt = o.tilt;
    // where card i sits for a spin S, curl m1 and roll m2 (S already includes the roll's turn)
    const place = (i, S, m1, m2, out) => {
      const { A, B, C, sA, sB, sC } = G;
      const u = wrap(i / n - S);
      const k = D < 1 ? (m1 - d[i]) / (1 - D) : m1;
      // the wheel's centre, radii and the card size lead the spread a little: the crown lifts and
      // tightens first and the flanks come up the screen edges, instead of swinging in from far below
      const b1 = smoothstep(k), bg = smoothstep(k * 1.4);
      const cx = lerp(lerp(A.cx, B.cx, bg), C.cx, m2);
      const cy = lerp(lerp(A.cy, B.cy, bg), C.cy, m2);
      const rx = lerp(lerp(A.rx, B.rx, bg), C.rx, m2);
      const ry = lerp(lerp(A.ry, B.ry, bg), C.ry, m2);
      const sp = lerp(lerp(A.sp, TAU, b1), TAU, m2);
      const phi = -Math.PI / 2 + u * sp;
      // equal arc spacing on the ellipse: without this, cards bunch at 3 and 9 o'clock
      const th = evenTheta(phi, rx, ry);
      const ct = Math.cos(th), st = Math.sin(th);
      let rot = Math.atan2(ry * ct, -rx * st) * DEG; // the tangent: 0 at the top, 90 at 3 o'clock
      if (tilt < 1) rot = tilt * 90 * Math.sin(rot / DEG);
      rot += 18 * Math.sin(Math.PI * b1) * Math.sign(u); // a tumble in mid-flight
      out.x = cx + rx * ct; out.y = cy + ry * st; out.rot = rot;
      out.size = lerp(lerp(sA, sB, bg), sC, m2);
      return out;
    };
    // text layers that fade: below 2% opacity they stop catching the pointer and text selection, but
    // stay readable to a screen reader (opacity only, never visibility)
    const layers = [lede, anchor, statsEl].filter(Boolean).map((el) => ({ el, off: false, v: 1 }));
    const layerOf = (el) => layers.find((L) => L.el === el);
    const setOpacity = (el, v, cache, k) => {
      const s = v >= 0.999 ? '1' : v.toFixed(3);
      if (cache[k] !== s) { cache[k] = s; el.style.opacity = s; }
    };
    const box = new Float32Array(n * 4); // each card's screen box (rotation included)
    // A card that stays off the stage is not restyled: its last transform already put it off the stage
    // (by half a card at least), and every style write costs a style recalc on the next frame. Cleared
    // whenever the stage is measured, so a resize writes every card again.
    const shown = new Uint8Array(n).fill(1);
    const rowOp = [], misc = [], figOp = [];
    let colT = '', anchorT = '', counts = null;
    const at = {};
    const render = () => {
      if (!G.W && !measure()) return;
      const { B, C, sA, sB, sC, roll, W, H } = G;
      const m1 = w.m1, m2 = w.m2;
      const S = w.spin + m2 * roll;
      const h = sA / 2;
      for (let i = 0; i < n; i++) {
        const { x, y, rot, size } = place(i, S, m1, m2, at);
        const r = rot / DEG, e = (size / 2) * (Math.abs(Math.cos(r)) + Math.abs(Math.sin(r)));
        box[i * 4] = x - e; box[i * 4 + 1] = y - e; box[i * 4 + 2] = x + e; box[i * 4 + 3] = y + e;
        const vis = x + e > -h && x - e < W + h && y + e > -h && y - e < H + h;
        if (vis || shown[i]) cards[i].style.transform = `translate3d(${(x - h).toFixed(2)}px,${(y - h).toFixed(2)}px,0) rotate(${rot.toFixed(2)}deg) scale(${(size / sA).toFixed(4)})`;
        shown[i] = vis ? 1 : 0;
      }
      // the figure blooms inside the closing ring (never larger than the curl leaves room for), rides with
      // the hub and shrinks with the wheel's inner room, so no card reaches it; it fades before the screen
      // edge would cut it
      let aOp = 0, aBox = null;
      if (anchor) {
        let curl = G.aFit;
        if (m1 < 1) { const f = clamp(m1, 0, 1) * CURL_STEPS, s0 = Math.floor(f); curl = lerp(G.aMax[s0], G.aMax[Math.min(CURL_STEPS, s0 + 1)], f - s0); }
        const ix = lerp(B.rx, C.rx, m2) - 0.5 * lerp(sB, sC, m2) - 8, iy = lerp(B.ry, C.ry, m2) - 0.5 * lerp(sB, sC, m2) - 8;
        const sc = Math.max(0.2, Math.min(curl, G.aFit * Math.min(1, ix / G.in0x, iy / G.in0y))) * (0.94 + 0.06 * w.aIn);
        const ax = lerp(B.cx, C.cx, m2), ay = lerp(B.cy, C.cy, m2);
        const t = `translate3d(${(ax - 0.5 * W).toFixed(2)}px,${(ay - 0.5 * H).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
        if (t !== anchorT) { anchorT = t; anchor.style.transform = t; }
        aOp = w.aIn * (1 - w.aOut);
        if (G.ab && aOp > 0) {
          const hw = (sc * G.ab.w) / 2, hh = (sc * G.ab.h) / 2;
          const room = Math.min(ax - hw, W - ax - hw, ay - hh, H - ay - hh);
          const span = Math.max(1, Math.min(0.04 * Math.min(W, H), G.aRoom - 8));
          aOp *= smoothstep((room - 8) / span);
          aBox = [ax - hw, ay - hh, ax + hw, ay + hh];
        }
        setOpacity(anchor, aOp, misc, 0);
        layerOf(anchor).v = aOp;
      }
      // the column of figures rises into place while the reading line runs down it
      if (statsEl && G.rows) {
        const yc = G.Y0 * (1 - w.col);
        const t = `translate3d(0,${yc.toFixed(2)}px,0)`;
        if (t !== colT) { colT = t; statsEl.style.transform = t; }
        const line = lerp(G.L0, G.L1, w.col);
        let best = 0;
        for (let k = 0; k < rows.length; k++) {
          const R = G.rows[k];
          let op = 0;
          if (w.sIn > 0) {
            const lit = 1 - smoothstep((Math.abs(R.c + yc - line) / G.pitch - 0.3) / 0.45);
            op = w.sIn * lerp(o.dim + (1 - o.dim) * lit, 1, w.all);
            const top = R.t + yc, bot = R.b + yc;
            // whole on screen: a row is 16px clear of the bottom edge before it starts to show
            op *= smoothstep((H - 16 - bot) / (0.035 * H));
            if (op > 0.001) {
              // clear of every card: a row shows only where no card is under it
              let sep = Infinity;
              for (let i = 0; i < n; i++) {
                const q = i * 4;
                const s = Math.max(box[q] - R.r, R.l - box[q + 2], box[q + 1] - bot, top - box[q + 3]);
                if (s < sep) sep = s;
              }
              op *= smoothstep(sep / G.gap);
              // and of the figure while it is still there
              if (aBox && aOp > 0.01) {
                const s = Math.max(aBox[0] - R.r, R.l - aBox[2], aBox[1] - bot, top - aBox[3]);
                op *= 1 - aOp * (1 - smoothstep(s / G.gap));
              }
            }
          }
          setOpacity(rows[k], op, rowOp, k);
          best = Math.max(best, op);
        }
        layerOf(statsEl).v = best;
        if (counts) {
          for (let k = 0; k < counts.length; k++) {
            const c = counts[k];
            if (!c) continue;
            writeFigure(c.f, c.f.value * (1 - (1 - c.t) * (1 - c.t)));
            setOpacity(c.f.el, smoothstep(c.t / 0.3), figOp, k);
          }
        }
      }
      if (lede) { const v = lede.style.opacity; layerOf(lede).v = v === '' ? 1 : +v; }
      for (const L of layers) {
        const off = L.v < 0.02;
        if (off !== L.off) { L.off = off; L.el.classList.toggle('orbit-faded', off); }
      }
    };

    const ro = window.ResizeObserver ? new ResizeObserver(() => { if (measure()) render(); }) : null;
    if (ro) ro.observe(stage);
    const onRefresh = () => { if (measure()) render(); };
    ScrollTrigger.addEventListener('refresh', onRefresh);

    inst = {
      cards, n, G, w, render, measure,
      dispose() {
        if (ro) ro.disconnect();
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        if (wheel) wheel.querySelectorAll('[data-orbit-clone]').forEach((c) => c.remove());
        own.forEach((c) => { c.classList.remove('is-spare'); c.style.transform = ''; c.style.willChange = ''; });
        if (anchor) { anchor.style.transform = ''; anchor.style.opacity = ''; }
        if (figLine) figLine.style.fontSize = '';
        if (statsEl) statsEl.style.transform = '';
        rows.forEach((r) => { r.style.opacity = ''; });
        layers.forEach((L) => L.el.classList.remove('orbit-faded'));
        figs.forEach((f) => { if (f) { f.el.textContent = f.text; f.el.style.opacity = ''; f.el.style.minWidth = ''; } });
        if (lede) { lede.style.fontSize = ''; lede.style.maxWidth = ''; }
        if (nAttr) root.style.setProperty('--n', nAttr); else root.style.removeProperty('--n');
        ['--sa', '--orbit-lede-top', '--orbit-inner-w', '--orbit-rows', '--orbit-bar'].forEach((p) => root.style.removeProperty(p));
        root.classList.remove('orbit-tall');
        if (root.__orbit === inst) root.__orbit = null;
      },
    };
    root.__orbit = inst;

    // ---- the timeline ----
    inst.timeline = (tl) => {
      inst.tl = tl;
      const H = () => stage.clientHeight || window.innerHeight;
      const later = { immediateRender: false };
      measure();
      // on a tall stage the figure rides down with the sinking hub and stays on screen longer
      const tall = !!G.tall;
      tl.eventCallback('onUpdate', render);
      tl.fromTo(w, { spin: 0 }, { spin: SPIN_A, duration: 0.2 }, 0);
      // the statement holds into the curl and fades while the crown lifts away from it (opacity only, so
      // it stays in the accessibility tree; kept, so a refresh can move it when its clearance changes)
      if (lede) tl.add(inst.ledeTw = gsap.fromTo(lede, { opacity: 1, y: 0 }, { opacity: 0, y: () => -0.04 * H(), duration: LEDE_FADE, ease: 'power1.in', ...later }), G.ledeEnd - LEDE_FADE);
      tl.fromTo(w, { m1: 0 }, { m1: 1, duration: 0.2, ...later }, 0.2);
      // the figure takes over inside the closing ring (render() blooms it with the ring)
      if (anchor) tl.add(inst.anchorTw = gsap.fromTo(w, { aIn: 0 }, { aIn: 1, duration: ANCHOR_IN, ease: 'power2.out', ...later }), G.anchorStart);
      tl.fromTo(w, { spin: SPIN_A }, { spin: SPIN_B, duration: ROLL_AT - 0.4, ...later }, 0.4);
      // one eased m2 drives both the hub and the turn, so the wheel rolls and never skids
      tl.fromTo(w, { m2: 0 }, { m2: 1, duration: ROLL, ease: 'power2.inOut', ...later }, ROLL_AT);
      if (anchor) tl.fromTo(w, { aOut: 0 }, { aOut: 1, duration: tall ? 0.11 : ANCHOR_OUT, ease: 'power1.in', ...later }, ANCHOR_OUT_AT);
      tl.fromTo(w, { spin: SPIN_B }, { spin: SPIN_C, duration: 1 - ROLL_AT - ROLL, ...later }, ROLL_AT + ROLL);
      if (rows.length) {
        // the column fades in as the wheel clears it (render() holds every row clear of the cards), rises
        // into place past the reading line, and ends with every row lit
        tl.fromTo(w, { sIn: 0 }, { sIn: 1, duration: 0.03, ease: 'power1.out', ...later }, STATS_AT);
        tl.fromTo(w, { col: 0 }, { col: 1, duration: COL_END - COL_AT, ...later }, COL_AT);
        tl.fromTo(w, { all: 0 }, { all: 1, duration: ALL, ease: 'power1.inOut', ...later }, ALL_AT);
        if (o.count) {
          // each figure stays hidden until its count starts as the reading line nears its row (a waiting
          // row never shows a false 0), then fades in counting up; render() writes both
          const m = rows.length;
          counts = figs.map((f, k) => {
            if (!f) return null;
            const c = { f, t: 0 };
            const on = COL_AT + (COL_END - COL_AT) * (m > 1 ? k / (m - 1) : 0);
            tl.fromTo(c, { t: 0 }, { t: 1, duration: 0.04, ...later }, Math.max(STATS_AT, on - 0.035));
            return c;
          });
        }
      }
      // the cards are composited only while the scene is near the screen
      ScrollTrigger.create({
        trigger: root, start: 'top bottom', end: 'bottom top',
        onToggle: (s) => { for (const c of cards) c.style.willChange = s.isActive ? 'transform' : ''; },
      });
      measure();
      render();
    };
    return inst;
  }

  window.Scenes = window.Scenes || {};
  window.Scenes['orbit-to-formation'] = (root, opts = {}) => {
    const o = {
      hold: clamp(num(opts.hold, 4), 4, 7),
      phoneHold: clamp(num(opts.phoneHold, 4), 3, 6),
      radius: clamp(num(opts.radius, 1), 0.7, 1.6),
      crest: clamp(num(opts.crest, 0.24), 0.18, 0.3),
      phoneCrest: opts.phoneCrest === undefined || opts.phoneCrest === 'auto' || isNaN(+opts.phoneCrest) ? 'auto' : clamp(+opts.phoneCrest, 0.14, 0.44),
      ring: clamp(num(opts.ring, 0.46), 0.36, 0.48),
      stagger: clamp(num(opts.stagger, 0.2), 0, 0.5),
      wind: opts.wind === 'spring' ? 'spring' : 'close',
      tilt: clamp(num(opts.tilt, 1), 0.2, 1),
      dim: clamp(num(opts.dim, 0.4), 0.4, 0.8),
      count: opts.count === true,
      phoneCards: Math.round(clamp(num(opts.phoneCards, 10), 6, 14)),
    };
    const scrub = opts.scrub !== undefined ? opts.scrub : (Stage.lenis ? true : 0.6);
    const build = (tl, ctx) => setup(root, ctx, o).timeline(tl);
    // the finished composition, whenever the section is not live: nothing the live scene wrote is left
    // behind, the ring has its count, and the statement and the figure are fitted
    const finish = () => {
      if (root.classList.contains('is-live')) return;
      if (root.__orbit) root.__orbit.dispose();
      // the finished ring needs the count even when the page forgot to set it
      if (!root.style.getPropertyValue('--n')) root.style.setProperty('--n', root.querySelectorAll('.orbit-card').length);
      fitFinished(root);
    };
    const mm = Stage.scene(root, {
      hold: o.hold, scrub, build, rest: finish,
      phone: opts.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build },
    });
    // The stage removes .is-live when the motion stops (reduced motion turned on, a phone width with
    // phone 'rest'), but on a desktop width with reduced motion its matchMedia runs no callback, so
    // rest() never comes: the scene watches its own class. A switch between two live versions (desktop
    // and phone) adds .is-live back in the same task, before this runs, and is left to the new build.
    if (window.MutationObserver) new MutationObserver(finish).observe(root, { attributes: true, attributeFilter: ['class'] });
    let lastW = 0;
    if (window.ResizeObserver) new ResizeObserver(() => { const w = root.clientWidth; if (w !== lastW) { lastW = w; finish(); } }).observe(root);
    if (document.fonts) document.fonts.ready.then(finish);
    finish();
    return mm;
  };
})();
