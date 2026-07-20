# Extend UI component audit

## Source

- Repository: `https://github.com/extend-hq/ui`
- Pinned revision: `6d6d33df18ec39455df00f6315f16d2cfd89563b`
- Revision subject: `Preserve first-slide position during manual scrolling`
- Retrieved: `2026-07-20`
- Source license: MIT
- License file: `LICENSE.md`, copied byte-for-byte as `LICENSE`

## Scope result

The upstream registry exposes 24 entries tagged `documents`. Nine standalone, specialized components were retained. Fifteen entries were rejected. Generic primitives elsewhere in the repository were not candidates and are not counted.

### Retained

1. File Upload
2. File Thumbnail
3. Document Viewer Sidebar
4. Document Splits
5. Excel Viewer
6. PowerPoint Viewer
7. CSV Viewer
8. Bounding Box Citations
9. Schema Builder

These are component-level document interactions. None is a website section, marketing layout, template, page, dashboard, or screen.

### Rejected

1. PDF Block Resizable Shell: infrastructure for composing upstream document blocks, not a standalone catalog component.
2. File System: a 5,188-line Finder-style application surface whose default closure includes every document viewer, including the rejected PDF path.
3. File System Block: registry block.
4. PDF Viewer: its copied closure hardcodes a jsDelivr PDFium WASM URL, violating the no-remote-runtime-assets rule.
5. DOCX Viewer: upstream requires a repository-only pnpm patch to `@extend-ai/react-docx@0.8.1`; a normal shadcn install cannot reproduce that closure.
6. DOCX Editor: explicitly experimental, depends on the same repository-only DOCX package patch, and is shipped upstream as a full editor surface.
7. Excel Editor: explicitly experimental and duplicated by an upstream full-editor block.
8. PDF Dropzone: registry block and coupled to the rejected PDF viewer.
9. Layout Blocks: forbidden layout/block identity, 8,444 lines, and a large structured-data review surface outside this component-only scope.
10. Layout Blocks Block: registry block.
11. E-Signature: registry block built around a complete signing flow.
12. Bounding Box Citations Block: registry block.
13. Document Splits Block: registry block.
14. Excel Editor Block: registry block.
15. DOCX Editor Block: registry block.

## Adaptations

- Preserved upstream behavior and public APIs except where needed for install closure, keyboard access, RTL, or reduced motion.
- Repointed dependencies between retained Extend UI components to their Taste Blocks install targets.
- Added keyboard sorting to Document Splits using dnd-kit's own `KeyboardSensor` and `sortableKeyboardCoordinates`.
- Converted directional utilities in the sidebar, split organizer, schema editor, and toolbars to logical RTL-aware forms.
- Added reduced-motion overrides to source-backed sidebar and sortable transitions.
- Added a visible focus state and polite rejection announcement to File Upload.
- No remote assets, credentials, sample documents, or fabricated product data are distributed with the components.

## Dependencies

Every direct runtime package is pinned in `drafts.json`. Exact tested versions and SPDX licenses are recorded in `DEPENDENCIES.md`. Cross-component imports are represented by explicit registry dependencies. CSV Viewer also declares its required TypeScript types package.

## Verification

- Immutable revision, source license, upstream blob hashes, shipped hashes, and one-to-one file provenance are enforced by `drafts.json` and `verify.mjs`.
- Global Taste Blocks name, source, content, structure, and semantic-family dedupe is enforced by `scripts/check-drafts.mjs`.
- Source and preview files are scanned for secrets, hardcoded remote runtime assets, trailing whitespace, and missing final newlines.
- Dependency closure is checked from TypeScript import specifiers against each item's dependency declarations.
- Browser, strict TypeScript, shadcn schema/build, production build, mobile, keyboard, touch, RTL, reduced-motion, and unmount checks are recorded after the isolated QA run.
