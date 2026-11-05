/*
  dot-becomes-the-full-stop - one large dot drops onto the page's ground, and the claim grows out of
  it to the left one whole word at a time; the dot steps right and a step smaller with each word
  until it is exactly the sentence's own full stop as the last word lands. An optional second beat
  cuts the ground to the inverse in one step and sets one supporting line under the claim.

  <section class="sc" data-big-scene="dot-becomes-the-full-stop" data-big-scene-opts='{"cut":true}' style="--h: 1" aria-labelledby="dfs-h">
    <div class="sc__stage">
      <h2 class="dfs__line" id="dfs-h">Every invoice paid in days.</h2>     4-6 words ending on a full stop
      <p class="dfs__sub">One line of 8-16 words under it.</p>              optional; shown after the cut
    </div>
  </section>
*/
import { scene, seg, ease, clamp, split, unsplit, fitLine, lerp } from '../lib.js';

export default function mount(root, opts = {}) {
  const line = root.querySelector('.dfs__line'), sub = root.querySelector('.dfs__sub');
  if (!line) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const cut = opts.cut ?? !!sub;
  let words = [], stop = null, dot = null, pos = [], lineW = 0, D0 = 0, wrapped = false;
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: { hold: 1 },             // the light version: the same stage, the line on two rows
    enter() {                       // on every move to live: rest() puts the plain text back
      words = split(line);
      const last = words[words.length - 1];
      const t = last.textContent;
      if (t.endsWith('.')) { last.textContent = t.slice(0, -1); stop = document.createElement('span'); stop.className = 'dfs__stop'; stop.textContent = '.'; last.appendChild(stop); }
      else { stop = null; }
      dot = document.createElement('span'); dot.className = 'dfs__dot'; dot.setAttribute('aria-hidden', 'true');
      line.appendChild(dot);
    },
    measure(ctx) {
      line.style.transform = '';
      const wrap = line.parentElement.getBoundingClientRect();
      const avail = ctx.vw - 2 * parseFloat(getComputedStyle(line.parentElement).paddingLeft || 0);
      // one row on a wide screen; on a phone the line may take two rows at the fitted minimum
      line.style.whiteSpace = 'nowrap';
      const size = fitLine(line, avail * 0.9, { min: ctx.phone ? 34 : 40, max: ctx.phone ? 60 : 140 });
      if (line.scrollWidth > avail) line.style.whiteSpace = 'normal';
      const lb = line.getBoundingClientRect();
      lineW = lb.width;
      const sb = (stop || words[words.length - 1]).getBoundingClientRect();
      const stopD = stop ? Math.max(6, sb.width * 0.86) : size * 0.14;
      const stopCx = sb.left + sb.width / 2 - lb.left, stopCy = sb.top + sb.height * 0.78 - lb.top;
      const lastB = words[words.length - 1].getBoundingClientRect();
      const dy = stopCy - (lastB.top + lastB.height / 2 - lb.top);
      D0 = Math.min(ctx.vh * 0.2, ctx.vw * 0.16, size * 1.6);
      const n = words.length;
      pos = words.map((w, i) => {
        const r = w.getBoundingClientRect();
        const d = D0 * Math.pow(stopD / D0, (i + 1) / n);
        const right = i === n - 1 && stop ? sb.left - lb.left : r.right - lb.left;
        return { x: right + (i === n - 1 && stop ? sb.width / 2 : size * 0.12 + d / 2), y: r.top + r.height / 2 - lb.top + dy, d, rowTop: r.top - lb.top, rowH: r.height };
      });
      // the dot alone, before any word: centred on the first row
      const first = pos[0];
      pos.unshift({ x: D0 / 2, y: first.y, d: D0, rowTop: first.rowTop, rowH: first.rowH });
      wrapped = pos[n].rowTop !== pos[1].rowTop;          // two rows (a phone): the block stays put, only one row could be centred
      dot.style.width = dot.style.height = D0.toFixed(1) + 'px';
    },
    update(p) {
      if (!pos.length) return;
      const n = words.length;
      const at = i => 0.12 + ((i - 1) / Math.max(1, n - 1)) * 0.68;   // word i (1-based) lands here: the first word rises right behind the drop (0-0.05), so the dot is never alone for long
      const drop = seg(p, 0, 0.05, ease.out);
      // in each word's window the dot glides first, then the word rises into the gap behind it
      let i = 0, f = 0, fw = 0;
      for (let k = 1; k <= n; k++) { const a = at(k) - 0.07, b = at(k); if (p >= b) { i = k; f = 1; fw = 1; } else if (p > a) { i = k - 1; f = seg(p, a, a + 0.045, ease.out); fw = seg(p, a + 0.025, b, ease.out); break; } else break; }
      const from = pos[i], to = pos[Math.min(n, i + 1)];
      const k = i === n ? 0 : f;
      const x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k), d = Math.exp(lerp(Math.log(from.d), Math.log(to.d), k));
      const reveal = i + (i === n ? 0 : fw);                  // revealed words (fractional)
      const rightEdge = x + d / 2;
      const shift = (lineW - rightEdge) / 2;
      line.style.transform = `translate3d(${(i === n || wrapped ? 0 : shift).toFixed(1)}px, 0, 0)`;
      const dropY = (1 - drop) * -(from.y + D0);
      dot.style.transform = `translate3d(${(x - D0 / 2).toFixed(1)}px, ${(y - D0 / 2 + dropY).toFixed(1)}px, 0) scale(${(d / D0).toFixed(4)})`;
      const done = p >= at(n) + 0.004;
      dot.style.opacity = done ? '0' : '1';
      if (stop) stop.style.opacity = done ? '1' : '0';
      words.forEach((w, j) => {
        const kw = clamp(reveal - j);
        w.style.opacity = kw.toFixed(3);
        w.style.transform = `translate3d(0, ${((1 - kw) * 0.3).toFixed(3)}em, 0)`;
      });
      if (cut) {
        const c = p >= 0.9;
        root.classList.toggle('is-cut', c);
        if (sub) { const ks = seg(p, 0.92, 1, ease.out); sub.style.opacity = ks.toFixed(3); sub.style.transform = `translate3d(0, ${((1 - ks) * 12).toFixed(1)}px, 0)`; }
      }
    },
    rest() {
      line.style.cssText = ''; root.classList.remove('is-cut');
      if (dot) { dot.remove(); dot = null; }
      stop = null;                                                     // unsplit puts the whole claim back, its full stop with it
      unsplit(line); words = []; pos = [];
      if (sub) sub.style.cssText = '';
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); } };
}
