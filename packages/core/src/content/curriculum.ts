import type { GrammarCategory } from "../types/index.js";

// Bayern LehrplanPLUS Grundschule — minimum grade per exercise category
export const CURRICULUM_MIN_KLASSE: Record<GrammarCategory, number> = {
  "noun-gender":          1, // Der/Die/Das ab Klasse 1
  "plural":               1, // Einzahl & Mehrzahl ab Klasse 1
  "capitalization":       1, // Großschreibung ab Klasse 1
  "verb-conjugation":     2, // Verbkonjugation (Präsens) ab Klasse 2
  "punctuation":          2, // Satzzeichen ab Klasse 2
  "adjective-comparison": 3, // Adjektiv-Steigerung ab Klasse 3
  "sentence-building":    3, // Satzbau ab Klasse 3
  "word-types":           3, // Wortarten ab Klasse 3
  "satzglieder":          3, // Satzglieder ab Klasse 3
  "past-tense":           4, // Präteritum/Zeitformen ab Klasse 4
};

export function filterByGrade<T extends { klasse: number }>(
  exercises: T[],
  grade: number,
): T[] {
  return exercises.filter((e) => e.klasse <= grade);
}
