import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const previewRoot = path.join(root, "previews")
const entries = await readdir(previewRoot, { withFileTypes: true })
let changed = 0

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue
  const file = path.join(previewRoot, entry.name)
  const source = await readFile(file, "utf8")
  if (/^\s*["']use client["'];/.test(source)) continue
  await writeFile(file, `"use client"\n\n${source}`)
  changed += 1
}

console.log(`Marked ${changed} previews as client components.`)
