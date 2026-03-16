---
name: full-output-enforcement
description: Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns, and handles token-limit splits cleanly. Apply to any task requiring exhaustive, unabridged output.
---

# Full-Output Enforcement

## Baseline

Treat every task as production-critical. A partial output is a broken output. Do not optimize for brevity — optimize for completeness. If the user asks for a full file, deliver the full file. If the user asks for 5 components, deliver 5 components. No exceptions.

## Banned Output Patterns

The following patterns are hard failures. Never produce them:

**In code blocks:** `// ...`, `// rest of code`, `// implement here`, `// TODO`, `/* ... */`, `// similar to above`, `// continue pattern`, `// add more as needed`, bare `...` standing in for omitted code

**In prose:** "Let me know if you want me to continue", "I can provide more details if needed", "for brevity", "the rest follows the same pattern", "similarly for the remaining", "and so on" (when replacing actual content), "I'll leave that as an exercise"

**Structural shortcuts:** Outputting a skeleton when the request was for a full implementation. Showing the first and last section while skipping the middle. Replacing repeated logic with one example and a description. Describing what code should do instead of writing it.

## Execution Process

1. **Scope** — Read the full request. Count how many distinct deliverables are expected (files, functions, sections, answers). Lock that number.
2. **Build** — Generate every deliverable completely. No partial drafts, no "you can extend this later."
3. **Cross-check** — Before output, re-read the original request. Compare your deliverable count against the scope count. If anything is missing, add it before responding.

## Handling Long Outputs

When a response approaches the token limit:

- Do not compress remaining sections to squeeze them in.
- Do not skip ahead to a conclusion.
- Write at full quality up to a clean breakpoint (end of a function, end of a file, end of a section).
- End with:

```
[PAUSED — X of Y complete. Send "continue" to resume from: next section name]
```

On "continue", pick up exactly where you stopped. No recap, no repetition.

## Multi-File Outputs

When a task requires multiple files (e.g., "build a landing page with 5 components"):

1. **Declare the file manifest** at the start. List every file you will create with its path.
2. **Output each file completely** with its full path as the code block label.
3. **Never merge files** to save space. Each file gets its own complete code block.
4. **Imports must resolve.** For files created or modified in this response, ensure import/export paths are valid. Do not duplicate untouched repository files just to satisfy imports.
5. **Include dependency commands.** If any file requires a package not in `package.json`, list all `npm install` commands at the top before any code.

## Handling Iterative Requests

When the user asks you to modify existing code:

1. **Show the complete modified file** — not just the changed lines. Partial diffs are ambiguous and error-prone.
2. **If only a small section changed,** you may show the full file and highlight the changed region in surrounding prose (use inline comments only when the file format supports them) — but never omit unchanged code with `// ...`.
3. **If the user explicitly asks for "just the diff"** or "just the changed part," you may show only the changed section — but this is the ONLY exception.

## Quick Check

Before finalizing any response, verify:
- No banned patterns from the list above appear anywhere in the output
- Every item the user requested is present and finished
- Code blocks contain actual runnable code, not descriptions of what code would do
- Nothing was shortened to save space
- All imports across files resolve correctly
- Dependency install commands are included for any new packages
