// assets/scenes/shaped-edge-ground-change/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / shaped-edge-ground-change.js — the sky's own colour rises as an arch and becomes
// the ground of the next chapter.
//
// One photograph with a wide, even sky holds the stage and zooms slowly towards a point low in the frame.
// A field painted in exactly the sky's colour climbs over it as a full-width elliptical arch, 1:1 with the
// scroll, so it reads as the sky itself coming loose. A short heading set on the arch's curve spreads
// word by word as it climbs; a statement rides in the arch below it. When the arch has passed the top of
// the screen the field is the flat ground of the next chapter: its title turns in letter by letter and a
// small picture opens under it. The next section continues on the same ground with no seam.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and shaped-edge-ground-change.css. Use it as a
// chapter divider for architecture, places, travel or property, no more than two or three times a page,
// each time on a different photograph and ground colour.
//
// DOM (the CSS file draws the finished composition from the same markup):
//   <section class="scene seg" data-scene="shaped-edge-ground-change" data-options='{}'
//            style="--ground:#cddce3; --ink:#13233a" aria-labelledby="seg-hero-title">
//     <div class="scene-stage">
//       <figure class="seg-photo">
//         <picture>                                       (optional: a 2:3 crop for phones)
//           <source media="(max-width: 767px)" srcset="portrait 2:3, 1200-1600 wide" sizes="150vw">
//           <img class="seg-photo__img" src srcset sizes="(max-width: 767px) 150vw, 125vw"
//                width height alt="what the place is">   3:2 or 16:10, 3000px+ wide, even sky in the top third
//         </picture>
//       </figure>
//       <div class="seg-hero">                              in the sky, in --ink (or on a band: hero option)
//         <h2 class="seg-hero__title" id="seg-hero-title">3-6 words, two lines</h2>   (a headline that
//                                                         would take three lines is set smaller, to 72% at most)
//         <p class="seg-hero__lede">14 words or fewer</p>
//       </div>
//       <div class="seg-ground">                            ONE element: elliptical cap + flat body
//         <div class="seg-cap">
//           <h3 class="seg-arc-label">4 words (6 at most on desktop, 34 characters)</h3>
//           <svg class="seg-arc" aria-hidden="true" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMax meet">
//             <path id="seg-arc-a" d="M101 720 A619 619 0 0 1 1339 720" fill="none"/>
//             <text class="seg-arc__static" text-anchor="middle"><textPath href="#seg-arc-a" startOffset="50%">the same words</textPath></text>
//           </svg>            (with script this SVG is hidden and the script sets the heading on the curve
//                             letter by letter in a <div class="seg-arc seg-arc-words"> beside it, moved by
//                             transform only; style the words through .seg-arc as usual)
//                     This static path is what a page with no script draws. Its id must be unique on the page:
//                     when the scene is used two or three times, give each instance its own id (seg-arc-a,
//                     seg-arc-b...) and point that instance's textPath href at it.
//           <div class="seg-crest">
//             <img class="seg-crest__mark" src alt="">      optional emblem, 40-56px
//             <p class="seg-crest__caption">a statement, 6-10 words</p>   set in the display face, two lines
//           </div>
//         </div>
//         <div class="seg-body">
//           <h3 class="seg-title">1-3 words, 16 characters</h3>   (split into letters by the script)
//           <figure class="seg-inset"><img class="seg-inset__img" src alt width height></figure>   2:1, 1200x600+
//         </div>
//       </div>
//     </div>
//   </section>
//   <section style="background: var(--ground)">…</section>   the next section, same ground, no margin
//
// Options (data-options JSON; defaults, ranges):
//   hero          "sky"            "sky": the headline is set in --ink straight on the photograph's sky, with
//                                  no scrim. Only for a photograph with open, even sky behind the headline
//                                  (no cloud texture, no ridge line, no subject reaching up into it). The
//                                  lede never trusts the sky blindly: the script reads the photograph under
//                                  the lede's own box, at every width, when the photograph can be read
//                                  (served from the page's own origin, or with crossorigin="anonymous" on
//                                  the <img> from a host that allows it). Where the palest part of that
//                                  patch still reads against --ink (4.5:1; 3:1 once the lede is 24px, as it
//                                  is on wide screens) the lede has no strip at all; where it is a shade too
//                                  pale, the lede sits on a solid strip of the nearest shade of that sky
//                                  that reads. A photograph the page may not read keeps the strip in
//                                  --seg-lede-ground (set it on the section to the sky sampled at the
//                                  lede's own spot), else --ground: the top third's median is darker or
//                                  paler than the sky lower down, so a strip of it shows as a box there.
//                                  | "band": a solid band in --ink sits behind the headline block and the
//                                  type takes --ground (7:1 by the colour contract); use it for any
//                                  photograph whose top-left is busy. A translucent fill reads under
//                                  4.5:1 over a pale sky, so the band is opaque and flat, never a
//                                  gradient. (The class seg--band on the section does the same and also
//                                  holds without script.)
//   zoom          1.5    1.2-1.8   end scale of the photograph (it starts at 1.06; linear, done at 0.88)
//   phoneZoom     1.3    1.1-1.5   (starts at 1.04)
//   fade          false            the photograph also fades into the ground while it zooms (dusk or
//                                  interior chapters): opacity 1 -> 0.7 by 0.55 -> 0 by 0.86
//   arc           "spread"         "spread": the words open from 0.28em apart to the full spread as the
//                                  arch climbs | "static": they hold a mid spread
//   spread        0.10   0.04-0.12 the widest word gap, as a share of the width (capped so the words stay
//                                  in the middle 62% of the curve and never tilt past about 56 degrees)
//   phoneSpread   0.08   0.04-0.10
//   chrome        ""               a selector for a fixed header that sits over the scene. While the
//                                  photograph is under it, the scene sets --chrome-ink on it to
//   chromeLight   "#fff"           this colour, and removes it the moment the arch's edge passes under the
//                                  header (the header uses color: var(--chrome-ink, var(--ink))). Leave it
//                                  empty when the sky under the header is pale: --ink reads there anyway.
//                                  The flip is timed at the centre of the header's first child (its logo);
//   chromeX       null   0-100     or at this many percent across the header, for a centred logo.
//                                  (With no script nothing flips, so give a fixed header a solid bar then.)
//   scrub         0.6 | true       seconds of catch-up; true (locked) is the default when Lenis is smoothing
//                                  and on touch screens
//   phone         "same"           "same" | "rest" (the phone gets the finished composition). A heading of
//                                  more than four words always rests on a phone.
//
// The hold is not an option: it is 1.25 * (1 + C/H) screens (2.25 at C = 0.8H), set in the CSS, so the
// arch travels exactly as far as the page scrolls. The arch height C is --seg-cap in the CSS.
//
// Timeline (fractions of the hold): photo zoom 0-0.88; headline out from 0.08 (on a clock of 0.45s, so it
// is never caught half faded); ground climbs 0.10-0.88 (0.08 before fix-006);
// words spread 0.10-0.56; the inset opens on a clock of 0.6s once 40% of it is on screen (about
// 0.7; 0.84 before round 11, which left the title alone on flat ground from 0.5 to 0.8); settled 0.90-1.
// The chapter title's letters land on a clock of 0.7s once half the title is on screen, at every width,
// never with the scroll, so no stop shows it half turned. While the scene runs, the words on the curve
// and the statement show only while they are whole on screen: they fade in on a clock once the climbing
// arch has carried all of them in, and out the moment one of them would be cut by the top or the foot of
// the screen, so no stop shows a word sliced by the edge. The statement waits until it is clearly inside
// the screen: its last line at least 8vh (64px or more) above the foot, so it never appears a few px
// above the foot (6px before fix-006).
//
// Colour: --ground MUST be sampled from the final photograph (median of a 5% patch in the top third),
// never chosen by eye. --ink is whichever of a deep near-black or a near-white of the same hue reads at
// 7:1 or better on it (a deep sky makes a dark chapter with pale type).
//
// The photograph decides whether the move is seen. Where the arch crosses sky of its own colour it
// vanishes, by design: it reads as the sky coming loose. So the shape is only drawn by what it covers:
// pick a photograph whose subject (a range, a skyline, terraces, a shoreline) runs edge to edge across
// the lower half or more, with the open sky above it. A small central subject (one tower, one peak) on
// a big sky leaves the arch's flanks on sky, and from a third of the way in nothing of the shape is
// left. A sky that deepens towards the top (sample it in the top third) is fine: the arch matches it
// where it ends and reads as a darker dome against the paler sky near the horizon.
//
// Screens under 560px tall get the finished composition.
(() => {
  const ID = 'shaped-edge-ground-change';
  // the ground's climb: start and duration, fractions of the hold
  const GROUND = [0.10, 0.78];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && isFinite(n) ? clamp(n, a, b) : d; };
  // depth of the arch's edge below its crown at x, for an arch W wide and C tall
  const edgeDepth = (x, W, C) => { const u = clamp((x - W / 2) / (W / 2), -1, 1); return C * (1 - Math.sqrt(1 - u * u)); };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const o = {
      hero: opts.hero === 'band' ? 'band' : 'sky',
      zoom: num(opts.zoom, 1.5, 1.2, 1.8),
      phoneZoom: num(opts.phoneZoom, 1.3, 1.1, 1.5),
      fade: opts.fade === true,
      arc: opts.arc === 'static' ? 'static' : 'spread',
      spread: num(opts.spread, 0.1, 0.04, 0.12),
      phoneSpread: num(opts.phoneSpread, 0.08, 0.04, 0.1),
      chrome: typeof opts.chrome === 'string' ? opts.chrome.trim() : '',
      chromeLight: typeof opts.chromeLight === 'string' && opts.chromeLight.trim() ? opts.chromeLight.trim() : '#fff',
      chromeX: opts.chromeX == null || opts.chromeX === '' ? null : num(opts.chromeX, null, 0, 100),
      scrub: opts.scrub === true ? true : typeof opts.scrub === 'number' ? clamp(opts.scrub, 0, 2) : null,
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const $ = (s) => root.querySelector(s);
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const photo = $('.seg-photo'), img = $('.seg-photo__img'), hero = $('.seg-hero');
    const ground = $('.seg-ground'), cap = $('.seg-cap'), label = $('.seg-arc-label'), svg = $('.seg-arc');
    const title = $('.seg-title'), inset = $('.seg-inset'), insetImg = $('.seg-inset__img');
    const chromeEl = o.chrome ? document.querySelector(o.chrome) : null;
    if (!stage || !photo || !img || !ground || !cap) {
      console.warn(`${ID}: needs .scene-stage, .seg-photo with .seg-photo__img, .seg-ground and .seg-cap`);
      return Stage.scene(root, { build: null });
    }
    if (o.hero === 'band') root.classList.add('seg--band');

    // Pictures decode before they move: the photograph is on screen from the first frame and the inset
    // opens late from a closed clip, so without this its first paint (and decode) lands mid-scrub.
    for (const im of [img, insetImg]) if (im && im.decode) im.decode().catch(() => {});

    // ---- the lede's strip takes the colour of the sky right behind it. --ground is the top third's
    // median; lower down, where the lede sits, a sky is darker or paler than that, and a strip of --ground
    // shows there as a box. The photograph is read under the lede's own box (object-fit: cover and the
    // zoom's scale taken into account), at every width, and the strip is painted the median of that patch,
    // kept only while the lede's ink still reads 4.5:1 on it. A photograph the page may not read (another
    // origin without CORS) leaves the strip at --seg-lede-ground, else --ground.
    const lede = hero ? hero.querySelector('.seg-hero__lede') : null;
    const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const rgbOf = (s) => { const m = String(s).match(/[\d.]+/g); return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null; };
    const sampleLede = () => {
      if (!lede || root.classList.contains('seg--band')) return;
      if (liveTl && liveTl.progress() > 0.04) return; // sampled at the headline's own frame only
      if (!img.complete || !img.naturalWidth) return;
      const L = lede.getBoundingClientRect(), R = img.getBoundingClientRect();
      if (L.width < 2 || L.height < 2 || R.width < 2 || R.height < 2) return;
      const nw = img.naturalWidth, nh = img.naturalHeight;
      const k = Math.max(R.width / nw, R.height / nh); // object-fit: cover
      const pos = (getComputedStyle(img).objectPosition || '50% 50%').split(/\s+/);
      const off = (v, free) => (/%$/.test(v) ? (free * parseFloat(v)) / 100 : /px$/.test(v) ? parseFloat(v) : free / 2);
      const ox = R.left + off(pos[0] || '50%', R.width - nw * k), oy = R.top + off(pos[1] || '50%', R.height - nh * k);
      const sx = (L.left - ox) / k, sy = (L.top - oy) / k, sw = L.width / k, sh = L.height / k;
      if (sx < 0 || sy < 0 || sx + sw > nw + 1 || sy + sh > nh + 1) return;
      // the whole picture drawn small, then the patch read from it: a source rectangle would be taken in
      // the file's own pixels, which differ from naturalWidth when srcset picked a denser file
      let data;
      try {
        const cw = 400, chh = Math.max(1, Math.round((400 * nh) / nw)), f = cw / nw;
        const cv = document.createElement('canvas');
        cv.width = cw; cv.height = chh;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(img, 0, 0, cw, chh);
        const x0 = clamp(Math.floor(sx * f), 0, cw - 1), y0 = clamp(Math.floor(sy * f), 0, chh - 1);
        const x1 = clamp(Math.ceil((sx + sw) * f), x0 + 1, cw), y1 = clamp(Math.ceil((sy + sh) * f), y0 + 1, chh);
        data = cx.getImageData(x0, y0, x1 - x0, y1 - y0).data; // throws on a photograph the page may not read
      } catch { return; }
      const ch = [[], [], []], ls = [];
      for (let p = 0; p < data.length; p += 4) { ch[0].push(data[p]); ch[1].push(data[p + 1]); ch[2].push(data[p + 2]); ls.push(lum(data[p], data[p + 1], data[p + 2])); }
      let [r, g, b] = ch.map((a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; });
      const cs = getComputedStyle(lede), ink = rgbOf(cs.color);
      if (!ink) return;
      const li = lum(...ink), ratioL = (l) => (Math.max(l, li) + 0.05) / (Math.min(l, li) + 0.05);
      const ratio = (c) => ratioL(lum(...c));
      const light = li > 0.18; // light ink: the palest sky is the worst; dark ink: the deepest
      // large text (24px, or 18.5px bold) needs 3:1, small text 4.5:1, as the inspector reads it
      const size = parseFloat(cs.fontSize) || 16, need = size >= 24 || (size >= 18.5 && (parseInt(cs.fontWeight, 10) || 400) >= 700) ? 3 : 4.5;
      ls.sort((x, y) => x - y);
      const worst = ls[Math.round((light ? 0.92 : 0.08) * (ls.length - 1))];
      // the sky reads under the lede everywhere it covers: no strip at all
      if (ratioL(worst) >= need + 0.15) { lede.style.setProperty('--seg-lede-sky', 'transparent'); return; }
      // a shade too pale (or too deep) for the ink: the strip takes the nearest shade of the sky that
      // reads, a step of a few levels instead of a box in the top third's colour
      let c = [r, g, b];
      const toward = light ? 0 : 255;
      for (let step = 0; step < 40 && ratio(c) < need + 0.1; step++) c = c.map((v) => Math.round(v + (toward - v) * 0.03));
      if (ratio(c) < need) { lede.style.removeProperty('--seg-lede-sky'); return; }
      [r, g, b] = c;
      lede.style.setProperty('--seg-lede-sky', `rgb(${r}, ${g}, ${b})`);
    };
    if (lede && img) {
      if (img.complete) requestAnimationFrame(sampleLede);
      else img.addEventListener('load', () => requestAnimationFrame(sampleLede), { once: true });
    }

    // The headline holds two lines. In a face wider than the condensed default a six-word headline can
    // take three, so it is set smaller, in steps, down to 72% of the CSS size (fit after fonts load and
    // whenever the arch is re-measured).
    const heroTitle = hero ? hero.querySelector('.seg-hero__title') : null;
    const fitHero = () => {
      if (!heroTitle || !heroTitle.offsetWidth) return;
      heroTitle.style.removeProperty('font-size');
      const cs = getComputedStyle(heroTitle);
      const base = parseFloat(cs.fontSize) || 16;
      const lh = (fs) => { const v = parseFloat(getComputedStyle(heroTitle).lineHeight); return isFinite(v) && v > 0 ? v : fs; };
      let fs = base;
      for (let k = 0; k < 8 && heroTitle.offsetHeight > 2.5 * lh(fs) && fs > 0.72 * base; k++) {
        fs = Math.max(0.72 * base, fs * 0.94);
        heroTitle.style.fontSize = fs.toFixed(1) + 'px';
      }
    };

    // ---- the heading on the curve. The words spread along the arch every frame from 0.10 to 0.56, so
    // they must move by transform only: each letter is its own element, placed on the curve the way
    // a textPath places a glyph (its middle on the path, its baseline on the path, turned to the
    // tangent there). Moving a letter is then a compositor job: no text layout, no repaint of the
    // ground. Letter positions inside each word are measured from the word set whole, so kerning holds.
    // The static SVG in the markup stays for a page with no script; with script it is hidden.
    const words = label ? label.textContent.trim().split(/\s+/).filter(Boolean) : [];
    const arc = { box: null, words: [], probe: null, lut: null, geo: null, L: 0, sum: 0, base: 0, gStart: 0, gEnd: 0, g: -1, ok: false, fits: true };
    if (svg && words.length) {
      arc.box = document.createElement('div');
      arc.box.className = 'seg-arc seg-arc-words';
      arc.box.setAttribute('aria-hidden', 'true');
      for (const w of words) {
        const m = document.createElement('span'); // the word set whole, measured, never seen
        m.className = 'seg-arc__measure';
        m.textContent = w;
        arc.box.appendChild(m);
        let at = 0; // offsets in the text node are UTF-16 units, letters are code points
        const chars = [...w].map((ch) => {
          const c = document.createElement('span');
          c.className = 'seg-arc__char';
          c.textContent = ch;
          arc.box.appendChild(c);
          const it = { el: c, at, len: ch.length, c: 0, w: 0 };
          at += ch.length;
          return it;
        });
        arc.words.push({ m, chars, width: 0 });
      }
      arc.probe = document.createElement('span'); // finds the baseline inside a letter's box
      arc.probe.className = 'seg-arc__measure';
      arc.probe.innerHTML = 'H<i class="seg-arc__base"></i>';
      arc.box.appendChild(arc.probe);
      svg.after(arc.box);
      root.classList.add('seg--chars');
    }
    // The curve: the upper half of an ellipse centred on the cap's bottom middle, inset by i (rx = W/2 - i,
    // ry = C - i). A table of arc length against angle turns "s along the curve" into a point and a
    // tangent with no DOM call, so a frame costs only arithmetic and transforms.
    const N = 720;
    const pointAt = (s) => {
      const { lut, geo } = arc;
      s = clamp(s, 0, arc.L);
      let lo = 0, hi = N;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (lut[mid] <= s) lo = mid; else hi = mid; }
      const f = lut[hi] > lut[lo] ? (s - lut[lo]) / (lut[hi] - lut[lo]) : 0;
      const th = Math.PI * (1 - (lo + f) / N);
      const sin = Math.sin(th), cos = Math.cos(th);
      return { x: geo.cx + geo.rx * cos, y: geo.cy - geo.ry * sin, a: (Math.atan2(geo.ry * cos, geo.rx * sin) * 180) / Math.PI };
    };
    // W, C, the curve, its length, the letter positions and the widest gap: all depend on the box and
    // the font. The words must stay in the middle 62% of the curve (no tilt past about 56 degrees). A
    // heading too long for that at the CSS size (a wide display face, a 30-character heading) is set
    // smaller, down to 65% of it; only past that is it set straight.
    arc.measure = () => {
      arc.ok = false;
      if (!arc.words.length) return false;
      const W = cap.clientWidth, C = cap.clientHeight;
      if (!W || !C) return false;
      const i = clamp(0.14 * C, 44, 110); // baseline inset: glyph tops stay ~0.4em inside the edge
      arc.geo = { cx: W / 2, cy: C, rx: W / 2 - i, ry: C - i };
      const lut = new Float64Array(N + 1);
      let px = arc.geo.cx - arc.geo.rx, py = C;
      for (let k = 1; k <= N; k++) {
        const th = Math.PI * (1 - k / N);
        const x = arc.geo.cx + arc.geo.rx * Math.cos(th), y = arc.geo.cy - arc.geo.ry * Math.sin(th);
        lut[k] = lut[k - 1] + Math.hypot(x - px, y - py);
        px = x; py = y;
      }
      arc.lut = lut;
      arc.L = lut[N];
      // The words keep to the middle of the curve: their ends within its middle 62%, and no letter
      // where the curve turns steeper than 56 degrees (on a phone the arch is taller than it is wide,
      // so that comes sooner than the 62%).
      let k0 = 0;
      for (; k0 < N / 2; k0++) {
        const th = Math.PI * (1 - k0 / N);
        if (Math.abs(Math.atan2(arc.geo.ry * Math.cos(th), arc.geo.rx * Math.sin(th))) <= (56 * Math.PI) / 180) break;
      }
      const n = arc.words.length;
      let win = 0.62 * arc.L;
      const fs = () => parseFloat(getComputedStyle(arc.box).fontSize) || 16;
      const read = () => {
        const range = document.createRange();
        for (const wd of arc.words) {
          const node = wd.m.firstChild, r0 = wd.m.getBoundingClientRect();
          wd.width = r0.width;
          wd.chars.forEach((ch) => {
            range.setStart(node, ch.at); range.setEnd(node, ch.at + ch.len);
            const r = range.getBoundingClientRect();
            ch.w = r.width; ch.c = r.left - r0.left + r.width / 2;
          });
        }
        arc.base = arc.probe.lastChild.offsetTop;
        arc.sum = arc.words.reduce((a, wd) => a + wd.width, 0);
        arc.gStart = 0.28 * fs();
        // the outermost letters' middles may reach the 56-degree points, their ends a little past
        const first = arc.words[0].chars[0], lw = arc.words[n - 1], last = lw.chars[lw.chars.length - 1];
        win = Math.min(0.62 * arc.L, arc.L - 2 * lut[k0] + (first ? first.c : 0) + (last ? lw.width - last.c : 0));
        return arc.sum + (n - 1) * arc.gStart;
      };
      arc.box.style.removeProperty('font-size');
      let need = read();
      arc.fits = need <= win;
      if (!arc.fits && need > 0) {
        const k = (0.94 * win) / need;
        if (k >= 0.65) {
          arc.box.style.fontSize = (k * fs()).toFixed(2) + 'px';
          need = read();
          arc.fits = need <= win;
        }
      }
      // each letter turns about the middle of its baseline, the point that sits on the curve
      for (const wd of arc.words) for (const ch of wd.chars) ch.el.style.transformOrigin = `${(ch.w / 2).toFixed(2)}px ${arc.base.toFixed(2)}px`;
      const room = n > 1 ? (win - arc.sum) / (n - 1) : 0;
      arc.gEnd = n > 1 ? Math.max(arc.gStart, Math.min((Stage.phone ? o.phoneSpread : o.spread) * W, room)) : 0;
      arc.g = -1;
      arc.ok = arc.L > 0 && arc.sum > 0;
      return arc.ok;
    };
    arc.layout = (g) => {
      if (!arc.ok || Math.abs(g - arc.g) < 0.05) return;
      arc.g = g;
      const n = arc.words.length;
      let s = arc.L / 2 - (arc.sum + (n - 1) * g) / 2;
      // how far the letters reach above and below the cap's top: the gate in build() shows the words
      // only while all of them are inside the screen
      const em = parseFloat(getComputedStyle(arc.box).fontSize) || 16;
      let top = Infinity, bottom = -Infinity;
      for (const wd of arc.words) {
        for (const ch of wd.chars) {
          const p = pointAt(s + ch.c);
          ch.el.style.transform = `translate(${(p.x - ch.w / 2).toFixed(2)}px, ${(p.y - arc.base).toFixed(2)}px) rotate(${p.a.toFixed(2)}deg)`;
          top = Math.min(top, p.y - 0.85 * em); bottom = Math.max(bottom, p.y + 0.6 * em);
        }
        s += wd.width + g;
      }
      arc.top = top; arc.bottom = bottom;
      root.classList.add('seg--arc-set');
    };

    let liveTl = null; // the scrubbed timeline while the scene runs; null in the finished composition
    // what the live scene shows only while it is whole on screen (build, step 7); the finished
    // composition shows it all
    const crest = cap.querySelector('.seg-crest');
    const gated = () => [arc.box, label, crest].filter(Boolean);
    const ungate = () => { if (!window.gsap) return; const els = gated(); gsap.killTweensOf(els, 'opacity'); gsap.set(els, { clearProps: 'opacity' }); };
    const gapNow = () => {
      if (!liveTl || o.arc === 'static') return Math.max(arc.gStart, 0.5 * arc.gEnd);
      return arc.gStart + (arc.gEnd - arc.gStart) * clamp((liveTl.progress() - 0.1) / 0.46, 0, 1);
    };
    // Measure with the letters' box shown (a display:none box measures nothing), then decide: on the
    // curve, or set straight when the words cannot fit on it.
    const relayout = () => {
      fitHero();
      sampleLede();
      if (!arc.words.length) { root.classList.add('seg--flat'); return; }
      root.classList.remove('seg--flat');
      const ok = arc.measure();
      const flat = ok && (!arc.fits || (Stage.phone && words.length > 4));
      root.classList.toggle('seg--flat', flat);
      if (ok && !flat) arc.layout(gapNow());
    };
    if (window.ResizeObserver) {
      let raf = 0;
      new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(relayout); }).observe(cap);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout).catch(() => {});

    // ---- the chapter title, split into letters (words kept whole so a phone wraps between them)
    if (title && !title.dataset.segSplit) {
      const text = title.textContent.trim().replace(/\s+/g, ' ');
      title.setAttribute('aria-label', text);
      title.textContent = '';
      text.split(' ').forEach((w, k) => {
        if (k) title.appendChild(document.createTextNode(' '));
        const ws = document.createElement('span');
        ws.className = 'seg-title__word';
        ws.setAttribute('aria-hidden', 'true');
        for (const ch of w) { const c = document.createElement('span'); c.className = 'seg-title__char'; c.textContent = ch; ws.appendChild(c); }
        title.appendChild(ws);
      });
      title.dataset.segSplit = '1';
    }
    const chars = title ? [...title.querySelectorAll('.seg-title__char')] : [];

    // ---- optional fixed header: light while the photograph is under it, back to ink when the edge passes
    const chromeOff = () => { if (chromeEl) chromeEl.style.removeProperty('--chrome-ink'); };
    const chromeTrigger = (live) => {
      if (!chromeEl || !window.ScrollTrigger) return;
      // the point the flip is timed at: chromeX percent across the header, else the centre of its
      // first child (the logo), else a little in from its left end
      const point = () => {
        const r = chromeEl.getBoundingClientRect();
        if (o.chromeX != null) return { x: r.left + (r.width * o.chromeX) / 100, y: r.top + r.height / 2 };
        const k = chromeEl.firstElementChild, b = k && k.getBoundingClientRect();
        if (b && b.width) return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
        return { x: r.left + Math.min(72, r.width / 2), y: r.top + r.height / 2 };
      };
      ScrollTrigger.create({
        trigger: root,
        start: () => `top ${Math.round(point().y)}px`,
        end: () => {
          const pt = point(), W = cap.clientWidth, C = cap.clientHeight, H = stage.clientHeight;
          if (live) {
            const top = root.getBoundingClientRect().top + window.scrollY;
            const y = pt.y - edgeDepth(pt.x, W, C); // where the ground's top is when its edge meets the point
            const t = clamp(GROUND[0] + GROUND[1] * (H - y) / (H + C), 0, 1);
            return top + t * Math.max(1, root.offsetHeight - window.innerHeight);
          }
          return ground.getBoundingClientRect().top + window.scrollY + edgeDepth(pt.x, W, C) - pt.y;
        },
        onToggle: (self) => { if (self.isActive) chromeEl.style.setProperty('--chrome-ink', o.chromeLight); else chromeOff(); },
      });
    };

    function build(tl, ctx) {
      const { phone } = ctx;
      liveTl = tl;
      chromeOff();
      const H = () => stage.clientHeight || window.innerHeight;
      const C = () => cap.clientHeight;

      // 1. the photograph zooms, linear, towards a point low in the frame; finished as the ground covers it
      tl.fromTo(img, { scale: phone ? 1.04 : 1.06 }, { scale: phone ? o.phoneZoom : o.zoom, duration: 0.88 }, 0);
      if (o.fade) {
        tl.fromTo(img, { opacity: 1 }, { opacity: 0.7, duration: 0.55, ease: 'power2.in' }, 0)
          .to(img, { opacity: 0, duration: 0.31, ease: 'power2.in' }, 0.55);
      }
      // 2. the headline leaves before the arch's flank reaches it, on a clock of 0.45s once the scroll
      //    passes 0.08 (back when it returns), so no stop shows it half faded
      const heroTw = hero ? gsap.fromTo(hero, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: () => -0.06 * H(), duration: 0.45, ease: 'power2.in', paused: true }) : null;
      let heroOut = false;
      // 3. the ground climbs from below the stage until its body fills it: H + C of travel over
      //    0.8 * hold * H of scroll, which the CSS height makes equal. It starts at 0.10 and keeps its end
      //    (0.88), so it climbs 2.5% faster than the page and the 10% step shows no sliver of the arch's cap
      //    on the foot of the screen (0.08 before fix-006, a 12px teal cap there)
      tl.fromTo(ground, { y: () => H() }, { y: () => -C(), duration: GROUND[1] }, GROUND[0]);
      // 4. the title turns in, letter by letter, on a clock of 0.7s once half the title is on screen, at
      //    every width, never with the scroll: a title keyed to the scroll stands half-drawn where the
      //    reader stops (a half-faded last letter), and one waiting for a point of the timeline stands
      //    empty on screen until then (the inspector's letters-mid-reveal, both).
      const turned = { rotationY: 90, yPercent: 50, autoAlpha: 0, transformPerspective: 900 };
      let titleTw = null, titleOn = false;
      if (chars.length) {
        gsap.set(chars, turned);
        titleTw = gsap.to(chars, { rotationY: 0, yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out', paused: true, stagger: { amount: 0.3 } });
      }
      // 5. the inset opens from the bottom while its picture settles, on a clock of 0.6s once 40% of
      //    it is on screen (about 0.7 of the hold), played back when it drops below that again. It rises with
      //    the title: opened at 0.84, the title stood alone on flat ground from 0.5 to 0.8. Hidden while
      //    it waits, so no closed box is read at the foot of the screen.
      let insetTw = null, insetOn = false;
      if (inset) {
        gsap.set(inset, { visibility: 'hidden', clipPath: 'inset(100% 0% 0% 0%)' });
        insetTw = gsap.timeline({ paused: true })
          .set(inset, { visibility: 'visible' }, 0)
          .fromTo(inset, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.out', immediateRender: false }, 0);
        if (insetImg) insetTw.fromTo(insetImg, { scale: 1.2, xPercent: 8 }, { scale: 1, xPercent: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, 0);
      }
      const insetIn = () => { const r = inset.getBoundingClientRect(); return r.height > 0 && r.top + 0.4 * r.height <= (window.innerHeight || H()); };
      // 6. the photograph is unseen from here: stop painting it
      tl.set(photo, { autoAlpha: 0 }, 0.885);
      tl.to({}, { duration: 0.06 }, 0.94);

      // 7. the words on the curve and the statement show only while they are whole on screen: they fade in
      //    on a clock once the arch has carried all of them in, and out before the top or the foot of the
      //    screen would cut one, so no stop shows a sliced word.
      const EDGE = 6;
      const gate = { arc: false, crest: false };
      gsap.set(gated(), { opacity: 0 }); // below the screen until the ground climbs
      const show = (el, key, on) => {
        if (!el || gate[key] === on) return;
        gate[key] = on;
        gsap.to(el, { opacity: on ? 1 : 0, duration: on ? 0.35 : 0.2, ease: on ? 'power2.out' : 'power1.in', overwrite: 'auto' });
      };
      const whole = (top, bottom, foot = EDGE) => top >= EDGE && bottom <= (window.innerHeight || H()) - foot;
      // the statement waits until it is clearly inside the screen: its last line 8vh (64px or more) above
      // the foot, both on the way in and on the way back down (6px let it appear 12-18px above the foot)
      const crestFoot = () => Math.max(64, 0.08 * (window.innerHeight || H()));

      // the words spread with the timeline (0.10-0.56): driven from its progress, so every render,
      // scrub catch-up and refresh lands on the right spread
      // (and the title clock: played once the ground has carried half the title onto the screen,
      // played back when it drops below the screen again)
      const titleIn = () => { const r = title.getBoundingClientRect(); return r.height > 0 && r.top + r.height / 2 < (window.innerHeight || H()); };
      tl.eventCallback('onUpdate', () => {
        arc.layout(gapNow());
        if (heroTw) { const out = tl.progress() >= 0.08; if (out !== heroOut) { heroOut = out; if (out) heroTw.play(); else heroTw.reverse(); } }
        if (titleTw) { const on = titleIn(); if (on !== titleOn) { titleOn = on; if (on) titleTw.play(); else titleTw.reverse(); } }
        if (insetTw) { const on = insetIn(); if (on !== insetOn) { insetOn = on; if (on) insetTw.play(); else insetTw.reverse(); } }
        const capTop = cap.getBoundingClientRect().top;
        if (arc.box && arc.ok && !root.classList.contains('seg--flat')) show(arc.box, 'arc', whole(capTop + arc.top, capTop + arc.bottom));
        else if (root.classList.contains('seg--flat') && label) { const r = label.getBoundingClientRect(); show(label, 'arc', whole(r.top, r.bottom)); }
        if (crest) { const r = crest.getBoundingClientRect(); show(crest, 'crest', whole(r.top, r.bottom, crestFoot())); }
      });
      // re-measure the curve whenever ScrollTrigger refreshes (resize, fonts, pictures)
      ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onRefresh: relayout });
      chromeTrigger(true);
      relayout();
    }

    function rest() {
      liveTl = null;
      chromeOff();
      ungate();
      relayout();
      if (Stage.live) chromeTrigger(false);
    }

    // Screens under 560px tall (a phone on its side) get the finished composition; a heading of more
    // than four words cannot sit on a phone's arch.
    const short = window.matchMedia('(max-height: 559px)');
    const start = () => {
      const H = window.innerHeight || 1, C = cap.clientHeight || 0.8 * H;
      return Stage.scene(root, {
        hold: Math.round(1.25 * (1 + C / H) * 100) / 100, // informational: the CSS sets the height
        // locked to the scroll when Lenis already smooths it, and on touch screens, where the finger's
        // own scroll is smooth and the arch must stay attached to it (1:1 is the point of the move)
        scrub: o.scrub ?? (Stage.lenis || Stage.touch ? true : 0.6),
        build: short.matches ? null : build,
        phone: o.phone === 'rest' || words.length > 4 ? 'rest' : 'same',
        rest,
      });
    };
    // The stage has no way to rebuild one scene with a different plan, so crossing the threshold
    // reverts this scene's matchMedia, takes it off Stage.scenes and starts the scene again.
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
