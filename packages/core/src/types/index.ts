// ─── Difficulty / Grade level ────────────────────────────────────────────────

export type Klasse = 1 | 2 | 3 | 4;

// ─── Diktat ──────────────────────────────────────────────────────────────────

export interface DiktatSentence {
  id: string;
  text: string;           // canonical German sentence
  hint?: string;          // optional pedagogic hint shown after error
}

export interface DiktatLesson {
  id: string;
  title: string;
  klasse: Klasse;
  theme: string;          // e.g. "Tiere im Wald"
  sentences: DiktatSentence[];
  xpReward: number;
}

// ─── Rechtschreibung ─────────────────────────────────────────────────────────

export type RechtschreibungType =
  | "fill-in-blank"
  | "multiple-choice"
  | "word-sort";

export interface RechtschreibungExercise {
  id: string;
  type: RechtschreibungType;
  klasse: Klasse;
  question: string;
  options?: string[];         // for multiple-choice & word-sort
  correctAnswer: string | string[];
  rule?: string;              // spelling rule tag, e.g. "ß-vs-ss"
  xpReward: number;
}

// ─── Grammatik ───────────────────────────────────────────────────────────────

export type GrammarCategory =
  | "verb-conjugation"
  | "noun-gender"
  | "plural"
  | "satzglieder";

export type Tempus = "Präsens" | "Präteritum" | "Perfekt";

export interface GrammarRule {
  id: string;
  category: GrammarCategory;
  title: string;
  description: string;
  klasse: Klasse;
  examples: string[];
}

export interface GrammarExercise {
  id: string;
  category: GrammarCategory;
  klasse: Klasse;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  xpReward: number;
}

// ─── Progress & Gamification ─────────────────────────────────────────────────

export type ExerciseType = "diktat" | "rechtschreibung" | "grammatik";

export interface ExerciseResult {
  exerciseId: string;
  type: ExerciseType;
  completedAt: string;       // ISO timestamp
  score: number;             // 0–100
  xpEarned: number;
  stars: 0 | 1 | 2 | 3;
  errors: number;
}

export interface UserProgress {
  userId: string;
  totalXp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;   // ISO date
  completedExercises: ExerciseResult[];
  unlockedBadges: string[];
}

// ─── Generic exercise union ───────────────────────────────────────────────────

export type Exercise =
  | ({ exerciseType: "diktat" } & DiktatLesson)
  | ({ exerciseType: "rechtschreibung" } & RechtschreibungExercise)
  | ({ exerciseType: "grammatik" } & GrammarExercise);
