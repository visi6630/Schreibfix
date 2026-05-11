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
} from "@schreibfix/core";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { playCorrect, playWrong, playComplete } from "@/lib/sounds";

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
  },
];

const DIFFICULTY_COLORS = {
  Einfach:        "bg-forest-light text-forest-dark",
  Mittel:         "bg-amber-100 text-amber-800",
  Fortgeschritten:"bg-red-100 text-red-700",
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

// ─── Hub Screen ───────────────────────────────────────────────────────────────

function HubScreen({
  klasse,
  onSelect,
  onRandom,
  onAiVerben,
  onAiArtikel,
  aiLoading,
}: {
  klasse: Klasse;
  onSelect: (cfg: ExerciseTypeConfig) => void;
  onRandom: () => void;
  onAiVerben: () => void;
  onAiArtikel: () => void;
  aiLoading: string | null;
}) {
  const grammatik = EXERCISE_TYPES.filter((t) => t.group === "Grammatik");
  const rechtschreibung = EXERCISE_TYPES.filter((t) => t.group === "Rechtschreibung");

  const renderCard = (cfg: ExerciseTypeConfig) => {
    const available = cfg.exercises.filter((e) => e.klasse <= klasse).length;
    const isAiSupported = cfg.category === "verb-conjugation" || cfg.category === "noun-gender";
    const thisAiLoading =
      (cfg.category === "verb-conjugation" && aiLoading === "verben") ||
      (cfg.category === "noun-gender" && aiLoading === "artikel");

    return (
      <div key={cfg.category} className="card text-left border-2 border-transparent flex flex-col gap-2 p-3">
        <button
          onClick={() => onSelect(cfg)}
          className="flex flex-col gap-1 text-left"
        >
          <span className="text-3xl">{cfg.icon}</span>
          <p className="font-black text-base leading-tight">{cfg.label}</p>
          <p className="text-xs text-gray-500 leading-snug">{cfg.description}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[cfg.difficulty]}`}>
              {cfg.difficulty}
            </span>
            <span className="text-xs text-gray-400">{available} Aufg.</span>
          </div>
        </button>
        {isAiSupported && (
          <button
            onClick={cfg.category === "verb-conjugation" ? onAiVerben : onAiArtikel}
            disabled={aiLoading !== null}
            className="mt-1 text-xs font-bold text-violet-600 border border-violet-300 rounded-lg px-2 py-1
                       hover:bg-violet-50 disabled:opacity-50 disabled:cursor-wait transition-colors"
          >
            {thisAiLoading ? "⏳ Lädt…" : "🤖 Neue Aufgaben"}
          </button>
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

      <div className="mb-2">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">
          📚 Grammatik
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {grammatik.map(renderCard)}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">
          ✍️ Rechtschreibung
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
  onSelect,
}: {
  cfg: ExerciseTypeConfig;
  exercise: GrammarExercise;
  exerciseNum: number;
  total: number;
  selected: string | null;
  feedback: "correct" | "wrong" | null;
  onSelect: (option: string) => void;
}) {
  const optionCount = exercise.options?.length ?? 4;
  const isSentenceBuilding = cfg.category === "sentence-building";
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

      {/* Explanation */}
      {feedback !== null && exercise.explanation && (
        <div
          className={`rounded-2xl px-4 py-3 text-base font-bold
            ${feedback === "correct"
              ? "bg-forest-light text-forest-dark"
              : "bg-amber-50 border border-amber-200 text-amber-800"}`}
        >
          💡 {exercise.explanation}
        </div>
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
    0
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
  const [klasse, setKlasse] = useState<Klasse>(4);
  const [phase, setPhase] = useState<SessionPhase>("hub");
  const [selectedType, setSelectedType] = useState<ExerciseTypeConfig>(EXERCISE_TYPES[0]!);
  const [sessionExercises, setSessionExercises] = useState<GrammarExercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
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

  const getPool = (cfg: ExerciseTypeConfig) =>
    cfg.exercises.filter((e) => e.klasse <= klasse);

  const startSession = (cfg: ExerciseTypeConfig) => {
    const pool = getPool(cfg);
    const session = shuffleArray(pool).slice(0, EXERCISES_PER_SESSION).map((e) => {
      // Shuffle options for sentence-building so the correct answer isn't always first
      if (e.category === "sentence-building" && e.options) {
        return { ...e, options: shuffleArray(e.options) };
      }
      return e;
    });
    if (session.length === 0) return;
    setSelectedType(cfg);
    setSessionExercises(session);
    setCurrentIdx(0);
    setSelected(null);
    setFeedback(null);
    setAnswers([]);
    setPhase("playing");
  };

  const handleAiVerben = async () => {
    setAiLoading("verben");
    try {
      const res = await fetch("/api/ai/verben", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: klasse, count: EXERCISES_PER_SESSION }),
      });
      const aiItems = await res.json() as { sentence: string; verb: string; correctAnswer: string; wrongOptions: [string, string, string] }[];
      const cfg = EXERCISE_TYPES.find((t) => t.category === "verb-conjugation")!;
      const exercises: GrammarExercise[] = aiItems.map((item, i) => ({
        id: `ai-verb-${Date.now()}-${i}`,
        category: "verb-conjugation",
        klasse,
        prompt: item.sentence,
        options: shuffleArray([item.correctAnswer, ...item.wrongOptions]),
        correctAnswer: item.correctAnswer,
        explanation: `Das Verb "${item.verb}" wird hier so konjugiert.`,
        xpReward: 5,
      }));
      setSelectedType(cfg);
      setSessionExercises(exercises);
      setCurrentIdx(0);
      setSelected(null);
      setFeedback(null);
      setAnswers([]);
      setPhase("playing");
    } catch (err) {
      console.error("AI Verben error:", err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiArtikel = async () => {
    setAiLoading("artikel");
    try {
      const res = await fetch("/api/ai/artikel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: klasse, count: EXERCISES_PER_SESSION }),
      });
      const aiItems = await res.json() as { noun: string; emoji: string; correctArticle: "der" | "die" | "das"; hint: string }[];
      const cfg = EXERCISE_TYPES.find((t) => t.category === "noun-gender")!;
      const exercises: GrammarExercise[] = aiItems.map((item, i) => ({
        id: `ai-artikel-${Date.now()}-${i}`,
        category: "noun-gender",
        klasse,
        prompt: `${item.emoji} ${item.noun}`,
        options: ["der", "die", "das"],
        correctAnswer: item.correctArticle,
        explanation: item.hint,
        xpReward: 5,
      }));
      setSelectedType(cfg);
      setSessionExercises(exercises);
      setCurrentIdx(0);
      setSelected(null);
      setFeedback(null);
      setAnswers([]);
      setPhase("playing");
    } catch (err) {
      console.error("AI Artikel error:", err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleRandom = () => {
    const eligible = EXERCISE_TYPES.filter((t) => getPool(t).length >= EXERCISES_PER_SESSION);
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
    const newAnswers = [...answers, isCorrect];

    setTimeout(() => {
      if (currentIdx + 1 < sessionExercises.length) {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
        setAnswers(newAnswers);
      } else {
        const correctCount = newAnswers.filter(Boolean).length;
        const score = Math.round((correctCount / newAnswers.length) * 100);
        const stars: 0 | 1 | 2 | 3 =
          score === 100 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
        void supabase
          .from("progress")
          .insert({
            user_id: user?.id,
            lesson_id: selectedType.lessonId,
            score,
            stars,
            completed_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.error("Progress save error:", error);
          });
        playComplete();
        setAnswers(newAnswers);
        setPhase("done");
      }
    }, 1500);
  };

  if (phase === "hub") {
    return (
      <HubScreen
        klasse={klasse}
        onSelect={startSession}
        onRandom={handleRandom}
        onAiVerben={() => { void handleAiVerben(); }}
        onAiArtikel={() => { void handleAiArtikel(); }}
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
      onSelect={handleSelect}
    />
  );
}
