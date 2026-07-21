# Taste Blocks Connection

Taste Blocks supplies verified reusable components to the component-selection phase. It does not supply sections, page layouts, templates, dashboards, or complete screens.

## Use the connection

1. Resolve the section, layout, content, and required component role first.
2. Search the Taste Blocks MCP by behavior, category, renderer, or source.
3. Shortlist only components that fit the brand, content, accessibility, and attention hierarchy.
4. Read `tasteblocks://components/<name>` for provenance, license, dependencies, modifications, preview path, and registry address.
5. Read `tasteblocks://registry/<name>` only after selecting a component. This returns the exact generated public shadcn registry payload, including its distributable files.
6. Integrate only the required files and dependencies into the target project.
7. Adapt the component using `components.md`; do not preserve an upstream house style by default.
8. Run the target project's type, build, interaction, responsive, accessibility, and reduced-motion checks.

Do not browse the full catalog as a substitute for design judgment. Stop searching once a suitable component is found.

## MCP contract

The configured server is named `taste-blocks` and exposes:

- `search_components`: list or search verified components using `query`, `category`, `source`, `renderer`, `limit`, and `offset`.
- `get_install_command`: format a shadcn command for one to twenty verified names without executing it.
- `tasteblocks://catalog`: catalog count, categories, sources, and registry URL.
- `tasteblocks://components/<name>`: complete verified metadata and rights evidence.
- `tasteblocks://registry/<name>`: the exact generated redistributable registry item.

Every selected item must remain `registry:component` with `status: verified`. Reject drafts, unknown names, sections, layouts, pages, templates, and paid or restricted material.

## Category map

- `text-motion`: expressive type and text transitions.
- `visual-effects`: shaders, canvas, WebGL, fields, masks, and atmospheric effects.
- `buttons-actions`: buttons and direct action interactions.
- `navigation-menus`: component-level menus and navigation interactions.
- `media-galleries`: media viewers, galleries, lightboxes, and carousels.
- `cards-containers`: interactive surfaces and contained content structures.
- `forms-feedback`: inputs, forms, validation, and feedback.
- `icons-microinteractions`: animated icons and compact interaction feedback.
- `status-progress`: progress, loading, status, and state communication.

## Local and hosted installation

Prefer the registry payload resource for the current local integration. It remains functional without a public deployment and lets Codex inspect the exact files before writing them into a project.

Use the returned shadcn install command only when the consumer's `components.json` has a reachable `@taste` registry:

```json
{
  "registries": {
    "@taste": "https://leonxlnx.github.io/taste-blocks/r/{name}.json"
  }
}
```

The DevDay registry URL above is publicly deployed and release-tested. Still verify the selected item before executing an install command. If the public registry is unavailable, use the local registry payload resource or omit the component and report the limitation.

## Failure handling

If the MCP server is unavailable, check for a local Taste Blocks repository and its `generated/catalog.json` plus `public/r/<name>.json`. If neither connection exists, continue with native or existing-project components and report that Taste Blocks discovery was unavailable. Never invent a catalog result or registry address.
