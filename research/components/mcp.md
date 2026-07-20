# Taste Blocks MCP

## Decision

Build one small, read-only Taste Blocks MCP server around the generated component catalog. Keep shadcn as the installation system. The MCP server discovers components, exposes reviewed provenance and preview metadata, and returns a valid shadcn command. It never executes that command.

This avoids a second catalog, database, custom package format, or fork of the shadcn MCP server. Because Taste Blocks publishes a normal shadcn registry, consumers may also use the official shadcn MCP server against the `@taste` namespace without any Taste Blocks-specific adapter.

The contract is components only:

- every result is a verified `registry:component`;
- sections, layouts, pages, templates, blocks, and dashboards are rejected at generation and again when the MCP server loads the catalog;
- previews and provenance are metadata, not additional registry items.

## Registry connection

The public free registry is configured in a consumer project's `components.json`:

```json
{
  "registries": {
    "@taste": "https://tasteblocks.dev/r/{name}.json"
  }
}
```

The registry must also serve `https://tasteblocks.dev/r/registry.json`, as required for shadcn MCP discovery. A component address is always `@taste/<name>`. The canonical npm command is:

```text
npx shadcn@latest add @taste/<name>
```

The production release pipeline uses its lockfile-pinned shadcn binary. `@latest` is retained only in consumer-facing commands because that is the official shadcn CLI convention.

## MCP contract

Use MCP structured tool results with matching JSON output schemas, plus a serialized JSON text result for clients that do not consume `structuredContent`.

### Tools

| Tool | Input | Result |
| --- | --- | --- |
| `search_components` | `query?`, `category?`, `source?`, `renderer?`, `limit?`, `offset?` | Deterministic matches from verified catalog records. Each match includes name, title, description, category, tags, renderer, source name, `tasteblocks://components/<name>`, preview path, and `@taste/<name>`. `limit` defaults to 20 and is capped at 50. |
| `get_install_command` | `names` with 1 to 20 catalog names and optional `packageManager` (`npm`, `pnpm`, `yarn`, or `bun`) | One shell command containing only validated `@taste/<name>` addresses. It returns the command and addresses but performs no write. |

`search_components` doubles as listing when `query` is omitted. All string fields are length-limited, unknown input keys fail validation, and names must match the catalog's kebab-case identifier exactly.

The install step remains explicit: the MCP client shows the returned command, the user approves it, and the host runs it in the target project. Do not add an `install_component` tool with filesystem or shell access. The official shadcn MCP server follows the same registry model and provides browse, search, view, and add-command generation for configured registries.

### Resources

| Resource | Content |
| --- | --- |
| `tasteblocks://catalog` | `application/json` summary containing schema version, verified count, categories, sources, and the public registry URL. It does not inline 500 component records or code. |
| `tasteblocks://components/{name}` | Resource template returning one complete, verified metadata record. |

The component resource contains only:

- identity, description, category, tags, renderer, dependencies, and registry dependencies;
- source project, repository, immutable revision, upstream path, permalink, retrieval date, and public hashes;
- SPDX license, copyright, immutable license evidence, notices, and modification summary;
- preview path `/preview/<name>` and renderer metadata;
- registry address and canonical install command.

It never returns distributable file contents, preview wrapper source, local absolute paths, environment values, or unreleased records. Unknown names return the MCP resource-not-found error. `resources/list` exposes only the fixed catalog resource; `resources/templates/list` exposes the component template instead of materializing 500 list entries.

## Catalog read path

`taste-blocks/generated/catalog.json` remains the only MCP data input. It is generated from the composed shadcn source registry described in `next-architecture.md` and contains metadata only.

The server loads and validates that file once at process start, rejects any non-component or non-verified record, and builds an in-memory map plus a small searchable array. It does not scan `registry/sources/`, read preview source, fetch upstream repositories, call the Next.js pages, or maintain a second cache. A missing or invalid generated catalog is a startup failure, not an empty successful server.

The Next.js catalog, source ledger, preview routes, registry JSON, and MCP therefore report the same names and count. `/r/<name>.json` remains the only endpoint that distributes reviewed free component code.

## Transport

Use the same server contract with two thin transport entry points:

- **Local and CI:** stdio. The client launches the process, stdout contains MCP messages only, and diagnostics go to stderr. This is the default for development and offline verification.
- **Hosted:** stateless Streamable HTTP at `https://tasteblocks.dev/mcp`, with JSON response mode and no SSE session state. This is the public connection for remote clients. A Next.js route may host the adapter, but it must call the same catalog reader and handlers as stdio.

Do not implement legacy HTTP+SSE, subscriptions, resumability, session storage, or server-to-client notifications. The current MCP specification defines stdio and Streamable HTTP as the standard transports; a read-only catalog does not need a stateful session.

## Security boundary

- Only records already present in the verified generated catalog may be returned. Never expose drafts, rejected sources, paid components, React Bits Pro material, license keys, registry tokens, or private source URLs.
- The server accepts component names and bounded filters only. It accepts no filesystem path, arbitrary URL, registry URL, shell fragment, or upstream fetch target.
- `get_install_command` validates every name against the catalog and only formats a command. It never spawns a process or writes files.
- The free hosted endpoint is read-only and may be public. It still requires HTTPS, Origin and Host validation, request size limits, timeouts, rate limiting, and sanitized errors. A localhost HTTP adapter binds to `127.0.0.1`, not `0.0.0.0`.
- Secrets remain in environment variables and are never copied into `components.json`, generated catalog data, logs, tool results, or resource contents. Do not pass an MCP bearer token through to a registry or another service.
- A future Pro registry must use a separate authenticated namespace and authorization boundary. It must not appear in this free catalog or inherit access from the public MCP endpoint.

## Release gates

All gates are blocking:

1. **Registry:** `shadcn registry validate` passes; the policy check confirms every published item is a unique, verified `registry:component` with complete provenance and rights evidence.
2. **Generation:** `shadcn build` and the catalog generator pass. The name set and count in `generated/catalog.json`, `/r/registry.json`, and public item JSON agree exactly.
3. **Catalog safety:** the generated catalog schema passes and contains no file `content`, preview source, absolute local path, authorization header, environment value, license key, draft, paid item, section, layout, page, or block.
4. **MCP protocol:** a local stdio smoke client completes initialization, lists exactly the two tools, lists the catalog resource and component template, reads one known component, and receives resource-not-found for an unknown name.
5. **Search:** a known title, category, source, and renderer each return the expected component; pagination is stable; an unknown query returns an empty result rather than an error; no result has a registry type other than `registry:component`.
6. **Metadata:** one sample from every imported source returns the exact repository, commit, upstream path, license evidence, modification summary, preview path, and registry address found in the generated catalog.
7. **Command and install:** command generation rejects unknown or malformed names. A returned command installs one sample from every source batch into a clean fixture; the fixture then type-checks and builds, and contains no site or preview files.
8. **Web routes:** each smoke sample returns 200 from `/preview/<name>` and `/r/<name>.json`; the registry payload has type `registry:component` and only declared distributable files.
9. **Hosted security:** Streamable HTTP initialization and calls work over HTTPS; an invalid Origin is rejected, unsupported protocol versions fail cleanly, oversized input is rejected, and responses contain no secret or paid-material markers.

## Intentionally omitted

No MCP prompt library, source-code viewing tool, install executor, component editor, layout generator, page assembler, write tool, database, vector search, embeddings, analytics pipeline, custom auth for the public free catalog, or separate MCP application. At roughly 500 metadata records, a validated JSON file and in-memory filtering are sufficient.

## Official references

- [MCP specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP resources and resource templates](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
- [MCP transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [MCP authorization and token handling](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- [shadcn MCP server](https://ui.shadcn.com/docs/mcp)
- [shadcn registry MCP requirements](https://ui.shadcn.com/docs/registry/mcp)
- [shadcn registry getting started](https://ui.shadcn.com/docs/registry/getting-started)
- [shadcn registry API](https://ui.shadcn.com/docs/registry/api-reference)
- [shadcn namespaces](https://ui.shadcn.com/docs/registry/namespace)
- [shadcn registry authentication](https://ui.shadcn.com/docs/registry/authentication)
