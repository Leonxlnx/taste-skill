// assets/scenes/speed-bent-row/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / speed-bent-row.js — a row of work bent by the visitor's pace (references/scenes.md).
//
// The stage holds for about two screens while the page scroll carries one row of six to eight pictures
// sideways along a shallow curved surface in CSS 3D: the picture passing the middle is nearest and
// largest, the ones towards the edges recede and turn with the surface. Nothing listens to the wheel:
// the row is placed from the page scroll alone, and only the speed of that travel bends it. The faster
// the row moves, the deeper the curve, the further the leading pictures lean back and the higher the
// far end lifts; once the scroll stops it eases back over about half a second to its gentle resting
// curve, so every frame
// at rest is a finished, readable row. The names, set large under each picture, sit on the same element
// and travel on the same curve, turned back to face the viewer so they stay flat and readable in every
// frame; a name shows only while its letters are whole on screen, so the screen edge cuts pictures but
// never a name. At 0% the first picture stands on the left margin and at 100% the last
// one stands on the right margin, so neither end ever shows an empty stretch. No drag, no fling, no loop,
// no floor and no reflection.
//
// Needs gsap + ScrollTrigger. Load after stage.js. No WebGL, no canvas, no SplitText.
//
// DOM (the finished composition, a flat row on wide screens and a stack on phones, is what shows
// without script and with reduced motion; the row is plain HTML links, so keyboard and screen-reader
// users get the whole body of work as a list):
//
//   <section class="scene bend" id="series" data-scene="speed-bent-row" aria-labelledby="bend-title"
//            data-options='{"hold": 2}'>
//     <div class="scene-stage">
//       <div class="bend-head">
//         <h2 class="bend-title" id="bend-title">Lofoten in autumn</h2>          2-5 words
//         <p class="bend-lede">Seven prints from the villages at the end of the islands.</p>
//       </div>
//       <ol class="bend-row">
//         <li class="bend-item">
//           <a class="bend-link" href="/prints/reine">
//             <figure class="bend-card">
//               <span class="bend-pic"><img src="…" width="1280" height="853" alt="…"
//                 style="object-position: 45% 50%"></span>         the picture drifts inside this frame
//               <figcaption class="bend-name">Reine harbour</figcaption>
//             </figure>
//           </a>
//         </li>
//         … six to eight li.bend-item …
//       </ol>
//     </div>
//   </section>
//
// Content: six to eight pictures of one body of work (one photographer's series, one architect's
// buildings, one maker's pieces), each once, in one grade and in full colour. They are cropped to 4:5 on
// the row (object-position per picture keeps the subject) and shown whole at 3:2 on the phone stack and
// in the first tablet cell of the finished composition, so landscape originals of 1280px or more work
// best. One name per picture, 1-2 words and 14 characters or fewer, naming what it shows: the names are
// set at 12% of the card width, and a longer one wraps to two lines and loses its weight on the far side.
// Fewer than six pictures make the row thin; under three the scene shows its finished composition only.
// A heading of 2-5 words and one line of 6-14 words.
//
// Options (data-options JSON; defaults in brackets):
//   hold        screens the stage is held for [2], 1.2-3. The travel is measured from the row, so a
//               longer hold only slows it
//   curve       the resting curve: how far the screen edge lies behind the middle, as a share of the
//               width [0.04], 0-0.08. 0 is a flat row; 0.04 is a gentle curve whose edge pictures turn
//               about 8 degrees and stand a little smaller: never side cards tilted round a flat middle
//   depth       how much deeper the curve gets at full speed, as a share of the width [0.1], 0-0.16. A card
//               the curve turns past about 26 degrees fades out by 34 and never turns further, so no card
//               is ever seen squashed edge-on; at full speed the ends of the row dissolve into the arc
//   pull        how far the row comes nearer at full speed, as a share of the width [0.06], 0-0.1
//   lean        degrees the leading pictures lean back at full speed [16], 0-22
//   lift        how far the far end lifts at full speed, as a share of the stage height (of 0.625 x the
//               width on a portrait screen) [0.08], 0-0.12, while the middle sags a little; the cards tilt
//               along that line (6 degrees at most) and their names tilt with them, still facing the viewer
//   speed       screen widths a second of row travel that bends it about three quarters of the way
//               [0.55], 0.25-2. Lower bends at a gentler pace; at 0.55 a slow scroll already flexes it
//   settle      seconds the bend takes to ease back flat once the scroll stops [0.5], 0.3-0.9
//   perspective px of CSS perspective [950], 700-2400. Lower makes the near pictures loom more
//   phone       'same' (the phone stack bows with speed) | 'rest' (the plain stack) ['same']
//   bow         degrees the phone stack bows at full speed [14], 0-20 (a flick of about a screen a second
//               bows it most of the way)
//   scrub       seconds of catch-up when Lenis is off [0.5]; with Lenis the scrub is locked (true)
//
// Phone (under 768px): no pin and no sideways travel. The pictures stand as a vertical stack in the
// page, each 3:2 picture whole with its name under it, and the stack bows with the speed of the page:
// pictures above and below the middle of the screen tilt away and recede, the one in the
// middle stays flat and near, and the bow eases back flat over about half a second once the scroll stops. Touch scrolling
// is never smoothed or captured.
//
// Reduced motion, no script, a failed CDN: the finished composition. The heading, then the seven
// pictures as one flat row on wide screens (on tablets one whole 3:2 picture across the width and then
// pairs, or all pairs for an even count; on phones a stack), each name whole under its picture.
//
// Keyboard: focusing a picture's link scrolls the page to the point where that picture stands in the
// middle of the row, so the focused card is always whole on screen.
(() => {
  const ID = 'speed-bent-row';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d, a, b) => { const n = Number(v); return v === undefined || v === null || v === '' || !Number.isFinite(n) ? d : clamp(n, a, b); };
  const DEG = 180 / Math.PI;

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const row = root.querySelector('.bend-row');
    const items = row ? [...row.querySelectorAll(':scope > .bend-item')] : [];
    const names = items.map((li) => li.querySelector('.bend-name'));
    const pics = items.map((li) => li.querySelector('.bend-pic img'));
    const N = items.length;
    if (!stage || N < 3) return Stage.scene(root, {}); // too few to travel: the finished composition

    const o = {
      hold: num(opts.hold, 2, 1.2, 3),
      curve: num(opts.curve, 0.04, 0, 0.08),
      depth: num(opts.depth, 0.1, 0, 0.16),
      pull: num(opts.pull, 0.06, 0, 0.1),
      lean: num(opts.lean, 16, 0, 22),
      lift: num(opts.lift, 0.08, 0, 0.12),
      speed: num(opts.speed, 0.55, 0.25, 2),
      settle: num(opts.settle, 0.5, 0.3, 0.9),
      perspective: num(opts.perspective, 950, 700, 2400),
      bow: num(opts.bow, 14, 0, 20),
      scrub: opts.scrub === true ? true : num(opts.scrub, 0.5, 0, 2),
    };
    const MAXTURN = 0.6; // radians (34 degrees): a card turned further has faded out
    const head = root.querySelector('.bend-head');
    const picBoxes = items.map((li) => li.querySelector('.bend-pic'));
    const clear = () => {
      for (const li of items) { li.style.transform = ''; li.style.opacity = ''; li.style.visibility = ''; }
      for (const n of names) if (n) { n.style.opacity = ''; n.style.transform = ''; }
      for (const p of pics) if (p) p.style.transform = '';
      for (const p of picBoxes) if (p) p.style.opacity = '';
      row.style.top = ''; row.style.perspective = '';
    };

    // whether the scene is near the screen: the ticker only works while it is
    let near = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => { near = es.some((e) => e.isIntersecting); }, { rootMargin: '25% 0px 25% 0px' }).observe(root);
    }
    // the bend, a signed amount in [-1, 1]. The travel per second is averaged over about 90ms (coarse scroll
    // events and a jump of the scrollbar read as their true pace, not as one-frame spikes) and mapped
    // through tanh against `ref`, so a slow scroll already flexes the row and a fast one saturates it. The
    // bend follows that target on a critically damped spring: it rises in about a fifth of a second and,
    // once the scroll stops, eases back flat over `settle` seconds with no overshoot.
    const follower = (settle) => {
      const f = { b: 0, bv: 0, v: 0, last: null };
      const wBack = 4.74 / settle, wRise = wBack * 2.2;
      f.reset = () => { f.b = 0; f.bv = 0; f.v = 0; f.last = null; };
      // a move of more than jump in one frame is a teleport (an anchor, the Home key, a script), not the
      // visitor's pace, and bends nothing
      f.step = (value, dt, ref, jump = Infinity) => {
        let raw = 0;
        if (f.last === null) f.v = 0;
        else if (dt > 0 && dt < 250 && Math.abs(value - f.last) <= jump) raw = (value - f.last) / (dt / 1000);
        f.last = value;
        const ms = Math.min(dt, 64);
        f.v += (raw - f.v) * (1 - Math.exp(-ms / 1000 / 0.09));
        const target = Math.tanh(f.v / ref);
        const rising = Math.abs(target) > Math.abs(f.b) && (f.b === 0 || Math.sign(target) === Math.sign(f.b));
        const w = rising ? wRise : wBack;
        for (let s = 0, n = Math.max(1, Math.ceil(ms / 4)); s < n; s++) {
          const h = ms / n / 1000;
          f.bv += (w * w * (target - f.b) - 2 * w * f.bv) * h;
          const nb = clamp(f.b + f.bv * h, -1, 1);
          // easing back never swings through flat into a bend the other way
          if (Math.abs(target) < 0.01 && f.b !== 0 && Math.sign(nb) !== Math.sign(f.b)) { f.b = 0; f.bv = 0; } else f.b = nb;
        }
        if (Math.abs(target) < 0.004 && Math.abs(f.b) < 0.008) { f.b = 0; f.bv = 0; }
        return f.b;
      };
      return f;
    };
    // ---- keyboard: a focused card is brought to the middle of the row ----
    let live = null;
    root.addEventListener('focusin', (e) => {
      const li = e.target.closest && e.target.closest('.bend-item');
      if (!li || !live || !root.classList.contains('is-live')) return;
      const i = items.indexOf(li);
      const t = live.tl.scrollTrigger;
      if (i < 0 || !t) return;
      const p = live.progressOf(i);
      const y = t.start + (t.end - t.start) * p;
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    // ---- the held row (desktop and tablet) ----
    const build = (tl) => {
      const st = { p: 0 };
      const M = { W: 0, H: 0, cw: 0, pitch: 0, a: 0, b: 0, nw: [], ny: [], ready: false };
      const speed = follower(o.settle);
      let drawn = '';

      const radius = (bend) => {
        const sag = M.W * (o.curve + o.depth * bend);
        return sag > 0.5 ? (M.W / 2) ** 2 / (2 * sag) : 1e7;
      };
      // the screen x of a card's left (-1) or right (+1) edge on the resting curve, its centre at arc u
      const edge = (u, side) => {
        const r = radius(0), th = u / r, P = o.perspective;
        const x = r * Math.sin(th) + side * (M.cw / 2) * Math.cos(th);
        const z = -r * (1 - Math.cos(th)) - side * (M.cw / 2) * Math.sin(th);
        return (x * P) / (P - z);
      };
      const solve = (side, want) => {
        // within a quarter turn of the middle, where the projected edge only ever grows with u
        const r = radius(0), lim = Math.min(4 * M.W, 1.2 * r);
        let lo = -lim, hi = lim;
        for (let k = 0; k < 48; k++) { const mid = (lo + hi) / 2; if (edge(mid, side) < want) lo = mid; else hi = mid; }
        return (lo + hi) / 2;
      };

      const measure = () => {
        clear();
        M.W = stage.clientWidth; M.H = stage.clientHeight;
        if (!M.W || !M.H) return;
        const gutter = parseFloat(getComputedStyle(root).getPropertyValue('--bend-gutter')) || 32;
        const top = head ? head.offsetTop + head.offsetHeight : 0;
        row.style.top = `${Math.round(top)}px`;
        row.style.perspective = `${o.perspective}px`;
        M.cw = items[0].offsetWidth;
        M.pitch = M.cw + clamp(M.cw * 0.11, 20, 48);
        // each name's own width (it starts at the card's left edge), so a name is judged by its letters
        const range = document.createRange();
        M.nw = names.map((n) => { if (!n) return 0; range.selectNodeContents(n); return Math.min(M.cw, range.getBoundingClientRect().width || M.cw); });
        // and where it hangs: its top edge below the card's centre (the card turns about its centre)
        M.ny = names.map((n, i) => (n ? n.offsetTop - items[i].offsetHeight / 2 : 0));
        // the first card's left edge on the left margin at 0%, the last card's right edge on the right
        // margin at 100%; a row too short to travel stands centred
        const a = -solve(-1, -M.W / 2 + gutter);
        const b = (N - 1) * M.pitch - solve(1, M.W / 2 - gutter);
        if (b > a) { M.a = a; M.b = b; } else { M.a = M.b = ((N - 1) * M.pitch) / 2; }
        speed.reset();
        drawn = '';
        M.ready = true;
      };

      const render = () => {
        if (!M.ready) return;
        const off = M.a + (M.b - M.a) * st.p;
        const bend = speed.b;
        const key = off.toFixed(1) + '|' + bend.toFixed(3);
        if (key === drawn) return;
        drawn = key;
        const ab = Math.abs(bend), sg = bend < 0 ? -1 : 1;
        const P = o.perspective, half = M.W / 2;
        const r = radius(ab);
        // the whole row comes a little nearer while it bends, so the middle looms as the ends fall away
        const near0 = o.pull * M.W * ab;
        // the lift follows the shorter side, so a narrow screen never tips its far end steeply
        const liftPx = o.lift * Math.min(M.H, M.W * 0.625) * ab;
        // and the middle of the row sags a little under the speed, like a rope, so the row reads as one
        // flexed band from its leaning front to its lifted far end
        const dipPx = 0.035 * Math.min(M.H, M.W * 0.625) * ab;
        items.forEach((li, i) => {
          const u = i * M.pitch - off;
          const th = u / r;
          const ath = Math.abs(th);
          // a card turned past about 26 degrees (only in a bend, or beyond the screen edge) fades out by 34,
          // and it never turns further: no card is ever seen squashed edge-on
          const op = clamp((MAXTURN - ath) / 0.14, 0, 1);
          if (op <= 0) { if (li.style.visibility !== 'hidden') li.style.visibility = 'hidden'; return; }
          const x = r * Math.sin(th), z = -r * (1 - Math.cos(th)) + near0;
          const s = clamp(((x * P) / (P - z)) / half, -1.4, 1.4);
          // the leading half (the way the row is moving) leans back; the trailing far end lifts
          const lead = clamp(-s * sg, 0, 1), trail = clamp(s * sg, 0, 1.3);
          const sq = Math.min(1, s * s);
          const y = -liftPx * trail * trail + dipPx * (1 - sq);
          const slope = (-2 * liftPx * trail * sg - (sq < 1 ? 2 * dipPx * s : 0)) / half;
          const rz = clamp(Math.atan(slope) * DEG, -6, 6);
          const rx = o.lean * ab * lead * lead * (3 - 2 * lead);
          const ry = th * DEG;
          // the name hangs from the picture's lower left corner and is turned back to face the viewer, so
          // it stays flat and readable however the card turns or leans; it shows only while its letters are
          // whole on screen, so the screen edge cuts pictures but never a name
          // where the name's corner lands: the card's lean, tilt and turn applied to it, in that order
          const hw = M.cw / 2, a = rx / DEG, t = rz / DEG;
          let px = -hw, py = M.ny[i] || 0, pz = 0;
          [py, pz] = [py * Math.cos(a), py * Math.sin(a)];
          [px, py] = [px * Math.cos(t) - py * Math.sin(t), px * Math.sin(t) + py * Math.cos(t)];
          [px, pz] = [px * Math.cos(th) + pz * Math.sin(th), -px * Math.sin(th) + pz * Math.cos(th)];
          const k = P / (P - (z + pz));
          const L = (x + px) * k, Rt = L + (M.nw[i] || M.cw) * Math.cos(t) * k;
          // it fades over the last 12px before either screen edge and is gone before the edge touches it
          const no = Math.min(op, clamp(Math.min(L + half, half - Rt) / 12, 0, 1));
          if (names[i]) {
            const v = no < 1 ? no.toFixed(3) : '';
            if (names[i].style.opacity !== v) names[i].style.opacity = v;
            // undo the card's turn and lean but keep its tilt, so the name faces the viewer and still runs
            // along the curve with its picture
            names[i].style.transform = `rotateX(${(-rx).toFixed(3)}deg) rotateZ(${(-rz).toFixed(3)}deg) rotateY(${(-ry).toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg)`;
          }
          // the picture drifts inside its frame against the travel, so it reads as further away than the
          // card that carries it
          if (pics[i]) pics[i].style.transform = `translate3d(${(-2.9 * clamp(s, -1.25, 1.25)).toFixed(2)}%,0,0) scale(1.08)`;
          if (picBoxes[i]) { const v = op < 1 ? op.toFixed(3) : ''; if (picBoxes[i].style.opacity !== v) picBoxes[i].style.opacity = v; }
          li.style.visibility = '';
          li.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg)`;
        });
      };
      const tick = (time, dt) => {
        if (!M.ready) return;
        if (!near) { speed.last = null; return; }
        speed.step(M.a + (M.b - M.a) * st.p, dt, o.speed * M.W, 0.5 * M.W);
        render();
      };

      tl.fromTo(st, { p: 0 }, { p: 1, duration: 1, ease: 'none', immediateRender: false }, 0);
      tl.eventCallback('onUpdate', render);
      live = { tl, progressOf: (i) => (M.b > M.a ? clamp((i * M.pitch - M.a) / (M.b - M.a), 0, 1) : 0) };

      ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', onRefresh: () => { measure(); render(); } });
      gsap.ticker.add(tick);
      // this build runs inside the stage's matchMedia context: the nested context's cleanup runs when a
      // desktop/phone or motion flip reverts it, so the ticker never outlives its build
      gsap.context(() => () => { gsap.ticker.remove(tick); clear(); live = null; });

      for (const img of root.querySelectorAll('.bend-card img')) {
        if (img.loading === 'lazy') img.loading = 'eager';
        (img.complete ? Promise.resolve() : new Promise((res) => img.addEventListener('load', res, { once: true }))).then(() => img.decode && img.decode()).catch(() => {});
      }
      measure();
      render();
    };

    // ---- the phone: the finished stack, bowed by the speed of the page ----
    const rest = (ctx) => {
      clear();
      if (!ctx.phone || !Stage.live || Stage.reduced || o.bow <= 0 || opts.phone === 'rest') return;
      const speed = follower(o.settle);
      let H = 0, centres = [], flat = true;
      const measure = () => {
        for (const li of items) li.style.transform = '';
        H = window.innerHeight;
        centres = items.map((li) => { const r = li.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; });
        speed.last = null;
      };
      const tick = (time, dt) => {
        if (!near || !H) { speed.last = null; return; }
        const y = window.scrollY;
        // a normal flick of the thumb (about one screen a second) already bows the stack most of the way
        const b = Math.abs(speed.step(y, dt, 0.9 * H, 1.5 * H));
        if (b === 0) { if (!flat) { flat = true; for (const li of items) li.style.transform = ''; } return; }
        flat = false;
        items.forEach((li, i) => {
          const t = clamp((centres[i] - y - H / 2) / (H / 2), -1.6, 1.6);
          if (Math.abs(t) >= 1.6) { li.style.transform = ''; return; }
          const rx = -t * o.bow * b, z = -0.2 * H * b * t * t;
          li.style.transform = `perspective(760px) translate3d(0,0,${z.toFixed(2)}px) rotateX(${rx.toFixed(3)}deg)`;
        });
      };
      const onResize = () => measure();
      measure();
      window.addEventListener('resize', onResize);
      window.addEventListener('load', onResize, { once: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      gsap.ticker.add(tick);
      gsap.context(() => () => { gsap.ticker.remove(tick); window.removeEventListener('resize', onResize); clear(); });
    };

    return Stage.scene(root, {
      hold: o.hold,
      scrub: Stage.lenis ? true : o.scrub || true,
      build,
      phone: 'rest',
      rest,
    });
  };
})();
