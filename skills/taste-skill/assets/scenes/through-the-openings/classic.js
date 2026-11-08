// assets/scenes/through-the-openings/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / through-the-openings.js — the camera rushes through a run of openings into a place.
//
// Five to eight full-screen sheets of the page's own ground, each with one opening cut into it (an arch, a
// doorway or a pointed arch: one shape family per page), stand one behind the other along the camera's
// axis, at uneven depths. They alternate the ground and a slightly deeper tone of it. The visitor starts
// already in the nearest doorway: its jambs stand outside the screen and only its head frames the top,
// with one line in display type on the band above it. Through it two more openings show, and through the
// innermost the next section's photograph is already there. The deeper sheets wait hidden behind those
// (their openings are larger on the screen than the one in front of them) and come out one by one as the
// nearer openings outgrow them, so only two or three arches are ever on the screen: never a target of
// rings. The openings stand on one floor, so the inner ones step up and in towards the vanishing point.
// The scrubbed scroll carries the camera through them in true perspective: it eases in while the line
// is read (the line grows with its sheet and leaves with it), then accelerates, so the arches pass faster
// and faster through the middle of the hold and the last one sweeps past the edges in a short burst; by
// about 65% the photograph is the whole page. The photograph is far beyond the sheets: it fills the page
// behind them from the first frame and only comes a little nearer, then keeps coming while the section's
// headline sets in on it in the same display size as the line, so no step of the hold is still.
//
// Needs gsap + ScrollTrigger, stage.js and through-the-openings.css. Use it as the hand-over into a
// section that opens on one photograph of a place (a courtyard, a hall, a valley, a room), on a page
// whose ground is one flat colour. The openings are written as clip-path: path() in screen pixels on
// every frame, so their edges stay sharp at any size; nothing is blurred, faded into fog or smeared.
//
// DOM (the CSS file draws the finished composition from the same markup):
//   <section class="scene tto" data-scene="through-the-openings" data-options='{}' aria-labelledby="tto-title">
//     <div class="scene-stage tto-stage">
//       <div class="tto-sheet">                                  the nearest sheet (var(--ground)); the script
//         <p class="tto-line">3-7 words</p>                      clones it, empty, for the sheets behind it
//       </div>                                                   optional line: one short statement in display
//                                                                type on the nearest sheet, above its opening
//       <div class="tto-view">                                   the next section's first screen
//         <div class="tto-world">
//           <picture>
//             <source media="(max-width: 767px)" srcset="portrait 9:16 crop, 1080 wide" width height>
//             <img class="tto-media" src srcset sizes="150vw" alt="what the place is" width height>
//           </picture>
//         </div>
//         <h2 class="tto-title" id="tto-title">
//           <span class="tto-title-line"><span>Line one</span></span>
//           <span class="tto-title-line"><span>line two</span></span>
//         </h2>                                                  2-6 words on one or two lines
//       </div>
//     </div>
//   </section>
// While live the script adds the deeper sheets (.tto-sheet.tto-sheet--made) after the first. The line
// rides its sheet and fades on a 0.3 s clock as it reaches the top edge (sooner if a fast scroll brings
// it there), so it is whole whenever it is on the screen and never cut by an edge. The title lands on a
// clock (0.7 s, line by line out of its own mask) once the last opening has passed the edges, and drops
// back when the reader scrolls back above that point: it is never half set wherever the scroll stops, and
// no edge ever crosses it.
//
// Options (data-options JSON; defaults, ranges):
//   hold         1.5     1-1.5     screens the stage is held on wide screens
//   phoneHold    1.2     0.9-1.5   screens on a phone (under 768px)
//   layers       6       5-8       sheets on wide screens (fewer than five and the rush does not read)
//   phoneLayers  4       3-6       sheets on a phone: fewer, so the openings are large
//   shape        "arch"  "arch" (round-headed) | "door" (square-headed) | "lancet" (pointed); take it from
//                                  the place the photograph shows (the arches of its arcade, its doors)
//   width        1.1     1-1.4     width of the nearest opening as a share of the screen's width: above 1
//                                  its jambs stand outside the screen, so the visitor starts in the doorway
//   phoneWidth   1.12    1-1.4     the same on narrow screens (phones, portrait tablets)
//   crown        0.27    0.12-0.4  height of the nearest opening's crown as a share of the screen's height
//                                  (the line stands in the band above it: keep room for display type)
//   phoneCrown   0.25    0.12-0.4
//   legs         0.5     0-3       length of the openings' straight sides, as a share of their width
//   phoneLegs    1.6     0-3       (tall openings on a narrow screen)
//   vp           0.6     0.4-0.7   height of the vanishing point, as a share of the screen's height
//   phoneVp      0.55    0.4-0.7
//   near         0.64    0.4-0.85  size of the second opening against the nearest at the first frame
//   far          0.42    0.25-0.7  size of the third (the first window onto the photograph); keep it
//   phoneNear    0.7               well under `near`, or the two read as a ring
//   phoneFar     0.5
//   arrive       0.65    0.5-0.8   share of the hold at which the last opening has swept past the edges
//   rush         2       1.4-3     how hard the camera accelerates (the power of its ease-in)
//   grow         0.14    0.06-0.2  how much nearer the photograph comes over the hold (a third of it on
//                                  the way in, the rest after it fills the page, so the end is never still)
//   scrub        0.5 | true        seconds of catch-up; true (locked) is used when Lenis is smoothing
//   phone        "same"            "same" | "rest" (the phone gets the finished composition)
//
// Colours: the sheets alternate var(--ground) (the nearest) and --tto-deep (set it on the section; by
// default the ground mixed with 8% of the ink). No third colour, no shadow, no gradient. The line is
// var(--ink). The title stands on the photograph in --tto-title-ink (default var(--ink)): place it over a
// calm, light part of the picture (a sky, a pale wall) with --tto-title-top, or give it the ground's
// colour over a dark part. --tto-focus sets the photograph's focal point (object-position). The line and
// the title share one display size, --tto-display (default clamp(44px, 6.6vw, 116px)).
//
// Pictures: one photograph of the place, landscape about 3:2 or 16:10 and 2400px wide or more, with a
// 9:16 crop of 1080px for phones; full colour, with something to see at its centre (the window shows
// the middle of it first) and a calm area for the headline.
//
// Reduced motion and no script: the section is the finished composition, the line on the ground over
// the photograph, the photograph one screen high with its headline. With reduced motion (and a browser
// with scroll-driven animations) one sheet with one opening stands over the photograph and crossfades
// away while the photograph scrolls in: a short crossfade, no movement.
(() => {
  const ID = 'through-the-openings';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && isFinite(n) ? clamp(n, a, b) : d; };
  const int = (v, d, a, b) => Math.round(num(v, d, a, b));
  const px = (n) => Math.round(n * 100) / 100 + 'px';
  const r1 = (n) => Math.round(n * 10) / 10;
  const EDGE = 4;   // px the sheets reach past the stage on every side, so no photo edge shows at a seam
  const NARROW = '(max-width: 767px), (max-aspect-ratio: 11/10)';
  const SHAPES = ['arch', 'door', 'lancet'];
  const ROOT3 = Math.sqrt(3);

  // One opening, in px at scale 1 and relative to the vanishing point (y down): half-width hw, crown up
  // above it, sill g below it. Every shape here is convex, so a rectangle lies inside when its corners do.
  const headOf = (G) => (G.shape === 'arch' ? G.hw : G.shape === 'lancet' ? ROOT3 * G.hw : 0);
  const inside = (G, x, y) => {
    const { hw, up, g, shape } = G;
    if (Math.abs(x) > hw || y > g || y < -up) return false;
    if (shape === 'door') return true;
    const ys = -up + headOf(G);
    if (y >= ys) return true;
    if (shape === 'arch') return x * x + (y - ys) ** 2 <= hw * hw;
    return (x + hw) ** 2 + (y - ys) ** 2 <= 4 * hw * hw && (x - hw) ** 2 + (y - ys) ** 2 <= 4 * hw * hw;
  };
  // the scale at which the opening holds the whole stage (plus EDGE): the sheet has passed the screen
  const coverOf = (G, W, H, vx, vy) => {
    const pts = [[-EDGE - vx, -EDGE - vy], [W + EDGE - vx, -EDGE - vy], [-EDGE - vx, H + EDGE - vy], [W + EDGE - vx, H + EDGE - vy]];
    const ok = (s) => pts.every(([x, y]) => inside(G, x / s, y / s));
    let lo = 0.01, hi = 1;
    while (!ok(hi) && hi < 1e4) { lo = hi; hi *= 2; }
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
    return hi;
  };
  // the opening as a path in stage px, at scale s about the vanishing point (vx, vy)
  const holeOf = (G, s, vx, vy) => {
    const X = (x) => r1(vx + s * x), Y = (y) => r1(vy + s * y);
    const { hw, up, g, shape } = G;
    if (shape === 'door') return `M${X(-hw)} ${Y(g)}L${X(-hw)} ${Y(-up)}L${X(hw)} ${Y(-up)}L${X(hw)} ${Y(g)}Z`;
    const ys = -up + headOf(G);
    if (shape === 'arch') { const r = r1(s * hw); return `M${X(-hw)} ${Y(g)}L${X(-hw)} ${Y(ys)}A${r} ${r} 0 0 1 ${X(hw)} ${Y(ys)}L${X(hw)} ${Y(g)}Z`; }
    const r = r1(2 * s * hw);
    return `M${X(-hw)} ${Y(g)}L${X(-hw)} ${Y(ys)}A${r} ${r} 0 0 1 ${X(0)} ${Y(-up)}A${r} ${r} 0 0 1 ${X(hw)} ${Y(ys)}L${X(hw)} ${Y(g)}Z`;
  };
  const sheetClip = (W, H, hole) => `path(evenodd, "M${-EDGE} ${-EDGE}H${W + EDGE}V${H + EDGE}H${-EDGE}Z${hole}")`;

  // the nearest opening for a box of W x H, from the options of its geometry
  const geometry = (o, narrow, W, H) => {
    const shape = o.shape;
    const vy = (narrow ? o.phoneVp : o.vp) * H;
    let hw = ((narrow ? o.phoneWidth : o.width) * W) / 2;
    const crownY = (narrow ? o.phoneCrown : o.crown) * H;
    const up = Math.max(24, vy - crownY);
    const G = { shape, hw, up, g: 0 };
    // a head taller than the room under the crown would push the springing below the floor: keep it
    if (headOf(G) > up + 0.75 * H) G.hw = hw = (up + 0.75 * H) / (shape === 'lancet' ? ROOT3 : 1);
    const legs = (narrow ? o.phoneLegs : o.legs) * 2 * hw;
    G.g = Math.max(crownY + headOf(G) + legs - vy, 0.12 * H);
    return { G, vx: W / 2, vy, crownY };
  };

  // Where the sheets stand. Camera travel c runs 0 -> 1, and sheet i is drawn at scale k / (z - c) about
  // the vanishing point (true perspective: a sheet rushes as the camera nears it). The run is planned in
  // events of c: sheet i passes the screen at exit[i] (evenly spaced in c; the camera's ease spaces them
  // in time); the first three stand at scales 1, near and far at the start; each deeper sheet i is hidden
  // behind sheet i-1 (larger on the screen) and comes out from behind it at emerge[i], a little after
  // sheet i-3 has left, so two or three openings are on the screen at a time. Solving those gives every
  // sheet its own depth z and size k: the depths come out uneven.
  const plan = (N, cover, near, far) => {
    const exit = Array.from({ length: N }, (_, i) => (i + 0.7) / (N - 0.3));
    const z = [], k = [];
    const start = [1, near, far];
    for (let i = 0; i < N; i++) {
      if (i < 3) {
        z[i] = exit[i] / (1 - start[i] / cover);
        k[i] = start[i] * z[i];
      } else {
        const m = exit[i - 3] + 0.45 * (exit[i - 2] - exit[i - 3]);
        const sigma = k[i - 1] / (z[i - 1] - m);           // the scale of the sheet in front at that moment
        k[i] = (exit[i] - m) / (1 / sigma - 1 / cover);
        z[i] = exit[i] + k[i] / cover;
      }
    }
    return { z, k, exit };
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const o = {
      hold: num(opts.hold, 1.5, 1, 1.5),
      phoneHold: num(opts.phoneHold, 1.2, 0.9, 1.5),
      layers: int(opts.layers, 6, 5, 8),
      phoneLayers: int(opts.phoneLayers, 4, 3, 6),
      shape: SHAPES.includes(opts.shape) ? opts.shape : 'arch',
      width: num(opts.width, 1.1, 1, 1.4),
      phoneWidth: num(opts.phoneWidth, 1.12, 1, 1.4),
      crown: num(opts.crown, 0.27, 0.12, 0.4),
      phoneCrown: num(opts.phoneCrown, 0.25, 0.12, 0.4),
      legs: num(opts.legs, 0.5, 0, 3),
      phoneLegs: num(opts.phoneLegs, 1.6, 0, 3),
      vp: num(opts.vp, 0.6, 0.4, 0.7),
      phoneVp: num(opts.phoneVp, 0.55, 0.4, 0.7),
      near: num(opts.near, 0.64, 0.4, 0.85),
      far: num(opts.far, 0.42, 0.25, 0.7),
      phoneNear: num(opts.phoneNear, 0.7, 0.4, 0.85),
      phoneFar: num(opts.phoneFar, 0.5, 0.25, 0.7),
      arrive: num(opts.arrive, 0.65, 0.5, 0.8),
      rush: num(opts.rush, 2, 1.4, 3),
      grow: num(opts.grow, 0.14, 0.06, 0.2),
      scrub: opts.scrub === true ? true : typeof opts.scrub === 'number' ? clamp(opts.scrub, 0, 2) : null,
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    if (o.far > o.near - 0.12) o.far = o.near - 0.12;
    if (o.phoneFar > o.phoneNear - 0.12) o.phoneFar = o.phoneNear - 0.12;
    const $ = (s) => root.querySelector(s);
    const first = $('.tto-sheet'), line = $('.tto-line'), view = $('.tto-view'), world = $('.tto-world');
    const media = $('.tto-media'), title = $('.tto-title');
    if (!first || !view || !world) { console.warn(`${ID}: needs .tto-sheet, .tto-view and .tto-world`); return null; }
    if (window.ScrollTrigger && window.Stage && Stage.touch) ScrollTrigger.config({ ignoreMobileResize: true });

    function build(tl, ctx) {
      const { stage, phone } = ctx;
      const N = phone ? o.phoneLayers : o.layers;
      const sheets = [first];
      for (let i = 1; i < N; i++) {
        const s = document.createElement('div');
        s.className = 'tto-sheet tto-sheet--made' + (i % 2 ? ' tto-sheet--deep' : '');
        s.setAttribute('aria-hidden', 'true');
        sheets[sheets.length - 1].after(s);
        sheets.push(s);
      }
      sheets.forEach((s, i) => { s.style.zIndex = String(2 + N - i); });
      const lines = title ? [...title.querySelectorAll('.tto-title-line > span')] : [];

      const g = {};          // geometry, re-measured on every refresh
      let dead = false, titleOn = false, titleTw = null;
      const last = new Map();
      const write = (el, prop, v) => { let m = last.get(el); if (!m) last.set(el, (m = {})); if (m[prop] !== v) { m[prop] = v; el.style[prop] = v; } };

      // the line: stepped down until it fits the band above the nearest opening (two rows at most)
      const fitLine = (room) => {
        if (!line) return;
        line.style.removeProperty('font-size');
        let fs = parseFloat(getComputedStyle(line).fontSize) || 40;
        const base = fs;
        const rows = () => { const cs = getComputedStyle(line); const lh = cs.lineHeight === 'normal' ? 1.2 * fs : parseFloat(cs.lineHeight); return line.offsetHeight / lh; };
        for (let i = 0; i < 30 && (line.offsetHeight > room || rows() > 2.4) && fs > base * 0.55; i++) { fs *= 0.95; line.style.fontSize = px(fs); }
      };

      const measure = () => {
        if (dead) return;
        const W = stage.clientWidth || innerWidth, H = stage.clientHeight || innerHeight;
        const narrow = phone || matchMedia(NARROW).matches;
        const { G, vx, vy, crownY } = geometry(o, narrow, W, H);
        const cover = coverOf(G, W, H, vx, vy);
        const P = plan(N, cover, narrow ? o.phoneNear : o.near, narrow ? o.phoneFar : o.far);
        // the two tones as rgb, read through a canvas (the deep tone may be a color-mix())
        const rgbOf = (el) => {
          const cv = document.createElement('canvas'); cv.width = cv.height = 1;
          const x = cv.getContext('2d', { willReadFrequently: true });
          x.fillStyle = getComputedStyle(el).backgroundColor; x.fillRect(0, 0, 1, 1);
          return [...x.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
        for (const s of sheets) s.style.removeProperty('background-color');
        const tones = [rgbOf(sheets[0]), sheets[1] ? rgbOf(sheets[1]) : rgbOf(sheets[0])];
        // a band thinner than this deepens into its tone as it opens (see render)
        const band = narrow ? 28 : 44;
        Object.assign(g, { W, H, vx, vy, G, cover, P, crownY, narrow, tones, band });
        root.classList.toggle('tto--narrow', narrow);
        world.style.transformOrigin = `${px(vx)} ${px(vy)}`;
        last.clear();
        if (line) {
          fitLine(Math.max(40, crownY - 28));
          const lh = line.offsetHeight;
          line.style.top = px(Math.max(14, crownY / 2 - lh / 2));
          line.style.transformOrigin = `${px(vx - line.offsetLeft)} ${px(vy - line.offsetTop)}`;
          g.lineTop = line.offsetTop;
        }
      };

      // the line leaves on a clock once its sheet has carried it to the top edge
      const lineState = { a: 1 };
      let lineTw = null, lineOn = true;

      const render = () => {
        if (!g.W || dead) return;
        const t = tl.progress();
        const { W, H, vx, vy, G, cover, P } = g;
        const A = o.arrive;
        // camera: an ease-in that keeps accelerating until the last opening has swept past at `arrive`
        const c = t >= A ? 1 : (t / A) ** o.rush;
        // A deeper sheet comes out from behind the one in front of it as a band of zero width. So that it
        // never shows as a thin outline round the window, it comes out in the tone of the sheet in front
        // and deepens into its own tone as its band opens to g.band px.
        let front = -1, frontS = Infinity;
        const unit = Math.min(G.hw, G.up);
        for (let i = 0; i < sheets.length; i++) {
          const d = P.z[i] - c;
          const s = d > 1e-6 ? P.k[i] / d : Infinity;
          const gone = s >= cover || t >= A;
          write(sheets[i], 'visibility', gone ? 'hidden' : '');
          if (gone) continue;
          write(sheets[i], 'clipPath', sheetClip(W, H, holeOf(G, s, vx, vy)));
          let tone = '';
          if (front >= 0 && s < frontS) {
            const f = ((frontS - s) * unit) / g.band;
            if (f < 1) {
              const a = g.tones[front % 2], b = g.tones[i % 2];
              tone = `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(' ')})`;
            }
          }
          write(sheets[i], 'backgroundColor', tone);
          if (s < frontS) { front = i; frontS = s; }
        }
        // the photograph fills the page behind the sheets from the start and lies far beyond them: it
        // comes a little nearer on the way in, then keeps coming while the headline sets in
        const gin = o.grow * 0.3;
        const z = t <= A ? 1 + gin * (t / A) : 1 + gin + (o.grow - gin) * ((t - A) / (1 - A));
        write(world, 'transform', `scale(${z.toFixed(5)})`);
        // the line rides the nearest sheet; it fades on its clock at the top edge (and never is cut by it)
        if (line) {
          const d0 = P.z[0] - c;
          const s0 = d0 > 1e-6 ? P.k[0] / d0 : 1e3;
          const top = vy - (vy - g.lineTop) * s0;
          const on = top >= 30 && t < A;
          if (lineTw && on !== lineOn) { lineOn = on; if (on) lineTw.reverse(); else lineTw.play(); }
          const a = Math.min(lineState.a, clamp((top + 2) / 28, 0, 1));
          write(line, 'transform', s0 > 1.0001 ? `scale(${Math.min(s0, 50).toFixed(5)})` : 'none');
          write(line, 'opacity', a >= 1 ? '' : a.toFixed(3));
          write(line, 'visibility', a <= 0.001 ? 'hidden' : '');
        }
        // the headline lands on a clock once the last opening has passed the edges
        if (titleTw) { const on = t >= A - 0.004; if (on !== titleOn) { titleOn = on; if (on) titleTw.play(); else titleTw.reverse(); } }
      };

      gsap.context(() => {
        measure();
        if (lines.length) {
          gsap.set(lines, { yPercent: 110, autoAlpha: 0 });
          titleTw = gsap.to(lines, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.09, paused: true });
        }
        if (line) lineTw = gsap.to(lineState, { a: 0, duration: 0.3, ease: 'power1.in', paused: true, onUpdate: () => render() });
        tl.to({}, { duration: 1 }, 0);
        tl.eventCallback('onUpdate', render);
        ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onRefresh: () => { measure(); render(); } });
        render();
        const onFonts = () => { measure(); render(); };
        if (document.fonts) document.fonts.addEventListener('loadingdone', onFonts);
        if (media && media.decode) media.decode().catch(() => {});
        return () => {
          dead = true;
          lineState.a = 1; lineOn = true; titleOn = false;
          tl.eventCallback('onUpdate', null);
          if (document.fonts) document.fonts.removeEventListener('loadingdone', onFonts);
          for (const s of sheets) if (s !== first) s.remove();
          for (const p of ['clipPath', 'visibility', 'zIndex', 'backgroundColor']) first.style[p] = '';
          world.style.removeProperty('transform'); world.style.removeProperty('transform-origin');
          if (line) for (const p of ['transform', 'opacity', 'visibility', 'top', 'transformOrigin', 'fontSize']) line.style[p] = '';
          root.classList.remove('tto--narrow');
        };
      });
    }

    // Reduced motion: one sheet with one opening over the photograph, crossfaded away by the scroll itself
    // (a scroll-driven animation in the CSS) while the photograph comes in. Never with no script.
    let veil = null, onResize = null;
    const rest = () => {
      if (!(window.Stage && Stage.reduced) || !(window.CSS && CSS.supports('animation-timeline: view()'))) return;
      if (!veil) { veil = document.createElement('div'); veil.className = 'tto-veil'; veil.setAttribute('aria-hidden', 'true'); view.appendChild(veil); }
      const draw = () => {
        const W = view.clientWidth, H = view.clientHeight;
        if (!W || !H) return;
        const narrow = matchMedia(NARROW).matches;
        const { G, vx, vy } = geometry(o, narrow, W, H);
        veil.style.clipPath = sheetClip(W, H, holeOf(G, narrow ? o.phoneNear : o.near, vx, vy));
      };
      draw();
      if (!onResize) { onResize = () => draw(); addEventListener('resize', onResize); }
    };

    const made = Stage.scene(root, {
      hold: o.hold,
      scrub: o.scrub ?? (Stage.lenis ? true : 0.5),
      build,
      rest,
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build },
    });
    // a wide screen with reduced motion matches neither of the stage's conditions, so its rest() is not
    // called there: set the crossfade up here too (rest() runs once per veil)
    if (Stage.reduced) rest();
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    if (rm.addEventListener) rm.addEventListener('change', () => { if (rm.matches) rest(); });
    return made;
  };
})();
