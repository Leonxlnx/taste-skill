# Component Categories

Taste Blocks uses four public catalog groups and one internal foundation layer.

```text
blocks/        complete page sections
chrome/        navigation and site-level interface
components/    reusable content, media, forms, and actions
effects/       text, icon, background, pointer, and motion effects
foundations/   accessibility and runtime utilities; never counted
```

Every item has one primary category. Tags connect it to other sections and use cases without duplicating the entry.

## Section blocks

The block categories map directly to the 21 website sections in [sections.md](../sections/sections.md).

| Section | First large release | Mature library |
| --- | ---: | ---: |
| Hero | 24 | 36 |
| Introduction or Overview | 10 | 16 |
| Problem and Context | 10 | 16 |
| About and Story | 12 | 20 |
| Team and Careers | 12 | 20 |
| Services, Features, and Capabilities | 24 | 38 |
| How It Works | 18 | 28 |
| Selected Work or Archive | 22 | 34 |
| Project or Case Study | 18 | 30 |
| Gallery or Showreel | 16 | 24 |
| Clients and Partners | 8 | 14 |
| Trust and Recognition | 16 | 28 |
| Results, Statistics, and Impact | 12 | 20 |
| Comparison and Alternatives | 12 | 22 |
| Pricing and Plans | 14 | 24 |
| Content, Resources, and Events | 18 | 32 |
| FAQ | 8 | 14 |
| Contact and Inquiry | 12 | 20 |
| Signup, Registration, or Application | 10 | 18 |
| Call to Action | 10 | 18 |
| Footer | 14 | 26 |
| **Total** | **300** | **498** |

Navigation is not a content section. It belongs to chrome. Footer remains a section.

## Chrome

| Category | Contents | First large release | Mature library |
| --- | --- | ---: | ---: |
| Navigation | Standard, centered, portfolio, transparent, sticky, mega-menu, sidebar | 16 | 28 |
| Utility bars | Real announcements, launch notices, contact or account utilities | 6 | 10 |
| Menus and search | Mobile menus, full-screen menus, site search, nested navigation | 6 | 10 |
| Site notices | Consent, language or location choice, maintenance and availability | 4 | 8 |
| **Total** |  | **32** | **56** |

## Reusable components

| Category | Contents | First large release | Mature library |
| --- | --- | ---: | ---: |
| Buttons and actions | Buttons, icon actions, links, groups, copy, download, share | 18 | 30 |
| Cards and collections | Project, article, service, person, event, resource, plan | 24 | 40 |
| Content and editorial | Quotes, facts, lists, timelines, annotations, indexes | 18 | 30 |
| Media | Image frames, video, before and after, lightboxes, carousels | 16 | 28 |
| Forms | Contact, signup, search, booking, registration, application | 20 | 34 |
| Disclosure and local navigation | Accordion, tabs, contents, anchors, filters, pagination | 12 | 20 |
| Comparison and structured data | Comparisons, specifications, results, plan details | 12 | 20 |
| Proof and attribution | Testimonials, reviews, logos, awards, citations, sources | 12 | 20 |
| **Total** |  | **132** | **222** |

## Effects

| Category | Contents | First large release | Mature library |
| --- | --- | ---: | ---: |
| Text animation | Masked reveals, transitions, counters, kinetic lines, path and variable type | 18 | 32 |
| Animated icons | Draw, state transition, loading, directional, status and action motion | 12 | 24 |
| CSS and SVG backgrounds | Grids, noise, patterns, contours, masks, responsive surfaces | 16 | 28 |
| Canvas and shader backgrounds | Gradients, displacement, particles, fluid fields, image effects | 12 | 24 |
| Reveal and page transitions | Enter, exit, stagger, clip, shared-element, route transitions | 12 | 22 |
| Scroll and sticky motion | Progress, pinned stories, sequences, chapter transitions | 10 | 18 |
| Hover and pointer interactions | Magnetic, tilt, spotlight, proximity, cursor responses | 10 | 18 |
| Media motion | Image masks, video reveals, gallery and before-and-after motion | 8 | 16 |
| **Total** |  | **98** | **182** |

The complete targets are 562 real entries for the first large release and 958 at maturity.

## What counts

An entry counts only when it has:

- a distinct public export;
- a materially different content model, structure, interaction, or renderer;
- working source and a live demo;
- responsive and accessibility behavior;
- reduced-motion behavior where motion exists;
- documentation and provenance.

Do not count colors, themes, fonts, radius changes, copy swaps, timing changes, desktop and mobile versions, CSS and Tailwind versions, reduced-motion fallbacks, tags, or minor prop presets as separate entries.

## First milestone

The first publishable milestone is 30 to 40 polished live entries:

- 14 to 18 complete page blocks;
- 6 to 8 text and motion components;
- 4 to 6 actions or navigation components;
- 6 to 8 backgrounds and media effects.

The catalog homepage should show 24 to 32 unique live demos, load expensive effects only near the viewport, and never advertise a hardcoded count.
