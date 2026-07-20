import { readdir } from "node:fs/promises";
import path from "node:path";

export async function registryFiles(root = process.cwd()) {
  const files = [path.join(root, "registry.json")];
  const sources = path.join(root, "registry", "sources");

  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(target);
      if (entry.isFile() && entry.name === "registry.json") files.push(target);
    }
  }

  await visit(sources);
  return files;
}
