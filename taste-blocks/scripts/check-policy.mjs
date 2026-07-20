import { readFile } from "node:fs/promises";
import path from "node:path";
import { registryFiles } from "./registry-files.mjs";

const names = new Set();
const forbidden = /(?:^|[-_])(block|layout|page|section|template)(?:$|[-_])/i;

for (const file of await registryFiles()) {
  const registry = JSON.parse(await readFile(file, "utf8"));
  for (const item of registry.items ?? []) {
    if (item.type !== "registry:component") throw new Error(`${item.name} is not a component`);
    if (forbidden.test(item.name)) throw new Error(`${item.name} uses excluded product terminology`);
    if (names.has(item.name)) throw new Error(`${item.name} is duplicated`);
    names.add(item.name);
  }
}

console.log(`Policy passed for ${names.size} components.`);
