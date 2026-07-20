# Drei component audit

## Source and rights

- Repository: `https://github.com/pmndrs/drei`
- Pinned revision: `c9d3d0dc9473f026c83965a7eb8c7f7a1a1bf0ae`
- Retrieved: `2026-07-20`
- License: MIT. The copied `LICENSE` matches the exact Git blob at the pinned revision.
- Repository identity, detached revision, every upstream file hash, every shipped file hash, and the license hash are checked by `verify.mjs`.
- Runtime dependencies are pinned to the upstream lockfile generation where possible: React Three Fiber 9.0.0, Three 0.159.0, Three Stdlib 2.35.6, Three Mesh BVH 0.8.3, and MeshLine 3.3.1. Their published package metadata declares MIT.

## Retained components

1. ASCII Renderer
2. Contact Shadows
3. Float
4. Infinite Grid
5. Marching Cubes
6. Mesh Wobble Material
7. Outlines
8. Sparkles
9. Stars
10. Trail

These are standalone visual or interaction components for React Three Fiber. Support types and shader utilities are bundled only when required and are not counted as components.

## Rejected source

The audit covered 120 uppercase component modules under upstream `src/core` and `src/web`. Ten were retained and 110 were rejected.

- Asset and media loaders, environment loaders, text/font renderers, model formats, webcam/video components, and sprite systems were rejected because they require remote or consumer-supplied runtime assets.
- Camera controls, navigation controls, selection systems, scroll systems, view managers, performance monitors, statistics panels, loaders, and staging assemblies were rejected as app-shell or implementation infrastructure rather than standalone catalog components.
- Geometry helpers, low-level render targets, cameras, lines, points, materials, masks, cloning, bounds, centering, resizing, and other ordinary primitives were rejected as implementation helpers or generic atoms.
- Families already represented by stronger existing Taste Blocks drafts were rejected as duplicates.
- Caustics, Fisheye, Splat, Cloud, Mesh Portal Material, Mesh Reflector Material, and similar render-heavy systems were rejected for unbounded cost, external data requirements, or preview/runtime complexity disproportionate to a standalone component.
- Mesh Transmission Material and Wireframe passed runtime compilation but failed strict consumer TypeScript with multiple upstream type gaps, so they were rejected instead of being patched extensively or hidden behind relaxed checks.

## Adaptation

- Upstream source and support closures are byte-identical to the pinned Git blobs except for one runtime-neutral annotation in Contact Shadows: the internal blur-strength parameter is explicitly typed as `number` for strict TypeScript consumers.
- The exact change and reason are recorded in `drafts.json`; no component API, rendering behavior, shader, styling system, or implementation was replaced.
- Previews cap device pixel ratio at 1.5. Animated previews use the components' existing speed controls and a demand-driven Canvas when reduced motion is requested. Trail motion is frozen under reduced motion.

## Verification

- Pinned Git source, license, and shipped-content verifier: 10 passed.
- Taste Blocks source policy, secret scan, remote-runtime-asset scan, and global name/family/hash deduplication: 10 passed.
- Official shadcn registry schema validation and registry build: 10 passed.
- Strict TypeScript with React 19.2.7, Next.js 16.2.10, and React Three Fiber 9.0.0: passed.
- Next.js production build: passed.
- Browser QA: all 10 rendered visible output with one Canvas, no framework overlay, and no runtime errors.
- Desktop and 390 px mobile viewport: no horizontal overflow.
- Reduced motion: all 10 loaded with `prefers-reduced-motion: reduce`; motion previews froze through zero-speed inputs or a demand-driven Canvas.
- Lifecycle: sequential navigation repeatedly unmounted and remounted every retained component without browser errors or extra canvases.
