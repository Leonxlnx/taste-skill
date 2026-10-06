"""Regression checks for the brandkit output-canvas contract."""

from pathlib import Path
import unittest


SKILL = Path(__file__).parents[1] / "skills" / "brandkit" / "SKILL.md"


class BrandkitSkillContractTests(unittest.TestCase):
    def test_explicit_canvas_size_is_preserved(self) -> None:
        text = SKILL.read_text(encoding="utf-8")

        self.assertIn("## OUTPUT SIZE AND ASPECT RATIO", text)
        self.assertIn("Treat an explicit output size as a hard canvas requirement", text)
        self.assertIn("preserve those exact dimensions", text)
        self.assertIn("never silently ignore the", text)
        self.assertIn("Output canvas:", text)


if __name__ == "__main__":
    unittest.main()
