import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { registrySchema } from "shadcn/schema";
import ts from "typescript";

import { aggregateHash, sha256, structureHash } from "../../../scripts/policy-utils.mjs";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(sourceRoot, "../../..");
const previewRoot = path.join(root, "previews/drafts/lucide-animated");
const upstreamRoot = process.env.LUCIDE_ANIMATED_UPSTREAM_ROOT;
const lucideRoot = process.env.LUCIDE_UPSTREAM_ROOT;
const deepUpstreamGitChecks = Boolean(upstreamRoot && lucideRoot);
const revision = "8989db1262cdd3a95d22b2b2336fcb556dd9b37f";
const lucideRevision = "3c62e4bfef50fb88dd9618439b46811af912ba4a";
const expectedDrafts = 31;
const expectedDependencies = ["clsx@2.1.1", "motion@12.40.0", "tailwind-merge@3.6.0"];
const retimedPhysicsItems = new Set(["contrast", "frame", "gauge", "history", "hourglass", "mailbox", "nfc"]);
const expectedReasonCounts = {
  autoplay: 1,
  "brand-rights": 12,
  "direction-style-state-pack": 92,
  "existing-semantic": 63,
  loop: 39,
  "motion-shorthand": 110,
  "quality-or-motion-template": 25,
  "scale-zero": 5,
  "semantic-alias": 14,
  "unclear-or-non-lucide-geometry": 2,
  "whole-svg-template-motion": 45,
};
const expectedLicenses = {
  LICENSE: "b77c01c81935b05f8f5ec43652cd6a29675e1b1b7505ac66cd9ac1f4ef4ac3ef",
  LUCIDE_LICENSE: "b495047bd93a9b06913511076f504daba17d5bbeb3e0650f3bb53a4220329c57",
  "BRAND_LOGOS_STATEMENT.md": "047e3df18f621e50c1b8a56c5e1fa591069d1c70f1d8124683f459bbeb25630c",
  NOTICE: "6014a8c793832691319bae3f3c5439487b03c9fd0ddeffad56a14c4530639971",
};
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bxox[abprs]-[A-Za-z0-9-]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function gitBlob(repositoryRoot, revisionValue, upstreamPath) {
  return execFileSync("git", ["-C", repositoryRoot, "show", `${revisionValue}:${upstreamPath}`]);
}

function gitBlobSha(repositoryRoot, revisionValue, upstreamPath) {
  return execFileSync("git", ["-C", repositoryRoot, "rev-parse", `${revisionValue}:${upstreamPath}`], { encoding: "utf8" }).trim();
}

const manifest = registrySchema.parse(JSON.parse(await readFile(path.join(sourceRoot, "drafts.json"), "utf8")));
const report = JSON.parse(await readFile(path.join(sourceRoot, "dedupe-report.json"), "utf8"));
assert(manifest.items.length === expectedDrafts, `Expected ${expectedDrafts} drafts`);
assert(report.upstreamComponents === 439 && report.retained === expectedDrafts && report.rejected === 408, "Upstream accounting changed");
assert(JSON.stringify(report.rejectionReasonCounts) === JSON.stringify(expectedReasonCounts), "Rejection accounting changed");
assert(report.brandExclusions.length === 12, "Expected 12 brand exclusions");
assert(report.comparison.manifestCount >= 43, "Existing manifest scan is incomplete");
assert(report.comparison.animatedIconItemsScanned >= 266, "Existing animated-icon scan is incomplete");
assert(report.comparison.especially.animateicons === 230 && report.comparison.especially.heroiconsAnimated === 30, "Priority comparison counts changed");
assert(report.comparison.rasterAudit.compared === 297 && report.comparison.rasterAudit.collisions === 0, "Raster audit evidence changed");
for (const [kind, values] of Object.entries(report.comparison.collisions)) assert(values.length === 0, `${kind} collision remains`);
assert(new Set(report.selected).size === expectedDrafts, "Selected names are duplicated");
const rejectedNames = Object.values(report.rejectedByReason).flat();
assert(new Set(rejectedNames).size === 408, "Rejected names are duplicated");
assert(report.selected.every((name) => !rejectedNames.includes(name)), "Selected and rejected names overlap");
assert(Boolean(upstreamRoot) === Boolean(lucideRoot), "Set both LUCIDE_ANIMATED_UPSTREAM_ROOT and LUCIDE_UPSTREAM_ROOT for deep Git checks");
for (const [file, expected] of Object.entries(expectedLicenses)) {
  assert(digest(await readFile(path.join(sourceRoot, file))) === expected, `${file} changed`);
}
assert((await readFile(path.join(sourceRoot, "LUCIDE_LICENSE"), "utf8")).includes("The MIT License (MIT) (for the icons listed above)"), "Feather MIT notice is missing");

if (deepUpstreamGitChecks) {
  const upstreamInventory = execFileSync("git", ["-C", upstreamRoot, "ls-tree", "-r", "--name-only", revision, "icons"], { encoding: "utf8" })
    .trim().split(/\r?\n/).filter((file) => /^icons\/[a-z0-9-]+\.tsx$/.test(file));
  assert(upstreamInventory.length === 439, "Pinned upstream no longer resolves to 439 components");
  assert(gitBlobSha(upstreamRoot, revision, "LICENSE") === "6148b13f96d4f184806bb27116d46b27062bba5b", "Lucide Animated license blob changed");
  assert(sha256(gitBlob(upstreamRoot, revision, "LICENSE")) === `sha256:${expectedLicenses.LICENSE}`, "Local Lucide Animated license differs from Git");
  assert(gitBlobSha(lucideRoot, lucideRevision, "LICENSE") === "718bb3f0e44153809972abed31839375804bf652", "Lucide license blob changed");
  assert(sha256(gitBlob(lucideRoot, lucideRevision, "LICENSE")) === `sha256:${expectedLicenses.LUCIDE_LICENSE}`, "Local Lucide license differs from Git");
  assert(gitBlobSha(lucideRoot, lucideRevision, "BRAND_LOGOS_STATEMENT.md") === "6a7404c79b20f6d1fd1d414c052a78c550bf74d5", "Lucide brand-policy blob changed");
  assert(sha256(gitBlob(lucideRoot, lucideRevision, "BRAND_LOGOS_STATEMENT.md")) === `sha256:${expectedLicenses["BRAND_LOGOS_STATEMENT.md"]}`, "Local brand policy differs from Git");
}

const helper = await readFile(path.join(sourceRoot, "lib/utils.ts"));
const helperHash = sha256(helper);
if (deepUpstreamGitChecks) assert(helperHash === sha256(gitBlob(upstreamRoot, revision, "lib/utils.ts")), "Bundled helper differs from its pinned Git blob");
const strictTypecheckFiles = new Set([path.join(sourceRoot, "lib/utils.ts")]);
const names = new Set();
const families = new Set();
const sourceHashes = new Set();
const contentHashes = new Set();

for (const item of manifest.items) {
  assert(/^lucide-animated-[a-z0-9]+(?:-[a-z0-9]+)*-icon$/.test(item.name), `${item.name} is not globally safe kebab-case`);
  assert(!names.has(item.name), `${item.name} is duplicated`);
  names.add(item.name);
  assert(item.type === "registry:component", `${item.name} has the wrong type`);
  assert(JSON.stringify(item.dependencies) === JSON.stringify(expectedDependencies), `${item.name} dependency closure changed`);
  assert(item.registryDependencies.length === 0, `${item.name} unexpectedly has registry dependencies`);
  assert(item.categories.length === 1 && item.categories[0] === "icons-microinteractions", `${item.name} has the wrong category`);

  const tasteblocks = item.meta.tasteblocks;
  assert(tasteblocks.status === "draft" && tasteblocks.renderer === "svg", `${item.name} is not an SVG draft`);
  assert(tasteblocks.source.revision === revision, `${item.name} has the wrong source revision`);
  assert(tasteblocks.source.files.length === 2 && item.files.length === 2, `${item.name} must ship one icon and one helper`);
  assert(tasteblocks.assets.length === 0, `${item.name} unexpectedly ships assets`);
  assert(tasteblocks.rights.trademarkReviewRequired === false && tasteblocks.rights.notice === null, `${item.name} has unresolved rights review`);

  const iconMap = tasteblocks.source.files.find(({ upstreamPath }) => upstreamPath.startsWith("icons/"));
  const helperMap = tasteblocks.source.files.find(({ upstreamPath }) => upstreamPath === "lib/utils.ts");
  assert(iconMap && helperMap, `${item.name} source map is incomplete`);
  assert(/^[a-f0-9]{40}$/.test(iconMap.upstreamGitBlobSha), `${item.name} lacks its Git blob SHA`);
  assert(/^sha256:[a-f0-9]{64}$/.test(iconMap.upstreamSha256), `${item.name} lacks its upstream SHA-256`);
  if (deepUpstreamGitChecks) {
    assert(gitBlobSha(upstreamRoot, revision, iconMap.upstreamPath) === iconMap.upstreamGitBlobSha, `${item.name} Git blob SHA is stale`);
    const upstream = gitBlob(upstreamRoot, revision, iconMap.upstreamPath);
    assert(sha256(upstream) === iconMap.upstreamSha256, `${item.name} upstream SHA-256 is stale`);
  }
  assert(helperMap.upstreamGitBlobSha === "88283f0133e161af61a96d8d8d14309591369aac", `${item.name} helper Git blob SHA changed`);
  assert(helperMap.upstreamSha256 === helperHash && helperMap.contentSha256 === helperHash, `${item.name} helper hash changed`);

  const iconFile = item.files.find(({ path: file }) => file === iconMap.shippedPath);
  const helperFile = item.files.find(({ path: file }) => file === helperMap.shippedPath);
  assert(iconFile && helperFile, `${item.name} files do not map one-to-one`);
  const icon = await readFile(path.join(sourceRoot, iconFile.path));
  const iconText = icon.toString("utf8");
  strictTypecheckFiles.add(path.join(sourceRoot, iconFile.path));
  assert(sha256(icon) === iconMap.contentSha256, `${item.name} content hash is stale`);
  assert(!/[ \t]+$/m.test(iconText), `${item.name} has trailing whitespace`);
  assert(ts.createSourceFile(iconFile.path, iconText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).parseDiagnostics.length === 0, `${item.name} has TSX syntax errors`);
  const imports = [...new Set(ts.preProcessFile(iconText, true, true).importedFiles.map(({ fileName }) => fileName))].sort();
  assert(JSON.stringify(imports) === JSON.stringify(["../../lib/utils", "motion/react", "react"]), `${item.name} import closure changed`);
  for (const marker of ["useReducedMotion", "isAnimated?: boolean", "!isAnimated || reduced", "[controls, isAnimated, onMouseEnter, reduced]"]) {
    assert(iconText.includes(marker), `${item.name} misses ${marker}`);
  }
  assert(!/^\s*(?:x|y|scale)\s*:/m.test(iconText), `${item.name} contains Motion shorthand`);
  assert(!/^\s*scale\s*:\s*0\b/m.test(iconText), `${item.name} contains scale zero`);
  assert(!/<motion\.svg\b/.test(iconText), `${item.name} animates the whole SVG`);
  assert(!/repeat\s*:\s*(?:Number\.POSITIVE_INFINITY|Infinity|-1)/.test(iconText), `${item.name} loops`);
  assert(!/\btype:\s*["']spring["']|\b(?:stiffness|damping|mass):/.test(iconText), `${item.name} contains unbounded physics timing`);
  assert(!/^(?:await |controls\.|if \()/m.test(iconText), `${item.name} contains malformed generated indentation`);
  assert(!/\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/.test(iconText), `${item.name} performs a remote request`);
  for (const match of iconText.matchAll(/\b(duration|delay):\s*(\d+(?:\.\d+)?)/g)) {
    const limit = match[1] === "duration" ? 0.28 : 0.08;
    assert(Number(match[2]) <= limit, `${item.name} exceeds its ${match[1]} budget`);
  }
  for (const match of iconText.matchAll(/delay:\s*(?:(\w+)\s*\*\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*\*\s*(\w+))/g)) {
    assert(Number(match[2] ?? match[3]) <= 0.04, `${item.name} exceeds its stagger budget`);
  }
  assert(!/delay:\s*custom\b/.test(iconText), `${item.name} has an unbounded custom delay`);
  const inventoryName = tasteblocks.dedupe.glyph.inventoryName;
  if (retimedPhysicsItems.has(inventoryName)) {
    assert(iconMap.changes.some((change) => change.includes("280ms durations")), `${item.name} does not document physics retiming`);
  }
  for (const pattern of secretPatterns) assert(!pattern.test(iconText), `${item.name} contains a possible secret`);

  const upstreamHashes = [iconMap.upstreamSha256, helperMap.upstreamSha256];
  const shippedHashes = [iconMap.contentSha256, helperMap.contentSha256];
  assert(tasteblocks.dedupe.sourceHash === aggregateHash(upstreamHashes), `${item.name} aggregate source hash is stale`);
  assert(tasteblocks.dedupe.contentHash === aggregateHash(shippedHashes), `${item.name} aggregate content hash is stale`);
  assert(tasteblocks.dedupe.structureHash === structureHash([
    { path: `registry/sources/lucide-animated/${iconFile.path}`, content: icon },
    { path: "registry/sources/lucide-animated/lib/utils.ts", content: helper },
  ]), `${item.name} structure hash is stale`);
  assert(!families.has(tasteblocks.dedupe.family), `${item.name} family is duplicated`);
  assert(!sourceHashes.has(tasteblocks.dedupe.sourceHash), `${item.name} source is duplicated`);
  assert(!contentHashes.has(tasteblocks.dedupe.contentHash), `${item.name} content is duplicated`);
  families.add(tasteblocks.dedupe.family);
  sourceHashes.add(tasteblocks.dedupe.sourceHash);
  contentHashes.add(tasteblocks.dedupe.contentHash);

  const exportName = /export \{ ([A-Za-z0-9]+) \};/.exec(iconText)?.[1];
  assert(exportName, `${item.name} has no named export`);
  const previewPath = path.join(root, tasteblocks.preview);
  const preview = await readFile(previewPath, "utf8");
  strictTypecheckFiles.add(previewPath);
  assert(ts.createSourceFile(previewPath, preview, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).parseDiagnostics.length === 0, `${item.name} preview has TSX errors`);
  const expectedImport = `@/registry/sources/lucide-animated/${iconFile.path.replace(/\.tsx$/, "")}`;
  assert(preview.includes(`import { ${exportName}, type `) && preview.includes(`from "${expectedImport}"`), `${item.name} preview does not import its real component`);
  for (const marker of ["<button", 'type="button"', "aria-label=", "touch-manipulation", "onFocus={start}", "onBlur={stop}", "onPointerEnter={start}", "onPointerLeave={stop}", "onPointerDown={start}", "onPointerUp={stop}", "onPointerCancel={stop}", "ref={icon}", 'aria-hidden="true"']) {
    assert(preview.includes(marker), `${item.name} preview misses ${marker}`);
  }
  for (const pattern of secretPatterns) assert(!pattern.test(preview), `${item.name} preview contains a possible secret`);
}

assert((await readdir(path.join(sourceRoot, "components"))).length === expectedDrafts, "Component directory count changed");
assert((await readdir(previewRoot)).filter((file) => file.endsWith(".tsx")).length === expectedDrafts, "Preview count changed");

const configPath = path.join(root, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
assert(!configFile.error, "Could not read tsconfig.json");
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root, { incremental: false, noEmit: true, strict: true }, configPath);
assert(parsedConfig.errors.length === 0, "Could not parse tsconfig.json");
const program = ts.createProgram({ rootNames: [...strictTypecheckFiles], options: parsedConfig.options });
const diagnostics = ts.getPreEmitDiagnostics(program);
assert(diagnostics.length === 0, `Strict TypeScript closure failed:\n${ts.formatDiagnostics(diagnostics, {
  getCanonicalFileName: (file) => file,
  getCurrentDirectory: () => root,
  getNewLine: () => "\n",
})}`);

console.log(JSON.stringify({ upstream: 439, retained: expectedDrafts, rejected: 408, manifestsCompared: report.comparison.manifestCount, existingAnimatedIconsCompared: report.comparison.animatedIconItemsScanned, strictTypeScriptFiles: strictTypecheckFiles.size, collisions: 0, brandsExcluded: 12, retimedPhysicsItems: retimedPhysicsItems.size, deepUpstreamGitChecks }, null, 2));
