# Taste pre-flight tooling

`taste-check` automates the mechanically testable part of the Taste Skill v2 Final Pre-Flight Check (Section 14).
It is deliberately dependency-free and uses Node.js built-ins only.

## Run it

```bash
node tools/taste-check.mjs app components
node tools/taste-check.mjs ./out/index.html
node tools/taste-check.mjs app components --format json
```

The command exits with `0` when no error-level findings are present, `1` when a pre-flight rule fails, and `2` for invocation or filesystem errors. JSON output is intended for CI and agent tooling.

## What is automated

The checker currently covers rules that can be evaluated statically without pretending to understand visual taste:

| Rule | Confidence | What is checked |
| --- | --- | --- |
| `no-em-dash` | deterministic | Zero `—` characters in renderable source after comments and Markdown code fences are ignored |
| `no-h-screen` | deterministic | Tailwind `h-screen` usage |
| `no-scroll-listener` | deterministic | Direct `scroll` event listeners and `.onscroll =` handlers |
| `no-scroll-cue` | high | Named decorative scroll-cue phrases from Section 14 |
| `no-placeholder-identity` | high | Named generic identities such as Jane Doe and Acme |
| `no-ai-tell-copy` | high | Named AI-tell phrases such as "Quietly in use at" |
| `one-design-system` | high | Imports or dependency declarations from more than one known design-system family across the checked project |
| `hero-max-four-text-blocks` | structural | More than four top-level semantic text/CTA blocks in an explicitly identified hero |
| `hero-subtext-word-limit` | structural | Hero paragraphs above the Section 14 20-word cap |

Structural HTML-ish checks support `.html`, `.htm`, `.jsx`, `.tsx`, `.vue`, `.svelte`, and `.mdx`. A hero is recognized from an explicit `hero` class or `data-section`, an id ending in `hero`, an aria label containing the word `hero`, or a component name ending in `Hero`. Names such as `hero-copy` are not treated as separate hero roots.

The parser is intentionally small: it recognizes ordinary HTML/JSX-like tags and does not attempt to execute components or infer runtime DOM output. Markdown and MDX fenced examples, source comments, generated directories, and dependency directories are ignored where appropriate to reduce false positives.

Generated/dependency directories such as `node_modules`, `.next`, `dist`, `build`, `coverage`, and `.svelte-kit` are skipped.

## What remains manual

Static analysis cannot honestly determine whether a hierarchy is visually strong, whether contrast passes after runtime styles resolve, whether a responsive composition feels correct, whether motion is motivated, or whether Core Web Vitals are actually met. Those checks remain in the Section 14 matrix and must still be performed on the rendered page.

This boundary is intentional. A pre-flight tool is useful only if a passing result means something; broad regexes that claim to validate subjective design quality would create false confidence.

## CI example

```yaml
- name: Taste Skill pre-flight
  run: node tools/taste-check.mjs app components
```

For machine-readable annotations:

```bash
node tools/taste-check.mjs app --format json > taste-check.json
```

## Tests

```bash
node --test tests/taste-check.test.mjs
```

The test suite covers location reporting, comment and fenced-example filtering, hero-root detection, CTA grouping, hero copy limits, design-system mixing from source and `package.json`, directory exclusions, and CLI exit semantics.
