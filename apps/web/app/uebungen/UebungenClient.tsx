"use client";

import { useState, useEffect } from "react";
import type { GrammarExercise, GrammarCategory, Klasse } from "@schreibfix/core";
import {
  verbConjugationExercises,
  nounGenderExercises,
  pluralExercises,
  adjectiveComparisonExercises,
  punctuationExercises,
  capitalizationExercises,
  wordTypeExercises,
  sentenceBuildingExercises,
  pastTenseExercises,
  vocabularyExercises,
  CURRICULUM_MIN_KLASSE,
  filterByGrade,
} from "@schreibfix/core";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { usePaywall } from "@/components/SubscriptionProvider";
import { playCorrect, playWrong, playComplete } from "@/lib/sounds";
import { speakText } from "@/lib/tts";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionPhase = "hub" | "playing" | "done";

const EXERCISES_PER_SESSION = 5;

// ─── Exercise type registry ───────────────────────────────────────────────────

interface ExerciseTypeConfig {
  category: GrammarCategory;
  lessonId: string;
  label: string;
  icon: string;
  description: string;
  difficulty: "Einfach" | "Mittel" | "Fortgeschritten";
  group: "Grammatik" | "Rechtschreibung";
  exercises: GrammarExercise[];
  aiRoute: string;
}

const EXERCISE_TYPES: ExerciseTypeConfig[] = [
  // ── Grammatik ──────────────────────────────────────────────────────────────
  {
    category: "verb-conjugation",
    lessonId: "grammatik-verben",
    label: "Verbkonjugation",
    icon: "🔄",
    description: "Konjugiere das Verb richtig!",
    difficulty: "Einfach",
    group: "Grammatik",
    exercises: verbConjugationExercises,
    aiRoute: "/api/ai/verben",
  },
  {
    category: "noun-gender",
    lessonId: "grammatik-artikel",
    label: "Der / Die / Das",
    icon: "🏷️",
    description: "Welcher Artikel gehört dazu?",
    difficulty: "Einfach",
    group: "Grammatik",
    exercises: nounGenderExercises,
    aiRoute: "/api/ai/artikel",
  },
  {
    category: "plural",
    lessonId: "grammatik-plural",
    label: "Einzahl & Mehrzahl",
    icon: "🔢",
    description: "Was ist die Mehrzahl?",
    difficulty: "Mittel",
    group: "Grammatik",
    exercises: pluralExercises,
    aiRoute: "/api/ai/plural",
  },
  {
    category: "adjective-comparison",
    lessonId: "grammatik-adjektive",
    label: "Steigerung",
    icon: "📈",
    description: "Komparativ und Superlativ",
    difficulty: "Mittel",
    group: "Grammatik",
    exercises: adjectiveComparisonExercises,
    aiRoute: "/api/ai/steigerung",
  },
  {
    category: "word-types",
    lessonId: "grammatik-wortarten",
    label: "Wortarten",
    icon: "🧩",
    description: "Nomen, Verb oder Adjektiv?",
    difficulty: "Mittel",
    group: "Grammatik",
    exercises: wordTypeExercises,
    aiRoute: "/api/ai/wortarten",
  },
  {
    category: "past-tense",
    lessonId: "grammatik-zeitformen",
    label: "Präteritum",
    icon: "⏮️",
    description: "Von Präsens zu Präteritum",
    difficulty: "Fortgeschritten",
    group: "Grammatik",
    exercises: pastTenseExercises,
    aiRoute: "/api/ai/zeitformen",
  },
  // ── Rechtschreibung ────────────────────────────────────────────────────────
  {
    category: "punctuation",
    lessonId: "grammatik-satzzeichen",
    label: "Satzzeichen",
    icon: "❓",
    description: "Punkt, Frage- oder Ausrufezeichen?",
    difficulty: "Einfach",
    group: "Rechtschreibung",
    exercises: punctuationExercises,
    aiRoute: "/api/ai/satzzeichen",
  },
  {
    category: "capitalization",
    lessonId: "grammatik-grossschreibung",
    label: "Großschreibung",
    icon: "🔠",
    description: "Welches Wort muss groß geschrieben werden?",
    difficulty: "Mittel",
    group: "Rechtschreibung",
    exercises: capitalizationExercises,
    aiRoute: "/api/ai/grossschreibung",
  },
  {
    category: "sentence-building",
    lessonId: "grammatik-satzbau",
    label: "Satzbau",
    icon: "🔀",
    description: "Bringe die Wörter in die richtige Reihenfolge!",
    difficulty: "Fortgeschritten",
    group: "Rechtschreibung",
    exercises: sentenceBuildingExercises,
    aiRoute: "/api/ai/satzbau",
  },
  {
    category: "vocabulary",
    lessonId: "grammatik-wortschatz",
    label: "Wortschatz",
    icon: "📖",
    description: "Lerne neue Synonyme!",
    difficulty: "Mittel",
    group: "Rechtschreibung",
    exercises: vocabularyExercises,
    aiRoute: "/api/ai/wortschatz",
  },
];

const DIFFICULTY_COLORS = {
  Einfach:         "bg-forest-light text-forest-dark",
  Mittel:          "bg-amber-100 text-amber-800",
  Fortgeschritten: "bg-red-100 text-red-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// Convert AI response objects into GrammarExercise for common patterns
function aiResponseToExercise(
  category: GrammarCategory,
  klasse: Klasse,
  index: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
): GrammarExercise {
  const base = { category, klasse, xpReward: 5 as const };
  if (category === "verb-conjugation") {
    return { ...base, id: `ai-verb-${Date.now()}-${index}`, prompt: item.sentence as string, options: shuffleArray([item.correctAnswer, ...item.wrongOptions] as string[]), correctAnswer: item.correctAnswer as string, explanation: `Das Verb "${item.verb as string}" wird hier so konjugiert.` };
  }
  if (category === "noun-gender") {
    return { ...base, id: `ai-artikel-${Date.now()}-${index}`, prompt: `${item.emoji as string} ${item.noun as string}`, options: ["der", "die", "das"], correctAnswer: item.correctArticle as string, explanation: item.hint as string };
  }
  if (category === "plural") {
    return { ...base, id: `ai-plural-${Date.now()}-${index}`, prompt: `Wie heißt die Mehrzahl von „${item.singular as string}"?`, options: shuffleArray([item.plural, ...item.wrongOptions] as string[]), correctAnswer: item.plural as string, explanation: item.hint as string };
  }
  if (category === "adjective-comparison") {
    return { ...base, id: `ai-steigerung-${Date.now()}-${index}`, prompt: item.sentence as string, options: shuffleArray([item.correctAnswer, ...item.wrongOptions] as string[]), correctAnswer: item.correctAnswer as string, explanation: item.hint as string };
  }
  if (category === "word-types") {
    return { ...base, id: `ai-wortarten-${Date.now()}-${index}`, prompt: `„${item.word as string}" — ${item.sentence as string}`, options: ["Nomen", "Verb", "Adjektiv", "Artikel"], correctAnswer: item.correctType as string, explanation: item.hint as string };
  }
  if (category === "punctuation") {
    return { ...base, id: `ai-satzzeichen-${Date.now()}-${index}`, prompt: `${item.sentence as string} _`, options: [".", "?", "!"], correctAnswer: item.correctPunctuation as string, explanation: item.hint as string };
  }
  if (category === "capitalization") {
    return { ...base, id: `ai-gross-${Date.now()}-${index}`, prompt: item.sentence as string, options: item.options as string[], correctAnswer: item.correctAnswer as string, explanation: item.hint as string };
  }
  if (category === "sentence-building") {
    return { ...base, id: `ai-satzbau-${Date.now()}-${index}`, prompt: `Wörter: ${item.prompt as string}`, options: shuffleArray([item.correctSentence, ...item.wrongOptions] as string[]), correctAnswer: item.correctSentence as string, explanation: item.hint as string };
  }
  // past-tense / zeitformen
  return { ...base, id: `ai-zeitformen-${Date.now()}-${index}`, prompt: item.sentence as string, options: shuffleArray([item.correctAnswer, ...item.wrongOptions] as string[]), correctAnswer: item.correctAnswer as string, explanation: item.hint as string };
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  onClick,
  state,
  fullWidth = true,
}: {
  label: string;
  onClick: () => void;
  state: "idle" | "correct" | "wrong";
  fullWidth?: boolean;
}) {
  const base =
    "rounded-2xl border-2 px-4 py-4 text-lg font-bold transition-colors text-left";
  const width = fullWidth ? "w-full" : "";
  const styles = {
    idle:    `${base} ${width} border-gray-200 bg-white hover:border-fox hover:text-fox`,
    correct: `${base} ${width} border-forest bg-forest-light text-forest-dark`,
    wrong:   `${base} ${width} border-red-400 bg-red-50 text-red-700`,
  };
  return (
    <button className={styles[state]} onClick={onClick} disabled={state !== "idle"}>
      {label}
    </button>
  );
}

// ─── Vocabulary Card ──────────────────────────────────────────────────────────

function VocabCard({ exercise }: { exercise: GrammarExercise }) {
  if (!exercise.vocabData) return null;
  const { emoji, definition, example } = exercise.vocabData;
  return (
    <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 px-4 py-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{emoji}</span>
        <p className="text-2xl font-black text-blue-800">{exercise.correctAnswer}</p>
      </div>
      <p className="text-sm text-blue-700 mb-1">{definition}</p>
      <p className="text-sm text-blue-600 italic">💬 {example}</p>
    </div>
  );
}

// ─── Hub Screen ───────────────────────────────────────────────────────────────

function HubScreen({
  klasse,
  onSelect,
  onRandom,
  onAi,
  aiLoading,
}: {
  klasse: Klasse;
  onSelect: (cfg: ExerciseTypeConfig) => void;
  onRandom: () => void;
  onAi: (cfg: ExerciseTypeConfig) => void;
  aiLoading: string | null;
}) {
  const grammatik = EXERCISE_TYPES.filter((t) => t.group === "Grammatik");
  const rechtschreibung = EXERCISE_TYPES.filter((t) => t.group === "Rechtschreibung");

  const renderCard = (cfg: ExerciseTypeConfig) => {
    const minKlasse = CURRICULUM_MIN_KLASSE[cfg.category] ?? 1;
    const locked = klasse < minKlasse;
    const available = filterByGrade(cfg.exercises, klasse).length;
    const isAiLoading = aiLoading === cfg.category;

    return (
      <div
        key={cfg.category}
        className={`card text-left border-2 flex flex-col gap-2 p-3 relative overflow-hidden
          ${locked ? "border-gray-100 opacity-70" : "border-transparent"}`}
      >
        {locked ? (
          <div className="flex flex-col gap-1 text-left">
            <span className="text-3xl opacity-40">{cfg.icon}</span>
            <p className="font-black text-base leading-tight text-gray-400">{cfg.label}</p>
            <p className="text-xs text-gray-400 leading-snug">{cfg.description}</p>
            <div className="mt-1 flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
              <span className="text-sm">🔒</span>
              <span className="text-xs font-bold text-gray-500">Ab Klasse {minKlasse}</span>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => onSelect(cfg)}
              className="flex flex-col gap-1 text-left"
            >
              <span className="text-3xl">{cfg.icon}</span>
              <p className="font-black text-base leading-tight">{cfg.label}</p>
              <p className="text-xs text-gray-500 leading-snug">{cfg.description}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[cfg.difficulty]}`}
                >
                  {cfg.difficulty}
                </span>
                <span className="text-xs text-gray-400">{available} Aufg.</span>
              </div>
            </button>
            <button
              onClick={() => onAi(cfg)}
              disabled={aiLoading !== null}
              className="mt-1 text-xs font-bold text-violet-600 border border-violet-300 rounded-lg px-2 py-1
                         hover:bg-violet-50 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {isAiLoading ? "⏳ Lädt…" : "🤖 Neue Aufgaben"}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">✏️</div>
        <h2 className="text-2xl font-black text-fox">Übungen</h2>
        <p className="text-gray-500">Wähle eine Übungsart!</p>
      </div>

      <button
        onClick={onRandom}
        className="btn-primary w-full mb-8 text-lg flex items-center justify-center gap-2"
      >
        🎲 Zufällige Übung
      </button>

      <div className="mb-6">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">
          📚 Grammatik
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {grammatik.map(renderCard)}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">
          ✍️ Rechtschreibung & Wortschatz
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {rechtschreibung.map(renderCard)}
        </div>
      </div>
    </div>
  );
}

// ─── Playing Screen ───────────────────────────────────────────────────────────

function PlayingScreen({
  cfg,
  exercise,
  exerciseNum,
  total,
  selected,
  feedback,
  waitingNext,
  onSelect,
  onNext,
}: {
  cfg: ExerciseTypeConfig;
  exercise: GrammarExercise;
  exerciseNum: number;
  total: number;
  selected: string | null;
  feedback: "correct" | "wrong" | null;
  waitingNext: boolean;
  onSelect: (option: string) => void;
  onNext: () => void;
}) {
  const optionCount = exercise.options?.length ?? 4;
  const isSentenceBuilding = cfg.category === "sentence-building";
  const isVocabulary = cfg.category === "vocabulary";
  const isThreeCol = (optionCount === 3 && !isSentenceBuilding);
  const gridClass = isSentenceBuilding
    ? "grid-cols-1"
    : isThreeCol
    ? "grid-cols-3"
    : "grid-cols-2";

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>
            {cfg.icon} {cfg.label} · Aufgabe {exerciseNum} von {total}
          </span>
          <span className="font-bold text-fox">+{exercise.xpReward} XP</span>
        </div>
        <div className="h-3 rounded-full bg-fox-light overflow-hidden">
          <div
            className="h-full rounded-full bg-fox transition-all duration-500"
            style={{ width: `${((exerciseNum - 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Fox */}
      <div className="card mb-5 flex items-center gap-4">
        <span className="text-5xl">🦊</span>
        <p className="text-lg text-gray-700">
          {feedback === "correct"
            ? "Richtig! Super gemacht! 🎉"
            : feedback === "wrong"
            ? "Fast! Schau dir die Antwort an."
            : isVocabulary
            ? "Welches Wort bedeutet dasselbe?"
            : "Wähle die richtige Antwort!"}
        </p>
      </div>

      {/* Question */}
      <div className="card mb-5 text-center">
        {cfg.category === "capitalization" ? (
          <>
            <p className="text-xs text-gray-400 mb-2 font-bold">Welches Wort muss großgeschrieben werden?</p>
            <p className="font-black text-xl">{exercise.prompt}</p>
          </>
        ) : cfg.category === "punctuation" ? (
          <>
            <p className="text-xs text-gray-400 mb-2 font-bold">Welches Satzzeichen fehlt?</p>
            <p className="font-black text-2xl">{exercise.prompt}</p>
          </>
        ) : cfg.category === "sentence-building" ? (
          <>
            <p className="text-xs text-gray-400 mb-2 font-bold">Wähle die richtige Reihenfolge!</p>
            <p className="font-black text-base">{exercise.prompt}</p>
          </>
        ) : cfg.category === "noun-gender" ? (
          <>
            <p className="font-black text-5xl mb-1">{exercise.prompt}</p>
            <p className="text-gray-400 text-base">Welcher Artikel passt?</p>
          </>
        ) : cfg.category === "vocabulary" ? (
          <>
            <p className="text-xs text-gray-400 mb-2 font-bold">Welches Wort bedeutet dasselbe wie …</p>
            <p className="font-black text-4xl text-fox">{exercise.prompt}</p>
          </>
        ) : (
          <p className="font-black text-xl">{exercise.prompt}</p>
        )}
      </div>

      {/* Options */}
      <div className={`grid gap-3 mb-5 ${gridClass}`}>
        {exercise.options?.map((option) => {
          let state: "idle" | "correct" | "wrong" = "idle";
          if (selected !== null) {
            if (option === exercise.correctAnswer) state = "correct";
            else if (option === selected) state = "wrong";
          }
          return (
            <OptionButton
              key={option}
              label={option}
              state={state}
              fullWidth={true}
              onClick={() => onSelect(option)}
            />
          );
        })}
      </div>

      {/* Feedback banner — shown immediately after clicking */}
      {feedback !== null && (
        <div
          className={`rounded-2xl px-5 py-4 mb-4 text-center
            ${feedback === "correct"
              ? "bg-forest-light border-2 border-forest"
              : "bg-red-50 border-2 border-red-300"}`}
        >
          <p className={`text-xl font-black
            ${feedback === "correct" ? "text-forest-dark" : "text-red-700"}`}
          >
            {feedback === "correct" ? "✓ Richtig!" : "✗ Falsch!"}
          </p>
          {feedback === "wrong" && (
            <p className="text-base font-bold text-gray-700 mt-1">
              Richtig wäre:{" "}
              <span className="text-forest-dark">{exercise.correctAnswer}</span>
            </p>
          )}
        </div>
      )}

      {/* Vocabulary card — shown after answering */}
      {feedback !== null && isVocabulary && exercise.vocabData && (
        <VocabCard exercise={exercise} />
      )}

      {/* Explanation (non-vocabulary) */}
      {feedback !== null && exercise.explanation && !isVocabulary && (
        <div
          className={`rounded-2xl px-4 py-3 text-base font-bold mb-4
            ${feedback === "correct"
              ? "bg-forest-light text-forest-dark"
              : "bg-amber-50 border border-amber-200 text-amber-800"}`}
        >
          💡 {exercise.explanation}
        </div>
      )}

      {/* Weiter button — only shown after answering */}
      {waitingNext && (
        <button
          className="btn-primary w-full text-lg"
          onClick={onNext}
        >
          Weiter →
        </button>
      )}
    </div>
  );
}

// ─── Done Screen ──────────────────────────────────────────────────────────────

function DoneScreen({
  cfg,
  answers,
  exercises,
  onReplay,
  onHub,
}: {
  cfg: ExerciseTypeConfig;
  answers: boolean[];
  exercises: GrammarExercise[];
  onReplay: () => void;
  onHub: () => void;
}) {
  const correct = answers.filter(Boolean).length;
  const score = Math.round((correct / answers.length) * 100);
  const xpEarned = exercises.reduce(
    (sum, e, i) => sum + (answers[i] ? e.xpReward : 0),
    0,
  );
  const stars = score === 100 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
  const starsLabel =
    stars === 3 ? "Perfekt! ⭐⭐⭐" : stars === 2 ? "Super gemacht! ⭐⭐" : stars === 1 ? "Gut versucht! ⭐" : "Weiter üben! 💪";

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <div className="text-6xl mb-4">
        {stars === 3 ? "🦊🎉" : stars >= 2 ? "🦊😄" : "🦊💪"}
      </div>
      <h2 className="text-2xl font-black text-fox mb-2">
        {cfg.icon} {cfg.label} — Runde beendet!
      </h2>
      <p className="text-lg mb-1">{starsLabel}</p>
      <p className="text-gray-500 mb-6">
        <strong className="text-fox">+{xpEarned} XP</strong> verdient!
      </p>

      <div className="card mb-6 text-left">
        <p className="font-black mb-3 text-gray-500 text-sm">Deine Antworten:</p>
        {exercises.map((e, i) => (
          <div key={e.id} className="flex items-center gap-3 mb-2">
            <span className="text-xl">{answers[i] ? "✅" : "❌"}</span>
            <p className="text-base flex-1 min-w-0 truncate">{e.prompt}</p>
            {!answers[i] && (
              <span className="ml-auto text-sm font-bold text-forest-dark shrink-0">
                → {e.correctAnswer}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button className="btn-primary w-full" onClick={onReplay}>
          Nochmal üben 🔄
        </button>
        <button className="btn-secondary w-full" onClick={onHub}>
          Andere Übung wählen
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UebungenClient() {
  const { user } = useAuth();
  const { checkFeature } = usePaywall();
  const [klasse, setKlasse] = useState<Klasse>(4);
  const [phase, setPhase] = useState<SessionPhase>("hub");
  const [selectedType, setSelectedType] = useState<ExerciseTypeConfig>(EXERCISE_TYPES[0]!);
  const [sessionExercises, setSessionExercises] = useState<GrammarExercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [waitingNext, setWaitingNext] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.klasse) setKlasse(data.klasse as Klasse);
      });
  }, [user]);

  const getPool = (cfg: ExerciseTypeConfig) => filterByGrade(cfg.exercises, klasse);

  const startSession = (cfg: ExerciseTypeConfig) => {
    const pool = getPool(cfg);
    const session = shuffleArray(pool).slice(0, EXERCISES_PER_SESSION).map((e) => {
      // Shuffle options for every exercise type (fix: previously only sentence-building was shuffled)
      if (e.options && e.options.length > 1) {
        // For noun-gender (der/die/das) keep fixed order; for all others shuffle
        if (e.category !== "noun-gender" && e.category !== "punctuation" && e.category !== "word-types") {
          return { ...e, options: shuffleArray(e.options) };
        }
      }
      return e;
    });
    if (session.length === 0) return;
    setSelectedType(cfg);
    setSessionExercises(session);
    setCurrentIdx(0);
    setSelected(null);
    setFeedback(null);
    setWaitingNext(false);
    setAnswers([]);
    setPhase("playing");
  };

  // Shared AI handler for all exercise types
  const handleAi = async (cfg: ExerciseTypeConfig) => {
    if (!checkFeature("aiUebungen")) return;
    setAiLoading(cfg.category);
    try {
      const res = await fetch(cfg.aiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: klasse, count: EXERCISES_PER_SESSION, userId: user?.id }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aiItems = await res.json() as any[];
      const exercises: GrammarExercise[] = aiItems.map((item, i) =>
        aiResponseToExercise(cfg.category, klasse, i, item),
      );
      if (exercises.length === 0) { startSession(cfg); return; }
      setSelectedType(cfg);
      setSessionExercises(exercises);
      setCurrentIdx(0);
      setSelected(null);
      setFeedback(null);
      setWaitingNext(false);
      setAnswers([]);
      setPhase("playing");
    } catch (err) {
      console.error("AI exercise error:", err);
      startSession(cfg); // fallback to static pool
    } finally {
      setAiLoading(null);
    }
  };

  const handleRandom = () => {
    const eligible = EXERCISE_TYPES.filter((t) => {
      const minKlasse = CURRICULUM_MIN_KLASSE[t.category] ?? 1;
      return klasse >= minKlasse && getPool(t).length >= EXERCISES_PER_SESSION;
    });
    if (eligible.length === 0) return;
    const picked = eligible[Math.floor(Math.random() * eligible.length)]!;
    startSession(picked);
  };

  const handleSelect = (option: string) => {
    if (feedback !== null) return;
    const current = sessionExercises[currentIdx];
    if (!current) return;

    const isCorrect = option === current.correctAnswer;
    setSelected(option);
    setFeedback(isCorrect ? "correct" : "wrong");
    isCorrect ? playCorrect() : playWrong();
    setAnswers((prev) => [...prev, isCorrect]);
    setWaitingNext(true);
  };

  const handleNextExercise = () => {
    const current = sessionExercises[currentIdx];
    if (!current) return;

    // Speak the correct answer before advancing
    const ttsText = feedback === "correct"
      ? `Richtig: ${current.correctAnswer}`
      : `Die richtige Antwort ist: ${current.correctAnswer}`;
    void speakText(ttsText, false);

    const newAnswers = [...answers];
    const isLastExercise = currentIdx + 1 >= sessionExercises.length;

    if (isLastExercise) {
      const correctCount = newAnswers.filter(Boolean).length;
      const score = Math.round((correctCount / newAnswers.length) * 100);
      const stars: 0 | 1 | 2 | 3 =
        score === 100 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
      void supabase
        .from("progress")
        .insert({
          user_id: user!.id,
          lesson_id: selectedType.lessonId,
          score,
          stars,
          completed_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error("Progress save error:", error);
        });
      playComplete();
      setWaitingNext(false);
      setPhase("done");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setFeedback(null);
      setWaitingNext(false);
    }
  };

  if (phase === "hub") {
    return (
      <HubScreen
        klasse={klasse}
        onSelect={startSession}
        onRandom={handleRandom}
        onAi={(cfg) => { void handleAi(cfg); }}
        aiLoading={aiLoading}
      />
    );
  }

  if (phase === "done") {
    return (
      <DoneScreen
        cfg={selectedType}
        answers={answers}
        exercises={sessionExercises}
        onReplay={() => startSession(selectedType)}
        onHub={() => setPhase("hub")}
      />
    );
  }

  const currentExercise = sessionExercises[currentIdx];
  if (!currentExercise) return null;

  return (
    <PlayingScreen
      cfg={selectedType}
      exercise={currentExercise}
      exerciseNum={currentIdx + 1}
      total={sessionExercises.length}
      selected={selected}
      feedback={feedback}
      waitingNext={waitingNext}
      onSelect={handleSelect}
      onNext={handleNextExercise}
    />
  );
}
