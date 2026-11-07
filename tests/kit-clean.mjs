#!/usr/bin/env node
// The kit must pass its own checks. scripts/gate.mjs will not let a build end while consistency.mjs reports a FAIL or
// assets/layout/check.mjs reports any finding, so every page the kit ships as a model (the hero demos, the starter and
// the moments in a page) is checked the way the gate checks a builder's page: node
// skills/taste-skill/scripts/consistency.mjs --quick --widths 1440,390 --json, then node
// skills/taste-skill/assets/layout/check.mjs --sizes 1440x900,390x844 --json, one page at a time, each in its own
// headless Chrome (each script starts it with its own profile and stops it by its PID). It prints the FAIL ids of each
// page (a layout finding as "layout <rule>") and exits 1 when any page has one, 2 when a page could not be checked.
//
//   node tests/kit-clean.mjs [--profile <dir>] [--out <dir>] [--only <part of a path>] [--save <file.json>] [--check <file>]
//                            [--demos] [--no-layout]
//
// --demos adds every moment's own demo page (one moment alone on a stand-in page, not a page model). --no-layout runs
// consistency.mjs alone.
//
// --profile is the folder the checker's Chrome profiles go under (removed after each page), --out where the reports
// and crops go (never beside the kit's files), --only runs the pages whose path holds that text, --save writes the
// table as JSON, --check runs another copy of consistency.mjs (a before-and-after comparison). A page takes one to three
// minutes on the CPU.
//
// The starter is a template: a builder copies it beside the kit's assets folder, so it is checked from a scratch folder
// under --out holding a copy of it as index.html and a link to assets/ (nothing is written into the kit). Its bracketed
// stand-ins ("[Name]", "#[section id]", "[photo]") are the template's own: a FAIL of the checks that read words, links
// and files (placeholder, links, assets, empty-visual, lang) whose message or element names one, and a copy-* FAIL (its
// copy is all stand-ins), is listed under "template stand-ins" and does not fail the run; every other FAIL of the
// starter (its layout, its sections, its motion) does.
//
// A page that runs past 20 minutes is stopped with its whole process tree (the checker and the Chrome it started), so no
// Chrome is left behind; the page is listed as not checked.
import { readdirSync, existsSync, mkdirSync, rmSync, rmdirSync, lstatSync, writeFileSync, statSync, copyFileSync, symlinkSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(ROOT, 'skills', 'taste-skill');
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i < 0 ? d : argv[i + 1]; };
const CHECK = opt('check', join(SKILL, 'scripts', 'consistency.mjs'));
const PROFILE = opt('profile', join(tmpdir(), 'taste-skill-kit-clean-chrome'));
const OUT = opt('out', join(tmpdir(), 'taste-skill-kit-clean'));
const ONLY = opt('only', '');
const SAVE = opt('save', '');
const LAYOUT = argv.includes('--no-layout') ? '' : join(SKILL, 'assets', 'layout', 'check.mjs');

// the pages: every hero demo, the starter, and the moments mounted in a page (assets/moments/_demo/in-page*.html: the
// model a builder copies a moment's section from). Each moment's own demo.html shows it alone on a stand-in page
// (_demo/demo.css: a plain nav, .container, no layout v4 screens); --demos checks those too, and their FAILs count
const DEMOS = argv.includes('--demos');
const pages = [];
const layout = join(SKILL, 'assets', 'layout');
for (const f of readdirSync(layout).sort()) if (/^hero-.+\.html$/.test(f)) pages.push(join(layout, f));
pages.push(join(SKILL, 'assets', 'starter.html'));
const moments = join(SKILL, 'assets', 'moments');
for (const f of readdirSync(join(moments, '_demo')).sort()) if (/^in-page.*\.html$/.test(f)) pages.push(join(moments, '_demo', f));
if (DEMOS) for (const d of readdirSync(moments).sort()) {
  const dir = join(moments, d);
  if (d.startsWith('_') || !statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).sort()) if (/^demo.*\.html$/.test(f)) pages.push(join(dir, f));
}
const todo = pages.filter((p) => !ONLY || relative(SKILL, p).replace(/\\/g, '/').includes(ONLY));
if (!todo.length) { console.error(`kit-clean: no page matches --only ${ONLY}`); process.exit(2); }

// the starter's scratch folder goes: its assets link first, alone (a non-recursive rmdir removes a junction and never
// what it points at), then the folder; a link that will not go stops the run before anything is deleted through it
const dropSite = (site) => {
  const link = join(site, 'assets');
  if (existsSync(link) || (() => { try { lstatSync(link); return true; } catch { return false; } })()) {
    try { rmdirSync(link); } catch {}
    try { lstatSync(link); throw new Error(`kit-clean: could not remove the link ${link}; remove it by hand`); } catch (e) { if (e.message.startsWith('kit-clean')) throw e; }
  }
  rmSync(site, { recursive: true, force: true });
};

// the checker, stopped with its process tree when it runs past the time (spawnSync's timeout would end node alone on
// Windows, leaving its Chrome running)
const LIMIT = 20 * 60 * 1000;
const runCheck = (args) => new Promise((res) => {
  const p = spawn(process.execPath, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '', timedOut = false, error = null;
  p.stdout.setEncoding('utf8').on('data', (d) => { stdout += d; });
  p.stderr.setEncoding('utf8').on('data', (d) => { stderr += d; });
  const t = setTimeout(() => {
    timedOut = true;
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(p.pid), '/T', '/F'], { stdio: 'ignore' });
    else { try { p.kill('SIGTERM'); } catch {} setTimeout(() => { try { p.kill('SIGKILL'); } catch {} }, 10000).unref(); }
  }, LIMIT);
  p.on('error', (e) => { error = e; });
  p.on('close', (code) => { clearTimeout(t); res({ status: code, stdout, stderr, timedOut, error: error || (timedOut ? new Error(`stopped after ${LIMIT / 60000} minutes`) : null) }); });
});
// the checks a template stand-in can trip (its words, links and files), and the copy checks
const HELD = new Set(['placeholder', 'links', 'assets', 'empty-visual', 'lang']);

const rows = [];
for (const [i, page] of todo.entries()) {
  const name = relative(SKILL, page).replace(/\\/g, '/');
  const slug = name.replace(/^assets\//, '').replace(/[\\/]/g, '-').replace(/\.html$/, '');
  const profile = join(PROFILE, slug), out = join(OUT, slug);
  mkdirSync(profile, { recursive: true }); mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  process.stderr.write(`[${i + 1}/${todo.length}] ${name} ... `);
  // the starter sits where a builder puts it: index.html beside assets/
  const template = basename(page) === 'starter.html';
  let target = page;
  if (template) {
    const site = join(OUT, 'starter-site');
    dropSite(site); mkdirSync(site, { recursive: true });
    copyFileSync(page, join(site, 'index.html'));
    symlinkSync(join(SKILL, 'assets'), join(site, 'assets'), 'junction');
    target = join(site, 'index.html');
  }
  const r = await runCheck([CHECK, target, '--quick', '--widths', '1440,390', '--json', '--profile', profile, '--out', out]);
  for (let k = 0; k < 20 && existsSync(profile); k++) { try { rmSync(profile, { recursive: true, force: true }); } catch { spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},250)']); } }
  let report = null;
  if (!r.timedOut) try { report = JSON.parse(r.stdout.slice(r.stdout.indexOf('{'))); } catch {}
  const row = { page: name, code: r.status, secs: Math.round((Date.now() - t0) / 1000), fails: {}, held: {}, warns: 0, notCheckedAt: [], error: '' };
  if (!report) row.error = (r.error && r.error.message) || (r.stderr || '').trim().split('\n').pop() || 'no report';
  else {
    const all = [...report.widths.flatMap((w) => w.findings.map((f) => ({ ...f, at: w.width }))), ...((report.sweep && report.sweep.findings) || []).map((f) => ({ ...f, at: f.width })), ...((report.narrow && report.narrow.findings) || []).map((f) => ({ ...f, at: f.width }))];
    for (const f of all) {
      if (f.sev !== 'FAIL') { row.warns++; continue; }
      const id = f.check + (f.rule ? ` ${f.rule.replace(/^SR-\d+ /, '')}` : '');
      // the template's own stand-ins: a bracketed placeholder named by a words, links or files check (in its message or
      // its element, never the section's heading it quotes), and the copy checks (its copy is all stand-ins)
      const own = template && (/^copy-/.test(f.check) || (HELD.has(f.check) && /\[[^\]]{1,60}\]|%5B[^%]{1,60}%5D/.test(`${f.sel || ''} ${f.msg || ''}`)));
      const into = own ? row.held : row.fails;
      (into[id] = into[id] || []).push(f.at);
    }
    row.notCheckedAt = report.notCheckedAt || [];
  }
  // the layout check, as the gate runs it: every finding fails (a template's stand-ins are words, never layout)
  if (LAYOUT && !row.error) {
    const lprof = join(PROFILE, slug + '-layout');
    mkdirSync(lprof, { recursive: true });
    const l = await runCheck([LAYOUT, '--url', target, '--profile', lprof, '--sizes', '1440x900,390x844', '--json']);
    for (let k = 0; k < 20 && existsSync(lprof); k++) { try { rmSync(lprof, { recursive: true, force: true }); } catch { spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},250)']); } }
    let rep = null;
    if (!l.timedOut && l.status !== 2) try { rep = JSON.parse(l.stdout.slice(l.stdout.indexOf('['))); } catch {}
    if (!Array.isArray(rep)) row.error = `check.mjs: ${(l.error && l.error.message) || (l.stderr || '').trim().split('\n').pop() || `exit ${l.status}`}`;
    else for (const sz of rep) for (const f of sz.findings || []) {
      const id = `layout ${f.rule}`;
      (row.fails[id] = row.fails[id] || []).push(Number(String(sz.size).split('x')[0]));
      (row.layout = row.layout || []).push(`${sz.size} ${f.rule} ${f.where}: ${f.detail}`);
    }
    row.secs = Math.round((Date.now() - t0) / 1000);
  }
  rows.push(row);
  const n = Object.keys(row.fails).length;
  process.stderr.write(`${row.error ? 'ERROR' : n ? `${n} FAIL id${n > 1 ? 's' : ''}` : 'clean'} (${row.secs}s)\n`);
}
try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
dropSite(join(OUT, 'starter-site'));

const w = Math.max(...rows.map((r) => r.page.length));
console.log(`\n${'page'.padEnd(w)}  FAIL ids (widths)`);
for (const r of rows) {
  const ids = Object.entries(r.fails).map(([id, at]) => `${id} (${[...new Set(at)].join(',')})`);
  const extra = r.error ? `NOT CHECKED: ${r.error}` : r.notCheckedAt.length ? `NOT CHECKED at ${r.notCheckedAt.join(', ')}` : '';
  const held = Object.keys(r.held).length ? `(template stand-ins: ${Object.keys(r.held).join(', ')})` : '';
  console.log(`${r.page.padEnd(w)}  ${[ids.join('; ') || (extra ? '' : '-'), extra, held].filter(Boolean).join('  ')}`);
  for (const f of r.layout || []) console.log(`${''.padEnd(w)}    ${f}`);
}
const bad = rows.filter((r) => Object.keys(r.fails).length), lost = rows.filter((r) => r.error || r.notCheckedAt.length);
const clean = rows.filter((r) => !bad.includes(r) && !lost.includes(r));
console.log(`\n${rows.length} pages: ${clean.length} clean, ${bad.length} with a FAIL, ${lost.length} not checked`);
if (SAVE) writeFileSync(SAVE, JSON.stringify(rows, null, 1));
process.exit(bad.length ? 1 : lost.length ? 2 : 0);
