# Taste Blocks Next.js Architecture

## Decision

Replace the empty Vite catalog in `taste-blocks/` in place with one Next.js App Router application. Do not create a monorepo or a second app. The current registry is empty, so there is no component code to migrate; the Vite hash router, `import.meta.glob` loader, and old block-oriented types can be removed after the Next.js build passes.

This catalog contains **components only**. Page sections, layouts, templates, complete site navbars, heroes, footers, and `registry:block` items are out of scope. Reusable navigation primitives such as menus, tabs, breadcrumbs, pagination, and docks are allowed. Hooks, styles, assets, and utilities may ship only as supporting files of a component and do not count as components.

## Folder structure

```text
taste-blocks/
├── app/
│   ├── layout.tsx                 # minimal document shell
│   ├── globals.css                # Tailwind v4 and shared tokens only
│   ├── (site)/
│   │   ├── layout.tsx             # public header/footer
│   │   ├── page.tsx               # clean catalog-first landing page
│   │   ├── components/
│   │   │   ├── page.tsx           # search, filters, pagination
│   │   │   └── [slug]/page.tsx    # component detail
│   │   ├── docs/page.tsx
│   │   ├── sources/page.tsx
│   │   ├── license/page.tsx
│   │   └── pricing/page.tsx       # Free/Pro boundary, no fake prices
│   └── preview/
│       └── [slug]/
│           ├── page.tsx           # one component, no site shell
│           └── error.tsx          # local preview failure state
├── components/
│   └── site/                       # catalog UI; never distributed
├── lib/
│   └── catalog.ts                 # reads generated metadata
├── previews/
│   └── <slug>.tsx                 # demo fixtures; never distributed
├── registry/
│   └── sources/
│       └── <upstream>/
│           ├── registry.json      # verified items included by the root
│           ├── drafts.json        # same schema, not publicly included
│           ├── LICENSE
│           └── <component files>
├── generated/
│   ├── catalog.json               # metadata only
│   └── preview-loaders.ts         # explicit imports generated from slugs
├── public/
│   └── r/                          # generated shadcn item JSON
├── scripts/
│   ├── build-catalog.mjs
│   └── check-policy.mjs
├── registry.json                  # includes registry/sources/*/registry.json
├── components.json
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

Organize copied code by upstream source, not by visual category. Source ownership and notices stay obvious, agents can work on different source folders without editing the same file, and changing a catalog category never moves code. Component names remain globally unique.

## Single source of truth

Use the shadcn source registry as the only product manifest. The root `registry.json` uses `include` to compose the smaller source registries. Each accepted item is `registry:component` and stores catalog data in its supported `meta` field:

- category and search tags;
- runtime and package dependencies;
- featured order, if any;
- exact repository, revision, upstream path, retrieval date, and source hash;
- SPDX license, copyright, notice requirements, and modification summary.

Do not keep the same facts in separate `meta.json` files. `generated/catalog.json`, `public/r/*.json`, the visible source ledger, real component count, and `THIRD_PARTY_NOTICES.md` must all derive from the source registry. Unverified imports may live temporarily in a source-local `drafts.json` using the same item schema, but that file is never included by the root registry. Promotion moves an item into the source `registry.json`; metadata is not duplicated.

The shadcn registry now supports composed `include` files, official validation, and static output through `shadcn build`. Use those instead of maintaining a second registry format or duplicating its schema in custom code. The small project policy check should enforce only rules shadcn cannot know:

- every public item is `registry:component`;
- provenance and license fields are complete;
- the named preview exists;
- distributable files do not import `app/`, `components/site/`, `previews/`, or Next-only APIs;
- source path, source hash, and public name are unique;
- no layout, section, page, or block item is present.

References: [shadcn registry composition and build](https://ui.shadcn.com/docs/registry/getting-started), [registry validation](https://ui.shadcn.com/docs/changelog/2026-05-registry-include), and [registry item schema](https://ui.shadcn.com/docs/registry/registry-item-json).

## Static catalog loading

`scripts/build-catalog.mjs` calls the documented `loadRegistry` API at build time and writes a compact `generated/catalog.json` without component source. Server Components import this JSON directly. There is no database, CMS, runtime directory scan, or catalog API.

The same script emits `generated/preview-loaders.ts` with an explicit lazy import for every `previews/<slug>.tsx`. Next.js cannot replace Vite's `import.meta.glob`, and a generated explicit map gives the bundler stable split points without a hand-maintained 500-entry file. Generation fails on a missing or orphaned preview.

Catalog search is a simple in-memory scan of about 500 metadata records. Keep `q`, category, source, runtime, and page in URL search parameters, filter on the server, and render at most 24 results per page. A search service or index is unnecessary at this size.

## Preview isolation

Render live specimens in lazy `<iframe>` elements pointing to `/preview/<slug>`. An iframe gives each copied component its own document, CSS cascade, globals, runtime errors, and focus context. It is isolation for reviewed code, not a security sandbox for untrusted code.

The preview route imports exactly one site-only wrapper. That wrapper imports the distributable component and supplies demo data, local assets, size constraints, and any preview-only controls. Preview code and demo assets never appear in the registry item's file list.

Use native `loading="lazy"`, a maximum of 24 catalog results, and an explicit start control for expensive WebGL previews. Detail pages may load their single preview immediately. Add viewport presets by resizing the iframe container; do not fork mobile and desktop component files. A route-level `error.tsx` keeps a broken preview from breaking the catalog.

All verified slugs are returned by `generateStaticParams`, with `dynamicParams = false`, for both detail and preview routes. Unknown slugs therefore produce a real 404, and metadata such as title and description can be generated statically. Next.js documents this build-time route generation in [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params).

## Site code versus shipped code

The boundary is mechanical:

| Path | Purpose | May ship in registry JSON |
| --- | --- | --- |
| `registry/sources/**` | copied/adapted component source and required notices | yes, only files explicitly declared by the item |
| `previews/**` | examples, fake fixtures, controls, wrappers | no |
| `app/**` | routes and layouts | no |
| `components/site/**` | catalog navigation, cards, search, filters | no |
| `generated/**` | catalog read model and import map | no |
| `public/r/**` | generated installation payloads | generated output only |

Distributable components must remain ordinary React components where possible. Do not add `next/link`, `next/image`, server actions, or site aliases to copied component source merely because the catalog uses Next.js. If an upstream component is genuinely Next-only, label that dependency explicitly rather than hiding it in the preview adapter.

## Tailwind CSS v4

Use the current Tailwind v4 PostCSS setup: `tailwindcss`, `@tailwindcss/postcss`, a minimal `postcss.config.mjs`, and `@import "tailwindcss"` in `app/globals.css`. No `tailwind.config` is needed initially. Add explicit `@source` paths for `registry/` and `previews/` so all copied utility classes are detected even if repository ignore rules change. Keep complete class strings in source; generated class-name fragments are not detectable.

The root stylesheet should contain only Tailwind and shared neutral tokens. Style the catalog shell with Tailwind or CSS Modules. Component-specific global CSS loads only inside its preview document, preventing one source library from restyling another specimen. See the official [Tailwind Next.js setup](https://tailwindcss.com/docs/installation/framework-guides/nextjs) and [source detection rules](https://tailwindcss.com/docs/detecting-classes-in-source-files).

Set `components.json` to `rsc: true`, point its CSS field to `app/globals.css`, and keep aliases consistent with the paths installed into consumer projects. Pin resolved dependency versions in `package-lock.json`; do not run unpinned registry tooling in CI.

## Build and release

Use the installed `shadcn` binary and the existing npm workflow shape:

```text
validate      shadcn registry validate && node scripts/check-policy.mjs
generate      shadcn build && node scripts/build-catalog.mjs
typecheck     tsc --noEmit
build         validate -> generate -> next build
verify        build plus the focused browser smoke check
```

`shadcn build` writes installable files to `public/r`, which Next.js serves directly at `/r/<name>.json`; no duplicate route handler is needed. Keep `public/r` generated and never hand-edit it. Inspect at least one generated item from every source batch and verify that preview/site files are absent.

Use normal Next.js deployment, not `output: "export"`. The pages can still prerender from local metadata, while a normal server leaves room for the already-requested MCP and future private Pro authentication without another migration. If 500 static preview pages become a measured CI bottleneck, make only preview routes on-demand; do not add that complexity before it is needed.

## Migration sequence

1. Confirm `taste-skill-v2` and record `git status`. Preserve the existing user-owned untracked `studio/` and `research/sections/*` files.
2. Modify the existing `taste-blocks/` package in place. Replace Vite dependencies and configuration with Next.js, Tailwind v4, PostCSS, and the pinned shadcn CLI. Regenerate the lockfile normally.
3. Add the App Router shell and real `/components` routes. Do not port hash routing or the block-oriented `CatalogKind` model.
4. Replace the custom registry schema builder with official shadcn source registries, validation, and build. Retain only the small provenance/component-only policy check.
5. Add the generated static catalog and preview import map, then the isolated preview route.
6. Import the first legal source batch, prove install output and previews end to end, and only then scale source-by-source toward 500.
7. Run validation, typecheck, production build, install one generated item into a clean fixture, and browser-check home, catalog, detail, preview, mobile overflow, keyboard access, and console output.
8. Stage explicit `taste-blocks/**` and intended research files only. Never use `git add .`; never touch or merge `main`.
9. After every source-batch commit, verify the diff contains copied components from the named source, complete provenance, no sections/blocks, no preview code in registry output, and no secret or paid-library material before pushing.

## Deliberately omitted

Do not add a monorepo, database, CMS, Storybook, custom package protocol, virtualized grid, background job system, or separate preview service. The App Router, static metadata, paginated iframe previews, and official shadcn registry already cover the 500-component target. Add one of those systems only after a measured limitation appears.
