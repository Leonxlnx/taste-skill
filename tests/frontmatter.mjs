#!/usr/bin/env node
// Every skill must load in every agent. Claude Code and Codex read SKILL.md frontmatter with a strict
// YAML parser and silently drop a skill whose frontmatter fails to parse (an unquoted "word: word" in
// a description is enough), so this check parses each one the same way and fails loudly.
//
//   npm install --no-save --no-package-lock yaml@2.6.1   (once; CI does this)
//   node tests/frontmatter.mjs
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

let YAML;
try { YAML = await import('yaml'); } catch {
  console.error('This check needs the "yaml" package: npm install --no-save --no-package-lock yaml@2.6.1');
  process.exit(2);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(ROOT, 'skills');
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const parse = (text, where) => {
  const doc = YAML.parseDocument(text, { strict: true, uniqueKeys: true, prettyErrors: true });
  for (const e of [...doc.errors, ...doc.warnings]) fail(where, `YAML ${e.name}: ${e.message.split('\n')[0]}`);
  return doc.errors.length ? null : doc.toJS();
};

const names = new Map();
for (const dir of readdirSync(SKILLS)) {
  const file = join(SKILLS, dir, 'SKILL.md');
  if (!statSync(join(SKILLS, dir)).isDirectory() || !existsSync(file)) continue;
  const where = `skills/${dir}/SKILL.md`;
  const src = readFileSync(file, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) { fail(where, 'no frontmatter block (--- ... ---) at the top'); continue; }
  const fm = parse(m[1], where);
  if (!fm) continue;
  if (typeof fm.name !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name) || fm.name.length > 64) fail(where, `name must be kebab-case, 64 characters at most (got ${JSON.stringify(fm.name)})`);
  if (typeof fm.description !== 'string' || !fm.description.trim()) fail(where, 'description must be a non-empty string');
  else if (fm.description.length > 1024) fail(where, `description is ${fm.description.length} characters; agents allow 1024 at most`);
  if ('disable-model-invocation' in fm && typeof fm['disable-model-invocation'] !== 'boolean') fail(where, 'disable-model-invocation must be true or false');
  if (fm.name) { if (names.has(fm.name)) fail(where, `name "${fm.name}" is also used by ${names.get(fm.name)}`); else names.set(fm.name, where); }
  const openai = join(SKILLS, dir, 'agents', 'openai.yaml');
  if (existsSync(openai)) {
    const o = parse(readFileSync(openai, 'utf8'), `skills/${dir}/agents/openai.yaml`);
    if (o && o.policy && 'allow_implicit_invocation' in o.policy && typeof o.policy.allow_implicit_invocation !== 'boolean') fail(`skills/${dir}/agents/openai.yaml`, 'policy.allow_implicit_invocation must be true or false');
  }
}

// plugin manifests: valid JSON, every skill path they list exists, and they agree on the plugin's name and
// version (Claude Code installs the version in .claude-plugin/plugin.json over the marketplace entry's)
const isDir = p => existsSync(p) && statSync(p).isDirectory();
const holdsSkills = s => existsSync(join(ROOT, s, 'SKILL.md')) || (isDir(join(ROOT, s)) && readdirSync(join(ROOT, s)).some(d => existsSync(join(ROOT, s, d, 'SKILL.md'))));
const versions = new Map();
const manifests = {};
for (const rel of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json']) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  let j; try { j = JSON.parse(readFileSync(p, 'utf8')); } catch (e) { fail(rel, 'invalid JSON: ' + e.message); continue; }
  manifests[rel] = j;
  for (const plugin of rel.endsWith('plugin.json') ? [j] : j.plugins || []) {
    for (const s of [].concat(plugin.skills || [])) {
      if (!holdsSkills(s)) fail(rel, `plugin "${plugin.name}" lists ${s}, which has no SKILL.md`);
      if (rel.startsWith('.claude-plugin/') && !s.startsWith('./')) fail(rel, `plugin "${plugin.name}" lists ${s}; Claude Code needs a path that starts with ./`);
    }
    if (plugin.version === undefined) continue;
    const seen = versions.get(plugin.name);
    if (!seen) versions.set(plugin.name, { version: plugin.version, rel });
    else if (seen.version !== plugin.version) fail(rel, `plugin "${plugin.name}" is version ${plugin.version}, but ${seen.rel} says ${seen.version}`);
  }
}
const claudePlugin = manifests['.claude-plugin/plugin.json'], claudeMarket = manifests['.claude-plugin/marketplace.json'];
if (claudePlugin && claudeMarket) {
  const root = (claudeMarket.plugins || []).find(e => e.source === './' || e.source === '.');
  if (!root) fail('.claude-plugin/marketplace.json', 'no entry has source "./", so nothing installs .claude-plugin/plugin.json');
  else if (root.name !== claudePlugin.name) fail('.claude-plugin/plugin.json', `name "${claudePlugin.name}" differs from the marketplace entry "${root.name}"`);
}

// the default skill's data files
const lib = join(SKILLS, 'taste-skill', 'library');
if (existsSync(lib)) for (const f of readdirSync(lib)) if (f.endsWith('.json')) { try { JSON.parse(readFileSync(join(lib, f), 'utf8')); } catch (e) { fail(`skills/taste-skill/library/${f}`, 'invalid JSON: ' + e.message); } }

if (errors.length) {
  console.error(`not ok - ${errors.length} problem(s):`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}
console.log(`ok - ${names.size} skills load: every frontmatter parses, names are unique, manifests point at real skills`);
