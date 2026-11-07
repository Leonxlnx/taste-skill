# Backgrounds

Better grounds come from fewer, better colours (house rule 6: "nicer backgrounds"), and on tech
from a small catalogue of grounds drawn in CSS. Every kind uses the three ground tokens; only tech
adds CSS grounds.

## The three tokens (every kind)

Section and panel grounds use `--g-main`, `--g-alt` and `--g-dark` only (system.css: the base,
`.ground-surface`, `.ground-inverse`): one to three colours down the page, footer included, in the
same order at 390. Photograph layers and the tech grounds below do not count among them.

- **`--g-main`:** white, or a tint of lightness 0.80 to 0.97 with low saturation (channel spread
  0.12 or less), taken from the client: a place's walls, paper or shopfront (the palette
  `start.mjs deal --page place --trade <trade>` deals for its trade, never one fixed off-white for
  every place; white for a shop that sells mostly online), a product's photo backdrop, warm
  greys for a service, blue-leaning or cool grey for software. It covers 55% of the page's height or
  more (60% on software and product). Never pure-white panels on a cream page.
- **`--g-alt`:** the same hue (within 20 degrees), 0.06 to 0.15 darker, never under 0.70
  (`#ffffff` to `#f2f2ef`, `#f7f3ec` to `#ede6da`). Panels, tiles, cards and at most one full band.
- **`--g-dark`:** lightness 0.05 or less: near-black (`#111` to `#1a1a1a`) or the deepest shade of
  the brand hue, never charcoal, never violet. One dark body section at most (one screen tall), at
  the page's middle or later, never right under the hero; the footer may be dark. A dark page (main
  ground 0.02 or darker) and a dark hero are for tech only.
- **The brand band** (`.ground-brand`, product and place): one section in the brand's own colour
  (from the product or the shopfront) may replace the dark band, once, in the second half. On a
  place its lightness is 0.03 to 0.60 and its saturation 0.25 or more, never a neutral near-black;
  every word on it (heading, text, label, link) takes the colour that passes 7:1, the one number: darken the brand colour until it does (`check.mjs` and `consistency.mjs` ask 7:1 for text people read and 4.5:1 for labels, so 7:1 clears both); the primary button is inverted. Otherwise
  saturated colour lives in the accent and the pictures; one mid-tone section at most, never as the
  main ground.
- Grounds change in big blocks at the section edge: never on `.wrap` or a wrapper, no border-top or
  rule between sections, no band inside a section (a box of 80% of its width or more with its own
  ground holding the heading), no inset coloured box standing in for a ground. A frame holding a
  visual is fine.

## Other kinds stay flat

Product, service and place (site-kind other): every ground and panel is a flat CSS colour and
photographs are shown as they are. No gradient (a hard-stop two-tone included), grain, paper,
halo, texture, pattern, glass, contour, canvas, `backdrop-filter`, gradient mask, or shadow or tint
on the interface. Never run `pick.mjs` for them: its `index.json` still lists grounds for product,
service and place, and those are not used. A product page with site-kind tech is dealt as tech.

## Tech: the CSS grounds

Sixteen grounds drawn in CSS (no WebGL) in `assets/backgrounds`. Link `backgrounds.css` after
`system.css` and `cards.css`; load `backgrounds.js` plain at the end of `<head>`. One class on a
section or the hero's wrapper (`<section class="section bg-halo">`); `stage` only as `<div
class="bg-stage">` around one visual card; `paper` on `<body>` and `topglow` around the nav and hero
set no tokens, the thirteen section grounds set the page tokens so cards and buttons work unchanged.
Ink keeps 7:1 and muted 4.5:1 on every palette (`check.mjs` measures it). `index.json` holds each
ground's mood, roles, pairs, avoids and sections.

- **Soft:** `mist` colour wash; `halo` light behind a heading; `ruled` fine grid on the container's
  edges, clear behind the heading; `dots` dots in the margins; `arcs` rings rising, for the close;
  `liquid` a slow mesh of colour ellipses, the only ground that moves.
- **Hard:** `grain` tint with film grain; `dusk` one tone melting into the page; `band` the lit
  ground's second tone; `field` a grainy gradient (Figma's sand tile); `photo` a photograph layer;
  `horizon` a dark band with a lit rim; `deep` near-black with a cool pool (x.ai's).
- **Deal:**

  ```bash
  node <skill>/assets/backgrounds/pick.mjs --type software --sections <the plan's ids> --mode light|dark --history .taste-skill/bg-history.json
  ```

  Hardware runs it as `--type product --kind tech`; with an effect or scene already dealt, add
  `--effect`, and leave the section that holds it (an effect hero, the `[data-visual]` section, the
  scene's section) out of `--sections`: it brings its own ground.

  Mark a section the rhythm already makes a band: `id:dark`, `id:band` (lit ground), `id:surface`.
  Build what it prints, then hold the rules: at most two dealt grounds a page beyond the tokens, each
  once, never on a card, never two strong ones as neighbours, one loud one at most, never two that
  list each other in `avoids`.
- **The effect rule:** a ground with grain, dither or texture (`grain`, `field`, `stage`, `deep`) or
  motion (`liquid`) is the page's one effect (`effects-usage.md`); with another effect dealt, deal
  again without them. `liquid` runs on a clock from load with a pause disc and holds still under
  reduced motion.
- **The lit ground** (`<html data-ground="sand|sky|sage|painting">`) is tech only: behind UI, in a
  closing band, in `footer-statement`; it is the tone of `band` and `field`.
- **Words on `photo`** sit on its calm, dark part (`--g-photo-pos`, `--g-photo-pos-m` for the
  subject); only in the hero and one closing band (`system.md`).
- **Tune:** `--g-hue` tint, `--g-k` strength, `--tone` second tone, `--halo-x`/`--halo-y`,
  `--stage-w`. Tints lean to the accent, never violet.
- A ground never changes a section's height (`layout-v4.md`); a soft one fades over 120px, a hard
  one keeps its colour on the whole box; a panel takes `bg-inset` on the `.wrap` lines.

## Tech: code-drawn grounds, how they look

Calm and specific as a studio photograph: one light, one palette, grain you notice only up close.
Colours from the tokens (`--ground`, `--ground-2`, `--ink`, `--tone`, `--tone-hi` = L +0.12,
`--tone-lo` = L -0.18), mixed in OKLCH, ground chroma under 0.12. A gradient is built light first:
a radial with four to six stops in one hue, then grain (4 to 10%); every dark gradient gets a static
dither; never a two-stop linear gradient as decoration (linear only as an edge fade inside a
visual); a two-tone seam is a hard stop. Grain only inside the one effect: one tile made at load,
never animated, never over UI, text or photographs. Recipes, all still:

- **Lit studio sweep:** behind a cut-out or a UI window: an elliptical radial (50-60% x 40-50%,
  centre 35-42% down), a faint floor bounce, grain 4-6%, a soft contact shadow.
- **Corner glow:** a dark footer, closing band or pricing card: a radial near one corner, radius
  110-130%, five eased stops so no ring shows.
- **Painterly field:** under a UI window or a closing band: four to six large ellipses in the tones,
  blurred 60-120px, drawn 10% oversize and cropped, grain.
- **Spotlight floor:** a hardware stage or a dark hero on a dark page: a light pool 70% wide, a
  blurred shadow running away from the object, side vignettes.
- **Product-colour wash:** a hardware card or model switch: a radial from below in the product's
  tint; it cross-fades on a click, never on scroll.
- **Woven tile and ordered dither:** one texture a page at most: a band, the footer, a technical
  panel.
- **Grid marks** (dots or plus signs at column crossings, 12-18% ink) only on one dark technical
  band, a data panel or the footer, never over text. A hairline ledger (header cells, a line-up,
  footer frame) is 1px repeated sibling rules at 12-15% ink, never between sections.
