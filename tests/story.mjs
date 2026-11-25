#!/usr/bin/env node
// The page as a story (references/story.md), without a browser: the dealt shape in plan.json, copy-lint's copy-story
// both ways, and each story check of the checker (scripts/story-check.mjs, run by consistency.mjs) both ways.
//   node tests/story.mjs        (rules-254.mjs runs it first)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readStory, storyFindings, isLabel } from '../skills/taste-skill/scripts/story-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root, 'skills', 'taste-skill');
const tmp = fs.mkdtempSync(path.join(process.env.TASTE_SKILL_TMP || (process.platform === 'win32' ? 'D:/tmp/night-1124/story' : os.tmpdir()), 'story-test-'));
const stories = JSON.parse(fs.readFileSync(path.join(skill, 'library', 'stories.json'), 'utf8'));
const ok = (m) => console.log('ok - ' + m);

// ---- the library and the dealer
for (const s of stories) {
  for (const k of ['id', 'line', 'kinds', 'beats', 'sections', 'thread', 'fake']) assert.ok(s[k] && (!Array.isArray(s[k]) || s[k].length), s.id + ' lacks ' + k);
}
for (const kind of ['software', 'gaming', 'tech', 'product', 'service', 'place']) assert.ok(stories.filter((s) => s.kinds.includes(kind)).length >= 3, kind + ' has fewer than three shapes');
ok('stories.json: eleven shapes, every field, three shapes or more per kind');
const plan = (args) => {
  const cwd = fs.mkdtempSync(path.join(tmp, 'plan-'));
  const r = spawnSync(process.execPath, [path.join(skill, 'scripts', 'start.mjs'), 'plan', '--no-recent', ...args], { cwd, encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  return { out: r.stdout, p: JSON.parse(fs.readFileSync(path.join(cwd, '.taste-skill', 'plan.json'), 'utf8')) };
};
{
  const { out, p } = plan(['--page', 'software', '--sections', '7', '--story', 'chapters', '--seed', 's1']);
  assert.equal(p.story, 'chapters');
  assert(['one','band','chapters'].includes(p.grounds.pattern));
  assert(new Set(p.grounds.bySection).size <= 2);
  assert.match(out, /\n  story        chapters: /);
  assert.match(out, /beat 2 required \| beat: chapter/);
  const t = plan(['--page', 'product', '--sections', '8', '--story', 'two-part-promise', '--seed', 's2']).p;
  assert(['one','band','chapters'].includes(t.grounds.pattern));
  assert.ok(t.grounds.bySection.slice(1).filter((g, i) => g !== t.grounds.bySection[i]).length <= 3);
  const d = plan(['--page', 'place', '--sections', '6', '--action', 'booking', '--booking', 'stay', '--seed', 's3']).p;
  assert.ok(stories.find((s) => s.id === d.story).kinds.includes('place'));
  assert.notEqual(d.grounds.pattern, 'chapters');
  const bad = spawnSync(process.execPath, [path.join(skill, 'scripts', 'start.mjs'), 'plan', '--no-recent', '--page', 'software', '--story', 'odyssey'], { cwd: tmp, encoding: 'utf8', windowsHide: true });
  assert.notEqual(bad.status, 0);
  ok('plan.json has story; --story chooses it; a chapters or two-part-promise page takes the chapters grounds; an unknown shape stops');
}

// ---- copy-lint: copy-story both ways
const NOTES = (story) => `# Copy notes: Ledgerline

## Fact sheet
What it is: a planning grid for agencies.

Asks:
- Start a free team -> #start : send
${story}
## Voice card
Register: 1 plain
Hero form: 11 outcome
Admission: no time tracking
Enemy: the shared spreadsheet
Customer words: who is on what this week

## Draft
H1: Plan the studio's week on one grid
Lead: Drag people onto projects.
H2: Mara is booked twice on Thursday
H2: Move Friday's booking
H2: Friday's export goes to invoicing
H2: Free for three, 12 € a seat after
`;
const GOOD = `
## Story
Shape: problem-turn, the spreadsheet is the old way
Thread: Mara Lind on Fenwick and Okra, week 14, 32 hours
Turn: #clash
Bookend: the grid comes back with the price
Spine:
- H1: Plan the studio's week on one grid | beat: pain | section: #hero
- Mara is booked twice on Thursday | beat: old-way | section: #old | joins the previous by: but
- Move Friday's booking | beat: turn | section: #move | joins the previous by: then
- Friday's export goes to invoicing | beat: outcome | section: #export | joins the previous by: so
- Close: Free for three, 12 € a seat after | beat: close | section: #close
`;
const lint = (text) => {
  const dir = fs.mkdtempSync(path.join(tmp, 'notes-'));
  fs.mkdirSync(path.join(dir, '.taste-skill'));
  const f = path.join(dir, '.taste-skill', 'copy.md');
  fs.writeFileSync(f, text);
  const r = spawnSync(process.execPath, [path.join(skill, 'scripts', 'copy-lint.mjs'), f, '--json'], { encoding: 'utf8', windowsHide: true });
  return JSON.parse(r.stdout).files[0].findings.filter((x) => x.id === 'copy-story');
};
assert.deepEqual(lint(NOTES(GOOD)), []);
let f = lint(NOTES(''));
assert.ok(f.some((x) => x.sev === 'FAIL' && /no ## Story block/.test(x.msg) && /Shape: <id/.test(x.fix)));
f = lint(NOTES(GOOD.replace('Shape: problem-turn', 'Shape: odyssey')));
assert.ok(f.some((x) => x.sev === 'FAIL' && /no shape of library\/stories\.json/.test(x.msg)));
f = lint(NOTES(GOOD.replace(/Thread: .*/, 'Thread:')));
assert.ok(f.some((x) => x.sev === 'FAIL' && /no thread/.test(x.msg)));
f = lint(NOTES(GOOD.replace('joins the previous by: so', 'joins the previous by: also')));
assert.ok(f.length === 1 && f[0].sev === 'WARN' && /"also" or "and"/.test(f[0].msg));
f = lint(NOTES(GOOD.replace('- Friday\'s export goes to invoicing | beat: outcome | section: #export | joins the previous by: so\n', '')));
assert.ok(f.some(x => x.sev === 'WARN' && /3 headings, the draft 4/.test(x.msg)));
assert.ok(f.some(x => x.sev === 'FAIL' && /outcome/.test(x.msg)));
assert.ok(lint(NOTES(GOOD.replace('beat: outcome','beat: other').replace('Turn:', 'Short: Keep the page short.\nTurn:'))).some(x=>x.sev==='WARN' && /Missing story beats/.test(x.msg)));
ok('copy-lint copy-story: FAIL without the block, for an unknown shape and an empty thread; WARN for a spine off the draft and a join by "also"; none for a whole block');
assert.equal(readStory(GOOD).spine.length, 5);

{
  const {p,out} = plan(['--page','software','--sections','3','--story','work-path','--view','wide','--has','ui']);
  assert.equal(p.sections,6); assert.equal(p.heroVariant,'wide'); assert.equal(p.heroPeek,true);
  assert.match(out,/Raised --sections from 3 to 6/);
}
// ---- the checker's story block, both ways
{
  const file = path.join(tmp,'section-subjects.txt');
  const subjects = ['port map','cargo manifest','the ship’s schedule','nothing','berth plan','customs receipt','vessel drawing','nothing'];
  const args = ['--page','software','--sections','8','--section-plan',file];
  fs.writeFileSync(file,subjects.map((v,i)=>'Section '+(i+1)+' | shows  '+v+' | supplied').join('\n'));
  assert.deepEqual(plan(args).p.shows,subjects);
  fs.appendFileSync(file,'\nextra section without a subject');
  const rejected = () => spawnSync(process.execPath,[path.join(skill,'scripts','start.mjs'),'plan','--no-recent',...args],{cwd:tmp,encoding:'utf8'});
  assert.match(rejected().stderr,/Each of the 8 section lines/);
  subjects[0]='nothing';
  fs.writeFileSync(file,subjects.map(v=>'shows  '+v).join('\n'));
  assert.match(rejected().stderr,/More than a quarter/);
}
const sec = (h2, text = '', extra = {}) => ({ id: h2.toLowerCase().replace(/\W+/g, '-'), sel: 'section#' + h2.slice(0, 6), h2, text: h2 + ' ' + text, ground: 'page', chapter: '', chapterHead: '', ...extra });
const hero = { ...sec('', 'Plan the studio\'s week on one grid. Mara Lind, week 14, 32 hours'), hero: true, h2: '' };
const page = (sections, more = {}) => ({ h1: 'Plan the studio\'s week on one grid', lead: 'Drag people onto projects; a clash shows at once.', heroText: hero.text, sections: [hero, ...sections], close: { sel: 'footer h2', h2: 'Your week on one grid, free for three', lead: '', text: 'Your week on one grid, free for three' }, navs: [], ...more });
const ids = (P, o) => storyFindings(P, o).map((x) => x.check + ':' + x.sev);
const good = [sec('Mara is booked twice on Thursday', 'Mara Lind 32 hours week 14'), sec("Move Friday's booking",'Mara Lind moved to Friday'), sec('Friday\'s export goes to invoicing', 'Mara Lind sent 28 hours'), sec('Free for three, 12 € a seat after')];
assert.deepEqual(ids(page(good), { notes: NOTES(GOOD) }), []);
ok('a page that keeps its spine, carries its thread and answers its hero: no story finding');
// spine-drift
assert.ok(ids(page([good[1], good[0], good[2]]), { notes: NOTES(GOOD) }).includes('spine-drift:WARN'));
assert.ok(ids(page([good[0], good[2]]), { notes: NOTES(GOOD) }).includes('spine-drift:WARN'));
// label-run
assert.ok(isLabel('Press kit') && isLabel('The trailer') && isLabel('Devlog') && !isLabel('Plan the week') && !isLabel('Free up to 1 million events'));
assert.ok(ids(page([sec('The trailer', 'Mara Lind'), sec('Devlog', 'Mara Lind'), sec('Press kit')]), {}).includes('label-run:WARN'));
assert.ok(!ids(page(good), {}).includes('label-run:WARN'));
// thread-lost
assert.ok(ids(page([sec('Mara is booked twice on Thursday'), sec('Friday\'s export goes to invoicing'), sec('Free for three, 12 € a seat after')]), { notes: NOTES(GOOD) }).includes('thread-lost:WARN'));
{
  const repeated = [sec('First stop','Mara Lind, 32 hours'),sec('Second stop','Mara Lind, 32 hours')];
  const warning = storyFindings(page(repeated),{notes:NOTES(GOOD)}).find(f=>f.check==='thread-lost');
  assert.ok(warning && warning.msg.includes('second-stop'));
}
// close-unanswered
assert.ok(!ids(page(good, { close: { mainAction:true, sel:"#preorder", h2:"Kestrel ships in March", action:"Open email draft" } }), {notes:NOTES(GOOD)}).includes("close-unanswered:WARN"));
assert.ok(ids(page(good, { close: { sel: 'footer h2', h2: 'Questions before you start', lead: '', text: 'Questions before you start' } }), { notes: NOTES(GOOD) }).includes('close-unanswered:WARN'));
// stripe-grounds
const striped = ['ground-surface', 'page', 'ground-surface', 'page', 'ground-surface'].map((g, i) => sec('Chapter text ' + i, 'Mara Lind', { ground: g }));
assert.ok(ids(page(striped), { plan: { story: 'chapters' } }).includes('stripe-grounds:WARN'));
assert.ok(!ids(page(striped), { plan: { story: 'work-path' } }).includes('stripe-grounds:WARN'));
const runs = ['ground-surface', 'ground-surface', 'ground-surface', 'ground-inverse', 'ground-inverse'].map((g, i) => sec('Chapter text ' + i, 'Mara Lind', { ground: g }));
assert.ok(!ids(page(runs), { plan: { story: 'chapters' } }).includes('stripe-grounds:WARN'));
const inside = [sec('One', '', { ground: 'page', chapter: 'Plan' }), sec('Two', '', { ground: 'ground-surface', chapter: 'Plan' }), sec('Three', '', { ground: 'ground-surface', chapter: 'Clash' })];
assert.ok(ids(page(inside), { plan: { story: 'chapters' } }).includes('stripe-grounds:WARN'));
// chapter-nav
const link = (text, ok_) => ({ href: '#' + text.toLowerCase(), text, ok: ok_ });
const nav = (links) => ({ navs: [{ kind: 'chapter-nav', sel: 'nav.chapter-nav', links }] });
assert.ok(ids(page(good, nav([link('Plan', true), link('Clash', false), link('Export', true), link('Price', true)])), {}).includes('chapter-nav:FAIL'));
assert.ok(!ids(page(good, nav([link('Plan', true), link('Clash', true), link('Export', true), link('Price', true)])), {}).some((x) => x.startsWith('chapter-nav')));
assert.ok(ids(page(good, nav([link('Plan', true), link('Clash', true)])), {}).includes('chapter-nav:WARN'));
ok('spine-drift, label-run, thread-lost, close-unanswered, stripe-grounds WARN and chapter-nav FAIL, each both ways');
console.log('Passed the story checks. Files in ' + tmp);
