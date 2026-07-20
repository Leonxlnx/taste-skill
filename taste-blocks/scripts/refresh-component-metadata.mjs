import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { aggregateHash, sha256, structureHash } from "./policy-utils.mjs"

function fail(message) {
  throw new Error(message)
}

function parseArgs(args) {
  const separator = args.indexOf("--")
  if (separator < 0) fail("Use --change <text> --reason <text> -- <file...>")
  const options = { files: args.slice(separator + 1) }
  for (let index = 0; index < separator; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!value || !["--change", "--reason"].includes(key)) fail("Use --change <text> --reason <text> -- <file...>")
    options[key.slice(2)] = value
  }
  if (!options.change || !options.reason || options.files.length === 0) fail("Change, reason, and at least one file are required")
  return options
}

const options = parseArgs(process.argv.slice(2))
const root = process.cwd()
const registryPath = path.join(root, "registry.json")
const registry = JSON.parse(await readFile(registryPath, "utf8"))
const requested = new Set(options.files.map((file) => file.replaceAll("\\", "/")))
const matched = new Set()
let touchedItems = 0

for (const item of registry.items) {
  const tasteblocks = item.meta.tasteblocks
  let itemChanged = false
  const structuralFiles = []
  const shippedHashes = []

  for (const sourceFile of tasteblocks.source.files) {
    const declared = item.files.find(
      (file) => file.path === sourceFile.shippedPath || file.path.endsWith(`/${sourceFile.shippedPath}`),
    )
    if (!declared) fail(`${item.name} cannot resolve ${sourceFile.shippedPath}`)
    const localPath = declared.path.replaceAll("\\", "/")
    const content = await readFile(path.join(root, ...localPath.split("/")))
    const contentHash = sha256(content)

    if (requested.has(localPath)) {
      matched.add(localPath)
      itemChanged = true
      sourceFile.contentSha256 = contentHash
      if (!sourceFile.changes.includes(options.change)) sourceFile.changes.push(options.change)

      const existing = tasteblocks.modifications.find((entry) => entry.shippedPath === sourceFile.shippedPath)
      if (existing) {
        if (!existing.change.includes(options.change)) existing.change = `${existing.change} ${options.change}`
        if (!existing.reason.includes(options.reason)) existing.reason = `${existing.reason} ${options.reason}`
      } else {
        tasteblocks.modifications.push({ shippedPath: sourceFile.shippedPath, change: options.change, reason: options.reason })
      }
    }

    shippedHashes.push(itemChanged && requested.has(localPath) ? contentHash : sourceFile.contentSha256)
    structuralFiles.push({ path: declared.path, content })
  }

  if (itemChanged) {
    tasteblocks.dedupe.contentHash = aggregateHash(shippedHashes)
    tasteblocks.dedupe.structureHash = structureHash(structuralFiles)
    touchedItems += 1
  }
}

const missing = [...requested].filter((file) => !matched.has(file))
if (missing.length > 0) fail(`Files are not declared by public items: ${missing.join(", ")}`)

await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
console.log(`Refreshed metadata for ${matched.size} files across ${touchedItems} items.`)
