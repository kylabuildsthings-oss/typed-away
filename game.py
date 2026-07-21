"""Typed Away game logic — Coding Dojo scoring, spirit energy, belt ranks."""

from __future__ import annotations

import difflib
import time
from typing import Any

import content
import ui


class Game:
    """Main game brain: flow, scoring, spirit energy, belt progression."""

    BELT_NAMES = {
        1: "White Belt",
        2: "Yellow Belt",
        3: "Green Belt",
    }

    def __init__(self) -> None:
        self.score = 0
        self.spirit_energy = 3
        self.belt_rank = 1
        self.question_index = 0
        self.total_time = 0.0
        self.start_time = 0.0
        self.correct_count = 0
        self.answered_count = 0
        self.question_bank = content.QuestionBank()

    def get_belt_title(self) -> str:
        return self.BELT_NAMES.get(self.belt_rank, "White Belt")

    def calculate_accuracy(self) -> float:
        if self.answered_count == 0:
            return 0.0
        return (self.correct_count / self.answered_count) * 100

    def get_final_rank(self, accuracy: float) -> str:
        if accuracy >= 90:
            return "Master"
        if accuracy >= 75:
            return "Black Belt Candidate"
        if accuracy >= 60:
            return "Dedicated Student"
        if accuracy >= 40:
            return "Apprentice"
        return "Grasshopper"

    def is_game_over(self) -> bool:
        if self.spirit_energy <= 0:
            return True
        if not self.question_bank.has_any_remaining():
            return True
        return False

    def get_next_question(self) -> dict[str, Any] | None:
        """
        Next kata for the current belt. If the current belt is exhausted,
        advance belt and try again. Return None when all katas are done.
        """
        while self.belt_rank <= 3:
            question = self.question_bank.next_for_level(self.belt_rank)
            if question is not None:
                self.question_index += 1
                return question
            # No more at this belt — try the next
            if self.belt_rank < 3:
                self.belt_rank += 1
                ui.display_level_up(self.belt_rank)
            else:
                break
        return None

    def increase_difficulty(self) -> None:
        """After 3 correct answers, promote belt (max Green / 3)."""
        if self.belt_rank < 3:
            self.belt_rank += 1
            ui.display_level_up(self.belt_rank)

    def score_answer(
        self, player_code: str, expected_code: str, time_taken: float
    ) -> tuple[int, bool]:
        """
        Compare player code to expected.
        Exact → 100; >80% similarity → 50–90 (correct);
        >50% → 20 (wrong); else 0 (wrong).
        Time bonus applied in run() when under 30s.
        """
        player_clean = player_code.strip()
        expected_clean = expected_code.strip()

        if player_clean == expected_clean:
            return 100, True

        # Normalize whitespace for a fairer fuzzy compare
        player_norm = " ".join(player_clean.split())
        expected_norm = " ".join(expected_clean.split())
        if player_norm == expected_norm:
            return 100, True

        similarity = difflib.SequenceMatcher(None, player_norm, expected_norm).ratio()

        if similarity > 0.8:
            points = 50 + int(similarity * 40)
            return points, True

        if similarity > 0.5:
            return 20, False

        return 0, False

    def run(self) -> None:
        ui.display_welcome()

        self.start_time = time.time()
        total_questions = self.question_bank.get_total_questions()

        while not self.is_game_over():
            question = self.get_next_question()
            if question is None:
                break

            self.answered_count += 1
            question_num = self.answered_count

            ui.display_score(
                self.score,
                question_num,
                total_questions,
                self.spirit_energy,
                time.time() - self.start_time,
            )
            ui.display_challenge(question["description"], question["expected_code"])
            if question.get("hint"):
                ui.prompt_hint(question["hint"])

            start = time.time()
            player_code = ui.get_typed_code()
            elapsed = time.time() - start
            self.total_time += elapsed

            points, is_correct = self.score_answer(
                player_code,
                question["expected_code"],
                elapsed,
            )

            if is_correct:
                self.score += points
                self.correct_count += 1
                if elapsed < 30:
                    self.score += 10
                # Belt promotion every 3 correct answers
                if self.correct_count > 0 and self.correct_count % 3 == 0:
                    self.increase_difficulty()
            else:
                self.spirit_energy -= 1

            ui.display_feedback(is_correct, question["expected_code"], player_code)

            ui.display_score(
                self.score,
                question_num,
                total_questions,
                self.spirit_energy,
                time.time() - self.start_time,
            )

        accuracy = self.calculate_accuracy()
        final_time = time.time() - self.start_time
        ui.display_game_over(self.score, final_time, accuracy)

        rank = self.get_final_rank(accuracy)
        print(f"Final Rank: {rank}")


if __name__ == "__main__":
    Game().run()
