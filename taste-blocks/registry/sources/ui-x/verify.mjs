import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { aggregateHash, sha256, structureHash } from "../../../scripts/policy-utils.mjs"

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const tasteRoot = path.resolve(sourceRoot, "../../..")
const repository = "https://github.com/junwen-k/ui-x"
const revision = "800d4f47fec33524967f97fde59a762df4afbf00"
const retrievedAt = "2026-07-20"
const componentRoot = "components/ui-x"
const licenseHash = "sha256:a80d52497975e3a97ebf893008dab7ad8ea176e9b48b179b443c60650af770e2"

const files = {
  utility: {
    path: `${componentRoot}/lib/utils.ts`,
    upstreamPath: "apps/v4/src/lib/utils.ts",
    upstreamHash: "sha256:4acbc7165a8d54738ff62b51414e772c08fe78434e524e6d8770180d3ba2925f",
    type: "registry:lib",
    changes: [],
  },
  dateTimeRangeField: {
    path: `${componentRoot}/date-time-range-field.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/date-time-range-field.tsx",
    upstreamHash: "sha256:379d0aedc1ff4fbfb97ae628b33283fd82cd3d6e47c4b829b95e9764e78952c8",
    type: "registry:component",
    changes: ["Changed UI-X internal and cn aliases to copied source-local imports."],
  },
  dateTimeRangePrimitive: {
    path: `${componentRoot}/date-time-range-field-primitive.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/date-time-range-field-primitive.tsx",
    upstreamHash: "sha256:76aeeb6c9466f3c071900c93cfa3a040dcdcffb9b429bda616338d14490de8d3",
    type: "registry:lib",
    changes: ["Changed the UI-X hook alias to the copied source-local module."],
  },
  dateTimeField: {
    path: `${componentRoot}/date-time-field.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/date-time-field.tsx",
    upstreamHash: "sha256:3f5fd8e821f34c1ba030145b37225a30a6e09fd16e00805291fc1f763ceeeec6",
    type: "registry:lib",
    changes: ["Changed UI-X internal and cn aliases to copied source-local imports."],
  },
  dateTimePrimitive: {
    path: `${componentRoot}/date-time-field-primitive.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/date-time-field-primitive.tsx",
    upstreamHash: "sha256:616efafedbf3410257d44775c2ccdcc9692f1f42e59ac95a06c9b604826b4c44",
    type: "registry:lib",
    changes: ["Changed the UI-X hook alias to the copied source-local module."],
  },
  useTimescape: {
    path: `${componentRoot}/use-timescape.ts`,
    upstreamPath: "apps/v4/src/registry/new-york/hooks/use-timescape.ts",
    upstreamHash: "sha256:14d120d2e8c61eaa589b8e3f77e92728a858a3df0cf83916a653d0ac4f8c96e9",
    type: "registry:hook",
    changes: [],
  },
  dropzone: {
    path: `${componentRoot}/dropzone.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/dropzone.tsx",
    upstreamHash: "sha256:e6c69822c394e7a25ed1cd662ad144aff3e105c9a9aae7902769a67bd160d818",
    type: "registry:component",
    changes: [
      "Changed UI-X internal and cn aliases to copied source-local imports.",
      "Disabled the color transition when reduced motion is requested.",
    ],
  },
  dropzonePrimitive: {
    path: `${componentRoot}/dropzone-primitive.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/dropzone-primitive.tsx",
    upstreamHash: "sha256:42108e385a351010e3cbdce7b81b5318cdd57070c82daef6e6db5ffdbfe3be4d",
    type: "registry:lib",
    changes: ["Set the optional trigger to type=button so it cannot submit a parent form."],
  },
  phoneInput: {
    path: `${componentRoot}/phone-input.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/phone-input.tsx",
    upstreamHash: "sha256:e02699b08523d2bbb1c75db50829ad0403359431da4b0a2e6b81a25148d2fef0",
    type: "registry:component",
    changes: ["Changed UI-X internal and cn aliases to copied source-local imports."],
  },
  phoneInputPrimitive: {
    path: `${componentRoot}/phone-input-primitive.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/phone-input-primitive.tsx",
    upstreamHash: "sha256:ea48d3559c6f0eae9904e8faed0553b719162fc11c81dd0bd1c4545d2fb5d5ec",
    type: "registry:lib",
    changes: [],
  },
  virtualized: {
    path: `${componentRoot}/virtualized.tsx`,
    upstreamPath: "apps/v4/src/registry/new-york/ui/virtualized.tsx",
    upstreamHash: "sha256:c04e9cfd9c209a5361b9674397ff4458d7fd350d5456d7d6593e3d2db49d9e27",
    type: "registry:component",
    changes: [],
  },
}

const components = [
  {
    slug: "date-time-range-field",
    title: "Date Time Range Field",
    description: "Provides keyboard-editable start and end date-time segments with controlled and uncontrolled range state.",
    category: "forms-feedback",
    tags: ["date", "time", "range", "segmented-input"],
    family: "segmented-date-time-range-field",
    dependencies: ["@base-ui/react@1.6.0", "@base-ui/utils@0.3.1", "clsx@2.1.1", "react-day-picker@9.7.0", "tailwind-merge@3.6.0", "timescape@0.8.0"],
    registryDependencies: ["input-group"],
    files: [files.dateTimeRangeField, files.dateTimeRangePrimitive, files.dateTimeField, files.dateTimePrimitive, files.useTimescape, files.utility],
  },
  {
    slug: "dropzone",
    title: "Dropzone",
    description: "Provides an accessible file input with drag states, validation states, keyboard activation, and accepted-file output.",
    category: "forms-feedback",
    tags: ["files", "drag-and-drop", "upload", "validation"],
    family: "accessible-drag-and-drop-file-input",
    dependencies: ["@base-ui/react@1.6.0", "clsx@2.1.1", "lucide-react@0.511.0", "react-dropzone@17.0.0", "tailwind-merge@3.6.0"],
    registryDependencies: [],
    files: [files.dropzone, files.dropzonePrimitive, files.utility],
  },
  {
    slug: "phone-input",
    title: "Phone Input",
    description: "Provides international phone formatting with a searchable country selector, flags, and calling codes.",
    category: "forms-feedback",
    tags: ["phone", "country", "international", "validation"],
    family: "country-aware-international-phone-input",
    dependencies: ["@base-ui/react@1.6.0", "@base-ui/utils@0.3.1", "clsx@2.1.1", "lucide-react@0.511.0", "react-phone-number-input@3.4.17", "tailwind-merge@3.6.0"],
    registryDependencies: ["input", "select"],
    files: [files.phoneInput, files.phoneInputPrimitive, files.utility],
  },
  {
    slug: "virtualized",
    title: "Virtualized Collection",
    description: "Provides list, grid, and external-scroll virtualizers for rendering large collections efficiently.",
    category: "cards-containers",
    tags: ["virtualization", "list", "grid", "performance"],
    family: "virtualized-list-grid-container",
    dependencies: ["@base-ui/react@1.6.0", "virtua@0.49.3"],
    registryDependencies: [],
    files: [files.virtualized],
  },
]

const permalink = (upstreamPath) => `${repository}/blob/${revision}/${upstreamPath}`

async function createItem(component) {
  const name = `ui-x-${component.slug}`
  const resolved = await Promise.all(component.files.map(async (file) => ({
    ...file,
    content: await readFile(path.join(sourceRoot, ...file.path.split("/"))),
  })))

  return {
    name,
    type: "registry:component",
    title: component.title,
    description: component.description,
    author: "Kwan Jun Wen",
    dependencies: component.dependencies,
    registryDependencies: component.registryDependencies,
    files: resolved.map((file, index) => ({
      path: file.path,
      type: index === 0 ? "registry:component" : file.type,
      target: `@components/taste-blocks/ui-x/${file.path.slice(`${componentRoot}/`.length)}`,
    })),
    categories: [component.category],
    meta: {
      tasteblocks: {
        status: "draft",
        category: component.category,
        tags: component.tags,
        renderer: "dom",
        preview: `previews/drafts/ui-x/${name}.tsx`,
        source: {
          project: "UI-X",
          repository,
          revision,
          retrievedAt,
          files: resolved.map((file) => ({
            shippedPath: file.path,
            upstreamPath: file.upstreamPath,
            permalink: permalink(file.upstreamPath),
            upstreamSha256: file.upstreamHash,
            contentSha256: sha256(file.content),
            changes: file.changes,
          })),
        },
        license: {
          spdx: "MIT",
          scope: component.files.map((file) => file.upstreamPath).join(", "),
          copyright: ["Copyright (c) 2025 junwen-k"],
          evidence: {
            upstreamPath: "LICENSE.md",
            permalink: permalink("LICENSE.md"),
            sha256: licenseHash,
            localPath: "registry/sources/ui-x/LICENSE",
          },
          notices: [],
        },
        assets: [],
        modifications: resolved.filter((file) => file.changes.length > 0).map((file) => ({
          shippedPath: file.path,
          change: file.changes.join(" "),
          reason: "Keep the copied component source-local and safe in forms while preserving upstream behavior.",
        })),
        dedupe: {
          family: component.family,
          sourceHash: aggregateHash(resolved.map((file) => file.upstreamHash)),
          contentHash: aggregateHash(resolved.map((file) => sha256(file.content))),
          structureHash: structureHash(resolved.map((file) => ({
            path: path.relative(tasteRoot, path.join(sourceRoot, ...file.path.split("/"))),
            content: file.content,
          }))),
        },
        verification: { reviewedBy: null, reviewedAt: null },
      },
    },
  }
}

async function buildManifest() {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "ui-x-drafts",
    homepage: "https://ui-x.junwen-k.dev",
    items: await Promise.all(components.map(createItem)),
  }
}

function gitBlob(upstreamRoot, upstreamPath) {
  return execFileSync("git", ["-C", upstreamRoot, "show", `${revision}:${upstreamPath}`])
}

async function verifyUpstream(upstreamRoot) {
  assert.equal(execFileSync("git", ["-C", upstreamRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), revision)
  assert.equal(sha256(gitBlob(upstreamRoot, "LICENSE.md")), licenseHash)
  for (const file of Object.values(files)) {
    assert.equal(sha256(gitBlob(upstreamRoot, file.upstreamPath)), file.upstreamHash, `${file.upstreamPath} upstream hash changed`)
  }
}

async function verifySource() {
  const sourceFiles = [...new Set(Object.values(files).map((file) => file.path))]
  for (const file of sourceFiles) {
    const text = await readFile(path.join(sourceRoot, ...file.split("/")), "utf8")
    assert.doesNotMatch(text, /@\/registry\/new-york/)
    assert.doesNotMatch(text, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/)
    assert.doesNotMatch(text, /\b(?:src|poster)\s*=\s*["']https?:\/\//i)
    assert.doesNotMatch(text, /from ["']next(?:\/|["'])/)
  }
  assert.match(await readFile(path.join(sourceRoot, componentRoot, "dropzone-primitive.tsx"), "utf8"), /type: "button"/)
}

const args = process.argv.slice(2)
const write = args.includes("--write")
const upstreamIndex = args.indexOf("--upstream-root")
const upstreamRoot = upstreamIndex >= 0 ? path.resolve(args[upstreamIndex + 1]) : null

assert.equal(sha256(await readFile(path.join(sourceRoot, "LICENSE"))), licenseHash)
await verifySource()
if (upstreamRoot) await verifyUpstream(upstreamRoot)

const manifest = await buildManifest()
const serialized = `${JSON.stringify(manifest, null, 2)}\n`
const manifestPath = path.join(sourceRoot, "drafts.json")
if (write) await writeFile(manifestPath, serialized)
else assert.equal(await readFile(manifestPath, "utf8"), serialized, "drafts.json is stale")

console.log(`Verified ${manifest.items.length} UI-X component drafts at ${revision}.`)
