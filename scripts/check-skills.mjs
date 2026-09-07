#!/usr/bin/env node
/**
 * Guards the invariants that broke this repo once already.
 *
 *   1. folder name === frontmatter `name`   (Claude Code registers by FOLDER;
 *      `npx skills add --skill` uses the frontmatter name. If they disagree,
 *      one of the two install paths is silently wrong.)
 *   2. every skill has a non-empty description of at most 1024 characters
 *   3. every `references/<file>.md` mentioned in a SKILL.md actually exists
 *   4. skills/llms.txt lists exactly the skills on disk
 *
 * Usage: node scripts/check-skills.mjs   (exit 1 on any failure)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = path.join(root, "skills");
const errors = [];

const folders = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const folder of folders) {
  const file = path.join(skillsDir, folder, "SKILL.md");
  if (!fs.existsSync(file)) {
    errors.push(`${folder}/: no SKILL.md`);
    continue;
  }
  const raw = fs.readFileSync(file, "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    errors.push(`${folder}/SKILL.md: missing YAML front-matter`);
    continue;
  }

  const name = fm[1].match(/^name:[ \t]*(.+)$/m)?.[1].trim();
  const description = fm[1].match(/^description:[ \t]*(.+)$/m)?.[1].trim();

  if (!name) errors.push(`${folder}/SKILL.md: no name`);
  else if (name !== folder)
    errors.push(
      `${folder}/SKILL.md: name "${name}" does not match its folder. ` +
        `Claude Code registers the FOLDER name, so "${name}" would never resolve.`
    );

  if (!description) errors.push(`${folder}/SKILL.md: no description`);
  else if (description.length > 1024)
    errors.push(`${folder}/SKILL.md: description is ${description.length} chars (max 1024)`);

  for (const [, ref] of raw.matchAll(/references\/([a-z0-9-]+\.md)/g)) {
    if (!fs.existsSync(path.join(skillsDir, folder, "references", ref)))
      errors.push(`${folder}/SKILL.md: points at references/${ref}, which does not exist`);
  }
}

const listed = fs
  .readFileSync(path.join(skillsDir, "llms.txt"), "utf8")
  .split("\n")
  .map((l) => l.match(/^([a-z0-9-]+):/)?.[1])
  .filter(Boolean)
  .sort();

for (const f of folders) if (!listed.includes(f)) errors.push(`llms.txt: missing "${f}"`);
for (const l of listed) if (!folders.includes(l)) errors.push(`llms.txt: stale entry "${l}"`);

if (errors.length) {
  console.error(`skills check FAILED (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`skills check passed: ${folders.length} skills, names and references consistent.`);
