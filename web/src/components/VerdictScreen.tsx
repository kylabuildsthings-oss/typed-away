import type { VerdictState } from "../game/types";
import type { BeltRank } from "../game/types";
import { Scoreboard } from "./Scoreboard";

interface VerdictScreenProps {
  verdict: VerdictState;
  score: number;
  answeredCount: number;
  totalQuestions: number;
  spiritEnergy: number;
  sessionElapsed: number;
  beltRank: BeltRank;
  onContinue: () => void;
}

export function VerdictScreen({
  verdict,
  score,
  answeredCount,
  totalQuestions,
  spiritEnergy,
  sessionElapsed,
  beltRank,
  onContinue,
}: VerdictScreenProps) {
  return (
    <div className="screen verdict-screen">
      <div className="wood-backdrop" />
      <div className="verdict-screen__content">
        <Scoreboard
          score={score}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          spiritEnergy={spiritEnergy}
          sessionElapsed={sessionElapsed}
          beltRank={beltRank}
        />

        <div className="scroll-panel animate-unfurl">
          <h2
            className={`verdict-title ${
              verdict.isCorrect ? "verdict-title--ok" : "verdict-title--bad"
            }`}
          >
            {verdict.isCorrect
              ? "✔ Sensei's Verdict: Kata Mastered!"
              : "✘ Sensei's Verdict: Loss of Focus"}
          </h2>

          <div className="verdict-meta">
            <span>
              Points: +{verdict.points}
              {verdict.timeBonus > 0 ? ` · Time bonus +${verdict.timeBonus}` : ""}
            </span>
            <span>{verdict.elapsed.toFixed(1)}s</span>
          </div>

          <div className="compare-grid">
            <div className="compare-col">
              <h3>Expected (Sensei)</h3>
              <pre>{verdict.expected.trim() || "(empty)"}</pre>
            </div>
            <div className="compare-col">
              <h3>Your Scroll</h3>
              <pre>{verdict.actual.trim() || "(empty)"}</pre>
            </div>
          </div>

          <button
            type="button"
            className="pixel-btn pixel-btn--primary"
            onClick={onContinue}
          >
            Continue ✦
          </button>
          <p className="hint-text">Press Enter to continue</p>
        </div>
      </div>
    </div>
  );
}
