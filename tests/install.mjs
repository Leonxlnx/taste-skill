#!/usr/bin/env node
// The shell installer must use the frontmatter name with both Unix and Windows
// checkout line endings, rather than silently using the skill folder's name.
// The awk on Linux, macOS and WSL keeps the carriage return of a CRLF line (the
// awk of Git for Windows drops it), so the CRLF cases matter there. It also links
// the skill into a scratch HOME for Claude Code and Codex and removes it again.
//   node tests/install.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// On Windows a bare `bash` is often the WSL launcher, which cannot open a Windows path: use Git Bash
const gitBash = () => {
  try {
    const exe = join(execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim(), '..', '..', '..', 'bin', 'bash.exe');
    if (existsSync(exe)) return exe;
  } catch {}
  console.error('This check needs Git Bash (Git for Windows) on Windows.');
  process.exit(2);
};
const bash = process.platform === 'win32' ? gitBash() : 'bash';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = mkdtempSync(join(tmpdir(), 'taste-install-'));
const home = join(fixture, 'home');
const run = (...args) => execFileSync(bash, [join(fixture, 'install.sh'), ...args], { encoding: 'utf8', env: { ...process.env, HOME: home } });
try {
  copyFileSync(join(root, 'install.sh'), join(fixture, 'install.sh'));
  const skill = join(fixture, 'skills', 'different-folder');
  mkdirSync(skill, { recursive: true });
  mkdirSync(home);
  const writeSkill = (name, newline) => writeFileSync(join(skill, 'SKILL.md'), ['---', `name: ${name}`, 'description: Test fixture', '---', ''].join(newline));
  for (const newline of ['\n', '\r\n']) {
    for (const name of ['design-taste-frontend', '"design-taste-frontend"', "'design-taste-frontend'"]) {
      writeSkill(name, newline);
      const output = run('--list', 'design-taste-frontend');
      assert.match(output, /^design-taste-frontend\s+skills\/different-folder\n$/);
      assert.ok(!output.includes('\r'));
    }
  }
  console.log('ok - installer reads unquoted and quoted skill names with LF and CRLF');

  // a real install from a CRLF checkout: one link per agent, named after the frontmatter, then removed again
  writeSkill('design-taste-frontend', '\r\n');
  run('--all-agents');
  const agents = [join(home, '.claude', 'skills'), join(home, '.codex', 'skills')];
  for (const dir of agents) {
    assert.deepEqual(readdirSync(dir), ['design-taste-frontend'], `${dir} holds the wrong links`);
    assert.ok(lstatSync(join(dir, 'design-taste-frontend')).isSymbolicLink(), `${dir}/design-taste-frontend is not a link`);
  }
  run('--all-agents', '--uninstall');
  for (const dir of agents) assert.deepEqual(readdirSync(dir), [], `${dir} still holds a link after --uninstall`);
  assert.ok(existsSync(join(skill, 'SKILL.md')), '--uninstall removed the skill folder itself');
  console.log('ok - installer links a CRLF skill into Claude Code and Codex under its name and unlinks it');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
