![Taste Skill README Banner](examples/readme-banner.png)

# Taste Skill

<p>
  <a href="https://tasteskill.dev">
    <img src="https://img.shields.io/badge/Official_Website-tasteskill.dev-black?style=for-the-badge&logo=vercel" alt="Official Website" />
  </a>
</p>

A collection of skills that improve how AI tools write frontend code. Instead of generating generic, boring interfaces, the AI builds modern, premium designs with proper animations, spacing, and visual quality.

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Compatible-blue?style=flat-square)](https://github.com/vercel-labs/agent-skills)
[![GitHub stars](https://img.shields.io/github/stars/Leonxlnx/taste-skill?style=flat-square&color=yellow)](https://github.com/Leonxlnx/taste-skill/stargazers)
[![AI Supported](https://img.shields.io/badge/AI_Supported-Cursor_%7C_Claude_%7C_Antigravity-black?style=flat-square)](#)
[![Premium UI](https://img.shields.io/badge/Design-Premium_Frontend-white?style=flat-square&color=gray)](#)

## Taste Skill v2 Beta

Release soon!

## Feedback & Contributions

I'd love to hear your thoughts! If you have suggestions or find any bugs:

- Open a Pull Request or Issue right here on GitHub
- DM me on [x.com/lexnlin](https://x.com/lexnlin)
- DM Blueemi on [x.com/blueemi99](https://x.com/blueemi99)
- Email me at [support@tasteskill.dev](mailto:support@tasteskill.dev)

## Installing

Works via CLI for all major AI coding agents (Cursor, Antigravity, Claude Code, Codex, Windsurf, Copilot, etc.):

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
```

## Skills

Each skill has a different job. You do not need to use all of them at once.

Frontend implementation skills live in `skills/`.
`images-taste-skill` remains part of the normal `skills/` set.
A separate image-only companion also exists at `imagegenskills/frontendwebsiteimageskill/` for the dedicated image-generation-first workflow.

| Skill | Description |
| --- | --- |
| **taste-skill** | The default all-rounder. Use this when you want premium frontend output without forcing one narrow visual style. |
| **gpt-taste** | The stricter, more opinionated variant for GPT/Codex models. Best for high-variance layouts, stronger GSAP direction, and more aggressive anti-slop rules. |
| **images-taste-skill** | The regular image-first frontend reference skill in `skills/images-taste-skill/`. It is optimized for generating premium website images first, deeply analyzing them, then implementing the frontend to match closely. |
| **redesign-skill** | Use this when a project already exists and needs to be improved. It focuses on auditing the current UI first, then fixing weak layout, spacing, hierarchy, and styling decisions. |
| **soft-skill** | Use this for polished, calm, expensive-looking interfaces with softer contrast, more whitespace, premium fonts, and smooth spring motion. |
| **output-skill** | Use this when the model keeps being lazy. It pushes for complete output, no placeholder comments, and no skipped implementation steps. |
| **minimalist-skill** | Use this for cleaner editorial product UI inspired by tools like Notion or Linear. It keeps the palette restrained and the structure crisp. |
| **brutalist-skill** | ⚠️ `BETA` Use this for harder, more mechanical visual language: Swiss typography, sharp contrast, raw structure, and more experimental composition. |
| **stitch-skill** | Use this when you want Google Stitch-compatible semantic design rules, including the extra `DESIGN.md` export format. |

### Which one should I use?

- Start with **taste-skill** if you want the safest general recommendation.
- Use **gpt-taste** if you're using GPT/Codex models, you want a stronger visual opinion, more layout variance, and stricter motion/layout enforcement.
- Use **images-taste-skill** if visual quality is the main challenge and you want the normal image-first workflow: generate the design, inspect it deeply, then code it faithfully.
- Use **redesign-skill** if the project already exists and you want to improve what is there instead of starting from scratch.
- Use **soft-skill**, **minimalist-skill**, or **brutalist-skill** when you already know the visual direction you want.
- Add **output-skill** when your agent tends to leave work unfinished.
- Use **stitch-skill** when you specifically need Stitch-oriented output.

### Image-First Tip

For **images-taste-skill**, it often helps to state the workflow explicitly in the prompt. A line like `follow rules strictly and generate images, then analyze, then code` can reinforce the intended execution order in agents that support both image generation and implementation.

## Settings (taste-skill only)

The taste skill has three settings at the top of the file. Change these numbers (1-10) depending on what you're building:

- **DESIGN_VARIANCE** — How experimental the layout is. (1-3: Clean/centered | 8-10: Asymmetric/modern)
- **MOTION_INTENSITY** — How much animation there is. (1-3: Simple hover | 8-10: Magnetic/scroll-triggered)
- **VISUAL_DENSITY** — How much content fits on one screen. (1-3: Spacious/luxury | 8-10: Dense dashboards)

## Examples

Created with taste-skill:

<p>
  <img src="examples/floria-top.webp" width="400" />
  <img src="examples/floria-bottom.webp" width="400" />
</p>

## Support the project

If you find **taste-skill** useful, consider sponsoring the development.

[Sponsor on GitHub](https://github.com/sponsors/Leonxlnx)

### Current Sponsors

<a href="https://github.com/u2393696078-rgb"><img src="https://github.com/u2393696078-rgb.png" width="40" height="40" style="border-radius:50%" alt="u2393696078-rgb" title="u2393696078-rgb" /></a>
<a href="https://github.com/mccun934"><img src="https://github.com/mccun934.png" width="40" height="40" style="border-radius:50%" alt="mccun934" title="mccun934" /></a>
<a href="https://github.com/supply-guy"><img src="https://github.com/supply-guy.png" width="40" height="40" style="border-radius:50%" alt="supply-guy" title="supply-guy" /></a>
<a href="https://github.com/ghughes7"><img src="https://github.com/ghughes7.png" width="40" height="40" style="border-radius:50%" alt="ghughes7" title="ghughes7" /></a>
<a href="https://github.com/AtharvaJaiswal005"><img src="https://github.com/AtharvaJaiswal005.png" width="40" height="40" style="border-radius:50%" alt="AtharvaJaiswal005" title="AtharvaJaiswal005" /></a>

## Research

Background research that informed how these skills were built. See the [research](research/) folder.

## Common Questions

**How is this different from other AI design skills?**
Taste Skill includes 9 specialized variants instead of a single file, a 3-dial parameterization system for adjustable output, and anti-repetition rules backed by original research. It is framework-agnostic and works across all major agents.

**Does it work with React, Vue, Svelte, etc.?**
Yes. Taste Skill is framework-agnostic. The rules focus on design decisions, not framework-specific code patterns.

**What is a SKILL.md file?**
A portable instruction file that AI coding agents detect and follow automatically. No configuration is needed, just install it and your agent reads it.
