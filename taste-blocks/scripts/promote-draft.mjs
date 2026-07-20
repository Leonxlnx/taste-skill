import { access, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { registrySchema } from "shadcn/schema";
import { validatePublicRegistry } from "./check-policy.mjs";

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  throw new Error(message);
}

function parseArgs(args) {
  const options = { write: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--write") {
      options.write = true;
      continue;
    }

    const match = /^--(source|name|reviewed-by|reviewed-at)(?:=(.*))?$/.exec(argument);
    if (!match) fail(`Unknown option: ${argument}`);
    const value = match[2] ?? args[++index];
    if (!value || value.startsWith("--")) fail(`${match[1]} requires a value`);
    options[match[1].replaceAll("-", "")] = value;
  }

  for (const field of ["source", "name", "reviewedby", "reviewedat"]) {
    if (!options[field]) fail(`--${field.replace("reviewedby", "reviewed-by").replace("reviewedat", "reviewed-at")} is required`);
  }
  if (!kebabCase.test(options.source)) fail("--source must be kebab-case");
  if (!kebabCase.test(options.name)) fail("--name must be kebab-case");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.reviewedat)) fail("--reviewed-at must use YYYY-MM-DD");

  return options;
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function exists(file) {
  try {
    await access(file);
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

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const sourceManifestPath = path.join(root, "registry", "sources", options.source, "drafts.json");
  const publicRegistryPath = path.join(root, "registry.json");
  const draftPreviewPath = path.join(root, "previews", "drafts", options.source, `${options.name}.tsx`);
  const publicPreviewPath = path.join(root, "previews", `${options.name}.tsx`);

  const [sourceManifestText, publicRegistryText, previewText] = await Promise.all([
    readFile(sourceManifestPath, "utf8"),
    readFile(publicRegistryPath, "utf8"),
    readFile(draftPreviewPath, "utf8"),
  ]);
  if (await exists(publicPreviewPath)) fail(`Public preview already exists: previews/${options.name}.tsx`);

  const sourceManifest = JSON.parse(sourceManifestText);
  const publicRegistry = JSON.parse(publicRegistryText);
  const sourceParsed = registrySchema.safeParse(sourceManifest);
  if (!sourceParsed.success) fail(`${options.source}/drafts.json does not pass the official registry schema`);
  const publicParsed = registrySchema.safeParse(publicRegistry);
  if (!publicParsed.success) fail("registry.json does not pass the official registry schema");

  const matches = sourceManifest.items.filter((item) => item.name === options.name);
  if (matches.length !== 1) fail(`Expected exactly one ${options.name} draft in ${options.source}/drafts.json`);
  if (publicRegistry.items.some((item) => item.name === options.name)) fail(`${options.name} is already public`);

  const item = matches[0];
  if (item.meta?.tasteblocks?.status !== "draft") fail(`${options.name} is not a draft`);
  const expectedPreview = `previews/drafts/${options.source}/${options.name}.tsx`;
  if (item.meta.tasteblocks.preview !== expectedPreview) fail(`${options.name} does not reference ${expectedPreview}`);

  const promoted = publicItem(item, options.source, options.reviewedby, options.reviewedat);
  const nextSourceManifest = {
    ...sourceManifest,
    items: sourceManifest.items.filter((candidate) => candidate.name !== options.name),
  };
  const nextPublicRegistry = {
    ...publicRegistry,
    items: [...publicRegistry.items, promoted].sort((left, right) => left.name.localeCompare(right.name)),
  };
  if (!registrySchema.safeParse(nextSourceManifest).success) {
    fail(`Removing ${options.name} would invalidate ${options.source}/drafts.json`);
  }

  await writeFile(publicPreviewPath, previewText);
  try {
    await validatePublicRegistry(nextPublicRegistry, root);
  } catch (error) {
    await unlink(publicPreviewPath);
    throw error;
  }

  if (!options.write) {
    await unlink(publicPreviewPath);
    console.log(`Dry run passed for ${options.name}. Re-run with --write to promote it.`);
    return;
  }

  try {
    await writeFile(sourceManifestPath, json(nextSourceManifest));
    await writeFile(publicRegistryPath, json(nextPublicRegistry));
    await unlink(draftPreviewPath);
  } catch (error) {
    await Promise.all([
      writeFile(sourceManifestPath, sourceManifestText),
      writeFile(publicRegistryPath, publicRegistryText),
      writeFile(draftPreviewPath, previewText),
    ]);
    if (await exists(publicPreviewPath)) await unlink(publicPreviewPath);
    throw error;
  }

  console.log(`Promoted ${options.name} from ${options.source}.`);
}

try {
  await main();
} catch (error) {
  console.error(`Promotion failed: ${error.message}`);
  process.exitCode = 1;
}
