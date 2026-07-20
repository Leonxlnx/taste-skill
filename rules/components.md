# Component Rules

Rules for Taste Blocks Free and the component-selection phase of Taste Skill v2.

## Scope

- Build reusable React components only.
- Exclude complete website sections, layout blocks, page templates, dashboards, application screens, and starter sites.
- Do not create replacement components in this phase. Copy or minimally adapt verified permissive source.
- Original code is limited to catalog infrastructure, preview wrappers, validation, registry generation, and MCP integration. It does not count toward the component total.
- Keep future Taste Blocks Pro source original, private, and separate.

## Counting and deduplication

- A color, theme, font, radius, shadow, size, timing, alignment, copy, or framework-port change is a variant, not a component.
- The same upstream component appearing in several repositories counts once.
- Shared helpers, hooks, fixtures, previews, and wrappers do not count.
- Every counted entry needs a distinct behavior or public component contract, working copied source, live preview, documentation, provenance, and verified registry artifact.
- Counts come from the validated manifest only.

## Sources and licenses

- Pin the exact repository, commit, paths, license, notices, assets, dependencies, and modifications before importing.
- Preserve MIT notices for copied substantial portions.
- Preserve Apache-2.0 license and NOTICE content and mark modified files.
- Treat fonts, icons, photos, videos, illustrations, logos, and trademarks as separate materials.
- Remove upstream demo brands and replace assets only with separately verified material.
- Reject unknown, no-license, non-commercial, no-derivatives, Commons Clause, SSPL, GPL, AGPL, paid-template, and restricted-marketplace material by default.
- Attribution does not repair an incompatible license.
- React Bits Pro is never copied into the public registry. Site-only use requires a separate positive license decision and a local uncommitted key.

## Architecture

- Use the shadcn registry format as the distribution contract.
- Keep catalog code, preview wrappers, and distributable source separate.
- Keep dependencies minimal and explicit.
- Use one behavioral primitive system inside a component.
- Keep expensive previews lazy, isolated, pausable, and absent from the initial bundle.
- Never expose secret keys in source, generated files, logs, examples, or commits.

## Quality

- A component must work with realistic content, not only its fixture.
- The imported interaction must be complete, not a screenshot recreation.
- Motion must support feedback, state, continuity, hierarchy, or orientation.
- Text stays readable and available as one semantic phrase.
- Pointer interactions also work with keyboard, touch, and no hover.
- Continuous work pauses offscreen and when the document is hidden.
- Canvas and WebGL components provide static fallbacks and stay decorative to assistive technology when appropriate.
- Respect reduced motion without leaving blank or broken output.
- Reject visually weak source instead of redesigning it into a new component.

## Responsive and accessibility gates

- Test narrow mobile, wide mobile, tablet, laptop, and large desktop.
- Prevent horizontal overflow, clipped focus, offscreen controls, and fixed-height text clipping.
- Use semantic HTML and established accessible primitives for menus, dialogs, tabs, accordions, carousels, and forms.
- Every action works with keyboard and has visible focus.
- Opening layers manage focus; closing restores it; Escape works where expected.
- Do not hide essential information behind hover, animation, color, or motion.

## Commit gate

Before every commit:

1. Confirm the batch contains components only.
2. Confirm every imported file has exact provenance and a compatible license.
3. Run duplicate detection and reject ports or cosmetic variants.
4. Run manifest, type, build, registry, and focused behavior checks.
5. Inspect generated registry files and notices.
6. Review visible quality and remove weak entries.
7. Confirm no secret, paid source, layout block, or unsupported claim is staged.
8. Push only after the commit still matches the user's stated direction.
