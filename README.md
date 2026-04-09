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

A major update is in progress. If you want early access, sign up for the beta:

[Join the Waitlist](https://tasteskillv2.vercel.app/)

## Feedback & Contributions

I'd love to hear your thoughts! If you have suggestions or find any bugs:

- Open a Pull Request or Issue right here on GitHub
- DM me on [x.com/lexnlin](https://x.com/lexnlin)
- Email me at [hello@learn2vibecode.dev](mailto:hello@learn2vibecode.dev)

## Installing

Works via CLI for all major AI coding agents (Cursor, Antigravity, Claude Code, Codex, Windsurf, Copilot, etc.):

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
```

## Skills

| Skill | Description |
| --- | --- |
| **taste-skill** | The main design skill for premium frontend code. Covers layout, typography, colors, spacing, and motion. |
| **redesign-skill** | For upgrading existing projects by auditing and fixing design problems first. |
| **soft-skill** | Focuses on an expensive, soft UI look with premium fonts, whitespace, depth, and smooth spring animations. |
| **output-skill** | Stops the AI from being lazy. Prevents placeholder comments, skipped code blocks, and half-finished outputs. |
| **minimalist-skill** | For clean, editorial-style interfaces inspired by tools like Notion and Linear. Monochrome, crisp borders. |
| **brutalist-skill** | ⚠️ `BETA` Raw mechanical interfaces fusing Swiss typographic print with CRT terminal aesthetics. |
| **stitch-skill** | Google Stitch-compatible semantic design rules for premium AI UI generation. Includes DESIGN.md for export. |

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
Taste Skill includes 7 specialized variants instead of a single file, a 3-dial parameterization system for adjustable output, and anti-repetition rules backed by original research. It is framework-agnostic and works across all major agents.

**Does it work with React, Vue, Svelte, etc.?**
Yes. Taste Skill is framework-agnostic. The rules focus on design decisions, not framework-specific code patterns.

**What is a SKILL.md file?**
A portable instruction file that AI coding agents detect and follow automatically. No configuration is needed, just install it and your agent reads it.
