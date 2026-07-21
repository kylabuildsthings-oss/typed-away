import type { Question, QuestionsFile } from "./types";
import { BELT_NAMES } from "./types";

export class QuestionBank {
  /** Canonical list in file order — never mutated. */
  private readonly allQuestions: Question[] = [];
  private byLevel: Map<number, Question[]> = new Map();
  private cursors: Map<number, number> = new Map();

  static async load(url = "/questions.json"): Promise<QuestionBank> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load questions: ${res.status}`);
    const data = (await res.json()) as QuestionsFile;
    return new QuestionBank(data.questions ?? []);
  }

  constructor(raw: Question[]) {
    this.allQuestions = raw.map((q) => ({
      ...q,
      belt: BELT_NAMES[q.level as 1 | 2 | 3] ?? `Belt ${q.level}`,
    }));
    this.reshuffle();
  }

  /** Fisher–Yates shuffle (in place). */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Reshuffle questions so order isn't memorized.
   * Keeps belt levels intact (White → Yellow → Green), but randomizes
   * kata order within each belt — then resets cursors.
   */
  reshuffle(): void {
    this.byLevel = new Map();
    this.cursors = new Map();

    for (const q of this.allQuestions) {
      const list = this.byLevel.get(q.level) ?? [];
      list.push(q);
      this.byLevel.set(q.level, list);
    }

    for (const [level, list] of this.byLevel) {
      this.byLevel.set(level, this.shuffleArray([...list]));
      this.cursors.set(level, 0);
    }
  }

  getTotalQuestions(): number {
    return this.allQuestions.length;
  }

  getRemainingAtLevel(level: number): number {
    const questions = this.byLevel.get(level) ?? [];
    const cursor = this.cursors.get(level) ?? 0;
    return Math.max(0, questions.length - cursor);
  }

  nextForLevel(level: number): Question | null {
    const questions = this.byLevel.get(level) ?? [];
    const cursor = this.cursors.get(level) ?? 0;
    if (cursor >= questions.length) return null;
    const question = questions[cursor];
    this.cursors.set(level, cursor + 1);
    return question;
  }

  hasAnyRemaining(): boolean {
    for (const level of this.byLevel.keys()) {
      if (this.getRemainingAtLevel(level) > 0) return true;
    }
    return false;
  }

  /** Reset cursors and reshuffle for a fresh run. */
  reset(): void {
    this.reshuffle();
  }
}
