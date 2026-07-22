/**
 * Short Sensei coaching tips when a kata is missed (1–2 lines).
 */

function defName(code: string): string | null {
  const m = code.match(/\bdef\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  return m ? m[1] : null;
}

/**
 * Returns one or two short coaching lines for a wrong answer.
 */
export function coachingTips(
  playerCode: string,
  expectedCode: string,
  hint?: string,
): string[] {
  const actual = (playerCode ?? "").trim();
  const expected = (expectedCode ?? "").trim();
  const tips: string[] = [];

  const add = (tip: string) => {
    if (tips.length >= 2) return;
    if (!tip || tips.includes(tip)) return;
    tips.push(tip);
  };

  if (!actual) {
    add("Your scroll is blank — type the full function, starting with def.");
    if (hint) add(`Next time: ${hint}`);
    return tips;
  }

  const want = defName(expected);
  const got = defName(actual);

  if (want && !got) {
    add(`Start with def ${want}(...): — Python functions begin with def.`);
  } else if (want && got && want !== got) {
    add(`Name it '${want}', not '${got}' — the function name must match exactly.`);
  }

  const defLineBad = actual
    .split("\n")
    .some((line) => /^\s*def\s+/.test(line) && !/:\s*(#.*)?$/.test(line));
  if (defLineBad) {
    add("Add a colon : at the end of your def line to open the code block.");
  }

  const lines = actual.split("\n");
  const defIdx = lines.findIndex((l) => /^\s*def\s+/.test(l));
  if (defIdx !== -1) {
    const body = lines.slice(defIdx + 1).filter((l) => l.trim());
    if (body.length === 0 || body.some((l) => !/^\s+/.test(l))) {
      add("Indent the body with 4 spaces under def — Python uses indentation for blocks.");
    }
  }

  const needsReturn = /\breturn\b/.test(expected);
  const hasReturn = /\breturn\b/.test(actual);
  if (needsReturn && !hasReturn) {
    if (/\bprint\s*\(/.test(actual)) {
      add("Use return, not print — send the value back to the caller.");
    } else {
      add("You're missing return — compute the answer, then return it.");
    }
  }

  if (tips.length === 0 && expected.includes("%") && !actual.includes("%")) {
    add("Try the modulo operator % — useful for even/odd checks.");
  }
  if (tips.length === 0 && expected.includes("**") && !actual.includes("**")) {
    add("For powers, use ** (e.g. n ** 2).");
  }
  if (tips.length === 0 && /\blen\s*\(/.test(expected) && !/\blen\s*\(/.test(actual)) {
    add("Use len(...) to get the length of a string or list.");
  }

  if (tips.length === 0 && hint) {
    add(`Sensei's tip: ${hint}`);
  }

  if (tips.length === 0) {
    add(
      "Close — match Sensei's def name, parameters, and return expression.",
    );
  }

  if (tips.length === 1 && hint && !tips[0].includes(hint)) {
    add(`Also: ${hint}`);
  }

  return tips.slice(0, 2);
}
