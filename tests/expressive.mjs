#!/usr/bin/env node
// The temper (references/expressive.md): the dealer, the type library, the kit's motion and the checker, both ways.
//   node tests/expressive.mjs [--no-browser]   (scratch in $TASTE_SKILL_TMP when set, else the OS temp folder; the
//   browser part runs consistency.mjs on three fixture pages, one headless Chrome at a time, about five minutes)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runCheck } from './run-check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(ROOT, 'skills', 'taste-skill');
const TMP = fs.mkdtempSync(path.join(process.env.TASTE_SKILL_TMP || os.tmpdir(), 'expressive-'));
const ok = (m) => console.log('ok - ' + m);
const cli = (args, cwd = TMP) => execFileSync(process.execPath, [path.join(SKILL, 'scripts/start.mjs'), ...args], { cwd, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, TASTE_SKILL_RECENT: process.env.TASTE_SKILL_RECENT || 'off' } });
const types = JSON.parse(fs.readFileSync(path.join(SKILL, 'library/type.json'), 'utf8'));
const expressiveIds = new Set(types.filter((t) => t.temper === 'expressive').map((t) => t.id));

// ---------------------------------------------------------------- the type library
assert.equal(expressiveIds.size, 20, 'the core set has twenty expressive faces');
for (const t of types.filter((x) => x.temper === 'expressive')) {
  assert.ok(['pixel', 'arcade', 'rounded', 'slab', 'condensed', 'hand', 'blackletter', 'mono-voice'].includes(t.class), t.id + ' class');
  assert.ok(Number.isInteger(t.display.fixedWeight), t.id + ' has its own weight');
  assert.ok(t.text && t.text.family && t.suits && t.avoid, t.id + ' names its text face, what it suits and what to avoid');
  assert.ok(Object.values(t.kinds).some((n) => n > 0) && !t.kinds.place && !t.kinds.service, t.id + ' is dealt to games and brands only');
  if (t.display.s) assert.ok(t.display.s.includes(t.display.fixedWeight), t.id + ' loads its weight');
  if (t.display.w) assert.ok(t.display.w[0] <= t.display.fixedWeight && t.display.fixedWeight <= t.display.w[1], t.id + ' axis holds its weight');
}
ok('twenty expressive faces with class, own weight, text face, suits and avoid');

// A chapter named in the navigation and a game-world object are distinct from a plain kicker.
const sticker = '<p data-world-tag data-sticker="tag">Dock pass</p><h2>Board the boat</h2>';
const chapter = '<nav class="chapter-nav"><a href="#harbour">PIER</a></nav><section id="harbour"><p class="chapter-head">PIER</p><h2>Board the boat</h2></section>';
for (const [temper,inside,expected] of [
  ['loud',sticker,0], ['quiet',sticker,1], ['lively',sticker,1], ['loud',sticker+sticker,1],
  ['loud','<p>DOCK PASS</p><h2>Board the boat</h2>',1], ['quiet',chapter,0]
]) {
  const f = path.join(TMP,'tag-case.html');
  fs.writeFileSync(f,'<html data-temper="'+temper+'"><body><section>'+inside+'</section></body></html>');
  const result = spawnSync(process.execPath,[path.join(SKILL,'scripts/copy-lint.mjs'),f,'--json'],{encoding:'utf8',windowsHide:true});
  const findings = JSON.parse(result.stdout).files[0].findings.filter(f=>f.id==='copy-eyebrows' && f.sev==='FAIL');
  assert.equal(findings.length,expected,temper+' '+inside);
}
ok('one drawn heading tag on loud pages, with the chapter-navigation exception preserved');

// ---------------------------------------------------------------- the temper and the deal
const plan = (args, seed) => {
  const dir = fs.mkdtempSync(path.join(TMP, 'plan-'));
  const out = cli(['plan', ...args, '--seed', seed, '--no-recent', '--history', path.join(dir, '.taste-skill/history.json')], dir);
  return { out, p: JSON.parse(fs.readFileSync(path.join(dir, '.taste-skill/plan.json'), 'utf8')) };
};
for (const [kind, extra] of [['place', ['--trade', 'cafe']], ['service', []], ['software', []], ['tech', []], ['product', []]]) {
  for (let i = 0; i < 6; i++) {
    const { out, p } = plan(['--page', kind, '--sections', '6', ...extra], kind + '-quiet-' + i);
    assert.equal(p.temper, 'quiet', kind + ' is quiet without words');
    const typeBlock = out.slice(out.indexOf('TYPE for'), out.indexOf('==== PLAN'));
    for (const id of expressiveIds) assert.ok(!new RegExp('^  ' + id + ' ', 'm').test(typeBlock), kind + ' was dealt ' + id);
    assert.ok(!expressiveIds.has(p.type) && !['push', 'bevel', 'ribbon', 'offset'].includes(p.buttons));
    assert.match(out, /^  temper +quiet: /m);
  }
}
ok('a quiet kind is never dealt an expressive face or button family');
for (let i = 0; i < 8; i++) {
  const { out, p } = plan(['--page', 'gaming', '--sections', '5', '--has', 'art', '--brief', 'a cosy pixel art fishing game'], 'pixel-' + i);
  assert.equal(p.temper, 'loud');
  assert.equal(p.heroVariant,'world');
  assert.equal(p.palette,'art');
  assert.match(out,/start\.mjs brand .*--accent/);
  assert.ok(expressiveIds.has(p.type), 'a pixel game is dealt an expressive face first: ' + p.type);
  assert.ok(['push', 'bevel', 'ribbon', 'offset'].includes(p.buttons));
  assert.equal(p.effect, null, 'a loud page takes no WebGL effect');
  const typeBlock = out.slice(out.indexOf('TYPE for'), out.indexOf('==== PLAN'));
  const dealt = [...typeBlock.matchAll(/^  ([a-z0-9-]+) {2,}/gm)].map((m) => m[1]);
  assert.equal(dealt.filter((id) => expressiveIds.has(id)).length, 2, 'two expressive pairings and one plain exit: ' + dealt);
  assert.match(out, /^  temper +loud: "pixel art" in the brief\. Set data-temper="loud"/m);
  assert.match(out, /no source, no move/);
}
ok('a game with "pixel" in its brief is loud and dealt two expressive faces and a plain exit');
for (const [brief, expected] of [
  ['Daily habits on iPhone','lively'], ['A running log for Android','lively'], ['Fitness sessions at home','lively'],
  ['A family food diary','lively'], ['A music collection','lively'], ['Travel notes','lively'],
  ['Games for children','lively'], ['A calendar for hobbies','lively'], ['Draw a small character','lively'],
  ['Personal notebook on iPhone','lively'], ['Running routes for Android','lively'], ['A habit tracker with a mascot','lively'],
  ['Clinical habit tracking','quiet'], ['Financial planning for iPhone','quiet'], ['Legal services on Android','quiet'],
  ['Business travel for teams','quiet'], ['Developer tools with a mascot','quiet'], ['Enterprise Android deployment','quiet'],
  ['Travel approvals for small reporting teams','quiet'], ['Inventory for warehouse staff on Android','quiet'],
  ['Payroll on iPhone','quiet'], ['A banking app with a character','quiet'], ['A B2B music licensing app','quiet'], ['An invoicing app for Android','quiet']
]) {
  const {p} = plan(['--page','software','--trade','saas','--sections','6','--brief',brief], brief);
  assert.equal(p.temper, expected, brief);
}
for (const [kind,brief,expected] of [['software','consumer app for walkers','lively'],['software','sober consumer app for walkers','quiet'],['software','business software for invoices','quiet'],['software','a health app','quiet'],['product','a food brand','lively'],['service','conference event page','lively']]) {
  assert.equal(plan(['--page',kind,'--sections','5','--brief',brief],'default-'+brief.replaceAll(' ','-')).p.temper,expected);
}
assert.equal(plan(['--page', 'gaming', '--sections', '5'], 'g0').p.temper, 'lively');
assert.equal(plan(['--page', 'gaming', '--sections', '5', '--brief', 'a calm, premium pixel puzzle game'], 'g1').p.temper, 'quiet');
assert.equal(plan(['--page', 'gaming', '--sections', '5', '--brief', 'a sober grand strategy game'], 'g2').p.temper, 'quiet');
assert.equal(plan(['--page', 'product', '--sections', '5', '--brief', 'canned sparkling drink'], 'd0').p.temper, 'lively');
assert.equal(plan(['--page', 'software', '--sections', '6', '--brief', 'a habit app with streaks and a mascot'], 's0').p.temper, 'lively');
assert.equal(plan(['--page', 'place', '--trade', 'cafe', '--sections', '6', '--brief', 'a fun cafe'], 'c0').p.temper, 'quiet');
assert.equal(plan(['--page', 'service', '--sections', '6', '--temper', 'lively'], 'v0').p.temper, 'lively');
assert.equal(plan(['--page', 'gaming', '--sections', '5', '--temper', 'quiet', '--brief', 'pixel arcade'], 'g3').p.temper, 'quiet');
ok('the client\'s quiet words win, the kind decides next, --temper overrides');

// the css block of an expressive face: its weight, capitals, grid, class and the kit link
const css = (type, page = 'gaming') => cli(['css', '--page', page, '--palette', 'white-link-blue', '--type', type, '--temper', 'loud', '--history', path.join(TMP, 'h.json')]);
const px = css('pixelify');
assert.match(px, /--display-weight: 600;/); assert.match(px, /--display-grid: 8px;/); assert.match(px, /--display-class: pixel;/);
assert.match(px, /"Pixelify Sans", ui-monospace, monospace/); assert.match(px, /assets\/expressive\/expressive\.css/); assert.match(px, /Pixelify\+Sans:wght@400;600/);
const an = css('anton', 'product');
assert.match(an, /--display-case: uppercase;/); assert.match(an, /--display-tracking: 0\.02em;/); assert.match(an, /--display-class: condensed;/);
const quiet = cli(['css', '--page', 'software', '--palette', 'white-link-blue', '--type', 'geist', '--history', path.join(TMP, 'h.json')]);
assert.ok(!/expressive|--display-class|--display-case/.test(quiet), 'a quiet pairing prints nothing expressive');
ok('an expressive css block carries its weight, grid, capitals, class and the kit link; a quiet one none');

// ---------------------------------------------------------------- the kit's motion
const lint = (file) => { try { return JSON.parse(execFileSync(process.execPath, [path.join(SKILL, 'scripts/motion-lint.mjs'), file, '--json'], { encoding: 'utf8' })); } catch (e) { return JSON.parse(e.stdout); } };
const ids = (r) => r.files.flatMap((f) => (f.findings || []).map((x) => x.id));
assert.deepEqual(ids(lint(path.join(SKILL, 'assets/expressive/expressive.css'))).filter((x) => !/info$/.test(x)), []);
const bg = path.join(TMP, 'bg.css');
fs.writeFileSync(bg, '@keyframes slide { to { background-position: 80px 0 } }\n.strip { animation: slide 1s steps(4) 2 }\n@media (prefers-reduced-motion: reduce) { .strip { animation: none } }\n');
assert.ok(ids(lint(bg)).includes('motion-background'));
fs.writeFileSync(bg, '@keyframes walk { to { background-position: -80px 0 } }\n[data-sprite] { animation: walk 1s steps(4) 2 }\n@media (prefers-reduced-motion: reduce) { [data-sprite] { animation: none } }\n');
assert.ok(!ids(lint(bg)).includes('motion-background'));
ok('the kit lints clean; a background position steps only on [data-sprite]');

// ---------------------------------------------------------------- the checker, both ways
if (process.argv.includes('--no-browser')) { console.log('Passed (browser part skipped). Evidence in ' + TMP); process.exit(0); }
fs.symlinkSync(path.join(SKILL, 'assets'), path.join(TMP, 'assets'), 'junction');
const profile = process.env.TASTE_SKILL_CHROME_PROFILE || path.join(TMP, 'profile');
const art = (w, h, fill) => `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="A drawn harbour"><rect width="${w}" height="${h}" fill="${fill}"/><path d="M0 ${h * 0.7}h${w}v${h * 0.3}H0z" fill="#1f4f6b"/></svg>`;
const words = 'The keeper lights the lamp at dusk and fishes the reef until the tide turns at night.';
function page({ temper, stickers = 2, tilt = 6, paragraphFace = false, h1 = 120, lettering = 2, grounds = 4, crossingOverText = false }) {
  const st = Array.from({ length: stickers }, (_, i) => `<span data-sticker style="${tilt > 8 ? `rotate:${tilt}deg` : `--tilt:${i % 2 ? -tilt : tilt}deg`};position:absolute;top:${40 + i * 90}px;right:${60 + i * 40}px" aria-hidden="true">Night tide</span>`).join('');
  const extra = grounds > 4 ? '<section class="section" id="e" style="background:#ffd23f"><div class="wrap"><h2>Bait and tackle</h2><p>' + words + '</p></div></section>' : '';
  return `<!doctype html><html lang="en" data-type="software" ${temper ? `data-temper="${temper}"` : ''} data-buttons="ribbon" data-edge="pixel">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Driftlight: a fishing game for PC</title>
<meta name="description" content="A fishing game about a lighthouse keeper."><meta name="site-kind" content="gaming"><meta name="page-type" content="software">
<link rel="stylesheet" href="assets/system.css"><link rel="stylesheet" href="assets/layout/layout.css"><link rel="stylesheet" href="assets/expressive/expressive.css">
<style>:root{--p-bg:#eef3f0;--p-surface:#dfe6e2;--p-ink:#1a2026;--p-muted:#555b60;--p-accent:#b8432a;--p-accent-ink:#fff;--p-action:#b8432a;--p-action-ink:#fff;
--p-inv-bg:#1a2026;--p-inv-surface:#262c32;--p-inv-ink:#eef3f0;--p-inv-muted:#a3a8ab;--p-inv-action:#b8432a;--p-inv-action-ink:#fff;
--font-display:"Anton",ui-monospace,monospace;--font-text:system-ui,sans-serif;--display-weight:800;--display-class:pixel;--display-case:uppercase}
.hero h1{font-size:${h1}px;font-weight:800;text-transform:uppercase}#b h2{font-weight:800}
.pf{font-family:var(--font-display)}</style></head>
<body><header class="nav"><div class="wrap nav__bar"><a class="nav__logo" href="#top">Driftlight</a><div class="nav__actions"><a class="btn btn--primary" href="#c">Join the demo list</a></div></div></header>
<main id="top">
<section class="hero"><div class="wrap"><h1 ${lettering >= 1 ? 'data-lettering="shadow"' : ''}>Driftlight</h1><p class="t-lead">A fishing game for PC about a lighthouse keeper, out in 2027.</p>
<div class="btn-row"><a class="btn btn--primary" href="#c">Join the demo list</a></div>${art(800, 300, '#d9785a')}</div></section>
<section class="section ground-surface" id="a" style="position:relative"><div class="wrap" style="position:relative;min-height:420px"><h2>Twelve fish in the first tide</h2><p class="${paragraphFace ? 'pf' : ''}">${words} ${words}</p>${st}</div></section>
<section class="section ground-inverse" id="b"><span data-crossing="top" style="--crossing-x:70%" aria-hidden="true">${art(120, 60, '#8a5a35')}</span>
<div class="wrap"><h2>One night on the island</h2><p>${words}</p>${crossingOverText ? `<span data-crossing="bottom" style="position:relative;display:block;margin-top:-40px;--crossing-w:600px" aria-hidden="true">${art(600, 80, '#8a5a35')}</span><p>${words}</p>` : ''}</div></section>
<section class="section ground-brand" id="d"><div class="wrap"><h2>The keeper's log</h2><p>${words}</p></div></section>${extra}
<section class="section closing" id="c"><div class="wrap"><div class="closing__cta"><h2>The demo opens in May</h2><a class="btn btn--primary" href="#c">Join the demo list</a>${lettering >= 2 ? '<p data-lettering="shadow" aria-hidden="true">Driftlight</p>' : ''}${lettering >= 3 ? '<p data-lettering="outline" aria-hidden="true">Driftlight</p>' : ''}</div></div></section></main>
</body></html>`;
}
const deadline = Date.now() + 9 * 60 * 1000;
async function check(name, opts) {
  const file = path.join(TMP, name + '.html');
  fs.writeFileSync(file, page(opts));
  const r = await runCheck([path.join(SKILL, 'scripts/consistency.mjs'), file, '--quick', '--widths', '1440', '--json', '--no-sweep', '--profile', profile, '--out', path.join(TMP, name)], TMP, Math.max(60000, Math.min(300000, deadline - Date.now())));
  if (r.timedOut || ![0, 1].includes(r.status)) throw new Error(name + ': ' + (r.error || r.stderr));
  const rep = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
  const f = rep.widths.flatMap((w) => w.findings);
  fs.writeFileSync(file + '.json', JSON.stringify(f, null, 1));
  return { has: (check, sev, re = /./) => f.some((x) => x.check === check && (!sev || x.sev === sev) && re.test(x.msg || '')), f };
}
const good = await check('loud-good', { temper: 'loud' });
assert.ok(!good.has('tilt', 'FAIL'), 'two stickers at 6 degrees pass on a loud page');
assert.ok(!good.has('button-shape', 'FAIL'), 'the ribbon family passes on a loud page');
assert.ok(!good.has('display-type', null, /capitals/), 'capitals on an h1 in a capital face pass on a loud page');
assert.ok(!good.has('display-type', null, /weight/), 'the face\'s own heavy weight passes on a loud page');
assert.ok(!good.has('display-type', 'FAIL'), 'an h1 of 120px and two lettering words pass');
assert.ok(!good.has('grounds'), 'four flat grounds pass on a loud page');
assert.ok(!good.has('temper'), 'the edge and the ribbon are no finding on a loud page');
assert.ok(!good.has('reading-face'), 'reading text in the text face passes');
assert.ok(!good.f.some((x) => x.sev === 'FAIL' && /data-crossing|crossing/.test(x.sel || '')), 'a crossing over a ground edge passes');
ok('every permitted move passes on a loud page');
const bad = await check('loud-bad', { temper: 'loud', stickers: 3, paragraphFace: true, h1: 180, lettering: 3, grounds: 5, crossingOverText: true });
assert.ok(bad.has('tilt', 'FAIL', /turned things on one screen/), 'three stickers on one screen fail');
assert.ok(bad.has('reading-face', 'FAIL', /display face/), 'a paragraph in the pixel face fails');
assert.ok(bad.has('display-type', 'FAIL', /160px/), 'an h1 of 180px fails');
assert.ok(bad.has('display-type', 'FAIL', /lettering/), 'three lettering words fail');
assert.ok(bad.has('grounds', 'WARN', /4 at most/), 'five grounds are a finding');
assert.ok(bad.has('overlap-text'), 'a crossing over text is still overlap-text');
ok('each limit broken on a loud page is found');
const tilted = await check('loud-tilt', { temper: 'loud', stickers: 1, tilt: 12 });
assert.ok(tilted.has('tilt', 'FAIL', /8° at most/), 'a sticker turned 12 degrees fails');
ok('a sticker past 8 degrees fails');
const q = await check('quiet', { temper: '' });
assert.ok(q.has('tilt', 'FAIL', /quiet page/), 'a sticker fails on a quiet page');
assert.ok(q.has('button-shape', 'FAIL'), 'the ribbon fails on a quiet page');
assert.ok(q.has('display-type', 'WARN', /capitals/), 'capitals are a finding on a quiet page');
assert.ok(q.has('display-type', 'WARN', /weight/), 'a heavy heading is a finding on a quiet page');
assert.ok(q.has('display-type', 'WARN', /lettering/), 'lettering is a finding on a quiet page');
assert.ok(q.has('grounds', 'WARN', /3 at most/), 'four grounds are a finding on a quiet page');
assert.ok(q.has('temper', 'WARN', /data-edge/), 'an edge on a quiet page is a finding');
ok('on a quiet page every expressive move stays a finding');
console.log('Passed. Evidence in ' + TMP);
