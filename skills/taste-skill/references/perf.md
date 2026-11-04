# Performance budget

Run `node scripts/perf.mjs <site/index.html>` (Node 22 or later) on every finished page. It loads the page in headless CPU Chrome at 1440 and 390 wide, waits until the effects near the viewport are mounted, scrolls to the bottom and prints PASS, WARN or FAIL. Fix every FAIL. `--json <file>` also writes the result to that file; `--runs N` sets the number of timing loads (default 3).

Reading the numbers:

- **Timing is a median of 3 loads** with the spread printed (`runs 3, 33..161`). One load on a CPU is noise; a wide spread means the host was busy.
- **Host load** is sampled before and after. Above 50% the check says so and caps timing at WARN: rerun when the machine is idle before believing a timing FAIL.
- **FCP and LCP are CPU-rendered.** Compare pages with each other, never with field data.
- **WebGL off is a proxy, not a verdict.** SwiftShader runs shaders on the CPU and would swamp the main thread, so long tasks and blocking time come from loads where every WebGL piece shows its still fallback. That is different work from the shader: shader compile and link on a real GPU is not measured, and the INFO line with WebGL on is for orientation only.
- Counts (images, contexts, modules) and bytes are exact; they do not depend on host load.

| Check | WARN | FAIL |
|---|---|---|
| Transfer (text gzipped) | above 1500 KiB | above 3000 KiB |
| Images total / largest single image | above 1200 / 350 KiB | above 2400 / 700 KiB |
| JS parsed / CSS | above 450 / 120 KiB | above 900 / 250 KiB |
| Requests | above 60 | above 110 |
| Font families / files / bytes | above 2 / 4 / 160 KiB | above 3 / 6 / 320 KiB |
| `<img>` without width and height (or CSS aspect-ratio) | 1 to 3 | 4 or more |
| `<img>` below the fold and not lazy | 1 to 3 | 4 or more |
| Oversized images, `<img>`, CSS background and SVG (natural over 2.2x the shown width) | 1 to 3 | 4 or more |
| Photos as CSS or SVG background below the fold (cannot be lazy) | 1 to 3 | 4 or more |
| WebGL contexts live (load, bottom, peak) | | above 4 (hard cap) |
| WebGL contexts made over the whole scroll | above 12 | above 24 |
| Long tasks / blocking time, median, WebGL off | above 8 / 1.5 s | above 20 / 4 s |
| FCP / LCP, median | above 2.5 / 4.5 s | above 4.5 / 8 s |
| Layout shift, median | above 0.1 | above 0.25 |
| Effect, object or component module loaded, never mounted | 1 or 2 | 3 or more |
| Broken request, sideways overflow | | any |

Sizes are KiB (1024 bytes). The 2.2x rule already covers a 2x screen; a photo that is also upscaled (natural under 0.75x shown) warns. "Never mounted" counts entry files only (`effect.js`, `object.js`, `component.js`, a ui `fragment.js`); shared helpers such as `photo-kit` never count. An object has no marker, so objects are judged by count: more object modules loaded than canvases or fallback hosts drawn.

## Every visual renders

A visual that shows only its ground (a blank canvas, a photograph never loaded, a reveal that never fired, a picture caught half drawn) is a fault at every width (house rule 2): every picture slot has a real `src`, `width` and `height`; `consistency.mjs` `empty-visual` and `gl-fallback` find the rest, system.js outlines a failed visual in red, `shoot.mjs` names pictures still loading.

## Usual fixes

- **WebGL cost (tech only; 0 contexts on kind other).** At most 4 live contexts per page (house rule): the one effect or big scene plus a dealt moment's own canvas, each showing a poster first, mounted at load or lazily as its section nears the screen (an IntersectionObserver only mounts, it never starts or stops visible motion: `motion.md`). One sample per CSS px or less (0.75 when large), about 1.5 megapixels, pixel ratio 1.5 at most; noise, particles and ray marching at half resolution and 30fps or less; drop the pixel ratio when frames take over 21 to 24ms. Every WebGL piece keeps its still when its shader fails (`effects-usage.md`). After any shader change, `lint-glsl.mjs` in `assets/objects/_print-core` and `_scenes` must exit 0.
- **Draw still grounds once.** A ground that does not move is drawn one frame, kept as a picture, its context released.
- **Fonts.** At most four font files (`layout-v4.md` section 5; perf.mjs warns above four): preload the regular and the display weight, `font-display: swap`, request only used weights.
- **Size images.** AVIF or WebP through `srcset` at 2x the shown width, never more (a full-bleed hero 2880w at 1440, 780w at 390), the hero under 400 KiB and every other photograph under 250 KiB (the check warns at 350 for one image), the page's images under 2,400 KiB at 1440 (the table's FAIL; 1,200 warns), `width` and `height` (or an `aspect-ratio`) on every one and a `--g-alt` fill while it loads. Lazy and `decoding="async"` below the first screen, never lazy in it; the hero eager with `fetchpriority="high"`. A photo below the fold is an `<img>`, not a CSS background. A place with 8 to 20 photographs stays fast this way.
- **No shift (CLS under 0.1).** Reserve space for images, nav and counters. Animate transform and opacity (colours too); `background-position` only on small text spans; never height, padding or layout. Import only modules the page mounts.
- **Scripts.** Deferred modules, no scroll listeners (the tech moments read the scroll as `motion.md` says), no layout reads in move handlers. No entry gate or loader; kind other loads no animation library and no WebGL; a real-time 3D model stays near 2 MB compressed with a poster; video ships separate phone and desktop files.
- **Ready flag.** A page may set `document.documentElement.dataset.ready = '1'` when its first screen is built; the check then stops waiting for effects to mount.
