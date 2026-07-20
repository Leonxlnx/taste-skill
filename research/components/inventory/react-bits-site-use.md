# React Bits Pro: use on the Taste Blocks site

Checked: 2026-07-20
Scope: React Bits Pro code used only in the Taste Blocks marketing/catalog website, not shipped as a Taste Blocks component.
Status: conservative license review, not legal advice.

## Decision

| Proposed use | Decision | Reason |
| --- | --- | --- |
| Use licensed Pro code in an ordinary, unrelated commercial website whose source stays private | **Allowed with conditions** | The license permits one licensed developer to build and modify websites and commercial projects. |
| Use licensed Pro code in the Taste Blocks marketing/catalog site | **Do not use without written permission** | Taste Blocks is itself a component-library offering. The license prohibits using the Product to create, sell, or distribute competing component libraries or similar offerings derived from or substantially based on it. Keeping the Pro code out of downloads reduces risk but does not clearly exempt the surrounding competing site. |
| Put Pro source in a public Taste Blocks repository | **Denied** | Publishing or making the Product, including modified or partial forms, available to third parties is expressly prohibited. |
| Include Pro source in the Taste Blocks registry, MCP responses, downloads, templates, examples, or copy-code UI | **Denied** | This is redistribution and would also place React Bits code inside a competing component library. |
| Show an interactive Pro component as a copyable catalog entry or downloadable preview | **Denied** | It exposes or distributes the licensed implementation as part of the competing catalog. |
| Deploy a compiled Pro component on a normal public website | **Likely allowed with conditions** | Public website deployment is the ordinary consequence of the expressly permitted website use. The agreement does not, however, provide a specific safe harbor for readable source bundles or source maps. Keep source private and ship only the normal production build. |
| Deploy a compiled Pro component on the public Taste Blocks site | **Do not use without written permission** | The ordinary website permission conflicts with the specific competing-library restriction in this context. A private repository does not remove that conflict. |

**Bottom line:** React Bits Pro must not enter the free registry or any user-facing install/copy path. For the Taste Blocks site itself, the safe decision is also **no** until React Bits gives written approval for this exact use.

## What the current official terms say

The [React Bits Pro License Agreement](https://pro.reactbits.dev/license) is effective January 1, 2026 and says:

- One purchase licenses one individual developer. Additional human developers require additional licenses or a team/volume arrangement.
- The licensed developer may build and modify landing pages, websites, and other personal, client, and commercial digital products.
- The Product may not be distributed, resold, shared, sublicensed, published, or otherwise made available to third parties, including in open-source repositories, starter kits, or boilerplates.
- The Product may not be used for competing template packs, UI kits, component libraries, or similar offerings derived from or substantially based on it.
- Modification does not transfer authorship or ownership.
- If a subscription expires, code already downloaded and incorporated before expiry may continue to be used under the agreement; registry access ends.
- The licensor may update the agreement, so this decision must be rechecked before launch.

The [official installation guide](https://pro.reactbits.dev/docs/installation) says:

- Put the license credential in `.env.local` at the project root.
- Reference that environment variable from the authenticated registry headers in `components.json`.
- Use the shadcn CLI to install source into the licensed project, or copy it manually from the authenticated docs.
- The starter registry serves components for all paid plans; the Pro registry serves blocks for Pro and Ultimate plans.

The [official product overview](https://pro.reactbits.dev/about) confirms that installed source lands directly in the project repository and that a license is for one developer across unlimited projects. That source delivery does not override the redistribution and competition restrictions in the agreement.

## Why the Taste Blocks site is not a safe ordinary-site case

There are two clauses pulling in opposite directions:

1. A licensed developer may use React Bits Pro to build commercial websites.
2. The Product may not be used to create or distribute a competing component-library offering.

Taste Blocks is both a website and a component library. Using a Pro effect only as visual decoration, while never putting it in the registry, is a narrower use than copying it into the library. Still, the current language does not expressly permit Pro code in the storefront or catalog of a direct component-library competitor. The phrase “derived from or substantially based on” leaves room for interpretation, so we should not assume the general website permission defeats the specific competition restriction.

## Required written permission before site use

Ask [pro@reactbits.dev](mailto:pro@reactbits.dev) to confirm all of the following in writing:

1. A licensed developer may use named React Bits Pro components solely in the private-source marketing shell of Taste Blocks, even though Taste Blocks is a component library.
2. Those components will never appear in the Taste Blocks registry, MCP output, downloads, templates, examples, or copy-code UI.
3. The public site may deliver the normal compiled/minified client bundle with source maps disabled.
4. The repository will remain private and access will be limited to properly licensed developers.
5. Public screenshots or recordings of the finished site are permitted.

Unless the reply clearly approves this exact setup, use permissively licensed alternatives on the site.

## Credential handling

The credential posted in chat must be treated as exposed and rotated. Do not place it in this repository, documentation, issue trackers, build output, screenshots, or browser code.

Minimum safe setup:

- Store the replacement credential only as `REACTBITS_LICENSE_KEY` in an ignored `.env.local` file for local installs.
- Keep only the `${REACTBITS_LICENSE_KEY}` placeholder in `components.json`; never paste the actual value there.
- Never use a `NEXT_PUBLIC_` prefix or otherwise expose the credential to client-side code.
- Run authenticated registry installs locally, or inject the value from a private CI secret only for the install step.
- Do not proxy the licensed registry through the Taste Blocks site, API, registry, or MCP server.
- Disable command tracing and redact logs around authenticated install commands.
- Verify that `.env.local` is ignored before the first commit and scan history before pushing.
- Rotate immediately after any accidental disclosure.

These operational controls follow the official `.env.local` installation model; the extra secrecy measures are conservative implementation guidance rather than additional React Bits license text.

## Release gate

React Bits Pro is **blocked for Taste Blocks site use** until written permission is saved alongside this review. It remains **permanently blocked from registry redistribution** under the current license unless React Bits grants a separate redistribution agreement.
