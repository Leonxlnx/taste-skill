/*
  fixed-hero-object - one product stays on its own layer and turns while the page's chapters pass
  beneath it. The object is a render from assets/objects (print-globe, print-cards, print-wheel …), or
  the client's own cut-out photograph. It opens as the hero (the title and the action in the clear
  half), then glides between lanes, right to left to right, as each chapter's copy rises in the half
  it has left, turning with the scroll; a chapter marked is-dark brings the inverse ground up behind
  it. Copy only ever sits in the half the object is not in.

  <section class="sc" data-big-scene="fixed-hero-object" data-big-scene-opts='{"object":"print-cards","effect":"render","turns":1}' style="--h: 2" aria-label="…">
    <div class="sc__stage">
      <div class="fho__object" data-move>
        <img class="fho__still" src="cards.png" alt="…" width height>     the object's still (assets/scenes/_demo/shoot.mjs make --html <path> --save <png> --profile <dir>): the finished composition, reduced motion, a phone
        <div class="fho__host"></div>                                      the render draws here while the scene is live and near
      </div>                                     or <div class="fho__object" data-move><img class="fho__img" src="cutout.png" alt="…"></div>
      <div class="fho__track">
        <article class="fho__panel fho__panel--hero"><div class="fho__copy"><h2>…</h2><p class="t-lead">…</p><div class="btn-row">…</div></div></article>
        <article class="fho__panel"><div class="fho__copy"><h3>…</h3><p>…</p><dl class="fho__specs"><div><dt>…</dt><dd>…</dd></div>…</dl></div></article>   1-4 chapters
        <article class="fho__panel is-dark"><div class="fho__copy">…</div></article>                                 optional: on the inverse ground
      </div>
    </div>
  </section>
  Options: object (an id under assets/objects), effect (render | dither | halftone | engrave | ascii), turns (turns of
  the object over the hold, default 1), params (more print params), hold (default 1: the section is two screens and the chapters pass in one screen of scroll, so two or three chapters read best).
  Phones show the finished composition (the copy first, then the still, then the chapters under it); so does reduced motion.
  Its rest composition is two screens (restH 2), so it is dealt below the page's own hero, never as the hero (meta.fits statement):
  the first panel's title is then an <h2>.
  The object's WebGL context is taken only while the section is near the screen and given back when it is far.
*/
import { scene, seg, ease, lerp } from '../lib.js';
import { attachPrint } from '../print.js';

export default function mount(root, opts = {}) {
  const panels = [...root.querySelectorAll('.fho__panel')];
  const n = panels.length;
  const objectEl = root.querySelector('.fho__object');
  const host = root.querySelector('.fho__host');
  if (!objectEl || n < 2) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const ground = document.createElement('div'); ground.className = 'fho__ground'; ground.setAttribute('aria-hidden', 'true');
  root.querySelector('.sc__stage').prepend(ground);
  const turns = opts.turns ?? 1;
  let obj = null, liveNow = false, nearNow = false;
  const lanes = panels.map((_, i) => (i % 2 ? -1 : 1));      // hero right, then left, right …
  const scales = panels.map((_, i) => (i === 0 ? 1 : i === n - 1 && n > 2 ? 0.74 : 0.86));
  if (opts.object && host) obj = attachPrint(host, { object: opts.object, effect: opts.effect, params: opts.params });
  const wake = () => { if (obj && liveNow && nearNow) obj.wake(); };
  const turnTo = (deg, force) => { if (obj) obj.turnTo(deg, force); };
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    enter() { liveNow = true; wake(); },
    near(_, isNear) { nearNow = isNear; if (isNear) wake(); else if (obj) obj.sleep(); },
    update(p, ctx) {
      const t = p * (n - 1);                      // panel time
      const i = Math.min(n - 2, Math.floor(t)), f = t - i;
      const u = seg(f, 0.2, 0.8, ease.inOut);     // the glide between lanes
      const lane = lerp(lanes[i], lanes[Math.min(n - 1, i + 1)], u);
      const sc = lerp(scales[i], scales[Math.min(n - 1, i + 1)], u);
      const x = lane * ctx.vw * 0.24;
      const y = (1 - sc) * ctx.vh * 0.05;
      objectEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
      turnTo(p * 360 * turns);
      let dark = 0;
      panels.forEach((panel, k) => {
        const d = t - k;                           // -: still to come, +: passed
        const vis = 1 - seg(Math.abs(d), 0.4, 0.5, ease.inOut);      // one chapter's copy at a time: a quick hand-over at the midpoint
        const copy = panel.firstElementChild;
        panel.style.visibility = vis <= 0.001 ? 'hidden' : '';
        copy.style.opacity = vis.toFixed(3);
        copy.style.transform = `translate3d(0, ${(-d * 70).toFixed(1)}px, 0)`;
        if (panel.classList.contains('is-dark')) dark = Math.max(dark, vis);
        panel.classList.toggle('is-current', k === Math.round(t));
      });
      ground.style.opacity = dark.toFixed(3);
      root.style.setProperty('--fho-dark', dark.toFixed(3));
    },
    rest() {
      liveNow = false;
      objectEl.style.transform = ''; ground.style.opacity = '0';
      panels.forEach(panel => { panel.style.visibility = ''; panel.firstElementChild.style.cssText = ''; panel.classList.remove('is-current'); });
      if (obj) obj.sleep();
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); if (obj) obj.destroy(); } };
}
