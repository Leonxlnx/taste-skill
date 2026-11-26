// assets/scenes/sheets-tip-in-and-away/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / sheets-tip-in-and-away.js — chapters as loose full-screen sheets, flat only at rest.
//
// Three to five chapters (projects, rooms, builds, collections) lie in one held stage as full-screen
// sheets of the page's own ground, each with its name set large along the top edge and a photograph
// filling the rest. A sheet comes up out of the lower-left corner turned about 10 degrees, straightens as
// it lands over the last one, and lies flat for about a third of a screen so its name can be read; then
// it tips away toward the upper-right corner (about 5 degrees the other way) while the next one is already
// coming in over it. Each photograph trails its sheet by a beat inside its window and catches up just
// after the sheet lands, so the sheet and its picture read as two layers of one page. The first sheet
// comes in while the section scrolls into place; the last one stays flat and the stage lets go of it.
// The page shuffles like loose pages instead of scrolling sections past.
//
// Use it for three to five parallel pieces with one strong photograph each, of one family (same kind of
// subject, same light) but with a clear change of colour between neighbours, so every hand-over says
// something. Not for two (no shuffle) or for six and more (a long ride with no way to skip).
//
// The frame is clipped (the stage's overflow: clip), every sheet is the stage's own ground, and each
// photograph is 10% larger than its window (5% past each edge), so no corner, gap or sideways overflow
// ever shows; the trail of a photograph is measured against that margin on every refresh. No tint, wash
// or shadow on a sheet in transit. Nothing moving crosses words being read, and no name is left sliced by
// an edge: a leaving sheet's words go as it starts to tip, its name riding off the top edge long before
// the arriving sheet could reach it, and the arriving sheet's words come up in the second half of its
// approach, once it is within the page margin of its place, so it arrives as ground and picture and is
// named as it settles.
//
// DOM (the script adds .st-paper and .st-pan when they are missing):
// <section class="scene" data-scene="sheets-tip-in-and-away" id="builds" aria-labelledby="st-title" data-options='{}'>
//   <div class="scene-stage">
//     <h2 class="st-heading" id="st-title">Section heading, 2-6 words</h2>   shown in the finished
//                                                                            composition; kept for screen
//                                                                            readers while the stage runs
//     <article class="st-sheet" data-piece="Name" style="--st-pos: 50% 55%; --st-pos-phone: 40% 50%">
//       <div class="st-paper">
//         <header class="st-words">
//           <h3 class="st-name">Name</h3>                 1-2 short words: it is set very large
//           <div class="st-meta">
//             <p class="st-line">One line, 3-8 words</p>  what it is: kind, size, year
//             <a class="st-link" href="…">See the build</a>   optional, the one accent
//           </div>
//         </header>
//         <figure class="st-window"><div class="st-pan">
//           <img class="st-photo" src="…" alt="…" width="…" height="…" loading="eager" decoding="async">
//         </div></figure>
//       </div>
//     </article>
//     … one article per chapter, 3 to 5 (2 shows the finished composition; 6+ runs, but holds long)
//   </div>
// </section>
// Pictures: one photograph per sheet, never repeated, at least 1920px wide. The desktop window is about
// 2:1 and the phone's about 1:2, so a picture whose subject sits in the middle third serves both; frame it
// with --st-pos (object-position, 768px and wider) and --st-pos-phone. Give each picture loading="eager":
// the stage moves them before they would scroll into view.
//
// Options (data-options JSON), default and range:
//   tilt        10     degrees a sheet is turned as it comes in (0-16)
//   tiltOut     5      degrees it is turned the other way as it leaves (0-12)
//   rest        0.34   screens each sheet lies flat (0.2-0.8): long enough to read the name
//   move        0.5    screens each hand-over takes (0.3-0.9)
//   lag         0.1    how far the photograph trails its sheet, as a share of a hand-over (0-0.25);
//                      0 keeps the picture fixed in its window
//   drift       0.08   sideways travel of a sheet, as a share of the stage's width (0-0.25); above 0.1
//                      a name can still be short of the page margin as its words come up
//   lean        6      degrees of perspective lean on wide screens, gone at rest (0-12; phones are 2D)
//   from        'left' 'left' (in from the lower left, out to the upper right) | 'right' (mirrored)
//   preroll     true   the first sheet comes in while the section scrolls into place
//   hold        auto   sheets x rest + (sheets - 1) x move: 2.02 screens for three; a number scales both
//   scrub       true with smooth scrolling, else 0.5 (0.3 on a phone)
//   phone       'same' 'same' (the phone plan below) | 'rest' (the finished composition)
//   phoneTilt 5, phoneTiltOut 2.5, phoneDrift 0.05, phoneMove 0.45   the phone plan: smaller angles, 2D,
//                      the same full-width sheets
//
// Page tokens: --ground (every sheet and the stage), --ink, --accent (the links), --font-display,
// --font-text, and the weights --display-weight (the names and the heading; 700 here when the page sets
// none), --strong-weight (the links; 600) and --text-weight (400). Scene tokens: --st-name-case (none;
// set uppercase for a face drawn for capitals), --st-name-size, --st-gutter, and per sheet --st-pos and
// --st-pos-phone. Timeline positions are fractions of the hold (0-1).
//
// Keyboard: a link on a sheet that is not at rest brings that sheet to rest when it takes focus.
(() => {
  const ID = 'sheets-tip-in-and-away';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }

  const RAD = Math.PI / 180;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const num = (v, d, lo, hi) => (v === undefined || v === null || v === '' || !Number.isFinite(+v) ? d : clamp(+v, lo, hi));
  const wrap = (parent, cls, kids) => {
    const el = document.createElement('div');
    el.className = cls;
    if (kids.length) kids[0].before(el); else parent.append(el);
    el.append(...kids);
    return el;
  };

  // Does a picture box (the window grown by ex and ey on each side) still cover its window when it is
  // moved by (dx, dy) and turned by th radians about its centre? Each window corner, carried into the
  // picture's own frame, must land inside the picture.
  const covers = (w, h, ex, ey, dx, dy, th) => {
    const c = Math.cos(th), s = Math.sin(th), hw = (0.5 + ex) * w, hh = (0.5 + ey) * h;
    for (const [px, py] of [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]) {
      const qx = px - dx, qy = py - dy;
      if (Math.abs(qx * c + qy * s) > hw + 0.5 || Math.abs(-qx * s + qy * c) > hh + 0.5) return false;
    }
    return true;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const sheets = stage ? [...stage.querySelectorAll(':scope > .st-sheet')] : [];
    const N = sheets.length;
    if (!stage || N < 2) {
      if (!stage) console.warn(ID + ': needs a .scene-stage holding .st-sheet articles');
      return Stage.scene(root, { build: null, phone: 'rest' });
    }
    root.style.setProperty('--n', N);

    // the moving parts: each sheet carries a paper (its layout; the first one's paper also takes the
    // pre-roll) and each window a pan (the photograph's box, 5% past every edge of the window)
    const papers = sheets.map((s) => s.querySelector(':scope > .st-paper') || wrap(s, 'st-paper', [...s.childNodes]));
    const windows = sheets.map((s) => s.querySelector('.st-window'));
    const pans = windows.map((w) => {
      if (!w) return null;
      const p = w.querySelector(':scope > .st-pan');
      if (p) return p;
      const media = w.querySelector(':scope > img, :scope > picture, :scope > video');
      return media ? wrap(w, 'st-pan', [media]) : null;
    });
    const photos = pans.map((p) => (p ? p.querySelector('img, video') : null));
    const words = sheets.map((s) => s.querySelector('.st-words'));
    // the words fade on the elements that hold the text themselves (the name, the line, the link), so a
    // sheet waiting below the stage or gone above it carries no visible text at all
    const inks = words.map((w) => (w ? [...w.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) : []));
    const names = sheets.map((s) => s.querySelector('.st-name'));
    const metas = sheets.map((s) => s.querySelector('.st-meta'));
    sheets.forEach((s, i) => s.style.setProperty('--i', i));

    // One size for every name: as large as the CSS allows (--st-name-size), and small enough that the
    // longest name stands on one line, beside the line and the link when that costs the name less than a
    // fifth of the size it would have over them (st-beside), else over them (st-under). Phones always
    // stack. Measured whenever the fonts, the width or the stage change; the finished composition takes
    // it too.
    const textWidth = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; };
    const fit = () => {
      const named = names.filter(Boolean);
      if (!named.length) return;
      root.style.removeProperty('--st-name-size');
      root.classList.remove('st-beside', 'st-under');
      root.classList.add('st-measuring');
      const w0 = named[0].closest('.st-words') || named[0].parentElement;
      const cs = getComputedStyle(w0);
      const cap = parseFloat(getComputedStyle(named[0]).fontSize);
      const avail = w0.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const gap = parseFloat(cs.columnGap) || 0;
      const nameW = Math.max(...named.map(textWidth));
      const metaW = Math.max(0, ...metas.filter(Boolean).map((m) => m.getBoundingClientRect().width));
      root.classList.remove('st-measuring');
      if (!cap || !avail || !nameW) return;
      // as shares of the CSS size: the name beside the line and the link, or over them at full width
      const kb = Math.min(1, metaW && !Stage.phone ? (avail - gap - metaW) / nameW : 0);
      const ku = Math.min(1, avail / nameW);
      const mode = !metaW || (kb >= 0.8 * ku && kb >= 0.5) ? 'beside' : 'under';
      const k = mode === 'beside' && metaW ? kb : ku;
      root.classList.add('st-' + mode);
      root.style.setProperty('--st-name-size', (cap * k * 0.985).toFixed(1) + 'px');
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    let fitT = 0;
    window.addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(() => { if (!root.classList.contains('is-live')) fit(); }, 120); }, { passive: true });
    photos.forEach((img) => { if (img && img.decode) img.decode().catch(() => {}); }); // decoded before they move

    const tilt = num(opts.tilt, 10, 0, 16);
    const desk = {
      phone: false,
      tilt,
      tiltOut: num(opts.tiltOut, Math.min(12, tilt / 2), 0, 12),
      rest: num(opts.rest, 0.34, 0.2, 0.8),
      move: num(opts.move, 0.5, 0.3, 0.9),
      drift: num(opts.drift, 0.08, 0, 0.25),
      lean: num(opts.lean, 6, 0, 12),
    };
    const ptilt = num(opts.phoneTilt, Math.min(desk.tilt, 5), 0, 8);
    const hand = {
      phone: true,
      tilt: ptilt,
      tiltOut: num(opts.phoneTiltOut, Math.min(desk.tiltOut, ptilt / 2), 0, 6),
      rest: desk.rest,
      move: num(opts.phoneMove, Math.min(desk.move, 0.45), 0.3, 0.9),
      drift: num(opts.phoneDrift, Math.min(desk.drift, 0.05), 0, 0.15),
      lean: 0,
    };
    const lag = num(opts.lag, 0.1, 0, 0.25);
    const side = opts.from === 'right' ? -1 : 1;   // +1: in from the lower left, out to the upper right
    // a given hold scales the rests and the hand-overs alike
    const length = (c) => N * c.rest + (N - 1) * c.move;
    const given = num(opts.hold, NaN, 1, 6);
    if (Number.isFinite(given)) for (const c of [desk, hand]) { const k = given / length(c); c.rest *= k; c.move *= k; }
    const scrub = opts.scrub !== undefined ? opts.scrub : Stage.lenis ? true : Stage.phone ? 0.3 : 0.5;

    // live state for the keyboard guard and the refreshes
    const S = { tl: null, pre: null, R: 0, M: 0, ink: [], inkAt: 0.5, inkOut: 0.3, live: false };

    // how far a sheet must travel to be wholly outside the stage at a turn of deg degrees (about its
    // centre), plus a margin: below it as it waits, above it once it has gone
    const clear = (st, deg) => {
      const W = st.clientWidth, H = st.clientHeight, a = Math.abs(deg) * RAD;
      return (H / 2) * (1 + Math.cos(a)) + (W / 2) * Math.sin(a) + 24;
    };

    // The photograph's trail: down and back toward the corner its sheet came from, turned a little
    // against the sheet's own turn, as large as the 5% margin of its box allows (90% of it, so an edge
    // never shows), scaled by the lag option. Measured on every build and refresh.
    const trail = [];
    const measureTrail = () => {
      const k = Math.min(1, lag / 0.08);
      pans.forEach((pan, i) => {
        const win = windows[i];
        if (!pan || !win || !k) { trail[i] = { x: 0, y: 0, r: 0 }; return; }
        const w = win.clientWidth, h = win.clientHeight;
        if (!w || !h) { trail[i] = { x: 0, y: 0, r: 0 }; return; }
        const ex = Math.max(0, (pan.offsetWidth / w - 1) / 2), ey = Math.max(0, (pan.offsetHeight / h - 1) / 2);
        const base = { x: -side * ex * w, y: ey * h, r: -side * 1.4 * RAD };
        let lo = 0, hi = 1;
        for (let n = 0; n < 18; n++) { const f = (lo + hi) / 2; if (covers(w, h, ex, ey, f * base.x, f * base.y, f * base.r)) lo = f; else hi = f; }
        const f = lo * 0.9 * k;
        trail[i] = { x: f * base.x, y: f * base.y, r: (f * base.r) / RAD };
      });
    };

    const build = (tl, { stage: st }, c) => {
      S.tl = tl;
      fit();
      measureTrail();
      const total = length(c), R = c.rest / total, M = c.move / total;
      S.R = R; S.M = M;
      const lagT = lag * M;
      const W = () => st.clientWidth;
      const persp = c.lean ? 1600 : 0;
      gsap.set(sheets, { transformOrigin: '50% 50%', transformPerspective: persp, force3D: !!c.lean });
      gsap.set(sheets[0], { x: 0, y: 0, rotation: 0, rotationX: 0 });
      tl.to({}, { duration: 1 }, 0); // positions below read as fractions of the hold

      for (let k = 1; k < N; k++) {
        const t0 = k * R + (k - 1) * M;   // the end of sheet k-1's rest
        const out = sheets[k - 1], inn = sheets[k];
        // the leaving sheet tips away toward the upper corner, slowly at first, its name off the top edge
        // long before the arriving sheet's edge could reach it. On a phone it starts a little sooner
        // (power1), so the band its name leaves is off the screen by the time the next name comes up and
        // the leaving photograph fills the top of the screen down to the arriving sheet
        tl.fromTo(out, { x: 0, y: 0, rotation: 0, rotationX: 0 }, {
          x: () => side * c.drift * W(), y: () => -clear(st, c.tiltOut), rotation: side * c.tiltOut, rotationX: -c.lean / 2,
          duration: M, ease: c.phone ? 'power1.in' : 'power2.in', immediateRender: false,
        }, t0);
        // the arriving sheet comes up out of the lower corner, turned, and straightens as it lands
        tl.fromTo(inn, { x: () => -side * c.drift * W(), y: () => clear(st, c.tilt), rotation: -side * c.tilt, rotationX: c.lean }, {
          x: 0, y: 0, rotation: 0, rotationX: 0, duration: M, ease: 'power2.out',
        }, t0);
        // the photographs trail their sheets: the arriving one catches up a beat after its sheet lands,
        // the leaving one falls behind as its sheet speeds away
        if (pans[k]) {
          tl.fromTo(pans[k], { x: () => trail[k].x, y: () => trail[k].y, rotation: () => trail[k].r }, {
            x: 0, y: 0, rotation: 0, duration: 0.55 * M + lagT, ease: 'power2.inOut',
          }, t0 + 0.45 * M);
        }
        if (pans[k - 1]) {
          tl.fromTo(pans[k - 1], { x: 0, y: 0, rotation: 0 }, {
            x: () => trail[k - 1].x, y: () => trail[k - 1].y, rotation: () => trail[k - 1].r,
            duration: 0.6 * M, ease: 'power2.in', immediateRender: false,
          }, t0);
        }
      }

      // pre-roll: the first sheet comes in while the section scrolls into place, and lands flat as the
      // stage takes hold (its paper moves, so nothing here fights the timeline above)
      S.pre = null;
      if (opts.preroll !== false && papers[0]) {
        const pre = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: scrub === true ? true : Math.min(+scrub || 0.5, 0.5), invalidateOnRefresh: true },
        });
        S.pre = pre;
        gsap.set(papers[0], { transformOrigin: '50% 50%', transformPerspective: persp, force3D: !!c.lean });
        pre.fromTo(papers[0], { x: () => -side * c.drift * W(), y: () => clear(st, c.tilt), rotation: -side * c.tilt, rotationX: c.lean }, {
          x: 0, y: 0, rotation: 0, rotationX: 0, duration: 1, ease: 'power2.out',
        }, 0);
        if (photos[0]) {
          pre.fromTo(photos[0], { x: () => trail[0].x, y: () => trail[0].y, rotation: () => trail[0].r }, {
            x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'power2.inOut',
          }, 0.45);
        }
        pre.to({}, { duration: 0 }, 1);
        pre.eventCallback('onUpdate', paintInks);
      }

      // the words are painted from both clocks at once (the pre-roll and the hold), so a jump across the
      // whole scene in either direction always leaves each sheet's words as its place on the page says
      S.ink = [];
      // phones drift and turn less, so their names are within the margin sooner and come up earlier; a
      // phone's leaving sheet starts sooner, so its words go sooner too
      S.inkAt = c.phone ? 0.32 : 0.5;
      S.inkOut = c.phone ? 0.2 : 0.3;
      S.live = true;
      tl.eventCallback('onUpdate', paintInks);
      paintInks();
      // the stage reverts its context on a breakpoint or a change to reduced motion: the words go with it
      if (gsap.context) gsap.context(() => () => { if (S.tl === tl) { S.live = false; clearInks(); } });
    };

    // How much of each sheet's words shows: the leaving sheet's go over the first 30% of its hand-over
    // (20% on a phone; power1.in), so no name is left sliced by the top edge; the arriving sheet's come
    // up over 50-75% of its approach (32-57% on a phone; power1.out), once it is within the page margin of
    // its place and still turned a degree or two, and are whole before it lands. The first sheet's come up
    // the same way in the pre-roll.
    const up = (x) => 1 - (1 - x) * (1 - x), down = (x) => x * x;
    function paintInks() {
      if (!S.live || !S.tl) return;
      const p = S.tl.progress(), R = S.R, M = S.M, at = S.inkAt;
      for (let k = 0; k < N; k++) {
        let a = k === 0
          ? (S.pre ? up(clamp((S.pre.progress() - at) / 0.25, 0, 1)) : 1)
          : up(clamp((p - (k * R + (k - 1) * M + at * M)) / (0.25 * M), 0, 1));
        if (k < N - 1) a *= 1 - down(clamp((p - ((k + 1) * R + k * M)) / (S.inkOut * M), 0, 1));
        const v = Math.round(a * 1000) / 1000;
        if (S.ink[k] !== v) { S.ink[k] = v; for (const e of inks[k]) e.style.opacity = String(v); }
      }
    }
    function clearInks() { S.ink = []; for (const e of inks.flat()) e.style.removeProperty('opacity'); }

    // a link on a sheet that is not at rest brings its sheet to rest before the reader reads on
    root.addEventListener('focusin', (e) => {
      const k = sheets.findIndex((s) => s.contains(e.target));
      const st = S.tl && S.tl.scrollTrigger;
      if (k < 0 || !st || !root.classList.contains('is-live')) return;
      const a = k * (S.R + S.M), b = a + S.R, p = S.tl.progress();
      if (p >= a - 0.002 && p <= b + 0.002) return;
      const y = Math.round(st.start + (a + S.R / 2) * (st.end - st.start));
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    // a refresh (fonts, pictures, a resize) sizes the names and measures the trails before the timelines
    // are measured again, and repaints the words after (a refresh renders the timelines without callbacks)
    if (window.ScrollTrigger) {
      ScrollTrigger.addEventListener('refreshInit', () => { fit(); if (root.classList.contains('is-live')) measureTrail(); });
      ScrollTrigger.addEventListener('refresh', () => { S.ink = []; paintInks(); });
    }

    const reset = () => {
      S.live = false;
      clearInks();
      fit();
      if (!window.gsap) return;
      gsap.set([...sheets, ...papers, ...pans, ...photos].filter(Boolean), { clearProps: 'transform,transformPerspective,willChange' });
    };

    return Stage.scene(root, {
      hold: length(desk),
      scrub,
      build: (tl, ctx) => build(tl, ctx, desk),
      phone: opts.phone === 'rest' ? 'rest' : { hold: length(hand), build: (tl, ctx) => build(tl, ctx, hand) },
      rest: reset,
    });
  };
})();
