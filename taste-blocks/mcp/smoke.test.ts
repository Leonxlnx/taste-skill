import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { getDefaultEnvironment, StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { parseCatalog } from "./server";

const sha256 = (character: string) => `sha256:${character.repeat(64)}`;

function fixtureComponent(name: string, overrides: Record<string, unknown> = {}) {
  return {
    name,
    title: name === "line-shadow-text" ? "Line Shadow Text" : "Orbiting Icons",
    description: `Verified ${name} component.`,
    author: name === "line-shadow-text" ? "Magic UI" : "Example UI",
    type: "registry:component",
    status: "verified",
    category: name === "line-shadow-text" ? "text-motion" : "visual-effects",
    tags: name === "line-shadow-text" ? ["text", "shadow"] : ["icons", "orbit"],
    renderer: name === "line-shadow-text" ? "dom" : "svg",
    dependencies: ["motion@12.23.24"],
    registryDependencies: [],
    source: {
      project: name === "line-shadow-text" ? "Magic UI" : "Example UI",
      repository: "https://github.com/example/components",
      revision: "a".repeat(40),
      retrievedAt: "2026-07-20",
      files: [
        {
          upstreamPath: `components/${name}.tsx`,
          permalink: `https://github.com/example/components/blob/${"a".repeat(40)}/components/${name}.tsx`,
          upstreamSha256: sha256("a"),
          contentSha256: sha256("b"),
          changes: ["Adjusted the export for registry compatibility."],
        },
      ],
    },
    license: {
      spdx: "MIT",
      scope: `components/${name}.tsx`,
      copyright: ["Copyright (c) Example"],
      evidence: {
        upstreamPath: "LICENSE",
        permalink: `https://github.com/example/components/blob/${"a".repeat(40)}/LICENSE`,
        sha256: sha256("c"),
      },
      notices: [],
    },
    modifications: [
      {
        shippedPath: `components/${name}.tsx`,
        change: "Adjusted the export for registry compatibility.",
        reason: "Keep the installed component framework-neutral.",
      },
    ],
    assets: [
      {
        name: `${name}.svg`,
        sha256: sha256("1"),
        source: {
          project: "Example Assets",
          repository: "https://github.com/example/assets",
          revision: "b".repeat(40),
          upstreamPath: `icons/${name}.svg`,
          permalink: `https://github.com/example/assets/blob/${"b".repeat(40)}/icons/${name}.svg`,
          sha256: sha256("1"),
          changes: [],
        },
        license: {
          spdx: "MIT",
          scope: `icons/${name}.svg`,
          copyright: ["Copyright (c) Example Assets"],
          evidence: {
            upstreamPath: "LICENSE",
            permalink: `https://github.com/example/assets/blob/${"b".repeat(40)}/LICENSE`,
            sha256: sha256("2"),
          },
          notices: [],
        },
      },
    ],
    hashes: { source: sha256("d"), content: sha256("e"), structure: sha256("f") },
    preview: `/preview/${name}`,
    registryAddress: `@taste/${name}`,
    installCommand: `npx shadcn@latest add @taste/${name}`,
    ...overrides,
  };
}

function jsonText(result: { content: Array<{ type: string; text?: string }> }) {
  const content = result.content.find((item) => item.type === "text");
  assert.ok(content?.text);
  return JSON.parse(content.text) as Record<string, unknown>;
}

test("Taste Blocks stdio MCP exposes only the read-only component contract", { timeout: 20_000 }, async () => {
  const fixture = [fixtureComponent("orbiting-icons"), fixtureComponent("line-shadow-text")];
  assert.throws(() => parseCatalog([fixtureComponent("draft-item", { status: "draft" })]), /Invalid generated\/catalog\.json/);
  for (const title of [
    "Hero Card",
    "Heroes Carousel",
    "Site Footer",
    "Site Footers",
    "Navbar Menu",
    "Navbars Menu",
    "Application Screen",
    "Application Screens",
  ]) {
    assert.throws(
      () => parseCatalog([fixtureComponent("excluded-component", { title })]),
      /Excluded non-component kind/,
    );
  }
  const iconException = {
    title: "Layout Dashboard Icon",
    category: "icons-microinteractions",
    renderer: "svg",
  };
  assert.equal(parseCatalog([fixtureComponent("layout-dashboard-icon", iconException)])[0].name, "layout-dashboard-icon");
  for (const nearMiss of [
    fixtureComponent("layout-dashboard-icon", { ...iconException, category: "visual-effects" }),
    fixtureComponent("layout-dashboard-icon", { ...iconException, renderer: "dom" }),
    fixtureComponent("layout-dashboard-symbol", iconException),
    fixtureComponent("layout-dashboard-icon", { ...iconException, title: "Layout Dashboard Icon Set" }),
  ]) {
    assert.throws(() => parseCatalog([nearMiss]), /Excluded non-component kind/);
  }

  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "taste-blocks-mcp-"));
  const catalogPath = path.join(temporaryDirectory, "catalog.json");
  await writeFile(catalogPath, JSON.stringify(fixture));

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", path.resolve("mcp/stdio.ts")],
    cwd: process.cwd(),
    env: {
      ...getDefaultEnvironment(),
      NODE_ENV: "test",
      TASTE_BLOCKS_TEST_CATALOG: catalogPath,
    },
    stderr: "pipe",
  });
  const client = new Client({ name: "taste-blocks-smoke", version: "0.1.0" }, { capabilities: {} });

  try {
    await client.connect(transport);

    const tools = await client.listTools();
    assert.deepEqual(
      tools.tools.map((tool) => tool.name).sort(),
      ["get_install_command", "search_components"],
    );
    assert.ok(tools.tools.every((tool) => tool.inputSchema && tool.outputSchema));

    const resources = await client.listResources();
    assert.deepEqual(resources.resources.map((resource) => resource.uri), ["tasteblocks://catalog"]);
    const templates = await client.listResourceTemplates();
    assert.deepEqual(templates.resourceTemplates.map((template) => template.uriTemplate), [
      "tasteblocks://components/{name}",
    ]);

    const summaryResult = await client.readResource({ uri: "tasteblocks://catalog" });
    const summaryContent = summaryResult.contents[0];
    assert.ok("text" in summaryContent);
    assert.deepEqual(JSON.parse(summaryContent.text), {
      schemaVersion: 1,
      verifiedCount: 2,
      categories: ["text-motion", "visual-effects"],
      sources: ["Example UI", "Magic UI"],
      registryUrl: "https://tasteblocks.dev/r/registry.json",
    });

    const detailResult = await client.readResource({ uri: "tasteblocks://components/line-shadow-text" });
    const detailContent = detailResult.contents[0];
    assert.ok("text" in detailContent);
    const detail = JSON.parse(detailContent.text) as Record<string, unknown>;
    assert.equal(detail.registryAddress, "@taste/line-shadow-text");
    assert.equal(detail.preview, "/preview/line-shadow-text");
    assert.deepEqual(detail.modifications, [
      {
        shippedPath: "components/line-shadow-text.tsx",
        change: "Adjusted the export for registry compatibility.",
        reason: "Keep the installed component framework-neutral.",
      },
    ]);
    assert.equal(
      (detail.assets as Array<{ source: { project: string } }>)[0].source.project,
      "Example Assets",
    );
    for (const forbiddenKey of ["localPath", "meta", "reviewedBy", "reviewedAt"]) {
      assert.equal(detailContent.text.includes(`\"${forbiddenKey}\"`), false);
    }
    assert.equal(detailContent.text.includes(temporaryDirectory), false);
    await assert.rejects(
      client.readResource({ uri: "tasteblocks://components/not-in-catalog" }),
      /Component resource not found/,
    );

    const callSearch = async (arguments_: Record<string, unknown>) => {
      const result = await client.callTool({ name: "search_components", arguments: arguments_ });
      assert.notEqual(result.isError, true);
      assert.deepEqual(jsonText(result as Parameters<typeof jsonText>[0]), result.structuredContent);
      return result.structuredContent as { matches: Array<{ name: string; type: string }>; total: number };
    };
    assert.deepEqual((await callSearch({ query: "line shadow" })).matches.map((match) => match.name), [
      "line-shadow-text",
    ]);
    assert.equal((await callSearch({ category: "visual-effects" })).matches[0].name, "orbiting-icons");
    assert.equal((await callSearch({ source: "Magic UI" })).matches[0].name, "line-shadow-text");
    assert.equal((await callSearch({ renderer: "svg" })).matches[0].name, "orbiting-icons");
    assert.deepEqual((await callSearch({ limit: 1, offset: 1 })).matches.map((match) => match.name), ["orbiting-icons"]);
    assert.deepEqual((await callSearch({ query: "unknown component" })).matches, []);
    const invalidCategory = await client.callTool({
      name: "search_components",
      arguments: { category: "landing-sections" },
    });
    assert.equal(invalidCategory.isError, true);
    const unknownSearchKey = await client.callTool({
      name: "search_components",
      arguments: { unexpected: true },
    });
    assert.equal(unknownSearchKey.isError, true);

    const installResult = await client.callTool({
      name: "get_install_command",
      arguments: { names: ["line-shadow-text", "orbiting-icons"], packageManager: "pnpm" },
    });
    assert.notEqual(installResult.isError, true);
    assert.deepEqual(jsonText(installResult as Parameters<typeof jsonText>[0]), installResult.structuredContent);
    assert.deepEqual(installResult.structuredContent, {
      command: "pnpm dlx shadcn@latest add @taste/line-shadow-text @taste/orbiting-icons",
      addresses: ["@taste/line-shadow-text", "@taste/orbiting-icons"],
    });

    const unknownInstall = await client.callTool({
      name: "get_install_command",
      arguments: { names: ["not-in-catalog"] },
    });
    assert.equal(unknownInstall.isError, true);
    const malformedInstall = await client.callTool({
      name: "get_install_command",
      arguments: { names: ["line-shadow-text; echo unsafe"] },
    });
    assert.equal(malformedInstall.isError, true);
  } finally {
    await client.close();
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
