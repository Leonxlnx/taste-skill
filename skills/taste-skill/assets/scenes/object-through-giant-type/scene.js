/*
  object-through-giant-type - one object falls through a wall of giant type. A short quote is set
  in huge capitals that fill the held stage. The object (a render from assets/objects, or the
  client's cut-out) falls down the wall: each line parts at its word gap and the halves open round
  it, wide enough that the object never covers a letter, then close behind it; each line turns from
  muted to full ink as the object reaches it. In the last line the object swells toward the camera,
  then tips and falls away into the page, and the whole quote stands closed, in ink, with its credit.

  <section class="sc" data-big-scene="object-through-giant-type" data-big-scene-opts='{"object":"print-globe","effect":"render"}' style="--h: 1" aria-label="…">
    <div class="sc__stage">
      <blockquote class="ott__quote">
        <p class="ott__line"><span class="ott__half">Eighty</span> <span class="ott__half">cities</span></p>   3-5 lines, 9-13 characters each,
        …                                                                                           the gap near the middle
      </blockquote>
      <div class="ott__object" data-move>
        <img class="ott__still" src="globe.png" alt="" width height>     the object's still (assets/scenes/_demo/shoot.mjs make --html <path> --save <png> --profile <dir>): the finished composition, reduced motion, a phone
        <div class="ott__host"></div>                                     the render draws here while the scene is live and near
      </div>                                                              or only <img class="ott__img" src="cutout.png" alt="…"> for a cut-out
      <p class="ott__credit">Noor Haddad, head of network</p>            optional, 5 words at most
    </div>
  </section>
  Phones show the finished composition (the still); so does reduced motion. The object's WebGL context
  is taken only while the section is near the screen and given back when it is far.
*/
import { scene, seg, ease, lerp } from '../lib.js';
import { attachPrint } from '../print.js';

export default function mount(root, opts = {}) {
  const quote = root.querySelector('.ott__quote'), lines = [...root.querySelectorAll('.ott__line')], objectEl = root.querySelector('.ott__object'), host = root.querySelector('.ott__host'), credit = root.querySelector('.ott__credit');
  if (!quote || !lines.length || !objectEl) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  let obj = null;
  if (opts.object && host) obj = attachPrint(host, { object: opts.object, effect: opts.effect, params: { shadow: 0, ...(opts.params || {}) } });
  const halves = lines.map(l => [...l.querySelectorAll('.ott__half')]);
  let geo = null, liveNow = false, nearNow = false;
  const wake = () => { if (obj && liveNow && nearNow) obj.wake(); };
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    enter() { liveNow = true; wake(); },
    near(_, isNear) { nearNow = isNear; if (isNear) wake(); else if (obj) obj.sleep(); },
    measure(ctx) {
      quote.style.transform = ''; objectEl.style.transform = '';
      halves.flat().forEach(h => { h.style.transform = ''; });
      // everything in the stage's own coordinates: the stage may sit below the fold when this runs
      const st = ctx.stage.getBoundingClientRect();
      const ob = objectEl.getBoundingClientRect();
      const O = ob.width, ox = ob.left - st.left + ob.width / 2;
      const gapK = parseFloat(getComputedStyle(root).getPropertyValue('--ott-gap')) || 0.6;
      geo = {
        O, vh: ctx.vh, gapK,
        lines: lines.map((l, j) => {
          const b = l.getBoundingClientRect();
          const h = halves[j];
          // the word gap's centre, relative to the object's centre: the halves part round the object, not round the line's middle
          let bx = 0;
          if (h.length === 2) { const a = h[0].getBoundingClientRect(), c = h[1].getBoundingClientRect(); bx = (a.right + c.left) / 2 - st.left - ox; }
          return { cy: b.top - st.top + b.height / 2, h: b.height * 0.72, bx };
        }),
      };
    },
    update(p) {
      if (!geo) return;
      const { O, vh } = geo;
      // the fall: from above the stage to below it, steady, with a swell in the last line
      const yf = seg(p, 0, 0.84, ease.linear);
      const y = lerp(-O * 1.1, vh + O * 0.2, yf);           // the object's centre, stage px
      const swell = seg(p, 0.6, 0.72, ease.inOut) * (1 - seg(p, 0.76, 0.9, ease.in2));
      const away = seg(p, 0.76, 0.92, ease.in2);
      const sc = 1 + 0.55 * swell - 0.3 * away;
      objectEl.style.transform = `translate3d(0, ${(y - vh / 2).toFixed(1)}px, 0) scale(${sc.toFixed(4)}) rotateX(${(away * 70).toFixed(1)}deg)`;
      objectEl.style.opacity = (1 - seg(p, 0.84, 0.93, ease.in2)).toFixed(3);
      if (obj) obj.turnTo(-30 + p * 160);
      // the wall climbs a little; each line parts round the object's silhouette (a circle of its scaled size plus a margin,
      // measured at the glyph band nearest the object) with a soft wake beyond it, and inks as the object passes
      quote.style.transform = `translate3d(0, ${((0.5 - p) * vh * 0.06).toFixed(1)}px, 0)`;
      const closeAll = 1 - seg(p, 0.84, 0.93, ease.inOut);
      const R = O * sc * 0.55, g0 = O * sc * geo.gapK;
      geo.lines.forEach((L, j) => {
        const dy = y - L.cy;
        const dEff = Math.max(0, Math.abs(dy) - L.h / 2);
        const circle = dEff < R ? g0 * Math.sqrt(1 - (dEff / R) * (dEff / R)) + O * 0.06 : 0;
        const wake = g0 * 0.5 * Math.exp(-(dy / (O * 0.8)) * (dy / (O * 0.8)) * 2.2);
        const last = j === lines.length - 1;
        const gap = Math.max(circle, wake) * (1 - away * (last ? 1 : 0)) * closeAll;
        const k = seg(dy / (O * 0.75), -0.5, 0.4, ease.inOut);
        lines[j].style.setProperty('--k', k.toFixed(3));
        const h = halves[j];
        if (h.length === 2) {
          // open a gap of 2 x gap centred on the object: the half whose edge is nearer moves further
          const left = -Math.max(0, gap + L.bx), right = Math.max(0, gap - L.bx);
          h[0].style.transform = `translate3d(${left.toFixed(1)}px, 0, 0)`; h[1].style.transform = `translate3d(${right.toFixed(1)}px, 0, 0)`;
        } else if (h.length === 1) h[0].style.transform = `translate3d(0, 0, 0)`;
      });
      if (credit) { const kc = seg(p, 0.9, 1, ease.out); credit.style.opacity = kc.toFixed(3); credit.style.transform = `translate3d(0, ${((1 - kc) * 10).toFixed(1)}px, 0)`; }
    },
    rest() {
      liveNow = false;
      quote.style.cssText = ''; objectEl.style.cssText = ''; if (credit) credit.style.cssText = '';
      lines.forEach(l => { l.style.cssText = ''; }); halves.flat().forEach(h => { h.style.cssText = ''; });
      if (obj) obj.sleep();
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); if (obj) obj.destroy(); } };
}
