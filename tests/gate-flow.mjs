#!/usr/bin/env node
// The finish gate's own logic, with no Chrome: a copy of scripts/gate.mjs runs in a scratch skill folder whose
// checkers (consistency.mjs, assets/layout/check.mjs, copy-lint.mjs) are stand-ins that print what the test sets, so a
// run takes a second or two. It checks:
//  1. photo-product reads a copy.md Products line with brackets, commas and pattern characters inside (the lines that
//     ended two 2.5.2 builds in "GATE: ERROR (... Unmatched ')')") and the run ends in a verdict, its WARN still found
//     where a heading names a product its photograph does not show;
//  2. a check that throws is a WARN (gate-check) naming it, and the run still reaches its verdict;
//  3. an ERROR counts a round and the run after the fix checks again; at the last round it closes the build, and a
//     hook stop after an ERROR blocks once for that page, then lets the session stop;
//  4. after a PASS a run on the unchanged page is GATE: OFF, a run on a changed page reopens the build for one more
//     round, and the hook does the same but lets the session stop in the end, however often the page changes;
//  5. after --done the hook never reopens the build, a run by hand on a changed page does;
//  6. copy-lint's copy-withheld FAILs a price or an address held back and a note about the build, and passes the
//     lines that only look like them;
//  7. deal-drift after a deal made again;
//  8. a waiver copied whole from the printed FAIL line (its widths, "FAIL <id>") waives that finding;
//  9. perf.mjs's last run (.taste-skill/perf.json): its FAIL is a gate FAIL on the unchanged page, a WARN once the page
//     changed after it.
//   node tests/gate-flow.mjs        (scratch in $TASTE_SKILL_TMP when set, else the OS temp folder)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = path.join(ROOT, 'skills', 'taste-skill', 'scripts');
const TMP = fs.mkdtempSync(path.join(process.env.TASTE_SKILL_TMP || os.tmpdir(), 'gate-flow-'));
let failed = 0;
const check = (ok, msg, extra) => { if (ok) console.log('ok - ' + msg); else { failed++; console.error('not ok - ' + msg + (extra ? '\n    ' + String(extra).split('\n').slice(-6).join('\n    ') : '')); } };

// ---------------------------------------------------------------- the scratch skill: the real gate, stand-in checkers
const SKILL = path.join(TMP, 'skill');
fs.mkdirSync(path.join(SKILL, 'scripts'), { recursive: true });
fs.mkdirSync(path.join(SKILL, 'assets', 'layout'), { recursive: true });
fs.writeFileSync(path.join(SKILL, 'SKILL.md'), '---\nname: design-taste-frontend\n---\n');
let gateSrc = fs.readFileSync(path.join(SCRIPTS, 'gate.mjs'), 'utf8');
const HEAD = 'function productChecks(html, dot) {';
if (!gateSrc.includes(HEAD)) { console.error('not ok - gate.mjs has no "' + HEAD + '"; update this test'); process.exit(1); }
// only in this copy: GATE_TEST_THROW=photo-product makes that check throw, as a fault in the gate would
gateSrc = gateSrc.replace(HEAD, HEAD + "\n  if (process.env.GATE_TEST_THROW === 'photo-product') throw new Error('a stand-in fault');");
const GATE = path.join(SKILL, 'scripts', 'gate.mjs');
fs.writeFileSync(GATE, gateSrc);
const STUB = "import fs from 'node:fs';\nconst s = JSON.parse(fs.readFileSync(process.env.GATE_STUB, 'utf8'));\n";
fs.writeFileSync(path.join(SKILL, 'scripts', 'consistency.mjs'), STUB +
  "if (s.consistency === 'crash') { console.error('Error: a stand-in crash'); process.exit(2); }\n" +
  "const f = s.consistency === 'fail' ? [{ check: 'contrast', sev: 'FAIL', sel: 'section#board h2', text: 'The keyboard', msg: 'a stand-in FAIL', fix: 'a stand-in fix' }] : [];\n" +
  "if (s.consistency === 'pair') for (const sel of ['picture.hero__bg','picture.hero__bg > img']) f.push({check:'container-edges',sev:'FAIL',sel,msg:'split photo',fix:'check the slot'});\n" +
  "console.log(JSON.stringify({ widths: [{ width: 1440, findings: f, frame:s.frame, previewEvidence:s.previewEvidence }, { width: 390, findings: [] }] }));\n");
fs.writeFileSync(path.join(SKILL, 'scripts', 'copy-lint.mjs'), "console.log(JSON.stringify({ files: [{ findings: [] }] }));\n");
fs.writeFileSync(path.join(SKILL, 'assets', 'layout', 'check.mjs'), "console.log('[]');\n");

const PAGE = (h2, alt, extra = '') => `<!doctype html><html lang="en"><head><meta name="page-type" content="product"><title>Test</title></head><body><main>
<section id="hero"><h1>A test page</h1></section>
<section id="board"><h2>${h2}</h2><img src="a.jpg" alt="${alt}"></section>
${extra}</main></body></html>\n`;
let n = 0;
function project(products, h2, alt) {
  const dir = path.join(TMP, 'p' + (++n));
  fs.mkdirSync(path.join(dir, '.taste-skill'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), PAGE(h2, alt));
  fs.writeFileSync(path.join(dir, '.taste-skill', 'copy.md'), `# Copy notes\n\n## Fact sheet\nWhat it is: a test.\nProducts: ${products}\n`);
  fs.writeFileSync(path.join(dir, 'stub.json'), JSON.stringify({ consistency: 'ok' }));
  return dir;
}
const stub = (dir, v) => fs.writeFileSync(path.join(dir, 'stub.json'), JSON.stringify({ consistency: v }));
const touch = (dir, i) => fs.appendFileSync(path.join(dir, 'index.html'), `<!-- edit ${i} -->\n`);
function gate(dir, args, { hook = null, session = 's1', env = {} } = {}) {
  const r = spawnSync(process.execPath, [GATE, ...(hook ? ['--hook', hook] : []), ...args], {
    cwd: dir, encoding: 'utf8', timeout: 120000, input: hook ? JSON.stringify({ cwd: dir, session_id: session }) : '',
    env: { ...process.env, GATE_STUB: path.join(dir, 'stub.json'), TASTE_SKILL_TMP: TMP, TASTE_SKILL_GATE_HANDOFF: '', ...env },
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const last = (r.stdout || '').trim().split('\n').pop() || '';
  let decision = null; if (hook) { try { decision = JSON.parse(r.stdout || 'null'); } catch { decision = null; } }
  return { code: r.status, out, last, decision };
}
const state = dir => JSON.parse(fs.readFileSync(path.join(dir, '.taste-skill', 'gate.json'), 'utf8'));
const has = (dir, f) => fs.existsSync(path.join(dir, '.taste-skill', f));

// A still plan can be built without entrance attributes or motion assets.
{
  const dir = project('none','Frame sizes','Frame');
  fs.writeFileSync(path.join(dir,'.taste-skill','plan.json'),JSON.stringify({entrance:'still',reveals:'none',moments:[],scene:null}));
  fs.writeFileSync(path.join(dir,'stub.json'),JSON.stringify({frame:{entrance:null}}));
  gate(dir,['--start','index.html']);
  const result = gate(dir,[]);
  check(result.last === 'GATE: PASS', 'a still page passes the gate without an entrance, reveal or moment',result.out);
}

// ---------------------------------------------------------------- 1. Products lines that crashed the gate
const LINES = [
  ['the keyboard (one model, three colours)', 'The keyboard in three colours', 'a desk lamp', 'keyboard'],
  ['check-up and cleaning; fillings; crowns and bridges; whitening (general practice services; the client to confirm the list)', 'Fillings', 'a dental chair', 'filling'],
  ['C++ (beta [new]; nested (deep (er))), widgets*, a+b?, (unclosed; ) stray ], {x}, e-bike, pour-over, constructor', 'Our e-bike', 'a lamp', 'e-bike'],
  ['none (software).', 'Anything', 'a lamp', null],
];
for (const [line, h2, alt, noun] of LINES) {
  const dir = project(line, h2, alt);
  gate(dir, ['--start', 'index.html']);
  const r = gate(dir, []);
  check(r.last === 'GATE: PASS', `Products "${line.slice(0, 50)}": the run ends in a verdict (${r.last})`, r.out);
  const warns = (state(dir).found || {}).warns || [];
  if (noun) check(warns.some(w => w.check === 'photo-product' && w.msg.includes(noun)), `  and photo-product still WARNs the ${noun} its photograph does not show`, JSON.stringify(warns));
  check(!warns.some(w => w.check === 'gate-check'), '  and no check threw', JSON.stringify(warns));
}

// ---------------------------------------------------------------- 2. a check that throws is a WARN, not the end of the run
{
  const dir = project('the keyboard', 'The keyboard', 'a lamp');
  gate(dir, ['--start', 'index.html']);
  const r = gate(dir, [], { env: { GATE_TEST_THROW: 'photo-product' } });
  const warns = (state(dir).found || {}).warns || [];
  check(r.last === 'GATE: PASS', `a throwing photo-product check: the run still ends in a verdict (${r.last})`, r.out);
  check(warns.some(w => w.check === 'gate-check' && /photo-product/.test(w.where) && /stand-in fault/.test(w.msg)), '  and it is a WARN naming the check', JSON.stringify(warns));
}

// ---------------------------------------------------------------- 3. ERROR: fix it and run again; rounds count
{
  const dir = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(dir, ['--start', 'index.html']);
  stub(dir, 'crash');
  let r = gate(dir, []);
  check(r.code === 2 && /^GATE: ERROR \(consistency\.mjs gave no report/.test(r.last), `a crashed checker is ERROR (${r.last})`, r.out);
  check(/run the gate again \(round 1 of 3\)/.test(r.out) && !/Do not rerun/i.test(r.out), '  and it says to fix it and run again, round 1 of 3', r.out);
  check(state(dir).round === 1, `  and the run counted round 1 (${state(dir).round})`);
  // a hook stop on the unchanged page: one retry, one block, then the session may stop
  r = gate(dir, [], { hook: 'claude' });
  check(r.decision && r.decision.decision === 'block' && /Fix what that names/.test(r.decision.reason), 'a hook stop after the ERROR blocks once with what to fix', r.out);
  r = gate(dir, [], { hook: 'claude' });
  check(r.code === 0 && !r.decision, 'the next hook stop on the unchanged page is allowed', r.out);
  stub(dir, 'ok'); touch(dir, 1);
  r = gate(dir, []);
  check(r.last === 'GATE: PASS', `after the fix the run checks the page again (${r.last})`, r.out);

  // at the last round an ERROR closes the build; a changed page then gets one more round
  const d2 = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(d2, ['--start', 'index.html', '--rounds', '1']);
  stub(d2, 'crash');
  r = gate(d2, []);
  check(r.code === 2 && /rounds used up\)$/.test(r.last) && has(d2, 'build.done.json') && !has(d2, 'build.json'), `an ERROR at the last round closes the build (${r.last})`, r.out);
  stub(d2, 'ok'); touch(d2, 1);
  r = gate(d2, []);
  check(r.last === 'GATE: PASS' && /checks it again, round 2 of 2/.test(r.out), `  a changed page after it is checked again, one more round (${r.last})`, r.out);
}

// ---------------------------------------------------------------- 4. after a PASS: OFF while unchanged, one more round when changed
{
  const dir = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(dir, ['--start', 'index.html']);
  let r = gate(dir, []);
  check(r.last === 'GATE: PASS' && has(dir, 'build.done.json'), `the build passes and closes (${r.last})`, r.out);
  r = gate(dir, []);
  check(r.code === 0 && /^GATE: OFF \(the build closed and the page has not changed since\)/.test(r.last), `a run on the unchanged page is OFF (${r.last})`, r.out);
  r = gate(dir, [], { hook: 'claude' });
  check(r.code === 0 && !r.decision, 'a hook stop on the unchanged page is allowed', r.out);
  touch(dir, 1); stub(dir, 'fail');
  r = gate(dir, []);
  check(/^GATE: OPEN 1 \(rounds used up\)/.test(r.last) && /checks it again, round 1 of 1/.test(r.out), `a changed page reopens the build for one more round (${r.last})`, r.out);
  check(has(dir, 'build.done.json') && !has(dir, 'build.json'), '  and that round closes it again');
  r = gate(dir, []);
  check(/^GATE: OFF/.test(r.last), `  then the unchanged page is OFF again (${r.last})`, r.out);
  // the hook: a page changed after the close blocks once (one more round), then lets the session stop
  touch(dir, 2);
  r = gate(dir, [], { hook: 'claude' });
  check(r.decision && r.decision.decision === 'block' && /rounds used up/.test(r.decision.reason), 'a hook stop on a page changed after the close checks it and blocks once', r.out);
  r = gate(dir, [], { hook: 'claude' });
  check(r.code === 0 && !r.decision, '  the next hook stop on it is allowed', r.out);
  // an agent that edits after every block is still let go: the block cap stays the build's first one
  let blocks = 0, lastAllowed = false;
  for (let i = 3; i < 15; i++) { touch(dir, i); r = gate(dir, [], { hook: 'claude' }); if (r.decision) blocks++; lastAllowed = !r.decision; }
  check(lastAllowed && blocks <= 7, `twelve more edit-and-stop cycles: ${blocks} blocks, then every stop allowed`);
  r = gate(dir, [], { hook: 'claude', session: 's-other' });
  check(r.code === 0 && !r.decision, 'another session is never held by it', r.out);
}

// ---------------------------------------------------------------- 5. after --done: the hook never reopens, a run by hand does
{
  const dir = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(dir, ['--start', 'index.html']); stub(dir, 'fail');
  gate(dir, []);
  let r = gate(dir, ['--done', 'the user said ship it as it is']);
  check(/^GATE: DONE/.test(r.last), `--done closes the build (${r.last})`, r.out);
  touch(dir, 1);
  r = gate(dir, [], { hook: 'claude' });
  check(r.code === 0 && !r.decision && has(dir, 'build.done.json'), 'after --done a hook stop on a changed page is allowed, the build stays closed', r.out);
  r = gate(dir, ['--quick']);
  check(/^GATE: OFF/.test(r.last), `--quick never reopens a closed build (${r.last})`, r.out);
  stub(dir, 'ok');
  r = gate(dir, []);
  check(r.last === 'GATE: PASS' && /user's word/.test(r.out), `a run by hand on the changed page checks it again (${r.last})`, r.out);
}

// ---------------------------------------------------------------- 6. copy-lint: a fact held back
{
  const dir = path.join(TMP, 'copy');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, 'index.html');
  const body = (lines) => `<!doctype html><html lang="en"><head><title>Test</title></head><body><main><section><h1>A test</h1>${lines.map(l => `<p>${l}</p>`).join('')}</section></main></body></html>`;
  const withheld = file => {
    const r = spawnSync(process.execPath, [path.join(SCRIPTS, 'copy-lint.mjs'), file, '--json'], { encoding: 'utf8' });
    return JSON.parse(r.stdout).files[0].findings.filter(x => x.id === 'copy-withheld');
  };
  fs.writeFileSync(f, body(['Check-up and cleaning. Price on request.', 'Zurich. The street address comes with your confirmation email.', 'Street and district are on the way in.', 'Hours are confirmed with the shop.', 'We reply by email with the price.']));
  let w = withheld(f);
  check(w.length === 3 && w.every(x => x.sev === 'FAIL') && w.reduce((a, x) => a + x.count, 0) === 5, `copy-withheld FAILs a price, an address and a note held back (${w.map(x => x.count).join('+')} hits)`, JSON.stringify(w.map(x => x.hits)));
  check(w.some(x => /data-assumed/.test(x.fix)) && w.some(x => /See the area/.test(x.fix)), '  and its fix says what to write instead (data-assumed, "See the area")');
  fs.writeFileSync(f, body(['Vegan on request.', 'The cafe is on the way to the beach.', 'Rooms from 118 € a night. We write back by email with the price for your dates.', 'Gluten-free bread on request at the same price.']));
  w = withheld(f);
  check(w.length === 0, 'the lines that only look like it pass', JSON.stringify(w.map(x => x.hits)));
}

// ---------------------------------------------------------------- 7. deal-drift after a deal made again
// (2.5.3: a builder dealt again to swap one moment, took one of the three the new pick dealt, and the gate asked for
// the other two until its rounds ran out). The deal that counts is the one the plan comment's moments match; a moment
// of it the page lacks is not asked for while a moment dealt after it stands in; a moment silently left out still FAILs.
{
  fs.copyFileSync(path.join(SCRIPTS, 'moments.mjs'), path.join(SKILL, 'scripts', 'moments.mjs'));
  for (const id of ['iris-opens', 'word-highlight', 'word-rotate', 'photo-chapters', 'closing-lift', 'lines-rise']) fs.mkdirSync(path.join(SKILL, 'assets', 'moments', id), { recursive: true });
  const at = s => new Date(Date.now() + s * 1000).toISOString();
  const A = at(5), B = at(60), R = at(90);
  const deal = (ids, t, seed) => ids.map(id => ({ id, at: t, seed }));
  const site = (built, plan, moments) => {
    const dir = path.join(TMP, 'deal' + (++n));
    fs.mkdirSync(path.join(dir, '.taste-skill'), { recursive: true });
    const secs = built.map((id, i) => `<section id="s${i}" data-moment="${id}"><h2>Part ${i}</h2><p>Words.</p></section>`).join('\n');
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta name="page-type" content="product"><title>Test</title></head>
<body>
<!-- type: product
     plan (start.mjs plan): palette sand, type geist, hero photo,
${plan}
     copy: .taste-skill/copy.md written and linted before this page -->
<main><section id="hero"><h1>A test page</h1></section>
${secs}
</main></body></html>\n`);
    fs.writeFileSync(path.join(dir, '.taste-skill', 'copy.md'), '# Copy notes\n\n## Fact sheet\nWhat it is: a test.\nProducts: none\n');
    fs.writeFileSync(path.join(dir, 'stub.json'), JSON.stringify({ consistency: 'ok' }));
    gate(dir, ['--start', 'index.html']);
    fs.writeFileSync(path.join(dir, '.taste-skill', 'history.json'), JSON.stringify({ moments }, null, 1));
    const r = gate(dir, []);
    return { r, dd: ((state(dir).found || {}).fails || []).filter(f => f.check === 'deal-drift') };
  };
  const twoDeals = [...deal(['iris-opens', 'word-highlight', 'word-rotate'], A, 'aaa'), ...deal(['photo-chapters', 'closing-lift', 'lines-rise'], B, 'bbb')];
  const built3 = ['photo-chapters', 'word-highlight', 'word-rotate'];
  const said = '     moments: photo-chapters on the valley (screens 3 to 6, re-dealt for iris-opens, whose ring moved and\n     caused a layout shift), word-highlight on the statement,\n     word-rotate in the seasons statement · scene: none · effect: none';
  let t = site(built3, said, twoDeals);
  check(t.r.last === 'GATE: PASS' && !t.dd.length, `a re-deal the plan names (photo-chapters for iris-opens): no deal-drift (${t.r.last})`, JSON.stringify(t.dd));
  t = site(built3, '     bands: flat · scene: none', twoDeals);
  check(t.dd.length === 2 && t.dd.every(f => /closing-lift|lines-rise/.test(f.where) && /history\.json line \d+/.test(f.msg) && /index\.html line \d+/.test(f.msg)), `the same page with no moments in its plan: the latest deal counts, its FAILs name the history.json and index.html lines (${t.dd.map(f => f.where).join(', ')})`, JSON.stringify(t.dd));
  t = site(['iris-opens', 'word-highlight'], '     moments: iris-opens on the process, word-highlight on the statement', deal(['iris-opens', 'word-highlight', 'word-rotate'], A, 'aaa'));
  check(t.dd.length === 1 && t.dd[0].where === 'moment word-rotate', `a dealt moment left out silently still FAILs (${t.dd.map(f => f.where).join(', ')})`, JSON.stringify(t.dd));
  t = site(built3, '     bands: flat', [...deal(['iris-opens', 'word-highlight', 'word-rotate'], A, 'aaa'), ...deal(['photo-chapters'], R, 'ccc')]);
  check(t.r.last === 'GATE: PASS' && !t.dd.length, `one slot dealt again (pick --count 1): its moment stands in for the one it replaced (${t.r.last})`, JSON.stringify(t.dd));
  t = site(built3, '     moments: iris-opens, word-highlight, word-rotate', [...deal(['iris-opens', 'word-highlight', 'word-rotate'], A, 'aaa'), ...deal(['photo-chapters'], R, 'ccc')]);
  check(t.dd.length === 1 && t.dd[0].where === 'moment iris-opens' && /plan's moments part \(index\.html line \d+\)/.test(t.dd[0].msg), `a moment the plan names and the page lacks FAILs, naming the plan's line (${t.dd.map(f => f.where).join(', ')})`, JSON.stringify(t.dd));
}

// ---------------------------------------------------------------- 8. a waiver copied whole from the FAIL line
// (2.5.3: a target ending in the printed widths, " [390]", matched no open finding)
for (const whole of [false, true]) {
  const dir = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(dir, ['--start', 'index.html']);
  stub(dir, 'fail');
  let r = gate(dir, []);
  const line = (r.out.split('\n').find(l => /^\s+FAIL contrast/.test(l)) || '').trim();
  if (!whole) check(/\[1440\]$/.test(line), `the FAIL line ends in its widths (${line})`, r.out);
  fs.writeFileSync(path.join(dir, '.taste-skill', 'waivers.json'), JSON.stringify([{ check: 'contrast', target: whole ? line : line.replace(/^FAIL contrast\s+/, ''), reason: 'a stand-in reason, long enough' }]));
  r = gate(dir, []);
  check(r.last === 'GATE: PASS' && /WAIVED contrast/.test(r.out) && !/waiver ignored/.test(r.out), `${whole ? 'the whole line, "FAIL contrast" and all,' : 'a target ending in the widths "  [1440]"'} waives it (${r.last})`, r.out);
}

{
  const dir = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(dir, ['--start', 'index.html']);
  stub(dir, 'pair');
  fs.writeFileSync(path.join(dir, '.taste-skill', 'waivers.json'), JSON.stringify([
    {check:'container-edges', target:'picture.hero__bg', reason:'Picture occupies the assigned seven columns.'},
    {check:'contrast', target:'missing', reason:'Testing a stale target.'}
  ]));
  const r = gate(dir, []);
  check(r.last === 'GATE: PASS' && (r.out.match(/WAIVED container-edges/g) || []).length === 2, 'one target waives the frame and its image', r.out);
  check(/waiver ignored.*matches no open finding.*Entry format: \{"check":/.test(r.out), 'a stale waiver prints its reason and entry format on one line', r.out);
}

// ---------------------------------------------------------------- 9. perf.mjs's last run reaches the gate
// (2.5.3: perf.mjs FAILed a layout shift and the gate said PASS): a FAIL of a run made after the page last changed is a
// FAIL; a run older than a change is a WARN to run it again; a PASSing run adds nothing
{
  const dir = project('the keyboard', 'The keyboard', 'a keyboard');
  gate(dir, ['--start', 'index.html']);
  const perf = (fails, at) => fs.writeFileSync(path.join(dir, '.taste-skill', 'perf.json'), JSON.stringify({ page: path.join(dir, 'index.html'), at, widths: [1440, 390], partial: false, fails, warns: 0 }));
  const cls = [{ w: 390, name: 'layout shift (CLS)', value: '0.569', note: 'shift at 765: mo-io__ring' }];
  perf(cls, Date.now() + 5000);
  let r = gate(dir, []);
  const pf = ((state(dir).found || {}).fails || []).filter(f => f.check === 'perf');
  check(/^GATE: FAIL/.test(r.last) && pf.length === 1 && /0\.569/.test(pf[0].msg) && /FAIL perf/.test(r.out), `a perf FAIL on the unchanged page is a gate FAIL (${r.last})`, r.out);
  perf(cls, Date.now() - 60000); touch(dir, 1);
  r = gate(dir, []);
  const pw = ((state(dir).found || {}).warns || []).filter(w => w.check === 'perf');
  check(r.last === 'GATE: PASS' && pw.length === 1 && /run perf\.mjs on the page again/.test(pw[0].fix), `a perf FAIL older than the page's last change is a WARN to run it again (${r.last})`, r.out);
  perf([], Date.now() + 5000); touch(dir, 2);
  r = gate(dir, []);
  check(r.last === 'GATE: PASS' && !((state(dir).found || {}).warns || []).some(w => w.check === 'perf'), `a passing perf run adds nothing (${r.last})`, r.out);
}

// ---------------------------------------------------------------- 10. a play control with no film behind it
// (2.5.3: a trailer poster's play disc opened a store search); a link to the trailer's own page passes
{
  const trailer = href => `<section id="trailer"><h2>The trailer</h2><figure class="frame"><video class="frame__img" playsinline preload="none" poster="p.jpg"></video><a class="ly-play" href="${href}" aria-label="Watch the trailer"><span class="ly-play__disc"></span></a></figure></section>`;
  for (const [href, dead] of [['https://store.steampowered.com/search/?term=Saltmarsh', true], ['#', true], ['https://store.steampowered.com/app/123450/Saltmarsh/', false]]) {
    const dir = project('the game', 'The game', 'a boat');
    fs.writeFileSync(path.join(dir, 'index.html'), PAGE('The game', 'a boat', trailer(href)));
    gate(dir, ['--start', 'index.html']);
    const r = gate(dir, []);
    const pd = ((state(dir).found || {}).fails || []).filter(f => f.check === 'play-dead');
    check(dead ? pd.length === 1 : !pd.length, `a play control to ${href}: ${dead ? 'play-dead FAILs' : 'no play-dead'} (${r.last})`, r.out);
  }
}

// ---------------------------------------------------------------- 11. a dealt composition the page lacks FAILs; a form
// built as close__form in a section of its own is the dealt close-form (2.5.3: "the page has none" beside its form)
{
  const site = (body, layout) => {
    const dir = project('none', 'A part', 'a lamp');
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta name="page-type" content="service"><title>Test</title></head><body><main><section id="hero"><h1>A test page</h1></section>${body}</main></body></html>\n`);
    gate(dir, ['--start', 'index.html']);
    fs.writeFileSync(path.join(dir, '.taste-skill', 'history.json'), JSON.stringify({ layout }));
    gate(dir, []);
    const s = state(dir).found || {};
    return [...(s.fails || []), ...(s.warns || [])].filter(f => f.check === 'deal-drift');
  };
  let dd = site('<section id="intro-call"><h2>Book a call</h2><form class="form close__form"><input name="email"></form></section>', { 'service:close': ['close-form'], 'service:form': ['close-form'] });
  check(!dd.length, `close-form dealt, the form built as close__form in its own section: no deal-drift (${dd.map(f => f.where).join(', ')})`, JSON.stringify(dd));
  dd = site('<section id="work"><h2>Work</h2><p>Words.</p></section><footer><div class="closing__cta close--type"></div></footer>', { 'service:close': ['close-type'], 'service:showcase': ['bleed-panel'] });
  const comp = ((dd.find(f => /bleed-panel/.test(f.where))) || {});
  check(comp.where === 'composition showcase bleed-panel' && /comp-bleed/.test(comp.fix || ''), `a dealt bleed-panel the page lacks is a deal-drift finding (${comp.where})`, JSON.stringify(dd));
}

// Machine plans take precedence over stale composition and moment history.
{
  const dir = project('none','Capacity','workshop');
  const dot = path.join(dir,'.taste-skill'), id = 'word-highlight';
  const section = '<section data-own="capacity"><h2 data-moment="word-highlight">Capacity this week</h2></section>';
  fs.writeFileSync(path.join(dir,'index.html'),PAGE('The workshop','bench',section));
  fs.writeFileSync(path.join(dot,'history.json'),JSON.stringify({moments:[{id:'closing-lift',seed:1},{id:'lines-rise',seed:1}],layout:{'product:close':['close-type'],'product:showcase':['bleed-panel']}}));
  fs.writeFileSync(path.join(dot,'plan.json'),JSON.stringify({version:'2.5.4',moments:[id],compositions:{showcase:'bleed-panel'},grounds:{},ideas:['rail'],own:1,sub:['illustrate']}));
  gate(dir,['--start','index.html']);
  let r = gate(dir,[]);
  check(r.last === 'GATE: PASS','one moment and a composed section satisfy a whole machine plan',r.out);
  fs.writeFileSync(path.join(dot,'plan.json'),JSON.stringify({version:'2.5.4',moments:['word-rotate']}));
  r = gate(dir,[]);
  check(((state(dir).found || {}).fails || []).some(f => f.check === 'deal-drift' && f.where === 'moment word-rotate'),'changing only the machine plan catches its missing moment',r.out);
}
// Archived IDs from a saved machine plan do not become requirements after updating the kit.
{
  for (const deck of ['moments','scenes']) {
    const dest = path.join(SKILL,'assets',deck);
    fs.mkdirSync(dest,{recursive:true});
    fs.copyFileSync(path.join(SCRIPTS,'../assets',deck,'index.json'),path.join(dest,'index.json'));
  }
  const dir = project('none','Availability','workshop');
  fs.writeFileSync(path.join(dir,'.taste-skill','plan.json'),JSON.stringify({version:'2.5.4',moments:['iris-opens'],scene:'letter-physics'}));
  gate(dir,['--start','index.html']);
  const r = gate(dir,[]);
  check(r.last === 'GATE: PASS','retired moments and scenes never become a gate requirement',r.out);
}
// A typography or palette change still blocks even when all suggested sections differ.
{
  fs.mkdirSync(path.join(SKILL,'library'),{recursive:true});
  for (const name of ['palettes','type','stories']) fs.copyFileSync(path.join(SCRIPTS,'../library',name+'.json'),path.join(SKILL,'library',name+'.json'));
  const dir=project('none','Opening hours','room'), dot=path.join(dir,'.taste-skill');
  const palette=JSON.parse(fs.readFileSync(path.join(SKILL,'library/palettes.json'),'utf8')).find(p=>p.id==='white-link-blue');
  const frame={nav:'nav-mega',close:'close-form',footer:'footer-visit',mark:'petal',hero:'split',entrance:'rise',buttons:'solid',density:'compact',bg:'#fff',ink:'#111111',accent:palette.accent,display:'Geist',text:'Geist'};
  fs.writeFileSync(path.join(dir,'stub.json'),JSON.stringify({frame}));
  const plan={version:'2.5.4',nav:frame.nav,footer:frame.footer,close:frame.close,hero:frame.hero,entrance:frame.entrance,mark:frame.mark,buttons:frame.buttons,palette:'white-link-blue',type:'geist',density:'regular',moments:[]};
  fs.writeFileSync(path.join(dot,'plan.json'),JSON.stringify(plan));
  gate(dir,['--start','index.html']); gate(dir,[]);
  const good=state(dir).found;
  check(!good.fails.length && good.warns.some(w=>w.check==='deal-drift' && w.where==='density regular'),'matching frame passes and a different density only warns',JSON.stringify(good));
  fs.writeFileSync(path.join(dir,'stub.json'),JSON.stringify({frame:{...frame,bg:'#ffffff',accent:'#abcdef',display:'Arial',mark:'wrong',nav:'nav-centre',close:'close-word',footer:'footer-dark',hero:'word',entrance:'still',buttons:'outline'}}));
  touch(dir,3); gate(dir,[]);
  const bad=state(dir).found.fails.filter(x=>x.check==='deal-drift').map(x=>x.where.split(' ')[0]);
  check(['palette','type','mark','nav','close','footer','hero','entrance','buttons'].every(f=>bad.includes(f)),'each changed frame field remains a blocking drift',JSON.stringify(bad));
}
// Use the real copy checker with the stand-in browser. The gate must print
// all four states, preserve them between runs and check a newly supplied file.
{
  for (const script of ['copy-lint.mjs','ask-outcome.mjs','place-address.mjs','heading-copy.mjs','story-check.mjs']) {
    fs.copyFileSync(path.join(SCRIPTS,script),path.join(SKILL,'scripts',script));
  }
  const dir = project('none','Press desk','a desk');
  fs.writeFileSync(path.join(dir,'.taste-skill','copy.md'),
    'Asks:\n- Watch the film -> #clip : play\n- Get the kit -> #kit : file\n- Read the fees -> #fees : show\n- Store listing -> #listing : go\n- Join the newsletter -> #news : send\n\n## Client must supply\n- #listing store address\n- #news receiving address\n');
  const controls = '<section id="clip"><button class="ly-play">Play film</button></section>'+
    '<a id="kit" href="kit.txt">Download the kit</a><p id="fees">A day costs €15.</p>'+
    '<a id="listing" data-needs="store address" href="https://studio.example/">Visit store</a><form id="news" action="mailto:list@studio.example"><input name="email"><button>Join the newsletter</button><p>Opens your email with the request filled in.</p></form>'+
    '<section><button class="ly-play">Play another film</button></section>';
  fs.writeFileSync(path.join(dir,'index.html'),PAGE('Press desk','a desk',controls));
  gate(dir,['--start','index.html']);
  fs.writeFileSync(path.join(dir,'stub.json'), JSON.stringify({previewEvidence:{news:false}}));
  let run = gate(dir,[]);
  let found = state(dir).found;
  check(found.asks?.map(a=>a.state).join('/')==='pretends/pretends/works/needs-address/preview' &&
    found.asks.every(a=>run.out.includes(a.line)), 'gate prints every ask after its findings',run.out);
  check(found.fails.filter(f=>f.check==='play-dead').length===1 && found.fails.filter(f=>f.check==='ask-outcome').length===2,
    'one mapped play failure, with the independent unmapped dead control still reported',run.out);
  check(found.warns.some(f=>f.check==='preview-handoff'), 'mapped preview without adjacent body text is reported',run.out);
  const oldRun = path.join(dir,'.taste-skill',state(dir).latestRun);
  const oldBytes = fs.readFileSync(oldRun,'utf8');
  const snapshot = JSON.parse(oldBytes);
  check(snapshot.fingerprint && snapshot.fails.length===found.fails.length && snapshot.warns.length===found.warns.length && Array.isArray(snapshot.waivers),'immutable run keeps fingerprint, findings and waivers',oldRun);
  fs.writeFileSync(path.join(dir,'kit.txt'),'Studio press contact');
  fs.writeFileSync(path.join(dir,'stub.json'), JSON.stringify({previewEvidence:{news:true}}));
  run = gate(dir,[]);
  found = state(dir).found;
  check(!found.warns.some(f=>f.check==='preview-handoff'), 'mapped preview with an adjacent handoff passes',run.out);
  check(path.join(dir,'.taste-skill',state(dir).latestRun)!==oldRun && fs.readFileSync(oldRun,'utf8')===oldBytes,'the latest pointer advances and the earlier findings are byte-identical',oldRun);
  check(found.asks?.find(a=>a.id==='kit')?.state==='works','adding the missing download refreshes the cached gate result',run.out);
}
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* a profile still held: left in the temp folder */ }
if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log('\nall gate flow checks passed');
