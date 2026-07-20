# Provenance

Every Taste Blocks component must be traceable to exact upstream evidence. There are no original catalog components in the current collection phase.

## Required fields

```text
id
name
category
incorporation: copied | minimally-adapted | dependency
upstream owner
repository URL
version or tag
commit SHA
upstream file paths
retrieval date
source file hashes
normalized code hash
behavior fingerprint
license SPDX expression
license file URL
license hash
license path scope
copyright notices
NOTICE content
shipped output paths
dependencies
assets and their licenses
modification summary
modified files
asset and trademark exclusions
decision
reviewer
review date
evidence links
written permission, if any
```

## Decisions and states

- `allow`: exact material is legally eligible for import.
- `dependency-only`: use the maintained package but do not vendor its source.
- `review`: do not import until the named question is resolved.
- `reject`: incompatible, missing, conflicting, duplicated, or insufficient evidence.
- `discovered`: candidate only and not counted.
- `imported`: source copied but not counted publicly.
- `verified`: all release gates passed and counted.

## Storage

The registry manifest is the source of truth. Public JSON, site counts, source pages, and third-party notices are generated from it.

Use immutable commits. A branch URL, website demo, package name, or license badge alone is insufficient evidence.
