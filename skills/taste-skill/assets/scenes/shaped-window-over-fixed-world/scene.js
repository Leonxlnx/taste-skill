/*
  shaped-window-over-fixed-world - two windows in a shutter widen, merge and push through into a place.
  One full-bleed photograph of the place stays still behind a shutter painted in the page's own ground.
  Two tall windows are cut into the shutter side by side, level, with a bar of ground between them, so
  the first frame is one picture seen through a mullion under the title. The scroll widens the windows
  outward (their inner edges and the bar stay put), closes the bar into one window, holds a beat, then
  scales the shutter past the screen's edges so the reader pushes through into the place; a flat band
  of the ground rises across the foot carrying the chapter's one word, then its lede and the action.
  The shutter is five flat pieces, never a mask with a hairline; no window edge ever crosses a word;
  no word ever sits straight on the photograph. No caption: the title above the windows and the action
  under them are the scene's first screen (it sits below the page's hero: restH 2).

  <section class="sc" data-big-scene="shaped-window-over-fixed-world" data-big-scene-opts='{"hold":1}' style="--h: 2" aria-labelledby="sw-h">
    <div class="sc__stage">
      <div class="sw__world"><img class="sw__media" src="…" alt="…" width height></div>
      <h2 class="sw__title" id="sw-h">The title, 3-7 words</h2>                         on the shutter, above the windows
      <div class="sw__cta btn-row">…one or two buttons…</div>                       on the shutter, under the windows: the scene's action from the first frame
      <div class="sw__lede">                                                            the band at the foot
        <p class="sw__word">Lysefjord</p>                                               one word, 6-12 letters: the chapter's name
        <p>18-32 words.</p><a class="btn btn--secondary" href="#">Action</a>          the action optional
      </div>
    </div>
  </section>
  Options: hold (whole screens, default 1: the section is then two screens; 2 makes three, which the page rhythm fails). Phones show the finished composition.
*/
import { scene, seg, ease, lerp } from '../lib.js';

export default function mount(root, opts = {}) {
  const stage = root.querySelector('.sc__stage');
  const world = root.querySelector('.sw__world'), title = root.querySelector('.sw__title'), cta = root.querySelector('.sw__cta'), word = root.querySelector('.sw__word'), lede = root.querySelector('.sw__lede');
  if (!stage || !world || !lede) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const rest = [...lede.children].filter(el => el !== word);     // the lede's text and action arrive after the word
  const shutter = document.createElement('div'); shutter.className = 'sw__shutter'; shutter.setAttribute('aria-hidden', 'true');
  const parts = {};
  for (const k of ['top', 'bottom', 'left', 'right', 'bar']) { const d = document.createElement('div'); d.className = 'sw__s sw__s--' + k; shutter.append(d); parts[k] = d; }
  let g = null;
  const put = (el, k, dy) => { if (!el) return; el.style.opacity = k.toFixed(3); el.style.visibility = k <= 0.001 ? 'hidden' : ''; el.style.transform = `translate3d(0, ${((1 - k) * dy).toFixed(1)}px, 0)`; };
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    enter() { world.after(shutter); },          // on every move to live: rest() takes the shutter out
    measure(ctx) {
      const W = ctx.vw, H = ctx.vh;
      const nav = parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 0;
      // the two windows at the start: level, side by side, a bar of ground between
      const y1 = Math.max(H * 0.3, nav + H * 0.2), y2 = H * 0.84;
      const bar = 28, ww = W * 0.24;
      const x1b = W / 2 - bar / 2, x2a = W / 2 + bar / 2;
      g = { W, H, y1, y2, x1b, x2a, ww, pad: Math.max(40, W * 0.06) };
      // the five pieces are sized once; the scroll only moves them by transform
      parts.top.style.cssText = `left:0;top:0;width:${W}px;height:${y1.toFixed(1)}px`;
      parts.bottom.style.cssText = `left:0;top:${y2.toFixed(1)}px;width:${W}px;height:${(H - y2).toFixed(1)}px`;
      parts.left.style.cssText = `left:${(x1b - W).toFixed(1)}px;top:${y1.toFixed(1)}px;width:${W}px;height:${(y2 - y1).toFixed(1)}px`;
      parts.right.style.cssText = `left:${x2a.toFixed(1)}px;top:${y1.toFixed(1)}px;width:${W}px;height:${(y2 - y1).toFixed(1)}px`;
      parts.bar.style.cssText = `left:${x1b.toFixed(1)}px;top:${y1.toFixed(1)}px;width:${bar}px;height:${(y2 - y1).toFixed(1)}px;transform-origin:50% 50%`;
      root.style.setProperty('--sw-y1', y1.toFixed(1) + 'px');
      root.style.setProperty('--sw-y2', y2.toFixed(1) + 'px');
    },
    update(p) {
      if (!g) return;
      const { W, H, y1, y2, x1b, x2a, ww, pad } = g;
      // 1. the windows widen outward, 2. the bar closes, 3. the shutter scales past the edges
      const widen = seg(p, 0, 0.34, ease.inOut);
      const close = seg(p, 0.36, 0.52, ease.inOut);
      const push = seg(p, 0.56, 0.9, ease.in2);
      const x1a = lerp(x1b - ww, pad, widen), x2b = lerp(x2a + ww, W - pad, widen);
      // the left piece's right edge is at x1a, the right piece's left edge at x2b: full-width pieces moved by transform
      parts.left.style.transform = `translate3d(${(x1a - x1b).toFixed(1)}px, 0, 0)`;
      parts.right.style.transform = `translate3d(${(x2b - x2a).toFixed(1)}px, 0, 0)`;
      parts.bar.style.transform = `scaleX(${(1 - close).toFixed(4)})`;
      parts.bar.style.visibility = close >= 1 ? 'hidden' : '';
      // the push: scale about the window's centre until every piece is past the screen
      const cx = W / 2, cy = (y1 + y2) / 2;
      const need = Math.max(W / Math.max(1, (x2b - x1a)) * 1.08, H / (y2 - y1) * 1.15, (W - cx) / Math.max(1, W - x2b), cy / Math.max(1, y1), (H - cy) / Math.max(1, H - y2)) * 1.1;
      const s = Math.exp(lerp(0, Math.log(need), push));
      shutter.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      shutter.style.transform = `scale(${s.toFixed(4)})`;
      shutter.style.visibility = push >= 1 ? 'hidden' : '';
      // the world: still behind the shutter, a slow settle once the reader is through
      world.style.transform = `scale(${(1.06 - 0.06 * seg(p, 0.56, 1, ease.out)).toFixed(4)})`;
      const words = 1 - seg(p, 0.44, 0.56, ease.inOut);
      put(title, words, -8); put(cta, words, 8);
      // the band rises with the word, then the lede's text and action arrive in it
      put(lede, seg(p, 0.66, 0.82, ease.out), 40);
      if (word) put(word, seg(p, 0.7, 0.86, ease.out), 24);
      rest.forEach((el, i) => put(el, seg(p, 0.84 + i * 0.04, 1, ease.out), 16));
    },
    rest() {
      shutter.remove(); world.style.cssText = '';
      [title, cta, word, lede, ...rest].forEach(el => { if (el) el.style.cssText = ''; });
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); shutter.remove(); } };
}
