// assets/scenes/scatter-and-lock/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / scatter-and-lock.js — one photograph cut into a grid of live cells and scattered
// as shards through real 3D space (depth, twist). The scroll flies the cells home centre-out into a
// gapped contact sheet, snaps them shut edge to edge, swaps them for the one solid poster (its word and
// corner note arrive whole, only then: the shards carry the picture alone, never cut letters), and grows
// that poster to full bleed so the page can carry on from the picture.
// Needs stage.css + stage.js, GSAP 3.15.0 and ScrollTrigger (see stage.js for the script tags).
//
// DOM (one real heading, one real img; the script adds the cells and the flash):
//   <section class="scene" data-scene="scatter-and-lock" data-options='{}' aria-labelledby="sl-h">
//     <div class="scene-stage">
//       <header class="sl-title"><h2 class="sl-headline" id="sl-h">A headline of two lines</h2></header>
//       <div class="sl-field">
//         <div class="sl-frame">
//           <div class="sl-solid">                        the finished poster: no script, reduced motion, after the lock
//             <div class="sl-art">
//               <picture>
//                 <source media="(max-width: 767px), (orientation: portrait)" srcset="poster-4x5.jpg">   4:5 crop
//                 <img class="sl-img" src="poster-16x9.jpg" alt="Describe the photograph" crossorigin="anonymous" fetchpriority="high">
//               </picture>
//               <span class="sl-word">Word</span>            optional: one word, 12 characters or fewer
//               <p class="sl-micro">Two short lines</p>     optional: a corner note on the poster
//             </div>
//           </div>
//         </div>
//       </div>
//       <p class="sl-caption">Optional caption, up to about 24 words.</p>
//     </div>
//   </section>
//   <div class="sl-still" data-scene="scatter-and-lock">        optional, right after the section (with the hand-off):
//     <div class="sl-still-pic" aria-hidden="true">              the exact last frame, held in place when the stage
//       <div class="sl-art">…the same picture (alt="") and word…</div>   releases…
//     </div>
//     <section>…the next section…</section>                     …while the next section rises over it: no cut
//   </div>
//
// The picture: one strong subject near the centre, texture in every part of the frame (moss, water, rock,
// foliage: every shard has to read as a piece of a photograph, not a grey square), mid to light in tone,
// no violet cast. 16:9 at 1920px and 3200px (it is shown at about 1.55x at the end), plus a 4:5 crop at
// 1000px and 1600px for phones and portrait screens. Never lazy-load it. Serve it with CORS (same origin,
// or crossorigin="anonymous" on a host that allows it) so the scene can read it and put its most detailed
// cells in the front of the cloud; without that it falls back to fixed hero cells.
// The word: put it over a dark, quiet part of the photograph (or set --sl-scrim). Check every letter on the
// poster and at full bleed: at least 3:1 against the pixels behind it. The word and the corner note are
// never cut into the shards (a word in flight reads as "T", "ha", "w"): the cells carry the picture only,
// and the word and note fade in whole on the solid poster just after the lock.
// Inside .sl-art, size things in cqi (or in em of something sized in cqi): the art is drawn at two sizes
// (the cells at frame size, the poster at full-bleed size, scaled down until the hand-off), and px would
// differ between them. The micro-copy's 14px floor is already handled (--sl-up).
//
// OPTIONS (data-options JSON) default, range
//   mode "assemble"             "assemble" | "explode" (the reverse: the locked poster shatters into the cloud,
//                               and the title arrives over it at the end; no hand-off; an outro). In explode
//                               the title is hidden at progress 0 (the scene opens on the bare poster), so
//                               never use explode as the first section of a page: the page would open with
//                               no heading in view.
//   hold 1.8 (1.5-4)            screens the stage is held on desktop (2.5 before fix-002); phoneHold 1.8 (1.5-3)
//   scrub 0.6 (0-0.8)           seconds of catch-up; true locks it to the scrollbar
//   cols 5, rows 3              landscape grid, at most 40 cells (5x3, the default since fix-002: pieces big
//                               enough to read as parts of a photograph; 7x4 was the old default, 8x5 a swarm)
//   phoneCols 3, phoneRows 4    phone and portrait grid (4:5 art), at most 20 cells (4x5 before fix-002)
//   heroes "auto"               which cells fill the front of the cloud: "auto" (the most detailed cells of the
//                               photograph, the biggest slot nearest the centre) | "fixed" | [[c,r], …] nearest first
//   phoneHeroes "auto"          the same for the phone and portrait grid
//   perspective 1200 (700-2000) lower is more dramatic; phonePerspective 900
//   depth 800 (600-3000)        how deep the far shards start, in px of z; phoneDepth 600 (500-2000) (2000 and
//                               1200 before fix-002: a deep cloud of small chips left the opening screens empty)
//   near 280 (0-300)            how far in front of the screen the nearest shard starts; phoneNear 160
//   twist 24 (0-45)             rotation of the shards in degrees; 0 = a flat glide, like dealt cards (40 before
//                               fix-002)
//   size 1.3 (0.6-1.8)          the shards' size in the opening cloud, as a share of their cells; they keep it
//                               through most of the flight and give it up as they land (1 before fix-002);
//                               phoneSize 1.5, for the portrait grid
//   drift 0.06 (0-0.15)         share of its flight a parked shard travels while it waits its turn
//   order "centre"              "centre" (out from the middle) | "sweep" (left to right) | "random" (seeded)
//   blur false                  depth blur on the far shards, at most 6px (4px on phones); dropped on 4-core and
//                               saveData devices. Off by default since fix-002 (blur in the scene is a tell)
//   flash 0 (0-0.3)             peak of the white flash when the grid locks; 0 = none (the default since
//                               fix-002: a full-frame white wash reads as glow)
//   handoff true                grow the locked poster to full bleed at the end; false = it rests, framed
//   wordFit                     no effect since fix-002 (it nudged the word so the column cuts fell between
//                               its letters; the word is no longer cut). Accepted and ignored.
//   seed 11                     the random part of the scatter
//   phone "same"                "same" | "rest" (phones get the finished composition)
// CSS custom properties on the section: --sl-bg, --sl-ink, --sl-W (frame width), --sl-word-size,
// --sl-word-x, --sl-word-y, --sl-word-ink, --sl-scrim, --sl-flash (see scatter-and-lock.css).
//
// Timeline (fractions of the hold; every change falls between two tenths, so a stop on a tenth is whole):
// the opening cloud holds to 0.08 (its shards drift a little); title and caption fade out 0.205-0.295
// (opacity only: the heading stays in the accessibility tree); on a portrait screen, where the title ends
// clear above the frame, it stays until the hand-off (0.805-0.83); the cells set off centre-out, the
// first three together at 0.08 and the rest spread evenly to 0.38 (the cells under the title or caption
// from 0.30, once it has gone), each landing 0.22 later (the last at 0.60), so the 10% and 20% steps
// already show pieces flying home (fix-006: 0.25 + 0.16k/(N-1) and 0.19 before, and the title left at
// 0.305-0.395); the grid locks
// 0.60-0.66; flash (when set) 0.658-0.72; the cells swap for the solid poster at 0.665 and its word and
// note fade in whole by 0.69; the poster rests to 0.805, grows to full bleed by 0.895 and holds it to 1, so
// the release never shows a poster still growing. Explode runs the same timeline backwards from 0.805 to 0.
// The opening cloud: the most detailed pieces of the photograph take the near places and the plain ones
// (sky, mist) sink deepest; every shard starts out beyond its own place in the picture, seen from the
// middle, so the outer pieces (which land last) never travel behind pieces that have already landed.
(() => {
  if (!window.Stage) return;
  const ID = 'scatter-and-lock';

  // Places in the opening cloud, nearest first: [ref c, ref r, screen x %, screen y %, z, rotX, rotY, rotZ,
  // blur, opacity]. Which cell fills a place is chosen from the photograph (pick); ref c/r is the fallback.
  const WIDE = {
    cols: 7, rows: 4, near: 280, depth: 2400,
    slots: [
      [3, 1, 62, 52, 280, -12, -24, 5, 1, 1],
      [5, 1, 88, 62, 120, 22, -32, 7, 0, 1],
      [2, 2, 38, 70, -150, 18, 28, -6, 0, 1],
      [4, 2, 80, 30, -420, -26, -20, 9, 0, 1],
      [1, 1, 18, 56, -700, 14, 34, -4, 1, 1],
      [3, 3, 52, 84, -1000, -20, 12, -10, 4, 0.9],
      [6, 0, 72, 16, -1500, 30, -18, 12, 6, 0.8],
      [0, 3, 28, 90, -2000, -28, 22, -9, 8, 0.7],
    ],
  };
  const TALL = {
    cols: 4, rows: 5, near: 160, depth: 1400,
    slots: [
      [1, 2, 64, 50, 160, -12, -22, 5, 1, 1],
      [2, 2, 30, 66, -200, 16, 24, -6, 0, 1],
      [2, 1, 80, 38, -380, -20, -16, 8, 0, 1],
      [1, 3, 70, 82, -600, 18, 20, -8, 2, 0.95],
      [0, 1, 18, 42, -900, -22, 18, 6, 3, 0.85],
      [3, 4, 40, 90, -1200, 24, -14, -10, 5, 0.75],
    ],
  };
  // fix-006: the flights start at 0.08 (0.25 before, which held the cloud unchanged for three tenths), so
  // the 0% step is the whole cloud with the title and the 10% and 20% steps already show pieces flying home
  const FLIGHT = 0.22;
  const START = 0.08; // the opening cloud holds, whole, until here
  const SPREAD = 0.30; // the starts of the flights spread over START to START + SPREAD
  const LANDED = START + SPREAD + FLIGHT; // 0.60: every cell is home by then, and the lock starts
  const SWAP = LANDED + 0.065; // the cells give way to the one solid poster
  const REST = 0.805; // the locked poster rests from SWAP to here
  const BLEED = 0.895; // the hand-off reaches full bleed here and holds it to 1
  // the title and caption leave between the 20% and 30% steps (30-40% before), so the cells under them can
  // fly home from 0.30, inside the spread of the flights
  const TITLE = [0.205, 0.09];
  // when the cell of a rank (0 first, centre-out) sets off: the first three together at START, so the
  // 10% step already shows pieces on their way at every width, the rest spread evenly to START + SPREAD
  const LEAD = 3;
  const startAt = (rank, N) => {
    const g = Math.min(LEAD, N) - 1;
    return rank <= g ? START : START + (SPREAD * (rank - g)) / Math.max(1, N - 1 - g);
  };

  // How badly a shard that starts at s crosses the picture on its way home to h. Both are in half-frames
  // from the frame's centre. A start out beyond its own place (along the ray from the centre through it)
  // costs nothing; a start beside that ray, or nearer the centre than its place, means a flight across the
  // pieces that have already landed. Pieces near the centre land first, into an empty frame: they may
  // start anywhere.
  const crossing = (h, s) => {
    const lh = Math.hypot(h[0], h[1]);
    if (lh < 1e-3) return 0;
    const ux = h[0] / lh;
    const uy = h[1] / lh;
    const along = s[0] * ux + s[1] * uy;
    const side = Math.abs(s[0] * uy - s[1] * ux);
    return lh * (side + 1.5 * Math.max(0, lh + 0.2 - along));
  };

  // A flight's progress along one axis at u, its share of the flight's time (0-1). Route 0, straight:
  // every axis on power3.out. Routes 1 and 2 slide along one axis first, still at depth (home by 60% of the
  // time), then come forward, untwist and move along the other (from 25%): the piece curves round the
  // pieces that have already landed instead of passing behind them, and never drifts off screen.
  // [x, y, depth and twist]: 0 = straight, 1 = leads, -1 = follows. Route 3, lifted (see lifted()): the
  // piece rises in place out of the depth, then glides home just in front of the landed pieces.
  const ROUTES = [[0, 0, 0], [1, -1, -1], [-1, 1, -1]];
  const out3 = (u) => 1 - (1 - u) ** 3;
  const along = (u, how) => {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    return out3(how > 0 ? Math.min(1, u / 0.6) : how < 0 ? Math.max(0, (u - 0.25) / 0.75) : u);
  };
  // The lifted route: rise (depth and twist home by 35% of the time) to a few px in front of the screen,
  // then glide (from 30%) across the screen to the place, settling the last few px of depth on the way.
  // Small enough (2-3% of size) to read as a piece laid down, not as an overshoot.
  const rise = (u) => out3(Math.min(1, Math.max(0, u) / 0.35));
  const glide = (u) => out3(Math.min(1, Math.max(0, (u - 0.3) / 0.7)));
  const liftZ = (z0, lift, u) => z0 * (1 - rise(u)) + lift * rise(u) * (1 - glide(u));

  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const num = (v, d, lo, hi) => {
    const n = Number(v);
    return v === undefined || v === null || v === '' || !Number.isFinite(n) ? d : Math.min(hi, Math.max(lo, n));
  };
  const heroList = (v) => (Array.isArray(v)
    ? v.filter((p) => Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n) && n >= 0))
    : v === 'fixed' ? 'fixed' : 'auto');

  // Back to the authored DOM: what the finished composition and every rebuild start from.
  const clear = (root) => {
    root.querySelectorAll('.sl-cells, .sl-flash[data-sl-made]').forEach((el) => el.remove());
    const field = root.querySelector('.sl-field');
    const frame = root.querySelector('.sl-frame');
    if (field) field.style.removeProperty('perspective');
    if (frame) { frame.style.removeProperty('--cols'); frame.style.removeProperty('--rows'); }
    root.style.removeProperty('--sl-word-dx');
    const solid = root.querySelector('.sl-solid');
    if (solid) solid.style.removeProperty('--sl-up');
    const still = root.nextElementSibling;
    if (still && still.classList.contains('sl-still')) { still.style.removeProperty('--sl-word-dx'); still.style.removeProperty('--sl-up'); }
    root.classList.remove('sl-pending', 'sl-released', 'sl-grow');
    if (root.__slOff) { root.__slOff(); root.__slOff = null; }
  };

  // How much there is to see in each cell of the photograph, from a small copy of the part the frame shows.
  // Local contrast and edge energy, raised for colour, damped for dark cells (they sink into the dark stage)
  // and for cells far from the middle (the subject is usually there). Also each cell's lightness (0-1).
  // Null when the picture cannot be read (no CORS).
  const detail = (img, art, cols, rows) => {
    const nw = img && img.naturalWidth;
    const nh = img && img.naturalHeight;
    const W = art.offsetWidth;
    const H = art.offsetHeight;
    if (!nw || !nh || !W || !H) return null;
    const S = 12;
    const cv = document.createElement('canvas');
    cv.width = cols * S;
    cv.height = rows * S;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    if (!cx) return null;
    // Lay the picture over the frame as object-fit: cover does, then map the frame onto the canvas. Only the
    // aspect of naturalWidth/Height is used: with srcset they are density-corrected, not the file's pixels.
    const s = Math.max(W / nw, H / nh);
    const pos = getComputedStyle(img).objectPosition.split(' ').map((v) => (/%$/.test(v) ? parseFloat(v) / 100 : 0.5));
    const kx = cv.width / W;
    const ky = cv.height / H;
    let px;
    try {
      cx.drawImage(img, (W - nw * s) * (pos[0] ?? 0.5) * kx, (H - nh * s) * (pos[1] ?? 0.5) * ky, nw * s * kx, nh * s * ky);
      px = cx.getImageData(0, 0, cv.width, cv.height).data;
    } catch { return null; }
    const lum = (x, y) => { const i = (y * cv.width + x) * 4; return 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; };
    const score = [];
    const light = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sum = 0; let sq = 0; let edge = 0; let chroma = 0;
        for (let y = 0; y < S; y++) {
          for (let x = 0; x < S; x++) {
            const L = lum(c * S + x, r * S + y);
            const i = ((r * S + y) * cv.width + c * S + x) * 4;
            sum += L; sq += L * L;
            chroma += Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]);
            if (x) edge += Math.abs(L - lum(c * S + x - 1, r * S + y));
            if (y) edge += Math.abs(L - lum(c * S + x, r * S + y - 1));
          }
        }
        const n = S * S;
        const mean = sum / n;
        const sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
        const sat = Math.min(1, (chroma / n / 255) * 2.5);
        const off = Math.hypot((c + 0.5) / cols - 0.5, (r + 0.5) / rows - 0.5) / Math.SQRT1_2;
        light.push(mean / 255);
        score.push((sd + (edge / n)) * Math.min(1, Math.max(0.3, (mean / 255) * 2)) * (0.75 + 0.6 * sat) * (1 - 0.45 * Math.min(1, off)));
      }
    }
    return { score, light };
  };

  function build(tl0, { root, stage, phone }, o) {
    const field = root.querySelector('.sl-field');
    const frame = root.querySelector('.sl-frame');
    const solid = frame && frame.querySelector('.sl-solid');
    const art = solid && solid.querySelector('.sl-art');
    if (!field || !frame || !art) { console.warn('scatter-and-lock: needs .sl-field > .sl-frame > .sl-solid > .sl-art'); return; }
    clear(root);
    // Whenever the stage takes this build down (breakpoint, reduced motion switched on, a turn), the cells,
    // the word nudge and the listeners go with it: a child context is reverted with the stage's.
    gsap.context(() => () => clear(root));
    const title = root.querySelector('.sl-title');
    const caption = root.querySelector('.sl-caption');
    // Portrait screens (phones, and tablets held upright) get the 4:5 art and the tall grid.
    const tall = phone || window.matchMedia('(orientation: portrait)').matches;
    const ref = tall ? TALL : WIDE;
    const explode = o.mode === 'explode';
    // Explode builds the same timeline into a paused one and plays it backwards with the scroll.
    const tl = explode ? gsap.timeline({ paused: true, defaults: { ease: 'none' } }) : tl0;
    const grow = o.handoff && !explode;
    if (grow) root.classList.add('sl-grow');
    const next = root.nextElementSibling;
    const hasStill = !!(next && next.classList.contains('sl-still'));
    const still = hasStill ? next : null;
    // The still is a picture of the poster (aria-hidden): its word is drawn from an attribute, like the
    // cells' copies, so the next section rising over it never counts as covering or crossing real text.
    if (still) {
      const pic = still.querySelector('.sl-still-pic');
      const tw = pic && document.createTreeWalker(pic, NodeFilter.SHOW_TEXT);
      const texts = [];
      for (let n = tw && tw.nextNode(); n; n = tw.nextNode()) if (n.nodeValue.trim()) texts.push(n);
      for (const n of texts) { const s = document.createElement('span'); s.setAttribute('data-sl-text', n.nodeValue); n.replaceWith(s); }
    }

    // A portrait title that ends above the frame stays on screen until the hand-off (see the title's tween).
    const titleStays = tall && !explode && !!title && frame.offsetTop >= title.offsetTop + title.offsetHeight + 24;

    let cols = tall ? o.phoneCols : o.cols;
    let rows = tall ? o.phoneRows : o.rows;
    const most = tall ? 20 : 40;
    while (cols * rows > most) { if (cols >= rows) cols--; else rows--; }
    const N = cols * rows;
    const P = phone ? o.phonePerspective : o.perspective;
    const lift = Math.round(P * 0.03); // how far in front of the screen a lifted piece glides
    field.style.perspective = P + 'px';
    frame.style.setProperty('--cols', cols);
    frame.style.setProperty('--rows', rows);

    // The cells: clones of the poster's picture, each showing its own window of it. The word and the corner
    // note stay on the solid poster alone: cut into shards they would fly as pieces of letters.
    const proto = art.cloneNode(true);
    proto.querySelectorAll('.sl-word, .sl-micro').forEach((el) => el.remove());
    proto.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    proto.querySelectorAll('source').forEach((el) => el.remove());
    proto.querySelectorAll('img').forEach((im) => {
      im.alt = '';
      ['src', 'srcset', 'sizes', 'fetchpriority', 'loading'].forEach((a) => im.removeAttribute(a));
    });
    // The copies' text is drawn by ::before from an attribute: identical glyphs and metrics, but the
    // copies stay out of find-in-page, text selection, the accessibility tree and text checks.
    const walk = document.createTreeWalker(proto, NodeFilter.SHOW_TEXT);
    const words = [];
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.nodeValue.trim()) words.push(n);
    for (const n of words) {
      const s = document.createElement('span');
      s.setAttribute('data-sl-text', n.nodeValue);
      n.replaceWith(s);
    }
    const wrap = document.createElement('div');
    wrap.className = 'sl-cells';
    wrap.setAttribute('aria-hidden', 'true');
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'sl-cell';
        el.style.setProperty('--c', c);
        el.style.setProperty('--r', r);
        el.appendChild(proto.cloneNode(true));
        wrap.appendChild(el);
        cells.push({ el, c, r, i: cells.length });
      }
    }
    let flash = frame.querySelector('.sl-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.className = 'sl-flash';
      flash.dataset.slMade = '';
      flash.setAttribute('aria-hidden', 'true');
    }
    frame.appendChild(wrap);
    frame.appendChild(flash);

    // Where each shard starts.
    const tw = o.twist / 40;
    const depth = phone ? o.phoneDepth : o.depth;
    const near = phone ? o.phoneNear : o.near;
    const zFar = -depth;
    const zNear = -depth * 0.4;
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);
    const blurCap = o.blur && !lowEnd ? (phone ? 4 : 6) : 0;
    const SC = tall ? o.phoneSize : o.size; // the shards' size in the opening cloud, as a share of their cells
    const rotXY = phone ? 24 : 40;
    const rotZ = phone ? 10 : 15;
    const heroOpt = tall ? o.phoneHeroes : o.heroes;
    const want = Array.isArray(heroOpt) ? heroOpt.filter(([c, r]) => c < cols && r < rows).map(([c, r]) => r * cols + c) : [];
    const fixed = ref.slots.map((h) => Math.min(rows - 1, Math.floor(((h[1] + 0.5) / ref.rows) * rows)) * cols
      + Math.min(cols - 1, Math.floor(((h[0] + 0.5) / ref.cols) * cols)));

    // Which cell fills which place in the cloud: the nearest places get the most detailed cells.
    let look = null; // detail() of the photograph, once it can be read
    const pick = () => {
      let wish = want.slice();
      if (look && heroOpt === 'auto') wish = look.score.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).map((p) => p[1]);
      const out = [];
      for (const i of wish.concat(fixed, cells.map((k) => k.i))) {
        if (out.length >= Math.min(ref.slots.length, N)) break;
        if (!out.includes(i)) out.push(i);
      }
      return out;
    };

    // Every start value is read through a function and every flight window from k.s, so a new casting
    // (once the photograph has been read) only needs the timeline invalidated, not rebuilt.
    let G = null;
    let memo = '';
    // A cell's place in the picture, in half-frames from the frame's centre.
    const homeOf = (k) => [((k.c + 0.5) / cols - 0.5) * 2, ((k.r + 0.5) / rows - 0.5) * 2];
    // The values of one place in the opening cloud, scaled to this grid's depth and twist.
    const placeOf = (h) => ({
      sx: h[2], sy: h[3],
      z: Math.min(P - 150, h[4] > 0 ? (h[4] * near) / ref.near : (h[4] * depth) / ref.depth),
      rx: h[5] * tw, ry: h[6] * tw, rz: h[7] * tw, blur: Math.min(blurCap, h[8]), op: h[9],
    });
    let cast = []; // the picked cells, nearest place first
    let behind = 0; // the first place behind the screen
    let deal = false; // deal the places behind the screen by where each piece lands (geo)
    const assign = (heroIdx) => {
      cast = heroIdx.slice();
      const places = ref.slots.slice(0, cast.length);
      behind = places.findIndex((h) => h[4] <= 0);
      if (behind < 0) behind = cast.length;
      // With the photograph read, the places in front of the screen keep their order (the most detailed
      // piece takes the biggest, nearest place); the places behind it are dealt among the other picked
      // pieces in geo(), so none of them waits or travels behind pieces that have already landed.
      deal = !!look && heroOpt === 'auto';
      const slotOf = new Map(cast.map((ci, si) => [ci, places[si]]));
      // Field shards: the more there is to see in a piece, the nearer it floats; plain sky and mist sink
      // deepest (smallest, most blurred), so every shard in view reads as part of the photograph.
      const sink = new Map(); // 0 = the nearest field depth, 1 = the deepest
      if (look) {
        cells.filter((k) => !slotOf.has(k.i)).sort((a, b) => look.score[b.i] - look.score[a.i] || a.i - b.i)
          .forEach((k, j, arr) => sink.set(k.i, arr.length > 1 ? j / (arr.length - 1) : 0));
      }
      const rand = rng(o.seed);
      for (const k of cells) {
        const q = [rand(), rand(), rand(), rand(), rand()]; // drawn for every cell: a field shard's values never depend on the casting
        const h = slotOf.get(k.i);
        k.hero = !!h;
        if (h) {
          Object.assign(k, placeOf(h));
        } else {
          const deep = sink.has(k.i) ? Math.min(1, sink.get(k.i) * 0.85 + q[0] * 0.15) : 1 - q[0];
          k.z = Math.min(P - 150, zNear + (zFar - zNear) * deep);
          k.rx = (q[1] * 2 - 1) * rotXY * tw;
          k.ry = (q[2] * 2 - 1) * rotXY * tw;
          k.rz = (q[3] * 2 - 1) * rotZ * tw;
          // far shards fade a little with depth, but a dark piece of the picture would vanish on the stage
          k.op = Math.min(1, 0.5 + 0.25 * q[4] + (look && look.light[k.i] < 0.3 ? 0.3 : 0));
          k.blur = Math.round(blurCap * (0.35 + 0.65 * ((zNear - k.z) / (zNear - zFar))));
        }
        k.sc = SC;
        k.spx = (k.c - (cols - 1) / 2) * 6; // the contact-sheet gaps, in % of a cell, held through the flight
        k.spy = (k.r - (rows - 1) / 2) * 6;
      }

      // Arrival order: shards in front of the screen leave first (they would hide the assembly), then
      // centre-out with the heroes pulled forward. Cells under the title or caption wait until they have gone.
      let order;
      if (o.order === 'sweep') {
        order = cells.slice().sort((a, b) => (b.z > 0) - (a.z > 0) || a.c + 0.35 * a.r - (b.c + 0.35 * b.r) || a.i - b.i);
      } else if (o.order === 'random') {
        const rr = rng(o.seed + 101);
        order = cells.map((k) => [k, rr()]).sort((a, b) => (b[0].z > 0) - (a[0].z > 0) || b[0].hero - a[0].hero || a[1] - b[1]).map((p) => p[0]);
      } else {
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        const d = (k) => Math.hypot((k.c - cx) / (cols / 2), (k.r - cy) / (rows / 2)) - (k.hero ? 0.25 : 0) - (k.z > 0 ? 1 : 0);
        order = cells.slice().sort((a, b) => d(a) - d(b) || a.i - b.i);
      }
      const keep = [titleStays ? null : title, caption].filter((el) => el && el.offsetWidth).map((el) => [el.offsetLeft, el.offsetTop, el.offsetLeft + el.offsetWidth, el.offsetTop + el.offsetHeight]);
      if (keep.length) {
        const cw = frame.offsetWidth / cols;
        const ch = frame.offsetHeight / rows;
        const fl = frame.offsetLeft;
        const ft = frame.offsetTop;
        const under = (k) => keep.some((b) => fl + (k.c + 1) * cw > b[0] && fl + k.c * cw < b[2] && ft + (k.r + 1) * ch > b[1] && ft + k.r * ch < b[3]);
        // the first rank that starts after the title and caption have gone
        let kMin = 0;
        while (kMin < N && startAt(kMin, N) < TITLE[0] + TITLE[1] + 0.005 - 1e-6) kMin++;
        const out = [];
        const wait = [];
        for (const k of order) {
          if (out.length < kMin && under(k)) wait.push(k);
          else out.push(k);
          if (out.length >= kMin) out.push(...wait.splice(0));
        }
        order = out.concat(wait);
      }
      order.forEach((k, rank) => { k.s = startAt(rank, N); });
      G = null;
    };
    assign(pick());

    // Screen-space geometry, measured again whenever the stage, frame or title change size: where each
    // shard starts (and, for the places behind the screen, which piece starts there).
    const geo = () => {
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      const W = frame.offsetWidth;
      const H = frame.offsetHeight;
      const tb = title ? [title.offsetLeft, title.offsetTop, title.offsetWidth, title.offsetHeight] : [0, 0, 0, 0];
      const cb = caption && caption.offsetWidth ? [caption.offsetLeft, caption.offsetTop] : [];
      const key = [vw, vh, W, H, frame.offsetLeft, frame.offsetTop, grow ? solid.offsetWidth : 0, ...tb, ...cb].join();
      if (G && key === memo) return G;
      memo = key;
      // clear zones in % of the stage: the title block and the caption
      const zones = [];
      if (tb[2]) {
        const x1 = ((tb[0] + tb[2]) / vw) * 100 + 3;
        const y1 = ((tb[1] + tb[3]) / vh) * 100 + 4;
        zones.push(tall ? [-1, -1, 101, Math.max(30, y1)] : [-1, -1, Math.max(54, x1), Math.max(36, y1)]);
      }
      if (cb.length) zones.push([Math.min(66, (cb[0] / vw) * 100 - 3), Math.min(80, (cb[1] / vh) * 100 - 4), 101, 101]);
      const cw = W / cols;
      const ch = H / rows;
      const fx = frame.offsetLeft + W / 2 - vw / 2;
      const fy = frame.offsetTop + H / 2 - vh / 2;
      // How far a shard reaches from its centre, in % of the stage: its projected size at its depth, a
      // little more for its twist, its blur, and a 12px margin. The whole box stays out of the clear zones.
      const turn = 1 + 0.25 * tw;
      const reach = (z, blur) => {
        const g = P / (P - z);
        return [(((cw * g * turn * SC) / 2 + 12 + 2 * blur) / vw) * 100, (((ch * g * turn * SC) / 2 + 12 + 2 * blur) / vh) * 100];
      };
      const blocked = (x, y, e) => zones.some((z) => x + e[0] > z[0] && x - e[0] < z[2] && y + e[1] > z[1] && y - e[1] < z[3]);
      // a place that would touch a clear zone, or let the shard's edge run off the screen (a slab cut by the
      // edge), moves to the nearest free point; failing that, the nearest point clear of the zones
      const inside = (x, y, e) => x - e[0] >= 0 && x + e[0] <= 100 && y - e[1] >= 0 && y + e[1] <= 100;
      const free = (x, y, e) => {
        for (const whole of [true, false]) {
          for (let d = 0; d <= 60; d += 2) {
            for (const [ax, ay] of [[0, d], [0, -d], [d, 0], [-d, 0], [d, d], [-d, d], [d, -d], [-d, -d]]) {
              const nx = x + ax;
              const ny = y + ay;
              if (nx >= 6 && nx <= 94 && ny >= 8 && ny <= 94 && (!whole || inside(nx, ny, e)) && !blocked(nx, ny, e)) return [nx, ny];
            }
          }
        }
        return [x, y];
      };

      // Where each piece lands (px from the stage's centre, the perspective origin) and when it counts as
      // landed (60% through its flight). A shard that waits or flies behind a landed piece shows only as
      // slivers through the gaps: cost() counts the moments a start point would do that along the flight,
      // on each route, and returns the best [cost, route].
      const homeAt = (k) => [((k.c + 0.5) / cols - 0.5) * W + (k.spx / 100) * cw + fx, ((k.r + 0.5) / rows - 0.5) * H + (k.spy / 100) * ch + fy];
      const landed = cells.map((k) => [...homeAt(k), k.s + FLIGHT * 0.6]);
      // (a landed piece's box, grown over half of each gap: a shard centred in a gap is still mostly hidden)
      const hidden = (k, X, Y, t) => landed.some((d, j) => j !== k.i && d[2] <= t && Math.abs(X - d[0]) < cw * 0.54 && Math.abs(Y - d[1]) < ch * 0.54);
      const half = (pt) => [((pt[0] / 100) * vw - frame.offsetLeft - W / 2) / (W / 2), ((pt[1] / 100) * vh - frame.offsetTop - H / 2) / (H / 2)];
      const cost = (k, pt, z) => {
        const tie = 0.05 * crossing(homeOf(k), half(pt));
        if (z > 0) return [tie, 0]; // in front of the screen all the way home: never behind anything
        const sx = (pt[0] / 100 - 0.5) * vw;
        const sy = (pt[1] / 100 - 0.5) * vh;
        const kz = (P - z) / P;
        const [hx, hy] = homeAt(k);
        let best = [Infinity, 0];
        ROUTES.forEach((how, r) => {
          let bad = 0;
          for (const u of [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.36, 0.43, 0.5, 0.6, 0.7]) {
            const g = P / (P - z * (1 - along(u, how[2])));
            const X = (hx + (sx * kz - hx) * (1 - along(u, how[0]))) * g;
            const Y = (hy + (sy * kz - hy) * (1 - along(u, how[1]))) * g;
            if (hidden(k, X, Y, k.s + FLIGHT * u)) bad += u ? 1 : 3; // parked behind: the longest
          }
          const c = bad + tie + (r ? 0.3 : 0); // straight unless a route saves a moment behind
          if (c < best[0]) best = [c, r];
        });
        // lifted: hidden only while still below the screen's plane (rising, or parked)
        let bad = 0;
        for (const u of [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.36, 0.43, 0.5, 0.6, 0.7]) {
          if (liftZ(z, lift, u) >= 0) continue;
          const m = glide(u);
          if (hidden(k, sx + (hx - sx) * m, sy + (hy - sy) * m, k.s + FLIGHT * u)) bad += u ? 1 : 3;
        }
        if (bad + tie + 0.6 < best[0]) best = [bad + tie + 0.6, 3];
        return best;
      };

      // The heroes' places (moved off the clear zones), and who starts in each place behind the screen.
      const places = ref.slots.slice(0, cast.length).map((h) => {
        const v = placeOf(h);
        [v.px, v.py] = free(v.sx, v.sy, reach(v.z, v.blur));
        return v;
      });
      let seat = cast.map((_, si) => si); // seat[si]: which picked piece (index into cast) takes place si
      if (deal && behind < cast.length - 1) {
        const pool = cast.slice(behind).map((ci) => cells[ci]);
        const spots = places.slice(behind);
        const m = pool.map((k, a) => spots.map((v, j) => cost(k, [v.px, v.py], v.z)[0] + 0.02 * Math.abs(a - j)));
        let best = Infinity;
        let got = null;
        const used = pool.map(() => false);
        const seq = [];
        const dfs = (j, acc) => {
          if (acc >= best) return;
          if (j === pool.length) { best = acc; got = seq.slice(); return; }
          for (let a = 0; a < pool.length; a++) {
            if (used[a]) continue;
            used[a] = true; seq.push(a);
            dfs(j + 1, acc + m[a][j]);
            seq.pop(); used[a] = false;
          }
        };
        dfs(0, 0);
        if (got) seat = seat.slice(0, behind).concat(got.map((a) => behind + a));
      }
      const placed = [];
      places.forEach((v, si) => {
        const k = cells[cast[seat[si]]];
        Object.assign(k, v);
        k.route = cost(k, [v.px, v.py], v.z)[1];
        placed.push([v.px, v.py]);
      });

      // The field: Poisson-spaced points that fit the largest field shard, then dealt so the fewest shards
      // wait or travel behind landed pieces (latest first, then any two swap while that helps).
      const field = cells.filter((k) => !k.hero);
      const eField = field.reduce((mx, k) => { const e = reach(k.z, k.blur); return [Math.max(mx[0], e[0]), Math.max(mx[1], e[1])]; }, [0, 0]);
      const ar = vh / vw;
      const pr = rng(o.seed * 7 + 3);
      const yMin = tall ? 32 : 10;
      const gap = tall ? 9 : 7;
      const gapLoose = tall ? 5 : 4;
      // the field keeps every shard whole on the screen (no slab cut by its edge) when it fits
      const fit = (lo, hi, e) => (Math.max(lo, e) <= Math.min(hi, 100 - e) ? [Math.max(lo, e), Math.min(hi, 100 - e)] : [lo, hi]);
      const [xLo, xHi] = fit(6, 94, eField[0]);
      const [yLo, yHi] = fit(yMin, 94, eField[1]);
      const pts = [];
      for (let n = 0; n < field.length; n++) {
        let pt = null;
        let loose = null;
        for (let t = 0; t < 400 && !pt; t++) {
          const x = xLo + (xHi - xLo) * pr();
          const y = yLo + (yHi - yLo) * pr();
          if (blocked(x, y, eField)) continue;
          loose = loose || [x, y];
          const need = t < 200 ? gap : gapLoose;
          if (placed.every(([a, b]) => Math.hypot(a - x, (b - y) * ar) >= need)) pt = [x, y];
        }
        pt = pt || loose || [50, 96];
        pts.push(pt);
        placed.push(pt);
      }
      const mr = field.map((k) => pts.map((pt) => cost(k, pt, k.z)));
      const m = mr.map((row) => row.map((v) => v[0]));
      const own = new Array(field.length);
      const taken = new Set();
      field.map((_, a) => a).sort((a, b) => field[b].s - field[a].s || a - b).forEach((a) => {
        let bj = -1;
        let bc = Infinity;
        pts.forEach((_, j) => { if (!taken.has(j) && m[a][j] < bc) { bc = m[a][j]; bj = j; } });
        own[a] = bj;
        taken.add(bj);
      });
      for (let pass = 0, better = true; better && pass < 8; pass++) {
        better = false;
        for (let a = 0; a < own.length; a++) {
          for (let b = a + 1; b < own.length; b++) {
            if (m[a][own[b]] + m[b][own[a]] < m[a][own[a]] + m[b][own[b]] - 1e-9) { [own[a], own[b]] = [own[b], own[a]]; better = true; }
          }
        }
      }
      field.forEach((k, a) => { [k.px, k.py] = pts[own[a]]; k.route = mr[a][own[a]][1]; });
      // start and home on the screen (px from the stage's centre), and the start in depth
      const sx = [];
      const sy = [];
      const hx = [];
      const hy = [];
      const x0 = [];
      const y0 = [];
      for (const k of cells) {
        const depthK = (P - k.z) / P; // so the shard projects onto its chosen screen point at its depth
        [hx[k.i], hy[k.i]] = homeAt(k);
        sx[k.i] = (k.px / 100 - 0.5) * vw;
        sy[k.i] = (k.py / 100 - 0.5) * vh;
        x0[k.i] = sx[k.i] * depthK - hx[k.i];
        y0[k.i] = sy[k.i] * depthK - hy[k.i];
      }
      // The growing poster is laid out at its full-bleed size (CSS, .sl-grow) and scaled down to the frame
      // until the hand-off: it is rastered once, sharp at its largest, and never again while it grows.
      const SW = grow ? solid.offsetWidth : 0;
      const up = SW && W ? SW / W : 1;
      if (grow) {
        solid.style.setProperty('--sl-up', up.toFixed(4));
        if (hasStill) still.style.setProperty('--sl-up', up.toFixed(4));
      }
      G = { x0, y0, sx, sy, hx, hy, fx, fy, rest: 1 / up };
      return G;
    };

    // Every tween below renders its start state when it is made (immediateRender): a tween first reached by a
    // jump (a page reloaded below the scene, the explode timeline set to its end) then still reverts when the
    // scroll comes back. One tween per element and property, so no start state can overwrite another.

    // 1-2. The title and the caption leave before any shard reaches them. Opacity only: the heading stays in
    // the accessibility tree all through the scene.
    // On a portrait screen the title sits above the frame, clear of every shard: it stays through the
    // assembly and the rest, so no step of the hold is a bare cloud, and leaves as the poster grows.
    if (title && titleStays) {
      if (grow) tl.fromTo(title, { y: 0, opacity: 1 }, { y: -48, opacity: 0, duration: 0.025, ease: 'power2.in' }, REST);
    } else if (title) tl.fromTo(title, { y: 0, opacity: 1 }, { y: -48, opacity: 0, duration: TITLE[1], ease: 'power2.in' }, TITLE[0]);
    if (caption) tl.fromTo(caption, { y: 0, opacity: 1 }, { y: 24, opacity: 0, duration: TITLE[1], ease: 'power2.in' }, TITLE[0]);

    // 4. The lock (made before the flights, whose start state must win): gaps close and the tiles overlap
    // by 1.2% in one decisive snap.
    const els = cells.map((k) => k.el);
    tl.fromTo(els, { xPercent: (i) => cells[i].spx, yPercent: (i) => cells[i].spy, scale: 0.96 },
      { xPercent: 0, yPercent: 0, scale: 1.012, duration: 0.06, ease: 'power4.inOut' }, LANDED);

    // 3. Each cell flies home. Its tweens run from 0 so the whole cloud is placed at every refresh; the ease
    // drifts it a little while it waits, then lands it with power3.out over its own 0.25 of the scroll,
    // x and y each on their own clock when the piece takes a curved route (see ROUTES).
    const soft = gsap.parseEase('power1.out');
    // The lifted route's share of the way on one axis (0 x, 1 y, 2 depth, 3 twist and scale): the screen
    // position glides in a straight line while the depth rises, so x and y are solved back through the
    // perspective from where the piece should show.
    const lifted = (k, axis, u) => {
      if (axis === 3) return rise(u);
      const z = liftZ(k.z, lift, u);
      if (axis === 2) return k.z ? 1 - z / k.z : 1;
      const g = G;
      const a0 = g && (axis ? g.y0[k.i] : g.x0[k.i]);
      if (!a0 || Math.abs(a0) < 0.5) return glide(u);
      const h = axis ? g.hy[k.i] : g.hx[k.i];
      const s0 = axis ? g.sy[k.i] : g.sx[k.i];
      return 1 - (((s0 + (h - s0) * glide(u)) * (P - z)) / P - h) / a0;
    };
    const flight = (k, axis) => (p) => {
      const t = p * LANDED;
      if (t >= k.s + FLIGHT) return 1;
      if (t <= k.s) return o.drift * (t / k.s);
      const u = (t - k.s) / FLIGHT;
      return o.drift + (1 - o.drift) * (k.route === 3 ? lifted(k, axis, u) : along(u, ROUTES[k.route || 0][Math.min(2, axis)]));
    };
    const shrink = (k) => (p) => {
      const t = p * LANDED;
      if (t <= k.s) return 0;
      if (t >= k.s + FLIGHT) return 1;
      const u = (t - k.s) / FLIGHT;
      return u * u * (3 - 2 * u);
    };
    for (const k of cells) {
      // geo() first in every value: it may deal a piece a new place (depth, twist, route) after a resize
      tl.fromTo(k.el, { x: () => geo().x0[k.i] }, { x: 0, duration: LANDED, ease: flight(k, 0) }, 0);
      tl.fromTo(k.el, { y: () => geo().y0[k.i] }, { y: 0, duration: LANDED, ease: flight(k, 1) }, 0);
      tl.fromTo(k.el, { z: () => (geo(), k.z) }, { z: 0, duration: LANDED, ease: flight(k, 2) }, 0);
      tl.fromTo(k.el, {
        rotationX: () => (geo(), k.rx), rotationY: () => (geo(), k.ry), rotationZ: () => (geo(), k.rz),
        xPercent: k.spx, yPercent: k.spy, transformOrigin: '50% 50%', force3D: true,
      }, {
        rotationX: 0, rotationY: 0, rotationZ: 0, duration: LANDED, ease: flight(k, 3),
      }, 0);
      // its size in the cloud (the size option) is kept through most of the flight and given up as it lands,
      // so the converging pieces still fill the screen
      tl.fromTo(k.el, { scale: () => k.sc }, { scale: 0.96, duration: LANDED, ease: shrink(k) }, 0);
    }
    // Depth blur and faint far shards clear as each one sets off: one clock for all cells, and a style is
    // written only when it changes (filter goes back to none as soon as a shard is sharp). The blur steps
    // down in whole pixels: a 1px step on a moving shard does not show, while a radius that changes at every
    // frame makes the compositor size a new blur surface (and, the first time, build a new blur) for every
    // shard at every frame, which is what stalls the first scroll through the scene.
    const clock = { t: 0 };
    const paint = () => {
      const t = clock.t;
      for (const k of cells) {
        const u = Math.max(0, t - k.s);
        const b = k.blur > 0 && u < 0.175 ? Math.round(k.blur * (1 - soft(u / 0.175))) : 0;
        const f = b >= 1 ? `blur(${b}px)` : 'none';
        if (f !== k.f) { k.el.style.filter = f; k.f = f; }
        const op = k.op >= 1 || u >= 0.1 ? '1' : (k.op + (1 - k.op) * soft(u / 0.1)).toFixed(3);
        if (op !== k.o) { k.el.style.opacity = op; k.o = op; }
      }
    };
    tl.fromTo(clock, { t: 0 }, { t: LANDED, duration: LANDED, ease: 'none', onUpdate: paint }, 0);
    paint();

    // 5. The flash, a breath of white as the grid shuts: up to its peak over 0.008, then out over 0.054.
    if (o.flash > 0) {
      const out = gsap.parseEase('power2.out');
      const breath = (p) => { const u = p * 0.062; return u < 0.008 ? u / 0.008 : 1 - out((u - 0.008) / 0.054); };
      tl.fromTo(flash, { autoAlpha: 0 }, { autoAlpha: o.flash, duration: 0.062, ease: breath }, LANDED + 0.058);
    }

    // 6. The swap: one solid poster replaces the cells (no seams can survive the hand-off). Its word and
    // corner note, never part of the shards, fade in whole over the locked picture.
    tl.fromTo(solid, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, SWAP - 0.001);
    tl.fromTo(wrap, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.001 }, SWAP);
    const marks = [...art.querySelectorAll('.sl-word, .sl-micro')];
    if (marks.length) tl.fromTo(marks, { opacity: 0 }, { opacity: 1, duration: 0.024, ease: 'power1.out' }, SWAP + 0.001);

    // 8. The hand-off: the poster grows until it covers the stage on both axes (0.84-0.95), then holds full
    // bleed to the end, so even a lagging scrub has reached it by the time the stage releases.
    if (grow) {
      tl.fromTo(solid, { scale: () => geo().rest, x: 0, y: 0 }, {
        scale: 1, x: () => -geo().fx, y: () => -geo().fy, duration: BLEED - REST, ease: 'power2.inOut',
      }, REST);
    }
    if (explode) {
      tl.set({}, {}, REST);
      tl0.fromTo(tl, { time: REST }, { time: 0, duration: 1, ease: 'none' }, 0);
    }
    // A hand-off still after the section holds the same last frame underneath the stage; once the stage
    // releases (by scroll position), it steps aside and the still carries on. A fast scroll can leave the
    // scrub behind, with the poster still growing when the stage releases: then the still takes the poster
    // over where it is (its place and scale, copied at every update of the timeline) and grows it on to full
    // bleed with the scrub while the next section rises, so the hand-over never jumps. Only a flick that
    // leaves before the cells have even turned into the poster is finished at once.
    if (grow && hasStill) {
      const pic = still.querySelector('.sl-still-pic > .sl-art');
      let released = false;
      let moved = false;
      const follow = () => {
        if (!pic) return;
        const s = +gsap.getProperty(solid, 'scale');
        const x = +gsap.getProperty(solid, 'x');
        const y = +gsap.getProperty(solid, 'y');
        const g = G || geo();
        const at = released && (s < 0.9995 || Math.abs(x + g.fx) > 0.5 || Math.abs(y + g.fy) > 0.5);
        if (at) {
          gsap.set(pic, { xPercent: -50, yPercent: -50, x: g.fx + x, y: g.fy + y, scale: s, force3D: true });
          moved = true;
        } else if (moved) {
          gsap.set(pic, { clearProps: 'transform' });
          moved = false;
        }
      };
      const prev = tl0.eventCallback('onUpdate');
      tl0.eventCallback('onUpdate', function () { if (prev) prev.apply(this, arguments); if (released || moved) follow(); });
      ScrollTrigger.create({
        trigger: root, start: 'bottom bottom', end: 'max',
        onToggle: (self) => {
          released = self.isActive;
          if (released && tl0.time() < 0.765) {
            const lag = tl0.scrollTrigger && tl0.scrollTrigger.getTween();
            if (lag && lag.isActive()) lag.progress(1);
          }
          follow();
          root.classList.toggle('sl-released', released);
        },
      });
    }

    // GSAP sets a tween up the first time the playhead moves past its start. After every invalidation (a
    // refresh, a recast) that would be the first frame of scroll into the scene: some 120 tweens re-reading
    // their cells at once, a frame of 100ms and more. So the timeline is run once to its end and back to
    // where it was, right away, while nobody is watching it move (events suppressed: nothing else runs).
    const warm = () => {
      const t = tl0.totalTime();
      tl0.render(tl0.duration(), true, true);
      tl0.render(t, true, true);
      paint();
    };
    // Recast the cloud with new start values: invalidate, then render the current frame again.
    const recast = () => {
      tl.invalidate();
      if (explode) tl0.invalidate();
      tl0.render(tl0.totalTime(), true, true);
      if (explode) tl.render(tl.totalTime(), true, true);
      warm();
    };
    // The paused explode timeline is not reached by the trigger's invalidateOnRefresh. After a refresh the
    // timeline is set up again at once, and the blur and fade are painted again: a new deal may have given a
    // piece another place.
    const onRefresh = () => { if (explode) tl.invalidate(); };
    const onRefreshed = () => warm();
    ScrollTrigger.addEventListener('refreshInit', onRefresh);
    ScrollTrigger.addEventListener('refresh', onRefreshed);

    // (The word used to be nudged here so the column cuts fell between its letters: the word is no longer
    // cut into the shards, so the wordFit option has nothing left to do.)

    // Shards stay invisible until the photograph is decoded and the fonts are in: never an empty or
    // flashing cell, never a word that shifts between the copies. When the picture switches source (the
    // 4:5 and 16:9 crops after a turn or a breakpoint, a sharper candidate), the cells wait again, and the
    // cloud is cast again from the new picture.
    const img = art.querySelector('img');
    if (img && img.loading === 'lazy') img.loading = 'eager';
    const clones = [...wrap.querySelectorAll('img')];
    let shown = '';
    let turn = 0;
    const settle = () => {
      const my = ++turn;
      const live = () => my === turn && wrap.isConnected;
      root.classList.add('sl-pending');
      (img ? img.decode().catch(() => {}) : Promise.resolve())
        .then(() => {
          if (!live()) return null;
          shown = img ? img.currentSrc || img.src : '';
          if (shown) clones.forEach((im) => { if (im.getAttribute('src') !== shown) im.src = shown; });
          return Promise.all([...clones.map((im) => im.decode().catch(() => {})), document.fonts ? document.fonts.ready : null]);
        })
        .then((ok) => {
          if (!ok || !live()) return;
          look = detail(img, art, cols, rows);
          if (look) { assign(pick()); recast(); }
          root.classList.remove('sl-pending');
          // the still's copy of the picture, decoded long before the release shows it
          if (grow && hasStill) still.querySelectorAll('img').forEach((im) => { if (im.decode) im.decode().catch(() => {}); });
        });
    };
    const onLoad = () => { if ((img.currentSrc || img.src) !== shown) settle(); };
    if (img) img.addEventListener('load', onLoad);
    root.__slOff = () => {
      turn++;
      if (img) img.removeEventListener('load', onLoad);
      ScrollTrigger.removeEventListener('refreshInit', onRefresh);
      ScrollTrigger.removeEventListener('refresh', onRefreshed);
    };
    settle();
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const o = {
      mode: opts.mode === 'explode' ? 'explode' : 'assemble',
      hold: num(opts.hold, 1.8, 1.5, 4),
      phoneHold: num(opts.phoneHold, 1.8, 1.5, 3),
      scrub: opts.scrub === true ? true : num(opts.scrub, 0.6, 0, 0.8),
      cols: Math.round(num(opts.cols, 5, 3, 10)),
      rows: Math.round(num(opts.rows, 3, 2, 8)),
      phoneCols: Math.round(num(opts.phoneCols, 3, 2, 6)),
      phoneRows: Math.round(num(opts.phoneRows, 4, 2, 8)),
      heroes: heroList(opts.heroes),
      phoneHeroes: heroList(opts.phoneHeroes),
      perspective: num(opts.perspective, 1200, 700, 2000),
      phonePerspective: num(opts.phonePerspective, 900, 600, 1600),
      depth: num(opts.depth, 800, 600, 3000),
      phoneDepth: num(opts.phoneDepth, 600, 500, 2000),
      near: num(opts.near, 280, 0, 300),
      phoneNear: num(opts.phoneNear, 160, 0, 300),
      twist: num(opts.twist, 24, 0, 45),
      size: num(opts.size, 1.3, 0.6, 1.8),
      phoneSize: num(opts.phoneSize, 1.5, 0.6, 1.8),
      drift: num(opts.drift, 0.06, 0, 0.15),
      order: opts.order === 'sweep' || opts.order === 'random' ? opts.order : 'centre',
      blur: opts.blur === true,
      flash: num(opts.flash, 0, 0, 0.3),
      handoff: opts.handoff !== false,
      // wordFit: accepted and ignored (see the header)
      seed: Math.round(num(opts.seed, 11, 0, 1e9)),
    };
    const run = (tl, ctx) => build(tl, ctx, o);
    const make = () => Stage.scene(root, {
      hold: o.hold,
      scrub: o.scrub,
      build: run,
      phone: opts.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build: run },
      rest: () => clear(root),
    });
    let mm = make();
    // The stage rebuilds on its own when the phone breakpoint or reduced motion changes; turning a tablet
    // (or a window) between landscape and portrait swaps the art and the grid, so rebuild then too.
    if (mm && window.matchMedia) {
      const q = window.matchMedia('(orientation: portrait)');
      const turn = () => {
        if (Stage.phone || Stage.reduced) return;
        mm.revert();
        mm = make();
        ScrollTrigger.refresh();
      };
      if (q.addEventListener) q.addEventListener('change', turn); else q.addListener(turn);
    }
    return mm;
  };
})();
