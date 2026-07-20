import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { registryFiles } from "./registry-files.mjs";

const root = process.cwd();
const items = [];

for (const file of await registryFiles(root)) {
  const registry = JSON.parse(await readFile(file, "utf8"));
  items.push(...(registry.items ?? []));
}

const previewDirectory = path.join(root, "previews");
let previewFiles = [];
try {
  previewFiles = (await readdir(previewDirectory)).filter((file) => file.endsWith(".tsx"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const previewNames = new Set(previewFiles.map((file) => path.basename(file, ".tsx")));
for (const item of items) {
  if (!previewNames.has(item.name)) throw new Error(`Missing preview for ${item.name}`);
}
for (const name of previewNames) {
  if (!items.some((item) => item.name === name)) throw new Error(`Orphaned preview ${name}`);
}

const catalog = items.map(({ name, title, description = "", meta = {} }) => ({
  name,
  title: title ?? name,
  description,
  meta,
}));
const loaders = previewFiles
  .sort()
  .map((file) => {
    const name = path.basename(file, ".tsx");
    return `  ${JSON.stringify(name)}: () => import(${JSON.stringify(`../previews/${name}`)}),`;
  })
  .join("\n");

await mkdir(path.join(root, "generated"), { recursive: true });
await writeFile(path.join(root, "generated", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(
  path.join(root, "generated", "preview-loaders.ts"),
  `import type { ComponentType } from "react";\n\ntype PreviewModule = { default: ComponentType };\n\nexport const previewLoaders: Record<string, () => Promise<PreviewModule>> = {\n${loaders}\n};\n`,
);

console.log(`Generated catalog for ${catalog.length} components.`);
