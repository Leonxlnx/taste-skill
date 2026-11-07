#!/usr/bin/env node
// The shell installer must use the frontmatter name with both Unix and Windows
// checkout line endings, rather than silently using the skill folder's name.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = mkdtempSync(join(tmpdir(), 'taste-install-'));
try {
  copyFileSync(join(root, 'install.sh'), join(fixture, 'install.sh'));
  const skill = join(fixture, 'skills', 'different-folder');
  mkdirSync(skill, { recursive: true });
  for (const newline of ['\n', '\r\n']) {
    for (const name of ['design-taste-frontend', '"design-taste-frontend"', "'design-taste-frontend'"]) {
      writeFileSync(join(skill, 'SKILL.md'), ['---', `name: ${name}`, 'description: Test fixture', '---', ''].join(newline));
      const output = execFileSync('bash', [join(fixture, 'install.sh'), '--list', 'design-taste-frontend'], { encoding: 'utf8' });
      assert.match(output, /^design-taste-frontend\s+skills\/different-folder\n$/);
      assert.ok(!output.includes('\r'));
    }
  }
  console.log('ok - installer reads unquoted and quoted skill names with LF and CRLF');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
