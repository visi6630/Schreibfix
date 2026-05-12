"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { Klasse } from "@schreibfix/core";
import {
  diktatLessons,
  verbConjugationExercises,
  nounGenderExercises,
  pluralExercises,
} from "@schreibfix/core";

// ─── Grade selector overlay ───────────────────────────────────────────────────

function GradeSelector({ onSelect }: { onSelect: (klasse: number) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-50 px-8 text-center">
      <div className="text-7xl mb-4">🦊</div>
      <h2 className="text-3xl font-black text-fox mb-2">Hallo! Ich bin der Schreibfix.</h2>
      <p className="text-lg text-gray-600 mb-8">In welche Klasse gehst du?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4].map((k) => (
          <button
            key={k}
            onClick={() => onSelect(k)}
            className="btn-primary text-2xl py-6 rounded-3xl"
          >
            Klasse {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Guest mode ───────────────────────────────────────────────────────────────

type GuestPhase = "intro" | "diktat" | "uebungen" | "done";

function GuestMode({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<GuestPhase>("intro");
  const [guestScore, setGuestScore] = useState(0);
  const [guestDone, setGuestDone] = useState(0);

  // 3 sample diktat sentences from Klasse 2
  const guestLesson = diktatLessons.find((l) => l.klasse === 2) ?? diktatLessons[0]!;
  const guestSentences = guestLesson.sentences.slice(0, 3);

  // 5 mixed exercises (Klasse 1-2)
  const guestExercises = [
    ...verbConjugationExercises.filter((e) => e.klasse <= 2).slice(0, 2),
    ...nounGenderExercises.filter((e) => e.klasse <= 2).slice(0, 2),
    ...pluralExercises.filter((e) => e.klasse <= 2).slice(0, 1),
  ];

  const [exIdx, setExIdx] = useState(0);
  const [exAnswered, setExAnswered] = useState(false);
  const [exCorrect, setExCorrect] = useState(false);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [sentenceChecked, setSentenceChecked] = useState(false);

  const currentExercise = guestExercises[exIdx];
  const currentSentence = guestSentences[sentenceIdx];

  const handleSentenceCheck = () => {
    if (!currentSentence) return;
    const correct = typedText.trim().toLowerCase() === currentSentence.text.toLowerCase();
    if (correct) setGuestScore((s) => s + 1);
    setGuestDone((d) => d + 1);
    setSentenceChecked(true);
  };

  const handleSentenceNext = () => {
    if (sentenceIdx + 1 < guestSentences.length) {
      setSentenceIdx((i) => i + 1);
      setTypedText("");
      setSentenceChecked(false);
    } else {
      setPhase("uebungen");
    }
  };

  const handleExerciseAnswer = (option: string) => {
    if (exAnswered) return;
    const correct = option === currentExercise?.correctAnswer;
    if (correct) setGuestScore((s) => s + 1);
    setGuestDone((d) => d + 1);
    setExCorrect(correct);
    setExAnswered(true);
  };

  const handleExerciseNext = () => {
    if (exIdx + 1 < guestExercises.length) {
      setExIdx((i) => i + 1);
      setExAnswered(false);
      setExCorrect(false);
    } else {
      setPhase("done");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-50 overflow-y-auto">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-fox">Probestunde 🦊</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {phase === "intro" && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🦊</div>
            <h3 className="text-2xl font-black text-fox mb-3">Los geht&apos;s!</h3>
            <p className="text-gray-600 mb-2">
              Du bekommst 3 kurze Diktat-Sätze und 5 Übungs-Aufgaben zum Ausprobieren.
            </p>
            <p className="text-sm text-gray-400 mb-8">Kein Konto nötig — einfach loslegen!</p>
            <button
              onClick={() => setPhase("diktat")}
              className="btn-primary text-xl px-8 py-4"
            >
              Starten 🎉
            </button>
          </div>
        )}

        {phase === "diktat" && currentSentence && (
          <div>
            <div className="mb-5 text-center">
              <p className="text-sm font-bold text-gray-400">
                Diktat · Satz {sentenceIdx + 1} von {guestSentences.length}
              </p>
            </div>
            <div className="card mb-4 flex items-center gap-3">
              <span className="text-3xl">🦊</span>
              <p className="text-base font-bold text-gray-700">
                {sentenceChecked
                  ? "So sah der Satz aus:"
                  : "Schreib den Satz so gut du kannst!"}
              </p>
            </div>
            {sentenceChecked && (
              <div className="card mb-4 bg-gray-50">
                <p className="text-xs font-bold text-gray-400 mb-1">Richtiger Satz:</p>
                <p className="font-black text-lg">{currentSentence.text}</p>
              </div>
            )}
            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={sentenceChecked}
              placeholder="Schreib hier den Satz …"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold focus:border-fox focus:outline-none resize-none mb-4"
              rows={2}
            />
            {!sentenceChecked ? (
              <button
                onClick={handleSentenceCheck}
                disabled={!typedText.trim()}
                className="btn-primary w-full"
              >
                Überprüfen ✓
              </button>
            ) : (
              <button onClick={handleSentenceNext} className="btn-primary w-full">
                {sentenceIdx + 1 < guestSentences.length ? "Nächster Satz →" : "Zu den Übungen →"}
              </button>
            )}
          </div>
        )}

        {phase === "uebungen" && currentExercise && (
          <div>
            <div className="mb-5 text-center">
              <p className="text-sm font-bold text-gray-400">
                Übungen · Aufgabe {exIdx + 1} von {guestExercises.length}
              </p>
            </div>
            <div className="card mb-4">
              <p className="font-black text-xl text-center">{currentExercise.prompt}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentExercise.options?.map((opt) => {
                let cls = "rounded-2xl border-2 px-4 py-4 text-lg font-bold text-left ";
                if (exAnswered) {
                  if (opt === currentExercise.correctAnswer) cls += "border-forest bg-forest-light text-forest-dark";
                  else cls += "border-gray-200 bg-gray-50 text-gray-400";
                } else {
                  cls += "border-gray-200 bg-white hover:border-fox hover:text-fox";
                }
                return (
                  <button key={opt} className={cls} onClick={() => handleExerciseAnswer(opt)} disabled={exAnswered}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {exAnswered && (
              <>
                <div className={`rounded-2xl px-4 py-3 font-bold mb-4 ${exCorrect ? "bg-forest-light text-forest-dark" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                  {exCorrect ? "✅ Richtig!" : `❌ Die richtige Antwort war: ${currentExercise.correctAnswer}`}
                </div>
                <button onClick={handleExerciseNext} className="btn-primary w-full">
                  {exIdx + 1 < guestExercises.length ? "Weiter →" : "Fertig! 🎉"}
                </button>
              </>
            )}
          </div>
        )}

        {phase === "done" && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🦊🎉</div>
            <h3 className="text-2xl font-black text-fox mb-2">Toll gemacht!</h3>
            <p className="text-lg text-gray-600 mb-1">
              Du hast {guestScore} von {guestDone} Aufgaben richtig!
            </p>
            <div className="card my-6 bg-fox-light border-0 text-left">
              <p className="font-black text-fox-dark text-base mb-2">
                🌟 Melde dich an, um deinen Fortschritt zu speichern und alle Übungen freizuschalten!
              </p>
              <p className="text-sm text-fox-dark/80">
                Kostenlos registrieren und alle 20 Diktate, 9 Übungsarten, KI-Aufgaben und mehr freischalten!
              </p>
            </div>
            <Link
              href="/auth"
              className="btn-primary w-full block text-center text-lg mb-3"
              onClick={onClose}
            >
              Jetzt registrieren 🦊
            </Link>
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 underline">
              Später
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home cards ───────────────────────────────────────────────────────────────

const cards = [
  {
    href: "/diktat",
    icon: "🎙️",
    title: "Diktat",
    desc: "Hör zu und schreib nach!",
    color: "bg-fox-light border-fox",
  },
  {
    href: "/uebungen",
    icon: "✏️",
    title: "Übungen",
    desc: "Rechtschreibung & Grammatik",
    color: "bg-forest-light border-forest",
  },
  {
    href: "/lesen",
    icon: "📖",
    title: "Lesen",
    desc: "Texte lesen & verstehen",
    color: "bg-blue-50 border-blue-300",
  },
  {
    href: "/fortschritt",
    icon: "⭐",
    title: "Fortschritt",
    desc: "Deine Punkte & Sterne",
    color: "bg-amber-100 border-amber-400",
  },
] as const;

// ─── Spielzeit Banner ─────────────────────────────────────────────────────────

function SpielzeitBanner({ userId }: { userId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const key = `schreibfix_last_game_xp_${userId}`;
    const lastGameXp = parseInt(localStorage.getItem(key) ?? "0", 10);
    void supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const currentXp = data?.xp ?? 0;
        if (currentXp - lastGameXp >= 50) setShow(true);
      });
  }, [userId]);

  if (!show) return null;

  return (
    <Link
      href="/spiele"
      className="block w-full mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-fox text-white px-5 py-4
                 flex items-center gap-4 shadow-lg active:scale-95 transition-transform"
    >
      <span className="text-4xl">🎮</span>
      <div>
        <p className="font-black text-lg leading-tight">Spielzeit!</p>
        <p className="text-sm opacity-90">Du hast 50 XP verdient — Zeit für Tic Tac Toe!</p>
      </div>
      <span className="ml-auto text-2xl opacity-70">›</span>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeClient() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [klasse, setKlasse] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showGuest, setShowGuest] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setKlasse((data?.klasse as Klasse) ?? null);
        setProfileLoading(false);
      });
  }, [user]);

  const handleGradeSelect = async (k: number) => {
    setKlasse(k);
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, klasse: k });
    }
  };

  const showSelector =
    !authLoading && !profileLoading && user !== null && klasse === null;

  return (
    <>
      {showSelector && <GradeSelector onSelect={handleGradeSelect} />}
      {showGuest && <GuestMode onClose={() => setShowGuest(false)} />}

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 text-center">
          <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">
            🦊
          </div>
          <h2 className="text-3xl font-black text-fox">
            Hallo! Ich bin der Schreibfix.
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Was möchtest du heute lernen?
          </p>
          {klasse !== null && (
            <span className="mt-3 inline-block bg-fox text-white font-bold px-4 py-1 rounded-full text-sm">
              Klasse {klasse}
            </span>
          )}
        </div>

        {/* Not logged in: show login + guest buttons */}
        {!authLoading && !user && (
          <div className="flex flex-col gap-3 mb-8">
            <Link href="/auth" className="btn-primary w-full text-center text-xl py-4 block">
              Anmelden
            </Link>
            <button
              onClick={() => setShowGuest(true)}
              className="btn-secondary w-full text-xl py-4"
            >
              Erstmal ausprobieren! 🦊
            </button>
          </div>
        )}

        {/* Spielzeit banner — shown when 50+ XP since last game */}
        {user && <SpielzeitBanner userId={user.id} />}

        {/* Logged in: show nav cards */}
        {user && (
          <div className="flex flex-col gap-4">
            {cards.map(({ href, icon, title, desc, color }) => (
              <Link
                key={href}
                href={href}
                className={`card flex items-center gap-5 border-2 transition-transform
                  active:scale-95 hover:-translate-y-0.5 ${color}`}
              >
                <span className="text-5xl" role="img" aria-hidden="true">
                  {icon}
                </span>
                <div>
                  <p className="text-xl font-black">{title}</p>
                  <p className="text-base text-gray-600">{desc}</p>
                </div>
                <span className="ml-auto text-2xl text-gray-300">›</span>
              </Link>
            ))}
          </div>
        )}

        {klasse !== null && user && (
          <p className="text-center text-sm text-gray-400 mt-6">
            <button
              onClick={() => setKlasse(null)}
              className="underline hover:text-fox"
            >
              Klasse ändern
            </button>
          </p>
        )}

        <div className="mt-10 text-center flex justify-center gap-5">
          <Link href="/eltern" className="text-xs text-gray-300 hover:text-gray-400 underline">
            Elternportal
          </Link>
          <Link href="/subscription" className="text-xs text-gray-300 hover:text-gray-400 underline">
            Pläne & Preise
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-xs text-gray-300 hover:text-gray-400 underline">
              Admin
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
