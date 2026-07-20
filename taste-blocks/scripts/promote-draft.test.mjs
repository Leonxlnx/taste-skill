import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseArgs, promoteDrafts } from "./promote-draft.mjs";

const source = "example";
const review = { reviewedby: "Promotion test", reviewedat: "2026-07-20" };

function item(name, status = "draft") {
  const preview = status === "draft" ? `previews/drafts/${source}/${name}.tsx` : `previews/${name}.tsx`;
  return {
    name,
    type: "registry:component",
    title: name,
    description: `${name} test component.`,
    author: "Test",
    dependencies: [],
    registryDependencies: [],
    files: [{ path: `components/${name}.tsx`, type: "registry:component", target: `@components/taste-blocks/${name}.tsx` }],
    categories: ["buttons-actions"],
    meta: { tasteblocks: { status, preview } },
  };
}

function registry(name, items) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name,
    homepage: "https://example.com",
    items,
  };
}

async function present(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function fixture(t, { drafts = [item("beta"), item("alpha")], publicItems = [], previews = {} } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "taste-blocks-promote-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceDirectory = path.join(root, "registry", "sources", source);
  const componentDirectory = path.join(sourceDirectory, "components");
  const draftPreviewDirectory = path.join(root, "previews", "drafts", source);
  await Promise.all([
    mkdir(componentDirectory, { recursive: true }),
    mkdir(draftPreviewDirectory, { recursive: true }),
    mkdir(path.join(root, "previews"), { recursive: true }),
  ]);

  for (const draft of drafts) {
    await writeFile(path.join(componentDirectory, `${draft.name}.tsx`), `export function ${draft.name.replaceAll("-", "_")}() {}\n`);
    if (previews[draft.name] !== null) {
      await writeFile(
        path.join(draftPreviewDirectory, `${draft.name}.tsx`),
        previews[draft.name] ?? `export default function ${draft.name.replaceAll("-", "_")}Preview() { return null; }\n`,
      );
    }
  }

  const sourceManifestPath = path.join(sourceDirectory, "drafts.json");
  const publicRegistryPath = path.join(root, "registry.json");
  await Promise.all([
    writeFile(sourceManifestPath, `${JSON.stringify(registry("example-drafts", drafts), null, 2)}\n`),
    writeFile(publicRegistryPath, `${JSON.stringify(registry("taste-blocks", publicItems), null, 2)}\n`),
  ]);
  return { root, sourceDirectory, componentDirectory, draftPreviewDirectory, sourceManifestPath, publicRegistryPath };
}

function options(overrides = {}) {
  return { source, all: true, write: false, ...review, ...overrides };
}

test("argument parsing preserves single-item CLI and makes --all exclusive", () => {
  const single = parseArgs([
    "--source",
    source,
    "--name",
    "alpha",
    "--reviewed-by",
    review.reviewedby,
    "--reviewed-at",
    review.reviewedat,
  ]);
  assert.deepEqual(single, { source, name: "alpha", reviewedby: review.reviewedby, reviewedat: review.reviewedat, write: false, all: false });

  const batch = parseArgs([
    "--source",
    source,
    "--all",
    "--reviewed-by",
    review.reviewedby,
    "--reviewed-at",
    review.reviewedat,
  ]);
  assert.equal(batch.all, true);
  assert.equal(batch.write, false);
  assert.throws(
    () => parseArgs(["--source", source, "--all", "--name", "alpha", "--reviewed-by", "Test", "--reviewed-at", "2026-07-20"]),
    /Exactly one of --name or --all is required/,
  );
});

test("batch dry-run validates once and leaves every file unchanged", async (t) => {
  const files = await fixture(t);
  const beforeSource = await readFile(files.sourceManifestPath, "utf8");
  const beforePublic = await readFile(files.publicRegistryPath, "utf8");
  const beforeComponent = await readFile(path.join(files.componentDirectory, "alpha.tsx"), "utf8");
  let validations = 0;

  const result = await promoteDrafts(options(), {
    root: files.root,
    validatePublic: async (next, root) => {
      validations += 1;
      assert.equal(root, files.root);
      assert.deepEqual(next.items.map(({ name }) => name), ["alpha", "beta"]);
      assert.equal(await present(path.join(root, "previews", "alpha.tsx")), true);
      assert.equal(await present(path.join(root, "previews", "beta.tsx")), true);
    },
  });

  assert.deepEqual(result.names, ["alpha", "beta"]);
  assert.equal(validations, 1);
  assert.equal(await readFile(files.sourceManifestPath, "utf8"), beforeSource);
  assert.equal(await readFile(files.publicRegistryPath, "utf8"), beforePublic);
  assert.equal(await readFile(path.join(files.componentDirectory, "alpha.tsx"), "utf8"), beforeComponent);
  assert.equal(await present(path.join(files.root, "previews", "alpha.tsx")), false);
  assert.equal(await present(path.join(files.root, "previews", "beta.tsx")), false);
  assert.equal(await present(path.join(files.draftPreviewDirectory, "alpha.tsx")), true);
  assert.equal(await present(path.join(files.draftPreviewDirectory, "beta.tsx")), true);
});

test("batch write promotes all drafts in deterministic order without touching source", async (t) => {
  const files = await fixture(t, { publicItems: [item("zulu", "verified")] });
  const beforeComponents = await Promise.all(
    ["alpha", "beta"].map((name) => readFile(path.join(files.componentDirectory, `${name}.tsx`), "utf8")),
  );
  let validations = 0;

  const result = await promoteDrafts(options({ write: true }), {
    root: files.root,
    validatePublic: async () => {
      validations += 1;
    },
  });

  const sourceManifest = JSON.parse(await readFile(files.sourceManifestPath, "utf8"));
  const publicRegistry = JSON.parse(await readFile(files.publicRegistryPath, "utf8"));
  assert.equal(validations, 1);
  assert.equal(result.write, true);
  assert.deepEqual(sourceManifest.items, []);
  assert.deepEqual(publicRegistry.items.map(({ name }) => name), ["alpha", "beta", "zulu"]);
  for (const promoted of publicRegistry.items.slice(0, 2)) {
    assert.equal(promoted.meta.tasteblocks.status, "verified");
    assert.deepEqual(promoted.meta.tasteblocks.verification, { reviewedBy: review.reviewedby, reviewedAt: review.reviewedat });
    assert.equal(promoted.files[0].path, `registry/sources/${source}/components/${promoted.name}.tsx`);
    assert.equal(await present(path.join(files.root, "previews", `${promoted.name}.tsx`)), true);
    assert.equal(await present(path.join(files.draftPreviewDirectory, `${promoted.name}.tsx`)), false);
  }
  assert.deepEqual(
    await Promise.all(["alpha", "beta"].map((name) => readFile(path.join(files.componentDirectory, `${name}.tsx`), "utf8"))),
    beforeComponents,
  );
});

test("mid-write failure rolls the whole batch back", async (t) => {
  const files = await fixture(t);
  const beforeSource = await readFile(files.sourceManifestPath, "utf8");
  const beforePublic = await readFile(files.publicRegistryPath, "utf8");
  let injected = false;

  await assert.rejects(
    promoteDrafts(options({ write: true }), {
      root: files.root,
      validatePublic: async () => {},
      fileSystem: {
        async unlink(file) {
          if (!injected && file === path.join(files.draftPreviewDirectory, "beta.tsx")) {
            injected = true;
            throw new Error("injected unlink failure");
          }
          return unlink(file);
        },
      },
    }),
    /injected unlink failure/,
  );

  assert.equal(await readFile(files.sourceManifestPath, "utf8"), beforeSource);
  assert.equal(await readFile(files.publicRegistryPath, "utf8"), beforePublic);
  for (const name of ["alpha", "beta"]) {
    assert.equal(await present(path.join(files.draftPreviewDirectory, `${name}.tsx`)), true);
    assert.equal(await present(path.join(files.root, "previews", `${name}.tsx`)), false);
  }
  assert.equal((await readdir(files.sourceDirectory)).some((name) => name.endsWith(".tmp")), false);
  assert.equal((await readdir(files.root)).some((name) => name.endsWith(".tmp")), false);
});

test("batch preflight rejects public item and preview collisions without partial output", async (t) => {
  await t.test("registry item collision", async (t) => {
    const files = await fixture(t, { publicItems: [item("alpha", "verified")] });
    let validations = 0;
    await assert.rejects(
      promoteDrafts(options(), { root: files.root, validatePublic: async () => (validations += 1) }),
      /alpha is already public/,
    );
    assert.equal(validations, 0);
    assert.equal(await present(path.join(files.root, "previews", "alpha.tsx")), false);
    assert.equal(await present(path.join(files.root, "previews", "beta.tsx")), false);
  });

  await t.test("public preview collision", async (t) => {
    const files = await fixture(t);
    const existing = "existing preview\n";
    await writeFile(path.join(files.root, "previews", "beta.tsx"), existing);
    let validations = 0;
    await assert.rejects(
      promoteDrafts(options(), { root: files.root, validatePublic: async () => (validations += 1) }),
      /Public preview already exists: previews\/beta\.tsx/,
    );
    assert.equal(validations, 0);
    assert.equal(await readFile(path.join(files.root, "previews", "beta.tsx"), "utf8"), existing);
    assert.equal(await present(path.join(files.root, "previews", "alpha.tsx")), false);
  });
});

test("batch rejects relative imports before creating any public preview", async (t) => {
  const files = await fixture(t, { previews: { alpha: 'import Demo from "./demo";\nexport default Demo;\n' } });
  let validations = 0;
  await assert.rejects(
    promoteDrafts(options(), { root: files.root, validatePublic: async () => (validations += 1) }),
    /alpha preview must use project aliases or package imports/,
  );
  assert.equal(validations, 0);
  assert.equal(await present(path.join(files.root, "previews", "alpha.tsx")), false);
  assert.equal(await present(path.join(files.root, "previews", "beta.tsx")), false);
});

test("public policy rejection removes every staged preview", async (t) => {
  const files = await fixture(t);
  let validations = 0;
  await assert.rejects(
    promoteDrafts(options({ write: true }), {
      root: files.root,
      validatePublic: async () => {
        validations += 1;
        throw new Error("injected policy rejection");
      },
    }),
    /injected policy rejection/,
  );
  assert.equal(validations, 1);
  for (const name of ["alpha", "beta"]) {
    assert.equal(await present(path.join(files.root, "previews", `${name}.tsx`)), false);
    assert.equal(await present(path.join(files.draftPreviewDirectory, `${name}.tsx`)), true);
  }
});

test("batch requires every item to remain a draft with an existing preview", async (t) => {
  await t.test("non-draft item", async (t) => {
    const stale = item("alpha");
    stale.meta.tasteblocks.status = "verified";
    const files = await fixture(t, { drafts: [stale, item("beta")] });
    await assert.rejects(promoteDrafts(options(), { root: files.root, validatePublic: async () => {} }), /alpha is not a draft/);
  });

  await t.test("missing preview", async (t) => {
    const files = await fixture(t, { previews: { alpha: null } });
    await assert.rejects(
      promoteDrafts(options(), { root: files.root, validatePublic: async () => {} }),
      /Draft preview does not exist: previews\/drafts\/example\/alpha\.tsx/,
    );
    assert.equal(await present(path.join(files.root, "previews", "beta.tsx")), false);
  });
});

test("single-item write keeps unselected drafts untouched", async (t) => {
  const files = await fixture(t);
  let validations = 0;
  const result = await promoteDrafts(options({ all: false, name: "beta", write: true }), {
    root: files.root,
    validatePublic: async () => {
      validations += 1;
    },
  });
  const sourceManifest = JSON.parse(await readFile(files.sourceManifestPath, "utf8"));
  const publicRegistry = JSON.parse(await readFile(files.publicRegistryPath, "utf8"));

  assert.deepEqual(result.names, ["beta"]);
  assert.equal(validations, 1);
  assert.deepEqual(sourceManifest.items.map(({ name }) => name), ["alpha"]);
  assert.deepEqual(publicRegistry.items.map(({ name }) => name), ["beta"]);
  assert.equal(await present(path.join(files.draftPreviewDirectory, "alpha.tsx")), true);
  assert.equal(await present(path.join(files.draftPreviewDirectory, "beta.tsx")), false);
  assert.equal(await present(path.join(files.root, "previews", "alpha.tsx")), false);
  assert.equal(await present(path.join(files.root, "previews", "beta.tsx")), true);
});
