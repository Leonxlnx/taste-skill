# Component Import Contract

This is the source-of-truth contract for copied React components in Taste Blocks. It covers standalone components only: controls, text motion, media, feedback, navigation primitives, backgrounds, shaders, and interaction effects. Page sections, complete layouts, templates, heroes, pricing tables, footers, dashboards, and screens are rejected.

## One source of truth

The source-grouped shadcn registry manifests are canonical. Do not create a second per-component `meta.json` format.

```text
taste-blocks/
  registry.json
  registry/sources/<source-id>/
    registry.json
    drafts.json
    LICENSE
    NOTICE
    components/<public-name>/<source files>
  previews/<public-name>.tsx
```

- The root `registry.json` includes only source `registry.json` files whose entries are verified.
- `drafts.json` uses the same shadcn registry schema but is not included in the root registry or public count.
- An item exists in exactly one manifest. Promotion moves it from `drafts.json` to `registry.json`; facts are never copied between two metadata systems.
- File paths are relative to the source manifest that declares them, as required by shadcn registry composition.
- License and notice files stay next to the copied source batch and are also assembled into the generated third-party notice artifact.
- Preview wrappers live outside `registry/` and are never installed.

## Invariants

- One registry item represents one materially distinct React component.
- Every shipped byte is traceable to an immutable upstream revision or a documented minimal adaptation of that revision.
- Every public item has type `registry:component`.
- Supporting hooks, utilities, styles, and assets may ship inside that item but do not count separately.
- Only items in included source registries are public, searchable, installable, or counted.
- A port, preset, theme, style, timing change, dependency swap, demo, fixture, or wrapper is not another component.
- Preview code demonstrates the shipped export; it never substitutes for it.

## Canonical registry item

The normal shadcn fields remain normal shadcn fields. Taste Blocks evidence lives under `meta.tasteblocks`, which the official schema permits as arbitrary metadata.

```jsonc
{
  "name": "magic-line-shadow-text",
  "type": "registry:component",
  "title": "Line Shadow Text",
  "description": "Renders text with a moving line-shadow treatment.",
  "author": "Magic UI",
  "dependencies": ["motion@12.23.24"],
  "registryDependencies": [],
  "files": [
    {
      "path": "components/magic-line-shadow-text/line-shadow-text.tsx",
      "type": "registry:component",
      "target": "@components/taste-blocks/line-shadow-text.tsx"
    }
  ],
  "categories": ["text-motion"],
  "meta": {
    "tasteblocks": {
      "status": "draft",
      "category": "text-motion",
      "tags": ["text", "shadow", "motion"],
      "renderer": "dom",
      "preview": "previews/magic-line-shadow-text.tsx",
      "source": {
        "project": "Magic UI",
        "repository": "https://github.com/magicuidesign/magicui",
        "revision": "<full 40-character commit SHA>",
        "retrievedAt": "2026-07-20",
        "files": [
          {
            "shippedPath": "components/magic-line-shadow-text/line-shadow-text.tsx",
            "upstreamPath": "apps/www/registry/magicui/line-shadow-text.tsx",
            "permalink": "https://github.com/magicuidesign/magicui/blob/<full commit>/apps/www/registry/magicui/line-shadow-text.tsx",
            "upstreamSha256": "sha256:<64 lowercase hex>",
            "contentSha256": "sha256:<64 lowercase hex>",
            "changes": []
          }
        ]
      },
      "license": {
        "spdx": "MIT",
        "scope": "apps/www/registry/magicui/line-shadow-text.tsx",
        "copyright": ["Copyright (c) Magic UI"],
        "evidence": {
          "upstreamPath": "LICENSE.md",
          "permalink": "https://github.com/magicuidesign/magicui/blob/<full commit>/LICENSE.md",
          "sha256": "sha256:<64 lowercase hex>",
          "localPath": "registry/sources/magic-ui/LICENSE"
        },
        "notices": []
      },
      "assets": [],
      "modifications": [],
      "dedupe": {
        "family": "line-shadow-text",
        "sourceHash": "sha256:<64 lowercase hex>",
        "contentHash": "sha256:<64 lowercase hex>",
        "structureHash": "sha256:<64 lowercase hex>"
      },
      "verification": {
        "reviewedBy": null,
        "reviewedAt": null
      }
    }
  }
}
```

The registry `files` array controls installation. `meta.tasteblocks.source.files` must map one-to-one to those distributable files and adds immutable evidence. The validator rejects missing, extra, or mismatched paths.

## Controlled categories

Each item has exactly one primary category. Extra discovery words belong in tags.

```text
text-motion
visual-effects
buttons-actions
navigation-menus
media-galleries
cards-containers
forms-feedback
icons-microinteractions
status-progress
```

Navigation primitives such as menus, tabs, breadcrumbs, pagination, and docks are allowed. Complete site navbars, headers, and navigation layouts are not components and are rejected.

## Identity and files

- `name` is globally unique kebab-case. It does not encode a color, theme, framework, or version.
- `title` is a plain human name; `description` is one factual sentence, not marketing copy.
- `renderer` is `dom`, `svg`, `canvas`, or `webgl`.
- The public item type is always `registry:component`.
- Supporting file types may be `registry:component`, `registry:ui`, `registry:hook`, `registry:lib`, or `registry:file`, but they remain internal to one counted item.
- Every source path and permalink points to the recorded immutable commit.
- Every changed file lists only concrete compatibility, accessibility, asset, or safety changes.
- Preview files, fixtures, screenshots, and catalog-only CSS never appear in the install payload.
- A preview may supply demo data and controls, but may not contain a hidden replacement implementation.

## Dependencies

- `dependencies` lists exact direct runtime packages in shadcn syntax. React and React DOM remain project peers.
- `registryDependencies` lists only real install dependencies.
- A copied dependency is not silently vendored. Its license is covered by the lockfile inventory or its own preserved source notice.
- Do not mix multiple competing primitive systems in one component.
- A source that requires a framework-scale rewrite or styling-system port remains a research candidate; it is not a minimal adaptation.

## License and assets

- The exact code path must have an explicit permissive SPDX license accepted by repository policy.
- Preserve the immutable license file, its hash, applicable copyright, and every required notice.
- Apache-2.0 modifications are marked and required NOTICE material is propagated.
- Conflicting, path-ambiguous, no-license, Commons Clause, non-commercial, GPL, AGPL, or proprietary material is rejected.
- Attribution, payment, or public visibility never substitutes for redistribution permission.
- React Bits Pro, authenticated paid registries, and leaked keys never enter source, previews, metadata, logs, or commits.

Every shipped image, video, font, icon file, model, shader include, or data file receives its own source, immutable revision, hash, license, and local notice record. Remote demo URLs are not release assets. Undeclared local assets, unrecorded fonts/icons, or runtime fetches block verification.

## Hashes

All hashes use lowercase SHA-256 with a `sha256:` prefix.

- `upstreamSha256`: raw upstream file bytes.
- `contentSha256`: raw shipped file bytes.
- `sourceHash`: hash of the sorted upstream file hashes.
- `contentHash`: hash of the sorted shipped file hashes.
- `structureHash`: normalized TypeScript, JSX, and CSS structure after removing comments, formatting, local names, and demo literals.

The validator recomputes every hash. Equal source or content hashes are automatic duplicates. Equal structure hashes require manual family review.

## Deduplication and honest counting

`dedupe.family` describes observable behavior, not source branding. Only one verified item may occupy a family.

Treat these as one component:

- JavaScript and TypeScript ports;
- CSS, Tailwind, CSS Modules, styled-components, Motion, or GSAP ports of the same behavior;
- light/dark, color, radius, font, density, direction, timing, and responsive variants;
- prop presets, copy swaps, fixture swaps, and demos;
- renamed forks, wrappers, dependency swaps, and framework adapters;
- device-frame shapes with the same public behavior;
- the same primitive wrapped by many parameterless example files.

A candidate is distinct only when it materially changes the public content/API model, the interaction/state machine, or the rendering algorithm and visible behavior. If the difference can only be explained as another style or preset, it is not a second entry.

The dedupe pass runs in this order:

1. Reject duplicate public names and source locators.
2. Reject equal source or content hashes.
3. Review equal structure hashes.
4. Compare category, tags, API, interaction, and visual output.
5. Assign one global behavior family across every upstream source.
6. Keep the strongest, safest, easiest-to-install implementation.
7. Compare previews with the same content and viewport before approval.

The public count is the number of items resolved from the root registry after validation. Drafts, candidates, rejected sources, demos, variants, deprecated entries, previews, utilities, and adapters never count.

## Promotion gates

A draft moves into an included source registry only when one clean run passes:

1. **Schema:** official shadcn validation and Taste Blocks metadata validation pass.
2. **Provenance:** revision, paths, permalinks, upstream bytes, and modification records agree.
3. **Rights:** code, notices, assets, and direct dependencies have compatible evidence.
4. **Integrity:** file and aggregate hashes recompute; generated output contains only declared files.
5. **Deduplication:** no unresolved source, content, structure, API, or behavior-family duplicate remains.
6. **Technical:** a clean React/Next fixture installs, type-checks, and builds the generated item.
7. **Preview:** the real export renders without console errors, missing assets, or substitute code.
8. **Quality:** narrow width, long content, keyboard, focus, touch, reduced motion, and pause behavior pass where applicable.
9. **Release:** secret scan and notice assembly pass, and generated item JSON is inspected.

Failure leaves the item in `drafts.json` or rejects it. Failure never justifies an in-house replacement component.
