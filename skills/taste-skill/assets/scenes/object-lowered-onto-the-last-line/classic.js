// assets/scenes/object-lowered-onto-the-last-line/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / object-lowered-onto-the-last-line.js — "Object lowered onto the last line".
//
// A closing scene for a physical product, where the type is the table. The page ends on one closing line
// in the page's ink, set on one line across nearly the full width at display size, one plain action and
// the price under it, and the product: one cut-out photograph (a transparent PNG of the client's own
// product, never another maker's), about a third of the screen tall. Over the hold it is lowered, whole
// in frame from the first frame, from the top of the stage, with uneven pacing: a slow creep over the
// first half of the hold, most of its travel (about 45% of the screen) in the last third, slowing so it
// sets down and rests. It sets down ON the letters: its foot rests on the x-height line, on the top of
// one lowercase letter without an ascender (marked .olo-shelf), like a jug on a shelf, and its body
// stands clear of every glyph: every letter whole, nothing over the object, the object over nothing.
// Flat ground and solid type: no floor line, no shadow, no glow, no frame sequence. The page ends on
// the product arriving.
//
// The script fits the line to the row (one line on a wide screen, two on a phone) and, after the fonts
// load and on every resize, measures where the shelf letter's ink begins (its baseline less its ascent,
// read from the loaded font), finds the taller letters beside it on its line, reads the object's own
// outline near its foot from the picture's alpha, and stands it where its foot is on the letter and its
// body clears those letters (smaller, only if it must, to keep its foot on the letter and on screen). The
// lowering is a transform that is 0 at the end of the hold. Without script the CSS stands it on the letter
// by anchor positioning and the font's x-height token.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and object-lowered-onto-the-last-line.css.
//
// ── DOM ───────────────────────────────────────────────────────────────────────────────────────────
// <section class="scene" id="order" data-scene="object-lowered-onto-the-last-line"
//          data-options='{}' aria-labelledby="olo-line">
//   <div class="scene-stage">
//     <div class="olo">
//       <div class="olo-set">
//         <h2 class="olo-line" id="olo-line">Set<br class="olo-br"> the tabl<span class="olo-shelf">e</span>.</h2>
//                  the closing line, 2-5 words in sentence case, 10-16 characters, in the page's ink and
//                  display face. Wrap ONE lowercase x-height letter (a, c, e, m, n, o, r, s, u…) of the
//                  last word in .olo-shelf: the object stands on its top. Pick one with a short or no
//                  ascender beside it on at least one side (the e of "table" beside the full stop).
//                  .olo-br marks where the line breaks on a phone: put it so the last line runs past
//                  the end of the first under the shelf letter ("Set / the table."), so nothing is over it
//         <div class="olo-drop" data-move>
//           <img class="olo-object" src srcset sizes width height alt loading="eager" decoding="async">
//                  the product cut out to its own edges (transparent PNG or WebP, no ground, no shadow
//                  baked in), cropped so its lowest opaque row is the image's bottom edge: that row stands
//                  on the letter. Upright, 0.5-1 wide to 1 tall, 1000px tall or more, width and height set
//         </div>
//       </div>
//       <div class="olo-act">
//         <a class="olo-action" href="…">The one action, 2-4 words</a>   an order or a booking; never
//                                                                       an email address or a phone number
//         <p class="olo-note">The price, and what it is, 2-8 words</p>
//       </div>
//     </div>
//   </div>
// </section>
// <footer>…the page's designed footer, a section of its own: it follows the finished frame…</footer>
//
// ── Options (data-options JSON; a value that is not a number or not known falls back) ──────────────
//   hold        0.8   (0.6-1.6)  screens the stage is held for; under 0.6 (a section under 1.6 screens)
//                                the creep and the drop squash into one jump
//   creep       0.33  (0.1-0.36) share of the travel covered over the first half of the hold
//   drop        0.55  (0.45-0.8) share of the travel covered over the last third of the hold
//   enter       0.6   (0-20)     svh of clear ground over the object as the hold starts: it starts whole,
//                                at the top of the stage
//   travel      'auto' | 20-90   svh it travels; auto = from the top of the stage down to the letter. A number is
//                                a cap (the object then starts lower, more of it on screen)
//   phoneTravel 34    (20-80)    the cap on a phone, where the travel is shorter
//   fill        0.97  (0.8-1)    share of the row's width the line runs across
//   phoneFill   0.88  (0.7-1)    the same for the longer phone line (room for the object past its end)
//   footX       0.49  (0.2-0.8)  where the foot's middle is across the picture (0-1 of its width)
//   drift       11    (0-16)     vw it starts off to one side, over the ground above the words; it comes
//                                home over the creep, before its foot reaches the tallest letters, so the
//                                drop is straight down onto the letter (it keeps the creep visible while
//                                only the foot is on screen)
//   phoneDrift  0     (0-16)     the same on a phone
//   side        'auto' | 'left' | 'right'   the side it drifts in from (auto: from the line's start)
//   nav         a selector for a fixed bar; the line's top is never measured under it
//   foot        unset (the default): the scene ends at its own bottom and the page's designed footer
//               follows it. A selector pulls that element up over the stage's foot, so the last pixel of
//               scroll is the landed object, and the stage keeps its height clear under the action: only
//               for a page that ends on the scene with one plain line, which a page dealt a footer never does.
//   scrub       true (locked to the scrollbar) | seconds 0.1-1
//   phone       'same' (default) | 'rest'
// Scene tokens (CSS): --olo-size (the object's height, share of the screen: 0.3; 0.26 on a tablet; 0.2 on a phone),
// --olo-line-em and --olo-line-em-2 (the line's width in ems on one line and the longer of two lines, for
// the no-script size; the script measures them), --olo-xh (the shelf letter's height in ems, 0.54) and
// --olo-desc (the font's descent in ems, 0.21) for the no-script placement, --olo-btn-radius.
//
// ── Timing ───────────────────────────────────────────────────────────────────────────────────────
// Arrival (the screen before the hold, native scroll): the section comes up with the line, the action, the
// price and the object, whole, hanging at the top of the stage, a little to the side.
// The hold, 0 → 1 (every tenth shows a change):
//   0 → 0.5     the creep: `creep` of the travel, near-even, while the drift comes home
//   0.5 → 0.67  it gathers pace
//   0.67 → 1    `drop` of the travel, fastest around 0.75-0.85, then it slows and sets down on the letter as
//               the scroll runs out (the last tenth still moves, gently)
// Nothing runs on a clock: a visitor who stops halfway sees a still frame. A keyboard user who tabs to
// the action lands on the end of the hold. Nothing passes over the words: the object comes straight down
// onto the letter, behind the type, and the action and the price sit under the line.
// scenes.mjs warns empty-steps over most of the hold on every width (the ground over the line is the room
// the object is lowered through) and, on a phone, dead-hold over the first half (the creep moves the
// object about a tenth of the screen there, fewer pixels than the checker's 1.5%). Read the sheet: if the
// line, the action and the whole object are on screen in every frame and the object stands lower at each
// step, both warnings are defended; never pad the ground or hurry the creep to quiet them.
//
// Phone (below 768px): the line on two lines at the .olo-br, the longer across nearly the full width, the
// object (a quarter of the screen tall, narrower than the line) on the shelf letter of the last line, clear
// of the first, over a shorter travel
// (phoneTravel). Reduced motion, no script and a failed CDN: the finished composition, an ordinary
// section with the object already standing on the letter, nothing hidden.
(() => {
  const ID = 'object-lowered-onto-the-last-line';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && Number.isFinite(n) ? clamp(n, a, b) : d; };
  const r2 = (v) => Math.round(v * 100) / 100;

  // A smooth curve through keyframes [[t, v], …] (monotone cubic, Fritsch-Carlson): no overshoot, so the
  // object never rises back or dips into the letter.
  const curve = (pts) => {
    const n = pts.length, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i] || 1e-6));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) { m[i] = 0; continue; }
      const h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i];
      m[i] = (3 * (h0 + h1)) / ((2 * h1 + h0) / d[i - 1] + (h1 + 2 * h0) / d[i]);
    }
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return (t) => {
      if (t <= xs[0]) return ys[0];
      if (t >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (i < n - 2 && t > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  };

  // the canvas keyword nearest a font-stretch percentage (canvas takes keywords only; the vertical metrics
  // this is used for barely change with the width axis)
  const STRETCH = [[50, 'ultra-condensed'], [62.5, 'extra-condensed'], [75, 'condensed'], [87.5, 'semi-condensed'], [100, 'normal'], [112.5, 'semi-expanded'], [125, 'expanded']];
  const stretchWord = (v) => { const p = parseFloat(v) || 100; return STRETCH.reduce((a, b) => (Math.abs(b[0] - p) < Math.abs(a[0] - p) ? b : a))[1]; };
  let cvs = null;
  // the height of a letter's ink above its baseline, in px, in the font the element is drawn in
  const inkAscent = (el, text) => {
    try {
      const cs = getComputedStyle(el);
      cvs = cvs || document.createElement('canvas');
      const g = cvs.getContext('2d');
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ('fontStretch' in g) g.fontStretch = stretchWord(cs.fontStretch);
      const m = g.measureText(text);
      return Number.isFinite(m.actualBoundingBoxAscent) && m.actualBoundingBoxAscent > 0 ? m.actualBoundingBoxAscent : null;
    } catch { return null; }
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const set = root.querySelector('.olo-set'), line = root.querySelector('.olo-line');
    const shelf = root.querySelector('.olo-shelf'), drop = root.querySelector('.olo-drop');
    const img = drop && drop.querySelector('img');
    if (!stage || !set || !line || !drop || !shelf) {
      console.warn(`${ID}: needs .scene-stage > .olo > .olo-set holding .olo-line (with one .olo-shelf letter) and .olo-drop`);
      return Stage.scene(root, { build: null });
    }
    const o = {
      hold: num(opts.hold, 0.8, 0.6, 1.6),
      creep: num(opts.creep, 0.33, 0.1, 0.36),
      drop: num(opts.drop, 0.55, 0.45, 0.8),
      enter: num(opts.enter, 0.6, 0, 20),
      travel: opts.travel == null || opts.travel === 'auto' ? null : num(opts.travel, null, 20, 90),
      phoneTravel: num(opts.phoneTravel, 34, 20, 80),
      fill: num(opts.fill, 0.97, 0.8, 1),
      phoneFill: num(opts.phoneFill, 0.88, 0.7, 1),
      footX: num(opts.footX, 0.49, 0.2, 0.8),
      drift: num(opts.drift, 11, 0, 16),
      phoneDrift: num(opts.phoneDrift, 0, 0, 16),
      side: opts.side === 'left' ? -1 : opts.side === 'right' ? 1 : 0,
      nav: typeof opts.nav === 'string' ? opts.nav.trim() : '',
      foot: typeof opts.foot === 'string' ? opts.foot.trim() : '',
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const sv = num(opts.scrub, NaN, 0.1, 1);
    const scrub = Number.isFinite(sv) && opts.scrub !== true ? sv : true;
    if (img && img.decode) img.decode().catch(() => {});   // decoded before it moves

    // The pacing, as the share of the travel covered at t (0-1 of the hold): a near-even creep to `creep`
    // at half way, gathering pace to the last third, which carries `drop` of it, fastest around 0.8 and
    // slowing onto the letter.
    const c = o.creep, a = Math.max(1 - o.drop, c + 0.04);
    const pace = curve([[0, 0], [0.25, c * 0.47], [0.5, c], [2 / 3, a], [0.84, a + (1 - a) * 0.72], [0.94, a + (1 - a) * 0.95], [1, 1]]);

    const S = { live: false, phone: false, tl: null, t: 0, T: 0, d: 0, side: -1, home: 0.7, foot: null, state: null, fit: null };
    root.__olo = S;   // state, for inspection in devtools
    const pick = (sel) => { if (!sel) return null; try { return document.querySelector(sel); } catch { return null; } };
    const isPhone = () => matchMedia('(max-width: 767px)').matches;

    // the width in ems of a run of the line's words, at the line's own size and tracking (white-space:
    // nowrap, measured off-screen)
    let ruler = null;
    const emWidth = (text) => {
      if (!ruler) { ruler = document.createElement('span'); ruler.setAttribute('aria-hidden', 'true'); ruler.style.cssText = 'position:absolute;left:-99999px;top:0;white-space:nowrap;visibility:hidden'; }
      line.appendChild(ruler);
      ruler.textContent = text;
      const w = ruler.getBoundingClientRect().width / (parseFloat(getComputedStyle(ruler).fontSize) || 100);
      ruler.remove();
      return w;
    };

    // Fit the line to the row and stand the object on the shelf letter (in rest and live alike).
    const place = () => {
      const W = set.clientWidth;
      if (!W) return;
      const text = line.textContent.replace(/\s+/g, ' ').trim();
      const br = line.querySelector('.olo-br');
      let em;
      if (isPhone() && br) {
        // two lines, broken where the copy says (.olo-br): the longer one runs across the row
        const r = document.createRange(); r.selectNodeContents(line); r.setEndBefore(br);
        const first = r.toString().replace(/\s+/g, ' ').trim();
        em = Math.max(emWidth(first), emWidth(text.slice(first.length).trim()));
      } else em = emWidth(text);
      const fill = isPhone() ? o.phoneFill : o.fill;
      if (em > 0 && Number.isFinite(em)) set.style.setProperty('--olo-fs', r2((W * fill) / em) + 'px');
      // the shelf letter: its box, and where its ink begins (baseline less its ascent)
      const sr = set.getBoundingClientRect();
      const mark = document.createElement('span');
      mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      shelf.appendChild(mark);
      const base = mark.getBoundingClientRect().bottom - sr.top;
      mark.remove();
      const lr = shelf.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(shelf).fontSize) || 100;
      const asc = inkAscent(shelf, shelf.textContent.trim() || 'x') ?? fs * 0.54;
      const footY = base - asc;
      const sL = lr.left - sr.left, sR = lr.right - sr.left;
      // the taller letters beside it on its line (ascenders, capitals): the walls the object's body must
      // stand clear of, and the height of the band it must clear them in
      let wallL = -Infinity, wallR = Infinity, top = footY;
      const walk = document.createTreeWalker(line, NodeFilter.SHOW_TEXT), rg = document.createRange();
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (shelf.contains(n)) continue;
        for (let i = 0; i < n.nodeValue.length; i++) {
          const ch = n.nodeValue[i]; if (!ch.trim()) continue;
          rg.setStart(n, i); rg.setEnd(n, i + 1);
          const b = rg.getBoundingClientRect();
          if (Math.abs(b.top - lr.top) > 2) continue;                       // another line
          const a = inkAscent(shelf, ch) ?? 0;
          if (a <= asc + fs * 0.04) continue;                               // no taller than the shelf
          const l = b.left - sr.left, r = b.right - sr.left;
          if (r <= sL + 1) wallL = Math.max(wallL, r); else if (l >= sR - 1) wallR = Math.min(wallR, l);
          top = Math.min(top, base - a);
        }
      }
      // the object's own outline near its foot (from the picture's alpha): where the foot is, and how far
      // its body reaches either side within the band it must clear the walls in
      const prof = outline();
      const st = stage.getBoundingClientRect(), lo = st.left - sr.left + 16, hiR = st.right - sr.left - 16;
      const gap = Math.max(4, fs * 0.03);
      // the largest size up to the CSS one at which the foot stands on the letter and the body clears
      // the walls and stays on screen
      if (img) img.style.removeProperty('height');
      let h = drop.offsetHeight, w = drop.offsetWidth, x = 0;
      for (let i = 0; i < 8; i++) {
        const band = clamp((footY - top + gap) / h, 0, 1), side = prof.side(band);
        const xMin = Math.max(lo, Number.isFinite(wallL) ? wallL + gap - side.l * w : -Infinity);
        const xMax = Math.min(hiR - w, Number.isFinite(wallR) ? wallR - gap - side.r * w : Infinity);
        // the foot's middle over the letter, as near its middle as the walls allow
        const want = (sL + sR) / 2 - prof.foot * w;
        x = clamp(want, xMin, Math.max(xMin, xMax));
        const footMid = x + prof.foot * w;
        if (xMin <= xMax && footMid >= sL + gap && footMid <= sR - gap / 2) break;
        h *= 0.9; w = h * ratio();
        if (img) img.style.height = r2(h) + 'px';
      }
      set.style.setProperty('--olo-x', r2(x) + 'px');
      set.style.setProperty('--olo-y', r2(footY - h) + 'px');
      root.dataset.oloPlaced = '';
      S.fit = { fs: r2(fs), em: r2(em), footY: r2(footY), asc: r2(asc), tall: r2(top), wallL: Math.round(wallL), shelf: [Math.round(sL), Math.round(sR)], mid: Math.round((sL + sR) / 2), left: Math.round(x), w: Math.round(w), h: Math.round(h) };
    };

    // the picture's shape: width over height, and its outline near the foot from its alpha (a same-origin
    // picture; without it, a plain upright object's outline)
    const ratio = () => { const a = img && (+img.getAttribute('width') || img.naturalWidth), b = img && (+img.getAttribute('height') || img.naturalHeight); return a && b ? a / b : 0.68; };
    let prof0 = null;
    const outline = () => {
      if (prof0) return prof0;
      const fallback = { foot: o.footX, side: () => ({ l: 0, r: 1 }) };
      if (!img || !img.complete || !img.naturalWidth) return fallback;
      try {
        const Wc = 160, Hc = Math.max(1, Math.round((Wc * img.naturalHeight) / img.naturalWidth));
        const c = document.createElement('canvas'); c.width = Wc; c.height = Hc;
        const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, Wc, Hc);
        const d = g.getImageData(0, 0, Wc, Hc).data, rows = [];
        for (let y = Hc - 1; y >= 0; y--) { let l = -1, r = -1; for (let i = 0; i < Wc; i++) if (d[(y * Wc + i) * 4 + 3] > 96) { if (l < 0) l = i; r = i; } rows.push(l < 0 ? null : [l / Wc, (r + 1) / Wc]); }
        const first = rows.findIndex(Boolean); if (first < 0) return fallback;
        const foot = rows.slice(first, first + Math.max(2, Math.round(Hc * 0.015))).filter(Boolean);
        const fm = foot.reduce((a, q) => a + (q[0] + q[1]) / 2, 0) / foot.length;
        prof0 = {
          foot: fm,
          // the widest the body reaches within the bottom `f` of its height
          side: (f) => { let l = 1, r = 0; for (let k = first; k <= first + Math.ceil(f * Hc) && k < rows.length; k++) if (rows[k]) { l = Math.min(l, rows[k][0]); r = Math.max(r, rows[k][1]); } return { l, r }; },
        };
        return prof0;
      } catch { return fallback; }
    };

    // where the object is at t: lifted by the part of the travel still to come, and off to one side by
    // the part of the drift still to come (home by S.home, before its foot reaches the tallest letters)
    const render = (t) => {
      if (!S.live) return;
      S.t = t;
      const u = clamp(t / S.home, 0, 1), e = u * u * (3 - 2 * u);   // eased in and out, fastest mid-creep
      gsap.set(drop, { x: r2(S.side * S.d * (1 - e)), y: r2(-S.T * (1 - pace(t))), force3D: true });
    };

    // Everything the travel depends on, on the laid-out stage (fonts in, current size): runs before
    // ScrollTrigger measures, on every refresh.
    const measure = () => {
      place();
      if (!S.live) return;
      const foot = S.foot;
      if (foot) {
        const tail = Math.round(foot.offsetHeight);
        root.style.setProperty('--olo-tail', tail + 'px');
        foot.style.setProperty('--olo-tail', tail + 'px');
      }
      place();   // the tail moves the row: stand the object again
      const H = stage.clientHeight || innerHeight;
      const st = stage.getBoundingClientRect(), sr = set.getBoundingClientRect();
      const restFoot = sr.top - st.top + S.fit.footY;   // the foot at rest, px from the stage's top
      let top0 = (o.enter * H) / 100;
      const bar = pick(o.nav);
      if (bar) { const cs = getComputedStyle(bar); if (cs.position === 'fixed' || cs.position === 'sticky') top0 = Math.max(top0, bar.getBoundingClientRect().bottom + 8); }
      // it starts whole, its top 	op0 under the stage's top edge, and comes down to the letter
      let T = Math.max(0, restFoot - S.fit.h - top0);
      const cap = S.phone ? o.phoneTravel : o.travel;
      if (cap != null) T = Math.min(T, (cap * H) / 100);
      S.T = Math.round(T);
      // the drift: in from the side of the line's start, over the ground above the words, kept on screen,
      // home before the foot comes down to the tallest letters (with a little air)
      const W = stage.clientWidth || innerWidth, left = sr.left - st.left + S.fit.left;
      S.side = o.side || (S.fit.mid > set.clientWidth * 0.35 ? -1 : 1);
      let d = ((S.phone ? o.phoneDrift : o.drift) * W) / 100;
      d = Math.max(0, S.side < 0 ? Math.min(d, left - 8) : Math.min(d, W - 8 - (left + S.fit.w)));
      const tall = sr.top - st.top + S.fit.tall;
      let home = 0.5;
      for (let t = 0; t <= 0.5; t += 0.005) { if (restFoot - S.T * (1 - pace(t)) > tall - 12) { home = Math.max(0, t - 0.005); break; } }
      if (home < 0.25) d = 0;
      S.d = Math.round(d); S.home = Math.max(0.25, home);
      Object.assign(S.fit, { T: S.T, restFoot: Math.round(restFoot), d: S.d, home: r2(S.home) });
    };

    const unhook = () => {
      S.live = false;
      if (S.foot) { S.foot.removeAttribute('data-olo-foot'); S.foot.style.removeProperty('--olo-tail'); }
      S.foot = null;
      root.style.removeProperty('--olo-tail');
      if (window.gsap) gsap.set(drop, { clearProps: 'transform' });
    };

    const build = (tl, ctx) => {
      S.live = true;
      S.phone = ctx.phone;
      S.tl = tl;
      S.foot = pick(o.foot);
      if (S.foot) S.foot.setAttribute('data-olo-foot', '');
      measure();
      const state = { t: 0 };
      tl.fromTo(state, { t: 0 }, { t: 1, duration: 1, ease: 'none', onUpdate: () => render(state.t) }, 0);
      S.state = state;
      render(0);
      // when the stage's context reverts (a media change, reduced motion switched on), take this scene's
      // own writes with it
      if (window.gsap && gsap.context) gsap.context(() => () => unhook());
    };

    // a keyboard user who reaches the action lands on the end of the hold, with the object set down
    root.addEventListener('focusin', () => {
      if (!S.live || !S.tl || S.t >= 0.985) return;
      const st = S.tl.scrollTrigger; if (!st) return;
      const y = Math.ceil(st.end);
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    if (!root.__oloWired) {
      root.__oloWired = true;
      if (window.ScrollTrigger) {
        ScrollTrigger.addEventListener('refreshInit', measure);
        // a refresh renders the timeline with its callbacks muted: bring the pose up to date
        ScrollTrigger.addEventListener('refresh', () => { if (S.live && S.state) render(S.state.t); });
      }
      // the line's size and letters decide where the object stands: again once the fonts are in, when
      // the picture has its size, and on resize while the scene rests (live, ScrollTrigger does it)
      const again = () => { if (S.live && window.ScrollTrigger) ScrollTrigger.refresh(); else place(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(again).catch(() => {});
      if (img && !img.complete) img.addEventListener('load', again, { once: true });
      let rt = 0;
      addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (!S.live) place(); }, 120); });
    }

    return Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : 'same',
      rest: () => { unhook(); place(); },
    });
  };
})();
