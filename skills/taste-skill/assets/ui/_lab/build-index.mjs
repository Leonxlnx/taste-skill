#!/usr/bin/env node
/*
  Rebuilds assets/ui/index.json from every <fragment>/meta.json (the header prose, motion, cards and grounds, is kept from the index.json already there), in the order below (a fragment not
  listed goes before the second choices). Run after changing a meta.json:
    node assets/ui/_lab/build-index.mjs
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORDER = ['window', 'chat', 'cursor', 'notify', 'toggles', 'stat', 'search', 'integrations', 'slider', 'voice', 'files', 'calendar', 'code', 'diff-review', 'terminal-run', 'doc', 'checklist', 'pipeline-board'];
const LAST = ['apps'];   // second choices: their meta.json says what to use instead

const names = fs.readdirSync(UI, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('_') && fs.existsSync(path.join(UI, d.name, 'meta.json')))
  .map(d => d.name);
const rank = n => (ORDER.includes(n) ? ORDER.indexOf(n) : LAST.includes(n) ? 1000 + LAST.indexOf(n) : 500);
names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

const fragments = names.map(n => {
  const m = JSON.parse(fs.readFileSync(path.join(UI, n, 'meta.json'), 'utf8'));
  for (const f of ['fragment.html', 'fragment.css']) if (!fs.existsSync(path.join(UI, n, f))) throw new Error(`${n}: ${f} is missing`);
  if (m.js && !fs.existsSync(path.join(UI, n, 'fragment.js'))) throw new Error(`${n}: meta says js but fragment.js is missing`);
  return { name: n, ...m };
});

const prev = (() => { try { return JSON.parse(fs.readFileSync(path.join(UI, 'index.json'), 'utf8')); } catch { return {}; } })();
const index = {
  version: 3,
  generated: new Date().toISOString(),
  count: fragments.length,
  load: "import ui from './ui.js'; <div data-ui-load=\"<name>\"></div>; ui.loadAll(document)",
  motion: prev.motion || 'One rule, the same as system.js: data-ui-loop on the group\'s one loop (the placeholder, the pasted root or an element around it); every other fragment holds its finished picture. With system.js the page needs nothing more (it marks the rest data-ui-still, and on a phone, on kind other and on a place every fragment); without it, ui.loadAll / ui.startAll do the same once the page holds any data-ui-loop. data-ui-still holds one by hand; data-ui-cycles="2" plays two cycles then rests. One cycle is 2.5 to 4 s, its finished picture held for at most 15% of it, and repeats while on screen, 0.6 s after the fragment shows (ui.js warns in the console about a cycle outside 2.5 to 4 s); the pointer entering its card restarts it, a held fragment plays while the pointer is on its card, and ui.restart(el) restarts the fragments in el (a tab shown again). Every loop gets a pause button in its panel\'s bottom-right corner (ui.js); nothing moves under reduced motion. A fragment never writes words of its own over the markup: every state it shows comes from the markup (data-* beside the text) or opts.',
  cards: prev.cards || 'cards.css: .card, .panel (--inset, --flush, --top, --device), .stage with .at-corner/.at-rise/.at-right/.at-over (a dialog over a window)/.at-center (only a small control on a focal tile), .fit (--fit-max), .wide (--w), .to-edge and .stage--fade-b/-r/-br (--fade-h); rules in references/cards.md',
  grounds: prev.grounds || 'ui.grounds(document, fx) mounts the [data-fx] grounds: a still one is drawn once at up to 2 device pixels and kept as a picture (its WebGL context freed), a ground a fragment drives (data-fx-live, or a slider with opts.drive) stays live near the screen only, at 1 device pixel, and is baked under reduced motion; the page needs one or two WebGL contexts. Behind a fragment, a soft lit field (painterly-landscape, grain-gradient, gradient-mesh, silk-folds), never a line, grid or dot pattern.',
  fragments,
};
fs.writeFileSync(path.join(UI, 'index.json'), JSON.stringify(index, null, 1) + '\n');
console.log(`index.json: ${fragments.length} fragments (${fragments.map(f => f.name).join(', ')})`);
