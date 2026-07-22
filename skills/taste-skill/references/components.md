# Component Selection and Integration

Use components as expressive or functional material inside a resolved section layout. Do not let a catalog determine the page architecture.

## Contents

1. [Start from the role](#1-start-from-the-role)
2. [Match the section and content](#2-match-the-section-and-content)
3. [Build an attention hierarchy](#3-build-an-attention-hierarchy)
4. [Adapt instead of reskinning](#4-adapt-instead-of-reskinning)
5. [Expressive component guidance](#5-expressive-component-guidance)
6. [Source and license gate](#6-source-and-license-gate)
7. [Dependency and architecture gate](#7-dependency-and-architecture-gate)
8. [Responsive and accessibility gate](#8-responsive-and-accessibility-gate)
9. [Final selection questions](#9-final-selection-questions)

## 1. Start from the role

Name what the component must do before choosing it:

- navigate or disclose;
- collect input;
- demonstrate a product or process;
- present media or work;
- compare states or options;
- provide feedback;
- establish a focal visual moment;
- add atmosphere without carrying information.

Prefer the simplest component that fulfills the role and the brand direction. A plain link, list, image, or text block is often correct.

## 2. Match the section and content

Select a component only after the section job, copy, evidence, and layout grammar are known. Test it with realistic content lengths and media ratios.

Good adaptations include:

- a card whose surface, type, crop, and interaction follow the brand system;
- a product visual that changes with a How It Works step;
- a comparison control that exposes real differences;
- a work tile whose hover reveals useful project information;
- a navigation preview that helps choose a destination;
- a shader or generative field that supplies a controlled background or focal object;
- text motion that reinforces a meaningful phrase or state change;
- an image treatment that communicates category, sequence, or relationship.

Reject a component when it requires fake data, redundant copy, an irrelevant interaction, or a visual language that conflicts with the page.

## 3. Build an attention hierarchy

Assign each component one of three attention levels:

- **Foundation:** quiet controls, links, text, lists, fields, and ordinary media.
- **Support:** designed cards, galleries, tabs, accordions, diagrams, or contextual interactions.
- **Focal:** shaders, spatial scenes, expressive text, cinematic media, or a signature interaction.

Let foundation components support usability, but do not count them as substantial component integration. Use focal components selectively and place them where the page argument benefits. Do not make every card, heading, cursor, and background compete.

For a complete studio-grade site, every major section needs a deliberate visual carrier and the page should contain several substantial systems. Plain buttons, checkboxes, inputs, static text, ordinary accordions, unmodified cards, and generic load reveals do not qualify. Substantial systems include shaders, generative fields, meaningful text motion, spatial media, advanced galleries, interactive navigation, product demonstrators, gesture systems, cinematic transitions, and live diagrams when they serve the content.

One expressive cluster may contain several coordinated pieces when they behave as one idea. Several unrelated effects in the same viewport are not one cluster.

## 4. Adapt instead of reskinning

Change the component at the level of its design logic:

- map colors, type, spacing, radius, border, depth, and motion to project tokens;
- adjust density and hierarchy for the real content;
- align its internal grid with the section grid;
- replace demo imagery and copy with verified project material;
- simplify or remove features the section does not need;
- preserve the component's accessible behavioral primitive;
- make its loading, empty, error, pending, active, focus, and disabled states coherent.

Changing only the accent color or corner radius is not enough when the upstream component has a recognizable house style.

## 5. Expressive component guidance

### Shaders, canvas, and WebGL

Use them for material, depth, atmosphere, data, or a meaningful product metaphor. Keep essential text and controls in semantic HTML above or beside the canvas.

- Provide a static fallback.
- Pause work offscreen and when the document is hidden.
- Respect reduced motion and constrained devices.
- Control resolution, frame rate, texture size, and initialization cost.
- Do not block first content paint.
- Keep pointer interaction optional rather than required for comprehension.

### Gradients, glows, and texture

Derive them from the brand palette and surface logic. Use them to direct attention, create depth, improve media blending, or establish a recognizable material. Avoid generic purple-blue glow fields and effect stacking without a physical or compositional explanation.

### Text animation

Keep text available as one semantic phrase. Animate a meaningful transition, emphasis, state, or reveal—not every heading.

- Avoid per-character chaos for ordinary reading copy.
- Preserve line breaks or allow safe reflow.
- Do not make the visitor wait for the sentence.
- Provide a static reduced-motion state.

### Cards and tiles

Use a container when grouping, interaction, selection, or elevation is real. Otherwise use whitespace, alignment, or a simple divider.

Vary card structures from the content: media-led, text-led, metric-led, interactive, comparison, or navigation. Do not place unrelated content into equal rectangles only to complete a grid.

### Carousels, marquees, and continuously moving media

Use only when sequence, overflow, or ambience justifies them. Keep controls available, pause behavior clear, and important content reachable without timing. Do not hide weak information architecture inside auto-advance.

### Spatial and pointer interactions

Use magnetic, tilt, drag, spotlight, parallax, or cursor-linked behavior only when the input relationship is understandable and optional. Provide keyboard and touch equivalents for the function, even when the decorative response differs.

## 6. Source and license gate

Before copying or installing a third-party component:

1. verify the exact repository, commit or version, file paths, and license;
2. preserve required copyright, license, and NOTICE material;
3. verify assets, fonts, icons, photos, videos, logos, and trademarks separately;
4. record modifications when the license requires it;
5. reject unknown, source-available-only, non-commercial, no-derivatives, restricted marketplace, SSPL, Commons Clause, GPL, or AGPL material for a permissive public catalog unless the project has made a deliberate compatible decision;
6. never expose paid source, registry keys, secrets, or restricted assets in a public repository.

Attribution does not repair an incompatible license. A component being visible in a browser does not make its source reusable.

## 7. Dependency and architecture gate

- Check the existing package manifest before importing.
- Prefer existing primitives and the smallest capable dependency.
- Do not mix several component systems for the same behavioral layer.
- Keep expensive components isolated, lazy, and absent from unrelated routes.
- Keep one owner for animated properties and continuous input.
- Preserve server rendering and first paint where the stack supports them.
- Avoid replacing the project architecture to accommodate one decorative component.

## 8. Responsive and accessibility gate

- Test narrow mobile, wide mobile, tablet, laptop, and large desktop.
- Prevent overflow, clipped focus, offscreen controls, and fixed-height text clipping.
- Use semantic HTML and established accessible primitives for menus, dialogs, tabs, accordions, carousels, and forms.
- Make every action keyboard reachable with visible focus.
- Manage focus for opening layers, restore it on close, and support Escape where expected.
- Do not hide essential information behind hover, color, animation, or motion.
- Preserve usable targets and reading order when the section recomposes.

## 9. Final selection questions

Before keeping a component, ask:

1. Does it perform a real role in this section?
2. Does it work with the real content and states?
3. Is it coherent with the brand and neighboring components?
4. Is its attention level appropriate for this point in the page?
5. Can its expressive layer fail without losing content or action?
6. Is its source and every bundled asset legally usable?
7. Does it remain usable on keyboard, touch, reduced motion, and small screens?
8. Would removing or simplifying it improve the section?
