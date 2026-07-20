import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkDrafts } from "../../../scripts/check-drafts.mjs";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(sourceRoot, "../../..");
const componentRoot = path.join(sourceRoot, "components");

const upstreamCount = 200;
const retainedCount = 4;
const rejectedCount = 196;
assert.equal(retainedCount + rejectedCount, upstreamCount);

const { total } = await checkDrafts(projectRoot, "ruixen-ui");
assert.equal(total, retainedCount);

const manifest = JSON.parse(
  await readFile(path.join(sourceRoot, "drafts.json"), "utf8"),
);
assert.deepEqual(
  manifest.items.map((item) => item.name),
  [
    "ruixen-spark-chart",
    "ruixen-chapter-scrubber",
    "ruixen-smart-paste-input",
    "ruixen-live-waveform",
  ],
);

for (const item of manifest.items) {
  assert.equal(
    item.meta.tasteblocks.source.revision,
    "3574611de5e9b914b959fc620cd5a9abace8a421",
  );
  assert.equal(item.meta.tasteblocks.license.spdx, "MIT");
  assert.equal(item.meta.tasteblocks.assets.length, 0);
}

const spark = await readFile(
  path.join(componentRoot, "ruixen-spark-chart/index.tsx"),
  "utf8",
);
for (const gate of [
  'role="slider"',
  "data.every(Number.isFinite)",
  'case "ArrowRight"',
  'case "Home"',
  "touch-pan-y",
  "setPointerCapture",
]) {
  assert(spark.includes(gate), `Spark Chart is missing ${gate}`);
}
assert(!spark.includes("spark-draw"));

const chapters = await readFile(
  path.join(componentRoot, "ruixen-chapter-scrubber/index.tsx"),
  "utf8",
);
for (const gate of [
  "useReducedMotion",
  'role="listbox"',
  'role="option"',
  "springPointer.jump(next)",
  "translate3d(",
  "onPointerCancel",
]) {
  assert(chapters.includes(gate), `Chapter Scrubber is missing ${gate}`);
}
assert(!/style=\{\{\s*width\s*[,}]/.test(chapters));

const paste = await readFile(
  path.join(componentRoot, "ruixen-smart-paste-input/index.tsx"),
  "utf8",
);
for (const gate of [
  "inputMaxHeight = Math.max(48, maxInputHeight)",
  'type="button"',
  "motion-reduce:transition-none",
  'aria-label={`Open attachment: ${title}`}',
  "event.nativeEvent.isComposing",
]) {
  assert(paste.includes(gate), `Smart Paste Input is missing ${gate}`);
}
assert(!paste.includes("transition-all"));

const waveform = await readFile(
  path.join(componentRoot, "ruixen-live-waveform/index.tsx"),
  "utf8",
);
for (const gate of [
  "prefers-reduced-motion: reduce",
  "IntersectionObserver",
  "visibilitychange",
  "Math.min(window.devicePixelRatio || 1, 1.5)",
  "onErrorRef.current?.(",
  'role="img"',
  'type="button"',
]) {
  assert(waveform.includes(gate), `Live Waveform is missing ${gate}`);
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(target)));
    else if (/\.(?:css|ts|tsx)$/.test(entry.name)) files.push(target);
  }
  return files;
}

const secretPattern =
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/;
const remoteAssetPattern =
  /(?:src|srcset|poster|url\()\s*[:=(]?\s*["']?https?:\/\//i;

for (const file of await sourceFiles(componentRoot)) {
  const content = await readFile(file, "utf8");
  assert.doesNotMatch(content, secretPattern, `${file} contains a possible secret`);
  assert.doesNotMatch(
    content,
    remoteAssetPattern,
    `${file} contains a remote runtime asset`,
  );
  assert.doesNotMatch(content, /[ \t]+$/m, `${file} has trailing whitespace`);
  assert.ok(content.endsWith("\n"), `${file} must end with a newline`);
}

console.log(
  `ruixen-ui: ${retainedCount} retained, ${rejectedCount} rejected; provenance, policy, interaction, motion, and source checks passed`,
);
