import type { BeltRank } from "../game/types";
import { BELT_NAMES } from "../game/types";

interface PromotionScreenProps {
  belt: BeltRank;
  onContinue: () => void;
}

const BELT_CLASS: Record<BeltRank, string> = {
  1: "belt--white",
  2: "belt--yellow",
  3: "belt--green",
};

export function PromotionScreen({ belt, onContinue }: PromotionScreenProps) {
  return (
    <div className="screen promotion-screen">
      <div className="wood-backdrop" />
      <div className="scroll-panel animate-unfurl promotion-panel">
        <p className="eyebrow">✦ Advancement ✦</p>
        <h2 className="promotion-title">🥋 Belt Promotion! 🥋</h2>
        <p className={`promotion-belt ${BELT_CLASS[belt]}`}>
          You&apos;ve earned your {BELT_NAMES[belt]}!
        </p>
        <p className="promotion-copy">Train harder. Sharper code awaits.</p>
        <div className={`belt-sash ${BELT_CLASS[belt]}`} aria-hidden />
        <button
          type="button"
          className="pixel-btn pixel-btn--primary"
          onClick={onContinue}
        >
          Continue training ✦
        </button>
        <p className="hint-text">Press Enter to continue</p>
      </div>
    </div>
  );
}
