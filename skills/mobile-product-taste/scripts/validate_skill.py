#!/usr/bin/env python3
"""Run deterministic structural checks for mobile-product-taste."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"
REQUIRED = [
    ROOT / "references" / "mobile-audit.md",
    ROOT / "references" / "mobile-prototype.md",
    ROOT / "references" / "native-implementation.md",
    ROOT / "references" / "design-handoff.md",
    ROOT / "evals" / "cases.json",
    ROOT / "agents" / "openai.yaml",
]


def main() -> int:
    errors: list[str] = []
    text = SKILL.read_text(encoding="utf-8")
    line_count = len(text.splitlines())
    if line_count > 100:
        errors.append(f"SKILL.md has {line_count} lines; maximum is 100")
    if not re.search(r"^name:\s+mobile-product-taste$", text, re.MULTILINE):
        errors.append("frontmatter name must be mobile-product-taste")
    if "⛔ **Approval gate:**" not in text:
        errors.append("approval hard stop is missing")
    for path in REQUIRED:
        if not path.is_file():
            errors.append(f"required file is missing: {path.relative_to(ROOT)}")
        elif path.suffix == ".md" and path.name != "SKILL.md":
            expected_link = f"({path.relative_to(ROOT).as_posix()})"
            if expected_link not in text:
                errors.append(f"SKILL.md does not route to {path.relative_to(ROOT)}")
    if any(marker in text for marker in ("TODO", "TBD", "Example placeholder")):
        errors.append("unfinished scaffold marker found")
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        return 1
    print(f"PASS: mobile-product-taste structure is valid ({line_count} lines)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

