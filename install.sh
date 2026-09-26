#!/usr/bin/env bash
# Symlink taste-skill skills into agent skill directories.
#
# Unlike `npx skills add`, this links instead of copying, so `git pull`
# updates every installed skill in place. Install names are read from each
# SKILL.md frontmatter, so new upstream skills are picked up automatically.
#
#   ./install.sh                          # link all skills into Claude Code
#   ./install.sh --codex                  # ... into Codex instead
#   ./install.sh --all-agents             # ... into both
#   ./install.sh design-taste-frontend    # link only these (by install name)
#   ./install.sh --list                   # show install name -> folder
#   ./install.sh --uninstall              # remove links pointing at this repo
#
# Requires bash (arrays, [[ ]]). No other dependencies.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$REPO/skills"

targets=()
mode=install
wanted=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude)      targets+=("$HOME/.claude/skills") ;;
    --codex)       targets+=("$HOME/.codex/skills") ;;
    --all-agents)  targets+=("$HOME/.claude/skills" "$HOME/.codex/skills") ;;
    --list)        mode=list ;;
    --uninstall)   mode=uninstall ;;
    -h|--help)     awk 'NR>1 { if ($0 !~ /^#/) exit; sub(/^# ?/, ""); print }' "${BASH_SOURCE[0]}"; exit 0 ;;
    -*)            echo "unknown flag: $1" >&2; exit 2 ;;
    *)             wanted+=("$1") ;;
  esac
  shift
done

[[ ${#targets[@]} -eq 0 ]] && targets=("$HOME/.claude/skills")

# resolve_link <symlink> -- absolute target, relative targets resolved against
# the link's own directory so they can be compared against $SKILLS_DIR
resolve_link() {
  local t d b
  t="$(readlink "$1")" || return 1
  [[ $t == /* ]] || t="$(dirname "$1")/$t"
  d="$(cd "$(dirname "$t")" 2>/dev/null && pwd)" || return 1
  b="$(basename "$t")"
  printf '%s/%s\n' "${d%/}" "$b"
}

# owned_by_repo <symlink> -- true if it resolves into this repo's skills/
owned_by_repo() {
  local r
  r="$(resolve_link "$1")" || return 1
  [[ $r == "$SKILLS_DIR"/* ]]
}

# install_name <SKILL.md> -- frontmatter `name:`, falling back to folder name
install_name() {
  awk '
    NR==1 && $0!="---" { exit }
    NR>1 && /^---[[:space:]]*$/ { exit }
    NR>1 && /^name:/ { sub(/^name:[[:space:]]*/,""); gsub(/^["'\'']|["'\'']$/,""); print; exit }
  ' "$1"
}

wants() {
  [[ ${#wanted[@]} -eq 0 ]] && return 0
  local w; for w in "${wanted[@]}"; do [[ "$w" == "$1" ]] && return 0; done
  return 1
}

if [[ $mode == uninstall ]]; then
  for target in "${targets[@]}"; do
    [[ -d $target ]] || continue
    for link in "$target"/*; do
      [[ -L $link ]] || continue
      if owned_by_repo "$link"; then
        rm "$link"; echo "removed  $link"
      fi
    done
  done
  exit 0
fi

found=0
all_names=()
matched=()
for dir in "$SKILLS_DIR"/*/; do
  dir="${dir%/}"
  md="$dir/SKILL.md"
  [[ -f $md ]] || continue

  name="$(install_name "$md")"
  [[ -n $name ]] || name="$(basename "$dir")"
  all_names+=("$name")
  wants "$name" || continue
  matched+=("$name")
  found=$((found + 1))

  if [[ $mode == list ]]; then
    printf '%-28s %s\n' "$name" "skills/$(basename "$dir")"
    continue
  fi

  for target in "${targets[@]}"; do
    mkdir -p "$target"
    link="$target/$name"
    if [[ -L $link ]]; then
      if owned_by_repo "$link"; then
        rm "$link"
      else
        echo "skip     $link (symlink to another install -- remove it first)" >&2
        continue
      fi
    elif [[ -e $link ]]; then
      echo "skip     $link (real file/dir, not a symlink -- move it aside first)" >&2
      continue
    fi
    ln -s "$dir" "$link"
    echo "linked   $link -> skills/$(basename "$dir")"
  done
done

if [[ ${#wanted[@]} -gt 0 && $found -ne ${#wanted[@]} ]]; then
  for w in "${wanted[@]}"; do
    for m in "${matched[@]:-}"; do [[ $w == "$m" ]] && continue 2; done
    echo "error: no skill named '$w'" >&2
  done
  echo "valid install names:" >&2
  printf '  %s\n' "${all_names[@]}" >&2
  exit 1
fi
