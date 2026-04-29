#!/usr/bin/env bash

# Local skill registry
AVAILABLE_SKILLS="taste-skill gpt-taste image-to-code-skill imagegen-frontend-web imagegen-frontend-mobile brandkit redesign-skill soft-skill output-skill minimalist-skill brutalist-skill stitch-skill"

declare -A SKILLS=(
  [taste-skill]="skills/taste-skill/SKILL.md"
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

if [[ $# -eq 0 ]]; then
  echo "Usage: source ./skill.sh <skill-name>" >&2
  echo "Available skills: $AVAILABLE_SKILLS" >&2
  return 2 2>/dev/null || exit 2
elif [[ -z "${SKILLS[$1]}" ]]; then
  echo "Unknown skill: $1" >&2
  echo "Available skills: $AVAILABLE_SKILLS" >&2
  return 1 2>/dev/null || exit 1
else
  echo "${SKILLS[$1]}"
fi
