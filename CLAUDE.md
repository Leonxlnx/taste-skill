# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Repo Is

Taste Skill is a collection of portable **Agent Skills** — instruction files (`SKILL.md`) that AI coding agents load to produce premium, anti-generic frontend UIs. It is not a code library or npm package; it is a content repository of prompts and design directives.

Each skill installs via:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

There is no build step, test suite, or package.json. The primary deliverables are the `SKILL.md` files themselves.

---

## Repo Structure

- **`skills/`** — One subfolder per skill, each containing a `SKILL.md`. Core content of the repo.
- **`skills/llms.txt`** — One-line descriptions of all skills; used as a discovery manifest.
- **`skill.sh`** — Local registry mapping short names to SKILL.md paths. Run with `source ./skill.sh <skill-name>` to print a path.
- **`research/`** — Background research (LLM laziness, output truncation) that shaped the skills. Markdown only.
- **`.github/copilot-instructions.md`** — GitHub Copilot global behavior rules for this repo.

---

## Skill Inventory

| Folder | Install name | Kind |
|--------|-------------|------|
| `taste-skill` | `design-taste-frontend` | Implementation — v2 experimental (current default) |
| `taste-skill-v1` | `design-taste-frontend-v1` | Implementation — v1, preserved for backward compat |
| `gpt-tasteskill` | `gpt-taste` | Implementation — stricter, GPT/Codex-oriented |
| `image-to-code-skill` | `image-to-code` | Implementation — image → analyze → code pipeline |
| `redesign-skill` | `redesign-existing-projects` | Implementation — audit-first redesign of existing codebases |
| `soft-skill` | `high-end-visual-design` | Implementation — polished, calm, premium aesthetic |
| `output-skill` | `full-output-enforcement` | Implementation — prevents AI output truncation |
| `minimalist-skill` | `minimalist-ui` | Implementation — editorial/Notion-style |
| `brutalist-skill` | `industrial-brutalist-ui` | Implementation — Swiss type, mechanical aesthetic |
| `stitch-skill` | `stitch-design-taste` | Implementation — generates DESIGN.md for Google Stitch |
| `imagegen-frontend-web` | `imagegen-frontend-web` | Image-generation only — website section comps |
| `imagegen-frontend-mobile` | `imagegen-frontend-mobile` | Image-generation only — mobile screen concepts |
| `brandkit` | `brandkit` | Image-generation only — brand identity boards |

---

## Key Design Conventions (Enforced Across Skills)

- **Dial system**: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` (1-10). taste-skill v2 default: 8 / 6 / 4.
- **No em-dashes** (`—`) anywhere on generated pages — the single most-violated AI "tell". Use hyphens or restructure.
- **No generic fonts**: Inter, Roboto, Arial, Open Sans are banned across all skills.
- **No placeholder code**: `output-skill` enforces complete generation. `.github/copilot-instructions.md` applies repo-wide.
- **Motion standard**: Spring physics only (never linear easing). `motion/react` (Framer Motion rebrand) preferred; GSAP for scroll pinning/scrubbing.
- **Section numbering eyebrows** (`00 / INDEX`, `001 · Capabilities`) are banned in v2.
- **Tailwind v4** is the default for taste-skill v2; v3 only for existing projects that require it.

---

## Adding or Modifying a Skill

1. Create or edit `skills/<folder>/SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: install-name-here
   description: One-sentence description shown in discovery.
   ---
   ```
2. Update `skills/llms.txt` with a matching one-line entry (`install-name: description`).
3. If the skill is new, add it to the `SKILLS` map in `skill.sh`.
4. Update the skills table in `README.md` and add a `CHANGELOG.md` entry.

---

## Environment — MCP Servers Available

These MCP tools are connected in this Claude Code session and can be used directly.

### GitHub (`mcp__github__*`)
Full GitHub API access scoped to `filzendirk-boop/taste-skill`:
- Read/write files, branches, commits, PRs, issues, releases, tags
- Search code, commits, issues, PRs, users, repositories
- Manage PR reviews, comments, labels, merges, CI checks
- Subscribe/unsubscribe to PR activity events

### Google Drive (`mcp__Google_Drive__*`)
- `read_file_content`, `download_file_content` — read docs/sheets/files
- `create_file`, `copy_file` — create new Drive files
- `search_files`, `list_recent_files` — discover files
- `get_file_metadata`, `get_file_permissions` — inspect file details

### Supermetrics Marketing Analytics (`mcp__Supermetrics_Marketing_Analytics__*`)
Access to 150+ marketing/advertising/analytics data sources (Google Ads, Meta, GA4, etc.):
- `data_source_discovery` → `accounts_discovery` → `field_discovery` → `data_query` → `get_async_query_results`
- `campaign_create`, `campaign_update`, `campaign_and_resource_get`
- `manage_user_and_team`, `resources_manage`

### Vibe Prospecting (`mcp__Vibe_Prospecting__*`)
B2B prospect and business enrichment:
- `match-business`, `match-prospects` — find companies/people
- `enrich-business`, `enrich-prospects` — get detailed data
- `fetch-entities`, `fetch-entities-statistics` — query the dataset
- `fetch-businesses-events`, `fetch-prospects-events` — activity events
- `export-to-csv`, `autocomplete`, `estimate-cost`, `show-pricing-plans`

---

## Environment — Agent Types Available

Spawn these via the `Agent` tool with `subagent_type`:

| Agent | Best for |
|-------|----------|
| `claude` | General catch-all; default when no specific type fits |
| `claude-code-guide` | Questions about Claude Code CLI, Agent SDK, or Anthropic API |
| `Explore` | Fast read-only code search — find files, symbols, references |
| `general-purpose` | Multi-step research, complex searches, open-ended tasks |
| `Plan` | Implementation planning, architecture, trade-off analysis |
| `statusline-setup` | Configure the Claude Code status line |

---

## Environment — Skills (Slash Commands) Available

Invoke these via the `Skill` tool (or type `/<name>` in chat):

| Skill | What it does |
|-------|-------------|
| `autopilot` | End-to-end task: plan → implement → review → open PR |
| `bugfix` | Reproduce-first bug fixer → minimal fix → regression test → PR |
| `code-review` | Review diff for bugs and cleanups; `--comment` posts to PR, `--fix` applies changes |
| `security-review` | Security audit of pending branch changes |
| `simplify` | Cleanup pass: reuse, simplification, efficiency |
| `verify` | Run the app and observe real behavior in browser |
| `run` | Launch the project app (CLI/server/browser) |
| `docs` | Write or update documentation for a feature/API |
| `dashboard` | Build a metrics/monitoring dashboard |
| `investigate` | Root-cause analysis — produces a report, not a PR |
| `deep-research` | Multi-source web research with adversarial fact-checking |
| `init` | Initialize a new CLAUDE.md for a repo |
| `review` | Review a pull request |
| `loop` | Run a command on a recurring interval |
| `update-config` | Edit `settings.json` — hooks, permissions, env vars |
| `keybindings-help` | Customize `~/.claude/keybindings.json` |
| `fewer-permission-prompts` | Scan transcripts and add allowlist to reduce permission prompts |
| `claude-api` | Build/debug Anthropic SDK apps; handles prompt caching |
| `session-start-hook` | Create a SessionStart hook for web sessions |

---

## Copilot / AI Behavior in This Repo

`.github/copilot-instructions.md` sets repo-wide rules: no generic UI, proportional `clamp()` spacing, spring physics for all animations, complete implementations (no TODOs), and read localized `SKILL.md` files for deep style configuration.

---

## K9 Experience Solution — Application Multi-Agents

**Dossier:** `k9-agents/`

Application Next.js privée pour **K9 Experience Solution S.A.R.L.-S** (Luxembourg).

### Informations société
- **Nom:** K9 Experience Solution S.A.R.L.-S
- **Adresse:** 177 Rue de Luxembourg, L-8077 Bertrange, Luxembourg
- **TVA:** LU37311931 · **RCS:** B305408
- **Gérant:** Dirk Filzen
- **Tel:** +352 621 782 523 · **Email:** k9.exp.solutions@icloud.com
- **Statut gérant:** Résident allemand (Schönecken), nationalité belge, travailleur frontalier

### Produits distribués
| Produit | Fournisseur | Pays |
|---------|-------------|------|
| CProFood | CERAL sa | Belgique |
| Bel'Croc | - | Belgique |
| G&C Systems (ventilation véhicules) | G&C Systems | Pays-Bas |
| Firepaw (tapis de course canin) | - | Bulgarie |
| Dog Runner (tapis de course canin) | - | - |

### Architecture de l'app
```
k9-agents/
  app/
    api/claude/route.js   ← proxy serveur (clé API jamais exposée au browser)
    layout.js
    page.js
  components/
    K9Agents.jsx          ← UI principale (appelle /api/claude)
  .env.local              ← ANTHROPIC_API_KEY (gitignore, ne jamais committer)
  .env.local.example      ← template vide à copier
  package.json
```

### Agents disponibles
| Agent | Rôle |
|-------|------|
| 💰 Agent Tarifs | Prix TVAC (TVA 3%), marges, offres clients (markup min. 50%) |
| 📣 Agent Marketing | Contenu social media en FR/DE/EN/LU |
| 🤝 Agent Fournisseurs | Courriers professionnels fournisseurs |
| ⚖️ Agent Juridique | TVA Luxembourg, documents officiels, administratif |
| 🚚 Agent Logistique | Stocks, commandes, livraisons |
| 📊 Agent Marché | Analyse concurrence, tendances, marchés LU/BE/FR/DE/NL |
| 🧠 Tous les Agents | Lance les 6 agents simultanément |

### Lancer l'app en local
```bash
cd k9-agents
cp .env.local.example .env.local
# Edite .env.local et mets ta vraie clé ANTHROPIC_API_KEY=sk-ant-...
npm install
npm run dev
# Ouvre http://localhost:3000
```

### Sécurité clé API
- La clé API Anthropic est stockée uniquement dans `.env.local` (gitignored)
- Le browser appelle `/api/claude` (route Next.js serveur)
- La route serveur ajoute la clé et forward à `api.anthropic.com`
- Jamais de clé dans le code frontend — jamais visible dans DevTools
