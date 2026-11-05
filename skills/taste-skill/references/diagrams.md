# Diagrams

`assets/diagrams/diagram.js` draws a node-and-line visual for a card panel (about 560 by 340) or a
section (1200 by 560) from a small JSON spec. `presets.json` holds 27 ready specs, each tagged with the page
kinds it suits (`types`: software, tech, gaming, product, service); `demo.html` shows them in feature cards, light and dark
(`?type=gaming`); `lab.html` is the tool to build one (below).

## When a diagram, when a UI fragment

- A diagram, when the point is how things connect: the tools it reads from, one input split into
  parallel jobs, many sources into one place, two systems in sync, steps in order, regions.
- A UI fragment (`assets/ui`), when the point is what the user sees or does: a drafted reply, a
  calendar, a dashboard. Never a diagram of a screen.
- One diagram a section, two a page at most (tech; a product or service page one, held still). A
  place page has none. On a gaming page a diagram shows a system of the game (matchmaking, saves,
  stores), never in place of the game's own pictures.

## Pick a layout and a preset

| layout | shows | presets |
|---|---|---|
| `hub` | a centre and its tools; with `children` a mind map, or a web with `"shape": "radial"` | hub-tools, hub-branches, hub-web, hub-stack (tech), hub-stores (gaming) |
| `ring` | logos or regions on an orbit | ring-apps, ring-regions, ring-edge (tech), ring-servers (gaming) |
| `tree` | one thing branching out | tree-orders, tree-release (tech) |
| `lanes` | one input, a core, parallel lanes (three threads) | lanes-agent, lanes-media, lanes-deploy, lanes-render (tech), lanes-matchmaking (gaming) |
| `fanin`, `bowtie` | many into one; and out to many | fanin-warehouse, fanin-telemetry (tech), bowtie-events, bowtie-model (tech) |
| `sync` | two systems, records crossing | sync-crm, sync-saves (gaming) |
| `timeline` | steps done in turn | timeline-onboarding, timeline-season (gaming) |
| `grid` | files into a pipeline | grid-documents, grid-assets (gaming) |
| `free` | your own nodes and edges | free-approval |

Filter by kind: `dg.presets()` gives the object; keep the ones whose `types` has the page's kind. Gaming and tech pages take the tech
and gaming presets with pulses; a product or service page takes at most one, held still.

```html
<link rel="stylesheet" href="assets/diagrams/diagram.css">
<div class="panel"><div class="dg" data-diagram="lanes-agent"></div></div>
<script type="module" src="assets/diagrams/mount.js"></script>
```

Copy a preset into `data-diagram='{...}'`, then rename every label, icon and number to the client's own. A label with an apostrophe
or a quote (`it's`) ends a single-quoted attribute, so then put the spec in a script inside the element:

```html
<div class="panel"><div class="dg" data-diagram><script type="application/json">{"layout": "hub", ...}</script></div></div>
```

A spec that does not parse logs a `console.error` and leaves only the names it could read.

## The builder page (the tool for building one fast)

Open `assets/diagrams/lab.html` over http. Pick a page kind and a preset, edit the JSON (it redraws while you type) or use the controls
(ground, light, line shape, cycle 2.5 to 4 s), switch card, section, phone and light, dark, restart the loop, then copy the
markup and the icon line. Inside a card it shows the real thing, never a mock-up. A new diagram is a preset plus the client's words;
`free` takes nodes at fractions of the box and the edges you list.

## Icons: one resolver, run it last

`diagram.js` reads icon files and nothing else: no CDN, no tinting, no Simple Icons call at runtime. From the site root:

`node <skill>/scripts/icons.mjs scan index.html --out assets/icons`

fetches every id the page's diagrams name (curated short names such as `gmail`, `steam`, `google-docs`; `logos:`, `file:`, `si:` ids; `ui:` glyphs).
Colour marks come from the logos set in full colour; where none exists (Google Docs, Sheets, Slides) the Simple Icons mark in its brand hex,
painted by `icons.mjs`. An icon that is missing shows the name's first letter, and the console says
`diagram.js: N icons are not in .../assets/icons ...` with the fetch line: run it. A finished page has no such line.
Marks that are mostly violet (Stripe, Twitch) are drawn in the text colour, black marks take the ink, a wordmark gets a 2:1 slot and its
tile becomes a pill: all decided by `icons.mjs` and baked into the file (`data-ic`). `data-icon-base` on the element or around it
moves the folder.

## Motion: one cycle of 2.5 to 4 s

- A diagram card's pulse is its own loop (not one per card group). The program is laid out as a ripple: each spoke, branch or route
  starts a beat after the one before it (0.24 to 0.5 s, the stagger), and the whole program is then fitted to ONE cycle of 3.2 s
  (`"motion": {"cycle": 2.5..4}`), the lines fading in the rest. `d.T` is always 2.5 to 4 s. It repeats.
  Below the hero two loops never share a screen: beside a looping fragment one of the two holds (`motion.md`).
- It restarts from its first beat when the pointer enters the card (mouse and pen) or focus moves into it by keyboard.
- It runs only on screen. On a phone (under 640px) and under reduced motion it holds one still, the busiest moment; `"pulse": "none"`
  holds it too. `data-dg-still` holds it by hand and plays it while the pointer is on the card. `data-ui-still` does not hold a
  diagram. A loop that runs gets the pause disc.
- The light is a gradient comet with a glow and a bright head (`"pulse": "dot"` is the head alone). The accent is only the light
  and what it reaches; lines are hairlines; the core is an ink tile. The card never moves, nothing starts on scroll.
- Grounds vary by default (`rings` round a hub, `none` under an orbit, a timeline or a sync, `dots` for flows; the diagram that leads
  a section adds `glow`); `ground` sets it. On kind other (the one still diagram of a product or service page) set
  `"ground": "none"` and `"motion": {"pulse": "none"}`: pattern, glow and pulses are tech only. Size: a flat drawing takes the next size up when that fits; `"size": "band"` or `"card"` forces it.
- Lines: hub spokes are straight rays from the core's rim (`"curve": "curve"`, `"elbow"` or `"swirl"` change them); flows bend in rounded elbows.

## Labels plain

- A tool by its name (Gmail, Zendesk), a step by its result (Reply drafted, Label printed), a place by its city. One to three words.
- Real-looking numbers in `meta` (2,481, 14 ms).
- No jargon nodes ("Orchestration layer", "AI engine"): the core is called what the product calls it.
- Up to 8 spokes, up to 12 nodes in a card. Crowded means it should be a list.
- No caption under the diagram. The card title says what it shows; `alt` in the spec says it for screen readers.
- Tool marks in their own colours, never a letter in a circle. A core without an icon is a pill with its name.
