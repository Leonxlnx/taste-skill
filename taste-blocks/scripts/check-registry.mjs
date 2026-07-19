import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const registryRoot = path.join(root, "registry");
const allowedStatuses = new Set(["draft", "verified", "deprecated"]);
const allowedTypes = new Set(["registry:block", "registry:component"]);
const allowedKinds = new Set(["block", "chrome", "component", "effect"]);
const allowedRuntimes = new Set(["css", "dom", "canvas", "webgl"]);
const allowedOrigins = new Set(["original", "adapted", "dependency"]);
const allowedReducedMotion = new Set(["unchanged", "simplified", "static"]);
const allowedDisplaySizes = new Set(["standard", "wide", "tall", "full"]);
const allowedCategories = new Set([
  "Actions",
  "Canvas Effects",
  "Comparison",
  "Content",
  "Footer",
  "Gallery",
  "Hero",
  "Media Motion",
  "Navigation",
  "Overview",
  "Pointer Effects",
  "Process",
  "Services",
  "Surface Effects",
  "Text Motion",
  "Work",
]);
const allowedLicenses = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(resolved)));
    else files.push(resolved);
  }
  return files;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStringArray(value, field, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${label}: ${field} must be an array`);
    return;
  }
  if (!allowEmpty && value.length === 0) {
    errors.push(`${label}: ${field} must not be empty`);
  }
  if (value.some((item) => !isNonEmptyString(item))) {
    errors.push(`${label}: ${field} must contain only non-empty strings`);
  }
  if (new Set(value).size !== value.length) {
    errors.push(`${label}: ${field} contains duplicates`);
  }
}

if (!(await exists(registryRoot))) {
  console.log("Registry is empty. Add components before publishing.");
  process.exit(0);
}

const files = await walk(registryRoot);
const metaFiles = files.filter((file) => path.basename(file) === "meta.json");
const names = new Set();
const errors = [];

for (const metaFile of metaFiles) {
  let meta;
  try {
    meta = JSON.parse(await readFile(metaFile, "utf8"));
  } catch (error) {
    errors.push(`${metaFile}: invalid JSON (${error.message})`);
    continue;
  }

  const label = path.relative(root, metaFile);
  for (const key of [
    "name",
    "title",
    "description",
    "type",
    "kind",
    "category",
    "sections",
    "runtime",
    "status",
    "tags",
    "files",
    "dependencies",
    "registryDependencies",
    "origin",
    "accessibility",
    "performance",
  ]) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === "") {
      errors.push(`${label}: missing ${key}`);
    }
  }

  if (names.has(meta.name)) errors.push(`${label}: duplicate name ${meta.name}`);
  names.add(meta.name);

  for (const field of ["name", "title", "description", "category"]) {
    if (!isNonEmptyString(meta[field])) errors.push(`${label}: ${field} must be a non-empty string`);
  }

  validateStringArray(meta.sections, "sections", label);
  validateStringArray(meta.tags, "tags", label);
  validateStringArray(meta.files, "files", label, { allowEmpty: false });
  validateStringArray(meta.dependencies, "dependencies", label);
  validateStringArray(meta.registryDependencies, "registryDependencies", label);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name ?? "")) {
    errors.push(`${label}: name must be kebab-case`);
  }
  if (!allowedStatuses.has(meta.status)) errors.push(`${label}: unsupported status`);
  if (!allowedTypes.has(meta.type)) errors.push(`${label}: unsupported type`);
  if (!allowedKinds.has(meta.kind)) errors.push(`${label}: unsupported kind`);
  if (!allowedRuntimes.has(meta.runtime)) errors.push(`${label}: unsupported runtime`);
  if (!allowedCategories.has(meta.category)) errors.push(`${label}: unsupported category`);
  if (!allowedLicenses.has(meta.origin?.license)) {
    errors.push(`${label}: blocked or unknown license ${meta.origin?.license}`);
  }
  if (!meta.origin || typeof meta.origin !== "object" || Array.isArray(meta.origin)) {
    errors.push(`${label}: origin must be an object`);
  }
  if (!allowedOrigins.has(meta.origin?.kind)) {
    errors.push(`${label}: invalid origin kind`);
  }
  if (!isNonEmptyString(meta.origin?.author)) errors.push(`${label}: origin.author is required`);
  if (typeof meta.origin?.modified !== "boolean") {
    errors.push(`${label}: origin.modified must be a boolean`);
  }
  if (meta.origin?.kind !== "original") {
    for (const key of ["source", "revision", "path"]) {
      if (!meta.origin?.[key]) errors.push(`${label}: non-original entry missing origin.${key}`);
    }
  }

  if (
    !meta.accessibility ||
    typeof meta.accessibility !== "object" ||
    Array.isArray(meta.accessibility)
  ) {
    errors.push(`${label}: accessibility must be an object`);
  } else {
    if (!allowedReducedMotion.has(meta.accessibility.reducedMotion)) {
      errors.push(`${label}: unsupported accessibility.reducedMotion`);
    }
    if (!isNonEmptyString(meta.accessibility.notes)) {
      errors.push(`${label}: accessibility.notes is required`);
    }
  }

  if (!meta.performance || typeof meta.performance !== "object" || Array.isArray(meta.performance)) {
    errors.push(`${label}: performance must be an object`);
  } else if (!isNonEmptyString(meta.performance.budget)) {
    errors.push(`${label}: performance.budget is required`);
  }

  if (meta.display !== undefined) {
    if (!meta.display || typeof meta.display !== "object" || Array.isArray(meta.display)) {
      errors.push(`${label}: display must be an object`);
    } else {
      if (meta.display.size !== undefined && !allowedDisplaySizes.has(meta.display.size)) {
        errors.push(`${label}: unsupported display.size`);
      }
      if (meta.display.homepage !== undefined && typeof meta.display.homepage !== "boolean") {
        errors.push(`${label}: display.homepage must be a boolean`);
      }
      if (
        meta.display.order !== undefined &&
        (!Number.isInteger(meta.display.order) || meta.display.order < 0)
      ) {
        errors.push(`${label}: display.order must be a non-negative integer`);
      }
    }
  }

  const directory = path.dirname(metaFile);
  if (path.basename(directory) !== meta.name) {
    errors.push(`${label}: folder name must match component name`);
  }
  if (!(await exists(path.join(directory, "preview.tsx")))) {
    errors.push(`${label}: missing preview.tsx`);
  }
  for (const relativeFile of Array.isArray(meta.files) ? meta.files : []) {
    if (relativeFile.includes("..") || path.isAbsolute(relativeFile)) {
      errors.push(`${label}: unsafe file path ${relativeFile}`);
      continue;
    }
    if (!(await exists(path.join(directory, relativeFile)))) {
      errors.push(`${label}: missing file ${relativeFile}`);
    }
    if (relativeFile === "preview.tsx" || relativeFile === "preview.css") {
      errors.push(`${label}: preview files must not ship in meta.files`);
    }
    if (!/\.(css|tsx)$/.test(relativeFile)) {
      errors.push(`${label}: unsupported distributable file ${relativeFile}`);
    }
    if (relativeFile.endsWith(".tsx") && (await exists(path.join(directory, relativeFile)))) {
      const source = await readFile(path.join(directory, relativeFile), "utf8");
      const usesClientHooks = /\b(useState|useEffect|useLayoutEffect|useRef|useCallback|useMemo|useId)\b/.test(
        source,
      );
      if (usesClientHooks && !source.startsWith('"use client";')) {
        errors.push(`${label}: ${relativeFile} uses client hooks without a use client directive`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Registry check failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const verified = await Promise.all(
  metaFiles.map(async (file) => JSON.parse(await readFile(file, "utf8"))),
).then((items) => items.filter((item) => item.status === "verified").length);

console.log(`Registry valid: ${metaFiles.length} entries, ${verified} verified.`);
