import { useEffect } from "react";
import { ChallengeScreen } from "./components/ChallengeScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { PromotionScreen } from "./components/PromotionScreen";
import { VerdictScreen } from "./components/VerdictScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { useGame } from "./game/useGame";

export default function App() {
  const game = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (game.screen === "welcome" && !game.loading && !game.error) {
        e.preventDefault();
        game.startGame();
      } else if (game.screen === "verdict") {
        e.preventDefault();
        game.continueAfterVerdict();
      } else if (game.screen === "promotion") {
        e.preventDefault();
        game.continueAfterPromotion();
      } else if (game.screen === "gameover") {
        e.preventDefault();
        game.restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    game.screen,
    game.loading,
    game.error,
    game.startGame,
    game.continueAfterVerdict,
    game.continueAfterPromotion,
    game.restart,
  ]);

  if (game.screen === "welcome") {
    return (
      <WelcomeScreen
        onStart={game.startGame}
        loading={game.loading}
        error={game.error}
      />
    );
  }

  if (game.screen === "challenge" && game.currentQuestion) {
    return (
      <ChallengeScreen
        question={game.currentQuestion}
        score={game.score}
        answeredCount={game.answeredCount}
        totalQuestions={game.totalQuestions}
        spiritEnergy={game.spiritEnergy}
        sessionElapsed={game.sessionElapsed}
        beltRank={game.beltRank}
        onSubmit={game.submitAnswer}
      />
    );
  }

  if (game.screen === "verdict" && game.verdict) {
    return (
      <VerdictScreen
        verdict={game.verdict}
        score={game.score}
        answeredCount={game.answeredCount}
        totalQuestions={game.totalQuestions}
        spiritEnergy={game.spiritEnergy}
        sessionElapsed={game.sessionElapsed}
        beltRank={game.beltRank}
        onContinue={game.continueAfterVerdict}
      />
    );
  }

  if (game.screen === "promotion" && game.promotionBelt) {
    return (
      <PromotionScreen
        belt={game.promotionBelt}
        onContinue={game.continueAfterPromotion}
      />
    );
  }

  if (game.screen === "gameover") {
    return (
      <GameOverScreen
        score={game.score}
        finalTime={game.finalTime}
        accuracy={game.finalAccuracy}
        rank={game.finalRank}
        onRestart={game.restart}
      />
    );
  }

  return (
    <div className="screen">
      <p className="hint-text">Loading dojo…</p>
    </div>
  );
}
