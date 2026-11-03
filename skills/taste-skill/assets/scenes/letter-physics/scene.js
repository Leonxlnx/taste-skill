/*
  letter-physics - a claim bursts apart in 3D; the answer lands out of the dark.
  A bold claim stands readable on the inverse ground, breathes in, then flies apart: every letter
  leaves along its own line from the claim's centre with spin and a little gravity, the middle
  letters rushing nearest the viewer, each gone before the screen's edge cuts it. The burst is short:
  while the last letters leave, the one-sentence answer is already coming out of depth, whole, and
  lands at the claim's size on the page's own ground; a photograph behind it comes up like a room's
  lights, dimmed to the ground under the words.

  <section class="sc ground-inverse" data-big-scene="letter-physics" aria-labelledby="lp-h">
    <div class="sc__stage">
      <div class="lp__bg" aria-hidden="true"><img src="…" alt="" width height></div>     optional: a dark photograph; it shows at the edges only, never under the words
      <p class="lp__label">How we work</p>                                              optional, top left
      <h2 class="lp__a" id="lp-h">Darkness is a material.</h2>                          12-36 characters
      <p class="lp__b">One sentence that answers it, 16-60 characters.</p>
    </div>
  </section>
  Phones run the light version: the letters fade and drift instead of flying in depth.
*/
import { scene, seg, ease, split, unsplit } from '../lib.js';

const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

export default function mount(root, opts = {}) {
  const a = root.querySelector('.lp__a'), b = root.querySelector('.lp__b'), bg = root.querySelector('.lp__bg');
  if (!a || !b) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  let chars = [], vec = [];
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: { hold: 1 },
    enter() { chars = split(a, { chars: true }); },   // on every move to live: rest() puts the plain text back
    measure(ctx) {
      a.style.transform = ''; a.style.fontSize = '';
      chars.forEach(c => { c.style.transform = ''; });
      const box = a.getBoundingClientRect();
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const R = Math.max(ctx.vw, ctx.vh);
      vec = chars.map((c, i) => {
        const r = c.getBoundingClientRect();
        let dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
        const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
        const centre = 1 - Math.min(1, len / (box.width * 0.5));
        return {
          x: dx * R * (0.42 + 0.3 * rnd(i, 1)), y: dy * R * (0.34 + 0.3 * rnd(i, 2)) + R * 0.16,   // short of the edges: the letters leave by rushing past the camera, not by crossing the frame
          z: 320 + 760 * centre * (0.6 + rnd(i, 3)), rz: (rnd(i, 4) - 0.5) * 160, rx: (rnd(i, 5) - 0.5) * 120, ry: (rnd(i, 6) - 0.5) * 90,
          d: rnd(i, 7) * 0.06,
        };
      });
    },
    update(p, ctx) {
      const breathe = 1 + 0.025 * seg(p, 0, 0.1, ease.inOut);
      a.style.transform = `scale(${breathe.toFixed(4)})`;
      chars.forEach((c, i) => {
        const v = vec[i]; if (!v) return;
        // a short burst: the letters are gone by 0.37; on a phone (the light version) they drift up and are gone by 0.21, before the answer comes
        const k = ctx.phone ? seg(p, 0.04 + v.d * 0.5, 0.18 + v.d * 0.5, ease.inOut) : seg(p, 0.1 + v.d, 0.34 + v.d * 0.5, ease.in2);
        const g = k * k;
        const o = ctx.phone ? 1 - seg(k, 0.1, 0.8, ease.out) : 1 - seg(k, 0.4, 0.85, ease.inOut);
        if (ctx.phone) c.style.transform = k ? `translate3d(0, ${(-60 * k).toFixed(1)}px, 0)` : '';     // the light version: a drift, no depth
        else c.style.transform = k ? `translate3d(${(v.x * k).toFixed(1)}px, ${(v.y * k * 0.6 + v.y * 0.4 * g).toFixed(1)}px, ${(v.z * k).toFixed(1)}px) rotateZ(${(v.rz * k).toFixed(1)}deg) rotateX(${(v.rx * k).toFixed(1)}deg) rotateY(${(v.ry * k).toFixed(1)}deg)` : '';
        c.style.opacity = o.toFixed(3);
      });
      const kb = ctx.phone ? seg(p, 0.22, 0.5, ease.out) : seg(p, 0.24, 0.6, ease.out);
      const z = ctx.phone ? 0 : -900 * (1 - kb);
      b.style.transform = `translate3d(0, ${ctx.phone ? ((1 - kb) * 30).toFixed(1) : 0}px, ${z.toFixed(1)}px) scale(${(0.6 + 0.4 * kb).toFixed(4)})`;
      b.style.opacity = (ctx.phone ? seg(p, 0.22, 0.4, ease.out) : seg(p, 0.27, 0.5, ease.out)).toFixed(3);
      b.style.visibility = p < (ctx.phone ? 0.21 : 0.26) ? 'hidden' : '';
      if (bg) bg.style.opacity = seg(p, 0.4, 0.8, ease.inOut).toFixed(3);
      root.style.setProperty('--lp-k', seg(p, 0.1, 0.6).toFixed(3));
    },
    rest() {
      unsplit(a); chars = [];
      a.style.cssText = ''; b.style.cssText = ''; if (bg) bg.style.cssText = '';
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); } };
}
