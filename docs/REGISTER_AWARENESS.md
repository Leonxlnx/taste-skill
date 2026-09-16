# Register awareness: brand vs product

Taste-skill ships strong tactical rules. After running them against several real surfaces, one pattern emerges that's worth surfacing in the docs: most rules read as **brand-register defaults** when they're applied uniformly across every project.

This doc names the distinction so callers can pick the right rule-set for the work in front of them, and so contributors have a vocabulary for proposing new skills that target one register or the other.

## The two registers

### BRAND register
**Design IS the product.** Marketing pages, landing pages, campaign pages, portfolios, long-form content, about pages, anything where the visitor's first impression *is* the deliverable.

Imperative: communicate, not transact. Distinctiveness is the bar. AI-flooded average reads as mediocre.

The current taste-skill default rule-set fits this register well — `design-taste-frontend`, `gpt-taste`, `redesign-existing-projects`, `soft-skill`, `brutalist-skill`, `stitch-design-taste` all default-target brand work.

### PRODUCT register
**Design SERVES the product.** App UIs, admin dashboards, settings panels, data tables, tools, authenticated surfaces, anything where the user is in a task.

Imperative: earned familiarity. The tool disappears into the task. Strangeness without purpose is the failure mode — over-decorated buttons, mismatched form controls, gratuitous motion, display fonts in UI labels.

`minimalist-skill` is the closest current skill to a product-register fit, but it still leans editorial. There isn't a dedicated product-UI skill in the bundle yet (proposal below).

## Rules that swap between registers

These are the rules where the brand-register answer and the product-register answer genuinely diverge — applying the brand rule in a product context reads as costume, and applying the product rule in a brand context reads as templated.

| Rule | BRAND | PRODUCT |
|---|---|---|
| `Inter` font | Banned (training-data default; creates monoculture) | Permitted — common cross-platform default for a reason |
| System font stack (`-apple-system, BlinkMacSystemFont, system-ui, sans-serif`) | Banned unless the brand IS a literal system tool | Legitimate; native feel on every platform |
| Two-family pairing (display + body) | Often the right move | Often unnecessary; one well-tuned sans carries the whole UI |
| Type scale | Fluid `clamp()` for headings | Fixed `rem` scale; clamp() on `h1` in a sidebar looks worse, not better |
| Scale ratio between steps | ≥ 1.25 (modular scale) | 1.125–1.2 (tighter; more elements, exaggerated contrast = noise) |
| Layout | Asymmetric or rigorously gridded as voice; centered-stack is failure | Predictable grids; consistency IS an affordance; standard nav patterns are features |
| Color strategy | Restrained / Committed / Full palette / Drenched all permitted | Restrained is the floor; a single surface can earn Committed |
| Motion entrance | Ambitious first-load orchestration permitted when brand invites it | No orchestrated page-load — users are in flow |
| Motion duration | Whatever serves the effect; up to 1s+ for cinematic | 150–250 ms on most transitions |
| Motion purpose | Decoration + state | State only — feedback, loading, reveal, transition |
| Imagery — placeholder source | Unsplash with the URL shape `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1600&q=80`; search for the brand's physical object | `picsum.photos/seed/{name}/800/600` for any placeholder; real product screenshots > photo decoration |
| Zero images on imagery-implied brief (restaurant, hotel, food, travel, fashion, photography) | **Bug** | Not applicable |
| Standard navigation patterns (top bar, side nav, breadcrumbs, tabs, command palette) | Often the wrong choice; invent the brand experience | Features, not failures — established expectations help the user |
| Component states (default + hover + focus + active + disabled + loading + error) | Brand surfaces ship the relevant subset (mostly hover + active) | All seven, every time |
| Skeleton states for loading | Optional | Required — never generic circular spinners |
| Empty state design | Optional | Required — teach the interface, not "nothing here" |

## Picking register

Priority order:
1. Cue in the task itself ("landing page" vs "dashboard")
2. The surface in focus (the page, file, or route being worked on)
3. Explicit `register:` field if the project carries one (see prior art below)

When in doubt, both register reference files in [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (`reference/brand.md` + `reference/product.md`) are useful adjacent reading. impeccable is Apache 2.0, derived from Anthropic's `frontend-design` skill, and codifies the register split as its own primary structuring decision.

## Per-skill register fit (current bundle)

| Skill | Default fit | Notes |
|---|---|---|
| `design-taste-frontend` | Brand | The default all-rounder; reads brand-leaning when applied to dashboards |
| `gpt-taste` | Brand | Stricter brand-grade output |
| `image-to-code-skill` | Brand (websites) | Image-first workflow assumes visual website work |
| `redesign-existing-projects` | Both | The audit checklist applies to either, but several typography/color rules read brand-default |
| `soft-skill` | Brand | "$150k agency" register; brand-only |
| `output-skill` | Both | Anti-truncation discipline is register-agnostic |
| `minimalist-skill` | Editorial-product hybrid | Closest to a product-fit skill; still leans editorial |
| `brutalist-skill` | Brand | Hard mechanical brand language |
| `stitch-design-taste` | Brand | Stitch-shaped, brand-oriented |
| `imagegen-frontend-web` | Brand | Web-section comps |
| `imagegen-frontend-mobile` | Both | Mobile mockups span both registers |
| `brandkit` | Brand | Identity boards by name |

## Proposal: where a register dial would live

Two clean shapes for surfacing this in the skills themselves:

**Shape A: top-level dial alongside the existing three.**
```
DESIGN_VARIANCE: 8
MOTION_INTENSITY: 6
VISUAL_DENSITY: 4
REGISTER: brand          # or "product"
```
The skill could read the register and switch a few rules (the swap-list above). Backward-compatible — defaults to `brand` which is current behavior.

**Shape B: per-skill front-matter field.**
```yaml
---
name: design-taste-frontend
register: brand
description: ...
---
```
Lets each skill in the bundle declare its register, and lets future product-UI skills (proposed: `product-ui-taste`) ship cleanly alongside.

Either works. Open to other shapes.

## Adjacent reading

- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) — Apache 2.0, register split is the primary structuring decision; `reference/brand.md` + `reference/product.md` are the depth pieces
- [Anthropic frontend-design](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md) — impeccable's upstream basis
- [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) — the Frequency Gate (the "should this animate at all" decision) reads cleanly across both registers
