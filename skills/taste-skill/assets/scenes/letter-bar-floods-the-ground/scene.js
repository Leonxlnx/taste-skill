/*
  letter-bar-floods-the-ground - one straight letter's stem floods the screen and becomes the next
  section's ground. A short statement stands on one line at display size with one straight-stemmed
  letter (l or I) on the centre of the screen. The camera zooms on that letter: the words on either
  side are carried out past the screen's edges while the stem grows; once it is taller than the
  screen only a flat column of ink is left, which widens to full bleed with the next statement
  arriving inside it. The section after the scene sits on that ground (ground-inverse): no seam.
  The stem is never the glyph scaled up: a solid column (rasterised once at full size and only ever
  scaled down) stands exactly on the glyph's stem from the first frame, so the edge stays sharp at
  every scale, and the ground is one full-width layer clipped by clip-path, never resized.

  <section class="sc" data-big-scene="letter-bar-floods-the-ground" style="--h: 1" aria-labelledby="lbf-h">
    <div class="sc__stage">
      <h2 class="lbf__line" id="lbf-h">Made to <span class="lbf__pivot">l</span>ast</h2>   2-4 words; the pivot letter marked: l or I
      <div class="lbf__ground"><div class="lbf__next"><h2>The next statement, 4-8 words</h2><p>One line under it.</p></div></div>
    </div>
  </section>
  Phones show the finished composition (the statement, then the next one on the inverse ground).
*/
import { scene, seg, ease, fitLine, lerp } from '../lib.js';

// the ink bounds of one glyph in its advance box and em box: fractions [x0, x1] of the advance, [y0, y1] of the em (top down)
function inkBounds(ch, font) {
  const c = document.createElement('canvas').getContext('2d');
  if (!c) return { x0: 0.16, x1: 0.84, y0: 0.08, y1: 0.8 };
  const F = 200;
  c.font = font.replace(/\d+(\.\d+)?px/, F + 'px');
  c.textBaseline = 'top';
  const m = c.measureText(ch);
  const adv = m.width || F * 0.3;
  return { x0: -m.actualBoundingBoxLeft / adv, x1: m.actualBoundingBoxRight / adv, y0: -m.actualBoundingBoxAscent / F, y1: m.actualBoundingBoxDescent / F };
}

export default function mount(root, opts = {}) {
  const line = root.querySelector('.lbf__line'), ground = root.querySelector('.lbf__ground'), next = root.querySelector('.lbf__next');
  let pivot = root.querySelector('.lbf__pivot');
  if (!line || !ground) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  if (!pivot) {   // the straight letter nearest the middle
    const t = line.textContent; let best = -1, bd = 1e9;
    for (let i = 0; i < t.length; i++) if ('lI|1'.includes(t[i]) && Math.abs(i - t.length / 2) < bd) { bd = Math.abs(i - t.length / 2); best = i; }
    if (best >= 0) { line.innerHTML = `${t.slice(0, best)}<span class="lbf__pivot">${t[best]}</span>${t.slice(best + 1)}`; pivot = line.querySelector('.lbf__pivot'); }
  }
  const stem = document.createElement('div'); stem.className = 'lbf__stem'; stem.setAttribute('aria-hidden', 'true');
  let geo = null;
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    start(ctx) { ctx.stage.insertBefore(stem, ground); },
    measure(ctx) {
      line.style.transform = ''; stem.style.transform = '';
      fitLine(line, ctx.vw * 0.68, { min: 28, max: 170 });
      const st = ctx.stage.getBoundingClientRect();
      const lb = line.getBoundingClientRect();
      const pb = (pivot || line).getBoundingClientRect();
      const cs = getComputedStyle(pivot || line);
      const ink = pivot ? inkBounds(pivot.textContent, `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`) : { x0: 0.45, x1: 0.55, y0: 0.1, y1: 0.8 };
      // the stem's rect on the page at scale 1 (the em box is the line's box: line-height 1)
      const x0 = pb.left + ink.x0 * pb.width, x1 = pb.left + ink.x1 * pb.width, y0 = lb.top + ink.y0 * lb.height, y1 = lb.top + ink.y1 * lb.height;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const stemW = Math.max(2, x1 - x0), stemH = Math.max(2, y1 - y0);
      const shift = ctx.vw / 2 - cx;                            // put the stem on the screen's centre
      let need = 0;
      if (next) {
        const pad = parseFloat(getComputedStyle(root).getPropertyValue('--pad')) || 24;
        need = Math.max(...[...next.children].map(c => c.getBoundingClientRect().width), 0) + 2 * pad;
        need = Math.min(need, ctx.vw * 0.9);                  // a line as wide as the screen arrives when the column is nearly full
      }
      geo = { stemW, stemH, ox: cx - lb.left, oy: cy - lb.top, shift, S: (ctx.vw / stemW) * 1.06, vh: ctx.vh, W: ctx.vw, need, cx: cx - st.left, cy: cy - st.top };
      line.style.transformOrigin = `${geo.ox}px ${geo.oy}px`;
    },
    update(p) {
      if (!geo) return;
      // the line starts centred and glides until its stem is on the centre of the screen, then the zoom runs
      const e = seg(p, 0.08, 0.8, ease.inOut);
      const s = Math.exp(lerp(0, Math.log(geo.S), e));
      const shift = geo.shift * seg(p, 0, 0.3, ease.inOut);
      const colW = Math.min(geo.stemW * s, geo.W), colH = geo.stemH * s;
      const tall = colH >= geo.vh * 1.05;             // the stem's ends are off the screen: the ground takes over
      line.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0) scale(${s.toFixed(4)})`;
      line.style.visibility = tall ? 'hidden' : '';
      // the solid stem: a stage-sized layer scaled down onto the glyph's stem, growing with it
      stem.style.transform = `translate3d(${(geo.cx + shift - colW / 2).toFixed(1)}px, ${(geo.cy - colH / 2).toFixed(1)}px, 0) scale(${(colW / geo.W).toFixed(5)}, ${(colH / geo.vh).toFixed(5)})`;
      stem.style.visibility = tall ? 'hidden' : '';
      // the ground: full width, clipped to the column
      const inset = Math.max(0, (geo.W - colW) / 2);
      ground.style.clipPath = `inset(0 ${inset.toFixed(1)}px)`;
      ground.style.visibility = tall ? 'visible' : 'hidden';
      if (next) {
        // never a clipped word: the statement arrives once the column is wider than its longest line
        const k = Math.min(seg(colW, geo.need, Math.min(geo.need * 1.3, geo.W), ease.out), seg(p, 0.4, 0.95, ease.out));
        next.style.opacity = k.toFixed(3);
        next.style.transform = `translate3d(-50%, ${((1 - k) * 18).toFixed(1)}px, 0) scale(${(1.06 - 0.06 * k).toFixed(4)})`;
        next.style.visibility = k <= 0 ? 'hidden' : '';
      }
    },
    rest() { line.style.cssText = ''; ground.style.cssText = ''; stem.style.cssText = ''; if (next) next.style.cssText = ''; },
  });
  return { destroy() { ctrl && ctrl.destroy(); stem.remove(); } };
}
