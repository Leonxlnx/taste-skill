/*
  powers-of-ten-pullback - the camera pulls back from the product's screen. The stage opens on the
  product's own interface filling the whole screen; as the visitor scrolls the camera pulls back at
  a steady rate (the scale eased in log space, so it never seems to stop) until the interface is the
  screen of a device standing on the page's lit ground, then the device settles into its place at
  the right and the chapter's heading, copy and action arrive at the left: the hero composition.

  <section class="sc" data-big-scene="powers-of-ten-pullback" data-big-scene-opts='{"hold":1}' style="--h: 1" aria-labelledby="pb-h">
    <div class="sc__stage">
      <div class="pb__ground" aria-hidden="true"></div>          the lit ground behind the device (data-fx is fine: it holds still)
      <div class="pb__copy"><p class="t-label">…</p><h2 id="pb-h">…</h2><p>…</p><div class="btn-row">…</div></div>
      <div class="pb__device"><div class="pb__screen">…an <img> of the product, or a [data-ui] fragment, 16:10…</div></div>
    </div>
  </section>
  A product section, not the hero: its first screen is the product's interface alone, with no heading and no
  action, so the page's hero stays above it. Phones show the finished composition (the copy over the device,
  a 4:5 crop of the screen); so does reduced motion.
*/
import { scene, seg, ease, lerp } from '../lib.js';

export default function mount(root, opts = {}) {
  const device = root.querySelector('.pb__device'), screen = root.querySelector('.pb__screen'), copy = root.querySelector('.pb__copy'), ground = root.querySelector('.pb__ground');
  if (!device || !screen) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  let geo = null;
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    measure(ctx) {
      device.style.transform = '';
      // in the stage's own coordinates: the stage may sit below the fold when this runs
      const st = ctx.stage.getBoundingClientRect();
      const db = device.getBoundingClientRect(), sb = screen.getBoundingClientRect();
      const S0 = Math.max(ctx.vw / sb.width, ctx.vh / sb.height) * 1.03;
      // the screen's centre must sit on the stage's centre at S0: offset from the device's centre
      const cx = ctx.vw / 2, cy = ctx.vh / 2;
      const dcx = db.left - st.left + db.width / 2, dcy = db.top - st.top + db.height / 2;
      const scx = sb.left - st.left + sb.width / 2, scy = sb.top - st.top + sb.height / 2;
      geo = { S0, dx0: cx - dcx - (scx - dcx) * S0, dy0: cy - dcy - (scy - dcy) * S0, dxm: cx - dcx, dym: cy - dcy };
    },
    update(p) {
      if (!geo) return;
      const e = seg(p, 0, 0.9, ease.inOut);
      const s = Math.exp(lerp(Math.log(geo.S0), 0, e));
      // the translation: keep the screen centred while large, then slide to the slot
      const m = seg(p, 0.5, 0.92, ease.inOut);
      const k = (Math.log(s) / Math.log(geo.S0));          // 1 at the start, 0 at scale 1
      const tx = lerp(0, (geo.dx0 - geo.dxm) * k + geo.dxm, 1 - m), ty = lerp(0, (geo.dy0 - geo.dym) * k + geo.dym, 1 - m);
      device.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
      if (copy) { const kc = seg(p, 0.66, 0.96, ease.out); copy.style.opacity = kc.toFixed(3); copy.style.transform = `translate3d(0, ${((1 - kc) * 20).toFixed(1)}px, 0)`; copy.style.visibility = kc <= 0 ? 'hidden' : ''; }
      if (ground) ground.style.opacity = seg(p, 0.2, 0.6, ease.inOut).toFixed(3);
    },
    rest() { device.style.cssText = ''; if (copy) copy.style.cssText = ''; if (ground) ground.style.cssText = ''; },
  });
  return { destroy() { ctrl && ctrl.destroy(); } };
}
