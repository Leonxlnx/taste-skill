// assets/scenes/window-relay-with-stamps/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / window-relay-with-stamps.js — "Window relay with a trail of stamps".
//
// A held stage tells a short set of four to six pictures of one family (a collection, the rooms of a
// house, the courses of a menu) as a relay. The current picture rests whole in a large main slot with its
// name set large beside it. The next one waits as a small window in the slot's top left corner, showing
// that picture whole at a small size, so it reads as the next picture, not a swatch. At the hand-over the
// window opens over the current picture, growing from its corner until it covers the slot (its photograph
// grows with it, from the small whole view to the full one). It leaves one stamp-sized box open in the
// opposite corner, where the current picture stays on top and shrinks into its stamp as the window
// closes round it, then slides out of that corner, whole, into the first place of a short trail; the
// stamps already there move one place along and the oldest leaves at the far end, so the trail never
// holds more than four. The name changes in one step as the new picture becomes the larger one, never
// half-way, the chip after that grows out of the corner, and each arrival rests whole for a beat.
//
// Requires stage.js (and stage.css), GSAP 3.15.0 + ScrollTrigger 3.15.0. Load window-relay-with-stamps.css.
// Call Stage.smooth() before Stage.init(), so the scene knows whether Lenis is running. No SplitText.
//
// DOM (the list is the finished composition as it is: a heading over the pieces, each a picture and its caption):
//
// <section class="scene" id="bowls" data-scene="window-relay-with-stamps" data-options='{"hold":2.4}' aria-labelledby="wr-title">
//   <div class="scene-stage">
//     <h2 class="wr-title" id="wr-title">Two hundred years of one family</h2>
//     <ol class="wr-set">
//       <li class="wr-piece">
//         <figure class="wr-frame"><img src="piece.jpg" width="2000" height="1500" alt="What the picture shows"></figure>
//         <div class="wr-cap"><h3 class="wr-name">Chōjirō</h3><p class="wr-line">One line about this piece.</p></div>
//       </li>
//       … four to six pieces in all
//     </ol>
//   </div>
// </section>
//
// The script adds an invisible .wr-plan of boxes (.wr-at-main, .wr-at-chip and one .wr-at-stamp per place in
// the trail) that the CSS lays out for each shape of screen; it reads them on every refresh and moves the
// frames between them. The chip box shares the main slot's top left corner and its shape, so the arriving
// window grows from that corner. To change the composition, change those boxes in the CSS, not the script.
//
// Content:
//   Four to six pictures of one family: same light, same grade, one kind of subject (with fewer than three the
//   trail is pointless; the script runs from two but warns). Each photograph at least 1.5 times the main slot's
//   width (2000px wide covers 1440 screens) and its width and height attributes set (the script reads its
//   shape from them). The subject whole and in the middle, with some plain ground round it: the chip shows
//   the whole picture small, the stamp a tall crop through the subject, the main slot the subject large; and
//   the chip sits over the slot's top left corner at rest, so that corner of every picture but the last
//   should be plain ground. --wr-focus: 50% 55% on an img (the default) is the point the slot, the chip and
//   the stamp centre on, and its object-position in the finished composition.
//   Names: one or two words in the display face (set large beside the frame; 9 characters or fewer keep to
//   one line at 1440). One line each: 6 to 14 words in the text face, sentence case, saying what the picture
//   shows. The heading names the set in a few words (about 32 characters; on wide screens it sits above the
//   trail and labels it, on portrait screens it is kept for screen readers while the scene runs).
//
// Wide screens (landscape, 700px and up): the main slot on the left, 64% of the width and the stage's full
// height inside the margins; a caption band on its right with the name and line at the top, the heading
// lower down and the trail along the bottom edge, newest stamp nearest the main slot. The chip sits in the
// slot's top left corner; the leaving picture shrinks into its lower right corner and slides out into the
// trail.
//
// Options (data-options JSON), defaults and ranges:
//   hold       0.6 a hand-over   screens the stage is held for (1.2-3.2): 2.4 for five pictures, 1.8 for four, 3 for six
//   phoneHold  0.55 a hand-over  screens held on phones under 768px (1.2-3.2): 2.2 for five
//   phone      'same'   'same' runs the phone plan below; 'rest' shows the finished composition on phones
//   swap       0.3      share of the hold the hand-overs take together (0.3-0.55); the rest are the beats where a
//                       picture rests whole with its name. Raise it for slower hand-overs and shorter rests.
//   trail      4        places in the trail (1-4); older stamps leave at the far end
//   phoneTrail 2        places on phones under 768px (1-4); 1 with fewer than five pictures. The phone's chip
//                       and stamps are about one size, so a longer trail shows a picture on three screens of the
//                       scroll, small each time (the inspector's repeated-picture at 390)
//   peek       0.74     share of its photograph's width the waiting chip shows (0.5-1): the whole subject, small
//   crop       0.56     share of its photograph's width a stamp shows (0.35-0.9): a tall crop through the subject
//   radius     page     one corner radius in px for every frame, chip and stamp (0-24); defaults to the page's
//                       --radius, else square. Drawn by the clip, held at the same visible size at every scale
//                       (the arriving window's cut corner box stays square while the stamp leaves it).
//   scrub      auto     true (locked to the scrollbar) when Lenis runs, else 0.5 s of catch-up (0-1). The move has
//                       no lag of its own, so a page without Stage.smooth() should keep the catch-up.
//
// Phone plan (under 768px, and any portrait screen): the same relay rearranged. The window takes the full
// width at the photographs' own 4:3 (75vw tall, two thirds of the screen at most), so every subject rests
// whole, with the chip in its top left corner; the heading sits just above it, the trail (two places on a
// phone) runs along the window's bottom edge, newest stamp at the right, and the name and line sit under the
// trail, so the stamp that slides out of the window's lower right corner never crosses them. The group is
// centred on the screen. On a screen under 620px tall the heading is kept for screen readers while it runs.
// Hold 2.2 for five. Touch scrolling is never smoothed.
//
// Reduced motion, no script, a failed CDN, or phone: 'rest': the finished composition, the heading over the
// pieces in a row (two columns on tablets with the first piece across both, one column on phones), each with
// its name and line under it.
//
// Page tokens it follows: --ground, --ink, --accent (the current name, and nothing else in the scene),
// --font-display, --font-text, --display-weight (400 here when the page sets none), --text-weight, --margin,
// --radius.
//
// Only transform, opacity, visibility and clip-path change while it runs; the frames are laid out once per
// refresh. The script writes custom properties (--wr-t, --wr-clip, --wr-o, --wr-v, and the photograph's box
// --wr-pw/--wr-ph on each frame) that the CSS reads only under .is-live, so the finished composition never
// carries a half-applied style.
//
// crosses words: nothing. The pictures move in the main slot and the trail; the caption and the heading
// sit outside every path, and the name changes in one step.
(() => {
  const ID = 'window-relay-with-stamps';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => {
    const x = typeof v === 'string' && v.trim() !== '' ? +v : v;
    return typeof x === 'number' && Number.isFinite(x) ? clamp(x, a, b) : d;
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (u, [a, b]) => clamp((u - a) / (b - a), 0, 1);
  const io2 = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
  const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - 4 * (1 - t) ** 3);
  const out2 = (t) => 1 - (1 - t) * (1 - t);
  const out3 = (t) => 1 - (1 - t) ** 3;
  const px = (v) => Math.round(v * 100) / 100;
  const lerpRect = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

  // One hand-over, in fractions of its own length. The arriving window covers the whole slot before the
  // leaving picture moves, so the two never stand as two half windows with ground between them, and no
  // edge of the old picture shows beside the new one. The arriving window leaves one stamp-sized box open
  // in the slot's far corner (the corner nearest the trail): the leaving picture shows there, on top, and
  // shrinks into it, so its shrinking is seen, and it leaves that box as a whole stamp.
  const PH = {
    grow: [0, 0.61],     // the arriving window opens over the current picture, from the chip's corner to the whole slot
    land: 1.15,          // it lands with some speed, covering the slot at 0.42 (the in-out ease is cut at 1/land), so
                         // almost no frame shows it all but covering the slot with a thin seam of the old picture
    name: 0.32,          // the caption changes here, in one step, as the arriving window becomes the larger picture
    size: [0.42, 0.62],  // the leaving picture shrinks into its stamp inside the box in the far corner
    shift: [0.52, 0.78], // the stamps already in the trail move one place along; the oldest leaves at the far end
    hop: [0.64, 0.92],   // the new stamp slides out of the corner into the trail's first place
    next: [0.7, 0.95],   // the chip after that grows out of the corner, whole at every size
  };

  const writer = (el, prop) => { let last = null; return (v) => { if (v !== last) { last = v; el.style.setProperty(prop, v); } }; };
  // "44% 52%" → [0.44, 0.52]; anything else falls back to the middle, a little low (where a subject on a table sits)
  const spotOf = (v) => {
    const m = String(v || '').trim().match(/^(-?[\d.]+)%\s+(-?[\d.]+)%$/);
    return m ? [clamp(+m[1] / 100, 0, 1), clamp(+m[2] / 100, 0, 1)] : [0.5, 0.55];
  };

  function make(root, opts = {}) {
    const Stage = window.Stage;
    const stage = root.querySelector(':scope > .scene-stage');
    const set = root.querySelector('.wr-set');
    const pieces = set ? [...set.children].filter((el) => el.classList.contains('wr-piece')) : [];
    const frames = pieces.map((p) => p.querySelector('.wr-frame'));
    const imgs = frames.map((f) => (f ? f.querySelector('img') : null));
    const n = pieces.length;
    if (!stage || n < 2 || frames.some((f) => !f)) { console.warn(ID + ': needs a .scene-stage holding a .wr-set of two or more .wr-piece, each with a .wr-frame'); return null; }
    if (n < 3) console.warn(ID + ': with fewer than three pictures the trail of stamps says nothing');
    const H = n - 1; // hand-overs
    const o = {
      hold: num(opts.hold, clamp(0.6 * H, 1.2, 3.2), 1.2, 3.2),
      phoneHold: num(opts.phoneHold, clamp(0.55 * H, 1.2, 3.2), 1.2, 3.2),
      phone: opts.phone === 'rest' ? 'rest' : 'same',
      swap: num(opts.swap, 0.3, 0.3, 0.55),
      trail: Math.round(num(opts.trail, 4, 1, 4)),
      phoneTrail: Math.round(num(opts.phoneTrail, n >= 5 ? 2 : 1, 1, 4)),
      peek: num(opts.peek, 0.74, 0.5, 1),
      crop: num(opts.crop, 0.56, 0.35, 0.9),
      scrub: opts.scrub,
    };
    if (opts.radius != null) root.style.setProperty('--wr-radius', num(opts.radius, 0, 0, 24) + 'px');

    // the plan: invisible boxes laid out by the CSS for each shape of screen
    let plan = stage.querySelector(':scope > .wr-plan');
    if (!plan) {
      plan = document.createElement('div');
      plan.className = 'wr-plan';
      plan.setAttribute('aria-hidden', 'true');
      for (const c of ['main', 'chip']) { const b = document.createElement('div'); b.className = 'wr-at-' + c; plan.appendChild(b); }
      for (let i = 0; i < Math.max(o.trail, o.phoneTrail); i++) { const b = document.createElement('div'); b.className = 'wr-at-stamp'; b.style.setProperty('--i', String(i)); plan.appendChild(b); }
      stage.appendChild(plan);
    }
    // later pieces lie over earlier ones: the arriving window over the current picture, the next chip over both
    frames.forEach((f, k) => f.style.setProperty('--wr-z', String(k + 1)));

    // the schedule: a short first beat (the picture was seen as the stage arrived), then a hand-over and a
    // full beat for each picture after it
    const hl = o.swap / H;
    const beat = (1 - o.swap) / (0.75 + (n - 2) + 1);
    const A = Array.from({ length: H }, (_, i) => 0.75 * beat + i * (hl + beat));
    const U = (i, p) => (i < 0 || i >= H ? 0 : clamp((p - A[i]) / hl, 0, 1));

    const scrub = o.scrub === true ? true : typeof o.scrub === 'number' ? clamp(o.scrub, 0, 1) : Stage.lenis ? true : 0.5;

    const build = (tl, ctx) => {
      let g = null;
      const places = ctx && ctx.phone ? o.phoneTrail : o.trail;
      const box = (el, s) => { const r = el.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; };
      const measure = () => {
        const s = stage.getBoundingClientRect();
        if (!s.width || !s.height) return null;
        const at = (c) => plan.querySelector(':scope > .wr-at-' + c);
        const M = box(at('main'), s);
        let C = box(at('chip'), s);
        const S = [...plan.querySelectorAll(':scope > .wr-at-stamp')].slice(0, places).map((el) => box(el, s));
        if (!M.w || !M.h || !S.length) return null;
        if (C.w < 2 || C.h < 2) C = { x: M.x, y: M.y, w: M.w * 0.22, h: M.h * 0.22 };
        // one step past the far end of the trail: where the oldest stamp leaves
        const last = S[S.length - 1], prev = S[S.length - 2];
        const X = prev ? { ...last, x: last.x + (last.x - prev.x), y: last.y + (last.y - prev.y) } : last;
        // the corner of the main slot nearest the trail's first place: the leaving frame shrinks into it
        const sx = S[0].x + S[0].w / 2 > M.x + M.w / 2 ? 1 : 0;
        const sy = S[0].y + S[0].h / 2 > M.y + M.h / 2 ? 1 : 0;
        const radius = parseFloat(getComputedStyle(root).getPropertyValue('--wr-radius')) || 0;
        // the stamp-sized box in that corner, which the arriving window leaves open for the leaving picture
        const B = { x: M.x + sx * (M.w - S[0].w), y: M.y + sy * (M.h - S[0].h), w: S[0].w, h: S[0].h };
        // each photograph's box: its own shape, just covering the main slot (scale 1 fills the slot)
        const P = frames.map((f, k) => {
          const img = imgs[k];
          const aw = img ? +img.getAttribute('width') || img.naturalWidth : 0;
          const ah = img ? +img.getAttribute('height') || img.naturalHeight : 0;
          const ar = aw && ah ? aw / ah : M.w / M.h;
          const pw = ar >= M.w / M.h ? M.h * ar : M.w, ph = pw / ar;
          f.style.setProperty('--wr-pw', px(pw) + 'px');
          f.style.setProperty('--wr-ph', px(ph) + 'px');
          const [fx, fy] = spotOf(getComputedStyle(img || f).getPropertyValue('--wr-focus'));
          // the chip shows `peek` of the photograph's width (the whole subject, small); a stamp `crop` of it
          return { pw, ph, fx: fx * pw, fy: fy * ph, sC: C.w / (o.peek * pw), sS: S[0].w / (o.crop * pw) };
        });
        return { M, C, S, X, B, P, sx, sy, radius };
      };

      // where each piece's window is (r) and how large its photograph is drawn (s), at progress p
      // the chip grows out of the slot's corner as a whole small picture (window and photograph together)
      const chipIn = (k, t) => ({ r: { x: g.C.x, y: g.C.y, w: g.C.w * t, h: g.C.h * t }, s: g.P[k].sC * t, o: t > 0.02 ? 1 : 0 });
      const arriving = (k, u) => {
        const a = Math.min(1, PH.land * io3(seg(u, PH.grow)));
        return { r: lerpRect(g.C, g.M, a), s: lerp(g.P[k].sC, 1, a), o: 1 };
      };
      // leaving: whole under the arriving window while it grows; once the window covers the slot, only the
      // box in the far corner shows it, so its window becomes that box and its photograph zooms out inside
      // it to the stamp's view (the same crop as the rest frame at first, so nothing jumps); then the stamp
      // slides out of the box into the trail
      const leaving = (k, u) => {
        const { M, B } = g, S0 = g.S[0], ph = g.P[k];
        if (u < PH.size[0]) return { r: M, s: 1, o: 1, leaving: true };
        const t = out3(seg(u, PH.size)), b = io2(seg(u, PH.hop));
        const wx0 = clamp(ph.fx - M.w / 2, 0, ph.pw - M.w), wy0 = clamp(ph.fy - M.h / 2, 0, ph.ph - M.h);
        const c = { x: lerp(wx0 + B.x - M.x + B.w / 2, ph.fx, t), y: lerp(wy0 + B.y - M.y + B.h / 2, ph.fy, t) };
        return { r: b > 0 ? lerpRect(B, S0, b) : B, s: Math.exp(Math.log(ph.sS) * t), c, o: 1, leaving: true };
      };
      const meet = (a, b) => {
        const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
        const w = Math.min(a.x + a.w, b.x + b.w) - x, h = Math.min(a.y + a.h, b.y + b.h) - y;
        return w > 0.5 && h > 0.5 ? { x, y, w, h } : null;
      };
      // the window's outline while the leaving picture shows in the far corner: a rectangle (L, T, R, Bm, in
      // the photograph's own pixels, its corners rounded by q) with the corner (sx, sy) cut away to the point
      // (ix, iy). Drawn for a cut in the lower right corner, then mirrored to the corner it is really in.
      const notched = (L, T, R, Bm, q, ix, iy, sx, sy) => {
        const X = (x) => px(sx ? x : L + R - x), Y = (y) => px(sy ? y : T + Bm - y);
        const cx = sx ? ix : L + R - ix, cy = sy ? iy : T + Bm - iy;
        const sw = (sx ? 0 : 1) + (sy ? 0 : 1) === 1 ? 0 : 1; // one mirror turns the arcs the other way
        const arc = (x, y) => (q > 0.01 ? ` A ${px(q)} ${px(q)} 0 0 ${sw} ${X(x)} ${Y(y)}` : '');
        return `path('M ${X(L + q)} ${Y(T)} L ${X(R - q)} ${Y(T)}${arc(R, T + q)} L ${X(R)} ${Y(cy)} L ${X(cx)} ${Y(cy)}`
          + ` L ${X(cx)} ${Y(Bm)} L ${X(L + q)} ${Y(Bm)}${arc(L, Bm - q)} L ${X(L)} ${Y(T + q)}${arc(L + q, T)} Z')`;
      };
      const place = (j) => (j < g.S.length ? g.S[j] : g.X);
      const inTrail = (k, pos) => {
        const j = Math.floor(pos + 1e-6), t = clamp(pos - j, 0, 1);
        if (j >= g.S.length) return null;
        const r = t > 0 ? lerpRect(place(j), place(j + 1), t) : place(j);
        return { r, s: g.P[k].sS, o: j + 1 >= g.S.length ? 1 - t : 1 };
      };
      const stateOf = (k, p) => {
        if (k >= 1 && U(k - 1, p) <= 0) {
          // waiting in the corner: the second picture from the start, each later one fading up during the
          // hand-over before its own
          const t = k === 1 ? 1 : out2(seg(U(k - 2, p), PH.next));
          return t > 0.01 ? chipIn(k, t) : null;
        }
        if (k >= 1 && U(k - 1, p) < 1) return arriving(k, U(k - 1, p));
        if (k >= H || U(k, p) <= 0) return { r: g.M, s: 1, o: 1 };
        if (U(k, p) < 1) return leaving(k, U(k, p));
        // in the trail: one place further along with each later hand-over
        let pos = 0;
        for (let m = k + 1; m < H; m++) {
          const u = U(m, p);
          if (u <= 0) break;
          pos = m - k - 1 + io2(seg(u, PH.shift));
        }
        return inTrail(k, pos);
      };

      const W = frames.map((f) => ({ t: writer(f, '--wr-t'), c: writer(f, '--wr-clip'), o: writer(f, '--wr-o'), v: writer(f, '--wr-v') }));
      let cur = -1;
      const P = { v: 0 };
      const render = () => {
        if (!root.classList.contains('is-live')) return;
        if (!g) g = measure();
        if (!g) return;
        const p = P.v;
        const states = frames.map((f, k) => stateOf(k, p));
        // the leaving picture shows over the arriving one inside the far corner's box: cut that part out of
        // the arriving window
        const lk = states.findIndex((st) => st && st.leaving);
        const inBox = lk >= 0 ? meet(g.B, states[lk].r) : null;
        const cut = inBox && states[lk + 1] ? meet(inBox, states[lk + 1].r) : null;
        frames.forEach((f, k) => {
          const st = states[k], w = W[k];
          if (!st) { w.v('hidden'); return; }
          const { r } = st, ph = g.P[k];
          // never draw the photograph smaller than the window it fills
          const s = Math.max(st.s, r.w / ph.pw, r.h / ph.ph);
          // the window, in the photograph's own (unscaled) pixels, centred on its focus as far as the edges allow
          const ww = r.w / s, wh = r.h / s, fc = st.c || { x: ph.fx, y: ph.fy };
          const wx = clamp(fc.x - ww / 2, 0, ph.pw - ww), wy = clamp(fc.y - wh / 2, 0, ph.ph - wh);
          const q = Math.min(g.radius / s, ww / 2, wh / 2);
          w.t(`translate3d(${px(r.x - wx * s)}px, ${px(r.y - wy * s)}px, 0) scale(${Math.round(s * 10000) / 10000})`);
          if (cut && k === lk + 1) {
            const ix = wx + ((g.sx ? cut.x : cut.x + cut.w) - r.x) / s, iy = wy + ((g.sy ? cut.y : cut.y + cut.h) - r.y) / s;
            w.c(notched(wx, wy, wx + ww, wy + wh, q, ix, iy, g.sx, g.sy));
          } else {
            w.c(`inset(${px(wy)}px ${px(ph.pw - wx - ww)}px ${px(ph.ph - wy - wh)}px ${px(wx)}px round ${px(q)}px)`);
          }
          w.o(st.o >= 0.999 ? '1' : String(px(st.o)));
          w.v(st.o > 0.01 ? 'visible' : 'hidden');
        });
        // the caption: one name at a time, swapped in one step
        let c = 0;
        for (let i = 0; i < H; i++) if (U(i, p) >= PH.name) c = i + 1;
        if (c !== cur) { cur = c; pieces.forEach((pc, k) => pc.classList.toggle('is-current', k === c)); }
      };

      tl.fromTo(P, { v: 0 }, { v: 1, duration: 1, ease: 'none', immediateRender: false }, 0);
      tl.eventCallback('onUpdate', render);
      // every refresh (resize, fonts, a phone turned) lays the plan out again: measure it afresh
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onRefresh: () => { g = null; render(); } });
      render();
    };

    const mm = Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build },
    });
    // the finished composition shows no current piece
    if (mm) mm.add('(prefers-reduced-motion: reduce)', () => { pieces.forEach((pc) => pc.classList.remove('is-current')); });
    return mm;
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = make;
})();
