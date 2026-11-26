// assets/scenes/closing-object-turns/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / closing-object-turns.js — "Closing object turns over".
//
// A closing scene. In the last screen the one object the page is about (a card, a book, a ticket, a box
// lid, a label: a cut-out photograph, never a drawing) rises from below with a slight drift to one side,
// tips back, is lifted a little towards the viewer and turns over about its horizontal axis, from -180
// to 0 degrees, over the last 0.7 screen of scroll (the turn itself over 0.55 of it, then a settle), in
// CSS 3D. As it turns the ground changes in one flat step (the page's ground to the closing ground: one
// hard-edged field, no fade, no gradient), so the object lands showing its other face on a new ground. That face is plain, set in the page's own
// type: the closing line, one sentence, the one action as a real link (keyboard reachable) and a small
// line naming the object. The page ends on the object showing its other side.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and closing-object-turns.css.
//
// ── DOM ───────────────────────────────────────────────────────────────────────────────────────────
// <section class="scene" id="close" data-scene="closing-object-turns" data-options='{}'
//          aria-labelledby="cot-title">
//   <div class="scene-stage">
//     <div class="cot">
//       <div class="cot-rise">
//         <div class="cot-object">
//           <figure class="cot-face cot-face--picture">           the front: the photograph
//             <img class="cot-photo" src srcset sizes width height alt loading="eager">
//                 the object cut out to its own edges (no background left in the crop), straight on,
//                 its width and height attributes set: they give the object its shape (--cot-ratio).
//                 Best between 0.72 and 0.9 wide to 1 tall: tall enough to fill a phone at full
//                 width, wide enough to hold a desktop screen at about 92% of its height
//           </figure>
//           <div class="cot-face cot-face--words">                  the other face, in the page's type
//             <h2 class="cot-title" id="cot-title">The closing line, 3-5 words</h2>   set at display
//                                       size across the face, two lines (its longest line 12 letters)
//             <a class="cot-action" href="…">The one action, 2-4 words</a>          right under it
//             <p class="cot-text">One sentence, 10-20 words.</p>     optional, low on the face
//             <p class="cot-note">What the front shows, 4-10 words</p>     optional, on its bottom edge
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>
// <footer>…the page's designed footer, a section of its own: it follows the finished frame, on the
//    closing ground…</footer>
// The script adds a flat shade on each face (.cot-shade).
//
// ── Options (data-options JSON; a value that is not a number or not known falls back) ──────────────
//   hold      1     (0.6-1)     screens the stage is held for: a closing scene holds about one
//   from      0.3   (0.15-0.4)  where the turn starts: the rise, the drift and the lean are home by then
//   to        0.85  (0.7-0.95)  where the turn ends; it stands edge-on half-way between, and the rest of
//                               the hold is the settle
//   ground    'rise' | 'cut'    the step to the closing ground: 'rise', one flat field with a hard top
//                               edge comes up over the turn, the edge crossing the object's axis as it
//                               stands edge-on (measured on each screen, so it holds where the object
//                               lifts or sits above a footer line); 'cut', the whole ground steps at once
//                               at edge-on
//   lean      4     (0-20)      degrees it is tipped back as the hold starts (resolved by `from`); kept
//                               small, so the first frame of the hold is the front square and readable
//   drift     4     (0-16)      vw it starts off to one side (slight); it drifts home by `from`
//   side      'left' | 'right'  the side it comes from (left)
//   tilt      0     (0-6)       degrees it is turned in its own plane as it arrives (0: it arrives square,
//                               never crooked)
//   rise      45    (0-70)      svh it rises from below while the scene scrolls into view
//   lift      0.28  (0-0.3)     how much nearer it comes at the turn (desktop): 0.28 = 28% larger, so
//                               the edge-on beat shows a large object, not a sliver on a flat ground
//   phoneLift 0     (0-0.06)    the same on a phone, where the object fills the width
//   size      0.92  (0.7-0.96)  share of the stage height the object fills on a wide screen
//   shade     0.3   (0-0.45)    how dark a face gets edge-on (a flat shade, no light moves)
//   foot      unset (the default): the scene ends at its own bottom and the page's designed footer follows
//             it. A selector pulls that element up over the stage's foot, so the last pixel of scroll is
//             the landed object; it sits beside the object where there is room, and the object moves up to
//             clear it where there is not (phones, tablets). Only for a page that ends on the scene with one
//             plain line, which a page dealt a footer never does.
//   scrub     true (locked to the scrollbar) | seconds 0.1-1
//   phone     'same' (default) | 'rest'
//
// ── Timing ───────────────────────────────────────────────────────────────────────────────────────
// Arrival (the screen before the hold, native scroll): the object rises `rise` svh faster than the page
// and drifts a little, so it comes up from the bottom of the screen with the section.
// The hold, 0 → 1 (every tenth of it shows a new picture):
//   0 → 0.3     the last of the rise and the drift, the tilt and the lean run home: the front lies flat
//               and whole, as large as the screen allows
//   0.3 → 0.85  the turn, near-even: at 0.4 it is clearly tipped (about 30°), it stands edge-on at
//               0.575, and at 0.7 the other face is half up; it comes nearer and a little up as it
//               turns, and the closing ground rises behind it, its hard top edge crossing the object's
//               axis at edge-on
//   0.85 → 1    the settle: the last degrees, the lift and the rise come to rest as the scroll runs out
// Nothing runs on a clock: a visitor who stops halfway sees a still frame. A keyboard user who tabs
// to the action lands on the end of the hold, with the face up.
// Every pose is fitted to the screen before the hold is built (and again on every refresh): the tilt,
// the drift, the rise and the lift are each cut to the largest share that keeps all four corners of the
// object on screen at every point of the hold, so nothing of it is ever sliced by an edge, even when it
// comes nearest mid-turn. Scenes['closing-object-turns'] leaves the fitted numbers on root.__cot.fit.
//
// Phone (below 768px): the same turn, the object at the full width less the margins, centred above the
// footer line; the drift becomes a short rise from lower on the screen (the width has no room for it, and
// the rise stays under 8% of the screen so the first frame is not a third empty), there is no lift
// towards the viewer or upwards and the view is deeper, so the near edge never grows past the screen's
// sides and edge-on stays mid-screen; the action is 48px tall or more. Reduced motion, no script and a failed CDN: the finished composition, an ordinary
// section on the closing ground with the photograph and the plain face side by side (stacked on a
// phone), nothing hidden.
(() => {
  const ID = 'closing-object-turns';
  if (!window.Stage) { console.warn(ID + ': load stage.js before this file'); return; }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && Number.isFinite(n) ? clamp(n, a, b) : d; };
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const RAD = Math.PI / 180;

  // A smooth curve through keyframes [[t, v], …] (monotone cubic, Fritsch-Carlson): no overshoot, so
  // a turn never runs back on itself and a lift never dips below its rest.
  const curve = (pts) => {
    const n = pts.length, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i] || 1e-6));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) { m[i] = 0; continue; }
      const h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i];
      m[i] = (3 * (h0 + h1)) / ((2 * h1 + h0) / d[i - 1] + (h1 + 2 * h0) / d[i]);
    }
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return (t) => {
      if (t <= xs[0]) return ys[0];
      if (t >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (i < n - 2 && t > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const rise = root.querySelector('.cot-rise'), obj = root.querySelector('.cot-object');
    const picture = root.querySelector('.cot-face--picture'), words = root.querySelector('.cot-face--words');
    const photo = picture && picture.querySelector('img');
    if (!stage || !rise || !obj || !picture || !words) {
      console.warn(`${ID}: needs .scene-stage > .cot > .cot-rise > .cot-object holding .cot-face--picture and .cot-face--words`);
      return Stage.scene(root, { build: null });
    }
    const o = {
      hold: num(opts.hold, 1, 0.6, 1),
      from: num(opts.from, 0.3, 0.15, 0.4),
      to: num(opts.to, 0.85, 0.7, 0.95),
      ground: opts.ground === 'cut' ? 'cut' : 'rise',
      lean: num(opts.lean, 4, 0, 20),
      drift: num(opts.drift, 4, 0, 16),
      side: opts.side === 'right' ? 1 : -1,
      tilt: num(opts.tilt, 0, 0, 6),
      rise: num(opts.rise, 45, 0, 70),
      lift: num(opts.lift, 0.28, 0, 0.3),
      phoneLift: num(opts.phoneLift, 0, 0, 0.06),
      size: num(opts.size, 0.92, 0.7, 0.96),
      shade: num(opts.shade, 0.3, 0, 0.45),
      foot: typeof opts.foot === 'string' ? opts.foot.trim() : '',
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const sv = num(opts.scrub, NaN, 0.1, 1);
    const scrub = Number.isFinite(sv) && opts.scrub !== true ? sv : true;

    // the object's shape comes from the photograph's own width and height
    const w0 = photo ? +photo.getAttribute('width') || photo.naturalWidth : 0, h0 = photo ? +photo.getAttribute('height') || photo.naturalHeight : 0;
    if (w0 && h0) root.style.setProperty('--cot-ratio', `${w0} / ${h0}`);
    root.style.setProperty('--cot-size', String(o.size));
    if (photo && photo.decode) photo.decode().catch(() => {});   // decoded before it moves

    // the closing ground and the two flat shades: print, never read
    const make = (cls, parent, first) => { let el = parent.querySelector(':scope > .' + cls); if (!el) { el = document.createElement('div'); el.className = cls; el.setAttribute('aria-hidden', 'true'); first ? parent.prepend(el) : parent.append(el); } return el; };
    const ground = make('cot-ground', stage, true);
    const shades = [make('cot-shade', picture), make('cot-shade', words)];
    const printed = [...words.children].filter((el) => !el.classList.contains('cot-shade'));

    const S = { live: false, phone: false, tl: null, t: 0, face: '', e: -1, foot: null, P: 1600, H: 0, curves: null };
    root.__cot = S;   // state, for inspection in devtools
    const footEl = () => { if (!o.foot) return null; try { return document.querySelector(o.foot); } catch { return null; } };

    // Keyframes of the hold, as fractions of it. d is the drift, y the rise and u the lift upwards, in px
    // (each fitted to the room the stage leaves round the object); L the lift towards the viewer.
    //   0 → from      rise, drift, tilt and lean run home: the front lies flat and whole
    //   from → to     the turn, -180 → 0, near-even, edge-on at the middle (no tenth of the scroll is
    //                 spent standing still, and none stops on a sliver)
    //   to → 1        the settle: the last of the turn, the lift and the rise come to rest
    const plan = ({ d = 0, y = 0, u = 0, L = 0, tilt = 0 }) => {
      const a = o.from, b = o.to, T = b - a, m = a + T / 2, z = (b + 1) / 2;
      return {
        rx: curve([[0, -180 - o.lean], [a * 0.5, -180 - o.lean * 0.3], [a, -180], [a + 0.11 * T, -170], [a + 0.27 * T, -138], [m, -90], [b - 0.27 * T, -42], [b - 0.11 * T, -12], [b, -2], [1, 0]]),
        x: curve([[0, d], [a / 3, d * 0.62], [(2 * a) / 3, d * 0.28], [a, 0], [1, 0]]),
        y: curve([[0, y], [a / 3, y * 0.55], [(2 * a) / 3, y * 0.2], [a, 0], [m, -u], [b, -0.55 * u], [z, -0.22 * u], [1, 0]]),
        rz: curve([[0, tilt], [a, 0], [1, 0]]),
        s: curve([[0, 1], [a, 1], [m, 1 + L], [b, 1 + 0.5 * L], [z, 1 + 0.18 * L], [1, 1]]),
      };
    };
    // the pose at t as a transform: the object turns about its horizontal axis (rotateX), is turned in its
    // plane (rotate), moved (x, y) and lifted (z, so that P / (P - z) = s)
    const pose = (k, P, t) => {
      const s = k.s(t);
      return { x: k.x(t), y: k.y(t), rotation: k.rz(t), rotationX: k.rx(t), z: P * (1 - 1 / Math.max(1, s)) };
    };
    // How far the posed object's corners reach past the room (px, 0 when inside). The object's box is
    // centred in .cot; perspective P looks at its centre. room = { W, H, cx, cy, ow, oh, m }.
    const overflow = (k, P, room, t0, t1) => {
      let worst = 0;
      for (let t = t0; t <= t1 + 1e-9; t += 0.01) {
        const q = pose(k, P, t), a = q.rotationX * RAD, r = q.rotation * RAD;
        for (const [px, py] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const x0 = (px * room.ow) / 2, y0 = (py * room.oh) / 2;
          const y1 = y0 * Math.cos(a), z1 = y0 * Math.sin(a);                       // rotateX
          const x2 = x0 * Math.cos(r) - y1 * Math.sin(r), y2 = x0 * Math.sin(r) + y1 * Math.cos(r);   // rotate
          const X = x2 + q.x, Y = y2 + q.y, Z = z1 + q.z, f = P / Math.max(1, P - Z);
          const sx = room.cx + X * f, sy = room.cy + Y * f;
          worst = Math.max(worst, room.m - sx, sx - (room.W - room.m), room.m - sy, sy - (room.H - room.m));
        }
      }
      return worst;
    };
    // the tilt, the drift, the rise, the lifts and the depth that keep every pose whole on screen: nothing
    // of the object is ever cut by the edge of the screen, at any point of the hold
    const fit = (phone) => {
      const sr = stage.getBoundingClientRect(), cr = root.querySelector('.cot').getBoundingClientRect();
      const ow = obj.offsetWidth, oh = obj.offsetHeight;
      const room = { W: sr.width, H: sr.height, cx: cr.left - sr.left + cr.width / 2, cy: cr.top - sr.top + cr.height / 2, ow, oh, m: phone ? 6 : 10 };
      let P = Math.round(Math.max(1200, oh * (phone ? 4.6 : 2.3)));
      const want = {
        tilt: o.side * o.tilt,
        // (none on a phone: the object fills the width, and a drift there only pushes it off-centre)
        d: phone ? 0 : (o.side * o.drift * sr.width) / 100,
        // the rise inside the hold: the room under the object, at most 16% of the screen (8% on a phone,
        // where a larger one leaves the top third of the first frame empty)
        y: Math.max(0, Math.min((phone ? 0.08 : 0.16) * room.H, room.H - (room.cy + oh / 2) - room.m - 4)),
        // the lift upwards as it turns: the room over the object, at most 12% of the screen; none on a
        // phone, whose object already sits above the footer line, so edge-on stays mid-screen with the
        // closing ground's edge across it
        u: phone ? 0 : Math.max(0, Math.min(0.12 * room.H, room.cy - oh / 2 - room.m)),
        L: phone ? o.phoneLift : o.lift,
      };
      const got = { tilt: 0, d: 0, y: 0, u: 0, L: 0 };
      const k = () => plan(got);
      // the flat turn alone must fit; a deeper view if it does not
      for (let i = 0; i < 6 && overflow(k(), P, room, 0, 1) > 0; i++) P = Math.round(P * 1.25);
      // then each move in turn at the largest share of what was asked that still fits: the tilt, the
      // drift and the rise over the arrival, the two lifts over the turn and the settle
      const arrive = Math.min(1, o.from + 0.12);
      for (const [key, t0, t1] of [['tilt', 0, arrive], ['d', 0, arrive], ['y', 0, arrive], ['u', o.from, 1], ['L', o.from, 1]]) {
        got[key] = want[key];
        if (!want[key] || overflow(k(), P, room, t0, t1) <= 0) continue;
        let lo = 0, hi = 1;
        for (let i = 0; i < 12; i++) { const mid = (lo + hi) / 2; got[key] = want[key] * mid; if (overflow(k(), P, room, t0, t1) > 0) hi = mid; else lo = mid; }
        got[key] = want[key] * lo;
      }
      return { P, k: k(), ...got };
    };

    // How much of the stage the closing ground holds at t (0-1). 'rise': one flat field with a hard,
    // straight top edge comes up from the foot of the stage over the turn, its edge crossing the object's
    // turning axis as the object stands edge-on, and covers the stage as the face lands; 'cut': the whole
    // ground steps at once at edge-on. Never a fade, never a gradient.
    // The edge reaches the object's axis exactly at edge-on: S.axisE is the share of the stage under the
    // axis there (measured, since the axis sits above the middle where the object lifts or clears a footer
    // line), so the field runs evenly from the foot to the axis over the first half of the turn and on
    // to the top over the second.
    const groundAt = (t, face) => {
      if (o.ground === 'cut') return face === 'words' ? 1 : 0;
      const m = (o.from + o.to) / 2, e = S.axisE || 0.5;
      return t <= m ? clamp(((t - o.from) / (m - o.from)) * e, 0, e) : clamp(e + ((t - m) / (o.to - m)) * (1 - e), e, 1);
    };

    // where the hold is: the object's pose, which face is up, the shades and the ground
    const render = (t) => {
      if (!S.live || !S.curves) return;
      S.t = t;
      const q = pose(S.curves, S.P, t), rx = q.rotationX;
      gsap.set(obj, { x: r3(q.x), y: r3(q.y), rotation: r3(q.rotation), rotationX: r3(rx), z: r3(q.z), force3D: true });
      const cos = Math.cos(rx * RAD), sh = r3(Math.abs(Math.sin(rx * RAD)) * o.shade);
      for (const el of shades) if (el.__o !== sh) { el.__o = sh; el.style.opacity = String(sh); }
      const face = cos >= 0 ? 'words' : 'picture';
      if (face !== S.face) {
        S.face = face;
        root.dataset.cotFace = face;
        // the face turned away is taken out of the reading (its words stay in the page, and the action
        // still takes focus)
        for (const el of printed) el.style.opacity = face === 'words' ? '' : '0';
        picture.style.visibility = face === 'picture' ? '' : 'hidden';
      }
      const e = r3(groundAt(t, face));
      if (e !== S.e) {
        S.e = e;
        ground.style.transform = `translate3d(0, ${r3((1 - e) * 100)}%, 0)`;
        // once it covers the stage, the stage's own ground takes the colour
        root.dataset.cotGround = e >= 0.999 ? 'closing' : 'page';
      }
    };

    // the stage's measures: the depth of the 3D view, and whether the footer line has room beside the
    // object or the object must clear it (both decide positions, so they run before ScrollTrigger measures)
    const measure = () => {
      if (!S.live) return;
      const foot = S.foot;
      let tail = 0, reserve = 0;
      if (foot) {
        tail = Math.round(foot.offsetHeight);
        foot.style.setProperty('--cot-tail', tail + 'px');
        // its words lie on the closing ground: they carry it as their own ground too
        foot.style.setProperty('--cot-ground-b', getComputedStyle(root).getPropertyValue('--cot-ground-b').trim());
        root.style.setProperty('--cot-tail', tail + 'px');
        root.style.setProperty('--cot-reserve', '0px');
        // with no reserve: does any part of the footer line sit under the object's column?
        const sr = stage.getBoundingClientRect(), W = sr.width;
        const ow = obj.offsetWidth, left = (W - ow) / 2 - 20, right = (W + ow) / 2 + 20;
        const parts = [...foot.children].filter((el) => el.offsetWidth && el.offsetHeight);
        const fr = foot.getBoundingClientRect();
        for (const el of parts.length ? parts : [foot]) {
          const r = el.getBoundingClientRect(), l = r.left - fr.left, rr = r.right - fr.left;
          if (rr > left && l < right) { reserve = tail; break; }
        }
        root.style.setProperty('--cot-reserve', reserve + 'px');
      }
      S.H = obj.offsetHeight;
      // the drift, the rise, the lift and the depth of the view, fitted to this screen
      const f = fit(S.phone);
      S.P = f.P; S.curves = f.k; S.fit = { tilt: r3(f.tilt), d: Math.round(f.d), y: Math.round(f.y), u: Math.round(f.u), L: r3(f.L), P: f.P };
      rise.style.perspective = S.P + 'px';
      // where the object's axis stands on the stage at edge-on (its centre, moved and drawn nearer), as the
      // share of the stage under it: the closing ground's edge crosses it there
      const sr = stage.getBoundingClientRect(), cr = root.querySelector('.cot').getBoundingClientRect();
      const m = (o.from + o.to) / 2, q = pose(S.curves, S.P, m);
      const axisY = cr.top - sr.top + cr.height / 2 + q.y * (S.P / Math.max(1, S.P - q.z));
      S.axisE = sr.height ? clamp(1 - axisY / sr.height, 0.2, 0.8) : 0.5;
      S.fit.axis = r3(S.axisE);
    };

    const unhook = () => {
      S.live = false;
      if (S.foot) { S.foot.removeAttribute('data-cot-foot'); S.foot.style.removeProperty('--cot-tail'); S.foot.style.removeProperty('--cot-ground-b'); }
      S.foot = null;
      for (const p of ['--cot-tail', '--cot-reserve']) root.style.removeProperty(p);
      delete root.dataset.cotFace;
      delete root.dataset.cotGround;
      S.face = ''; S.e = -1;
      ground.style.transform = '';
      for (const el of printed) el.style.opacity = '';
      picture.style.visibility = '';
      rise.style.perspective = '';
      for (const el of shades) { el.style.opacity = ''; el.__o = undefined; }
      if (window.gsap) gsap.set([obj, rise], { clearProps: 'transform' });
    };

    const build = (tl, ctx) => {
      S.live = true;
      S.phone = ctx.phone;
      S.tl = tl;
      S.face = ''; S.e = -1;
      S.foot = footEl();
      if (S.foot) S.foot.setAttribute('data-cot-foot', '');
      measure();
      const state = { t: 0 };
      tl.fromTo(state, { t: 0 }, { t: 1, duration: 1, ease: 'none', onUpdate: () => render(state.t) }, 0);
      S.state = state;
      render(0);
      // arrival: the object rises faster than the page, with the start of its drift
      if (o.rise > 0 || o.drift > 0) {
        // (the arrival's drift is a third more of the drift that fitted this screen: none on a phone,
        // where the object already fills the width)
        gsap.fromTo(rise, { y: () => (o.rise * window.innerHeight) / 100, x: () => (S.fit ? S.fit.d : 0) / 3 }, {
          y: 0, x: 0, ease: 'power2.out', immediateRender: true,
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: scrub === true ? true : scrub, invalidateOnRefresh: true },
        });
      }
      // when the stage's context reverts (a media change, reduced motion switched on), take this scene's
      // own writes with it
      if (window.gsap && gsap.context) gsap.context(() => () => unhook());
    };

    // a keyboard user who reaches the action lands on the end of the hold, with the plain face up
    root.addEventListener('focusin', () => {
      if (!S.live || !S.tl || S.t >= 0.985) return;
      const st = S.tl.scrollTrigger; if (!st) return;
      const y = Math.ceil(st.end);
      if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
    });

    if (window.ScrollTrigger && !root.__cotWired) {
      root.__cotWired = true;
      ScrollTrigger.addEventListener('refreshInit', measure);
      // a refresh renders the timeline with its callbacks muted: bring the pose and the faces up to date
      ScrollTrigger.addEventListener('refresh', () => { if (S.live && S.state) { S.face = ''; S.e = -1; render(S.state.t); } });
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
