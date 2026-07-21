import type { BeltRank } from "../game/types";
import { BELT_NAMES } from "../game/types";

interface ScoreboardProps {
  score: number;
  answeredCount: number;
  totalQuestions: number;
  spiritEnergy: number;
  sessionElapsed: number;
  beltRank: BeltRank;
}

export function Scoreboard({
  score,
  answeredCount,
  totalQuestions,
  spiritEnergy,
  sessionElapsed,
  beltRank,
}: ScoreboardProps) {
  const hearts = Array.from({ length: 3 }, (_, i) =>
    i < spiritEnergy ? "❤️" : "🖤",
  ).join(" ");

  return (
    <header className="scoreboard" aria-label="Dojo scoreboard">
      <span className="scoreboard__score">Score: {score}</span>
      <span className="scoreboard__kata">
        Kata {answeredCount}/{totalQuestions}
      </span>
      <span className="scoreboard__belt">{BELT_NAMES[beltRank]}</span>
      <span className="scoreboard__spirit">
        Spirit {hearts} · {Math.floor(sessionElapsed)}s
      </span>
    </header>
  );
}
