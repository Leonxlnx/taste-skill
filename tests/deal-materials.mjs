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
  cwd: dir, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, TASTE_SKILL_RECENT: process.env.TASTE_SKILL_RECENT || 'off' },
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
  for (const [ground, text] of [['bg','ink'],['surface','ink'],['bg','muted'],['surface','muted'],['inv-bg','inv-ink'],['inv-surface','inv-ink'],['inv-bg','inv-muted'],['inv-surface','inv-muted'],['accent','accent-ink'],['action','action-ink'],['inv-action','inv-action-ink']]) {
    const minimum = ['ink','inv-ink'].includes(text) ? 7 : 4.5;
    assert(color.contrast(token(ground), token(text)) >= minimum, p.id + ': ' + text + ' on ' + ground);
  }
  for (const [ground, text] of [['bg','muted'],['surface','muted'],['inv-bg','inv-muted'],['inv-surface','inv-muted']]) {
    const ratio = color.contrast(token(ground), token(text));
    assert(ratio >= 7 && ratio <= 10, p.id + ': secondary ink on ' + ground + ' is ' + ratio);
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

// Each deal starts in a different client folder. Only the selected IDs travel between them.
{
  const shared = path.join(dir,'machine-recent.json');
  const runIn = (script, folder, args, recent = shared) => execFileSync(process.execPath,[path.join(root,script),...args],{
    cwd:folder, encoding:'utf8', windowsHide:true, stdio:['ignore','pipe','pipe'], env:{...process.env,TASTE_SKILL_RECENT:recent},
  });
  const weights = JSON.parse(fs.readFileSync(path.join(root,'assets/layout/heroes.json'),'utf8')).heroes;
  const materials = new Set(['ui','photo','film','ground','art']);
  const eligible = weights.filter(h => h.id !== 'place' && h.id !== 'triptych' && h.types.software > 0
    && h.needs.every(n => n.split('|').some(k => materials.has(k))) && !(h.avoid || []).some(k => materials.has(k)));
  for (let i=0;i<14;i++) {
    const project = fs.mkdtempSync(path.join(dir,'project-'));
    const before = fs.existsSync(shared) ? JSON.parse(fs.readFileSync(shared,'utf8')) : {};
    runIn('scripts/start.mjs', project, ['plan','--page','software','--has','ui,photo,film,ground,art','--carry','list','--sections','6','--brief','Independent example']);
    const plan = JSON.parse(fs.readFileSync(path.join(project,'.taste-skill','plan.json'),'utf8'));
    const after = JSON.parse(fs.readFileSync(shared,'utf8'));
    for (const [key,id,max] of [['palettes',plan.palette,12],['types',plan.type,6],['heroes',plan.hero,6]]) {
      assert.equal(after[key].at(-1),id);
      assert.equal(after[key].length,Math.min(max,i+1));
      const previous = before[key] || [];
      if (key === 'heroes' && eligible.every(h => previous.includes(h.id))) {
        assert.equal(previous.lastIndexOf(id), Math.min(...eligible.map(h => previous.lastIndexOf(h.id))));
      } else assert(!previous.includes(id), key+' repeated an avoidable recent ID');
    }
    assert.deepEqual(Object.keys(after).sort(),['heroes','palettes','types']);
  }
  const state=fs.readFileSync(shared,'utf8');
  const crowded = path.join(dir,'constrained-recent.json');
  const local = path.join(dir,'constrained-project.json');
  const firstFresh = eligible[0].id;
  fs.writeFileSync(crowded,JSON.stringify({heroes:eligible.slice(1).map(h=>h.id)}));
  fs.writeFileSync(local,JSON.stringify({heroes:[firstFresh]}));
  const result = JSON.parse(runIn('assets/layout/deal.mjs',dir,['--type','software','--has','ui,photo,film,ground,art','--history',local,'--json'],crowded));
  assert.equal(result.hero.id,firstFresh,'project recency cannot consume the last machine-fresh candidate');
  const distribution=(subjects)=> runIn('assets/layout/deal.mjs',dir,['--type','software','--has','ui,photo','--subjects',String(subjects),'--stats','600']);
  assert(!distribution(1).includes('triptych'));
  assert(distribution(3).includes('triptych'));
  runIn('scripts/start.mjs',dir,['deal','--page','software'],'off');
  assert(!fs.existsSync(path.join(dir,'off')));
  assert.equal(fs.readFileSync(shared,'utf8'),state);
  console.log('ok - 14 fresh projects share bounded ID histories, off disables recording, and triptych requires three subjects');
}
