#!/usr/bin/env python3
"""Validate the portable mobile design handoff contract."""

from __future__ import annotations

import json
import sys
from pathlib import Path


REQUIRED_TOP_LEVEL = {
    "schemaVersion",
    "revision",
    "platform",
    "uiStack",
    "designRead",
    "approval",
    "tokens",
    "screens",
    "verification",
}
REQUIRED_TOKEN_GROUPS = {"colors", "typography", "spacing", "shapes", "motion"}
REQUIRED_SCREEN_FIELDS = {
    "id",
    "purpose",
    "states",
    "reviewImage",
    "rawImage",
    "components",
    "behaviors",
    "openQuestions",
}


def fail(message: str) -> None:
    raise ValueError(message)


def validate(path: Path) -> None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"handoff file not found: {path}")
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}")

    missing = REQUIRED_TOP_LEVEL - data.keys()
    if missing:
        fail(f"missing top-level fields: {', '.join(sorted(missing))}")
    if data["schemaVersion"] != 1:
        fail("schemaVersion must be 1")
    if data["platform"] not in {"android", "ios", "cross-platform"}:
        fail("platform must be android, ios, or cross-platform")

    approval = data["approval"]
    if not isinstance(approval, dict) or approval.get("status") not in {"draft", "approved"}:
        fail("approval.status must be draft or approved")

    tokens = data["tokens"]
    if not isinstance(tokens, dict):
        fail("tokens must be an object")
    missing_tokens = REQUIRED_TOKEN_GROUPS - tokens.keys()
    if missing_tokens:
        fail(f"missing token groups: {', '.join(sorted(missing_tokens))}")

    screens = data["screens"]
    if not isinstance(screens, list) or not screens:
        fail("screens must contain at least one screen")
    seen_ids: set[str] = set()
    for index, screen in enumerate(screens):
        if not isinstance(screen, dict):
            fail(f"screens[{index}] must be an object")
        missing_screen = REQUIRED_SCREEN_FIELDS - screen.keys()
        if missing_screen:
            fail(f"screens[{index}] missing fields: {', '.join(sorted(missing_screen))}")
        screen_id = screen["id"]
        if not isinstance(screen_id, str) or not screen_id.strip():
            fail(f"screens[{index}].id must be a non-empty string")
        if screen_id in seen_ids:
            fail(f"duplicate screen id: {screen_id}")
        seen_ids.add(screen_id)
        if not isinstance(screen["states"], list) or not screen["states"]:
            fail(f"screens[{index}].states must be a non-empty list")
        if not isinstance(screen["rawImage"], str) or not screen["rawImage"].strip():
            fail(f"screens[{index}].rawImage is required for implementation")


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: validate_handoff.py <mobile-design-handoff.json>", file=sys.stderr)
        return 2
    try:
        validate(Path(argv[1]))
    except (OSError, ValueError) as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    print("VALID")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

