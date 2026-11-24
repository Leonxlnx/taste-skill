import { readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
let file = resolve(args.find(arg => !arg.startsWith('--')) || fileURLToPath(new URL('example/index.html', import.meta.url)));
if (statSync(file).isDirectory()) file = join(file, 'index.html');
const html = readFileSync(file, 'utf8');
const source = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
const figures = [...source.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/gi)]
  .filter(match => /\sdata-picture(?:\s|=|$)/i.test(match[1]));
const issues = [];
const attr = (tag, name) => new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(tag)?.slice(1).find(value => value !== undefined);
if (!figures.length) issues.push('No figure with data-picture was found.');
for (const [index, figure] of figures.entries()) {
  const body = figure[2];
  const fail = message => issues.push('Figure ' + (index + 1) + ': ' + message);
  if (!attr(figure[1], 'aria-label') && !attr(figure[1], 'aria-labelledby') && !/<figcaption\b[^>]*>[^<]+/i.test(body)) fail('Name the figure with a heading or short fact line.');
  if (!/\d/.test(body.replace(/<[^>]+>/g,' '))) fail('Expose a value in the text of the still.');
  for (const [svg] of body.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi)) {
    const open = svg.slice(0, svg.indexOf('>') + 1);
    const vb = (attr(open, 'viewBox') || '').trim().split(/[ ,]+/).map(Number);
    if (vb.length !== 4 || !vb.every(Number.isFinite) || vb[2] <= 0 || vb[3] <= 0) fail('Set a positive SVG viewBox.');
    if (attr(open, 'aria-hidden') !== 'true' && !attr(open, 'aria-label') && !attr(open, 'aria-labelledby') && !/<title\b[^>]*>[^<]+<\/title>/.test(svg)) fail('Name the SVG or hide the described geometry.');
  }
  for (const [tag] of body.matchAll(/<[a-z][^>]+>/gi)) {
    const ref = attr(tag, 'aria-labelledby');
    for (const id of (ref || '').split(/\s+/).filter(Boolean)) {
      const ids = [...source.matchAll(/\sid\s*=\s*(?:"([^"]+)"|'([^']+)')/g)].map(match => match[1] || match[2]);
      if (ids.filter(item => item === id).length !== 1) fail('Reference to missing or repeated label ' + id);
    }
    if (attr(tag, 'role') === 'img' && !attr(tag, 'aria-label') && !ref && !/^<svg\b/i.test(tag)) fail('Name the graphic.');
  }
}
if (args.includes('--sample')) {
  const { figure, samples, spec } = await import('./example/fixture.mjs');
  const values = samples();
  const firstBreach = values.findIndex(value => value > spec.budget);
  const recovery = values.findIndex((value,i) => i >= spec.rollback && value <= spec.budget);
  if (JSON.stringify(values) !== JSON.stringify(samples()) || firstBreach !== 13 || recovery !== 30) issues.push('The sample timing has changed.');
  const saved = html.match(/<!-- figure -->([\s\S]*?)<!-- end figure -->/);
  const normalize = value => value.replace(/\r\n/g,'\n').trim();
  if (!saved || normalize(saved[1]) !== normalize(figure())) issues.push('The published figure differs from the seeded fixture.');
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(figures.length + ' figure(s) checked in ' + file);
}
