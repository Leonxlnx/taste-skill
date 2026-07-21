# Branding findings

## Core conclusion

A strong website brand is not a palette applied to a template. It is a controlled system that translates strategy into recognizable decisions across type, color, composition, imagery, shape, language, and behavior.

The strongest observed work shares nine properties:

1. One sharp strategic premise.
2. Three to five specific traits with explicit opposites.
3. One recognizable signature device.
4. One deliberate restraint.
5. A disciplined type system.
6. A limited role-based palette.
7. Explicit image direction.
8. Motion derived from the identity.
9. Enough flexibility to survive real content, mobile, dark mode, and reduced motion.

If the system only produces a good hero, it is decoration rather than branding.

## Translate strategy before styling

Collect or infer only from supplied evidence:

- audience;
- category and competitors;
- promise and proof;
- desired perception;
- product behavior;
- cultural or historical context;
- existing assets and constraints.

Define traits with boundaries: `precise, not sterile`; `playful, not childish`; `premium, not aloof`. Generic words such as clean, modern, bold, innovative, and premium are unusable until they produce observable choices.

Translate every trait into evidence:

| Trait | Possible visible behavior |
| --- | --- |
| Precise | disciplined anchors, controlled type metrics, literal imagery, short decisive motion |
| Human | candid people, natural texture, warmer rhythm, direct copy |
| Energetic | strong scale contrast, directional composition, concentrated chroma |
| Quiet | low palette complexity, generous but purposeful space, restrained motion |
| Technical | diagrammatic structure, exact data treatment, mono only where semantic |
| Editorial | type-led hierarchy, intentional crops, varied composition within a stable grid |

Select one signature device from the product, mark, typography, culture, process, or material. It may be a crop rule, typographic transformation, symbol behavior, verbal construction, generative rule, or physical production technique. One ownable device is stronger than pills, crosshairs, grain, marquees, glows, and grids used together.

## Identity architecture

Separate primitives, semantic roles, and component decisions:

```text
primitive value -> semantic role -> component use
violet.60       -> action.primary -> primary button background
gray.95         -> text.primary   -> body and heading text
```

Components should consume roles rather than arbitrary raw values. Themes replace role values without changing their meaning.

Define invariants and degrees of freedom:

- **Invariants:** mark usage, type roles, core colors, grid anchors, icon grammar, voice, primary signature.
- **Controlled variation:** project imagery, editorial composition, campaign color, expressive motion, feature-specific graphics.
- **Forbidden drift:** unrelated typefaces, arbitrary gradients, inconsistent icon families, random radii, new effects without a brand reason.

Marketing surfaces may be expressive. Navigation, forms, pricing controls, legal copy, error states, and task flows remain productive and predictable.

## Color system

### Roles before swatches

A useful minimum is:

- neutral canvas and surfaces;
- primary and secondary text;
- borders and separators;
- one brand/action family;
- optional supporting or editorial accent;
- success, warning, danger, and information families;
- explicit foreground partners for every colored surface;
- hover, pressed, selected, focus, and disabled states.

Do not create ten shades for completeness. Create the values real roles need.

### 60–30–10

60–30–10 is an optional check for relative visual area, not a CSS quota or branding law. Neutrals may occupy most of the actual page. Restrained interfaces often behave closer to 85–10–5 or 90–8–2.

Do not apply it mechanically to semantic states, data visualization, monochrome brands, image-led experiences, accessibility modes, or content whose color is determined by meaning. Accent scarcity matters more than the exact percentage.

### Color engineering

- Build ramps in OKLCH when useful for more predictable lightness and chroma.
- Reduce chroma rather than clipping channels when mapping out-of-gamut colors.
- Do not treat OKLCH lightness as a contrast guarantee; calculate the rendered pair.
- Supply and test sRGB fallbacks for wide-gamut colors.
- Test alpha, gradients, imagery, and overlays after compositing.
- Build light and dark themes independently rather than inverting values.
- Preserve role meaning while allowing hue lightness and chroma to change.
- Let forced-colors mode override authored color unless an equivalent accessible treatment is implemented.

WCAG 2.2 AA remains the release gate: 4.5:1 normal text, 3:1 large text, and 3:1 for essential UI boundaries, states, and meaningful graphics. Meaning cannot depend on color alone.

### Color slop

Reject the default AI-product combination of blue-black, electric violet-to-cyan gradient, neon glow, and blue-violet CTA unless the brief earns it. Also reject automatic beige/orange “taste,” black/gold “luxury,” rainbow feature cards, chroma on every surface, and the same accent applied to every section.

A palette needs a one-sentence rationale: `This hue relationship expresses X and is reserved for Y.` If no rationale exists, simplify.

## Typography

### Selection order

1. Select the body/UI face using real copy, language coverage, numerals, italics, small-size rendering, and license.
2. Define display, heading, body, UI, label, and code/data roles.
3. Add a second family only if it supplies a missing voice.
4. Prefer one family or superfamily when it covers the required contrast.
5. Test before committing: long German words, punctuation, currency, dates, diacritics, capitals, lowercase, weights, italics, and fallbacks.

Use one workhorse plus at most one characterful display companion in most sites. A third family needs a unique semantic role such as code or aligned data. Pair through deliberate contrast in width, stroke, texture, history, or serif construction—not because a pairing list says so.

### Hierarchy and reading

- Build semantic heading structure before visual sizes.
- Use a compact role scale; no universal modular ratio fits every typeface.
- Keep the same role consistent across pages.
- Start long-form measure near `65ch`; inspect within roughly 50–75 characters and below 80. CJK often needs a shorter measure around 40 glyphs.
- Start body line-height near `1.45–1.6` unitless and tune optically.
- Use start alignment for running text and avoid ordinary web justification.
- Keep body kerning and tracking close to the typeface defaults.
- Adjust tracking only for inspected display, uppercase, or special label roles.
- Keep `font-optical-sizing: auto` when supported.
- Use tabular numerals only where columns must align.
- Use real italics, weights, and small caps; avoid synthesis in brand-critical text.

The layout must survive user spacing overrides, 200% text resize, 400% zoom/reflow, localization, and font substitution. Never preserve a typographic composition with clipping, fixed-height text boxes, or forced desktop line breaks.

### Distinctive open-font directions

These are a menu, not defaults. Verify the exact binary and license before bundling.

| Direction | Open family | Useful character |
| --- | --- | --- |
| Editorial reading | [Newsreader](https://github.com/productiontype/Newsreader) | optical-size serif with real italics |
| Multilingual editorial | [Literata](https://github.com/googlefonts/literata) | screen-oriented serif with broad coverage |
| Expressive soft serif | [Fraunces](https://github.com/undercasetype/Fraunces) | personality axes and optical sizes; increasingly familiar |
| Condensed display serif | [Instrument Serif](https://github.com/Instrument/instrument-serif) | large editorial headlines; not body/UI |
| Latin–Devanagari | [Eczar](https://github.com/rosettatype/Eczar) | coherent multiscript identity |
| Broad serif coverage | [Gentium](https://software.sil.org/gentium/) | calligraphic Latin, Greek, and Cyrillic |
| Sans/mono system | [Recursive](https://www.recursive.design/) | casual, slant, weight, and mono axes |
| Expressive grotesk | [Bricolage Grotesque](https://ateliertriay.github.io/bricolage/) | width and optical-size character; increasingly familiar |
| Variable display sans | [Anybody](https://github.com/Etcetera-Type-Co/Anybody) | strong width/weight range with italics |
| Industrial labels | [Trispace](https://etceteratype.co/pages/trispace) | near-monospaced system rhythm |
| Wide culture/display | [Unbounded](https://github.com/w3f/unbounded) | Latin/Cyrillic display voice |
| Accessible workhorse | [Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/) | strong glyph differentiation |
| Multilingual workhorse | [FiraGO](https://www.ministryoffinance.is/publications/design-standard/typography/) | Latin, Greek, Cyrillic, Arabic, and Thai |
| Indian multiscript | [Anek](https://ektype.in/anek-family.html) | width and weight across ten scripts |

Common fonts are not banned. Autopilot is. Inter, Roboto, Poppins, Montserrat, Open Sans, DM Sans, Manrope, Space Grotesk, Satoshi, Playfair Display, Cormorant, Raleway, Bebas Neue, and Anton need an explicit brand reason because repeated use can erase distinction. Fraunces, Instrument Serif, and Bricolage are approaching the same risk.

### Font delivery and licensing

- Prefer WOFF2 and load only used families, weights, italics, scripts, and axes.
- Use a variable font only when it replaces several styles actually used.
- Declare real axis ranges and use semantic CSS properties for registered axes.
- Preload at most a measured critical face; include `crossorigin`.
- Use `swap` for required brand/body faces with metric-matched fallbacks; use `optional` for nonessential display faces.
- Record family, version, upstream URL, exact license, copyright, Reserved Font Names, and modifications.
- Prefer exact upstream OFL binaries for assets that ship.
- Fontsource packages fonts but does not replace their licenses.
- Adobe Fonts is a service license, not permission to copy or self-host files.
- Fontshare contains both OFL and proprietary families; inspect the exact family license.
- Trial, demo, personal-use, OS-extracted, and unattributed files are rejected.

## Logo and marks

Use supplied official assets. Preserve their proportions, clear space, background rules, and minimum size. Choose an approved variant rather than adding a glow, badge, outline, or pill behind the mark.

Do not redraw, stretch, crop, rotate, recolor, animate, or embellish a client mark without authorization. Never use a generic library icon as a company mark. If no logo exists and logo work was not requested, use a restrained text rendering and record the missing final asset.

Brand recognition should come from the whole system; repeating the logo across the page is not identity.

## Grid, rhythm, shape, and depth

- Define recurring page edges, text measures, section gaps, image anchors, and control heights.
- Use a documented spacing scale and responsive grid.
- Break the grid only when the break creates hierarchy or expresses the brand premise.
- Use optical alignment where geometric centering looks wrong.
- Define a small family of corner radii, line weights, container shapes, masks, and directional motifs.
- Radius is hierarchical; cards, buttons, tags, media, and sections do not all become pills.
- Shadows communicate elevation or separation. Do not add them as generic polish.
- Negative space communicates hierarchy; it should not manufacture empty “luxury.”
- Random absolute positioning is not art direction.

## Photography and art direction

An image brief must specify subject, behavior, camera distance, viewpoint, lighting, depth, palette, color temperature, environment, props, crop, negative space, representation, surface treatment, and rejected clichés.

Choose a stable photographic behavior and one controlled exception. Do not randomly alternate duotone, grain, blur, monochrome, rounded masks, 3D distortion, and glossy AI treatment.

Prefer credible behavior over staged handshakes, fake meetings, laptop pointing, anonymous smiling teams, or generic lifestyle stock. Stock is acceptable when selected and treated as one coherent set.

Plan responsive crops around focal points. Text over imagery is allowed only when all crops preserve contrast and a reliable quiet region. A gradient patch should not rescue uncontrolled photography.

Every visual must identify, explain, prove, demonstrate, orient, or establish tone. If it does none, remove it.

## Illustration, iconography, and data

Illustration needs one grammar: abstraction, perspective, geometry, stroke, corners, palette, shading, texture, and density. Do not mix outline, clay 3D, isometric, flat vector, and hand-drawn systems without an explicit concept.

Use one coherent UI icon family. Keep canvas, optical weight, stroke, joins, corners, fill, and metaphor consistent. Icons support scanning and comprehension; they are not default decoration for every heading. Pictograms, UI icons, illustrations, and logos are separate systems.

Data visualization begins with the question and intended takeaway. Preserve scales, units, baselines, ordering, proportional area, timeframe, and source. Use color for meaning rather than decoration and provide color-independent labels or patterns. Prefer a number, sentence, or table when it communicates better than a chart.

## Motion identity

Translate personality into two or three observable motion principles. Define functional and expressive tiers, a small timing/easing family, one primary signature, and at most one support behavior.

Functional motion handles state, navigation, menus, validation, and feedback. It is fast, quiet, and never delays the next action. Expressive motion is reserved for rare brand moments.

Derive signature motion from the mark, typography, crop system, grid, shape, or product behavior. Test it without the logo: if it fits any SaaS site unchanged, it is not a brand asset.

Reduced motion is a designed mode. Remove large translation, parallax, zoom, rotation, bounce, and ambient loops while preserving content, hierarchy, state, and feedback. Motion identity never overrides the broader animation and accessibility rules.

## Award-site observations

- DIA demonstrates kinetic type as a coherent identity system.
- Studio Freight and Ragged Edge extend one verbal construction through the site.
- PORTO ROCHA, Base, and Mouthwash keep the portfolio frame quieter than client work.
- Family Style, Park, and Studio Brot show that a two-color interface can feel more distinctive than a forced multicolor ratio.
- Strong sites use cultural, material, or product specificity rather than trend specificity.

Award status is not usability evidence. Reject JavaScript-only basic content, long intros, custom cursors that obscure meaning, hover-only content, scrolljacking, uncontrolled text-over-image, autoplay competition, motion that replaces navigation feedback, and desktop spectacle with an unconsidered mobile stack.

## AI execution gate

Before creating the brand direction, the AI should be able to state:

1. Audience, category, promise, proof, and desired perception.
2. Three specific traits and their opposites.
3. One signature device and one restraint.
4. Typeface roles, real font candidates, and license status.
5. Semantic color roles and tested contrast.
6. Grid, text measure, spacing rhythm, and density.
7. Photography or illustration grammar.
8. Icon family and usage rule.
9. Voice traits and prohibited clichés.
10. Motion principles and reduced-motion behavior.
11. How the system handles a hero, dense content, forms, mobile, dark mode, and errors.

If these answers are missing, use a restrained provisional foundation and visible placeholders. Do not hallucinate a full identity from fashionable effects.
