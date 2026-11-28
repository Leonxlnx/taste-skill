# Contributing

Thanks for helping. Two things keep this repo easy to review: **one change per pull request**, and **the checks green** before you open it.

## Repo layout

| Path | What it is |
|---|---|
| `skills/taste-skill/SKILL.md` | The skill itself: house rules, the page plans, and the frontmatter every agent parses |
| `skills/taste-skill/references/` | The design and copy references the skill routes to |
| `skills/taste-skill/scripts/` | The Node 22 CLI scripts (`consistency.mjs`, `gate.mjs`, `photos.mjs`, `start.mjs`, …), no packages |
| `skills/taste-skill/assets/` | The page kit the skill ships and checks: starter, layout, motion, moments, scenes, UI fragments |
| `skills/taste-skill/library/` | Palettes and type data (JSON) |
| `tests/` | The checks CI runs, plus `kit-clean.mjs` (a real-browser run of the kit's own page models) |
| `.claude-plugin/`, `.codex-plugin/`, `.agents/` | The plugin manifests agents install from |

## Local checks

CI runs three steps; run them before opening a PR:

```bash
npm install --no-save --no-package-lock yaml@2.6.1
node tests/frontmatter.mjs     # every SKILL.md frontmatter parses the way agents parse it
node tests/text-encoding.mjs   # no double-encoded text
node --check skills/taste-skill/scripts/*.mjs   # scripts parse (CI walks scripts/ and assets/)
```

If your change touches the page kit (`assets/layout`, `assets/motion`, the checker itself), the kit's own page models must still pass the checker:

```bash
node tests/kit-clean.mjs       # needs Chrome; one page takes one to three minutes on the CPU
```

`kit-clean.mjs` is what the release rehearsals run — do not ship a checker or layout change without it.

## Conventions

- **Commits:** `fix(scope): …`, `feat(scope): …`, `docs: …`, with the scope the area touched (`fix(photos):`, `fix(gate):`, `fix(copy-lint):` …). One logical change per commit.
- **Scripts:** Node 22+, no npm packages, `#!/usr/bin/env node` with a comment block that documents every subcommand and flag — the block is printed as the help text. Errors go to `stderr` as `script: message`, usage errors exit 2, failures exit 1.
- **Versions:** user-facing changes bump the version everywhere it lives — `SKILL.md` (description), `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json` — and get a `CHANGELOG.md` heading. Experimental pre-releases iterate freely; stable releases lock the API (see the changelog's note).
- **Skill prose:** the references and `SKILL.md` are written the way the skill writes pages — plain, specific, no filler. Match the surrounding voice.
- **Windows:** `install.sh` must keep working on Git Bash (symlinks, junction fallback). If you touch it, test on macOS/Linux and reason through the Windows paths; CI covers the POSIX side.

## Reporting bugs

Open a bug report with the version, the agent, the OS, the exact command and the full output — the template asks for them. A report without its output usually cannot be reproduced.
