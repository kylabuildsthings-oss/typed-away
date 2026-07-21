import { useEffect, useRef } from "react";
import type { Question } from "../game/types";
import type { BeltRank } from "../game/types";
import { Scoreboard } from "./Scoreboard";

interface ChallengeScreenProps {
  question: Question;
  score: number;
  answeredCount: number;
  totalQuestions: number;
  spiritEnergy: number;
  sessionElapsed: number;
  beltRank: BeltRank;
  onSubmit: (code: string) => void;
}

export function ChallengeScreen({
  question,
  score,
  answeredCount,
  totalQuestions,
  spiritEnergy,
  sessionElapsed,
  beltRank,
  onSubmit,
}: ChallengeScreenProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef("");

  useEffect(() => {
    codeRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [question.id]);

  const handleSubmit = () => {
    onSubmit(codeRef.current);
  };

  return (
    <div className="screen challenge-screen">
      <div className="challenge-screen__floor" />

      <div className="challenge-screen__content">
        <Scoreboard
          score={score}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          spiritEnergy={spiritEnergy}
          sessionElapsed={sessionElapsed}
          beltRank={beltRank}
        />

        <div className="dojo-scroll animate-unfurl">
          <div className="dojo-scroll__roller dojo-scroll__roller--left" />
          <div className="dojo-scroll__paper">
            <div className="dojo-scroll__split">
              <section className="prompt-pane" aria-label="Challenge prompt">
                <h2 className="pane-title">📜 Challenge</h2>
                <p className="prompt-text">{question.description}</p>
                {question.hint && (
                  <p className="hint-inline">Hint: {question.hint}</p>
                )}
                <p className="topic-chip">{question.topic}</p>
              </section>

              <section className="code-pane" aria-label="Your code">
                <h2 className="pane-title">✍ Your Scroll</h2>
                <textarea
                  ref={textareaRef}
                  className="code-input"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="# Type your solution here…"
                  aria-label="Code input"
                  onChange={(e) => {
                    codeRef.current = e.target.value;
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <p className="code-hint">Ctrl+Enter / ⌘+Enter to submit</p>
              </section>
            </div>
          </div>
          <div className="dojo-scroll__roller dojo-scroll__roller--right" />
        </div>

        <div className="challenge-screen__actions">
          <button
            type="button"
            className="pixel-btn pixel-btn--primary"
            onClick={handleSubmit}
          >
            Submit kata
          </button>
          <button
            type="button"
            className="star-btn"
            onClick={handleSubmit}
            aria-label="Submit"
            title="Submit"
          >
            ✦
          </button>
        </div>
      </div>
    </div>
  );
}
