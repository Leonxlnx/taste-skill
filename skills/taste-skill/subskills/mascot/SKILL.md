---
name: taste-mascot
description: Draw an original SVG brand character and a small family of poses when a landing page has a recurring role for a host or guide.
---

# Mascot

1. Give the character a job. A café might have a host at opening time. A developer tool might have a messenger when a review arrives. Skip the character when the client has an established one, the page needs documentary evidence, or a security alert needs the reader’s full attention.
2. Join one clue from the trade to one living gesture. Sketch the outside edge in one ink first. A pour-over kettle can become a wren if its spout is its beak and its handle is its tail. Cover the face. A visitor should still recognise the idea.
3. Choose a square construction grid, two or three page colours and one edge rule, such as solid cuts throughout. Decide where the feet land and where each limb hinges. Use the page’s palette, display face, spacing and radius tokens. On its own, sample these roles from existing headings, surfaces and controls. Check the silhouette at 32 CSS pixels before adding an eye.
4. Build a small SVG parts sheet using named groups and local `<use>` references. Make three to five poses with the same head, body and limbs. Give the source parts and pose IDs a page-specific prefix when composing multiple SVGs. Set the still pose in markup. Anchor moving parts at their joints. Change the outside contour between poses. A fold narrows the wings. A walking foot clears the ground. Compare the poses at the size of the smaller return. Keep the signature opening or wing spread legible even in the folded pose. A visitor can change the pose with a control in the illustration. Use the kit’s state timing. Under reduced motion keep the chosen pose still.
5. Put the large pose on something the business uses, such as the house blend bag or an actual review request, then give it one return at a close, empty state or 404. A simplified contour can become the favicon. Avoid payment, dangerous actions, dense data and turning every list item into another character. On a lively or loud page (`references/expressive.md`) the character may act in each section where it shows that section's action: it taps, it waits, it celebrates.

**Reject** a soft blob with a stock smile, accessories pasted onto a generic animal, unrelated poses, strokes that disappear at 32px, gradients and a perpetual bounce.

**Deliver** a self-contained favicon.svg, poses.svg with three to five `pose-*` groups in the exported sheet, and the character as inline SVG or a local sprite, with a small placement example. Give a meaningful scene `<svg role="img" aria-label="…">`. Mark repeated decorative poses `aria-hidden="true"` when adjacent text already says what happened. Keep each SVG under 60 KB. Use the simplified silhouette below 32px.

**Check** with `node check.mjs <page-folder>`. It checks file sizes, pose count, local part references, SVG labels and the favicon link. Inspect the hero and return on a phone, on both grounds and at 32px. Read the page with motion disabled and hide the face for the silhouette test. See `example/index.html` for one complete application.
