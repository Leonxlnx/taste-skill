import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const tasteRoot = path.resolve(sourceRoot, "../../..")
const repositoryRoot = path.resolve(tasteRoot, "..")
const revision = "4aba04e5e1c3e1c7de966554aacbe0cd6a31c77e"
const repository = "https://github.com/kokonut-labs/kokonutui.git"
const rawLicenseHash = "5711e66cc286e26956ed574d0f2852d6e9601e4694b279cc490175e40f04677f"
const localLicenseHash = "b2e018ad1fd564608cc1ee0c2ad675ce5202c8ed9f5f68e6d09e7b6bc881d5d2"

const retained = ["avatar-picker", "file-upload"]
const rejected = [
  "action-search-bar",
  "ai-input-search",
  "ai-loading",
  "ai-prompt",
  "ai-text-loading",
  "ai-voice",
  "apple-activity-card",
  "attract-button",
  "background-paths",
  "beams-background",
  "bento-grid",
  "card-flip",
  "card-stack",
  "carousel-cards",
  "command-button",
  "currency-transfer",
  "dynamic-text",
  "flow-field",
  "glitch-text",
  "gradient-button",
  "hold-button",
  "liquid-glass-card",
  "loader",
  "matrix-text",
  "morphic-navbar",
  "mouse-effect-card",
  "particle-button",
  "profile-dropdown",
  "scroll-text",
  "shape-hero",
  "shimmer-text",
  "sliced-text",
  "slide-text-button",
  "smooth-drawer",
  "smooth-tab",
  "social-button",
  "spotlight-cards",
  "switch-button",
  "swoosh-text",
  "team-selector",
  "toolbar",
  "tweet-card",
  "type-writer",
  "v0-button",
]

const upstreamHashes = new Map([
  ["components/kokonutui/avatar-picker.tsx", "cd01dbf9b1fcfa4dc71f7a40c826ae4d6ba4dff9606bdec7309fc9d282a13363"],
  ["components/kokonutui/file-upload.tsx", "a4e08685bba86205a625fced37fd1a4dcc034d2b8b707c35f36ae27019b34846"],
  ["components/ui/button.tsx", "6ccf1b15a9db001a2e682ee288f4c77b6ced9988325cc070a61a8056eb6c02e2"],
  ["components/ui/card.tsx", "cf27e9441dcf2882fc35483b84c4e231918186ec7e4b50c63984f48c3cb84aa0"],
  ["components/ui/input.tsx", "543afece30d075d11dc87dfd90295cfa196d4fc7ee56021fc6865f177723dea6"],
  ["lib/utils.ts", "9e45d6d21e0d57bf85930ba2bf6fdd9f5f0175d1129844356081a6050975deb1"],
])

function sha256(value) {
  return createHash("sha256").update(value).digest("hex")
}

function normalizeLineEndings(value) {
  return value.toString("utf8").replaceAll("\r\n", "\n")
}

function git(upstreamRoot, ...args) {
  return execFileSync("git", ["-C", upstreamRoot, ...args], { encoding: "utf8" }).trim()
}

const upstreamArg = process.argv.indexOf("--upstream-root")
const upstreamRoot = path.resolve(
  upstreamArg >= 0
    ? process.argv[upstreamArg + 1]
    : path.join(repositoryRoot, "_upstream-kokonut-ui-4aba04e5"),
)

assert.equal(git(upstreamRoot, "rev-parse", "HEAD"), revision)
assert.equal(git(upstreamRoot, "remote", "get-url", "origin"), repository)
assert.equal(git(upstreamRoot, "status", "--short"), "")

const upstreamLicense = await readFile(path.join(upstreamRoot, "LICENSE"))
const localLicense = await readFile(path.join(sourceRoot, "LICENSE"))
assert.equal(sha256(upstreamLicense), rawLicenseHash)
assert.equal(sha256(localLicense), localLicenseHash)
assert.equal(normalizeLineEndings(upstreamLicense), normalizeLineEndings(localLicense))

for (const [upstreamPath, expectedHash] of upstreamHashes) {
  assert.equal(
    sha256(await readFile(path.join(upstreamRoot, ...upstreamPath.split("/")))),
    expectedHash,
    `${upstreamPath} no longer matches the pinned source`,
  )
}

const inventory = (await readdir(path.join(upstreamRoot, "components/kokonutui")))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.slice(0, -4))
  .sort()
const classified = [...retained, ...rejected].sort()
assert.equal(inventory.length, 46)
assert.equal(retained.length, 2)
assert.equal(rejected.length, 44)
assert.deepEqual(classified, inventory)

const manifest = JSON.parse(await readFile(path.join(sourceRoot, "drafts.json"), "utf8"))
assert.deepEqual(
  manifest.items.map((item) => item.name).sort(),
  ["kokonut-avatar-picker", "kokonut-file-upload"],
)
for (const item of manifest.items) {
  assert.equal(item.meta.tasteblocks.source.revision, revision)
  for (const sourceFile of item.meta.tasteblocks.source.files) {
    const shipped = await readFile(path.join(sourceRoot, ...sourceFile.shippedPath.split("/")))
    assert.equal(`sha256:${sha256(shipped)}`, sourceFile.contentSha256)
    assert.equal(
      `sha256:${upstreamHashes.get(sourceFile.upstreamPath)}`,
      sourceFile.upstreamSha256,
    )
  }
}

const avatar = await readFile(
  path.join(sourceRoot, "components/kokonut-avatar-picker/avatar-picker.tsx"),
  "utf8",
)
assert.match(avatar, /<form[^>]+onSubmit=/)
assert.match(avatar, /const usernameId = useId\(\)/)
assert.match(avatar, /aria-invalid=\{showError\}/)
assert.match(avatar, /useReducedMotion\(\)/)
assert.doesNotMatch(avatar, /id="username"|id=":[Rr]/)

const uploader = await readFile(
  path.join(sourceRoot, "components/kokonut-file-upload/file-upload.tsx"),
  "utf8",
)
assert.match(uploader, /uploadFile: \(file: File, context: FileUploadContext\) => Promise<void>/)
assert.match(uploader, /new AbortController\(\)/)
assert.match(uploader, /signal: controller\.signal/)
assert.match(uploader, /useReducedMotion\(\)/)
assert.match(uploader, /replaceAll\(":", ""\)/)
assert.doesNotMatch(uploader, /simulateUpload|uploadDelay|setInterval|Math\.random/)

for (const text of [avatar, uploader]) {
  assert.doesNotMatch(text, /from ["']next(?:\/|["'])/)
  assert.doesNotMatch(text, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/)
}

console.log(`Verified 2 retained and 44 rejected Kokonut UI components at ${revision}.`)
