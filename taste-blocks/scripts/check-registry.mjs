import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const registryRoot = path.join(root, "registry");
const allowedStatuses = new Set(["draft", "verified", "deprecated"]);
const allowedTypes = new Set(["registry:block", "registry:component"]);
const allowedKinds = new Set(["block", "chrome", "component", "effect"]);
const allowedRuntimes = new Set(["css", "dom", "canvas", "webgl"]);
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
    "runtime",
    "status",
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

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name ?? "")) {
    errors.push(`${label}: name must be kebab-case`);
  }
  if (!allowedStatuses.has(meta.status)) errors.push(`${label}: unsupported status`);
  if (!allowedTypes.has(meta.type)) errors.push(`${label}: unsupported type`);
  if (!allowedKinds.has(meta.kind)) errors.push(`${label}: unsupported kind`);
  if (!allowedRuntimes.has(meta.runtime)) errors.push(`${label}: unsupported runtime`);
  if (!allowedLicenses.has(meta.origin?.license)) {
    errors.push(`${label}: blocked or unknown license ${meta.origin?.license}`);
  }
  if (!new Set(["original", "adapted", "dependency"]).has(meta.origin?.kind)) {
    errors.push(`${label}: invalid origin kind`);
  }
  if (meta.origin?.kind !== "original") {
    for (const key of ["source", "revision", "path"]) {
      if (!meta.origin?.[key]) errors.push(`${label}: non-original entry missing origin.${key}`);
    }
  }

  const directory = path.dirname(metaFile);
  if (!(await exists(path.join(directory, "preview.tsx")))) {
    errors.push(`${label}: missing preview.tsx`);
  }
  for (const relativeFile of meta.files ?? []) {
    if (relativeFile.includes("..") || path.isAbsolute(relativeFile)) {
      errors.push(`${label}: unsafe file path ${relativeFile}`);
      continue;
    }
    if (!(await exists(path.join(directory, relativeFile)))) {
      errors.push(`${label}: missing file ${relativeFile}`);
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
