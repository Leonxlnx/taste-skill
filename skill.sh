#!/usr/bin/env sh
# Resolve a taste-skill install name to its SKILL.md path.
#
#   ./skill.sh                     list every install name
#   ./skill.sh design-taste-frontend   print skills/design-taste-frontend/SKILL.md
#
# The folder name IS the install name, so the registry is read from disk and
# cannot drift out of sync with the repo.

set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ "$#" -eq 0 ]; then
  echo "Usage: ./skill.sh <install-name>"
  echo "Available skills:"
  for dir in "$root"/skills/*/; do
    [ -f "$dir/SKILL.md" ] || continue
    echo "  $(basename "$dir")"
  done
  exit 0
fi

rel="skills/$1/SKILL.md"

if [ ! -f "$root/$rel" ]; then
  echo "skill.sh: unknown skill '$1'" >&2
  echo "Run './skill.sh' with no arguments to list available skills." >&2
  exit 1
fi

echo "$rel"
