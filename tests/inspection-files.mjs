import assert from 'node:assert/strict';
import { test } from 'node:test';
import { screenshotLabel, isInspectionScreenshot, defaultOutDir } from '../skills/taste-skill/scripts/lib/inspection-files.mjs';

test('default widths retain their existing screenshot names', () => {
  const widths = [1440, 768, 390];
  assert.deepEqual(widths.map((width) => screenshotLabel(width, widths)), ['desktop', 'tablet', 'mobile']);
});

test('distinct widths in one viewport class cannot overwrite fold, page, or film images', () => {
  const widths = [1280, 1024, 768, 390];
  for (const suffix of ['fold', 'page-01', 'film-01']) {
    const files = widths.map((width) => `${screenshotLabel(width, widths)}-${suffix}.jpg`);
    assert.equal(new Set(files).size, widths.length);
    assert.ok(files.includes(`tablet-1024-${suffix}.jpg`));
    assert.ok(files.includes(`tablet-768-${suffix}.jpg`));
  }
});

test('collisions are disambiguated in each viewport class', () => {
  const widths = [1600, 1280, 900, 768, 500, 390];
  assert.deepEqual(widths.map((width) => screenshotLabel(width, widths)), [
    'desktop-1600', 'desktop-1280', 'tablet-900', 'tablet-768', 'mobile-500', 'mobile-390',
  ]);
});

test('cleanup recognizes legacy and width-qualified inspection images only', () => {
  for (const file of ['desktop-fold.jpg', 'tablet-1024-fold.jpg', 'tablet-768-page-01.jpg', 'desktop-1280-film-02.jpg']) {
    assert.equal(isInspectionScreenshot(file), true, file);
  }
  for (const file of ['notes.jpg', 'tablet-1024-original.jpg', 'mobile-fold.png', 'desktop-fold.jpg.bak']) {
    assert.equal(isInspectionScreenshot(file), false, file);
  }
});

// The readable part of the folder name, without the identity digest that keeps two pages apart.
const readable = (target, cwd = '/project') => defaultOutDir(target, cwd).replace(/^\.taste-skill\/inspect-(.*)-[0-9a-f]{8}$/, '$1');

test('each page inspects into its own folder, so a second run cannot overwrite the first one', () => {
  assert.equal(readable('pages/about.html'), 'pages-about');
  assert.equal(readable('about.html'), 'about');
  assert.equal(readable('index.html'), 'page');
  assert.equal(readable('https://example.com/about'), 'example-com-about');
  assert.equal(readable('https://example.com/'), 'example-com');
  assert.notEqual(defaultOutDir('http://localhost:3000/', '/project'), defaultOutDir('http://localhost:3001/', '/project'));
  assert.notEqual(defaultOutDir('a.html', '/project'), defaultOutDir('b.html', '/project'));
});

test('the same page always lands in the same folder, so re-inspecting it clears its own screenshots', () => {
  assert.equal(defaultOutDir('pages/about.html', '/project'), defaultOutDir('pages/about.html', '/project'));
  assert.equal(defaultOutDir('pages/about.html', '/project'), defaultOutDir('/project/pages/about.html', '/project'));
  assert.equal(defaultOutDir('https://example.com/about', '/project'), defaultOutDir('https://example.com/about', '/project'));
});

test('a query or a fragment names a page of its own', () => {
  assert.notEqual(defaultOutDir('https://example.com/', '/project'), defaultOutDir('https://example.com/?theme=dark', '/project'));
  assert.notEqual(defaultOutDir('https://example.com/?theme=dark', '/project'), defaultOutDir('https://example.com/?theme=light', '/project'));
  assert.notEqual(defaultOutDir('https://example.com/#/home', '/project'), defaultOutDir('https://example.com/#/settings', '/project'));
  assert.equal(readable('https://example.com/?theme=dark'), 'example-com-theme-dark');
  assert.equal(readable('https://example.com/#/settings'), 'example-com-settings');
});

test('pages whose names read alike still get folders of their own', () => {
  assert.notEqual(defaultOutDir('a/b.html', '/project'), defaultOutDir('a-b.html', '/project'));
  assert.notEqual(defaultOutDir('About.html', '/project'), defaultOutDir('about.html', '/project'));
  assert.notEqual(defaultOutDir('页面.html', '/project'), defaultOutDir('其它.html', '/project'));
  assert.notEqual(defaultOutDir('pages/about.html', '/project'), defaultOutDir('pages/about/index.html', '/project'));
});

test('the folder name stays within the length a file name can hold', () => {
  const deep = 'a/'.repeat(120) + 'page.html';
  const long = `https://example.com/${'segment/'.repeat(80)}`;
  for (const target of [deep, long]) {
    const folder = defaultOutDir(target, '/project').split('/').pop();
    assert.ok(folder.length <= 100, `${folder.length}: ${folder}`);
  }
});

test('the inspection folder stays under .taste-skill, so the direction.json beside it is still found', () => {
  for (const target of ['pages/about.html', 'index.html', 'https://example.com/about']) {
    assert.ok(defaultOutDir(target, '/project').startsWith('.taste-skill/inspect-'), target);
  }
});
