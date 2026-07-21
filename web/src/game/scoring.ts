/**
 * Port of Python difflib.SequenceMatcher.ratio() (Ratcliff/Obershelp).
 * ratio = 2.0 * matches / (len(a) + len(b))
 */
function findLongestMatch(
  a: string,
  alo: number,
  ahi: number,
  b: string,
  blo: number,
  bhi: number,
): [number, number, number] {
  let besti = alo;
  let bestj = blo;
  let bestsize = 0;

  const j2len = new Map<number, number>();

  for (let i = alo; i < ahi; i++) {
    const newj2len = new Map<number, number>();
    for (let j = blo; j < bhi; j++) {
      if (a[i] !== b[j]) continue;
      const k = (j2len.get(j - 1) ?? 0) + 1;
      newj2len.set(j, k);
      if (k > bestsize) {
        besti = i - k + 1;
        bestj = j - k + 1;
        bestsize = k;
      }
    }
    j2len.clear();
    for (const [k, v] of newj2len) j2len.set(k, v);
  }

  return [besti, bestj, bestsize];
}

function matchingBlocks(
  a: string,
  alo: number,
  ahi: number,
  b: string,
  blo: number,
  bhi: number,
): number {
  const [i, j, k] = findLongestMatch(a, alo, ahi, b, blo, bhi);
  if (k === 0) return 0;

  let total = k;
  if (alo < i && blo < j) {
    total += matchingBlocks(a, alo, i, b, blo, j);
  }
  if (i + k < ahi && j + k < bhi) {
    total += matchingBlocks(a, i + k, ahi, b, j + k, bhi);
  }
  return total;
}

/** Same as Python difflib.SequenceMatcher(None, a, b).ratio() */
export function sequenceRatio(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la + lb === 0) return 1;
  const matches = matchingBlocks(a, 0, la, b, 0, lb);
  return (2.0 * matches) / (la + lb);
}

/**
 * Score player code vs expected (mirrors game.py score_answer).
 * Exact / whitespace-normalized → 100 correct;
 * similarity > 0.8 → 50–90 correct;
 * similarity > 0.5 → 20 wrong;
 * else → 0 wrong.
 */
export function scoreAnswer(
  playerCode: string,
  expectedCode: string,
): { points: number; isCorrect: boolean } {
  const playerClean = playerCode.trim();
  const expectedClean = expectedCode.trim();

  if (playerClean === expectedClean) {
    return { points: 100, isCorrect: true };
  }

  const playerNorm = playerClean.split(/\s+/).join(" ");
  const expectedNorm = expectedClean.split(/\s+/).join(" ");
  if (playerNorm === expectedNorm) {
    return { points: 100, isCorrect: true };
  }

  const similarity = sequenceRatio(playerNorm, expectedNorm);

  if (similarity > 0.8) {
    const points = 50 + Math.floor(similarity * 40);
    return { points, isCorrect: true };
  }

  if (similarity > 0.5) {
    return { points: 20, isCorrect: false };
  }

  return { points: 0, isCorrect: false };
}

export function getFinalRank(accuracy: number): string {
  if (accuracy >= 90) return "Master";
  if (accuracy >= 75) return "Black Belt Candidate";
  if (accuracy >= 60) return "Dedicated Student";
  if (accuracy >= 40) return "Apprentice";
  return "Grasshopper";
}

export function calculateAccuracy(
  correctCount: number,
  answeredCount: number,
): number {
  if (answeredCount === 0) return 0;
  return (correctCount / answeredCount) * 100;
}
