# Provenance

Every adapted or dependency-backed Taste Blocks entry must be traceable to exact evidence. Original entries still record authorship and review.

## Required fields

```text
id
name
kind: original | adapted | dependency
material: code | css | asset | font | icon | documentation
upstream owner
source repository URL
registry or package URL
version or tag
commit
upstream path
retrieval date
source hash
license SPDX expression
license file URL
license hash
license path scope
copyright notices
notice text
incorporation mode
shipped output paths
dependencies
modification summary
modified files
modified by
modified date
asset and trademark exclusions
decision
reviewer
review date
evidence links
written permission, if any
```

## Decisions

- `allow`: evidence is complete and the exact material may ship.
- `dependency-only`: use the maintained package; do not copy its source.
- `review`: do not ship until the named question is resolved.
- `reject`: incompatible, missing, conflicting, or insufficient rights.

## Storage

The registry manifest is the source of truth. Generated component JSON, the catalog, and `THIRD_PARTY_NOTICES.md` must be derived from it so public claims cannot drift from the shipped source.

Use immutable commits for adapted code. A moving branch URL alone is insufficient evidence.
