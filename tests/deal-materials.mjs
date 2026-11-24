#!/usr/bin/env node
// Check CSS output for the full palette library and legacy CLI flags against the current data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { color } from '../skills/taste-skill/assets/effects/fx.js';
import { dealScene, readScenes } from '../skills/taste-skill/scripts/moments.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skills/taste-skill');
const temp = process.env.TASTE_SKILL_TMP || (process.platform === 'win32' ? 'D:/tmp/night-1124/dealers' : os.tmpdir());
fs.mkdirSync(temp, { recursive: true });
const dir = fs.mkdtempSync(path.join(temp, 'deal-materials-'));
const cli = (script, ...args) => execFileSync(process.execPath, [path.join(root, script), ...args], {
  cwd: dir, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, TASTE_SKILL_RECENT: '' },
});
const palettes = JSON.parse(fs.readFileSync(path.join(root, 'library/palettes.json'), 'utf8'));
let derived = 0, low = Infinity, high = 0;
for (const p of palettes) {
  const css = cli('scripts/start.mjs', 'css', '--page', 'software', '--palette', p.id, '--type', 'geist', '--force');
  const [, bg, surface] = css.match(/--p-bg: (#[0-9a-f]{6}); --p-surface: (#[0-9a-f]{6});/);
  for (const name of ['ink','muted','inv-ink','inv-muted','accent-ink','action-ink','inv-accent-ink','inv-action-ink']) {
    const value = css.match(new RegExp('--p-' + name + ': (#[0-9a-f]{6});'))[1];
    assert(color.chroma(value) <= .021, p.id + ' --p-' + name + ' is too chromatic: ' + value);
  }
  const token = name => css.match(new RegExp('--p-' + name + ': (#[0-9a-f]{6});'))[1];
  for (const [ground, text] of [['bg','ink'],['surface','ink'],['bg','muted'],['surface','muted'],['inv-bg','inv-ink'],['inv-surface','inv-ink'],['inv-bg','inv-muted'],['inv-surface','inv-muted'],['action','action-ink'],['inv-action','inv-action-ink']]) {
    const minimum = ['ink','inv-ink'].includes(text) ? 7 : 4.5;
    assert(color.contrast(token(ground), token(text)) >= minimum, p.id + ': ' + text + ' on ' + ground);
  }
  const l = color.lab(bg)[0];
  const original = p.surface || color.mix(p.bg, p.ink, 0.05);
  const before = Math.abs(l - color.lab(original)[0]);
  const difference = Math.abs(l - color.lab(surface)[0]);
  assert(difference >= 0.04 && difference <= 0.09, p.id + ': ' + difference);
  low = Math.min(low, difference);
  high = Math.max(high, difference);
  if (before < 0.04 || before > 0.09) {
    derived++;
    assert(css.includes('Surface tint derived'), p.id);
    assert.equal(surface, color.lighten(bg, color.isDark(bg) ? 0.06 : -0.06));
  } else {
    assert(!css.includes('Surface tint derived'), p.id);
    assert.equal(surface, color.hex(original));
  }
}
console.log(palettes.length + ' palettes: ' + derived + ' derived, ' + (palettes.length - derived) + ' retained. Emitted OKLCH distances ' + (low * 100).toFixed(2) + '% to ' + (high * 100).toFixed(2) + '%.');
const pick = (...flags) => JSON.parse(cli('scripts/moments.mjs', 'pick', '--page', 'software', '--json', '--seed', 'copy', ...flags));
assert.equal(pick().picks.length, 0);
const withMaterial = (...flags) => pick('--carry', 'words,photos,steps', ...flags);
assert.equal(withMaterial('--sections', '6').picks.length, 1);
assert.equal(withMaterial('--sections', '7').picks.length, 2);
assert.equal(withMaterial('--long').picks.length, 2);
assert.equal(withMaterial('--count', '3').picks.length, 2);
assert.equal(withMaterial('--count', '1', '--sections', '9').picks.length, 1);
assert(withMaterial('--contexts', '4').picks.every(p => !p.webgl));
assert.deepEqual(JSON.parse(cli('scripts/effects.mjs', 'pick', '--page', 'product', '--tech-subject', '--palette', 'light', '--slots', 'hero', '--json')).picks, []);
for (const kind of ['tech', 'product']) {
  const distribution = cli('assets/layout/deal.mjs', '--type', 'product', '--kind', kind, '--has', 'object', '--stats', '40');
  assert.match(distribution, /heroes: split 100%/);
}
for (const assets of ['photo', 'logo', 'ground', 'art', 'setting', '']) {
  const { hero } = JSON.parse(cli('assets/layout/deal.mjs', '--type', 'gaming', '--has', assets, '--json'));
  assert.notEqual(hero.id, 'film');
}
console.log('Standalone pick counts, the four-context limit, game and hardware hero material, and the legacy --tech-subject flag passed.');

const scenes = readScenes();
const conflictingScene = 'fly-into-the-shape';
const alternatives = scenes.filter(s => s.id !== conflictingScene).map(s => s.id);
const material = {page:'product',tone:'product',seed:'product-32',has:'photo,logo,pictures:3',carry:'words,photos',exclude:alternatives};
assert.equal(dealScene(scenes, {...material, chance:1}).scene?.id, conflictingScene);
const crowded = JSON.parse(cli('scripts/moments.mjs', 'pick', '--page', 'product', '--sections', '7',
  '--has', material.has, '--carry', material.carry, '--fits', 'statement,closing', '--tone', 'product', '--scene', 'deal', '--seed', 'product-32', '--exclude', [...alternatives,'window-parallax','photo-chapters','word-rotate','pinned-chapters'].join(','), '--json'));
assert.equal(crowded.picks.length, 2);
assert.equal(crowded.scene, null);
console.log('A scene that would exclude the required second moment is omitted.');
for (const page of ['software', 'tech', 'gaming', 'product', 'service', 'place']) {
  const history = [];
  for (let i = 0; i < 300; i++) {
    const { scene } = dealScene(scenes, {
      page, seed: page + '/eligible/' + i, history, has: 'photo,ui,film,product,object,archive,route,site,logo',
      carry: 'words,list,photos,steps,figures',
    });
    if (scene) history.push(scene.id);
  }
  assert(history.length > 65 && history.length < 135, page + ': ' + history.length + ' scenes');
  console.log(page + ': ' + history.length + ' scenes in 300 eligible deals');
}
