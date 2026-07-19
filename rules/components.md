# Component Rules

Rules for Taste Blocks and for component selection in Taste Skill v2.

## Purpose

- Build for landing pages, portfolios, and normal marketing websites in this phase.
- Choose blocks because they fit the brief, content, and page sequence. Never insert components to meet a quota.
- Prefer a small number of strong, compatible components over a page that demonstrates every available effect.
- Keep Taste Blocks Free public. Keep future Pro source original, private, and separate.

## Catalog entries

- A color, theme, font, radius, shadow, timing, reversed alignment, or copy change is a variant, not a new component.
- A new entry must materially change content hierarchy, responsive composition, interaction, renderer, or user task.
- Every entry needs working source, a live demo, useful documentation, responsive behavior, accessibility behavior, and provenance.
- Every animated entry needs a useful reduced-motion state.
- Do not advertise generated or planned entries as finished components.
- Counts must come from the validated registry manifest, never marketing copy.

## Sources and licenses

- Original work is the default.
- Do not copy code or close expression from a public demo without an explicit compatible license.
- Do not put React Bits Pro, paid templates, restricted marketplaces, or Commons Clause source into the public registry.
- Do not use React Bits Free source while its official license signals conflict. Written permission or an unambiguous compatible license is required.
- Attribution is not permission.
- Pin the exact repository, tag or commit, path, license, notices, assets, dependencies, and modifications for every adapted entry.
- Preserve full MIT notices for copied substantial portions.
- Preserve Apache-2.0 license and NOTICE content and mark modified files.
- Treat fonts, icons, photos, videos, illustrations, logos, and trademarks as separate materials.
- Remove demo brands and replace sample assets unless their rights are recorded.
- Reject unknown, no-license, non-commercial, no-derivatives, Commons Clause, SSPL, GPL, and AGPL material by default.

## Architecture

- Use the shadcn registry format as the initial distribution contract. Do not invent a second package format.
- Keep catalog code, preview wrappers, and distributable component source separate.
- Keep a component's dependencies minimal and explicit.
- Use one behavioral primitive system inside a block. Do not mix several compound UI systems.
- Prefer native CSS, SVG, and browser APIs; add Motion, Canvas, or WebGL only when the result needs them.
- Keep heavy effects lazy, isolated, pausable, and absent from the initial bundle when offscreen.
- Never expose secret keys in source, generated files, logs, or examples.

## Design quality

- A component must work with real content lengths, not only its demo copy.
- Design the information hierarchy before decoration or motion.
- Avoid decorative eyebrows, section numbers, fake status labels, random coordinates, ornamental crosshairs, and meaningless text.
- Do not put tags or pills over images without a real content or control purpose.
- Do not force every block into rounded cards, equal columns, bento grids, split headers, or alternating image-and-text rows.
- Do not repeat the same layout family under different names.
- Use spacing and alignment to group content before adding borders, panels, or dividers.
- Use media, type, color, and motion as part of a coherent direction rather than independent effects.
- Placeholder data must be visibly replaceable. Never invent clients, quotes, metrics, awards, or product claims unless the brief asks for fictional demo content.

## Motion and effects

- Every animation must support hierarchy, continuity, feedback, orientation, or storytelling.
- Do not add animation only to make the component look more expensive.
- Text must remain readable and available as one complete phrase to assistive technology.
- Pointer effects must also work without hover and must not block clicking, selecting, or scrolling.
- Do not scrolljack by default. Use controlled scroll sequences only when the narrative clearly benefits and normal navigation remains available.
- Limit continuous motion, pause offscreen work, and stop work when the document is hidden.
- Provide static fallbacks for Canvas and WebGL. Decorative renderers are `aria-hidden`.
- Respect `prefers-reduced-motion` without leaving blank or broken layouts.

## Accessibility

- Use semantic HTML and established accessible primitives for menus, dialogs, tabs, accordions, carousels, and forms.
- All actions work with keyboard and expose a visible focus state.
- Icon-only controls have accessible names.
- Opening layers manage focus; closing them restores focus; Escape works where expected.
- DOM order stays logical when the visual layout changes across breakpoints.
- Error messages identify the field and the fix. Demo forms state clearly when they do not submit.
- Do not hide essential information behind hover, animation, color, or motion.
- Support zoom, touch targets, forced colors, reduced motion, and high-contrast text.

## Responsive behavior

- Test at narrow mobile, wide mobile, tablet, laptop, and large desktop widths.
- Desktop navigation and CTA labels stay on one line when enough width exists.
- Components recompose for smaller screens instead of merely shrinking.
- Avoid fixed heights around unknown text and user-provided media.
- Prevent horizontal overflow, clipped focus rings, and offscreen controls.
- Do not rely on precise absolute positioning for core content.

## Performance

- Ship no continuous animation loop that is invisible or offscreen.
- Keep at most one expensive WebGL preview active in the catalog.
- Lazy-load previews and heavy dependencies near the viewport.
- Avoid layout animation that causes cumulative layout shift.
- Use transforms and opacity for frequent animation when possible.
- Clean up observers, listeners, animation frames, timers, and rendering contexts.
- The catalog shell must remain usable if a preview fails.

## Review gate

Before an entry is marked ready:

1. Validate its manifest and provenance.
2. Run type, lint, build, registry, and focused behavior checks.
3. Test keyboard, focus, reduced motion, mobile recomposition, and long content.
4. Inspect the actual generated registry file and third-party notices.
5. Visually compare it against adjacent entries and remove near-duplicates.
6. Confirm that the title and description say what the component actually does.
7. Confirm that no demo claim, asset, dependency, or license is misleading.
