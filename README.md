<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/taste-skill-wordmark-dark.png" />
    <img src="assets/taste-skill-wordmark.png" alt="Taste Skill" width="340" />
  </picture>
</p>

<p align="center">
  <a href="https://tasteskill.dev" title="Visit tasteskill.dev"><img src="https://img.shields.io/badge/website-tasteskill.dev-24292f?style=flat" alt="Visit tasteskill.dev" /></a>
  &nbsp;
  <a href="https://tastecode.dev" title="Visit tastecode.dev"><img src="https://img.shields.io/badge/new-TasteCode-ff6b00?style=flat" alt="New: TasteCode" /></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-24292f?style=flat&amp;logo=github&amp;logoColor=white" alt="MIT License" /></a>
  &nbsp;
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-view-24292f?style=flat" alt="Changelog" /></a>
</p>

<p align="center">
  <a href="https://tastecode.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/readme-tastecode-dark.webp" />
      <img src="assets/readme-tastecode.webp" alt="TasteCode is here. Taste Skill as a desktop app, with a design agent built in. Free and open source. Download at tastecode.dev" width="100%" />
    </picture>
  </a>
</p>

<h3 align="center">Sponsors</h3>

<table align="center">
  <tr>
    <td align="center" width="104">
      <a href="https://interfaces.dev/?utm_source=tasteskill&utm_medium=sponsorship">
        <img src="assets/sponsors/interfaces-dev-icon.webp" alt="Interfaces" width="52" height="52" />
      </a>
    </td>
    <td><sub><a href="https://interfaces.dev/?utm_source=tasteskill&utm_medium=sponsorship"><strong>interfaces.dev</strong></a> · A design engineering magazine by <a href="https://github.com/jakubkrehel"><strong>Jakub Krehel</strong></a></sub></td>
  </tr>
  <tr>
    <td align="center" width="104">
      <a href="https://reactbits.dev">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="assets/sponsors/reactbits-icon-dark.svg" />
          <img src="assets/sponsors/reactbits-icon-light.svg" alt="React Bits" width="52" height="52" />
        </picture>
      </a>
    </td>
    <td><sub><a href="https://reactbits.dev"><strong>React Bits</strong></a> · animated React components for creative interfaces</sub></td>
  </tr>
  <tr>
    <td align="center" width="104"><a href="https://img.ly/"><img src="assets/sponsors/imgly-logo.svg" alt="IMG.LY" width="52" height="52" /></a></td>
    <td><sub><a href="https://img.ly/"><strong>IMG.LY</strong></a> · CreativeEditor SDK</sub></td>
  </tr>
  <tr>
    <td align="center" width="104"><a href="https://www.sent.dm"><img src="assets/sponsors/sentdm.png" alt="Sent.dm" width="52" height="52" /></a></td>
    <td><sub><a href="https://www.sent.dm"><strong>Sent.dm</strong></a> · messaging APIs for SMS, WhatsApp, and RCS</sub></td>
  </tr>
</table>

<p align="center"><sub><a href="https://github.com/sponsors/Leonxlnx">Become a sponsor</a></sub></p>

**Taste Skill** is an Agent Skill that makes coding agents design websites and app screens instead of assembling the average landing page. It gives the agent an art direction, real pictures and a way to check its own work in a real browser.

Pages it has built, each from one brief:

<table>
  <tr>
    <td width="50%"><img src="examples/v2/coffee-storefront.webp" alt="Coffee shop page with a drawn storefront as its hero" /></td>
    <td width="50%"><img src="examples/v2/night-dates.webp" alt="Techno night page with its dates set into an archive photograph" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="examples/v2/coffee-roast.webp" alt="Coffee shop page section showing the roast in four photographs" /></td>
    <td width="50%"><img src="examples/v2/coffee-questions.webp" alt="Coffee shop page questions as stacked index cards" /></td>
  </tr>
</table>

The photographs are real, found in open archives and credited by the skill ([credits](examples/v2/CREDITS.md)). Watch the [launch film](https://github.com/Leonxlnx/taste-skill/releases/tag/v2.0.0).

## Install

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

That installs the skill with the [`npx skills`](https://github.com/vercel-labs/agent-skills) CLI.

The skill runs its scripts with **Node 22+** and an installed **Chrome, Edge or Chromium**. It installs nothing and needs no API keys. Finding pictures needs network access.

<details>
<summary>Claude Code plugin</summary>

Run these inside Claude Code. The skill is namespaced under `taste-skill:`, so it does not collide with your other skills.

```
/plugin marketplace add Leonxlnx/taste-skill
/plugin install taste-skill@taste-skill
```

`/plugin update` upgrades it later.

</details>

<details>
<summary>Codex plugin</summary>

```bash
codex plugin marketplace add Leonxlnx/taste-skill
codex plugin add taste-skill@taste-skill
```

Start a new Codex session afterwards so the skill is loaded.

</details>

<details>
<summary>From a clone, linked instead of copied</summary>

`./install.sh` symlinks the skill into Claude Code (`--codex` for Codex, `--all-agents` for both), so a `git pull` updates it in place.

</details>

Already have the skill? Run the install command again; the install name did not change. Looking for one of the older skills? See [Moved skills](#moved-skills).

## How v2 works

The skill is built from a study of 247 curated sites. A build runs in six steps:

1. Reads the brief and lists what only this client has.
2. A script deals three of 20 researched directions and the agent picks one.
3. Finds the idea: one sentence tying the client's own material to that direction.
4. Builds with real pictures and footage from open collections, credited.
5. Checks the page in a real browser at three widths and fails it on slop.
6. Looks at its own screenshots and fixes the top three problems, up to three rounds.

A build takes roughly 30 to 45 minutes and a few hundred thousand tokens. Details are in the [changelog](CHANGELOG.md) and the [study](skills/taste-skill/references/research.md).

Dashboards and app screens (v2.1) take their own route: the skill deals one of the app styles distilled from real product screens, builds the shell, the data, the charts and the tables to those numbers, and checks the result with app rules: quiet panels, aligned figures, colour spent on data, a phone layout where the navigation folds away. A product's landing page builds the app it shows the same way, so its screenshots look like a working product.

v2.1 also checks the frame of every page (a clear title on the first screen, equal margins, no section shoved to one side, no random blank stretches) and moves the way strong award sites do, measured on the latest 100 Awwwards Sites of the Day.

## Moved skills

This repo holds one skill, `design-taste-frontend`. The others moved to repos of their own and kept their install names:

| Install name | Where it lives now |
| --- | --- |
| `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `gpt-taste`, `stitch-design-taste`, `design-taste-frontend-v1`, `design-taste-frontend-v2-experimental` | **[Leonxlnx/taste-skill-classics](https://github.com/Leonxlnx/taste-skill-classics)** |
| `imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit`, `image-to-code` | **[Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills)** |
| `redesign-existing-projects` | Part of `design-taste-frontend`, which audits an existing page in a real browser before changing anything |
| `full-output-enforcement` | Removed. For the same problem, see **[Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy)** |

Install a moved skill from its new repo under the same name:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "high-end-visual-design"
```

## Common Questions

**What does the skill need?**  
Node 22 or newer and Chrome, Edge or Chromium. It installs nothing and uses no API keys. It needs the internet only to find pictures.

**Where do the pictures come from, and can I use them?**  
From open collections such as Wikimedia Commons, Openverse and the Met. Only public domain, CC0, CC BY and CC BY-SA files are offered, and the skill puts the credits on the page. Replace them with your own when you have them.

**Does it work with React, Vue, Svelte, plain HTML?**  
Yes. The rules are about design, not a framework.

**Is it for dashboards and app screens?**  
Yes, since v2.1. The skill tells a page from an app screen and builds a dashboard, an admin view or a settings screen with its own run: a style dealt from a study of real product screens, quiet panels, honest data and charts, and its own checks (`inspect.mjs --app`).

## Support the project

If Taste Skill helps you, consider sponsoring:

[Sponsor on GitHub](https://github.com/sponsors/Leonxlnx)

### Open Source Supporters

<table align="center">
  <tr>
    <td align="center" width="104"><a href="https://www.kimi.com"><img src="assets/sponsors/kimi-icon.png" alt="Kimi" width="52" height="52" /></a></td>
    <td><a href="https://www.kimi.com"><picture><source media="(prefers-color-scheme: dark)" srcset="https://kimi-file.moonshot.cn/prod-chat-kimi/kfs/4/1/2026-06-05/1d8h69mt3v89kkekg24gg" /><img alt="Kimi Open Source Friends" src="https://kimi-file.moonshot.cn/prod-chat-kimi/kfs/4/1/2026-06-05/1d8h69fudcmosb3pipls0" height="42" /></picture></a><br /><sub><a href="https://platform.kimi.ai?track_id=track-20f0d64bcaba419bb425a3e8c306f65d&aff=taste-skill"><strong>Get a Kimi API key</strong></a>: taste-skill users get 10% bonus API credits on their first purchase.</sub></td>
  </tr>
  <tr>
    <td align="center" width="104"><a href="https://vercel.com/open-source-program"><img src="assets/sponsors/vercel-logo.svg" alt="Vercel" width="52" height="52" /></a></td>
    <td><a href="https://vercel.com/open-source-program"><img src="assets/vercel-oss-program-badge.svg" alt="Vercel Open Source Program" height="28" /></a></td>
  </tr>
</table>

### Community Sponsors

<p>
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
<a href="https://github.com/denvit"><img src="https://github.com/denvit.png" width="40" height="40" style="border-radius:50%" alt="denvit" title="denvit" /></a>
<a href="https://github.com/onedollarstock"><img src="https://github.com/onedollarstock.png" width="40" height="40" style="border-radius:50%" alt="onedollarstock" title="onedollarstock" /></a>
<a href="https://github.com/KANA-33"><img src="https://github.com/KANA-33.png" width="40" height="40" style="border-radius:50%" alt="KANA-33" title="KANA-33" /></a>
<a href="https://github.com/emilkowalski"><img src="https://github.com/emilkowalski.png" width="40" height="40" style="border-radius:50%" alt="emilkowalski" title="emilkowalski" /></a>
<a href="https://github.com/AnthonyLiuVa"><img src="https://github.com/AnthonyLiuVa.png" width="40" height="40" style="border-radius:50%" alt="AnthonyLiuVa" title="AnthonyLiuVa" /></a>
<a href="https://github.com/Wolfy18"><img src="https://github.com/Wolfy18.png" width="40" height="40" style="border-radius:50%" alt="Wolfy18" title="Wolfy18" /></a>
<a href="https://github.com/Gigslol"><img src="https://github.com/Gigslol.png" width="40" height="40" style="border-radius:50%" alt="Gigslol" title="Gigslol" /></a>
</p>

<p align="center">
 <a href="https://www.star-history.com/leonxlnx/taste-skill">
  <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill" />
   <img alt="Star History Rank" src="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill" />
  </picture>
 </a>
</p>

<sub>Feedback: open an issue or pull request, DM [@lexnlin](https://x.com/lexnlin) or [@blueemi99](https://x.com/blueemi99), or email [hello@tasteskill.dev](mailto:hello@tasteskill.dev).</sub>

<sub>Taste Skill has no official token, coin, or crypto project. Any token using my name, image, or project is unaffiliated and not endorsed by me.</sub>

## License

[MIT License](LICENSE) · Copyright (c) 2026 Leonxlnx
