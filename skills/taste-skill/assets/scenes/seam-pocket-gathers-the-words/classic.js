// assets/scenes/seam-pocket-gathers-the-words/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / seam-pocket-gathers-the-words.js — the seam between two grounds bends: the next
// section's dark ground rises into the pale one as a wide, shallow cup, and a loose scatter of short words is
// gathered into it, each word turning to the next ground's ink as it crosses the edge.
//
// The stage holds the upper section: its heading and sentence across the top, and eight to twelve short words
// (what the section is about, one or two words each) lying scattered under them as plain type, small and each
// at its own tilt. Under them the next section's ground waits as a band with a low swell in its middle. The
// scroll carries the words one after another, in staggered windows, to their places in two short columns;
// as each one comes, the middle of the edge rises in a wide, round-shouldered cup (at least half the stage,
// curved sides, no corners) just far enough to take it, and the word straightens, grows to display size and
// crosses into the dark, where it reads in the light ink. Meanwhile the edge's feet lift too, so by the end the
// dark ground holds most of the screen and the gathered words rest in it as the next section's opening. The
// stage lets go onto that section, which goes on on the same ground. Fully scrubbed: scrolling back scatters
// the words exactly as they were. Flat colour, transforms and clip-paths only; no shadows, no blur, no
// drawing: the edge is the boundary of a ground, not a line.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and seam-pocket-gathers-the-words.css.
//
// DOM (the CSS file draws the finished composition from the same markup):
//   <section class="scene spg" data-scene="seam-pocket-gathers-the-words" data-options='{}'
//            aria-labelledby="spg-title">
//     <div class="scene-stage">
//       <div class="spg-top">
//         <h2 class="spg-title" id="spg-title">2-5 words, two lines at most</h2>
//         <p class="spg-lede">One or two sentences, 30 words at most</p>
//       </div>
//       <div class="spg-next">                         the next section's ground (the script adds .spg-rise)
//         <ul class="spg-words" aria-label="what the words are">
//           <li class="spg-word">Zinnias</li>           8-12 items, one or two words each (14 characters at
//           …                                           most), in reading order: two columns, the first half
//         </ul>                                         down the left, the rest down the right; the first
//       </div>                                          `phoneCount` items are the ones a phone keeps
//     </div>
//   </section>
//   <section style="background: var(--ink)">…</section>    the next section, on the next ground, no margin
//
// The words are what the section was about, in the page's own faces: names of things, never a sentence cut
// up. The script gives each word a copy of itself in the next ground's ink (.spg-paper, aria-hidden), nested
// in the word and clipped to the risen ground, so a word recolours glyph by glyph exactly where it crosses the
// edge; nothing else ever lies on a word. The words keep clear of everything in .spg-top and of each other;
// the script places them, seeded, and tests the whole flight before it accepts a scatter.
//
// Options (data-options JSON; defaults, ranges):
//   hold          1.4    1-1.5     screens the stage is held for on desktop and tablet
//   phoneHold     1.2    1-1.5     the same on a phone
//   maxWords      12     8-12      words used on desktop and tablet (the rest of the list is hidden)
//   phoneCount    7      6-8       words used on a phone: the first items of the list; the rest are hidden
//                                  there, in the finished composition too
//   columns       2      1-2       columns the words settle in on desktop and tablet (a phone takes one)
//   at            0.5    0.3-0.7   where the cup stands on desktop and tablet, its middle as a share of the
//                                  width (sets --spg-at); a phone keeps it in the middle
//   feet          0.6    0-0.85    how far the edge's feet rise by the end, as a share of the way from where
//                                  they start to the cup's final top; 0 keeps them still (phoneFeet 0.72)
//   scale         0.6    0.45-0.85 size of a scattered word, as a share of its landed size (phoneScale 0.64)
//   tilt          9      0-14      the largest tilt of a scattered word, in degrees
//   flight        0.2    0.15-0.3  share of the hold each word takes from its place to its slot
//   seed          3                the scatter's seed (the script tries the next seeds until the whole flight
//                                  is clear: no word on a word or on the heading block, no resting word
//                                  reached by the rising ground)
//   scrub         0.5 | true       seconds of catch-up; true (locked) when Lenis smooths or on touch
//   phone         "same"           "same" (the phone plan below) | "rest" (the finished composition)
//
// Tokens it reads: --ground, --ink, --font-display, --font-text, --display-weight, --text-weight. Tokens it
// owns (set them on the section): --spg-next (the next ground, default the ink), --spg-next-ink (type on
// it, default the ground), --spg-title-size, --spg-lede-size, --spg-word-size (landed size), --spg-word-lh,
// --spg-col-gap, --spg-gutter, --spg-foot, --spg-at, and for the finished composition --spg-rise (height of
// the cup), --spg-a (half its top) and --spg-sw (width of each curved side).
//
// Timeline (fractions of the hold, ten words): word k leaves its place at -0.03 + k * 0.081 (so the first
// word is already on its way at 0) and lands 0.2 later, the last at 0.9; the bottom row is filled first, left
// before right. In the 0.14 before the first word of a row lands, the cup's top rises to just above that row
// (it is never deeper than the words it holds, and never a frame ahead of them by more than a row). The
// feet rise from the first frame to the end. Settled 0.9-1.
//
// Phone plan: the same scene with phone numbers: the first seven words in one column in the middle (the cup
// never moves sideways; its curved sides run out past the screen's edges so they stay soft), the heading block
// across the width with the words scattered under it at 64% of their landed size, shorter flights (0.17), a
// 1.2-screen hold. Screens under 600px tall get the finished composition. Reduced motion, no script and a failed CDN get
// the finished composition: the heading and sentence, then the next ground with the cup risen at its top and
// the words resting in it in the light ink.
(() => {
  const ID = 'seam-pocket-gathers-the-words';
  const END = 0.9;   // the last word lands here; the words rest to 1
  const LEAD = 0.03; // the first word has already set off at progress 0: the first frame moves
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && isFinite(n) ? clamp(n, a, b) : d; };
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const inOut = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
  const sine = (u) => -(Math.cos(Math.PI * u) - 1) / 2;
  const out2 = (u) => 1 - (1 - u) ** 2;
  const smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  // the box a word of w x h fills on screen when turned by r degrees about its middle
  const turned = (w, h, r) => { const a = (Math.abs(r) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return { w: w * c + h * s, h: w * s + h * c }; };
  const hit = (A, B, g) => A.l < B.r + g && A.r + g > B.l && A.t < B.b + g && A.b + g > B.t;
  // a word as it really lies: a box turned about its middle (separating axes)
  const obb = (cx, cy, w, h, r) => { const a = (r * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return { cx, cy, hw: w / 2, hh: h / 2, ux: c, uy: s }; };
  const overlap = (A, B, g) => {
    for (const [ax, ay] of [[A.ux, A.uy], [-A.uy, A.ux], [B.ux, B.uy], [-B.uy, B.ux]]) {
      const d = Math.abs((B.cx - A.cx) * ax + (B.cy - A.cy) * ay);
      const ra = A.hw * Math.abs(A.ux * ax + A.uy * ay) + A.hh * Math.abs(-A.uy * ax + A.ux * ay);
      const rb = B.hw * Math.abs(B.ux * ax + B.uy * ay) + B.hh * Math.abs(-B.uy * ax + B.ux * ay);
      if (d > ra + rb + g) return false;
    }
    return true;
  };
  // a style property written only when its value changes
  const put = (el, prop, v) => { const m = el.__spg || (el.__spg = {}); if (m[prop] !== v) { m[prop] = v; el.style[prop] = v; } };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const o = {
      hold: num(opts.hold, 1.4, 1, 1.5),
      phoneHold: num(opts.phoneHold, 1.2, 1, 1.5),
      maxWords: Math.round(num(opts.maxWords, 12, 8, 12)),
      phoneCount: Math.round(num(opts.phoneCount, 7, 6, 8)),
      columns: Math.round(num(opts.columns, 2, 1, 2)),
      at: num(opts.at, 0.5, 0.3, 0.7),
      feet: num(opts.feet, 0.6, 0, 0.85),
      phoneFeet: num(opts.phoneFeet, 0.72, 0, 0.85),
      scale: num(opts.scale, 0.6, 0.45, 0.85),
      phoneScale: num(opts.phoneScale, 0.64, 0.45, 0.9),
      tilt: num(opts.tilt, 9, 0, 14),
      flight: num(opts.flight, 0.2, 0.15, 0.3),
      seed: Math.round(num(opts.seed, 3, 0, 1e6)),
      scrub: opts.scrub === true ? true : typeof opts.scrub === 'number' ? clamp(opts.scrub, 0, 2) : null,
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const $ = (s) => root.querySelector(s);
    const top = $('.spg-top'), next = $('.spg-next'), list = $('.spg-words');
    const all = [...root.querySelectorAll('.spg-word')];
    if (!stage || !top || !next || !list || all.length < 2) {
      console.warn(`${ID}: needs .scene-stage, .spg-top and .spg-next > .spg-words with two .spg-word or more`);
      return Stage.scene(root, { build: null });
    }
    // the rising ground: a layer of the next ground under the words, its top edge one clip-path
    let rise = next.querySelector(':scope > .spg-rise');
    if (!rise) {
      rise = document.createElement('div');
      rise.className = 'spg-rise';
      rise.setAttribute('aria-hidden', 'true');
      next.prepend(rise);
    }
    // each word carries its own copy in the next ground's ink, clipped to the risen ground
    const papers = all.map((w) => {
      let p = w.querySelector(':scope > .spg-paper');
      if (!p) {
        p = document.createElement('span');
        p.className = 'spg-paper';
        p.setAttribute('aria-hidden', 'true');
        p.textContent = w.textContent.replace(/\s+/g, ' ').trim();
        w.appendChild(p);
      }
      return p;
    });

    // which words this width keeps: the first items of the list
    const pick = (phone) => {
      const n = Math.min(all.length, phone ? o.phoneCount : o.maxWords);
      all.forEach((w, i) => w.classList.toggle('spg-word--off', i >= n));
      return all.slice(0, n);
    };
    let words = [];
    let geo = null;
    let phoneNow = false;

    const clear = () => {
      for (const w of all) { w.style.removeProperty('transform'); w.__spg = {}; }
      for (const p of papers) { p.style.removeProperty('clip-path'); p.style.removeProperty('visibility'); p.__spg = {}; }
      rise.style.removeProperty('clip-path');
      rise.__spg = {};
      for (const k of ['--spg-list-top', '--spg-fit', '--spg-a', '--spg-at']) root.style.removeProperty(k);
      list.style.removeProperty('--spg-rows');
      geo = null;
    };

    // ---- the edge. Its feet stand at Yf; over the cup's top (half-width a round cx) it stands A higher, and
    // each side is a smootherstep curve sw wide, so the edge meets itself without a corner anywhere.
    const Q = (x) => {
      const d = Math.abs(x - geo.cx);
      if (d <= geo.a) return 1;
      if (d >= geo.a + geo.sw) return 0;
      return smoother(1 - (d - geo.a) / geo.sw);
    };
    const edgeAt = (x, f) => f.Yf - f.A * Q(x);

    // the ground at progress t: the feet rise from the first frame; the cup's top rises a row at a time,
    // in the last part of the flight of the first word of each row
    const ground = (t) => {
      const g = geo, T = g.T;
      const Yf = g.Yf0 + (g.Yf1 - g.Yf0) * (1 - (1 - clamp(t / END, 0, 1)) ** 1.5);
      let L = g.L0;
      for (let k = 0; k < g.N; k++) {
        const drop = g.Lprev[k] - g.Lk[k];
        if (drop > 0.01) L -= drop * sine(clamp((t - (T.b[k] - T.s)) / (0.85 * T.s), 0, 1));
      }
      return { Yf, L, A: Math.max(0, Yf - L) };
    };

    // Everything at progress t. Landing order k: the bottom row first, left before right; a word rests in its
    // spot, flies (travelling first, then dropping into its slot from above, straightening and growing to its
    // landed size), and rests in its slot.
    const fly = (k, t, sp) => {
      const g = geo, T = g.T, n = g.nat[g.order[k]], a = T.a[k], b = T.b[k];
      if (t <= a) return { x: sp.x, y: sp.y, r: sp.r, s: g.s0, st: 0 };
      if (t >= b) return { x: n.cx, y: n.cy, r: 0, s: 1, st: 2 };
      const u = (t - a) / T.F, e = inOut(u), m = 1 - e;
      // a soft arc: a little lift, then down onto its slot from above and from its own side
      const cx = sp.x + 0.55 * (n.cx - sp.x), cy = Math.min(sp.y, n.cy) - 0.35 * g.lh;
      return {
        x: m * m * sp.x + 2 * m * e * cx + e * e * n.cx,
        y: m * m * sp.y + 2 * m * e * cy + e * e * n.cy,
        r: sp.r * (1 - out2(Math.min(1, u / 0.75))),
        s: g.s0 + (1 - g.s0) * sine(Math.min(1, u / 0.85)),
        st: 1,
      };
    };
    const at = (t, spots = geo.spots) => {
      const f = ground(t);
      f.pos = spots.map((sp, k) => fly(k, t, sp));
      return f;
    };
    // the band a word's letters fill (about 0.8 of its line), as it lies
    const ink = (k, p) => { const n = geo.nat[geo.order[k]]; return obb(p.x, p.y, n.w * p.s, n.h * p.s * 0.8, p.r); };

    const edgePolygon = (f) => {
      const g = geo, pts = g.xs.map((x) => `${x.toFixed(1)}px ${edgeAt(x, f).toFixed(1)}px`);
      pts.push(`${g.W + 2}px ${g.H + 2}px`, `-2px ${g.H + 2}px`);
      return `polygon(${pts.join(', ')})`;
    };

    // the light copy of word d: hidden while the word is all on the pale ground, whole once it is all in the
    // dark, and between the two clipped to the risen ground, in the word's own (moved, turned, scaled) frame
    const paperClip = (pe, n, p, f) => {
      const w = n.w * p.s, h = n.h * p.s, bb = turned(w, h, p.r);
      const l = p.x - bb.w / 2, r = p.x + bb.w / 2, tp = p.y - bb.h / 2, bt = p.y + bb.h / 2;
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i <= 6; i++) { const y = edgeAt(l + ((r - l) * i) / 6, f); lo = Math.min(lo, y); hi = Math.max(hi, y); }
      if (lo >= bt + 1) { put(pe, 'visibility', 'hidden'); return; }
      put(pe, 'visibility', 'visible');
      if (hi <= tp - 1) { put(pe, 'clipPath', 'none'); return; }
      const a = (p.r * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      const loc = (X, Y) => { const dx = X - p.x, dy = Y - p.y; return `${(n.w / 2 + (c * dx + s * dy) / p.s).toFixed(1)}px ${(n.h / 2 + (-s * dx + c * dy) / p.s).toFixed(1)}px`; };
      const L = l - 6, R = r + 6, pts = [];
      for (let i = 0; i <= 10; i++) { const X = L + ((R - L) * i) / 10; pts.push(loc(X, edgeAt(X, f))); }
      pts.push(loc(R, bt + 60), loc(L, bt + 60));
      put(pe, 'clipPath', `polygon(${pts.join(', ')})`);
    };

    const render = (t) => {
      if (!geo) return;
      const f = at(clamp(t, 0, 1));
      put(rise, 'clipPath', edgePolygon(f));
      for (let k = 0; k < geo.N; k++) {
        const d = geo.order[k], p = f.pos[k], n = geo.nat[d];
        const dx = p.x - n.cx, dy = p.y - n.cy;
        put(words[d], 'transform', p.st === 2 ? 'none' : `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${p.r.toFixed(2)}deg) scale(${p.s.toFixed(4)})`);
        paperClip(papers[d], n, p, f);
      }
    };

    // ---- the scatter. Seeded, word by word in landing order: each word takes the best of 90 random places
    // on its own column's side of the free ground (under the heading block), among those the rising ground
    // has not reached by the time the word leaves (the ground only ever rises, so one look then is enough),
    // that no earlier word's flight crosses while it rests, and from which its own flight crosses no earlier
    // word and not the heading block: the place farthest from the words placed so far and from the heading
    // block, pulled a little towards its slot so the flights stay short. A scatter is kept only when the
    // whole flight is clear (simulate); otherwise the next seed is tried.
    const place = (seed, ctx) => {
      const g = geo, { N, R, obs, G } = ctx, rand = rng(seed * 7919 + 13);
      // words are wide: distance across counts for about half of distance down
      const far = (x1, y1, x2, y2) => Math.hypot((x1 - x2) * 0.5, y1 - y2);
      const toBox = (x, y, b) => far(x, y, clamp(x, b.l, b.r), clamp(y, b.t, b.b));
      const T = g.T, margin = 0.2 * T.F, two = g.cols > 1, STEPS = 28;
      const obsB = obs.map((b) => obb((b.l + b.r) / 2, (b.t + b.b) / 2, b.r - b.l, b.b - b.t, 0));
      const placed = [];
      const clashes = (j, sp) => {
        const still = ink(j, { x: sp.x, y: sp.y, r: sp.r, s: g.s0 });
        for (let k = 0; k < j; k++) {
          for (let i = 0; i <= STEPS; i++) {
            const t = T.a[k] + (T.F * i) / STEPS;
            if (t >= T.a[j]) break;
            if (overlap(ink(k, fly(k, t, placed[k])), still, 7)) return true;
          }
        }
        for (let i = 1; i <= STEPS; i++) {
          const t = T.a[j] + (T.F * i) / STEPS, pj = fly(j, t, sp), oj = ink(j, pj);
          if (pj.st !== 2 && obsB.some((ob) => overlap(oj, ob, 0))) return true;
          for (let k = 0; k < j; k++) {
            const pk = fly(k, t, placed[k]);
            if (overlap(oj, ink(k, pk), pk.st === 2 || pj.st === 2 ? 0 : 7)) return true;
          }
        }
        return false;
      };
      for (let k = 0; k < N; k++) {
        const n = g.nat[g.order[k]], w = n.w * g.s0, h = n.h * g.s0;
        const fk = ground(clamp(T.a[k] + margin, 0, 1));
        let xl = R.l, xr = R.r;
        if (two && Math.abs(n.cx - g.cx) > 0.05 * g.W) { if (n.cx < g.cx) xr = Math.min(R.r, g.cx + 0.1 * g.W); else xl = Math.max(R.l, g.cx - 0.1 * g.W); }
        let best = null, bestD = -Infinity;
        for (let c = 0; c < 90; c++) {
          const r = (rand() < 0.5 ? -1 : 1) * o.tilt * (0.3 + 0.7 * rand());
          const bb = turned(w, h, r);
          if (bb.w > xr - xl || bb.h > R.b - R.t) continue;
          const x = xl + bb.w / 2 + rand() * (xr - xl - bb.w);
          const y = R.t + bb.h / 2 + rand() * (R.b - R.t - bb.h);
          const box = { l: x - bb.w / 2, r: x + bb.w / 2, t: y - bb.h / 2, b: y + bb.h / 2 };
          let dry = true;
          for (let j = 0; j <= 4 && dry; j++) if (edgeAt(box.l + ((box.r - box.l) * j) / 4, fk) < box.b + 10) dry = false;
          if (!dry) continue;
          if (obs.some((ob) => hit(box, ob, 0))) continue;
          if (placed.some((p) => hit(box, p, G))) continue;
          if (clashes(k, { x, y, r })) continue;
          let d = obs.length ? Math.min(...obs.map((ob) => 2.5 * toBox(x, y, ob))) : 1e4;
          for (const p of placed) d = Math.min(d, far(x, y, p.x, p.y));
          // the first to go lie low, the last high, so an early flight never sweeps past a word still waiting
          d -= 0.08 * Math.hypot(x - n.cx, y - n.cy) + 0.5 * Math.abs(y - (R.b - ((R.b - R.t) * (k + 0.5)) / N));
          if (d > bestD) { bestD = d; best = { ...box, x, y, r }; }
        }
        if (!best) { ctx.stuck = ctx.stuck || {}; ctx.stuck[k] = (ctx.stuck[k] || 0) + 1; return null; }
        placed.push(best);
      }
      return placed.map((p) => ({ x: p.x, y: p.y, r: p.r }));
    };
    // How often the flight goes wrong: a resting word reached by the rising ground, a word on another word
    // (landed words sit in rows and may touch the one landing on them), a moving word on the heading block, a
    // word off the screen.
    const simulate = (spots, ctx, why) => {
      const g = geo, { N, obs } = ctx;
      let bad = 0;
      const note = why ? (s) => { why[s] = (why[s] || 0) + 1; } : () => {};
      const obsB = obs.map((b) => obb((b.l + b.r) / 2, (b.t + b.b) / 2, b.r - b.l, b.b - b.t, 0));
      const STEPS = 140;
      for (let i = 0; i <= STEPS; i++) {
        const f = at(i / STEPS, spots);
        const boxes = f.pos.map((p, k) => {
          const n = g.nat[g.order[k]], w = n.w * p.s, h = n.h * p.s, bb = turned(w, h, p.r);
          // the letters fill about 0.8 of the line's height
          return { l: p.x - bb.w / 2, r: p.x + bb.w / 2, t: p.y - bb.h / 2, b: p.y + bb.h / 2, st: p.st, o: obb(p.x, p.y, w, h * 0.8, p.r) };
        });
        for (let a = 0; a < N; a++) {
          const A = boxes[a];
          if (A.st === 0) {
            for (let j = 0; j <= 4; j++) if (edgeAt(A.l + ((A.r - A.l) * j) / 4, f) < A.b + 4) { bad++; note('reached' + a); break; }
          }
          if (A.st !== 2 && obsB.some((ob) => overlap(A.o, ob, 0))) { bad++; note('heading' + a); }
          if (A.t < 2 || A.l < 2 || A.r > g.W - 2 || A.b > g.H - 2) { bad++; note('edge' + a); }
          for (let b = a + 1; b < N; b++) {
            const B = boxes[b];
            if ((A.st === 0 && B.st === 0) || (A.st === 2 && B.st === 2)) continue;
            if (overlap(A.o, B.o, A.st === 2 || B.st === 2 ? -1 : 4)) { bad++; note(`w${a}-${b}`); }
          }
        }
      }
      return bad;
    };

    // ---- measure the stage at this width and lay the scene out
    const measure = (phone) => {
      clear();
      words = pick(phone);
      const N = words.length;
      const cols = phone ? 1 : o.columns;
      list.style.setProperty('--spg-rows', String(cols === 1 ? N : Math.ceil(N / 2)));
      root.style.setProperty('--spg-at', (phone ? 50 : o.at * 100) + '%');
      const H = stage.clientHeight || window.innerHeight, W = stage.clientWidth || window.innerWidth;
      const keep = [...top.querySelectorAll('h1, h2, h3, h4, p, a, button, img, figure')].filter((e) => e.offsetWidth && e.offsetHeight);
      let s = stage.getBoundingClientRect();
      const hb = Math.max(0, ...keep.map((e) => e.getBoundingClientRect().bottom - s.top));
      // the words, the room above the cup and the ground under them must fit under the heading block;
      // otherwise the words are set smaller (desktop keeps them at display size: 76% at the least)
      const minFit = phone ? 0.8 : 0.76;
      let fit = 1, fs = 40, Lh = 0, padT = 0, gapMin = 0, footMin = 0;
      for (let i = 0; i < 10; i++) {
        fs = parseFloat(getComputedStyle(list).fontSize) || 40;
        Lh = list.offsetHeight;
        padT = 0.5 * fs;
        gapMin = Math.max(phone ? 32 : 44, 0.05 * H);
        footMin = Math.max(48, 0.1 * H);
        if (hb + gapMin + padT + Lh + footMin <= H || fit <= minFit) break;
        fit = Math.max(minFit, fit * 0.94);
        root.style.setProperty('--spg-fit', fit.toFixed(3));
      }
      const spare = H - hb - padT - Lh;
      const gap = clamp(0.42 * spare, gapMin, Math.max(gapMin, spare - footMin));
      root.style.setProperty('--spg-list-top', (hb + gap + padT).toFixed(1) + 'px');
      s = stage.getBoundingClientRect();
      const nat = words.map((w) => { const r = w.getBoundingClientRect(); return { l: r.left - s.left, t: r.top - s.top, w: r.width, h: r.height, cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2 }; });
      const lh = nat[0].h;
      const listL = Math.min(...nat.map((n) => n.l)), listR = Math.max(...nat.map((n) => n.l + n.w));
      const cx = (listL + listR) / 2;
      const a = (listR - listL) / 2 + (phone ? 0.35 : 0.45) * fs;
      // (a phone's cup runs out past the screen's sides, so its sides stay soft)
      const sw = phone ? 0.36 * W : clamp(0.2 * W, 80, 300);
      // landing order: the bottom row first, left before right
      const order = nat.map((n, i) => i).sort((i, j) => (Math.abs(nat[i].t - nat[j].t) > lh / 2 ? nat[j].t - nat[i].t : nat[i].l - nat[j].l));
      const bottom = Math.max(...nat.map((n) => n.t + n.h));
      const Yf0 = H - Math.max(0.2 * H, 64);
      const L0 = Math.min(Yf0 - 0.03 * H, bottom + 0.25 * lh);
      const Lk = [], Lprev = [];
      let L = L0;
      for (let k = 0; k < N; k++) { Lprev.push(L); L = Math.min(L, nat[order[k]].t - padT); Lk.push(L); }
      const Yf1 = Yf0 - (phone ? o.phoneFeet : o.feet) * (Yf0 - L);
      // (one column on a phone: shorter flights, so fewer words head for the column at once)
      const F = phone ? Math.min(o.flight, 0.17) : o.flight, sp = N > 1 ? (END - F + LEAD) / (N - 1) : 0;
      const ta = [], tb = [];
      for (let k = 0; k < N; k++) { ta.push(-LEAD + k * sp); tb.push(-LEAD + k * sp + F); }
      let gapR = Infinity, lastB = null;
      for (let k = 0; k < N; k++) if (Lprev[k] - Lk[k] > 0.01) { if (lastB != null) gapR = Math.min(gapR, tb[k] - lastB); lastB = tb[k]; }
      const sT = Math.min(0.7 * F, 0.9 * gapR, tb[0] + LEAD);
      // where the edge is sampled: the two curved sides closely, the flat parts at their ends
      const xs = [];
      for (let i = 0; i <= 24; i++) { xs.push(cx - a - sw + (sw * i) / 24, cx + a + (sw * i) / 24); }
      geo = {
        N, W, H, cx, a, sw, lh, padT, nat, order, cols, Yf0, Yf1, L0, Lk, Lprev,
        s0: phone ? o.phoneScale : o.scale,
        T: { F, a: ta, b: tb, s: sT },
        xs: [-2, ...xs.filter((x) => x > -2 && x < W + 2).sort((p, q) => p - q), W + 2],
        spots: null,
      };

      // the free ground for the scatter: inside the gutters, under the heading block, above the ground
      const m = phone ? 16 : 26;
      const obs = keep.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left - s.left - m, r: r.right - s.left + m, t: r.top - s.top - m, b: r.bottom - s.top + m }; });
      const gutter = parseFloat(getComputedStyle(top).paddingLeft) || 0.06 * W;
      const R = { l: gutter, r: W - gutter, t: hb + m, b: Yf0 - 8 };
      const ctx = { N, R, obs, G: phone ? 10 : 18 };
      let best = null;
      for (let i = 0; i < 200; i++) {
        const spots = place(o.seed + i, ctx);
        if (!spots) continue;
        const bad = simulate(spots, ctx);
        if (!best || bad < best.bad) best = { spots, bad, seed: o.seed + i };
        if (bad === 0) break;
      }
      // nothing fits (a very small screen): the words simply rest in their slots
      geo.spots = best ? best.spots : order.map((d) => ({ x: nat[d].cx, y: nat[d].cy, r: 0 }));
      root.dataset.spgClear = best && best.bad === 0 ? 'yes' : 'no';
      if (best) root.dataset.spgSeed = String(best.seed);
      if (best && best.bad) { const why = {}; simulate(best.spots, ctx, why); root.dataset.spgWhy = JSON.stringify(why); }
      else if (!best) root.dataset.spgWhy = JSON.stringify({ stuck: ctx.stuck || {} });
      else delete root.dataset.spgWhy;
    };

    function build(tl, ctx) {
      phoneNow = ctx.phone;
      measure(ctx.phone);
      // the timeline is a clock from 0 to 1; every frame is drawn from its progress, so a scrub back, a
      // refresh or a jump lands on the same picture
      tl.to({}, { duration: 1 }, 0);
      tl.eventCallback('onUpdate', () => render(tl.progress()));
      render(tl.progress());
      // fonts, pictures and resizes change every measure: lay out again on each refresh
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onRefresh: () => { measure(phoneNow); render(tl.progress()); } });
    }

    // the finished composition: the cup's top fitted to the words as they are set
    function rest(ctx) {
      clear();
      words = pick(ctx.phone);
      const cols = ctx.phone ? 1 : o.columns;
      list.style.setProperty('--spg-rows', String(cols === 1 ? words.length : Math.ceil(words.length / 2)));
      const fitTop = () => {
        if (root.classList.contains('is-live')) return;
        const r = list.getBoundingClientRect(), fs = parseFloat(getComputedStyle(list).fontSize) || 40;
        if (r.width) root.style.setProperty('--spg-a', (r.width / 2 + (ctx.phone ? 0.35 : 0.45) * fs).toFixed(1) + 'px');
      };
      fitTop();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTop);
    }

    const short = window.matchMedia('(max-height: 599px)');
    const start = () => Stage.scene(root, {
      hold: o.hold,
      scrub: o.scrub ?? (Stage.lenis || Stage.touch ? true : 0.5),
      build: short.matches ? null : build,
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build: short.matches ? null : build },
      rest,
    });
    let mm = start();
    if (mm && short.addEventListener) {
      short.addEventListener('change', () => {
        if (mm) {
          mm.revert();
          const k = Stage.scenes.indexOf(mm);
          if (k >= 0) Stage.scenes.splice(k, 1);
        }
        mm = start();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    }
    return mm;
  };
})();
