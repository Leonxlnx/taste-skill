import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const registryRoot = path.join(root, "registry");
const outputRoot = path.join(root, "public", "r");

async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const resolved = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...(await walk(resolved)));
      else files.push(resolved);
    }
    return files;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

const files = await walk(registryRoot);
const metaFiles = files.filter((file) => path.basename(file) === "meta.json");
const items = [];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const metaFile of metaFiles) {
  const meta = JSON.parse(await readFile(metaFile, "utf8"));
  if (meta.status !== "verified") continue;

  const sourceDirectory = path.dirname(metaFile);
  const registryFiles = [];
  for (const filename of meta.files) {
    const sourcePath = path.join(sourceDirectory, filename);
    const extension = path.extname(filename);
    registryFiles.push({
      path: path.relative(root, sourcePath).replaceAll("\\", "/"),
      type: extension === ".css" ? "registry:style" : meta.type,
      target: `components/taste-blocks/${filename}`,
      content: await readFile(sourcePath, "utf8"),
    });
  }

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: meta.name,
    type: meta.type,
    title: meta.title,
    description: meta.description,
    dependencies: meta.dependencies,
    registryDependencies: meta.registryDependencies,
    files: registryFiles,
    meta: {
      kind: meta.kind,
      category: meta.category,
      sections: meta.sections,
      runtime: meta.runtime,
      origin: meta.origin,
      accessibility: meta.accessibility,
      performance: meta.performance,
    },
  };

  items.push({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: registryFiles.map(({ content: _content, ...file }) => file),
  });

  await writeFile(
    path.join(outputRoot, `${meta.name}.json`),
    `${JSON.stringify(item, null, 2)}\n`,
  );
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "taste-blocks",
  homepage: "https://github.com/Leonxlnx/taste-skill",
  items,
};

await writeFile(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Built ${items.length} verified registry item(s).`);
