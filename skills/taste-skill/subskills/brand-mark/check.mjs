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
inspect(page, 'index.html');
for (const [tag] of page.matchAll(/<img\b[^>]*>/gi)) {
  if (attr(tag, 'alt') === undefined) problems.push('An image is missing alt text');
}
const mark = read('mark.svg');
const icon = read('favicon.svg');
for (const [name, source] of [['mark.svg', mark], ['favicon.svg', icon]]) {
  inspect(source, name);
  if (!/\bviewBox=["']/.test(source)) problems.push(`${name} lacks a viewBox`);
  if (/<(?:linearGradient|radialGradient|filter|image|animate|text|script)\b/i.test(source)) problems.push(`${name} needs a static vector silhouette`);
}
const inks = new Set([...mark.matchAll(/(?:\s(?:fill|stroke)\s*=\s*["']([^"']+)|(?:fill|stroke)\s*:\s*([^;}"]+))/gi)]
  .map(match => (match[1] || match[2]).trim().toLowerCase()).filter(value => value !== 'none'));
if (inks.size > 1) problems.push('mark.svg uses more than one paint');
if (!/<link\b[^>]*\brel=["']icon["'][^>]*>/i.test(page)) problems.push('Link the favicon in the page head');
const markup = page.replace(/<!--[\s\S]*?-->/g, '');
const nav = markup.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)?.[0] || markup.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/i)?.[0];
const footer = markup.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0];
for (const [part, area] of [['nav', nav], ['footer', footer]]) {
  const links = [...(area || '').matchAll(/<a\b[^>]*\bhref\s*=[^>]*>([\s\S]*?)<\/a>/gi)];
  if (!links.some(link => /<(?:svg|img)\b/i.test(link[1]))) problems.push(`Show the linked identity in the ${part}`);
}

if (problems.length) {
  console.error([...new Set(problems)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('Pass: ' + folder);
}
