import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registrySchema } from "shadcn/schema";
import ts from "typescript";
import { aggregateHash, sha256, structureHash } from "../../../scripts/policy-utils.mjs";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(sourceRoot, "../../..");
const previewRoot = path.join(root, "previews", "drafts", "animateicons");
const manifest = JSON.parse(await readFile(path.join(sourceRoot, "drafts.json"), "utf8"));
const report = JSON.parse(await readFile(path.join(sourceRoot, "dedupe-report.json"), "utf8"));
const expectedRevision = "380adb3b8eda68ee9c26e846ab8f9799d77f8815";
const expectedDrafts = 230;
const expectedDependencies = ["clsx@2.1.1", "motion@12.40.0", "tailwind-merge@3.6.0"];
const expectedIconImports = ["../../lib/utils", "motion/react", "react"];
const expectedHelperImports = ["clsx", "tailwind-merge"];
const expectedRightsExclusions = ["chrome", "facebook", "figma", "framer", "github", "gitlab", "instagram", "linkedin", "twitter"];
const expectedSemanticVariantExclusions = [
  "contact-round",
  "user-round",
  "user-round-check",
  "user-round-cog",
  "user-round-minus",
  "user-round-pen",
  "user-round-search",
  "user-round-x",
  "users-round",
];
const controlledMotionChange = "Guarded imperative startAnimation against isAnimated={false} and reduced-motion preferences.";
const whitespaceNormalizationChange = "Removed upstream-authored trailing spaces as a purely mechanical whitespace normalization with no rendered SVG change.";
const whitespaceRestorations = new Map([
  ["animateicons-headphones", [126, 127, 128]],
  ["animateicons-headphones-off", [138, 139, 140, 141]],
  ["animateicons-message-circle", [129, 130]],
]);
const forbidden = new Set(["block", "blocks", "dashboard", "layout", "page", "screen", "section", "template"]);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bxox[abprs]-[A-Za-z0-9-]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\b[rs]k_live_[0-9A-Za-z]{16,}\b/,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function duplicateGroups(records, key) {
  const groups = new Map();
  for (const record of records) {
    const names = groups.get(record[key]) ?? [];
    names.push(record.publicName);
    groups.set(record[key], names);
  }
  return [...groups.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([hash, names]) => ({ hash, names: names.sort() }))
    .sort((left, right) => left.hash.localeCompare(right.hash));
}

const ignoredGeometryAttributes = new Set([
  "animate", "class-name", "custom", "fill", "height", "initial", "key", "stroke", "stroke-linecap",
  "stroke-linejoin", "stroke-width", "style", "transform-origin", "transition", "variants", "view-box",
  "while-hover", "while-tap", "width", "xmlns",
]);

function geometryAttributes(source) {
  const attributes = [];
  const pattern = /([:\w-]+)\s*=\s*("[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})/g;
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1].replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).toLowerCase();
    if (ignoredGeometryAttributes.has(name)) continue;
    const value = match[2]
      .replace(/^["']|["']$/g, "")
      .replace(/^\{|\}$/g, "")
      .trim()
      .replace(/,\s*/g, ",")
      .replace(/\s+/g, " ");
    attributes.push(`${name}=${value}`);
  }
  return attributes.sort().join(";");
}

function geometryHash(source) {
  const primitives = [];
  const element = /<(?:m\.)?(path|line|circle|rect|polyline|polygon|ellipse)\b([^>]*)\/?\s*>/g;
  let match;
  while ((match = element.exec(source))) {
    if (/\b(?:d|points)=\{d\}/.test(match[2])) continue;
    primitives.push(`${match[1]}:${geometryAttributes(match[2])}`);
  }
  for (const paths of source.matchAll(/const\s+paths\s*=\s*\[([\s\S]*?)\];/g)) {
    for (const value of paths[1].matchAll(/["']([^"']+)["']/g)) {
      primitives.push(`path:d=${value[1].replace(/\s+/g, " ")}`);
    }
  }
  return `sha256:${digest(primitives.sort().join("|"))}`;
}

function svgMotionHash(source, exportName) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.JSX, source);
  const identifiers = new Map();
  const tokens = [];
  let token;
  while ((token = scanner.scan()) !== ts.SyntaxKind.EndOfFileToken) {
    const text = scanner.getTokenText();
    if (token === ts.SyntaxKind.Identifier) {
      if (!identifiers.has(text)) identifiers.set(text, `id${identifiers.size}`);
      tokens.push(`${token}:${identifiers.get(text)}`);
    } else if (token === ts.SyntaxKind.StringLiteral && text.slice(1, -1) === exportName) {
      tokens.push(`${token}:component-name`);
    } else {
      tokens.push(`${token}:${text}`);
    }
  }
  return `sha256:${digest(tokens.join("\n"))}`;
}

function restoreControlledMotion(source, itemName) {
  const hook = source.indexOf("useImperativeHandle(ref");
  const start = source.indexOf("startAnimation:", hook);
  const stop = source.indexOf("stopAnimation:", start);
  assert(hook >= 0 && start >= 0 && stop >= 0, `${itemName} has no imperative animation handle`);
  let segment = source.slice(start, stop);
  if (segment.includes('controls.start(!isAnimated || reduced ? "normal" : "animate")')) {
    segment = segment.replace('controls.start(!isAnimated || reduced ? "normal" : "animate")', 'controls.start("animate")');
  } else if (segment.includes("!isAnimated || reduced ?")) {
    segment = segment.replace("!isAnimated || reduced ?", "reduced ?");
  } else if (segment.includes("if (!isAnimated || reduced)")) {
    segment = segment.replace("if (!isAnimated || reduced)", "if (reduced)");
  } else {
    throw new Error(`${itemName} lacks the controlled-animation safety adaptation`);
  }
  return source.slice(0, start) + segment + source.slice(stop);
}

function restoreWhitespaceNormalization(source, itemName) {
  const lineNumbers = whitespaceRestorations.get(itemName);
  if (!lineNumbers) return source;
  const lines = source.split("\n");
  for (const lineNumber of lineNumbers) {
    assert(lines[lineNumber - 1] !== undefined, `${itemName} whitespace restoration line ${lineNumber} is missing`);
    assert(!/[ \t]$/.test(lines[lineNumber - 1]), `${itemName} whitespace restoration line ${lineNumber} is already dirty`);
    lines[lineNumber - 1] += " ";
  }
  return lines.join("\n");
}

registrySchema.parse(manifest);
assert(manifest.items.length === expectedDrafts, `Expected ${expectedDrafts} drafts, got ${manifest.items.length}`);
assert(report.inventoryEntries === 248 && report.mappedSourceFiles === 248, "Inventory/source mapping count changed");
assert(report.emittedDrafts === expectedDrafts && report.distinctNormalizedSvgMotionDrafts === expectedDrafts, "Emitted draft count changed");
assert(report.hugeInventoryEntriesExcluded === 33 && report.hugeFilesCopied === 0, "Huge exclusion report changed");
assert(
  JSON.stringify(report.brandGlyphRightsExclusions.map(({ inventoryName }) => inventoryName)) === JSON.stringify(expectedRightsExclusions),
  "Brand-glyph rights exclusions changed",
);
assert(
  report.retainedRightsDecisions.length === 1 && report.retainedRightsDecisions[0].inventoryName === "bitcoin",
  "Bitcoin rights decision changed",
);
assert(
  JSON.stringify(report.semanticVariantExclusions.map(({ inventoryName }) => inventoryName).sort()) === JSON.stringify(expectedSemanticVariantExclusions),
  "Semantic variant exclusions changed",
);
assert(
  manifest.items.length + report.brandGlyphRightsExclusions.length + report.semanticVariantExclusions.length === report.inventoryEntries,
  "Upstream inventory is not fully accounted for",
);

const helper = await readFile(path.join(sourceRoot, "lib", "utils.ts"));
const helperHash = sha256(helper);
const helperImports = [...new Set(ts.preProcessFile(helper.toString("utf8"), true, true).importedFiles.map(({ fileName }) => fileName))].sort();
assert(JSON.stringify(helperImports) === JSON.stringify(expectedHelperImports), "Bundled helper import closure changed");
const names = new Set();
const families = new Set();
const sourceHashes = new Set();
const contentHashes = new Set();
const records = [];
const strictTypecheckFiles = new Set([path.join(sourceRoot, "lib", "utils.ts")]);
let brandBlockers = 0;

for (const item of manifest.items) {
  assert(/^animateicons-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name), `${item.name} is not globally safe kebab-case`);
  const forbiddenIdentity = `${item.name} ${item.title}`.toLowerCase().split(/[^a-z0-9]+/).find((word) => forbidden.has(word));
  const strictIconIdentity = item.categories?.length === 1
    && item.categories[0] === "icons-microinteractions"
    && item.name.endsWith("-icon")
    && item.title.endsWith(" Icon")
    && item.meta?.tasteblocks?.renderer === "svg";
  assert(!forbiddenIdentity || strictIconIdentity, `${item.name} uses excluded ${forbiddenIdentity} terminology outside the SVG icon exception`);
  assert(!names.has(item.name), `${item.name} is duplicated`);
  names.add(item.name);
  assert(item.type === "registry:component", `${item.name} has the wrong registry type`);
  assert(item.categories?.length === 1 && item.categories[0] === "icons-microinteractions", `${item.name} has the wrong category`);
  assert(JSON.stringify(item.dependencies) === JSON.stringify(expectedDependencies), `${item.name} dependency closure changed`);
  assert(item.registryDependencies?.length === 0, `${item.name} unexpectedly has a registry dependency`);

  const tasteblocks = item.meta?.tasteblocks;
  assert(tasteblocks?.status === "draft", `${item.name} is not a draft`);
  assert(tasteblocks.renderer === "svg", `${item.name} has the wrong renderer`);
  assert(tasteblocks.source.revision === expectedRevision, `${item.name} has the wrong source revision`);
  assert(tasteblocks.source.files.length === 2 && item.files.length === 2, `${item.name} must ship one icon and one helper`);
  assert(tasteblocks.assets.length === 0, `${item.name} unexpectedly ships an asset`);
  assert(tasteblocks.rights.trademarkReviewRequired === false && tasteblocks.rights.notice === null, `${item.name} has an unresolved rights review`);
  assert(tasteblocks.verification.reviewedBy === null && tasteblocks.verification.reviewedAt === null, `${item.name} is unexpectedly reviewed`);

  const iconMap = tasteblocks.source.files.find(({ upstreamPath }) => upstreamPath.startsWith("icons/lucide/"));
  const helperMap = tasteblocks.source.files.find(({ upstreamPath }) => upstreamPath === "lib/utils.ts");
  assert(iconMap && helperMap, `${item.name} source mapping is incomplete`);
  assert(!tasteblocks.source.files.some(({ upstreamPath }) => upstreamPath.includes("/huge/")), `${item.name} references excluded Huge source`);

  const iconFile = item.files.find(({ path: file }) => file === iconMap.shippedPath);
  const helperFile = item.files.find(({ path: file }) => file === helperMap.shippedPath);
  assert(iconFile && helperFile, `${item.name} files do not map one-to-one`);
  assert(iconFile.target === `@components/taste-blocks/${item.name}.tsx`, `${item.name} component target changed`);
  assert(helperFile.target === "@lib/utils.ts", `${item.name} helper target changed`);
  assert(tasteblocks.modifications.length === 1, `${item.name} must document its file adaptations in one object record`);
  const modification = tasteblocks.modifications[0];
  assert(modification && typeof modification === "object" && !Array.isArray(modification), `${item.name} modification must be an object record`);
  assert(modification.shippedPath === iconMap.shippedPath, `${item.name} modification path is stale`);
  const expectedChangeCount = whitespaceRestorations.has(item.name) ? 3 : 2;
  assert(iconMap.changes.length === expectedChangeCount && iconMap.changes[1] === controlledMotionChange, `${item.name} source changes are incomplete`);
  assert(
    whitespaceRestorations.has(item.name) ? iconMap.changes[2] === whitespaceNormalizationChange : !iconMap.changes.includes(whitespaceNormalizationChange),
    `${item.name} whitespace normalization provenance is incorrect`,
  );
  assert(iconMap.changes.every((change) => modification.change.includes(change)), `${item.name} modification record is incomplete`);
  assert(typeof modification.reason === "string" && modification.reason.length > 0, `${item.name} modification reason is missing`);
  const icon = await readFile(path.join(sourceRoot, iconFile.path));
  const iconText = icon.toString("utf8");
  strictTypecheckFiles.add(path.join(sourceRoot, iconFile.path));
  assert(ts.createSourceFile(iconFile.path, iconText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).parseDiagnostics.length === 0, `${item.name} has TSX syntax errors`);
  assert(!/[ \t]+$/m.test(iconText), `${item.name} contains trailing whitespace`);
  const iconImports = [...new Set(ts.preProcessFile(iconText, true, true).importedFiles.map(({ fileName }) => fileName))].sort();
  assert(JSON.stringify(iconImports) === JSON.stringify(expectedIconImports), `${item.name} import closure changed`);
  assert((iconText.match(/from "\.\.\/\.\.\/lib\/utils"/g) ?? []).length === 1, `${item.name} lacks the single documented cn import adaptation`);
  assert(iconText.includes("useReducedMotion"), `${item.name} lost reduced-motion handling`);
  const imperativeHandleIndex = iconText.indexOf("useImperativeHandle(ref");
  const imperativeStartIndex = iconText.indexOf("startAnimation:", imperativeHandleIndex);
  const imperativeStopIndex = iconText.indexOf("stopAnimation:", imperativeStartIndex);
  const imperativeEndIndex = iconText.indexOf("\n   };", imperativeStopIndex);
  const imperativeStart = iconText.slice(imperativeStartIndex, imperativeStopIndex);
  const imperativeStop = iconText.slice(imperativeStopIndex, imperativeEndIndex);
  assert(imperativeStart.includes("isAnimated") && imperativeStart.includes("reduced"), `${item.name} controlled animation ignores disablement or reduced motion`);
  const stopStates = [...imperativeStop.matchAll(/\.start\("([^"]+)"\)/g)].map(([, state]) => state);
  assert(stopStates.length > 0, `${item.name} controlled stop has no animation reset`);
  assert(stopStates.every((state) => ["normal", "open", "center", "visible"].includes(state)), `${item.name} controlled stop does not restore a resting state`);
  assert(iconText.includes("if (!isAnimated || reduced) return;"), `${item.name} hover animation ignores disablement or reduced motion`);
  assert(!/from\s+["'](?:https?:|[^"']*huge)/i.test(iconText), `${item.name} crosses the source boundary`);
  assert(!/\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/.test(iconText), `${item.name} performs an unexpected remote request`);

  const restored = Buffer.from(
    restoreWhitespaceNormalization(restoreControlledMotion(iconText, item.name), item.name)
      .replace('from "../../lib/utils"', 'from "@/lib/utils"'),
  );
  assert(sha256(restored) === iconMap.upstreamSha256, `${item.name} differs from upstream beyond the two documented adaptations`);
  assert(sha256(icon) === iconMap.contentSha256, `${item.name} content hash is stale`);
  assert(helperMap.upstreamSha256 === helperHash && helperMap.contentSha256 === helperHash, `${item.name} helper hash is stale`);

  const upstreamHashes = [iconMap.upstreamSha256, helperMap.upstreamSha256];
  const shippedHashes = [iconMap.contentSha256, helperMap.contentSha256];
  assert(tasteblocks.dedupe.sourceHash === aggregateHash(upstreamHashes), `${item.name} aggregate source hash is stale`);
  assert(tasteblocks.dedupe.contentHash === aggregateHash(shippedHashes), `${item.name} aggregate content hash is stale`);
  assert(
    tasteblocks.dedupe.structureHash === structureHash([{ path: iconFile.path, content: icon }, { path: helperFile.path, content: helper }]),
    `${item.name} shared-policy structure hash is stale`,
  );
  assert(!sourceHashes.has(tasteblocks.dedupe.sourceHash), `${item.name} duplicates an aggregate source hash`);
  assert(!contentHashes.has(tasteblocks.dedupe.contentHash), `${item.name} duplicates an aggregate content hash`);
  assert(!families.has(tasteblocks.dedupe.family), `${item.name} duplicates a behavior family`);
  sourceHashes.add(tasteblocks.dedupe.sourceHash);
  contentHashes.add(tasteblocks.dedupe.contentHash);
  families.add(tasteblocks.dedupe.family);

  const exportName = /export \{ ([A-Za-z0-9]+) \};/.exec(iconText)?.[1];
  assert(exportName, `${item.name} has no real named export`);
  const previewPath = path.join(root, tasteblocks.preview);
  const preview = await readFile(previewPath, "utf8");
  strictTypecheckFiles.add(previewPath);
  assert(ts.createSourceFile(tasteblocks.preview, preview, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).parseDiagnostics.length === 0, `${item.name} preview has TSX syntax errors`);
  assert(!/[ \t]+$/m.test(preview), `${item.name} preview contains trailing whitespace`);
  const expectedImport = `@/registry/sources/animateicons/${iconFile.path.replace(/\.tsx$/, "")}`;
  const previewImports = [...new Set(ts.preProcessFile(preview, true, true).importedFiles.map(({ fileName }) => fileName))].sort();
  assert(JSON.stringify(previewImports) === JSON.stringify([expectedImport, "react"].sort()), `${item.name} preview import closure changed`);
  assert(preview.includes(`import { ${exportName} } from "${expectedImport}";`), `${item.name} preview does not import the real copied export`);
  assert(preview.includes(`<${exportName}`), `${item.name} preview does not render the real copied export`);
  for (const marker of [
    "<button",
    'type="button"',
    "aria-label=",
    "useRef<AnimationHandle>(null)",
    "onFocus={start}",
    "onBlur={stop}",
    "onPointerEnter={start}",
    "onPointerLeave={stop}",
    "onPointerDown={start}",
    "onPointerUp={stop}",
    "onPointerCancel={stop}",
    `ref={icon}`,
    'aria-hidden="true"',
  ]) {
    assert(preview.includes(marker), `${item.name} preview lacks controlled focus/pointer behavior: ${marker}`);
  }
  assert(!/\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/.test(preview), `${item.name} preview performs an unexpected remote request`);

  const evidence = tasteblocks.license.evidence;
  assert(sha256(await readFile(path.join(root, evidence.localPath))) === evidence.sha256, `${item.name} AnimateIcons license hash is stale`);
  for (const notice of tasteblocks.license.noticeEvidence) {
    assert(sha256(await readFile(path.join(root, notice.localPath))) === notice.sha256, `${item.name} notice hash is stale for ${notice.localPath}`);
  }
  if (tasteblocks.rights.trademarkReviewRequired) brandBlockers += 1;
  for (const pattern of secretPatterns) {
    assert(!pattern.test(iconText), `${item.name} source contains a possible secret`);
    assert(!pattern.test(preview), `${item.name} preview contains a possible secret`);
  }

  records.push({
    publicName: item.name,
    upstreamIconHash: iconMap.upstreamSha256,
    contentIconHash: iconMap.contentSha256,
    structureHash: tasteblocks.dedupe.structureHash,
    geometryHash: geometryHash(iconText),
    svgMotionHash: svgMotionHash(iconText, exportName),
  });
}

assert((await readdir(path.join(sourceRoot, "components"))).length === manifest.items.length, "Component directory count changed");
assert((await readdir(previewRoot)).filter((file) => file.endsWith(".tsx")).length === manifest.items.length, "Preview count changed");
assert(brandBlockers === report.brandGlyphPromotionBlockers.length, "Brand blocker count changed");
assert(brandBlockers === 0, "A brand-glyph rights blocker remains in the draft batch");
assert(report.aliasExclusions.length === 0, "Unexpected alias exclusion appeared");
assert(report.sourceNameAliases.length === 10, "Source-name alias inventory changed");

const recomputed = {
  rawUpstreamSource: duplicateGroups(records, "upstreamIconHash"),
  shippedContent: duplicateGroups(records, "contentIconHash"),
  normalizedSvgGeometry: duplicateGroups(records, "geometryHash"),
  normalizedSvgMotion: duplicateGroups(records, "svgMotionHash"),
  sharedPolicyStructure: duplicateGroups(records, "structureHash"),
};
assert(JSON.stringify(recomputed) === JSON.stringify(report.duplicateGroups), "Dedupe report is stale");
assert(recomputed.rawUpstreamSource.length === 0, "Raw source duplicates remain");
assert(recomputed.shippedContent.length === 0, "Shipped content duplicates remain");
assert(recomputed.normalizedSvgGeometry.length === 0, "Normalized SVG geometry aliases remain");
assert(recomputed.normalizedSvgMotion.length === 0, "Normalized SVG+motion aliases remain");

const configPath = path.join(root, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
assert(!configFile.error, `Could not read tsconfig.json: ${configFile.error?.messageText}`);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  root,
  { incremental: false, noEmit: true },
  configPath,
);
assert(parsedConfig.errors.length === 0, `Could not parse tsconfig.json: ${parsedConfig.errors.map(({ messageText }) => messageText).join("; ")}`);
const typecheckProgram = ts.createProgram({ rootNames: [...strictTypecheckFiles], options: parsedConfig.options });
const typecheckDiagnostics = ts.getPreEmitDiagnostics(typecheckProgram);
assert(
  typecheckDiagnostics.length === 0,
  `Strict TypeScript closure failed:\n${ts.formatDiagnostics(typecheckDiagnostics, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => "\n",
  })}`,
);

console.log(JSON.stringify({
  drafts: manifest.items.length,
  strictTypeScriptFiles: strictTypecheckFiles.size,
  whitespaceNormalizedDrafts: whitespaceRestorations.size,
  trailingWhitespaceLines: 0,
  sourceNameAliases: report.sourceNameAliases.length,
  aliasExclusions: report.aliasExclusions.length,
  normalizedSvgGeometryDuplicateGroups: recomputed.normalizedSvgGeometry.length,
  normalizedSvgMotionDuplicateGroups: recomputed.normalizedSvgMotion.length,
  sharedPolicyStructureReviewGroups: recomputed.sharedPolicyStructure.length,
  brandGlyphPromotionBlockers: brandBlockers,
  brandGlyphRightsExclusions: report.brandGlyphRightsExclusions.length,
  semanticVariantExclusions: report.semanticVariantExclusions.length,
  retainedCurrencyGlyphs: report.retainedRightsDecisions.length,
  hugeInventoryEntriesExcluded: report.hugeInventoryEntriesExcluded,
  secretsFound: 0,
}, null, 2));
