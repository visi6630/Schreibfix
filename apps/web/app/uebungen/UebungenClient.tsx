"use client";

import { useState, useEffect, useMemo } from "react";
import type { GrammarExercise, Klasse } from "@schreibfix/core";
import {
  verbConjugationExercises,
  nounGenderExercises,
  pluralExercises,
} from "@schreibfix/core";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = "verben" | "artikel" | "plural";
type SessionPhase = "pick" | "playing" | "done";

const EXERCISES_PER_SESSION = 5;

const TAB_CONFIG: Record<TabType, { label: string; icon: string; lessonId: string }> = {
  verben:  { label: "Verben",   icon: "🔄", lessonId: "grammatik-verben"  },
  artikel: { label: "Artikel",  icon: "🏷️", lessonId: "grammatik-artikel" },
  plural:  { label: "Mehrzahl", icon: "🔢", lessonId: "grammatik-plural"  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function starsLabel(score: number): string {
  if (score === 100) return "Perfekt! ⭐⭐⭐";
  if (score >= 60) return "Super gemacht! ⭐⭐";
  if (score >= 40) return "Gut versucht! ⭐";
  return "Weiter üben! 💪";
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  onClick,
  state,
}: {
  label: string;
  onClick: () => void;
  state: "idle" | "correct" | "wrong";
}) {
  const base =
    "w-full rounded-2xl border-2 px-4 py-4 text-xl font-bold transition-colors text-left";
  const styles = {
    idle:    `${base} border-gray-200 bg-white hover:border-fox hover:text-fox`,
    correct: `${base} border-forest bg-forest-light text-forest-dark`,
    wrong:   `${base} border-red-400 bg-red-50 text-red-700`,
  };
  return (
    <button className={styles[state]} onClick={onClick} disabled={state !== "idle"}>
      {label}
    </button>
  );
}

// ─── Pick Screen ──────────────────────────────────────────────────────────────

function PickScreen({
  tab,
  setTab,
  onStart,
}: {
  tab: TabType;
  setTab: (t: TabType) => void;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">✏️</div>
        <h2 className="text-2xl font-black text-fox">Grammatik-Übungen</h2>
        <p className="text-gray-500">Wähle eine Übungsart!</p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {(Object.entries(TAB_CONFIG) as [TabType, typeof TAB_CONFIG[TabType]][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`card flex items-center gap-4 text-left border-2 transition-transform
                active:scale-95 hover:-translate-y-0.5
                ${tab === key ? "border-fox bg-fox-light" : "border-transparent"}`}
            >
              <span className="text-4xl">{cfg.icon}</span>
              <div>
                <p className="font-black text-xl">
                  {key === "verben" && "Verbkonjugation"}
                  {key === "artikel" && "Der / Die / Das?"}
                  {key === "plural" && "Einzahl & Mehrzahl"}
                </p>
                <p className="text-sm text-gray-500">
                  {key === "verben" && "Konjugiere das Verb richtig!"}
                  {key === "artikel" && "Welcher Artikel gehört dazu?"}
                  {key === "plural" && "Was ist die Mehrzahl?"}
                </p>
              </div>
              {tab === key && (
                <span className="ml-auto text-fox text-2xl">✓</span>
              )}
            </button>
          )
        )}
      </div>

      <button className="btn-primary w-full text-xl" onClick={onStart}>
        Los geht&apos;s! 🚀
      </button>
    </div>
  );
}

// ─── Playing Screen ───────────────────────────────────────────────────────────

function PlayingScreen({
  exercise,
  exerciseNum,
  total,
  selected,
  feedback,
  onSelect,
}: {
  exercise: GrammarExercise;
  exerciseNum: number;
  total: number;
  selected: string | null;
  feedback: "correct" | "wrong" | null;
  onSelect: (option: string) => void;
}) {
  const isNounGender = exercise.category === "noun-gender";

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Aufgabe {exerciseNum} von {total}</span>
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
        <p className={`font-black ${isNounGender ? "text-5xl mb-1" : "text-xl"}`}>
          {exercise.prompt}
        </p>
        {isNounGender && (
          <p className="text-gray-400 text-base">Welcher Artikel passt?</p>
        )}
      </div>

      {/* Options */}
      <div className={`grid gap-3 mb-5 ${isNounGender ? "grid-cols-3" : "grid-cols-2"}`}>
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
              onClick={() => onSelect(option)}
            />
          );
        })}
      </div>

      {/* Explanation after answer */}
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
  answers,
  exercises,
  tab,
  onReplay,
  onChangeTab,
}: {
  answers: boolean[];
  exercises: GrammarExercise[];
  tab: TabType;
  onReplay: () => void;
  onChangeTab: () => void;
}) {
  const correct = answers.filter(Boolean).length;
  const score = Math.round((correct / answers.length) * 100);
  const xpEarned = exercises.reduce(
    (sum, e, i) => sum + (answers[i] ? e.xpReward : 0),
    0
  );
  const stars = score === 100 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <div className="text-6xl mb-4">
        {stars === 3 ? "🦊🎉" : stars >= 2 ? "🦊😄" : "🦊💪"}
      </div>
      <h2 className="text-2xl font-black text-fox mb-2">Runde beendet!</h2>
      <p className="text-lg mb-1">{starsLabel(score)}</p>
      <p className="text-gray-500 mb-6">
        <strong className="text-fox">+{xpEarned} XP</strong> verdient!
      </p>

      <div className="card mb-6 text-left">
        <p className="font-black mb-3 text-gray-500 text-sm">Deine Antworten:</p>
        {exercises.map((e, i) => (
          <div key={e.id} className="flex items-center gap-3 mb-2">
            <span className="text-xl">{answers[i] ? "✅" : "❌"}</span>
            <p className="text-base">{e.prompt}</p>
            {!answers[i] && (
              <span className="ml-auto text-sm font-bold text-forest-dark">
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
        <button className="btn-secondary w-full" onClick={onChangeTab}>
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
  const [tab, setTab] = useState<TabType>("verben");
  const [phase, setPhase] = useState<SessionPhase>("pick");
  const [sessionExercises, setSessionExercises] = useState<GrammarExercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

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

  const pool = useMemo(() => {
    const source =
      tab === "verben"
        ? verbConjugationExercises
        : tab === "artikel"
        ? nounGenderExercises
        : pluralExercises;
    return source.filter((e) => e.klasse <= klasse);
  }, [tab, klasse]);

  const startSession = () => {
    const session = shuffleArray(pool).slice(0, EXERCISES_PER_SESSION);
    setSessionExercises(session);
    setCurrentIdx(0);
    setSelected(null);
    setFeedback(null);
    setAnswers([]);
    setPhase("playing");
  };

  const handleSelect = (option: string) => {
    if (feedback !== null) return;
    const current = sessionExercises[currentIdx];
    if (!current) return;

    const isCorrect = option === current.correctAnswer;
    setSelected(option);
    setFeedback(isCorrect ? "correct" : "wrong");
    const newAnswers = [...answers, isCorrect];

    setTimeout(() => {
      if (currentIdx + 1 < sessionExercises.length) {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setFeedback(null);
        setAnswers(newAnswers);
      } else {
        const correct = newAnswers.filter(Boolean).length;
        const score = Math.round((correct / newAnswers.length) * 100);
        const stars: 0 | 1 | 2 | 3 =
          score === 100 ? 3 : score >= 60 ? 2 : score >= 40 ? 1 : 0;
        void supabase.from("progress").insert({
          user_id: user?.id,
          lesson_id: TAB_CONFIG[tab].lessonId,
          score,
          stars,
          completed_at: new Date().toISOString(),
        });
        setAnswers(newAnswers);
        setPhase("done");
      }
    }, 1500);
  };

  if (phase === "pick") {
    return (
      <PickScreen
        tab={tab}
        setTab={setTab}
        onStart={startSession}
      />
    );
  }

  if (phase === "done") {
    return (
      <DoneScreen
        answers={answers}
        exercises={sessionExercises}
        tab={tab}
        onReplay={startSession}
        onChangeTab={() => setPhase("pick")}
      />
    );
  }

  const currentExercise = sessionExercises[currentIdx];
  if (!currentExercise) return null;

  return (
    <PlayingScreen
      exercise={currentExercise}
      exerciseNum={currentIdx + 1}
      total={sessionExercises.length}
      selected={selected}
      feedback={feedback}
      onSelect={handleSelect}
    />
  );
}
