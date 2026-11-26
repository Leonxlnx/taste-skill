# Interactions

The palette command links the dealt part styles. Load each matching part.js once after its markup. Use the page tokens for its frame, labels and controls. Leave the specimen page stylesheet in the gallery.

Keep motion small and short, inside a frame or in answer to a visitor. Set `data-playback="manual"` on extra tab, logo or film parts when two frames could share a viewport or a third would autoplay. Pause loops off screen, give loops over five seconds an in-frame pause control, and show their informative still under reduced motion.

| Part | Where it earns its place | Content needed | Never use for |
|---|---|---|---|
| [demo-loop](../assets/motion/parts/demo-loop/demo.html) · [phone](../assets/motion/parts/demo-loop/phone.html) | In the dealt hero window or core view | One workflow with a starting state, action and visible result | Invented actions or a page-wide entrance |
| [feature-tabs](../assets/motion/parts/feature-tabs/demo.html) | Beside a shared media frame | Two or more features with matching images and labels | Automatic advancement after a manual choice |
| [logo-row](../assets/motion/parts/logo-row/demo.html) | A stockist or customer strip | Six or more approved, similarly sized marks | Implied endorsements |
| [accordion](../assets/motion/parts/accordion/demo.html) | Specifications and questions | Short headings with independent answers | Hiding the primary offer |
| [nav-highlight](../assets/motion/parts/nav-highlight/demo.html) | Desktop navigation | Short destinations and a real group of child links | Sliding the link text |
| [snap-gallery](../assets/motion/parts/snap-gallery/demo.html) | A sequence of related plates | Images, captions and meaningful order | A single image |
| [compare](../assets/motion/parts/compare/demo.html) | A proofing or editing section | Two registered images at the same scale | Unrelated crops |
| [price-toggle](../assets/motion/parts/price-toggle/demo.html) | Beside prices | Both totals, periods and currency | Concealing the annual total |
| [copy-button](../assets/motion/parts/copy-button/demo.html) | Beside a reusable value | The exact selectable text | Acknowledging a failed copy |
| [card-light](../assets/motion/parts/card-light/demo.html) | A material or product card | A readable card with a destination | A moving ground or touch-only interaction |
| [lightbox](../assets/motion/parts/lightbox/demo.html) | A photograph with inspectable detail | A thumbnail, full image and description | Enlarging a low-resolution thumbnail |
| [video-inview](../assets/motion/parts/video-inview/demo.html) | A framed process demonstration | A film, representative poster and controls | Autoplay with sound |
| [step-rail](../assets/motion/parts/step-rail/demo.html) | A multi-stage reading sequence | A distinct visual for each step | Pinning the narrative on a phone |
| [count-once](../assets/motion/parts/count-once/demo.html) | An inventory or results figure | A final value supplied by the brief | Invented counts or extrapolations |
| [menu-sheet](../assets/motion/parts/menu-sheet/demo.html) | The mobile header | A short list of working destinations | A second menu covering an open one |
| [form-states](../assets/motion/parts/form-states/demo.html) | A real form | Validation, a persistence operation and its outcome | Showing success before saving |

## How to script a demo loop

Write the finished product state in HTML. Put `data-part="demo-loop"` on the window, keep its authored `.part-frame` inside, and load its local part.js once. The starter mounts its own navigation and forms through system.js. Pick three to five visible changes from the fact sheet. For a time tracker, start the menu-bar timer, tag the entry to its client, then show the invoice. In the demo template set `data-cycle="11000"`. At 1000 ms use `status` on the timer, at 3800 ms use `type` on the client field and at 7200 ms use `row` on the invoice. Use a local `data-target` for each. Hold the result through the end. Put the pause control inside that window.
