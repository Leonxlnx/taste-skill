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
      case "$(readlink "$link")" in
        "$SKILLS_DIR"/*) rm "$link"; echo "removed  $link" ;;
      esac
    done
  done
  exit 0
fi

found=0
for dir in "$SKILLS_DIR"/*/; do
  dir="${dir%/}"
  md="$dir/SKILL.md"
  [[ -f $md ]] || continue

  name="$(install_name "$md")"
  [[ -n $name ]] || name="$(basename "$dir")"
  wants "$name" || continue
  found=$((found + 1))

  if [[ $mode == list ]]; then
    printf '%-28s %s\n' "$name" "skills/$(basename "$dir")"
    continue
  fi

  for target in "${targets[@]}"; do
    mkdir -p "$target"
    link="$target/$name"
    if [[ -L $link ]]; then
      rm "$link"
    elif [[ -e $link ]]; then
      echo "skip     $link (real file/dir, not a symlink -- move it aside first)" >&2
      continue
    fi
    ln -s "$dir" "$link"
    echo "linked   $link -> skills/$(basename "$dir")"
  done
done

if [[ ${#wanted[@]} -gt 0 && $found -ne ${#wanted[@]} ]]; then
  echo "warning: matched $found of ${#wanted[@]} requested skills (see --list)" >&2
  exit 1
fi
