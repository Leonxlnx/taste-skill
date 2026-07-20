import { randomUUID } from "node:crypto";
import { access, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { registrySchema } from "shadcn/schema";
import { validatePublicRegistry } from "./check-policy.mjs";

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const relativeImportPatterns = [
  /^\s*import\s+(?:[^"'()]*?\s+from\s+)?["']\.\.?[\\/]/m,
  /^\s*export\s+(?:[^"']*?\s+from\s+)?["']\.\.?[\\/]/m,
  /\bimport\s*\(\s*["']\.\.?[\\/]/m,
  /\brequire\s*\(\s*["']\.\.?[\\/]/m,
];
const defaultFileSystem = { access, readFile, rename, unlink, writeFile };

function fail(message) {
  throw new Error(message);
}

export function parseArgs(args) {
  const options = { write: false, all: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--write") {
      options.write = true;
      continue;
    }
    if (argument === "--all") {
      options.all = true;
      continue;
    }

    const match = /^--(source|name|reviewed-by|reviewed-at)(?:=(.*))?$/.exec(argument);
    if (!match) fail(`Unknown option: ${argument}`);
    const value = match[2] ?? args[++index];
    if (!value || value.startsWith("--")) fail(`${match[1]} requires a value`);
    options[match[1].replaceAll("-", "")] = value;
  }

  for (const field of ["source", "reviewedby", "reviewedat"]) {
    if (!options[field]) fail(`--${field.replace("reviewedby", "reviewed-by").replace("reviewedat", "reviewed-at")} is required`);
  }
  if (Boolean(options.name) === options.all) fail("Exactly one of --name or --all is required");
  if (!kebabCase.test(options.source)) fail("--source must be kebab-case");
  if (options.name && !kebabCase.test(options.name)) fail("--name must be kebab-case");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.reviewedat)) fail("--reviewed-at must use YYYY-MM-DD");

  return options;
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function exists(fileSystem, file) {
  try {
    await fileSystem.access(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function publicItem(item, source, reviewedBy, reviewedAt) {
  const next = structuredClone(item);
  next.files = next.files.map((file) => ({
    ...file,
    path: `registry/sources/${source}/${file.path}`,
  }));
  next.meta.tasteblocks.status = "verified";
  next.meta.tasteblocks.preview = `previews/${next.name}.tsx`;
  next.meta.tasteblocks.verification = { reviewedBy, reviewedAt };
  return next;
}

function compareNames(left, right) {
  return left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
}

function assertUniqueNames(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.name)) fail(`${label} contains duplicate item ${item.name}`);
    seen.add(item.name);
  }
}

async function removeFiles(fileSystem, files) {
  const failures = [];
  for (const file of files) {
    try {
      await fileSystem.unlink(file);
    } catch (error) {
      if (error.code !== "ENOENT") failures.push(error);
    }
  }
  return failures;
}

async function assertInputsUnchanged(fileSystem, sourceManifestPath, sourceManifestText, publicRegistryPath, publicRegistryText, records) {
  const [currentSource, currentPublic, ...currentPreviews] = await Promise.all([
    fileSystem.readFile(sourceManifestPath, "utf8"),
    fileSystem.readFile(publicRegistryPath, "utf8"),
    ...records.map((record) => fileSystem.readFile(record.draftPreviewPath, "utf8")),
  ]);
  if (currentSource !== sourceManifestText) fail("Source manifest changed during promotion");
  if (currentPublic !== publicRegistryText) fail("Public registry changed during promotion");
  records.forEach((record, index) => {
    if (currentPreviews[index] !== record.previewText) fail(`${record.name} draft preview changed during promotion`);
  });
}

export async function promoteDrafts(options, dependencies = {}) {
  const fileSystem = { ...defaultFileSystem, ...dependencies.fileSystem };
  const validatePublic = dependencies.validatePublic ?? validatePublicRegistry;
  const root = dependencies.root ?? process.cwd();
  const sourceManifestPath = path.join(root, "registry", "sources", options.source, "drafts.json");
  const publicRegistryPath = path.join(root, "registry.json");
  const [sourceManifestText, publicRegistryText] = await Promise.all([
    fileSystem.readFile(sourceManifestPath, "utf8"),
    fileSystem.readFile(publicRegistryPath, "utf8"),
  ]);
  const sourceManifest = JSON.parse(sourceManifestText);
  const publicRegistry = JSON.parse(publicRegistryText);
  const sourceParsed = registrySchema.safeParse(sourceManifest);
  if (!sourceParsed.success) fail(`${options.source}/drafts.json does not pass the official registry schema`);
  const publicParsed = registrySchema.safeParse(publicRegistry);
  if (!publicParsed.success) fail("registry.json does not pass the official registry schema");
  assertUniqueNames(publicRegistry.items, "registry.json");

  let selected;
  if (options.all) {
    selected = [...sourceManifest.items].sort(compareNames);
    if (selected.length === 0) fail(`${options.source}/drafts.json has no drafts to promote`);
    assertUniqueNames(selected, `${options.source}/drafts.json`);
  } else {
    const matches = sourceManifest.items.filter((item) => item.name === options.name);
    if (matches.length !== 1) fail(`Expected exactly one ${options.name} draft in ${options.source}/drafts.json`);
    selected = matches;
  }

  const publicNames = new Set(publicRegistry.items.map((item) => item.name));
  const records = [];
  for (const item of selected) {
    if (item.meta?.tasteblocks?.status !== "draft") fail(`${item.name} is not a draft`);
    const expectedPreview = `previews/drafts/${options.source}/${item.name}.tsx`;
    if (item.meta.tasteblocks.preview !== expectedPreview) fail(`${item.name} does not reference ${expectedPreview}`);
    if (publicNames.has(item.name)) fail(`${item.name} is already public`);

    const draftPreviewPath = path.join(root, ...expectedPreview.split("/"));
    const publicPreviewPath = path.join(root, "previews", `${item.name}.tsx`);
    if (!(await exists(fileSystem, draftPreviewPath))) fail(`Draft preview does not exist: ${expectedPreview}`);
    const previewText = await fileSystem.readFile(draftPreviewPath, "utf8");
    if (await exists(fileSystem, publicPreviewPath)) fail(`Public preview already exists: previews/${item.name}.tsx`);
    if (relativeImportPatterns.some((pattern) => pattern.test(previewText))) {
      fail(`${item.name} preview must use project aliases or package imports before promotion`);
    }
    records.push({ item, name: item.name, draftPreviewPath, publicPreviewPath, previewText });
  }

  const selectedNames = new Set(records.map((record) => record.name));
  const promoted = records.map((record) => publicItem(record.item, options.source, options.reviewedby, options.reviewedat));
  const nextSourceManifest = {
    ...sourceManifest,
    items: sourceManifest.items.filter((item) => !selectedNames.has(item.name)),
  };
  const nextPublicRegistry = {
    ...publicRegistry,
    items: [...publicRegistry.items, ...promoted].sort(compareNames),
  };
  if (!registrySchema.safeParse(nextSourceManifest).success) {
    fail(`Promotion would invalidate ${options.source}/drafts.json`);
  }
  if (!registrySchema.safeParse(nextPublicRegistry).success) fail("Promotion would invalidate registry.json");
  assertUniqueNames(nextPublicRegistry.items, "next registry.json");

  const createdPublicPreviews = [];
  const transactionId = randomUUID();
  const sourceTempPath = `${sourceManifestPath}.${transactionId}.tmp`;
  const publicTempPath = `${publicRegistryPath}.${transactionId}.tmp`;
  const tempPaths = [sourceTempPath, publicTempPath];
  const draftPreviewsToRestore = new Set();
  let sourceManifestMayHaveChanged = false;
  let publicRegistryMayHaveChanged = false;

  try {
    for (const record of records) {
      await fileSystem.writeFile(record.publicPreviewPath, record.previewText, { flag: "wx" });
      createdPublicPreviews.push(record.publicPreviewPath);
    }

    await validatePublic(nextPublicRegistry, root);

    if (!options.write) {
      const cleanupFailures = await removeFiles(fileSystem, createdPublicPreviews);
      if (cleanupFailures.length > 0) throw new AggregateError(cleanupFailures, "Dry-run preview cleanup failed");
      return { names: records.map((record) => record.name), source: options.source, write: false };
    }

    await assertInputsUnchanged(
      fileSystem,
      sourceManifestPath,
      sourceManifestText,
      publicRegistryPath,
      publicRegistryText,
      records,
    );
    await fileSystem.writeFile(sourceTempPath, json(nextSourceManifest), { flag: "wx" });
    await fileSystem.writeFile(publicTempPath, json(nextPublicRegistry), { flag: "wx" });
    await assertInputsUnchanged(
      fileSystem,
      sourceManifestPath,
      sourceManifestText,
      publicRegistryPath,
      publicRegistryText,
      records,
    );

    sourceManifestMayHaveChanged = true;
    await fileSystem.rename(sourceTempPath, sourceManifestPath);
    publicRegistryMayHaveChanged = true;
    await fileSystem.rename(publicTempPath, publicRegistryPath);
    for (const record of records) {
      draftPreviewsToRestore.add(record);
      await fileSystem.unlink(record.draftPreviewPath);
    }

    return { names: records.map((record) => record.name), source: options.source, write: true };
  } catch (error) {
    const rollbackFailures = [];
    if (sourceManifestMayHaveChanged) {
      try {
        await fileSystem.writeFile(sourceManifestPath, sourceManifestText);
      } catch (rollbackError) {
        rollbackFailures.push(rollbackError);
      }
    }
    if (publicRegistryMayHaveChanged) {
      try {
        await fileSystem.writeFile(publicRegistryPath, publicRegistryText);
      } catch (rollbackError) {
        rollbackFailures.push(rollbackError);
      }
    }
    for (const record of draftPreviewsToRestore) {
      try {
        await fileSystem.writeFile(record.draftPreviewPath, record.previewText);
      } catch (rollbackError) {
        rollbackFailures.push(rollbackError);
      }
    }
    rollbackFailures.push(...(await removeFiles(fileSystem, createdPublicPreviews)));
    rollbackFailures.push(...(await removeFiles(fileSystem, tempPaths)));
    if (rollbackFailures.length > 0) {
      throw new AggregateError([error, ...rollbackFailures], `Promotion failed and rollback was incomplete: ${error.message}`);
    }
    throw error;
  }
}

export async function runCli(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const result = await promoteDrafts(options);
  if (result.names.length === 1) {
    const name = result.names[0];
    console.log(
      result.write
        ? `Promoted ${name} from ${result.source}.`
        : `Dry run passed for ${name}. Re-run with --write to promote it.`,
    );
  } else {
    console.log(
      result.write
        ? `Promoted ${result.names.length} drafts from ${result.source}.`
        : `Dry run passed for ${result.names.length} drafts from ${result.source}. Re-run with --write to promote them.`,
    );
  }
  return result;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    await runCli();
  } catch (error) {
    console.error(`Promotion failed: ${error.message}`);
    process.exitCode = 1;
  }
}
