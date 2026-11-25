#!/usr/bin/env node
// Rebuild the recipe links and the three galleries from their worked fragments.
// The HTML shells own their headers, navigation, palettes and stylesheet order.
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const skill = join(dirname(fileURLToPath(import.meta.url)), '..');
const own = join(skill, 'assets', 'own');
const galleries = {
  'index.html': 'rail meter core-view switcher bars scale case-rows index day-bar booking-bar configurator receipt states letter margin-track',
  'gallery-own-a.html': 'evidence-grid chapter-stage model-matrix billing-matrix connector-finder release-register case-foldout annotated-source system-paths source-ledger',
  'gallery-own-b.html': 'media-desk coverage-map answer-finder edition-outlets environment-setup fee-comparison chapter-links witness-selector lead-digest field-roster',
};
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n');

const entries = readdirSync(own).filter(name => name.endsWith('.html') && !Object.hasOwn(galleries, name));
const assigned = Object.values(galleries).flatMap(ids => ids.split(' ').map(id => id === 'index' ? 'index.fragment.html' : id + '.html'));
if (entries.length !== assigned.length || entries.some(name => !assigned.includes(name))) {
  throw Error('Assign each worked fragment to exactly one gallery.');
}

for (const [filename, ids] of Object.entries(galleries)) {
  const file = join(own, filename);
  const parts = ids.split(' ').map(id => {
    const fragment = read(join(own, id === 'index' ? 'index.fragment.html' : id + '.html'));
    const match = fragment.match(/^\s*(<section\b[\s\S]*?<\/section>)\s*<style>([\s\S]+?)<\/style>\s*(<script type="module">[\s\S]+?<\/script>)?\s*$/);
    if (!match) throw Error('Invalid worked fragment: ' + id);
    let section = match[1];
    if (id === 'lead-digest') {
      // The gallery links two exhibits. Each standalone sample keeps its own anchors.
      section = section.replace('Close the gate behind you.</p>', 'Close the gate behind you. Visitors collecting mugs at the lane entrance can check <a href="#reeve-collection">Reeve Ceramics collection hours</a>.</p>');
    }
    return {section, css: match[2].trim(), module: match[3]};
  });
  const shell = read(file);
  const html = shell.replace(/(<style id="own-css">)[\s\S]*?<\/style>/, (_, tag) =>
    tag + '\n' + parts.map(p => p.css).join('\n\n') + '\n</style>')
    .replace(/(<main\b[^>]*>)[\s\S]*?<\/main>/, (_, tag) =>
      tag + '\n' + parts.map(p => p.section).join('\n\n') + '\n</main>')
    .replace(/(<script type="module" src="\.\.\/layout\/layout\.js"><\/script>)[\s\S]*?<\/body>/, (_, tag) =>
      tag + '\n' + parts.filter(p => p.module).map(p => p.module).join('\n') + '\n</body>');
  if (!parts.every(p => html.includes(p.section) && html.includes(p.css) && (!p.module || html.includes(p.module)))) {
    throw Error('Incomplete gallery shell: ' + filename);
  }
  writeFileSync(file, html);
  console.log(filename + ': ' + parts.length + ' worked sections');
}

const library = join(skill, 'references', 'sections-library.md');
const begin = '<!-- recipe index -->', end = '<!-- end recipe index -->';
const original = read(library);
const headings = [...original.matchAll(/^# ([^\n]+)$/gm)].slice(1);
const link = title => '[' + title + '](#' + title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replaceAll(' ', '-') + ')';
const links = headings.map(m => link(m[1])).join(' · ');
const block = begin + '\n' + links + '\n' + end;
const firstRecipe = '## What every recipe assumes';
const updated = original.includes(begin)
  ? original.replace(/<!-- recipe index -->[\s\S]*?<!-- end recipe index -->/, block)
  : original.replace(firstRecipe, block + '\n\n' + firstRecipe);
writeFileSync(library, updated);
console.log('Section library: ' + headings.length + ' recipe groups');

