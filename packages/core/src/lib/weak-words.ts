import type { WeakWord } from "../types/index.js";

// ─── Spaced repetition interval in days ──────────────────────────────────────

function nextReviewDate(wrongCount: number): string {
  const days = wrongCount >= 5 ? 1 : wrongCount >= 3 ? 2 : 3;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Build weak-word upsert records from a completed Diktat ──────────────────

export interface WrongWordEntry {
  word: string;      // the correctly-spelled word the child missed
  sentenceId: string;
}

export function buildWeakWordUpdates(
  userId: string,
  wrongWords: WrongWordEntry[],
  existingWeakWords: WeakWord[]
): WeakWord[] {
  const now = new Date().toISOString();
  const existingMap = new Map(existingWeakWords.map((w) => [w.word.toLowerCase(), w]));

  const updates: WeakWord[] = [];
  const seen = new Set<string>();

  for (const { word, sentenceId } of wrongWords) {
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const existing = existingMap.get(key);
    const wrongCount = (existing?.wrong_count ?? 0) + 1;

    updates.push({
      ...(existing ?? {}),
      user_id: userId,
      word,
      sentence_id: sentenceId,
      wrong_count: wrongCount,
      last_seen: now,
      next_review: nextReviewDate(wrongCount),
    });
  }

  return updates;
}
