# Chamaac UI component audit

## Source and rights

- Repository: `https://github.com/amarnathdhumal/chamaacui`
- Pinned revision: `345d79b1b1d4c89c2394a5c23ac12a9861c383c2`
- Retrieved: `2026-07-20`
- License: MIT, exact copied `LICENSE` SHA-256 `d6ba4df1c07c99e1d38dc59ddb858fcb12cbe79edeef48d249c23a60843f6dc9`
- Every shipped file has an immutable upstream permalink, upstream SHA-256, shipped SHA-256, and documented modification record in `drafts.json`.
- Direct runtime dependencies were pinned and inspected at the tested versions: React Three Fiber 9.4.0, Drei 10.7.6, React Three Postprocessing 3.0.4, clsx 2.1.1, tailwind-merge 3.4.0, and Three 0.180.0. Each declares MIT.

## Retained components

1. Astral Flow
2. Electric Mist
3. Grid Bloom
4. Light Speed
5. Synthesis
6. Waves

These are standalone components published in Chamaac UI's own registry. They are not sections, page layouts, templates, screens, dashboards, or generic atoms.

## Rejected source

- Nebula: explicitly references a Shadertoy shader whose redistribution terms were not established by the repository license alone.
- Liquid Chrome and Water Caustic: semantically duplicate the existing Paper Liquid Metal and Paper Water families.
- Dock, Text Loop, and Carousel: duplicate existing Motion Primitives/Fancy Components families; the carousel also lacks user controls.
- AI Input: a full-viewport simulated chat screen with fake reply behavior, not a production-ready standalone composer.
- How It Works, Stats Cards, and Feature Steps: website sections.
- Buttons and animated icons: generic atoms and globally covered animated-icon families.
- Gauge, Gif Text, Dancing Letters, Interactive Grid: insufficiently distinct from existing families.
- Bokeh Grid, Glassy Boxes, Iridescent Windows, Modern Smoke, Deform Tunnel, Liquid Morph, Marching Waves, Emissive Dot Grid, and Shader Test: unpublished or experimental source outside the upstream registry; several also contain remote defaults, dead commented implementations, or overlap existing effects.

## Adaptations

- Repointed the upstream `cn` alias to its copied source-local utility.
- Removed unrelated Next.js metadata/SEO code from that utility.
- Normalized mixed line endings and removed upstream trailing whitespace without changing behavior.
- Added native reduced-motion detection and switched every React Three Fiber canvas from `always` to `demand` under reduced motion.
- Marked all six decorative renderers `aria-hidden`.
- Capped expensive DPR paths at 1.5, capped Light Speed at 4,000 particles, and disabled Grid Bloom pointer motion under reduced motion.

## Verification

- Source-local verifier with pinned upstream checkout: passed for all 6.
- Taste Blocks draft policy and global metadata/dedupe checks: passed.
- Official shadcn registry schema validation: 1 registry, 6 items passed.
- Official shadcn registry build: all 6 item JSON files built.
- Strict TypeScript source check: passed. Dependency declarations were skipped because upstream WebGPU/Postprocessing `.d.ts` files contain unrelated unresolved globals.
- Isolated Vite production bundle: passed for a harness rendering all 6 together.
- Chrome runtime: all 6 canvases rendered with no warnings/errors; normal screenshots changed across 500 ms; reduced-motion React Fiber state was `demand` for all 6 and normal state restored to `always` for all 6.
- Narrow viewport: six 410×240 canvases, one-column rendering, no horizontal overflow.
- RTL and synthetic touch input: no warnings/errors. Keyboard behavior is not applicable because every retained effect is decorative and non-interactive.
- Cleanup: unmount removed all 6 canvases; remount restored all 6 with no warnings/errors.
