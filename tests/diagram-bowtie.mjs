import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// Exercise the actual layout program without a browser or a public test-only export.
const path = new URL('../skills/taste-skill/assets/diagrams/diagram.js', import.meta.url);
const source = (await readFile(path, 'utf8'))
  .replace('import.meta.url', JSON.stringify(path.href))
  .replace('export default api;', '')
  .replace('export { mount, auto, presets, ready };', '');
const { LAYOUTS } = runInNewContext(`${source}\n({ LAYOUTS })`, { URL, console });

for (const targetCount of [1, 2, 3, 4, 6, 8, 10, 11, 20]) {
  const sources = ['s0', 's1', 's2'];
  const targets = Array.from({ length: targetCount }, (_, index) => `d${index}`);
  const ids = [...sources, 'core', ...targets];
  const nodes = new Map(ids.map(id => [id, { done: true }]));
  const geometry = Object.fromEntries(ids.map(id => [id, { id, x: 0, y: 0, w: 30, h: 30, capB: 0 }]));
  const box = { pad: 20, tier: 'n', gapMax: 20 };
  const axes = {
    M: 1200, C: 1200, ax: 'x',
    mE: g => g.w, cE: g => g.h,
    put(g, x, y) { g.x = x; g.y = y; },
  };
  const layout = LAYOUTS.bowtie({ sources, target: 'core', targets, nodes }, box, geometry, axes);
  const reached = new Set();
  layout.program({
    step(entries) {
      for (const entry of entries) {
        const index = Array.isArray(entry) ? entry[0] : entry;
        const edge = layout.edges[index];
        if (edge.from === 'core') reached.add(edge.to);
      }
    },
  });
  assert.deepEqual([...reached].sort(), [...targets].sort(), `${targetCount} targets should all pulse`);
}
console.log('bowtie target pulse checks passed');
