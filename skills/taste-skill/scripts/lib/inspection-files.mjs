import { createHash } from 'node:crypto';
import { relative, resolve } from 'node:path';

export const viewportClass = (width) => (width >= 1100 ? 'desktop' : width >= 600 ? 'tablet' : 'mobile');

export function screenshotLabel(width, widths) {
  const label = viewportClass(width);
  const sameClass = new Set(widths.filter((candidate) => viewportClass(candidate) === label));
  return sameClass.size > 1 ? `${label}-${width}` : label;
}

export const isInspectionScreenshot = (file) => /^(desktop|tablet|mobile)(?:-\d+)?-(fold|page-\d+|film-\d+)\.jpg$/.test(file);

// The parts of a path that name the page: the folder chain without its last file name, and without the
// extension or an `index` that only repeats the folder it sits in.
const pageParts = (segments) => {
  const parts = segments.filter((segment) => segment && segment !== '.' && segment !== '..');
  if (!parts.length) return [];
  const last = parts[parts.length - 1].replace(/\.[^.]+$/, '');
  if (last.toLowerCase() === 'index') parts.pop();
  else parts[parts.length - 1] = last;
  return parts;
};

// A query or a fragment names a page of its own (`?theme=dark` and `#/settings` are not the bare path),
// so it reads as part of the name.
const queryParts = (value) => {
  const token = value.replace(/^[?#]+/, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  return token ? [token] : [];
};

const slugify = (parts) => parts.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// What makes a target its own page: for a URL the whole URL (query and fragment included), for a file
// its absolute path. Two different targets never share an identity, so they never share a folder.
const identityOf = (target, cwd) => {
  if (/^https?:\/\//i.test(target)) {
    try { return new URL(target).href; } catch {}
  }
  return resolve(cwd, target);
};

// A digest of the identity. The readable name alone is lossy (`a/b.html` and `a-b.html` both read as
// `a-b`, and case or non-ASCII names collapse to nothing), so the digest keeps the folders apart
// however the name is spelled. 128 bits, not 32: two different URLs whose queries differ only in the
// case of their letters can share the first four bytes of a SHA-256 digest, and 32 bits would let such
// a pair land in one folder.
const digestOf = (identity) => createHash('sha256').update(identity).digest('hex').slice(0, 32);

// How much of the readable name is kept: the folder component stays far below the 255-byte limit
// even for a deeply nested path or a long URL.
const MAX_SLUG_LENGTH = 80;

// Where an inspection of this target writes its screenshots. One folder per page, so two runs over
// different pages never share a folder and cannot replace each other's images. The folder stays under
// `.taste-skill/`, so the `direction.json` next to it is still found.
export function defaultOutDir(target, cwd = process.cwd()) {
  const parts = [];
  if (/^https?:\/\//i.test(target)) {
    let url = null;
    try { url = new URL(target); } catch {}
    if (url) parts.push(url.host.replace(/^www\./i, ''), ...pageParts(url.pathname.split('/')), ...queryParts(url.search), ...queryParts(url.hash));
  } else {
    const rel = relative(cwd, resolve(cwd, target));
    parts.push(...pageParts(rel.split(/[\\/]+/)));
  }
  const slug = slugify(parts).slice(0, MAX_SLUG_LENGTH).replace(/-+$/, '') || 'page';
  return `.taste-skill/inspect-${slug}-${digestOf(identityOf(target, cwd))}`;
}
