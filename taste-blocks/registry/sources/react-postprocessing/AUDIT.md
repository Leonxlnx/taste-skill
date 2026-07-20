# react-postprocessing audit

Pinned source: `pmndrs/react-postprocessing@90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c`

License: MIT, verified from the pinned repository and preserved in `LICENSE`.

## Result

- Reviewed 34 effect components.
- Retained 14 distinct React components.
- Rejected 20 effects.
- Retained only component primitives, never demos, scenes, sections, layouts, templates, screens, or dashboards.
- Every retained item installs its exact copied local closure, declares pinned runtime dependencies, has no remote asset requirement, and has a dedicated preview.

## Retained

ASCII, Bloom, Chromatic Aberration, Depth of Field, Glitch, God Rays, Grid, LUT, Outline, Pixelation, Ramp, Selective Bloom, Tilt Shift 2, and Water.

## Rejected

- BrightnessContrast, ColorAverage, ColorDepth, HueSaturation, Sepia, ToneMapping: basic color-adjustment wrappers with insufficient standalone component value.
- Autofocus: adds continuous asynchronous depth reads and duplicates the retained Depth of Field closure.
- Depth: diagnostic depth visualization rather than a polished reusable effect.
- DotScreen, Noise, ScanlineEffect, ShockWave: generic novelty filters below the retained quality bar.
- FXAA, SMAA: rendering utilities rather than user-facing components.
- N8AO: upstream source explicitly documents an unresolved disposal leak.
- LensFlare: compiled and mounted, but its authored effect produced no visible flare under isolated desktop and mobile QA, so it did not earn inclusion.
- SSAO: legacy normal-pass integration with an error-object fallback and higher closure cost.
- Texture: requires a caller-supplied image asset.
- TiltShift: duplicate older wrapper; TiltShift2 is the stronger implementation.
- Vignette: basic edge filter and overlaps the existing blur-vignette family.

## Adaptations

- Added explicit Next.js client boundaries.
- Rewrote the implicit `wrapEffect` arrow return as an explicit return so React refresh transforms cannot turn the factory into `undefined`.
- Removed `JSON.stringify(props)` from `wrapEffect`; Three.js values can be circular after mounting and previously crashed on a later React render.
- Capped the composer default at four multisamples and added composer/effect cleanup where upstream suppressed automatic disposal.
- Added SSR-safe ASCII texture creation.
- Disabled temporal glitch, outline pulse, and water distortion under reduced-motion preferences.
- Preview canvases cap device pixel ratio at 1.5, use no remote assets, pause continuous rendering for reduced motion, and provide accessible fallback labels.
