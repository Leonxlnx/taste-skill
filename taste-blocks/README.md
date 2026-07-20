# Taste Blocks

An open-source registry of source-backed React components for landing pages, portfolios, and general websites. Complete sections and layout blocks are out of scope.

## Commands

```bash
npm install
npm run dev
npm run verify
```

The catalog is generated from `registry/**/meta.json`. Public registry files are written to `public/r/`. A component only contributes to the public count when its metadata status is `verified` and the registry checks pass.

## Source policy

Every catalog component requires exact upstream source, revision, path, license, notices, and modification records. Original replacement components, restricted libraries, and paid component source are not accepted in the current collection phase.

See `../research/components/sources.md` and `../rules/components.md`.
