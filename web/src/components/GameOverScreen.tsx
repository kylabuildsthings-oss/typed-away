interface GameOverScreenProps {
  score: number;
  finalTime: number;
  accuracy: number;
  rank: string;
  onRestart: () => void;
}

export function GameOverScreen({
  score,
  finalTime,
  accuracy,
  rank,
  onRestart,
}: GameOverScreenProps) {
  return (
    <div className="screen gameover-screen">
      <div
        className="welcome-screen__bg gameover-screen__bg"
        style={{ backgroundImage: "url(/assets/title_splash.png)" }}
      />
      <div className="welcome-screen__veil" />

      <div className="scroll-panel animate-unfurl">
        <p className="eyebrow">⚔ Typed Away ⚔</p>
        <h2 className="brand-title brand-title--sm">✦ Training Complete ✦</h2>
        <div className="welcome-screen__divider" />

        <dl className="results-list">
          <div>
            <dt>Final Score</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{finalTime.toFixed(1)}s</dd>
          </div>
          <div>
            <dt>Accuracy</dt>
            <dd>{accuracy.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Rank</dt>
            <dd className="results-list__rank">{rank}</dd>
          </div>
        </dl>

        <p className="gameover-copy">
          Return to the dojo whenever you are ready.
          <br />
          <em>Type. Learn. Conquer.</em>
        </p>

        <button
          type="button"
          className="pixel-btn pixel-btn--primary"
          onClick={onRestart}
        >
          Train again ✦
        </button>
        <p className="hint-text">Press Enter to restart</p>
      </div>
    </div>
  );
}
