# Fontuccine source notice

Taste Blocks copies the React runtime closure from `charbelmalo/fontuccine` at
commit `1261bd116c7915a617ed21c85adab10bba6ca1a7` under the adjacent MIT license.

The copied source has these narrow adaptations:

- relative TypeScript imports omit explicit `.ts` suffixes for normal consumer
  TypeScript configurations;
- the React entry is marked as a client module and reuses one stable empty
  configuration;
- viewport visibility also honors `document.visibilityState` and removes its
  listener during cleanup;
- the shared ticker stops when no controller owns activity, including while a
  renderer remains mounted offscreen;
- hover and pointer-proximity triggers ignore touch and pen input, which remain
  intentionally static.
- RTL text stays as untouched native text because the outline tiers do not ship
  a complex-script shaping engine.
- a failed WebGL backend creation falls through to the SVG renderer instead of
  leaving the semantic text transparent without a render layer.

No font is redistributed. The component requires caller-provided font bytes;
the preview accepts a local font file without uploading or retaining it.
