# Taste Blocks

A source-backed React component registry and catalog. Website sections, page layouts, and templates are out of scope.

## Commands

```bash
npm install
npm run dev
npm run verify
```

`npm run verify` validates registry policy, generates the catalog and shadcn payloads, type-checks the app, and runs a production build.

## Source policy

Every published component requires exact upstream source, revision, path, license, notices, and modification records. Restricted libraries, paid source, and original substitute components are not accepted in the current collection phase.

See `../research/components/sources.md` and `../rules/components.md`.
