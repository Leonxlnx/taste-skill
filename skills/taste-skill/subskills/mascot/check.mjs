#!/usr/bin/env node
import { readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const example = fileURLToPath(new URL('./example/', import.meta.url));
const folder = resolve(process.argv[2] || example);
const problems = [];
function read(name) {
  const file = resolve(folder, name);
  if (!existsSync(file) || !statSync(file).isFile()) {
    problems.push(`Missing file: ${name}`);
    return '';
  }
  if (statSync(file).size > 60000 && extname(file) === '.svg') problems.push(`${name} exceeds 60,000 bytes`);
  return readFileSync(file, 'utf8');
}
const attr = (tag, key) => tag.match(new RegExp('(?:^|\\s)' + key + '\\s*=\\s*(["\\x27])(.*?)\\1', 'i'))?.[2];
const page = read('index.html');
const idsOf = source => [...source.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);

// The sheet may be inline, or referenced as parts.svg#some-part.
function inspect(source, file) {
  const ids = idsOf(source);
  if (new Set(ids).size !== ids.length) problems.push(`${file} has duplicate IDs`);
  for (const [tag] of source.matchAll(/<use\b[^>]*>/gi)) {
    const href = attr(tag, 'href') || attr(tag, 'xlink:href') || '';
    const [local, part] = href.split('#');
    if (!part || /^\w+:|^\/\//.test(local)) {
      problems.push(`${file} needs a local SVG part: ${href}`);
      continue;
    }
    const target = local ? idsOf(read(resolve(folder, dirname(file), local))) : ids;
    if (!target.includes(part)) problems.push(`${file} cannot find ${href}`);
  }
}
function namedGraphic(tag) {
  return attr(tag, 'aria-hidden') === 'true' || Boolean(attr(tag, 'aria-label') || attr(tag, 'aria-labelledby'));
}
inspect(page, 'index.html');
for (const [tag] of page.matchAll(/<img\b[^>]*>/gi)) {
  if (attr(tag, 'alt') === undefined) problems.push('An image is missing alt text');
}
const poses = read('poses.svg');
const icon = read('favicon.svg');
inspect(poses, 'poses.svg');
inspect(icon, 'favicon.svg');
const poseIds = idsOf(poses).filter(id => id.startsWith('pose-'));
if (poseIds.length < 3 || poseIds.length > 5) problems.push('The pose sheet needs 3–5 named pose-* groups');
if (!/\bviewBox=["']/.test(poses) || !/\bviewBox=["']/.test(icon)) problems.push('The sheet and favicon need viewBox coordinates');
if (!/<use\b/.test(poses)) problems.push('The poses do not share any referenced parts');
if (!/<link\b[^>]*\brel=["']icon["'][^>]*>/i.test(page)) problems.push('Link the favicon in the page head');
for (const [tag] of page.matchAll(/<svg\b[^>]*>/gi)) {
  if (!namedGraphic(tag)) problems.push('Name the inline character or mark its decorative instance aria-hidden');
}

if (problems.length) {
  console.error([...new Set(problems)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('Pass: ' + folder);
}
