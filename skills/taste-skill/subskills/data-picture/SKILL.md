---
name: taste-data-picture
description: Make a page claim visible as a time trace, comparison, range, schedule or meter. Use it when the reader needs to see a relationship between quantities or events.
---

# Data picture

1. Finish “in one second I should see …” with a change, difference, span or limit. Place the figure beside the decision it supports. Use ordinary text for one isolated number. Keep exact lookup in a table.
2. Pick the geometry from that sentence. Put releases and rollbacks on the same clock as a latency line, with a horizontal budget. For sequence alone, place events on one time rail. Compare the same room, dates, fees and terms with bars from zero on one scale. Put each price at its bar tip. If savings are the claim, bracket the distance between the tips. Show a measuring range on a proportional ruler with named references across the span. Give each tick a unit interval, with longer marks at round values. Keep the stems fixed when centring or staggering narrow-screen labels. Map opening hours to segments of a 24-hour rail, including closed intervals. Fill a usage meter to used ÷ capacity and print both amounts.
3. Record units, interval, reference values and origin before drawing. Keep supplied measurements intact. For a demonstration, mark it as a sample beside the figure. For a series, set the normal level, minute of change, peak and recovery first. Use a fixed seed only for small, correlated variation within those phases. Choose sensible round rates and limits. A time coincidence supports “after”. To say “because”, name the mechanism in a trace or incident log.
4. Map values to positions once. Print units and direct labels in HTML or SVG. Use tabular numerals, the page’s type, spacing, ground, ink and muted tokens, one accent on the point being made, and axes only where they support a reading. Working alone, sample these from the existing page. On a trace, label the before level and the peak at their own points. Keep text in CSS pixels as the plot narrows. Reserve accent for the interval over budget. Keep grid lines quieter than the signal. Encode the distinction in text or geometry too.
5. Start with a complete static figure. For optional detail, use a native disclosure, button or range input that works by click and keyboard. A hover hint must also appear on focus and click. Avoid pointer tracking, drag-only controls and autoplay. If a readout needs motion, use only opacity or transform with `--dur` and `--ease`. Show the still under reduced motion.

**Reject** unexplained squiggles, fake production numbers, clipped bar origins, coloured legends that send the reader away from the marks, and decorative charts repeated between sections.

**Deliver** a small HTML/CSS figure or inline SVG, plus the fixture or build source for generated marks. Wrap the result in `<figure data-picture>`. Put the takeaway in the heading or nearby body copy. Name the figure and expose the values in text or an accessible description. Mark geometry already described by the text `aria-hidden="true"`. Keep each source file under 60 KB.

**Check** with `node check.mjs path/to/index.html` for a figure name, text values, SVG sizing and accessible names. `node check.mjs --sample` also compares the saved example against its seeded figure. Inspect the actual marks and labels at 1440 and 390 CSS pixels with the page at rest. Read the claim back from the picture, verify its endpoints against the source and operate any controls with the keyboard. See `example/` for a worked incident.
