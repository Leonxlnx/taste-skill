import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPublicRegistry } from "./check-policy.mjs";

const root = process.cwd();
const { items } = await loadPublicRegistry(root);
let previewEntries = [];
try {
  previewEntries = await readdir(path.join(root, "previews"), { withFileTypes: true });
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const publicNames = new Set(items.map(({ name }) => name));
for (const entry of previewEntries) {
  if (entry.isFile() && entry.name.endsWith(".tsx")) {
    const name = path.basename(entry.name, ".tsx");
    if (!publicNames.has(name)) throw new Error(`Orphaned public preview ${entry.name}`);
  }
}

const publicRegistryRoot = path.join(root, "public", "r");
const registryNames = [...publicNames].sort();
let builtRegistry;
try {
  builtRegistry = JSON.parse(await readFile(path.join(publicRegistryRoot, "registry.json"), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (builtRegistry) {
  const builtNames = builtRegistry.items.map(({ name }) => name).sort();
  const individualNames = (await readdir(publicRegistryRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && entry.name !== "registry.json")
    .map((entry) => path.basename(entry.name, ".json"))
    .sort();
  if (JSON.stringify(builtNames) !== JSON.stringify(registryNames)) {
    throw new Error("public/r/registry.json does not match registry.json");
  }
  if (JSON.stringify(individualNames) !== JSON.stringify(registryNames)) {
    throw new Error("Individual public registry files do not match registry.json");
  }
  for (const name of registryNames) {
    const item = JSON.parse(await readFile(path.join(publicRegistryRoot, `${name}.json`), "utf8"));
    if (item.name !== name) throw new Error(`Public registry item name mismatch: ${name}`);
  }
}

function publicEvidence({ localPath: _localPath, ...evidence }) {
  return evidence;
}

function publicLicense(license) {
  return {
    spdx: license.spdx,
    scope: license.scope,
    copyright: license.copyright,
    evidence: publicEvidence(license.evidence),
    notices: license.notices,
  };
}

function publicAsset(asset) {
  return {
    name: asset.name ?? path.posix.basename(asset.localPath),
    sha256: asset.sha256,
    source: {
      project: asset.source.project,
      repository: asset.source.repository,
      revision: asset.source.revision,
      upstreamPath: asset.source.upstreamPath,
      permalink: asset.source.permalink,
      sha256: asset.source.sha256,
      changes: asset.source.changes,
    },
    license: publicLicense(asset.license),
  };
}

const catalog = items.map((item) => {
  const tasteblocks = item.meta.tasteblocks;
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    author: item.author ?? tasteblocks.source.project,
    type: item.type,
    status: tasteblocks.status,
    category: tasteblocks.category,
    tags: tasteblocks.tags,
    renderer: tasteblocks.renderer,
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    source: {
      project: tasteblocks.source.project,
      repository: tasteblocks.source.repository,
      revision: tasteblocks.source.revision,
      retrievedAt: tasteblocks.source.retrievedAt,
      files: tasteblocks.source.files.map(
        ({ shippedPath: _shippedPath, upstreamPath, permalink, upstreamSha256, contentSha256, changes }) => ({
          upstreamPath,
          permalink,
          upstreamSha256,
          contentSha256,
          changes,
        }),
      ),
    },
    license: publicLicense(tasteblocks.license),
    modifications: tasteblocks.modifications,
    assets: tasteblocks.assets.map(publicAsset),
    hashes: {
      source: tasteblocks.dedupe.sourceHash,
      content: tasteblocks.dedupe.contentHash,
      structure: tasteblocks.dedupe.structureHash,
    },
    preview: `/preview/${item.name}`,
    registryAddress: `@taste/${item.name}`,
    installCommand: `npx shadcn@latest add @taste/${item.name}`,
  };
});

await mkdir(path.join(root, "generated"), { recursive: true });
await writeFile(path.join(root, "generated", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);

const previewRoutesRoot = path.join(root, "app", "preview", "(generated)");
await rm(previewRoutesRoot, { recursive: true, force: true });
for (const name of registryNames) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Unsafe preview route name: ${name}`);
  const routeDirectory = path.join(previewRoutesRoot, name);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(
    path.join(routeDirectory, "page.tsx"),
    `"use client";\n\nimport dynamic from "next/dynamic";\n\nconst Preview = dynamic(() => import("@/previews/${name}"), { ssr: false });\n\nexport default function PreviewPage() {\n  return (\n    <main className="grid min-h-[100dvh] place-items-center overflow-hidden bg-white p-6">\n      <Preview />\n    </main>\n  );\n}\n`,
  );
}

console.log(`Generated catalog for ${catalog.length} verified components.`);
