// assets/scenes/raster-cut/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / raster-cut.js — the raster cut between chapters (references/scenes.md).
//
// On a held stage the next chapter (B: a full-bleed picture, never flat) prints over
// the current one (A: a full-bleed picture or a flat ground) through a raster of horizontal slats with
// whole-pixel edges, interlaced like the two fields of a video frame: every other slat prints first, from
// the bottom up, the frame holds for a beat as an even raster of both chapters (five bands of each over the
// whole screen), then the slats between print and close it. Every slat grows from its lower edge in whole
// steps, so the whole cut moves in one printed rhythm, while the old picture sinks and the new one rises
// inside their slats. The chapter title is drawn twice in exact register, once in each layer, so it changes
// from A's ink to B's ink line by line and never breaks apart: the slats over each line of the title are
// tied together and print that line whole, on a step, while the raster runs on around it. The deck
// sentence exists only in B and arrives after the last slat has closed. The pin releases onto exactly the
// same B ground, so the joint cannot be seen: over a B picture, the picture lifts off the foot of the stage
// as the deck arrives and leaves a band of --b-ground that runs straight on into the next section.
// Use it as the one repeating joint of a site: at most three cuts a page, three or more screens apart,
// never in neighbouring sections, one pattern per site, always the same direction going forward.
//
// DOM
//   <section class="scene" data-scene="raster-cut" data-options='{"pattern":"slats","nav":".bar"}'
//            style="--a-ground:#0F0F0E; --a-ink:#EDE8DD; --b-ground:#E8E3D7; --b-ink:#151514">
//     <div class="scene-stage">
//       <div class="rc-layer rc-a" aria-hidden="true">
//         <div class="rc-media"><img src="a.jpg" alt="" width="2400" height="1500"></div>  (leave empty for a flat ground)
//         <div class="rc-copy"><p class="rc-title">Two to four words</p></div>
//       </div>
//       <div class="rc-layer rc-b">
//         <div class="rc-media"><img src="b.jpg" alt="" width="2400" height="1500"></div>  (B is a full-bleed picture, never flat)
//         <div class="rc-copy">
//           <h2 class="rc-title">Two to four words</h2>     (exactly the words of the A copy)
//           <p class="rc-deck">One sentence of 12-22 words, shown only in B.</p>
//         </div>
//       </div>
//       <p class="rc-line" aria-hidden="true">One short line</p>   (optional, pattern 'bands' only)
//     </div>
//   </section>
//   <section style="background:var(--b-ground)">the next chapter, on exactly --b-ground, title not repeated</section>
//
// Tokens (inline on the section; each ink 7:1 or better on its own ground, grounds ΔL* 50 or more apart):
//   --a-ground --a-ink   default to the page's --ink and --ground (the inverted chapter)
//   --b-ground --b-ink   default to the page's --ground and --ink; the next section's background must equal --b-ground
//   --a-scrim  flat black over an A picture, .3 (0-.6; raise it until the A ink reads 7:1 on the picture's
//              middle band, the demo's misty forest needs .55)
//   --b-scrim  flat wash over a B picture, 0 (0-.6), in --b-scrim-color (default black; use the B ground
//              itself, var(--b-ground), when a pale picture carries dark B ink)
//
// Title: two to four words, up to 22 characters. Headlines keep to two lines: when a title would set in
// three, the script steps both copies down together (--rc-fit on the section, to 0.6 at most) until it sets
// in two, live and at rest. Without script the CSS sizes alone keep 22 characters of ordinary words in two
// lines from 360px up.
//
// Options (data-options JSON)            default        range
//   pattern     'slats'       'slats' | 'blinds' (vertical windows) | 'bands' (heavy bands) | 'halftone' (flat B
//                             only, so never in a dealt scene)
//   count       12            slats 3-24 on desktop (8-12 reads best); bands 3-8, by default 5, or 6 when
//                             that puts an edge between the title's lines (bands stay even: no phase shift);
//                             blinds 3 (2-5)
//   phoneCount  12            slats 3-24 on a phone (12-15 reads best); bands and blinds as count
//   order       'interlace'   slats: 'interlace' (two fields: every other slat from the bottom, a striped beat,
//                             then the slats between) | 'bottom' (one rising edge) | 'top' (footer curtain) |
//                             'centre' (from the title) | 'shuffle'. Bands default to 'bottom'. The slats tied
//                             to a title line (or lying under the nav's words) count as one slat in every
//                             order. Blinds: 'right' (sweeps right to left) | 'left'
//   steps       4             slats: each slat grows in at most this many whole steps (0 = smoothly, 1-8). A slat
//                             takes as many steps as its own height allows at 22px or more a step (a 75px slat
//                             prints in thirds, a 40px end slat in one step), never more than the cut's average
//                             slat takes, and a step that may not stop on the title waits for the next step, so
//                             every strip is whole steps. Blinds, bands and halftone 0
//   amount      0.40          stagger spread 0.2-0.5 (0.30-0.48 reads best); each slat or band runs 0.60 - amount
//   ease        'power2.out'  per slat, as GSAP names it: 'none' (mechanical, evenly spaced steps) | 'power2.out'
//                             (the default: each slat's steps come quickly, then slower) | 'power3.out' (sharper
//                             still, the curve the spec names); blinds, bands and halftone default to 'none';
//                             bounce, elastic and back are refused
//   flip        0.5           a title line prints whole when its slats are this far grown, 0.25-1 (on a step)
//   hold        1.2           screens held on desktop, 0.8-2 (above 1.5 only with the bands line)
//   phoneHold   1.2           screens held on a phone, 0.8-2
//   phone       'same'        'same' | 'rest' (the phone shows the finished composition)
//   fold        'auto'        over a B picture: lift the picture off the stage's foot at the end, so the
//                             next section joins on flat --b-ground. 'auto' = on when B has a picture;
//                             false (or data-rc-fold="off" on the section) keeps the picture full-bleed,
//                             for a B texture that the next section repeats as its own ground
//   cell        10            halftone dot pitch in px, 4-24; phoneCell 8
//   seed        7             the fixed shuffle (never random per visit)
//   nav         ''            selector of a fixed nav. It gets data-rc-ground="a|b" and --rc-nav-ink, switched
//                             when B covers its words; no edge ever lies across the words: slats or bands under
//                             them are tied and print together, a moving edge never stops inside them. With
//                             blinds each word takes the ink of the window under it: while the words sit on
//                             both grounds the nav gets data-rc-ground="mixed" and each word's element an inline
//                             colour (restored after). Also --rc-nav-ground, and data-rc-fill once the bar may
//                             take the B ground without cutting the B picture: when the pin releases (B is a
//                             full-bleed picture, never flat). Style it
//                             .bar[data-rc-fill]{background:var(--rc-nav-ground)}
//   scrub       0.5           seconds of catch-up; true when Lenis smooths the page
//
// Progress map (desktop 1440x900, slats, N = 12, hold 1.2, a two-line title, B a picture; measured)
//   0-0.13     opening hold: A only, the title readable in A ink
//   0.13-0.61  B prints in. Each slat rises from its own lower edge in thirds (25px steps at 75px slats),
//              steps quick then slower (power2.out), one rhythm for the whole cut. The grid slides by up
//              to half a slat so an edge falls between the title's lines; the slats over each line are tied
//              and print that line whole on the step where they are half grown. A slat that only grazes
//              the title prints whole with its own last step, so no edge ever stops on the letters.
//              Field 1, 0.13-0.32: the bottom slat, every other unit up the frame; the title's second line
//              prints in B ink at 0.24.
//              The beat, 0.32-0.40: five B bands and five A bands over the whole frame (B covers 47-50%),
//              the title's lines in two inks, each whole on its own ground.
//              Field 2, 0.40-0.61: the units between print and close the gaps from the bottom up; the
//              title's first line prints at 0.50; the top slat, under the nav, prints whole and the cut
//              closes at 0.61 (clip-path none).
//              Two or more separate B bands with A between from 0.17 to 0.57, five from 0.32 to 0.46. No
//              strip of either ink is ever under 25px here (22px at any size with the default count, every
//              slat stepping by its own height); no edge ever lies across the nav's words (with an
//              underline) or a line of the title.
//              Depth: the A picture sinks 2.5% and pushes in to 1.06 until the cut's last step; the B
//              picture rises from 3.5% below and settles from 1.1 to 1 over 0.12-1, so neighbouring slats
//              slide past each other
//   0.61-0.75  over a B picture: the picture's foot lifts (ease none) to 20px or more below the deck (it
//              keeps 4/5 of the stage when the deck allows), leaving a band of --b-ground 48px or more (7% of
//              a tall stage); with no room for that band the picture stays full-bleed
//   0.63-0.77  the deck rises 24px into place (power2.out, as the spec asks); fold and deck wait for the
//              last step any slat can take
//   0.77-1     closing hold (0.28 screen); the pin releases onto the same ground
// Patterns: blinds sweep three windows across the width (0.60/0.45/0.30 of the scene each), and inside the
// title's columns each ink keeps 40px or more; a window's edge jumps over a nav word, and a word that spans
// two windows waits until both can take it, so on a phone, where the words are wide, two windows may print
// together. Bands print five or six even heavy bands from the bottom, one beat (0.08) apart: a band that
// holds a title line, or that the title fills, prints whole on its beat, a free band grows through its beat
// (1440x900: the bottom band grows from 0.14, the bands over the title print at 0.20, 0.28, 0.36 and 0.44,
// the top band grows from 0.52 and the cut closes at 0.70). The optional difference-blend line sits inside
// one band clear of the title and the nav, and of the deck where it can (where it cannot, the line fades out
// over 0.66-0.72, before the deck arrives; hidden when no band is free); that band prints first, whole, the
// moment the cut starts (0.12), so no edge ever crosses the line. Halftone (flat B only) prints a B dot
// screen around solid plates that keep the title and the nav on A until the dots touch at about 0.53, then
// flip them to B in one step, so the words are never broken into dots.
// Phone (under 768px): the same cut with 12 slats (70px at 844 tall, printing in thirds) over a 1.2-screen
// hold, the copy inset 24px and the title at clamp(40px, 13.5vw, 60px), fitted to two lines; six B bands at
// once from 0.28 to 0.46, the title's lines in B ink at 0.25 and 0.48, no strip under 23px. Blinds stay 3,
// bands stay 5 or 6 and drop the line, the halftone pitch is 8px. The stage is 100lvh with the copy centred
// on 50svh.
// Reduced motion, no script or phone 'rest': the finished composition in raster-cut.css, a band of A, then
// B with the title once and the deck, joined by the cut frozen on its striped beat. Nothing is hidden.
(() => {
  const Scenes = (window.Scenes = window.Scenes || {});
  const CUT = 0.12;   // the cut starts after the opening hold
  const SPAN = 0.6;   // and is closed by 0.72
  const FIELD = 0.35; // interlace: each field's units start within this share of the stagger amount
  const PAD = 2;      // px: both layers reach this far past the stage's top and bottom (raster-cut.css), so
                      // the stage's own clip is the only edge there and no device row blends A into B
  const STEP = 22;    // px: no printed step (so no strip) is thinner than this
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => (v === null || v === undefined || v === '' || !Number.isFinite(+v) ? d : +v);
  const safeEase = (e, d) => (typeof e === 'string' && e && !/bounce|elastic|back|rough|slow|steps/i.test(e) ? e : d);
  const svgUrl = (svg) => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';

  // the fixed shuffle: a seeded generator, so every visit gets the same order
  const seeded = (s) => () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // halftone: one dot per tile, an SVG mask image (no CSS gradient); quantised to 0.1px and cached, so
  // the browser decodes each size once
  const tiles = new Map();
  const tile = (cell, r) => {
    const k = cell + ':' + r;
    if (!tiles.has(k)) tiles.set(k, svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}'><circle cx='${cell / 2}' cy='${cell / 2}' r='${r}'/></svg>`));
    return tiles.get(k);
  };
  // share of a tile a centred dot of radius f (in cells) covers
  const dotCover = (f) => (f <= 0.5 ? Math.PI * f * f : Math.min(1, Math.PI * f * f - 4 * (f * f * Math.acos(0.5 / f) - 0.5 * Math.sqrt(f * f - 0.25))));

  // the lines a block of text sets in (word boxes with a new top start a new line)
  const lineCount = (el) => {
    let n = 0, last = -Infinity;
    const rg = document.createRange(), tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      for (const w of t.nodeValue.matchAll(/\S+/g)) {
        rg.setStart(t, w.index); rg.setEnd(t, w.index + w[0].length);
        const q = rg.getBoundingClientRect();
        if (q.height && q.top > last + 0.5 * q.height) { n++; last = q.top; }
      }
    }
    return n;
  };

  // the nav: every cut on the page claims it while the page is at or past that cut; the lowest claim wins.
  // A claim is [ground 'a' | 'b' | 'mixed', ink, ground colour, fill, per-word inks or null]
  const claims = new Map();   // nav element -> Map(scene root -> claim)
  const painted = new Map();  // nav element -> Map(word element -> its own inline colour before we painted it)
  const paint = (nav, words) => {
    let was = painted.get(nav);
    if (!was) painted.set(nav, (was = new Map()));
    const now = new Map(words || []);
    for (const [el, prev] of was) if (!now.has(el)) { el.style.color = prev; was.delete(el); }
    for (const [el, c] of now) { if (!was.has(el)) was.set(el, el.style.color); el.style.color = c; }
  };
  const claimNav = (nav, root, claim) => {
    let mine = claims.get(nav);
    if (!mine) claims.set(nav, (mine = new Map()));
    if (claim) mine.set(root, claim); else mine.delete(root);
    let win = null;
    for (const [r, c] of mine) if (!win || win[0].compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING) win = [r, c];
    if (win) {
      nav.dataset.rcGround = win[1][0];
      nav.toggleAttribute('data-rc-fill', !!win[1][3]);
      nav.style.setProperty('--rc-nav-ink', win[1][1]);
      nav.style.setProperty('--rc-nav-ground', win[1][2]);
    } else {
      delete nav.dataset.rcGround;
      nav.removeAttribute('data-rc-fill');
      nav.style.removeProperty('--rc-nav-ink');
      nav.style.removeProperty('--rc-nav-ground');
    }
    paint(nav, win && win[1][4]);
  };

  Scenes['raster-cut'] = (root, opts = {}) => {
    if (!root || !window.Stage) return null;
    const asked = opts.pattern || root.dataset.rcPattern;
    const pattern = ['slats', 'blinds', 'bands', 'halftone'].includes(asked) ? asked : 'slats';
    root.dataset.rcPattern = pattern;
    const blinds = pattern === 'blinds', bands = pattern === 'bands', dots = pattern === 'halftone';
    const hold = clamp(num(opts.hold, 1.2), 0.8, 2);
    const phoneHold = clamp(num(opts.phoneHold, Math.min(hold, 1.2)), 0.8, 2);
    const amount = clamp(num(opts.amount, 0.4), 0.2, 0.5);
    const ease = safeEase(opts.ease, blinds || bands ? 'none' : 'power2.out');
    const order = String(opts.order || (blinds ? 'right' : bands ? 'bottom' : 'interlace')).toLowerCase();
    // slats print in whole steps (up to four a slat), so the cut has one printed rhythm
    const steps = clamp(Math.round(num(opts.steps, pattern === 'slats' ? 4 : 0)), 0, 8);
    // as many steps as a length allows at STEP px or more a step (a slat under 2 x STEP prints in one)
    const stepsFor = (len) => (steps ? clamp(Math.floor(len / STEP), 1, steps) : 0);
    // a title line prints whole when the slats tied to it are this far grown (on the nearest step)
    const flip = clamp(num(opts.flip, 0.5), 0.25, 1);
    const centre = order === 'centre' || order === 'center';
    const seed = Math.round(num(opts.seed, 7));
    const scrub = opts.scrub ?? (Stage.lenis ? true : 0.5);
    const foldOpt = opts.fold ?? (root.dataset.rcFold === 'off' ? false : 'auto');
    if (foldOpt === false || foldOpt === 'off') root.dataset.rcFold = 'off';
    if (Stage.live && Stage.touch) ScrollTrigger.config({ ignoreMobileResize: true });

    // headlines keep to two lines: both title copies step down together until the title sets in two
    const fitTitle = () => {
      const t = root.querySelector('.rc-b .rc-title') || root.querySelector('.rc-title');
      if (!t || !t.getClientRects().length) return;
      root.style.removeProperty('--rc-fit');
      for (let f = 1; lineCount(t) > 2 && f > 0.62;) {
        f = Math.round((f - 0.04) * 100) / 100;
        root.style.setProperty('--rc-fit', String(f));
      }
    };
    // at rest (reduced motion, no GSAP, a phone set to 'rest') the title still fits, on resize and late fonts
    let fitRaf = 0;
    const refit = () => { if (root.classList.contains('is-live')) return; cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitTitle); };
    addEventListener('resize', refit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);

    const build = (tl, { stage, phone }) => {
      const a = root.querySelector('.rc-a'), b = root.querySelector('.rc-b');
      if (!a || !b) return;
      const aMedia = a.querySelector('.rc-media'), bMedia = b.querySelector('.rc-media');
      const titleB = b.querySelector('.rc-title') || a.querySelector('.rc-title');
      const deck = b.querySelector('.rc-deck'), line = root.querySelector('.rc-line');
      const pics = (m) => (m ? [...m.children].filter((c) => c.matches('img, video, picture, canvas, svg')) : []);
      const aPics = pics(aMedia), bPics = pics(bMedia);
      const fold = bPics.length > 0 && foldOpt !== false && foldOpt !== 'off';
      const navEl = opts.nav ? document.querySelector(opts.nav) : null;
      const buildId = (root.__rcBuild = (root.__rcBuild || 0) + 1);
      fitTitle();

      // slats (or windows): screen order, top to bottom (left to right for blinds)
      const askedN = phone ? opts.phoneCount ?? opts.count : opts.count;
      const autoN = bands && num(askedN, null) === null;  // bands: 5 or 6, settled in measure() by the title
      let n = dots ? 0 : blinds
        ? clamp(Math.round(num(askedN, 3)), 2, 5)
        : bands
          ? clamp(Math.round(num(askedN, 5)), 3, 8)
          : clamp(Math.round(phone ? num(opts.phoneCount, 12) : num(opts.count, 12)), 3, 24);
      const prox = Array.from({ length: n }, () => ({ v: 0 }));  // blinds: one per window
      const far = new Array(n);   // true: slat j grows from its lower (right) edge; false: from its upper (left) edge
      // slats and bands: one clock runs through the cut, and each unit (a slat, or the slats tied to a title
      // line or under the nav's words) takes its own slot in it by its place in the order, so the cut has no
      // gaps whatever the title
      const clock = { c: 0 };
      const ef = gsap.parseEase(ease) || ((x) => x);
      let start = new Float32Array(n);  // per slat: when its unit starts, as a fraction of the scene after CUT
      const cell = clamp(Math.round(num(phone ? opts.phoneCell : opts.cell, phone ? 8 : 10)), 4, 24);
      const dot = { r: 0 };
      const lift = { f: 0 };

      if (dots) {
        b.style.setProperty('--rc-cell', cell + 'px');
        tl.fromTo(dot, { r: 0 }, { r: 0.73 * cell, duration: SPAN, ease: 'none' }, CUT);
      } else if (blinds) {
        // the windows all start together, the leading one fastest: a sweep across the width
        const leftward = order !== 'left';
        for (let j = 0; j < n; j++) {
          far[j] = leftward;
          const t = n === 1 ? 0 : j / (n - 1);
          tl.fromTo(prox[j], { v: 0 }, { v: 1, duration: leftward ? 0.6 - 0.3 * t : 0.3 + 0.3 * t, ease }, CUT);
        }
      } else {
        // which slot each slat takes is settled in measure() (sequence), once the title's lines are known
        for (let j = 0; j < n; j++) { start[j] = (amount * (order === 'top' ? j : n - 1 - j)) / Math.max(1, n - 1); far[j] = order !== 'top'; }
        tl.fromTo(clock, { c: 0 }, { c: 1, duration: SPAN, ease: 'none' }, CUT);
      }
      // a unit's growth (0-1): it starts at its slot after the cut begins and runs SPAN - amount
      const grown = (j) => (blinds ? prox[j].v : ef(clamp((clock.c * SPAN - start[j]) / (SPAN - amount), 0, 1)));

      // pictures decode before they move (Stage.ready only waits for the ones still loading). The pictures
      // themselves scale, not .rc-media, so the fold's clip on .rc-media stays a whole-pixel edge.
      for (const img of root.querySelectorAll('.rc-media img')) {
        if (img.loading === 'lazy') img.loading = 'eager';
        if (img.decode) img.decode().catch(() => {});
      }
      // stepped slats show their last step before their tween ends: the fold and the deck follow the last
      // step any slat can take. No slat takes more steps than the cut's average slat at this build (stCap),
      // and a slat with fewer steps shows its last one earlier, so nothing waits on a finished frame and
      // nothing arrives before the cut has closed
      const sr0 = stage.getBoundingClientRect();
      const stCap = dots || !n ? 0 : stepsFor((blinds ? sr0.width || innerWidth : sr0.height || innerHeight) / n);
      let cutEnd = CUT + SPAN;
      if (!dots && !blinds && stCap) {
        const goal = (stCap - 0.5) / stCap;
        let t = 0;
        while (t < 1 && ef(t) < goal) t += 0.005;
        cutEnd = Math.min(CUT + SPAN, CUT + amount + (SPAN - amount) * t);
      }
      // depth across the raster: the old picture sinks and pushes in while the new one rises and settles, so
      // neighbouring slats slide past each other (the shift stays inside each picture's own overscale)
      if (aPics.length) tl.fromTo(aPics, { scale: 1, yPercent: 0 }, { scale: 1.06, yPercent: 2.5, duration: cutEnd }, 0);
      if (bPics.length) tl.fromTo(bPics, { scale: 1.1, yPercent: 3.5 }, { scale: 1, yPercent: 0, duration: 1 - CUT }, CUT);
      if (fold) tl.fromTo(lift, { f: 0 }, { f: 1, duration: 0.14, ease: 'none' }, cutEnd);
      if (deck) tl.fromTo(deck, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, cutEnd + 0.02);
      if (line && bands) tl.fromTo(line, { xPercent: 0 }, { xPercent: -30, duration: 1 }, 0);
      // the line leaves before the deck arrives, used only where the line's band also holds the deck
      const lineOut = { o: 0 };
      if (line && bands && deck) tl.fromTo(lineOut, { o: 0 }, { o: 1, duration: 0.06 }, Math.max(0, cutEnd - 0.06));

      // ---- the nav follows the ground under it ----
      let navOn = false, navPast = false, navState = null, cover = 0, coverBar = 0;
      let navWords = [];  // blinds: { el, x0, x1, on } per element holding the nav's words, in stage pixels
      const inks = {};
      const readInks = () => {
        const cs = getComputedStyle(root);
        for (const s of ['a', 'b']) inks[s] = [cs.getPropertyValue(`--${s}-ink`).trim(), cs.getPropertyValue(`--${s}-ground`).trim()];
      };
      const applyNav = () => {
        if (!navEl || !inks.a) return;
        let s = '';
        if (navOn) {
          if (blinds && navWords.length) {
            const on = navWords.reduce((c, w) => c + w.on, 0);
            s = on === navWords.length ? 'b' : on ? 'mixed' : 'a';
          } else s = cover >= 0.5 ? 'b' : 'a';
        }
        // a filled bar is invisible only over flat B: past the cut, or over a flat B that covers the whole strip
        const fill = s === 'b' && (navPast || (!bPics.length && coverBar >= 1));
        const key = s + (fill ? '+' : '') + (s === 'mixed' ? navWords.map((w) => +w.on).join('') : '');
        if (key === navState) return;
        navState = key;
        const g = s === 'mixed' ? 'a' : s;
        claimNav(navEl, root, s ? [s, inks[g][0], inks[g][1], fill, s === 'mixed' ? navWords.map((w) => [w.el, inks[w.on ? 'b' : 'a'][0]]) : null] : null);
      };

      // ---- measure(): whole-pixel edges and the guarded rows; render(): the clip from those edges ----
      let W = 0, H = 0, edges = [], snaps = [], ladders = [], whole1 = new Uint8Array(0), guards = [], plates = [], foldY = 0;
      let navTxt = null, navBar = 0, sliver = 3, minT = 16, near = null, st = 0, lineK = -1, lineFade = false, lastLineO = null;
      let tied = new Int16Array(0);   // per slat: the unit (title line or nav) it is tied to, or -1
      let stJ = new Int8Array(0);     // per slat: its own number of steps

      // the order the units print in. A unit is one slat, or the slats tied to one title line (or the nav);
      // each unit takes the next slot of the cut (grown()), so the cut keeps its length and its pace
      const sequence = (tc) => {
        const units = [];
        for (let j = 0; j < n; j++) {
          const u = units[units.length - 1];
          if (u && tied[j] >= 0 && u.g === tied[j]) u.s.push(j); else units.push({ g: tied[j], s: [j] });
        }
        const nu = units.length, idx = [...Array(nu).keys()], mid = (u) => (edges[u.s[0]] + edges[u.s[u.s.length - 1] + 1]) / 2;
        let seq;
        if (order === 'top') seq = idx;
        else if (centre) seq = idx.slice().sort((x, y) => Math.abs(mid(units[x]) - tc) - Math.abs(mid(units[y]) - tc) || y - x);
        else if (order === 'shuffle') {
          const rnd = seeded(seed); seq = idx.slice();
          for (let i = nu - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [seq[i], seq[k]] = [seq[k], seq[i]]; }
        } else if (order === 'bottom') seq = idx.slice().reverse();
        let at;
        if (seq) at = seq.map((_, i) => (nu > 1 ? (amount * i) / (nu - 1) : 0));  // evenly over `amount`, one after another
        else {
          // interlace (the default), like the two fields of a video frame: every other unit prints first,
          // bottom to top, its starts within the first FIELD of the stagger; the frame then holds as an even
          // raster of both chapters; the units between print in the last FIELD and close it
          const up = idx.slice().reverse(), f1 = up.filter((_, k) => k % 2 === 0), f2 = up.filter((_, k) => k % 2 === 1);
          const w = amount * FIELD, spread = (f, base) => f.map((_, k) => base + (f.length > 1 ? (w * k) / (f.length - 1) : 0));
          seq = [...f1, ...f2];
          at = [...spread(f1, 0), ...spread(f2, f2.length > 1 ? amount - w : amount)];
        }
        // bands: the band holding the line takes the first slot (it prints whole the moment the cut starts)
        if (lineK >= 0) {
          const i = seq.findIndex((u) => units[u].s.includes(lineK));
          if (i > 0) { const [u] = seq.splice(i, 1); at.splice(i, 1); seq.unshift(u); at.unshift(0); }
        }
        start = new Float32Array(n);
        seq.forEach((u, i) => {
          for (const j of units[u].s) {
            start[j] = at[i];
            // centre-out: above the title a slat grows upward, below it downward
            far[j] = order === 'top' ? false : centre ? (edges[j] + edges[j + 1]) / 2 <= tc : true;
          }
        });
      };
      // null: the first render always writes, so nothing a previous build left behind survives
      let lastClip = null, lastMask = null, lastLift = null, covered = null;
      const px = (el) => parseFloat(getComputedStyle(el).fontSize) || 0;

      // runs along y (stage pixels) as one polygon; the layer starts PAD above the stage. A run that reaches
      // the stage's edge is drawn past it, and runs are joined by zero-width segments outside the box.
      const polyY = (m) => {
        const top = -2, bottom = H + 2 * PAD + 2;
        const y = (v) => (v <= 0 ? top : v >= H ? bottom : v + PAD);
        return 'polygon(' + m.map(([a0, a1]) => `-2px ${y(a0)}px,${W + 2}px ${y(a0)}px,${W + 2}px ${y(a1)}px,-2px ${y(a1)}px`).join(',') + ')';
      };
      const polyX = (m) => {
        const top = -2, bottom = H + 2 * PAD + 2;
        const x = (v) => (v <= 0 ? -2 : v >= W ? W + 2 : v);
        return 'polygon(' + m.map(([a0, a1]) => `${x(a0)}px ${bottom}px,${x(a0)}px ${top}px,${x(a1)}px ${top}px,${x(a1)}px ${bottom}px`).join(',') + ')';
      };
      const covering = (m, lo, hi) => { let c = 0; for (const r of m) c += Math.max(0, Math.min(r[1], hi) - Math.max(r[0], lo)); return hi > lo ? c / (hi - lo) : 0; };

      // blinds: a nav word that spans two windows changes ground whole. Until every window under it can
      // cover its part, no window under it may touch it, so the word is never split by a window's edge
      const holdWords = (gs) => {
        for (let pass = 0; pass < 4; pass++) {
          let changed = false;
          for (const w of navWords) {
            const lo = w.x0 - 4, hi = w.x1 + 4, under = [];
            for (let j = 0; j < n; j++) if (Math.min(edges[j + 1], hi) - Math.max(edges[j], lo) > 0) under.push(j);
            if (under.length < 2) continue;
            const whole = under.every((j) => {
              const s = edges[j], e = edges[j + 1], p0 = Math.max(lo, s), p1 = Math.min(hi, e);
              return far[j] ? e - gs[j] <= p0 : s + gs[j] >= p1;
            });
            if (whole) continue;
            for (const j of under) {
              const s = edges[j], e = edges[j + 1];
              const cap = clamp(Math.floor(far[j] ? e - hi : lo - s), 0, e - s);
              if (gs[j] > cap) { gs[j] = snaps[j][cap] > cap ? 0 : snaps[j][cap]; changed = true; }
            }
          }
          if (!changed) break;
        }
      };

      const render = () => {
        if (!W || !H) return;
        let clip, mask = null, whole = false;
        if (dots) {
          const r = Math.round(dot.r * 10) / 10;
          if (r <= 0) { clip = 'inset(100% 0 0 0)'; cover = coverBar = 0; }
          else if (r >= cell * 0.7072) { clip = 'none'; cover = coverBar = 1; whole = true; }
          else if (r < cell / 2 || !plates.length) {
            // the dot screen, with the plates (title band, nav strip) kept on solid A until the dots touch
            const open = []; let y0 = 0;
            for (const [p0, p1] of plates) { if (p0 > y0) open.push([y0, p0]); y0 = Math.max(y0, p1); }
            if (y0 < H) open.push([y0, H]);
            clip = plates.length ? polyY(open) : 'none';
            mask = [tile(cell, r), `${cell}px ${cell}px`, 'repeat', '50% 50%'];
            cover = coverBar = plates.length ? 0 : dotCover(r / cell);
          } else {
            // the dots touch: the plates flip to B in one step, the screen closes around them
            clip = 'none';
            mask = [tile(cell, r) + ',' + plateImg(), `${cell}px ${cell}px,100% 100%`, 'repeat,no-repeat', '50% 50%,0 0'];
            cover = coverBar = 1;
          }
        } else {
          const L = blinds ? W : H, gs = new Array(n);
          for (let j = 0; j < n; j++) {
            const len = edges[j + 1] - edges[j], v = grown(j);
            // stepped: a slat shows the size of its current step, or of the last step the guards allow; a
            // slat tied to a title line (or the nav) prints whole, on the step where its unit is `flip` grown.
            // Bands keep one beat: a band that can only print whole (the line's band, a title line's band, a
            // band the title fills) prints the moment its slot comes, a free band starts growing then
            gs[j] = bands && (j === lineK || tied[j] >= 0 || whole1[j])
              ? (v > 0 ? len : 0)
              : tied[j] >= 0
                ? ((st ? Math.round(v * st) / st : v) >= flip - 1e-6 ? len : 0)
                : stJ[j]
                  ? ladders[j][Math.round(v * stJ[j])]
                  : snaps[j][clamp(Math.round(v * len), 0, len)];
          }
          if (blinds && navWords.length) holdWords(gs);
          const runs = [];
          for (let j = 0; j < n; j++) {
            const s = edges[j], e = edges[j + 1], g = gs[j];
            if (g > 0) runs.push(far[j] ? [e - g, e] : [s, s + g]);
          }
          runs.sort((p, q) => p[0] - q[0]);
          let m = [];  // touching or overlapping runs merge, so a finished neighbour leaves no seam
          for (const r of runs) { const t = m[m.length - 1]; if (t && r[0] <= t[1]) t[1] = Math.max(t[1], r[1]); else m.push(r.slice()); }
          if (near) m = tidy(m);
          if (!m.length) clip = blinds ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)';
          else if (m.length === 1 && m[0][0] <= 0 && m[0][1] >= L) { clip = 'none'; whole = true; }
          else clip = blinds ? polyX(m) : polyY(m);
          if (navEl) {
            if (blinds) {
              cover = coverBar = covering(m, 0, W);
              for (const w of navWords) w.on = covering(m, w.x0, w.x1) >= 0.5;
            } else { cover = navTxt ? covering(m, navTxt[0], navTxt[1]) : 0; coverBar = covering(m, 0, navBar); }
          }
        }
        if (clip !== lastClip) { b.style.setProperty('--rc-clip', clip); lastClip = clip; }
        const mk = mask ? mask.join('|') : '';
        if (mk !== lastMask) {
          lastMask = mk;
          const names = ['--rc-mask', '--rc-mask-size', '--rc-mask-repeat', '--rc-mask-pos'];
          names.forEach((p, i) => (mask ? b.style.setProperty(p, mask[i]) : b.style.removeProperty(p)));
        }
        if (fold) {
          const cut = foldY < H ? Math.round(lift.f * (H + PAD - foldY)) : 0;
          const lc = cut > 0 ? `inset(0 0 ${cut}px 0)` : '';
          if (lc !== lastLift) { bMedia.style.clipPath = lc; lastLift = lc; }
        }
        if (line && bands) {
          const o = lineFade ? Math.round((1 - lineOut.o) * 100) / 100 : 1;
          if (o !== lastLineO) { line.style.opacity = o < 1 ? String(o) : ''; lastLineO = o; }
        }
        if (whole !== covered) { covered = whole; root.toggleAttribute('data-rc-covered', whole); }  // A rests unpainted under a whole B
        applyNav();
      };

      // around the title (0.6em above its letters to 0.6em below them) no strip of either ink may be thinner
      // than minT: a thin one takes the ink of its neighbours, so a slat closes early (or opens late) there
      // instead of laying an underline or an overline along the words. Flipping a strip only merges it with
      // a neighbour, so it can never make another strip thinner.
      const tidy = (m) => {
        const [z0, z1, min] = near;
        for (let pass = 0; pass < 8; pass++) {
          const pcs = []; let y = 0;
          for (const [a0, a1] of m) { if (a0 > y) pcs.push([y, a0, 0]); pcs.push([a0, a1, 1]); y = a1; }
          if (y < H) pcs.push([y, H, 0]);
          if (pcs.length < 2) return m;
          const thin = pcs.find(([p0, p1]) => p1 - p0 < min && p1 > z0 && p0 < z1);
          if (!thin) return m;
          thin[2] ^= 1;
          m = [];
          for (const [p0, p1, isB] of pcs) if (isB) { const t = m[m.length - 1]; if (t && t[1] >= p0) t[1] = p1; else m.push([p0, p1]); }
        }
        return m;
      };

      // the halftone plates as one mask layer the size of the B layer (W x H + 2 PAD)
      let plateKey = '', plateUrl = '';
      const plateImg = () => {
        const k = W + 'x' + H + ':' + plates.join(';');
        if (k !== plateKey) {
          plateKey = k;
          plateUrl = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H + 2 * PAD}' viewBox='0 0 ${W} ${H + 2 * PAD}' preserveAspectRatio='none'>` +
            plates.map(([p0, p1]) => `<rect x='-2' y='${p0 + PAD}' width='${W + 4}' height='${p1 - p0}'/>`).join('') + '</svg>');
        }
        return plateUrl;
      };

      // the foot of a B picture at rest: just below the deck (or the title), leaving a band of --b-ground
      const foldAt = () => {
        if (!fold || !H) return H;
        const sr = stage.getBoundingClientRect();
        let low = 0;
        if (titleB) low = titleB.getBoundingClientRect().bottom - sr.top + 0.14 * px(titleB);
        if (deck && deck.offsetParent) low = Math.max(low, deck.offsetParent.getBoundingClientRect().top - sr.top + deck.offsetTop + deck.offsetHeight);
        // the picture keeps 4/5 of the stage when the deck allows, and ends 20px or more under the deck;
        // the band under it is 48px (or 7% of the stage) or more, so a short screen still gets one
        const y = Math.round(Math.max(low + Math.max(20, 0.03 * H), H * 0.8));
        return y > H - Math.max(48, 0.07 * H) ? H : y;   // no room for a band at all: the picture stays full-bleed
      };

      // the bands line sits inside one band, clear of the title, the deck and the nav; that band prints whole.
      // When only the deck is in the way (a short screen), the line takes the band and fades out before the
      // deck arrives, so the two never show together
      const placeLine = (sr) => {
        lineK = -1; lineFade = false;
        if (!(bands && line) || phone) return null;
        const busy = [];
        if (titleB) { const r = titleB.getBoundingClientRect(), f = px(titleB); busy.push([r.top - sr.top - 0.1 * f, r.bottom - sr.top + 0.2 * f]); }
        if (navEl) busy.push([0, navBar]);
        const tTop = busy.length ? busy[0][0] : H / 2;
        const pick = (zones) => {
          const free = (k) => zones.every(([p, q]) => q <= edges[k] || p >= edges[k + 1]);
          for (let j = n - 1; j >= 0; j--) if (edges[j + 1] <= tTop && free(j)) return j;      // nearest band above the title
          for (let j = 0; j < n; j++) if (edges[j] >= tTop && free(j)) return j;              // else the first free band below
          return -1;
        };
        let k = -1;
        if (deck && deck.offsetParent) {
          const t = deck.offsetParent.getBoundingClientRect().top - sr.top + deck.offsetTop;
          k = pick([...busy, [t, t + deck.offsetHeight]]);
        }
        if (k < 0) { k = pick(busy); lineFade = k >= 0 && !!deck; }
        if (k < 0) { root.dataset.rcLine = 'off'; return null; }
        delete root.dataset.rcLine;
        lineK = k;
        const top = edges[k], h = edges[k + 1] - edges[k], f = Math.round(Math.min(0.09 * W, 0.7 * h));
        root.style.setProperty('--rc-line-top', top + 'px');
        root.style.setProperty('--rc-line-h', h + 'px');
        root.style.setProperty('--rc-line-size', f + 'px');
        return [top, top + h, Infinity];  // its band prints in one step: no edge ever crosses the line
      };

      // for each slat, the sizes it may show. snaps: the nearest grown size that leaves no thin strip (a slat
      // shows B only from `sliver` px and shuts once less than `sliver` of A is left; inside a guarded run of
      // rows, the title, both inks keep at least `min` px; across the nav's words no edge ever stops). ladders
      // (stepped slats): the size at each of its own steps, or the last allowed step under it
      const buildSnaps = () => {
        snaps = []; ladders = []; whole1 = new Uint8Array(n);
        for (let j = 0; j < n; j++) {
          const s = edges[j], e = edges[j + 1], len = e - s, fj = far[j];
          const ok = new Uint8Array(len + 1);
          for (let g = 0; g <= len; g++) {
            if ((g > 0 && g < sliver) || (len - g > 0 && len - g < sliver)) continue;
            const b0 = fj ? e - g : s, b1 = fj ? e : s + g, a0 = fj ? s : s + g, a1 = fj ? e - g : e;
            let good = true;
            for (const [lo, hi, min] of guards) {
              const bt = Math.min(b1, hi) - Math.max(b0, lo), at = Math.min(a1, hi) - Math.max(a0, lo);
              if (bt > 0 && at > 0 && (bt < min || at < min)) { good = false; break; }
            }
            if (good) ok[g] = 1;
          }
          ok[0] = ok[len] = 1;
          whole1[j] = ok.indexOf(1, 1) === len ? 1 : 0;   // no size between empty and full is allowed
          const snap = new Int16Array(len + 1);
          for (let g = 0; g <= len; g++) { let d = 0; for (;;) { if (g - d >= 0 && ok[g - d]) { snap[g] = g - d; break; } if (g + d <= len && ok[g + d]) { snap[g] = g + d; break; } d++; } }
          const sj = stJ[j] || 0, lad = new Int16Array(sj + 1);
          for (let k = 1; k <= sj; k++) { const size = k === sj ? len : Math.round((k * len) / sj); lad[k] = ok[size] ? size : lad[k - 1]; }
          snaps.push(snap); ladders.push(lad);
        }
      };

      // the rows the title's letters actually cover: from the ascenders of its first line to the baseline
      // (or the descenders) of its last line, found with two zero-size baseline markers
      const inkRows = (el, sr) => {
        const f = px(el), mark = () => { const s = document.createElement('span'); s.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; return s; };
        const m0 = mark(), m1 = mark();
        el.prepend(m0); el.append(m1);
        const b0 = m0.getBoundingClientRect().bottom, b1 = m1.getBoundingClientRect().bottom;
        m0.remove(); m1.remove();
        let lastTop = -Infinity, last = '', lines = 0;
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rg = document.createRange();
        for (let t = tw.nextNode(); t; t = tw.nextNode()) {
          for (const w of t.nodeValue.matchAll(/\S+/g)) {
            rg.setStart(t, w.index); rg.setEnd(t, w.index + w[0].length);
            const q = rg.getBoundingClientRect();
            if (!q.height) continue;
            if (q.top > lastTop + 1) { lastTop = q.top; last = w[0]; lines++; } else last += w[0];
          }
        }
        const desc = /[gjpqyQ,;]/.test(last);
        // every line's baseline (the lines share one line-height, so they sit at an even pitch)
        const bases = Array.from({ length: Math.max(1, lines) }, (_, k) => b0 - sr.top + (lines > 1 ? (k * (b1 - b0)) / (lines - 1) : 0));
        return [b0 - sr.top - 0.8 * f, b1 - sr.top + (desc ? 0.24 : 0.02) * f, bases];
      };

      const measure = () => {
        fitTitle();
        const sr = stage.getBoundingClientRect();
        W = Math.round(sr.width); H = Math.round(sr.height);
        if (!W || !H) return;
        const L = blinds ? W : H;
        // the nav sits over the stage while it is held: its strip and the rows of its words, in viewport pixels
        navBar = navEl ? clamp(Math.round(navEl.getBoundingClientRect().bottom), 1, H) : 0;
        navTxt = null; navWords = [];
        if (navEl) {
          const rg = document.createRange(); rg.selectNodeContents(navEl);
          let t0 = Infinity, t1 = -Infinity;
          for (const q of rg.getClientRects()) if (q.width > 0 && q.height > 0) { t0 = Math.min(t0, q.top); t1 = Math.max(t1, q.bottom); }
          if (t0 < t1) navTxt = [Math.max(0, Math.floor(t0)), Math.min(H, Math.ceil(t1))];
          if (blinds) {
            // each element that holds some of the nav's words, with the columns its words cover
            const byEl = new Map(), tw = document.createTreeWalker(navEl, NodeFilter.SHOW_TEXT);
            for (let t = tw.nextNode(); t; t = tw.nextNode()) {
              if (!t.nodeValue.trim() || !t.parentElement) continue;
              rg.selectNodeContents(t);
              for (const q of rg.getClientRects()) {
                if (!(q.width > 0 && q.height > 0)) continue;
                let w = byEl.get(t.parentElement);
                if (!w) byEl.set(t.parentElement, (w = { el: t.parentElement, x0: Infinity, x1: -Infinity, on: false }));
                w.x0 = Math.min(w.x0, q.left - sr.left); w.x1 = Math.max(w.x1, q.right - sr.left);
              }
            }
            navWords = [...byEl.values()];
          }
        }
        // horizontal slats follow the title's lines. The grid slides (the top and bottom slats take up the
        // difference, half a slat at most) to put an edge between each pair of lines where it can; every
        // slat over a line's letters is then tied to that line and changes ink with it, in one step, so a
        // line of the title is only ever in one ink. Lines that share a slat change together. Bands stay
        // even (no slide); with no count asked they take 5 or 6, whichever puts an edge between the lines.
        let phase = 0, ink = null, cores = [], gaps = [], f = 0;
        if (!blinds && !dots && titleB) {
          ink = inkRows(titleB, sr);
          f = px(titleB);
          const asc = 0.76 * f, bases = ink[2];
          cores = bases.map((b, i) => [i === 0 ? ink[0] : b - asc, i === bases.length - 1 ? ink[1] : b + 0.02 * f]);
          gaps = bases.slice(1).map((b, i) => (bases[i] + b - asc) / 2);
        }
        const miss = (cnt, d) => {
          let m = 0;
          for (const gc of gaps) {
            let dmin = Infinity;
            for (let k = 1; k < cnt; k++) dmin = Math.min(dmin, Math.abs(Math.round((k * L) / cnt + d) - gc));
            m += Math.max(0, Math.min(dmin, L / cnt / 2) - 0.05 * f);
          }
          return Math.round(m);
        };
        if (bands) {
          if (autoN) { const want = gaps.length && miss(6, 0) < miss(5, 0) ? 6 : 5; if (want !== n) { n = want; far.length = n; } }
        } else if (!blinds && !dots && n > 1 && gaps.length) {
          const slat = L / n;
          let best = Infinity;
          for (let d = -Math.floor(slat / 2); d <= Math.floor(slat / 2); d++) {
            const cost = miss(n, d) * 1000 + Math.abs(d);
            if (cost < best) { best = cost; phase = d; }
          }
        }
        const slat = n ? L / n : L;
        sliver = clamp(Math.round(0.2 * slat), 3, 40);
        minT = clamp(Math.round(0.3 * slat), 16, 40);
        st = dots ? 0 : Math.min(stepsFor(slat), stCap);
        edges = Array.from({ length: n + 1 }, (_, k) => (k === 0 ? 0 : k === n ? L : Math.round((k * L) / n + phase)));
        stJ = new Int8Array(n);
        for (let j = 0; j < n; j++) stJ[j] = st ? Math.min(stepsFor(edges[j + 1] - edges[j]), stCap) : 0;
        // tie the slats over each line's letters into one unit (lines that share a slat share the unit); the
        // slats under the nav's words too, when an edge between slats would lie across them
        // (the nav's rows reach 8px under its words, for an underline)
        const navZone = navTxt ? [Math.max(0, navTxt[0] - 4), Math.min(H, navTxt[1] + 8)] : null;
        if (navZone && !blinds && !dots) {
          const [lo, hi] = navZone;
          let k = 0;
          for (let j = 0; j < n; j++) if (Math.min(edges[j + 1], hi) - Math.max(edges[j], lo) > 0) k++;
          if (k > 1) cores.push([lo, hi]);
        }
        tied = new Int16Array(n).fill(-1);
        if (cores.length) {
          const par = cores.map((_, i) => i), find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
          const of = new Array(n).fill(-1);
          for (let j = 0; j < n; j++) for (let i = 0; i < cores.length; i++) {
            if (Math.min(edges[j + 1], cores[i][1]) - Math.max(edges[j], cores[i][0]) <= 0) continue;
            if (of[j] < 0) of[j] = i; else par[find(i)] = find(of[j]);
          }
          for (let j = 0; j < n; j++) if (of[j] >= 0) tied[j] = find(of[j]);
        }
        const em = titleB ? px(titleB) : 0;
        near = ink ? [ink[0] - 0.6 * em, ink[1] + 0.6 * em, minT] : null;
        guards = []; plates = [];
        if (titleB) {
          const r = titleB.getBoundingClientRect(), f = px(titleB);
          if (blinds) {
            const rg = document.createRange(); rg.selectNodeContents(titleB);
            let l = Infinity, rr = -Infinity;
            for (const q of rg.getClientRects()) if (q.width > 0) { l = Math.min(l, q.left); rr = Math.max(rr, q.right); }
            if (l < rr) guards.push([Math.floor(l - sr.left - 0.04 * f), Math.ceil(rr - sr.left + 0.04 * f), minT]);
          } else {
            // horizontal slats: no edge ever stops inside the title's rows, so each slat prints its part
            // of the title in one step and the title changes ink in whole bands, never in lines
            const t0 = r.top - sr.top, t1 = r.bottom - sr.top;
            guards.push([Math.floor(t0 - 0.06 * f), Math.ceil(t1 + 0.14 * f), Infinity]);
            if (dots) { const p = clamp(0.2 * f, 16, 40); plates.push([Math.max(0, Math.floor(t0 - p)), Math.min(H, Math.ceil(t1 + 0.1 * f + p))]); }
          }
          // a slat that only grazes the title, or lies almost wholly on it, is taken in whole: no thin strip
          // of it can lie on the title, or hug its edge, next to a neighbour of the other ink
          const gd = guards[guards.length - 1], thr = Math.min(gd ? gd[2] : 0, Math.round(0.3 * slat));
          if (gd) for (let j = 0; j < n; j++) {
            const o = Math.min(edges[j + 1], gd[1]) - Math.max(edges[j], gd[0]), len = edges[j + 1] - edges[j];
            if (o > 0 && (o < thr || len - o < thr)) { gd[0] = Math.min(gd[0], edges[j]); gd[1] = Math.max(gd[1], edges[j + 1]); }
          }
        }
        // no moving edge ever stops inside the nav's words (rows for slats and bands, columns for blinds)
        if (!blinds && navZone) guards.push([navZone[0], navZone[1], Infinity]);
        if (blinds) for (const w of navWords) guards.push([Math.floor(w.x0 - 4), Math.ceil(w.x1 + 4), Infinity]);
        if (dots && navEl) plates.unshift([clamp(Math.floor(navEl.getBoundingClientRect().top), 0, H), navBar]);
        if (plates.length > 1) {  // merge plates that meet
          plates.sort((p, q) => p[0] - q[0]);
          plates = plates.reduce((acc, p) => { const t = acc[acc.length - 1]; if (t && p[0] <= t[1]) t[1] = Math.max(t[1], p[1]); else acc.push(p.slice()); return acc; }, []);
        }
        const lg = placeLine(sr);
        if (lg) guards.push(lg);
        if (!blinds && !dots) sequence(ink ? (ink[0] + ink[1]) / 2 : H / 2);
        foldY = foldAt();
        if (!dots) buildSnaps();
        readInks();
        lastClip = lastMask = lastLift = covered = navState = lastLineO = null;
        render();
      };

      readInks();
      tl.eventCallback('onUpdate', render);
      // re-measure on every refresh (resize, fonts, pictures), never on a phone toolbar; switch the nav
      // while the page is at or past the scene (the next section is on B by contract)
      ScrollTrigger.create({
        trigger: root,
        start: () => 'top ' + (navEl ? Math.round(navEl.offsetHeight / 2) : 0) + 'px',
        end: 'max',
        onRefresh: (self) => { navOn = self.isActive; measure(); },
        onToggle: (self) => { navOn = self.isActive; applyNav(); },
      });
      if (navEl) {
        // past the cut (the pin has released and the stage starts to scroll away): the bar takes the B
        // ground, so the stage's words and the next section never run under the bar's words
        ScrollTrigger.create({
          trigger: root,
          start: 'bottom bottom',
          end: 'max',
          onRefresh: (self) => { navPast = self.isActive; applyNav(); },
          onToggle: (self) => { navPast = self.isActive; applyNav(); },
        });
      }
      measure();
      // a late font or a reflow changes the title's box: re-measure the guarded rows
      if (titleB && window.ResizeObserver) {
        const ro = new ResizeObserver(() => { if (root.__rcBuild !== buildId || !root.classList.contains('is-live')) return ro.disconnect(); measure(); });
        ro.observe(titleB);
      }

      // when the scene leaves its live state (reduced motion switched on, a phone set to 'rest', a
      // rebuild at another size), hand the nav back to the page and drop the inline fold
      if (window.MutationObserver) {
        const mo = new MutationObserver(() => {
          if (root.__rcBuild !== buildId) return mo.disconnect();
          if (root.classList.contains('is-live')) return;
          navOn = false; navPast = false; applyNav();
          if (bMedia) bMedia.style.clipPath = '';
          mo.disconnect();
          refit();
        });
        mo.observe(root, { attributes: true, attributeFilter: ['class'] });
      }
    };

    return Stage.scene(root, {
      hold,
      scrub,
      build,
      phone: opts.phone === 'rest' ? 'rest' : { hold: phoneHold, build },
      rest: fitTitle,
    });
  };
})();
