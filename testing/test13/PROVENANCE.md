# Provenance

## Generated raster

- `public/coastal-house.png`
- Built-in OpenAI image generation tool, 2026-07-22.
- Prompt: wide editorial architectural photograph of a low concrete and weathered-timber house embedded in a cold rocky coast at dawn; no people, text, logos, watermarks, fantasy structures, or resort clichés.

## Taste Blocks

- Exact registry id: `animata-disclose-image` (`@taste/animata-disclose-image`)
- Status/type: verified `registry:component`
- Source: Animata, `animata/image/disclose-image.tsx`, revision `de9aabb0eed14e0db944bb07720961ddc450c672`
- Upstream: https://github.com/codse/animata/blob/de9aabb0eed14e0db944bb07720961ddc450c672/animata/image/disclose-image.tsx
- License: MIT, Copyright (c) Animata
- Local adaptation: copied the paired-panel image disclosure into `components/disclose-image.jsx`; removed Tailwind and utility dependencies, mapped styling to local CSS, retained the load-triggered reveal and reduced-motion fallback, and added a labeled click/tap toggle so the component remains visibly interactive.
