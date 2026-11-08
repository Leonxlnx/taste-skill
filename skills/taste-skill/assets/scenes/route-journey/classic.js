// assets/scenes/route-journey/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / route-journey.js — "Route journey" (references/scenes.md).
//
// A traveller (a top-down vehicle drawn in SVG, or any cut-out) stays parked at one point of the screen
// while a tilted map slides, turns and leans under it along a route that draws itself in the accent.
// The camera cranes in from a flat, north-up overview of the whole trip to a heading-up chase at 52deg,
// stops at each stop with a slow swing and push-in while a name board swings up beside the road, the
// rail names the stop and a gauge counts a real unit, then cranes back to straight overhead while a wave
// of light sweeps the destination from its centre out, in perspective, and it settles lit.
// Use it when the story really is a trip with 3 to 5 stops (a delivery, a tour, a process told as a
// route); skip it for a plain list. Everything is derived from the scroll position, so scrolling back
// gives exactly the same frame.
//
// THE MAP IS THE PAGE'S. The scene draws no country of its own: the route, the land, the coast and
// water, the relief and the destination all come from the page's markup, in map px. The demo's map (its
// town, lakes, fields, forest and lit farms) and its destination of tiles with a house mark are
// placeholders for a made-up delivery: a page never ships them, nor the demo's route-tiles pattern or
// route-mark. Draw the place the trip really crosses: the sea, fjord or lake where the road runs beside
// it, the mountains it climbs, the town it ends in; and the destination as the subject itself, seen from
// above (a house by the water, a shop front, a quay), never a grid. Without .route-art the scene rides
// a plain ground with only the road on it, which is honest but empty: draw the place.
//
// THE DOM. The finished composition is the source: the live 3D world is built from it at run time and
// removed again when the scene falls back (reduced motion, no script, a failed CDN, phone 'rest').
//
// <section class="scene route" data-scene="route-journey" data-options='{}' aria-labelledby="route-title">
//   <div class="scene-stage">
//     <header class="route-intro"><h2 id="route-title">…</h2><p class="route-lede">…</p></header>
//     <figure class="route-map">
//       <svg class="route-still" viewBox="<the route's box + 120>" data-map="<width> <height>" role="img" aria-label="…">
//         <defs>
//           <path id="route-geo" class="route-geo" d="M …"/>                         the route, in map px
//           <symbol id="route-vehicle" class="route-vehicle" viewBox="0 0 128 240" data-size="64 120">…</symbol>
//                 nose up; drawn at 2x and shown at data-size (map px). Parts classed .rv-beacon take the accent,
//                 .rv-outline a near-black rim (--route-vehicle-rim), so the pale parts never alias at tilt
//           <symbol id="route-dest" class="route-dest" viewBox="0 0 360 300" data-size="360 300">…</symbol>
//                 the destination, drawn north up as seen from above, in map px at data-size (else its
//                 viewBox size), centred plotGap past the route's end along its last heading. Use the map
//                 classes (.rm-house, .rm-water, .rm-forest, .rm-road …) so it takes the page's colours, and
//                 class the parts that light up on arrival .rd-lit (windows, a door, a lamp on the jetty):
//                 they take the accent once lit. Without it, the still's .route-still__plot is the destination.
//         </defs>
//         <g id="route-scene" class="route-scene">          (the class lets the inset's <use> copy take the map colours)
//           <g class="route-art">  The place, in map px. Shapes classed:
//             .rm-land     one sheet under all (optional)
//             .rm-water    sea, fjord, lake, filled; .rm-coast a shoreline stroke along it; .rm-river and
//                          .rm-brook strokes
//             .rm-peak     a <circle> or <ellipse> for each mountain or high moor (cx, cy, r): the scene turns
//                          it into three tiers of relief, low to high, seeded by its place, so the page gives
//                          where the high ground is and the scene draws it in the house style. Or draw the
//                          tiers yourself as .rm-relief-1..3
//             .rm-forest .rm-field-a/b .rm-road .rm-lane .rm-house .rm-light (lit windows), and up to three
//                          <text class="route-word" transform="translate(x y) rotate(r) scale(1 1.6)">
//             <path class="route-road" d="(the route)"/>   the road under the trail; added when missing
//             Reach well beyond the route (see THE ROUTE) and end in organic shapes, never a straight edge.
//             Leave .route-art out and the scene rides a plain ground with only the road (see above).
//           </g>
//           <use href="#route-geo" class="route-still__trail"/>
//           <circle class="route-stop" data-step="2" cx="…" cy="…" r="22"/>   the stops on the map: data-step is
//                 the step's number in the list (1 is the first); stops without a circle are spread evenly
//                 between their neighbours. Circles without data-step are read in order (step 1, 2, …)
//           <g class="route-still__plot"><use href="#route-dest" x y width height/></g>   <use href="#route-vehicle" …/>
//                 (the still's finished state: the destination lit, the traveller parked)
//         </g>
//       </svg>
//       <svg class="route-inset" viewBox="<the destination + 70>" aria-hidden="true"><use href="#route-scene"/></svg>  optional
//     </figure>
//     <aside class="route-rail" aria-label="Stops on the route">
//       <p class="route-gauge"><span class="route-gauge__label">Distance driven</span>
//         <span class="route-gauge__value"><b class="route-gauge__num">410</b> <span class="route-gauge__unit">km</span></span></p>
//       <ol class="route-steps">
//         <li class="route-step" data-value="0"><h3 class="route-step__title">…</h3>
//           <p class="route-step__body">…</p><p class="route-step__value">…</p></li>   3 to 5 of them (up to 12 work)
//       </ol>
//       <div class="route-arrive"><p class="route-arrive__line">…</p><a class="route-arrive__cta" href="…">…</a></div>
//     </aside>
//   </div>
// </section>
//
// THE ROUTE. One path in map px, 3000-4200 long, corner radii 160px or more (300 at the stops), the
// first leg heading up the map (within 30deg) and the last within 45deg, so the crane in and out never
// spins the world. Put the sharp turns at the stops, where the traveller is slow, and keep the legs
// between them straight or gently bent (radius 1000+): the heading-up camera turns with the road. End
// the path `plotGap` px short of where the destination's centre should be. Each step's data-value is
// the gauge reading at that stop, in one real unit. Lay the route over the place as it really runs
// (along the coast, round the head of the fjord, over the pass), at one scale. The drawn map should reach
// well beyond the route's box: the chase looks about 2000 map px ahead and 1500 to the sides, so 2000
// past the destination and the far bends. At night, set --route-light (lit windows, .rm-light) and
// --route-beam (the headlights) on the section.
//
// OPTIONS (data-options, all optional; defaults in brackets)
//   hold        screens held [1.6 + 0.8 x legs: 3 stops 3.2, 4 stops 4.0, 5 stops 4.8, never more than 5], 1-6
//   phoneHold   screens held on a phone [hold x 0.85]
//   phone       'same' [the same scene with phone numbers] | 'rest' (the finished composition)
//   scrub       seconds of catch-up [0.6], 0-1; locked to the bar when Lenis smooths the page
//   heading     'up' [the road ahead always points up the screen] | 'north' (north stays up)
//   tilt        camera tilt in the chase, degrees [52], 0-62; 0 is a flat map chase. Above about 56 the
//               horizon comes on screen and the fog's solid strip grows down over the far field. phoneTilt [46]
//   zoom        chase zoom [1.25], 1-1.5. phoneZoom [0.9]
//   push        push-in at each stop [0.09], 0-0.12. phonePush [0.07]
//   arrive      zoom over the plot [2.0], 1.3-2.4, lowered by itself until the plot clears the rail and
//               the screen edges. phoneArrive [1.0]
//   orbit       degrees the camera swings at each stop [8], 0-12, towards the coming turn
//   smooth      heading smoothing window in map px [320], 160-400; bigger is calmer in bends
//   plotGap     map px from the route's end to the centre of #route-dest [96]
//   unit        gauge rounding: 'auto' [tens from 1000 up, else whole numbers] or a step such as 0.5
//   perspective stage perspective in px [1000 desktop, 900 compact, 760 phone], 600-2400
//   bake        true [the map is painted once into bitmaps before the ride] | false (the browser rasters the
//               vector map as the camera reaches it, which stutters on a first pass)
//   (seed, grid, tile and gap are gone: the scene no longer draws a country or a tile plot)
//
// LAYOUTS. Desktop (1100px and up): the traveller parked at (58vw, 66svh), intro top left, rail bottom
// left. Compact (768-1099px): traveller centred, intro across the top, rail along the bottom. Phone
// (767px and down): the same with phone numbers. The arrival zoom and the anchor height are trimmed on
// every refresh so the parked traveller and the lit plot never sit under a plate.
//
// TIMELINE (fractions of the hold): landing 0.05-0.13, crane in 0.09-0.18 (the traveller glides in a
// straight line from its place in the overview to its anchor by 0.16, ahead of the crane, so it never
// leaves the frame), intro out 0.09-0.14, rail in from 0.14 (on compact and phone layouts only once the
// traveller has risen clear of the plate), legs 0.18-0.78 with 0.08
// dwells between them (each leg's time in proportion to its length, the last 0.02 longer; shorter dwells
// and smaller swings beyond 4 legs), crane out to overhead 0.74-0.88; the destination, dimmed until then,
// lights from its centre out 0.765-0.86 while the camera is still tilted (a ring of the accent runs at the
// front of the light, the .rd-lit parts take the accent); arrival copy 0.89-0.95, rest from 0.96. The
// camera never turns more than 36deg per 0.05 of progress.
// A stop's board swings up from the ground as the traveller nears it and fades as it pulls away.
//
// PERFORMANCE. The map rig is a plain 3D transform over flat layers (only the boards ride a preserve-3d
// rig). Drawn as vector, the map costs the browser a raster of thousands of shapes for every new piece
// of map the camera turns towards, which stutters on a first pass. So once the page is idle the scene
// paints the map itself, in idle slices, into bitmaps (CPU canvases, so the shapes are rastered in those
// slices and not when a bitmap first comes on screen): the ground is cut into cells (40 at most), each
// painted at the sharpest scale the camera's path will ever show it at (worked out from the path itself,
// leaving out what lies under the fog's solid strip, under the rail plate or beyond the art), within a
// pixel budget (18 Mpx, 24 on dense screens, 8 on a phone) that coarsens the far ground first, then the
// middle distance, then the ceiling; and the view over the plot gets a bitmap of its own at the final
// zoom, pixel for pixel. A coarse draft of the whole map is painted first and stands in until the cells
// are in. The ride then only copies pixels. Until the draft is in (or with bake: false) the
// vector map rides. The overview's wide dotted route and the chase's lines are separate layers that
// cross-fade, so neither is redrawn for its width; the drawn trail adds a finished piece every 240 map px
// while the piece being drawn lives in a small layer at the tip; the pin and plot pulses run only while
// the scene rests at its two ends.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const DEG = Math.PI / 180;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, start, dur) => clamp((p - start) / dur, 0, 1);
  const wrap180 = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  const DEFAULTS = {
    phone: 'same', scrub: 0.6, heading: 'up', tilt: 52, phoneTilt: 46, zoom: 1.25, phoneZoom: 0.9,
    push: 0.09, phonePush: 0.07, arrive: 2.0, phoneArrive: 1.0, orbit: 8, smooth: 320, plotGap: 96,
    unit: 'auto', bake: true,
  };

  window.Scenes = window.Scenes || {};
  window.Scenes['route-journey'] = (root, opts = {}) => {
    const o = { ...DEFAULTS, ...opts };
    const stops = root.querySelectorAll('.route-step').length;
    const legs = clamp(stops, 2, 12) - 1;
    const hold = clamp(o.hold ?? Math.min(5, 1.6 + 0.8 * legs), 1, 6);
    const phoneHold = o.phoneHold ?? +(hold * 0.85).toFixed(2);
    const still = root.querySelector('.route-still');
    const geo = still && still.querySelector('.route-geo');
    // without a route or with fewer than two stops there is no trip: show the finished composition
    if (stops < 2 || !geo) {
      console.warn('route-journey: needs svg.route-still with a path.route-geo and two or more .route-step');
      return Stage.scene(root, { hold, build: null });
    }
    // the page's map: its peaks become relief, and the route gets its road (a plain ground without art)
    try { prepareArt(still, geo); } catch (err) { console.warn('route-journey: could not prepare the map', err); }
    const build = (tl, ctx) => buildRoute(tl, ctx, root, o);
    return Stage.scene(root, {
      hold,
      scrub: Stage.lenis ? true : o.scrub,
      phone: o.phone === 'rest' ? 'rest' : { hold: phoneHold, build },
      build,
    });
  };

  // ---------- the page's map, made ready to ride ----------
  // The scene draws no country of its own (THE MAP IS THE PAGE'S). It only turns each .rm-peak the page
  // marked into three tiers of relief, and lays the road along the route when the art has none. Without
  // any .route-art the map is a plain ground with that road on it. Runs once per still.
  function prepareArt(still, geo) {
    if (still.__routeArt) return;
    still.__routeArt = true;
    const d = geo.getAttribute('d') || '';
    let art = still.querySelector('.route-art');
    if (!art) {
      art = svgEl('g', { class: 'route-art', 'data-plain': '' });
      // under everything else in the still: the scene group's first child, or the first thing after <defs>
      const host = still.querySelector('.route-scene') || still;
      host.insertBefore(art, [...host.children].find((c) => c.localName !== 'defs' && c.localName !== 'title' && c.localName !== 'desc') || null);
      console.info('route-journey: the page has no .route-art, so the ride is over a plain ground. Draw the place the route crosses (water, coast, relief) in map px.');
    }
    // peaks: a circle or ellipse each, drawn as three nested tiers of soft relief, low to high. Each is
    // seeded by its own place and size, so the same page always draws the same hills.
    const peaks = [...art.querySelectorAll('circle.rm-peak, ellipse.rm-peak')];
    if (peaks.length) {
      const f = Math.round;
      const closed = (p) => {
        const n = p.length; let s = `M${f(p[0][0])} ${f(p[0][1])}`;
        for (let i = 0; i < n; i++) {
          const q0 = p[(i - 1 + n) % n], q1 = p[i], q2 = p[(i + 1) % n], q3 = p[(i + 2) % n];
          s += `C${f(q1[0] + (q2[0] - q0[0]) / 6)} ${f(q1[1] + (q2[1] - q0[1]) / 6)} ${f(q2[0] - (q3[0] - q1[0]) / 6)} ${f(q2[1] - (q3[1] - q1[1]) / 6)} ${f(q2[0])} ${f(q2[1])}`;
        }
        return s + 'Z';
      };
      const tiers = ['', '', ''];
      for (const pk of peaks) {
        const num = (a) => parseFloat(pk.getAttribute(a)) || 0;
        const cx = num('cx'), cy = num('cy');
        const rx = pk.localName === 'circle' ? num('r') : num('rx'), ry = pk.localName === 'circle' ? num('r') : num('ry');
        if (!(rx > 0 && ry > 0)) continue;
        let st = (Math.imul(f(cx) * 73856093 ^ f(cy) * 19349663, 1) ^ f(rx + ry) * 83492791) >>> 0;
        const rnd = () => { st = (st + 0x6d2b79f5) | 0; let t = Math.imul(st ^ (st >>> 15), 1 | st); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const R = (a, b) => a + rnd() * (b - a);
        const rot = R(-0.6, 0.6), c = Math.cos(rot), s = Math.sin(rot);
        [1, 0.66, 0.36].forEach((m, i) => {
          // each tier a little off the one under it, towards one side, so the hill leans like real ground
          const ox = R(-0.06, 0.06) * rx * i, oy = R(-0.06, 0.06) * ry * i;
          const p = [], b0 = R(0, Math.PI * 2);
          for (let k = 0; k < 10; k++) {
            const a = b0 + (k / 10) * Math.PI * 2, rr = m * (1 + R(-0.24, 0.24));
            const x = Math.cos(a) * rr * rx, y = Math.sin(a) * rr * ry;
            p.push([cx + ox + x * c - y * s, cy + oy + x * s + y * c]);
          }
          tiers[i] += closed(p);
        });
      }
      const g = svgEl('g', { class: 'rm-peaks' });
      tiers.forEach((dd, i) => { if (dd) svgEl('path', { class: 'rm-relief-' + (i + 1), d: dd }, g); });
      peaks[0].parentNode.insertBefore(g, peaks[0]);
      peaks.forEach((pk) => pk.remove());
    }
    // the road the route runs on, above the rest of the map
    if (!art.querySelector('.route-road')) svgEl('path', { class: 'route-road', d }, art);
  }

  // ---------- the map as drawing instructions, for painting it into bitmaps ----------
  // Every visible shape of the live vector map with its resolved colours and its matrix into map px.
  // Returns null when the art holds something this does not paint (a <use>, an image, a gradient), and
  // the scene then keeps the vector map.
  function readArt(svg) {
    const out = [];
    const num = (v) => (v && v.baseVal ? v.baseVal.value : 0);
    const first = (v) => (v && v.baseVal && v.baseVal.numberOfItems ? v.baseVal.getItem(0).value : 0);
    const paint = (v) => (!v || v === 'none' ? null : /url\(/.test(v) ? false : v);
    let ok = true;
    const walk = (node, alpha) => {
      for (const e of node.children) {
        if (!ok) return;
        const tag = e.localName;
        if (tag === 'title' || tag === 'desc' || tag === 'defs' || tag === 'metadata' || tag === 'style') continue;
        const cs = getComputedStyle(e);
        if (cs.display === 'none') continue;
        const a = alpha * (cs.opacity === '' ? 1 : parseFloat(cs.opacity));
        if (tag === 'g' || tag === 'a') { walk(e, a); continue; }
        if (cs.visibility !== 'visible' || !(a > 0)) continue;
        const fill = paint(cs.fill), stroke = paint(cs.stroke);
        if (fill === false || stroke === false) { ok = false; return; }
        const lf = { fill, stroke, fa: a * parseFloat(cs.fillOpacity || '1'), sa: a * parseFloat(cs.strokeOpacity || '1'), rule: cs.fillRule === 'evenodd' ? 'evenodd' : 'nonzero', sw: parseFloat(cs.strokeWidth) || 0, cap: cs.strokeLinecap || 'butt', join: /round|bevel/.test(cs.strokeLinejoin) ? cs.strokeLinejoin : 'miter', ml: parseFloat(cs.strokeMiterlimit) || 4, dash: cs.strokeDasharray && cs.strokeDasharray !== 'none' ? cs.strokeDasharray.split(/[\s,]+/).map(parseFloat).filter((x) => x >= 0) : [], dashOff: parseFloat(cs.strokeDashoffset) || 0 };
        let p = null;
        if (tag === 'path') p = new Path2D(e.getAttribute('d') || '');
        else if (tag === 'rect') { p = new Path2D(); const w = num(e.width), hh = num(e.height), rx = Math.min(num(e.rx) || num(e.ry), w / 2, hh / 2); if (rx > 0 && p.roundRect) p.roundRect(num(e.x), num(e.y), w, hh, rx); else p.rect(num(e.x), num(e.y), w, hh); }
        else if (tag === 'circle') { p = new Path2D(); p.arc(num(e.cx), num(e.cy), num(e.r), 0, Math.PI * 2); }
        else if (tag === 'ellipse') { p = new Path2D(); p.ellipse(num(e.cx), num(e.cy), num(e.rx), num(e.ry), 0, 0, Math.PI * 2); }
        else if (tag === 'line') { p = new Path2D(); p.moveTo(num(e.x1), num(e.y1)); p.lineTo(num(e.x2), num(e.y2)); }
        else if (tag === 'polyline' || tag === 'polygon') { p = new Path2D(); const q = e.points; for (let i = 0; i < q.numberOfItems; i++) { const v = q.getItem(i); if (i) p.lineTo(v.x, v.y); else p.moveTo(v.x, v.y); } if (tag === 'polygon') p.closePath(); }
        else if (tag === 'text') {
          if (!fill) continue;
          const tt = cs.textTransform, raw = e.textContent.replace(/\s+/g, ' ').trim();
          lf.text = tt === 'uppercase' ? raw.toUpperCase() : tt === 'lowercase' ? raw.toLowerCase() : raw;
          lf.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          lf.ls = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
          lf.align = cs.textAnchor === 'middle' ? 'center' : cs.textAnchor === 'end' ? 'end' : 'start';
          lf.base = /central|middle/.test(cs.dominantBaseline) ? 'middle' : /hanging|text-before/.test(cs.dominantBaseline) ? 'hanging' : 'alphabetic';
          lf.x = first(e.x); lf.y = first(e.y); lf.stroke = null;
        } else { ok = false; return; }
        if (p) lf.path = p;
        const m = e.getCTM();
        if (!m) continue;
        lf.m = [m.a, m.b, m.c, m.d, m.e, m.f];
        let bb; try { bb = e.getBBox(); } catch { continue; }
        const pad = (lf.stroke ? lf.sw * (lf.join === 'miter' ? 2 : 0.75) : 0) + 2;
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const [u, v] of [[bb.x - pad, bb.y - pad], [bb.x + bb.width + pad, bb.y - pad], [bb.x - pad, bb.y + bb.height + pad], [bb.x + bb.width + pad, bb.y + bb.height + pad]]) {
          const X = m.a * u + m.c * v + m.e, Y = m.b * u + m.d * v + m.f;
          x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y);
        }
        lf.box = [x0, y0, x1, y1];
        out.push(lf);
      }
    };
    walk(svg, 1);
    return ok ? out : null;
  }
  // paints the shapes that touch map rect `rc` into a canvas whose top left is map (ox, oy), at r px per map px
  function paintArt(cx, leaves, ox, oy, r, rc) {
    for (const lf of leaves) {
      const b = lf.box;
      if (b[2] < rc[0] || b[0] > rc[2] || b[3] < rc[1] || b[1] > rc[3]) continue;
      cx.setTransform(r, 0, 0, r, -ox * r, -oy * r);
      const m = lf.m; cx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      if (lf.text) {
        cx.globalAlpha = lf.fa; cx.fillStyle = lf.fill; cx.font = lf.font; cx.textAlign = lf.align; cx.textBaseline = lf.base;
        if ('letterSpacing' in cx) cx.letterSpacing = lf.ls;
        cx.fillText(lf.text, lf.x, lf.y);
        continue;
      }
      if (lf.fill) { cx.globalAlpha = lf.fa; cx.fillStyle = lf.fill; cx.fill(lf.path, lf.rule); }
      if (lf.stroke && lf.sw > 0) {
        cx.globalAlpha = lf.sa; cx.strokeStyle = lf.stroke; cx.lineWidth = lf.sw; cx.lineCap = lf.cap; cx.lineJoin = lf.join; cx.miterLimit = lf.ml;
        cx.setLineDash(lf.dash); cx.lineDashOffset = lf.dashOff; cx.stroke(lf.path);
      }
    }
  }

  function buildRoute(tl, ctx, root, o) {
    const { stage, phone } = ctx;
    if (root.__routeTeardown) root.__routeTeardown();
    const still = root.querySelector('.route-still');
    const geoSrc = still.querySelector('.route-geo');
    const [W, H] = (still.dataset.map || '2400 1800').split(/[\s,]+/).map(Number);
    const steps = [...root.querySelectorAll('.route-step')];
    const N = steps.length, legs = N - 1;
    const intro = root.querySelector('.route-intro');
    const rail = root.querySelector('.route-rail');
    const list = root.querySelector('.route-steps');
    const arriveLine = root.querySelector('.route-arrive__line');
    const arriveCta = root.querySelector('.route-arrive__cta');
    const gaugeNum = root.querySelector('.route-gauge__num');
    const gaugeFinal = gaugeNum ? gaugeNum.textContent : '';
    const values = steps.map((s, i) => { const v = parseFloat(s.dataset.value); return Number.isFinite(v) ? v : i; });
    const vehicle = root.querySelector('.route-vehicle');
    // The camera's numbers per layout, picked again on every refresh. ax/ay: the anchor the traveller
    // is parked on; ox/oy and fit: the overview; zc/zp/za: chase, push-in and arrival zoom;
    // k: counter-scale numerator for pins and lines; kt: for the traveller (the hero at every zoom).
    // 'compact' (768-1099px: tablets, small laptops) centres the traveller over a rail along the bottom.
    // The overview keeps a margin under the route, so the landing ring at the first stop stays in frame.
    const M = {};
    const compactMQ = window.matchMedia('(min-width: 768px) and (max-width: 1099px)');
    const pickMode = (vw, vh) => {
      if (phone) Object.assign(M, { ax: 0.5, ay: 0.52, persp: 760, tilt: o.phoneTilt, zc: o.phoneZoom, zp: o.phonePush, za: o.phoneArrive, ox: 0.5, oy: 0.63, fitW: vw - 64, fitH: 0.46 * vh, k: 0.9, kt: 0.9, tMax: 2.6, pMax: 2.6, below: true });
      else if (compactMQ.matches) Object.assign(M, { ax: 0.5, ay: 0.5, persp: 900, tilt: o.tilt, zc: o.zoom, zp: o.push, za: o.arrive, ox: 0.5, oy: 0.62, fitW: vw - 96, fitH: 0.46 * vh, k: 1.25, kt: 1.4, tMax: 2.4, pMax: 2.4, below: true });
      else Object.assign(M, { ax: 0.58, ay: 0.66, persp: 1000, tilt: o.tilt, zc: o.zoom, zp: o.push, za: o.arrive, ox: 0.64, oy: 0.5, fitW: 0.56 * vw, fitH: 0.7 * vh, k: 1.25, kt: 1.5, tMax: 2.4, pMax: 2.4, below: false });
      M.tilt = clamp(+M.tilt || 0, 0, 62);
      M.za = clamp(+M.za || 1, 0.3, 2.4);
      if (o.perspective) M.persp = clamp(+o.perspective, 600, 2400) * (phone ? 0.76 : 1);
    };

    // ---------- the live world, built from the finished composition ----------
    const made = [];
    const cam = el('div', 'route-cam'); cam.setAttribute('aria-hidden', 'true');
    const world = el('div', 'route-world', cam);
    world.style.width = W + 'px'; world.style.height = H + 'px';
    const flat = el('div', 'route-flat', world);
    flat.dataset.map = ''; // the map the route crosses: a place, not a drawing (the inspector's scene-drawing skips [data-map])
    const art = root.querySelector('.route-art');
    // the painted map (see PERFORMANCE): cells of bitmaps under the vector map, which is removed once
    // every cell is painted
    const bakeEl = el('div', 'route-bake', flat);
    const ground = svgEl('svg', { class: 'route-ground', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, flat);
    const cloneArt = (into) => { if (!art) return; const c = art.cloneNode(true); c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id')); into.appendChild(c); };
    cloneArt(ground);
    // Until the map is painted, the vector map keeps one raster through the ride (will-change), which
    // leaves it soft once the camera has zoomed in over the plot; so the few hundred map px seen at the end
    // get a copy of their own that rasters at the final zoom. It shows only once the camera is overhead.
    const groundEnd = svgEl('svg', { class: 'route-ground route-ground--end' }, flat);
    cloneArt(groundEnd);
    // the dotted route ahead and the finished pieces of the trail, in their own layer above the map. The
    // overview gets a second dotted route drawn wide (lines at chase width would be hairlines that far
    // out); the two cross-fade as the crane in starts, so neither layer is ever redrawn for its width
    const d = geoSrc.getAttribute('d');
    const wide = svgEl('svg', { class: 'route-lines route-lines--wide', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, flat);
    const wideGhost = svgEl('g', { class: 'route-ghosts' }, wide);
    const lines = svgEl('svg', { class: 'route-lines', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, flat);
    const ghost = svgEl('g', { class: 'route-ghosts' }, lines);
    const measurePath = svgEl('path', { d }, lines);
    if (!cam.parentNode) stage.insertBefore(cam, stage.firstChild);
    made.push(cam);
    // The standing boards ride a second camera with the same transform. Only that rig keeps preserve-3d:
    // a flat plane inside a 3D context makes the browser draw the whole map into an offscreen surface
    // every frame, while a plain 3D transform on a flat rig draws the map straight to the screen.
    const cam3 = el('div', 'route-cam route-cam--posts'); cam3.setAttribute('aria-hidden', 'true');
    const world3 = el('div', 'route-world', cam3);
    world3.style.width = W + 'px'; world3.style.height = H + 'px';
    stage.insertBefore(cam3, cam.nextSibling);
    made.push(cam3);

    // ---------- the route's lookup table (getPointAtLength is slow: never per frame) ----------
    const L = measurePath.getTotalLength();
    const STEP = 4;
    const n = Math.max(2, Math.ceil(L / STEP) + 1);
    const X = new Float32Array(n), Y = new Float32Array(n), HD = new Float32Array(n), HS = new Float32Array(n);
    for (let i = 0; i < n; i++) { const pt = measurePath.getPointAtLength(Math.min(L, i * STEP)); X[i] = pt.x; Y[i] = pt.y; }
    measurePath.remove();
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      let h = (Math.atan2(Y[b] - Y[a], X[b] - X[a]) * 180) / Math.PI;
      if (i > 0) { while (h - HD[i - 1] > 180) h -= 360; while (h - HD[i - 1] < -180) h += 360; }
      HD[i] = h;
    }
    const win = Math.max(1, Math.round(clamp(+o.smooth || 320, 40, 600) / STEP / 2));
    const pre = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + HD[i];
    for (let i = 0; i < n; i++) { const a = Math.max(0, i - win), b = Math.min(n - 1, i + win); HS[i] = (pre[b + 1] - pre[a]) / (b - a + 1); }
    const sample = (s) => {
      const f = clamp(s, 0, L) / STEP; const i = Math.min(n - 2, Math.floor(f)); const t = f - i;
      return { x: lerp(X[i], X[i + 1], t), y: lerp(Y[i], Y[i + 1], t), h: lerp(HD[i], HD[i + 1], t), hs: lerp(HS[i], HS[i + 1], t) };
    };
    const nearestS = (x, y) => { let best = 0, bd = Infinity; for (let i = 0; i < n; i++) { const dd = (X[i] - x) ** 2 + (Y[i] - y) ** 2; if (dd < bd) { bd = dd; best = i; } } return Math.min(L, best * STEP); };

    // The dotted route and the drawn trail, in pieces of the same route: a raster tile then replays only the
    // pieces it touches (one long dashed path is replayed whole by every tile). A finished piece of trail
    // shows in the big line layer (so that layer repaints once per piece, not every frame); the piece being
    // drawn lives in a small SVG of its own that sits on the tip, so a frame only repaints that small layer.
    const CH = 240, chunks = [];
    for (let a = 0; a < L - 0.5; a += CH) {
      const i0 = Math.floor(a / STEP), i1 = Math.min(n - 1, Math.ceil(Math.min(L, a + CH) / STEP));
      let dd = `M${X[i0].toFixed(1)} ${Y[i0].toFixed(1)}`; let len = 0, x0 = X[i0], y0 = Y[i0], x1 = X[i0], y1 = Y[i0];
      for (let i = i0 + 1; i <= i1; i++) {
        dd += `L${X[i].toFixed(1)} ${Y[i].toFixed(1)}`; len += Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]);
        x0 = Math.min(x0, X[i]); x1 = Math.max(x1, X[i]); y0 = Math.min(y0, Y[i]); y1 = Math.max(y1, Y[i]);
      }
      // the dots run on across the pieces: each piece starts its dash pattern where the route has got to
      for (const g of [ghost, wideGhost]) svgEl('path', { class: 'route-ghost', d: dd, style: `stroke-dashoffset:${(i0 * STEP).toFixed(1)}px` }, g);
      const pc = svgEl('path', { class: 'route-trail', d: dd }, lines);
      pc.style.visibility = 'hidden';
      chunks.push({ el: pc, a: i0 * STEP, b: i0 * STEP + len, len, d: dd, box: [x0, y0, x1, y1], done: false });
    }
    const tipPad = 40;
    const tip = svgEl('svg', { class: 'route-tip', 'aria-hidden': 'true' }, flat);
    const tipPath = svgEl('path', { class: 'route-trail' }, tip);
    let tipChunk = -1, tipShown = '';
    const setTip = (k) => {
      tipChunk = k; tipShown = '';
      if (k < 0) { tip.style.visibility = 'hidden'; return; }
      const c = chunks[k], [x0, y0, x1, y1] = c.box;
      const w = x1 - x0 + 2 * tipPad, h = y1 - y0 + 2 * tipPad;
      tip.setAttribute('width', w.toFixed(0)); tip.setAttribute('height', h.toFixed(0));
      tip.setAttribute('viewBox', `${(x0 - tipPad).toFixed(1)} ${(y0 - tipPad).toFixed(1)} ${w.toFixed(0)} ${h.toFixed(0)}`);
      tip.style.transform = `translate3d(${(x0 - tipPad).toFixed(1)}px,${(y0 - tipPad).toFixed(1)}px,0)`;
      tipPath.setAttribute('d', c.d);
      tipPath.style.strokeDasharray = `${c.len.toFixed(1)} ${(c.len + 10).toFixed(1)}`;
      tip.style.visibility = 'visible';
    };
    setTip(-1);

    // stops: each .route-stop circle names its step with data-step (1 is the first; without it the circles
    // count in order); steps without a circle are spread evenly between their neighbours; the first stop
    // is the route's start and the last its end
    const circles = [...still.querySelectorAll('.route-stop')];
    const circleFor = new Map();
    circles.forEach((c, i) => { const k = c.hasAttribute('data-step') ? Math.round(+c.getAttribute('data-step')) - 1 : i; if (k >= 0 && k < N && !circleFor.has(k)) circleFor.set(k, c); });
    const known = steps.map((_, k) => {
      if (k === 0) return 0;
      if (k === N - 1) return L;
      const c = circleFor.get(k);
      return c ? nearestS(+c.getAttribute('cx'), +c.getAttribute('cy')) : null;
    });
    for (let k = 1; k < N - 1; k++) if (known[k] != null && known[k] <= known[k - 1]) known[k] = null; // out of order: spread it
    const stopS = known.slice();
    for (let k = 1; k < N - 1; k++) {
      if (stopS[k] != null) continue;
      let j = k + 1; while (stopS[j] == null) j++;
      const a = stopS[k - 1], b = stopS[j];
      for (let m = k; m < j; m++) stopS[m] = a + ((b - a) * (m - k + 1)) / (j - k + 1);
    }
    for (let k = 1; k < N; k++) stopS[k] = Math.max(stopS[k], stopS[k - 1] + 1);

    // The destination: the page's own drawing. #route-dest (centred plotGap past the route's end, along
    // its last heading), else the still's .route-still__plot, cloned where the page drew it, else none
    // (the end pin stays, and pulses at rest). Two copies of it: the base, dimmed until the light reaches
    // it, and the lit copy (its .rd-lit parts in the accent), which a growing circle reveals from the
    // centre out. While the light runs, only the lit copy's clip and one ring change.
    const end = sample(L);
    let plotC = { x: end.x + Math.cos(end.h * DEG) * (+o.plotGap || 96), y: end.y + Math.sin(end.h * DEG) * (+o.plotGap || 96) };
    const destSym = root.querySelector('symbol#route-dest, symbol.route-dest');
    const stillPlot = still.querySelector('.route-still__plot');
    const dest = el('div', 'route-dest', flat);
    const destBase = svgEl('svg', { class: 'route-dest__base', 'aria-hidden': 'true' }, dest);
    const destLit = svgEl('svg', { class: 'route-dest__lit', 'aria-hidden': 'true' }, dest);
    let box = null; // the drawing's box in map px: [x, y, w, h]
    // A copy of the drawing in each layer. The still sits in display: none while the scene runs, and the
    // browser paints no pattern or gradient from there, so the paint servers the drawing uses are copied
    // into the layer (under ids of their own) and its references pointed at them.
    let destN = 0;
    const copyInto = (s, nodes) => {
      const g = svgEl('g', {}, s);
      for (const n of nodes) g.appendChild(n.cloneNode(true));
      g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      const tag = `--route-${++destN}`, ids = new Map();
      const URL_RE = /url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g;
      for (const n of [g, ...g.querySelectorAll('*')]) for (const a of ['fill', 'stroke', 'style', 'clip-path', 'mask']) {
        const v = n.getAttribute(a);
        if (!v || !v.includes('url(')) continue;
        n.setAttribute(a, v.replace(URL_RE, (m, id) => {
          const src = document.getElementById(id);
          if (!src) return m;
          if (!ids.has(id)) {
            const defs = s.querySelector(':scope > defs') || s.insertBefore(svgEl('defs', {}), s.firstChild);
            const c = defs.appendChild(src.cloneNode(true));
            c.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
            c.id = id + tag;
            ids.set(id, c.id);
          }
          return `url(#${ids.get(id)})`;
        }));
      }
      return g;
    };
    if (destSym) {
      const vb = (destSym.getAttribute('viewBox') || '0 0 320 320').split(/[\s,]+/).map(Number);
      const sz = (destSym.dataset.size || '').split(/[\s,]+/).map(Number);
      const w = sz[0] || vb[2] || 320, h = sz[1] || vb[3] || 320;
      box = [plotC.x - w / 2, plotC.y - h / 2, w, h];
      for (const s of [destBase, destLit]) {
        s.setAttribute('viewBox', vb.join(' '));
        s.setAttribute('preserveAspectRatio', destSym.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
        copyInto(s, destSym.childNodes);
      }
    } else if (stillPlot) {
      for (const s of [destBase, destLit]) copyInto(s, [stillPlot]);
      // where the page drew it, measured on the base copy (with the group's own transform)
      let bb = null; try { bb = destBase.querySelector(':scope > g').getBBox(); } catch {}
      if (bb && bb.width > 0 && bb.height > 0) {
        box = [bb.x, bb.y, bb.width, bb.height];
        plotC = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
        for (const s of [destBase, destLit]) s.setAttribute('viewBox', box.join(' '));
      }
    }
    if (!box) { destBase.remove(); destLit.remove(); }
    const plotSize = box ? Math.max(box[2], box[3]) : 160;
    const gap = Math.hypot(plotC.x - end.x, plotC.y - end.y);
    const dw = box ? box[2] : 0, dh = box ? box[3] : 0;
    dest.style.cssText = `left:${plotC.x - dw / 2}px;top:${plotC.y - dh / 2}px;width:${dw}px;height:${dh}px;--ring:${Math.round(clamp(0.18 * plotSize, 40, 80))}px`;
    // the light's reach: from the centre to the farthest corner
    const destR = Math.hypot(dw, dh) / 2;
    const front = el('i', 'route-dest__front', dest);
    front.style.cssText = `left:${dw / 2 - destR}px;top:${dh / 2 - destR}px;width:${2 * destR}px;height:${2 * destR}px`;
    for (let i = 0; i < 3; i++) el('i', 'route-dest__ring', dest);

    // pins: one per stop; the last sits on the destination's centre
    const pins = steps.map((_, k) => {
      const p = k === N - 1 ? plotC : sample(stopS[k]);
      const pin = el('div', 'route-pin', flat);
      pin.style.left = p.x + 'px'; pin.style.top = p.y + 'px';
      const inner = el('div', 'route-pin__inner', pin);
      for (let i = 0; i < (phone ? 2 : 3); i++) el('i', 'route-pin__ring', inner);
      el('b', 'route-pin__dot', inner);
      return inner;
    });
    pins[N - 1].parentNode.classList.add('route-pin--end');

    // the traveller: its headlights on the road ahead (only where --route-beam is set), the shade it casts
    // while it drops in, the landing ring and the drawn vehicle (a <symbol>, nose up)
    const trav = el('div', 'route-traveller', flat);
    const vb = (vehicle && vehicle.getAttribute('viewBox') || '0 0 64 120').split(/[\s,]+/).map(Number);
    const size = (vehicle && vehicle.dataset.size || '').split(/[\s,]+/).map(Number);
    const TW = size[0] || vb[2] || 64, TH = size[1] || vb[3] || 120;
    trav.style.cssText = `width:${TW}px;height:${TH}px;margin:${-TH / 2}px 0 0 ${-TW / 2}px`;
    // headlights: nested flat pools that step down in strength with distance (no gradient), rounded ahead
    const beam = svgEl('svg', { class: 'route-traveller__beam', viewBox: `0 0 ${TW} ${TH}`, width: TW, height: TH }, trav);
    const bx = TW / 2, ny = TH * 0.03;
    for (const [w0, w1, len] of [[0.36, 1.25, 1.9], [0.34, 0.95, 1.45], [0.32, 0.7, 1.0], [0.3, 0.5, 0.6]]) {
      const x0 = TW * w0, x1 = TW * w1, y1 = ny - TH * len;
      svgEl('path', { d: `M${bx - x0} ${ny}L${bx - x1} ${y1 + x1 * 0.35}Q${bx} ${y1 - x1 * 0.25} ${bx + x1} ${y1 + x1 * 0.35}L${bx + x0} ${ny}Z` }, beam);
    }
    const drop = el('i', 'route-traveller__drop', trav);
    const land = el('i', 'route-traveller__land', trav);
    const body = svgEl('svg', { class: 'route-traveller__body', viewBox: vb.join(' '), width: TW, height: TH }, trav);
    if (vehicle && vehicle.id) svgEl('use', { href: '#' + vehicle.id }, body);
    else svgEl('path', { d: `M${vb[2] / 2} 0 L${vb[2]} ${vb[3]} L${vb[2] / 2} ${vb[3] * 0.78} L0 ${vb[3]}Z`, class: 'route-traveller__chevron' }, body);

    // posts: standing boards for the stops between the first and the last, on the outside of the bend.
    // On short legs (many stops) they stand further out. The plate reaches away from the road (on screen),
    // never over the traveller; a board swings up from the ground as the traveller nears its stop and
    // fades as it pulls away, before the plate could come level with the traveller.
    const postsEl = el('div', 'route-posts', world3);
    const posts = [];
    for (let k = 1; k < N - 1; k++) {
      const a = sample(stopS[k]), b0 = sample(Math.max(0, stopS[k] - 120)), b1 = sample(Math.min(L, stopS[k] + 120));
      const legIn = stopS[k] - stopS[k - 1], legOut = stopS[k + 1] - stopS[k];
      const turn = b1.h - b0.h; // > 0 turns right (clockwise on screen)
      let side = turn > 0 ? -1 : 1; // outside of the bend: +1 is right of the road, -1 left
      let off = 56 + 34 * clamp((900 - Math.min(legIn, legOut)) / 500, 0, 1);
      // north-up: where the road runs across the screen, the board stands on its far (north) side, so its
      // stem rises away from the traveller, and a little further out, since that side is foreshortened
      if (o.heading === 'north') {
        const north = Math.sin(((a.h + 90) * Math.PI) / 180) < 0 ? 1 : -1;
        if (Math.abs(Math.sin(((a.h + 90) * Math.PI) / 180)) > 0.5) side = north;
        off += 50 * Math.abs(Math.sin(((a.h + 90 * side) * Math.PI) / 180));
      }
      const hr = ((a.h + 90 * side) * Math.PI) / 180;
      const post = el('div', 'route-post', postsEl);
      post.style.left = a.x + Math.cos(hr) * off + 'px'; post.style.top = a.y + Math.sin(hr) * off + 'px';
      const inner = el('div', 'route-post__inner', post);
      // heading-up: the road's right is the screen's right; north-up: the screen's right is map east
      const right = o.heading === 'north' ? Math.cos(hr) >= -0.2 : side > 0;
      inner.classList.add(right ? 'route-post__inner--right' : 'route-post__inner--left');
      el('span', 'route-post__stem', inner);
      const tile = el('span', 'route-post__tile', inner);
      const title = steps[k].querySelector('.route-step__title');
      tile.textContent = title ? title.textContent.trim() : '';
      posts.push({ inner, s: stopS[k], lead: Math.min(400, 0.5 * legIn), rise: Math.min(260, 0.35 * legIn), fade: Math.min(70, 0.2 * legOut), shown: null });
    }

    // fog over the far plane: a solid strip of the ground colour, then flat bands that step down (no
    // gradient). It slides down from above the screen as the camera tilts and back up as it straightens.
    const fog = el('div', 'route-fog'); fog.setAttribute('aria-hidden', 'true');
    const fogSolid = el('i', 'route-fog__solid', fog);
    // eighteen even steps of about 5 per cent from the solid strip down, so no step reads as a seam over
    // the forest or a road
    for (let i = 0; i < 18; i++) { const b = el('i', '', fog); b.style.opacity = (1 - (i + 1) / 19).toFixed(3); }
    // the fog lies over the far map but under the boards: a board is near, so it stands in front of the haze
    stage.insertBefore(fog, cam3);
    made.push(fog);

    // the rail: a count line and the leg bars (both decorative; the list itself stays the content)
    const count = el('p', 'route-count'); count.setAttribute('aria-hidden', 'true');
    if (list) list.parentNode.insertBefore(count, list);
    made.push(count);
    const legBar = el('span', 'route-legs'); legBar.setAttribute('aria-hidden', 'true');
    const legFills = [];
    for (let k = 0; k < legs; k++) { const sgm = el('span', 'route-legs__leg', legBar); legFills.push(el('i', '', sgm)); }
    const gauge = root.querySelector('.route-gauge');
    if (gauge) gauge.appendChild(legBar);
    made.push(legBar);
    if (list) list.style.setProperty('--n', N);

    // ---------- timing (fractions of the scene) ----------
    const DWELL = Math.min(0.08, 0.24 / Math.max(1, legs - 1)); // 0.08 up to 4 legs, shorter beyond
    const travel = 0.6 - DWELL * (legs - 1);
    const extra = legs > 1 ? 0.02 : 0;
    // each leg gets travel time in proportion to its length, so the traveller keeps one cruising speed
    // (and the camera one turning rate) however unevenly the stops are spaced; the last leg gets a
    // little more for the braking under the crane out
    const legDur = [], legStart = [], dwellStart = [];
    for (let k = 0; k < legs; k++) legDur.push(((travel - extra) * (stopS[k + 1] - stopS[k])) / L + (k === legs - 1 ? extra : 0));
    let t0 = 0.18;
    for (let k = 0; k < legs; k++) {
      legStart.push(t0); t0 += legDur[k];
      if (k < legs - 1) { dwellStart.push(t0); t0 += DWELL; }
    }
    // at each stop the camera swings the way the road is about to turn, then eases back as the leg
    // starts, so the swing takes some of the turn instead of adding to it (alternates on a straight)
    const orbitSign = dwellStart.map((_, k) => {
      const at = stopS[k + 1], dh = sample(Math.min(L, at + 240)).hs - sample(at).hs;
      return Math.abs(dh) < 4 ? (k % 2 ? -1 : 1) : dh > 0 ? -1 : 1;
    });
    // the swing at each stop shrinks with the dwell when there are many stops (short dwells would whip)
    const orbitDeg = clamp(+o.orbit || 0, 0, 12) * Math.min(1, DWELL / 0.08);
    const E = (name) => gsap.parseEase(name);
    const e = { p2io: E('power2.inOut'), p1io: E('power1.inOut'), sio: E('sine.inOut'), p2i: E('power2.in'), p2o: E('power2.out'), p3o: E('power3.out'), p1o: E('power1.out'), xo: E('expo.out') };
    const unitStep = o.unit === 'auto' || o.unit == null ? (Math.max(...values.map(Math.abs)) >= 1000 ? 10 : 1) : Math.max(0.001, +o.unit);
    const fmt = new Intl.NumberFormat(document.documentElement.lang || undefined, { maximumFractionDigits: unitStep < 1 ? String(unitStep).split('.')[1].length : 0 });
    // the arrival: the light sweeps the destination from its centre out while the camera is still tilted
    const LIGHT0 = 0.765, LIGHT_SPREAD = 0.06, LIGHT_DUR = 0.035;

    // ---------- measuring (on build and on every refresh) ----------
    let vw = 1, vh = 1, z0 = 0.4, bbox = null, fogH = 0, fogSolidH = 0, railAt = 0.14, endRect = null, endPx = null;
    {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < n; i++) { x0 = Math.min(x0, X[i]); x1 = Math.max(x1, X[i]); y0 = Math.min(y0, Y[i]); y1 = Math.max(y1, Y[i]); }
      x0 = Math.min(x0, plotC.x - plotSize / 2); x1 = Math.max(x1, plotC.x + plotSize / 2);
      y0 = Math.min(y0, plotC.y - plotSize / 2); y1 = Math.max(y1, plotC.y + plotSize / 2);
      bbox = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
    }
    const DPR = () => clamp(window.devicePixelRatio || 1, 1, 2);
    const measure = () => {
      vw = stage.clientWidth || innerWidth; vh = stage.clientHeight || innerHeight;
      pickMode(vw, vh);
      z0 = Math.min(M.fitW / bbox.w, M.fitH / bbox.h);
      // the overview keeps the first stop, where the traveller lands, a traveller's size and more from the
      // screen's sides: the route's box slides sideways into its own slack (a phone, where it fills the width)
      {
        const half = (Math.max(TW, TH) / 2) * clamp(M.kt / z0, 1, M.tMax) * z0 + 16;
        const left = M.ox * vw - (bbox.w / 2) * z0, right = M.ox * vw + (bbox.w / 2) * z0;
        const sx = M.ox * vw + (X[0] - bbox.cx) * z0;
        let shift = 0;
        if (sx < half) shift = Math.min(half - sx, Math.max(0, vw - 8 - right));
        else if (sx > vw - half) shift = -Math.min(sx - (vw - half), Math.max(0, left - 8));
        M.ox += shift / vw;
      }
      // keep the parked traveller and the lit plot clear of the rail plate and inside the screen,
      // whatever the window (the plot spans gap + half its size above the anchor, the rest below)
      const plotUp = plotSize / 2 + gap, plotDown = Math.max(plotSize / 2 - gap, TH / 2);
      M.za = Math.min(M.za, (vw - 32) / plotSize);
      if (rail) {
        const top = rail.offsetTop, right = rail.offsetLeft + rail.offsetWidth;
        if (M.below) {
          M.za = Math.min(M.za, (top - 32) / (plotUp + plotDown));
          M.ay = Math.min(M.ay, (top - 16 - plotDown * Math.max(M.za, M.zc)) / vh);
          M.za = Math.max(0.3, Math.min(M.za, (M.ay * vh - 16) / plotUp));
        } else {
          M.za = Math.max(0.3, Math.min(M.za, (M.ax * vw - right - 24) / (plotSize / 2), (vw - M.ax * vw - 24) / (plotSize / 2), (M.ay * vh - 24) / plotUp, (vh - 16 - M.ay * vh) / plotDown));
        }
      }
      // the fog: a solid strip, then the steps. At a steep tilt the horizon comes on screen, and the solid
      // strip reaches down to where the ground shows at a fifth of a screen px per map px, so the far
      // field stays in the haze (and the painted map need not reach out to the horizon)
      fog.style.removeProperty('height'); fogSolid.style.removeProperty('flex-basis');
      const fogBase = fog.offsetHeight || 0.28 * vh;
      const tanT = Math.tan(M.tilt * DEG);
      fogSolidH = 0.24 * fogBase;
      if (tanT > 1e-3) fogSolidH = Math.min(0.4 * vh, Math.max(fogSolidH, M.ay * vh + ((0.2 / M.zc - 1) * M.persp) / tanT + 12));
      fogH = fogSolidH + 0.76 * fogBase;
      fog.style.height = fogH.toFixed(1) + 'px'; fogSolid.style.flexBasis = fogSolidH.toFixed(1) + 'px';
      wide.style.setProperty('--lw', clamp(M.k / z0, 1, 2.6).toFixed(2));
      // the view at rest over the plot, plus a margin: the vector copy for the end, and the painted
      // bitmap of it, placed so its pixels land exactly on the screen's
      const dpr = DPR(), za = M.za, ex = +end.x.toFixed(2), ey = +end.y.toFixed(2);
      const edge = Math.floor(-80 * za * dpr) / dpr; // the bitmap's top left on screen, on a device pixel
      const ex0 = ex + (edge - M.ax * vw) / za, ey0 = ey + (edge - M.ay * vh) / za;
      const pw = Math.ceil((vw + 160 * za) * dpr), ph = Math.ceil((vh + 160 * za) * dpr);
      endRect = [ex0, ey0, ex0 + pw / (za * dpr), ey0 + ph / (za * dpr)];
      endPx = { pw, ph, r: za * dpr };
      const ew = endRect[2] - endRect[0], eh = endRect[3] - endRect[1];
      for (const [k, v] of [['width', ew.toFixed(0)], ['height', eh.toFixed(0)], ['viewBox', `${ex0.toFixed(0)} ${ey0.toFixed(0)} ${ew.toFixed(0)} ${eh.toFixed(0)}`]]) groundEnd.setAttribute(k, v);
      groundEnd.style.transform = `translate3d(${ex0.toFixed(0)}px,${ey0.toFixed(0)}px,0)`;
      stage.style.setProperty('--route-persp', M.persp + 'px');
      stage.style.setProperty('--route-ax', M.ax * 100 + '%');
      stage.style.setProperty('--route-ay', M.ay * 100 + '%');
      // the rail comes in once the intro has gone, and where the overview shows the traveller low on the
      // screen (compact, phone), only once the traveller has risen clear of the plate, so it never fades
      // in over it
      railAt = 0.14;
      if (rail) {
        const rt = rail.offsetTop - 8, rl = rail.offsetLeft - 8, rr = rail.offsetLeft + rail.offsetWidth + 8;
        for (let q = 0.14; q < 0.17; q += 0.0025) {
          const c = camAt(q);
          const X = M.ax * vw + c.sx, Y = M.ay * vh + c.sy;
          const half = (Math.max(TW, TH) / 2) * clamp(M.kt / c.zoom, 1, M.tMax) * c.zoom * (1 + (Math.max(0, c.sy) * Math.tan(c.tilt * DEG)) / M.persp);
          if (Y + half < rt || X + half < rl || X - half > rr) break;
          railAt = q + 0.0025;
        }
      }
    };

    // ---------- the camera at any progress ----------
    // distance along the route at progress q
    const sAt = (q) => {
      let u = 0; for (let k = 0; k < legs; k++) u += e.p1io(seg(q, legStart[k], legDur[k]));
      const kk = Math.min(legs - 1, Math.floor(u));
      return u >= legs ? L : lerp(stopS[kk], stopS[kk + 1], u - kk);
    };
    // The camera's heading is the road's (smoothed) heading averaged over a window of progress with a
    // triangle weight, so a bend the traveller takes at speed is spread over the slower moments around
    // it (the braking, the dwell). The window starts at +-0.06 and widens (to +-0.12 at most) until the
    // camera turns no more than 36deg per 0.05 of progress, whatever the route and the stops. It is a
    // table of progress, built once, so scrolling back gives the same frame.
    const NP = 400, rawH = new Float64Array(NP + 1);
    for (let i = 0; i <= NP; i++) rawH[i] = sample(sAt(i / NP)).hs;
    const smoothH = (w) => {
      const out = new Float64Array(NP + 1), r = Math.max(1, Math.round(w * NP));
      for (let i = 0; i <= NP; i++) {
        let hsum = 0, wsum = 0;
        for (let j = -r; j <= r; j++) { const wt = r + 1 - Math.abs(j); hsum += rawH[clamp(i + j, 0, NP)] * wt; wsum += wt; }
        out[i] = hsum / wsum;
      }
      return out;
    };
    const turnRate = (a) => { let m = 0; const dn = Math.round(0.05 * NP); for (let i = Math.round(0.12 * NP); i + dn <= Math.round(0.82 * NP); i++) for (let j = i + 1; j <= i + dn; j++) m = Math.max(m, Math.abs(a[j] - a[i])); return m; };
    let HP = null;
    for (const w of [0.06, 0.075, 0.09, 0.105, 0.12]) { HP = smoothH(w); if (turnRate(HP) <= 36) break; }
    const headingAt = (p) => { const f = clamp(p, 0, 1) * NP, i = Math.min(NP - 1, Math.floor(f)); return lerp(HP[i], HP[i + 1], f - i); };
    // The crane in moves the traveller, not the map: its place on screen runs in a straight line from
    // where the overview shows it to the anchor (KIN, ahead of the crane), and the camera's centre is
    // solved back through this frame's tilt, turn and zoom so the traveller lands exactly there. (Moving
    // the map's centre on the zoom's own curve would swing the traveller out of frame before it settled.)
    const KIN = 0.07;
    const camAt = (p) => {
      const cin = e.p2io(seg(p, 0.09, 0.09));
      const cout = e.p2io(seg(p, 0.74, 0.14));
      const kin = e.p2io(seg(p, 0.09, KIN));
      const s = sAt(p);
      let orbit = 0, push = 0;
      for (let k = 0; k < dwellStart.length; k++) {
        const a = e.sio(seg(p, dwellStart[k], DWELL)) - e.sio(seg(p, legStart[k + 1], Math.min(0.06, legDur[k + 1])));
        orbit += orbitSign[k] * orbitDeg * a; push += a;
      }
      const P = sample(s);
      const yawMix = o.heading === 'north' ? 0 : cin * (1 - cout);
      const yaw = yawMix > 0 ? wrap180(-(headingAt(p) + 90)) * yawMix + orbit : orbit;
      const tilt = M.tilt * cin * (1 - cout);
      const zoom = lerp(lerp(z0, M.zc, cin) + push * M.zp, M.za, cout);
      let Cx = P.x, Cy = P.y, sx = 0, sy = 0;
      if (kin < 1) {
        // the traveller's offset from the anchor on screen, shrinking to nothing
        const C0x = bbox.cx + ((M.ax - M.ox) * vw) / z0, C0y = bbox.cy + ((M.ay - M.oy) * vh) / z0;
        sx = (P.x - C0x) * z0 * (1 - kin); sy = (P.y - C0y) * z0 * (1 - kin);
        // back through the perspective onto the tilted plane, then the turn and the zoom, into map px
        const t = tilt * DEG, ct = Math.cos(t), st = Math.sin(t), Pp = M.persp;
        const y1 = (sy * Pp) / Math.max(1, Pp * ct + sy * st), x1 = (sx * (Pp - y1 * st)) / Pp;
        const cy = Math.cos(yaw * DEG), syw = Math.sin(yaw * DEG);
        Cx = P.x - (x1 * cy + y1 * syw) / zoom; Cy = P.y - (-x1 * syw + y1 * cy) / zoom;
      }
      return {
        cin, cout, kin, s, P, Cx, Cy, sx, sy, yaw, tilt, zoom,
        fg: e.p2io(seg(p, 0.1, 0.08)) - e.p2io(seg(p, 0.8, 0.08)),
      };
    };

    // ---------- the painted map ----------
    // The ground is cut into square cells (256 to 2048 map px, overlapping by PAD so no seam shows), each
    // painted once at the sharpest scale the camera's path ever shows it at, in device px per map px. The
    // plan comes from the camera itself: for every step of progress the screen (below the fog's solid
    // strip, and beside the rail plate once it is in) is cast onto the map plane, and each 128 px patch
    // under it records how large its centre gets; they merge into cells, each a layer the compositor only
    // moves (40 at most), so the browser copies pixels where it used to draw the vector map, and samples
    // them down smoothly when they are far. The view over the plot gets a bitmap of its own (its own
    // layer), painted at the final zoom and placed so its pixels land on the screen's.
    const CELL = 128, PAD = 6;
    const LEVELS = [0.125, 0.1875, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2];
    const bk = { on: false, leaves: null, cells: new Map(), keys: new Set(), end: null, draftJob: null, draftDone: false, queue: [], timer: 0, dead: false, ready: false };
    const canBake = o.bake !== false && !!art && typeof Path2D === 'function';
    const plan = () => {
      const dpr = DPR(), ax = M.ax * vw, ay = M.ay * vh, Pp = M.persp, ab = bk.artBox;
      const need = new Map();
      // the rail is a solid plate: once it is fully in, the ground under it is never seen
      const rp = rail ? [rail.offsetLeft, rail.offsetTop, rail.offsetLeft + rail.offsetWidth] : null;
      for (let i = 0; i <= 172; i++) {
        const p = (i / 172) * 0.86;
        const c = camAt(p);
        const t = c.tilt * DEG, ct = Math.cos(t), st = Math.sin(t), cyw = Math.cos(c.yaw * DEG), syw = Math.sin(c.yaw * DEG);
        const cut = Math.max(0, fogSolidH - (1 - c.fg) * 1.02 * fogH);
        const top = Math.max(cut, st > 1e-4 ? ay - (Pp * ct) / st + 24 : -Infinity, 0);
        const toPlane = (sx, sy) => { const dx = sx - ax, dy = sy - ay, y1 = (dy * Pp) / (Pp * ct + dy * st), x1 = (dx * (Pp - y1 * st)) / Pp; return [x1, y1]; };
        const toMap = ([x1, y1]) => [c.Cx + (x1 * cyw + y1 * syw) / c.zoom, c.Cy + (-x1 * syw + y1 * cyw) / c.zoom];
        // the screen as one or two rectangles (above the rail, and beside it), each cast onto the map
        const rects = rp && p >= railAt + 0.05 && rp[1] > top + 40 ? [[0, top, vw, rp[1]], [rp[2], rp[1], vw, vh]].filter((q) => q[2] - q[0] > 24) : [[0, top, vw, vh]];
        for (const [sx0, sy0, sx1, sy1] of rects) {
          const yTop = toPlane(0, sy0)[1], yBot = toPlane(0, sy1)[1];
          const poly = [toMap(toPlane(sx0, sy0)), toMap(toPlane(sx1, sy0)), toMap(toPlane(sx1, sy1)), toMap(toPlane(sx0, sy1))];
          let area2 = 0; for (let k = 0; k < 4; k++) { const [x0, y0] = poly[k], [x1, y1] = poly[(k + 1) % 4]; area2 += x0 * y1 - x1 * y0; }
          const sgn = area2 >= 0 ? 1 : -1;
          let mx0 = Infinity, my0 = Infinity, mx1 = -Infinity, my1 = -Infinity;
          for (const [x, y] of poly) { mx0 = Math.min(mx0, x); my0 = Math.min(my0, y); mx1 = Math.max(mx1, x); my1 = Math.max(my1, y); }
          const half = CELL * 0.71;
          for (let gi = Math.floor(mx0 / CELL); gi <= Math.floor(mx1 / CELL); gi++) for (let gj = Math.floor(my0 / CELL); gj <= Math.floor(my1 / CELL); gj++) {
            const qx = (gi + 0.5) * CELL, qy = (gj + 0.5) * CELL;
            let inside = true;
            for (let k = 0; k < 4 && inside; k++) {
              const [x0, y0] = poly[k], [x1, y1] = poly[(k + 1) % 4], ex = x1 - x0, ey = y1 - y0, el2 = Math.hypot(ex, ey) || 1;
              if ((sgn * ((qx - x0) * ey - (qy - y0) * ex)) / el2 > half) inside = false;
            }
            if (!inside) continue;
            const x0 = gi * CELL - PAD, y0 = gj * CELL - PAD, x1 = x0 + CELL + 2 * PAD, y1 = y0 + CELL + 2 * PAD;
            if (x1 < ab[0] || y1 < ab[1] || x0 > ab[2] || y0 > ab[3]) continue; // beyond the art: bare ground
            if (p >= 0.78 && x0 >= endRect[0] && y0 >= endRect[1] && x1 <= endRect[2] && y1 <= endRect[3]) continue; // the end bitmap covers it
            // how large the patch shows: at its centre, or at the screen's edge when the centre is off it
            const hi = clamp(((qx - c.Cx) * syw + (qy - c.Cy) * cyw) * c.zoom, yTop, yBot);
            const mag = (c.zoom * Pp) / Math.max(1, Pp - hi * st);
            const key = gi + ',' + gj, q = need.get(key);
            if (q) q.hi = Math.max(q.hi, mag); else need.set(key, { gi, gj, hi: mag, at: p });
          }
        }
      }
      // The cells, within a budget of pixels. Over budget, the ground only ever seen in the distance
      // (never as large as in the overview, and in the haze) is painted coarser first, then the ceiling
      // comes down step by step, the middle distance (under a screen px per map px) giving a little at
      // each step, so the road ahead and the ground around the traveller stay the sharpest things on
      // screen. Every cell is a layer, so a square is cut into quarters only when that saves more pixels
      // than the extra layers cost (over, each), and that cost rises until the map is 40 layers at most.
      const budget = (phone ? 8 : dpr > 1.25 ? 24 : 18) * 1e6;
      const farAt = z0 * 0.95;
      // [factor for the far ground, for the middle distance (under a screen px per map px), ceiling], in
      // the order they are tried
      const TIERS = [[1, 1, 2], [0.6, 1, 2], [0.6, 1, 1.75], [0.6, 1, 1.5], [0.6, 1, 1.25], [0.6, 0.85, 1.25], [0.6, 1, 1], [0.5, 0.85, 1], [0.5, 0.7, 1], [0.5, 0.7, 0.875], [0.5, 0.6, 0.75], [0.4, 0.5, 0.625]];
      const rFor = (hi, [fa, mi, rmax]) => { const want = Math.min(hi * dpr * (hi < farAt ? fa : hi < 1 ? mi : 1), rmax); return Math.min(LEVELS.find((r) => r >= want * 0.92) || rmax, rmax); };
      const cost = (size, r) => Math.ceil((size + 2 * PAD) * r) ** 2;
      const blocks = new Map();
      for (const q of need.values()) { const k = Math.floor(q.gi / 16) + ',' + Math.floor(q.gj / 16); if (!blocks.has(k)) blocks.set(k, [Math.floor(q.gi / 16), Math.floor(q.gj / 16)]); }
      const split = (gi, gj, span, tier, over, out) => {
        // the 256 px patches under this square (span patches a side, top left gi, gj): one bitmap for the
        // square, or the best cut of its four quarters
        let hi = 0, at = 1, any = false;
        for (let i = gi; i < gi + span; i++) for (let j = gj; j < gj + span; j++) { const q = need.get(i + ',' + j); if (q) { any = true; hi = Math.max(hi, q.hi); at = Math.min(at, q.at); } }
        if (!any) return null;
        const r = rFor(hi, tier), px = cost(span * CELL, r);
        if (span > 2) {
          const kids = [], h2 = span / 2;
          let kpx = 0, kn = 0;
          for (const [a, b] of [[0, 0], [h2, 0], [0, h2], [h2, h2]]) { const k = split(gi + a, gj + b, h2, tier, over, kids); if (k) { kpx += k.px; kn += k.n; } }
          if (kpx + over * (kn - 1) < px) { out.push(...kids); return { px: kpx, n: kn }; }
        }
        out.push({ key: `${span * CELL}:${gi},${gj}@${r}`, x: gi * CELL, y: gj * CELL, size: span * CELL, r, at });
        return { px, n: 1 };
      };
      const cutCells = (tier) => {
        let cells = null, total = 0;
        for (const over of [0.03e6, 0.06e6, 0.1e6, 0.15e6, 0.25e6, 0.4e6, 1e6, 3e6]) {
          cells = []; total = 0;
          for (const [bi, bj] of blocks.values()) { const k = split(bi * 16, bj * 16, 16, tier, over, cells); if (k) total += k.px; }
          if (cells.length <= 40) break;
        }
        return { cells, total, rmax: tier[2] };
      };
      let out = null;
      for (const tier of TIERS) { out = cutCells(tier); if (out.total <= budget) break; }
      return out;
    };
    const BAND = 160;
    // a canvas covering map rect (x, y, w, h) at pw x ph pixels; r is its true scale. Each is a layer of
    // its own whose pixels the compositor only moves (will-change, in the CSS)
    const newJob = (x, y, w, h, pw, ph, cls) => {
      const cv = document.createElement('canvas');
      cv.width = pw; cv.height = ph;
      cv.className = cls;
      cv.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      return { cv, ox: x, oy: y, r: pw / w };
    };
    const discard = (cv) => { cv.remove(); cv.width = cv.height = 0; };
    // work: paint one band of a canvas (a few ms), then hand finished canvases to the page
    const runItem = (it) => {
      const job = it.job;
      if (it.kind === 'band') {
        const { cv, ox, oy, r } = job;
        let c2 = job.c2;
        if (!c2) {
          // opaque, on the ground colour, so the compositor neither blends nor draws what lies under a cell.
          // A CPU canvas (willReadFrequently): its shapes are rastered here, in the idle slice, and the ride
          // only uploads finished pixels. A GPU canvas defers that raster until the cell first shows on
          // screen, and a first ride then stalls for a tenth of a second or more as each new cell comes in.
          c2 = job.c2 = cv.getContext('2d', { alpha: false, willReadFrequently: true });
          c2.fillStyle = bk.ground; c2.fillRect(0, 0, cv.width, cv.height);
        }
        c2.save();
        c2.setTransform(1, 0, 0, 1, 0, 0);
        c2.beginPath(); c2.rect(0, it.y0, cv.width, it.y1 - it.y0); c2.clip();
        paintArt(c2, bk.leaves, ox, oy, r, [ox, oy + it.y0 / r, ox + cv.width / r, oy + it.y1 / r]);
        c2.restore();
      } else if (it.kind === 'draft') {
        if (bk.draftJob !== job) return;
        bakeEl.insertBefore(job.cv, bakeEl.firstChild);
        bk.draftDone = true;
        show();
        try { performance.mark('route-journey:draft'); } catch {}
      } else if (it.kind === 'cell') {
        const cell = it.cell;
        if (cell.next !== job) return; // superseded by a later plan
        if (cell.cv) discard(cell.cv);
        cell.cv = job.cv; cell.next = null;
        bakeEl.insertBefore(job.cv, bk.end && bk.end.parentNode === bakeEl ? bk.end : null);
      } else if (it.kind === 'end') {
        if (bk.endJob !== job) return;
        if (bk.end) discard(bk.end);
        // the finished trail is painted in: the bitmap shows once the trail is complete, and from 0.85 it
        // stands in for the line layer, which then never has to be redrawn sharper for the rest frame
        const cs = getComputedStyle(chunks[0].el), c2 = job.c2;
        c2.setTransform(job.r, 0, 0, job.r, -job.ox * job.r, -job.oy * job.r);
        c2.strokeStyle = cs.stroke; c2.lineWidth = parseFloat(cs.strokeWidth) || 8; c2.lineCap = 'round'; c2.lineJoin = 'round';
        c2.stroke(new Path2D(d));
        bk.end = job.cv;
        bk.end.style.visibility = state.p >= 0.78 ? 'visible' : 'hidden';
        bakeEl.appendChild(bk.end);
        bk.endDone = bk.endKey;
      }
    };
    const queueBands = (job) => { for (let y = 0; y < job.cv.height; y += BAND) bk.queue.push({ kind: 'band', job, y0: y, y1: Math.min(job.cv.height, y + BAND) }); };
    const show = () => {
      // the painted map replaces the vector one as soon as the draft is in (the cells then arrive over it),
      // or once nothing is missing
      const on = bk.draftDone || (bk.ready && [...bk.keys].every((k) => bk.cells.get(k).cv) && bk.endDone === bk.endKey);
      if (on === bk.on) return;
      bk.on = on;
      ground.style.display = on ? 'none' : '';
      groundEnd.style.display = on ? 'none' : '';
      render();
    };
    const schedule = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 100 }) : setTimeout(fn, 16));
    const unschedule = (h) => (window.cancelIdleCallback ? cancelIdleCallback(h) : clearTimeout(h));
    const pump = (deadline) => {
      bk.timer = 0;
      if (bk.dead) return;
      // short slices while the scene is on screen; elsewhere the whole idle period the browser offers
      const idle = deadline && !deadline.didTimeout && typeof deadline.timeRemaining === 'function' ? deadline.timeRemaining() : 0;
      const slice = state.p > 0 && state.p < 1 ? 6 : Math.max(8, Math.min(30, idle - 2));
      const t = performance.now();
      while (bk.queue.length && performance.now() - t < slice) runItem(bk.queue.shift());
      if (bk.queue.length) { bk.timer = schedule(pump); return; }
      settle();
    };
    // done: cells an earlier plan cut differently are no longer needed
    const settle = () => {
      for (const [k, cell] of bk.cells) if (!bk.keys.has(k)) { if (cell.cv) discard(cell.cv); bk.cells.delete(k); }
      bk.ready = true; show();
      try { performance.mark('route-journey:baked'); } catch {}
    };
    const replan = () => {
      if (!bk.leaves || bk.dead) return;
      const pl = plan();
      // for profiling: the plan's size shows in the browser's performance timeline
      try { performance.mark('route-journey:plan', { detail: { cells: pl.cells.length, px: pl.total, rmax: pl.rmax } }); } catch {}
      bk.queue = [];
      // First a draft: the whole art at a quarter of a device px per map px in one bitmap, which stands in
      // for the vector map a moment after the bake starts (and lies under the cells, so a new plan after a
      // resize paints over it). The vector map, rastered afresh at every scale the crane passes, would
      // stall a visitor who reaches the scene before the cells are done.
      if (!bk.draftDone) {
        if (bk.draftJob) discard(bk.draftJob.cv);
        const ab = bk.artBox, x = Math.floor(ab[0]) - PAD, y = Math.floor(ab[1]) - PAD;
        const r = Math.min(0.25, 4096 / Math.max(ab[2] - ab[0], ab[3] - ab[1]));
        const pw = Math.ceil((ab[2] - ab[0] + 2 * PAD) * r), ph = Math.ceil((ab[3] - ab[1] + 2 * PAD) * r);
        bk.draftJob = newJob(x, y, pw / r, ph / r, pw, ph, 'route-bake__draft');
        queueBands(bk.draftJob);
        bk.queue.push({ kind: 'draft', job: bk.draftJob });
      }
      bk.keys = new Set(pl.cells.map((q) => q.key));
      const todo = [];
      for (const q of pl.cells) {
        let cell = bk.cells.get(q.key);
        if (!cell) { cell = { cv: null, next: null }; bk.cells.set(q.key, cell); }
        if (cell.cv) { cell.next = null; continue; }
        const x = q.x - PAD, y = q.y - PAD, w = q.size + 2 * PAD, pw = Math.ceil(w * q.r);
        cell.next = newJob(x, y, w, w, pw, pw, 'route-bake__cell');
        todo.push([q.at, cell]);
      }
      todo.sort((a, b) => a[0] - b[0]);
      for (const [, cell] of todo) { queueBands(cell.next); bk.queue.push({ kind: 'cell', cell, job: cell.next }); }
      const key = endRect.map((v) => v.toFixed(2)).join() + '@' + endPx.r;
      if (bk.endDone !== key) {
        bk.endKey = key;
        bk.endJob = newJob(endRect[0], endRect[1], endRect[2] - endRect[0], endRect[3] - endRect[1], endPx.pw, endPx.ph, 'route-bake__end');
        bk.endJob.r = endPx.r;
        queueBands(bk.endJob);
        bk.queue.push({ kind: 'end', job: bk.endJob });
      }
      if (!bk.queue.length) { settle(); return; }
      bk.ready = false;
      show();
      if (!bk.timer) bk.timer = schedule(pump);
    };
    const startBake = async () => {
      if (!canBake || bk.dead) return;
      try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
      if (bk.dead) return;
      const leaves = readArt(ground);
      if (!leaves) { console.info('route-journey: the map holds shapes the painter skips; it stays vector'); return; }
      try { await Promise.all([...new Set(leaves.filter((l) => l.text).map((l) => l.font))].map((f) => document.fonts.load(f))); } catch {}
      if (bk.dead) return;
      bk.leaves = leaves;
      // the art's extent: beyond it the stage's own ground shows, so no cell is painted there
      bk.artBox = leaves.reduce((b, l) => [Math.min(b[0], l.box[0]), Math.min(b[1], l.box[1]), Math.max(b[2], l.box[2]), Math.max(b[3], l.box[3])], [Infinity, Infinity, -Infinity, -Infinity]);
      bk.ground = getComputedStyle(stage).backgroundColor;
      replan();
    };

    // ---------- render: everything from the timeline's progress ----------
    const state = { p: 0 };
    const cache = new Map();
    const put = (node, prop, val) => { let c = cache.get(node); if (!c) cache.set(node, (c = {})); if (c[prop] !== val) { c[prop] = val; node.style[prop] = val; } };
    const flag = (node, cls, on) => { const k = 'class:' + cls; let c = cache.get(node); if (!c) cache.set(node, (c = {})); if (c[k] !== on) { c[k] = on; node.classList.toggle(cls, on); } };
    let active = -1, lastGauge = null;

    const render = () => {
      const p = state.p;
      const c = camAt(p);
      const { cin, cout, s, P, tilt, yaw, zoom } = c;
      const camT = `rotateX(${tilt.toFixed(3)}deg) rotateZ(${yaw.toFixed(3)}deg) scale3d(${zoom.toFixed(4)},${zoom.toFixed(4)},${zoom.toFixed(4)})`;
      const worldT = `translate3d(${(-c.Cx).toFixed(2)}px,${(-c.Cy).toFixed(2)}px,0)`;
      cam.style.transform = camT; world.style.transform = worldT;
      // the map: the painted cells (and the view over the plot from the start of the crane out), or the
      // vector map with its raster lock (see the CSS) until they are ready
      const trailIn = bk.on && !!bk.end && p >= 0.85; // the end bitmap, trail and all, stands in for the lines
      if (bk.end) put(bk.end, 'visibility', p >= 0.78 ? 'visible' : 'hidden');
      if (!bk.on) put(groundEnd, 'visibility', p >= 0.85 ? 'visible' : 'hidden');
      flag(cam, 'is-ride', p < 0.85 || !!trailIn);
      const postsOn = tilt > 10 && posts.length > 0;
      put(cam3, 'visibility', postsOn ? 'visible' : 'hidden');
      if (postsOn) { cam3.style.transform = camT; world3.style.transform = worldT; }
      // traveller: on the route point, nose along the true heading (it leans into bends)
      const ts = lerp(clamp(M.kt / zoom, 1, M.tMax), 1, cout); // true size over the plot, so it parks on it exactly
      trav.style.transform = `translate3d(${P.x.toFixed(2)}px,${P.y.toFixed(2)}px,0) rotate(${(P.h + 90).toFixed(2)}deg) scale(${ts.toFixed(3)})`;
      const land1 = e.xo(seg(p, 0.05, 0.05));
      put(body, 'transform', `scale(${(3 - 2 * land1).toFixed(3)})`);
      put(body, 'opacity', e.p1o(seg(p, 0.05, 0.02)).toFixed(3));
      // the shade exists only while it is in the air: it slides in under the body and is gone at touchdown
      put(drop, 'transform', `translate3d(${(28 * (1 - land1)).toFixed(2)}px,${(40 * (1 - land1)).toFixed(2)}px,0)`);
      put(drop, 'opacity', (0.32 * Math.sin(Math.PI * land1)).toFixed(3));
      const ring = p < 0.08 ? 0 : e.p2o(seg(p, 0.08, 0.05));
      put(land, 'transform', `scale(${(0.4 + 2.2 * ring).toFixed(3)})`);
      put(land, 'opacity', p < 0.08 || ring >= 1 ? '0' : (0.7 * (1 - ring)).toFixed(3));
      // headlights: on through the chase, off as the truck pulls onto the plot
      const bm = e.p2io(seg(p, 0.11, 0.06)) * (1 - e.p2io(seg(p, 0.8, 0.07)));
      put(beam, 'opacity', bm.toFixed(3));
      put(beam, 'visibility', bm <= 0 ? 'hidden' : 'visible');
      // pins keep their size in the overview
      const ps = clamp(M.k / zoom, 1, M.pMax).toFixed(3);
      for (const pin of pins) put(pin, 'transform', `scale(${ps})`);
      // the wide dotted route of the overview hands over to the chase's lines as the camera comes down
      const xf = e.p2io(seg(p, 0.095, 0.045));
      put(wide, 'opacity', (1 - xf).toFixed(3)); put(wide, 'visibility', xf >= 1 ? 'hidden' : 'visible');
      put(lines, 'opacity', xf.toFixed(3)); put(lines, 'visibility', xf <= 0 || trailIn ? 'hidden' : 'visible');
      let tipK = -1;
      for (let k = 0; k < chunks.length; k++) {
        const ch = chunks[k], done = s >= ch.b - 0.05;
        if (done !== ch.done) { ch.done = done; ch.el.style.visibility = done ? 'visible' : 'hidden'; }
        if (!done && s > ch.a && tipK < 0) tipK = k;
      }
      if (tipK !== tipChunk) setTip(tipK);
      if (tipK >= 0) {
        const ch = chunks[tipK], v = clamp(s - ch.a, 0, ch.len), r = (ch.len - v).toFixed(1);
        if (r !== tipShown) { tipShown = r; tipPath.style.strokeDashoffset = r; }
      }
      // boards: each swings up from the ground about its foot (lying flat, then standing to face the
      // camera) as the traveller nears its stop, and fades as the traveller pulls away
      const vis = clamp((tilt - 10) / 15, 0, 1);
      for (const post of posts) {
        const up = e.p2o(clamp((s - (post.s - post.lead)) / post.rise, 0, 1));
        const gone = clamp((s - post.s - 16) / post.fade, 0, 1);
        const op = clamp(up / 0.45, 0, 1) * (1 - gone) * vis;
        const shown = op > 0.002;
        if (shown !== post.shown) { post.shown = shown; post.inner.style.visibility = shown ? 'visible' : 'hidden'; }
        if (!shown) continue;
        post.inner.style.transform = `rotateZ(${(-yaw).toFixed(3)}deg) rotateX(${(-tilt * up).toFixed(3)}deg)`;
        put(post.inner, 'opacity', op.toFixed(3));
      }
      // plates and fog (faded text stays in the page for screen readers; the arrival line and button are
      // hidden until they show, and the stops once the arrival has replaced them)
      const io = e.p2i(seg(p, 0.09, 0.05));
      if (intro) { put(intro, 'opacity', (1 - io).toFixed(3)); put(intro, 'transform', `translate3d(0,${(-32 * io).toFixed(2)}px,0)`); }
      const fg = c.fg;
      put(fog, 'transform', `translate3d(0,${(-(1 - fg) * 102).toFixed(2)}%,0)`);
      put(fog, 'visibility', fg <= 0 ? 'hidden' : 'visible');
      const ri = e.p3o(seg(p, railAt, 0.05));
      if (rail) { put(rail, 'opacity', ri.toFixed(3)); put(rail, 'transform', `translate3d(0,${(40 * (1 - ri)).toFixed(2)}px,0)`); }
      // the stops have left the plate by 0.89, when the arrival line starts to rise into it
      const so = e.p2i(seg(p, 0.86, 0.03));
      for (const node of [list, count]) if (node) { put(node, 'opacity', (1 - so).toFixed(3)); put(node, 'transform', `translate3d(0,${(-16 * so).toFixed(2)}px,0)`); put(node, 'visibility', so >= 1 ? 'hidden' : 'visible'); }
      const al = e.p3o(seg(p, 0.89, 0.05)), ac = e.p3o(seg(p, 0.91, 0.04));
      if (arriveLine) { put(arriveLine, 'opacity', al.toFixed(3)); put(arriveLine, 'transform', `translate3d(0,${(24 * (1 - al)).toFixed(2)}px,0)`); put(arriveLine, 'visibility', al <= 0 ? 'hidden' : 'visible'); }
      if (arriveCta) { put(arriveCta, 'opacity', ac.toFixed(3)); put(arriveCta, 'transform', `translate3d(0,${(24 * (1 - ac)).toFixed(2)}px,0)`); put(arriveCta, 'visibility', ac <= 0 ? 'hidden' : 'visible'); }
      // the destination: a circle of light grows from its centre out while the camera is still tilted,
      // revealing the lit copy over the dimmed base, with a ring of the accent running at its front; it
      // settles lit (the base is then hidden under it)
      if (box) {
        const t = seg(p, LIGHT0, LIGHT_SPREAD + LIGHT_DUR), lt = e.p3o(t), fl = Math.sin(Math.PI * t);
        put(destLit, 'clipPath', t >= 1 ? 'none' : `circle(${(lt * destR).toFixed(1)}px at 50% 50%)`);
        put(destLit, 'visibility', t <= 0 ? 'hidden' : 'visible');
        put(destBase, 'visibility', t >= 1 ? 'hidden' : 'visible');
        put(front, 'transform', `scale(${Math.max(0.01, lt).toFixed(4)})`);
        put(front, 'opacity', (0.9 * fl).toFixed(3));
        put(front, 'visibility', fl <= 0.002 ? 'hidden' : 'visible');
        // the end pin gives way to the lit destination
        put(pins[N - 1].parentNode, 'opacity', (1 - e.p3o(seg(p, LIGHT0 + 0.02, 0.04))).toFixed(3));
      }
      // pulses run only while the scene rests at either end (a running pulse would repaint every frame)
      flag(dest, 'is-arrived', p >= 0.9);
      // which stop is current: derived from s, so scrolling back is exact
      let a = 0;
      for (let k = 1; k < N; k++) if (s >= stopS[k - 1] + 0.4 * (stopS[k] - stopS[k - 1])) a = k;
      if (a !== active) {
        active = a;
        steps.forEach((st, k) => { st.classList.toggle('is-current', k === a); st.classList.toggle('is-passed', k < a); });
        pins.forEach((pn, k) => { pn.parentNode.classList.toggle('is-current', k === a); pn.parentNode.classList.toggle('is-passed', k < a); });
        count.textContent = `Stop ${a + 1} of ${N}`;
      }
      flag(pins[0].parentNode, 'is-pulse', p < 0.06);
      for (let k = 0; k < legs; k++) put(legFills[k], 'transform', `scaleX(${clamp((s - stopS[k]) / (stopS[k + 1] - stopS[k]), 0, 1).toFixed(4)})`);
      // the gauge reads a real unit, piecewise along the stops
      if (gaugeNum) {
        let v = values[N - 1];
        for (let k = 0; k < legs; k++) if (s <= stopS[k + 1]) { v = lerp(values[k], values[k + 1], (s - stopS[k]) / (stopS[k + 1] - stopS[k])); break; }
        const txt = fmt.format(Math.round(v / unitStep) * unitStep);
        if (txt !== lastGauge) { lastGauge = txt; gaugeNum.textContent = txt; }
      }
    };

    measure();
    tl.to(state, { p: 1, duration: 1, ease: 'none', onUpdate: render }, 0);
    const onRefresh = () => { measure(); render(); if (bk.leaves) replan(); };
    ScrollTrigger.addEventListener('refresh', onRefresh);
    render();
    // paint the map once the page is idle (it waits for the fonts the map's words use)
    bk.timer = schedule(() => { bk.timer = 0; startBake(); });

    // undo everything this build wrote when the scene reverts (reduced motion, breakpoint change)
    const teardown = () => {
      bk.dead = true;
      if (bk.timer) unschedule(bk.timer);
      bakeEl.querySelectorAll('canvas').forEach((cv) => { cv.width = cv.height = 0; });
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      made.forEach((m) => m.remove());
      for (const node of [intro, rail, list, count, arriveLine, arriveCta]) if (node) for (const k of ['opacity', 'transform', 'visibility']) node.style.removeProperty(k);
      if (list) list.style.removeProperty('--n');
      for (const k of ['--route-persp', '--route-ax', '--route-ay']) stage.style.removeProperty(k);
      steps.forEach((st) => st.classList.remove('is-current', 'is-passed'));
      if (gaugeNum) gaugeNum.textContent = gaugeFinal;
      root.__routeTeardown = null;
    };
    root.__routeTeardown = teardown;
    gsap.context(() => teardown);
  }
})();
