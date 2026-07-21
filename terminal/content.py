"""Question bank for Typed Away — Coding Dojo katas by belt rank."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

BELT_NAMES = {
    1: "White Belt",
    2: "Yellow Belt",
    3: "Green Belt",
}

_DATA_PATH = Path(__file__).resolve().parent.parent / "questions.json"


class QuestionBank:
    """Loads and serves coding challenges (katas) by belt/level."""

    def __init__(self, path: Path | str | None = None) -> None:
        data_path = Path(path) if path else _DATA_PATH
        with data_path.open(encoding="utf-8") as f:
            raw = json.load(f)

        self._questions: list[dict[str, Any]] = []
        for q in raw.get("questions", []):
            level = int(q["level"])
            entry = dict(q)
            entry["belt"] = BELT_NAMES.get(level, f"Belt {level}")
            self._questions.append(entry)

        self._by_level: dict[int, list[dict[str, Any]]] = {}
        for q in self._questions:
            self._by_level.setdefault(q["level"], []).append(q)

        # Per-level cursor used by Game.get_next_question
        self._cursors: dict[int, int] = {level: 0 for level in self._by_level}

    def get_total_questions(self) -> int:
        return len(self._questions)

    def get_questions_by_level(self, level: int) -> list[dict[str, Any]]:
        return list(self._by_level.get(level, []))

    def get_remaining_at_level(self, level: int) -> int:
        questions = self._by_level.get(level, [])
        cursor = self._cursors.get(level, 0)
        return max(0, len(questions) - cursor)

    def next_for_level(self, level: int) -> dict[str, Any] | None:
        """Return the next unanswered question at the given belt level."""
        questions = self._by_level.get(level, [])
        cursor = self._cursors.get(level, 0)
        if cursor >= len(questions):
            return None
        question = questions[cursor]
        self._cursors[level] = cursor + 1
        return question

    def has_any_remaining(self) -> bool:
        return any(self.get_remaining_at_level(lvl) > 0 for lvl in self._by_level)

    def reset(self) -> None:
        self._cursors = {level: 0 for level in self._by_level}


# Module-level bank for simple imports: `from content import question_bank`
question_bank = QuestionBank()


def get_total_questions() -> int:
    return question_bank.get_total_questions()


def get_questions_by_level(level: int) -> list[dict[str, Any]]:
    return question_bank.get_questions_by_level(level)
