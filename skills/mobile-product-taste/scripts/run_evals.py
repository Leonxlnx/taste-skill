#!/usr/bin/env python3
"""Run deterministic contract and evaluation-catalog checks."""

from __future__ import annotations

import json
from pathlib import Path

from validate_handoff import validate


ROOT = Path(__file__).resolve().parents[1]
EVALS = ROOT / "evals"
ALLOWED_MODES = {"audit", "prototype", "implement", "full-workflow", None}


def main() -> int:
    catalog = json.loads((EVALS / "cases.json").read_text(encoding="utf-8"))
    cases = catalog.get("cases", [])
    assert catalog.get("schemaVersion") == 1
    assert len(cases) >= 6
    ids = [case["id"] for case in cases]
    assert len(ids) == len(set(ids))
    assert all(case.get("expectedMode") in ALLOWED_MODES for case in cases)
    assert any(not case.get("shouldTrigger") for case in cases)
    assert any(case.get("expectedMode") == "full-workflow" for case in cases)
    assert any("stop-for-approval" in case.get("requiredBehavior", []) for case in cases)

    validate(EVALS / "valid-handoff.json")
    invalid_rejected = False
    try:
        validate(EVALS / "invalid-handoff.json")
    except ValueError:
        invalid_rejected = True
    assert invalid_rejected

    print(f"PASS: {len(cases)} routing cases and 2 handoff fixtures")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

