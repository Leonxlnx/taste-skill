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

test('each page inspects into its own folder, so a second run cannot overwrite the first one', () => {
  assert.equal(defaultOutDir('pages/about.html', '/project'), '.taste-skill/inspect-pages-about');
  assert.equal(defaultOutDir('pages/about/index.html', '/project'), '.taste-skill/inspect-pages-about');
  assert.equal(defaultOutDir('about.html', '/project'), '.taste-skill/inspect-about');
  assert.equal(defaultOutDir('index.html', '/project'), '.taste-skill/inspect-page');
  assert.equal(defaultOutDir('https://example.com/about', '/project'), '.taste-skill/inspect-example-com-about');
  assert.equal(defaultOutDir('https://example.com/', '/project'), '.taste-skill/inspect-example-com');
  assert.notEqual(defaultOutDir('http://localhost:3000/', '/project'), defaultOutDir('http://localhost:3001/', '/project'));
  assert.notEqual(defaultOutDir('a.html', '/project'), defaultOutDir('b.html', '/project'));
});

test('the inspection folder stays under .taste-skill, so the direction.json beside it is still found', () => {
  for (const target of ['pages/about.html', 'index.html', 'https://example.com/about']) {
    assert.ok(defaultOutDir(target, '/project').startsWith('.taste-skill/inspect-'), target);
  }
});
