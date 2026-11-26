// assets/scenes/wordmark-under-strain/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / wordmark-under-strain.js — one giant word put under load by the scroll.
//
// The closing word of a page (4-8 letters, never the brand's name: a giant name fails the inspector's
// giant-contact) is held on screen and strained by the scroll:
// it is crushed onto its baseline and springs back, and its full stop (a square added after the word)
// loosens, falls out and lands flat as the call to action, so at rest the word itself reads whole. Type,
// one flat ground colour and one label; use it once per page, as the closing section, for a loud brand.
// A stepped echo of stacked copies behind the word is kept as an option (echo: true, 768px and wider
// only), off by default: its bands read as a striped, winged badge over the word, and on a phone they
// shrink to one sliced row of letter tops.
//
// DOM. Only the heading (with its visually hidden word) and the link are required; the script builds the
// word's copy (and, with echo: true, the stack of copies behind it). Authoring the front copy as below
// gives the word without script too.
//
//   <section class="scene ws" data-scene="wordmark-under-strain" aria-labelledby="ws-title" data-options='{}'>
//     <div class="scene-stage">
//       <div class="ws-top"><p>One sentence, 45+ characters, about the offer.</p><p>Porto, 18 May 2027</p></div>
//       <h2 class="ws-word" id="ws-title">
//         <span class="ws-sr">UPWARD</span>
//         <span class="ws-stack" aria-hidden="true">
//           <span class="ws-copy ws-copy--front">UPWARD</span>
//         </span>
//       </h2>
//       <a class="ws-drop" href="#contact"><span class="ws-drop__label">Enter the race</span></a>
//       <div class="ws-meta"><a href="mailto:…">hello@…</a><span>Street, City</span><a href="…">Journal</a></div>
//     </div>
//   </section>
//
// The page needs, like every scene: <script>document.documentElement.classList.add('js')</script> in
// <head> (the stage only holds a live scene under html.js; this file adds the class itself if a page
// forgot it, but then the first paint shows the finished composition), one flat ground colour (--ground)
// shared with the section after the scene, and the word in .ws-sr (or data-word on .ws-word).
//
// The word: set it in capitals (or numerals), 4-8 letters, best with no I, l or 1. A square full stop is
// added after it (in the front copy only) and is what falls, so the word rests whole; letter: 'straight'
// drops the word's own straight letter instead (the old default), which leaves the word broken at rest
// ("STA RS"), so use it only where the gap is the point.
// (With echo: true) capitals are what the echo is drawn for: every letter has ink on the cap line, so each copy behind
// steps out as one even row of bands across the word. Mixed case runs, but reads thinner: letters that
// rise above the capitals (b d f h k l t, the dot of i) get plates tall enough to hide their own bands
// (an ascender's band would float over the word as a loose block), and x-height letters have none, so
// only the capitals and the side strips echo. Use mixed case only when the name is never written in
// capitals.
// A first or last letter whose outer side is mostly open (E F K L Z, A R C at the end), or whose stem is
// set in from its outer edge far enough to peek out beside the copy in front (T, Y, J), gets a wider
// plate on that side, so the echo there steps only through its top bands instead of leaving a dotted
// trail or a hairline sliver of stem.
//
// CSS custom properties a page can set on the section (all optional):
//   --ws-chars   5       letters in the word. Only used when no script runs at all, to size the word from
//                        CSS alone; set it for words that are not 5 letters long
//   --ws-weight  800     weight of the word;  --ws-tracking  -.02em  its letter spacing
//   --ws-text-size 18px  top and bottom rows; --ws-label-size 16px the button label
//   --ground, --ink, --font-display, --font-text  the page's tokens, picked up as they are
//
// Options (data-options JSON). Default, then range:
//   hold       1        screens the stage is held on desktop (1-4): one word on flat ground holds one screen
//                       (longer, the frames are mostly empty ground for over a screen: held-dead-screen)
//   phoneHold  1        screens held under 768px (1-2): the same one screen as on desktop
//   phone      'same'   'same' runs the scene with phone numbers; 'rest' shows the finished composition
//   scrub      auto     true when Lenis smooths the page, else 0.8 (seconds of catch-up); set to override
//   echo       false    true adds the stepped echo of stacked copies on screens 768px and wider (never on a
//                       phone, where it is one sliced row of letter tops). Off: the bands read as a badge
//   copies     6        copies in the echo, back to front (4-8); fewer, bigger steps if bands would be thin
//                       or if the echo could not be complete by 45% of the hold (50% without the drop)
//   step       1/13     scale each copy loses (1/16-1/9)
//   shift      2        how far each copy sinks, in % of the word height (1-4)
//   squash     0.14     how far the word is crushed onto its baseline (0-0.15; 0 = a calm, graphic opening);
//                       0.10 with echo: true, where the crush is short and the phone takes 70% of it
//   spring     3        strength of the spring back, back.out (1.5-3)
//   drop       true     the full stop falls out and becomes the button; false keeps the word as it is, the
//                       button sits under it from the start (with echo: true, the echo takes the whole hold)
//   letter     'stop'   what falls: 'stop' an added square full stop (the word rests whole), 'straight' the
//                       word's own I, l or 1 (the word rests with a gap), or a 0-based letter index
//   size       [300,64] landed button on desktop, px (240-360 x 56-72); phoneSize [240,52]
//   radius     0        landed corner radius, px (0-8); the letter stays square, the bar rounds from 66%
//   accent     ''       a colour the button takes as it lands (keep 4.5:1 against the ground-coloured label)
//   reveal     'wipe'   how the label appears on the falling bar: 'wipe' (written left to right, whole
//                       characters at a time) or 'fade'; either runs on a clock (0.4s) once the bar has
//                       cleared the word and is all but flat, so no scroll ever rests on half a label
//   fill       0.92     width of the word's ink as a share of the stage width (0.8-0.96)
//   maxHeight  0.42     limit on the word's cap height as a share of the stage height (0.3-0.45)
//   stretch    'normal' font-stretch of the word on desktop ('extra-condensed' to 'expanded')
//   phoneStretch 'condensed'  font-stretch under 768px: a font with a width axis gains height on the
//                       phone; a font without one simply keeps its normal width
//
// Progress map (default, no echo): 0-4% still; 4-34% crushed to 86% height, giving fast and then
// resisting; 34-52% springs back past 100%; then the drop as below, 4% later: 56% the full stop becomes
// a bar of its size, 56-64% it loosens, from 59-61% it drops, flat at 84%; its label is written on a
// clock (0.4s) once the bar is all but flat (82%), never half way where a scroll rests; 84-92% it lands
// with a squash under the word's centre; 88% clickable; 92-100% held: the whole word, centred (the stop
// hung in the margin until it fell), with the button under it.
// Progress map (echo: true, desktop): 0-5% still; 5-16% crushed to 90% height; 16-28% springs back past 100%;
// 16-52% the echo opens (front copy to 61.5%). The copies behind never fade: each one steps out at full
// ink, nearest first and one at a time, the moment its edge is 6px or more — first its side strips
// (from about 33%), then its top band (about 36-40%) — so the echo grows outward from the word and
// never shows a hairline. The copies behind are drawn, not written (their letters are generated
// content), so the page's text holds the word once. 52% the straight letter becomes a bar of the same
// size; 52-60% it loosens (tilts up to 8 degrees, as far as its own place in the word allows, and
// sags); from 55-57% it drops with gravity, slipping straight out of its slot, and turns over only once
// it has left the word (flat at 80%). It swings on a hinge on its own axis. Its path (the side it tips
// to, the hinge, the loosening tilt, when it turns, how it drops, whether it first eases off the closer
// neighbour) is chosen when the scene is measured: each candidate is moved over a 1:1 drawing of the
// word in 0.005 steps, and only a path that keeps at least 4px of ground between the bar and every
// letter (or, for a letter set tighter than that, its own gap at rest), and keeps the bar inside the
// letter's own column of the word while any of it is above the baseline, is taken, the most natural of
// those first; bar and letters are one ink, so a touch would fuse them, and a bar lying across a
// neighbour's place reads as crossing the name. A letter with little room at rest (a condensed face on
// the phone) loosens less or not at all. It drifts to its landing point late, stays the size of the
// letter while it leaves the word and stretches into the button as it clears it; the label is written
// on it, on a clock, once it is below the word's ink, big enough to carry it and all but flat (78-82%); 80-88% it lands with
// a squash; 84% clickable; 88-100% held. It lands under the word's centre (on desktop, straight under
// its slot when the letter came from near one end of the word), at least half the letter's height
// below the baseline, so the upright letter is out of the word before it turns. With drop: false the
// echo opens over 16-85%, fast first, and is complete by half the hold.
// Eases: the studied progress map is quadratic where it says power2 (0.979 at 10%, e = 0.778 at 40%),
// and GSAP's power2 is cubic, so the curves here are one GSAP step lower (power1 for power2, power2 for
// power3). Ease 'none' everywhere else; back.out only for the spring and the landing, as the spec asks.
(() => {
  const ID = 'wordmark-under-strain';
  const STRAIGHT = 'Il1|';
  const html = document.documentElement;
  if (!html.classList.contains('js')) html.classList.add('js');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d);
  const pair = (v, d, [a, b], [c, e]) => (Array.isArray(v) && v.length === 2 ? [num(v[0], d[0], a, b), num(v[1], d[1], c, e)] : d);
  const trimmed = !!(window.CSS && CSS.supports && (CSS.supports('text-box', 'trim-both cap alphabetic') || CSS.supports('text-box-trim', 'trim-both')));
  const sheet = document.createElement('canvas');
  const pen = sheet.getContext('2d', { willReadFrequently: true });
  const WIDTHS = ['extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded'];
  const MIN = 6; // no band, strip or gap of the echo is ever thinner than this, in px

  // The eases the timeline uses, as plain functions (GSAP's own curves), so thresholds and the bar's path
  // can be computed exactly; INV inverts the echo eases.
  const EASE = {
    'power1.inOut': (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
    'power2.out': (t) => 1 - (1 - t) ** 3,
  };
  const INV = {
    'power1.inOut': (e) => (e < 0.5 ? Math.sqrt(e / 2) : 1 - Math.sqrt((1 - e) / 2)),
    'power2.out': (e) => 1 - Math.cbrt(1 - e),
  };
  const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const backOut2 = (t) => { const q = t - 1; return t ? q * q * (3 * q + 2) + 1 : 0; };
  const ECHO_AT = 0.16;

  const settings = (opts) => {
    const o = opts || {};
    return {
      hold: num(o.hold, 1, 1, 4),
      phoneHold: num(o.phoneHold, 1, 1, 2),
      phone: o.phone === 'rest' ? 'rest' : 'same',
      scrub: typeof o.scrub === 'boolean' || typeof o.scrub === 'number' ? o.scrub : null,
      echo: o.echo === true,
      copies: Math.round(num(o.copies, 6, 4, 8)),
      step: num(o.step, 1 / 13, 1 / 16, 1 / 9),
      shift: num(o.shift, 2, 1, 4),
      // a deeper crush without the echo, so the strain reads at every step of its longer run
      squash: num(o.squash, o.echo === true ? 0.1 : 0.14, 0, 0.15),
      spring: num(o.spring, 3, 1.5, 3),
      drop: o.drop !== false,
      // what falls: 'stop' (an added square full stop, so the word rests whole), 'straight' (the word's own
      // I, l or 1, which leaves a gap in the word at rest) or a 0-based letter index
      letter: Number.isInteger(o.letter) ? o.letter : o.letter === 'straight' ? 'straight' : 'stop',
      size: pair(o.size, [300, 64], [240, 360], [56, 72]),
      phoneSize: pair(o.phoneSize, [240, 52], [200, 300], [44, 60]),
      radius: num(o.radius, 0, 0, 8),
      accent: typeof o.accent === 'string' ? o.accent : '',
      reveal: o.reveal === 'fade' ? 'fade' : 'wipe',
      fill: num(o.fill, 0.92, 0.8, 0.96),
      maxHeight: num(o.maxHeight, 0.42, 0.3, 0.45),
      stretch: WIDTHS.includes(o.stretch) ? o.stretch : 'normal',
      phoneStretch: WIDTHS.includes(o.phoneStretch) ? o.phoneStretch : 'condensed',
    };
  };

  // Echo plans, tried in order: the first whose thinnest band, strip and gap are all at least MIN px and
  // whose echo is complete in time wins; none means no echo. py is the plate's top overflow in % of the
  // cap height; xr the plate's side overflow past the ink as a share of half the ink width.
  // The flat plan (no echo) is the default everywhere: the stacked bands read as a striped, winged badge
  // over the word (drawn lines in effect), and under 768px they shrink to one sliced row of letter tops.
  // The echo runs only when a page asks for it (echo: true), and never under 768px.
  const XR = (b) => 0.8 * (b.py / 100) * b.step / (b.shift / 100 + b.step);
  const FLAT = (phone) => ({ n: 1, step: 0, shift: 0, py: phone ? 9 : 5, xr: 0, strips: false, wl: false, wr: false });
  const plans = (o, phone) => (phone || !o.echo
    ? [FLAT(phone)]
    : [{ n: o.copies, step: Math.min(o.step, 0.6 / (o.copies - 1)), shift: o.shift, py: 5 },
      { n: 5, step: 1 / 10, shift: 3, py: 5 }, { n: 4, step: 1 / 8, shift: 4, py: 5 }]
      .filter((p, k) => k === 0 || p.n < o.copies).map((b) => ({ ...b, xr: XR(b), strips: true })));
  // With the echo opened to e (0-1), copy j's top band shows above copy j+1's plate:
  //   H0 * (e * (shift + step + py * (j + 1) * step) - py)
  // and its side strips outside copy j+1's plate: e * step * (half + X * (j + 1)) - X, where half is half
  // the ink width (the copies scale about the ink's centre) and X the plate's side overflow.
  const thinnest = (p, h0, half) => {
    let m = Infinity;
    const X = p.xr * half, py = p.py / 100;
    for (let j = 0; j < p.n - 1; j++) {
      const sk = 1 - (j + 1) * p.step;
      m = Math.min(m, h0 * (p.shift / 100 + p.step + py * (j + 1) * p.step - py), py * h0 * sk);
      if (p.strips) m = Math.min(m, p.step * (half + X * (j + 1)) - X, X * sk);
    }
    return m;
  };
  // When each copy behind the front one steps out, in echo time (0-1): show = its side strips are MIN
  // px wide (its band is still clipped away), full = its band is MIN px thick too. Nearest copy first,
  // and one at a time: a copy steps out only once the copy in front of it is whole (at least 0.008 of
  // the hold later), because a clipped copy's plate is clipped with it and would bare the copy behind.
  const schedule = (p, h0, half, echo) => {
    const st = p.step, sf = p.shift / 100, py = p.py / 100, X = p.xr * half, inv = INV[echo.ease];
    const du = 0.008 / echo.dur, show = [], full = [];
    for (let j = p.n - 2; j >= 0; j--) {
      const eb = (py + MIN / h0) / (sf + st + py * (j + 1) * st);
      const es = p.strips ? (X + MIN) / (st * (half + X * (j + 1))) : eb;
      let us = inv(Math.min(1, es)), uf = inv(Math.min(1, Math.max(eb, es)));
      if (j < p.n - 2) { us = Math.max(us, full[j + 1] + du); uf = Math.max(uf, us); }
      show[j] = Math.min(1, us); full[j] = Math.min(1, Math.max(uf, us));
      if (!p.strips) show[j] = full[j];
    }
    return { show, full };
  };
  // Which outer sides of the word get a plate wide enough to hide that side's strips: a side whose
  // letter is mostly open (open()), and a side whose letter has a stem set in from its outer edge (T,
  // Y, J) that the copy in front's plate would not cover, because a stem peeking out beside that
  // plate is a long sliver that grows from 0px, a hairline. m in em, p a plan.
  const wides = (m, p) => {
    if (!m || p.n < 2) return { l: !!(m && m.openL), r: !!(m && m.openR) };
    const half = (m.R - m.L) / 2, X = (p.xr || 0) * half, st = p.step, sb = 1 - (p.n - 2) * st;
    const peek = (stems) => (stems || []).some((d) => (half + X) * st - (d + X) * sb > -0.006);
    return { l: m.openL || peek(m.stemsL), r: m.openR || peek(m.stemsR) };
  };
  const choose = (o, phone, h0, stageH, half, m, echo, deadline) => {
    let best = null;
    const all = plans(o, phone);
    if (all[0].n < 2) return all[0];
    for (const base of all) {
      if (base.minH && h0 < base.minH * stageH) continue;
      const sf = 1 - (base.n - 1) * base.step;
      // the side overflow keeps the ground gaps between the strips open
      const xr = Math.max(base.xr, (MIN + 1) / (sf * half));
      const w = wides(m, { ...base, xr });
      // a shorter word needs a taller plate overflow to keep the ground gaps between its bands open;
      // a lower plate lets the bands appear sooner, so it is lowered (down to that limit) when the echo
      // would otherwise be complete too late
      const low = (100 * (MIN + 0.5)) / (h0 * sf);
      for (let py = Math.max(base.py, low); py >= low - 1e-6; py -= 0.5) {
        const p = { ...base, xr, py, strips: !(w.l && w.r), wl: w.l, wr: w.r };
        if (thinnest(p, h0, half) < MIN) continue;
        const done = ECHO_AT + schedule(p, h0, half, echo).full[0] * echo.dur;
        if (done <= deadline) return p;
        if (!best || done < best.done) best = { p, done };
        if (py === low) break;
        if (py - 0.5 < low) py = low + 0.5;
      }
    }
    return best ? best.p : { n: 1, step: 0, shift: 0, py: phone ? 9 : 5, xr: 0, strips: false, wl: false, wr: false };
  };

  // Ink box of one glyph at the element's font, relative to its pen position and baseline: l and r are
  // the ink's left and right edges right of the pen, a and d the ink above and below the baseline.
  // measureText's bounding box is not trusted (variable fonts report the outline's design box, several
  // pixels off), so the glyph is drawn and its pixels are read; edge coverage gives sub-pixel edges.
  // With `zone`, also how much of the cap height is inked within zone px of the left and right ink edges.
  const STRETCH = { 50: 'ultra-condensed', 62.5: 'extra-condensed', 75: 'condensed', 87.5: 'semi-condensed', 100: 'normal', 112.5: 'semi-expanded', 125: 'expanded', 150: 'extra-expanded', 200: 'ultra-expanded' };
  const fontOf = (el) => {
    const cs = getComputedStyle(el);
    return { font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, stretch: STRETCH[parseFloat(cs.fontStretch)] || 'normal', fs: parseFloat(cs.fontSize) || 16 };
  };
  const ink = (ch, el, zone, cap) => {
    const { font, stretch, fs } = fontOf(el);
    const setFont = () => { pen.font = font; if ('fontStretch' in pen) pen.fontStretch = stretch; };
    setFont();
    const m = pen.measureText(ch);
    const pad = Math.ceil(fs * 0.3), bx = pad, by = Math.ceil(fs * 1.15);
    sheet.width = Math.ceil(m.width + pad * 2); sheet.height = Math.ceil(fs * 1.6);
    setFont(); pen.fillStyle = '#000'; pen.textBaseline = 'alphabetic'; pen.textAlign = 'left';
    pen.fillText(ch, bx, by);
    const W = sheet.width, H = sheet.height, px = pen.getImageData(0, 0, W, H).data;
    const col = new Float32Array(W), row = new Float32Array(H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = px[(y * W + x) * 4 + 3]; if (a) { if (a > col[x]) col[x] = a; if (a > row[y]) row[y] = a; } }
    let x0 = 0, x1 = W - 1, y0 = 0, y1 = H - 1;
    while (x0 < W && !col[x0]) x0++;
    while (x1 > x0 && !col[x1]) x1--;
    while (y0 < H && !row[y0]) y0++;
    while (y1 > y0 && !row[y1]) y1--;
    if (x0 >= W) return { l: 0, r: m.width, a: fs * 0.7, d: 0, w: m.width, fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent, edge: null };
    const left = x0 + 1 - col[x0] / 255, right = x1 + col[x1] / 255, topE = y0 + 1 - row[y0] / 255, bottom = y1 + row[y1] / 255;
    let edge = null;
    if (zone && cap) {
      // rows from the cap line to the baseline with ink within `zone` of each outer edge, as runs
      const side = (from, to) => {
        const runs = []; let on = -1, inked = 0;
        const ya = Math.round(by - cap), yb = Math.round(by);
        for (let y = ya; y <= yb; y++) {
          let hit = false;
          for (let x = from; x <= to && !hit; x++) hit = px[(y * W + x) * 4 + 3] > 127;
          if (hit) { inked++; if (on < 0) on = y; } else if (on >= 0) { runs.push([on - ya, y - ya]); on = -1; }
        }
        if (on >= 0) runs.push([on - ya, yb + 1 - ya]);
        const span = yb + 1 - ya;
        return { cover: inked / span, runs: runs.map(([a, b]) => [a / span, b / span]) };
      };
      // stems set in from an outer edge: runs of rows, a quarter of the cap height or longer, whose first
      // ink sits at one depth (within 1.5px) more than 2px in from that edge; their depths, in px
      const stems = (left) => {
        const ya = Math.round(by - cap), yb = Math.round(by), need = 0.25 * (yb - ya), out = [];
        let a = -1, d0 = 0, n = 0;
        const close = () => { if (a >= 0 && n >= need) out.push(d0); a = -1; n = 0; };
        for (let y = ya; y <= yb; y++) {
          let d = -1;
          if (left) { for (let x = x0; x <= x1; x++) if (px[(y * W + x) * 4 + 3] > 127) { d = x - x0; break; } }
          else for (let x = x1; x >= x0; x--) if (px[(y * W + x) * 4 + 3] > 127) { d = x1 - x; break; }
          if (d > 2 && a >= 0 && Math.abs(d - d0) <= 1.5) { n++; continue; }
          close();
          if (d > 2) { a = y; d0 = d; n = 1; }
        }
        close();
        return out;
      };
      const z = Math.max(1, Math.round(zone));
      edge = { l: side(x0, Math.min(x1, x0 + z)), r: side(Math.max(x0, x1 - z), x1) };
      edge.l.stems = stems(true); edge.r.stems = stems(false);
    }
    return { l: left - bx, r: right - bx, a: by - topE, d: bottom - by, w: m.width, fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent, edge };
  };
  // An outer side of the first or last letter that is mostly open would leave a grid of arm ends in the
  // echo (E, L, F, K, Z...). One run of ink that touches the cap line (T, Y, P) continues the top bands,
  // and one long run (D, O, U) reads as an arc, so those keep their strips.
  const open = (s) => {
    if (!s || s.cover >= 0.8) return false;
    if (s.runs.length === 1 && (s.runs[0][0] < 0.04 || s.runs[0][1] - s.runs[0][0] >= 0.5)) return false;
    return true;
  };
  const rel = (el, base) => { const r = el.getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; };
  // the laid-out box of the idx-th character (code point) of an element's text: its left edge is the pen
  // position, kerning and letter spacing included
  const charBox = (el, idx) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n, k = 0;
    while ((n = walk.nextNode())) {
      const cps = [...n.data];
      if (idx < k + cps.length) {
        const at = cps.slice(0, idx - k).join('').length;
        const r = document.createRange();
        r.setStart(n, at); r.setEnd(n, at + cps[idx - k].length);
        return r.getBoundingClientRect();
      }
      k += cps.length;
    }
    return null;
  };
  const em = (v) => v.toFixed(4) + 'em';

  const make = (root, opts = {}) => {
    const o = settings(opts);
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const word = root.querySelector('.ws-word');
    if (!stage || !word) return null;
    const top = root.querySelector('.ws-top');
    const meta = root.querySelector('.ws-meta');
    const drop = root.querySelector('.ws-drop');
    const label = drop && drop.querySelector('.ws-drop__label');
    let sr = word.querySelector('.ws-sr');
    let stack = word.querySelector('.ws-stack');
    const text = (word.dataset.word || (sr ? sr.textContent : word.textContent) || '').trim().replace(/\s+/g, ' ');
    if (!text) return null;
    if (!sr) { sr = document.createElement('span'); sr.className = 'ws-sr'; sr.textContent = text; word.textContent = ''; word.append(sr); }
    if (!stack) { stack = document.createElement('span'); stack.className = 'ws-stack'; stack.setAttribute('aria-hidden', 'true'); word.append(stack); }

    // the letter that falls: by default an added square full stop, so the word itself rests whole; an
    // asked index; or with letter: 'straight' the first straight letter that is not first or last, else a
    // straight first or last letter (and the full stop when the word has none)
    const dropOn = o.drop && !!drop;
    const chars = [...text];
    let slotAt = -1, added = false;
    if (dropOn) {
      if (Number.isInteger(o.letter) && o.letter >= 0 && o.letter < chars.length && chars[o.letter].trim()) slotAt = o.letter;
      if (slotAt < 0 && o.letter === 'straight') {
        slotAt = chars.findIndex((c, i) => i > 0 && i < chars.length - 1 && STRAIGHT.includes(c));
        if (slotAt < 0) slotAt = chars.findIndex((c) => STRAIGHT.includes(c));
      }
      if (slotAt < 0) { chars.push('.'); slotAt = chars.length - 1; added = true; }
    }
    const real = added ? chars.length - 1 : chars.length; // letters of the word itself
    root.dataset.drop = dropOn ? 'on' : 'off';
    if (/[gjpqy]/.test(text)) root.style.setProperty('--ws-plate-b', '25%');
    // the echo's timing: with the drop it opens over 16-52%; without, over 16-85%, fast first
    const ECHO = dropOn ? { dur: 0.36, ease: 'power1.inOut', due: 0.45 } : { dur: 0.69, ease: 'power2.out', due: 0.5 };

    const S = { phone: false, plan: null, btn: o.size, land: 0.3, key: '', geo: null, live: false, tl: null, front: null, slot: null, list: [], m: null, state: [] };

    // The stack holds the most copies this mode can use; the plan shows the front n of them. The back
    // copies sit in one group (.ws-back) under the front copy. An added full stop is only in the front
    // copy, so the back copies end at the last letter of the word.
    const copies = (n) => {
      const sig = `${n}|${chars.join('')}|${slotAt}`;
      if (stack.dataset.sig !== sig) {
        stack.textContent = '';
        const back = document.createElement('span');
        back.className = 'ws-back';
        stack.append(back);
        for (let i = 0; i < n; i++) {
          const front = i === n - 1;
          const c = document.createElement('span');
          c.className = 'ws-copy' + (front ? ' ws-copy--front' : '');
          c.style.setProperty('--i', i);
          // the copies behind are drawn, not written: their letters are generated content (data-text),
          // so the page's text holds the word once and no echo counts as words covered by the next copy
          if (!front) c.dataset.text = chars.slice(0, real).join('');
          else if (slotAt < 0) c.textContent = chars.join('');
          else {
            const l = document.createElement('span');
            l.className = 'ws-l' + (front ? ' ws-slot' : '');
            l.textContent = chars[slotAt];
            c.append(chars.slice(0, slotAt).join(''), l, chars.slice(slotAt + 1).join(''));
          }
          (front ? stack : back).append(c);
        }
        stack.dataset.sig = sig;
      }
      S.back = stack.querySelector(':scope > .ws-back');
      S.front = stack.lastElementChild;
      S.list = [...S.back.children, S.front];
      S.slot = S.front.querySelector('.ws-slot');
    };
    // a copy's place in the plan's echo: 0 is the back copy, n - 1 the front; copies the plan leaves out
    // are hidden and stay at 0
    const idx = (i) => Math.max(0, i - (S.list.length - S.plan.n));

    const applyPlan = (p) => {
      S.plan = p;
      const s = root.style;
      const off = S.list.length - p.n;
      // a new plan maps the echo's steps onto other copies: forget what each step showed, so the next
      // frame sets every copy afresh (a copy the old plan left out would otherwise show whole)
      S.state = [];
      S.list.forEach((el, i) => { el.style.display = i < off ? 'none' : ''; el.style.setProperty('--i', Math.max(0, i - off)); el.style.visibility = S.live && i < S.list.length - 1 ? 'hidden' : ''; el.style.clipPath = ''; });
      s.setProperty('--ws-n', p.n);
      s.setProperty('--ws-step', p.step.toFixed(5));
      s.setProperty('--ws-shift', p.shift);
      s.setProperty('--ws-plate-y', p.py.toFixed(2) + '%');
      s.setProperty('--ws-front', ((p.n - 1) * p.shift / 100).toFixed(4));
      s.setProperty('--ws-land', S.land);
      root.dataset.plan = p.n > 1 ? 'echo' : 'flat';
    };

    // The word's shape in em, read at 100px with the stack and the front copy at rest: where its ink
    // starts and ends inside the copy box (side bearings, kerning and letter spacing included), its cap
    // height, how far each letter rises above the capitals, and whether the first and last letters'
    // outer sides are mostly open.
    const shape = () => {
      const box = S.front.getBoundingClientRect();
      const cap = trimmed ? box.height : ink('H', S.front).a;
      const ls = parseFloat(getComputedStyle(S.front).letterSpacing) || 0;
      const first = chars.findIndex((c) => c.trim()), last = real - 1;
      const cols = chars.map((ch, i) => {
        const r = charBox(S.front, i);
        const x = r ? r.left - box.left : 0;
        if (!ch.trim()) return { x: x / 100, l: null, r: null, rise: 0, edge: null, adv: 0 };
        const g = ink(ch, S.front, i === first || i === last ? 0.07 * 100 : 0, cap);
        const adv = r ? r.width - ls : 0;
        // a canvas without font-stretch draws another width of the face: scale to the page's advance
        const k = g.w > 0 && adv > 0 && Math.abs(adv / g.w - 1) > 0.015 ? adv / g.w : 1;
        // round overshoots stay on the cap line; only real ascenders rise
        const rise = g.a - cap > 0.04 * cap ? g.a - cap : 0;
        if (g.edge) for (const s of [g.edge.l, g.edge.r]) s.stems = s.stems.map((d) => (d * k) / 100);
        return { x: x / 100, l: (x + g.l * k) / 100, r: (x + g.r * k) / 100, rise: rise / 100, edge: g.edge, adv: adv / 100 };
      });
      const inked = cols.slice(0, real).filter((c) => c.l !== null);
      const L = inked.length ? Math.min(...inked.map((c) => c.l)) : 0;
      const R = inked.length ? Math.max(...inked.map((c) => c.r)) : box.width / 100;
      const RAll = added && cols[chars.length - 1].r !== null ? Math.max(R, cols[chars.length - 1].r) : R;
      const rises = cols.slice(0, real).filter((c) => c.l !== null).map((c) => c.rise);
      return {
        w: box.width / 100, cap: cap / 100, L, R, RAll, cols,
        rise: Math.max(0, ...rises), riseMin: rises.length ? Math.min(...rises) : 0,
        openL: first >= 0 && open(cols[first].edge && cols[first].edge.l),
        openR: last >= 0 && open(cols[last].edge && cols[last].edge.r),
        stemsL: first >= 0 && cols[first].edge ? cols[first].edge.l.stems : [],
        stemsR: last >= 0 && cols[last].edge ? cols[last].edge.r.stems : [],
      };
    };

    // Plates and placement from the shape and the plan, all in em so they hold at any size: the plates
    // reach the same distance past the ink on both sides (so the strips are symmetric whatever the side
    // bearings), wider on a side whose outer letter is mostly open (no strips there at all), the copies
    // scale about the ink's centre, and the ink, not the advance box, is centred.
    const place = (m, p) => {
      const s = root.style;
      const half = (m.R - m.L) / 2;
      const X = p.n > 1 ? p.xr * half : 0.01;
      // wide enough that no strip ever shows: step * half / (front scale), plus a margin
      const wide = p.n > 1 ? p.step * half / (1 - (p.n - 1) * p.step) + 0.03 : X;
      const w = p.wl === undefined ? wides(m, p) : { l: p.wl, r: p.wr };
      const Xl = w.l ? Math.max(X, wide) : X, Xr = w.r ? Math.max(X, wide) : X;
      s.setProperty('--ws-plate-l', em(Xl - m.L));
      s.setProperty('--ws-plate-r', em(Xr - (m.w - m.R)));
      s.setProperty('--ws-ink-c', em((m.L + m.R) / 2 - m.w / 2));
      s.setProperty('--ws-ink-shift', em(m.w / 2 - (m.L + m.R) / 2));
      s.setProperty('--ws-asc', em(m.rise));
      // Letters taller than the capitals (b d f h k l t, the dot of i) get a plate of their own, tall
      // enough to hide their own bands: an ascender's band would float over the word as a loose block,
      // out of step with the bands of the capitals (copy j's top shows over copy j + 1's plate by
      // h * step + shift - q * s, h the letter's height, q its plate's reach, s the front copy's scale).
      // The plate's top is a skyline.
      const cols = m.cols.slice(0, real);
      const sf = 1 - (p.n - 1) * p.step;
      const reach = cols.map((c) => {
        const base = (p.py / 100) * m.cap + c.rise;
        if (!(c.rise > 0) || p.n < 2) return base;
        const hide = ((m.cap + c.rise) * p.step + (p.shift / 100) * m.cap) / sf + 0.01;
        return Math.max(base, c.rise + hide);
      });
      const T = Math.max((p.py / 100) * m.cap + m.rise, ...reach);
      s.setProperty('--ws-plate-t', em(T));
      if (reach.some((r) => Math.abs(r - T) > 1e-4)) {
        // Each letter's column of the skyline is widened to cover the same letter of the copy behind:
        // that copy is larger and scales about the ink's centre (c0), so its letters sit further out, by
        // up to the scale ratio of the front pair (rmax). Without this the edge of a tall letter behind
        // peeks past the step down to its lower neighbour as a thin upright sliver.
        const pl = Xl - m.L, hi = m.w + (Xr - (m.w - m.R));
        const c0 = (m.L + m.R) / 2, rmax = p.n > 1 ? (1 - (p.n - 2) * p.step) / sf : 1;
        const spans = cols.map((c, i) => {
          let a = i ? c.x : -1e9, b = i < cols.length - 1 ? cols[i + 1].x : 1e9;
          if (c.l !== null && p.n > 1) { a = Math.min(a, c0 + (c.l - c0) * rmax - 0.01); b = Math.max(b, c0 + (c.r - c0) * rmax + 0.01); }
          return [a, b];
        });
        const xs = [...new Set(spans.flat().map((x) => clamp(x, -pl, hi)).concat([-pl, hi]))].sort((a, b) => a - b);
        const steps = [];
        for (let k = 0; k < xs.length - 1; k++) {
          if (xs[k + 1] - xs[k] < 1e-6) continue;
          const mid = (xs[k] + xs[k + 1]) / 2;
          let h = 0;
          spans.forEach(([a, b], i) => { if (mid >= a && mid <= b) h = Math.max(h, reach[i]); });
          if (steps.length && Math.abs(steps[steps.length - 1][2] - h) < 1e-6) steps[steps.length - 1][1] = xs[k + 1];
          else steps.push([xs[k], xs[k + 1], h]);
        }
        const pts = ['0em 100%'];
        steps.forEach(([a, b, h], k) => {
          pts.push(`${k ? em(a + pl) : '0em'} ${em(T - h)}`, `${k === steps.length - 1 ? '100%' : em(b + pl)} ${em(T - h)}`);
        });
        pts.push('100% 100%');
        s.setProperty('--ws-sky', `polygon(${pts.join(', ')})`);
      } else s.removeProperty('--ws-sky');
    };

    // Fit: the word's ink fills `fill` of the stage width, gutter to gutter, its cap height stays under
    // `maxHeight` of the stage height, and the word, the landing zone and both text rows fit the stage.
    // Free height is shared above the word and above the bottom row.
    const fit = () => {
      const p = S.plan, s = root.style;
      const live = root.classList.contains('is-live');
      const stageW = stage.clientWidth;
      const stageH = live ? stage.clientHeight : Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);
      const cs = getComputedStyle(stage), rs = getComputedStyle(root);
      const padT = parseFloat(cs.paddingTop) || 0, padB = parseFloat(cs.paddingBottom) || 0;
      // clearances come from the stylesheet (they tighten on short stages); a short stage lands the
      // smaller button
      const topGap = parseFloat(rs.getPropertyValue('--ws-top-gap')) || 48;
      S.gap = parseFloat(rs.getPropertyValue('--ws-gap-min')) || 40;
      S.btn = S.phone || stageH < 600 ? o.phoneSize : o.size;
      s.setProperty('--ws-btn-w', S.btn[0] + 'px');
      s.setProperty('--ws-btn-h', S.btn[1] + 'px');
      const innerW = stage.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      s.setProperty('--ws-size', '100px');
      if (!trimmed) {
        const h = ink('H', S.front);
        s.setProperty('--ws-lh', ((2 * h.a - h.fa + h.fd) / 100).toFixed(4));
        s.setProperty('--ws-cap-h', (h.a / 100).toFixed(4) + 'em');
      }
      const keep = [stack.style.transform, S.front.style.transform];
      stack.style.transform = 'none'; S.front.style.transform = 'none';
      const m = shape();
      stack.style.transform = keep[0]; S.front.style.transform = keep[1];
      S.m = m;
      // the falling letter's height in cap heights (a tall l rises above the capitals)
      S.kl = slotAt >= 0 && m.cols[slotAt] && m.cols[slotAt].rise > 0 ? 1 + m.cols[slotAt].rise / m.cap : 1;
      const rise = m.rise / m.cap;
      // an added full stop hangs: the word's own letters are centred (so the word sits centred at rest,
      // once the stop has gone) and the stop reaches into the margin, so the fit counts it on both sides
      let size = Math.min(o.fill * stageW, innerW) / ((m.R - m.L) + 2 * (m.RAll - m.R));
      size = Math.min(size, (o.maxHeight * stageH) / m.cap);
      const topH = top ? top.offsetHeight : 0, metaH = meta ? meta.offsetHeight : 0;
      const avail = stageH - padT - padB - topH - metaH;
      // height the word needs: clearance under the top row (from its tallest letter), the word, its sink,
      // the landing zone
      const need = (h) => Math.max(topGap, 0.13 * h) + h * (1 + rise + (p.n - 1) * p.shift / 100) + (drop ? land(h) + S.btn[1] / 2 : 0);
      let lo = 0, hi = size * m.cap;
      if (need(hi) > avail) { for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (need(mid) > avail) hi = mid; else lo = mid; } hi = lo; }
      size = Math.max(16, hi / m.cap);
      const h0 = size * m.cap;
      s.setProperty('--ws-size', size.toFixed(2) + 'px');
      s.setProperty('--ws-h0', h0.toFixed(2) + 'px');
      s.setProperty('--ws-lift', Math.max(0, (avail - need(h0)) * 0.5).toFixed(1) + 'px');
      // the landing as a share of the word height, for the finished composition's button
      s.setProperty('--ws-land', (land(h0) / h0).toFixed(4));
      place(m, p);
      return { h0, stageH, half: ((m.R - m.L) / 2) * size };
    };
    // the button's centre below the front copy's baseline: a share of the word height, but never so
    // close that a short word sits on the button, and (with the drop) low enough that the falling
    // letter, still upright, has wholly left the word before it turns over
    const land = (h) => {
      const sF = S.plan ? 1 - (S.plan.n - 1) * S.plan.step : 1;
      return Math.max(S.land * h, S.btn[1] / 2 + S.gap, dropOn ? 0.5 * sF * (S.kl || 1) * h + 12 : 0);
    };

    // The bar's whole path from the handoff to the landing, as one function of the progress p, so the
    // timeline and the clearance test below move exactly the same bar. x, y: centre in stage px; r:
    // degrees; sx, sy: scale of the landed button's local box (thickness, length).
    // It turns about a hinge on its own axis, lam of the way from its centre to its top end (0 = the
    // centre): it loosens (tilts by `tilt` and sags), the hinge drops with gravity (`fall`), drifts to
    // the landing point late and may first ease `nudge` px away from the closer neighbour; the bar
    // swings about it from t0, flat at 0.80. A high hinge keeps the part of the bar still inside the word
    // in the slot's own column while its foot swings out below the baseline; a late t0 lets it drop clear
    // of the word before it turns.
    // falls of the hinge, [start, duration, power]: g gravity over the whole fall, q a softer one, d a
    // short drop that has the letter out of the word early, so it can turn over once it is clear
    const FALLS = { g: [0.57, 0.23, 2], q: [0.55, 0.25, 1.6], d: [0.55, 0.12, 2] };
    const bar = (p, g, v = g.v) => {
      const seg = (a, d) => clamp((p - a) / d, 0, 1);
      const { dir, lam } = v;
      const tilt = v.tilt == null ? 8 : v.tilt, t0 = v.t0 || 0.6, nudge = v.nudge || 0;
      const [fa, fd, fe] = FALLS[v.fall] || FALLS.g;
      // the size of the letter while it crosses the word, then thickness (power2.in) and length (power3.in)
      let sx = g.kx + (1 - g.kx) * seg(0.66, 0.14) ** 3;
      let sy = g.ky + (1 - g.ky) * seg(0.69, 0.11) ** 4;
      const a = (lam * S.btn[0] * Math.min(1, sy)) / 2;                       // hinge to centre, now
      const aEnd = (lam * S.btn[0]) / 2;
      const hy0 = g.sy - (lam * g.h0) / 2, hxE = g.tx + aEnd * dir;          // hinge at the handoff, landed
      const sag = sine(seg(0.52, 0.05)) * 0.03 * g.H0;                       // loosen: it sags
      const hy = hy0 + sag + (g.ty - hy0 - 0.03 * g.H0) * seg(fa, fd) ** fe;  // then drops
      const side = nudge ? nudge * sine(seg(0.56, 0.12)) : 0;                 // eases off the neighbour
      const td = Math.max(0.62, t0);
      const hx = g.sx + side + (hxE - g.sx - side) * seg(td, 0.8 - td) ** 3;  // drifts late (power2.in)
      const turn = seg(t0, 0.8 - t0) ** (t0 < 0.65 ? 3 : 2);
      const r = dir * (tilt * sine(seg(0.52, 0.08)) + (90 - tilt) * turn);   // turns late
      const th = (r * Math.PI) / 180;
      const x = hx - a * Math.sin(th), y = hy + a * Math.cos(th);
      if (p > 0.8) {
        // landing squash: thinner and longer (power1.out), then back with a small overshoot (back.out(2))
        const a = 1 - (1 - seg(0.8, 0.03)) ** 2, b = backOut2(seg(0.83, 0.05));
        const q = p < 0.83 ? a : 1 - b;
        sx *= 1 - 0.16 * q; sy *= 1 + 0.05 * q;
      }
      return { x, y, r, sx, sy };
    };
    // the word's recoil as the letter lets go (stack y), the same curve as the timeline's two tweens
    const recoilAt = (p, g) => {
      const R = (S.phone ? 0.03 : 0.02) * g.H0;
      if (p <= 0.6 || p >= 0.68) return 0;
      if (p < 0.63) { const t = (p - 0.6) / 0.03; return -R * (1 - (1 - t) * (1 - t)); }
      return -R * (1 - EASE['power1.inOut']((p - 0.63) / 0.05));
    };

    // How the bar falls. The other letters of the front copy are drawn at 1:1 in their final echo state
    // and turned into a distance field (px from the nearest ink). Each candidate path (which way it tips,
    // where its hinge sits, how far it loosens, when it turns, how it drops, whether it first eases off
    // the closer neighbour) is moved over it in 0.005 steps from the handoff to the landing, the word's
    // recoil included, and its rows are tested against that field. Bar and letters are one ink, so a bar
    // that only touches a stem fuses with it: a path is clean only if at least `hard` px of ground (4,
    // or a little less than the gap the letter has at rest) stay between the bar and every letter all the
    // way down. Of the clean paths the bar takes the most natural one (the full 8 degree loosening, the
    // earliest turn, tipping toward the stage centre, no side step) that also keeps the wider `soft` gap;
    // with none, the first clean one; with no clean path at all, the one that touches least of those
    // that fall straight down before they turn.
    // Also finds when the bar has cleared the word and is long and thick enough to carry its label.
    let simA = null;
    const field = (g, f, size) => {
      const W = Math.max(1, Math.ceil(g.stageW));
      const top = Math.floor(g.base - g.s * (g.H0 + S.m.rise * size) - 16);
      const Hb = Math.max(1, Math.ceil(g.base + g.s * 0.35 * size + 16) - top);
      simA = simA || document.createElement('canvas');
      simA.width = W; simA.height = Hb;
      const a = simA.getContext('2d', { willReadFrequently: true });
      const { font, stretch } = fontOf(S.front);
      a.font = font; if ('fontStretch' in a) a.fontStretch = stretch;
      a.fillStyle = '#000'; a.textBaseline = 'alphabetic'; a.textAlign = 'left';
      chars.forEach((ch, i) => {
        if (i === slotAt || !ch.trim()) return;
        const c = S.m.cols[i], mw = a.measureText(ch).width;
        // a canvas without font-stretch draws another width of the face: scale to the page's advance
        const kx = c.adv > 0 && mw > 0 && Math.abs((c.adv * size) / mw - 1) > 0.015 ? (c.adv * size) / mw : 1;
        const x = f.x + c.x * size;
        a.setTransform(g.s * kx, 0, 0, g.s, g.ox + (x - g.ox) * g.s, g.base - top);
        a.fillText(ch, 0, 0);
      });
      a.setTransform(1, 0, 0, 1, 0, 0);
      const px = a.getImageData(0, 0, W, Hb).data, N = W * Hb;
      const dist = new Float32Array(N);
      let low = -1;
      for (let i = 0; i < N; i++) { if (px[i * 4 + 3] >= 128) { dist[i] = 0; low = Math.floor(i / W); } else dist[i] = 1e6; }
      const D = Math.SQRT2;
      for (let y = 0; y < Hb; y++) for (let x = 0, i = y * W; x < W; x++, i++) {
        let v = dist[i];
        if (x && dist[i - 1] + 1 < v) v = dist[i - 1] + 1;
        if (y) { if (dist[i - W] + 1 < v) v = dist[i - W] + 1; if (x && dist[i - W - 1] + D < v) v = dist[i - W - 1] + D; if (x < W - 1 && dist[i - W + 1] + D < v) v = dist[i - W + 1] + D; }
        dist[i] = v;
      }
      for (let y = Hb - 1; y >= 0; y--) for (let x = W - 1, i = y * W + x; x >= 0; x--, i--) {
        let v = dist[i];
        if (x < W - 1 && dist[i + 1] + 1 < v) v = dist[i + 1] + 1;
        if (y < Hb - 1) { if (dist[i + W] + 1 < v) v = dist[i + W] + 1; if (x < W - 1 && dist[i + W + 1] + D < v) v = dist[i + W + 1] + D; if (x && dist[i + W - 1] + D < v) v = dist[i + W - 1] + D; }
        dist[i] = v;
      }
      return { W, Hb, top, dist, low: low < 0 ? g.base : top + low + 1 };
    };
    // the pixel rows a pose covers, each as [row, first px, last px] (pixel centres inside the bar)
    // (only rows from ya to yb, when given)
    const rows = (s, fn, ya = -1e9, yb = 1e9) => {
      const [bw, bh] = S.btn;
      const th = (s.r * Math.PI) / 180, c = Math.cos(th), n = Math.sin(th);
      const hw = (bh * s.sx) / 2, hh = (bw * s.sy) / 2, ext = hw * Math.abs(n) + hh * Math.abs(c);
      const ac = Math.abs(c) > 1e-9, an = Math.abs(n) > 1e-9;
      for (let y = Math.max(ya, Math.floor(s.y - ext)), y1 = Math.min(yb, Math.ceil(s.y + ext)); y <= y1; y++) {
        const dy = y + 0.5 - s.y;
        // { dx : |dx * c + dy * n| <= hw } and { dx : |dy * c - dx * n| <= hh }
        let lo = -1e9, hi = 1e9;
        const q = dy * n, r = dy * c;
        if (ac) { const u = (-hw - q) / c, w = (hw - q) / c; lo = Math.min(u, w); hi = Math.max(u, w); } else if (Math.abs(q) > hw) continue;
        if (an) { const u = (r - hh) / n, w = (r + hh) / n; lo = Math.max(lo, Math.min(u, w)); hi = Math.min(hi, Math.max(u, w)); } else if (Math.abs(r) > hh) continue;
        if (hi < lo) continue;
        const xa = Math.ceil(s.x + lo - 0.5), xb = Math.floor(s.x + hi - 0.5);
        if (xb >= xa) fn(y, xa, xb);
      }
    };
    const P0 = 0.52, P1 = 0.82, DP = 0.005;
    const path = (g, f, size) => {
      const F = field(g, f, size), { W, Hb, top, dist } = F;
      // the least gap of a pose to the letters, in px of ground between them
      const gapAt = (s, ry) => {
        let m = 1e6;
        rows(s, (y, xa, xb) => {
          const r = y - ry - top;
          if (r < 0 || r >= Hb) return;
          for (let x = Math.max(0, xa), e = Math.min(W - 1, xb), i = r * W + x; x <= e; x++, i++) if (dist[i] < m) m = dist[i];
        });
        return m - 1;
      };
      const v0 = { dir: g.dir, lam: 0, tilt: 0, t0: 0.6 };
      const rest = gapAt(bar(P0, g, v0), 0);
      const hard = clamp(rest - 1, 1, 4), soft = clamp(rest - 0.5, hard, 8);
      // pixels nearer than `hard` and `soft`, summed along each row
      const sums = (lim) => {
        const P = new Int32Array((W + 1) * Hb);
        for (let r = 0; r < Hb; r++) { let acc = 0; const o = r * (W + 1), d = r * W; for (let x = 0; x < W; x++) { if (dist[d + x] < lim + 1) acc++; P[o + x + 1] = acc; } }
        return P;
      };
      const PH = sums(hard), PS = sums(soft);
      const hits = (P, s, ry) => {
        let h = 0;
        rows(s, (y, xa, xb) => {
          const o = (y - ry - top) * (W + 1);
          const a = xa < 0 ? 0 : xa > W ? W : xa, b = xb + 1 < 0 ? 0 : xb + 1 > W ? W : xb + 1;
          if (b > a) h += P[o + b] - P[o + a];
        }, top + ry, top + ry + Hb - 1);
        return h;
      };
      // the poses, coarse ones first, so a path that touches is usually found out in a few
      const poses = [];
      for (let p = P0; p <= P1 + 1e-9; p += DP) poses.push([p, Math.round(recoilAt(p, g))]);
      poses.sort((a, b) => [0, 3, 2, 3][Math.round((a[0] - P0) / DP) % 4] - [0, 3, 2, 3][Math.round((b[0] - P0) / DP) % 4]);
      // pixels of the bar outside the letter's own column in rows above the word's baseline (there the
      // bar would lie on its neighbours' place in the word, ink or not), and any reaching down to the
      // bottom row of text
      const cl = Math.ceil(g.colL - 0.5) - 1, cr = Math.floor(g.colR - 0.5) + 1;
      const beside = (s, ry) => {
        let n = 0;
        const yb = g.base + ry;
        rows(s, (y, xa, xb) => {
          if (y + 0.5 >= g.metaY - 8) { n += xb - xa + 1; return; }
          if (y + 0.5 >= yb) return;
          if (xa <= cl) n += Math.min(xb, cl) - xa + 1;
          if (xb >= cr) n += xb - Math.max(xa, cr) + 1;
        });
        return n;
      };
      // a pose that rules a path out goes to the front: the next, similar path is tested there first
      const run = (v, quit) => {
        let over = 0, near = 0;
        for (let i = 0; i < poses.length; i++) {
          const [p, ry] = poses[i];
          const s = bar(p, g, v), h = hits(PH, s, ry) + beside(s, ry);
          if (h) {
            over += h;
            if (quit) { if (i) poses.unshift(poses.splice(i, 1)[0]); return null; }
          }
          if ((!quit || !near) && hits(PS, s, ry)) near++;
        }
        return { v, over, near };
      };
      const [bw] = S.btn;
      const step = clamp(rest - hard, 2, 12);
      const cands = [];
      [8, 5, 2.5, 0].forEach((tilt, ti) => [0.6, 0.63, 0.66, 0.69, 0.72, 0.75].forEach((t0, k) => ['g', 'q', 'd'].forEach((fall) =>
        [0.9, 0.45, 0, -0.45, -0.9].forEach((lam, li) => [g.dir, -g.dir].forEach((dir) => [0, step, -step].forEach((nudge) => {
          const slide = Math.abs(g.tx + (lam * bw * dir) / 2 - g.sx);
          cands.push({ v: { dir, lam, tilt, t0, fall, nudge }, cost: ti + 0.9 * k + (fall === 'q' ? 0.7 : fall === 'd' ? 0.3 : 0) + (nudge ? 1.4 : 0) + (dir !== g.dir ? 0.4 : 0) + [0, 0.1, 0.2, 0.5, 0.6][li] + slide / 200 });
        }))))));
      cands.sort((a, b) => a.cost - b.cost);
      let pick = null, first = null;
      for (const c of cands) {
        const r = run(c.v, true);
        if (!r) continue;
        if (!first) first = r;
        if (!r.near) { pick = r; break; }
      }
      pick = pick || first;
      if (!pick) {
        // nothing clears the letters: of the paths that drop straight before they turn, the one that
        // touches least
        let best = null;
        for (const c of cands) if (!c.v.tilt && !c.v.nudge) { const r = run(c.v, false); if (!best || r.over < best.over) best = r; }
        pick = best;
      }
      const v = pick.v;
      let gap = 1e6;
      for (const [p, ry] of poses) gap = Math.min(gap, gapAt(bar(p, g, v), ry));
      // the label is written once the bar is below the word's ink and can hold it whole
      let at = 0.82;
      const lw = label ? label.offsetWidth : 0, lf = label ? parseFloat(getComputedStyle(label).fontSize) || 16 : 16;
      for (let p = 0.72; p <= 0.82; p += 0.0025) {
        const s = bar(p, g, v), [bw2, bh2] = S.btn;
        let y0 = 1e6;
        rows(s, (y) => { if (y < y0) y0 = y; });
        if (y0 >= F.low + 2 && bh2 * s.sx >= 1.3 * lf && bw2 * s.sy >= lw + 16) { at = p; break; }
      }
      return { v, dir: v.dir, gap: +gap.toFixed(1), rest: +rest.toFixed(1), hard, soft, clean: !pick.over, near: pick.near, write: [at, Math.min(0.86, Math.max(at + 0.05, 0.8))] };
    };
    // Where each character of the label ends, in px of its own box, so the label is written whole
    // characters at a time (a glyph cut in half reads as debris on a moving bar).
    const letters = () => {
      if (!label) return null;
      const text = label.textContent, cps = [...text];
      const cs = getComputedStyle(label);
      pen.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ('fontStretch' in pen) pen.fontStretch = STRETCH[parseFloat(cs.fontStretch)] || 'normal';
      const ls = parseFloat(cs.letterSpacing) || 0, lw = label.offsetWidth;
      const full = pen.measureText(text).width + ls * cps.length;
      const k = full > 0 && lw > 0 ? lw / full : 1;
      const cut = [lw + 8];
      for (let i = 1; i < cps.length; i++) {
        const pre = cps.slice(0, i).join(''), m = pen.measureText(pre), nx = pen.measureText(cps[i]);
        const adv = m.width + ls * i;
        // between the ink of the last character shown and the ink of the next one
        const a = Math.max(m.actualBoundingBoxRight, 0), b = adv - nx.actualBoundingBoxLeft;
        cut.push(Math.max(-4, lw - ((a < b ? (a + b) / 2 : adv) * k)));
      }
      cut.push(-4);
      return { n: cps.length, cut, text };
    };

    // Geometry for the handoff, the echo's steps and the landing, measured with the stack and the front
    // copy at rest.
    const measure = () => {
      const p = S.plan;
      const base = stage.getBoundingClientRect();
      const keep = [stack.style.transform, S.front.style.transform];
      stack.style.transform = 'none'; S.front.style.transform = 'none';
      const f = rel(S.front, base);
      const sl = S.slot ? rel(S.slot, base) : null;
      stack.style.transform = keep[0]; S.front.style.transform = keep[1];
      const stageW = base.width;
      const size = parseFloat(getComputedStyle(S.front).fontSize) || 100;
      // the echo's origin: the ink's centre on the baseline
      const H = f.h, ox = f.x + f.w / 2 + ((S.m.L + S.m.R) / 2 - S.m.w / 2) * size, oy = f.y + f.h;
      const s = 1 - (p.n - 1) * p.step, sh = ((p.n - 1) * p.shift) / 100;
      const g = { stageW, stageH: base.height, H0: H, ox, oy, s, base: oy + sh * H, dir: 1, sx: ox, sy: oy, w0: 1, h0: 1, kx: 1, ky: 1, tx: ox, ty: oy };
      // when each copy behind the front one steps out (echo time), and the plate line its band hides under
      // until then (in the copy's own height: the cap letters' plate top)
      const half = ((S.m.R - S.m.L) / 2) * size;
      Object.assign(g, p.n > 1 ? schedule(p, H, half, ECHO) : { show: [], full: [] });
      g.pt = p.py / 100 + S.m.riseMin / S.m.cap;
      if (sl) {
        const m = ink(S.slot.textContent, S.front);
        const adv = sl.w - (parseFloat(getComputedStyle(S.front).letterSpacing) || 0);
        const k = m.w > 0 && Math.abs(adv / m.w - 1) > 0.015 ? adv / m.w : 1;
        const l = sl.x + m.l * k, r = sl.x + m.r * k, t = oy - m.a, b = oy + m.d;
        const cx = (l + r) / 2, cy = (t + b) / 2;
        const [bw, bh] = S.btn;
        const gut = parseFloat(getComputedStyle(stage).paddingLeft) || 16;
        g.sx = ox + (cx - ox) * s;
        g.sy = oy + (cy - oy) * s + sh * H;
        g.w0 = (r - l) * s;
        g.h0 = (b - t) * s;
        // the letter's own column in the word (its advance box, or its ink where that reaches further):
        // while any of the bar is still beside the letters, above the baseline, it stays inside it
        g.colL = ox + (Math.min(sl.x, l) - ox) * s - 0.5;
        g.colR = ox + (Math.max(sl.x + sl.w, r) - ox) * s + 0.5;
        g.kx = g.w0 / bh; g.ky = g.h0 / bw;
        // landing centre: under the word's centre; on desktop, straight under its slot when the letter
        // came from near one end of the word (anything between reads as a near miss). On whole pixels.
        // (an added full stop always lands under the centre: it is the word's end, not one of its letters)
        const off = Math.abs(ox - g.sx);
        const tx = S.phone || added || off <= 0.2 * stageW ? ox : g.sx;
        g.tx = Math.round(clamp(tx, gut + bw / 2, stageW - gut - bw / 2));
        // the bottom row's words: the falling bar keeps clear of them
        g.metaY = meta ? Math.min(...[...meta.children, meta].map((e) => rel(e, base).y + (e === meta ? parseFloat(getComputedStyle(meta).paddingTop) || 0 : 0))) : base.height;
        const floor = meta ? rel(meta, base).y - bh / 2 : base.height - bh;
        g.ty = Math.round(Math.min(g.base + land(H), floor));
        g.dir = g.sx <= ox ? 1 : -1;
        g.v = { dir: g.dir, lam: 0, tilt: 8, t0: 0.6 };
        g.write = [0.74, 0.82];
        if (S.live) {
          // the same geometry gives the same path: a refresh that changed nothing reuses it
          const pk = [g.stageW, g.stageH, size, g.sx, g.sy, g.tx, g.ty, g.base, g.s, S.btn, f.x, label ? label.offsetWidth : 0].join('|');
          if (S.pk !== pk) {
            if (S.defer && S.pv) {
              // while the window is being resized the bar keeps the path it had (moved to the new
              // geometry) and the path is chosen afresh once the size has settled
              clearTimeout(S.later);
              S.later = setTimeout(() => { if (S.live) { S.key = ''; G(); sync(); } }, 180);
            } else { const t = performance.now(); S.pv = path(g, f, size); S.pv.ms = Math.round(performance.now() - t); S.pk = pk; }
          }
          Object.assign(g, S.pv);
          g.label = letters();
        }
      }
      root.style.setProperty('--dir', g.dir);
      return g;
    };

    // Fit, plan and geometry, redone whenever the stage size or the fonts change. The plan is chosen
    // again each time: the echo the fitted height can carry (a late web font can change it).
    const key = () => `${stage.clientWidth}x${stage.clientHeight}x${window.innerHeight}|${document.fonts ? document.fonts.status : ''}|${S.fonts || 0}`;
    const G = () => {
      const k = key();
      if (k !== S.key || !S.geo) {
        S.key = k;
        const r = fit();
        const q = choose(o, S.phone, r.h0, r.stageH, r.half, S.m, ECHO, ECHO.due);
        const P = S.plan;
        if (['n', 'step', 'shift', 'py', 'xr', 'strips', 'wl', 'wr'].some((k) => q[k] !== P[k])) { applyPlan(q); fit(); }
        S.geo = measure();
      }
      return S.geo;
    };

    // The label's writing (S.wr.v, 0-1, run on a clock by sync()): whole characters at a time, or faded.
    S.wr = { v: 0, on: false };
    const writeLabel = () => {
      const g = S.geo;
      if (!label || !g || !S.live) return;
      const fr = S.wr.v;
      if (o.reveal === 'fade') {
        const op = fr.toFixed(3);
        if (label.style.opacity !== op) label.style.opacity = op;
      } else if (g.label) {
        const k = Math.round(fr * g.label.n);
        const cp = k >= g.label.n ? 'none' : `inset(-4px ${g.label.cut[k].toFixed(1)}px -4px -4px)`;
        if (label.style.clipPath !== cp) label.style.clipPath = cp;
      }
    };

    // Every frame of the live scene: which copies of the echo show (and how much of each), the bar, and
    // the label on it. All of it but the label's writing follows from the timeline's time, so scrolling
    // back undoes it exactly.
    const sync = () => {
      if (!S.tl || !S.live) return;
      // the geometry is kept current by refreshes and resizes; reading it here forces no layout
      const g = S.geo || G(), P = S.plan, t = S.tl.time();
      if (P.n > 1) {
        const u = clamp((t - ECHO_AT) / ECHO.dur, 0, 1), e = EASE[ECHO.ease](u);
        const off = S.list.length - P.n;
        for (let j = 0; j < P.n - 1; j++) {
          const el = S.list[off + j];
          const st = u >= g.full[j] ? 2 : u >= g.show[j] ? 1 : 0;
          let clip = '';
          if (st === 1) {
            // its side strips only: cut it at the next copy's plate top, 1.5px low, so no sliver of the
            // band (still thinner than MIN) shows above that plate
            const sj = 1 - e * j * P.step, sn = 1 - e * (j + 1) * P.step;
            const T = 1 - ((1 + g.pt) * sn - (e * P.shift) / 100) / sj + 1.5 / (g.H0 * sj);
            clip = `inset(${(T * 100).toFixed(3)}% -60% -60% -60%)`;
          }
          const was = S.state[j] || { st: -1, clip: null };
          if (was.st !== st) el.style.visibility = st ? '' : 'hidden';
          if (was.clip !== clip) el.style.clipPath = clip;
          S.state[j] = { st, clip };
        }
      }
      if (dropOn) {
        // the drop's own time (the flat plan spreads it over 50-94% of the hold)
        const td = 0.52 + (t - (S.A ?? 0.52)) * (S.K || 1);
        const b = bar(Math.max(0.52, td), g);
        const tr = `translate(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px) translate(-50%, -50%) rotate(${b.r.toFixed(3)}deg) scale(${b.sx.toFixed(4)}, ${b.sy.toFixed(4)})`;
        if (drop.style.transform !== tr) drop.style.transform = tr;
        // the label keeps its own size and stays upright to the bar: scaled by the bar's inverse (its
        // axes are the bar's, turned a quarter) and clipped to the bar
        if (label) {
          const lt = `translate(-50%, -50%) rotate(${-90 * g.dir}deg) scale(${(1 / b.sy).toFixed(4)}, ${(1 / b.sx).toFixed(4)})`;
          if (label.style.transform !== lt) label.style.transform = lt;
          // written once the bar has cleared the word and is all but flat, on a clock (0.4s), not on the
          // scroll: wherever a scroll comes to rest the label is either not there or whole, never half
          // written. Scrolling back takes it off the same way.
          const on = td >= Math.max(g.write[0], 0.78);
          if (on !== S.wr.on) {
            S.wr.on = on;
            if (window.gsap) gsap.to(S.wr, { v: on ? 1 : 0, duration: on ? 0.4 : 0.2, ease: 'none', overwrite: true, onUpdate: writeLabel });
            else S.wr.v = on ? 1 : 0;
          }
          writeLabel();
        }
        // corners round only once the letter has become the bar, kept round on screen while it scales
        if (o.radius) {
          const q = o.radius * clamp((td - 0.66) / 0.1, 0, 1);
          const br = q ? `${(q / b.sx).toFixed(2)}px / ${(q / b.sy).toFixed(2)}px` : '';
          if (drop.style.borderRadius !== br) drop.style.borderRadius = br;
        }
      }
    };

    const clear = () => {
      S.list.forEach((el) => { el.style.visibility = ''; el.style.clipPath = ''; });
      S.state = [];
      if (window.gsap) gsap.killTweensOf(S.wr);
      S.wr.v = 0; S.wr.on = false;
      if (drop) { drop.style.transform = ''; drop.style.borderRadius = ''; }
      if (label) { label.style.transform = ''; label.style.clipPath = ''; label.style.opacity = ''; }
    };

    const prepare = (phone) => {
      S.phone = phone;
      S.btn = phone ? o.phoneSize : o.size;
      S.land = phone ? 0.8 : 0.3;
      root.style.setProperty('--ws-land', S.land);
      root.style.setProperty('--ws-stretch', phone ? o.phoneStretch : o.stretch);
      if (o.radius) root.style.setProperty('--ws-radius', o.radius + 'px');
      // the accent belongs to the landed button; while it is still the letter it is ink
      if (o.accent && (!S.live || !dropOn)) root.style.setProperty('--ws-btn', o.accent);
      else root.style.removeProperty('--ws-btn');
      const first = plans(o, phone)[0];
      copies(first.n);
      clear();
      applyPlan(first);
      S.key = ''; S.geo = null;
      return G();
    };

    const build = (tl, c) => {
      S.live = true;
      S.tl = null;
      prepare(c.phone);
      const list = S.list;
      const flat = S.plan.n < 2;
      const sq = c.phone && !flat ? o.squash * 0.7 : o.squash;
      // Without the echo the drop's own map (its handoff at 0.52, flat at 0.80, landed at 0.88) is spread
      // over 50-94% of the hold, so every step of it shows the bar somewhere new, the landing is still
      // moving at 90% and the held end is the last 6%. at() gives the hold's place of a drop time.
      S.A = flat ? 0.5 : 0.52; S.K = flat ? 0.36 / 0.44 : 1;
      const at = (x) => S.A + (x - 0.52) / S.K, dur = (d) => d / S.K;
      // T2-T3 load and spring, about the baseline. Without the echo (the default) the load takes the first
      // half of the hold, a crush under the scroll that gives fast and then resists (4-32%) and the spring
      // back past the word's height (32-50%), so no stretch of the hold stands still before the stop lets go.
      if (sq > 0) {
        if (flat) {
          tl.fromTo(stack, { scaleX: 1, scaleY: 1 }, { scaleY: 1 - sq, scaleX: 1 + sq * 0.12, duration: 0.28, ease: 'power1.out' }, 0.04)
            .to(stack, { scaleY: 1, scaleX: 1, duration: 0.18, ease: `back.out(${o.spring})` }, 0.32);
        } else {
          tl.fromTo(stack, { scaleX: 1, scaleY: 1 }, { scaleY: 1 - sq, scaleX: 1 + sq * 0.12, duration: 0.11, ease: 'power1.in' }, 0.05)
            .to(stack, { scaleY: 1, scaleX: 1, duration: 0.12, ease: `back.out(${o.spring})` }, 0.16);
        }
      }
      // T4 the echo: copy i sinks and shrinks, the back copy never moves (values follow the current plan).
      // Which copies show, and how much of each, is decided frame by frame in sync().
      list.forEach((el, i) => {
        if (i) tl.fromTo(el, { scale: 1, yPercent: 0 }, { scale: () => (G(), 1 - idx(i) * S.plan.step), yPercent: () => (G(), idx(i) * S.plan.shift), duration: ECHO.dur, ease: ECHO.ease }, ECHO_AT);
      });
      if (dropOn) {
        const recoil = c.phone ? 0.03 : 0.02;
        gsap.set(drop, { opacity: 0, pointerEvents: 'none' });
        // T5 the bar takes the slot glyph's exact place (its path, T6-T13, is bar() above, set in sync(),
        // and so are the label's writing (T12) and the rounding of the corners (T11))
        tl.set(drop, { opacity: 1 }, at(0.52))
          .set(S.slot, { visibility: 'hidden' }, at(0.52))
          // T7 the word recoils as the letter lets go
          .fromTo(stack, { y: 0 }, { y: () => -recoil * G().H0, duration: dur(0.03), ease: 'power1.out', immediateRender: false }, at(0.6))
          .to(stack, { y: 0, duration: dur(0.05), ease: 'power1.inOut' }, at(0.63))
          // the timeline spans the whole fall and landing
          .to({}, { duration: dur(0.36) }, at(0.52));
        // T14 then it is a button
        tl.set(drop, { pointerEvents: 'auto' }, at(0.84));
        if (o.accent) tl.to(drop, { backgroundColor: o.accent, duration: dur(0.04) }, at(0.8));
      }
      tl.eventCallback('onUpdate', sync);
      S.tl = tl;
      sync();
    };

    // Finished composition: the stepped word, the button where the live scene lands it.
    const rest = (c) => {
      S.live = false; S.tl = null;
      prepare(!!(c && c.phone));
      if (!drop) return;
      const g = G();
      const stageW = g.stageW;
      const gut = parseFloat(getComputedStyle(stage).paddingLeft) || 16;
      const cx = dropOn ? g.tx : clamp(g.ox, gut + S.btn[0] / 2, stageW - gut - S.btn[0] / 2);
      root.style.setProperty('--ws-cta-x', (cx - stageW / 2).toFixed(1) + 'px');
    };

    // Keyboard: the link can take focus at any progress; bring the landed button to it.
    if (drop) {
      drop.addEventListener('focus', () => {
        const st = S.live && S.tl && S.tl.scrollTrigger;
        if (!st || st.progress >= (S.A ?? 0.52) + 0.34 / (S.K || 1) || !root.classList.contains('is-live')) return;
        if (window.Stage && Stage.lenis) Stage.lenis.scrollTo(st.end, { immediate: true, force: true });
        else window.scrollTo(0, st.end);
      });
    }

    // Fonts that arrive late and resizes refit the word at once; a live scene also re-measures its timeline.
    let wait = 0, last = '';
    const refit = (force, resizing) => {
      const k = key();
      if (!force && k === last) return;
      last = k;
      if (root.classList.contains('is-rest') || !(window.Stage && Stage.live)) rest({ phone: window.matchMedia('(max-width: 767px)').matches });
      else if (S.live) { S.key = ''; S.defer = !!resizing; G(); S.defer = false; sync(); }
    };
    if (document.fonts) {
      document.fonts.addEventListener('loadingdone', () => {
        S.fonts = (S.fonts || 0) + 1;
        clearTimeout(wait);
        wait = setTimeout(() => { refit(true); if (S.live && window.ScrollTrigger) ScrollTrigger.refresh(); }, 80);
      });
    }
    if (window.ResizeObserver) new ResizeObserver(() => refit(false, true)).observe(stage);
    // A refresh (load, fonts, resize, a reload that lands mid-scene) moves the timeline with its events
    // suppressed, so onUpdate never runs: set the echo's copies and the bar to the new time afterwards.
    if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', () => sync());

    const scrub = o.scrub !== null ? o.scrub : (window.Stage && Stage.lenis ? true : 0.8);
    // for test pages: the live geometry (the fall's path and its least gap to the letters, the label's
    // timing, the echo's schedule)
    root.wsGeometry = () => S.geo;
    if (!window.Stage) return null;
    const mm = Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build },
      rest,
    });
    // Stage work-around: gsap.matchMedia only calls back when one of its conditions matches, and reduced
    // motion on a desktop matches neither (motion, phone), so the stage never shows the rest composition
    // there. Do it here, and again whenever the media change into that state.
    if (mm && window.matchMedia) {
      const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
      const small = window.matchMedia('(max-width: 767px)');
      const orphan = () => {
        if (motion.matches || small.matches) return;
        root.classList.remove('is-live');
        root.classList.add('is-rest');
        root.style.removeProperty('--hold');
        rest({ root, stage, phone: false });
      };
      orphan();
      motion.addEventListener('change', () => setTimeout(orphan));
      small.addEventListener('change', () => setTimeout(orphan));
    }
    return mm;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = make;
})();
