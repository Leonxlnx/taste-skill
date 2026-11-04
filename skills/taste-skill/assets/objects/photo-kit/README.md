# Photo prints

A photograph printed whole by a shader in the page's ink on its own sheet: a halftone, an engraving
or a dither. Hover (a tap on a phone) shows the photograph itself under the print. A print is one
crafted moment on a page, never the way a page shows its photographs.

| Object | Looks like | Hover |
|---|---|---|
| `photo-halftone` | a one-ink halftone: round dots on a 45° screen, clean paper in the light, solid ink in the deepest shadow | a loupe (round lens, hairline rim, soft shadow) shows the photograph in its own colours |
| `photo-engraving` | an engraved plate: diagonal lines that swell in shadow and bend over the forms, over a light wash of the photograph's colour | the lines part around the cursor and the photograph shows through |
| `photo-dither` | a three-colour grain: the photograph's deepest and most colourful colours on the paper | the photograph develops through the grain in a soft circle |

Each folder's `demo.html` (served over http) shows it in the light, dark and colour palettes.
`meta.json` lists its params, touch behaviour, fallback and cost.

## Where a print goes, and where not

- **Yes:** one moment on a software, AI, design-tool or gaming page: the page's one photograph band,
  or a feature tile whose subject is the photograph (an imaging or design tool printing a picture,
  `tint: 1` for the brand's ink). One print per page; a row of three only on a page about prints.
- **Never** over the hero photograph or a section's main photograph (`references/photos.md`): a
  print there reads as broken or low-resolution. Never on a café, guesthouse, shop or other local
  business page: those show their photographs plain.
- **Never** a caption under it that explains the effect, and no note that it is a print.

## The photograph

The client's own photograph first. Else one from the vetted library that prints well (one clear
subject, a plain ground, clear light):

```bash
node <skill>/scripts/photos.mjs list --trade office --json     # entries with "prints": true
node <skill>/scripts/photos.mjs fetch <id> --out .             # the files, credits.json and the <img>
```

On a dark page pick a darker photograph (`"tone": "dark"` or `"mid"`): a pale one prints as a large
light plate there.

## Mount

Paste the `<img>` that `photos.mjs fetch` prints into the frame. The print reads that picture (the
largest `srcset` size), keeps its `alt`, and takes its `object-position` as the subject's place.

```html
<div class="print-frame" style="aspect-ratio: 4 / 5; border-radius: var(--radius-card)">
  <img src="assets/img/photo-d88.jpg" srcset="..." sizes="(max-width: 1023px) 100vw, 50vw"
       width="1280" height="1757" alt="Cream ceramic table lamp in low sun" loading="lazy" decoding="async"
       style="object-position: 50% 40%">
</div>
<script type="module">
  import fx from './assets/effects/fx.js';
  import halftone from './assets/objects/photo-halftone/object.js';
  const el = document.querySelector('.print-frame');
  halftone.mount(el, { palette: fx.readPalette(el) });
</script>
```

- The frame needs a size (an `aspect-ratio` or a height). The print fills it, prints on the page's
  `--surface` so the frame reads as a sheet (`ground: 0` prints on `--bg`), and follows the page's
  palette (`ctrl.setPalette(fx.readPalette(el))` after a palette switch).
- `focusX`/`focusY` (0..1) override the `<img>`'s `object-position`.
- The print is there from its first frame: no entry, no dissolve, nothing moves at rest.
- A small UI card may sit on a corner of the frame (`cards.md`), never over the subject; never text
  over the print.

## Credit

Credits go in the footer's one credits line, never under the print. A printed photograph counts as
adapted:

```bash
node <skill>/scripts/photos.mjs credits --out . --adapted <id>
```

For a photograph that did not come through `photos.mjs`, `creditsBlock(entries, { adapted: [id] })`
in `photo.js` writes the same footer block from `{ id, by, page, licence, licenceUrl, source }` (one
line, "Photographs via ...", that opens the list). The client's own photograph needs none.

## When it cannot draw

Before the first frame, while the canvas is released off screen, and whenever WebGL is missing, the
shader fails to compile or link, or the photograph's host sends no CORS headers, the photograph
itself shows, greyed into the palette: a still picture, never an empty frame. The runtime also refuses
a shader that uses a GLSL ES reserved word (`flat`, `smooth`, `sample`, `filter`, `input`...) and shows
the still, because a laptop's GPU rejects what CPU WebGL (SwiftShader) compiles. `glslLint(src)` and
`photoShader(object)` in `photo.js` check a shader from Node.

## Cost

One canvas and one WebGL context per print, paused off screen and with the tab hidden, released 1.5 s
after it leaves the screen. At most 3 prints hold a context; a fourth waits (showing its still) until
one leaves, and a frame scrolling away gives way to one coming in. Count them with the page's other
WebGL effects (keep a page to 3 live contexts). The halftone and engraving render up to 2 canvas px
per CSS px so dots and lines stay sharp; every print stays under 1.5 MP of canvas. Each pixel reads
the photograph 2 to 5 times from its mipmaps; no loops.
