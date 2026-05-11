// Diktat checking logic — shared between web and mobile

export type WordResult = {
  word: string;       // as typed by the child
  expected: string;   // correct word
  correct: boolean;
};

export type CheckResult = {
  words: WordResult[];
  score: number;       // 0–100
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
  allCorrect: boolean;
};

/**
 * Normalises a single word for comparison:
 * lower-case, trim, strip leading/trailing punctuation.
 * Preserves German special characters (ä ö ü ß).
 */
function normalise(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/^[^a-zäöüß]+|[^a-zäöüß]+$/gi, "");
}

/**
 * Tokenises a sentence into its words, keeping punctuation attached so the
 * display token matches what the child would type, but compares normalised.
 */
function tokenise(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

/**
 * Checks a child's typed answer against the canonical sentence.
 * Returns per-word results and an overall score.
 */
export function checkDiktatAnswer(
  typed: string,
  expected: string,
  xpReward: number
): CheckResult {
  const typedWords = tokenise(typed);
  const expectedWords = tokenise(expected);

  const len = Math.max(typedWords.length, expectedWords.length);
  const words: WordResult[] = [];

  for (let i = 0; i < len; i++) {
    const tw = typedWords[i] ?? "";
    const ew = expectedWords[i] ?? "";
    words.push({
      word: tw,
      expected: ew,
      correct: normalise(tw) === normalise(ew),
    });
  }

  const correctCount = words.filter((w) => w.correct).length;
  const score = len === 0 ? 0 : Math.round((correctCount / len) * 100);
  const allCorrect = correctCount === len && typedWords.length === expectedWords.length;

  const stars: 0 | 1 | 2 | 3 =
    score === 100 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0;

  const xpEarned = Math.round(xpReward * (score / 100));

  return { words, score, stars, xpEarned, allCorrect };
}

/**
 * Converts a star count to a German display label.
 */
export function starsLabel(stars: 0 | 1 | 2 | 3): string {
  return ["Noch üben", "Gut gemacht!", "Super!", "Perfekt! ⭐⭐⭐"][stars] as string;
}
