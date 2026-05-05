<p align="center">
  <img src="assets/readme-banner.png" alt="Taste Skill — Anti-slop Agent Skills for premium frontends" width="100%" />
</p>

# Taste Skill

<p align="center">
  <em>The Anti-Slop Frontend Framework for AI Agents</em>
</p>

<p align="center">
  <a href="https://tasteskill.dev" title="Taste Skill — tasteskill.dev">
    <img src="assets/taste-skill-logo.webp" width="80" height="80" alt="Taste Skill" />
  </a>
</p>

<p align="center">
  <a href="https://tasteskill.dev">
    <img src="https://img.shields.io/badge/OPEN-tasteskill.dev-%23a855f7?style=for-the-badge&labelColor=%230f172a" alt="Open tasteskill.dev" />
  </a>
</p>

Portable **Agent Skills** that upgrade AI-built interfaces: stronger layout, typography, motion, and spacing instead of boilerplate-looking UIs. This repo also includes **image-generation skills** for reference boards (web, mobile, brand kits). Pair them with **ChatGPT Images** or similar generators, then hand the frames to Codex, Cursor, or Claude Code for implementation.

<p align="center">
<a href="https://github.com/Leonxlnx/taste-skill/stargazers"><img src="https://img.shields.io/github/stars/Leonxlnx/taste-skill?style=for-the-badge&logo=github&labelColor=1e293b&color=fbbf24" alt="GitHub stars"/></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-fbbf24?style=for-the-badge&labelColor=1e293b" alt="MIT License"/></a>
<a href="#installing"><img src="https://img.shields.io/badge/Tools-Codex%20%C2%B7%20Cursor%20%C2%B7%20Claude-111827?style=for-the-badge&labelColor=1e293b" alt="Supported agents"/></a>
<a href="https://www.tasteskill.dev/changelog"><img src="https://img.shields.io/badge/Changelog-Latest-059669?style=for-the-badge&labelColor=1e293b" alt="Changelog on tasteskill.dev"/></a>
</p>

## Disclaimer

Taste Skill has no official token, coin, or crypto project. Any token using my name, image, or project is unaffiliated and not endorsed by me.

<p align="center"><sub><a href="#disclaimer">Disclaimer</a> · <a href="#installing">Install</a> · <a href="#skills">Skills</a> · <a href="#settings-taste-skill-only">Settings</a> · <a href="#examples">Examples</a> · <a href="#support-the-project">Sponsor</a> · <a href="#research">Research</a> · <a href="#common-questions">FAQ</a> · <a href="#license">License</a></sub></p>

## Feedback & Contributions

We would love your feedback. Suggestions and bug reports:

- Open a Pull Request or Issue on GitHub  
- DM [@lexnlin](https://x.com/lexnlin) or [@blueemi99](https://x.com/blueemi99)  
- Email us at [hello@tasteskill.dev](mailto:hello@tasteskill.dev)

## Installing

The [`npx skills add`](https://github.com/vercel-labs/agent-skills) CLI scans the `skills/` folder in this repo, so **all skills below (code and image-generation) install the same way.**

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
```

Install a single skill by name (example):

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "imagegen-frontend-mobile"
```

You can also copy any `SKILL.md` into your project or paste it into ChatGPT / Codex conversations.

## Skills

Each skill does one job; you do not need all of them at once. **Implementation skills** output code. **Image-generation skills** output reference images only.

| Skill | Description |
| --- | --- |
| **taste-skill** | Default all-rounder for premium frontend output without locking one narrow visual style. |
| **gpt-taste** | Stricter variant for GPT/Codex: higher layout variance, stronger GSAP direction, aggressive anti-slop. |
| **image-to-code-skill** | Image-first pipeline: generate site references, analyze them, then implement the frontend to match. |
| **redesign-skill** | Existing projects: audit the UI first, then fix layout, spacing, hierarchy, styling. |
| **soft-skill** | Polished, calm, expensive UI with softer contrast, whitespace, premium fonts, spring motion. |
| **output-skill** | When the model ships half-finished work: full output, no placeholder comments. |
| **minimalist-skill** | Editorial product UI (Notion/Linear vibes), restrained palette, crisp structure. |
| **brutalist-skill** | ⚠️ `BETA` Hard mechanical language: Swiss type, sharp contrast, experimental layout. |
| **neon-pop-skill** | Loud playful ecommerce interfaces with neon colour blocking, bubble typography, sticker graphics, and rounded modular grids. For gift shops, beauty brands, and Gen Z DTC. |
| **stitch-skill** | Google Stitch-compatible rules, including optional `DESIGN.md` export format. |

### Image generation skills

These produce design images only (no code). Use with ChatGPT Images, Codex image mode, or any agent that generates images.

| Skill | Description |
| --- | --- |
| **imagegen-frontend-web** | Website comps: hero, landing, multi-section with strong typography, spacing, anti-slop art direction. |
| **imagegen-frontend-mobile** | Mobile screens and flows: iOS/Android/cross-platform, mockups, readable type, coherent sets. |
| **brandkit** | Brand-kit boards: logo directions, palettes, type, identity applications across categories. |

### Which one should I use?

- Start with **taste-skill** for the safest general default.  
- Use **gpt-taste** when you want the stricter GPT/Codex-oriented rules and motion/layout enforcement.  
- Use **image-to-code-skill** for image → analyze → code website workflows.  
- Use **redesign-skill** to improve an existing codebase instead of greenfield styling.  
- Add **soft-skill**, **minimalist-skill**, or **brutalist-skill** when the visual direction is already chosen.  
- Add **output-skill** if the agent keeps truncating output.  
- Use **imagegen-frontend-web**, **imagegen-frontend-mobile**, or **brandkit** when the deliverable is **images** (comps, flows, identity boards), then pass results to your coding agent.

### Image-first tip

For **image-to-code-skill**, state the pipeline in the prompt, e.g.: `follow the skill: generate images, then analyze, then code`.

### ChatGPT Images and Codex

Attach or paste **`imagegen-frontend-web`**, **`imagegen-frontend-mobile`**, or **`brandkit`** and ask for the frames you need, then feed the renders to Codex, Cursor, or Claude Code. Use **image-to-code-skill** when you want one workflow that both generates references and implements the site in code.

## Settings (taste-skill only)

Numbers at the top of the file are 1-10 dials:

- **DESIGN_VARIANCE**: Layout experimentation (lower: centered/clean · higher: asymmetric/modern).
- **MOTION_INTENSITY**: Animation depth (lower: hover · higher: scroll/magnetic).
- **VISUAL_DENSITY**: Information per viewport (lower: spacious · higher: dense dashboards).

## Examples

Created with taste-skill:

<p>
  <img src="examples/floria-top.webp" width="400" />
  <img src="examples/floria-bottom.webp" width="400" />
</p>

## Support the project

If Taste Skill helps you, consider sponsoring:

[Sponsor on GitHub](https://github.com/sponsors/Leonxlnx)

### Current Sponsors

<a href="https://github.com/robinebers"><img src="https://github.com/robinebers.png" width="40" height="40" style="border-radius:50%" alt="robinebers" title="robinebers" /></a>
<a href="https://github.com/JKc66"><img src="https://github.com/JKc66.png" width="40" height="40" style="border-radius:50%" alt="JKc66" title="JKc66" /></a>
<a href="https://github.com/u2393696078-rgb"><img src="https://github.com/u2393696078-rgb.png" width="40" height="40" style="border-radius:50%" alt="u2393696078-rgb" title="u2393696078-rgb" /></a>
<a href="https://github.com/a-human-created-this"><img src="https://github.com/a-human-created-this.png" width="40" height="40" style="border-radius:50%" alt="a-human-created-this" title="a-human-created-this" /></a>
<a href="https://github.com/AtharvaJaiswal005"><img src="https://github.com/AtharvaJaiswal005.png" width="40" height="40" style="border-radius:50%" alt="AtharvaJaiswal005" title="AtharvaJaiswal005" /></a>
<a href="https://github.com/ghughes7"><img src="https://github.com/ghughes7.png" width="40" height="40" style="border-radius:50%" alt="ghughes7" title="ghughes7" /></a>
<a href="https://github.com/mccun934"><img src="https://github.com/mccun934.png" width="40" height="40" style="border-radius:50%" alt="mccun934" title="mccun934" /></a>
<a href="https://github.com/navanchauhan"><img src="https://github.com/navanchauhan.png" width="40" height="40" style="border-radius:50%" alt="navanchauhan" title="navanchauhan" /></a>

<p align="center">
 <a href="https://www.star-history.com/leonxlnx/taste-skill">
  <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill" />
   <img alt="Star History Rank" src="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill" />
  </picture>
 </a>
</p>

## Research

Background writing that shaped these skills lives in [`research/`](research/).

## Common Questions

**How is this different from other AI design skills?**  
Multiple specialized variants, adjustable dials in key skills, anti-repetition rules informed by dedicated research. All are framework agnostic across major coding agents.

**Does it work with React, Vue, Svelte?**  
Yes. Rules target design intent, not a single framework API.

**What is SKILL.md?**  
A portable instruction file agents can load automatically; install via `npx skills add` or by copying into a repo or conversation.

**Do image-generation skills install with `npx skills add`?**  
Yes. They live under `skills/` alongside the code skills so the same CLI discovers them.

## License

[MIT License](LICENSE) · Copyright (c) 2026 Leonxlnx
