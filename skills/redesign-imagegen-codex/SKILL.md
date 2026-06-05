---
name: redesign-imagegen-codex
description: Screenshot-first redesign workflow for Codex. Use when improving an existing web UI with browser access: capture the live page with Chrome DevTools MCP or another browser tool, audit the screenshots, generate redesigned visual references, then implement targeted code changes against the existing project.
---

# Redesign Imagegen Codex

Use this skill for existing websites or apps where visual quality matters and Codex can inspect the running UI in a browser.

The workflow is screenshot-first:

1. **Run the project**
   - Read the repo first.
   - Identify the framework, package manager, and dev command.
   - Start the local app or use the user's provided URL.
   - Do not redesign from code alone when the UI can be opened.

2. **Capture the current UI**
   - Prefer Chrome DevTools MCP when available.
   - Otherwise use Playwright, browser screenshots, or the available screenshot tool.
   - Capture desktop and mobile viewports.
   - Capture key states: hero/top screen, major sections, navigation, forms, empty/error/loading states when reachable.
   - Save screenshots as artifacts so the redesign has a concrete baseline.

3. **Audit before imagining**
   - Inspect the screenshots before generating new visuals.
   - Identify what must be preserved: content, IA, conversion goals, brand assets, product constraints, accessibility needs.
   - Identify visual debt: weak hierarchy, generic AI patterns, spacing issues, color/contrast problems, awkward responsive behavior, missing interaction states.
   - State whether this is a preserve-and-polish redesign or a full visual overhaul.

4. **Generate redesigned references**
   - Generate new reference images from the captured UI and audit.
   - Use one clear image per important section or state.
   - Keep references implementation-friendly: readable typography, visible spacing, clear component boundaries, realistic responsive behavior.
   - Do not generate an unrelated fantasy concept. The new references must answer the existing product's actual page structure.

5. **Analyze the generated references**
   - Extract layout, spacing, typography, color, surface treatment, motion, and component rules.
   - Decide what can be implemented safely with the current stack.
   - Avoid migrations, new design systems, or extra dependencies unless the existing project already supports them or the user explicitly asks.

6. **Implement targeted changes**
   - Work with the existing framework and styling system.
   - Preserve behavior, routes, forms, data loading, and accessibility semantics.
   - Make scoped visual upgrades instead of rebuilding the app from scratch.
   - If generated imagery is needed but unavailable at implementation time, create clear asset slots and document the required image dimensions.

7. **Verify in-browser**
   - Reopen the modified page.
   - Capture after screenshots for the same viewports and states.
   - Check layout, text fit, contrast, focus states, hover/pressed states, and mobile overflow.
   - Run the closest available tests or build command.

## Rules

- Do not skip the screenshot baseline.
- Do not rely on screenshots only from one viewport.
- Do not overwrite existing brand identity unless the user asks for a full rebrand.
- Do not replace working product UI with static mockups.
- Do not invent fake data where the existing app already provides real data.
- Do not use image generation as decoration; use it to create buildable design direction.

## Output Contract

When reporting back, include:

- baseline screenshots captured
- redesign references generated
- files changed
- verification commands run
- any visual risks or assets still needed
