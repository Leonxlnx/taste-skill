// assets/scenes/closing-line-in-a-field-of-words/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / closing-line-in-a-field-of-words.js — "A still closing line held in a field of
// words that travel from far to near".
//
// A closing scene with no pictures. One closing line, set at display size in two lines with the page's
// one action following its last word, holds still at the lower left of a calm ground, while a stream of
// single short words (the places, dishes, materials or services the page is about) travels toward the
// reader: each word appears near a vanishing point above the line, grows quickly to a readable size as it
// travels out along one of six to eight fixed lanes, and fades to nothing while it is still whole on
// screen, so no word is ever cut by the edge. At most `on` words (six) are drawn at once. The last word
// does not fade: it grows out of the same point while a last wave is still passing, stops at its full
// size over the closing line and stays as the section's heading. Opacity and scale only: no blur, no 3D
// layers, no shadow.
//
// The lanes. Each lane is a fixed wedge of angle round the vanishing point (left, up-left, up, up-right,
// right, lower-right, ...). A lane that would run into the closing block (the line, the action, the place
// and the flight of the heading) is trimmed or dropped, so six to eight are left. Words take the lanes in
// turn, in a spread order (left, then right, then up-left ...). A word grows about the vanishing point
// (its place and its size are multiplied by the same factor), so it never leaves its own wedge: two words
// on two lanes can never touch, a word never crosses the line, the action or the heading, and there is
// nothing to search. Each word's largest size is the one at which it is still whole inside its wedge and
// inside the screen less a margin; a long word on a narrow lane is set a little smaller, and one that would
// end under 28px skips its turn.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and closing-line-in-a-field-of-words.css.
//
// ── DOM ───────────────────────────────────────────────────────────────────────────────────────────
// <section class="scene" data-scene="closing-line-in-a-field-of-words" aria-labelledby="close-word"
//          data-options='{"hold":1}'>
//   <div class="scene-stage">
//     <div class="clf">
//       <ul class="clf-field" aria-hidden="true">      16-30 single short words, one item each: the
//         <li class="clf-word">Oysters</li>            page's own places, dishes, materials or services
//         <li class="clf-word">Mussels</li> …          (never client or partner names), 9 letters or
//       </ul>                                          fewer, the best first (a desktop flies about the
//                                                      first 25, a phone about the first 14)
//       <div class="clf-close">
//         <h2 class="clf-last" id="close-word">Tonight</h2>    the last word: one word, 4-9 letters
//         <p class="clf-line">The first clause,<br> the rest</p>   9-12 words, display size, two lines
//                                                      at rest, on a phone too: two clauses of about
//                                                      22 characters each, a <br> between them
//         <a class="clf-action" href="…">Book a table</a>      the one action, a plain button
//       </div>
//     </div>
//   </div>
// </section>
//
// ── Options (data-options JSON; a value that is not a number or not known falls back) ──────────────
//   hold         1     (1-2)       screens the stage is held for on desktop and tablet (a closing holds
//                                  about one screen)
//   phoneHold    1     (1-2)       the same below 768px
//   on           6     (5-8)       the most words drawn at once, faint ones counted (never more than the
//                                  lanes this screen has)
//   phoneOn      4     (3-6)
//   life         0.26  (0.18-0.34) share of the hold one word is drawn for, from appearing to gone
//   phoneLife    0.3   (0.18-0.4)
//   phoneWords   16    (8-30)      words a phone may use (the first ones in the markup)
//   land         0.86  (0.75-0.9)  where in the hold the last word stops as the heading
//   vary         0.4   (0-0.6)     spread of the words' sizes (long words a little smaller)
//   vp           [0.52, 0.42]      the vanishing point, as shares of the stage's width and height; it is
//                                  kept 0.14 of the screen above the closing block
//   phoneVp      [0.5, 0.38]
//   gap          28    (8-64)      px kept clear around the closing block
//   phoneGap     16    (8-40)
//   inset        0     (0-200)     px of a fixed header at the top of the screen that no word enters
//   seed         7                 the dice for the words' sizes
//   scrub        true with Lenis, else 0.5 (seconds of catch-up)
//   phone        'same' (default: the phone plan below) | 'rest' (the finished composition)
//
// ── Timing (desktop 1440x900, hold 1, life 0.26, on 6, land 0.86) ──────────────────────────────────
// A new word starts every life/on (0.043 of the hold). It appears at 0.4 of its largest size (never under
// 24px of type), fades in over the first 12% of its life while it grows past half its size, stays in full
// ink to 68%, and fades out over the rest while it grows to its largest size, whole on screen. Its growth
// is quick out of the point and slows toward the rim, so no word is small for more than a beat.
//   0%      the line and the button at the lower left; five words in flight (the stream started before
//           the stage arrived)
//   0-84%   the stream: five or six words drawn at every moment, one on each lane; the starts after 74%
//           fly faster (down to 0.62 of a life) so they are gone by 100%
//   64%     the last word appears near the vanishing point
//   86%     it stops at its full size over the closing line: the heading. The last wave (four or five
//           words) is still passing
//   100%    the last word of the stream has faded; heading, closing line and button
// Nothing runs on a clock: a reader who stops sees a still frame, and every word on it is whole.
//
// Phone (below 768px): the same stream with at most four words at once, from the first `phoneWords`, at
// a phone size (12.5vw), on five lanes that rise above the closing block (which is the full width there,
// so no word ever passes over the line), the heading beside the button over the line, and the line still
// at display size (7.6vw) in two balanced lines; hold 1. Reduced
// motion, no script and a failed CDN: the finished composition, an ordinary section a screen tall: the
// words set as one still list in the display face at the top, the heading, the closing line and the
// button at the lower left.
(() => {
  const ID = 'closing-line-in-a-field-of-words';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && Number.isFinite(n) ? clamp(n, a, b) : d; };
  const pair = (v, d) => (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'number' && Number.isFinite(x)) ? [clamp(v[0], 0.2, 0.8), clamp(v[1], 0.15, 0.7)] : d);
  const dice = (seed) => { let s = (seed >>> 0) || 1; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  // The lanes: wedges of angle round the vanishing point, in degrees (0 is right, 90 is down).
  const LANES = [[166, 194], [-162, -124], [-120, -60], [-56, -18], [-14, 14], [18, 62], [66, 118], [124, 160]];
  const PHONE_LANES = [[-130, -93], [-87, -50], [-30, 30], [38, 86], [122, 150], [154, 206]];
  const PAD = 2.5;        // degrees a word keeps inside its lane's edges
  const MIN_LANE = 14;    // degrees: a lane trimmed narrower than this is dropped
  const M0 = 0.4;         // a word's size when it appears, as a share of its largest
  const MIN_PX = 24;      // and never under this many px of type
  const END_PX = 28;      // a word whose largest size would be under this skips its turn
  const IN = 0.12, OUT = 0.68;      // a word fades in over the first 12% of its life, out from 68%
  const LAST = 0.62;      // the last wave flies faster (down to this share of a life) so it ends at 100%
  const H0 = 0.3, H_LIFE = 0.22;    // the heading's first size, and the share of the hold it flies for
  const ease = (u) => 1 - Math.pow(1 - u, 2.6);   // quick out of the point, slow toward the rim
  const opAt = (u) => (u <= 0 || u >= 1 ? 0 : u < IN ? u / IN : u > OUT ? (1 - u) / (1 - OUT) : 1);
  const grow = (b, g) => [b[0] - g, b[1] - g, b[2] + g, b[3] + g];
  const shift = (b, x, y) => [x + b[0], y + b[1], x + b[2], y + b[3]];
  const deg = (y, x) => (Math.atan2(y, x) * 180) / Math.PI;
  const near = (a, c) => a - 360 * Math.round((a - c) / 360);   // angle a, written within 180° of c
  const corners = (b) => [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]];

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const field = root.querySelector('.clf-field');
    const last = root.querySelector('.clf-last'), line = root.querySelector('.clf-line'), action = root.querySelector('.clf-action');
    const words = field ? [...field.querySelectorAll('.clf-word')] : [];
    if (!stage || !field || !last || !line || words.length < 2) {
      console.warn(`${ID}: needs .scene-stage with .clf-field (.clf-word items), .clf-last and .clf-line`);
      return Stage.scene(root, { build: null });
    }
    const o = {
      hold: num(opts.hold, 1, 1, 2),
      phoneHold: num(opts.phoneHold, 1, 1, 2),
      on: Math.round(num(opts.on, 6, 5, 8)),
      phoneOn: Math.round(num(opts.phoneOn, 4, 3, 6)),
      life: num(opts.life, 0.26, 0.18, 0.34),
      phoneLife: num(opts.phoneLife, 0.3, 0.18, 0.4),
      phoneWords: Math.round(num(opts.phoneWords, 16, 8, 30)),
      land: num(opts.land, 0.86, 0.75, 0.9),
      vary: num(opts.vary, 0.4, 0, 0.6),
      vp: pair(opts.vp, [0.52, 0.42]),
      phoneVp: pair(opts.phoneVp, [0.5, 0.38]),
      gap: num(opts.gap, 28, 8, 64),
      phoneGap: num(opts.phoneGap, 16, 8, 40),
      inset: num(opts.inset, 0, 0, 200),
      seed: Math.round(num(opts.seed, 7, 1, 1e9)),
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const sv = num(opts.scrub, NaN, 0.1, 1);
    const scrub = Number.isFinite(sv) && opts.scrub !== true ? sv : opts.scrub === true || Stage.lenis ? true : 0.5;

    const S = { live: false, phone: false, tl: null, lanes: [], flights: [], head: null, vx: 0, vy: 0, L: o.life, st: new Map() };
    root.__clf = S;   // the plan, for inspection in devtools

    // What an element draws, from the top left of its own box: the box itself and its letters (measured
    // from the font, so a descender or a tall capital is never left out).
    const cvs = document.createElement('canvas').getContext('2d');
    const boxOf = (el) => {
      const cs = getComputedStyle(el), w = el.offsetWidth, h = el.offsetHeight, fs = parseFloat(cs.fontSize) || 16;
      cvs.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      try { cvs.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing; } catch {}
      const t = cvs.measureText((el.textContent || '').trim());
      const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight) || h;
      const asc = t.fontBoundingBoxAscent || fs * 0.92, desc = t.fontBoundingBoxDescent || fs * 0.26;
      const base = (h - lh) / 2 + (lh - (asc + desc)) / 2 + asc;
      return [Math.min(0, -t.actualBoundingBoxLeft), Math.min(0, base - t.actualBoundingBoxAscent), Math.max(w, t.actualBoundingBoxRight), Math.max(h, base + t.actualBoundingBoxDescent)];
    };

    // ── the plan: the lanes, and a lane, a start and a largest size for every word, for this screen ──
    const plan = (phone) => {
      const rnd = dice(o.seed + (phone ? 101 : 0));
      const W = stage.clientWidth || innerWidth, H = stage.clientHeight || innerHeight;
      // the natural layout, before anything this scene wrote
      last.style.transform = ''; last.style.opacity = '';
      for (const el of words) { el.style.transform = 'none'; el.style.visibility = 'hidden'; el.style.opacity = ''; }
      const sr = stage.getBoundingClientRect();
      const rel = (r) => [r.left - sr.left, r.top - sr.top, r.right - sr.left, r.bottom - sr.top];
      const gap = phone ? o.phoneGap : o.gap;
      const margin = Math.max(12, 0.025 * Math.min(W, H));
      const top = o.inset + margin;
      const fontPx = parseFloat(getComputedStyle(field).fontSize) || 100;

      // the closing block
      const hb = rel(last.getBoundingClientRect());
      const head = shift(boxOf(last), hb[0], hb[1]);
      const lineBox = rel(line.getBoundingClientRect());
      const act = action ? rel(action.getBoundingClientRect()) : null;
      const closeTop = Math.min(head[1], lineBox[1], act ? act[1] : Infinity);

      // the vanishing point
      const vp = phone ? o.phoneVp : o.vp;
      const vx = clamp(vp[0] * W, 0.25 * W, 0.75 * W);
      const vy = clamp(Math.min(vp[1] * H, closeTop - 0.14 * H), top + 0.12 * H, closeTop - gap - 0.05 * H);
      S.vx = vx; S.vy = vy;

      // where a word may be: the band above the closing block, and the column right of the heading down
      // to the line and the action (when the vanishing point stands in it). Both hold the vanishing
      // point, so a word that grows about it inside one never leaves it.
      const rects = [[margin, top, W - margin, closeTop - gap]];
      const yb = Math.min(lineBox[1], act ? act[1] : Infinity) - gap, xr = head[2] + gap;
      if (yb > closeTop - gap + 8 && W - margin - xr > 0.2 * W && vx >= xr) rects.push([xr, top, W - margin, yb]);

      // the heading grows about the vanishing point too, from H0 to its own place; if this layout puts
      // the line or the action in its way it settles in place instead
      const hc = [(hb[0] + hb[2]) / 2, (hb[1] + hb[3]) / 2];
      const sweeps = (b, m0, m1, x) => {   // box b (at m = 1), grown about the vanishing point from m0 to m1, ever on box x?
        let lo = m0, hi = m1;
        const cut = (a, c, less) => { if (Math.abs(a) < 1e-9) { if (less ? !(0 < c) : !(0 > c)) hi = -1; return; } const r = c / a; if ((a > 0) === less) hi = Math.min(hi, r); else lo = Math.max(lo, r); };
        cut(b[0] - vx, x[2] - vx, true); cut(b[2] - vx, x[0] - vx, false); cut(b[1] - vy, x[3] - vy, true); cut(b[3] - vy, x[1] - vy, false);
        return lo < hi;
      };
      let fly = true;
      for (const x of [lineBox, act].filter(Boolean)) if (sweeps(head, H0, 1, grow(x, gap / 2))) fly = false;
      S.head = { fly, t0: o.land - H_LIFE, c: hc };
      // the wedge the heading flies in, closed to the words
      let hw = null;
      if (fly) {
        const g = grow(head, gap / 2), c = deg(hc[1] - vy, hc[0] - vx), as = corners(g).map(([x, y]) => near(deg(y - vy, x - vx), c));
        hw = [Math.min(...as) - 3, Math.max(...as) + 3];
      }

      // the lanes this screen has
      const lanes = [];
      for (const [a0, a1] of phone ? PHONE_LANES : LANES) {
        let lo = a0, hi = a1;
        if (hw) {
          const h0 = near((hw[0] + hw[1]) / 2, (a0 + a1) / 2) - (hw[1] - hw[0]) / 2, h1 = h0 + (hw[1] - hw[0]);
          if (h0 < hi && h1 > lo) { if (h0 - lo >= hi - h1) hi = Math.min(hi, h0); else lo = Math.max(lo, h1); }
        }
        if (hi - lo < MIN_LANE) continue;
        const th = (lo + hi) / 2;
        lanes.push({ lo: lo + PAD, hi: hi - PAD, th, ux: Math.cos((th * Math.PI) / 180), uy: Math.sin((th * Math.PI) / 180) });
      }
      // a box whose four corners lie inside the lane's wedge (and which does not hold the vanishing point)
      const inLane = (b, ln) => {
        if (vx > b[0] && vx < b[2] && vy > b[1] && vy < b[3]) return false;
        for (const [x, y] of corners(b)) { const a = near(deg(y - vy, x - vx), ln.th); if (a < ln.lo || a > ln.hi) return false; }
        return true;
      };
      // the furthest a box (about the element's centre) can go along a lane and still be whole in a rect
      const reach = (ux, uy, b) => {
        let best = -1;
        for (const R of rects) {
          if (vx < R[0] || vx > R[2] || vy < R[1] || vy > R[3]) continue;
          let lo = 0, hi = Infinity;
          const axis = (u, v, r0, r1, b0, b1) => {
            const a = r0 - b0 - v, c = r1 - b1 - v;
            if (a > c) { hi = -1; return; }
            if (Math.abs(u) < 1e-6) { if (a > 0 || c < 0) hi = -1; return; }
            lo = Math.max(lo, Math.min(a / u, c / u)); hi = Math.min(hi, Math.max(a / u, c / u));
          };
          axis(ux, vx, R[0], R[2], b[0], b[2]); axis(uy, vy, R[1], R[3], b[1], b[3]);
          if (hi >= lo && Number.isFinite(hi) && hi > best) best = hi;
        }
        return best > 0 ? best : null;
      };
      // a word's place at its largest size: at the far end of its lane (along its middle or one of four
      // fixed rays beside it), as large as the lane lets it be
      const fit = (ln, bx, k0) => {
        const rays = [0, -0.45, 0.45, -0.8, 0.8].map((s) => { const a = ((ln.th + (s * (ln.hi - ln.lo)) / 2) * Math.PI) / 180; return [Math.cos(a), Math.sin(a)]; });
        for (let k = k0, i = 0; i < 10; i++, k *= 0.92) {
          const b = bx.map((v) => v * k);
          let best = null;
          for (const [ux, uy] of rays) {
            const d = reach(ux, uy, b); if (d == null || (best && d <= best.d)) continue;
            const c = [vx + ux * d, vy + uy * d];
            if (inLane(shift(b, c[0], c[1]), ln)) best = { k, c, d };
          }
          if (best) return best;
        }
        return null;
      };

      // the words this screen may use, their boxes about their centres at the field's size
      const count = phone ? Math.min(o.phoneWords, words.length) : words.length;
      const pool = words.slice(0, count).map((el) => {
        const w = el.offsetWidth, h = el.offsetHeight, b = boxOf(el), len = (el.textContent || '').trim().length || 6;
        const f = (1 - o.vary / 2 + o.vary * rnd()) * clamp(Math.sqrt(6 / len), 0.8, 1.1);
        return { el, f, box: [b[0] - w / 2 - 3, b[1] - h / 2 - 3, b[2] - w / 2 + 3, b[3] - h / 2 + 3], busy: -Infinity };
      });
      for (const el of words.slice(count)) el.style.visibility = 'hidden';
      // a lane that cannot hold a word of the middle width at 0.6 of its size is dropped
      const ref = pool.map((p) => p.box).sort((a, b) => a[2] - a[0] - (b[2] - b[0]))[pool.length >> 1];
      const used = lanes.filter((ln) => { const r = fit(ln, ref, 1); return r && r.k >= 0.6; });

      // the stream: a start every life/on, each on the next lane in a spread order (left, right, up-left,
      // ...), with the next word that fits it; the starts run on while the heading lands, the last few
      // with shorter lives, so a last wave is passing at 85-90% and the stream has gone by 100%
      const N = used.length, on = Math.min(phone ? o.phoneOn : o.on, N);
      const L = phone ? o.phoneLife : o.life, step = L / Math.max(1, on), first = -L + step;
      const n = N ? Math.floor((1 - LAST * L - first) / step + 1e-6) + 1 : 0;
      const half = Math.ceil(N / 2), order = Array.from({ length: N }, (_, j) => (j % 2 ? half + (j - 1) / 2 : j / 2));
      const flights = [];
      let wi = 0;
      for (let j = 0; j < n; j++) {
        const ln = used[order[j % N]], t0 = first + j * step;
        for (let t = 0; t < Math.min(3, pool.length); t++) {
          const it = pool[(wi + t) % pool.length];
          if (it.busy > t0 + 1e-6) continue;   // a word drawn twice is never drawn twice at once
          const r = fit(ln, it.box, it.f);
          if (!r || r.k < it.f * 0.5 || r.k * fontPx < END_PX) continue;
          const life = Math.min(L, 1 - t0);
          flights.push({ el: it.el, t0, life, k: r.k, c: r.c, m0: Math.min(0.8, Math.max(M0, MIN_PX / (fontPx * r.k))) });
          it.busy = t0 + life; wi = (wi + t + 1) % pool.length;
          break;
        }
      }
      S.lanes = used; S.flights = flights; S.L = L;
      S.st = new Map(words.map((el) => [el, { vis: false, op: -1, tf: '', f: null, u: 0, a: 0 }]));
      S.headOp = -1; S.headTf = null;
      root.dataset.clfWords = String(flights.length);
      root.dataset.clfLanes = String(N);
    };

    // ── one frame of the field at progress p ─────────────────────────────────────────────────────────
    const render = (p) => {
      if (!S.live || !S.head) return;
      const { vx, vy } = S;
      for (const st of S.st.values()) st.f = null;
      for (const f of S.flights) {
        const u = (p - f.t0) / f.life; if (u <= 0 || u >= 1) continue;
        const a = opAt(u); if (a <= 0.004) continue;
        const st = S.st.get(f.el); st.f = f; st.u = u; st.a = a;
      }
      for (const [el, st] of S.st) {
        const f = st.f;
        if (!f) { if (st.vis) { el.style.visibility = 'hidden'; st.vis = false; } continue; }
        const m = f.m0 + (1 - f.m0) * ease(st.u);
        const cx = vx + (f.c[0] - vx) * m, cy = vy + (f.c[1] - vy) * m;
        const tf = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) translate(-50%,-50%) scale(${(m * f.k).toFixed(4)})`;
        if (tf !== st.tf) { el.style.transform = tf; st.tf = tf; }
        const ar = Math.round(st.a * 100) / 100;
        if (ar !== st.op) { el.style.opacity = ar >= 1 ? '1' : String(ar); st.op = ar; }
        if (!st.vis) { el.style.visibility = 'visible'; st.vis = true; }
      }
      // the last word: out of the vanishing point to its own place, where it stops and stays
      const h = S.head;
      let op, tf;
      if (h.fly) {
        const u = clamp((p - h.t0) / H_LIFE, 0, 1), m = H0 + (1 - H0) * ease(u);
        op = p <= h.t0 ? 0 : Math.round(clamp(u / 0.25, 0, 1) * 100) / 100;
        tf = u >= 1 ? 'none' : `translate(${((vx - h.c[0]) * (1 - m)).toFixed(1)}px,${((vy - h.c[1]) * (1 - m)).toFixed(1)}px) scale(${m.toFixed(4)})`;
      } else {
        const u = clamp((p - (o.land - 0.1)) / 0.1, 0, 1);
        op = Math.round(u * 100) / 100; tf = u >= 1 ? 'none' : `scale(${(0.85 + 0.15 * u).toFixed(4)})`;
      }
      if (tf !== S.headTf) { last.style.transform = tf; S.headTf = tf; }
      if (op !== S.headOp) { last.style.opacity = String(op); S.headOp = op; }
    };

    const unhook = () => {
      S.live = false;
      for (const el of words) { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; }
      last.style.transform = ''; last.style.opacity = '';
      delete root.dataset.clfWords; delete root.dataset.clfLanes;
    };

    const build = (tl, ctx) => {
      S.live = true; S.phone = ctx.phone; S.tl = tl;
      plan(ctx.phone);
      tl.eventCallback('onUpdate', () => render(tl.progress()));
      render(tl.progress());
      if (window.gsap && gsap.context) gsap.context(() => () => unhook());
    };

    if (window.ScrollTrigger && !root.__clfWired) {
      root.__clfWired = true;
      // every size the plan measured (the stage, the words, the closing block) can change on a refresh
      ScrollTrigger.addEventListener('refresh', () => { if (S.live) { plan(S.phone); render(S.tl ? S.tl.progress() : 0); } });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (S.live) ScrollTrigger.refresh(); }).catch(() => {});
    }

    return Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build },
      rest: unhook,
    });
  };
})();
