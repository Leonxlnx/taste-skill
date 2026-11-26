// assets/scenes/peel-tear-and-drag/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / peel-tear-and-drag.js — a physical object brings in the next section.
//
// Three modes (data-options "mode"), each at most once on a page, the scene itself at most twice:
//   drag (default)  a plane drags the next chapter in behind it: for the middle of a page (below). The only
//                   mode the draw deals.
//   peel            a sticker peels off the page and shows what it covered. Retired: never dealt.
//   tear            the old chapter's ground rips along a ragged line and rolls away. Retired: never dealt.
// Peel and tear both paint a shaded, shadowed paper tube (drawn bands and soft shadows, a 2010s skeuomorph
// beside flat type); they still run for pages that already use them, and are documented after the drag's
// options, but a new page takes the drag or another scene.
//
// DRAG. Cloud closes in over the old chapter until it is a deck, then a huge
// photographed plane, seen from straight below or above, breaks out of it, crosses the held stage and pulls
// the next page in behind it. The page arrives through a chevron clip whose point stays under the fuselage
// and whose two slanted sides run under the two wings (measured from the cut-out's own pixels). No shadow
// by default (shadow: true still casts a soft one on the new page, for old pages; a drop shadow is a house
// ban). The clip and the plane are driven by the same number (the edge, the clip's point as a % of the
// stage), so the seam never comes loose. The plane comes in and goes away on a clock, never on the scroll:
// it breaks out of the deck until about three fifths of it is on screen in about half a second, the scroll
// carries it across, and from about three fifths still on screen it speeds away. Words move on a clock too:
// the old chapter's closing line lifts away as the plane sets off, and each block of the new page lands (in
// about 0.4s) once the plane's outline has passed it, and leaves again, faster, when the scroll goes back.
// Wherever the reader stops, the plane shows most of itself or none, and a block is whole or not there.
// The cloud comes in as the view climbs: every piece slides in from outside the frame towards the middle,
// shrinking as it comes, always at full opacity (no half-clear sheet ever lies over the photo), until the deck
// closes. A piece placed in the right half comes in from the right and never crosses into the left one. The deck
// keeps the shape it was composed for at any window shape (it covers the stage like a cover-fitted picture), so
// it closes on a tall tablet as it does on a wide screen.
//
// On a phone (max-width 767px) the same idea turns vertical: the plane flies bottom to top, nose up, and
// drags the page in from below. Reduced motion, no script, a failed CDN and very small screens (under
// 360px wide or 560px tall) show the finished composition: the old panel with its photo, closing line and
// the plane parked over a band of cloud, stacked above the new page.
//
// DOM (optional parts can be left out):
//   <section class="scene" data-scene="peel-tear-and-drag" data-options='{"dir":"ltr"}'>
//     <div class="scene-stage">
//       <div class="drag-old">                                  outgoing chapter, dark
//         <img class="drag-old__ground" src alt="">             top-down landscape photo (sea, coast, fields from altitude)
//         <div class="drag-old__tint"></div>                    flat brand colour over it (--drag-dark)
//         <p class="drag-old__line">We fly when the ferries can't.</p>       4-10 words
//         <div class="drag-veil" aria-hidden="true">            optional, 0-7 pieces (the phone uses the first 4);
//           <img class="drag-veil__piece" src="cloud-1.webp" alt="">        the first two sit in the right half.
//              Soft-edged alpha cut-outs of cloud seen from above, at least 1.5 times the width they are shown
//              (the CSS shows the demo's 1000-1300px pieces at 40-60% of a 1440 screen, 1.5x or more; a 768px
//              tablet crops a wider deck, so give 2000px pieces for it), with a solid core and
//              their half-transparent edge pixels in the cloud's own colour (no dark fringe where one lies on
//              another). The CSS places seven; give other pieces their own left/top/width, as shares of a
//              1440 x 900 box (390 x 844 on the phone) that the scene fits over the stage.
//         </div>
//       </div>
//       <div class="drag-new">                                  incoming page, light; same ground as the next section
//         <div class="drag-new__inner">
//           <h2 class="drag-new__title">…</h2>                  3-8 words, two lines at most
//           <ul class="drag-new__items"><li>…</li></ul>         2-3 short quotes or 3-12 rows (over 6: three columns)
//           <p class="drag-new__aside">…</p>                    optional, 20 words or fewer, top right
//           <figure class="drag-new__figure"><img …></figure>   a wide photograph along the bottom of the page: the
//                                                               first thing the opening clip shows, so give it one
//         </div>
//       </div>
//       <div class="drag-rig drag-rig--object" aria-hidden="true">
//         <img class="drag-object" src="plane.webp" alt="">     the object: a photographed cut-out, see below
//       </div>
//     </div>
//   </section>
//   The object is a photograph cut out on alpha (WebP/PNG, about 2400px long, under 200KB), seen from straight
//   above or below, nose pointing right, no shadow, its box tight around it; a plane's wingspan about equal to
//   its length. A plane photographed against clear sky keys cleanly. The scene draws the shadow, and reads the
//   cut-out's outline (same origin or CORS) to put the clip's point under the fuselage and its sides under the
//   wings, and to know when the tail has passed each block of words. Without a .drag-object the scene runs as
//   a bare wipe (object: 'jet' paints a plain drawn jet, for a sketch only: a drawn illustration never ships).
//   A page without its own cut-out of a plane, and the cloud's, takes another scene.
//
// Options (data-options JSON), name: values [default] what it does
//   dir:       'ltr' | 'rtl'      ['ltr']   direction on desktop; 'rtl' for a second use on one page
//   hold:      1.5-4              [3]       screens the stage is held (2 without a veil)
//   phoneHold: 1.5-3.5            [2.2]     (keep the drag itself, 0.75 of it, at 1.5 screens or more)
//   phone:     'vertical' | 'rest' ['vertical']  the phone flies bottom to top, or keeps the finished composition
//   scrub:     true | seconds     [true with Lenis, else 0.6]
//   pace:      'surge' | 'even'   ['surge'] the scrolled crossing between the two clocks (0.085-0.90 of the hold,
//                                           the phone's climb 0.12-0.88): quicker out of the clock in, slower over
//                                           the middle, quicker into the clock out, never more than three times
//                                           faster in one place than another; 'even' is linear
//   object:    'none' | 'jet'     ['none']  what to paint when the page has no .drag-object: nothing (a bare
//                                           wipe), or a drawn jet for a sketch, never shipped
//   len:       0.3-0.9            [0.8]     object length as a share of the stage width
//   phoneLen:  0.4-0.8            [0.62]    the same on the phone, as a share of the stage height
//   grow:      1-1.35             [1.25]    scale the object reaches as it climbs (phoneGrow [1.15]; tallGrow
//                                           [1.12] caps it on a stage taller than wide, a tablet held upright)
//   apex:      0.2-0.65           [measured] where the clip's point sits, as a share of the length behind the nose
//   sweep:     0-45 (degrees)     [measured] slant of the clip's sides: 0 is a square edge (a truck's bumper);
//                                           give apex and sweep for an object whose pixels cannot be read
//   bleed:     true | false       [true]    lengthen the object so its wings run off both long edges at any aspect
//   shadow:    false | true       [false]   a soft cast shadow on the new page (old pages only: a drop shadow is
//                                           a house ban, and it read as a grey slab on the phone)
//   veil:      true | false       [true]    false skips the cloud, drops the hold to 2, starts the drag at 0.10
//   tint:      0-0.7              [0.35]    how much of the flat colour lies over the photo at the start (for the
//                                           closing line); it deepens to 0.75 as the cloud comes in
//
// House rules over the spec: the new page's words land in the object's wake. Each block of text appears once
// the object's own outline (not just its box) has passed it, so the plane never crosses words being read; on a
// desktop never before the block above it (they arrive in reading order), on the phone, where the plane climbs
// past the lower blocks first, each as soon as the tail has passed it; the words lie above any shadow. The
// picture along the bottom of the page shows from the first frame of the opening clip.
// The new page has to fit one screen; where it does not (a long list in a short window) the scene keeps its
// finished composition there, and goes live again when the window grows.
//
// PEEL and TEAR share one mechanism: a fold sweeps across a sheet. Ahead of it the sheet lies flat; just behind
// it a band of the sheet's back has rolled over (a tube: the back's colour mirrored across the fold, shaded by
// flat bands blurred once, never a gradient), with a soft shadow; the rest has lifted away, and what was under
// the sheet shows. Words the sheet covered land once the fold has passed them, in reading order.
//
//   PEEL DOM:
//   <section class="scene" data-scene="peel-tear-and-drag" data-options='{"mode":"peel"}'
//            style="--peel-left: 48%; --peel-top: 10svh; --peel-w: 46%">   where the sticker lies while it runs
//     <div class="scene-stage">
//       <div class="peel-page">…the page: a title that stays clear of the sticker, and words under it…</div>
//       <figure class="peel-sticker">                         a photograph in a white border (CSS)
//         <img class="peel-art" src alt="…">
//         <img class="peel-art peel-art--b" src alt="">       optional: a second state of the same framing,
//       </figure>                                             shown from 0.22 (calm, then reacting)
//     </div>
//   </section>
//   Phone: --peel-phone-left / --peel-phone-top / --peel-phone-w. The finished composition sets the sticker
//   after the page's words, never over them.
//
//   TEAR DOM:
//   <section class="scene" data-scene="peel-tear-and-drag" data-options='{"mode":"tear"}'>  (or a <footer>)
//     <div class="scene-stage">
//       <div class="tear-old">…the old chapter: its words in the top third, above the tear…</div>  --tear-old ground
//       <div class="tear-new">…the new chapter: its words in the bottom third, below it…</div>   --tear-new ground
//     </div>
//   </section>
//   The part of the old ground below the tear is a copy that rolls away; above it, the old chapter stays, its
//   torn edge a band of white paper fibre. The next section continues on the new ground.
//
//   Options (peel / tear):
//   hold, phoneHold: 1-3           [1.5]     screens held (keep the sweep at 1 screen or more)
//   angle:   degrees               [-34 / 163] the way the fold travels (peel: up and to the right; tear: to the
//            left, tilted); phoneAngle [-58 / 163]
//   band:    0.05-0.15             [0.09]    the rolled band, as a share of the sheet's extent
//   from, to: 0-1                  [0.12-0.86 / 0.04-0.85]  the sweep, as fractions of the scene (the tear's
//                                           gathers speed as it rips: power1.in)
//   lift:    true | false          [true]    peel: the sticker lifts a little and turns as it comes away
//   tilt:    degrees               [11.25]   tear: the tear's slant, rising to the right
//   at, phoneAt: 0.3-0.7           [0.55 / 0.5]  tear: the height of the tear's middle, as a share of the stage
//   seed:    any integer           [11]      tear: a different ragged edge
//
// Smoothness: only transform and opacity move, and nothing is repainted while a scene runs: the drag's new
// page is a sheet with a fixed chevron edge moved by transform, and the fold modes' clips never change. Every
// picture is decoded before the scene starts; layers are promoted (will-change) only while the scene is within
// a screen of the viewport.
//
// Page tokens: --drag-dark (old chapter colour, #14204a), --ground (new page = next section), --ink,
// --font-display. Timeline positions are fractions of the scene (0-1).
(() => {
  const ID = 'peel-tear-and-drag';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }

  const DEFAULTS = {
    dir: 'ltr', hold: null, phoneHold: 2.2, phone: 'vertical', scrub: null, object: 'none', pace: 'surge',
    tint: 0.35, len: 0.8, phoneLen: 0.62, grow: 1.25, phoneGrow: 1.15, tallGrow: 1.12, apex: null, sweep: null, bleed: true, shadow: false, veil: true,
  };
  // The scrolled part of the drag's pace ('surge', the default): the plane leaves its clock in at 1.6 times its
  // mean speed, slows over the middle of the stage while the page arrives under it (to 0.6) and speeds up again
  // (to 1.8) into its clock out. Smooth: the speed changes continuously, never in a jump, and never by more than
  // three times (a wider swing reads as a stall, then a dart). 'even' keeps a linear pace.
  const SURGE_A = 0.5, SURGE_B = 0.2, SURGE_C = 0.1;
  const SHOW = 0.6;   // the share of the object's outline on screen where each clock hands over to the scroll
  const surge = (u) => u + (SURGE_A * Math.sin(2 * Math.PI * u)) / (2 * Math.PI) + (SURGE_B * Math.sin(4 * Math.PI * u)) / (4 * Math.PI) - SURGE_C * u * (1 - u);
  const DPR = () => Math.min(2, window.devicePixelRatio || 1);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // scroll on to the end of a running scene (where every block of words has landed)
  const toEnd = (st) => {
    if (!st || st.progress > 0.999) return;
    if (Stage.lenis) Stage.lenis.scrollTo(st.end); else window.scrollTo({ top: st.end, behavior: 'smooth' });
  };

  // ---------------------------------------------------------------------------------------------------------
  // The fallback object: a white twin-engine freighter seen from straight above, nose right, drawn on a
  // 1000 x 1000 box (length 1000, span 982). Flat tones; soft shading is flat shapes blurred once, never a
  // gradient. It is painted once into a bitmap, so it composites as a plain image while it moves.
  const J = {
    fus: 'M4 494 C60 486 150 459 250 455 L870 455 C940 455 990 470 1000 500 C990 530 940 545 870 545 L250 545 C150 541 60 514 4 506 Z',
    wing: 'M604 455 L330 22 C320 12 306 8 292 9 L284 20 L400 296 L388 455 Z',
    stab: 'M206 463 L84 318 C77 311 66 308 54 309 L50 318 L114 467 Z',
    eng: 'M594 318 C600 326 600 358 594 366 L474 370 L444 358 L444 326 L474 314 Z',
  };
  const flip = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${1000 - +y}`);
  const both = (d, a = '') => `<path d="${d}"${a}/><path d="${flip(d)}"${a}/>`;
  const JET_SPAN = 0.982;
  const VEIL_DESK = 1440 / 900, VEIL_PHONE = 390 / 844;   // the shapes the cloud deck is composed for
  const SHADOW_PAD = 0.08;   // padding round the shadow, as a share of the object's length
  const jetSVG = (brand) => {
    const win = Array.from({ length: 26 }, (_, i) => `<rect x="${300 + i * 22}" y="${i % 9 === 4 ? 462 : 463}" width="9" height="${i % 9 === 4 ? 9 : 5}" rx="2"/>`).join('');
    const seams = [330, 420, 520, 640, 760, 860].map((x) => `<path d="M${x} 457 L${x} 543"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
<defs>
<filter id="b3" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="b8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="b16" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
<clipPath id="f"><path d="${J.fus}"/></clipPath>
<clipPath id="w">${both(J.wing)}</clipPath>
<clipPath id="e">${both(J.eng)}</clipPath>
<clipPath id="s">${both(J.stab)}</clipPath>
</defs>
<g fill="#cfd4db">${both('M560 318 L600 300 L612 300 L612 318 Z')}</g>
<g fill="#eceef1">${both(J.eng)}</g>
<g clip-path="url(#e)">
<g fill="#aeb6c2" filter="url(#b8)">${both('M440 300 L610 300 L610 318 L440 318 Z')}${both('M440 366 L610 366 L610 384 L440 384 Z')}</g>
<g fill="#ffffff" filter="url(#b3)">${both('M470 334 L586 334 L586 346 L470 346 Z')}</g>
<g fill="#262c36">${both('M584 300 L604 300 L604 384 L584 384 Z')}</g>
<g fill="#5d6673">${both('M588 304 L604 304 L604 380 L588 380 Z')}</g>
<g fill="#8a929e">${both('M456 330 L424 342 L456 354 Z')}</g>
</g>
<g fill="#eef0f3">${both(J.wing)}</g>
<g clip-path="url(#w)">
<g fill="#dde1e7">${both('M440 455 L330 250 L306 30 L280 20 L400 296 L388 455 Z')}</g>
<g fill="#e6e9ee">${both('M486 455 L370 250 L340 56 L330 250 L440 455 Z')}</g>
<g fill="#ffffff" opacity=".9">${both('M604 455 L330 22 L338 40 L590 455 Z')}</g>
<g fill="none" stroke="#c3c9d2" stroke-width="2">${both('M470 455 L352 150')}${both('M430 455 L330 200')}${both('M560 455 L320 60')}</g>
<g fill="#9fa8b5" opacity=".55" filter="url(#b16)">${both('M620 455 L540 400 L470 455 Z')}</g>
<g fill="${brand}">${both('M334 24 L322 12 L300 9 L292 9 L298 22 Z')}</g>
</g>
<g fill="#eef0f3">${both(J.stab)}</g>
<g clip-path="url(#s)">
<g fill="#dde1e7">${both('M136 465 L70 324 L54 314 L114 467 Z')}</g>
<g fill="${brand}">${both('M92 330 L84 318 L66 309 L56 310 L60 320 Z')}</g>
</g>
<g fill="#e3e7ec">${both('M380 455 C430 430 560 430 640 455 Z')}</g>
<path d="${J.fus}" fill="#f7f8f9"/>
<g clip-path="url(#f)">
<g fill="#b8c0cb" filter="url(#b8)"><path d="M-10 436 L1010 436 L1010 462 L-10 462 Z"/><path d="M-10 538 L1010 538 L1010 564 L-10 564 Z"/></g>
<path d="M-10 484 L1010 484 L1010 516 L-10 516 Z" fill="#ffffff" filter="url(#b8)"/>
<g fill="#5d6673">${win}</g>
<g fill="none" stroke="#d3d8df" stroke-width="2">${seams}</g>
<g fill="none" stroke="#aab2bd" stroke-width="2"><rect x="880" y="459" width="22" height="12" rx="2"/><rect x="250" y="459" width="20" height="12" rx="2"/></g>
<path d="M168 440 L214 440 L214 560 L168 560 Z" fill="${brand}"/>
<path d="M952 476 C963 481 971 490 973 500 C971 510 963 519 952 524 L947 517 C955 513 960 507 961 500 C960 493 955 487 947 483 Z" fill="#1a2233"/>
</g>
<path d="M30 500 C60 497 150 495.5 226 496.5 L232 500 L226 503.5 C150 504.5 60 503 30 500 Z" fill="#dfe3e8"/>
<path d="M30 501 C60 503 150 504.5 226 503.5 L232 500" fill="none" stroke="#a7afba" stroke-width="2"/>
</svg>`;
  };
  const jetShadowSVG = () => {
    const p = SHADOW_PAD * 1000, s = 1000 + 2 * p;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-p} ${-p} ${s} ${s}" width="${s}" height="${s}"><defs><filter id="sh" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="15"/></filter></defs><g fill="#000" filter="url(#sh)"><path d="${J.fus}"/>${both(J.wing)}${both(J.stab)}${both(J.eng)}</g></svg>`;
  };
  // Everything the scene makes is handed to the page as a plain bitmap <img>: a composited image keeps its
  // raster however it is scaled, where a drawing or a canvas inside a scaled box is painted again each frame.
  const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  // A picture from another host without crossorigin="anonymous" taints the canvas: keep the original then.
  const toImg = (canvas, img) => new Promise((done) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) return done();
        const old = img.dataset.blob;
        img.src = img.dataset.blob = URL.createObjectURL(blob);
        img.decode().catch(() => {}).then(() => { if (old) URL.revokeObjectURL(old); done(); });
      }, 'image/png');
    } catch { done(); }
  });
  // paint a self-contained SVG at a given pixel size into an <img>; hands the canvas to `then` first
  const paintSvg = (img, svg, size, then) => {
    img.dataset.px = size;
    const src = new Image();
    src.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return src.decode().then(() => {
      if (+img.dataset.px !== size) return;   // a newer size was asked for meanwhile
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      c.getContext('2d').drawImage(src, 0, 0, size, size);
      if (then) then(c);
      return toImg(c, img);
    }).catch(() => {});
  };
  // a black, blurred silhouette of the page's own cut-out, drawn once at half size
  const shadowFromImage = (img, out) => {
    const draw = () => {
      const w = Math.max(2, Math.round(Math.min(1400, img.naturalWidth) / 2)), h = Math.max(2, Math.round((w * img.naturalHeight) / img.naturalWidth));
      const pad = Math.round(w * SHADOW_PAD);
      const c = document.createElement('canvas');
      c.width = w + pad * 2; c.height = h + pad * 2;
      out.width = c.width; out.height = c.height;
      const x = c.getContext('2d');
      x.filter = `blur(${Math.round(w * 0.012)}px)`;
      x.drawImage(img, pad, pad, w, h);
      x.filter = 'none';
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = '#000';
      x.fillRect(0, 0, c.width, c.height);
      try { toImg(c, out); } catch {}   // a cut-out served without CORS gets no shadow
    };
    if (img.complete && img.naturalWidth) draw(); else img.decode().then(draw).catch(() => {});
  };

  // The object's outline, read once from its pixels: for 40 bands across it, the opaque runs along it as
  // fractions of its length from the nose. It tells the clip where the wings are, and the words when the
  // tail has passed them. Null when the pixels cannot be read (a cut-out from another origin without CORS).
  const outline = (src, w0, h0) => {
    if (!w0 || !h0) return null;
    const w = 220, h = Math.max(24, Math.round((w * h0) / w0));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    let d;
    try { x.drawImage(src, 0, 0, w, h); d = x.getImageData(0, 0, w, h).data; } catch { return null; }
    const B = 40, bands = [];
    for (let b = 0; b < B; b++) {
      const j0 = Math.floor((b * h) / B), j1 = Math.max(j0 + 1, Math.floor(((b + 1) * h) / B));
      const runs = [];
      let on = -1;
      for (let i = w - 1; i >= -1; i--) {
        let a = false;
        if (i >= 0) for (let j = j0; j < j1 && !a; j++) a = d[(j * w + i) * 4 + 3] > 96;
        if (a && on < 0) on = i;
        if (!a && on >= 0) { runs.push([(w - 1 - on) / w, (w - 1 - i) / w]); on = -1; }
      }
      bands.push({ g0: j0 / h - 0.5, g1: j1 / h - 0.5, runs, rear: runs.length ? runs[runs.length - 1][1] : -1 });
    }
    return bands.some((b) => b.runs.length) ? bands : null;
  };
  // The clip that hides under the object: a point under the fuselage (apex, share of the length behind the
  // nose) and a slant for each side (k: how far back the seam runs per unit across the object) that keep the
  // seam inside the wing on both sides, out to where the stage ends (gEdge).
  const fitSeam = (bands, gEdge) => {
    if (!bands) return null;
    const inRun = (b, f) => { for (const [a0, a1] of b.runs) if (f > a0 && f < a1) return Math.min(f - a0, a1 - f) / (a1 - a0); return -1; };
    const core = bands.filter((b) => b.g0 < 0.02 && b.g1 > -0.02);
    let best = null;
    for (let apex = 0.2; apex <= 0.651; apex += 0.01) {
      if (core.some((b) => inRun(b, apex) < 0)) continue;   // the point itself must sit under the fuselage
      const side = (sg) => {
        let bk = 0, bs = -1;
        for (let k = 0; k <= 1.6; k += 0.02) {
          let sc = 0;
          for (const b of bands) {
            const g = (b.g0 + b.g1) / 2;
            if (g * sg <= 0.03 || Math.abs(g) > gEdge) continue;
            const c = inRun(b, apex + k * Math.abs(g));
            if (c >= 0) sc += 1 + c;
          }
          if (sc > bs + 1e-6) { bs = sc; bk = k; }
        }
        return [bk, bs];
      };
      const [kt, st] = side(-1), [kb, sb] = side(1);
      if (!best || st + sb > best.score) best = { apex, kt, kb, score: st + sb };
    }
    return best;
  };

  // ---------------------------------------------------------------------------------------------------------
  // DRAG
  const dragScene = (root, opts = {}) => {
    const o = { ...DEFAULTS, ...opts };
    const stage = root.querySelector(':scope > .scene-stage');
    if (!stage) return null;
    const q = (s) => stage.querySelector(s);
    const rtl = (opts.dir || root.dataset.dir) === 'rtl';
    root.dataset.dir = rtl ? 'rtl' : 'ltr';
    const oldEl = q('.drag-old'), newEl = q('.drag-new'), inner = q('.drag-new__inner');
    const ground = q('.drag-old__ground'), tint = q('.drag-old__tint'), line = q('.drag-old__line'), veil = q('.drag-veil');
    const W = () => stage.clientWidth || window.innerWidth;
    const H = () => stage.clientHeight || window.innerHeight;
    // a long list gets the dense layout (three columns, smaller rows), so 12 short rows still fit one screen
    const list = inner && inner.querySelector('.drag-new__items');
    if (list && list.children.length > 6) root.dataset.dense = ''; else delete root.dataset.dense;

    // the object, in its rig above both pages (never clipped)
    let rig = stage.querySelector(':scope > .drag-rig--object');
    if (!rig) { rig = document.createElement('div'); rig.className = 'drag-rig drag-rig--object'; rig.setAttribute('aria-hidden', 'true'); stage.appendChild(rig); }
    let obj = rig.querySelector('.drag-object');
    const isJet = !obj && o.object === 'jet';
    const bitmap = (cls, size) => { const i = new Image(size, size); i.className = cls; i.alt = ''; i.decoding = 'async'; i.src = BLANK; return i; };
    if (isJet) { obj = bitmap('drag-object drag-object--jet', 1000); rig.appendChild(obj); }
    const span = () => (isJet ? JET_SPAN : obj && obj.naturalWidth > 1 ? obj.naturalHeight / obj.naturalWidth : obj && obj.width && obj.height ? obj.height / obj.width : 1);

    // the shadow, in its own rig inside the new page (so it only ever falls on the new page) and under the
    // page's content (so it never lies on the words)
    let shade = newEl && newEl.querySelector('.drag-shadow');
    let srig = shade ? shade.closest('.drag-rig') : null;
    const { shadow: castShadow } = o;
    if (!shade && obj && newEl && castShadow === true && (isJet || obj.tagName === 'IMG')) {
      srig = document.createElement('div'); srig.className = 'drag-rig drag-rig--shadow'; srig.setAttribute('aria-hidden', 'true'); newEl.insertBefore(srig, newEl.firstChild);
      shade = bitmap('drag-shadow', 600);
      srig.appendChild(shade);
      if (!isJet) shadowFromImage(obj, shade);
    }

    // the outline of the object (see outline()), read once its pixels are in
    let bands = null;
    let refreshSoon = 0;
    const gotOutline = (b) => {
      if (!b) return;
      bands = b;
      // the clip and the words both depend on it: measure again on the next refresh
      if (Stage.live && root.classList.contains('is-live')) { cancelAnimationFrame(refreshSoon); refreshSoon = requestAnimationFrame(() => ScrollTrigger.refresh()); }
    };
    if (obj && !isJet) {
      const read = () => gotOutline(outline(obj, obj.naturalWidth, obj.naturalHeight));
      if (obj.complete && obj.naturalWidth) read(); else obj.decode().then(read).catch(() => {});
    }

    // paint the built-in jet (and its shadow) at the size it will be seen
    const brand = getComputedStyle(root).getPropertyValue('--drag-dark').trim() || '#14204a';
    const paintJet = (L, grow) => {
      if (!isJet) return;
      const px = Math.min(2048, Math.max(600, Math.round(L * grow * DPR() / 100) * 100));
      if (+obj.dataset.px !== px) paintSvg(obj, jetSVG(brand), px, bands ? null : (c) => gotOutline(outline(c, c.width, c.height)));
      const spx = Math.round(Math.min(1200, px * 0.6) / 100) * 100;
      if (shade && +shade.dataset.px !== spx) paintSvg(shade, jetShadowSVG(), spx);
    };
    paintJet(0.8 * W() * 0.62, 1);

    // the scale the object reaches: on a stage taller than wide (a tablet held upright) the plane is longer than
    // the screen is wide, so it grows less there and its tail clears the far edge in one step of the scroll
    const growOf = (v) => (v ? o.phoneGrow : H() > W() ? Math.min(o.grow, o.tallGrow) : o.grow);
    const pieces = veil && o.veil !== false ? [...veil.querySelectorAll(':scope > .drag-veil__piece')].slice(0, 7) : [];
    if (veil && o.veil === false) veil.hidden = true;
    const veilOn = pieces.length > 0;
    const used = () => (geo.vertical ? pieces.slice(0, 4) : pieces);   // the phone uses the first four
    const hold = o.hold ?? (veilOn ? 3 : 2);
    const scrub = o.scrub ?? (Stage.lenis ? true : 0.6);
    // Every picture is decoded before it moves, so no frame of the scroll waits for a decode. Layers are promoted
    // only while the scene is near (.is-near, see CSS), not for as long as the page is open.
    for (const img of root.querySelectorAll('img')) if (img.decode && !img.src.startsWith('data:')) img.decode().catch(() => {});

    // The words of the new page land in the object's wake: each block of text appears once the object's
    // outline has passed it (the pictures it may cross), never before the block above it.
    const words = inner ? [...inner.children].flatMap((c) => (/^(UL|OL)$/.test(c.tagName) ? [...c.children] : [c]))
      .filter((c) => !c.matches('figure, picture, img, video, .drag-rig') && c.textContent.trim()) : [];
    // the fade sits on the elements that hold the text themselves, so each line's own opacity tells the truth
    const ink = words.map((b) => [b, ...b.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())));
    // (an element inside another one that fades only switches, so the two opacities never multiply)
    const nested = ink.map((l) => l.map((e) => l.some((a) => a !== e && a.contains(e))));
    // (each fading element gets its own layer while the scene is near, so a fade step is not a repaint)
    ink.forEach((l, i) => l.forEach((e, k) => { if (!nested[i][k]) e.setAttribute('data-ink', ''); }));
    const shown = ink.map(() => -1);   // last value written, so an unchanged block is left alone
    const GAP = 0.015;    // in drag progress: the step between two blocks landing (each lands on a 0.4s clock)
    // A block that takes keyboard focus before it has landed shows at once (CSS: [data-block]:focus-within), and
    // the page scrolls on to the end of the scene, where it has landed.
    words.forEach((b) => b.setAttribute('data-block', ''));
    root.addEventListener('focusin', (e) => {
      const i = words.findIndex((b) => b.contains(e.target));
      if (i >= 0 && shown[i] < 1) toEnd(trig);
    });

    // geometry, measured on every refresh: object length in px, the seam (point and the depth of each side),
    // the edge's range in %, and when (in drag progress) each block of words may land
    const geo = { L: 0, apex: 0.5, d1: 0, d2: 0, dp: 0, from: -60, to: 160, uIn: 0.3, uOut: 0.7, vertical: false, landAt: [], enter: [] };
    const measure = () => {
      if (!root.classList.contains('is-live')) return;
      const v = geo.vertical, along = v ? H() : W(), across = v ? W() : H();
      const grow = growOf(v);
      const sp = Math.max(0.2, span());
      let L = (v ? o.phoneLen : o.len) * along;
      if (o.bleed !== false && obj) L = Math.max(L, (across * 1.04) / sp);
      const Lp = (L / along) * 100;
      geo.L = L;
      // the seam: given, or fitted to the outline, or a plain chevron
      const fit = o.apex == null && o.sweep == null ? fitSeam(bands, Math.min(0.5, across / 2 / (sp * L))) : null;
      if (fit) {
        geo.apex = fit.apex;
        geo.d1 = (fit.kt * across) / (2 * sp);
        geo.d2 = (fit.kb * across) / (2 * sp);
      } else {
        geo.apex = clamp(+o.apex || 0.5, 0.1, 0.9);
        geo.d1 = geo.d2 = Math.tan((clamp(+(o.sweep ?? 22) || 0, 0, 45) * Math.PI) / 180) * (across / 2);
      }
      const apex = geo.apex, ax = (1 - apex) * 100, axS = ((SHADOW_PAD + 1 - apex) / (1 + 2 * SHADOW_PAD)) * 100;
      geo.dp = (Math.max(geo.d1, geo.d2) / along) * 100;
      geo.from = -apex * Lp - 4;                    // nose just outside the frame
      geo.to = 100 + (1 - apex) * Lp * grow + 2;     // tail just outside the far side
      // how far each clock carries the object (see the pace in drag()): in until SHOW of its outline is on screen,
      // and away from the last moment that much still is (a little less where the object is too long for the
      // screen to show that much at once, a tablet held upright)
      const onScreen = (u) => {
        const len = L * (1 + (grow - 1) * u), nose = ((geo.from + (geo.to - geo.from) * u) / 100) * along + apex * len;
        const f0 = Math.max(0, (nose - along) / len), f1 = Math.min(1, nose / len);
        if (f1 <= f0) return 0;
        if (!bands) return f1 - f0;
        const gE = across / 2 / (sp * len);   // the share of the span on screen either side of the fuselage
        let all = 0, on = 0;
        for (const bd of bands) {
          const h = bd.g1 - bd.g0, inside = clamp((Math.min(bd.g1, gE) - Math.max(bd.g0, -gE)) / h, 0, 1);
          for (const [a0, a1] of bd.runs) { all += (a1 - a0) * h; on += Math.max(0, Math.min(a1, f1) - Math.max(a0, f0)) * h * inside; }
        }
        return all ? on / all : 0;
      };
      let top = 0, most = 0;
      for (let k = 0; k <= 50; k++) { const f = onScreen(k / 50); if (f > most) { most = f; top = k / 50; } }
      const want = Math.min(SHOW, most * 0.9);
      const find = (lo, hi, rising) => {
        for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if ((onScreen(m) >= want) === rising) hi = m; else lo = m; }
        return rising ? hi : lo;
      };
      geo.uIn = find(0, top, true);
      geo.uOut = find(top, 1, false);
      root.style.setProperty('--drag-len', L.toFixed(1) + 'px');
      root.style.setProperty('--drag-d', geo.d1.toFixed(1) + 'px');
      root.style.setProperty('--drag-d2', geo.d2.toFixed(1) + 'px');
      root.style.setProperty('--drag-ax', ax.toFixed(2) + '%');
      if (obj) gsap.set(obj, { xPercent: -ax, transformOrigin: `${ax}% 50%` });
      if (shade) gsap.set(shade, { xPercent: -axS, transformOrigin: `${axS}% 50%` });
      paintJet(L, grow);
      // the cut-out's box is mostly clear: clip it to a stepped hull of its outline (fixed, painted once), so the
      // empty corners of the box lie over nothing, not even for hit-testing
      if (obj && bands) {
        const on = bands.map((bd, i) => {
          const near = bands.slice(Math.max(0, i - 1), i + 2).filter((n) => n.runs.length);
          return near.length ? [Math.min(...near.map((n) => n.runs[0][0])) - 0.015, Math.max(...near.map((n) => n.rear)) + 0.015, bd] : null;
        }).filter(Boolean);
        if (on.length) {
          const X = (f) => (100 * (1 - clamp(f, 0, 1))).toFixed(2) + '%', Y = (g) => (100 * clamp(g + 0.5, 0, 1)).toFixed(2) + '%';
          const last = on.length - 1, y0 = (i, bd) => (i === 0 ? bd.g0 - 0.015 : bd.g0), y1 = (i, bd) => (i === last ? bd.g1 + 0.015 : bd.g1);
          const front = on.flatMap(([f, , bd], i) => [`${X(f)} ${Y(y0(i, bd))}`, `${X(f)} ${Y(y1(i, bd))}`]);
          const rear = on.map((e, i) => [e, i]).reverse().flatMap(([[, r, bd], i]) => [`${X(r)} ${Y(y1(i, bd))}`, `${X(r)} ${Y(y0(i, bd))}`]);
          obj.style.clipPath = `polygon(${[...front, ...rear].join(', ')})`;
        }
      }
      // the cloud: its box keeps the shape the deck was composed for and covers the stage (cropped, never
      // stretched), so the deck closes at any window shape. Each piece comes in from outside the frame, along the
      // line from the middle of the stage through its own middle (the way things move as the view climbs), at
      // full opacity and a little larger than it lands, so no frame shows a half-clear sheet over the photo; one
      // placed in the right half comes in from the right and never crosses the closing line on the left.
      const w0 = W(), h0 = H();
      if (veilOn) {
        const ar = v ? VEIL_PHONE : VEIL_DESK, bw = Math.max(w0, h0 * ar), bh = Math.max(h0, w0 / ar);
        const bx = (w0 - bw) / 2, by = (h0 - bh) / 2;
        Object.assign(veil.style, { left: bx.toFixed(1) + 'px', top: by.toFixed(1) + 'px', right: 'auto', bottom: 'auto', width: bw.toFixed(1) + 'px', height: bh.toFixed(1) + 'px' });
        // at the size it lands (was 1.15, and 1.5 before that): the pieces are placed at two thirds of their
        // own width or less on a 1440 screen, and stay so while they come in
        const s0 = 1, m = 0.02 * Math.max(w0, h0);
        geo.enter = used().map((p) => {
          const hw = p.offsetWidth / 2, hh = p.offsetHeight / 2, cx = bx + p.offsetLeft + hw, cy = by + p.offsetTop + hh;
          let ux = cx / w0 - 0.5, uy = cy / h0 - 0.5;
          if (Math.hypot(ux, uy) < 0.08) { ux = 0; uy = -1; }   // a piece in the middle comes down from the top
          ux *= w0; uy *= h0;
          const n = Math.hypot(ux, uy) || 1;
          ux /= n; uy /= n;
          // how far along that line until its box (at the start scale) is clear of the stage on one side
          const t = Math.min(...[
            ux > 1e-3 ? (w0 + m - cx + hw * s0) / ux : Infinity,
            ux < -1e-3 ? (cx + hw * s0 + m) / -ux : Infinity,
            uy > 1e-3 ? (h0 + m - cy + hh * s0) / uy : Infinity,
            uy < -1e-3 ? (cy + hh * s0 + m) / -uy : Infinity,
          ]);
          return { x: ux * t, y: uy * t, s: s0 };
        });
      }
      // each block: how far along the travel its words end, and the band across the travel they occupy, in px
      // of the stage, measured from the text's own line boxes against the page (so the tow cancels out)
      if (!inner) return;
      const ir = inner.getBoundingClientRect(), rg = document.createRange();
      const blocks = ink.map((l) => {
        let far = -Infinity, c0 = Infinity, c1 = -Infinity;
        for (const e of l) for (const nd of e.childNodes) {
          if (nd.nodeType !== 3 || !nd.nodeValue.trim()) continue;
          rg.selectNodeContents(nd);
          for (const r of rg.getClientRects()) {
            const x0 = r.left - ir.left, x1 = r.right - ir.left, y0 = r.top - ir.top, y1 = r.bottom - ir.top;
            far = Math.max(far, v ? H() - y0 : rtl ? W() - x0 : x1);
            c0 = Math.min(c0, v ? x0 : y0); c1 = Math.max(c1, v ? x1 : y1);
          }
        }
        return { far, c0, c1 };
      });
      // where the back of the object is at drag progress u, over the band a block occupies
      const back = (u, b) => {
        const s = 1 + (grow - 1) * u, A = ((geo.from + (geo.to - geo.from) * u) / 100) * along;
        let rear = 1;   // without an outline: the end of the object's box
        if (bands) {
          const hs = sp * L * s, g0 = (b.c0 - across / 2) / hs, g1 = (b.c1 - across / 2) / hs;
          rear = -1;
          for (const bd of bands) if (bd.g1 > g0 && bd.g0 < g1) rear = Math.max(rear, bd.rear);
          if (rear < 0) rear = apex;   // beyond the wingtips only the seam passes
        }
        return A + (apex - rear) * L * s;
      };
      const margin = 0.012 * along;
      let prev = -Infinity;
      geo.landAt = blocks.map((b) => {
        let u = 1;
        if (Number.isFinite(b.far)) {
          if (back(0, b) > b.far + margin) u = 0;
          else if (back(1, b) > b.far + margin) {
            let lo = 0, hi = 1;
            for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (back(m, b) > b.far + margin) hi = m; else lo = m; }
            u = hi;
          }
        }
        // in reading order across a desktop; on the phone the plane climbs past the lower blocks first, and
        // they land in its wake at once (waiting for the heading at the top left a screen of bare page)
        prev = geo.vertical ? u : Math.max(u, prev + GAP);
        return prev;
      });
    };
    // Each block lands on a clock once the drag passes its moment (never half-faded wherever the scroll
    // stops), and goes back two and a half times as fast when the scroll returns before it. `instant` (after
    // a refresh) sets the state without the fade.
    let landTw = [];
    const land = (u, instant) => geo.landAt.forEach((at, i) => {
      const v = u >= 1 || u >= at ? 1 : 0;
      if (v === shown[i]) return;
      shown[i] = v;
      const t = landTw[i];
      if (!t) { ink[i].forEach((e) => { e.style.opacity = String(v); }); return; }
      if (instant) t.timeScale(1).progress(v).pause();
      else if (v) t.timeScale(1).play();
      else t.timeScale(2.5).reverse();
    });

    // The incoming page has to fit one held screen. When it does not (a long list, a short window), the
    // scene keeps its finished composition there rather than hide words below the stage, and checks again
    // whenever the window changes size.
    const overflows = () => {
      if (!inner) return false;
      const was = root.classList.contains('is-live');
      if (!was) root.classList.add('is-live');
      const over = inner.scrollHeight > inner.clientHeight + 4;
      if (!was) root.classList.remove('is-live');
      return over;
    };
    let fellBack = false;
    const tooTall = () => {
      if (!fellBack) console.warn(ID + ': the new page is taller than the screen here, so the scene shows its finished composition');
      fellBack = true;
      toRest();
    };

    let liveEdge = null, trig = null, resync = null;
    const track = { u: 0 };   // the drag's progress, 0-1
    const drag = (vertical) => (tl) => {
      trig = tl.scrollTrigger || null;
      geo.vertical = vertical;
      if (overflows()) { tooTall(); return; }
      fellBack = false;
      if (document.fonts && document.fonts.status !== 'loaded') {
        document.fonts.ready.then(() => {
          if (!root.classList.contains('is-live') || !overflows()) return;
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.revert();
          tooTall();
          ScrollTrigger.refresh();
        });
      }
      if (obj) gsap.set(obj, { x: 0, y: 0, yPercent: -50, rotation: vertical ? -90 : 0 });
      if (shade) gsap.set(shade, { yPercent: -50, rotation: vertical ? -90 : 0 });
      measure();
      // the moving parts are promoted (will-change, see the CSS) from a screen before the scene until half a
      // screen after it, so the layers are made and painted before the hold, and let go once it is past
      ScrollTrigger.create({
        trigger: root, start: () => 'top bottom+=' + H(), end: () => 'bottom top-=' + Math.round(H() / 2),
        onToggle: (self) => root.classList.toggle('is-near', self.isActive),
      });
      const s = rtl && !vertical ? -1 : 1;
      // The pace. The object comes in and goes away on a clock, never on the scroll, so no frame the reader
      // stops on shows a sliver of nose or of tail. As the scroll passes t0 the clock in runs (about 0.6s): the
      // closing line lifts, the rest of the cloud closes round the nose and the object breaks out of it until
      // about three fifths of it is on screen (geo.uIn). From there the scroll carries it across: sideways it
      // surges (see `surge`: quicker in, slower over the middle while the page arrives under it, quicker
      // away), 'even' keeps a linear pace, and the phone climbs at the same pace. As the scroll passes t1, with
      // about three fifths of it still on screen (geo.uOut), the clock out runs (0.45s) and it speeds away out
      // of the frame. Scrolling back runs each clock backwards, two and a half times as fast. Sideways 0.085-0.90
      // of a 3-screen hold, the phone 0.12-0.88 of a 2.2-screen hold. The object, the page's clip and the words
      // all follow one number (place), so the seam never comes loose.
      const t0 = veilOn ? (vertical ? 0.12 : 0.085) : 0.1, t1 = vertical ? 0.88 : 0.9, dur = t1 - t0;
      const pace = o.pace !== 'even' ? surge : 'none';
      const tint0 = clamp(+o.tint || 0, 0, 0.7);

      // the old chapter closes: the view climbs and darkens, the first two pieces of cloud come in beside the
      // closing line (text and pages fade by opacity, never visibility, so they stay in the accessibility tree)
      if (ground) tl.fromTo(ground, { scale: vertical ? 1.10 : 1.14 }, { scale: 1, duration: vertical ? 0.36 : 0.40 }, 0);
      if (tint && ground) {
        // the flat tint is the old panel's own colour showing through the photo: one layer fewer to composite
        gsap.set(oldEl, { backgroundColor: getComputedStyle(tint).backgroundColor });
        gsap.set(tint, { display: 'none' });
        tl.fromTo(ground, { opacity: 1 - tint0 }, { opacity: 0.25, duration: 0.26 }, 0.05);
      } else if (tint) tl.fromTo(tint, { opacity: tint0 }, { opacity: 0.75, duration: 0.26 }, 0.05);
      const use = veilOn ? used() : [], late = use.slice(2);
      if (veilOn) {
        if (pieces.length > use.length) gsap.set(pieces.slice(use.length), { autoAlpha: 0 });
        // the first two (in the right half on a desktop, the bottom half on a phone) slide in from outside the
        // frame at full opacity while the line is still there (see measure), decelerating into place, both in
        // before t0; the rest come with the clock in
        use.slice(0, 2).forEach((p, i) => {
          const e = (k) => () => (geo.enter[i] ? geo.enter[i][k] : k === 's' ? 1 : 0);
          tl.fromTo(p, { x: e('x'), y: e('y'), scale: e('s') }, { x: 0, y: 0, scale: 1, duration: vertical ? 0.075 : 0.06, ease: 'power1.out' }, (vertical ? 0.02 : 0) + 0.02 * i);
        });
        // the deck drifts back against the flight as the plane passes over it
        tl.fromTo(veil, { scale: 1, x: 0, y: 0 }, vertical ? { scale: 0.88, y: () => 0.1 * H(), duration: dur - 0.08 } : { scale: 0.9, x: () => -0.09 * W() * s, duration: dur - 0.08 }, t0 + 0.08);
      }

      // THE DRAG. One number, the edge (the chevron's point as a % of the stage), places the object's rig and the
      // new page's sheet: each is moved by it, by transform, so the seam never comes loose. The sheet's content
      // moves back by the same amount and stays put. The object scales about the chevron's point.
      const rigPos = (e) => (vertical || rtl ? 100 - e : e);
      const sheetPos = (e) => rigPos(e) - (vertical || rtl ? 0 : 100);   // the sheet's point is its far edge
      const axis = vertical ? 'y' : 'x', along = () => (vertical ? H() : W());
      gsap.set(rig, { x: 0, y: 0, xPercent: 0, yPercent: 0 });
      if (words.length) { gsap.set(ink.flat(), { opacity: 0 }); shown.fill(0); }
      // one clock a block: the elements that hold its text fade up together (an element inside another one
      // that fades only switches, so the two opacities never multiply)
      landTw = ink.map((l, i) => {
        const fade = l.filter((e, k) => !nested[i][k]), sw = l.filter((e, k) => nested[i][k]);
        const t = gsap.timeline({ paused: true });
        if (sw.length) t.fromTo(sw, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, 0);
        if (fade.length) t.fromTo(fade, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out', immediateRender: false }, 0);
        return t;
      });
      // where the drag is: the clock in, the scroll and the clock out, each 0-1, and the late cloud's clock (kept
      // on a plain object: a custom property tweened on the page would restyle the whole page every frame)
      const pos = { in: 0, sc: 0, out: 0, deck: 0 };
      const setRig = gsap.quickSetter(rig, vertical ? 'yPercent' : 'xPercent');
      const setSheet = gsap.quickSetter(newEl, axis, 'px'), setInner = inner && gsap.quickSetter(inner, axis, 'px');
      const setSx = obj && gsap.quickSetter(obj, 'scaleX'), setSy = obj && gsap.quickSetter(obj, 'scaleY');
      let oldOn = -1;
      const place = (instant) => {
        const u = clamp(pos.in * geo.uIn + pos.sc * (geo.uOut - geo.uIn) + pos.out * (1 - geo.uOut), 0, 1);
        const e = geo.from + (geo.to - geo.from) * u, g = 1 + (growOf(vertical) - 1) * u;
        setRig(rigPos(e));
        setSheet((sheetPos(e) / 100) * along());
        if (setInner) setInner((-sheetPos(e) / 100) * along());
        if (obj) { setSx(g * s); setSy(g); }
        if (shade) {
          gsap.set(shade, vertical
            ? { x: -0.05 * W(), y: (0.04 + 0.05 * u) * H(), scale: 0.92 - 0.26 * u, opacity: 0.3 - 0.16 * u }
            : { x: -(0.03 + 0.05 * u) * W() * s, y: (0.06 + 0.06 * u) * H(), scaleX: (0.92 - 0.3 * u) * s, scaleY: 0.92 - 0.3 * u, opacity: 0.32 - 0.18 * u });
        }
        // the new page needs no switch: until the clip's point enters, its polygon has no area (and the layers in
        // it are painted ahead, so its first frame waits for nothing). The old chapter goes once the clip is fully
        // open, so its cloud is no longer composited.
        const on = u < 1 && e < 100 + geo.dp ? 1 : 0;
        if (oldEl && on !== oldOn) { oldOn = on; oldEl.style.opacity = String(on); }
        track.u = u;
        land(u, instant);
      };
      // the late cloud, on the clock in: each piece slides in from outside the frame (see measure), a little
      // after the one before, decelerating into place
      const deck = () => late.forEach((p, i) => {
        const k = clamp(pos.deck * 1.3 - (0.3 * i) / Math.max(1, late.length - 1), 0, 1), q = (1 - k) * (1 - k), g = geo.enter[i + 2];
        if (g) gsap.set(p, { x: g.x * q, y: g.y * q, scale: 1 });
      });
      const clockIn = gsap.timeline({ paused: true });
      if (line) {
        gsap.set(line, { opacity: 1, y: 0 });
        clockIn.fromTo(line, { opacity: 1, y: 0 }, { opacity: 0, y: () => -0.04 * H(), duration: 0.36, ease: 'power2.in', immediateRender: false }, 0);
      }
      if (late.length) { deck(); clockIn.to(pos, { deck: 1, duration: 0.4, ease: 'none', onUpdate: deck }, 0); }
      clockIn.to(pos, { in: 1, duration: 0.5, ease: 'power2.out', onUpdate: () => place() }, 0.12);
      const clockOut = gsap.timeline({ paused: true }).to(pos, { out: 1, duration: 0.45, ease: 'power2.in', onUpdate: () => place() });
      // the clocks follow the scroll's two moments, read from a plain number on the timeline: a scrub that passes
      // a moment runs its clock, and one that returns above it runs the clock back
      const watch = { t: 0 };
      let inOn = false, outOn = false;
      const run = (c, on) => (on ? c.timeScale(1).play() : c.timeScale(2.5).reverse());
      tl.fromTo(watch, { t: 0 }, { t: 1, duration: 1, onUpdate: () => {
        const a = watch.t >= t0, b = watch.t >= t1;
        if (a !== inOn) { inOn = a; run(clockIn, a); }
        if (b !== outOn) { outOn = b; run(clockOut, b); }
      } }, 0);
      track.u = 0;
      liveEdge = gsap.fromTo(pos, { sc: 0 }, { sc: 1, duration: dur, ease: pace, onUpdate: () => place() });
      tl.add(liveEdge, t0);
      place();
      // after a refresh, which renders the timeline without its callbacks: the clocks and the words go straight to
      // where the scroll is, without their fades
      resync = () => {
        inOn = watch.t >= t0; outOn = watch.t >= t1;
        clockIn.pause().progress(inOn ? 1 : 0, true); clockOut.pause().progress(outOn ? 1 : 0, true);
        deck();
        place(true);
      };
      // the new page lags and settles, as if towed
      if (inner) tl.fromTo(inner, vertical ? { yPercent: 5 } : { xPercent: -6 * s }, { xPercent: 0, yPercent: 0, duration: 0.5, ease: 'power2.out' }, t0 + 0.1);
      // a still hold on the finished page
      tl.to({}, { duration: 1 - t1 }, t1);
    };

    // Switching between the live layouts and the finished composition (resize, reduced motion turned on)
    // starts each one from the page's own inline styles, with no transform left behind by the last one.
    const touched = [rig, srig, obj, shade, ground, tint, line, veil, oldEl, newEl, inner, ...pieces, ...ink.flat()].filter(Boolean);
    const own = touched.map((el) => el.getAttribute('style'));
    const clean = () => {
      root.classList.remove('is-near');
      if (!Stage.live) return;
      gsap.set(touched, { clearProps: 'all' });
      touched.forEach((el, i) => (own[i] == null ? el.removeAttribute('style') : el.setAttribute('style', own[i])));
      shown.fill(-1);
      liveEdge = trig = resync = null;
    };
    const built = (vertical) => { const b = drag(vertical); return (tl) => { clean(); b(tl); }; };
    const toRest = () => { root.classList.remove('is-live'); root.classList.add('is-rest'); root.style.removeProperty('--hold'); clean(); };
    const start = () => Stage.scene(root, {
      hold, scrub,
      build: built(false),
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build: built(true) },
      rest: clean,
    });
    if (!Stage.live) return start();

    // very small screens and reduced motion keep the finished composition; elsewhere the scene runs, and its
    // listeners live exactly as long as it does. (Reduced motion is settled here, not left to Stage.scene: its
    // matchMedia only runs when one of its conditions matches, so on a desktop with reduced motion it never ran
    // and the section was left with neither .is-live nor .is-rest.)
    const outer = gsap.matchMedia();
    outer.add({ fits: '(min-width: 360px) and (min-height: 560px)', small: '(max-width: 359px), (max-height: 559px)', still: '(prefers-reduced-motion: reduce)' }, (c) => {
      if (!c.conditions.fits || c.conditions.still) { toRest(); return () => root.classList.remove('is-rest'); }
      let m = start();
      // a refresh (resize, fonts) re-renders the timeline without callbacks, so the words are set again after it
      const onRefreshInit = () => measure();
      const onRefresh = () => { if (resync && root.classList.contains('is-live')) { shown.fill(-1); resync(); } };
      // a window that has shrunk below the new page falls back to the finished composition, and one that has
      // grown enough for it gets the live scene back
      let wait = 0;
      const onResize = () => {
        clearTimeout(wait);
        wait = setTimeout(() => {
          const live = root.classList.contains('is-live'), over = overflows();
          if (!(live && over) && !(!live && fellBack && !over)) return;
          if (m) m.revert();
          clean();
          m = start();   // its build checks the fit again and keeps the finished composition where the page is too tall
          ScrollTrigger.refresh();
        }, 250);
      };
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      window.addEventListener('resize', onResize);
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        window.removeEventListener('resize', onResize);
        clearTimeout(wait);
        cancelAnimationFrame(refreshSoon);
        if (m) m.revert();
        clean();
      };
    });
    return outer;
  };

  // =========================================================================================================
  // PEEL and TEAR. A sheet comes off the page along a fold that sweeps across it. Ahead of the fold the sheet
  // lies flat; just behind it a band of the sheet's back has rolled over (a tube: the back's colour, mirrored
  // across the fold, shaded by flat bands that are blurred once, never a gradient); the rest has lifted away,
  // and what was under the sheet shows. All of it is transform: the flat part sits in a frame turned to the
  // fold, whose edge is the fold, moved along by transform with its content moved back by the same amount; the
  // band is the same frame, mirrored. Every clip is static (painted once per size), so nothing is repainted.
  const mk = (cls, parent) => { const e = document.createElement('div'); e.className = cls; e.setAttribute('aria-hidden', 'true'); if (parent) parent.appendChild(e); return e; };
  // a copy of an element for the moving parts: hidden from assistive tech, no ids, no tab stops
  const copyOf = (el, cls) => {
    const c = el.cloneNode(true);
    for (const e of [c, ...c.querySelectorAll('[id]')]) e.removeAttribute('id');
    c.setAttribute('aria-hidden', 'true');
    c.inert = true;
    c.classList.add(cls);
    return c;
  };
  // a seeded random, so a tear has the same edge on every visit and after every resize
  const rnd = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // paper grain, drawn once into a small tile (a bitmap, not a gradient)
  let grainTile = '';
  const grain = () => {
    if (grainTile) return grainTile;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d'), d = x.createImageData(128, 128), r = rnd(7);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() < 0.5 ? 40 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 10 + r() * 22; }
    x.putImageData(d, 0, 0);
    grainTile = `url("${c.toDataURL('image/png')}")`;
    return grainTile;
  };
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;

  // The fold rig, inside `host` (a full-stage box): the flat frame with `face` (the sheet as it lies), the band
  // frame with `rear` (the sheet's back, which the frame mirrors), the tube's shading strips inside `rearShape`,
  // the tube's own shade on the sheet inside `faceShape`, and the lifted part's shade inside `under` (a
  // full-stage box clipped to where the sheet was). place(s) puts the fold at s along phi.
  const TUBE = [[0, 0.12, 'rgb(0 0 0 / .3)'], [0.12, 0.3, 'rgb(0 0 0 / .1)'], [0.4, 0.62, 'rgb(255 255 255 / .65)'], [0.8, 1.04, 'rgb(0 0 0 / .16)']];
  const foldRig = (host, { face, rear, faceShape, rearShape, under, edge }) => {
    const F = mk('fold-frame', host), Fc = mk('fold-box', F);
    const B = mk('fold-frame', host), Bc = mk('fold-box', B);
    Fc.appendChild(face);
    Bc.appendChild(rear);
    const strips = TUBE.map(([u0, u1, c]) => { const e = mk('fold-strip', rearShape); e.style.background = c; return { e, u0, u1 }; });
    const ahead = mk('fold-shade', faceShape);   // the tube's shadow, falling on the sheet ahead of it
    // A sheet that reaches the stage's edges (a tear): the turned frame's edge is drawn soft where the screen cuts
    // it, so a hairline of what lies below would show along the stage's sides and foot. Under the sheet, square to
    // the screen, 3px strips of its ground follow the fold along those edges and fill that hairline.
    const rims = edge ? ['l', 'r', 't', 'b'].map((k) => { const e = mk('fold-rim', under); e.style.background = edge; return { e, k }; }) : [];
    const behind = mk('fold-shade', under);      // the lifted part's shadow, on what the sheet uncovers
    const g = { L: 0, phi: 0, b: 0, fo: [0, 0], ro: [0, 0], W: 0, H: 0 };
    const size = (W, H, phi, b, fo, ro) => {
      Object.assign(g, { L: Math.ceil(W + H + 40), phi, b, fo, ro, W, H });
      for (const { e, k } of rims) Object.assign(e.style, k === 'l' || k === 'r' ? { width: '3px', height: H + 'px', left: k === 'l' ? '0px' : W - 3 + 'px', top: '0px' } : { width: W + 'px', height: '3px', left: '0px', top: k === 't' ? '0px' : H - 3 + 'px' });
      const L2 = 2 * g.L + 'px';
      F.style.width = L2; F.style.height = L2;
      B.style.width = b + 'px'; B.style.height = L2;
      for (const c of [Fc, Bc]) { c.style.width = W + 'px'; c.style.height = H + 'px'; }
      for (const st of strips) Object.assign(st.e.style, { width: Math.max(1, (st.u1 - st.u0) * b) + 'px', height: L2, filter: `blur(${(b * 0.05).toFixed(1)}px)` });
      Object.assign(ahead.style, { width: b + 'px', height: L2, filter: `blur(${(b * 0.12).toFixed(1)}px)` });
      Object.assign(behind.style, { width: b * 0.7 + 'px', height: L2, filter: `blur(${(b * 0.16).toFixed(1)}px)` });
    };
    const place = (s, shade = 1, shadeAhead = 1) => {
      const { L, phi, b, fo, ro } = g;
      ahead.style.opacity = shadeAhead;
      const turn = `rotate(${phi}rad) translate(${s}px, ${-L}px)`;
      F.style.transform = turn;
      B.style.transform = turn;
      Fc.style.transform = `translate(${-s}px, ${L}px) rotate(${-phi}rad)`;
      Bc.style.transform = `translate(${s}px, ${L}px) scaleX(-1) rotate(${-phi}rad)`;
      for (const st of strips) st.e.style.transform = `translate(${-ro[0]}px, ${-ro[1]}px) rotate(${phi}rad) translate(${s - st.u1 * b}px, ${-L}px)`;
      ahead.style.transform = `translate(${-fo[0]}px, ${-fo[1] + b * 0.1}px) rotate(${phi}rad) translate(${s + b * 0.2}px, ${-L}px)`;
      behind.style.transform = `rotate(${phi}rad) translate(${s - b * 0.7}px, ${-L}px)`;
      behind.style.opacity = shade;
      // each rim covers the part of its edge still ahead of the fold (where x cos + y sin > s)
      const c = Math.cos(phi), sn = Math.sin(phi), { W, H } = g;
      const run = (k, lin, at, len) => {   // ahead where lin * t > at, t along the edge (0..len)
        if (Math.abs(lin) < 1e-6) return at < 0 ? 0 : len * 2;
        const t0 = at / lin;
        return lin > 0 ? Math.max(0, Math.min(len, t0)) : Math.max(-len, Math.min(0, t0 - len));
      };
      for (const { e, k } of rims) {
        if (k === 'l') e.style.transform = `translate(0, ${run(k, sn, s, H)}px)`;
        else if (k === 'r') e.style.transform = `translate(0, ${run(k, sn, s - W * c, H)}px)`;
        else if (k === 't') e.style.transform = `translate(${run(k, c, s, W)}px, 0)`;
        else e.style.transform = `translate(${run(k, c, s - H * sn, W)}px, 0)`;
      }
    };
    return { size, place };
  };

  // The ragged line of a tear: a slow wave, then jitter at three scales (72, 144 and 288 steps across), so the
  // edge reads as torn paper fibre at any size rather than a saw of straight teeth; tilted and centred at `at`.
  const tearEdge = (W, H, o) => {
    // (on a tall, narrow screen the wave and the jitter are smaller, so the edge stays paper, not a saw)
    const r = rnd(o.seed), n = 72, sub = 4, vh = (H / 100) * clamp(W / H, 0.55, 1), tan = Math.tan(((+o.tilt || 0) * Math.PI) / 180);
    const p1 = r() * 6.283, p2 = r() * 6.283, p3 = r() * 6.283, f1 = 0.8 + r() * 0.6, f2 = 2.4 + r() * 1.4;
    // jitter at one scale: k values (-1..1) eased smoothly between, read at t in 0..1
    const noise = (k) => { const v = Array.from({ length: k + 1 }, () => r() * 2 - 1); return (t) => { const f = t * k, i = Math.min(k - 1, Math.floor(f)), s = f - i, e = s * s * (3 - 2 * s); return v[i] + (v[i + 1] - v[i]) * e; }; };
    const coarse = noise(n), mid = noise(n * 2), fibreDepth = noise(n), fibreMid = noise(n * 4);
    const base = (t) => {
      const x = -0.01 * W + t * 1.02 * W, u = x / W;
      return [x, u, o.at * H - (x - W / 2) * tan + 1.6 * vh * Math.sin(6.283 * f1 * u + p1) + 0.9 * vh * Math.sin(6.283 * f2 * u + p2) + 0.62 * vh * coarse(t) + 0.3 * vh * mid(t)];
    };
    const A = [], Bf = [], N = n * sub;
    for (let i = 0; i <= N; i++) {
      const [x, , y] = base(i / N);
      A.push([x, y + 0.14 * vh * (r() * 2 - 1)]);
    }
    // the torn fibre below it: 1-3.5vh deep, its own edge ragged at a finer grain than the tear (loose fibres,
    // twice as many steps, each a hair long), never a row of teeth
    for (let i = 0, N2 = N * 2; i <= N2; i++) {
      const t = i / N2, [x, u, y] = base(t);
      const depth = vh * (1 + 2.5 * (0.5 + 0.5 * Math.sin(6.283 * 1.7 * u + p3))) + 0.45 * vh * fibreDepth(t) + 0.2 * vh * fibreMid(t) + 0.2 * vh * r() * r();
      Bf.push([x, y + Math.max(0.6 * vh, depth)]);
    }
    return { A, B: Bf };
  };

  // Both fold modes: the finished composition on reduced motion and very small screens, the live scene
  // elsewhere, rebuilt from the page's own inline styles each time.
  const FOLD_DEFAULTS = {
    peel: { hold: 1.5, phoneHold: 1.5, angle: -34, phoneAngle: -58, band: 0.09, lift: true, from: 0.12, to: 0.86, ease: 'none', scrub: null },
    tear: { hold: 1.5, phoneHold: 1.5, angle: 163, phoneAngle: 163, band: 0.09, tilt: 11.25, at: 0.55, phoneAt: 0.5, seed: 11, from: 0.04, to: 0.85, ease: 'power1.in', scrub: null },
  };
  const foldScene = (root, mode, opts) => {
    const o = { ...FOLD_DEFAULTS[mode], ...opts };
    const stage = root.querySelector(':scope > .scene-stage');
    if (!stage) return null;
    root.dataset.mode = mode;
    const peel = mode === 'peel';
    const page = stage.querySelector(peel ? ':scope > .peel-page' : ':scope > .tear-new');
    const sheet = stage.querySelector(peel ? ':scope > .peel-sticker' : ':scope > .tear-old');
    if (!page || !sheet) { console.warn(`${ID}: mode "${mode}" needs ${peel ? '.peel-page and .peel-sticker' : '.tear-new and .tear-old'} in the stage`); return null; }
    const W = () => stage.clientWidth || window.innerWidth;
    const H = () => stage.clientHeight || window.innerHeight;
    for (const img of root.querySelectorAll('img')) if (img.decode) img.decode().catch(() => {});
    const artB = peel ? sheet.querySelector('.peel-art--b') : null;

    // the words the sheet covers land once the fold (and the shade behind it) has passed them; the
    // outermost elements that hold text carry the fade
    const holders = [...page.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()));
    const words = holders.filter((e) => !holders.some((a) => a !== e && a.contains(e)));
    const touched = [sheet, page, ...words];
    const own = touched.map((el) => el.getAttribute('style'));
    const made = [];
    let rig = null, faceEl = null, foldEl = null, foldTrig = null;
    root.addEventListener('focusin', (e) => {
      const i = words.findIndex((w) => w.contains(e.target));
      if (rig && i >= 0 && geo.at[i] != null && shown[i] < 1) toEnd(foldTrig);
    });
    const geo = { s0: 0, s1: 1, b: 1, phi: 0, at: [], fade: 1 };
    const k = { v: 0 };
    const clean = () => {
      root.classList.remove('is-near');
      for (const e of made.splice(0)) e.remove();
      touched.forEach((el, i) => (own[i] == null ? el.removeAttribute('style') : el.setAttribute('style', own[i])));
      rig = faceEl = foldEl = foldTrig = null;
    };
    const shown = words.map(() => -1);
    const update = () => {
      if (!rig) return;
      const s = geo.s0 + (geo.s1 - geo.s0) * k.v;
      // the tube's shade grows with the tube (none before the fold reaches the sheet); the lifted part's
      // shade fades over the last of the sweep
      rig.place(s, 1 - Math.max(0, Math.min(1, (k.v - 0.82) / 0.16)), Math.max(0, Math.min(1, (s - geo.lo) / geo.b)));
      geo.at.forEach((at, i) => {
        if (at == null) return;
        const v = Math.round(Math.max(0, Math.min(1, (s - at) / geo.fade)) * 100) / 100;
        if (v !== shown[i]) { shown[i] = v; words[i].style.opacity = String(v); }
      });
    };

    // geometry, on every refresh: the fold's direction, the sweep, the band, the clips and when each block lands
    const measure = () => {
      if (!rig) return;
      const w = W(), h = H(), phone = Stage.phone;
      const phi = ((phone ? +o.phoneAngle : +o.angle) * Math.PI) / 180, c = Math.cos(phi), sn = Math.sin(phi);
      const along = ([x, y]) => x * c + y * sn;
      const sr = stage.getBoundingClientRect();
      let pts, fo = [0, 0], ro = [0, 0];
      if (peel) {
        const r = sheet.getBoundingClientRect(), x0 = r.left - sr.left, y0 = r.top - sr.top;
        pts = [[x0, y0], [x0 + r.width, y0], [x0 + r.width, y0 + r.height], [x0, y0 + r.height]];
        fo = ro = [x0, y0];
        const rad = parseFloat(getComputedStyle(sheet).borderTopLeftRadius) || 0;
        made[0].style.clipPath = `inset(${y0}px ${w - x0 - r.width}px ${h - y0 - r.height}px ${x0}px round ${rad}px)`;   // the 'under' box
        gsap.set(foldEl, { transformOrigin: `${x0 + r.width / 2}px ${y0 + r.height / 2}px` });
      } else {
        // the tear runs between the old chapter's words and the new one's at any window size: its middle stays
        // in that gap, and its slant flattens where the gap is too narrow for it (a short window)
        const tr = document.createRange();
        const textY = (el) => {
          const ys = [];
          for (const n of [el, ...el.querySelectorAll('*')].flatMap((x) => [...x.childNodes])) {
            if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
            tr.selectNodeContents(n);
            for (const r of tr.getClientRects()) if (r.width) ys.push(r.top - sr.top, r.bottom - sr.top);
          }
          return ys;
        };
        const oy = textY(sheet), ny = textY(page), vh = h / 100;
        const top = oy.length ? Math.max(...oy) + 2 * vh : 0, bottom = ny.length ? Math.min(...ny) - 2 * vh : h;
        const swing = 3.3 * vh, fibre = 3.5 * vh;
        const slant = Math.max(0, Math.min((w / 2) * Math.tan(((+o.tilt || 0) * Math.PI) / 180), (bottom - top - 2 * swing - fibre) / 2));
        const lo2 = top + slant + swing, hi2 = bottom - slant - swing - fibre;
        const want = (phone ? +o.phoneAt : +o.at) * h;
        const mid = lo2 <= hi2 ? clamp(want, lo2, hi2) : (top + bottom - fibre) / 2;
        const { A, B } = tearEdge(w, h, { ...o, at: mid / h, tilt: (Math.atan(slant / (w / 2)) * 180) / Math.PI });
        pts = [...A, [w + 2, h + 2], [-2, h + 2]];
        const flap = poly(pts);
        sheet.style.clipPath = poly([[-2, -2], [w + 2, -2], ...A.slice().reverse()]);
        // the flat flap reaches 2px over the tear, so the two halves of the same sheet show no seam while whole,
        // and 24px past the stage's edges (a border in its own ground; its content box stays the stage), so the
        // edge of its turned layer never draws a hairline inside the frame
        const E = 24, xs = (x) => (x < 0 ? x - E : x > w ? x + E : x);
        Object.assign(faceEl.style, { inset: -E + 'px', border: `${E}px solid ${getComputedStyle(sheet).backgroundColor}` });
        faceEl.style.clipPath = poly([...A.map(([x, y]) => [xs(x) + E, y - 2 + E]), [w + 2 * E, h + 2 * E], [0, h + 2 * E]]);
        for (const e of foldEl.querySelectorAll('.tear-back, .fold-under')) e.style.clipPath = flap;
        foldEl.querySelector('.tear-fibre').style.clipPath = poly([...A, ...B.slice().reverse()]);
      }
      const a = pts.map(along), lo = Math.min(...a), hi = Math.max(...a), b = Math.max(24, o.band * (hi - lo));
      // (a tear starts with its corner already curled, a hint of what is coming as the stage arrives)
      Object.assign(geo, { phi, b, lo, hi, s0: peel ? lo - 0.02 * (hi - lo) : lo + 0.35 * b, s1: hi + b + 0.02 * (hi - lo), fade: 0.06 * (hi - lo + b) });
      rig.size(w, h, phi, b, fo, ro);
      // a block lands once all of it is behind the fold and past the shade there, and never before the block
      // before it, so the words arrive in reading order
      // (measured on the text's own line boxes, not the element's box; every covered block lands before the
      // sweep ends, even one that reaches past the sheet)
      let prev = -Infinity;
      const gap = 0.015 * (geo.s1 - geo.s0), last = geo.s1 - geo.fade * 1.2;
      const q = sheet.getBoundingClientRect(), rg = document.createRange();
      geo.at = words.map((e) => {
        const cs = [];
        let under = !peel;
        for (const n of [e, ...e.querySelectorAll('*')].flatMap((x) => [...x.childNodes])) {
          if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
          rg.selectNodeContents(n);
          for (const r of rg.getClientRects()) {
            const x0 = r.left - sr.left, y0 = r.top - sr.top;
            cs.push([x0, y0], [x0 + r.width, y0], [x0, y0 + r.height], [x0 + r.width, y0 + r.height]);
            if (peel && r.right > q.left && r.left < q.right && r.bottom > q.top && r.top < q.bottom) under = true;
          }
        }
        if (!cs.length || !under) return null;
        prev = Math.min(last, Math.max(Math.max(...cs.map(along)) + b * 0.8, prev + gap));
        return prev;
      });
      shown.fill(-1);
    };

    const build = (tl) => {
      clean();
      // the rig: [under] [flat frame] [band frame] in a full-stage box above the page and the sheet
      foldEl = mk('fold', stage);
      made.push(foldEl);
      const under = mk('fold-under', foldEl);
      made.unshift(under);   // made[0]: the 'under' box (its clip is set in measure)
      let face, rear, faceShape, rearShape;
      if (peel) {
        face = faceShape = copyOf(sheet, 'peel-sticker--face');
        rear = mk('fold-box-inner');
        rearShape = copyOf(sheet, 'peel-sticker--back');
        rear.appendChild(rearShape);
        const fs = mk('fold-box-inner');
        fs.appendChild(face);
        face = fs;
        sheet.style.opacity = '0';   // the sticker itself stays in place for assistive tech; its copies move
      } else {
        foldEl.insertBefore(mk('tear-fibre'), under);
        face = faceShape = copyOf(sheet, 'tear-old--face');
        rear = mk('fold-box-inner');
        rearShape = mk('tear-back', rear);
        foldEl.querySelector('.tear-fibre').style.backgroundImage = grain();
        rearShape.style.backgroundImage = grain();
      }
      faceEl = faceShape;
      rig = foldRig(foldEl, { face, rear, faceShape, rearShape, under, edge: peel ? null : getComputedStyle(sheet).backgroundColor });
      measure();
      // (each covered block gets its own layer while the scene is near, so a fade step is not a repaint)
      // (a covered block that takes keyboard focus first shows at once, CSS [data-block]:focus-within, and the
      // page scrolls on to the end of the scene)
      geo.at.forEach((at, i) => { if (at != null) { words[i].style.opacity = '0'; words[i].setAttribute('data-ink', ''); words[i].setAttribute('data-block', ''); } });
      foldTrig = tl.scrollTrigger || null;
      ScrollTrigger.create({
        trigger: root, start: () => 'top bottom+=' + H(), end: () => 'bottom top-=' + Math.round(H() / 2),
        onToggle: (self) => root.classList.toggle('is-near', self.isActive),
      });
      k.v = 0;
      tl.fromTo(k, { v: 0 }, { v: 1, duration: o.to - o.from, ease: o.ease, onUpdate: update }, o.from);
      if (peel && artB) {
        const b2 = faceShape.querySelector('.peel-art--b');
        if (b2) tl.fromTo(b2, { opacity: 0 }, { opacity: 1, duration: 0.001 }, 0.22);
      }
      // the sticker lifts a little and turns as it comes away (less on a phone, where words sit close above it)
      if (peel && o.lift) tl.fromTo(foldEl, { y: 0, rotation: 0 }, { y: () => (Stage.phone ? -0.015 : -0.06) * H(), rotation: () => (Stage.phone ? 1.5 : 3), duration: o.to }, 0);
      tl.to({}, { duration: 1 - o.to }, o.to);
      update();
    };
    const toRest = () => { root.classList.remove('is-live'); root.classList.add('is-rest'); root.style.removeProperty('--hold'); clean(); };
    const start = () => Stage.scene(root, { hold: o.hold, scrub: o.scrub ?? (Stage.lenis ? true : 0.6), build, phone: { hold: o.phoneHold, build }, rest: clean });
    if (!Stage.live) return start();
    const outer = gsap.matchMedia();
    outer.add({ fits: '(min-width: 360px) and (min-height: 560px)', small: '(max-width: 359px), (max-height: 559px)', still: '(prefers-reduced-motion: reduce)' }, (c) => {
      if (!c.conditions.fits || c.conditions.still) { toRest(); return () => root.classList.remove('is-rest'); }
      const m = start();
      const onRefreshInit = () => measure();
      const onRefresh = () => update();   // a refresh re-renders the timeline without callbacks
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        if (m) m.revert();
        clean();
      };
    });
    return outer;
  };

  // ---------------------------------------------------------------------------------------------------------
  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const mode = opts.mode || root.dataset.mode || 'drag';
    if (mode === 'peel' || mode === 'tear') return foldScene(root, mode, opts);
    return dragScene(root, opts);
  };
})();
