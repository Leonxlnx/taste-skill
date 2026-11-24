import { readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const example = fileURLToPath(new URL('example/index.html', import.meta.url));
let page = resolve(process.argv[2] || example);
if (statSync(page).isDirectory()) page = join(page, 'index.html');
const html = readFileSync(page,'utf8').replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
const issues = [];
const attr = (tag, name) => new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i').exec(tag)?.slice(1).find(value => value !== undefined);

import { imageSize } from '../../scripts/image-size.mjs';

const slots = [...html.matchAll(/<template\b[^>]*>([\s\S]*?)<\/template>/gi)];
const live = html.replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi,'');
const tags = input => [...input.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
const active = tags(live);
const planned = slots.flatMap(match => tags(match[1]));
if (!active.length && !(page === example && planned.length)) issues.push('No active photographs on the page.');
function inspect(tag, slot) {
  const src = attr(tag,'src') || '';
  const alt = attr(tag,'alt');
  const width = Number(attr(tag,'width'));
  const height = Number(attr(tag,'height'));
  if (alt === undefined) issues.push('Missing alt attribute: ' + src);
  if (![width,height].every(value => Number.isInteger(value) && value > 0)) issues.push('Set intrinsic width and height: ' + src);
  if (!src || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) { issues.push('Expected a local photo path: ' + src); return; }
  if (slot) return;
  try {
    const local = decodeURIComponent(src.split(/[?#]/)[0]);
    const target = isAbsolute(local) ? resolve(dirname(page), '.' + local) : resolve(dirname(page),local);
    const bytes = readFileSync(target);
    const actual = imageSize(bytes);
    if (actual && (width !== actual[0] || height !== actual[1])) issues.push('Declared dimensions differ from ' + actual.join(' × ') + ': ' + src);
  } catch { issues.push('Cannot read local photo: ' + src); }
}
for (const tag of active) inspect(tag,false);
for (const tag of planned) inspect(tag,true);
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(active.length + ' active photo(s) and ' + planned.length + ' template image(s) checked in ' + page);
}
