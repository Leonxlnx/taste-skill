// apps: hairlines run from the product's mark to every app; one app connects per cycle (about 3.2 s):
// the lit line goes out, the next app's line lights and runs toward it, its tile takes the accent ring
// and shows its name; then the next app
import { loop, withLoop } from '../ui.js';

export default function init(root, opts = {}) {
  const svg = root.querySelector('.ui-field__lines');
  const hub = root.querySelector('.ui-field__hub');
  const tiles = [...root.querySelectorAll('.ui-field__tile')];
  if (!svg || !hub || !tiles.length) return null;
  const order = (opts.order || [2, 9, 0, 4, 11, 6]).filter(i => i < tiles.length);
  if (!order.length) order.push(0);
  let paths = [], cur = -1;
  const show = i => {
    cur = i;
    tiles.forEach((t, k) => t.classList.toggle('is-on', k === i));
    paths.forEach((p, k) => p.classList.toggle('is-on', k === i));
  };
  function lines() {
    const r = root.getBoundingClientRect(), h = hub.getBoundingClientRect();
    const hx = h.left - r.left + h.width / 2, hy = h.top - r.top + h.height / 2;
    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    svg.innerHTML = tiles.map(t => {
      const b = t.getBoundingClientRect();
      const x = b.left - r.left + b.width / 2, y = b.top - r.top + b.height / 2;
      // an elbow: out of the hub sideways, then to the tile, with one soft corner
      const mx = hx + (x - hx) * 0.5;
      return `<path d="M${hx} ${hy} C${mx} ${hy} ${mx} ${y} ${x} ${y}"/>`;
    }).join('');
    paths = [...svg.children];
    show(cur);
  }
  lines();
  const ro = new ResizeObserver(lines);
  ro.observe(root);
  let k = 0;
  // one cycle (2.8 s): three apps take the ring in turn, the last held 0.38 s
  const ctl = loop(root, async api => {
    for (let n = 0; n < 3; n++) {
      show(-1);
      await api.wait(200);
      show(order[++k % order.length]);
      await api.wait(n < 2 ? 900 : 380);
    }
  }, { still: () => { k = 0; show(order[0]); } });
  return withLoop(ctl, () => { ro.disconnect(); ctl.destroy(); });
}
