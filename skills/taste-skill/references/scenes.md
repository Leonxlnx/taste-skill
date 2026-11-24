# Big scenes

Deal at most one scene. About one page in three draws one when its material, tone, role and context budget fit. One moment is the usual deal, with room for a second from seven sections. A page can use zero of either. Keep the first action reachable.

```sh
node <skill>/scripts/moments.mjs pick --page product --sections 7 --carry photos,list --has photo,product,pictures:6 --scene deal
```

`--carry` names what the brief supplies. Use `words` for an existing statement, `list` for named items, `photos` for the client's photographs, `steps` for a real sequence and `figures` for measurements. `--has` names the files or special material, including a product photograph, UI, film, logo, site, route or object. Supply `archive,pictures:N` for a large collection. Use the exact count whenever you know it. Each scene folder’s `meta.json` gives its content, needs, exclusions and phone treatment.

## What fits

| Scene | Material to bring |
| --- | --- |
| closing-line-in-a-field-of-words | At least sixteen real names and a closing line. |
| closing-object-turns | A product photograph and the closing words. |
| descend-through-weather | Two views of the real site, high and low. |
| dither-field-opener | The page’s own opening words. |
| fly-into-the-shape | The client’s mark and a photograph it can frame. |
| one-figure-reforms | A product interface, a sequence and real figures. |
| page-lifts-off-closing-picture | A closing photograph. |
| panels-reproportion-on-arrival | Four photographs and four names. |
| powers-of-ten-pullback | A product interface with real levels of detail. |
| scatter-and-lock | One photograph whose subject reads when assembled. |
| scroll-turned-drum | Eight names and their eight pictures. |
| seam-pocket-gathers-the-words | Eight named items and a closing statement. |
| shaped-edge-ground-change | Two related photographs. |
| shaped-window-over-fixed-world | A wide photograph of the client’s site. |
| sheets-tip-in-and-away | Three related photographs. |
| speed-bent-row | Six photographs in a sequence. |
| through-the-openings | A photograph with a subject that survives the crop. |
| thumbnail-becomes-the-stage | Three photographs. |
| twin-image-scanner | Product photography of the subject. |
| window-names-its-parts | The actual interface and the names of its parts. |
| window-relay-with-stamps | Four photographs and their names. |

Rare draws require their specific material. Use `closing-cut-under-the-rise` and `object-lowered-onto-the-last-line` for a product close, `fixed-hero-object` for an object and steps, `instrument-dial-stage` for three pictured, measured items, `lens-over-thumbnail-stream` for 25 named pictures, `orbit-to-formation` for twelve pictures and figures, `peel-tear-and-drag` for two pictures and a list, `room-walk-track` for fourteen pictures, `route-journey` for an actual route with steps and figures, `scrubbed-transformation-sequence` for product film and photography.

By name in the brief only: `arrive-and-settle-track`, `depth-card-flythrough`, `dot-becomes-the-full-stop`, `letter-bar-floods-the-ground`, `letter-physics`, `light-flood`, `object-through-giant-type`, `parts-lock-into-the-whole`, `product-assembles-into-its-action`, `raster-cut`, `stepped-columns-raise-a-stage`, `type-flip-relayout`, `warp-jump`.

## Mount the scene

Copy the chosen demo’s section as a direct child of `main`. Keep its stage class, rest height, `data-big-scene` ID and options. Replace the demo material with the client’s words and assets. Link `assets/scenes/scenes.css` and `assets/scenes/<id>/scene.css` in the head. Keep the demo’s early `sc-js` safety mark. Load `assets/scenes/scenes.js` once as a module at the end of the body. Modern scenes use `.sc__stage`. Classic ones use `.scene-stage` and the shared classic runtime. Keep the demo’s dependency paths intact.

A closing scene holds the page’s last action and the footer keeps its links row. A hero scene needs a one-screen resting composition. Longer resting scenes go below the hero. Take the scene’s live height from its demo and follow its phone layout. Reduced motion shows the finished composition. Check the closing action from the first frame.

## Check every set piece

Film the live range at 1440 and 390. Keep one plain section between set pieces. Every frame preserves reading order, whole sentences and legible words. Check display type at 3:1 and body type at 4.5:1 against the pixels behind them. The effect must visibly change its host without moving the layout.

A stretch with less than 12% of the viewport different from the ground may last at most 0.15 screen. An empty panel in a second colour still counts as empty. Allow at most one screen of held scroll per chapter with its own picture or per 25 words. Reveal anything to read or buy within a quarter screen and 300 ms. Use the client’s picture where a picture carries the effect. Its crop and the material in the brief must meet the part’s needs.

Animate transforms, clips or opacity. Keep per-frame custom properties off elements with more than 20 descendants. Never animate top, height, width or a mask image in a set piece. Without script and under reduced motion, show the complete content in ordinary flow.

Use `hinged-sheets` or `wordmark-under-strain` only when the brief requests it by name.
