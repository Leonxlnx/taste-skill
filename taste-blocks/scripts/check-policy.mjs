import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadRegistry } from "shadcn/registry";
import ts from "typescript";
import { aggregateHash, sha256, structureHash } from "./policy-utils.mjs";

export const categories = [
  "text-motion",
  "visual-effects",
  "buttons-actions",
  "navigation-menus",
  "media-galleries",
  "cards-containers",
  "forms-feedback",
  "icons-microinteractions",
  "status-progress",
];

const allowedCategories = new Set(categories);
const allowedLicenses = new Set(["MIT", "BSD-2-Clause", "BSD-3-Clause", "ISC", "Apache-2.0", "CC0-1.0"]);
const allowedAssetLicenses = new Set([...allowedLicenses, "OFL-1.1"]);
const allowedRenderers = new Set(["dom", "svg", "canvas", "webgl"]);
const headlineFileTypes = new Set(["registry:component", "registry:ui"]);
const allowedFileTypes = new Set([
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:lib",
  "registry:file",
]);
const forbiddenTerms = new Set([
  "section",
  "sections",
  "layout",
  "layouts",
  "page",
  "pages",
  "block",
  "blocks",
  "template",
  "templates",
  "hero",
  "heroes",
  "footer",
  "footers",
  "navbar",
  "navbars",
  "dashboard",
  "dashboards",
  "screen",
  "screens",
]);
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const revisionPattern = /^[a-f0-9]{40}$/;
const hashPattern = /^sha256:[a-f0-9]{64}$/;
const structuralExtensions = new Set([".cjs", ".css", ".cts", ".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx"]);
const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ["OpenAI key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{20,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Stripe live key", /\b[rs]k_live_[0-9A-Za-z]{16,}\b/],
  [
    "literal credential",
    /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|password)\b\s*[:=]\s*["'`](?!\s*(?:\$\{|process\.env|import\.meta\.env))[^"'`\r\n]{12,}/i,
  ],
];
const remoteAssetPatterns = [
  /\b(?:src|srcset|poster|image|video|font|model|texture|asset)\b\s*[:=]\s*(?:\{\s*)?["'`]https?:\/\//i,
  /\b(?:fetch|new\s+(?:WebSocket|EventSource))\s*\(\s*["'`]https?:\/\//i,
  /@import\s+(?:url\(\s*)?["']?https?:\/\//i,
  /url\(\s*["']?https?:\/\//i,
  /https?:\/\/[^\s"'`)<]+\.(?:avif|gif|glb|gltf|ico|jpe?g|mov|mp3|mp4|ogg|otf|png|svg|ttf|wav|webm|webp|woff2?)(?:[?#][^\s"'`)<]*)?/i,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function object(value, label) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value;
}

function string(value, label) {
  assert(typeof value === "string" && value.trim() === value && value.length > 0, `${label} must be a non-empty trimmed string`);
  return value;
}

function strings(value, label, { empty = true } = {}) {
  assert(Array.isArray(value) && (empty || value.length > 0), `${label} must be ${empty ? "an" : "a non-empty"} array`);
  value.forEach((entry, index) => string(entry, `${label}[${index}]`));
  return value;
}

function exactHash(value, label) {
  assert(hashPattern.test(value), `${label} must be lowercase SHA-256 with a sha256: prefix`);
  return value;
}

function isoDate(value, label) {
  string(value, label);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  assert(match, `${label} must use YYYY-MM-DD`);
  const date = new Date(`${value}T00:00:00Z`);
  assert(
    date.getUTCFullYear() === Number(match[1]) &&
      date.getUTCMonth() + 1 === Number(match[2]) &&
      date.getUTCDate() === Number(match[3]),
    `${label} is not a real date`,
  );
  return value;
}

function relativePath(value, label) {
  string(value, label);
  assert(!value.includes("\\") && !path.isAbsolute(value) && !/^https?:\/\//i.test(value), `${label} must be a local POSIX path`);
  assert(path.posix.normalize(value) === value && !value.split("/").some((part) => part === ".." || part === "."), `${label} must not traverse directories`);
  return value;
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function localFile(root, realRoot, value, label) {
  relativePath(value, label);
  const resolved = path.resolve(root, value);
  assert(isWithin(root, resolved), `${label} escapes the project root`);
  let canonical;
  try {
    canonical = await realpath(resolved);
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`${label} does not exist: ${value}`);
    throw error;
  }
  assert(isWithin(realRoot, canonical), `${label} resolves outside the project root`);
  assert((await stat(canonical)).isFile(), `${label} is not a file: ${value}`);
  return { content: await readFile(canonical), path: canonical };
}

function httpsUrl(value, label) {
  string(value, label);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
  assert(url.protocol === "https:" && !url.username && !url.password, `${label} must be a credential-free HTTPS URL`);
  return url;
}

function repositoryUrl(value, label) {
  const url = httpsUrl(value, label);
  assert(!url.search && !url.hash, `${label} must not contain a query or fragment`);
  return url;
}

function immutablePermalink(value, repository, revision, upstreamPath, label) {
  const url = httpsUrl(value, label);
  const repo = repositoryUrl(repository, `${label} repository`);
  assert(!url.search && !url.hash, `${label} must not contain a query or fragment`);
  assert(url.hostname === repo.hostname, `${label} must use the source repository host`);
  const repoPath = repo.pathname.replace(/\/?\.git$/, "").replace(/\/$/, "");
  let permalinkPath;
  try {
    permalinkPath = decodeURIComponent(url.pathname);
  } catch {
    throw new Error(`${label} contains invalid URL encoding`);
  }
  assert(permalinkPath === repoPath || permalinkPath.startsWith(`${repoPath}/`), `${label} must point inside the source repository`);
  const segments = permalinkPath.split("/");
  const revisionIndex = segments.indexOf(revision);
  assert(revisionIndex > 0 && new Set(["blob", "raw", "src"]).has(segments[revisionIndex - 1]), `${label} must pin revision ${revision}`);
  assert(permalinkPath.endsWith(`/${upstreamPath}`), `${label} must end with upstream path ${upstreamPath}`);
  return value;
}

function spdx(value, label, licenses = allowedLicenses) {
  string(value, label);
  const tokens = [];
  let offset = 0;
  while (offset < value.length) {
    const whitespace = /^\s+/.exec(value.slice(offset));
    if (whitespace) {
      offset += whitespace[0].length;
      continue;
    }
    const token = /^(?:AND\b|OR\b|[()]|[A-Za-z0-9.-]+)/.exec(value.slice(offset));
    assert(token, `${label} is not a supported SPDX expression`);
    tokens.push(token[0]);
    offset += token[0].length;
  }

  let index = 0;
  function primary() {
    if (tokens[index] === "(") {
      index += 1;
      expression();
      assert(tokens[index] === ")", `${label} has unmatched parentheses`);
      index += 1;
      return;
    }
    assert(licenses.has(tokens[index]), `${label} contains disallowed license ${tokens[index] ?? "(missing)"}`);
    index += 1;
  }
  function conjunction() {
    primary();
    while (tokens[index] === "AND") {
      index += 1;
      primary();
    }
  }
  function expression() {
    conjunction();
    while (tokens[index] === "OR") {
      index += 1;
      conjunction();
    }
  }

  expression();
  assert(index === tokens.length, `${label} is not a supported SPDX expression`);
  return value;
}

function assertNoSecrets(content, label) {
  for (const [name, pattern] of secretPatterns) assert(!pattern.test(content), `${label} contains a possible ${name}`);
}

function assertNoRemoteAssets(content, label) {
  for (const pattern of remoteAssetPatterns) assert(!pattern.test(content), `${label} contains a remote asset or runtime URL`);
}

function moduleSpecifiers(content, file) {
  const extension = path.extname(file).toLowerCase();
  const scriptKind = extension === ".tsx" ? ts.ScriptKind.TSX : extension === ".jsx" ? ts.ScriptKind.JSX : extension === ".js" ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, false, scriptKind);
  const specifiers = [];

  function add(node) {
    if (node && ts.isStringLiteralLike(node)) specifiers.push(node.text);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier);
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) add(node.moduleReference.expression);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      add(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return specifiers;
}

function assertImportBoundary(specifier, file, root, label) {
  assert(!/^https?:\/\//i.test(specifier), `${label} imports a remote module: ${specifier}`);
  assert(specifier !== "next" && !specifier.startsWith("next/") && specifier !== "server-only", `${label} imports Next-only module ${specifier}`);

  const clean = specifier.split(/[?#]/, 1)[0].replaceAll("\\", "/");
  let projectPath = clean;
  if (clean.startsWith(".")) {
    projectPath = path.relative(root, path.resolve(path.dirname(file), clean)).replaceAll("\\", "/");
  } else {
    projectPath = projectPath.replace(/^[@~#]\//, "").replace(/^@components\//, "components/");
  }
  projectPath = projectPath.replace(/^src\//, "");
  assert(
    !/^(?:app|previews)(?:\/|$)/i.test(projectPath) && !/^components\/site(?:\/|$)/i.test(projectPath),
    `${label} crosses the distributable/site boundary via ${specifier}`,
  );
}

function assertSourceText(content, file, root, label) {
  assertNoSecrets(content, label);
  assertNoRemoteAssets(content, label);
  assert(!/["']use server["']/.test(content), `${label} contains a Next-only use server directive`);
  if (/\.[cm]?[jt]sx?$/i.test(file)) {
    for (const specifier of moduleSpecifiers(content, file)) assertImportBoundary(specifier, file, root, label);
  }
}

function forbiddenIdentity(value) {
  return value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z\d]+/)
    .find((word) => forbiddenTerms.has(word));
}

function claim(map, key, itemName, label) {
  const owner = map.get(key);
  assert(!owner, `${itemName} duplicates ${label} already used by ${owner}`);
  map.set(key, itemName);
}

function recordSourceLocator(map, locator, itemName, fileType, sourceFile) {
  const existing = map.get(locator);
  if (!existing) {
    map.set(locator, {
      contentHash: sourceFile.contentSha256,
      fileType,
      itemName,
      upstreamHash: sourceFile.upstreamSha256,
    });
    return;
  }
  assert(
    !headlineFileTypes.has(existing.fileType) && !headlineFileTypes.has(fileType),
    `${itemName} duplicates headline source locator already used by ${existing.itemName}`,
  );
  assert(
    existing.upstreamHash === sourceFile.upstreamSha256 && existing.contentHash === sourceFile.contentSha256,
    `${itemName} reuses support source locator from ${existing.itemName} with different hashes`,
  );
}

function validateModifications(modifications, sourceFiles, itemName) {
  assert(Array.isArray(modifications), `${itemName}.meta.tasteblocks.modifications must be an array`);
  const sourceByPath = new Map(sourceFiles.map((sourceFile) => [sourceFile.shippedPath, sourceFile]));
  const documentedPaths = new Set();

  for (const [index, modification] of modifications.entries()) {
    const label = `${itemName}.meta.tasteblocks.modifications[${index}]`;
    object(modification, label);
    const shippedPath = relativePath(modification.shippedPath, `${label}.shippedPath`);
    const sourceFile = sourceByPath.get(shippedPath);
    assert(sourceFile, `${label}.shippedPath must match one declared source file`);
    assert(sourceFile.changes.length > 0, `${label}.shippedPath points to an unchanged source file`);
    assert(!documentedPaths.has(shippedPath), `${itemName} has duplicate modification records for ${shippedPath}`);
    string(modification.change, `${label}.change`);
    string(modification.reason, `${label}.reason`);
    documentedPaths.add(shippedPath);
  }

  for (const sourceFile of sourceFiles) {
    assert(
      sourceFile.changes.length === 0 || documentedPaths.has(sourceFile.shippedPath),
      `${itemName} changed source file ${sourceFile.shippedPath} has no modification record`,
    );
  }
}

function validateTarget(value, label) {
  if (value === undefined) return;
  string(value, label);
  assert(
    !/^https?:\/\//i.test(value) && !value.includes("\\") && !path.posix.isAbsolute(value) && !/^[A-Za-z]:\//.test(value) && !value.split("/").includes(".."),
    `${label} must be a safe install target`,
  );
  const normalized = value.replace(/^@[^/]+\//, "").replace(/^src\//, "");
  assert(
    !/^(?:app|previews)(?:\/|$)/i.test(normalized) && !/^components\/site(?:\/|$)/i.test(normalized),
    `${label} points into site-only code`,
  );
}

async function validateLicense(license, source, root, realRoot, label, licenses = allowedLicenses) {
  object(license, label);
  spdx(license.spdx, `${label}.spdx`, licenses);
  string(license.scope, `${label}.scope`);
  strings(license.copyright, `${label}.copyright`);
  strings(license.notices, `${label}.notices`);
  const evidence = object(license.evidence, `${label}.evidence`);
  const upstreamPath = relativePath(evidence.upstreamPath, `${label}.evidence.upstreamPath`);
  immutablePermalink(evidence.permalink, source.repository, source.revision, upstreamPath, `${label}.evidence.permalink`);
  exactHash(evidence.sha256, `${label}.evidence.sha256`);
  const local = await localFile(root, realRoot, evidence.localPath, `${label}.evidence.localPath`);
  assert(sha256(local.content) === evidence.sha256, `${label}.evidence.sha256 does not match ${evidence.localPath}`);
}

async function validateAsset(asset, index, root, realRoot, label) {
  object(asset, label);
  if (asset.name !== undefined) string(asset.name, `${label}.name`);
  exactHash(asset.sha256, `${label}.sha256`);
  const local = await localFile(root, realRoot, asset.localPath, `${label}.localPath`);
  assert(sha256(local.content) === asset.sha256, `${label}.sha256 does not match ${asset.localPath}`);

  const source = object(asset.source, `${label}.source`);
  repositoryUrl(source.repository, `${label}.source.repository`);
  assert(revisionPattern.test(source.revision), `${label}.source.revision must be a full lowercase 40-character commit SHA`);
  const upstreamPath = relativePath(source.upstreamPath, `${label}.source.upstreamPath`);
  immutablePermalink(source.permalink, source.repository, source.revision, upstreamPath, `${label}.source.permalink`);
  exactHash(source.sha256, `${label}.source.sha256`);
  strings(source.changes, `${label}.source.changes`);
  await validateLicense(asset.license, source, root, realRoot, `${label}.license`, allowedAssetLicenses);

  function rejectRemote(value, key = "asset") {
    if (typeof value === "string") {
      if (/^https?:\/\//i.test(value) && key !== "repository" && key !== "permalink") {
        throw new Error(`${label}.${key} must not reference a remote asset`);
      }
      return;
    }
    if (Array.isArray(value)) return value.forEach((entry) => rejectRemote(entry, key));
    if (value && typeof value === "object") {
      for (const [childKey, child] of Object.entries(value)) rejectRemote(child, childKey);
    }
  }
  rejectRemote(asset, `assets[${index}]`);
}

async function validateItem(item, context) {
  const { contentHashes, families, names, realRoot, root, sourceHashes, sourceLocators } = context;
  const itemName = string(item.name, "registry item name");
  assert(kebabCase.test(itemName), `${itemName} must use globally unique kebab-case`);
  claim(names, itemName, itemName, "public name");
  assert(item.type === "registry:component", `${itemName} must have type registry:component`);
  const forbidden = forbiddenIdentity(`${itemName} ${item.title ?? ""}`);
  string(item.title, `${itemName}.title`);
  string(item.description, `${itemName}.description`);
  for (const [field, dependencies] of [
    ["dependencies", item.dependencies ?? []],
    ["registryDependencies", item.registryDependencies ?? []],
  ]) {
    strings(dependencies, `${itemName}.${field}`);
    dependencies.forEach((dependency) =>
      assert(!/^(?:https?|file|git(?:\+https)?):/i.test(dependency), `${itemName}.${field} must not contain remote or local package URLs`),
    );
  }
  assert(Array.isArray(item.categories) && item.categories.length === 1, `${itemName}.categories must contain exactly one category`);
  assert(allowedCategories.has(item.categories[0]), `${itemName}.categories contains unsupported category ${item.categories[0]}`);

  const tasteblocks = object(object(item.meta, `${itemName}.meta`).tasteblocks, `${itemName}.meta.tasteblocks`);
  assert(tasteblocks.status === "verified", `${itemName} is public but not verified`);
  assert(tasteblocks.category === item.categories[0], `${itemName}.meta.tasteblocks.category must match categories[0]`);
  strings(tasteblocks.tags, `${itemName}.meta.tasteblocks.tags`, { empty: false });
  assert(allowedRenderers.has(tasteblocks.renderer), `${itemName}.meta.tasteblocks.renderer is unsupported`);
  const allowedGlyph =
    item.categories[0] === "icons-microinteractions" &&
    tasteblocks.renderer === "svg" &&
    itemName.endsWith("-icon") &&
    /\bIcon$/.test(item.title);
  assert(!forbidden || allowedGlyph, `${itemName} uses excluded ${forbidden} terminology`);
  assert(Array.isArray(tasteblocks.modifications), `${itemName}.meta.tasteblocks.modifications must be an array`);
  assert(Array.isArray(tasteblocks.assets), `${itemName}.meta.tasteblocks.assets must be an array`);

  const preview = relativePath(tasteblocks.preview, `${itemName}.meta.tasteblocks.preview`);
  assert(preview === `previews/${itemName}.tsx`, `${itemName} preview must be previews/${itemName}.tsx`);
  const previewFile = await localFile(root, realRoot, preview, `${itemName} preview`);
  assertSourceText(previewFile.content.toString("utf8"), previewFile.path, root, `${itemName} preview`);

  const source = object(tasteblocks.source, `${itemName}.meta.tasteblocks.source`);
  string(source.project, `${itemName}.source.project`);
  repositoryUrl(source.repository, `${itemName}.source.repository`);
  assert(revisionPattern.test(source.revision), `${itemName}.source.revision must be a full lowercase 40-character commit SHA`);
  isoDate(source.retrievedAt, `${itemName}.source.retrievedAt`);
  assert(Array.isArray(source.files) && source.files.length > 0, `${itemName}.source.files must be a non-empty array`);

  assert(Array.isArray(item.files) && item.files.length > 0, `${itemName}.files must be a non-empty array`);
  assert(item.files.length === source.files.length, `${itemName}.source.files must map one-to-one to item.files`);
  const shippedPaths = new Set();
  const resolvedPaths = new Set();
  const matchedFiles = new Set();
  const structuralFiles = [];
  const upstreamHashes = [];
  const shippedHashes = [];

  for (const [index, file] of item.files.entries()) {
    object(file, `${itemName}.files[${index}]`);
    assert(allowedFileTypes.has(file.type), `${itemName}.files[${index}].type is not a supported component file type`);
    const filePath = relativePath(file.path, `${itemName}.files[${index}].path`);
    assert(filePath.startsWith("registry/sources/"), `${itemName}.files[${index}].path must stay under registry/sources`);
    assert(!resolvedPaths.has(filePath), `${itemName} declares ${filePath} more than once`);
    resolvedPaths.add(filePath);
    validateTarget(file.target, `${itemName}.files[${index}].target`);
  }

  for (const [index, sourceFile] of source.files.entries()) {
    const label = `${itemName}.source.files[${index}]`;
    object(sourceFile, label);
    const shippedPath = relativePath(sourceFile.shippedPath, `${label}.shippedPath`);
    assert(!shippedPaths.has(shippedPath), `${itemName} maps shipped path ${shippedPath} more than once`);
    shippedPaths.add(shippedPath);
    const matches = item.files
      .map((file, fileIndex) => ({ file, fileIndex }))
      .filter(({ file }) => file.path === shippedPath || file.path.endsWith(`/${shippedPath}`));
    assert(matches.length === 1, `${label}.shippedPath must match exactly one declared item file`);
    assert(!matchedFiles.has(matches[0].fileIndex), `${itemName}.source.files does not map one-to-one to item.files`);
    matchedFiles.add(matches[0].fileIndex);

    const upstreamPath = relativePath(sourceFile.upstreamPath, `${label}.upstreamPath`);
    immutablePermalink(sourceFile.permalink, source.repository, source.revision, upstreamPath, `${label}.permalink`);
    exactHash(sourceFile.upstreamSha256, `${label}.upstreamSha256`);
    exactHash(sourceFile.contentSha256, `${label}.contentSha256`);
    strings(sourceFile.changes, `${label}.changes`);

    const locator = `${source.repository}\n${source.revision}\n${upstreamPath}`;
    recordSourceLocator(sourceLocators, locator, itemName, matches[0].file.type, sourceFile);
    const local = await localFile(root, realRoot, matches[0].file.path, `${itemName} shipped file`);
    const actualHash = sha256(local.content);
    assert(actualHash === sourceFile.contentSha256, `${label}.contentSha256 does not match ${matches[0].file.path}`);
    if (sourceFile.changes.length === 0) {
      assert(sourceFile.upstreamSha256 === actualHash, `${label}.upstreamSha256 must match an unchanged shipped file`);
    }
    assertSourceText(local.content.toString("utf8"), local.path, root, `${itemName} shipped file ${matches[0].file.path}`);
    structuralFiles.push({ path: matches[0].file.path, content: local.content });
    upstreamHashes.push(sourceFile.upstreamSha256);
    shippedHashes.push(actualHash);
  }

  assert(matchedFiles.size === item.files.length, `${itemName}.source.files must map every item file exactly once`);
  validateModifications(tasteblocks.modifications, source.files, itemName);
  await validateLicense(tasteblocks.license, source, root, realRoot, `${itemName}.meta.tasteblocks.license`);
  const assetFiles = item.files.filter((file) => !structuralExtensions.has(path.extname(file.path).toLowerCase()));
  assert(assetFiles.length === tasteblocks.assets.length, `${itemName}.assets must map one-to-one to non-code item files`);
  const mappedAssets = new Set();
  for (const [index, asset] of tasteblocks.assets.entries()) {
    await validateAsset(asset, index, root, realRoot, `${itemName}.meta.tasteblocks.assets[${index}]`);
    const matches = assetFiles
      .map((file, fileIndex) => ({ file, fileIndex }))
      .filter(({ file }) => file.path === asset.localPath || file.path.endsWith(`/${asset.localPath}`));
    assert(matches.length === 1 && !mappedAssets.has(matches[0].fileIndex), `${itemName}.assets[${index}] must match exactly one non-code item file`);
    mappedAssets.add(matches[0].fileIndex);
  }

  const dedupe = object(tasteblocks.dedupe, `${itemName}.meta.tasteblocks.dedupe`);
  assert(kebabCase.test(dedupe.family), `${itemName}.dedupe.family must be kebab-case`);
  exactHash(dedupe.sourceHash, `${itemName}.dedupe.sourceHash`);
  exactHash(dedupe.contentHash, `${itemName}.dedupe.contentHash`);
  exactHash(dedupe.structureHash, `${itemName}.dedupe.structureHash`);
  assert(dedupe.sourceHash === aggregateHash(upstreamHashes), `${itemName}.dedupe.sourceHash does not recompute`);
  assert(dedupe.contentHash === aggregateHash(shippedHashes), `${itemName}.dedupe.contentHash does not recompute`);
  assert(dedupe.structureHash === structureHash(structuralFiles), `${itemName}.dedupe.structureHash does not recompute`);
  claim(sourceHashes, dedupe.sourceHash, itemName, "source hash");
  claim(contentHashes, dedupe.contentHash, itemName, "content hash");
  claim(families, dedupe.family, itemName, "dedupe family");

  const verification = object(tasteblocks.verification, `${itemName}.meta.tasteblocks.verification`);
  string(verification.reviewedBy, `${itemName}.verification.reviewedBy`);
  isoDate(verification.reviewedAt, `${itemName}.verification.reviewedAt`);
  const embeddedPayload = JSON.stringify({ css: item.css, cssVars: item.cssVars, tailwind: item.tailwind });
  assertNoRemoteAssets(embeddedPayload, `${itemName} embedded registry styles`);
  assertNoSecrets(JSON.stringify(item), `${itemName} metadata`);
}

export async function validatePublicRegistry(registry, root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const realRoot = await realpath(resolvedRoot);
  const context = {
    contentHashes: new Map(),
    families: new Map(),
    names: new Map(),
    realRoot,
    root: resolvedRoot,
    sourceHashes: new Map(),
    sourceLocators: new Map(),
  };

  for (const item of registry.items) await validateItem(item, context);
  return registry;
}

export async function loadPublicRegistry(root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const registry = await loadRegistry({ cwd: resolvedRoot, registryFile: "registry.json" });
  return validatePublicRegistry(registry, resolvedRoot);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const registry = await loadPublicRegistry();
  console.log(`Policy passed for ${registry.items.length} verified components.`);
}
