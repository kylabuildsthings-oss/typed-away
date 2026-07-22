import type { VerdictState } from "../game/types";
import type { BeltRank } from "../game/types";
import { coachingTips } from "../game/coaching";
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
  const tips = verdict.isCorrect
    ? []
    : coachingTips(verdict.actual, verdict.expected, verdict.hint);

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
          <p className="sensei-label">Sensei</p>
          <h2
            className={`sensei-verdict ${
              verdict.isCorrect ? "sensei-verdict--ok" : "sensei-verdict--bad"
            }`}
          >
            {verdict.isCorrect ? "Kata Mastered!" : "Loss of Focus"}
          </h2>

          <div className="verdict-meta">
            <span>
              Points: +{verdict.points}
              {verdict.timeBonus > 0 ? ` · Time bonus +${verdict.timeBonus}` : ""}
            </span>
            <span>{verdict.elapsed.toFixed(1)}s</span>
          </div>

          {tips.length > 0 && (
            <aside className="sensei-coach" aria-label="Sensei coaching">
              <p className="sensei-coach__label">Why it missed</p>
              {tips.map((tip) => (
                <p key={tip} className="sensei-coach__tip">
                  {tip}
                </p>
              ))}
            </aside>
          )}

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
