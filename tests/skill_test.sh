#!/usr/bin/env bash

set -u

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

failures=0

assert_contains() {
  local actual="$1"
  local expected="$2"

  if [[ "$actual" != *"$expected"* ]]; then
    printf 'Expected output to contain:\n  %s\nActual output:\n%s\n' "$expected" "$actual" >&2
    return 1
  fi
}

assert_not_contains() {
  local actual="$1"
  local unexpected="$2"

  if [[ "$actual" == *"$unexpected"* ]]; then
    printf 'Expected output not to contain:\n  %s\nActual output:\n%s\n' "$unexpected" "$actual" >&2
    return 1
  fi
}

assert_equal() {
  local actual="$1"
  local expected="$2"
  local message="$3"

  if [[ "$actual" != "$expected" ]]; then
    printf '%s\nExpected: %s\nActual:   %s\n' "$message" "$expected" "$actual" >&2
    return 1
  fi
}

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

assert_source_returns_to_caller() {
  local expected_status="$1"
  shift

  local caller_output
  local caller_status

  caller_output="$(
    "$BASH" -c '
      set -u
      source ./skill.sh "$@" >/dev/null 2>&1
      source_status=$?
      printf "continued:%s\n" "$source_status"
    ' bash "$@"
  )"
  caller_status=$?

  assert_equal "$caller_status" "0" "Sourcing caller terminated before it could handle the result." || return 1
  assert_equal "$caller_output" "continued:$expected_status" "Sourced helper returned the wrong status."
}

test_help_uses_source_invocation() {
  local output
  output="$(source ./skill.sh --help)"

  assert_contains "$output" "Usage: source ./skill.sh <skill-name>" || return 1
  assert_contains "$output" "       source ./skill.sh --list" || return 1
  assert_not_contains "$output" "Usage: ./skill.sh <skill-name>" || return 1
  assert_not_contains "$output" "       ./skill.sh --list"
}

test_help_returns_to_sourcing_caller() {
  assert_source_returns_to_caller 0 --help
}

test_list_returns_to_sourcing_caller() {
  assert_source_returns_to_caller 0 --list
}

test_valid_skill_returns_path_to_sourcing_caller() {
  local caller_output
  local caller_status

  caller_output="$(
    "$BASH" -c '
      set -u
      source ./skill.sh taste-skill
      source_status=$?
      printf "continued:%s\n" "$source_status"
    '
  )"
  caller_status=$?

  assert_equal "$caller_status" "0" "Valid lookup terminated the sourcing caller." || return 1
  assert_equal "$caller_output" $'skills/taste-skill/SKILL.md\ncontinued:0' "Valid lookup returned the wrong path or status."
}

test_unknown_skill_returns_to_sourcing_caller() {
  assert_source_returns_to_caller 2 typo
}

run_test "help documents only the supported source invocation" test_help_uses_source_invocation
run_test "help returns to the sourcing caller" test_help_returns_to_sourcing_caller
run_test "list returns to the sourcing caller" test_list_returns_to_sourcing_caller
run_test "valid skills return paths to the sourcing caller" test_valid_skill_returns_path_to_sourcing_caller
run_test "unknown skills return to the sourcing caller with status 2" test_unknown_skill_returns_to_sourcing_caller

if ((failures > 0)); then
  exit 1
fi
