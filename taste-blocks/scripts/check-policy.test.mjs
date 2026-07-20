import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { loadPublicRegistry } from "./check-policy.mjs";
import { aggregateHash, sha256, structureHash } from "./policy-utils.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "taste-blocks-policy-"));
const execFile = promisify(execFileCallback);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.join(root, "registry", "sources", "example");
const revision = "a".repeat(40);
const repository = "https://github.com/example/components";
const license = "MIT test fixture\n";
const supportPath = "lib/utils.ts";
const support = "export const cn = (...values: string[]) => values.filter(Boolean).join(' ');\n";
const supportHash = sha256(support);

function componentItem({ name, title, label, category = "buttons-actions", renderer = "dom" }) {
  const componentPath = `components/${name}/${name}.tsx`;
  const element =
    renderer === "svg"
      ? `<svg aria-label="${label}" className={cn("icon")} role="img"><path d="M1 1h10v10H1z" /></svg>`
      : `<button className={cn("ring")}>${label}</button>`;
  const component = `import { cn } from "../../lib/utils";\nexport function ${title.replaceAll(" ", "")}() { return ${element}; }\n`;
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
      changes: ["Changed the source-local utility import to the bundled relative path."],
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
      categories: [category],
      meta: {
        tasteblocks: {
          status: "verified",
          category,
          tags: ["focus", "button"],
          renderer,
          preview: `previews/${name}.tsx`,
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
          verification: { reviewedBy: "policy-test", reviewedAt: "2026-07-20" },
        },
      },
    },
    preview: `import { ${title.replaceAll(" ", "")} } from "../registry/sources/example/${componentPath.replace(/\.tsx$/, "")}";\nexport default ${title.replaceAll(" ", "")};\n`,
  };
}

const fixtures = [
  componentItem({ name: "focus-ring", title: "Focus Ring", label: "Focus" }),
  componentItem({ name: "press-ring", title: "Press Ring", label: "Press" }),
  componentItem({
    name: "lucide-layout-dashboard-icon",
    title: "Layout Dashboard Icon",
    label: "Dashboard",
    category: "icons-microinteractions",
    renderer: "svg",
  }),
];
const manifestPath = path.join(sourceDirectory, "registry.json");
const baselineItems = fixtures.map(({ item }) => item);

async function writeManifest(items) {
  await writeFile(manifestPath, JSON.stringify({ items }));
}

try {
  await mkdir(sourceDirectory, { recursive: true });
  await mkdir(path.join(root, "previews"), { recursive: true });
  await mkdir(path.join(sourceDirectory, "lib"), { recursive: true });
  await writeFile(
    path.join(root, "registry.json"),
    JSON.stringify({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "policy-test",
      homepage: "https://example.com",
      include: ["./registry/sources/example/registry.json"],
      items: [],
    }),
  );
  await writeFile(path.join(sourceDirectory, "drafts.json"), "{ ignored invalid draft");
  await writeFile(path.join(sourceDirectory, "LICENSE"), license);
  await writeFile(path.join(sourceDirectory, supportPath), support);
  for (const fixture of fixtures) {
    await mkdir(path.dirname(path.join(sourceDirectory, fixture.componentPath)), { recursive: true });
    await writeFile(path.join(sourceDirectory, fixture.componentPath), fixture.component);
    await writeFile(path.join(root, "previews", `${fixture.item.name}.tsx`), fixture.preview);
  }
  await writeManifest(baselineItems);

  const registry = await loadPublicRegistry(root);
  assert.deepEqual(registry.items.map(({ name }) => name), ["focus-ring", "press-ring", "lucide-layout-dashboard-icon"]);
  await execFile(process.execPath, [path.join(scriptDirectory, "build-catalog.mjs")], { cwd: root });
  const catalog = JSON.parse(await readFile(path.join(root, "generated", "catalog.json"), "utf8"));
  assert.equal(catalog.length, 3);
  assert.equal(catalog[0].modifications[0].shippedPath, "components/focus-ring/focus-ring.tsx");
  assert.equal(catalog[0].status, "verified");
  assert.equal(catalog[0].preview, "/preview/focus-ring");
  assert.equal(/localPath|shippedPath":"lib|reviewedBy/.test(JSON.stringify(catalog)), false);

  const componentTypedSupport = structuredClone(baselineItems);
  for (const item of componentTypedSupport) item.files[1].type = "registry:component";
  await writeManifest(componentTypedSupport);
  assert.equal((await loadPublicRegistry(root)).items.length, baselineItems.length);

  const badModification = structuredClone(baselineItems);
  badModification[0].meta.tasteblocks.modifications[0].shippedPath = "components/missing.tsx";
  await writeManifest(badModification);
  await assert.rejects(loadPublicRegistry(root), /must match one declared source file/);

  const duplicateModification = structuredClone(baselineItems);
  duplicateModification[0].meta.tasteblocks.modifications.push(
    structuredClone(duplicateModification[0].meta.tasteblocks.modifications[0]),
  );
  await writeManifest(duplicateModification);
  await assert.rejects(loadPublicRegistry(root), /duplicate modification records/);

  const duplicateHeadline = structuredClone(baselineItems);
  const firstHeadline = duplicateHeadline[0].meta.tasteblocks.source.files[0];
  Object.assign(duplicateHeadline[1].meta.tasteblocks.source.files[0], {
    upstreamPath: firstHeadline.upstreamPath,
    permalink: firstHeadline.permalink,
  });
  await writeManifest(duplicateHeadline);
  await assert.rejects(loadPublicRegistry(root), /duplicates headline source locator/);

  const conflictingSupport = structuredClone(baselineItems);
  for (const item of conflictingSupport) item.files[1].type = "registry:component";
  const conflictingFile = conflictingSupport[1].meta.tasteblocks.source.files[1];
  conflictingFile.upstreamSha256 = sha256("different upstream support");
  conflictingFile.changes = ["Adapted a different upstream support file."];
  conflictingSupport[1].meta.tasteblocks.modifications.push({
    shippedPath: supportPath,
    change: "Adapted the support file.",
    reason: "Exercise inconsistent shared support provenance.",
  });
  await writeManifest(conflictingSupport);
  await assert.rejects(loadPublicRegistry(root), /reuses support source locator.*different hashes/);

  const iconNearMisses = [
    (item) => {
      item.categories = ["buttons-actions"];
      item.meta.tasteblocks.category = "buttons-actions";
    },
    (item) => {
      item.meta.tasteblocks.renderer = "dom";
    },
    (item) => {
      item.name = "lucide-layout-dashboard-glyph";
    },
    (item) => {
      item.title = "Layout Dashboard Glyph";
    },
  ];
  for (const mutate of iconNearMisses) {
    const nearMiss = structuredClone(baselineItems);
    mutate(nearMiss[2]);
    await writeManifest(nearMiss);
    await assert.rejects(loadPublicRegistry(root), /uses excluded (?:layout|dashboard) terminology/);
  }

  const forbiddenItem = structuredClone(baselineItems);
  forbiddenItem[0].name = "landing-hero";
  await writeManifest(forbiddenItem);
  await assert.rejects(loadPublicRegistry(root), /excluded hero terminology/);
  console.log("Policy self-test passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
