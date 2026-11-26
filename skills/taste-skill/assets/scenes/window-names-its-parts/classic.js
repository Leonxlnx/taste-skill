// assets/scenes/window-names-its-parts/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / window-names-its-parts.js — the product's own window takes stock of itself.
// The stage holds the product's window, built in HTML from 12 to 18 separate flat parts (a frame, a sidebar, a
// header, figure blocks, rows, buttons), beside a short list that has only its heading. Under the scroll the window
// steps back a little and tips in CSS 3D while its parts lift apart in depth, tier by tier (sidebar and header a
// little, figure blocks more, rows further, buttons furthest), shown only by the gaps between them. Then a solid band
// in the accent crosses the window from left to right, behind every part's words; each part it reaches turns to the
// accent for a beat (a fill, never an outline) while its plain sentence-case name drops into the next slot of the
// list. Last, the parts settle flat and the tilt eases out, the list complete beside the window. Scroll back undoes
// it. The visitor watches the product name its parts instead of reading feature copy.
// Needs stage.css + stage.js, GSAP 3.15.0 and ScrollTrigger (see stage.js for the script tags).
//
// It is a middle scene for software and AI products, the second big moment beside the product replay (never in the
// same section, and never its copy: no typed query, no drawn cursor, no beats of a task). The window is the
// product's real screen rebuilt in HTML, its parts real elements that each do something for the user, named by what
// they do ("Receipts read from a photo", never "Table row"). A screenshot, or a product without parts worth naming,
// takes a redraw.
//
// DOM (the script adds nothing to the window; it writes the list's names from the table):
//   <section class="scene" data-scene="window-names-its-parts" data-options='{"hold":1.5,"parts":[…]}' aria-labelledby="wn-h">
//     <div class="scene-stage">
//       <div class="wn-copy">
//         <h2 class="wn-heading" id="wn-h">A plain sentence, two lines at most</h2>   there from the start
//         <p class="wn-lead">One or two sentences: whose screen this is.</p>         optional
//         <ul class="wn-list">                                                         the names, for no script
//           <li class="wn-slot" data-part="months"><span class="wn-name">Months, each closed and locked</span></li> …
//         </ul>
//       </div>
//       <div class="wn-view">                               the perspective round the window
//         <div class="wn-window">                           the page's own grid of parts (its CSS lays them out)
//           <div class="wn-part wn-frame" data-ui aria-hidden="true"></div>   the window's ground, tier 0, unnamed
//           <div class="wn-part" data-part="months" data-ui data-crop>…</div> one element per part, all siblings
//           …
//         </div>
//       </div>
//     </div>
//   </section>
// Every part is a direct child of .wn-window, its own interface fragment (data-ui), set apart from the others by its
// flat fill (--wn-fill, mixed from the page's ground and ink) and the gaps of the window's grid: no borders, lines,
// outlines or shadows. Its words are real product content at 16px or more at rest. data-crop marks a part the phone
// leaves out (the window is cropped to its central parts there); give the list's slot for it data-crop too.
// Keep every part's words inside it at every width (the parts clip, so the band stays on them).
//
// THE PART TABLE (data-options "parts"), in order, one row per named part: the part's data-part key, its tier and its
// name. The tier is how far it lifts (1 a little … 4 furthest, the px from "lift"); the name is plain sentence case,
// what the part does for the user, with a short clause after it if that carries something (six words at most, never a
// code-style tag, never numbering):
//   "parts": [ { "part": "months", "tier": 1, "name": "Months, each closed and locked" },
//              { "part": "matched", "tier": 3, "name": "Payments matched to invoices", "at": 0.44 }, … ]
// The band names a part when its middle has gone about 56px into it (40% of a narrow part); parts it reaches together
// are named in table order, at least "gap" of the band's travel apart, so one row drops at a time. "at" (0-1 across
// the window) sets the point for a wide part (a row the whole width) so the names interleave; it is used only where
// it lies on the part at that width. The list's slots fill top to bottom in the order the band names the parts. When
// the script runs it writes the table's names into the list (the HTML list is the no-script copy: keep it the same).
// Without "parts" the table is read from the list (li[data-part], in order) and each part's data-tier.
//
// OPTIONS (data-options JSON) default, range
//   hold 1.5 (1.2-2)       screens the stage is held on desktop and tablet
//   phoneHold 1.2 (1-1.6)  the same on phones
//   scrub true             locked to the (Lenis-weighted) scroll; without Lenis 0.3s of catch-up. A number sets it
//   tilt 15 (6-22)         degrees the window tips back
//   turn 8 (-12-12)        degrees it turns about its upright axis (positive: its right edge away, toward the list)
//   depth 0.92 (0.84-1)    the scale it steps back to
//   lift [30,72,120,170]   px each tier lifts (tiers 1-4), shown only by the gaps. Seen from above the window
//                          (--wn-persp-origin), a higher tier slides down and right of the one under it, so the gaps
//                          between tiers open as clear ground; keep the grid's gaps at 12-16px
//   narrowLift 0.65 (0.3-1) the lifts are scaled by this on the stacked layout (768-1099px), where the list lies
//                          under the window and the lowest parts must not reach it
//   band 0.15 (0.08-0.2)   the band's width, a share of the window's width
//   beat 0.11 (0.06-0.2)   how much of the window the band crosses while a part it reached stays in the accent
//   gap 0.06 (0.03-0.1)    the least band travel between two names (shrinks to fit the last name in)
//   phone "same"           "same" (cropped window, no tilt or lift, band and names) | "rest"; phones under 640px tall
//                          get the finished composition
// CSS custom properties on the section: --wn-bg, --wn-ink, --wn-accent, --wn-frame, --wn-fill (per part), --wn-radius,
// --wn-frame-radius, --wn-gx, --wn-gap, --wn-persp, --wn-name-size (see the CSS).
//
// Timeline (fractions of the hold). Desktop and tablet: the window steps back and tips 0-0.22 (easing out, so the
// first tenth already shows it); tier k lifts from 0.02 + (k-1)*0.03 over 0.15 (tier 4 is up by 0.26); the band
// crosses 0.22-0.74 at an even pace, wholly inside the window (from its left edge to its right edge), then waits at
// the right edge until the last beat is over and leaves by 0.8 (the names land 0.22-0.72); the parts settle flat
// 0.82-1, the highest tier first (0.015 apart, 0.13 each), while the tilt eases out, so the last tenth still moves.
// Phones: the band 0.06-0.9, out by about 0.92; nothing else moves. The band is one CSS variable on the window
// (--wn-band-l, scrubbed); each part draws its stretch of it behind its own words (::before), so it never lies on text
// and never leaves the window; the frame draws none, so the gaps never show it. The band comes in and leaves on a short
// clock (a 0.16-0.22s fade, .is-band on the window), and a part shows its stretch only while it covers 24px or more
// of it (.is-cut below that, the same fade), so no step shows an orange sliver at an edge. The beats and the names
// are short timed clocks (CSS transitions, about 0.4s) that the band's position starts and reverses: a part is in
// the accent while the band's middle is within "beat" past its naming point, and its name is in its slot from that
// point on, so no settled step shows a row half-dropped or a part half-tinted. The slots are laid out from the start
// (the names wait above them, hidden), so nothing in the list is measured while it plays. On the stacked layouts
// (under 1100px) the heading, the window and the list start lowered by half the list's room (--wn-rise on the
// section), so the first frame is balanced, and rise as the names arrive, reaching their places with the last one.
(() => {
  if (!window.Stage) return;
  const ID = 'window-names-its-parts';
  const num = (v, d, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };

  const TIP = [0, 0.22];           // the window steps back and tips
  const LIFT0 = 0.02;              // tier 1 starts to lift
  const LIFT_STEP = 0.03;          // each tier after it starts this much later
  const LIFT_RUN = 0.15;           // a tier's lift
  const BAND = [0.22, 0.74];       // the band crosses, wholly inside the window (desktop, tablet)
  const OUT = 0.8;                 // the last beat and the band are over by here
  const SETTLE = [0.82, 1];        // the parts settle flat, the tilt eases out
  const SETTLE_RUN = 0.13;         // one tier's settle; tier 4 first, each lower tier 0.015 later
  const PHONE_BAND = [0.06, 0.9];
  const PHONE_OUT = 0.95;
  const INSET = 56;                // px into a part the band's middle goes before it names it (40% of a narrow part)
  const SLIVER = 24;               // px: a part shows less of the band than this as none at all

  const shown = (el) => !!el && el.getClientRects().length > 0;
  const esc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

  // The table: [{ key, el, tier, name, at, i }], in table order; rows whose part is missing are dropped.
  function readTable(root, win, opts) {
    const rows = Array.isArray(opts.parts)
      ? opts.parts
      : [...root.querySelectorAll('.wn-list [data-part]')].map((li) => ({ part: li.dataset.part, name: li.textContent }));
    return rows.map((r, i) => {
      const key = String((r && (r.part ?? r[0])) ?? '').trim();
      const el = key ? win.querySelector(`:scope > .wn-part[data-part="${esc(key)}"]`) : null;
      const tier = Math.round(num(r && (r.tier ?? r[1]) != null ? (r.tier ?? r[1]) : el?.dataset.tier, 1, 0, 4));
      const name = String((r && (r.name ?? r[2])) ?? '').replace(/\s+/g, ' ').trim();
      const at = r && r.at != null && Number.isFinite(Number(r.at)) ? Number(r.at) : null;
      return { key, el, tier, name, at, i };
    }).filter((e) => e.el && e.name);
  }

  // Writes names into the list's slots, one slot per entry, in the order given; spare slots are hidden.
  function render(list, entries) {
    if (!list) return;
    const slots = [...list.children].filter((c) => c.tagName === 'LI');
    while (slots.length < entries.length) {
      const li = document.createElement('li');
      li.className = 'wn-slot';
      list.appendChild(li);
      slots.push(li);
    }
    slots.forEach((li, k) => {
      const e = entries[k];
      li.classList.remove('is-in');
      li.__in = false;
      if (!e) { li.hidden = true; return; }
      li.hidden = false;
      li.classList.add('wn-slot');
      li.dataset.part = e.key;
      if (e.el.hasAttribute('data-crop')) li.setAttribute('data-crop', ''); else li.removeAttribute('data-crop');
      let span = li.querySelector('.wn-name');
      if (!span || li.children.length !== 1) { span = document.createElement('span'); span.className = 'wn-name'; li.replaceChildren(span); }
      if (span.textContent !== e.name) span.textContent = e.name;
      e.slot = li;
    });
  }

  function build(tl, ctx, o, phone) {
    const { root } = ctx;
    const win = root.querySelector('.wn-window');
    if (!win) return;
    const list = root.querySelector('.wn-list');
    const parts = [...win.querySelectorAll(':scope > .wn-part')];
    const table = readTable(root, win, o.raw);
    const [B0, B1] = phone ? PHONE_BAND : BAND;
    const END = phone ? PHONE_OUT : OUT;
    const narrow = window.matchMedia('(max-width: 1099px)');

    // Every place is measured from the layout (offsets, no transforms) once per refresh: the window's width, each
    // part's left edge (for its stretch of the band), the order and point at which the band names each part, and on
    // the stacked layouts how far the stack starts lowered (half the list's room, so the first frame is balanced).
    let G = null;
    const measure = () => {
      const W = win.offsetWidth || 1;
      const bw = Math.max(24, Math.round(W * o.band));
      win.style.setProperty('--wn-band-w', bw + 'px');
      for (const p of parts) p.style.setProperty('--wn-x', p.offsetLeft + 'px');
      // the band's middle, as a share of the window: it runs from cS (the band at the left edge) to cE (at the right
      // edge) over B0-B1, and runs on past cE unseen (the band waits at the right edge) until the last beat is over
      const cS = bw / 2 / W, cE = 1 - cS;
      const cv = (t) => cS + ((cE - cS) * (t - B0)) / (B1 - B0);
      const vis = table.filter((e) => shown(e.el)).map((e) => {
        const x = e.el.offsetLeft, w = e.el.offsetWidth;
        const lo = x / W, hi = (x + w) / W;
        const start = e.at != null && e.at >= lo && e.at <= hi ? e.at : (x + Math.min(w * 0.4, INSET)) / W;
        return { e, start: Math.max(cS, start) };
      }).sort((a, b) => a.start - b.start || a.e.i - b.e.i);
      // the last name comes while the band can still reach it, and its beat is over by END
      const last = Math.min(cE, cv(END) - o.beat - 0.01);
      const place = (g) => { let prev = -Infinity; return vis.map((v) => (prev = Math.max(v.start, prev + g))); };
      let at = place(o.gap);
      for (let g = o.gap - 0.005; at.length && at[at.length - 1] > last && g >= 0.03 - 1e-9; g -= 0.005) at = place(g);
      if (at.length > 1 && at[at.length - 1] > last) { const a0 = at[0], k = (last - a0) / (at[at.length - 1] - a0); at = at.map((t) => a0 + (t - a0) * k); }
      const order = vis.map((v, k) => ({ ...v.e, when: at[k] }));
      for (const p of parts) { p.classList.remove('is-lit'); p.__lit = false; }
      render(list, order);
      // the band leaves (a short fade) once it stands at the right edge and the last beat is over
      const out = Math.max(cE + 0.015, at.length ? at[at.length - 1] + o.beat : cE);
      let rise = 0;
      if (narrow.matches && list) rise = Math.round((list.offsetHeight + (parseFloat(getComputedStyle(list).marginTop) || 0)) / 2);
      // each part's span, for its stretch of the band (the frame carries none: the gaps never show the band)
      const spans = parts.filter((p) => !p.classList.contains('wn-frame')).map((el) => ({ el, x: el.offsetLeft, w: el.offsetWidth }));
      return { W, bw, order, cv, out, rise, spans, first: at.length ? at[0] : 0, lastAt: at.length ? at[at.length - 1] : 1 };
    };
    const geo = () => G || (G = measure());
    const forget = () => { G = null; };

    // 1. Desktop and tablet: the window steps back and tips while its parts lift, tier by tier; at the end they settle
    // flat, the highest first, and the tilt eases out.
    if (!phone) {
      tl.fromTo(win, { scale: 1, rotationX: 0, rotationY: 0, transformOrigin: '50% 50%' }, {
        scale: o.depth, rotationX: o.tilt, rotationY: o.turn, duration: TIP[1] - TIP[0], ease: 'power1.out',
      }, TIP[0]);
      for (let k = 1; k <= 4; k++) {
        // on the stacked layout the list lies under the window, so the parts lift less (narrowLift)
        const L = () => o.lift[k - 1] * (narrow.matches ? o.narrowLift : 1);
        const els = table.filter((e) => e.tier === k).map((e) => e.el);
        // one tween each (a fromTo over several targets renders only its first target's start state when it is made)
        for (const el of els) {
          tl.fromTo(el, { z: 0 }, { z: L, duration: LIFT_RUN, ease: 'power2.out' }, LIFT0 + (k - 1) * LIFT_STEP);
          tl.fromTo(el, { z: L }, { z: 0, duration: SETTLE_RUN, ease: 'power2.inOut', immediateRender: false }, SETTLE[0] + (4 - k) * 0.015);
        }
      }
      tl.fromTo(win, { scale: o.depth, rotationX: o.tilt, rotationY: o.turn }, {
        scale: 1, rotationX: 0, rotationY: 0, duration: SETTLE[1] - SETTLE[0], ease: 'power2.inOut', immediateRender: false,
      }, SETTLE[0]);
    }

    // 2. The band: wholly inside the window, its left edge runs from the window's left edge to one band short of its
    // right edge, at an even pace. It comes in and leaves on short clocks (a fade, .is-band on the window), so no step
    // ever shows a sliver of it at an edge.
    tl.fromTo(win, { '--wn-band-l': '0px' }, {
      '--wn-band-l': () => geo().W - geo().bw + 'px', duration: B1 - B0, ease: 'none',
    }, B0);

    // 3. The band's clocks, the beats and the names, from where its middle is (short timed clocks, started and
    // reversed by it), and on the stacked layouts the stack rising as the list fills.
    let band = null;
    let rise = null;
    const update = () => {
      const g = geo();
      const t = tl.time();
      const c = g.cv(t);
      const on = t >= B0 && c < g.out;
      if (band !== on) { band = on; win.classList.toggle('is-band', on); }
      // a part shows its stretch of the band only while it is SLIVER px wide or more: as the band comes onto a part or
      // leaves it, the stretch fades in or out on a short clock instead of thinning to an orange edge
      const bl = (g.W - g.bw) * Math.min(1, Math.max(0, (t - B0) / (B1 - B0)));
      const br = bl + g.bw;
      for (const s of g.spans) {
        const ov = Math.min(br, s.x + s.w) - Math.max(bl, s.x);
        const cut = ov < SLIVER;
        if (s.el.__cut !== cut) { s.el.__cut = cut; s.el.classList.toggle('is-cut', cut); }
      }
      for (const e of g.order) {
        const named = c >= e.when;
        const lit = on && named && c < e.when + o.beat;
        if (e.el.__lit !== lit) { e.el.__lit = lit; e.el.classList.toggle('is-lit', lit); }
        if (e.slot && e.slot.__in !== named) { e.slot.__in = named; e.slot.classList.toggle('is-in', named); }
      }
      const k = Math.min(1, Math.max(0, (c - g.first) / Math.max(0.001, g.lastAt - g.first)));
      const r = g.rise ? Math.round(g.rise * (1 - k) * 10) / 10 : 0;
      if (r !== rise) { rise = r; if (r) root.style.setProperty('--wn-rise', r + 'px'); else root.style.removeProperty('--wn-rise'); }
    };
    tl.eventCallback('onUpdate', update);
    const refreshed = () => { band = null; rise = null; update(); };
    ScrollTrigger.addEventListener('refreshInit', forget);
    ScrollTrigger.addEventListener('refresh', refreshed);
    geo();
    update();

    // Whatever was written outside GSAP goes back when the stage reverts this build.
    if (gsap.context) {
      gsap.context(() => () => {
        ScrollTrigger.removeEventListener('refreshInit', forget);
        ScrollTrigger.removeEventListener('refresh', refreshed);
        win.style.removeProperty('--wn-band-w');
        win.style.removeProperty('--wn-band-l');
        win.classList.remove('is-band');
        root.style.removeProperty('--wn-rise');
        for (const p of parts) { p.classList.remove('is-lit', 'is-cut'); p.__lit = false; p.__cut = undefined; p.style.removeProperty('--wn-x'); }
        if (list) for (const li of list.children) { li.classList.remove('is-in'); li.__in = false; }
      });
    }
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const LIFT = [30, 72, 120, 170];
    const lift = Array.isArray(opts.lift) && opts.lift.length >= 4 ? opts.lift.slice(0, 4).map((v, i) => num(v, LIFT[i], 0, 200)) : LIFT;
    const o = {
      raw: opts,
      hold: num(opts.hold, 1.5, 1.2, 2),
      phoneHold: num(opts.phoneHold, 1.2, 1, 1.6),
      scrub: opts.scrub != null && opts.scrub !== true ? num(opts.scrub, 0.3, 0, 0.8) || true : (Stage.lenis ? true : 0.3),
      tilt: num(opts.tilt, 15, 6, 22),
      turn: num(opts.turn, 8, -12, 12),
      depth: num(opts.depth, 0.92, 0.84, 1),
      lift,
      narrowLift: num(opts.narrowLift, 0.65, 0.3, 1),
      band: num(opts.band, 0.15, 0.08, 0.2),
      beat: num(opts.beat, 0.11, 0.06, 0.2),
      gap: num(opts.gap, 0.06, 0.03, 0.1),
    };
    // the finished composition (reduced motion, no GSAP, a phone set to rest) lists the table's names in table order
    const rest = () => {
      const win = root.querySelector('.wn-window');
      if (!win) return;
      render(root.querySelector('.wn-list'), readTable(root, win, opts));
    };
    const phoneRest = opts.phone === 'rest' || window.innerHeight < 640;
    return Stage.scene(root, {
      hold: o.hold,
      scrub: o.scrub,
      build: (tl, ctx) => build(tl, ctx, o, false),
      phone: phoneRest ? 'rest' : { hold: o.phoneHold, build: (tl, ctx) => build(tl, ctx, o, true) },
      rest,
    });
  };
})();
