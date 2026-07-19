# Catalog Site

Taste Blocks should feel like a specimen catalog, not a generic SaaS landing page. Open directly into the product. Do not add a logo wall, testimonials, pricing teaser, FAQ, oversized sales claim, decorative pretitle, or vague copy.

## Direction

- Neutral catalog shell; each demo may own its palette.
- Off-white canvas, near-black ink, quiet rules, and one deep red interface accent.
- Square or lightly rounded surfaces rather than rounded-card monoculture.
- Thin structural lines, varied spacing, left-aligned text, and real hierarchy.
- Demo frames fit the component instead of forcing everything into equal cards.
- Catalog motion is restrained; expressive motion remains inside the previews.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Catalog-first home with 24 to 32 live demos. |
| `/blocks` | Searchable and filterable complete registry. |
| `/blocks/:slug` | Full demo, controls, install, API, accessibility, performance, and provenance. |
| `/collections/:slug` | Curated compatible groups for a specific site direction. |
| `/docs` | Installation, customization, composition, and contribution. |
| `/sources` | Searchable provenance ledger. |
| `/license` | Taste Blocks license and third-party boundaries. |
| `/changelog` | Releases, additions, provenance changes, and breaking changes. |

## Homepage

1. Compact header with Blocks, Collections, Docs, Sources, GitHub, and search.
2. Direct masthead with the real verified count and main search.
3. Four composed systems that show compatible blocks working together.
4. Six to eight text and editorial motion demos.
5. Four to six controls and feedback demos.
6. Six to eight CSS, Canvas, or shader-like fields.
7. Eight substantial page blocks.
8. Short source and license explanation.
9. Useful footer.

The first four specimens may initialize immediately. Other demos load near the viewport and pause offscreen. At most one WebGL demo runs at once.

## Catalog behavior

Search title, purpose, category, technology, source, and dependency. Keep filters in the URL.

Useful filters:

- category;
- compatible website section;
- runtime: CSS, DOM, Canvas, or WebGL;
- dependency;
- license;
- original, adapted, or dependency-backed;
- reduced-motion support.

Every result exposes its origin and license without requiring a detail-page visit. Detail pages include responsive preview sizes, editable controls, install action, dependencies, accessibility behavior, browser and performance notes, exact provenance, notices, and compatible blocks.
