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

const slugify = (parts) => parts.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Where an inspection of this target writes its screenshots. One folder per page, so two runs over
// different pages never share a folder and cannot replace each other's images. The folder stays under
// `.taste-skill/`, so the `direction.json` next to it is still found.
export function defaultOutDir(target, cwd = process.cwd()) {
  const parts = [];
  if (/^https?:\/\//i.test(target)) {
    let url = null;
    try { url = new URL(target); } catch {}
    if (url) parts.push(url.host.replace(/^www\./i, ''), ...pageParts(url.pathname.split('/')));
  } else {
    const rel = relative(cwd, resolve(cwd, target));
    parts.push(...pageParts(rel.split(/[\\/]+/)));
  }
  return `.taste-skill/inspect-${slugify(parts) || 'page'}`;
}
