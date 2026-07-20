import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

import { checkDrafts } from "../../../scripts/check-drafts.mjs"
import { sha256 } from "../../../scripts/policy-utils.mjs"

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(sourceRoot, "../../..")
const componentRoot = path.join(sourceRoot, "components", "extend-ui")
const revision = "6d6d33df18ec39455df00f6315f16d2cfd89563b"
const expectedNames = [
  "extend-file-upload",
  "extend-file-thumbnail",
  "extend-document-viewer-sidebar",
  "extend-document-splits",
  "extend-xlsx-viewer",
  "extend-pptx-viewer",
  "extend-csv-viewer",
  "extend-bounding-box-citations",
  "extend-schema-builder",
]

const { total } = await checkDrafts(projectRoot, "extend-ui")
assert.equal(total, expectedNames.length)

const manifest = JSON.parse(
  await readFile(path.join(sourceRoot, "drafts.json"), "utf8")
)
assert.deepEqual(
  manifest.items.map((item) => item.name),
  expectedNames
)

function specifiers(content, file) {
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX
  )
  const values = []
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      values.push(node.moduleSpecifier.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return values
}

function packageName(specifier) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/")
  return specifier.split("/", 1)[0]
}

function dependencyName(specifier) {
  return specifier.replace(/@(?=\d)/, "@").replace(/@(?:\^|~)?\d.*$/, "")
}

function expectedRegistryDependency(specifier) {
  const custom = "@/components/taste-blocks/extend-ui/"
  if (specifier.startsWith(custom)) return `extend-${specifier.slice(custom.length)}`
  const ui = "@/components/ui/"
  if (specifier.startsWith(ui)) return specifier.slice(ui.length)
  if (specifier === "@/lib/utils") return "utils"
  return null
}

for (const item of manifest.items) {
  assert.equal(item.meta.tasteblocks.source.revision, revision)
  assert.equal(item.meta.tasteblocks.license.spdx, "MIT")
  const declaredPackages = new Set(
    [...(item.dependencies ?? []), ...(item.devDependencies ?? [])].map(
      dependencyName
    )
  )
  const declaredRegistry = new Set(item.registryDependencies ?? [])

  for (const file of item.files) {
    const fullPath = path.join(sourceRoot, ...file.path.split("/"))
    const content = await readFile(fullPath, "utf8")
    for (const specifier of specifiers(content, fullPath)) {
      if (specifier.startsWith("@/")) {
        const expected = expectedRegistryDependency(specifier)
        assert(expected, `${item.name} has unmapped project import ${specifier}`)
        assert(
          declaredRegistry.has(expected),
          `${item.name} is missing registry dependency ${expected}`
        )
        continue
      }
      if (specifier.startsWith(".")) continue
      const packageRoot = packageName(specifier)
      if (packageRoot === "react" || packageRoot === "react-dom") continue
      assert(
        declaredPackages.has(packageRoot),
        `${item.name} is missing package dependency ${packageRoot}`
      )
    }
  }
}

async function files(directory) {
  const output = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) output.push(...(await files(target)))
    else output.push(target)
  }
  return output
}

const secretPattern =
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/
const remoteAssetPattern =
  /(?:src|srcset|poster|url\()\s*[:=(]?\s*["']?https?:\/\//i

for (const file of [
  ...(await files(componentRoot)),
  ...(await files(path.join(projectRoot, "previews", "drafts", "extend-ui"))),
]) {
  if (!/\.(?:css|ts|tsx)$/.test(file)) continue
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

const splitSource = await readFile(
  path.join(componentRoot, "document-splits.tsx"),
  "utf8"
)
for (const gate of [
  "KeyboardSensor",
  "sortableKeyboardCoordinates",
  "motion-reduce:!transition-none",
  "md:border-s",
]) {
  assert(splitSource.includes(gate), `Document Splits is missing ${gate}`)
}

const sidebarSource = await readFile(
  path.join(componentRoot, "document-viewer-sidebar.tsx"),
  "utf8"
)
for (const gate of [
  "start-0",
  "border-e",
  "rtl:translate-x-full",
  "motion-reduce:transition-none",
]) {
  assert(sidebarSource.includes(gate), `Document Viewer Sidebar is missing ${gate}`)
}

const upstreamIndex = process.argv.indexOf("--upstream-root")
if (upstreamIndex >= 0) {
  const upstreamRoot = path.resolve(process.argv[upstreamIndex + 1])
  assert.equal(
    execFileSync("git", ["-C", upstreamRoot, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    revision
  )
  for (const item of manifest.items) {
    for (const sourceFile of item.meta.tasteblocks.source.files) {
      const blob = execFileSync(
        "git",
        ["-C", upstreamRoot, "show", `${revision}:${sourceFile.upstreamPath}`],
        { maxBuffer: 32 * 1024 * 1024 }
      )
      assert.equal(sha256(blob), sourceFile.upstreamSha256)
    }
  }
  const licenseBlob = execFileSync(
    "git",
    ["-C", upstreamRoot, "show", `${revision}:LICENSE.md`]
  )
  assert.equal(
    sha256(licenseBlob),
    manifest.items[0].meta.tasteblocks.license.evidence.sha256
  )
}

console.log(
  `extend-ui: verified ${expectedNames.length} component drafts at ${revision}`
)
