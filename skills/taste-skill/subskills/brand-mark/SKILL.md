---
name: taste-brand-mark
description: Construct a one-colour logo, wordmark, lockups and favicon for a client whose page has no existing identity.
---

# Brand mark

1. Establish whether a mark is needed. Use the client’s existing identity when available. Skip speculative variations for established brands, and use a wordmark alone if a symbol adds no recognisable idea.
2. Choose one observable feature of the trade or name. Translate it into a shape with an opening, joint or edge you can describe in a sentence. For an interiors studio, the recess for a window seat can supply both the outer wall and the space inside. Reject the first generic house, initial in a square, waveform or alert triangle.
3. Start in one colour on a 16 or 32 unit grid. Build from one to three filled paths and use negative space for openings. Pick one corner policy. Trace the path of the empty space. At 16 CSS pixels leave roughly two pixels across the identifying opening. Measure a diagonal cut perpendicular to its sides. The horizontal opening can exaggerate the clearance. Remove any island of ink that turns into a dot. Test whether two terminals and a bowl have accidentally made a face. Inspect at actual size, then refine the large outline. Use `currentColor` for inline marks and the page’s ink tokens for light and dark grounds. No gradients, shadows, hairlines or inset background-colour patches.
4. Set the name as selectable text in the page’s `--font-display`. Tune tracking for the actual letters. Set the gap from the visible edge of the mark and align to the word’s optical centre. Include both the horizontal lockup and the mark alone. Use the project’s type, spacing and corner tokens. Standalone, inherit the existing heading family, header spacing and foreground colours.
5. Put the horizontal lockup on the nav home link and repeat it once at the footer. Check the mark on a drawing stamp, browser tab or report header. Use the solo mark on compact surfaces and in the favicon. Keep the logo still under all motion settings and without JavaScript. Leave clear space around it, and let the name stay together on the smallest header.

**Reject** a symbol meaningful only with an explanatory caption, a little drawing of an entire building, multiple decorative cuts, a mark drowning the name or a compressed wordmark on mobile.

**Deliver** `mark.svg`, a standalone `favicon.svg` with a light/dark treatment, and markup for the lockup. An adjacent visible name labels the home link. Use `aria-hidden="true"` on its inline mark. Give a mark-only home link an accessible name, e.g. `aria-label="Studio home"`. Keep each source asset under 60 KB.

**Check** with `node check.mjs <page-folder>`. It checks both SVGs, single paint in the master, local references, the favicon link and linked marks in nav and footer. Inspect the actual favicon file and the standalone mark at 16px on both grounds and the lockup in the phone nav and footer. Squint at the negative space. Compare spacing and optical weight beside the actual letters. See `example/index.html` for an applied pair of lockups.
