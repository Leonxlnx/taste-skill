# Visual Effects

Original and native effect directions for Taste Blocks. Effects support a composition or interaction; they are not a quota and should not be stacked together without a reason.

## Runtime profiles

- `S0`: static CSS or SVG, no animation loop.
- `C1`: CSS transitions or Web Animations; pointer input updates at most once per frame.
- `C2`: Canvas 2D; capped device pixel ratio and primitive count.
- `G1`: one-pass WebGL2; one or two draw calls and reduced render scale.
- `G2`: two-pass WebGL2; one active instance at a time.
- `I1`: responsive image plus bounded mask or clip.
- `V1`: View Transition API with an immediate or Web Animations fallback.

Every continuous effect pauses offscreen and while the document is hidden. Static fallbacks are part of the component, not optional documentation.

## CSS and SVG surfaces

| Effect | Profile | Use |
| --- | --- | --- |
| Paper Fiber | S0 | Build-time monochrome texture for editorial surfaces. |
| Woven Linework | S0 | Fine threads aligned to the real column rhythm. |
| Contour Relief | S0 | Seeded isolines around a supplied subject. |
| Dither Aperture | S0/I1 | Ordered-dot mask that directs focus within real media. |
| Frosted Stipple | S0 | Mostly opaque panel with a tactile edge instead of generic glass. |
| Chromatic Foil Edge | C1 | A narrow spectral edge that responds only to deliberate hover or focus. |
| Embossed Wave Bands | S0 | Low-contrast tactile bands for a bounded surface. |
| Print Halftone Window | S0/I1 | A spot-color media crop for work and editorial blocks. |

## Canvas fields

| Effect | Profile | Use |
| --- | --- | --- |
| Seeded Flowlines | C2 | Deterministic curl lines with short fading trails. |
| Silk Threads | C2 | A small set of restrained displaced curves. |
| Charged Dust | C2 | Sparse points connected to real content anchors. |
| Contour Drift | C2 | Slowly changing isolines from a small scalar field. |
| Phase Rings | C2 | Precise interference rings from two or three sources. |
| Data Current | C2 | Particles moving along real process connections. |
| Prism Streaks | C2 | One entrance of chromatic line clusters that settles completely. |

## WebGL surfaces

| Effect | Profile | Use |
| --- | --- | --- |
| Liquid Lens | G1 | Localized refraction of one supplied image. |
| Dither Tide | G1 | Slow low-frequency field quantized with ordered dithering. |
| Soft Voronoi | G1 | Large low-contrast cells without neon outlines. |
| Caustic Fold | G1 | Analytic light-fold pattern over a flat brand color. |
| SDF Ribbon Field | G1 | Signed-distance ribbons that protect content negative space. |
| Mosaic Refraction | G1 | A local image lens that changes sampling into geometric tiles. |
| Iridescent Film | G1 | Thin-film color restricted to a product surface or edge. |
| Ink Diffusion | G2 | Low-resolution diffusion from one authored source point. |
| Depth Fog Planes | G1 | A small number of monochrome planes for restrained depth. |

## Pointer and hover

Enable these only for fine pointers with hover. Keyboard focus and touch need equivalent information and actions.

| Effect | Profile | Use |
| --- | --- | --- |
| Edge Light | C1 | Move a narrow highlight along the closest card edge. |
| Parallax Crop | C1 | Move media a few pixels inside a fixed crop, not the whole card. |
| Focus Lens | C1/I1 | Sharpen a bounded region of treated media. |
| Palette Lens | C1/I1 | Reveal an alternate grade through a bounded lens and an explicit touch control. |
| Surface Incline | C1 | Two or three degrees of tilt on isolated showcase objects only. |
| Timeline Scrub | C1/I1 | Preview an actual process or frame sequence with controls. |
| Product Orbit | I1 | Scrub a small lazy-loaded product sequence. |
| Anchor Pull | C1 | Shift only the inner CTA label by one or two pixels. |

Do not hide the system cursor or create persistent cursor trails.

## Image reveals

| Effect | Profile | Use |
| --- | --- | --- |
| Editorial Shutter | I1 | One crop opens from the composition's real alignment edge. |
| Sliced Curtain | I1 | Five to seven broad image slices reveal with a short offset. |
| Focus Rack | I1 | A small blur resolves as a bounded crop opens. |
| Ink Path Wipe | I1 | An original authored mask reveals media along a meaningful path. |
| Duotone Resolve | I1 | Brand treatment resolves to real color after a deliberate trigger. |
| Depth Pair Reveal | I1 | Foreground and background use two restrained masks. |
| Contact Sheet Scrub | I1 | Move between discrete portfolio frames with a thumbnail fallback. |
| Corner Aperture | I1 | Open from the point connecting the caption and media. |

## Spatial transitions

| Effect | Profile | Use |
| --- | --- | --- |
| Shared Frame Expansion | V1 | Continue work-card media and title into a detail page. |
| Stacked Depth Swap | V1 | Bring one showcase item forward while the previous recedes slightly. |
| Lateral Stage Handoff | V1 | Hand adjacent process steps across one consistent axis. |
| Dock to Canvas | V1 | Move a selected thumbnail into the main media stage. |
| Masked Route Wipe | V1 | Use the selected media origin for a bounded route transition. |
| Grid Reflow | V1 | Preserve project identity when a real filter changes the grid. |
| Chapter Rail | V1 | Advance a section marker and its media together. |
| Return to Source | V1 | Close detail media back to its actual originating card and restore focus. |

## Budgets and fallbacks

- Canvas caps device pixel ratio near 1.5 on desktop and 1 on mobile unless testing proves more is needed.
- WebGL renders below full resolution where possible and never runs more than one expensive preview at a time.
- Reduced motion removes autoplay, depth travel, large translation, parallax, pointer following, and repeated loops.
- Decorative renderers use `aria-hidden` and never carry essential information.
- Manual comparison and scrub controls remain usable when motion is reduced.
- Forced-colors mode hides decorative layers that cannot preserve contrast.
