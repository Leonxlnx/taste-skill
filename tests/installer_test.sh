#!/usr/bin/env bash

# install.sh is the first thing a user runs, and nothing else exercises it. This runs the
# three paths it has: list, install, uninstall. It also runs the whole script under the
# bash the machine actually ships, which on macOS is still bash 3.2, so a bash 4 construct
# fails here rather than at the user's desk.

set -u

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

failures=0

run_test() {
  local name="$1"
  shift

  if "$@"; then
    printf 'ok - %s\n' "$name"
  else
    printf 'not ok - %s\n' "$name" >&2
    failures=$((failures + 1))
  fi
}

# A HOME of its own, so the test never touches the agent directories of the person or the
# runner running it.
sandbox() {
  local dir="$work/home"
  rm -rf "$dir"
  mkdir -p "$dir"
  printf '%s\n' "$dir"
}

test_install_lists_the_skill() {
  local output
  output="$(HOME="$(sandbox)" ./install.sh --list 2>&1)" || return 1
  [[ "$output" == *"design-taste-frontend"* ]] || return 1
  [[ "$output" == *"skills/taste-skill"* ]] || return 1
}

test_install_links_and_uninstalls() {
  local home linked
  home="$(sandbox)"
  HOME="$home" ./install.sh >/dev/null 2>&1 || return 1
  linked="$home/.claude/skills/design-taste-frontend"
  [[ -L "$linked" ]] || { printf 'No link at %s\n' "$linked" >&2; return 1; }
  HOME="$home" ./install.sh --uninstall >/dev/null 2>&1 || return 1
  [[ ! -e "$linked" ]] || { printf 'The link is still there after --uninstall\n' >&2; return 1; }
}

# Every line of the script has to survive the bash on this machine. bash 3.2 is the floor:
# macOS ships it as /bin/bash and a bash 4 construct fails there.
test_the_script_parses_on_the_oldest_bash() {
  /bin/bash -n ./install.sh
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

run_test "install.sh lists the skill" test_install_lists_the_skill
run_test "install.sh links and uninstalls" test_install_links_and_uninstalls
run_test "install.sh parses on bash 3.2" test_the_script_parses_on_the_oldest_bash

if ((failures > 0)); then
  exit 1
fi
