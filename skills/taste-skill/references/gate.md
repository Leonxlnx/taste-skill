# The finish gate

A build is not finished while the checker still finds a FAIL it could fix. `scripts/gate.mjs` runs the
checks that matter, lists what is open, and counts rounds, so a build iterates for real and still ends.

## Arm it

At step 1, before any page exists:

```bash
node <skill>/scripts/gate.mjs --start index.html --kind <kind> --category "<what is sold>" --primary "<main action>"
```

- A framework build names what a browser can open: its dev server's URL (`--start http://localhost:5173/`,
  with the server running when the gate runs) or its built page (`--start dist/index.html --root dist`).
  A built page is checked as built: rebuild before every gate run, or the round is spent on the old build.
  The gate opens only a local page: a file, or a URL on `localhost`, `127.0.0.1`, `[::1]`, `*.localhost`
  or `*.test`.
- `--start` on a build whose rounds are still open does not reset them: it only updates the page, URL,
  root, kind, category and primary it checks. `--start --new` begins a new build. `--rounds N` (3 by
  default) is set only when a build begins.
- `start.mjs deal` arms the folder as well when no build is open there; `css` and `brand` never do.

## What it does

- **A build is active** while `.taste-skill/build.json` exists in the project folder (or one or two
  folders below), or while `.taste-skill/gate.json` says its rounds are still open: deleting the marker
  does not end a build. A `start.mjs deal` in a folder one or two below an open build joins that build
  instead of arming a second one.
- **The page:** the one named, else the marker's page or URL, else `index.html`, else the only `.html`
  file, else the `index.html` of the only folder below that has one.
- **The checks**, one at a time, each in its own headless Chrome with a fresh profile:
  `consistency.mjs --quick --widths 1440,390` (with the kind the page declares, else the marker's, and its category, primary and
  root, as step 6 runs it) and `assets/layout/check.mjs --sizes 1440x900,390x844`. The consistency run includes
  `empty-area` (a section over 35% empty inside its container WARNs, over 50% FAILs) and the `basics`
  block (names, alt, labels, heading order, the Tab walk, lang, head tags, map links, assumed facts):
  their FAILs block like the others; their WARNs (skip-link, share-meta, action-repeat at two,
  assumed, the form's `.example` stand-in) never do. The quick run leaves out what only step 6's full
  run checks: `forms`, `reduced-motion`, `hover-move`, `hover-spill`, `loop-pause`, `hidden-visual`, the scroll walks. The 390 width brings the phone checks (`collide`,
  `tap-size`) and a walk at 320 for anything past the screen (`off-viewport`); `hidden-content` also
  loads the page with scripts off. Plus two read from the files:
  - **kit-edited**: a file the page loads from `assets/` differs from the skill's copy (whitespace,
    quotes, semicolons and commas aside, so a formatter is not an edit). A kit copy from an older skill version
    counts too: copy the current one.
  - **checker-gaming**: the page's own code tests for `navigator.webdriver`, `window.__playwright`,
    `callPhantom` or the checker's `__cc` hooks (code only: a code sample in a string is not a test).
  - **gaming-suspect** (waivable): a user-agent test for "headless", or `aria-hidden` stripped from every
    picture a selector finds. The kit's own `assets/motion/motion.js` tests for `HeadlessChrome` (its
    `shot()`: in a headless browser the counts and the hero entrance stand as written, at their end,
    unless the page sets `data-motion="live"`). An unchanged kit copy is skipped by its text; a build that bundles or ports it
    (a framework's `src/lib/motion.js`, a `dist/assets/index-*.js`) gets this finding for the kit's
    line: waive it with "the kit's motion.js shot() test, ported unchanged" as the reason.
  - **the copy** (waivable): `scripts/copy-lint.mjs --json --kind <kind>` on the page's file, or, when
    the file holds no sections (a built app, a dev server), on the page as the checker's browser built
    it; with neither the copy is listed as not checked, never passed. Its FAILs block (`copy-residue`,
    `copy-slop-word`, `copy-stock-phrase`, a device used twice its budget plus one times or more (two-fragment and number-pair headings, contrast
    frames, negation runs, virtue words; riders, puffery, reveals and repeated promises only WARN), a
    brand coined as Kestrel or Halcyon); its WARNs are listed and never block (`copy.md`,
    `copy-tells.md`; `copy-brand-word` is a listed word inside the client's own name). These are
    copy-lint's ids; the checker's copy-headline, copy-fact and the rest are its own. No browser: under
    a second.

  A file whose text is a kit file's is the kit's, wherever it sits. The two checkers' ids for one fault of
  one section (section-height / screen-height / screen-short, one-section / neighbour) are one finding.
  A full run takes a few minutes on a CPU Chrome.
- **WARNs never block,** but for two house rules the checker only WARNs and the gate holds as FAILs:
  `hero-enter` (the hero has no `data-enter`, or the head line that sets `html.m-enter` is missing) and
  `moment-none` (the page deals no moment). The first few WARNs are listed.
- **Waivers.** A FAIL you judge false goes in `.taste-skill/waivers.json`:

  ```json
  [{ "check": "one-section", "target": "section#visit", "reason": "the hours list is one screen at 390; the check counts the phone bar" }]
  ```

  `check` is the finding's id, `target` a part of where it is (3+ characters, or the whole of a short
  where), `reason` 12+ characters.
  One waiver covers one finding: a target that matches several is ignored and says "name one". Each
  copy word, stock phrase or residue hit is its own finding, named by the word and its sentence; a copy
  device used as a tic is one finding, waived only by its whole where as the gate prints it (its count
  and hits), so nothing added later is covered. A word the client's own copy uses (the brief quotes it)
  is waived hit by hit with the brief as the reason. A waived
  FAIL is printed as WAIVED: it goes in the report. kit-edited and checker-gaming cannot be waived. More
  than 5 waivers is itself a FAIL: "too many waivers: fix instead".
- **Rounds** (`.taste-skill/gate.json`). A run whose page or waivers changed since the last round is a
  round; a manual rerun of an unchanged page is not. A hook stop before the gate's first run by hand in
  the build is no round either: it lists the FAILs and blocks (its blocks are counted apart), and the
  first run by hand counts that page's round, so a question to the user mid-build costs nothing. After
  a hook block, the next finish on the unchanged page is allowed once without a round (a question to
  the user: the block says "just stop again"); other finishes on it block twice without a round
  ("nothing changed"), then each counts as one; a change starts that count again. Below the last
  round: FAIL, fix, finish again. At the last round the gate says once "rounds used up": stop fixing,
  put the open FAILs in the report, finish. Every later finish is allowed. A PASS, and the last
  round's OPEN, rename `build.json` to `build.done.json`, so a later deal starts a build of its own.
- **When the user ends it.** Only when the user tells you to stop, or to ship the page as it is:
  `gate.mjs --done "<what they said>"` (12+ characters) closes the build with their words: status
  `done` in `gate.json`, `build.json` renamed to `build.done.json`, every later finish allowed. Its
  last line is `GATE: DONE (...)`; put it, their words and the open FAILs in the report. Never for
  your own call that the page is good enough: that is what the rounds are for.
- **It never traps an agent.** Every block is counted in `.taste-skill/gate-blocks.json`, which `--start`
  never clears; past the rounds plus 4 blocks for one build (the blocks before the first run by hand
  have that many of their own), or 30 in 6 hours in the folder, every finish is allowed. No page, a framework shell, or checks that crashed or ran past 9.5 minutes block once with
  what to do, then allow. A crashed or timed-out run is stored for its page: a later finish on the
  unchanged page reuses it instead of running the checks again (once more at most, when the agent was
  not yet told). Each check runs with a watchdog that kills it, and its Chrome, if the gate is
  killed; nothing else is ever killed.

## The manual gate

```bash
node <skill>/scripts/gate.mjs index.html
```

Its last line is exactly one of:

```
GATE: PASS
GATE: FAIL <n> (round <k> of <max>)
GATE: OPEN <n> (rounds used up)
GATE: QUICK <n> (not a round; run without --quick to finish)
GATE: SETUP (...)
GATE: ERROR (...)
GATE: OFF (no build active)
GATE: DONE (<the user's words>)      after --done
```

PASS: finish. FAIL: fix what it lists and run it again. OPEN: stop fixing; the open FAILs and the waivers
go in the report. QUICK: a look between rounds, never the last line of a build. SETUP (no page yet, a
framework's source shell, a page that is not local): arm what a browser can open (`--start`, above) and
run it again. ERROR (the checks themselves could not run) or OFF (no build armed here): put the line in
the report and finish; do not rerun. Above the line: every open FAIL with where it is and the fix, every
waiver, the first WARNs. `--quick` (the checker at 1440 and 390, the layout check at 1440) is never a round. The crops are in
`.taste-skill/gate/consistency`.

## As a hook

In Claude Code the skill's own frontmatter adds the gate as a Stop hook once the skill is invoked. The
command is one POSIX `sh` line (Git Bash on Windows, `sh` on macOS and Linux) that runs the first
`gate.mjs` it finds, in this order: `$CLAUDE_SKILL_DIR/scripts/`, `$CLAUDE_PLUGIN_ROOT/scripts/` and
`$CLAUDE_PLUGIN_ROOT/skills/taste-skill/scripts/` (a plugin install), each only when the variable is
set; then the install folders by name, `$CLAUDE_PROJECT_DIR/.claude/skills/design-taste-frontend/`,
`$CLAUDE_PROJECT_DIR/.agents/skills/design-taste-frontend/`, `~/.claude/skills/design-taste-frontend/`
and `~/.agents/skills/design-taste-frontend/` (`npx skills`, `install.sh`). When it finds none, the stop
is allowed with no hook error; when the folder has a `.taste-skill` it writes
`.taste-skill/gate-hook-missing.txt` (the time and the variables it read), and when a build is armed
there or one folder below it prints `tasteskill gate: gate.mjs not found (CLAUDE_PLUGIN_ROOT=...)` on
stderr, so a hook that never reached the gate shows in the transcript. A skill installed under another
folder name, other apps, or a Claude Code without skill hooks take one of these. Each runs in every
session of the project and finds a build in its folder or one or two below. Where none is active it
exits at once, but once for a tasteskill page (a `page-type` meta) changed in the last day in the
folder or one below that was never armed: it says how to arm it (`.taste-skill/unarmed.json` records
that it told). It holds only the first session it blocks, lets an orchestrator
whose builds sit in two or more folders below stop, and ignores a build idle for 24 hours. Replace
`/path/to/skill` with the skill's folder.

**Claude Code**, `.claude/settings.json` (blocks with JSON on stdout):

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node \"/path/to/skill/scripts/gate.mjs\" --hook claude", "timeout": 600 } ] }
    ]
  }
}
```

**Codex**, `.codex/hooks.json` (the same output as Claude Code: `{"decision":"block","reason":...}`):

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node \"/path/to/skill/scripts/gate.mjs\" --hook codex", "timeout": 600 } ] }
    ]
  }
}
```

**Antigravity**, `.agents/hooks.json` (it answers `{"decision":"continue","reason":...}` to keep the agent working):

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node \"/path/to/skill/scripts/gate.mjs\" --hook antigravity", "timeout": 600 } ] }
    ]
  }
}
```

In every mode the gate allows a stop by printing nothing and exiting 0. It reads the hook's JSON on stdin
(2 seconds at most) for `cwd` and `session_id`; `stop_hook_active` does not end the rounds early, the round
count in `gate.json` does.

Every hook call leaves one entry in `gate.json`'s `history`, an allowed stop too: `"mode": "hook"`, the
`host`, `"decision": "allow"` or `"block"` and a short `reason` (a run of the checks adds its status, FAIL
count and round). After a PASS or with the rounds used up it goes in that build's `gate.json`; with no
build armed, in the newest `gate.json` in the folder or one or two below, else in the folder's own
`.taste-skill` when there is one. It never makes a new `.taste-skill` folder, and never writes into a build
below that an orchestrating session does not hold. An entry alone keeps the file's time, so it never
makes an idle build look active.

A hook added by a skill belongs to the main session: a subagent that loads the skill is not held, and its
parent is held instead. Run the manual gate inside a subagent.
