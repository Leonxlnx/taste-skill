// Serving a local file to the browser: which folder is the site root, and the throwaway static
// server itself. Shared by inspect.mjs and scenes.mjs so both tools show the page as hosted.
//
// The root decides where root-relative URLs (/_astro/page.css, /assets/app.js) land. Serving the
// working directory for a built page (dist/index.html) resolves them against the repository and
// they 404, so the page is judged unstyled (#179). Resolution order:
//
//   1. --root DIR, when given. It must contain the file, or the run stops with an error.
//   2. The file's own evidence: the deepest folder between the file's folder and the working
//      directory (inclusive) under which the page's root-relative assets exist on disk. A build
//      under dist/ — including a nested route such as dist/about/index.html — resolves to dist/;
//      a source page whose assets live at the project root still resolves there.
//   3. A known build-output folder (dist, build, out, _site, .output) directly under the working
//      directory, for builds whose root-relative requests happen only at runtime (fetch, CSS
//      url(...)) and leave no trace in the HTML.
//   4. The historical default: the working directory when the file is inside it, else the file's
//      folder. Builds that use only relative URLs already work under this root, so nothing that
//      worked before changes meaning.
import { existsSync, readFileSync, statSync, createReadStream } from 'node:fs';
import { resolve, join, dirname, extname, sep, relative } from 'node:path';
import { createServer } from 'node:http';

export const BUILD_DIRS = new Set(['dist', 'build', 'out', '_site', '.output']);

const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };

// Root-relative asset paths named by the page itself ("/_astro/page.css"), without query or hash.
// Protocol-relative ("//cdn/..."), absolute, relative and bare "/" references say nothing about
// which local folder is the site root, so they are ignored.
export function rootRelativeRefs(html) {
  const refs = new Set();
  for (const m of String(html).matchAll(/(?:href|src|action|poster)\s*=\s*["'](\/[^"']*)["']/gi)) {
    let ref = m[1];
    if (ref.startsWith('//')) continue;
    ref = ref.split(/[?#]/)[0];
    if (!ref || ref === '/') continue;
    try { ref = decodeURIComponent(ref); } catch {}
    refs.add(ref);
    if (refs.size >= 64) break;
  }
  return [...refs];
}

export function resolveServeRoot(file, { cwd = resolve('.'), rootFlag = null } = {}) {
  const absFile = resolve(file);
  const absCwd = resolve(cwd);
  if (rootFlag) {
    const root = resolve(absCwd, rootFlag);
    if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`--root is not a directory: ${root}`);
    if (absFile !== root && !absFile.startsWith(root + sep)) throw new Error(`--root ${root} does not contain ${absFile}; pass the folder the page is served from when hosted (for a production build, its output folder, e.g. --root dist).`);
    return root;
  }
  const dir = dirname(absFile);
  const insideCwd = absFile.startsWith(absCwd + sep);
  if (!insideCwd) return dir;
  if (dir === absCwd) return absCwd;

  let refs = [];
  if (/\.html?$/i.test(absFile)) { try { refs = rootRelativeRefs(readFileSync(absFile, 'utf8')); } catch {} }
  if (refs.length) {
    const candidates = [];
    for (let d = dir; ; d = dirname(d)) { candidates.push(d); if (d === absCwd) break; }
    let best = null, bestScore = 0;
    for (const candidate of candidates) {
      const score = refs.filter((ref) => existsSync(join(candidate, ref))).length;
      if (score > bestScore) { bestScore = score; best = candidate; }
    }
    if (best) return best;
  }

  const firstSegment = relative(absCwd, absFile).split(sep)[0];
  if (BUILD_DIRS.has(firstSegment)) return join(absCwd, firstSegment);
  return absCwd;
}

export const relativeUrlPath = (root, file) => relative(root, file).split(sep).map(encodeURIComponent).join('/');

export function createStaticServer(root) {
  return createServer((req, res) => {
    try {
      let f = resolve(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
      if (f !== root && !f.startsWith(root + sep)) { res.writeHead(403); return res.end(); }
      if (statSync(f).isDirectory()) f = join(f, 'index.html');
      res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': statSync(f).size, 'cache-control': 'no-store' });
      createReadStream(f).pipe(res);
    } catch { res.writeHead(404); res.end('not found'); }
  });
}

export async function serveLocalFile(file, opts = {}) {
  const absFile = resolve(file);
  const root = resolveServeRoot(absFile, opts);
  const server = createStaticServer(root);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, root, url: `http://127.0.0.1:${server.address().port}/${relativeUrlPath(root, absFile)}` };
}
