import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  aggregateHash,
  sha256,
  structureHash,
} from "../../../scripts/policy-utils.mjs";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const tasteRoot = path.resolve(sourceRoot, "../../..");
const repository = "https://github.com/amarnathdhumal/chamaacui";
const revision = "345d79b1b1d4c89c2394a5c23ac12a9861c383c2";
const retrievedAt = "2026-07-20";
const componentRoot = "components/chamaac-ui";
const utilityPath = `${componentRoot}/lib/utils.ts`;
const utilityUpstreamPath = "lib/utils.ts";
const utilityUpstreamHash =
  "sha256:ede53dcdf44c29c9d6f9583e775c2f2d7b8d5205679a6af38bb0e0475c23296f";
const utilityChanges = [
  "Removed the unrelated Next.js metadata import and constructMetadata helper so the copied cn utility has only its actual component closure.",
];
const licenseHash =
  "sha256:d6ba4df1c07c99e1d38dc59ddb858fcb12cbe79edeef48d249c23a60843f6dc9";
const commonDependencies = [
  "@react-three/fiber@9.4.0",
  "clsx@2.1.1",
  "tailwind-merge@3.4.0",
  "three@0.180.0",
];

const components = [
  {
    slug: "astral-flow",
    title: "Astral Flow",
    description:
      "Renders a layered procedural flow field with three configurable colors and bounded WebGL output.",
    tags: ["shader", "flow-field", "procedural", "webgl"],
    family: "procedural-astral-flow-field",
    upstreamHash:
      "sha256:ceb27618339251753a52f3229355af588fcbde0eb1e1e003f0e10eaae6ae4f96",
    dependencies: commonDependencies,
    extraChanges: [],
  },
  {
    slug: "electric-mist",
    title: "Electric Mist",
    description:
      "Renders a configurable electric mist shader with adjustable detail, distortion, and brightness.",
    tags: ["shader", "mist", "procedural", "webgl"],
    family: "procedural-electric-mist-field",
    upstreamHash:
      "sha256:bd8f8b9dfe01bd1c04da2b3739422529d5e6ff7f72eec275d69510d614ae36b5",
    dependencies: commonDependencies,
    extraChanges: [],
  },
  {
    slug: "grid-bloom",
    title: "Grid Bloom",
    description:
      "Renders a pointer-reactive procedural grid with bloom, flow, distortion, and repulsion controls.",
    tags: ["shader", "grid", "pointer", "webgl"],
    family: "pointer-reactive-grid-bloom",
    upstreamHash:
      "sha256:7d543f648a1160058927759be2e20881df7f90cb9521f74281bc0192c32fc7f8",
    dependencies: commonDependencies,
    extraChanges: [
      "Capped the device-pixel ratio at 1.5 and disabled pointer-driven motion when reduced motion is requested.",
    ],
  },
  {
    slug: "light-speed",
    title: "Light Speed",
    description:
      "Renders an instanced light-streak tunnel with configurable speed, radius, color, and bloom.",
    tags: ["particles", "tunnel", "bloom", "webgl"],
    family: "instanced-light-speed-tunnel",
    upstreamHash:
      "sha256:285c08e3566a9ff5ef50a14fd2eaf292e32a2a95a6b6e1be28640f84218c3010",
    dependencies: [
      "@react-three/fiber@9.4.0",
      "@react-three/postprocessing@3.0.4",
      "clsx@2.1.1",
      "tailwind-merge@3.4.0",
      "three@0.180.0",
    ],
    extraChanges: [
      "Capped the device-pixel ratio at 1.5 and clamped the public particle count to 1-4000.",
    ],
  },
  {
    slug: "synthesis",
    title: "Synthesis",
    description:
      "Renders a configurable three-color procedural field with flow, distortion, glow, and contrast controls.",
    tags: ["shader", "color-field", "procedural", "webgl"],
    family: "procedural-synthesis-flow-field",
    upstreamHash:
      "sha256:0875844f520f805c38ca3b48a97c690d16dc98a910a8ec1ee367de4592831075",
    dependencies: commonDependencies,
    extraChanges: [],
  },
  {
    slug: "waves",
    title: "Waves",
    description:
      "Renders a deforming three-color noise surface with configurable amplitude and directional speed.",
    tags: ["shader", "waves", "surface", "webgl"],
    family: "deformed-noise-wave-surface",
    upstreamHash:
      "sha256:f8bdaad012dcdd12d1ba945ac0518851460d21898dd5b70edfb24af56c17e242",
    dependencies: [
      "@react-three/drei@10.7.6",
      "@react-three/fiber@9.4.0",
      "clsx@2.1.1",
      "tailwind-merge@3.4.0",
      "three@0.180.0",
    ],
    extraChanges: ["Capped the device-pixel ratio at 1.5."],
  },
];

const baseChanges = [
  "Changed the cn import from @/lib/utils to ./lib/utils so the copied closure remains source-local.",
  "Added a native prefers-reduced-motion listener, froze the React Three Fiber frame loop when requested, and marked the decorative output aria-hidden.",
  "Normalized line endings and removed upstream trailing whitespace without changing GLSL or React behavior.",
];

function permalink(upstreamPath) {
  return `${repository}/blob/${revision}/${upstreamPath}`;
}

async function createItem(component) {
  const name = `chamaac-${component.slug}`;
  const componentPath = `${componentRoot}/${component.slug}.tsx`;
  const upstreamPath = `registry/chamaac/${component.slug}/${component.slug}.tsx`;
  const componentFile = path.join(sourceRoot, ...componentPath.split("/"));
  const utilityFile = path.join(sourceRoot, ...utilityPath.split("/"));
  const [componentContent, utilityContent] = await Promise.all([
    readFile(componentFile),
    readFile(utilityFile),
  ]);
  const componentHash = sha256(componentContent);
  const utilityHash = sha256(utilityContent);
  const changes = [...baseChanges, ...component.extraChanges];
  const upstreamHashes = [component.upstreamHash, utilityUpstreamHash];
  const contentHashes = [componentHash, utilityHash];
  const structuralFiles = [
    {
      path: path.relative(tasteRoot, componentFile),
      content: componentContent,
    },
    {
      path: path.relative(tasteRoot, utilityFile),
      content: utilityContent,
    },
  ];

  return {
    name,
    type: "registry:component",
    title: component.title,
    description: component.description,
    author: "Amarnath",
    dependencies: component.dependencies,
    registryDependencies: [],
    files: [
      {
        path: componentPath,
        type: "registry:component",
        target: `@components/taste-blocks/chamaac-ui/${component.slug}.tsx`,
      },
      {
        path: utilityPath,
        type: "registry:lib",
        target: "@components/taste-blocks/chamaac-ui/lib/utils.ts",
      },
    ],
    categories: ["visual-effects"],
    meta: {
      tasteblocks: {
        status: "draft",
        category: "visual-effects",
        tags: component.tags,
        renderer: "webgl",
        preview: `previews/drafts/chamaac-ui/${name}.tsx`,
        source: {
          project: "Chamaac UI",
          repository,
          revision,
          retrievedAt,
          files: [
            {
              shippedPath: componentPath,
              upstreamPath,
              permalink: permalink(upstreamPath),
              upstreamSha256: component.upstreamHash,
              contentSha256: componentHash,
              changes,
            },
            {
              shippedPath: utilityPath,
              upstreamPath: utilityUpstreamPath,
              permalink: permalink(utilityUpstreamPath),
              upstreamSha256: utilityUpstreamHash,
              contentSha256: utilityHash,
              changes: utilityChanges,
            },
          ],
        },
        license: {
          spdx: "MIT",
          scope: `${upstreamPath} and ${utilityUpstreamPath}`,
          copyright: ["Copyright (c) 2026 Amarnath"],
          evidence: {
            upstreamPath: "LICENSE",
            permalink: permalink("LICENSE"),
            sha256: licenseHash,
            localPath: "registry/sources/chamaac-ui/LICENSE",
          },
          notices: [],
        },
        assets: [],
        modifications: [
          {
            shippedPath: componentPath,
            change: changes.join(" "),
            reason:
              "Keep the copied component installable as a closed source-local registry item while bounding GPU work and respecting reduced-motion preferences.",
          },
          {
            shippedPath: utilityPath,
            change: utilityChanges.join(" "),
            reason:
              "Avoid pulling site-only Next.js metadata and an unrelated SEO helper into standalone shader components.",
          },
        ],
        dedupe: {
          family: component.family,
          sourceHash: aggregateHash(upstreamHashes),
          contentHash: aggregateHash(contentHashes),
          structureHash: structureHash(structuralFiles),
        },
        verification: {
          reviewedBy: null,
          reviewedAt: null,
        },
      },
    },
  };
}

async function buildManifest() {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "chamaac-ui-drafts",
    homepage: "https://www.chamaac.com",
    items: await Promise.all(components.map(createItem)),
  };
}

async function verifyUpstream(upstreamRoot) {
  const license = await readFile(path.join(upstreamRoot, "LICENSE"));
  assert.equal(sha256(license), licenseHash, "upstream LICENSE hash changed");
  const utility = await readFile(path.join(upstreamRoot, ...utilityUpstreamPath.split("/")));
  assert.equal(sha256(utility), utilityUpstreamHash, "upstream utility hash changed");
  for (const component of components) {
    const upstreamPath = `registry/chamaac/${component.slug}/${component.slug}.tsx`;
    const content = await readFile(path.join(upstreamRoot, ...upstreamPath.split("/")));
    assert.equal(
      sha256(content),
      component.upstreamHash,
      `${component.slug} upstream hash changed`,
    );
  }
}

function verifySourceInvariants(manifest) {
  assert.equal(manifest.items.length, 6, "expected six retained components");
  for (const item of manifest.items) {
    const source = item.meta.tasteblocks.source.files[0];
    const componentFile = path.join(sourceRoot, ...source.shippedPath.split("/"));
    const text = item.__sourceText;
    assert.equal(text, undefined);
    assert(componentFile.startsWith(sourceRoot));
  }
}

async function verifyComponentText() {
  for (const component of components) {
    const file = path.join(sourceRoot, componentRoot, `${component.slug}.tsx`);
    const text = await readFile(file, "utf8");
    assert.match(text, /prefers-reduced-motion: reduce/);
    assert.match(text, /frameloop=\{reduceMotion \? "demand" : "always"\}/);
    assert.match(text, /aria-hidden="true"/);
    assert.doesNotMatch(text, /from "@\/lib\/utils"/);
    assert.doesNotMatch(text, /\b(?:fetch|XMLHttpRequest)\s*\(/);
    assert.doesNotMatch(text, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
  }
  const utility = await readFile(path.join(sourceRoot, utilityPath), "utf8");
  assert.doesNotMatch(utility, /(?:next|constructMetadata|buildPageMetadata)/);
}

const args = process.argv.slice(2);
const write = args.includes("--write");
const upstreamIndex = args.indexOf("--upstream-root");
const upstreamRoot = upstreamIndex >= 0 ? path.resolve(args[upstreamIndex + 1]) : null;
const manifest = await buildManifest();
verifySourceInvariants(manifest);
await verifyComponentText();
assert.equal(sha256(await readFile(path.join(sourceRoot, "LICENSE"))), licenseHash);
if (upstreamRoot) await verifyUpstream(upstreamRoot);

const manifestPath = path.join(sourceRoot, "drafts.json");
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (write) {
  await writeFile(manifestPath, serialized);
} else {
  assert.equal(await readFile(manifestPath, "utf8"), serialized, "drafts.json is stale");
}

console.log(`Verified ${manifest.items.length} Chamaac UI component drafts at ${revision}.`);
