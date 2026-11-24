# Motion

Load `assets/motion/motion.css` after the component styles and the module `assets/motion/motion.js` after `system.js`. The starter includes both. `assets/motion/demo.html` shows the controls. Use the kit’s classes so a link, button or field answers the same way throughout the page.

## The entrance deck

The plan gives the hero its `data-enter` value. `rise` lifts headline lines, `set-type` settles the type, `focus` sharpens a picture from at most 8px blur, and `exposure` develops it. `product-at-work` needs a real working view with up to four `data-enter-step` elements. `still` leaves the hero in place. `line-blocks` is a rare bold tech or gaming entrance with its headline readable by 300ms. Use `aperture` or `doors` only by name in the brief.

Keep the starter’s early `m-enter` mark and its 700ms safety timeout. Mark the principal visual with `data-enter-media` in a custom layout. A rising headline takes 700ms with lines 80ms apart. The lead rises 12px over 520ms from +120ms. Buttons rise 8px over 460ms from +200ms. Facts fade over 400ms from +260ms. All words should read by 800ms. A slow module leaves the standing hero in view.

Below the fold, the first section heading and lead picture arrive once. A section can opt out with `data-still`. A linked picture takes `.m-zoom`. A linked card keeps its outer hit area still while the content lifts. Rows, cards and tiles stay in place as the page scrolls.

## The floor

| Interaction | Timing and movement |
| --- | --- |
| Press | Buttons, tabs, nav toggles, linked cards, pills, swatches and disclosure summaries scale to .97 in 100ms ease-out and release in 160ms. Put `class="press"` on custom chips and controls. |
| Hover colour | 150ms in, 120ms out. |
| Hover lift | Fine pointers only. Button content rises 1px, card content 2px, over 180ms. Both return in 120ms. |
| Linked photograph | Scale to 1.03 over 400ms, return in 300ms. |
| Desktop nav | Wait 150ms for pointer intent, open in 200ms, close in 120ms. Keyboard focus opens immediately. |
| Phone nav | Open with opacity and 8px of travel over 200ms. Fade closed over 120ms. |
| Accordion | Native `details` in `.faq--fold` or an own section opens and closes over 200ms with `cubic-bezier(.25,1,.5,1)`. Content opacity takes 150ms. |
| Tabs | Indicate the selected tab over 240ms and crossfade its panel over 180ms. Use `role="tab"`, `aria-selected` and `aria-controls`. |
| Form | Focus ring 140ms, error text 150ms fade. The field stays in place. |
| Numbers | `<b data-m-count>1,240</b>` counts once in 1.0s. Write the final value in HTML, including units and punctuation. Keep prices steady. |
| Reduced motion | Show finished content. Colour and opacity can fade briefly. Disable travel, pinning and loops. |

## Motion in own sections

Let people open, choose, compare or scrub by keyboard, click and touch. A chart can draw once, a feed can show a new row, a bar can fill. One sticky element is allowed inside an own section up to 2.5 screens tall. Keep native scrolling and normal reading order. Never use scroll-jacking, automatic carousels, a tilt, text absolutely positioned over other text, or a timer that advances without a pause control. HTML shows the complete and correct state before script runs.

`data-m-progress` writes `--p` from 0 at the bottom edge of the viewport to 1 as the element leaves at the top. Put it on the small moving element. Its scroll listener is passive and updates at most once per animation frame. Use 1 as the fallback. Reduced motion uses 1.

```html
<div class="rail" aria-hidden="true">
  <span data-m-progress class="fill"></span>
</div>
<style>.fill{display:block;height:2px;background:currentColor;transform-origin:left;transform:scaleX(var(--p, 1))}</style>
```

`data-m-draw` on a path or polyline draws its stroke once on entry over 900ms. A script-free or reduced-motion page shows the finished stroke. Give a meaningful chart a readable label and the underlying values.

```html
<svg viewBox="0 0 100 40" role="img" aria-label="Orders rose from 12 to 19">
  <title>Orders, 12 to 19</title>
  <polyline data-m-draw points="2,35 40,24 98,4" fill="none" stroke="currentColor"/>
</svg>
```

## Larger pieces

Deal one moment, with room for a second from seven sections. A page with no matching material gets zero. `--carry` records supplied words, lists, photographs, steps and figures. A text moment can ride an existing heading. A scene is occasional and needs its own material. Leave a plain section between set pieces. Use the eligibility tables and filming rules in [Moments](moments.md) and [Scenes](scenes.md).
