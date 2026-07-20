import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { checkDrafts } from "./check-drafts.mjs";
import { aggregateHash, sha256, structureHash } from "./policy-utils.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "taste-blocks-drafts-"));
const execFile = promisify(execFileCallback);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const checker = path.join(scriptDirectory, "check-drafts.mjs");
const sourceDirectory = path.join(root, "registry", "sources", "example");
const manifestPath = path.join(sourceDirectory, "drafts.json");
const revision = "a".repeat(40);
const repository = "https://github.com/example/components";
const license = "MIT test fixture\n";
const supportPath = "lib/utils.ts";
const support = "export const cn = (...values: string[]) => values.filter(Boolean).join(' ');\n";
const supportHash = sha256(support);

function componentItem({ name, title, label }) {
  const componentPath = `components/${name}/${name}.tsx`;
  const component = `import { cn } from "../../lib/utils";\nexport function ${title.replaceAll(" ", "")}() { return <button className={cn("ring")}>${label}</button>; }\n`;
  const upstream = component.replace('"../../lib/utils"', '"@/lib/utils"');
  const contentHash = sha256(component);
  const upstreamHash = sha256(upstream);
  const sourceFiles = [
    {
      shippedPath: componentPath,
      upstreamPath: `src/${name}.tsx`,
      permalink: `${repository}/blob/${revision}/src/${name}.tsx`,
      upstreamSha256: upstreamHash,
      contentSha256: contentHash,
      changes: ["Changed the utility import to the bundled relative path."],
    },
    {
      shippedPath: supportPath,
      upstreamPath: supportPath,
      permalink: `${repository}/blob/${revision}/${supportPath}`,
      upstreamSha256: supportHash,
      contentSha256: supportHash,
      changes: [],
    },
  ];

  return {
    component,
    componentPath,
    item: {
      name,
      type: "registry:component",
      title,
      description: `Shows the ${label.toLowerCase()} interaction.`,
      author: "Example",
      dependencies: [],
      registryDependencies: [],
      files: [
        { path: componentPath, type: "registry:component", target: `@components/taste-blocks/${name}.tsx` },
        { path: supportPath, type: "registry:lib", target: "@lib/utils.ts" },
      ],
      categories: ["buttons-actions"],
      meta: {
        tasteblocks: {
          status: "draft",
          category: "buttons-actions",
          tags: ["focus", "button"],
          renderer: "dom",
          preview: `previews/drafts/example/${name}.tsx`,
          source: {
            project: "Example",
            repository,
            revision,
            retrievedAt: "2026-07-20",
            files: sourceFiles,
          },
          license: {
            spdx: "MIT",
            scope: `src/${name}.tsx and ${supportPath}`,
            copyright: ["Copyright Example"],
            evidence: {
              upstreamPath: "LICENSE",
              permalink: `${repository}/blob/${revision}/LICENSE`,
              sha256: sha256(license),
              localPath: "registry/sources/example/LICENSE",
            },
            notices: [],
          },
          assets: [],
          modifications: [
            {
              shippedPath: componentPath,
              change: "Changed the utility import to ../../lib/utils.",
              reason: "Resolve the bundled support file without a consumer alias.",
            },
          ],
          dedupe: {
            family: name,
            sourceHash: aggregateHash([upstreamHash, supportHash]),
            contentHash: aggregateHash([contentHash, supportHash]),
            structureHash: structureHash([
              { path: `registry/sources/example/${componentPath}`, content: component },
              { path: `registry/sources/example/${supportPath}`, content: support },
            ]),
          },
          verification: { reviewedBy: null, reviewedAt: null },
        },
      },
    },
    preview: `import { ${title.replaceAll(" ", "")} } from "../../../registry/sources/example/${componentPath.replace(/\.tsx$/, "")}";\nexport default ${title.replaceAll(" ", "")};\n`,
  };
}

const fixtures = [
  componentItem({ name: "focus-ring", title: "Focus Ring", label: "Focus" }),
  componentItem({ name: "press-ring", title: "Press Ring", label: "Press" }),
];
const baseline = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "draft-policy-test",
  homepage: "https://example.com",
  items: fixtures.map(({ item }) => item),
};

async function writeManifest(value) {
  await writeFile(manifestPath, `${JSON.stringify(value, null, 2)}\n`);
}

async function snapshot(directory, files = new Map()) {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await snapshot(entryPath, files);
    else files.set(path.relative(root, entryPath).replaceAll("\\", "/"), sha256(await readFile(entryPath)));
  }
  return [...files];
}

async function rejectsWithoutWrites(pattern) {
  const before = await snapshot(root);
  await assert.rejects(checkDrafts(root), pattern);
  assert.deepEqual(await snapshot(root), before);
}

try {
  await mkdir(path.join(sourceDirectory, "lib"), { recursive: true });
  await mkdir(path.join(root, "previews", "drafts", "example"), { recursive: true });
  await writeFile(path.join(sourceDirectory, "LICENSE"), license);
  await writeFile(path.join(sourceDirectory, supportPath), support);
  for (const fixture of fixtures) {
    await mkdir(path.dirname(path.join(sourceDirectory, fixture.componentPath)), { recursive: true });
    await writeFile(path.join(sourceDirectory, fixture.componentPath), fixture.component);
    await writeFile(path.join(root, "previews", "drafts", "example", `${fixture.item.name}.tsx`), fixture.preview);
  }
  await writeManifest(baseline);

  const validSnapshot = await snapshot(root);
  assert.deepEqual(await checkDrafts(root, "example"), {
    sources: [{ count: 2, source: "example" }],
    total: 2,
  });
  const { stdout } = await execFile(process.execPath, [checker, "--source", "example"], { cwd: root });
  assert.match(stdout, /^example: 2 drafts\r?\nTotal: 2 drafts\.\r?\n$/);
  assert.deepEqual(await snapshot(root), validSnapshot);

  const componentTypedSupport = structuredClone(baseline);
  for (const item of componentTypedSupport.items) item.files[1].type = "registry:component";
  await writeManifest(componentTypedSupport);
  assert.equal((await checkDrafts(root, "example")).total, baseline.items.length);

  const duplicateHeadline = structuredClone(baseline);
  const firstHeadline = duplicateHeadline.items[0].meta.tasteblocks.source.files[0];
  Object.assign(duplicateHeadline.items[1].meta.tasteblocks.source.files[0], {
    upstreamPath: firstHeadline.upstreamPath,
    permalink: firstHeadline.permalink,
  });
  await writeManifest(duplicateHeadline);
  await rejectsWithoutWrites(/duplicates headline source locator/);

  const divergentSupport = structuredClone(baseline);
  for (const item of divergentSupport.items) item.files[1].type = "registry:component";
  divergentSupport.items[1].meta.tasteblocks.source.files[1].upstreamSha256 = sha256("different support");
  await writeManifest(divergentSupport);
  await rejectsWithoutWrites(/reuses support source locator .* with different hashes/);

  const invalidSchema = structuredClone(baseline);
  invalidSchema.items[0].files[0].type = "invalid:file";
  await writeManifest(invalidSchema);
  await rejectsWithoutWrites(/fails the official shadcn registry schema/);

  await writeManifest(baseline);
  await writeFile(path.join(sourceDirectory, fixtures[0].componentPath), `${fixtures[0].component}// tampered\n`);
  await rejectsWithoutWrites(/contentSha256 does not match/);
  await writeFile(path.join(sourceDirectory, fixtures[0].componentPath), fixtures[0].component);

  const nullStructure = structuredClone(baseline);
  nullStructure.items[0].meta.tasteblocks.dedupe.structureHash = null;
  await writeManifest(nullStructure);
  await rejectsWithoutWrites(/structureHash must not be null/);

  const wrongStructure = structuredClone(baseline);
  wrongStructure.items[0].meta.tasteblocks.dedupe.structureHash = sha256("wrong structure");
  await writeManifest(wrongStructure);
  await rejectsWithoutWrites(/structureHash does not recompute \(expected .* received/);

  const stringModification = structuredClone(baseline);
  stringModification.items[0].meta.tasteblocks.modifications = ["changed import"];
  await writeManifest(stringModification);
  await rejectsWithoutWrites(/modifications\[0\] must be an object/);

  console.log("Draft policy self-test passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
