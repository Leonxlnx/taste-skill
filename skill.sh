#!/usr/bin/env bash

# Local skill registry
declare -A SKILLS=(
  [taste-skill]="skills/taste-skill/SKILL.md"
  [taste-skill-v1]="skills/taste-skill-v1/SKILL.md"
  [gpt-taste]="skills/gpt-tasteskill/SKILL.md"
  [image-to-code-skill]="skills/image-to-code-skill/SKILL.md"
  [imagegen-frontend-web]="skills/imagegen-frontend-web/SKILL.md"
  [imagegen-frontend-mobile]="skills/imagegen-frontend-mobile/SKILL.md"
  [brandkit]="skills/brandkit/SKILL.md"
  [redesign-skill]="skills/redesign-skill/SKILL.md"
  [soft-skill]="skills/soft-skill/SKILL.md"
  [output-skill]="skills/output-skill/SKILL.md"
  [minimalist-skill]="skills/minimalist-skill/SKILL.md"
  [brutalist-skill]="skills/brutalist-skill/SKILL.md"
  [stitch-skill]="skills/stitch-skill/SKILL.md"
)

print_help() {
  echo "Usage: source ./skill.sh <skill-name>"
  echo "       source ./skill.sh --list"
  echo
  echo "Available skills:"
  printf '%s\n' "${!SKILLS[@]}" | sort
}

skill_main() {
  if [[ $# -eq 0 || "$1" == "-h" || "$1" == "--help" ]]; then
    print_help
    return 0
  fi

  if [[ "$1" == "--list" ]]; then
    printf '%s\n' "${!SKILLS[@]}" | sort
    return 0
  fi

  local skill_name="$1"
  local skill_path="${SKILLS[$skill_name]-}"

  if [[ -z "$skill_path" ]]; then
    echo "Unknown skill: $skill_name" >&2
    echo >&2
    print_help >&2
    return 2
  fi

  echo "$skill_path"
}

skill_main "$@"
