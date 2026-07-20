import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { checkDrafts } from "../../../scripts/check-drafts.mjs"

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(sourceRoot, "../../..")
const componentRoot = path.join(sourceRoot, "components")

const { total } = await checkDrafts(projectRoot, "eldora-ui")
assert.equal(total, 3)

const manifest = JSON.parse(
  await readFile(path.join(sourceRoot, "drafts.json"), "utf8")
)
assert.deepEqual(
  manifest.items.map((item) => item.name),
  [
    "eldora-photon-beam",
    "eldora-novatrix",
    "eldora-inline-diff-comments",
  ]
)
for (const item of manifest.items) {
  assert.equal(
    item.meta.tasteblocks.source.revision,
    "2ef4f1eb4f4a6dea6fc2bdd4d87b6a3f2ff65321"
  )
  assert.equal(item.meta.tasteblocks.license.spdx, "MIT")
}

const photon = await readFile(
  path.join(componentRoot, "eldora-photon-beam/photon-beam.tsx"),
  "utf8"
)
for (const gate of [
  "prefers-reduced-motion: reduce",
  "ResizeObserver",
  "IntersectionObserver",
  "visibilitychange",
  "forceContextLoss",
  'aria-hidden="true"',
]) {
  assert(photon.includes(gate), `Photon Beam is missing ${gate}`)
}

const novatrix = await readFile(
  path.join(componentRoot, "eldora-novatrix/novatrix.tsx"),
  "utf8"
)
for (const gate of [
  "prefers-reduced-motion: reduce",
  "ResizeObserver",
  "IntersectionObserver",
  "visibilitychange",
  '"pointermove"',
  "WEBGL_lose_context",
  'aria-hidden="true"',
]) {
  assert(novatrix.includes(gate), `Novatrix is missing ${gate}`)
}

const comments = await readFile(
  path.join(
    componentRoot,
    "eldora-inline-diff-comments/inline-diff-comments.tsx"
  ),
  "utf8"
)
for (const gate of [
  'type="button"',
  'event.key === "Escape"',
  "event.metaKey || event.ctrlKey",
  "requestAnimationFrame",
  'dir="ltr"',
  "size-11",
  "initialComments = {}",
  "No comments yet.",
]) {
  assert(comments.includes(gate), `Inline Diff Comments is missing ${gate}`)
}
assert(!comments.includes('author: "Reviewer"'))

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await sourceFiles(target)))
    else if (/\.(?:css|ts|tsx)$/.test(entry.name)) files.push(target)
  }
  return files
}

const secretPattern =
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/
const remoteAssetPattern =
  /(?:src|srcset|poster|url\()\s*[:=(]?\s*["']?https?:\/\//i

for (const file of await sourceFiles(componentRoot)) {
  const content = await readFile(file, "utf8")
  assert.doesNotMatch(content, secretPattern, `${file} contains a possible secret`)
  assert.doesNotMatch(
    content,
    remoteAssetPattern,
    `${file} contains a remote runtime asset`
  )
  assert.doesNotMatch(content, /[ \t]+$/m, `${file} has trailing whitespace`)
  assert.ok(content.endsWith("\n"), `${file} must end with a newline`)
}

console.log("eldora-ui: provenance, policy, motion, interaction, and source checks passed")
