#!/usr/bin/env node
/*
  scenes-index.mjs - rebuilds assets/scenes/index.json from every assets/scenes/<id>/meta.json (taste-skill,
  references/scenes.md).

    node scripts/scenes-index.mjs            write the index and print a count by kind, tone and intensity
    node scripts/scenes-index.mjs --check    exit 1 when index.json is out of date or a meta.json is broken

  Every folder with a meta.json is a scene; none is skipped. A retired one (meta.retired says why, weight 0)
  stays in the index with its retired flag, so a list can show it and the deal (moments.mjs scene) leaves it
  out. Classic scenes (meta.classic 1) are the 2.4 scenes restored on the shared classic stage.
  Each meta.json carries the fit fields every moment, scene and effect carries: tones (warm, editorial,
  product, tech, playful), intensity (quiet, lively, bold) and webgl (0 or 1); this prints what is missing.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets', 'scenes');
const OUT = path.join(DIR, 'index.json');
const TONES = ['warm', 'editorial', 'product', 'tech', 'playful'];
const INTENSITY = ['quiet', 'lively', 'bold'];
const check = process.argv.includes('--check');

const problems = [], notes = [];
const scenes = [];
for (const id of fs.readdirSync(DIR).sort()) {
  const mp = path.join(DIR, id, 'meta.json');
  if (!fs.existsSync(mp)) continue;
  let m;
  try { m = JSON.parse(fs.readFileSync(mp, 'utf8')); } catch (e) { problems.push(`${id}: meta.json: ${e.message}`); continue; }
  if (m.id && m.id !== id) problems.push(`${id}: meta.json says id "${m.id}"`);
  m.id = id;
  if (!fs.existsSync(path.join(DIR, id, 'scene.js'))) problems.push(`${id}: no scene.js`);
  if (!fs.existsSync(path.join(DIR, id, 'demo.html'))) notes.push(`${id}: no demo.html`);
  if (!Array.isArray(m.tones) || !m.tones.length || m.tones.some(t => !TONES.includes(t))) notes.push(`${id}: tones missing or unknown (${TONES.join(', ')})`);
  if (!INTENSITY.includes(m.intensity)) notes.push(`${id}: intensity missing (${INTENSITY.join(', ')})`);
  if (m.webgl !== 0 && m.webgl !== 1) notes.push(`${id}: webgl must be 0 or 1`);
  if (m.retired && (m.weight ?? 1) !== 0) problems.push(`${id}: a retired scene needs weight 0`);
  scenes.push(m);
}

const count = (key) => scenes.reduce((o, s) => { for (const v of [].concat(s[key] ?? [])) o[v] = (o[v] || 0) + 1; return o; }, {});
const live = scenes.filter(s => !s.retired);
const index = {
  version: 2,
  generated: new Date().toISOString(),
  count: scenes.length,
  dealt: live.length,
  retired: scenes.filter(s => s.retired).map(s => s.id),
  fits: count('fits'),
  tones: count('tones'),
  intensity: count('intensity'),
  rule: 'At most one big scene a page, on any kind of page whose fit it meets: its tones, intensity and webgl against the page kind (moments.mjs FIT; place and service pages take quiet or lively scenes without WebGL), its fits, types and needs against the brief (references/scenes.md). About one page in two gets one; a retired scene is never dealt. Phones and reduced motion get the finished composition or the light version; the rest of the page stays calm.',
  load: '<link rel="stylesheet" href="assets/scenes/scenes.css"> and <link rel="stylesheet" href="assets/scenes/<id>/scene.css"> in <head>; <section class="sc" data-big-scene="<id>" data-big-scene-opts=\'{…}\'><div class="sc__stage">…</div></section> (a classic scene: class="sc scene" and <div class="scene-stage">, as its demo.html writes it); <script type="module" src="assets/scenes/scenes.js"></script> once at the end of <body>.',
  scenes,
};

const strip = (j) => JSON.stringify({ ...j, generated: '' });
if (check) {
  let old = null;
  try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { /* none */ }
  const stale = !old || strip(old) !== strip(index);
  for (const p of problems) console.log(`FAIL ${p}`);
  for (const n of notes) console.log(`WARN ${n}`);
  if (stale) console.log('FAIL index.json is out of date: node scripts/scenes-index.mjs');
  console.log(`${scenes.length} scenes, ${problems.length + (stale ? 1 : 0)} problems, ${notes.length} warnings`);
  process.exit(problems.length || stale ? 1 : 0);
}
fs.writeFileSync(OUT, JSON.stringify(index, null, 1) + '\n');
for (const p of problems) console.log(`FAIL ${p}`);
for (const n of notes) console.log(`WARN ${n}`);
console.log(`index.json: ${scenes.length} scenes (${live.length} dealt, ${scenes.length - live.length} retired)`);
console.log('tones', JSON.stringify(index.tones), 'intensity', JSON.stringify(index.intensity), 'fits', JSON.stringify(index.fits));
process.exit(problems.length ? 1 : 0);
