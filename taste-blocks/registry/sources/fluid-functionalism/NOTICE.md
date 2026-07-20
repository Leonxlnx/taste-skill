# Fluid Functionalism source note

The three draft items are copied from Fluid Functionalism at commit
`a6c95ed6df721ef7bd8f18a556b95008c6f51c82` under the included MIT license.
Every shipped TypeScript file maps to its immutable upstream path and SHA-256
inside `drafts.json`.

The registry-level `cssVars` and spinner keyframes are integration metadata,
adapted from these files at the same commit:

- `registry.json` — SHA-256 `895e365449fe35aebf3284b16413fb530cf2c1526f0ede55563886029d397088`
- `app/globals.css` — SHA-256 `814942e9f740faf9a568709aba101591ee34892ef6607b7d1300cc51d32d8a46`

The adaptation keeps only variables used by the retained components, replaces
the upstream dark shadow helper variables with equivalent self-contained
values, and namespaces the spinner keyframes. It does not include site styles,
documentation, remote assets, or a page-level composition.
