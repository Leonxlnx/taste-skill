#!/usr/bin/env node
// node tests/deal-variety.mjs (Node 22). To run bounded batches, give each --kind the same --run-dir.
import assert from 'node:assert/strict';
import { fitsKind, needsMet, hasFor } from '../skills/taste-skill/scripts/moments.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skills/taste-skill');
const load = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const opt = key => { const i = process.argv.indexOf('--' + key); return i < 0 ? undefined : process.argv[i + 1]; };
const kinds = ['software', 'gaming', 'tech', 'product', 'service', 'place'];
const temp = process.env.TASTE_SKILL_TMP || (process.platform === 'win32' ? 'D:/tmp/night-1124/dealers' : os.tmpdir());
fs.mkdirSync(temp, { recursive: true });
const run = opt('run-dir') || fs.mkdtempSync(path.join(temp, 'deal-variety-'));
const cwd = path.join(run, 'project');
fs.mkdirSync(cwd, { recursive: true });
const historyFile = path.join(cwd, '.taste-skill/history.json');
const planFile = path.join(cwd, '.taste-skill/plan.json');
const seeds = load(path.join(root, 'library/ideas.json'));
const stories = load(path.join(root, 'library/stories.json'));
const moments = load(path.join(root, 'assets/moments/index.json')).moments;
const headings = ['letters-assemble', 'word-highlight', 'word-rotate', 'lines-rise', 'giant-type-pass', 'liquid-type'];
for (const id of ['edge-split','colour-half','intro-rail','shopfronts','name-foot','story-line','menu-tabs','pantry-tiles','archive-prints','record-handoff','setup-by-environment','test-record','release-documents']) {
  assert.equal(seeds.filter(seed => seed.id === id).length, 1, 'missing or duplicate idea: ' + id);
}
const keys = 'rhythm parts demo gradient tools seed actionColour footerWordmark headline version kind pageType trade temper temperWhy sections palette type hero heroPeek heroBook entrance reveals nav footer close buttons mark grounds density align pictures compositions own ideas sub moments rides scene effect story'.split(' ');
const varied = 'palette type hero entrance nav footer close buttons mark grounds density align pictures compositions ideas sub moments scene effect'.split(' ');
const kindsToRun = opt('kind') ? [opt('kind')] : kinds;
const hasByKind = { software: 'ui,logo', gaming: 'setting', tech: 'ui', product: 'object', service: 'photo', place: 'photo' };
const textNeeds = {
  'marquee-row': ['list'], 'counter-rolls': ['figures'], 'pinned-chapters': ['steps'],
  'dot-becomes-the-full-stop': ['words'], 'wordmark-under-strain': ['words'], 'letter-physics': ['words'],
  'light-flood': ['words'], 'object-through-giant-type': ['words'], 'letter-bar-floods-the-ground': ['words'],
  'one-figure-reforms': ['steps', 'figures'], 'orbit-to-formation': ['figures'], 'route-journey': ['steps', 'figures'],
  'hinged-sheets': ['list', 'figures'], 'instrument-dial-stage': ['photos', 'figures'],
};
function checkNeeds(part, carry, assets) {
  for (const n of [...(part.needs?.list || []), ...(part.needs?.carry || []), ...(textNeeds[part.id] || [])]) {
    const [name, num] = n.split(':');
    if (name === 'pictures' && Number(num) === 0) continue;
    let required = { pictures: 'photos', 'product-photo': 'photos', names: 'list', series: 'list' }[name] || name;
    if (['words', 'photos', 'list', 'steps', 'figures'].includes(required)) assert(carry.includes(required), part.id + ' needs ' + n);
    if (name === 'pictures' && Number(num) > 8) assert(assets.includes('archive'));
    if (name === 'product-ui') assert(assets.includes('ui'));
    if (name === 'product-photo') assert(assets.includes('product') || assets.includes('object'));
    if (name === 'video') assert(assets.includes('film'));
    if (name === 'route') assert(assets.includes('route'));
    if (name === 'site') assert(assets.includes('site') || assets.includes('setting'));
  }
  if (part.needs?.photo && !/^optional/i.test(String(part.needs.photo))) assert(carry.includes('photos'));
  if (part.needs?.ui) assert(assets.includes('ui'));
  if (part.needs?.object) assert(assets.includes('object'));
  if (part.needs?.mark) assert(assets.includes('logo'));
}
const table = [];
for (const kind of kindsToRun) {
  assert(kinds.includes(kind));
  const quiet = ['place', 'service', 'product'].includes(kind);
  const counts = {};
  const recentGrounds = [];
  const recentStories = [];
  let prev, minDelta = Infinity, previousIdeas = fs.existsSync(historyFile) ? load(historyFile).ideas || [] : [];
  for (let i = 0; i < 40; i++) {
    const sections = [5, 6, 7, 8, 9][i % 5];
    const long = i % 7 === 1;
    const materials = [undefined, '', 'words', 'list,figures', 'steps,photos', 'words,list,photos,steps,figures'][i % 6];
    const carry = materials === undefined ? (quiet ? ['photos'] : []) : materials.split(',').filter(Boolean);
    const assets = (i % 4 === 3 ? 'photo,art,ui,film,archive,product,route,logo,object' : hasByKind[kind]).split(',');
    const action = i % 3 === 0 && ['place', 'service'].includes(kind) ? 'booking' : kind === 'product' && i % 3 === 0 ? 'order' : 'contact';
    const booking = ['stay', 'table', 'class', null][i % 4];
    const args = [path.join(root, 'scripts/start.mjs'), 'plan', '--page', kind, '--has', assets.join(','),
      '--action', action, ...(action === 'booking' && booking ? ['--booking', booking] : []), '--sections', String(sections), '--seed', kind + '-' + i, '--no-recent',
      ...(materials === undefined ? [] : ['--carry', materials]), ...(long ? ['--long'] : [])];
    const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.equal(result.status, 0, kind + '/' + i + ': ' + (result.error || result.stderr));
    const p = load(planFile);
    const printed = result.stdout.slice(result.stdout.indexOf('==== PLAN'));
    assert(printed.startsWith('==== PLAN'));
    assert.deepEqual(Object.keys(p).sort(), [...keys, ...(p.hero === 'place' ? ['heroForm'] : []), ...((p.temper !== 'quiet' && kind==='gaming') || (kind==='software' && p.hero==='centred' && assets.includes('ui')) ? ['heroVariant'] : [])].sort());
    if (p.hero === 'place') assert.ok(['band','bleed','split','name','foot'].includes(p.heroForm));
    assert.equal(p.version, '2.5.4');
    assert.equal(p.kind, kind);
    // no brief words: a game is lively, every other kind quiet (references/expressive.md)
    assert.equal(p.temper, kind === 'gaming' ? 'lively' : 'quiet');
    assert.equal(p.sections, Math.max(sections,stories.find(s => s.id===p.story).beats.filter(b=>b.required).length));
    assert.equal(p.own, p.sections < 6 ? 1 : 2);
    // The retired no-material effects used to fill every slot. Check the actual remaining pool.
    const eligible = moments.filter(m => !m.retired && m.weight > 0 && m.counts !== false && !m.pointerOnly
      && fitsKind(m, kind) && needsMet(m, hasFor(kind, assets.join(',')), new Set(carry)).length === 0
      && !(action !== 'contact' && m.fits.every(f => f === 'closing')));
    const expected = p.temper === 'quiet' ? 0 : Number(eligible.length > 0);
    assert.equal(p.moments.length, expected, kind + '/' + i + ' moment count');
    if (p.temper === 'quiet') assert.equal(p.scene, null);
    assert(['still','fade','rise'].includes(p.entrance));
    assert(['none','fade'].includes(p.reveals));
    assert(p.moments.every(id => eligible.some(m => m.id === id)));
    assert.equal(p.grounds.bySection.length, p.sections);
    assert.equal(p.grounds.bySection[0], 'page');
    // the story shape: one that lists the kind, printed with its beats, never one of the last three; a chapters or
    // two-part-promise page takes the chapters ground pattern (one ground per chapter run or half), every other page
    // keeps the dealt pattern, away from the last two
    const story = stories.find(st => st.id === p.story);
    assert(story && story.kinds.includes(kind), kind + '/' + i + ' story ' + p.story);
    assert(!recentStories.slice(-Math.min(3, stories.filter(st => st.kinds.includes(kind)).length - 1)).includes(p.story), kind + '/' + i + ' story repeated: ' + p.story);
    recentStories.push(p.story);
    assert(printed.includes('  story        ' + p.story + ': ' + story.line));
    story.beats.forEach((b, ix) => assert(printed.includes('beat ' + (ix + 1)), 'beat ' + (ix + 1) + ' not printed'));
    if (p.temper === 'quiet') {
      assert(['one','band','chapters'].includes(p.grounds.pattern));
      assert(new Set(p.grounds.bySection).size <= 2);
      if (p.grounds.pattern === 'one') assert(p.grounds.bySection.every(g => g === 'page'));
      if (p.grounds.pattern === 'band') assert.equal(p.grounds.bySection.filter(g => g !== 'page').length, 1);
      if (p.grounds.pattern === 'chapters') assert(p.sections >= 8);
    } else if (['chapters', 'two-part-promise'].includes(p.story)) {
      assert.equal(p.grounds.pattern, 'chapters');
      const changes = p.grounds.bySection.slice(1).filter((g, ix) => g !== p.grounds.bySection[ix]).length;
      assert(changes <= 3, 'chapters grounds change ' + changes + ' times');
      recentGrounds.push(null);   // the dealt pattern under it stays in the history unseen
    } else {
      assert.notEqual(p.grounds.pattern, 'chapters');
      assert(!recentGrounds.slice(-2).includes(p.grounds.pattern));
      recentGrounds.push(p.grounds.pattern);
    }
    const fields = Object.fromEntries(printed.split('\n').flatMap(line => {
      const match = line.match(/^  ([a-z]+(?: [0-9])?)\s{2,}(.+)$/);
      return match ? [[match[1], match[2]]] : [];
    }));
    for (const key of ['hero', 'nav', 'footer', 'align', 'pictures']) assert(fields[key].startsWith(p[key]));
    assert(fields.palette.startsWith(p.palette + ', type ' + p.type + ':'));
    assert(fields.density.includes('data-density="' + p.density + '"'));
    const groundCount = new Set(p.grounds.bySection).size;
    assert(fields.grounds.startsWith(groundCount + (groundCount === 1 ? ' ground (' : ' grounds (')));
    for (const g of new Set(p.grounds.bySection)) assert(fields.grounds.includes(({ 'ground-surface':'tint','ground-inverse':'dark','ground-brand':'brand' })[g] || 'page'));
    assert(!p.ideas.includes('meter') || carry.includes('figures'));
    assert(!p.ideas.includes('week-strip') || carry.includes('steps'));
    assert.notEqual(p.hero, 'triptych'); // no three distinct subjects declared
    assert(fields.close.startsWith(p.close || 'none'));
    assert(fields.scene.startsWith(p.scene || 'none'));
    assert(fields.effect.startsWith(p.effect || 'none'));
    assert.equal(p.seed,kind+'-'+i);
    assert.equal(new Set(p.parts.map(part=>part.id)).size,p.parts.length);
    assert.equal(!!p.demo,p.parts.some(part=>part.id==='demo-loop'));
    if (p.demo) assert(kind==='software' && assets.includes('ui'));
    if (p.gradient && !p.gradient.moving) assert.equal(p.effect,null);
    for (const part of p.parts) assert(printed.includes(part.path));
    assert(fields.tools.startsWith(p.tools));
    for (const name of p.sub) assert(printed.includes('/subskills/' + name + '/SKILL.md'));
    for (const id of p.moments) {
      const m = moments.find(m => m.id === id);
      checkNeeds(m, carry, assets);
      if (quiet) assert.equal(m.webgl, 0);
      if (headings.includes(id)) {
        assert(['h2', 'close', 'statement'].includes(p.rides[id]));
        const line = printed.split('\n').find(l => /^\s*moment \d/.test(l) && l.includes(id));
        assert(line && /on the h2|on the close's heading|thin statement section/.test(line), String(line));
        if (!carry.includes('words')) assert(!line.includes('statement section'));
      }
    }
    assert(Object.values(p.rides).filter(r => r === 'statement').length <= (carry.includes('words') ? 1 : 0));
    assert(!p.moments.length || p.moments.some(id => moments.find(m => m.id === id).phoneRuns));
    if (p.scene) {
      const s = load(path.join(root, 'assets/scenes', p.scene, 'meta.json'));
      checkNeeds(s, carry, assets);
      if (quiet) assert.equal(s.webgl || 0, 0);
    }
    if (quiet) assert.equal(p.effect, null);
    if (p.hero === 'film') assert(assets.includes('film'));
    if (['product', 'tech'].includes(kind) && !assets.includes('photo') && !assets.includes('art')) assert.notEqual(p.hero, 'product');
    assert.equal(p.heroBook, kind === 'place' && action === 'booking' && !!booking);
    if (p.heroBook) assert.equal(p.close, 'close-form');
    if (action === 'trial' || action === 'visit') {
      assert.notEqual(p.close, 'close-form');
      assert(!('form' in p.compositions));
    }
    if (p.hero === 'centred' && assets.includes('ui')) assert.equal(p.heroPeek, true);
    if (p.heroPeek) assert(assets.includes('ui') && printed.includes('class hero--peek'));
    if (['place', 'service', 'tech'].includes(kind)) assert(!p.sub.includes('mascot'));
    assert.equal(p.sub.includes('brand-mark'), !assets.includes('logo'));
    assert.equal(p.ideas.length, 4);
    assert.equal(new Set(p.ideas).size, 4);
    assert(p.ideas.every(id => !previousIdeas.includes(id)), 'one of the last eight seed deals came back');
    const available = seeds.filter(s => s.kinds.includes(kind) && !previousIdeas.includes(s.id));
    const picked = p.ideas.map(id => available.find(s => s.id === id));
    assert(picked.every(Boolean));
    assert.equal(new Set(picked.map(s => s.shape)).size, Math.min(4, new Set(available.map(s => s.shape)).size));
    previousIdeas = [...previousIdeas, ...p.ideas].slice(-8);
    assert.deepEqual(load(historyFile).ideas, previousIdeas);
    if (prev) {
      const delta = varied.filter(k => JSON.stringify(prev[k]) !== JSON.stringify(p[k])).length;
      minDelta = Math.min(minDelta, delta);
      assert(delta >= 5, kind + '/' + i + ': ' + delta + ' different parts');
      for (const k of ['density', 'align', 'pictures']) assert.notEqual(prev[k], p[k]);
    }
    const count = (part, value) => {
      counts[part] ||= {};
      counts[part][value] = (counts[part][value] || 0) + 1;
    };
    for (const [slot, composition] of Object.entries(p.compositions)) {
      for (const id of [].concat(composition)) count('composition.' + slot, id);
    }
    for (const ride of Object.values(p.rides)) count('rides', ride);
    for (const [k, v] of Object.entries(p)) {
      if (['version', 'kind', 'trade', 'rides', 'compositions', 'temperWhy'].includes(k)) continue;
      const values = k === 'grounds' ? [v.pattern] : [].concat(v);
      for (const value of values) count(k, value);
    }
    if (i === 0 || (kind === 'software' && p.heroPeek && !fs.existsSync(path.join(run, 'sample-peek.txt')))) {
      fs.writeFileSync(path.join(run, i === 0 ? 'sample-' + kind + '.txt' : 'sample-peek.txt'), printed);
    }
    prev = p;
  }
  assert(Object.keys(counts.grounds).filter(g => g !== 'chapters').length >= 2, kind + ' ground patterns ' + Object.keys(counts.grounds));
  assert(Object.keys(counts.story).length >= 3, kind + ' story shapes ' + Object.keys(counts.story));
  fs.writeFileSync(path.join(run, 'counts-' + kind + '.json'), JSON.stringify({ counts, minDelta }, null, 2));
  const part = k => Object.entries(counts[k]).map(([v, n]) => v + ' ' + n).join(', ');
  table.push({ kind, pages: 40, grounds: part('grounds'), density: part('density'), scenes: 40 - (counts.scene.null || 0), minDelta });
  console.log(kind + ' · part frequencies');
  for (const key of Object.keys(counts)) console.log('  ' + key + '  ' + part(key));
}
console.table(table);
console.log('Detailed counts and printed PLAN samples: ' + run);
