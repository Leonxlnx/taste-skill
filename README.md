<p align="center">
  <img src="assets/readme-banner.webp" alt="Taste Skill - Anti-slop Agent Skills for premium frontends" width="100%" />
</p>

# Taste Skill

<p align="center">
  <em>The Anti-Slop Frontend Framework for AI Agents</em>
</p>

<p align="center" style="margin-bottom: 8px;">
  <a href="https://tasteskill.dev" title="Visit tasteskill.dev"><img src="assets/readme-buttons/btn-site.webp" alt="Visit tasteskill.dev" height="56" /></a>
</p>

<h3 align="center">Sponsors</h3>

<table align="center">
  <tr>
    <td align="center" width="76"><a href="https://www.sent.dm"><img src="assets/sponsors/sentdm.png" alt="Sent.dm" width="62" height="62" /></a></td>
    <td><sub><a href="https://www.sent.dm"><strong>Sent.dm</strong></a> · messaging APIs for SMS, WhatsApp, and RCS</sub></td>
  </tr>
  <tr>
    <td align="center" width="76"><a href="https://animations.dev"><img src="assets/sponsors/animations-dev.webp" alt="animations.dev" width="62" height="62" /></a></td>
    <td><sub><a href="https://github.com/emilkowalski"><strong>Emil Kowalski</strong></a> · <a href="https://animations.dev">animations.dev</a></sub></td>
  </tr>
  <tr>
    <td align="center" width="76"><a href="https://vercel.com/open-source-program"><img src="assets/sponsors/vercel-logo.svg" alt="Vercel" width="62" height="62" /></a></td>
    <td><a href="https://vercel.com/open-source-program"><img src="assets/vercel-oss-program-badge.svg" alt="Vercel Open Source Program" height="32" /></a></td>
  </tr>
</table>

<p align="center"><sub><a href="https://github.com/sponsors/Leonxlnx">Become a sponsor</a></sub></p>

Portable **Agent Skills** that upgrade AI-built interfaces: stronger layout, typography, motion, and spacing instead of boilerplate-looking UIs. This repo also includes **image-generation skills** for reference boards (web, mobile, brand kits). Pair them with **ChatGPT Images** or similar generators, then hand the frames to Codex, Cursor, or Claude Code for implementation.

<p align="center">
  <a href="LICENSE"><img src="assets/readme-buttons/btn-mit.webp" alt="MIT License" height="45" valign="middle" /></a>
  &nbsp;
  <a href="https://github.com/vercel-labs/agent-skills"><img src="assets/readme-buttons/btn-agent-skills.webp" alt="Agent Skills compatible" height="45" valign="middle" /></a>
  &nbsp;
  <a href="#installing"><img src="assets/readme-buttons/btn-tools.webp" alt="Codex, Cursor, Claude" height="45" valign="middle" /></a>
  &nbsp;
  <a href="https://www.tasteskill.dev/changelog"><img src="assets/readme-buttons/btn-changelog.webp" alt="Changelog" height="45" valign="middle" /></a>
</p>

## Disclaimer

Taste Skill has no official token, coin, or crypto project. Any token using my name, image, or project is unaffiliated and not endorsed by me.

<p align="center"><sub><a href="#disclaimer">Disclaimer</a> · <a href="#installing">Install</a> · <a href="#skills">Skills</a> · <a href="#settings-taste-skill-only">Settings</a> · <a href="#examples">Examples</a> · <a href="#sponsors">Sponsors</a> · <a href="#research">Research</a> · <a href="#common-questions">FAQ</a> · <a href="#license">License</a></sub></p>

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

Install a single skill by its **install name** (the `name:` field inside the SKILL frontmatter, not the folder name):

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

You can also copy any `SKILL.md` into your project or paste it into ChatGPT / Codex conversations.

### Updating from the previous version

The default `taste-skill` (install name `design-taste-frontend`) is now **v2 (experimental)**, a substantial rewrite of the original v1. If you already have v1 installed, just re-run the install command and you will be upgraded:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

The install name did not change, so no script updates are needed. The newer SKILL.md replaces the older one in place.

If you depend on the exact behavior of v1 and want to pin to it explicitly:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend-v1"
```

See [CHANGELOG.md](CHANGELOG.md) for the full v1 to v2 diff and the rationale.

## Skills

Each skill does one job; you do not need all of them at once. **Implementation skills** output code. **Image-generation skills** output reference images only.

The `Install name` column is the exact value you pass to `--skill`.

| Skill (folder) | Install name | Description |
| --- | --- | --- |
| **taste-skill** | `design-taste-frontend` | 🆕 **v2 (experimental)** - substantial rewrite of the default skill. Reads the brief, infers the design language, tunes three dials (VARIANCE / MOTION / DENSITY). Brief inference, design-system map, hard em-dash ban, canonical GSAP code skeletons, redesign-audit protocol, strict pre-flight check. Actively iterating toward v2.0.0 stable. |
| **taste-skill-v1** | `design-taste-frontend-v1` | The original v1 of taste-skill, preserved for projects depending on its exact behavior. Use only if the v2 default breaks something specific in your workflow. |
| **gpt-tasteskill** | `gpt-taste` | Stricter variant for GPT/Codex: higher layout variance, stronger GSAP direction, aggressive anti-slop. |
| **image-to-code-skill** | `image-to-code` | Image-first pipeline: generate site references, analyze them, then implement the frontend to match. |
| **redesign-skill** | `redesign-existing-projects` | Existing projects: audit the UI first, then fix layout, spacing, hierarchy, styling. |
| **soft-skill** | `high-end-visual-design` | Polished, calm, expensive UI with softer contrast, whitespace, premium fonts, spring motion. |
| **output-skill** | `full-output-enforcement` | When the model ships half-finished work: full output, no placeholder comments. |
| **minimalist-skill** | `minimalist-ui` | Editorial product UI (Notion/Linear vibes), restrained palette, crisp structure. |
| **brutalist-skill** | `industrial-brutalist-ui` | Hard mechanical language: Swiss type, sharp contrast, experimental layout. |
| **stitch-skill** | `stitch-design-taste` | Google Stitch-compatible rules, including optional `DESIGN.md` export format. |

### Image generation skills

These produce design images only (no code). Use with ChatGPT Images, Codex image mode, or any agent that generates images.

| Skill (folder) | Install name | Description |
| --- | --- | --- |
| **imagegen-frontend-web** | `imagegen-frontend-web` | Website comps: hero, landing, multi-section with strong typography, spacing, anti-slop art direction. |
| **imagegen-frontend-mobile** | `imagegen-frontend-mobile` | Mobile screens and flows: iOS/Android/cross-platform, mockups, readable type, coherent sets. |
| **brandkit** | `brandkit` | Brand-kit boards: logo directions, palettes, type, identity applications across categories. |

### Which one should I use?

- Start with **taste-skill** for the safest general default. (Now v2 experimental - see what changed in the [CHANGELOG](CHANGELOG.md).)
- If you depend on the exact behavior of the original taste-skill, install **taste-skill-v1** instead. 
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

### Community Sponsors

<a href="https://github.com/dnakov"><img src="https://github.com/dnakov.png" width="40" height="40" style="border-radius:50%" alt="dnakov" title="dnakov" /></a>
<a href="https://github.com/AkramReshad"><img src="https://github.com/AkramReshad.png" width="40" height="40" style="border-radius:50%" alt="AkramReshad" title="AkramReshad" /></a>
<a href="https://github.com/ajmalaksar25"><img src="https://github.com/ajmalaksar25.png" width="40" height="40" style="border-radius:50%" alt="ajmalaksar25" title="ajmalaksar25" /></a>
<a href="https://github.com/krikkkk"><img src="https://github.com/krikkkk.png" width="40" height="40" style="border-radius:50%" alt="krikkkk" title="krikkkk" /></a>
<a href="https://github.com/navanchauhan"><img src="https://github.com/navanchauhan.png" width="40" height="40" style="border-radius:50%" alt="navanchauhan" title="navanchauhan" /></a>
<a href="https://github.com/robinebers"><img src="https://github.com/robinebers.png" width="40" height="40" style="border-radius:50%" alt="robinebers" title="robinebers" /></a>
<a href="https://github.com/JKc66"><img src="https://github.com/JKc66.png" width="40" height="40" style="border-radius:50%" alt="JKc66" title="JKc66" /></a>
<a href="https://github.com/u2393696078-rgb"><img src="https://github.com/u2393696078-rgb.png" width="40" height="40" style="border-radius:50%" alt="u2393696078-rgb" title="u2393696078-rgb" /></a>
<a href="https://github.com/a-human-created-this"><img src="https://github.com/a-human-created-this.png" width="40" height="40" style="border-radius:50%" alt="a-human-created-this" title="a-human-created-this" /></a>
<a href="https://github.com/AtharvaJaiswal005"><img src="https://github.com/AtharvaJaiswal005.png" width="40" height="40" style="border-radius:50%" alt="AtharvaJaiswal005" title="AtharvaJaiswal005" /></a>
<a href="https://github.com/ghughes7"><img src="https://github.com/ghughes7.png" width="40" height="40" style="border-radius:50%" alt="ghughes7" title="ghughes7" /></a>
<a href="https://github.com/mccun934"><img src="https://github.com/mccun934.png" width="40" height="40" style="border-radius:50%" alt="mccun934" title="mccun934" /></a>
<a href="https://github.com/techmedic5"><img src="https://github.com/techmedic5.png" width="40" height="40" style="border-radius:50%" alt="techmedic5" title="techmedic5" /></a>
<a href="https://github.com/bytewerk-dev"><img src="https://github.com/bytewerk-dev.png" width="40" height="40" style="border-radius:50%" alt="bytewerk-dev" title="bytewerk-dev" /></a>
<a href="https://github.com/LuisGot"><img src="https://github.com/LuisGot.png" width="40" height="40" style="border-radius:50%" alt="LuisGot" title="LuisGot" /></a>
<a href="https://github.com/oskar-collab"><img src="https://github.com/oskar-collab.png" width="40" height="40" style="border-radius:50%" alt="oskar-collab" title="oskar-collab" /></a>

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
