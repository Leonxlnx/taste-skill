# Inside a framework project

How a page built in an existing React, Next.js, Vue, Svelte or Astro project uses the kit and the checks. The
design rules are the same as for a static page; only where the files sit, how the scripts start and what the
checks open differ.

## Where the kit goes

- Copy `<skill>/assets` into the folder the framework serves as plain files: `public/assets` (Next.js, Vite,
  Nuxt, Astro), `static/assets` (SvelteKit). It is served as it is and never imported into the bundle: the kit's
  modules load each other, and every effect, fragment and moment, by URL from their own file
  (`new URL('moments/moments.js', import.meta.url)`), so they stay plain files.
- Every path in markup starts at the site root: `/assets/system.css`, `/assets/img/hero.webp`. The starter's
  `assets/...` is relative and breaks on a nested route (`/work/case` would ask for `/work/assets/...`).
- `photos.mjs fetch <ids> --out public` writes the frames to `public/assets/img`; write the printed paths with a
  leading `/`. `icons.mjs scan <the files that hold the markup> --out public/assets/icons` reads `data-icon`,
  `data-diagram` and fragment icon paths in any text file, JSX and `.vue` too.
- The kit's files stay unedited (`kit-edited`): the gate reads `src`, `app`, `pages`, `components`, `lib` and
  `public`, and a file under `public/assets` that differs from the skill's copy FAILs as in a static build.

## The markup and the head

- Components take the starter's markup and classes as written (`class` becomes `className` in JSX). Keep its
  tree: `main > section`, `main > .hero`, `body > nav.actionbar`. system.css and system.js select by those
  child steps, so a component returns a fragment, never a wrapper `div` around a section. An app mounted in
  `#root` or `#app` (Vite) has no `body > nav.actionbar`: render the bar into `document.body` with a portal,
  or the phone bar never shows.
- The head as the starter has it, in the root layout: the kit's stylesheets in the starter's order, the
  Google Fonts links and the `:root` block `start.mjs css` prints (an inline `<style>` after the kit's links),
  `<html lang data-type data-radius data-ground data-buttons data-motion>`, the page meta (Next.js:
  `metadata`, `other: { 'site-kind': '<kind>' }`), the two one-line class scripts (`m-enter`, `mo-js`) and
  `/assets/backgrounds/backgrounds.js` as a plain script. These run before the first paint and set classes and
  attributes on `<html>` before the framework hydrates it: give `<html>` `suppressHydrationWarning` (React).

## The scripts, after hydration

system.js, motion.js, layout.js (and `diagrams/mount.js`, `objects/_print-core/auto.js` or `scenes/scenes.js`
when the page has one) start once, when they load, on the DOM that is there. Load them after the framework
has rendered and hydrated the page, from the root layout, as module scripts in the starter's order:

```jsx
'use client'; // Next.js App Router; a Vite React app needs no directive
import { useEffect } from 'react';
const KIT = ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js'];
export default function Kit() {
  useEffect(() => {
    for (const src of KIT) {
      if (document.querySelector(`script[src="${src}"]`)) continue;
      const s = document.createElement('script');
      s.type = 'module'; s.src = src; s.async = false;
      document.body.append(s);
    }
  }, []);
  return null;
}
```

Vue and Nuxt run the same loop in `onMounted`, Svelte and SvelteKit in `onMount`. Astro sends plain HTML: the
starter's tags as written, with `/assets/...` paths and `is:inline` on each script so Astro leaves it alone.

- **Once per page load.** A module runs once per document, so a client-side route change leaves the new page's
  nav, fragments, effects and moments unstarted. Link between pages built on the kit with a plain `<a href>`
  (in Next.js not `next/link`), so each page is a full load.
- **The DOM the kit owns.** After it starts, the kit writes into: `<html>` (classes `m-enter`, `mo-js`,
  `mo-safe`; `data-tone`, `data-ground`, `data-ready`, `data-mode` and the other ground marks), `body.nav-locked`,
  the nav (`is-open`, the toggle's icon and `aria-expanded`, a `.nav__expand` button where the markup has none),
  tabs and their panels (`hidden`, `aria-selected`), `.faq details`, `dl.hours`, `form.form` (its error lines,
  status and reset), `[data-peek]`, `nav.actionbar`, and everything inside `[data-fx]`, `[data-ui]`,
  `[data-ui-load]`, `[data-diagram]`, `[data-moment]` and the panels that get a pause button. Render those parts
  once, as markup with no state of their own (a server component, or a component that never re-renders them),
  and never change them from framework state: a re-render throws away what the kit drew or fights it for the
  same nodes. A pasted UI fragment goes in as its HTML (`dangerouslySetInnerHTML`, `v-html`, `{@html}`).
- **Forms:** a form is the kit's `form.form` (system.js validates it and sends it to its `data-endpoint`) or the
  framework's own, never both on one form.

## The checks

- Fix rounds may run on the dev server: `gate.mjs --start http://localhost:5173/`, and the same URL for
  `consistency.mjs`, `check.mjs --url` and `shoot.mjs --url`; the server must be running. The gate opens only a
  local page.
- The last gate run and `perf.mjs` go on the production build: a static export served from its folder
  (`--start out/index.html --root out`; Vite: `dist`) or the production server on a local port
  (`next build`, then `next start -p 4100` and `--start http://localhost:4100/`). `--start` on an open build
  only moves the target; its rounds stay. A dev server serves unbundled modules, which `perf.mjs` counts, and
  may put its own indicator or error overlay on the page, which the checker measures with it. A built page is
  checked as built: rebuild before every run.
- The copy: the gate lints the page as the browser built it (`.taste-skill/gate/consistency/rendered.html`);
  `copy-lint.mjs` takes that file too, and `photos.mjs credits --out public --page ../.taste-skill/gate/consistency/rendered.html`
  reads the photographs from it.

## What the page does not use

A page requests only the kit files its own elements call for (`perf.mjs` counts them), so the rest of the copy
weighs on the repository and the deploy, not on the page. Keep the whole copy while building. When the page
is finished, the copy may be cut to what it uses: `assets/photos` (the library; `fetch` has copied the page's
frames to `assets/img`), the kit's `.mjs` tools, the `demo*.html` files and `_demo` and `_lab` folders,
`assets/icons/demo`, and every effect, fragment, moment, object and scene folder the page does not name. Run
the gate once more after: a file the page still needed is an `assets` FAIL (a script, stylesheet or image that
did not load).
