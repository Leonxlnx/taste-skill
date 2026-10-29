import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileForRequest, fileUnderRoot, previewRoot } from '../skills/taste-skill/scripts/lib/preview-root.mjs';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'taste-preview-'));
  writeFileSync(join(dir, 'style.css'), 'decoy');
  mkdirSync(join(dir, 'dist'));
  writeFileSync(join(dir, 'dist', 'style.css'), 'from-dist');
  writeFileSync(join(dir, 'dist', 'index.html'), '<link rel="stylesheet" href="/style.css">');
  mkdirSync(join(dir, 'dist', 'blog'));
  writeFileSync(join(dir, 'dist', 'blog', 'index.html'), '<link rel="stylesheet" href="/style.css">');
  mkdirSync(join(dir, 'dist-other'));
  writeFileSync(join(dir, 'dist-other', 'style.css'), 'sibling');
  return dir;
}

test('--root dist serves /style.css from the build, and no flag still serves the working directory', (t) => {
  const dir = fixture();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const built = previewRoot({ file: join(dir, 'dist', 'index.html'), cwd: dir, rootFlag: 'dist' });
  assert.equal(built.root, resolve(dir, 'dist'));
  const fromBuild = fileForRequest(built.root, '/style.css');
  assert.equal(fromBuild.file, resolve(dir, 'dist', 'style.css'));
  assert.equal(readFileSync(fromBuild.file, 'utf8'), 'from-dist');

  const nested = previewRoot({ file: join(dir, 'dist', 'blog', 'index.html'), cwd: dir, rootFlag: 'dist' });
  assert.equal(readFileSync(fileForRequest(nested.root, '/style.css').file, 'utf8'), 'from-dist');

  const plain = previewRoot({ file: join(dir, 'dist', 'index.html'), cwd: dir });
  assert.equal(plain.root, resolve(dir));
  assert.equal(readFileSync(fileForRequest(plain.root, '/style.css').file, 'utf8'), 'decoy');
});

test('a file outside the working directory is still served from its own directory', (t) => {
  const dir = fixture();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const outside = join(dir, 'outside');
  mkdirSync(outside);
  writeFileSync(join(outside, 'index.html'), '<link rel="stylesheet" href="/style.css">');
  writeFileSync(join(outside, 'style.css'), 'from-outside');
  const chosen = previewRoot({ file: join(outside, 'index.html'), cwd: join(dir, 'dist') });
  assert.equal(chosen.root, resolve(outside));
  assert.equal(readFileSync(fileForRequest(chosen.root, '/style.css').file, 'utf8'), 'from-outside');
});

test('--root rejects a missing directory and a file outside that directory', (t) => {
  const dir = fixture();
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const missing = previewRoot({ file: join(dir, 'dist', 'index.html'), cwd: dir, rootFlag: 'missing' });
  assert.match(missing.error, /not a directory/);
  const outside = previewRoot({ file: join(dir, 'style.css'), cwd: dir, rootFlag: 'dist' });
  assert.match(outside.error, /outside --root/);
  assert.deepEqual(fileUnderRoot(resolve(dir, 'dist'), join(dir, 'dist-other', 'style.css')), { status: 403 });
  assert.deepEqual(fileUnderRoot(resolve(dir, 'dist'), join(dir, 'style.css')), { status: 403 });
});
