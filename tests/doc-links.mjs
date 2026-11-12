// Every file path the docs point at must exist in the repo, or the pointer is dead.
//
// A pointer to a file that was deleted is the same mistake as a pointer to a file that was
// never there: the reader follows it and finds nothing. This walks the markdown and resolves
// the paths it names.
//
//   node tests/doc-links.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = join(root, 'skills/taste-skill');

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = join(dir, e.name);
  if (e.isDirectory()) return e.name === 'node_modules' || e.name === '.git' ? [] : walk(p);
  return p.endsWith('.md') ? [p] : [];
});

// A path in backticks that names a file in this repo. Not a URL, not a glob, not a command
// line flag. A bare name ("cards.md") is left alone: the docs use those for whatever is in
// reach from the page being built, so only a path with a directory in it is unambiguous.
// A leading slash means the root of the reader's own site, not of this repo.
const isRepoPath = (s) =>
  /^[A-Za-z0-9_.\/-]+\/[A-Za-z0-9_.\/-]+\.(md|mjs|json|css|js|html|sh)$/.test(s) && !s.startsWith('/');

// The folders in a reader's own project, never in this repo. A path that starts with one of
// these is their code, not ours.
const readers = ['src/', 'dist/', 'public/', 'build/', 'out/'];

// The changelog is a record of what was true at each release, so it names files that were
// there then and are gone now. Those are history, not dead links. A path that starts at the
// repo root ("skills/taste-skill/...") is still checked, because that one is unambiguous:
// it names a file of this repo, whatever release is being described.
const historical = ['CHANGELOG.md'];

// Where a path can be rooted: the repo, the skill, and the folders a doc reads from.
const roots = [
  root,
  skill,
  join(skill, 'references'),
  join(skill, 'scripts'),
  join(skill, 'assets'),
  join(skill, 'library'),
  join(skill, 'assets/objects'),
  join(skill, 'assets/ui'),
];

const dead = [];
for (const file of walk(root)) {
  const rel = file.slice(root.length + 1);
  const isHistory = historical.some((h) => rel.endsWith(h));
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    const p = m[1];
    if (!isRepoPath(p)) continue;
    // A path that starts with a dot is a runtime artefact or a folder in the reader's own
    // project (.taste-skill/, .claude/, .github/), not a file this repo ships.
    if (p.split('/').some((part) => part.startsWith('.'))) continue;
    if (readers.some((r) => p.startsWith(r))) continue;
    // A path from the repo root names a file of this repo, in any document, and must exist.
    if (p.startsWith('skills/')) {
      if (!existsSync(join(root, p))) dead.push(rel + ' -> ' + p);
      continue;
    }
    // The rest are relative to the skill folder or to the reader's project. In a document
    // that describes the current release they must exist; in the changelog they are history.
    if (isHistory) continue;
    if (roots.some((r) => existsSync(join(r, p)))) continue;
    if (existsSync(join(dirname(file), p))) continue;
    dead.push(rel + ' -> ' + p);
  }
}

if (dead.length) {
  console.error('These docs point at files that are not in the repo:');
  for (const d of dead) console.error('  ' + d);
  console.error('\nEither the file was deleted and the pointer was left behind, or the name is wrong.');
  process.exit(1);
}
console.log('Every file path the docs point at exists.');
