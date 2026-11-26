// assets/scenes/closing-cut-under-the-rise/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / closing-cut-under-the-rise.js — "Closing cut under the rise".
//
// A closing scene for a page about one physical thing (a chair, a lamp, a kettle, a dish, a garment).
// The last section holds a cut-out photograph of the thing standing low in a flat room of two tints: the
// closing picture's own wall and floor, split exactly where the picture's floor meets its wall. On a
// slow scrub the cut-out is carried up the frame, whole on every frame (never sliced by the top edge),
// onto the row where the thing stands in the photograph, while the camera ducks under it and comes back
// (the room sinks by a fifth of a screen at most and settles). There, in one frame, the flat room and
// the cut-out are gone and the closing photograph, which was waiting beneath them, fills the screen
// with the thing in the same place: its floor line sits on the same row as the flat floor's edge, so
// the cut reads as the room coming into focus, not as a jump, and the camera's return carries on
// through it. Over the photograph the page's last sentence arrives in two or three plain steps
// (whole phrases, never letters), and one plain action follows under it. Flat tints only: no fade
// through black or white, no glow, no gradient.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and closing-cut-under-the-rise.css.
//
// ── DOM ───────────────────────────────────────────────────────────────────────────────────────────
// <section class="scene" id="close" data-scene="closing-cut-under-the-rise"
//          data-options='{"place":"top-right"}' aria-labelledby="ccr-line">
//   <div class="scene-stage">
//     <div class="ccr">
//       <div class="ccr-world">                                   the camera's world: it rises and settles
//         <figure class="ccr-close">                             the closing photograph, full bleed
//           <picture>
//             <source media="(max-aspect-ratio: 4/5)" srcset="…portrait crop…" width height data-horizon="0.7">
//             <img class="ccr-close-img" src="…landscape…" width height alt loading="eager" data-horizon="0.7">
//           </picture>
//         </figure>
//         <div class="ccr-carrier">                              carries the cut-out up
//           <img class="ccr-subject" src="…cut-out.png…" width height alt="">
//                 a photograph of the thing cut to its own edges on a transparent ground (PNG or WebP with
//                 alpha), straight on, 1400px tall or more; never a drawing
//         </div>
//       </div>
//       <p class="ccr-caption">What the cut-out is, 2-6 words</p>   optional, on the flat floor until the cut
//       <div class="ccr-words">
//         <h2 class="ccr-line" id="ccr-line">
//           <span class="ccr-step">First phrase,</span> <span class="ccr-step">second phrase,</span>
//           <span class="ccr-step">third phrase.</span>                 two or three steps, 6-12 words in all
//         </h2>
//         <a class="ccr-action" href="…">The one action, 2-4 words</a>   a real link or button
//       </div>
//     </div>
//   </div>
// </section>
// <footer>…the page's designed footer, a section of its own: it follows the finished frame…</footer>
// The script adds the flat room (.ccr-ground holding .ccr-floor) inside .ccr-world.
//
// data-subject on the img and on each <source>: "x y", the subject's centre across and its foot, as shares
// of that file (0-1). The cut-out starts there, at its own size or larger, so it rises from its own place.
// data-horizon on the img and on each <source>: where the photograph's floor meets its wall, as a share of
// that file's own height (0-1). The script maps it through the crop on every screen, so the flat floor's
// edge lands on the same row as the photograph's. Leave it out and the flat room is one tint (the wall).
// A separate portrait file goes in a <source> with its own data-horizon; one file can instead be framed
// for portrait with the --ccr-object-portrait token (object-position, the focal point).
//
// ── Options (data-options JSON; a value that is not a number or not known falls back) ──────────────
//   hold     1.6   (1.4-2.4)  screens the stage is held for (a closing scene holds about one screen and a
//                             half: the rise, the cut and three phrases)
//   rise     1     (1-2.4)    the rise's speed, in screens over the whole hold (only the stretch before
//                             the cut shows). The cut-out starts lower by the distance it travels before
//                             the cut, so at the cut it stands where the subject stands in the photograph,
//                             but never under the stage's foot margin (there the rise is shortened to the
//                             room it has, so the cut still lands it on its row); where it would still
//                             reach the top edge before the cut, the script slows the rise. It is whole on
//                             every frame.
//   phoneRise (rise)  (1-2.4)  the same below 768px, where the cut-out is fitted to the width and smaller
//   ease     'none'           the rise: steady, so it is visibly moving within the first tenth (an in-out
//                             ease such as 'sine.inOut' starts slower and hides the first beat)
//   dip      0.2   (0-0.3)    screens the stage counter-moves down under the rise and comes back (the camera
//                             ducks; it is deepest half-way and settles by 100%): small, so nothing
//                             important ever leaves the frame; the script lowers it where it would sink the
//                             subject's foot under the band
//   phoneDip 0.1   (0-0.3)    the same on a portrait screen, where every pixel of height is the crop's
//   cut      0.3   (0.25-0.6) where the flat room and the cut-out give way to the photograph (0.28 for a
//                             short thing standing low): the rise before it is the part that shows, and the
//                             cut lands the thing in its own place
//   size     0.5   (0.35-0.6) the cut-out's height as a share of the stage, about the subject's own height
//                             in the photograph as cropped (larger has no room to rise and shrinks at the
//                             cut); a phone fits it to the width
//   from     cut + 0.04       where the first phrase has arrived: right after the cut, so the band (solid
//                             from the cut frame) never sits empty
//   to       0.88  (0.65-0.9) where the last phrase has arrived, and the action with it; the phrases are
//                             spread evenly between, and the rest of the hold is the finished frame settling
//                             (a short rest: a longer one repeats the same frame)
//   band     'floor' | 'none'   floor: the words sit on a short flat band of the floor's tint across the
//            foot of the photograph; before the cut that strip is the flat room's own floor, so the band
//            does not change at the cut and the photograph above it stays whole. none: straight on the
//            photograph's calm area (a plain wall, a sky), which must stay calm while the picture settles
//   place    'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'   where the words sit (with the
//            band: the side the line starts on; the action takes the other end)
//   tint     'auto' | 'token'   auto: the wall and floor tints are the medians of the photograph's own
//            wall and floor (a band above and below the floor line, as cropped on this screen; the picture
//            must be same-origin or CORS-enabled). token: --ccr-wall and --ccr-floor.
//   foot     unset (the default): the scene ends at its own bottom and the page's designed footer follows
//            it. A selector pulls that element up over the stage's foot so the scroll ends on the finished
//            frame: only for a page that ends on the scene with one plain line, which a page dealt a footer
//            never does
//   scrub    true (locked to the scrollbar) | seconds 0.1-1
//   phone    'same' (default) | 'rest'
//
// ── Timing ───────────────────────────────────────────────────────────────────────────────────────
// The hold, 0 → 1 (every tenth of it shows something new):
//   0 → cut     the cut-out rises steadily from the first frame, from low on the flat floor onto the row
//               where the thing stands in the photograph, whole all the way; the stage counter-moves down
//               (sin curve), so the floor edge sinks under the rising thing
//   cut         one frame: the flat room, the cut-out and the caption are hidden, the photograph shows,
//               its floor line on the flat floor's row, the camera still moving; the band is solid on this
//               frame (it was the flat floor's foot a frame before), so it never blinks out
//   cut → 1     the camera comes back (the photograph settles a fifth of a screen into its framing); the
//               phrases arrive one by one on the band, each a short fade and rise of a third of a line, the
//               action together with the last one; from about 90% the frame is finished and only settles,
//               ending exactly at 100%
// Nothing runs on a clock: every frame is a function of the scroll, so it stops where the visitor stops
// and runs backwards exactly when they scroll back. A keyboard user who tabs to the action lands on the
// end of the hold, with the line whole.
//
// Phone (below 768px): the same rise and cut at full width, the cut-out fitted to the width less the
// margins, the photograph's own portrait crop (a <source> or --ccr-object-portrait), the line over the
// action on the band. Reduced motion, no script and a failed CDN: the finished composition, the closing
// photograph a screen tall with the line and the action on it, nothing hidden (the cut-out is the
// scene's moving part and stays out).
(() => {
  const ID = 'closing-cut-under-the-rise';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && Number.isFinite(n) ? clamp(n, a, b) : d; };
  const r2 = (v) => Math.round(v * 100) / 100;

  // the median colour of a region of the picture, as it is cropped in its box (object-fit: cover)
  let cvs = null;
  const median = (img, box, y0, y1, x0 = 0.25, x1 = 0.75) => {
    const W = box.w, H = box.h, nw = img.naturalWidth, nh = img.naturalHeight;
    if (!W || !H || !nw || !nh || y1 - y0 < 2) return null;
    const k = Math.max(W / nw, H / nh), ox = (W - nw * k) * box.px, oy = (H - nh * k) * box.py;
    const u0 = clamp((x0 * W - ox) / k, 0, nw - 1), u1 = clamp((x1 * W - ox) / k, 1, nw);
    const v0 = clamp((y0 - oy) / k, 0, nh - 1), v1 = clamp((y1 - oy) / k, v0 + 1, nh);
    cvs = cvs || document.createElement('canvas');
    cvs.width = 32; cvs.height = 16;
    const g = cvs.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, 32, 16);
    g.drawImage(img, u0, v0, u1 - u0, v1 - v0, 0, 0, 32, 16);
    const d = g.getImageData(0, 0, 32, 16).data;   // throws on a cross-origin picture: the tokens stay
    const ch = [[], [], []];
    for (let i = 0; i < d.length; i += 4) { ch[0].push(d[i]); ch[1].push(d[i + 1]); ch[2].push(d[i + 2]); }
    return ch.map((a) => a.sort((p, q) => p - q)[a.length >> 1]);
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const $ = (s) => root.querySelector(s);
    const stage = root.querySelector(':scope > .scene-stage');
    const world = $('.ccr-world'), close = $('.ccr-close'), img = close && close.querySelector('img');
    const carrier = $('.ccr-carrier'), subject = $('.ccr-subject'), words = $('.ccr-words');
    const caption = $('.ccr-caption'), action = $('.ccr-action');
    if (!stage || !world || !close || !img || !carrier || !subject || !words) {
      console.warn(`${ID}: needs .scene-stage > .ccr with .ccr-world (holding .ccr-close with an img and .ccr-carrier with .ccr-subject) and .ccr-words`);
      return Stage.scene(root, { build: null });
    }
    const cut = num(opts.cut, 0.3, 0.25, 0.6);
    const PLACE = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
    const o = {
      hold: num(opts.hold, 1.6, 1.4, 2.4),
      rise: num(opts.rise, 1, 1, 2.4),
      phoneRise: num(opts.phoneRise, NaN, 1, 2.4),
      dip: num(opts.dip, 0.2, 0, 0.3),
      phoneDip: num(opts.phoneDip, 0.1, 0, 0.3),
      cut,
      ease: typeof opts.ease === 'string' && opts.ease.trim() ? opts.ease.trim() : 'none',
      size: num(opts.size, 0.5, 0.35, 0.6),
      from: num(opts.from, Math.min(0.75, cut + 0.04), cut + 0.04, 0.8),
      to: num(opts.to, 0.88, 0.65, 0.9),
      place: PLACE.includes(opts.place) ? opts.place : 'bottom-left',
      band: opts.band === 'none' || opts.band === false ? 'none' : 'floor',
      tint: opts.tint === 'auto' ? 'auto' : 'token',
      foot: typeof opts.foot === 'string' ? opts.foot.trim() : '',
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const sv = num(opts.scrub, NaN, 0.1, 1);
    const scrub = Number.isFinite(sv) && opts.scrub !== true ? sv : true;
    const ease = (window.gsap && gsap.parseEase(o.ease)) || ((t) => t);
    root.dataset.ccrPlace = o.place;
    root.dataset.ccrBand = o.band;

    // the cut-out's shape from its own width and height
    const sw = +subject.getAttribute('width') || subject.naturalWidth, sh = +subject.getAttribute('height') || subject.naturalHeight;
    if (sw && sh) root.style.setProperty('--ccr-ratio', String(r2(sw / sh)));
    root.style.setProperty('--ccr-size', String(o.size));
    for (const im of [img, subject]) if (im.decode) im.decode().catch(() => {});   // decoded before they move

    // the flat room: the wall is the ground itself, the floor one flat field from the floor line down
    let ground = world.querySelector(':scope > .ccr-ground');
    if (!ground) { ground = document.createElement('div'); ground.className = 'ccr-ground'; ground.setAttribute('aria-hidden', 'true'); world.insertBefore(ground, carrier); }
    let floor = ground.querySelector('.ccr-floor');
    if (!floor) { floor = document.createElement('div'); floor.className = 'ccr-floor'; ground.append(floor); }
    const steps = [...words.querySelectorAll('.ccr-step')];
    const arrive = [...(steps.length ? steps : [words.querySelector('.ccr-line')].filter(Boolean)), ...(action ? [action] : [])];

    const S = { live: false, phone: false, tl: null, t: 0, side: '', H: 0, hy: NaN, foot: null, ride: false };
    root.__ccr = S;   // state, for inspection in devtools
    const footEl = () => { if (!o.foot) return null; try { return document.querySelector(o.foot); } catch { return null; } };

    // which file the picture shows now: the first <source> whose media matches, else the img
    const file = () => {
      for (const s of close.querySelectorAll('source')) if (!s.media || matchMedia(s.media).matches) return s;
      return img;
    };
    const horizon = () => { const h = parseFloat(file().dataset.horizon); return Number.isFinite(h) ? clamp(h, 0, 1) : NaN; };
    // where the subject stands in that file: its centre across and its foot, as shares of the file
    const spot = () => { const v = String(file().dataset.subject || '').trim().split(/[\s,]+/).map(Number); return v.length >= 2 && v.every(Number.isFinite) ? { x: clamp(v[0], 0, 1), y: clamp(v[1], 0, 1) } : null; };

    // Everything the frames depend on: the overscan the dip needs, the floor line as cropped on this
    // screen, the two tints. Runs before ScrollTrigger measures and whenever the picture changes file.
    const measure = () => {
      if (!S.live) return;
      const H = stage.clientHeight || innerHeight, W = stage.clientWidth || innerWidth;
      S.H = H;
      S.dip = matchMedia('(max-aspect-ratio: 4/5)').matches ? o.phoneDip : o.dip;
      const over = Math.ceil(S.dip * H) + 2;
      root.style.setProperty('--ccr-over', over + 'px');
      // the floor line: the picture's own row, through object-fit: cover and its object-position
      const cs = getComputedStyle(img);
      const pos = (cs.objectPosition || '50% 50%').split(/\s+/);
      const pct = (s) => (/%$/.test(s) ? parseFloat(s) / 100 : 0.5);
      const box = { w: img.clientWidth || W, h: img.clientHeight || H + over, px: pct(pos[0] || '50%'), py: pct(pos[1] || '50%') };
      const top = img.getBoundingClientRect().top - world.getBoundingClientRect().top;
      const hf = horizon(), nw = img.naturalWidth, nh = img.naturalHeight;
      if (Number.isFinite(hf) && nw && nh) {
        const k = Math.max(box.w / nw, box.h / nh), oy = (box.h - nh * k) * box.py;
        S.hy = Math.round(top + oy + hf * nh * k);
        root.style.setProperty('--ccr-horizon', S.hy + 'px');
        root.dataset.ccrFloor = 'on';
      } else { S.hy = NaN; root.style.removeProperty('--ccr-horizon'); root.dataset.ccrFloor = 'off'; }
      // the cut-out starts where the subject stands in the photograph (its centre and its foot), so the
      // cut lands the very thing back in its own place; kept inside the side margins
      const sp = spot();
      root.style.removeProperty('--ccr-x'); root.style.removeProperty('--ccr-foot');
      let footRow = NaN;
      if (sp && nw && nh) {
        const k = Math.max(box.w / nw, box.h / nh), ox = (box.w - nw * k) * box.px, oy = (box.h - nh * k) * box.py;
        const half = (subject.offsetWidth || 0) / 2, pad = parseFloat(getComputedStyle(root).getPropertyValue('--ccr-pad')) || 16;
        const x = clamp(ox + sp.x * nw * k, half + pad, W - half - pad);
        const foot = Math.round(top + oy + sp.y * nh * k);
        footRow = foot;
        root.style.setProperty('--ccr-x', Math.round(x) + 'px');
        root.style.setProperty('--ccr-foot', Math.max(0, Math.round(H - foot)) + 'px');
      }
      // the tints: the picture's own wall just above the line and its floor just below it
      root.style.removeProperty('--ccr-wall-c'); root.style.removeProperty('--ccr-floor-c');
      if (o.tint === 'auto' && img.complete && nw) {
        try {
          const ly = Number.isFinite(S.hy) ? S.hy - top : box.h * 0.6;
          const wall = median(img, box, Math.max(0, ly - 0.28 * H), ly - 0.03 * H);
          const flo = Number.isFinite(S.hy) ? median(img, box, ly + 0.03 * H, Math.min(box.h, ly + 0.22 * H)) : null;
          if (wall) root.style.setProperty('--ccr-wall-c', `rgb(${wall.join(' ')})`);
          if (flo) root.style.setProperty('--ccr-floor-c', `rgb(${flo.join(' ')})`);
        } catch { /* cross-origin: the tokens stay */ }
      }
      // the words ride with the photograph (so they stay on its calm area) unless they sit on their own band
      const bg = getComputedStyle(words).backgroundColor;
      S.ride = !bg || bg === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(bg);
      // the footer line over the stage's foot
      if (S.foot) {
        const tail = Math.round(S.foot.offsetHeight);
        S.foot.style.setProperty('--ccr-tail', tail + 'px');
        root.style.setProperty('--ccr-tail', tail + 'px');
      }
      // the dip never sinks the subject's foot under the band: on a tall crop the subject stands close to
      // it, and a full dip would cut the thing off at its foot for most of the hold
      S.dipPx = S.dip * H;
      if (Number.isFinite(footRow) && !S.ride && !o.place.startsWith('top')) {
        const bandTop = H - words.offsetHeight;
        S.dipPx = clamp(bandTop - 12 - footRow, 0, S.dipPx);
      }
      // the start: the cut-out starts lower by the distance it travels before the cut, so at the cut it
      // stands on the subject's own row in the photograph (the dip moves both alike), but never under the
      // stage's foot margin; where it would still reach the top edge before the cut, the rise is slowed.
      // Either way it is whole on every frame it shows.
      S.low = 0; S.riseK = 1;
      const R = (S.phone && Number.isFinite(o.phoneRise) ? o.phoneRise : o.rise) * H;
      const m = Math.max(16, Math.round(0.04 * H));
      const top0 = carrier.offsetTop, hh = carrier.offsetHeight;
      if (hh && hh <= H - 2 * m) {
        S.low = clamp(R * ease(o.cut), 0, Math.max(0, H - m - (top0 + hh)));
        // a capped start: the rise is shortened to the room there is, so the cut still lands it on its row
        const pre = R * ease(o.cut); if (pre > 0 && S.low < pre) S.riseK = S.low / pre;
        const topAt = (k) => {
          let v = Infinity;
          for (let i = 0; i <= 48; i++) { const t = (o.cut * i) / 48; v = Math.min(v, top0 + S.low - k * R * ease(t) + S.dipPx * Math.sin(Math.PI * t)); }
          return v;
        };
        if (topAt(S.riseK) < m && topAt(0) >= m) {
          let a = 0, b = S.riseK;
          for (let j = 0; j < 24; j++) { const c = (a + b) / 2; if (topAt(c) < m) b = c; else a = c; }
          S.riseK = a;
        }
      }
    };

    // the frame at t: the world's dip, the carrier's rise and which side of the cut it is
    const render = (t) => {
      if (!S.live) return;
      S.t = t;
      const H = S.H || innerHeight;
      const amp = Number.isFinite(S.dipPx) ? S.dipPx : (S.dip ?? o.dip) * H;
      const d = amp * Math.sin(Math.PI * clamp(t, 0, 1));
      world.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
      words.style.transform = S.ride ? `translate3d(0, ${d.toFixed(1)}px, 0)` : '';
      const R = S.phone && Number.isFinite(o.phoneRise) ? o.phoneRise : o.rise;
      const y = (S.low || 0) - (S.riseK ?? 1) * R * H * ease(clamp(t, 0, 1));
      carrier.style.transform = `translate3d(-50%, ${y.toFixed(1)}px, 0)`;
      const side = t >= o.cut ? 'after' : 'before';
      if (side !== S.side) { S.side = side; root.dataset.ccrCut = side; }
    };

    const unhook = () => {
      S.live = false;
      if (S.foot) { S.foot.removeAttribute('data-ccr-foot'); S.foot.style.removeProperty('--ccr-tail'); }
      S.foot = null; S.side = ''; S.low = 0; S.riseK = 1;
      for (const p of ['--ccr-over', '--ccr-horizon', '--ccr-wall-c', '--ccr-floor-c', '--ccr-tail', '--ccr-x', '--ccr-foot']) root.style.removeProperty(p);
      delete root.dataset.ccrCut; delete root.dataset.ccrFloor;
      world.style.transform = ''; carrier.style.transform = ''; words.style.transform = '';
      if (window.gsap) gsap.set([...arrive, words], { clearProps: 'opacity,transform' });
    };

    const build = (tl, ctx) => {
      S.live = true;
      S.phone = ctx.phone;
      S.tl = tl;
      S.side = '';
      S.foot = footEl();
      if (S.foot) S.foot.setAttribute('data-ccr-foot', '');
      measure();
      const state = { t: 0 };
      tl.fromTo(state, { t: 0 }, { t: 1, duration: 1, ease: 'none', onUpdate: () => render(state.t) }, 0);
      S.state = state;
      // the words: whole phrases, one by one, each whole at its point; then the action
      const span = 0.035, phrases = arrive.filter((el) => el !== action), n = phrases.length;
      // the band is solid on the cut frame: before the cut that strip was the flat room's own floor, so it
      // does not change at the cut (a fade here showed the table's legs through it for a beat); the CSS
      // keeps it hidden before the cut, and the first phrase follows at `from`
      tl.set(words, { opacity: 1 }, o.cut);
      arrive.forEach((el) => {
        const i = el === action ? n - 1 : phrases.indexOf(el);
        const end = n > 1 ? o.from + ((o.to - o.from) * i) / (n - 1) : o.to;
        tl.fromTo(el, { opacity: 0, y: '0.32em' }, { opacity: 1, y: 0, duration: span, ease: 'power2.out', immediateRender: true }, Math.max(o.cut + 0.005, end - span));
      });
      render(0);
      if (window.gsap && gsap.context) gsap.context(() => () => unhook());
    };

    // a keyboard user who reaches the action lands on the end of the hold, with the line whole
    root.addEventListener('focusin', () => {
      if (!S.live || !S.tl || S.t >= 0.985) return;
      const st = S.tl.scrollTrigger; if (!st) return;
      const y = Math.ceil(st.end);
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    if (window.ScrollTrigger && !root.__ccrWired) {
      root.__ccrWired = true;
      ScrollTrigger.addEventListener('refreshInit', measure);
      // a refresh renders the timeline with its callbacks muted: bring the frame up to date
      ScrollTrigger.addEventListener('refresh', () => { if (S.live && S.state) { S.side = ''; render(S.state.t); } });
      // a new file for the picture (the portrait source on a turned phone) moves the floor line
      img.addEventListener('load', () => { if (S.live) ScrollTrigger.refresh(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (S.live) ScrollTrigger.refresh(); }).catch(() => {});
    }

    return Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : 'same',
      rest: () => unhook(),
    });
  };
})();
