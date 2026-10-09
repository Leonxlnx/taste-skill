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
  [redesign-imagegen-codex]="skills/redesign-imagegen-codex/SKILL.md"
  [soft-skill]="skills/soft-skill/SKILL.md"
  [output-skill]="skills/output-skill/SKILL.md"
  [minimalist-skill]="skills/minimalist-skill/SKILL.md"
  [brutalist-skill]="skills/brutalist-skill/SKILL.md"
  [stitch-skill]="skills/stitch-skill/SKILL.md"
)

if [[ $# -eq 0 ]]; then
  echo "Usage: source ./skill.sh <skill-name>"
  echo "Available skills: ${!SKILLS[@]}"
else
  echo "${SKILLS[$1]}"
fi
