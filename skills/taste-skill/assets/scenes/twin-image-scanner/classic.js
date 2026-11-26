// assets/scenes/twin-image-scanner/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / twin-image-scanner.js — one subject in two registered versions; a scan line
// rises with the scroll and rewrites everything it passes, headline included, from the surface (a
// photograph on the page's light ground) into its structure (a line drawing on the page's dark ground),
// then the parts it found are named. For "under the hood" moments: machines, objects, buildings, before
// and after. Needs stage.js and stage.css.
//
// crosses words: `.ts-layer--b` the scan rewrites the headline in place: B repeats it word for word in
// register (same box, same --ts-fit), so the edge recolours every glyph whole, and the line passes the
// words in about one step (the slow band ends 24px under them). Keep B's copy identical to A's.
//
// MARKUP (copy it, fill it; the B layer repeats the copy word for word, only the colours change)
//
//   <section class="scene" data-scene="twin-image-scanner" data-options='{"hold":2.5}' aria-labelledby="ts-title"
//            style="--ts-zoom:2; --ts-fx:48%; --ts-fy:56%; --ts-phone-zoom:1.6; --ts-edge:34%">
//     <div class="scene-stage">
//       <div class="ts-layer ts-layer--a">
//         <div class="ts-copy">
//           <h2 class="ts-title" id="ts-title">Headline, two lines at most</h2>
//           <div class="ts-outro"><p>18 to 30 words.</p><a class="ts-cta" href="#">Two or three words</a></div>
//         </div>
//         <figure class="ts-frame"><div class="ts-subject">
//           <img class="ts-img" src="object.webp" alt="What the object is" width="1600" height="2000">
//         </div></figure>
//       </div>
//       <div class="ts-layer ts-layer--b" aria-hidden="true" inert>
//         <div class="ts-inner">
//           <div class="ts-copy">… the same copy, the CTA as <span class="ts-cta"> …</div>
//           <div class="ts-frame"><div class="ts-subject">
//             <img class="ts-img" src="object-structure.svg" alt="" width="1600" height="2000">
//           </div></div>
//         </div>
//       </div>
//       <div class="ts-head" aria-hidden="true">
//         <i class="ts-line"></i>
//         <span class="ts-tag ts-tag--a">Surface material</span>
//         <span class="ts-tag ts-tag--b">What is under it</span>
//       </div>
//       <div class="ts-marks"><div class="ts-frame"><ul class="ts-subject" aria-label="Parts">
//         <li class="ts-callout" style="--x:37%;--y:46%"><i class="ts-callout__dot"></i><i class="ts-callout__leader"></i><span class="ts-callout__label">Part name</span></li>
//         <li class="ts-callout is-focus" style="--x:52%;--y:46%">…</li>   (one is-focus: the core, the line slows over it)
//       </ul></div></div>
//     </div>
//   </section>
//
// THE TWO PICTURES, best first:
//  1. A cut-out photograph or render (transparent ground, WebP/AVIF) and a line drawing of the same
//     canvas: two passes from one 3D camera, or a drawing traced over the photograph at 1:1 in a vector
//     app. Light strokes, dashed for the hidden parts that make it an x-ray, an accent fill on the core
//     only. Every line is content, so none is under 2 px on screen, phone included. Recipe:
//       - the same viewBox as the photograph's pixels (1600x2000 for a 1600x2000 picture), no margin of
//         its own, so the two register; check with ?ts-debug (B at 50% in difference: contours cancel);
//       - trace three kinds of path: class o for the silhouette, i for visible inner edges, h (dashed)
//         for the hidden parts behind the shell: the mechanism, the frame, what the scan is there to show;
//         one closed path of class core over the part under the is-focus dot;
//       - in its <style>: path { vector-effect: non-scaling-stroke } and stroke widths in CSS px of the
//         picture box (they are then multiplied by --ts-zoom on screen, whatever the screen size):
//         o 1.9, i 1.4, h 1.4 dashed 5 3.75, core 1.4 with fill-opacity .24 (the demo, at zoom 2 and
//         1.6: 3.8 / 2.8 / 2.8 px on desktop, 3 / 2.2 / 2.2 px on the phone). For --ts-zoom z use
//         widths of at least 2.2 / z for the smallest zoom the page uses (a little over the 2 px floor);
//       - one stroke colour (the dark side's ink) and the accent only on the core; under about 120 KB.
//     The script repaints the drawing in the page's colours (it fetches the file again: same origin, or
//     a host that sends CORS headers): every colour in it becomes --ts-accent, a light grey or white
//     --ts-ink-b, a dark grey or black --ts-ground-b. So draw it in the defaults (#ece6d8 and #c8f03c)
//     and it follows any page; visitors without script see the file's own colours.
//     the demo's typewriter-structure.svg (on the scene-media branch) is a complete example.
//  2. Only one photograph, shot on white: give the section class="ts-cutout" and the B img the same src
//     plus data-trace="lines". The script reads the photograph once (off the main thread; a same-origin
//     picture, or a host that sends CORS headers, which it fetches again itself), cuts away the white
//     ground and the soft shade the object casts on it (--ts-lift 1-1.3, default 1.15: how far the ground
//     is lifted to white), and draws the structure from it: a 3.5 px silhouette, 2 px inner contours (a
//     thin rim or seam is drawn once, down its middle, not as two edges), and an accent outline round the
//     part under the is-focus dot if that is a closed shape. B stays hidden until the drawing is ready,
//     then fades in; both are redone if the picture grows 1.3x (rotation, resizing).
//     Edge tracing only draws what has contrast; it reveals nothing hidden, so prefer option 1.
//     Without script, or if the picture cannot be read, the photograph shows through a multiply blend and
//     B shows it as a negative (data-trace="negative" keeps that look on purpose).
// Never put crossorigin on either img: a host that sends no CORS headers would then refuse the picture
// outright, on both layers. The script asks for CORS on a copy of its own when it needs the pixels.
// While the scene runs, B's drawing and the wake (the accent band under the line) show from canvases
// drawn once from B's picture, so a heavy SVG is rasterised once at load, not as the line uncovers it;
// for an SVG drawing the script fetches the file again for that (same origin, or a host that sends
// CORS headers). Where it cannot, B shows its img and the wake falls back to a CSS mask: the same
// look, but more to paint while scrolling.
// Portrait 4:5 canvas, the subject centred. Tighten the framing with --ts-zoom (1-2.4) about the point
// --ts-fx / --ts-fy (% of the picture); --ts-phone-zoom does the same in the one-column layout (phones and
// portrait tablets). Both pictures and every callout get the same framing, so they stay registered.
// Callout --x / --y are % of the PICTURE (read them off the photograph), not of the frame.
// --ts-edge (default 44%, 30-50%) is where the finished composition splits: put it below the headline
// and just above the callout dots. --ts-phone-edge (default 34%) does the same for the phone's figure.
// A callout whose dot sits above that split (on the photograph) gets class="is-above": without script it
// is not shown, so no label ever sits on the surface. With script the scene works this out itself.
// The tags ride the line just left of the picture; where the headline reaches that far (laptop sizes)
// they leave quickly as the line enters the slow band round the core (in one column: just before the
// line comes to the headline), so they never cover a letter or linger half faded.
//
// COLOURS come from the page: --ground and --ink (B swaps them), --accent for the line, the wake, the
// callout marks and the drawing's core (lime #c8f03c if the page has none; it must read on the dark
// ground), --font-display,
// --font-text, --margin, --gutter. Override per scene with --ts-ground-a, --ts-ink-a, --ts-ground-b,
// --ts-ink-b, --ts-accent. The section after the scene should start on the dark ground (--ink).
//
// OPTIONS (data-options, JSON)       default   range
//   hold        screens held, desktop   2.5     1.5-3
//   phoneHold   screens held, phone     2       1.5-3
//   park        where the line waits at progress 0, % of the stage from the top   92   80-96
//   phonePark   the same in the one-column layout                                 88
//   focus       centre of the slow band, % of the stage; null = the is-focus callout's dot   (30-70)
//   band        height of the slow band, % of the stage              16      12-24
//   slow        speed inside the band, relative to outside            0.56    0.4-1 (1 = even)
//   scale       subject scale at the start, eases to 1                1.12    1-1.16
//   phoneScale                                                        1.08
//   wake        accent band of fresh lines under the line, % of the stage, 0 = none   5   0-10
//   detail      trace sensitivity, more lines above 1                  1       0.6-1.6
//   scrub       true with Lenis, else 0.6 (seconds of catch-up)
//   debug       true (or ?ts-debug in the URL): B at 50% in difference, contours must cancel
//
// TIMELINE (0-1): the line waits at park to 0.06, rises to the top of the stage by 0.78 (slower across
// the focus band: about 0.6 px per px scrolled outside it, 0.33 inside at 1440x900), the subject eases
// from scale 1.12 to 1 over the same stretch; each callout opens just after the line has passed its dot;
// line, tags and wake fade at 0.74-0.78; the outro and its action rise in at 0.80-0.92 (in the one-column
// layout they replace the headline in its slot); 0.92-1 holds the annotated drawing. Phones and portrait
// tablets (up to 1024px wide) run the same idea in one column; a phone under 360px wide or 640px tall,
// reduced motion and no script get the finished composition: the stage split at --ts-edge (in one
// column: the words, then a full-bleed figure split at --ts-phone-edge that ends on the dark ground)
// with the line, both tags and every callout showing.
//
// CONTENT. Headline 4-8 words, two lines at most: the script fits it to its column (beside the picture
// a short one grows up to 1.25x, a long one shrinks rather than take a third line); outro 18-30 words
// (18 or fewer reads best on the phone, where it takes the headline's place, and the picture moves down
// at the end as far as it must to clear it); tags 1-2 words naming the two materials; 1 to 12
// callouts, 3 words or fewer each. Labels never overlap each other or the words: one that would is
// moved to the other side of its dot, nudged, or set above or below it, and shown as a dot alone if
// none of these fits. The focus is always named: it is placed first, and if every place is blocked by
// other dots, the dots under its label are dropped. In one column at most 6 labels show (the focus
// first, then in order); the rest are dots. A dot that falls outside the picture (its zoomed, cropped
// box) or off the stage is not shown.
// If the B copy is left out the script copies the A copy into B, but then visitors without script see
// no outro on the dark half: keep it.
(() => {
  const ID = 'twin-image-scanner';
  const COLUMN = '(max-width: 767px), (max-width: 1024px) and (orientation: portrait)';
  const TINY = '(max-width: 359px), (max-height: 639px) and (max-width: 767px)';
  const COLUMN_LABELS = 6;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const out3 = (t) => 1 - Math.pow(1 - clamp(t), 3);

  // ---- colour helpers --------------------------------------------------------------------------
  let cx2 = null;
  // any CSS colour as [r, g, b, a], or null if it is not one
  const colourOf = (str) => {
    const s = (str || '').trim();
    if (!s) return null;
    cx2 = cx2 || document.createElement('canvas').getContext('2d');
    if (!cx2) return null;
    cx2.fillStyle = '#010203';
    try { cx2.fillStyle = s; } catch { return null; }
    const v = cx2.fillStyle;
    if (v === '#010203' && !/^#010203$/i.test(s)) return null;
    if (v[0] === '#') return [...[1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)), 1];
    const m = v.match(/[\d.]+/g);
    return m ? [+m[0], +m[1], +m[2], m[3] != null ? +m[3] : 1] : null;
  };
  const rgbOf = (str, fallback) => (colourOf(str) || colourOf(fallback) || [236, 230, 216]).slice(0, 3);
  // the drawing in the page's colours. By the recipe it has one light stroke colour and one accent:
  // any colour (chroma) becomes the accent, a light grey or white B's ink, a dark grey or black B's
  // ground (a shape that hides the lines behind it). Returns the new SVG text, or null if nothing changes
  const repaint = (text, ink, ground, acc) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
    let changed = false;
    const to = (c) => {
      const [r, g, b, a] = c;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b), L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const t = chroma > 48 ? acc : L > 0.5 ? ink : ground;
      if (t[0] !== r || t[1] !== g || t[2] !== b) changed = true;
      return a < 1 ? `rgba(${t.join(',')},${a})` : `rgb(${t.join(',')})`;
    };
    const inText = (s) => s.replace(/(?<!url\()#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\([^)]*\)/gi, (m) => { const c = colourOf(m); return c ? to(c) : m; });
    for (const s of svg.getElementsByTagName('style')) s.textContent = inText(s.textContent);
    for (const el of [svg, ...svg.getElementsByTagName('*')]) {
      for (const at of ['fill', 'stroke', 'stop-color', 'color', 'flood-color']) {
        const v = el.getAttribute(at);
        if (!v || /^(none|currentcolor|inherit|transparent)$/i.test(v.trim()) || /url\(/i.test(v)) continue;
        const c = colourOf(v);
        if (c) el.setAttribute(at, to(c));
      }
      const st = el.getAttribute('style');
      if (st) el.setAttribute('style', inText(st));
    }
    return changed ? new XMLSerializer().serializeToString(svg) : null;
  };

  // ---- the picture work: cut-out and trace, from one read of the photograph ---------------------------
  // o.k = processing pixels per CSS pixel at display size: blur, thresholds and stroke weights stay the
  // same on screen whatever resolution the picture is processed at. Returns
  //   cut    RGBA, the photograph with its white ground and soft shade made transparent (o.cutout)
  //   stroke alpha of the drawing: the silhouette about 3 px wide, inner contours about 1.5 px (o.trace)
  //   fill   alpha of the closed shape under the focus point, or null
  function analyse(px, w, h, o) {
    const n = w * h, k = o.k, detail = o.detail;
    const L = new Float32Array(n);
    for (let i = 0, j = 0; i < n; i++, j += 4) L[i] = (0.2126 * px[j] + 0.7152 * px[j + 1] + 0.0722 * px[j + 2]) / 255;
    const blur = (src, sigma) => {
      const r = Math.ceil(sigma * 2.5), K = new Float32Array(2 * r + 1);
      let ks = 0;
      for (let i = -r; i <= r; i++) { K[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); ks += K[i + r]; }
      for (let i = 0; i < K.length; i++) K[i] /= ks;
      const T = new Float32Array(n), G = new Float32Array(n);
      for (let y = 0; y < h; y++) {
        const row = y * w;
        for (let x = 0; x < w; x++) {
          let s = 0;
          for (let i = -r; i <= r; i++) { const xx = x + i < 0 ? 0 : x + i >= w ? w - 1 : x + i; s += K[i + r] * src[row + xx]; }
          T[row + x] = s;
        }
      }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let s = 0;
          for (let i = -r; i <= r; i++) { const yy = y + i < 0 ? 0 : y + i >= h ? h - 1 : y + i; s += K[i + r] * T[yy * w + x]; }
          G[y * w + x] = s;
        }
      }
      return G;
    };
    // chamfer distance to the nearest seed pixel, in pixels
    const dist = (seed) => {
      const D = new Float32Array(n), F = 1e9, q = 1.4142;
      for (let i = 0; i < n; i++) D[i] = seed[i] ? 0 : F;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; let m = D[i];
        if (!m) continue;
        if (x > 0 && D[i - 1] + 1 < m) m = D[i - 1] + 1;
        if (y > 0) {
          if (D[i - w] + 1 < m) m = D[i - w] + 1;
          if (x > 0 && D[i - w - 1] + q < m) m = D[i - w - 1] + q;
          if (x < w - 1 && D[i - w + 1] + q < m) m = D[i - w + 1] + q;
        }
        D[i] = m;
      }
      for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x; let m = D[i];
        if (!m) continue;
        if (x < w - 1 && D[i + 1] + 1 < m) m = D[i + 1] + 1;
        if (y < h - 1) {
          if (D[i + w] + 1 < m) m = D[i + w] + 1;
          if (x < w - 1 && D[i + w + 1] + q < m) m = D[i + w + 1] + q;
          if (x > 0 && D[i + w - 1] + q < m) m = D[i + w - 1] + q;
        }
        D[i] = m;
      }
      return D;
    };
    const stack = new Int32Array(n);

    // 1. the ground: the light, smooth area connected to the border (the white paper and the soft
    //    shade cast on it); the subject is what is left, specks excluded
    const border = [];
    for (let x = 0; x < w; x += 2) border.push(L[x], L[(h - 1) * w + x]);
    for (let y = 0; y < h; y += 2) border.push(L[y * w], L[y * w + w - 1]);
    border.sort((a, b) => a - b);
    const bg = border[border.length >> 1];
    let ground = null, subj = null, subjArea = 0;
    if (bg > 0.55) {
      const S = blur(L, Math.max(0.8, (1.5 * w) / 1600));
      const slope = new Float32Array(n);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x, gx = S[i + 1] - S[i - 1], gy = S[i + w] - S[i - w];
        slope[i] = Math.sqrt(gx * gx + gy * gy) * 0.5 * w; // luminance per picture width
      }
      ground = new Uint8Array(n);
      const ok = (i) => L[i] > bg * 0.42 && slope[i] < 25;
      let sp = 0;
      const seed = (i) => { if (!ground[i] && ok(i)) { ground[i] = 1; stack[sp++] = i; } };
      for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
      for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
      while (sp) {
        const i = stack[--sp], x = i % w;
        if (x > 0) seed(i - 1);
        if (x < w - 1) seed(i + 1);
        if (i >= w) seed(i - w);
        if (i < n - w) seed(i + w);
      }
      // the dark rim of that shade, right against the subject
      const rimPasses = Math.max(2, Math.round(2 * k));
      for (let p = 0; p < rimPasses; p++) {
        const add = [];
        for (let i = w; i < n - w; i++) {
          if (ground[i] || L[i] <= bg * 0.5 || slope[i] >= 56) continue;
          if (ground[i - 1] || ground[i + 1] || ground[i - w] || ground[i + w]) add.push(i);
        }
        for (const i of add) ground[i] = 1;
      }
      // keep the subject: the biggest piece and any piece at least 5% of it
      const lab = new Int32Array(n), areas = [0];
      for (let s = 0; s < n; s++) {
        if (ground[s] || lab[s]) continue;
        const id = areas.length; let cnt = 0; sp = 0;
        stack[sp++] = s; lab[s] = id;
        while (sp) {
          const i = stack[--sp], x = i % w; cnt++;
          for (let dy = -w; dy <= w; dy += w) for (let dx = -1; dx <= 1; dx++) {
            const j = i + dy + dx;
            if (j < 0 || j >= n || (dx === -1 && x === 0) || (dx === 1 && x === w - 1)) continue;
            if (!ground[j] && !lab[j]) { lab[j] = id; stack[sp++] = j; }
          }
        }
        areas.push(cnt);
      }
      let big = 0;
      for (const a of areas) if (a > big) big = a;
      subj = new Uint8Array(n);
      for (let i = 0; i < n; i++) if (lab[i] && areas[lab[i]] >= big * 0.05) { subj[i] = 1; subjArea++; } else ground[i] = 1;
      const frac = 1 - subjArea / n;
      if (frac < 0.15 || frac > 0.97) { ground = null; subj = null; subjArea = 0; }
    }

    // 2. the cut-out: white to alpha after the lift (what a multiply blend shows), ground and shade clear
    let cut = null;
    if (o.cutout && ground) {
      const soft = new Float32Array(n);
      for (let i = 0; i < n; i++) soft[i] = ground[i];
      const R = blur(soft, Math.max(0.5, 0.7 * k));
      cut = new Uint8ClampedArray(n * 4);
      const lift = o.lift;
      for (let i = 0, j = 0; i < n; i++, j += 4) {
        const r = clampN(((px[j] / 255) * lift - 0.5) * 1.05 + 0.5), g = clampN(((px[j + 1] / 255) * lift - 0.5) * 1.05 + 0.5), b = clampN(((px[j + 2] / 255) * lift - 0.5) * 1.05 + 0.5);
        let a = 1 - Math.min(r, g, b);
        a *= 1 - R[i];
        if (a < 0.004) { cut[j + 3] = 0; continue; }
        cut[j] = (1 - (1 - r) / a) * 255; cut[j + 1] = (1 - (1 - g) / a) * 255; cut[j + 2] = (1 - (1 - b) / a) * 255; cut[j + 3] = a * 255;
      }
    }
    if (!o.trace) return { cut, stroke: null, fill: null };

    // 3. inner contours: Canny-style edges, thinned, kept only when long
    const G = blur(L, Math.max(0.7, 1.25 * k));
    const M = new Float32Array(n), D = new Uint8Array(n), GX = new Float32Array(n), GY = new Float32Array(n), gain = k / 4;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const tl = G[i - w - 1], t = G[i - w], tr = G[i - w + 1], l = G[i - 1], rr = G[i + 1], bl = G[i + w - 1], b = G[i + w], br = G[i + w + 1];
        const gx = tr + 2 * rr + br - tl - 2 * l - bl, gy = bl + 2 * b + br - tl - 2 * t - tr;
        GX[i] = gx; GY[i] = gy;
        M[i] = Math.sqrt(gx * gx + gy * gy) * gain;
        const ax = gx < 0 ? -gx : gx, ay = gy < 0 ? -gy : gy;
        D[i] = ay <= ax * 0.4142 ? 0 : ay >= ax * 2.4142 ? 2 : (gx > 0) === (gy > 0) ? 1 : 3;
      }
    }
    const lo0 = 0.025 / detail;
    const NM = new Float32Array(n), BINS = 512, hist = new Uint32Array(BINS);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x, m = M[i];
        if (m < lo0) continue;
        let a, b;
        switch (D[i]) {
          case 0: a = M[i - 1]; b = M[i + 1]; break;
          case 2: a = M[i - w]; b = M[i + w]; break;
          case 1: a = M[i - w - 1]; b = M[i + w + 1]; break;
          default: a = M[i - w + 1]; b = M[i + w - 1];
        }
        if (m >= a && m > b) { NM[i] = m; hist[Math.min(BINS - 1, (m * BINS) | 0)]++; }
      }
    }
    // thresholds: fixed for a calm photograph, raised for a busy one (at most about 2% strong pixels)
    const cap = n * 0.02 * detail;
    let acc = 0, hiCap = 0;
    for (let bn = BINS - 1; bn >= 0; bn--) { acc += hist[bn]; if (acc > cap) { hiCap = (bn + 1) / BINS; break; } }
    const hi = Math.max(0.06 / detail, hiCap), lo = Math.max(lo0, hi * 0.42);
    const E = new Uint8Array(n);
    for (let i = 0; i < n; i++) { const m = NM[i]; if (m >= lo) E[i] = m >= hi ? 2 : 1; }

    // the outline: the border between subject and ground
    let outline = null, dB = null;
    if (subj) {
      outline = new Uint8Array(n);
      for (let i = w; i < n - w; i++) if (subj[i] && (ground[i - 1] || ground[i + 1] || ground[i - w] || ground[i + w])) outline[i] = 1;
      dB = dist(outline);
    }
    // hysteresis; drop short pieces, and anything on the ground or doubling the outline
    const keep = new Uint8Array(n), seen = new Uint8Array(n), comp = new Int32Array(n);
    const minLen = Math.max(20, Math.round(40 * k * Math.min(1, detail)));
    const nb = [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1];
    const near = 2.5 * k;
    for (let s = 0; s < n; s++) {
      if (E[s] !== 2 || seen[s]) continue;
      let sp = 0, cn = 0;
      stack[sp++] = s; seen[s] = 1;
      while (sp) {
        const i = stack[--sp];
        if (!subj || (subj[i] && dB[i] > near)) comp[cn++] = i;
        for (let q = 0; q < 8; q++) { const j = i + nb[q]; if (j > 0 && j < n && E[j] && !seen[j]) { seen[j] = 1; stack[sp++] = j; } }
      }
      if (cn >= minLen) for (let c = 0; c < cn; c++) keep[comp[c]] = 1;
    }
    // a thin rim, seam or highlight has an edge on each side, with opposite gradients a few pixels apart:
    // draw it once, down its middle, instead of as two parallel lines
    const reach = Math.max(3, Math.round(4.5 * k));
    const mid = new Uint8Array(n), drop = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (!keep[i]) continue;
      const gx = GX[i], gy = GY[i], gm = Math.sqrt(gx * gx + gy * gy);
      if (!gm) continue;
      const ux = gx / gm, uy = gy / gm, x0 = i % w, y0 = (i / w) | 0;
      for (const sg of [1, -1]) {
        let found = -1, ft = 0;
        for (let t = 2; t <= reach && found < 0; t++) {
          const x = Math.round(x0 + sg * ux * t), y = Math.round(y0 + sg * uy * t);
          if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) break;
          for (const j of [y * w + x, y * w + x + 1, y * w + x - 1, (y + 1) * w + x, (y - 1) * w + x]) {
            if (!keep[j] || j === i) continue;
            const hx = GX[j], hy = GY[j], hm = Math.sqrt(hx * hx + hy * hy);
            if (hm && (gx * hx + gy * hy) / (gm * hm) < -0.6) { found = j; ft = t; break; }
          }
        }
        if (found >= 0) {
          drop[i] = 1; drop[found] = 1;
          const mx = Math.round(x0 + sg * ux * ft / 2), my = Math.round(y0 + sg * uy * ft / 2);
          mid[my * w + mx] = 1;
          break;
        }
      }
    }
    for (let i = 0; i < n; i++) if (mid[i] || (keep[i] && !drop[i])) keep[i] = 1; else keep[i] = 0;
    const dE = dist(keep);

    // 4. strokes, anti-aliased from the distance: inner 2 CSS px, outline 3.5 CSS px (lines are content:
    //    none under 2 px)
    const stroke = new Uint8ClampedArray(n);
    const hi1 = 1.0 * k + 0.5, hi2 = 1.75 * k + 0.5;
    for (let i = 0; i < n; i++) {
      let a = hi1 - dE[i];
      if (dB) { const b = hi2 - dB[i]; if (b > a) a = b; }
      stroke[i] = clampN(a) * 255;
    }

    // 5. the core: the closed shape under the focus point, if it is one (never the whole subject), drawn
    //    as an accent outline that meets the strokes round it, over a light tint
    let fill = null;
    if (o.fx != null) {
      const fx = Math.round(o.fx), fy = Math.round(o.fy);
      const free = (i) => dE[i] > hi1 + 0.8 * k && (!subj || (subj[i] && dB[i] > hi2 + 0.5 * k));
      let s0 = -1;
      for (let r = 0; r < 6 * k && s0 < 0; r++) for (let dy = -r; dy <= r && s0 < 0; dy++) for (let dx = -r; dx <= r; dx++) {
        const x = fx + dx, y = fy + dy;
        if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
        if (free(y * w + x)) { s0 = y * w + x; break; }
      }
      if (s0 >= 0) {
        const limit = (subj ? subjArea : n) * 0.06;
        const F = new Uint8Array(n);
        let sp = 0, cnt = 0, leak = false;
        stack[sp++] = s0; F[s0] = 1;
        while (sp && !leak) {
          const i = stack[--sp], x = i % w;
          if (++cnt > limit || x === 0 || x === w - 1 || i < w || i >= n - w) { leak = true; break; }
          for (const j of [i - 1, i + 1, i - w, i + w]) if (!F[j] && free(j)) { F[j] = 1; stack[sp++] = j; }
        }
        if (!leak && cnt > (subj ? subjArea : n) * 0.002) {
          // the region stops 0.8 px short of the strokes: grow it to meet them, then keep a 2 px ring
          // inside that edge at full strength and a 14% tint within (alpha 255 = ring, 36 = tint)
          const dF = dist(F), out = new Uint8Array(n);
          const grow = 0.8 * k + 0.5;
          for (let i = 0; i < n; i++) out[i] = dF[i] < grow ? 0 : 1;
          const dIn = dist(out), ring = 2 * k;
          fill = new Uint8ClampedArray(n);
          for (let i = 0; i < n; i++) {
            if (out[i]) continue;
            const r = clampN(ring + 0.5 - dIn[i]);
            fill[i] = (r + (1 - r) * 0.14) * 255;
          }
        }
      }
    }
    return { cut, stroke, fill };
  }
  function clampN(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // the work runs in a worker made from the functions above, so the page keeps scrolling meanwhile
  function offThread(px, w, h, o) {
    let worker = null, url = null;
    try {
      url = URL.createObjectURL(new Blob([`const clampN = ${clampN.toString()};\nconst analyse = ${analyse.toString()};
onmessage = (e) => { const d = e.data; const r = analyse(new Uint8ClampedArray(d.buf), d.w, d.h, d.o);
  const t = [r.cut, r.stroke, r.fill].filter(Boolean).map((a) => a.buffer); postMessage(r, t); };`], { type: 'text/javascript' }));
      worker = new Worker(url);
    } catch { if (url) URL.revokeObjectURL(url); return Promise.resolve(analyse(px, w, h, o)); }
    return new Promise((res) => {
      const done = (r) => { worker.terminate(); URL.revokeObjectURL(url); res(r); };
      worker.onmessage = (e) => done(e.data);
      worker.onerror = (e) => { e.preventDefault(); done(analyse(px, w, h, o)); };
      const copy = px.slice();
      worker.postMessage({ buf: copy.buffer, w, h, o }, [copy.buffer]);
    });
  }

  const load = (src, cors) => new Promise((res, rej) => {
    const i = new Image();
    if (cors) i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  // the photograph as a picture whose pixels can be read: same-origin as it is, otherwise fetched again
  // with CORS (a host that does not allow it makes this fail, and the scene keeps its fallbacks)
  const readable = async (src) => {
    let same = true;
    try { const u = new URL(src, location.href); same = u.origin === location.origin || u.protocol === 'data:' || u.protocol === 'blob:'; } catch {}
    const img = await load(src, !same);
    if (img.decode) await img.decode().catch(() => {});
    return img;
  };
  const toUrl = (cv, type) => new Promise((res) => cv.toBlob((b) => res(b ? URL.createObjectURL(b) : null), type, 0.92));
  const swap = async (img, url) => {
    const pre = new Image();
    pre.src = url;
    await pre.decode().catch(() => {});
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = url;
    if (img.decode) await img.decode().catch(() => {});
  };
  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 700 }) : setTimeout(fn, 60));

  // layout position of el inside anc (transforms ignored)
  const posIn = (el, anc) => { let x = 0, y = 0; while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x, y }; };
  // the box of the words themselves (the longest line, not the element's width) inside anc
  const textBox = (el, anc) => {
    if (!el) return null;
    const r = document.createRange();
    r.selectNodeContents(el);
    const a = anc.getBoundingClientRect();
    let b = null;
    for (const q of r.getClientRects()) {
      if (q.width < 1 || q.height < 1) continue;
      if (!b) b = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
      b.left = Math.min(b.left, q.left - a.left); b.right = Math.max(b.right, q.right - a.left);
      b.top = Math.min(b.top, q.top - a.top); b.bottom = Math.max(b.bottom, q.bottom - a.top);
    }
    return b;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const o = Object.assign({ hold: 2.5, phoneHold: 2, park: 92, phonePark: 88, focus: null, band: 16, slow: 0.56, scale: 1.12, phoneScale: 1.08, wake: 5, detail: 1, debug: false }, opts);
    const stage = root.querySelector(':scope > .scene-stage');
    const layerA = stage && stage.querySelector('.ts-layer--a');
    const layerB = stage && stage.querySelector('.ts-layer--b');
    if (!layerA || !layerB) { console.warn(ID + ': needs .ts-layer--a and .ts-layer--b inside .scene-stage'); return null; }
    const colMQ = window.matchMedia(COLUMN), tinyMQ = window.matchMedia(TINY);
    // the CSS sizes the picture so that even at its starting scale it keeps clear of the words
    root.style.setProperty('--ts-s0', String(clamp(+o.scale || 1, 1, 1.2)));

    // B: an inner box that is moved against its window, and a copy of the words if the page left it out
    let innerB = layerB.querySelector(':scope > .ts-inner');
    if (!innerB) { innerB = document.createElement('div'); innerB.className = 'ts-inner'; while (layerB.firstChild) innerB.appendChild(layerB.firstChild); layerB.appendChild(innerB); }
    const copyA = layerA.querySelector('.ts-copy');
    if (copyA && !innerB.querySelector('.ts-copy')) {
      const c = copyA.cloneNode(true);
      c.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      c.querySelectorAll('a').forEach((a) => { const s = document.createElement('span'); s.className = a.className; s.innerHTML = a.innerHTML; a.replaceWith(s); });
      innerB.insertBefore(c, innerB.firstChild);
    }
    layerB.setAttribute('aria-hidden', 'true');
    layerB.inert = true;

    let head = stage.querySelector('.ts-head');
    if (!head) { head = document.createElement('div'); head.className = 'ts-head'; head.setAttribute('aria-hidden', 'true'); head.innerHTML = '<i class="ts-line"></i>'; stage.appendChild(head); }
    const tags = [...head.querySelectorAll('.ts-tag')];
    const imgA = layerA.querySelector('.ts-img');
    const imgB = innerB.querySelector('.ts-img');
    const subjA = layerA.querySelector('.ts-subject');
    const frameA = layerA.querySelector('.ts-frame');
    const marks = stage.querySelector('.ts-marks');
    const subjM = marks && marks.querySelector('.ts-subject');
    const srcA = imgA ? imgA.currentSrc || imgA.src : '';
    const srcB = imgB ? imgB.currentSrc || imgB.src : '';
    const traced = !!(imgB && imgB.dataset.trace === 'lines');

    // the wake: the drawing again in the accent, in a band just under the line (live only), framed like
    // B so its lines are B's lines exactly (same weight, dashes and registration). It is drawn once into
    // a canvas the size of the picture box, already cropped and tinted, so moving the band only moves a
    // finished bitmap: no clip inside it, nothing to repaint or rasterise while scrolling. If the
    // drawing cannot be read (an SVG on a host without CORS), the accent shows through it as a CSS mask
    // instead: the same picture, but rasterised as the band uncovers it
    let band = null, bandInner = null, bandMask = null, bandSubj = null;
    if (imgB && o.wake > 0 && imgB.dataset.trace !== 'negative') {
      band = document.createElement('div');
      band.className = 'ts-band';
      band.setAttribute('aria-hidden', 'true');
      band.style.setProperty('--ts-wake', clamp(o.wake, 0, 30) + '%');
      band.innerHTML = '<div class="ts-inner"><div class="ts-frame"><div class="ts-subject"><i class="ts-img ts-wake"></i></div></div></div>';
      stage.insertBefore(band, head);
      bandInner = band.firstElementChild;
      bandMask = band.querySelector('.ts-wake');
      bandSubj = band.querySelector('.ts-subject');
    }
    const subjects = [...stage.querySelectorAll('.ts-subject')];
    const titles = [...stage.querySelectorAll('.ts-title')];
    const outros = [...stage.querySelectorAll('.ts-outro')];
    const ctas = [...stage.querySelectorAll('.ts-outro .ts-cta')];
    const pct = (el, prop) => parseFloat(el.style.getPropertyValue(prop) || getComputedStyle(el).getPropertyValue(prop));
    const calls = (subjM ? [...subjM.querySelectorAll('.ts-callout')] : []).map((el, i) => ({
      el, i,
      dot: el.querySelector('.ts-callout__dot'),
      leader: el.querySelector('.ts-callout__leader'),
      label: el.querySelector('.ts-callout__label'),
      focus: el.classList.contains('is-focus'),
      px: pct(el, '--x'), py: pct(el, '--y'),
      x1: 0, y1: 0, d: -1, dir: -1, ny: 0, off: false, bare: false,
    }));
    if (o.debug || /[?&]ts-debug\b/.test(location.search)) root.classList.add('ts-debug');
    const zoomNow = () => parseFloat(getComputedStyle(stage).getPropertyValue('--ts-z')) || 1;

    // ---- pictures: decode first; cut-out, trace and wake made off the main thread ----------------------
    [imgA, imgB].forEach((i) => { if (i && i.decode) i.decode().catch(() => {}); });
    // drawSrc / svg: the SVG file B's drawing came from and its text in the page's colours; drawTop: how
    // far below the top of its box the drawing starts (CSS px at scale 1); 0 = unknown, use the box
    const pic = { busy: false, again: false, dispW: 0, wakeSrc: '', flatKey: '', wantKey: '', pending: null, traced: false, drawSrc: '', svg: null, svgVer: 0, drawTop: 0 };
    const dispWidth = () => {
      const nw = (imgA && imgA.naturalWidth) || 1600, nh = (imgA && imgA.naturalHeight) || 2000;
      const sw = subjA ? subjA.offsetWidth : 720, sh = subjA ? subjA.offsetHeight : 900;
      return nw * Math.max(sw / nw, sh / nh) * zoomNow();
    };
    const work = async () => {
      if (pic.busy) { pic.again = true; return; }
      pic.busy = true;
      const wantCut = !!imgA && root.classList.contains('ts-cutout');
      const wantTrace = traced && !!imgA;
      try {
        if (wantTrace && !pic.traced) root.classList.add('ts-tracing');
        if (wantCut || wantTrace) {
          const photo = await readable(srcA);
          const nw = photo.naturalWidth, nh = photo.naturalHeight;
          if (!nw || !nh) throw new Error('no picture');
          const dispW = dispWidth();
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          let w = Math.round(Math.min(nw, Math.max(640, dispW * dpr), 2400));
          let h = Math.round((w * nh) / nw);
          const capPx = 3.2e6;
          if (w * h > capPx) { const f = Math.sqrt(capPx / (w * h)); w = Math.round(w * f); h = Math.round(h * f); }
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const cx = cv.getContext('2d', { willReadFrequently: true });
          cx.drawImage(photo, 0, 0, w, h);
          const data = cx.getImageData(0, 0, w, h); // throws if the picture is cross-origin without CORS
          const f = calls.find((c) => c.focus);
          const lift = parseFloat(getComputedStyle(root).getPropertyValue('--ts-lift')) || 1.15;
          const res = await offThread(data.data, w, h, {
            k: w / Math.max(1, dispW), detail: clamp(+o.detail || 1, 0.4, 2), cutout: wantCut, trace: wantTrace, lift: clamp(lift, 1, 1.4),
            fx: f && Number.isFinite(f.px) ? (f.px / 100) * w : null, fy: f && Number.isFinite(f.py) ? (f.py / 100) * h : null,
          });
          if (wantCut && res.cut) {
            cx.putImageData(new ImageData(new Uint8ClampedArray(res.cut.buffer || res.cut), w, h), 0, 0);
            const url = await toUrl(cv, 'image/webp');
            if (url) { await swap(imgA, url); root.classList.add('ts-baked'); }
          }
          if (wantTrace && res.stroke) {
            const st8 = new Uint8ClampedArray(res.stroke.buffer || res.stroke), fl8 = res.fill ? new Uint8ClampedArray(res.fill.buffer || res.fill) : null;
            const ink = rgbOf(getComputedStyle(layerB).color, '#ece6d8');
            const acc = rgbOf(getComputedStyle(root).getPropertyValue('--ts-accent'), '#c8f03c');
            const out = cx.createImageData(w, h), d = out.data;
            for (let i = 0, j = 0; i < st8.length; i++, j += 4) {
              const sa = st8[i] / 255, fa = fl8 ? fl8[i] / 255 : 0;
              const a = sa + fa * (1 - sa);
              if (a <= 0) continue;
              const m = fa * (1 - sa);
              d[j] = (ink[0] * sa + acc[0] * m) / a; d[j + 1] = (ink[1] * sa + acc[1] * m) / a; d[j + 2] = (ink[2] * sa + acc[2] * m) / a; d[j + 3] = a * 255;
            }
            cx.clearRect(0, 0, w, h);
            cx.putImageData(out, 0, 0);
            const url = await toUrl(cv, 'image/png');
            if (url) { await swap(imgB, url); imgB.classList.add('is-traced'); root.classList.add('ts-traced'); pic.traced = true; }
          }
          pic.dispW = dispW;
        }
      } catch (err) {
        // cross-origin without CORS, or no canvas: the multiply blend and the negative stay
        if (wantTrace && !pic.traced && band) { band.remove(); band = null; }
      } finally {
        root.classList.remove('ts-tracing');
        pic.busy = false;
        wake();
        if (pic.again) { pic.again = false; idle(work); }
      }
    };
    // the accent copy of whatever drawing B shows, for the wake: a canvas drawn once (redrawn when the
    // picture box, the zoom or the screen's density changes), or the CSS mask when that cannot be done
    const maskWake = (src) => {
      if (!band || !bandMask) return;
      band.classList.remove('ts-band--drawn');
      band.classList.add('ts-band--masked');
      if (src === pic.wakeSrc) return;
      pic.wakeSrc = src;
      const u = `url("${src.replace(/["\\]/g, (ch) => encodeURIComponent(ch))}")`;
      bandMask.style.webkitMaskImage = u;
      bandMask.style.maskImage = u;
    };
    // an SVG drawing is drawn at the size it has inside the img box, so its non-scaling strokes keep
    // the width they have on screen (a canvas would otherwise draw them at the file's own size)
    const svgText = new Map();
    const svgSource = (src) => {
      if (!svgText.has(src)) {
        svgText.set(src, (async () => {
          try {
            const r = await fetch(src, { credentials: 'same-origin' });
            const t = r.ok ? await r.text() : '';
            return /<svg[\s>]/i.test(t) ? t : null;
          } catch { return null; }
        })());
      }
      return svgText.get(src);
    };
    // A canvas draws non-scaling strokes (and their dashes) at their width in canvas pixels, while the
    // img draws them in the px of its box and then scales them with it (--ts-zoom, the subject's scale,
    // the density): for a canvas drawn at f times the box, they are made f times wider first
    const widen = (text, f) => {
      if (!/non-scaling-stroke/i.test(text) || Math.abs(f - 1) < 0.01) return text;
      const mul = (v) => v.replace(/\d*\.?\d+(?:e-?\d+)?/gi, (n) => String(+(+n * f).toFixed(3)));
      return text
        .replace(/(stroke-(?:width|dasharray|dashoffset)\s*:\s*)([^;}"'<]+)/gi, (m, a, v) => a + mul(v))
        .replace(/(stroke-(?:width|dasharray|dashoffset)\s*=\s*["'])([^"']+)/gi, (m, a, v) => a + mul(v));
    };
    // where an SVG drawing's lines start: the top of its geometry as a fraction of its viewBox, read
    // from a hidden copy (no styles, nothing painted) instead of a raster of it read back from a canvas
    const inkOf = (svg) => {
      try {
        const vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
        if (vb.length !== 4 || !(vb[2] > 0 && vb[3] > 0)) return null;
        const copy = document.importNode(svg, true);
        copy.querySelectorAll('style, script, title, desc, foreignObject').forEach((e) => e.remove());
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        while (copy.firstChild) g.appendChild(copy.firstChild);
        copy.appendChild(g);
        copy.setAttribute('aria-hidden', 'true');
        copy.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
        document.body.appendChild(copy);
        let b = null;
        try { b = g.getBBox(); } finally { copy.remove(); }
        return b && b.height > 0 ? { top: (b.y - vb[1]) / vb[3], vw: vb[2], vh: vb[3] } : null;
      } catch { return null; }
    };
    const svgAt = async (src, w, h, f = 1) => {
      let text = (src === pic.drawSrc && pic.svg) || (await svgSource(src));
      if (!text) return null;
      text = widen(text, f);
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;
      if (!svg || svg.nodeName.toLowerCase() !== 'svg') return null;
      if (!svg.getAttribute('viewBox')) {
        const vw = parseFloat(svg.getAttribute('width')), vh = parseFloat(svg.getAttribute('height'));
        if (!(vw > 0 && vh > 0)) return null;
        svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      }
      const ink = inkOf(svg);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
      try { const im = await load(url, false); if (im.decode) await im.decode().catch(() => {}); return { im, ink }; } catch { return null; } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
    };
    const isSvg = (src) => /^data:image\/svg\+xml/i.test(src) || /\.svgz?(?:[?#]|$)/i.test(src);
    // B's picture inside the subject box at scale 1: object-fit cover, then scale(--ts-z) about its
    // transform-origin
    const frameOf = () => {
      const W = subjA ? subjA.offsetWidth : 0, H = subjA ? subjA.offsetHeight : 0;
      const nw = imgB.naturalWidth, nh = imgB.naturalHeight;
      if (!W || !H || !nw || !nh) return null;
      const z = zoomNow();
      const [Fx, Fy] = getComputedStyle(imgB).transformOrigin.split(' ').map(parseFloat);
      if (!Number.isFinite(Fx) || !Number.isFinite(Fy)) return null;
      const c = Math.max(W / nw, H / nh), cw = nw * c, ch = nh * c, ox = (W - cw) / 2, oy = (H - ch) / 2;
      return { W, H, z, Fx, Fy, cw, ch, x: Fx + (ox - Fx) * z, y: Fy + (oy - Fy) * z, w: cw * z, h: ch * z };
    };
    // where the drawing starts below the top of its box: the end frame in one column keeps it clear of
    // the outro by that, not by the box (a picture the page cannot read keeps 0: the box decides)
    const scanTop = (art, f) => {
      try {
        const s = 240 / f.W, w = 240, h = Math.max(1, Math.round(f.H * s));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const x = cv.getContext('2d', { willReadFrequently: true });
        x.setTransform(s, 0, 0, s, 0, 0);
        x.drawImage(art, f.x, f.y, f.w, f.h);
        const d = x.getImageData(0, 0, w, h).data;
        for (let r = 0; r < h; r++) for (let i = r * w * 4 + 3, e = i + w * 4; i < e; i += 4) if (d[i] > 20) return Math.max(0, (r - 1) / s);
        return 0;
      } catch { return 0; }
    };
    const setTop = (v) => { if (Math.abs(v - pic.drawTop) > 0.5) { pic.drawTop = v; if (st.col) { dropNow(); st.s = null; render(); } } };
    // While the scene runs, B's drawing is shown from a canvas drawn once (framed and cropped like its
    // img, at the subject's largest scale and the screen's density, at most about 6 megapixels), and
    // the wake is the same bitmap tinted with the accent. A drawing of many dashed paths is then
    // rasterised once, at load, not tile by tile as the line uncovers it (which holds up the frame in
    // which a tile first shows). Both are redrawn when the picture box, the zoom or the density
    // changes. If the drawing cannot be read (an SVG on a host without CORS), B keeps its img and the
    // wake shows the accent through it as a CSS mask
    let flatB = null;
    const subjB = imgB ? imgB.closest('.ts-subject') : null;
    // A request for the drawing already on its way joins it rather than drawing it again; one for
    // another size or colour makes the older one stand down
    const drawFlat = async (src) => {
      const f = frameOf();
      if (!f || !subjB) return false;
      const { W, H, cw, ch } = f;
      let k = Math.min(2, window.devicePixelRatio || 1) * clamp(Math.max(+o.scale || 1, +o.phoneScale || 1), 1, 1.2);
      if (W * H * k * k > 6e6) k = Math.sqrt(6e6 / (W * H));
      const cvW = Math.round(W * k), cvH = Math.round(H * k);
      const acc = rgbOf(getComputedStyle(root).getPropertyValue('--ts-accent'), '#c8f03c');
      const key = [src, pic.svgVer, cvW, cvH, f.z, f.Fx, f.Fy, acc, !!band].join('|');
      pic.wantKey = key;
      if (key === pic.flatKey && flatB) return true;
      if (pic.pending && pic.pending.key === key) return pic.pending.p;
      const p = (async () => {
        const got = isSvg(src) ? await svgAt(src, cw, ch, f.z * k) : { im: imgB, ink: null };
        if (pic.wantKey !== key) return true; // a newer drawing is on its way
        if (!got) return false;
        const art = got.im, ink = got.ink;
        // the top of the lines inside the box at scale 1 (an SVG is fitted into cw x ch, then zoomed)
        if (ink) {
          const s = Math.min(cw / ink.vw, ch / ink.vh);
          setTop(Math.max(0, f.y + f.z * ((ch - ink.vh * s) / 2 + ink.top * ink.vh * s) - 4));
        } else setTop(scanTop(art, f));
        const canvas = () => { const cv = document.createElement('canvas'); cv.width = cvW; cv.height = cvH; const x = cv.getContext('2d'); return x ? { cv, x } : null; };
        const b = canvas();
        if (!b) return false;
        b.x.setTransform(k, 0, 0, k, 0, 0);
        b.x.drawImage(art, f.x, f.y, f.w, f.h);
        const cb = b.cv;
        cb.className = 'ts-flat-c';
        if (flatB) flatB.replaceWith(cb); else subjB.appendChild(cb);
        flatB = cb;
        root.classList.add('ts-flat');
        // the wake: that bitmap again, tinted (copied from it, so the drawing is rasterised once)
        if (band && bandSubj) {
          const t = canvas();
          if (t) {
            t.x.drawImage(cb, 0, 0);
            t.x.globalCompositeOperation = 'source-in';
            t.x.fillStyle = `rgb(${acc.join(',')})`;
            t.x.fillRect(0, 0, cvW, cvH);
            t.cv.className = 'ts-wake-c';
            const old = bandSubj.querySelector(':scope > canvas');
            if (old) old.replaceWith(t.cv); else bandSubj.appendChild(t.cv);
            band.classList.remove('ts-band--masked');
            band.classList.add('ts-band--drawn');
          }
        }
        pic.flatKey = key;
        return true;
      })();
      pic.pending = { key, p };
      try { return await p; } finally { if (pic.pending && pic.pending.p === p) pic.pending = null; }
    };
    let wakeJob = 0;
    const wake = () => {
      if (!imgB) return;
      if (imgB.dataset.trace && !imgB.classList.contains('is-traced')) return;
      // a repainted drawing shows from a blob: the canvases still read the file it came from
      const src = pic.drawSrc || imgB.currentSrc || imgB.src;
      if (!src || !(imgB.complete && imgB.naturalWidth)) return;
      const job = ++wakeJob;
      drawFlat(src).then((ok) => ok, () => false).then((ok) => {
        if (job !== wakeJob || ok) return;
        setTop(0);
        if (flatB) { flatB.remove(); flatB = null; }
        root.classList.remove('ts-flat');
        pic.flatKey = '';
        maskWake(src);
      });
    };
    // an SVG drawing takes the page's colours (its file keeps the default ones for visitors without
    // script): the core in --ts-accent, the strokes in --ts-ink-b, so a page has one accent, not two
    const paintDrawing = async () => {
      if (!imgB || imgB.dataset.trace || !isSvg(srcB)) return;
      const text = await svgSource(srcB);
      if (!text) return;
      const ink = rgbOf(getComputedStyle(layerB).color, '#ece6d8');
      const ground = rgbOf(getComputedStyle(layerB).backgroundColor, '#0c0e11');
      const acc = rgbOf(getComputedStyle(root).getPropertyValue('--ts-accent'), '#c8f03c');
      const out = repaint(text, ink, ground, acc);
      pic.drawSrc = srcB;
      pic.svg = out || text;
      pic.svgVer++;
      if (out) await swap(imgB, URL.createObjectURL(new Blob([out], { type: 'image/svg+xml' })));
    };
    const startPictures = () => {
      const go = () => idle(work);
      const wait = [imgA, imgB].filter((i) => i && !(i.complete && i.naturalWidth)).map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }));
      Promise.all(wait).then(() => paintDrawing().catch(() => {})).then(go);
    };
    if (traced) root.classList.add('ts-tracing');
    startPictures();
    // a picture made for a small screen is redone when the subject grows (phone to desktop, rotation)
    let rsT = 0;
    const grown = () => {
      clearTimeout(rsT);
      rsT = setTimeout(() => {
        const need = dispWidth();
        if ((pic.traced || root.classList.contains('ts-baked')) && need > pic.dispW * 1.3) idle(work);
        if (!st.live) { measure(); }
      }, 250);
    };
    if (window.ResizeObserver && subjA) new ResizeObserver(grown).observe(subjA);
    else window.addEventListener('resize', grown);

    // ---- layout of the marks: positions, sides, collisions ---------------------------------------------
    const st = { live: false, col: false, tagFade: false, tagA: -1, tagTop: 0, bandTop: null, H: 1, cy: 0, copyBottom: 0, px: null, s: null, dy: 0, drop: 0, proxy: null };

    const placeLabels = () => {
      const SW = stage.clientWidth, H = stage.clientHeight || window.innerHeight;
      const lead = parseFloat(getComputedStyle(stage).getPropertyValue('--ts-lead')) || 40;
      const gap = lead + 15, m = st.col ? 12 : 16;
      const fl = frameA && !st.col ? posIn(frameA, stage).x : m;
      const placed = [], dots = [];
      // the words are obstacles too: a label never covers the headline, nor the outro beside the picture
      // (in one column the picture moves down to clear the outro at the end, so the headline is enough)
      const tb = textBox(layerA.querySelector('.ts-title'), stage);
      if (tb) placed.push({ x0: tb.left - 8, x1: tb.right + 8, y0: tb.top - 8, y1: tb.bottom + 8 });
      const ob = st.col ? null : layerA.querySelector('.ts-outro');
      if (ob && ob.offsetWidth) { const q = posIn(ob, stage); placed.push({ x0: q.x - 8, x1: q.x + ob.offsetWidth + 8, y0: q.y - 8, y1: q.y + ob.offsetHeight + 8 }); }
      // in the finished composition a callout never sits on the photograph: only those below the seam show
      let seam = -1;
      if (!st.live) { const ln = head.querySelector('.ts-line'); seam = ln ? posIn(ln, stage).y : -1; }
      // a dot must sit on the picture: one that the zoom and the crop leave outside the picture's box
      // (on bare ground) is left out, as is one cropped off the stage
      const sp = subjM ? posIn(subjM, stage) : { x: 0, y: 0 }, sw = subjM ? subjM.offsetWidth : SW, sh = subjM ? subjM.offsetHeight : H;
      for (const c of calls) {
        c.off = c.x1 < 6 || c.x1 > SW - 6 || c.y1 < 6 || c.y1 > H - 6 || c.y1 < seam + 8
          || c.x1 < sp.x + 4 || c.x1 > sp.x + sw - 4 || c.y1 < sp.y + 4 || c.y1 > sp.y + sh - 4;
        c.el.toggleAttribute('data-off', c.off);
        if (!c.off) dots.push({ c, x0: c.x1 - 10, x1: c.x1 + 10, y0: c.y1 - 10, y1: c.y1 + 10 });
      }
      const order = calls.filter((c) => !c.off).sort((a, b) => (b.focus - a.focus) || a.i - b.i);
      // sizes are read with every label showing (a hidden one measures 0)
      for (const c of order) c.el.removeAttribute('data-bare');
      for (const c of order) if (c.label) { c.lw = c.label.offsetWidth; c.lh = c.label.offsetHeight; }
      let shown = 0;
      for (const c of order) {
        c.bare = true; c.ny = 0; c.lift = 0;
        if (c.off || !c.label) continue;
        if (st.col && shown >= COLUMN_LABELS) { c.el.setAttribute('data-bare', ''); continue; }
        const lw = c.lw, lh = c.lh;
        const pref = st.col ? (c.x1 > SW / 2 ? 'left' : 'right') : c.el.classList.contains('is-right') ? 'right' : c.el.classList.contains('is-left') || c.x1 - posIn(subjM, stage).x > subjM.offsetWidth * 0.64 ? 'left' : 'right';
        const sides = [pref, pref === 'left' ? 'right' : 'left'];
        // beside the dot (the leader reaches it), then above or below it (no leader: the name sits
        // right over its dot), so a part crowded on both sides by others is still named
        const spots = [];
        for (const side of sides) for (const ny of [0, -0.42 * lh, 0.42 * lh]) spots.push({ side, ny, x0: side === 'right' ? c.x1 + gap : c.x1 - gap - lw, y0: c.y1 - lh / 2 + ny });
        for (const side of ['above', 'below']) spots.push({ side, ny: 0, x0: c.x1 - lw / 2, y0: side === 'above' ? c.y1 - 14 - lh : c.y1 + 14 });
        const box = (s) => ({ x0: s.x0 - 4, x1: s.x0 + lw + 4, y0: s.y0 - 3, y1: s.y0 + lh + 3 });
        // (at rest a name sits wholly below the seam, on the drawing)
        const inside = (b) => !(b.x0 < fl - 4 || b.x1 > SW - m + 4 || b.y0 < Math.max(0, seam + 4) || b.y1 > H);
        const hit = (b) => (r) => r.x0 < b.x1 && r.x1 > b.x0 && r.y0 < b.y1 && r.y1 > b.y0;
        let done = null;
        for (const s of spots) {
          const b = box(s);
          if (!inside(b) || placed.some(hit(b)) || dots.some((r) => r.c !== c && hit(b)(r))) continue;
          done = { s, b };
          break;
        }
        // the core is never left unnamed: if other dots block every place, they give way
        if (!done && c.focus) {
          for (const s of spots) {
            const b = box(s);
            if (!inside(b) || placed.some(hit(b))) continue;
            for (const r of dots.filter((r) => r.c !== c && hit(b)(r))) { r.c.off = true; r.c.el.setAttribute('data-off', ''); dots.splice(dots.indexOf(r), 1); }
            done = { s, b };
            break;
          }
        }
        // lift: how far the label reaches above its dot; the callout opens once the line is past that too,
        // so no name ever shows on the surface
        c.lift = done ? Math.max(0, c.y1 - done.b.y0) : 0;
        if (done) { placed.push(done.b); c.side = done.s.side; c.ny = done.s.ny; }
        done = !!done;
        c.bare = !done;
        if (done) shown++;
        c.el.toggleAttribute('data-bare', c.bare);
        if (done) { c.el.dataset.side = c.side; c.dir = c.side === 'left' ? 1 : c.side === 'right' ? -1 : 0; c.label.style.setProperty('--ny', c.ny.toFixed(1) + 'px'); }
      }
    };

    // the headline holds its column on two lines at most: while the scene runs beside the picture a
    // short one grows to fill the column (up to 1.25x the CSS size, 128px at most; the finished split
    // keeps the CSS size, as without script, so it stays clear of the seam), and anywhere a long one
    // shrinks (to 0.62x) rather than take a third line. Both copies follow, through --ts-fit on the stage
    const fitTitle = () => {
      const t = layerA.querySelector('.ts-title');
      if (!t) return;
      const set = (f) => stage.style.setProperty('--ts-fit', f.toFixed(3));
      const lines = () => {
        const r = document.createRange();
        r.selectNodeContents(t);
        const rows = [];
        for (const q of r.getClientRects()) {
          if (q.width < 1 || q.height < 1) continue;
          const row = rows.find((w) => Math.abs(w.top - q.top) < q.height * 0.5);
          if (row) { row.l = Math.min(row.l, q.left); row.r = Math.max(row.r, q.right); } else rows.push({ top: q.top, l: q.left, r: q.right });
        }
        return { n: rows.length, w: rows.reduce((m, w) => Math.max(m, w.r - w.l), 0) };
      };
      set(1);
      const cw = t.clientWidth, base = parseFloat(getComputedStyle(t).fontSize) || 60;
      let m = lines(), f = 1;
      if (!cw || !m.n) return;
      if (m.n > 2) {
        for (let i = 0; i < 10 && m.n > 2 && f > 0.62; i++) { f = Math.max(0.62, f * 0.94); set(f); m = lines(); }
      } else if (st.live && !st.col && m.w > 0) {
        f = Math.min(1.25, 128 / base, (cw / m.w) * 0.99);
        for (let i = 0; i < 8 && f > 1; i++) {
          set(f);
          m = lines();
          if (m.n <= 2 && m.w <= cw + 0.5) return;
          f *= 0.97;
        }
        set(1);
      }
    };

    const measure = () => {
      st.col = colMQ.matches;
      st.H = stage.clientHeight || window.innerHeight;
      fitTitle();
      const subj = subjM || subjA;
      if (subj) {
        const p = posIn(subj, stage);
        st.cy = p.y + subj.offsetHeight / 2;
        // positions are read with every callout laid out (one set to display: none measures 0)
        for (const c of calls) c.el.removeAttribute('data-off');
        for (const c of calls) { c.x1 = p.x + c.el.offsetLeft; c.y1 = p.y + c.el.offsetTop; }
      }
      const t = layerA.querySelector('.ts-title');
      const tb = textBox(t, stage);
      // the lower of the headline's box and its letters (descenders can hang below a 0.96 line height)
      st.copyBottom = t ? Math.max(posIn(t, stage).y + t.offsetHeight, tb && !st.col ? tb.bottom : 0) : 0;
      // the tags ride the line just left of the picture. Where the headline's longest line reaches
      // into that place (the copy column and the frame share a column), they fade out before the line
      // comes to the headline, as they do in one column: they never cover a letter
      st.tagFade = st.col;
      st.tagA = -1;
      // how far the upper tag's top stands above the line (it sits 8px above it)
      st.tagTop = tags.length ? 8 + Math.max(...tags.map((g) => g.offsetHeight)) : 0;
      if (!st.col && tags.length && subj) {
        const fx = frameA ? posIn(frameA, stage).x : 0;
        const tw = Math.max(...tags.map((g) => g.offsetWidth));
        const x = Math.max(fx, posIn(subj, stage).x - 14 - tw);
        head.style.setProperty('--ts-tag-x', x.toFixed(1) + 'px');
        if (tb && x < tb.right + 16 && x + tw > tb.left) {
          st.tagFade = true;
          // at rest the line stands still: if it stands by the headline, the tags are left out
          if (!st.live) {
            const ln = head.querySelector('.ts-line'), ly = ln ? posIn(ln, stage).y : 0;
            const near = ly - 44 < tb.bottom && ly + 44 > tb.top;
            for (const g of tags) g.style.visibility = near ? 'hidden' : '';
          }
        }
      } else head.style.removeProperty('--ts-tag-x');
      if (!st.tagFade || st.live) for (const g of tags) g.style.removeProperty('visibility');
      if (!st.tagFade) for (const g of tags) g.style.removeProperty('opacity');
      placeLabels();
      dropNow();
      wake();
      st.px = st.s = null;
      for (const c of calls) { c.d = -1; c.sa = null; c.el.style.removeProperty('opacity'); }
    };

    // one column, the end: the outro takes the headline's place, and the picture moves down just enough
    // to keep its drawing (and every label) 16px under the outro's action, whatever the screen's height.
    // A callout that this would push off the foot of the stage leaves as the picture moves
    const dropNow = () => {
      st.drop = 0;
      for (const c of calls) c.sink = false;
      if (!st.col || !st.live || !subjA) return;
      const ou = layerA.querySelector('.ts-outro');
      if (!ou) return;
      const bottom = posIn(ou, stage).y + ou.offsetHeight;
      let top = posIn(subjA, stage).y + (pic.drawTop || 0);
      for (const c of calls) {
        if (c.off) continue;
        top = Math.min(top, c.y1 - 8);
        if (!c.bare && c.label) top = Math.min(top, (c.side === 'above' ? c.y1 - 14 - c.lh : c.side === 'below' ? c.y1 + 14 : c.y1 + c.ny - c.lh / 2) - 3);
      }
      st.drop = Math.max(0, Math.ceil(bottom + 16 - top));
      if (!st.drop) return;
      for (const c of calls) {
        if (c.off) continue;
        const reach = c.bare || !c.label ? 8 : c.side === 'below' ? 14 + c.lh + 3 : c.side === 'above' ? 8 : c.lh / 2 + Math.abs(c.ny) + 3;
        c.sink = c.y1 + st.drop + reach > st.H - 6;
      }
    };

    const render = () => {
      const p = st.proxy;
      if (!st.live || !p) return;
      const H = st.H, dpr = window.devicePixelRatio || 1;
      const px = Math.round((p.e / 100) * H * dpr) / dpr;
      if (px !== st.px) {
        st.px = px;
        const t = `translate3d(0,${px}px,0)`, ti = `translate3d(0,${-px}px,0)`;
        layerB.style.transform = t;
        innerB.style.transform = ti;
        head.style.transform = t;
        if (band) { band.style.transform = t; bandInner.style.transform = ti; }
        // where the tags share their place with the headline (always in one column), they leave before
        // the line reaches it: quickly, over 14px of the line's travel, gone 24px before the upper tag's
        // top would reach the words (in one column 5% of the stage earlier still), and on desktop already
        // as the line enters the slow band round the core, so no ghost of a tag lingers while it is slow
        if (st.tagFade) {
          const gone = Math.max(st.copyBottom + st.tagTop + 24 + (st.col ? 0.05 * H : 0), st.bandTop == null ? 0 : (st.bandTop / 100) * H);
          const a = Math.round(clamp((px - gone) / 14) * 100) / 100;
          if (a !== st.tagA) { st.tagA = a; for (const g of tags) g.style.opacity = a; }
        }
      }
      const dy = st.drop ? Math.round(st.drop * (p.d || 0) * dpr) / dpr : 0;
      if (p.s !== st.s || dy !== st.dy) {
        st.s = p.s;
        st.dy = dy;
        const ts = (dy ? `translate3d(0,${dy}px,0) ` : '') + `scale(${p.s.toFixed(5)})`;
        for (const el of subjects) el.style.transform = ts;
        for (const c of calls) {
          if (!c.sink || c.off) { if (c.sa != null) { c.sa = null; c.el.style.removeProperty('opacity'); } continue; }
          const a = Math.round((1 - clamp(p.d || 0)) * 100) / 100;
          if (a !== c.sa) { c.sa = a; c.el.style.opacity = a; }
        }
      }
      const lead = 0.02 * H, span = 0.075 * H;
      for (const c of calls) {
        if (c.off) continue;
        const y = st.cy + (c.y1 - (c.lift || 0) - st.cy) * p.s;
        const d = p.e <= 0.001 ? 1 : Math.round(clamp((y - lead - px) / span) * 1000) / 1000;
        if (d === c.d) continue;
        c.d = d;
        const a = out3(d / 0.4), b = out3((d - 0.2) / 0.45), l = out3((d - 0.4) / 0.6);
        if (c.dot) c.dot.style.transform = `scale(${a.toFixed(4)})`;
        if (c.leader) c.leader.style.transform = `scaleX(${(c.bare ? 0 : b).toFixed(4)})`;
        if (c.label && !c.bare) {
          // the name slides out of the dot: sideways beside it, up or down above or below it
          const k = (1 - l) * 8;
          c.label.style.opacity = l.toFixed(3);
          c.label.style.transform = c.side === 'above' ? `translate(-50%,calc(-100% - ${(14 - k).toFixed(2)}px))`
            : c.side === 'below' ? `translate(-50%,${(14 - k).toFixed(2)}px)`
            : `translate(${(k * c.dir).toFixed(2)}px,calc(-50% + ${c.ny.toFixed(1)}px))`;
        }
        c.el.classList.toggle('is-on', d >= 0.5);
        c.el.style.visibility = d > 0 ? 'visible' : 'hidden';
      }
    };

    const clear = () => {
      st.live = false;
      st.proxy = null;
      for (const el of [layerB, innerB, head, band, bandInner, ...subjects]) if (el) el.style.removeProperty('transform');
      for (const g of tags) g.style.removeProperty('opacity');
      st.drop = st.dy = 0;
      for (const c of calls) {
        c.el.classList.remove('is-on');
        c.el.style.removeProperty('visibility');
        c.el.style.removeProperty('opacity');
        c.sink = false; c.sa = null;
        for (const el of [c.dot, c.leader, c.label]) if (el) { el.style.removeProperty('transform'); el.style.removeProperty('opacity'); }
      }
    };

    if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', () => { if (st.live) { measure(); render(); } });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); render(); });

    const build = (tl) => {
      clear();
      st.live = true;
      measure();
      const col = st.col;
      const park = clamp(col ? +o.phonePark : +o.park, 60, 98);
      const scale0 = clamp(col ? +o.phoneScale : +o.scale, 1, 1.2);

      // the line: waits at park, rises to the top by 0.78, slower across the band around the core
      let focus = o.focus;
      if (focus == null) { const f = calls.find((c) => c.focus && !c.off); focus = ((f ? f.y1 : st.cy) / st.H) * 100; }
      const bandH = clamp(+o.band, 0, 40), slow = clamp(+o.slow, 0.2, 1);
      let top = Math.min(park, focus + bandH / 2), bot = clamp(focus - bandH / 2, 0, top);
      // the slow stretch ends 24px below the headline's letters, so the line never lingers on words:
      // where the core sits that high, the band slides down (not past park) rather than reach them
      const clearE = ((st.copyBottom + 24) / st.H) * 100;
      if (bot < clearE) { const sh = Math.max(0, Math.min(clearE - bot, park - top)); top += sh; bot = Math.min(Math.max(bot + sh, clearE), top); }
      if (top - bot < 1) { top = park; bot = park; }
      st.bandTop = col || top >= park ? null : top;
      const T0 = 0.06, T3 = 0.78;
      const v = (park - top + bot + (top - bot) / slow) / (T3 - T0);
      const t1 = T0 + (park - top) / v, t2 = t1 + (top - bot) / (slow * v);
      const proxy = (st.proxy = { e: park, s: scale0, d: 0 });
      if (t1 - T0 > 0.001) tl.fromTo(proxy, { e: park }, { e: top, duration: t1 - T0, immediateRender: false }, T0);
      if (t2 - t1 > 0.001) tl.fromTo(proxy, { e: top }, { e: bot, duration: t2 - t1, immediateRender: false }, t1);
      tl.fromTo(proxy, { e: bot }, { e: 0, duration: T3 - t2, immediateRender: false }, t2);
      tl.fromTo(proxy, { s: scale0 }, { s: 1, duration: T3, immediateRender: false }, 0);

      // line, tags and wake leave once the stage is all structure
      tl.fromTo(head, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.04, immediateRender: false }, 0.74);
      if (band) {
        tl.fromTo(band, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, T0);
        tl.fromTo(band, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.04, immediateRender: false }, 0.74);
      }

      // the outro: under the headline on desktop, in its place in one column
      if (col) {
        // the headline is gone before the outro starts: never both in the slot at once. Meanwhile the
        // picture moves down by the room the outro needs (st.drop, measured; 0 on a tall screen)
        tl.fromTo(titles, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -16, duration: 0.04, immediateRender: false }, 0.8);
        tl.fromTo(proxy, { d: 0 }, { d: 1, duration: 0.06, immediateRender: false }, 0.8);
        tl.fromTo(outros, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.84);
      } else {
        tl.fromTo(outros, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.8);
        if (ctas.length) tl.fromTo(ctas, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.82);
      }
      tl.set({}, {}, 1);
      tl.eventCallback('onUpdate', render);
      render();
    };

    const rest = () => { clear(); measure(); };

    // the one-column layout (phones, portrait tablets) and the tiny-phone rest are media queries of
    // their own; the stage only knows the 767px phone, so the scene is rebuilt when either changes
    const start = () => Stage.scene(root, {
      hold: clamp(+o.hold, 1, 4),
      scrub: o.scrub ?? (Stage.lenis ? true : 0.6),
      build,
      phone: tinyMQ.matches ? 'rest' : { hold: clamp(+o.phoneHold, 1, 4), build },
      rest,
    });
    let mm = start();
    const restart = () => {
      if (mm && mm.revert) mm.revert();
      mm = start();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    const listen = (q) => (q.addEventListener ? q.addEventListener('change', restart) : q.addListener(restart));
    if (mm) { listen(colMQ); listen(tinyMQ); }
    return mm;
  };
})();
