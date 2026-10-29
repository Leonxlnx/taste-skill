import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

// No flag: a file inside the working directory is served from that directory,
// and a file outside it is served from its own directory. --root replaces that
// choice so a production build can be the web root.
export function previewRoot({ file, cwd, rootFlag = '' }) {
  const absFile = resolve(file);
  const absCwd = resolve(cwd);
  if (rootFlag) {
    const root = resolve(absCwd, rootFlag);
    if (!existsSync(root) || !statSync(root).isDirectory()) {
      return { error: '--root is not a directory: ' + root };
    }
    if (absFile !== root && !absFile.startsWith(root + sep)) {
      return { error: 'File is outside --root: ' + absFile };
    }
    return { root, file: absFile };
  }
  const root = absFile.startsWith(absCwd + sep) ? absCwd : dirname(absFile);
  return { root, file: absFile };
}

export function fileUnderRoot(root, candidate) {
  const f = resolve(candidate);
  const absRoot = resolve(root);
  if (f !== absRoot && !f.startsWith(absRoot + sep)) return { status: 403 };
  return { file: f };
}

export function fileForRequest(root, requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://x').pathname);
  return fileUnderRoot(root, join(root, pathname));
}
