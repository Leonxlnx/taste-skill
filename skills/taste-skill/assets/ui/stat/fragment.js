// stat: one cycle (about 3.3 s): the bars sink to the period before and rise to this one; hold. The
// number stays on this period's value (data-to), so it always matches the copy beside it.
// opts.data or data-values="52,58,..." (new values), opts.prev or data-prev (old values), opts.window (true: bars are holes onto the ground),
// opts.fill (true: the chart takes the fragment's height, for bars that leave the panel's bottom edge)
import { loop, withLoop } from '../ui.js';

const DATA = [52, 58, 55, 61, 57, 63, 60, 66, 62, 69, 65, 71, 68, 76];
const PREV = [40, 46, 44, 48, 45, 51, 49, 53, 50, 55, 52, 57, 55, 60];

export default function init(root, opts = {}) {
  const list = s => (s ? s.split(/[\s,]+/).filter(Boolean).map(Number).filter(Number.isFinite) : null);
  const data = opts.data || list(root.dataset.values) || DATA;
  let prev = opts.prev || list(root.dataset.prev) || PREV;
  if (prev.length !== data.length) prev = data.map((v, i) => prev[i] ?? v * 0.8);
  if (opts.window) root.classList.add('is-window');
  if (opts.fill) root.classList.add('is-fill');
  const bars = root.querySelector('.ui-stat__bars'), cover = root.querySelector('.ui-stat__cover');
  const num = root.querySelector('[data-stat-num]');
  const to = root.dataset.to, suffix = root.dataset.suffix || '';
  // the number as written stays; data-to fills it only when the markup leaves it empty
  if (num && !num.textContent.trim() && to != null && to !== '') num.textContent = `${to}${suffix}`;
  const n = data.length;
  const max = Math.max(...data, ...prev) * 1.08;
  bars.innerHTML = data.map(() => '<rect rx="3"/>').join('');
  const rects = [...bars.children];
  const svg = root.querySelector('.ui-stat__svg');
  const grid = root.querySelector('.ui-stat__grid');
  const isWin = () => root.classList.contains('is-window');
  // the drawing is in CSS px of the svg's own box, so bars keep round corners at any height
  const size = () => {
    const w = Math.round(svg.clientWidth) || 420;
    const h = Math.round(svg.clientHeight) || (isWin() ? 144 : 120);
    return [w, h];
  };
  let last = 1;
  const draw = k => {
    last = k;
    const [W, h] = size();
    const pad = isWin() ? 16 : 0;              // window bars sit on the same 16px inset as the text
    const inner = W - pad * 2;
    const gap = Math.max(4, Math.min(8, inner / n * 0.28));
    const bw = (inner - gap * (n - 1)) / n;
    const top = isWin() ? 4 : 8;
    svg.setAttribute('viewBox', `0 0 ${W} ${h}`);
    if (grid) grid.setAttribute('d', [0.25, 0.5, 0.75].map(f => `M0 ${Math.round(h * f) + 0.5}H${W}`).join(''));
    let hole = '';
    data.forEach((v, i) => {
      const val = prev[i] + (v - prev[i]) * k;
      const bh = Math.max(4, (val / max) * (h - top));
      const x = pad + i * (bw + gap), y = h - bh;
      const r = rects[i];
      r.setAttribute('x', x.toFixed(2)); r.setAttribute('y', y.toFixed(2));
      r.setAttribute('width', bw.toFixed(2)); r.setAttribute('height', bh.toFixed(2));
      const rr = 3;
      hole += `M${x} ${h + 1}V${y + rr}Q${x} ${y} ${x + rr} ${y}H${x + bw - rr}Q${x + bw} ${y} ${x + bw} ${y + rr}V${h + 1}Z`;
    });
    cover.setAttribute('d', `M-1 -1H${W + 1}V${h + 1}H-1Z${hole}`);
  };
  const ro = new ResizeObserver(() => draw(last));
  ro.observe(svg);
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const ctl = loop(root, async api => {
    await api.tween(600, k => draw(1 - k), ease);
    await api.wait(150);
    await api.tween(1700, draw, ease);
    await api.wait(430);
  }, { still: () => draw(1) });
  return withLoop(ctl, () => { ro.disconnect(); ctl.destroy(); });
}
