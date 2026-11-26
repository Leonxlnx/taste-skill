# Static material tools

Prefix tool paths with the skill folder. Choose `--palette moss-sand`, `--from page.css` or `--colours "#f5f2ee,#242822,#617451"`. CSS input reads the first hex, rgb() or var() definition, preferring --p-* tokens. Save with `--out material.css` or `--out material.svg`. Compare presets offline in `tools/lab.html`.

| Tool | Output and places to use it | Command | Placement |
|---|---|---|---|
| Palette | Brand colours for a page, interface or campaign, with measured ink and action contrasts | `node tools/palette.mjs --brand "#246c56" --preset light --out brand.css` | Check the action on its actual ground. Use `--format json` for a dealer entry. |
| Device | Browser, terminal and hardware frames for a screenshot, walkthrough or transcript | `node tools/device.mjs --preset phone --out phone.css` | Nest `.device-screen` in `.ts-device`. Export the wrapper with `--format html`. |
| Grade | One photographic treatment for an essay, property gallery or product series | `node tools/grade.mjs --preset neutral-match --out photos.css` | Compare the set side by side. Cool and duotone also need the inline SVG from `--format defs`. Adjust individual exposure in stops. |
| Chart | Directly labelled SVG for a usage meter, route profile or measured comparison | `node tools/chart.mjs --preset progress-ring --values 16,31 --unit km` | Use supplied numbers. JSON via `--data file.json` accepts values, labels, unit and title. |
| Frame | Corner marks, rules and measurements for a media crop, inset panel or drawing | `node tools/frame.mjs --preset ruler --edge bottom` | Leave a gutter around the subject for the marks. Label real measurements with `--label`. |
| Scribble | A seeded pen mark for a word, margin annotation or directional cue | `node tools/scribble.mjs --preset underline --seed 12` | Mark one word on a quiet page. For the kit’s draw helper, inline the SVG from `--draw on` inside the interactive section. |
| Object | Seeded linework or planes for an abstract hero, chapter opener or cover | `node tools/object.mjs --preset orbits --seed 18 --out orbit.svg` | Give the form its own frame. For optional drift, export HTML and CSS with `--motion drift` and load kit motion. |
| Typescale | Six fluid text roles for a product page, long read or dense interface | `node tools/typescale.mjs --preset editorial --ratio 1.25` | Adjust body measure using the real face. Character counts estimate a 0.52 em average glyph. |
| Share | A link picture, publication card and favicon set | `node tools/share.mjs --name "Plane Press" --headline "Orbital studies" --icons icons --out share.svg` | Keep the page’s mark. Ring and dots support built-in PNG export without text. |
| Gradient | A still for a hero, share image or product panel | `node tools/gradient.mjs --preset organza --seed 4 --out hero.css` | Use a show preset for the picture. Reserve quiet presets for section grounds. |
| Grain | A repeating tile for a closing band, print specimen or image placeholder | `node tools/grain.mjs --preset colour-dither --format uri` | Inspect the tile at actual size. |
| Pattern | Marks for a diagram, section band or map inset | `node tools/pattern.mjs --preset contour --fade linear` | Let the pattern dissolve before the paragraph. |
| Shape | A responsive mask for a portrait, product picture or avatar | `node tools/shape.mjs --preset superellipse --exponent 4` | Leave enough room around the subject for the crop. |
| Shadow | Depth for a product window, menu or dialog | `node tools/shadow.mjs --preset contact` | Give depth to an object that floats above the page. |
| Surface | A material for navigation over imagery, an instrument panel or a document sheet | `node tools/surface.mjs --preset frost` | Use one material per object. |
| Divider | An edge between sections, an article break or a footer rule | `node tools/divider.mjs --preset curve --next "#f5f2ee"` | Match the filled side to the incoming ground. |

Show presets use four neighbouring colours. Set `--rich 0.8` or supply four hex colours with `--hues "#25608a,#4143a9,#9437af,#df88bc"`. White ink occupies the left 38%. On a light page, put .ts-gradient on its own inner panel. A hero media wrapper can supply an opaque background. Leave enough of the panel exposed to read the field at phone width. Size a menu-bar popover to its controls even inside a wide product frame. Selvedge, current, organza and drape write a PNG beside exported CSS or SVG. Keep the pair together. The SVG share frame is 1200 × 630. Show settings name the effect, palette, seed and parameters. For limb and occult, mount edge-glow on a 96px square with its 48px radius. Scale this circle to the exported ellipse radii and centre, measured as fractions of the picture. Clip it at the frame.

Quiet gradient zones cover the left 38%, top 38% or middle 50% of the width; `none` leaves the field open. The reported ratio is a conservative value at the darkest or lightest grain pixel in the reading zone. For quiet presets, pass the JSON from `--format settings` as the params of gradient-mesh to animate the field. Shape also exports the outline with `--format path`. Each command lists every preset and control with `--help`.

## Never

- Stack glass panels.
- Apply elevation to every card.
- Stretch a grain tile over a whole picture.
- Put long text across the bright side of an unchecked gradient.
