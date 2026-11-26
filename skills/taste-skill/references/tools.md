# Static material tools

Run these commands from the skill folder. Add `--palette moss-sand`, `--from page.css` or `--colours "#f5f2ee,#242822,#617451"`. CSS input reads the first definition of each palette token, including hex, rgb() and simple var() aliases. Page-level --p-* tokens take precedence. Add `--out material.css` to save CSS or `--out material.svg` to save a picture. Open `tools/lab.html` locally to compare each preset on two grounds.

| Tool | Output and places to use it | Command | Placement |
|---|---|---|---|
| Gradient | A still for a hero, share image or device screen | `node tools/gradient.mjs --preset shore --seed 4 --zone left` | Put the brightest area across from the words. |
| Grain | A repeating tile for a closing band, print specimen or image placeholder | `node tools/grain.mjs --preset colour-dither --format uri` | Inspect the tile at actual size. |
| Pattern | Marks for a diagram, section band or map inset | `node tools/pattern.mjs --preset contour --fade linear` | Let the pattern dissolve before the paragraph. |
| Shape | A responsive mask for a portrait, product picture or avatar | `node tools/shape.mjs --preset superellipse --exponent 4` | Leave enough room around the subject for the crop. |
| Shadow | Depth for a product window, menu or dialog | `node tools/shadow.mjs --preset contact` | Give depth to an object that floats above the page. |
| Surface | A material for navigation over imagery, an instrument panel or a document sheet | `node tools/surface.mjs --preset frost` | Use one material per object. |
| Divider | An edge between sections, an article break or a footer rule | `node tools/divider.mjs --preset curve --next "#f5f2ee"` | Match the filled side to the incoming ground. |

Gradient zones cover the left 38%, top 38% or middle 50% of the width; `none` leaves the field open. The reported ratio is a conservative value at the darkest or lightest grain pixel in the reading zone. Pass the JSON from `--format settings` as the params of gradient-mesh to animate the field. Shape also exports the outline with `--format path`. Each command lists every preset and control with `--help`.

## Never

- Stack glass panels.
- Apply elevation to every card.
- Stretch a grain tile over a whole picture.
- Put long text across the bright side of an unchecked gradient.
