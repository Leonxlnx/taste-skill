// assets/scenes/scrubbed-transformation-sequence/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / scrubbed-transformation-sequence.js — Scrubbed transformation sequence.
//
// A held stage shows one hero object going through one change of state (raw to finished, closed to
// open, lifted and handed over) as a frame sequence drawn on a canvas and scrubbed by the scroll. Around
// it the page moves in step: a camera that starts pushed in on the raw object pulls back while the change
// begins, the "before" context (a cut-out the object came from) slides out to the right while a
// pre-blurred copy of it fades in (a rack focus without an animated filter), the before statement lifts
// away word by word, the camera glides the object to the centre of the stage while a receiver cut-out
// (the plinth, shelf, pad or trailer the object ends on) rises under it, the object settles onto it,
// callout labels land beside it, and the camera steps back aside for the after line and one action.
// The whole change happens on the page's own ground (ground "none", the default since round 10); the
// old "iris" (a flat disc of a scene-owned colour opening from the object until it becomes a second
// ground) is still accepted for old pages but never dealt: it is a drawn circle and a second ground.
// Use it only when you
// have 80-250 rendered or filmed frames with alpha of the object changing; never fake it by rotating one
// still. Frame the footage tight: the object should fill most of the frame (the box is large).
//
// Needs gsap + ScrollTrigger (+ SplitText for the word moves; without it the words are split by stage.js), stage.js,
// then this file. Read the CSS file's header for colours and placement.
//
// Markup (the camera wrapper, the phone's callout stack and, if missing, the blurred copy of the before
// context are made by this file; do not write them):
//
//   <section class="scene" data-scene="scrubbed-transformation-sequence" aria-labelledby="xf-title"
//            data-options='{"frames":"media/xf/d/####.webp","count":120,
//                           "phoneFrames":"media/xf/m/####.webp","phoneCount":60}'>
//     <div class="scene-stage">
//       <div class="xf-ground" aria-hidden="true">
//         <div class="xf-ground__after"></div><div class="xf-ground__before"></div>
//       </div>
//       <div class="xf-prop xf-prop--back" aria-hidden="true">              optional: what it came from
//         <img data-src="…/before-context.webp" alt="" width="678" height="522">
//         <img class="xf-prop__soft" data-src="…/before-context-soft.webp" alt="">  optional: the same
//       </div>                                          picture blurred ~4px (else it is made here)
//       <div class="xf-receiver" aria-hidden="true">                       optional: what it ends on
//         <img src="…/receiver.webp" alt="">
//         <img class="xf-receiver__contact" src="…/receiver-contact.webp" alt="">   optional: the same
//       </div>                                       picture with the object's contact shade, faded in as it lands
//       <figure class="xf-object">
//         <img class="xf-still" src="…/d/0119.webp" srcset="…/m/0059.webp 720w, …/d/0119.webp 1200w"
//              sizes="(max-width: 767px) min(125vw, 58svh), min(92svh, 62vw)"
//              alt="[the object, finished]" width="1200" height="1200">
//         (an old page's <div class="xf-before"> tile is still accepted, but never shown or loaded)
//         <canvas class="xf-canvas" aria-hidden="true"></canvas>
//         <ul class="xf-callouts">                                         0-6 callouts, 3 is right
//           <li class="xf-callout" style="--x:64.5%;--y:22%" data-side="right">
//             <span class="xf-mark" aria-hidden="true"></span>            optional, never shown (old pages)
//             <span class="xf-label">Thrown in one sitting</span>          2-6 words, at most 2 lines
//           </li> …
//         </ul>
//       </figure>
//       <div class="xf-copy">
//         <h2 class="xf-statement" id="xf-title">It starts as a lump of clay</h2>   the before: see below
//         <p class="xf-closing">Fired once, kept for life.</p>                      the after; 3-6 words
//         <a class="xf-cta" href="#next">See the vases</a>                          2-3 words
//       </div>
//     </div>
//   </section>
//
// --x / --y place each callout's point as a fraction of the object box: put points on the silhouette
// edge of the LAST frame (look at it; never guess), labels on the side away from the object, none of
// them over the receiver (above ~0.8 of the box in the demo), and the first one ~160px below the stage
// top (the nav). No marker is drawn on the point (a square on the silhouette is a drawn marker): the
// label stands alone beside the object, its near edge 22-34px off the point. A laptop shows at most six
// callouts on the object (the rest stay in the document for screen readers); a phone lists at most four
// under the object, as plain lines with no bullets. Two guards keep a label readable when a point is
// placed badly: a label whose text would sit on the object (the last frame's alpha says where) slides
// out beside it, away from the object, as far as the stage allows; one that would sit on an earlier
// label is moved up or down beside its own point, the shorter way.
//
// Words land on a clock, never half-way on the scroll: the before statement as it leaves, each callout
// label, the phone's rows and the after line with its action move in under half a second once the
// scrubbed timeline passes their moment, and go back (faster) when the scroll returns past it.
// Wherever the reader stops, a line of words is whole or not there.
//
// The statement is the live headline and keeps to two lines: at full size (4.4vw, 63px at 1440) that is
// about 26 characters (5-6 words). A longer one is set smaller, down to 40px (28px on a phone), which
// holds about 36 characters at 1440 wide and 28 at 1024; past that it runs to three lines and the
// console says so. So write the before in about 5-7 words, 36 characters at most.
//
// The still is the markup's picture (the last frame) for the finished composition. Live, it stands in
// for the canvas until the canvas draws: it shows frame 0 (the last frame when the page opens past the
// middle of the scene), the URL the frame set fetches first, and nothing while that loads, so the
// finished object never shows at the start. Its src, srcset and sizes come back with the finished
// composition. Give the before context's pictures data-src, not src: they are only shown live on a
// laptop, and this file loads them there. Do not put loading="lazy" on the scene's pictures: Stage.ready() waits for
// every picture in a scene, and a lazy one that is hidden in one mode never loads.
//
// Footage: frames are squares with alpha, the object filling most of the frame (about 65% of its width
// at the start, 85% of its height at the end) with its foot at the same place at the end, so the
// receiver lines up. On a laptop the before context is kept whole on the stage: if at the camera's
// start scale its far edge would pass 24px off the stage's right side, it is drawn smaller about its
// near foot (down to 0.45 of its size), and past that it stays out.
// Export each set at about twice the box's CSS size, so a 2x screen draws them 1:1:
// the laptop box is up to ~830px (frames 1600-1700px, WebP quality ~80, 40-50 KB each), the phone box
// ~490px (frames ~1000px, every second frame). Smaller sets work (the demo ships 1200 and 720px) but
// look soft on 2x screens. About 120 frames (80-250). "####" in the pattern is the zero-padded frame
// index (any run of #). The before context and the receiver are rendered by the cameras of the first
// and last frames and placed in box units (--xf-px/py/pw, --xf-rx/ry/rw in the CSS).
//
// Options (data-options JSON, or the second argument), with defaults and ranges:
//   frames       desktop frame URL pattern                  required (else canvas[data-frames]); none, a
//                                                          data-saving visitor, or a first and last frame
//                                                          that will not load = the finished composition
//   count        desktop frames                             120   (2-400; 80-250 for a good scrub)
//   phoneFrames  phone frame URL pattern                    = frames
//   phoneCount   phone frames                               60 with its own pattern, else = count
//   hold         screens held on desktop                    4     (3-5)
//   phoneHold    screens held on a phone                    3     (2-4)
//   scrub        seconds of catch-up                        0.3 with Stage.smooth(), else 0.6
//   split        share of the frames played linearly        0.85  (0.5-0.95); the rest ease out over 0.62-0.86
//   ground       "none" | "iris"                            "none": the page's own ground throughout. "iris"
//                                                          (the old default) opens a flat disc of --xf-after
//                                                          from the object into a second ground; kept for
//                                                          old pages, never dealt (a drawn disc, rule 7)
//   irisAt       [x, y] the camera's pivot (and where an    [0.5, 0.54]: the object's centre in its first
//                iris grows from), in box fractions        frames
//   push         how far the camera starts pushed in        1.25  (1-1.4); on a laptop it is lowered until
//                                                          the first frame's object keeps 56px off the title
//   firstBox     [x0, y0, x1, y1] the object's outline in   [0.17, 0.3, 0.83, 0.81] (the demo's lump):
//                the first frame, in box fractions          what that 56px is measured from
//   centre       glide the object to the stage's centre     true (laptop only; the phone is centred)
//                while the title is away (0.46-0.60, back
//                over 0.76-0.88)
//
// Timeline (fractions of the hold; all scrubbed, so scrolling back un-builds it exactly):
//   0.00-0.40  the camera pulls back from `push` to 1 (power1.inOut) around the object's centre
//   0.04-0.62  frames 0 → split × last, linear;  0.62-0.86  → last frame, power1.out
//   (ground "iris" only: 0.08-0.25 an after-colour disc grows to a halo around the object, 0.25-0.44 it
//              holds, 0.44-0.56 it fills the stage)
//   0.30-0.48  before context leaves past the right edge (scale 0.86) and fades out whole, so no sliver
//              of it is left at the edge; its blurred copy fades in as it goes (not on phones)
//   0.44       statement words lift away on a clock (yPercent -70, fading out, upright; no masks, so no
//              word is cut)
//   0.46-0.60  the camera glides the object to the stage's centre (laptop)
//   0.47       the receiver rises a short way into its place as it fades in (on a clock: never caught
//              half in, never cut by the stage's foot);  0.62-0.78  object settles onto it (its contact
//              shade fades in over 0.68-0.78)
//   0.47-0.61  callouts, 0.07 apart (spread over 0.2 when there are more than three): each label lands
//              word by word on a clock (phone: at 0.46 one clock lifts the statement out of the bottom
//              slot and then brings the rows of the stack into it, so they never share it)
//   0.76-0.88  the camera glides back, clearing the left for the after line (laptop)
//   0.84       the after line rises into the statement's slot, the action after it (on a clock)
//   0.88-1.00  hold, then the page scrolls on
// Phone (< 768px): the same fractions on the phone frames; the box is wider than the screen and centred
// higher, the camera starts at 1.12 and eases to 1 over 0.04-0.40, no glide, the after line takes a top
// slot (about as large as the before statement it answers), callout labels become a stack (at most four
// rows, no bullets) in the bottom slot, the before context is hidden, no blur.
// Reduced motion, no script, a failed CDN, data-saving visitors and frames that will not load get the
// finished composition (CSS); the first four download no frames.
(() => {
  if (!window.Stage) return;
  const ID = 'scrubbed-transformation-sequence';
  const MAX_CALLOUTS = 6, CLEAR = 56;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = v === '' || v == null ? NaN : Number(v); return Number.isFinite(n) ? clamp(n, a, b) : d; };
  const frameUrl = (pattern, i) => pattern.replace(/#+/, (m) => String(i).padStart(m.length, '0'));
  const saveData = () => {
    const c = navigator.connection;
    return !!(c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || '')));
  };
  // an element's layout position inside an ancestor (offsets ignore transforms, so a refresh mid-scene
  // measures the resting layout)
  const posIn = (el, anc) => { let x = 0, y = 0; for (let e = el; e && e !== anc; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return [x, y]; };

  // A frame set. Frames are fetched first, last, then binary midpoints, six at a time, so a fast scroll
  // always has a near frame to show. Each arrives as a small compressed blob. Only the frames around
  // the playhead are decoded, off the main thread, into ImageBitmaps at the canvas's size, nearest
  // first and two at a time; while the playhead races, decoding thins out (every second frame, every
  // third when it really flies, one job at a time) and the gaps fill in once it slows. Frames more than
  // KEEP away are closed, so memory stays bounded and drawing a frame is a plain copy. Where fetch or
  // createImageBitmap is unavailable (a cross-origin host without CORS, an old browser) frames fall
  // back to decoded <img> elements. If the first and the last frame both fail, onFail() is called.
  const WINDOW = 16, KEEP = 24, JOBS = 2;
  const bitmaps = typeof createImageBitmap === 'function';
  // The decoding itself runs in one small worker shared by every frame set on the page: it turns a
  // compressed frame into a bitmap at the canvas's size and hands it back (a transfer, not a copy).
  // Scaling a frame as it decodes runs on the thread that asked for it; on the main thread that cost
  // about a frame's budget per frame, and wheeling through the scene dropped frames. Without a worker
  // (a content policy that blocks blob: workers, an old browser) frames decode on the page at their own
  // size, which costs memory rather than time; only frames over twice the canvas's size are scaled.
  const WORKER = 'onmessage=(e)=>{const d=e.data,o={premultiplyAlpha:"premultiply"};'
    + 'if(d.w)Object.assign(o,{resizeWidth:d.w,resizeHeight:d.h,resizeQuality:"high"});'
    + 'createImageBitmap(d.blob,o).catch(()=>createImageBitmap(d.blob))'
    + '.then((b)=>postMessage({id:d.id,b},[b]),()=>postMessage({id:d.id}))}';
  const decode = (() => {
    let worker = null, seq = 0, heard = false;
    const waiting = new Map();
    const here = (blob, want, natural) => (want && natural && natural[0] > 2 * want[0]
      ? createImageBitmap(blob, { resizeWidth: want[0], resizeHeight: want[1], resizeQuality: 'low', premultiplyAlpha: 'premultiply' })
      : createImageBitmap(blob, { premultiplyAlpha: 'premultiply' })).catch(() => createImageBitmap(blob));
    // the worker would not start (or died): everything it holds is decoded here instead
    const fallBack = () => {
      if (worker) worker.terminate();
      worker = false;
      waiting.forEach((j) => here(j.blob, j.want, j.natural).then(j.res, j.rej));
      waiting.clear();
    };
    const start = () => {
      if (worker !== null) return worker;
      worker = false;
      if (typeof Worker !== 'function' || !window.URL || !URL.createObjectURL) return worker;
      try {
        worker = new Worker(URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' })));
        worker.onmessage = (e) => {
          heard = true;
          const j = waiting.get(e.data.id);
          if (!j) return;
          waiting.delete(e.data.id);
          if (e.data.b) j.res(e.data.b);
          else here(j.blob, j.want, j.natural).then(j.res, j.rej);
        };
        worker.onerror = fallBack;
        // a worker that never answers (blocked without an error) is given up after 4s
        setTimeout(() => { if (!heard && worker) fallBack(); }, 4000);
      } catch { worker = false; }
      return worker;
    };
    return (blob, want, natural) => {
      const w = start();
      if (!w) return here(blob, want, natural);
      return new Promise((res, rej) => {
        const id = ++seq;
        waiting.set(id, { blob, want, natural, res, rej });
        w.postMessage({ id, blob, w: want ? want[0] : 0, h: want ? want[1] : 0 });
      });
    };
  })();
  function FrameSet(pattern, count, onFail, onLast) {
    const blobs = new Array(count).fill(null);
    const bmps = new Array(count).fill(null);
    const bmpGen = new Array(count).fill(-1);
    const imgs = new Array(count).fill(null);
    const failed = new Array(count).fill(false);
    const making = new Set();
    const listeners = new Set();
    let queue = null, active = 0, centre = 0, dir = 1, size = null, gen = 0, natural = null;
    let wanted = [], jobs = 0, limit = JOBS, idle = 0;
    const moves = [];
    const emit = (i) => listeners.forEach((fn) => fn(i));
    const ready = (i) => !!(bmps[i] && bmpGen[i] === gen);
    // frames the playhead travelled over the last 160ms
    const speed = () => { const t = performance.now(); while (moves.length && t - moves[0][0] > 160) moves.shift(); return moves.length > 1 ? Math.abs(moves[moves.length - 1][1] - moves[0][1]) : 0; };
    function makeBitmap(i) {
      making.add(i);
      jobs++;
      const g = gen;
      // at the canvas's backing size, never above the frame's own
      const want = natural && size && size[0] < natural[0] ? [size[0], Math.round((size[0] * natural[1]) / natural[0])] : null;
      const job = decode(blobs[i], want, natural);
      const done = () => { jobs--; if (g === gen) making.delete(i); pumpDecode(); };
      job.then((b) => {
        if (!natural) natural = [b.width, b.height];
        if (g !== gen || Math.abs(i - centre) > KEEP) b.close();
        else {
          if (bmps[i]) bmps[i].close();   // a bitmap of the old size stays drawable until this one is in
          bmps[i] = b;
          bmpGen[i] = g;
          emit(i);
        }
        done();
      }, done);
    }
    function pumpDecode() {
      while (jobs < limit && wanted.length) {
        const i = wanted.shift();
        if (blobs[i] && !ready(i) && !making.has(i) && Math.abs(i - centre) <= WINDOW) makeBitmap(i);
      }
    }
    // what to decode next: the frames around the playhead, nearest first, ahead before behind
    function schedule() {
      for (let i = 0; i < count; i++) if (bmps[i] && Math.abs(i - centre) > KEEP) { bmps[i].close(); bmps[i] = null; }
      const sp = speed();
      const stride = sp > 14 ? 3 : sp > 4 ? 2 : 1;
      limit = stride > 1 ? 1 : JOBS;
      wanted = [];
      for (let d = 0; d <= WINDOW; d++) {
        for (const i of d ? [centre + d * dir, centre - d * dir] : [centre]) {
          if (i < 0 || i >= count || (stride > 1 && d > 1 && i % stride)) continue;
          if (blobs[i] && !ready(i) && !making.has(i)) wanted.push(i);
        }
      }
      pumpDecode();
      clearTimeout(idle);
      if (stride > 1) idle = setTimeout(schedule, 180);
    }
    function lost(i) {
      failed[i] = true;
      if (failed[0] && failed[count - 1]) { if (queue) queue.length = 0; if (onFail) onFail(); }
    }
    function viaImage(i) {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(pattern, i);
      return img.decode().then(() => { imgs[i] = img; if (i === count - 1 && onLast) onLast(img); emit(i); }, () => lost(i));
    }
    function fetchOne(i) {
      if (!bitmaps || !window.fetch) return viaImage(i);
      return fetch(frameUrl(pattern, i))
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then((b) => { blobs[i] = b; if (i === count - 1 && onLast) onLast(b); if (Math.abs(i - centre) <= WINDOW) schedule(); }, () => viaImage(i));
    }
    const order = () => {
      const out = [0, count - 1], seen = new Set(out), spans = [[0, count - 1]];
      while (spans.length) {
        const [a, b] = spans.shift();
        if (b - a < 2) continue;
        const m = (a + b) >> 1;
        if (!seen.has(m)) { seen.add(m); out.push(m); }
        spans.push([a, m], [m, b]);
      }
      for (let i = 0; i < count; i++) if (!seen.has(i)) out.push(i);
      return out;
    };
    const pump = () => {
      while (active < 6 && queue.length) {
        const i = queue.shift();
        active++;
        fetchOne(i).then(() => { active--; pump(); });
      }
    };
    const has = (i) => !!(bmps[i] || imgs[i]);
    return {
      count,
      start() { if (queue) return; queue = order(); pump(); },
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      source: (i) => bmps[i] || imgs[i],
      // move the decode window with the playhead
      focus(k) {
        if (k === centre) return;
        dir = k > centre ? 1 : -1;
        centre = k;
        moves.push([performance.now(), k]);
        schedule();
      },
      // stop fetching (the scene gave up on its frames)
      stop() { if (queue) queue.length = 0; },
      // close every decoded bitmap (the set is not on screen); the compressed blobs stay
      release() {
        gen++;
        centre = -1e6;
        wanted = [];
        making.clear();
        clearTimeout(idle);
        for (let i = 0; i < count; i++) if (bmps[i]) { bmps[i].close(); bmps[i] = null; }
      },
      // decode at the canvas's backing size (never above the frames' own size)
      resize(w, h) {
        if (size && size[0] === w && size[1] === h) return;
        size = [w, h];
        if (!natural) return;
        gen++;
        making.clear();
        schedule();
      },
      // the decoded frame nearest to k, searching outward; -1 while nothing is ready
      nearest(k) {
        k = clamp(k, 0, count - 1);
        if (has(k)) return k;
        for (let d = 1; d < count; d++) {
          if (k - d >= 0 && has(k - d)) return k - d;
          if (k + d < count && has(k + d)) return k + d;
        }
        return -1;
      },
    };
  }

  // words as inline blocks (SplitText, the full text kept for screen readers). Unmasked on purpose: a
  // word is never half cut off by a mask mid-move; it travels a short way and fades instead. Split in
  // every build (the split is reverted with the build's matchMedia context); the last split is kept on
  // the element for measuring.
  function words(el) {
    if (!el) return [];
    const out = window.SplitText ? SplitText.create(el, { type: 'words', aria: 'auto' }).words : Stage.split(el, 'words');
    el.__xfWords = out;
    return out;
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const obj = root.querySelector('.xf-object');
    if (!stage || !obj) return null;
    const canvas = obj.querySelector('.xf-canvas');
    const iris = root.querySelector('.xf-ground__after');
    const groundBefore = root.querySelector('.xf-ground__before');
    const receiver = root.querySelector('.xf-receiver');
    const statement = root.querySelector('.xf-statement');
    const closing = root.querySelector('.xf-closing');
    const cta = root.querySelector('.xf-cta');
    const copy = root.querySelector('.xf-copy');
    const callouts = [...root.querySelectorAll('.xf-callout')];
    const still = obj.querySelector('.xf-still');

    // ---- options ----
    const pattern = opts.frames || (canvas && canvas.dataset.frames) || '';
    const count = Math.round(num(opts.count ?? (canvas && canvas.dataset.count), 120, 2, 400));
    const pPattern = opts.phoneFrames || (canvas && canvas.dataset.phoneFrames) || pattern;
    const pCount = Math.round(num(opts.phoneCount ?? (canvas && canvas.dataset.phoneCount), pPattern === pattern ? count : 60, 2, 400));
    const hold = num(opts.hold, 4, 3, 5);
    const phoneHold = num(opts.phoneHold, 3, 2, 4);
    const scrub = opts.scrub ?? (Stage.lenis ? 0.3 : 0.6);
    const split = num(opts.split, 0.85, 0.5, 0.95);
    // the page's own ground unless an old page asks for the iris by name
    const irisOn = opts.ground === 'iris' && !!iris;
    const irisAt = Array.isArray(opts.irisAt) ? [num(opts.irisAt[0], 0.5, 0, 1), num(opts.irisAt[1], 0.54, 0, 1)] : [0.5, 0.54];
    const push = num(opts.push, 1.25, 1, 1.4);
    const fb = Array.isArray(opts.firstBox) && opts.firstBox.length === 4 ? opts.firstBox.map((v, i) => num(v, [0.17, 0.3, 0.83, 0.81][i], 0, 1)) : [0.17, 0.3, 0.83, 0.81];
    const centreOn = opts.centre !== false;
    const contact = receiver && receiver.querySelector('.xf-receiver__contact');
    root.setAttribute('data-xf-ground', irisOn ? 'iris' : 'none');
    if (!pattern && canvas) console.warn(`[${ID}] no frames given: showing the finished composition`);
    const off = !pattern || !canvas || saveData();

    // ---- the before context: a wrapper holding the picture and its blurred copy ----
    let prop = root.querySelector('.xf-prop--back');
    if (prop && prop.tagName === 'IMG') {   // a bare <img class="xf-prop xf-prop--back"> is wrapped
      const wrap = document.createElement('div');
      wrap.className = prop.className;
      wrap.setAttribute('aria-hidden', 'true');
      prop.removeAttribute('class');
      prop.replaceWith(wrap);
      wrap.appendChild(prop);
      prop = wrap;
    }
    const sharp = prop && prop.querySelector('img:not(.xf-prop__soft)');
    let soft = prop && prop.querySelector('.xf-prop__soft');
    // its pictures load only where they are shown (live, on a laptop)
    const loadProp = () => {
      if (!prop || getComputedStyle(prop).display === 'none') return false;
      prop.querySelectorAll('img[data-src]').forEach((img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
      return true;
    };
    // no blurred copy in the markup: paint one once (a blurred canvas, never an animated filter)
    function makeSoft() {
      if (soft || !sharp || !window.CanvasRenderingContext2D || !('filter' in CanvasRenderingContext2D.prototype)) return;
      const c = document.createElement('canvas');
      c.className = 'xf-prop__soft';
      prop.appendChild(c);
      soft = c;
      const paint = () => {
        const w = sharp.naturalWidth, h = sharp.naturalHeight;
        if (!w || !h) return;
        c.width = w;
        c.height = h;
        const g = c.getContext('2d');
        g.filter = `blur(${((4 * w) / Math.max(1, prop.offsetWidth)).toFixed(1)}px)`;
        g.drawImage(sharp, 0, 0);
      };
      (sharp.decode ? sharp.decode() : Promise.resolve()).then(paint, () => {});
    }

    // ---- the camera: the before context, the receiver and the object move as one. A plain wrapper
    //      (display: contents in the finished composition, so nothing there changes) ----
    let camera = root.querySelector('.xf-camera');
    if (!camera) {
      const members = [prop, receiver, obj].filter(Boolean);
      camera = document.createElement('div');
      camera.className = 'xf-camera';
      members[0].before(camera);
      camera.append(...members);
    }

    // ---- the phone's callout stack (labels leave the object and line up in the bottom slot) ----
    let stack = copy && copy.querySelector('.xf-stack');
    if (copy && !stack && callouts.length) {
      stack = document.createElement('ol');
      stack.className = 'xf-stack';
      stack.setAttribute('aria-hidden', 'true');
      callouts.forEach((c) => {
        const li = document.createElement('li');
        const mark = document.createElement('span');
        mark.className = 'xf-stack__mark';
        const text = document.createElement('span');
        text.textContent = (c.querySelector('.xf-label') || c).textContent.trim().replace(/\s+/g, ' ');
        li.append(mark, text);
        stack.appendChild(li);
      });
      copy.appendChild(stack);
    }
    const rows = stack ? [...stack.children] : [];

    // ---- the still: the markup's picture (the last frame) is the finished composition's. Live, it stands
    //      in for the canvas until the canvas draws, showing the frame the set fetches first that is
    //      nearest the playhead (frame 0 from the top), and nothing while that frame loads, so the
    //      finished object never shows at the start. The markup's src, srcset and sizes come back with
    //      the finished composition. ----
    const STILL = ['srcset', 'sizes', 'src'];
    const stillMarkup = still ? STILL.map((k) => still.getAttribute(k)) : [];
    function stillBack() {
      root.classList.remove('xf-wait');
      if (!still) return;
      STILL.forEach((k, i) => {
        const v = stillMarkup[i];
        if (v == null) still.removeAttribute(k);
        else if (still.getAttribute(k) !== v) still.setAttribute(k, v);
      });
    }
    function stillAs(url) {
      if (!still || (!still.hasAttribute('srcset') && still.getAttribute('src') === url)) return;
      root.classList.add('xf-wait');
      still.removeAttribute('srcset');
      still.removeAttribute('sizes');
      still.setAttribute('src', url);
      const shown = () => { if (still.getAttribute('src') === url) root.classList.remove('xf-wait'); };
      if (still.decode) still.decode().then(shown, () => {});
      else still.addEventListener('load', shown, { once: true });
    }

    // ---- the statement is the live headline: two lines at most. A longer one is set smaller, 2px at a
    //      time, down to 40px on a laptop (28px on a phone); past that it runs on, so keep it short ----
    function fitStatement(floor) {
      if (!statement) return;
      statement.style.removeProperty('font-size');
      if (!statement.offsetParent) return;
      let size = parseFloat(getComputedStyle(statement).fontSize) || 0;
      const lh = () => { const v = parseFloat(getComputedStyle(statement).lineHeight); return v > 0 ? v : size * 1.1; };
      const lines = () => Math.round(statement.offsetHeight / lh());
      while (size - 2 >= floor && lines() > 2) {
        size -= 2;
        statement.style.fontSize = `${size}px`;
      }
      if (lines() > 2 && !fitStatement.warned) {
        fitStatement.warned = true;
        console.warn(`[${ID}] the statement needs ${lines()} lines even at ${Math.round(size)}px: shorten it (two lines hold about 36 characters at 1440px wide, 28 at 1024)`);
      }
    }

    // ---- callout labels stay readable. A label whose text would sit on the object (the last frame's
    //      silhouette, read once at 64 x 64 from its alpha) slides out beside it, away from the object,
    //      as far as the stage allows; a label that would touch an earlier label or another marker then
    //      moves up or down beside its own marker, whichever is the shorter way ----
    let mask = null, masking = false;
    function readMask(src) {
      if (mask || masking || !src || !window.HTMLCanvasElement) return;
      masking = true;
      // (the still only while it shows the last frame, in the finished composition)
      const got = src instanceof Blob ? createImageBitmap(src) : (src.decode ? src.decode() : Promise.resolve()).then(() => {
        if (src === still && root.classList.contains('is-live')) throw new Error('live');
        return src;
      });
      got.then((img) => {
        const M = 64, c = document.createElement('canvas');
        c.width = c.height = M;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, M, M);
        if (img.close) img.close();
        const d = g.getImageData(0, 0, M, M).data;   // throws for another origin without CORS: no mask
        const a = new Uint8Array(M * M);
        for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] > 160 ? 1 : 0;
        mask = { M, a };
        guardLabels();
      }).catch(() => { masking = false; });
    }
    // the silhouette cells a box (object-box px) covers
    function onObject(x, y, w, h) {
      const B = obj.offsetWidth;
      if (!mask || !B) return 0;
      const { M, a } = mask, k = M / B;
      const x0 = Math.max(0, Math.floor((x + 2) * k)), x1 = Math.min(M - 1, Math.ceil((x + w - 2) * k) - 1);
      const y0 = Math.max(0, Math.floor((y + 2) * k)), y1 = Math.min(M - 1, Math.ceil((y + h - 2) * k) - 1);
      let n = 0;
      for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) n += a[j * M + i];
      return n;
    }
    function guardLabels() {
      const boxes = [];
      for (const c of callouts) {
        const l = c.querySelector('.xf-label');
        if (l) l.style.removeProperty('translate');
        const m = c.querySelector('.xf-mark');
        if (m && m.offsetWidth) boxes.push({ x: c.offsetLeft + m.offsetLeft, y: c.offsetTop + m.offsetTop, w: m.offsetWidth, h: m.offsetHeight, own: c });
      }
      const ox = posIn(obj, stage)[0], SW = stage.clientWidth;
      for (const c of callouts) {
        const l = c.querySelector('.xf-label');
        if (!l || l.offsetWidth < 4 || getComputedStyle(l).position !== 'absolute') continue;
        // the text's own extent across (the label box is wider than short text)
        const r = l.getBoundingClientRect(), s = r.width / l.offsetWidth || 1;
        const range = document.createRange();
        range.selectNodeContents(l);
        let a = Infinity, b = -Infinity;
        for (const q of range.getClientRects()) if (q.width) { a = Math.min(a, q.left); b = Math.max(b, q.right); }
        const x0 = c.offsetLeft + l.offsetLeft + (a < b ? (a - r.left) / s : 0);
        const w = a < b ? (b - a) / s : l.offsetWidth;
        const y = c.offsetTop + l.offsetTop, h = l.offsetHeight, GAP = 16;
        // off the object: outward in 4px steps, never past the stage's 16px edge
        let dx = 0;
        if (onObject(x0, y, w, h)) {
          const out = c.dataset.side === 'left' ? -1 : 1;
          for (let t = 4; ; t += 4) {
            const xt = x0 + out * (t + 12);
            if (ox + xt < 16 || ox + xt + w > SW - 16) break;
            if (!onObject(x0 + out * t, y, w, h)) { dx = out * (t + 12); break; }
          }
        }
        const x = x0 + dx;
        const hits = (dy) => boxes.find((o) => o.own !== c && x < o.x + o.w + GAP && x + w + GAP > o.x && y + dy < o.y + o.h + GAP && y + dy + h + GAP > o.y);
        let dy = 0;
        for (let i = 0, o; i < 8 && (o = hits(dy)); i++) {
          const down = o.y + o.h + GAP - y, up = o.y - GAP - h - y;
          const [near, far] = Math.abs(down) <= Math.abs(up) ? [down, up] : [up, down];
          dy = !hits(near) || hits(far) ? near : far;
        }
        if (dx || dy) l.style.translate = `${Math.round(dx)}px ${Math.round(dy)}px`;
        boxes.push({ x, y: y + dy, w, h, own: c });
      }
    }
    let guardT = 0;
    window.addEventListener('resize', () => { clearTimeout(guardT); guardT = setTimeout(guardLabels, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(guardLabels);

    // ---- drawing ----
    const sets = {};
    const D = { set: null, want: 0, drawn: -1, ctx: null, off: null };
    const G = { W: 0, H: 0, box: 0, ox: 0, oy: 0, cx: 0, cy: 0, R: 0, recTop: 0, text: null, dText: Infinity };
    // the statement's words as laid out (no transforms), in stage coordinates
    function textRect() {
      if (!statement || !statement.offsetParent) return null;
      const split = (statement.__xfWords || []).filter((w) => w.isConnected && statement.contains(w));
      const ws = split.length ? split : [statement];
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (const w of ws) {
        const [x, y] = posIn(w, stage);
        l = Math.min(l, x); t = Math.min(t, y); r = Math.max(r, x + w.offsetWidth); b = Math.max(b, y + w.offsetHeight);
      }
      return r > l ? { l, t, r, b } : null;
    }
    function measure() {
      const W = stage.clientWidth, H = stage.clientHeight;
      G.W = W;
      G.H = H;
      G.box = obj.offsetWidth;
      [G.ox, G.oy] = posIn(obj, stage);
      G.cx = G.ox + obj.offsetWidth * irisAt[0];
      G.cy = G.oy + obj.offsetHeight * irisAt[1];
      G.R = Math.ceil(Math.hypot(Math.max(G.cx, W - G.cx), Math.max(G.cy, H - G.cy))) + 4;
      G.recTop = receiver ? posIn(receiver, stage)[1] : H;
      // how far the disc may grow before its edge touches the statement
      G.text = textRect();
      G.dText = Infinity;
      if (G.text) {
        const x = clamp(G.cx, G.text.l, G.text.r), y = clamp(G.cy, G.text.t, G.text.b);
        G.dText = Math.hypot(G.cx - x, G.cy - y);
      }
    }
    // the before context stays whole on the stage: at the camera's start scale s0 (about the pivot) its
    // far edge keeps 24px off the stage's right side. One that would pass it is drawn smaller about its
    // near foot (its transform-origin), down to 0.45; past that it stays out. Returns the scale it starts
    // at (the prop's tween multiplies its own by it), measured again on every refresh.
    function fitProp(s0) {
      if (!prop) return 1;
      prop.style.removeProperty('visibility');
      if (getComputedStyle(prop).display === 'none' || !prop.offsetWidth) return 1;
      const px = posIn(prop, stage)[0], pw = prop.offsetWidth;
      const left = G.cx + s0 * (px - G.cx), right = G.cx + s0 * (px + pw - G.cx), limit = G.W - 24;
      if (right <= limit) return 1;
      const k = (limit - left) / Math.max(1, right - left);
      if (k >= 0.45) return +k.toFixed(3);
      prop.style.visibility = 'hidden';
      return 1;
    }
    // the largest push-in (≤ max) that keeps the first frame's object CLEAR px off the title
    function pushScale(max) {
      if (!G.text || max <= 1) return max;
      const bx0 = G.ox + fb[0] * G.box, by0 = G.oy + fb[1] * G.box, bx1 = G.ox + fb[2] * G.box, by1 = G.oy + fb[3] * G.box;
      for (let s = max; s > 1; s -= 0.01) {
        const L = G.cx + s * (bx0 - G.cx), T = G.cy + s * (by0 - G.cy), R = G.cx + s * (bx1 - G.cx), B = G.cy + s * (by1 - G.cy);
        const dx = Math.max(G.text.l - R, L - G.text.r, 0), dy = Math.max(G.text.t - B, T - G.text.b, 0);
        if (Math.hypot(dx, dy) >= CLEAR) return +s.toFixed(2);
      }
      return 1;
    }
    function sizeCanvas() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(obj.offsetWidth * dpr)), h = Math.max(1, Math.round(obj.offsetHeight * dpr));
      if (D.set) D.set.resize(w, h);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      D.ctx = null;
      D.drawn = -1;
    }
    function draw(force) {
      const set = D.set;
      if (!set || !canvas) return;
      const k = set.nearest(D.want);
      if (k < 0 || (k === D.drawn && !force)) return;   // never clear without a bitmap to draw
      if (!D.ctx) { D.ctx = canvas.getContext('2d'); D.ctx.imageSmoothingEnabled = true; D.ctx.imageSmoothingQuality = 'high'; }
      D.ctx.clearRect(0, 0, canvas.width, canvas.height);
      D.ctx.drawImage(set.source(k), 0, 0, canvas.width, canvas.height);
      D.drawn = k;
      canvas.dataset.frame = String(k);
      if (!root.classList.contains('xf-drawn')) root.classList.add('xf-drawn');   // the still steps aside
    }
    const want = (f) => {
      const k = Math.round(f);
      if (k === D.want && k === D.drawn) return;
      D.want = k;
      if (D.set) D.set.focus(k);
      draw(false);
    };
    if (window.ScrollTrigger) {
      ScrollTrigger.addEventListener('refresh', () => { if (D.set) { sizeCanvas(); draw(true); } });
    }

    // the after-colour disc: a flat circle of the stage's full reach (radius R, centred on the object),
    // scaled on the compositor. It is painted once; growing it repaints nothing (a clip-path circle would
    // repaint the whole stage, the title included, at every step). Its size is set on every refresh.
    const placeDisc = () => {
      measure();
      const s = iris.style;
      s.left = `${Math.round(G.cx - G.R)}px`;
      s.top = `${Math.round(G.cy - G.R)}px`;
      s.width = s.height = `${2 * G.R}px`;
    };
    const discScale = (r) => Math.max(0, r) / Math.max(1, G.R);
    // the halo: around the object, its edge at least `gap` px short of the statement
    const halo = (grow, gap) => () => { placeDisc(); return discScale(Math.min(G.box * 0.56 * grow, G.dText - gap)); };

    // ---- frames that will not load: give up and show the finished composition ----
    let mm = null, gaveUp = false;
    const giveUp = () => {
      if (gaveUp) return;
      gaveUp = true;
      console.warn(`[${ID}] the first and last frames did not load: showing the finished composition`);
      Object.values(sets).forEach((s) => s.stop());
      if (mm) mm.revert();
      root.classList.remove('is-live');
      root.classList.add('is-rest');
      root.style.removeProperty('--hold');
      rest();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };

    // ---- the timeline ----
    const build = (tl, ctx) => {
      const phone = ctx.phone;
      const set = phone ? (sets.m || (sets.m = FrameSet(pPattern, pCount, giveUp))) : (sets.d || (sets.d = FrameSet(pattern, count, giveUp, readMask)));
      Object.values(sets).forEach((s) => { if (s !== set) s.release(); });
      D.set = set;
      D.want = 0;
      D.drawn = -1;
      root.classList.remove('xf-drawn');   // the markup's still shows until a frame is drawn
      if (D.off) D.off();
      D.off = set.on((i) => {
        if (D.drawn === D.want) return;
        if (D.drawn < 0 || Math.abs(i - D.want) < Math.abs(D.drawn - D.want)) draw(false);
      });
      // the statement at a size that keeps it to two lines (again on every refresh: the column's width
      // follows the window); the matchMedia cleanup gives back its CSS size and the markup's still
      const floor = phone ? 28 : 40;
      const refit = () => fitStatement(floor);
      fitStatement(floor);
      if (window.ScrollTrigger) ScrollTrigger.addEventListener('refreshInit', refit);
      gsap.context(() => () => {
        if (window.ScrollTrigger) ScrollTrigger.removeEventListener('refreshInit', refit);
        if (statement) statement.style.removeProperty('font-size');
        stillBack();
      });
      // words first: the camera and the disc measure the statement's words as they are laid out
      const sw = words(statement);
      measure();
      sizeCanvas();
      // fetch the frames once the scene is within three screens
      if (root.getBoundingClientRect().top < window.innerHeight * 3) set.start();
      else ScrollTrigger.create({ trigger: root, start: 'top 300%', once: true, onEnter: () => set.start() });
      const propOn = !phone && loadProp();
      [propOn ? sharp : null, propOn && soft && soft.tagName === 'IMG' ? soft : null, receiver && receiver.querySelector('img')].forEach((img) => { if (img && img.src && img.decode) img.decode().catch(() => {}); });
      if (propOn) makeSoft();

      // a staggered fromTo renders only its first target up front: set every target's start state first.
      // Words and markers move in 2D (force3D off): scrubbing back and forth across their windows would
      // otherwise promote and drop a compositor layer per word, which costs more than repainting them.
      const tween = (targets, from, to, at) => { gsap.set(targets, from); return tl.fromTo(targets, from, { ...to, force3D: false }, at); };
      // words (and the receiver) that land on a clock: a paused tween played once the scrubbed timeline
      // passes `at` and reversed when it goes back before it, so no rest of the scroll shows them half in
      const clocks = [];
      const clock = (targets, from, to, at) => {
        if (!targets || (Array.isArray(targets) && !targets.length)) return;
        gsap.set(targets, from);
        clocks.push({ at, on: false, tw: gsap.fromTo(targets, from, { ...to, force3D: false, paused: true, immediateRender: true }) });
      };

      const N = set.count, mid = Math.round(split * (N - 1));
      // the still stands in with the first or the last frame, whichever is nearer the playhead now
      const r0 = root.getBoundingClientRect();
      const p0 = clamp(-r0.top / Math.max(1, r0.height - window.innerHeight), 0, 1);
      const f0 = p0 <= 0.04 ? 0 : p0 <= 0.62 ? (mid * (p0 - 0.04)) / 0.58 : N - 1;
      stillAs(frameUrl(phone ? pPattern : pattern, f0 > (N - 1) / 2 ? N - 1 : 0));
      // a layer only while it fades: kept for the whole scene, every layer costs every frame
      const layerDuring = (els, a, b) => {
        tl.fromTo(els, { willChange: 'auto' }, { willChange: 'opacity', duration: 0.001, immediateRender: false }, a);
        tl.to(els, { willChange: 'auto', duration: 0.001 }, b);
      };
      const seq = { f: 0 };
      const step = () => want(seq.f);
      const pivot = () => { measure(); return `${Math.round(G.cx)}px ${Math.round(G.cy)}px`; };
      // how far the camera glides to centre the object (laptop; 0 when it is centred already)
      const glides = !phone && centreOn;
      const glide = () => { measure(); return glides ? Math.round(G.W / 2 - (G.ox + G.box / 2)) : 0; };

      // 1. the camera starts pushed in on the raw object and pulls back while it changes (a laptop keeps
      //    the first frame's object clear of the title); the object settles as the pin catches
      if (phone) {
        tl.fromTo(obj, { yPercent: 4 }, { yPercent: 0, duration: 0.06, ease: 'power2.out' }, 0);
        tl.fromTo(camera, { scale: 1.12, transformOrigin: pivot }, { scale: 1, transformOrigin: pivot, duration: 0.36, ease: 'power1.inOut' }, 0.04);
      } else {
        tl.fromTo(camera, { scale: () => { measure(); return pushScale(push); }, transformOrigin: pivot }, { scale: 1, transformOrigin: pivot, duration: 0.4, ease: 'power1.inOut' }, 0);
      }
      // 2-3. the frames: linear, then the last stretch eases in
      tl.fromTo(seq, { f: 0 }, { f: mid, duration: 0.58, ease: 'none', onUpdate: step }, 0.04);
      tl.to(seq, { f: N - 1, duration: 0.24, ease: 'power1.out', onUpdate: step }, 0.62);
      // 4. the ground: a halo around the object while the title is read, then the whole stage once it
      //    has lifted away (power2.in: the edge reaches the title's words only as they finish leaving)
      if (irisOn) {
        // the disc exists only while it grows (0.08-0.562): outside that it is not drawn at all
        tl.fromTo(iris, { display: 'none' }, { display: 'block', duration: 0.001 }, 0.079);
        tl.fromTo(iris, { scale: () => { placeDisc(); return 0; } }, { scale: halo(1, 44), duration: 0.17, ease: 'power2.out' }, 0.08);
        tl.to(iris, { scale: halo(1.05, 36), duration: 0.19, ease: 'none' }, 0.25);
        tl.to(iris, { scale: 1, duration: 0.12, ease: 'power2.in' }, 0.44);
        // once the disc covers the stage, it and the before colour step aside for the ground's own flat
        // after colour (no visible change, and nothing left to composite)
        tl.to([iris, groundBefore], { display: 'none', duration: 0.001 }, 0.562);
      }
      // 5. the before context leaves; on a laptop its blurred copy fades in over it (a rack focus)
      if (prop) {
        // (its start scale keeps it whole on the stage under the camera's push: fitProp)
        let pk = 1;
        const propFit = () => { measure(); pk = phone ? 1 : fitProp(pushScale(push)); return pk; };
        tl.fromTo(prop, { x: 0, yPercent: 0, scale: propFit, opacity: 1 }, { x: () => G.W - posIn(prop, stage)[0] + 24 + Math.max(0, -glide()), yPercent: 6, scale: () => 0.86 * pk, opacity: 0, duration: 0.18, ease: 'power1.inOut' }, 0.3);
        if (propOn && soft && sharp) {
          layerDuring([soft, sharp], 0.299, 0.481);
          tl.fromTo(soft, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'none' }, 0.3);
        }
      }
      // 6. the before statement lifts out word by word, on a clock (never caught half gone), just before
      //    the camera glides towards its corner. On a phone the callout rows take its slot: one clock lifts
      //    the statement and then brings the rows in, so the two never share the slot, even scrolling back.
      const lift = { yPercent: -70, autoAlpha: 0, duration: 0.24, ease: 'power2.in', stagger: { amount: 0.1 } };
      const phoneRows = phone ? rows.filter((r) => r && getComputedStyle(r).display !== 'none') : [];
      if (phoneRows.length) {
        if (sw.length) gsap.set(sw, { yPercent: 0, autoAlpha: 1 });
        gsap.set(phoneRows, { autoAlpha: 0, y: 14 });
        const swap = gsap.timeline({ paused: true });
        if (sw.length) swap.fromTo(sw, { yPercent: 0, autoAlpha: 1 }, { ...lift, force3D: false, immediateRender: false }, 0);
        swap.fromTo(phoneRows, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power3.out', stagger: 0.1, force3D: false, immediateRender: false }, sw.length ? 0.34 : 0);
        clocks.push({ at: 0.46, on: false, tw: swap });
      } else clock(sw, { yPercent: 0, autoAlpha: 1 }, lift, 0.44);
      // 7. while the title is away the camera glides the object to the centre of the stage (laptop)
      if (glides) {
        tl.fromTo(camera, { x: 0 }, { x: glide, duration: 0.14, ease: 'power2.inOut' }, 0.46);
        tl.to(camera, { x: 0, duration: 0.12, ease: 'power2.inOut' }, 0.76);
      }
      // 8. the receiver rises a short way into its place as it fades in, on a clock (never half in, never
      //    cut by the stage's foot); 9. the object settles onto it
      if (receiver) clock(receiver, { yPercent: 7, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 0.47);
      tl.fromTo(obj, { y: 0 }, { y: () => obj.offsetWidth * (parseFloat(getComputedStyle(root).getPropertyValue('--xf-settle')) || 0), duration: 0.16, ease: 'power2.inOut' }, 0.62);
      if (contact) {
        layerDuring(contact, 0.679, 0.781);
        tl.fromTo(contact, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power1.in' }, 0.68);
      }
      // 10. callouts: each label lands word by word on a clock, starting as the title has left and the
      //     shape is thrown (a phone's rows came in with the statement's exit, step 6). No marker is
      //     drawn: a marker in the markup stays hidden (CSS) and is not animated.
      if (!phone) {
        const shown = callouts.slice(0, MAX_CALLOUTS);
        const n = shown.length, gap = n > 1 ? Math.min(0.07, 0.2 / (n - 1)) : 0;
        shown.forEach((c, i) => {
          const lw = words(c.querySelector('.xf-label'));
          if (lw.length) clock(lw, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.32, ease: 'power3.out', stagger: { amount: 0.12 } }, 0.47 + gap * i);
        });
        guardLabels();
      }
      // 11. the after line rises into the slot the statement left; 12. the action after it (one clock)
      const cw = words(closing);
      clock(cw, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.34, ease: 'power3.out', stagger: { amount: 0.1 } }, 0.84);
      clock(cta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, delay: 0.14, ease: 'power2.out' }, 0.84);
      // the clocks follow the scrubbed playhead (a watcher over the whole hold)
      if (clocks.length) {
        const watch = { t: 0 };
        const tick = () => {
          for (const c of clocks) {
            const on = watch.t >= c.at;
            if (on === c.on) continue;
            c.on = on;
            // forward at its own pace; back two and a half times as fast, so a jump back up the page
            // never leaves words standing over the pushed-in camera
            if (on) c.tw.timeScale(1).play(); else c.tw.timeScale(2.5).reverse();
          }
        };
        tl.fromTo(watch, { t: 0 }, { t: 1, duration: 1, ease: 'none', onUpdate: tick }, 0);
      }
      // 13. hold to the end
      tl.set({}, {}, 1);
      step();
    };

    function rest() {
      D.set = null;
      Object.values(sets).forEach((s) => s.release());
      if (D.off) { D.off(); D.off = null; }
      root.classList.remove('xf-drawn');
      if (iris) ['left', 'top', 'width', 'height'].forEach((k) => iris.style.removeProperty(k));
      stillBack();
      // the "where it started" tile is no longer shown (a small captioned thumbnail beside the heading
      // read as a label): its markup is still accepted, and its picture is never loaded
      guardLabels();
      // the still is the last frame again: its silhouette keeps the labels off the object
      if (still) readMask(still);
    }

    mm = Stage.scene(root, {
      hold,
      scrub,
      build: off ? undefined : build,
      phone: off ? 'rest' : { hold: phoneHold, build },
      rest,
    });
    // The stage calls rest() from a gsap.matchMedia whose conditions are "motion allowed" and "phone",
    // and gsap calls nothing while none of them match: a laptop with reduced motion. The CSS already
    // shows the finished composition there; rest() (the labels kept off the object) runs here too,
    // also when reduced motion is switched on later (after the stage has taken the live layout down).
    const calm = Stage.live && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce) and (min-width: 768px)');
    if (calm) {
      const settle = () => { if (calm.matches) setTimeout(() => { if (!root.classList.contains('is-live')) rest(); }, 60); };
      settle();
      if (calm.addEventListener) calm.addEventListener('change', settle);
      else if (calm.addListener) calm.addListener(settle);
    }
    return mm;
  };
})();
