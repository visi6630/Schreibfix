"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DiktatLesson, DiktatSentence } from "@schreibfix/core";
import { checkDiktatAnswer, starsLabel } from "@schreibfix/core";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

// ─── TTS helper ──────────────────────────────────────────────────────────────

function speakGerman(text: string, rate = 0.75): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = rate;
  // Prefer a German voice if available
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find((v) => v.lang.startsWith("de"));
  if (germanVoice) utterance.voice = germanVoice;
  window.speechSynthesis.speak(utterance);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type WordChipProps = {
  word: string;
  state: "neutral" | "correct" | "wrong";
  expected?: string;
};

function WordChip({ word, state, expected }: WordChipProps) {
  const base = "inline-block rounded-xl px-2 py-0.5 font-bold text-lg";
  const styles = {
    neutral: "",
    correct: `${base} bg-forest-light text-forest-dark`,
    wrong:   `${base} bg-red-100 text-red-700`,
  };

  return (
    <span className="inline-flex flex-col items-center mx-0.5 align-bottom">
      <span className={state === "neutral" ? "text-lg font-bold" : styles[state]}>
        {word || "–"}
      </span>
      {state === "wrong" && expected && (
        <span className="text-xs text-gray-500 mt-0.5">{expected}</span>
      )}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase =
  | "intro"      // lesson overview
  | "listening"  // TTS just played / about to play
  | "typing"     // child is writing
  | "result"     // result shown for this sentence
  | "done";      // all sentences finished

type SentenceState = {
  sentence: DiktatSentence;
  typed: string;
  result?: ReturnType<typeof checkDiktatAnswer>;
};

export function DiktatClient({ lesson, onBack }: { lesson: DiktatLesson; onBack?: () => void }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [states, setStates] = useState<SentenceState[]>(
    lesson.sentences.map((s) => ({ sentence: s, typed: "" }))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Save completed lesson progress to Supabase
  useEffect(() => {
    if (phase !== "done" || !user) return;
    const score = Math.round(
      states.reduce((sum, s) => sum + (s.result?.score ?? 0), 0) / lesson.sentences.length
    );
    const stars: 0 | 1 | 2 | 3 = score === 100 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0;
    void supabase.from("progress").insert({
      user_id: user.id,
      lesson_id: lesson.id,
      score,
      stars,
      completed_at: new Date().toISOString(),
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = states[index];

  // ── Speak current sentence ──────────────────────────────────────────────
  const speak = useCallback(() => {
    if (!current) return;
    speakGerman(current.sentence.text);
    setPhase("typing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [current]);

  // ── Handle typing ───────────────────────────────────────────────────────
  const handleTyping = (value: string) => {
    setStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, typed: value } : s))
    );
  };

  // ── Submit answer ───────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!current) return;
    const result = checkDiktatAnswer(
      current.typed,
      current.sentence.text,
      lesson.xpReward / lesson.sentences.length
    );
    setStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, result } : s))
    );
    setPhase("result");
  };

  // ── Next sentence or finish ─────────────────────────────────────────────
  const handleNext = () => {
    if (index + 1 < lesson.sentences.length) {
      const nextIdx = index + 1;
      setIndex(nextIdx);
      setPhase("typing");
      setTimeout(() => {
        speakGerman(lesson.sentences[nextIdx]?.text ?? "");
        inputRef.current?.focus();
      }, 200);
    } else {
      setPhase("done");
    }
  };

  // ── Total XP earned ────────────────────────────────────────────────────
  const totalXp = states.reduce((sum, s) => sum + (s.result?.xpEarned ?? 0), 0);
  const totalScore =
    states.reduce((sum, s) => sum + (s.result?.score ?? 0), 0) /
    lesson.sentences.length;

  // ─────────────────────────────────────────────────────────────────────────
  // INTRO
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <div className="text-6xl mb-4">🦊</div>
        <h2 className="text-2xl font-black text-fox mb-2">{lesson.title}</h2>
        <p className="text-gray-500 mb-1">
          Klasse {lesson.klasse} · {lesson.sentences.length} Sätze
        </p>
        <p className="text-gray-500 mb-8">
          Thema: <strong>{lesson.theme}</strong>
        </p>
        <p className="mb-8 text-lg text-gray-700">
          Ich lese dir einen Satz vor. Hör gut zu und schreib ihn auf!
        </p>
        <button
          className="btn-primary text-xl"
          onClick={() => {
            setPhase("listening");
            speak();
          }}
        >
          Los geht&apos;s! 🎙️
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DONE
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const overallStars: 0 | 1 | 2 | 3 =
      totalScore === 100 ? 3 : totalScore >= 70 ? 2 : totalScore >= 40 ? 1 : 0;
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <div className="text-6xl mb-4">
          {overallStars === 3 ? "🦊🎉" : overallStars >= 2 ? "🦊😄" : "🦊💪"}
        </div>
        <h2 className="text-2xl font-black text-fox mb-2">Diktat fertig!</h2>
        <p className="text-lg mb-1">{starsLabel(overallStars)}</p>
        <p className="text-gray-500 mb-6">
          Du hast <strong className="text-fox">{Math.round(totalXp)} XP</strong> verdient!
        </p>

        <div className="card mb-6 text-left">
          {states.map((s, i) => (
            <div key={s.sentence.id} className="mb-3">
              <span className="text-sm font-bold text-gray-400">Satz {i + 1}: </span>
              <span
                className={
                  (s.result?.score ?? 0) === 100
                    ? "text-forest-dark font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {s.result?.score ?? 0}%
              </span>{" "}
              — {s.sentence.text}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="btn-secondary"
            onClick={() => {
              setIndex(0);
              setPhase("intro");
              setStates(lesson.sentences.map((s) => ({ sentence: s, typed: "" })));
            }}
          >
            Nochmal üben
          </button>
          {onBack && (
            <button className="btn-secondary" onClick={onBack}>
              ← Andere Lektion wählen
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LISTENING / TYPING / RESULT
  // ─────────────────────────────────────────────────────────────────────────
  const result = current?.result;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Satz {index + 1} von {lesson.sentences.length}</span>
          <span className="font-bold text-fox">{lesson.title}</span>
        </div>
        <div className="h-3 rounded-full bg-fox-light overflow-hidden">
          <div
            className="h-full rounded-full bg-fox transition-all duration-500"
            style={{ width: `${(index / lesson.sentences.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Fox card */}
      <div className="card mb-5 flex items-center gap-4">
        <span className="text-5xl">🦊</span>
        <p className="text-lg text-gray-700">
          {phase === "result"
            ? result?.allCorrect
              ? "Perfekt geschrieben! 🎉"
              : result && result.score >= 70
              ? "Sehr gut! Fast perfekt!"
              : "Gut versucht! Schau dir die roten Wörter an."
            : "Hör gut zu, dann schreib den Satz auf!"}
        </p>
      </div>

      {/* TTS controls */}
      <div className="flex gap-3 mb-5">
        <button
          className="btn-primary flex-1"
          onClick={speak}
          aria-label="Satz vorlesen"
        >
          🎙️ Vorlesen
        </button>
        <button
          className="btn-secondary px-4"
          onClick={() => speakGerman(current?.sentence.text ?? "", 0.55)}
          aria-label="Satz langsam vorlesen"
          title="Langsam vorlesen"
        >
          🐢 Langsam
        </button>
      </div>

      {/* Input */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-gray-500 mb-1">
          Schreib den Satz hier:
        </label>
        <input
          ref={inputRef}
          type="text"
          value={current?.typed ?? ""}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && phase === "typing" && current?.typed.trim()) {
              handleSubmit();
            }
          }}
          disabled={phase === "result"}
          placeholder="Schreib hier …"
          className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-xl font-bold
                     focus:border-fox focus:outline-none disabled:bg-gray-50"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {/* Result display */}
      {phase === "result" && result && (
        <div className="card mb-5">
          <p className="text-sm font-bold text-gray-400 mb-2">Deine Antwort:</p>
          <div className="text-xl leading-relaxed mb-4 flex flex-wrap gap-y-2">
            {result.words.map((w, i) => (
              <WordChip
                key={i}
                word={w.word}
                state={w.correct ? "correct" : "wrong"}
                expected={w.correct ? undefined : w.expected}
              />
            ))}
          </div>

          {current?.sentence.hint && !result.allCorrect && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              💡 <strong>Tipp:</strong> {current.sentence.hint}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl">
              {result.stars === 3 ? "⭐⭐⭐" : result.stars === 2 ? "⭐⭐" : result.stars === 1 ? "⭐" : ""}
            </span>
            <span className="font-bold text-lg">{starsLabel(result.stars)}</span>
            <span className="ml-auto text-fox font-bold">+{Math.round(result.xpEarned)} XP</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {phase === "typing" && (
        <button
          className="btn-primary w-full"
          onClick={handleSubmit}
          disabled={!current?.typed.trim()}
        >
          Überprüfen ✓
        </button>
      )}

      {phase === "result" && (
        <button className="btn-primary w-full" onClick={handleNext}>
          {index + 1 < lesson.sentences.length ? "Nächster Satz →" : "Ergebnis ansehen 🎉"}
        </button>
      )}
    </div>
  );
}
