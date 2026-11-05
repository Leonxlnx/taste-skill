// perf.mjs sweeps leftover run-<pid> Chrome profiles before it launches. A folder whose run is still
// alive is that run's profile in use and must survive; folders of exited runs and its own are removed.
// Runs without Chrome: a stand-in browser writes an unreachable DevTools port, so perf fails fast after the sweep.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (process.platform === 'win32') { console.log('perf profile cleanup: skipped on Windows (POSIX stand-in browser)'); process.exit(0); }

const perf = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'taste-skill', 'scripts', 'perf.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-profile-cleanup-'));
const base = path.join(tmp, 'profiles');
fs.mkdirSync(base);

const fakeChrome = path.join(tmp, 'chrome');
fs.writeFileSync(fakeChrome, '#!/bin/sh\nfor a; do case $a in --user-data-dir=*) d=${a#--user-data-dir=};; esac; done\necho 1 > "$d/DevToolsActivePort"\nexec sleep 30\n', { mode: 0o755 });
fs.writeFileSync(path.join(tmp, 'page.html'), '<!doctype html><title>t</title>');

// a live run: a running process owns run-<its pid>
const live = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
// an exited run: a process that has already finished left run-<its pid> behind
const dead = spawnSync(process.execPath, ['-e', '']).pid;
for (const pid of [live.pid, dead]) {
  fs.mkdirSync(path.join(base, `run-${pid}`));
  fs.writeFileSync(path.join(base, `run-${pid}`, 'sentinel'), 'x');
}

let failed = false;
const check = (ok, msg) => { if (!ok) { failed = true; console.error('FAIL: ' + msg); } };
try {
  spawnSync(process.execPath, [perf, path.join(tmp, 'page.html'), '--profile', base, '--runs', '1'],
    { env: { ...process.env, CHROME_PATH: fakeChrome }, stdio: 'ignore', timeout: 60000 });
  check(fs.existsSync(path.join(base, `run-${live.pid}`, 'sentinel')), 'deleted the profile of a run that is still alive');
  check(!fs.existsSync(path.join(base, `run-${dead}`)), 'kept the profile of a run that has exited');
  const left = fs.readdirSync(base).filter(d => /^run-\d+$/.test(d) && d !== `run-${live.pid}`);
  check(left.length === 0, 'left its own profile behind: ' + left.join(', '));
} finally {
  live.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
}
if (failed) process.exit(1);
console.log('perf profile cleanup: live run kept, exited and own runs removed');
