# Catalog Site

Taste Blocks is a clean component product, not a page-layout gallery. The site stays self-contained inside `taste-blocks/` so it can later move to a private repository.

## Direction

- Next.js App Router and Tailwind v4.
- One restrained light theme using off-white, off-black, and one saturated accent.
- Full-viewport hero with one short headline, one short sentence, and one primary action.
- A small number of high-craft motion moments. No effect stack, logo wall, testimonials, decorative labels, or filler copy.
- Component previews define their own bounded visual surface; the catalog shell remains quiet.
- React Bits Pro is blocked from the site and registry unless its owner gives written permission for this competing component-library product. A paid license and private source alone do not satisfy the current terms.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Full-screen introduction, featured components, categories, and direct catalog entry. |
| `/components` | Searchable and filterable complete component registry. |
| `/components/[slug]` | Isolated live preview, source, install, API, dependencies, accessibility, and provenance. |
| `/docs` | Registry, CLI, MCP, customization, and contribution documentation. |
| `/sources` | Searchable source and license ledger. |
| `/pricing` | Honest Free plan and an unpriced Pro placeholder for later. |

## Catalog behavior

- Search title, purpose, category, runtime, source, dependency, and license.
- Keep filter state in the URL.
- Render every preview in an isolated route or iframe.
- Lazy-load previews and pause continuous work offscreen.
- Show source and license on every result.
- Show install commands only for verified registry artifacts.
- Keep the shell usable when an individual preview fails.

No route, heading, filter, or description should call a component a block.
