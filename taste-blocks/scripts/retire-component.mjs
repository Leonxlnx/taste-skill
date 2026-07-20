import { readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

const nameIndex = process.argv.indexOf("--name")
const name = nameIndex >= 0 ? process.argv[nameIndex + 1] : undefined
if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error("--name requires a kebab-case component name")

const root = process.cwd()
const registryPath = path.join(root, "registry.json")
const registry = JSON.parse(await readFile(registryPath, "utf8"))
const matches = registry.items.filter((item) => item.name === name)
if (matches.length !== 1) throw new Error(`Expected exactly one public ${name} item`)

const preview = matches[0].meta?.tasteblocks?.preview
if (preview !== `previews/${name}.tsx`) throw new Error(`${name} has an unexpected preview path`)

registry.items = registry.items.filter((item) => item.name !== name)
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
await Promise.all([
  unlink(path.join(root, ...preview.split("/"))),
  unlink(path.join(root, "public", "r", `${name}.json`)),
])
console.log(`Retired ${name}; ${registry.items.length} public components remain.`)
