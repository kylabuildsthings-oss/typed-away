export type BeltRank = 1 | 2 | 3;

export interface Question {
  id: number;
  level: number;
  topic: string;
  description: string;
  expected_code: string;
  hint?: string;
  time_limit?: number;
  belt?: string;
}

export interface QuestionsFile {
  questions: Question[];
}

export type Screen =
  | "welcome"
  | "challenge"
  | "verdict"
  | "promotion"
  | "gameover";

export interface ScoreResult {
  points: number;
  isCorrect: boolean;
  timeBonus: number;
}

export interface VerdictState {
  isCorrect: boolean;
  points: number;
  timeBonus: number;
  expected: string;
  actual: string;
  elapsed: number;
}

export const BELT_NAMES: Record<BeltRank, string> = {
  1: "White Belt",
  2: "Yellow Belt",
  3: "Green Belt",
};
