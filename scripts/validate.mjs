#!/usr/bin/env node
// Validates repo consistency: plugin manifests, SKILL.md frontmatter,
// and that skill.sh / skills/llms.txt stay in sync with skills/*.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(join(root, p), "utf8");

// 1. Plugin manifests parse and agree on version.
const manifests = {};
for (const file of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"]) {
  try {
    manifests[file] = JSON.parse(read(file));
  } catch (e) {
    fail(`${file}: invalid JSON (${e.message})`);
  }
}
const plugin = manifests[".claude-plugin/plugin.json"];
const market = manifests[".claude-plugin/marketplace.json"];
if (plugin && market) {
  const entry = market.plugins?.find((p) => p.name === plugin.name);
  if (!entry) fail(`marketplace.json: no plugin entry named "${plugin.name}"`);
  else if (entry.version !== plugin.version)
    fail(`version mismatch: plugin.json ${plugin.version} vs marketplace.json ${entry.version}`);
}

// 2. Every skills/<dir>/SKILL.md has frontmatter with a unique name + description.
const skillDirs = readdirSync(join(root, "skills")).filter((d) =>
  statSync(join(root, "skills", d)).isDirectory()
);
const seenNames = new Map();
for (const dir of skillDirs) {
  const rel = `skills/${dir}/SKILL.md`;
  if (!existsSync(join(root, rel))) {
    fail(`${rel}: missing`);
    continue;
  }
  const match = read(rel).match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    fail(`${rel}: missing YAML frontmatter`);
    continue;
  }
  const fields = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((l) => l.match(/^([A-Za-z_-]+):\s*(.*)$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].trim()])
  );
  for (const key of ["name", "description"]) {
    if (!fields[key]) fail(`${rel}: frontmatter missing "${key}"`);
  }
  if (fields.name) {
    if (seenNames.has(fields.name))
      fail(`${rel}: duplicate skill name "${fields.name}" (also in ${seenNames.get(fields.name)})`);
    seenNames.set(fields.name, rel);
  }
}

// 3. skill.sh registry points at real files and covers every skill dir.
const registry = [...read("skill.sh").matchAll(/^\s*\[([^\]]+)\]="([^"]+)"/gm)].map((m) => ({
  key: m[1],
  path: m[2],
}));
for (const { key, path } of registry) {
  if (!existsSync(join(root, path))) fail(`skill.sh: [${key}] points to missing ${path}`);
}
const registeredDirs = new Set(registry.map((r) => r.path.split("/")[1]));
for (const dir of skillDirs) {
  if (!registeredDirs.has(dir)) fail(`skill.sh: skills/${dir} is not registered`);
}

// 4. skills/llms.txt lists exactly the skill.sh keys.
const llmsKeys = new Set(
  read("skills/llms.txt")
    .split(/\r?\n/)
    .map((l) => l.match(/^([\w-]+):/)?.[1])
    .filter(Boolean)
);
const registryKeys = new Set(registry.map((r) => r.key));
for (const k of registryKeys) if (!llmsKeys.has(k)) fail(`skills/llms.txt: missing entry for "${k}"`);
for (const k of llmsKeys) if (!registryKeys.has(k)) fail(`skills/llms.txt: "${k}" not in skill.sh`);

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK: ${skillDirs.length} skills, ${registry.length} registry entries, manifests valid.`);
