# Taste Skill

A collection of skills that improve how AI tools write frontend code. Instead of generating generic, boring interfaces, the AI builds modern, premium designs with proper animations, spacing, and visual quality.

## Feedback & Contributions

I'd love to hear your thoughts! If you have suggestions or find any bugs:

- Open a Pull Request or Issue right here on GitHub
- DM me on [x.com/lexnlin](https://x.com/lexnlin)
- Email me at [hello@learn2vibecode.dev](mailto:hello@learn2vibecode.dev)

## Skills

There are four skills in this project. Each one lives in its own folder and contains a `SKILL.md` file.

### 1. taste-skill (14 sections)
The main design skill. Teaches the AI how to write good-looking frontend code from scratch. Covers layout, typography, colors, spacing, motion, and overall visual quality. **Now includes:** accessibility (WCAG 2.2 AA), Core Web Vitals performance, responsive images, dark/light mode system, SEO meta architecture, and 4 before/after code examples.

### 2. redesign-skill
For upgrading existing projects. Instead of rebuilding from zero, this skill walks the AI through auditing what's already there and fixing the biggest design problems first. **Now includes:** accessibility audit, Core Web Vitals audit, SEO audit, and an expanded 10-step fix priority.

### 3. soft-skill (11 sections)
Focuses on making things look and feel expensive. Use for luxury, editorial, or Awwwards-tier builds. Covers premium fonts, big breathing whitespace, layered card designs with depth, smooth spring-based animations, and floating navigation. Bans all the generic defaults that make AI output look like a template. **Now includes:** accessibility, dark/light mode, SEO & performance, and a clear "when to use this vs taste-skill" guide.

### 4. output-skill
Stops the AI from being lazy. Prevents placeholder comments, skipped code blocks, and half-finished outputs. Forces the AI to actually write everything instead of cutting corners. **Now includes:** multi-file output handling and iterative request rules.

### When to use which skill

| Scenario | Skill |
|----------|-------|
| Building a new SaaS, dashboard, or web app | taste-skill |
| Building a luxury/editorial/agency site (Awwwards-tier) | soft-skill |
| Upgrading an existing project | redesign-skill |
| Any task requiring complete, untruncated output | output-skill |
| Production build | taste-skill + output-skill (combine both) |

## How to Use

1. Copy the `SKILL.md` file from the skill folder you need into your project.
2. Tell your AI to read and follow it. In most editors you can just reference it directly (e.g. `@SKILL.md` in Cursor).

That's it. The AI reads the file and follows the rules.

## Settings (taste-skill only)

The taste skill has three settings at the top of the file. Change these numbers (1-10) depending on what you're building:

**DESIGN_VARIANCE** — How experimental the layout is.
- 1-3: Clean, centered, standard grids.
- 4-7: Overlapping elements, varied sizes.
- 8-10: Asymmetric, lots of whitespace, very modern.

**MOTION_INTENSITY** — How much animation there is.
- 1-3: Almost none. Simple hover effects.
- 4-7: Fade-ins, smooth scrolling.
- 8-10: Magnetic effects, spring physics, scroll-triggered animations.

**VISUAL_DENSITY** — How much content fits on one screen.
- 1-3: Big and spacious. One element at a time. Luxury feel.
- 4-7: Normal spacing. Like a typical app or website.
- 8-10: Dense and compact. Dashboards, data-heavy interfaces.

## Examples

Created with taste-skill:

<p>
  <img src="examples/floria-top.webp" width="400" />
  <img src="examples/floria-bottom.webp" width="400" />
</p>

## Research

Background research that informed how these skills were built. See the [research](research/) folder.
