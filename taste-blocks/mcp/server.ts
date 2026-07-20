import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import * as z from "zod/v4";

const REGISTRY_URL = "https://tasteblocks.dev/r/registry.json";
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAME = z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const HASH = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const HTTPS_URL = z.string().max(2_048).url().refine((value) => value.startsWith("https://"));
const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const RELATIVE_PATH = z
  .string()
  .min(1)
  .max(500)
  .refine((value) => !value.startsWith("/") && !value.includes("\\") && !value.split("/").includes(".."));
const CATEGORY = z.enum([
  "text-motion",
  "visual-effects",
  "buttons-actions",
  "navigation-menus",
  "media-galleries",
  "cards-containers",
  "forms-feedback",
  "icons-microinteractions",
  "status-progress",
]);
const RENDERER = z.enum(["dom", "svg", "canvas", "webgl"]);
const FORBIDDEN_KIND =
  /\b(?:blocks?|layouts?|pages?|sections?|templates?|dashboards?|hero(?:es)?|footers?|navbars?|screens?)\b/i;

const sourceFileSchema = z.strictObject({
  upstreamPath: RELATIVE_PATH,
  permalink: HTTPS_URL,
  upstreamSha256: HASH,
  contentSha256: HASH,
  changes: z.array(z.string().max(500)).max(100),
});

const sourceSchema = z.strictObject({
  project: z.string().min(1).max(120),
  repository: HTTPS_URL,
  revision: z.string().regex(/^[a-f0-9]{40}$/),
  retrievedAt: DATE,
  files: z.array(sourceFileSchema).min(1).max(100),
});

const licenseSchema = z.strictObject({
  spdx: z.string().min(1).max(120),
  scope: z.string().min(1).max(500),
  copyright: z.array(z.string().min(1).max(500)).min(1).max(100),
  evidence: z.strictObject({
    upstreamPath: RELATIVE_PATH,
    permalink: HTTPS_URL,
    sha256: HASH,
  }),
  notices: z.array(z.string().max(10_000)).max(100),
});

const assetSchema = z.strictObject({
  name: z.string().min(1).max(200),
  sha256: HASH,
  source: z.strictObject({
    project: z.string().min(1).max(120),
    repository: HTTPS_URL,
    revision: z.string().regex(/^[a-f0-9]{40}$/),
    upstreamPath: RELATIVE_PATH,
    permalink: HTTPS_URL,
    sha256: HASH,
    changes: z.array(z.string().max(500)).max(100),
  }),
  license: licenseSchema,
});

const modificationSchema = z.strictObject({
  shippedPath: RELATIVE_PATH,
  change: z.string().min(1).max(500),
  reason: z.string().min(1).max(500),
});

const catalogComponentSchema = z
  .strictObject({
    name: NAME,
    title: z.string().min(1).max(160),
    description: z.string().min(1).max(1_000),
    author: z.string().min(1).max(160),
    type: z.literal("registry:component"),
    status: z.literal("verified"),
    category: CATEGORY,
    tags: z.array(z.string().min(1).max(60)).min(1).max(40),
    renderer: RENDERER,
    dependencies: z.array(z.string().min(1).max(200)).max(100),
    registryDependencies: z.array(z.string().min(1).max(200)).max(100),
    source: sourceSchema,
    license: licenseSchema,
    modifications: z.array(modificationSchema).max(100),
    assets: z.array(assetSchema).max(100),
    hashes: z.strictObject({
      source: HASH,
      content: HASH,
      structure: HASH,
    }),
    preview: z.string().max(120),
    registryAddress: z.string().max(100),
    installCommand: z.string().max(200),
  })
  .superRefine((component, context) => {
    const identity = `${component.name} ${component.title}`
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .replace(/[-_]/g, " ");
    const isIconException =
      component.category === "icons-microinteractions" &&
      component.renderer === "svg" &&
      component.name.endsWith("-icon") &&
      /\bIcon$/.test(component.title);
    if (FORBIDDEN_KIND.test(identity) && !isIconException) {
      context.addIssue({ code: "custom", path: ["name"], message: "Excluded non-component kind" });
    }
    if (component.preview !== `/preview/${component.name}`) {
      context.addIssue({ code: "custom", path: ["preview"], message: "Preview does not match component name" });
    }
    if (component.registryAddress !== `@taste/${component.name}`) {
      context.addIssue({ code: "custom", path: ["registryAddress"], message: "Registry address does not match component name" });
    }
    if (component.installCommand !== `npx shadcn@latest add @taste/${component.name}`) {
      context.addIssue({ code: "custom", path: ["installCommand"], message: "Install command is not canonical" });
    }
  });

const catalogSchema = z.array(catalogComponentSchema).superRefine((components, context) => {
  const names = new Set<string>();
  for (const [index, component] of components.entries()) {
    if (names.has(component.name)) {
      context.addIssue({ code: "custom", path: [index, "name"], message: "Duplicate component name" });
    }
    names.add(component.name);
  }
});

export type CatalogComponent = z.infer<typeof catalogComponentSchema>;

const searchMatchSchema = z.strictObject({
  name: NAME,
  title: z.string(),
  description: z.string(),
  type: z.literal("registry:component"),
  category: CATEGORY,
  tags: z.array(z.string()),
  renderer: RENDERER,
  source: z.string(),
  resourceUri: z.string(),
  preview: z.string(),
  registryAddress: z.string(),
});

const searchResultSchema = z.strictObject({
  matches: z.array(searchMatchSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(50),
  offset: z.number().int().nonnegative(),
});

const installResultSchema = z.strictObject({
  command: z.string(),
  addresses: z.array(z.string()).min(1).max(20),
});

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function compareNames(a: CatalogComponent, b: CatalogComponent) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

export function parseCatalog(value: unknown): CatalogComponent[] {
  const result = catalogSchema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    const location = issue.path.length ? ` at ${issue.path.join(".")}` : "";
    throw new Error(`Invalid generated/catalog.json${location}: ${issue.message}`);
  }
  return result.data.sort(compareNames);
}

export async function loadCatalog(): Promise<CatalogComponent[]> {
  const testPath = process.env.NODE_ENV === "test" ? process.env.TASTE_BLOCKS_TEST_CATALOG : undefined;
  const catalogPath = testPath ?? path.join(PROJECT_ROOT, "generated", "catalog.json");
  let source: string;
  try {
    source = await readFile(catalogPath, "utf8");
  } catch {
    throw new Error("Could not read generated/catalog.json");
  }
  try {
    return parseCatalog(JSON.parse(source));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Invalid generated/catalog.json: malformed JSON");
    throw error;
  }
}

function textResult<T extends Record<string, unknown>>(structuredContent: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(structuredContent) }],
    structuredContent,
  };
}

function componentDetail(component: CatalogComponent) {
  return {
    name: component.name,
    title: component.title,
    description: component.description,
    author: component.author,
    type: component.type,
    status: component.status,
    category: component.category,
    tags: component.tags,
    renderer: component.renderer,
    dependencies: component.dependencies,
    registryDependencies: component.registryDependencies,
    source: component.source,
    license: component.license,
    modifications: component.modifications,
    assets: component.assets,
    hashes: component.hashes,
    preview: component.preview,
    registryAddress: component.registryAddress,
    installCommand: component.installCommand,
  };
}

export function createTasteBlocksServer(components: CatalogComponent[]) {
  const byName = new Map(components.map((component) => [component.name, component]));
  const server = new McpServer({ name: "taste-blocks", version: "0.1.0" });

  server.registerTool(
    "search_components",
    {
      title: "Search Taste Blocks components",
      description: "List or search verified Taste Blocks components.",
      inputSchema: z.strictObject({
        query: z.string().trim().max(200).optional(),
        category: CATEGORY.optional(),
        source: z.string().trim().min(1).max(120).optional(),
        renderer: RENDERER.optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).max(100_000).default(0),
      }),
      outputSchema: searchResultSchema,
      annotations: READ_ONLY,
    },
    async ({ query, category, source, renderer, limit, offset }) => {
      const queryValue = query?.toLowerCase();
      const sourceValue = source?.toLowerCase();
      const matches = components.filter((component) => {
        if (category && component.category !== category) return false;
        if (sourceValue && component.source.project.toLowerCase() !== sourceValue) return false;
        if (renderer && component.renderer !== renderer) return false;
        if (!queryValue) return true;
        return [
          component.name,
          component.title,
          component.description,
          component.author,
          component.category,
          component.renderer,
          component.source.project,
          ...component.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(queryValue);
      });
      const structuredContent = {
        matches: matches.slice(offset, offset + limit).map((component) => ({
          name: component.name,
          title: component.title,
          description: component.description,
          type: component.type,
          category: component.category,
          tags: component.tags,
          renderer: component.renderer,
          source: component.source.project,
          resourceUri: `tasteblocks://components/${component.name}`,
          preview: component.preview,
          registryAddress: component.registryAddress,
        })),
        total: matches.length,
        limit,
        offset,
      };
      return textResult(structuredContent);
    },
  );

  server.registerTool(
    "get_install_command",
    {
      title: "Get a Taste Blocks install command",
      description: "Format, but never execute, a shadcn command for verified components.",
      inputSchema: z.strictObject({
        names: z
          .array(NAME)
          .min(1)
          .max(20)
          .refine((names) => new Set(names).size === names.length, "Component names must be unique"),
        packageManager: z.enum(["npm", "pnpm", "yarn", "bun"]).default("npm"),
      }),
      outputSchema: installResultSchema,
      annotations: READ_ONLY,
    },
    async ({ names, packageManager }) => {
      const unknownName = names.find((name) => !byName.has(name));
      if (unknownName) throw new McpError(ErrorCode.InvalidParams, `Unknown component: ${unknownName}`);
      const addresses = names.map((name) => `@taste/${name}`);
      const runner = {
        npm: "npx",
        pnpm: "pnpm dlx",
        yarn: "yarn dlx",
        bun: "bunx --bun",
      }[packageManager];
      return textResult({ command: `${runner} shadcn@latest add ${addresses.join(" ")}`, addresses });
    },
  );

  server.registerResource(
    "catalog",
    "tasteblocks://catalog",
    {
      title: "Taste Blocks catalog summary",
      description: "Counts and discovery facets for the verified public component catalog.",
      mimeType: "application/json",
    },
    async (uri) => {
      const summary = {
        schemaVersion: 1,
        verifiedCount: components.length,
        categories: [...new Set(components.map((component) => component.category))].sort(),
        sources: [...new Set(components.map((component) => component.source.project))].sort(),
        registryUrl: REGISTRY_URL,
      };
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(summary) }] };
    },
  );

  server.registerResource(
    "component",
    new ResourceTemplate("tasteblocks://components/{name}", { list: undefined }),
    {
      title: "Taste Blocks component metadata",
      description: "Verified provenance, licensing, preview, and installation metadata for one component.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const name = Array.isArray(variables.name) ? variables.name[0] : variables.name;
      const component = name ? byName.get(name) : undefined;
      if (!component) throw new McpError(ErrorCode.InvalidParams, "Component resource not found");
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(componentDetail(component)) }],
      };
    },
  );

  return server;
}
