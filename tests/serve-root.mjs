import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get as httpGet } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { rootRelativeRefs, resolveServeRoot, serveLocalFile, relativeUrlPath } from '../skills/taste-skill/scripts/lib/serve.mjs';

// A throwaway project tree per test: project({ 'dist/index.html': '...' }) -> its root folder.
function project(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'taste-serve-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, body] of Object.entries(files)) {
    const path = join(root, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }
  return root;
}

const page = (head) => `<!doctype html><html><head>${head}</head><body><h1>Built page</h1></body></html>`;

function rawGet(port, path) {
  return new Promise((resolvePromise, reject) => {
    httpGet({ host: '127.0.0.1', port, path }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolvePromise({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

test('a production build is served from its build folder, so root-relative assets resolve (#179)', async (t) => {
  const root = project(t, {
    'dist/index.html': page('<link rel="stylesheet" href="/_astro/page.css"><script src="/app.js?v=3"></script>'),
    'dist/_astro/page.css': 'h1 { color: rebeccapurple; }',
    'dist/app.js': 'console.log(1);',
    'secret.txt': 'outside the build folder',
  });
  const file = join(root, 'dist', 'index.html');
  assert.equal(resolveServeRoot(file, { cwd: root }), join(root, 'dist'));

  const { server, url, root: served } = await serveLocalFile(file, { cwd: root });
  t.after(() => { server.close(); server.closeAllConnections?.(); });
  assert.equal(served, join(root, 'dist'));
  assert.equal(new URL(url).pathname, '/index.html');

  const pageRes = await fetch(url);
  assert.equal(pageRes.status, 200);
  assert.match(await pageRes.text(), /Built page/);

  const origin = new URL(url).origin;
  const css = await fetch(`${origin}/_astro/page.css`);
  assert.equal(css.status, 200);
  assert.match(await css.text(), /rebeccapurple/);
  assert.equal((await fetch(`${origin}/app.js?v=3`)).status, 200);

  // The build folder is the whole site: nothing above it leaks, escaped paths included.
  // (URL parsing collapses the %2e%2e escape back inside the root, where no such file exists.)
  const port = server.address().port;
  const escape = await rawGet(port, '/%2e%2e/secret.txt');
  assert.equal(escape.status, 404);
  assert.doesNotMatch(escape.body, /outside the build folder/);
  assert.equal((await fetch(`${origin}/nope.css`)).status, 404);
});

test('a nested built route resolves to the build folder, not to its own folder', (t) => {
  const root = project(t, {
    'dist/about/index.html': page('<link rel="stylesheet" href="/_astro/page.css">'),
    'dist/_astro/page.css': 'h1 {}',
  });
  const file = join(root, 'dist', 'about', 'index.html');
  assert.equal(resolveServeRoot(file, { cwd: root }), join(root, 'dist'));
  assert.equal(relativeUrlPath(join(root, 'dist'), file), 'about/index.html');
});

test('a source page whose root-relative assets live at the project root keeps the project root', (t) => {
  const root = project(t, {
    'src/page.html': page('<link rel="stylesheet" href="/assets/site.css">'),
    'assets/site.css': 'h1 {}',
  });
  assert.equal(resolveServeRoot(join(root, 'src', 'page.html'), { cwd: root }), root);
});

test('a page at the project root and a page with no evidence keep the historical root', (t) => {
  const root = project(t, {
    'index.html': page('<link rel="stylesheet" href="/site.css">'),
    'docs/guide.html': page('<link rel="stylesheet" href="guide.css">'),
  });
  assert.equal(resolveServeRoot(join(root, 'index.html'), { cwd: root }), root);
  // Relative URLs already resolve under the working-directory root; changing it would break ../ refs.
  assert.equal(resolveServeRoot(join(root, 'docs', 'guide.html'), { cwd: root }), root);
});

test('a build whose root-relative requests happen only at runtime still resolves to the build folder', (t) => {
  const root = project(t, {
    'out/index.html': page('<script src="app.js"></script>'), // app.js fetch()es /data.json at runtime
    'out/app.js': 'fetch("/data.json");',
    'out/data.json': '{}',
  });
  assert.equal(resolveServeRoot(join(root, 'out', 'index.html'), { cwd: root }), join(root, 'out'));
});

test('a file outside the working directory is served from its own folder', (t) => {
  const root = project(t, { 'index.html': page('') });
  const elsewhere = project(t, { 'page.html': page('<link rel="stylesheet" href="/x.css">') });
  assert.equal(resolveServeRoot(join(elsewhere, 'page.html'), { cwd: root }), elsewhere);
});

test('--root names the served folder explicitly', async (t) => {
  const root = project(t, {
    'wwwroot/index.html': page('<link rel="stylesheet" href="/site.css">'),
    'wwwroot/site.css': 'h1 {}',
  });
  const file = join(root, 'wwwroot', 'index.html');
  assert.equal(resolveServeRoot(file, { cwd: root, rootFlag: 'wwwroot' }), join(root, 'wwwroot'));

  const { server, url } = await serveLocalFile(file, { cwd: root, rootFlag: 'wwwroot' });
  t.after(() => { server.close(); server.closeAllConnections?.(); });
  assert.equal((await fetch(`${new URL(url).origin}/site.css`)).status, 200);
});

test('--root must be a directory containing the file', (t) => {
  const root = project(t, { 'dist/index.html': page(''), 'src/page.html': page('') });
  assert.throws(
    () => resolveServeRoot(join(root, 'dist', 'index.html'), { cwd: root, rootFlag: 'src' }),
    /does not contain/,
  );
  assert.throws(
    () => resolveServeRoot(join(root, 'dist', 'index.html'), { cwd: root, rootFlag: 'missing' }),
    /not a directory/,
  );
});

test('rootRelativeRefs reads root-relative URLs and ignores the rest', () => {
  const html = [
    '<link href="/_astro/page.css?v=1#frag">',
    "<script src='/js/app.js'></script>",
    '<script src="//cdn.example.com/lib.js"></script>',
    '<link href="https://example.com/x.css">',
    '<link href="relative.css">',
    '<a href="/">home</a>',
    '<img src="/img/hero%20wide.jpg">',
  ].join('\n');
  assert.deepEqual(rootRelativeRefs(html), ['/_astro/page.css', '/js/app.js', '/img/hero wide.jpg']);
});
