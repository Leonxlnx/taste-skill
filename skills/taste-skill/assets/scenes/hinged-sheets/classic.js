// assets/scenes/hinged-sheets/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / hinged-sheets.js — paper with two printed sides, turned over one by one.
//
// Two to four tickets (prices, passes, stats, letters) lie face-down in one row under the section's
// headline: ink-coloured backs, each with one very large word. As the page scrolls they turn over, one
// by one, left to right, on a shared vanishing point, lifting a little towards the viewer at mid-turn,
// to their paper fronts. Each turn runs on a clock (0.8s) once the scroll passes its moment, and turns
// back when the scroll returns: never with the scroll, so wherever the reader stops every ticket lies
// flat and level, face-down or face-up, and the row fills the screen from the first frame. The headline
// and the line over the row stand over the row from the start; the fine print under it arrives after the
// last turn, and the finished row holds for the rest of the hold.
// Use it when the brand has a paper, ticket, stationery or print idea; without one the turning is a
// trick.
//
// The held row runs when every ticket can be at least 296px wide in one row with the band over the row
// and the fine print in their room (three tickets: about 1040 x 700 and up). Phones, tablets, short
// windows and more than four tickets get the flow version: no held stage; the tickets stand face-down in
// a column or a grid, and each turns over on its clock once its top is three quarters of the way up the
// screen, face-up before it is read; the fine print comes in after the last one. With phone 'rest' all
// of those screens, tablets as well as phones, show the finished composition instead. Reduced motion, no
// script and a failed CDN show the finished composition: headline, the line over the row, the tickets
// face-up, the fine print.
//
// DOM (optional parts can be left out):
//   <section class="scene" data-scene="hinged-sheets" id="tickets" aria-labelledby="hs-title">
//     <div class="scene-stage">
//       <div class="hs-head">
//         <h2 class="hs-title" id="hs-title">The sea is open all winter</h2>   4-7 words of plain text,
//                                                                            two lines
//         <p class="hs-sub">One sentence, under 20 words.</p>     optional: the finished composition and
//                                                               the flow show it; the held row has no room
//                                                               for it, so it may say nothing the lead,
//                                                               the tickets or the note do not
//       </div>
//       <p class="hs-lead">Prices for October to April</p>      3-8 words: what the prices are for (the
//                                                               season, the unit); it sits between the
//                                                               headline and the row
//       <ol class="hs-row" role="list">
//         <li class="hs-slot">                                 2-4 of them (5-12 run as the flow version)
//           <div class="hs-sheet">                             nothing here may fade, clip or filter
//             <article class="hs-face hs-face--front">
//               <img class="hs-photo" src alt="" width height>  optional, the top quarter; better left out:
//                                                             without it the ticket is printed type, the
//                                                             name large and the copy filling the sheet
//                                                             (a photo on top reads as a pricing card)
//               <div class="hs-body">
//                 <h3 class="hs-name">One swim</h3>             1-2 words
//                 <p class="hs-pitch">…</p>                     10-16 words with a photo, up to 20 without
//                 <ul class="hs-points"><li>…</li></ul>         2-3 points of 2-5 words
//               </div>
//               <div class="hs-stub">                          below the perforation
//                 <p class="hs-price"><span class="hs-amount">€14</span><span class="hs-per">a visit</span></p>
//                 <a class="hs-cta" href="…">Buy one swim</a>   optional
//               </div>
//             </article>
//             <div class="hs-face hs-face--back" aria-hidden="true">   shown only while live, and what
//                                                             the row shows first: make the words count
//               <span class="hs-big">1 swim</span>              one or two short words, very large
//               <span class="hs-brand">Selkie Sea Baths</span>
//               <span class="hs-small">Any day of the season</span>
//             </div>
//           </div>
//         </li>
//       </ol>
//       <p class="hs-note">One or two lines of fine print, 10-20 words.</p>
//     </div>
//   </section>
// The script makes the ground wash and the turn shades itself, and while live it gives each face and
// shade its paper, ink or shade as a bitmap background with the perforation punched through, so a
// moving ticket needs no mask. Give every front the same amount of copy: tickets keep a 1:1.414 shape.
// Keep the section to about 120 words in all, the lead, the fronts and the fine print (the backs do not
// count): past 130 it reads as a wall of copy, and the inspector says so.
//
// Options (data-options JSON; defaults in brackets):
//   hold     1.2-4             [0.6 + 0.5 x tickets: 2.1 for three]  screens the stage is held
//   scrub    true | 0.2-0.6    [true with Lenis, else 0.5]  the ground's brightening (the turns keep
//                                      their own clock)
//   turn     0.5-1.2 (seconds) [0.8]   how long one ticket takes to turn over
//   lift     0-60 (px)         [48]    how far each ticket comes towards the viewer at mid-turn
//   phone    'flip' | 'rest'   ['flip']  the per-ticket turn on phones, tablets and short windows, or the
//                                      finished composition on all of them
// (deck, stagger, wobble and lean belonged to the old deal from a tilted deck and are ignored.)
// The moments: ticket i turns at (i + 0.5) / (tickets + 0.3) of the hold and the fine print half a beat
// after the last (0.15, 0.45, 0.76 and 0.91 for three), so no third of the hold passes without a turn.
// Two tickets make only two beats in the hold, and scenes.mjs may warn of a dead hold: three or four read
// better.
//
// Page tokens: --accent (the one ink: the backs and every word, #b62118), --paper (#fafaf9),
// --font-display, --font-text, --radius (the page's one corner radius: the tickets and the button take
// it, up to 24px on a ticket; 0 when the page has none), and the weights --display-weight (headline,
// ticket names, prices, the big word on the back; 500), --strong-weight (the line over the row, the
// points, the button, the name on the back; 600) and --text-weight (400). Set each weight to one the
// page loads: a weight the font lacks is drawn at the nearest weight it has (fake bold is off). Scene
// tokens on the section:
// --hs-ground-a and --hs-ground-b (the ground at the start and at the end, a tint of a hue that sets off
// the ink; b clearly lighter, so the stage brightens as the tickets turn), --hs-title-end (the
// headline's size over the held row; clamp(36px, min(4.2vw, 7svh), 72px)) and --hs-shade-paper (what a
// front greys to as it turns away: a cool dark, never the ink).
//
// Scenes['hinged-sheets'](root, opts) returns a handle: { mm (the live gsap.matchMedia), revert() }.
// revert() stops the scene for good and leaves the finished composition.
(() => {
  const ID = 'hinged-sheets';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const opt = (v, d, lo, hi) => (typeof v === 'number' && Number.isFinite(v) ? clamp(v, lo, hi) : d);
  const RAD = Math.PI / 180;
  const SHADE = 0.42;     // darkest a face gets, edge-on
  const MIN_W = 296;      // narrowest ticket the held row runs with (its text is 14px there)
  // The moment ticket i of n turns, as a fraction of the hold: evenly spaced, the first after a short
  // scroll into the hold, the last near three quarters, so no stretch of three steps passes without one.
  // The fine print comes half a beat after the last.
  const moment = (i, n) => (i + 0.5) / (n + 0.3);

  // Any CSS colour as sRGB numbers, through a 1px canvas (it reads oklch() and color-mix() results).
  let pen = null;
  const rgbOf = (css) => {
    try {
      pen = pen || Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
      pen.clearRect(0, 0, 1, 1);
      pen.fillStyle = '#010203';
      pen.fillStyle = css;
      if (pen.fillStyle === '#010203') return null; // a colour this browser's canvas cannot read
      pen.fillRect(0, 0, 1, 1);
      const d = pen.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    } catch { return null; }
  };
  const make = (tag, cls, parent, first) => {
    const el = document.createElement(tag);
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    first ? parent.prepend(el) : parent.append(el);
    return el;
  };

  // The perforation while live. The finished composition cuts it with a CSS mask; a moving 3D face
  // must not have a mask or a clip-path: Chrome draws such a layer through a mask texture the size of
  // its projection, rebuilt as it turns, and a ticket lifted towards the viewer at mid-turn needs one of
  // several screens of pixels on every frame. Nor an SVG picture: on a moving 3D layer Chrome records
  // it again on every frame. So while live each surface (paper, ink and the two turn shades) is a
  // bitmap, drawn once at the ticket's size and the screen's density, with the holes already punched
  // out: a row of 26 holes and two edge notches on the line at 70% of the ticket, in the same
  // 1000 x 1414 box as the mask. The holes stay real (they show whatever is behind the ticket).
  const punched = (rgb, w, h) => {
    const k = Math.min(2, window.devicePixelRatio || 1);
    const c = document.createElement('canvas');
    c.width = Math.max(10, Math.round(w * k));
    c.height = Math.max(14, Math.round(h * k));
    const g = c.getContext('2d');
    g.fillStyle = `rgb(${rgb.join(',')})`;
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-out';
    const s = c.width / 1000, y = (990 / 1414) * c.height;
    const hole = (cx, r) => { g.moveTo((cx + r) * s, y); g.arc(cx * s, y, r * s, 0, 2 * Math.PI); };
    g.beginPath();
    hole(0, 26);
    hole(1000, 26);
    for (let x = 75; x <= 925; x += 34) hole(x, 8);
    g.fill();
    return `url("${c.toDataURL('image/png')}")`;
  };

  Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const row = root.querySelector('.hs-row');
    const slots = [...root.querySelectorAll('.hs-slot')].filter((s) => s.querySelector('.hs-sheet'));
    const sheets = slots.map((s) => s.querySelector('.hs-sheet'));
    const N = sheets.length;
    if (!stage || !row || !N) { console.warn(ID + ': needs .scene-stage, .hs-row and at least one .hs-slot > .hs-sheet'); return null; }

    const title = root.querySelector('.hs-title');
    const note = root.querySelector('.hs-note');
    const wash = stage.querySelector(':scope > .hs-wash') || make('div', 'hs-wash', stage, true);
    // reads the held row's ticket width from the CSS (one source)
    const gauge = stage.querySelector(':scope > .hs-gauge') || make('span', 'hs-gauge', stage);
    const shades = sheets.map((sh) => [...sh.querySelectorAll(':scope > .hs-face')].map((f) => f.querySelector(':scope > .hs-shade') || make('span', 'hs-shade', f)));
    // The backs are print (aria-hidden). While live each back lies over its own front, so their words
    // become generated content and are never counted as text lying on a ticket's words; the finished
    // composition (where the backs are not shown) has them as text again.
    const printed = [...root.querySelectorAll('.hs-face--back > *:not(.hs-shade)')].filter((el) => !el.children.length);
    const asPrint = (on) => {
      for (const el of printed) {
        if (on && el.dataset.print == null && el.textContent.trim()) { el.dataset.print = el.textContent.replace(/\s+/g, ' ').trim(); el.textContent = ''; }
        else if (!on && el.dataset.print != null) { el.textContent = el.dataset.print; delete el.dataset.print; }
      }
    };
    // The punched surfaces, in the page's own colours (read from the scene's tokens on every build).
    // Until they are set, or if a colour cannot be read, the faces stay solid, without holes. Each
    // face and shade gets its bitmap as its own inline background, never through a custom property: the
    // stage sets --p on the section on every frame, a background that reads a variable is resolved again
    // each time, and every face would be repainted on every frame.
    const surfaces = sheets.flatMap((sheet) => [...sheet.querySelectorAll(':scope > .hs-face')].flatMap((face) => {
      const front = face.classList.contains('hs-face--front');
      return [[face, front ? '--hs-paper' : '--hs-ink'], [face.querySelector(':scope > .hs-shade'), front ? '--hs-shade-paper' : '--hs-shade']];
    })).filter(([el]) => el);
    let cutW = 0;
    const unpunch = () => { for (const [el] of surfaces) el.style.removeProperty('background'); cutW = 0; };
    const punch = () => {
      const w = sheets[0].offsetWidth, h = sheets[0].offsetHeight;
      if (!w || !h) return;
      const probe = make('span', 'hs-probe', stage);
      probe.style.display = 'none';
      const pics = {};
      for (const token of ['--hs-paper', '--hs-ink', '--hs-shade-paper', '--hs-shade']) {
        probe.style.color = `var(${token})`;
        const rgb = rgbOf(getComputedStyle(probe).color);
        pics[token] = rgb && punched(rgb, w, h);
      }
      probe.remove();
      if (Object.values(pics).some((p) => !p)) return; // a colour this browser cannot read: solid faces
      for (const [el, token] of surfaces) el.style.background = `${pics[token]} 0 0 / 100% 100% no-repeat`;
      cutW = w;
    };
    slots.forEach((s, i) => s.style.setProperty('--i', i));
    if (N <= 4) root.style.setProperty('--n', N);
    root.querySelectorAll('img').forEach((img) => { if (img.decode) img.decode().catch(() => {}); }); // decoded before they move

    const o = {
      turn: opt(opts.turn, 0.8, 0.5, 1.2),
      lift: opt(opts.lift, 48, 0, 60),
    };
    const hold = opt(opts.hold, 0.6 + 0.5 * Math.min(N, 4), 1.2, 4);
    const scrub = typeof opts.scrub === 'boolean' ? opts.scrub : typeof opts.scrub === 'number' ? clamp(opts.scrub, 0.2, 0.6) : (Stage.lenis ? true : 0.5);

    // Turning: |sin(rotationY)| shades both faces, so the edge-on moment reads as paper, not a stray
    // line. Which face shows is left to backface-visibility alone: the browser knows where the eye is,
    // so nothing here can make a ticket vanish. data-face only takes the pointer off the face that is
    // turned away. Everything is read live from the sheet, never from a cache, and turn() runs on every
    // timeline update and after every refresh (a refresh renders the timeline with its events muted).
    const turn = (i) => {
      const sheet = sheets[i];
      const ry = gsap.getProperty(sheet, 'rotationY') * RAD;
      const s = Math.round(Math.abs(Math.sin(ry)) * SHADE * 1000) / 1000;
      const sh = shades[i];
      if (sh.last !== s) { sh.last = s; for (const el of sh) el.style.opacity = s; }
      const face = Math.cos(ry) >= 0 ? 'front' : 'back';
      if (sheet.dataset.face !== face) sheet.dataset.face = face;
    };
    const untouched = () => {
      sheets.forEach((sheet, i) => { delete sheet.dataset.face; shades[i].last = 0; for (const el of shades[i]) el.style.opacity = ''; });
      unpunch();
      row.removeAttribute('data-shut');
    };
    // One ticket's turn from its back to its front, on its own clock: paused, played forward when the
    // scroll passes its moment and back when it returns. Made inside the stage's context, so a revert
    // takes it (and the face-down start it sets) away again.
    // (d: seconds the turn waits once started, so tickets side by side in the flow still go left to right)
    const clock = (i, lift, d = 0) => {
      const sheet = sheets[i];
      return gsap.timeline({ paused: true, onUpdate: () => turn(i), onComplete: () => turn(i), onReverseComplete: () => turn(i) })
        .fromTo(sheet, { rotationY: 180, transformOrigin: '50% 50%' }, { rotationY: 0, duration: o.turn, ease: 'power2.inOut' }, d)
        .fromTo(sheet, { z: 0 }, { z: lift, duration: o.turn / 2, ease: 'sine.out' }, d)
        .to(sheet, { z: 0, duration: o.turn / 2, ease: 'sine.in' }, d + o.turn / 2);
    };
    // a clock set to its state at once (a refresh, a page opened part-way down) or run to it
    const toward = (t, on, now) => {
      if (now) { t.pause(); t.progress(on ? 1 : 0); }
      else if (on) t.play(); else t.reverse();
    };

    // The headline's line count at the held row's size decides how tall the band over the row is (the
    // CSS reads --hs-title-lines); measured before the room is.
    const measureTitle = () => {
      if (!title) return;
      const cs = getComputedStyle(title);
      const lh = parseFloat(cs.lineHeight) || 0.92 * parseFloat(cs.fontSize);
      root.style.setProperty('--hs-title-lines', lh > 0 ? Math.max(1, Math.round(title.offsetHeight / lh)) : 2);
    };
    // Is there room for the held row: one row, every ticket MIN_W or wider once the band over the row (the
    // headline and the line over the row) and the fine print under it have their room. The CSS works the
    // width out (--hs-deal-w); the gauge reads it.
    const roomy = () => {
      const W = window.innerWidth, H = window.innerHeight;
      if (N > 4 || W < 768 || H < 560) return false;
      return gauge.getBoundingClientRect().width >= MIN_W;
    };

    // the deal currently running (null in the flow), for the keyboard guard below
    let current = null;
    row.addEventListener('focusin', () => {
      if (!current || !root.classList.contains('is-live')) return;
      const { tl, open } = current, st = tl.scrollTrigger;
      if (!st || tl.progress() >= open) return;
      const y = st.start + 0.94 * (st.end - st.start);   // a keyboard user lands on the finished row
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    // ---- the held row: held stage, wide screens ----
    // The row lies face-down from the first frame under the headline and the line over the row. Ticket i
    // turns over on its clock once the timeline passes moment(i), the fine print comes in half a beat
    // after the last, and the ground brightens with the scroll as they turn. Nothing moves with the scroll
    // but the ground, so wherever the reader stops the row is level and every ticket is either face-down
    // or face-up.
    function deal(tl) {
      untouched();
      punch();
      asPrint(true);
      const at = sheets.map((_, i) => moment(i, N));
      const noteAt = moment(N - 0.5, N);
      const clocks = sheets.map((_, i) => clock(i, o.lift));
      const noteClock = note ? gsap.fromTo(note, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', paused: true }) : null;
      tl.fromTo(wash, { opacity: 0 }, { opacity: 1, duration: at[N - 1] }, 0);
      tl.set({}, {}, 1);

      // the row takes the pointer only once the last ticket has turned
      const open = at[N - 1];
      const on = sheets.map(() => false);
      let shut = null, noteOn = false;
      const update = (now) => {
        const p = tl.progress();
        clocks.forEach((c, i) => { const v = p >= at[i]; if (v !== on[i] || now === true) { on[i] = v; toward(c, v, now === true); } turn(i); });
        if (noteClock) { const v = p >= noteAt; if (v !== noteOn || now === true) { noteOn = v; toward(noteClock, v, now === true); } }
        const s = p < open;
        if (s !== shut) { shut = s; if (s) row.setAttribute('data-shut', ''); else row.removeAttribute('data-shut'); }
      };
      tl.eventCallback('onUpdate', update);
      update(true);
      current = { tl, open, update };
    }

    // ---- the flow: no held stage; each ticket turns over on its clock as it comes into view ----
    function flow() {
      untouched();
      punch();
      asPrint(true);
      current = null;
      const colOf = (i) => { let c = 0; for (let k = i - 1; k >= 0 && slots[k].offsetTop === slots[i].offsetTop; k--) c++; return c; };
      // the fine print comes in as the last ticket finishes turning
      const noteClock = note ? gsap.timeline({ paused: true }).fromTo(note, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, o.turn * 0.8) : null;
      sheets.forEach((sheet, i) => {
        const c = clock(i, Math.min(o.lift, 40), Math.min(0.3, colOf(i) * 0.12));
        const last = noteClock && i === N - 1;
        ScrollTrigger.create({
          trigger: slots[i], start: 'top 75%', invalidateOnRefresh: true,
          onEnter: () => { c.play(); if (last) noteClock.play(); },
          onLeaveBack: () => { c.reverse(); if (last) noteClock.reverse(); },
          // a page opened part-way down: the tickets above that line are face-up at once
          onRefresh: (self) => { if (self.progress > 0 && !c.isActive()) { c.pause().progress(1); if (last) noteClock.pause().progress(1); } turn(i); },
        });
        turn(i);
      });
    }

    // A refresh (resize, fonts, pictures, another scene) renders every timeline at its new progress
    // with events muted, so the clocks, the shades and data-face are set to it at once after each one;
    // and when the tickets changed size, their punched surfaces are drawn again at the new size.
    const refreshed = () => {
      if (!root.classList.contains('is-live')) return;
      if (current) current.update(true); else for (let i = 0; i < N; i++) turn(i);
      if (Math.abs(sheets[0].offsetWidth - cutW) > 2) punch();
    };

    let mm = null, dealing = null, timer = 0;
    const start = () => {
      mm = Stage.scene(root, {
        hold,
        scrub,
        phone: opts.phone === 'rest' ? 'rest' : { hold: 1, build: () => { root.classList.add('hs-flow'); flow(); } },
        // a wide screen without room for the row: the flow, or with phone 'rest' the finished
        // composition, as on a phone
        build: (tl) => {
          root.classList.remove('hs-flow');
          measureTitle();
          dealing = roomy();
          if (dealing) return deal(tl);
          if (opts.phone === 'rest') return Stage.REST;
          root.classList.add('hs-flow');
          return flow();
        },
        // the finished composition (reduced motion, phone 'rest', no room): the backs' words are text again
        rest: () => { untouched(); asPrint(false); root.classList.remove('hs-flow'); },
      });
    };
    const stop = () => {
      if (!mm) return;
      const k = Stage.scenes.indexOf(mm);
      if (k > -1) Stage.scenes.splice(k, 1);
      mm.revert();
      mm = null;
      current = null;
      untouched();
    };
    // The stage only switches at the phone width and on reduced motion; this scene also switches between
    // the held row and the flow (or the finished composition) when a resize changes whether the row fits.
    const resized = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!mm || Stage.phone || Stage.reduced || dealing === null || roomy() === dealing) return;
        stop();
        start();
        ScrollTrigger.refresh();
      }, 150);
    };
    start();
    if (mm) {
      window.addEventListener('resize', resized);
      ScrollTrigger.addEventListener('refresh', refreshed);
    }
    // one stable handle for the life of the section, whatever the resizes rebuild underneath it
    return {
      get mm() { return mm; },
      revert() {
        clearTimeout(timer);
        window.removeEventListener('resize', resized);
        if (window.ScrollTrigger) ScrollTrigger.removeEventListener('refresh', refreshed);
        stop();
        asPrint(false);
        root.classList.remove('hs-flow', 'is-live', 'is-rest');
      },
    };
  };
})();
