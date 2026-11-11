#!/usr/bin/env node
// claude.ai refuses to sync a marketplace plugin that lists skills inline
// unless the entry has "strict": false or a .claude-plugin/plugin.json exists
// at the plugin source (see #200). The root plugin.json was removed on purpose
// in 2.1.1 so each marketplace entry can list its own skills.
//   node tests/marketplace.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const marketplace = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
const plugins = marketplace.plugins;
if (!Array.isArray(plugins) || plugins.length === 0) {
  console.error('not ok - marketplace.json has no plugins array');
  process.exit(1);
}

const bad = [];
for (const plugin of plugins) {
  const source = plugin.source || './';
  const manifest = join(ROOT, source, '.claude-plugin/plugin.json');
  if (!existsSync(manifest) && plugin.strict !== false) {
    bad.push(`${plugin.name || '(unnamed)'}: lists skills inline but has neither plugin.json nor "strict": false, so claude.ai cannot sync it`);
  }
}
if (bad.length) {
  console.error(`not ok - ${bad.length} marketplace plugin(s) would fail to sync:`);
  for (const b of bad) console.error('  ' + b);
  process.exit(1);
}
console.log('ok - marketplace plugin entries are syncable without a root plugin.json');
