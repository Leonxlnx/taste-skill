#!/usr/bin/env bash

# Local skill registry.
# Keys are canonical install names (the `name:` field in each SKILL.md frontmatter),
# matching the install names documented in README.md. Values are SKILL.md paths.

# Detect whether we are being sourced (vs executed directly).
if [[ -n ${BASH_SOURCE[0]} && ${BASH_SOURCE[0]} != "$0" ]]; then
  SOURCED=1
else
  SOURCED=0
fi

declare -A SKILLS=(
  [design-taste-frontend]="skills/taste-skill/SKILL.md"
  [design-taste-frontend-v1]="skills/taste-skill-v1/SKILL.md"
  [gpt-taste]="skills/gpt-tasteskill/SKILL.md"
  [image-to-code]="skills/image-to-code-skill/SKILL.md"
  [imagegen-frontend-web]="skills/imagegen-frontend-web/SKILL.md"
  [imagegen-frontend-mobile]="skills/imagegen-frontend-mobile/SKILL.md"
  [brandkit]="skills/brandkit/SKILL.md"
  [redesign-existing-projects]="skills/redesign-skill/SKILL.md"
  [high-end-visual-design]="skills/soft-skill/SKILL.md"
  [full-output-enforcement]="skills/output-skill/SKILL.md"
  [minimalist-ui]="skills/minimalist-skill/SKILL.md"
  [industrial-brutalist-ui]="skills/brutalist-skill/SKILL.md"
  [stitch-design-taste]="skills/stitch-skill/SKILL.md"
)

usage() {
  echo "Usage: source ./skill.sh <skill-name>"
  echo "Available skills: ${!SKILLS[@]}"
}

if [[ $# -eq 0 ]]; then
  usage
elif [[ -n ${SKILLS[$1]:-} ]]; then
  echo "${SKILLS[$1]}"
else
  usage >&2
  if (( SOURCED )); then
    return 1
  else
    exit 1
  fi
fi
