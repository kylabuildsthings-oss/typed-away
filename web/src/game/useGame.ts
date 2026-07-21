import { useCallback, useEffect, useRef, useState } from "react";
import { QuestionBank } from "./questionBank";
import {
  calculateAccuracy,
  getFinalRank,
  scoreAnswer,
} from "./scoring";
import type { BeltRank, Question, Screen, VerdictState } from "./types";
import { BELT_NAMES } from "./types";

export interface GameView {
  screen: Screen;
  loading: boolean;
  error: string | null;
  score: number;
  spiritEnergy: number;
  beltRank: BeltRank;
  beltTitle: string;
  questionIndex: number;
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  currentQuestion: Question | null;
  verdict: VerdictState | null;
  promotionBelt: BeltRank | null;
  sessionElapsed: number;
  finalAccuracy: number;
  finalRank: string;
  finalTime: number;
  startGame: () => void;
  submitAnswer: (code: string) => void;
  continueAfterVerdict: () => void;
  continueAfterPromotion: () => void;
  restart: () => void;
}

interface CoreStats {
  score: number;
  spiritEnergy: number;
  beltRank: BeltRank;
  questionIndex: number;
  answeredCount: number;
  correctCount: number;
}

export function useGame(): GameView {
  const bankRef = useRef<QuestionBank | null>(null);
  const sessionStartRef = useRef(0);
  const kataStartRef = useRef(0);
  const pendingPromotionRef = useRef<BeltRank | null>(null);
  const statsRef = useRef<CoreStats>({
    score: 0,
    spiritEnergy: 3,
    beltRank: 1,
    questionIndex: 0,
    answeredCount: 0,
    correctCount: 0,
  });

  const [screen, setScreen] = useState<Screen>("welcome");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [spiritEnergy, setSpiritEnergy] = useState(3);
  const [beltRank, setBeltRank] = useState<BeltRank>(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [verdict, setVerdict] = useState<VerdictState | null>(null);
  const [promotionBelt, setPromotionBelt] = useState<BeltRank | null>(null);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalRank, setFinalRank] = useState("Grasshopper");
  const [finalTime, setFinalTime] = useState(0);

  const syncStats = useCallback((s: CoreStats) => {
    statsRef.current = s;
    setScore(s.score);
    setSpiritEnergy(s.spiritEnergy);
    setBeltRank(s.beltRank);
    setQuestionIndex(s.questionIndex);
    setAnsweredCount(s.answeredCount);
    setCorrectCount(s.correctCount);
  }, []);

  useEffect(() => {
    let cancelled = false;
    QuestionBank.load()
      .then((bank) => {
        if (cancelled) return;
        bankRef.current = bank;
        setTotalQuestions(bank.getTotalQuestions());
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load katas");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (screen !== "challenge" && screen !== "verdict" && screen !== "promotion") {
      return;
    }
    const id = window.setInterval(() => {
      if (!sessionStartRef.current) return;
      setSessionElapsed((Date.now() - sessionStartRef.current) / 1000);
    }, 500);
    return () => window.clearInterval(id);
  }, [screen]);

  const endGame = useCallback((s: CoreStats) => {
    const accuracy = calculateAccuracy(s.correctCount, s.answeredCount);
    const time =
      sessionStartRef.current > 0
        ? (Date.now() - sessionStartRef.current) / 1000
        : 0;
    // Reshuffle on loss (or win) so the next run isn't the same order.
    bankRef.current?.reshuffle();
    syncStats(s);
    setCurrentQuestion(null);
    setVerdict(null);
    setPromotionBelt(null);
    setFinalAccuracy(accuracy);
    setFinalRank(getFinalRank(accuracy));
    setFinalTime(time);
    setSessionElapsed(time);
    setScreen("gameover");
  }, [syncStats]);

  /**
   * Mirror Game.get_next_question: pull next kata for current belt;
   * if exhausted, promote belt (show promotion screen) or end.
   */
  const loadNextKata = useCallback(
    (s: CoreStats) => {
      const bank = bankRef.current;
      if (!bank) return;

      if (s.spiritEnergy <= 0) {
        endGame(s);
        return;
      }

      let belt = s.beltRank;

      while (belt <= 3) {
        const q = bank.nextForLevel(belt);
        if (q) {
          const next: CoreStats = {
            ...s,
            beltRank: belt,
            questionIndex: s.questionIndex + 1,
            answeredCount: s.answeredCount + 1,
          };
          syncStats(next);
          kataStartRef.current = Date.now();
          setCurrentQuestion(q);
          setVerdict(null);
          setPromotionBelt(null);
          setScreen("challenge");
          return;
        }

        if (belt < 3) {
          belt = (belt + 1) as BeltRank;
          const promoted: CoreStats = { ...s, beltRank: belt };
          syncStats(promoted);
          setCurrentQuestion(null);
          setVerdict(null);
          setPromotionBelt(belt);
          setScreen("promotion");
          return;
        }
        break;
      }

      endGame({ ...s, beltRank: belt as BeltRank });
    },
    [endGame, syncStats],
  );

  const startGame = useCallback(() => {
    const bank = bankRef.current;
    if (!bank) return;
    bank.reset();
    sessionStartRef.current = Date.now();
    pendingPromotionRef.current = null;
    setSessionElapsed(0);
    setFinalAccuracy(0);
    setFinalRank("Grasshopper");
    setFinalTime(0);
    setTotalQuestions(bank.getTotalQuestions());

    const fresh: CoreStats = {
      score: 0,
      spiritEnergy: 3,
      beltRank: 1,
      questionIndex: 0,
      answeredCount: 0,
      correctCount: 0,
    };
    loadNextKata(fresh);
  }, [loadNextKata]);

  const submitAnswer = useCallback(
    (playerCode: string) => {
      const q = currentQuestion;
      if (!q || screen !== "challenge") return;

      const elapsed = (Date.now() - kataStartRef.current) / 1000;
      const { points, isCorrect } = scoreAnswer(playerCode, q.expected_code);
      const s = { ...statsRef.current };

      let timeBonus = 0;
      pendingPromotionRef.current = null;

      if (isCorrect) {
        s.score += points;
        s.correctCount += 1;
        if (elapsed < 30) {
          timeBonus = 10;
          s.score += 10;
        }
        if (s.correctCount > 0 && s.correctCount % 3 === 0 && s.beltRank < 3) {
          s.beltRank = (s.beltRank + 1) as BeltRank;
          pendingPromotionRef.current = s.beltRank;
        }
      } else {
        s.spiritEnergy -= 1;
      }

      syncStats(s);
      setVerdict({
        isCorrect,
        points,
        timeBonus,
        expected: q.expected_code,
        actual: playerCode,
        elapsed,
      });
      setScreen("verdict");
    },
    [currentQuestion, screen, syncStats],
  );

  const continueAfterVerdict = useCallback(() => {
    const promo = pendingPromotionRef.current;
    if (promo) {
      pendingPromotionRef.current = null;
      setVerdict(null);
      setPromotionBelt(promo);
      setScreen("promotion");
      return;
    }
    loadNextKata(statsRef.current);
  }, [loadNextKata]);

  const continueAfterPromotion = useCallback(() => {
    setPromotionBelt(null);
    loadNextKata(statsRef.current);
  }, [loadNextKata]);

  const restart = useCallback(() => {
    pendingPromotionRef.current = null;
    syncStats({
      score: 0,
      spiritEnergy: 3,
      beltRank: 1,
      questionIndex: 0,
      answeredCount: 0,
      correctCount: 0,
    });
    setCurrentQuestion(null);
    setVerdict(null);
    setPromotionBelt(null);
    setSessionElapsed(0);
    setScreen("welcome");
  }, [syncStats]);

  return {
    screen,
    loading,
    error,
    score,
    spiritEnergy,
    beltRank,
    beltTitle: BELT_NAMES[beltRank],
    questionIndex,
    answeredCount,
    correctCount,
    totalQuestions,
    currentQuestion,
    verdict,
    promotionBelt,
    sessionElapsed,
    finalAccuracy,
    finalRank,
    finalTime,
    startGame,
    submitAnswer,
    continueAfterVerdict,
    continueAfterPromotion,
    restart,
  };
}
