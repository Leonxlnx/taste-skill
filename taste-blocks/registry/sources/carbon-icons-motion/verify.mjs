import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { registrySchema } from "shadcn/schema";
import sharp from "sharp";
import ts from "typescript";

import { aggregateHash, sha256, structureHash } from "../../../scripts/policy-utils.mjs";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(sourceRoot, "../../..");
const sourcesRoot = path.join(root, "registry/sources");
const previewRoot = path.join(root, "previews/drafts/carbon-icons-motion");
const upstreamRoot = process.env.CARBON_ICONS_MOTION_UPSTREAM;
const repository = "https://github.com/carbon-design-system/icons-motion";
const revision = "7e0a7459eb7d8f96fae0649e1450b65af7f75a2b";
const licenseHash = "sha256:c3c4a0200172f8e23c0ea6a0f2c105ac960721c542b63d5de5e9767d195c2e73";
const readmeHash = "sha256:3f0e1bd45dc58a966edb3f7ba76d1b0d9231ade1a7cae7b8d7ee36ca12130069";
const noticeHash = "sha256:95ab19a8acd4553d339b6b0fcfd7c9c93329ceccfa6713364f7a9e5ed42ead46";
const reportHash = "sha256:2d46b74fd74ccff0c033b2efb7367ea444701a71bb95f412faebc85d851f0339";
const expectedUpstreamHashes = {
  "src/components/Formatting/CropMotion/crop--motion.module.scss": "sha256:c92d017a51c97df3b5fc196b5a69cf5b17db62e3045f3da3f04e277da7b2e7e7",
  "src/components/Formatting/CropMotion/CropMotion.js": "sha256:908ceadafb3c1ea3160a170f373a45b11d53960ed876763d606507b61883e8c2",
  "src/components/Formatting/CutMotion/cut--motion.module.scss": "sha256:ac99ec0b3edac1b8f5d88b5f94545122ddf983df2231906527216aca5b104def",
  "src/components/Formatting/CutMotion/CutMotion.js": "sha256:434a33fc5763804fabec508d88adcbcf23c6230a7fce00ecf9933ab0973443ab",
  "src/components/Formatting/MagicWandMotion/magic-wand--motion.module.scss": "sha256:bb1da19d72f7f65a314556e1bcb1bbf6ebf1b66fe56fc8fb78a8970e1a0f5b3f",
  "src/components/Formatting/MagicWandMotion/MagicWandMotion.js": "sha256:80ccded6b1cd155630f7d0b87b0295c5cbfe2a03e48d61abda6725f640935d12",
  "src/components/Operations/CenterCircleMotion/center-circle--motion.module.scss": "sha256:73ac2c943d522c22b8a4ea631b3351148438583b583d0b9fa4ed29cdad77c9e0",
  "src/components/Operations/CenterCircleMotion/CenterCircleMotion.js": "sha256:6a7d42980b84d6a2de329de3d518afd5fdbb8334e8894bb473f6d7b29543238a",
  "src/components/Operations/ImageSearchMotion/image-search--motion.module.scss": "sha256:b5ce6efb455b0282c39ad24edcf8bf0de3125d181d0fa0362dde221b368c425a",
  "src/components/Operations/ImageSearchMotion/ImageSearchMotion.js": "sha256:69899936033bfbc4538940ea77d4fe58ec05e08f9d484e14c2f2ae4f0dc083a6",
  "src/components/Operations/SearchLocateMotion/search-locate--motion.module.scss": "sha256:ae25b92a74c650c158c4086b3b651481040c6bebefdc349ff54970990a95d16f",
  "src/components/Operations/SearchLocateMotion/SearchLocateMotion.js": "sha256:7508c017d80885f1d774675f62a03fed08534aaeedba44843c241e17e9cd6a3d",
};
const expectedReasons = {
  "loop-or-autoplay": 67,
  "static-or-no-motion": 2,
  "style-size-or-generated-variant": 37,
  "existing-catalog-equivalent": 26,
  "motion-poor-or-whole-glyph": 11,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function normalizeIdentity(value) {
  return value
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/\b(?:animated|animation|carbon|heroicons|animateicons|motion|icon)\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ignoredGeometryAttributes = new Set([
  "animate", "aria-hidden", "class-name", "custom", "fill", "height", "initial", "key", "role", "size", "stroke",
  "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-width", "style", "title", "transform-origin",
  "transition", "variants", "view-box", "while-hover", "while-tap", "width", "xmlns",
]);

function geometryHash(source) {
  const primitives = [];
  const element = /<(?:m\.|motion\.)?(path|line|circle|rect|polyline|polygon|ellipse)\b([^>]*)\/?\s*>/g;
  for (const match of source.matchAll(element)) {
    if (/\b(?:d|points)=\{[a-zA-Z_$][\w$]*\}/.test(match[2])) continue;
    const attributes = [];
    for (const attribute of match[2].matchAll(/([:\w-]+)\s*=\s*("[^"]*"|'[^']*')/g)) {
      const name = attribute[1].replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).toLowerCase();
      if (ignoredGeometryAttributes.has(name)) continue;
      attributes.push(`${name}=${attribute[2].slice(1, -1).replace(/,\s*/g, ",").replace(/\s+/g, " ").trim()}`);
    }
    primitives.push(`${match[1]}:${attributes.sort().join(";")}`);
  }
  for (const paths of source.matchAll(/const\s+paths\s*=\s*\[([\s\S]*?)\];/g)) {
    for (const value of paths[1].matchAll(/["']([^"']+)["']/g)) {
      primitives.push(`path:d=${value[1].replace(/\s+/g, " ")}`);
    }
  }
  return digest(primitives.sort().join("|"));
}

function motionHash(source) {
  const transforms = [...source.matchAll(/(?<!-)transform:\s*([^;\n}]+);?/g)]
    .map((match) => match[1].replace(/\s+/g, "").toLowerCase());
  return digest(transforms.join("|"));
}

function literalAttributes(source) {
  const attributes = [];
  for (const attribute of source.matchAll(/([:\w-]+)\s*=\s*("[^"]*"|'[^']*')/g)) {
    let name = attribute[1];
    if (name === "className" || name === "xmlns") continue;
    name = name === "viewBox" ? name : name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    let value = attribute[2].slice(1, -1).replaceAll("currentColor", "#000");
    if (name === "id" || value.includes("url(")) continue;
    attributes.push(`${name}="${value.replaceAll("&", "&amp;")}"`);
  }
  return attributes;
}

function staticSvg(source, css = "") {
  const opening = /<(?:m\.|motion\.)?svg\b([^>]*)>/.exec(source)?.[1] ?? "";
  const rootAttributes = literalAttributes(opening).filter((attribute) => !/^(?:height|width)=/.test(attribute));
  if (!rootAttributes.some((attribute) => attribute.startsWith("viewBox="))) rootAttributes.push('viewBox="0 0 24 24"');
  if (!rootAttributes.some((attribute) => attribute.startsWith("fill="))) rootAttributes.push('fill="#000"');
  const elements = [];
  for (const match of source.matchAll(/<(?:m\.|motion\.)?(path|line|circle|rect|polyline|polygon|ellipse)\b([^>]*)\/?\s*>/g)) {
    if (/\b(?:d|points)=\{[a-zA-Z_$][\w$]*\}/.test(match[2])) continue;
    const attributes = literalAttributes(match[2]);
    const className = /className=\{styles\.([A-Za-z0-9_]+)\}/.exec(match[2])?.[1];
    if (className) attributes.unshift(`class="${className}"`);
    elements.push(`<${match[1]} ${attributes.join(" ")}/>`);
  }
  for (const paths of source.matchAll(/const\s+paths\s*=\s*\[([\s\S]*?)\];/g)) {
    for (const value of paths[1].matchAll(/["']([^"']+)["']/g)) elements.push(`<path d="${value[1]}"/>`);
  }
  if (elements.length === 0) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" ${rootAttributes.join(" ")} width="64" height="64"><style>${css}</style>${elements.join("")}</svg>`;
}

async function raster(source, css = "") {
  const svg = staticSvg(source, css);
  if (!svg) return null;
  try {
    const pixels = await sharp(Buffer.from(svg))
      .resize(64, 64, { fit: "fill" })
      .flatten({ background: "#fff" })
      .grayscale()
      .raw()
      .toBuffer();
    return { hash: digest(pixels), pixels };
  } catch {
    return null;
  }
}

function normalizedRmse(left, right) {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) {
    const difference = left[index] - right[index];
    sum += difference * difference;
  }
  return Math.sqrt(sum / left.length) / 255;
}

async function existingCatalog() {
  const manifests = [];
  for (const entry of await readdir(sourcesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "carbon-icons-motion") continue;
    try {
      const manifest = JSON.parse(await readFile(path.join(sourcesRoot, entry.name, "drafts.json"), "utf8"));
      manifests.push({ manifest, source: entry.name });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  const records = [];
  for (const { manifest, source } of manifests) {
    for (const item of manifest.items) {
      const textFiles = [];
      for (const file of item.files ?? []) {
        if (!/\.(?:css|js|jsx|scss|ts|tsx)$/.test(file.path)) continue;
        textFiles.push(await readFile(path.join(sourcesRoot, source, file.path), "utf8"));
      }
      const sourceText = textFiles.filter((text) => /<(?:m\.|motion\.)?svg\b/.test(text)).join("\n");
      records.push({
        source,
        item,
        identities: new Set([
          item.name,
          item.title,
          item.meta?.tasteblocks?.dedupe?.glyph?.canonicalName,
          item.meta?.tasteblocks?.dedupe?.glyph?.inventoryName,
          ...(item.meta?.tasteblocks?.tags ?? []),
        ].filter(Boolean).map(normalizeIdentity).filter(Boolean)),
        geometryHash: sourceText ? geometryHash(sourceText) : null,
        motionHash: motionHash(textFiles.join("\n")),
        raster: sourceText ? await raster(sourceText) : null,
      });
    }
  }
  return { manifests, records };
}

const manifest = registrySchema.parse(JSON.parse(await readFile(path.join(sourceRoot, "drafts.json"), "utf8")));
const reportContent = await readFile(path.join(sourceRoot, "dedupe-report.json"));
const report = JSON.parse(reportContent.toString("utf8"));
const notice = await readFile(path.join(sourceRoot, "NOTICE"));
assert(manifest.items.length === 6, `Expected 6 retained icons, found ${manifest.items.length}`);
assert(sha256(await readFile(path.join(sourceRoot, "LICENSE"))) === licenseHash, "Apache-2.0 license hash changed");
assert(sha256(notice) === noticeHash, "Local NOTICE hash changed");
assert(notice.toString("utf8").includes("upstream commit has no NOTICE file"), "NOTICE does not record upstream NOTICE absence");
assert(sha256(reportContent) === reportHash, "Saved dedupe report hash changed");
assert(report.repository === repository && report.revision === revision, "Dedupe inventory source changed");
assert(report.upstreamExportedReactComponents === 151 && report.upstreamAnimatedIcons === 149, "Dedupe inventory totals changed");
assert(JSON.stringify(report.excludedNonIconHelpers) === JSON.stringify(["BadgeIcon", "BadgeIconContainer"]), "Helper exclusions changed");
for (const [reason, count] of Object.entries(expectedReasons)) {
  assert(report.rejectedByPrimaryReason[reason]?.length === count, `${reason} rejection count changed`);
}
const auditedMotionNames = [report.retained, ...Object.values(report.rejectedByPrimaryReason)].flat().sort();
assert(new Set(auditedMotionNames).size === 149, "Dedupe inventory contains duplicate decisions");
assert(report.retained.length === 6 && auditedMotionNames.length === 149, "Saved selection inventory is incomplete");

if (upstreamRoot) {
  assert(execFileSync("git", ["-C", upstreamRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() === revision, "Wrong upstream commit");
  assert(execFileSync("git", ["-C", upstreamRoot, "remote", "get-url", "origin"], { encoding: "utf8" }).trim() === `${repository}.git`, "Wrong upstream remote");
  assert(execFileSync("git", ["-C", upstreamRoot, "rev-parse", "refs/remotes/origin/main"], { encoding: "utf8" }).trim() === revision, "Pinned revision is not the fetched official main tip");
  assert(sha256(execFileSync("git", ["-C", upstreamRoot, "show", `${revision}:LICENSE`])) === licenseHash, "Upstream license hash changed");
  assert(sha256(execFileSync("git", ["-C", upstreamRoot, "show", `${revision}:README.md`])) === readmeHash, "README provenance hash changed");
  const upstreamIndex = execFileSync("git", ["-C", upstreamRoot, "show", `${revision}:src/index.js`], { encoding: "utf8" });
  const indexSource = ts.createSourceFile("src/index.js", upstreamIndex, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const exportedNames = indexSource.statements.flatMap((statement) =>
    ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)
      ? statement.exportClause.elements.map((element) => element.name.text)
      : [],
  );
  assert(exportedNames.length === 151 && new Set(exportedNames).size === 151, "Upstream exported component inventory changed");
  const upstreamTree = execFileSync("git", ["-C", upstreamRoot, "ls-tree", "-r", "--name-only", revision], { encoding: "utf8" })
    .split(/\r?\n/);
  const upstreamMotionNames = upstreamTree.flatMap((file) => {
    const match = /^src\/components\/[^/]+\/([^/]+Motion)\/([^/]+)\.js$/.exec(file);
    return match && match[1] === match[2] ? [match[1]] : [];
  }).sort();
  assert(upstreamMotionNames.length === 149, "Upstream Motion component inventory changed");
  assert(JSON.stringify(auditedMotionNames) === JSON.stringify(upstreamMotionNames), "Dedupe inventory does not account for every upstream Motion component");
  assert(!upstreamTree.some((file) => /(^|\/)NOTICE(?:\.|$)/i.test(file)), "Pinned upstream unexpectedly contains a NOTICE file");
}

const { manifests, records: existing } = await existingCatalog();
assert(existing.filter(({ source }) => source === "animateicons").length === 230, "AnimateIcons comparison inventory changed");
assert(existing.filter(({ source }) => source === "heroicons-animated").length === 30, "Heroicons Animated comparison inventory changed");
assert(existing.filter(({ source, raster: value }) => source === "animateicons" && value).length === 230, "AnimateIcons raster inventory is incomplete");
assert(existing.filter(({ source, raster: value }) => source === "heroicons-animated" && value).length === 30, "Heroicons Animated raster inventory is incomplete");

const cssDeclarationPath = path.join(sourceRoot, "__css-modules.d.ts");
const cssDeclaration = 'declare module "*.module.css" { const classes: Readonly<Record<string, string>>; export default classes; }';
const strictFiles = new Set([cssDeclarationPath]);
const candidateRecords = [];
const mappedUpstreamPaths = new Set();
const retainedExportNames = new Set();
for (const item of manifest.items) {
  assert(item.type === "registry:component", `${item.name} is not a component`);
  assert(item.categories?.[0] === "icons-microinteractions", `${item.name} has the wrong category`);
  assert(item.dependencies?.length === 0 && item.registryDependencies?.length === 0, `${item.name} gained a dependency`);
  const tasteblocks = item.meta.tasteblocks;
  assert(tasteblocks.source.revision === revision && tasteblocks.source.repository === repository, `${item.name} source pin changed`);
  assert(tasteblocks.license.spdx === "Apache-2.0", `${item.name} license changed`);
  assert(tasteblocks.license.evidence.sha256 === licenseHash, `${item.name} license evidence hash changed`);
  assert(tasteblocks.license.evidence.localPath === "registry/sources/carbon-icons-motion/LICENSE", `${item.name} license path changed`);
  assert(tasteblocks.license.noticeEvidence?.[0]?.sha256 === noticeHash, `${item.name} NOTICE evidence hash changed`);
  assert(tasteblocks.license.notices?.includes("registry/sources/carbon-icons-motion/NOTICE"), `${item.name} NOTICE path changed`);
  assert(tasteblocks.assets.length === 0, `${item.name} unexpectedly ships an asset`);
  assert(tasteblocks.rights.trademarkReviewRequired === false, `${item.name} has a brand blocker`);
  assert(tasteblocks.provenance.carbonBasis.sha256 === readmeHash, `${item.name} Carbon provenance evidence changed`);

  const structuralFiles = [];
  const upstreamHashes = [];
  const contentHashes = [];
  let componentText = "";
  let cssText = "";
  for (const [index, file] of item.files.entries()) {
    const mapping = tasteblocks.source.files[index];
    assert(mapping.shippedPath === file.path, `${item.name} source mapping is out of order`);
    mappedUpstreamPaths.add(mapping.upstreamPath);
    const localPath = path.join(sourceRoot, file.path);
    const content = await readFile(localPath);
    assert(expectedUpstreamHashes[mapping.upstreamPath] === mapping.upstreamSha256, `${item.name} stored upstream hash changed for ${mapping.upstreamPath}`);
    if (upstreamRoot) {
      const upstream = execFileSync("git", ["-C", upstreamRoot, "show", `${revision}:${mapping.upstreamPath}`]);
      assert(sha256(upstream) === mapping.upstreamSha256, `${item.name} upstream blob hash changed for ${mapping.upstreamPath}`);
    }
    assert(sha256(content) === mapping.contentSha256, `${item.name} content hash changed for ${file.path}`);
    assert(mapping.changes.length > 0, `${item.name} modification marking is missing for ${file.path}`);
    structuralFiles.push({ path: `registry/sources/carbon-icons-motion/${file.path}`, content });
    upstreamHashes.push(mapping.upstreamSha256);
    contentHashes.push(mapping.contentSha256);
    if (file.path.endsWith(".tsx")) {
      componentText = content.toString("utf8");
      strictFiles.add(localPath);
    } else if (file.path.endsWith(".css")) {
      cssText = content.toString("utf8");
    }
  }
  assert(tasteblocks.dedupe.sourceHash === aggregateHash(upstreamHashes), `${item.name} source aggregate hash changed`);
  assert(tasteblocks.dedupe.contentHash === aggregateHash(contentHashes), `${item.name} content aggregate hash changed`);
  assert(tasteblocks.dedupe.structureHash === structureHash(structuralFiles), `${item.name} structure hash changed`);
  assert(tasteblocks.dedupe.geometryHash === geometryHash(componentText), `${item.name} geometry hash changed`);
  assert(tasteblocks.dedupe.motionHash === motionHash(cssText), `${item.name} motion hash changed`);
  assert(tasteblocks.dedupe.rasterHash === (await raster(componentText, cssText))?.hash, `${item.name} raster hash changed`);
  const exportName = /export function\s+([A-Za-z0-9]+)/.exec(componentText)?.[1];
  assert(exportName, `${item.name} has no named component export`);
  retainedExportNames.add(exportName);

  for (const marker of [
    '"use client"', "isAnimated?: boolean", "isAnimated = false", "prefers-reduced-motion: reduce",
  ]) {
    assert(componentText.includes(marker) || cssText.includes(marker), `${item.name} misses ${marker}`);
  }
  assert(!/\binfinite\b/i.test(cssText), `${item.name} loops`);
  assert(!/scale(?:X|Y)?\(0(?:\.0+)?\)/i.test(cssText), `${item.name} uses scale(0)`);
  assert(!/\b(?:x|y|scale)\s*:\s*(?:\[|[-\d])/i.test(componentText), `${item.name} uses Motion shorthand`);
  assert(!/\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/.test(componentText), `${item.name} performs a remote request`);
  for (const duration of cssText.matchAll(/animation:[^;]*?\s(\d+(?:\.\d+)?)(ms|s)\b/g)) {
    const milliseconds = Number(duration[1]) * (duration[2] === "s" ? 1000 : 1);
    assert(milliseconds <= 280, `${item.name} exceeds the 280 ms motion budget`);
  }

  const previewPath = path.join(root, tasteblocks.preview);
  const preview = await readFile(previewPath, "utf8");
  strictFiles.add(previewPath);
  for (const marker of [
    "<button", 'type="button"', "aria-label=", "onFocus={start}", "onBlur={stop}", "onPointerEnter={start}",
    "onPointerLeave={stop}", "onPointerDown={start}", "onPointerUp={stop}", "onPointerCancel={stop}",
    "onTouchStart={start}", "onTouchEnd={stop}", "onTouchCancel={stop}", "isAnimated={isAnimated}", 'aria-hidden="true"',
  ]) {
    assert(preview.includes(marker), `${item.name} preview misses ${marker}`);
  }

  const candidateRaster = await raster(componentText);
  assert(candidateRaster, `${item.name} could not be rasterized`);
  candidateRecords.push({
    item,
    identity: normalizeIdentity(tasteblocks.dedupe.glyph.canonicalName),
    geometryHash: tasteblocks.dedupe.geometryHash,
    motionHash: tasteblocks.dedupe.motionHash,
    raster: candidateRaster,
  });
}
assert(JSON.stringify([...mappedUpstreamPaths].sort()) === JSON.stringify(Object.keys(expectedUpstreamHashes).sort()), "Stored upstream file inventory changed");
assert(JSON.stringify([...retainedExportNames].sort()) === JSON.stringify([...report.retained].sort()), "Saved retained inventory changed");

const semanticCollisions = [];
const geometryCollisions = [];
const motionCollisions = [];
const rasterCollisions = [];
const nearestRaster = [];
for (const candidate of candidateRecords) {
  const comparableRaster = existing.filter(({ raster: value }) => value);
  for (const record of existing) {
    if (record.identities.has(candidate.identity)) semanticCollisions.push([candidate.item.name, record.item.name]);
    if (record.geometryHash === candidate.geometryHash) geometryCollisions.push([candidate.item.name, record.item.name]);
    if (record.motionHash === candidate.motionHash) motionCollisions.push([candidate.item.name, record.item.name]);
    if (record.raster?.hash === candidate.raster.hash) rasterCollisions.push([candidate.item.name, record.item.name]);
  }
  const nearest = comparableRaster
    .map((record) => ({ name: record.item.name, source: record.source, rmse: normalizedRmse(candidate.raster.pixels, record.raster.pixels) }))
    .sort((left, right) => left.rmse - right.rmse)[0];
  nearestRaster.push({ candidate: candidate.item.name, ...nearest });
}

assert(semanticCollisions.length === 0, `Semantic collisions remain: ${JSON.stringify(semanticCollisions)}`);
assert(geometryCollisions.length === 0, `Geometry collisions remain: ${JSON.stringify(geometryCollisions)}`);
assert(motionCollisions.length === 0, `Motion-signature collisions remain: ${JSON.stringify(motionCollisions)}`);
assert(rasterCollisions.length === 0, `Raster collisions remain: ${JSON.stringify(rasterCollisions)}`);
assert(nearestRaster.every(({ rmse }) => rmse > 0.04), `A perceptually near raster remains: ${JSON.stringify(nearestRaster)}`);

const configPath = path.join(root, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
assert(!configFile.error, "Could not read root tsconfig.json");
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  root,
  { incremental: false, isolatedModules: true, noEmit: true, strict: true },
  configPath,
);
assert(parsedConfig.errors.length === 0, "Could not parse strict TypeScript configuration");
const compilerHost = ts.createCompilerHost(parsedConfig.options);
const hostFileExists = compilerHost.fileExists.bind(compilerHost);
const hostReadFile = compilerHost.readFile.bind(compilerHost);
const hostGetSourceFile = compilerHost.getSourceFile.bind(compilerHost);
compilerHost.fileExists = (file) => path.resolve(file) === cssDeclarationPath || hostFileExists(file);
compilerHost.readFile = (file) => path.resolve(file) === cssDeclarationPath ? cssDeclaration : hostReadFile(file);
compilerHost.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) =>
  path.resolve(file) === cssDeclarationPath
    ? ts.createSourceFile(file, cssDeclaration, languageVersion, true, ts.ScriptKind.TS)
    : hostGetSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile);
const program = ts.createProgram({ rootNames: [...strictFiles], options: parsedConfig.options, host: compilerHost });
const diagnostics = ts.getPreEmitDiagnostics(program);
assert(
  diagnostics.length === 0,
  `Strict TypeScript closure failed:\n${ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => "\n",
  })}`,
);

console.log(JSON.stringify({
  upstreamDeepCheck: Boolean(upstreamRoot),
  upstreamExportedReactComponents: 151,
  upstreamAnimatedIcons: 149,
  retained: manifest.items.length,
  rejected: Object.values(expectedReasons).reduce((sum, count) => sum + count, 0),
  rejectionReasons: expectedReasons,
  existingManifestsCompared: manifests.length,
  existingItemsCompared: existing.length,
  animateiconsCompared: existing.filter(({ source }) => source === "animateicons").length,
  heroiconsAnimatedCompared: existing.filter(({ source }) => source === "heroicons-animated").length,
  svgRastersCompared: existing.filter(({ raster: value }) => value).length,
  semanticCollisions: semanticCollisions.length,
  geometryCollisions: geometryCollisions.length,
  motionSignatureCollisions: motionCollisions.length,
  rasterCollisions: rasterCollisions.length,
  nearestRaster,
  strictTypeScriptFiles: strictFiles.size,
  loops: 0,
  scaleZero: 0,
  motionShorthand: 0,
  remoteAssets: 0,
  secrets: 0,
}, null, 2));
