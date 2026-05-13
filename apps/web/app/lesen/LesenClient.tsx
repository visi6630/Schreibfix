"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReadingTextAI } from "@/lib/ai-content";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/components/SubscriptionProvider";
import type { Klasse } from "@schreibfix/core";
import { BackButton } from "@/components/BackButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "loading" | "reading" | "questions" | "done";

type QuestionState = {
  question: string;
  answer: string;
  options: string[];
  selected: string | null;
};

// ─── Wrong options generator ──────────────────────────────────────────────────

function buildOptions(correct: string, allAnswers: string[]): string[] {
  const pool = allAnswers.filter((a) => a !== correct);
  const wrong = shuffleArray(pool).slice(0, 2);
  while (wrong.length < 2) {
    wrong.push(wrong.length === 0 ? "Weiß ich nicht" : "Keine Ahnung");
  }
  return shuffleArray([correct, ...wrong]);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ─── Web Speech API (vendor types) ───────────────────────────────────────────

interface SpeechRecognitionEvent {
  results: { [i: number]: { [j: number]: { transcript: string } } };
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  start(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSR(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as SpeechRecognitionCtor | undefined ?? null;
}

// ─── Voice reading (Task 5) ───────────────────────────────────────────────────

type WordReadResult = { word: string; correct: boolean };

function useVoiceReading(text: string) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [results, setResults] = useState<WordReadResult[] | null>(null);
  const [fluency, setFluency] = useState<{ correct: number; total: number } | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => { setSupported(!!getSR()); }, []);

  const start = useCallback(() => {
    const SR = getSR();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "de-DE";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const spoken = transcript.toLowerCase().replace(/[.,!?;:]/g, "").split(/\s+/).filter(Boolean);
      const expected = text.toLowerCase().replace(/[.,!?;:]/g, "").split(/\s+/).filter(Boolean);

      const wordResults: WordReadResult[] = expected.map((word, i) => ({
        word,
        correct: spoken[i] === word,
      }));

      const correctCount = wordResults.filter((w) => w.correct).length;
      setResults(wordResults);
      setFluency({ correct: correctCount, total: expected.length });
    };

    recognition.onerror = () => setRecording(false);
    recognition.start();
  }, [text]);

  const reset = useCallback(() => {
    setResults(null);
    setFluency(null);
  }, []);

  return { supported, recording, results, fluency, start, reset };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LesenClient() {
  const { user } = useAuth();
  const { features, loading: subLoading, showPaywall } = useSubscription();
  const [phase, setPhase] = useState<Phase>("loading");
  const [readingData, setReadingData] = useState<ReadingTextAI | null>(null);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [klasse, setKlasse] = useState<Klasse>(2);

  const voice = useVoiceReading(readingData?.text ?? "");

  useEffect(() => {
    if (!user || subLoading) return;
    if (!features.lesen) {
      showPaywall("lesen");
      setPhase("reading"); // stop loading spinner; paywall modal handles the UX
      return;
    }

    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const k = (data?.klasse as Klasse) ?? 2;
        setKlasse(k);
        void loadText(k);
      });
  }, [user, subLoading, features.lesen]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadText = async (k: Klasse) => {
    setPhase("loading");
    try {
      const res = await fetch("/api/ai/lesen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: k }),
      });
      const data = await res.json() as ReadingTextAI;
      setReadingData(data);
      const allAnswers = data.questions.map((q) => q.answer);
      setQuestions(
        data.questions.map((q) => ({
          question: q.question,
          answer: q.answer,
          options: buildOptions(q.answer, allAnswers),
          selected: null,
        }))
      );
      setCurrentQ(0);
      setPhase("reading");
    } catch {
      setPhase("reading");
    }
  };

  const handleAnswer = (option: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === currentQ ? { ...q, selected: option } : q))
    );
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ((i) => i + 1);
      } else {
        const correctCount = questions.filter(
          (q, i) => (i === currentQ ? option : q.selected) === q.answer
        ).length + (questions[currentQ]?.selected === null && option === questions[currentQ]?.answer ? 0 : 0);
        void saveProgress(correctCount);
        setPhase("done");
      }
    }, 1200);
  };

  const saveProgress = async (correctCount: number) => {
    if (!user) return;
    const score = Math.round((correctCount / questions.length) * 100);
    const stars: 0 | 1 | 2 | 3 = score === 100 ? 3 : score >= 66 ? 2 : score >= 33 ? 1 : 0;
    await supabase.from("progress").insert({
      user_id: user.id,
      lesson_id: "lesen-ai",
      score,
      stars,
      completed_at: new Date().toISOString(),
    });
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="animate-spin text-6xl">🦊</div>
        <p className="text-xl font-black text-fox">Schreibfix denkt nach…</p>
        <p className="text-gray-400 text-sm">Ich erstelle einen Text für dich!</p>
      </div>
    );
  }

  if (!readingData) return null;

  // ── Reading ─────────────────────────────────────────────────────────────────

  if (phase === "reading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-4">
          <BackButton href="/" />
        </div>
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">📖</div>
          <h2 className="text-2xl font-black text-fox">{readingData.title}</h2>
          <p className="text-sm text-gray-400 mt-1">Klasse {klasse} · KI-Text</p>
        </div>

        <div className="card mb-6">
          <p className="text-[22px] leading-relaxed font-medium text-gray-800 whitespace-pre-line">
            {readingData.text}
          </p>
        </div>

        {/* Voice reading section */}
        {voice.supported && (
          <div className="card mb-6 bg-amber-50 border border-amber-200">
            <p className="font-black text-sm text-amber-700 mb-3">🎙️ Laut vorlesen</p>

            {!voice.results && (
              <button
                onClick={voice.start}
                disabled={voice.recording}
                className={`btn-primary w-full ${voice.recording ? "opacity-75" : ""}`}
              >
                {voice.recording ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    Aufnahme läuft…
                  </span>
                ) : (
                  "🎙️ Vorlesen"
                )}
              </button>
            )}

            {voice.results && voice.fluency && (
              <div>
                <p className="font-black text-base mb-3">
                  Du hast{" "}
                  <span className="text-fox">{voice.fluency.correct}</span> von{" "}
                  <span className="text-fox">{voice.fluency.total}</span> Wörtern richtig gelesen!
                </p>
                <div className="text-base leading-relaxed flex flex-wrap gap-1 mb-3">
                  {voice.results.map((w, i) => (
                    <span
                      key={i}
                      className={`rounded px-1 font-bold ${
                        w.correct
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
                <button
                  onClick={voice.reset}
                  className="btn-secondary text-sm px-3 py-2"
                >
                  Nochmal versuchen
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="btn-primary w-full text-xl"
          onClick={() => setPhase("questions")}
        >
          Fragen beantworten →
        </button>
      </div>
    );
  }

  // ── Questions ───────────────────────────────────────────────────────────────

  if (phase === "questions") {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-5">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Frage {currentQ + 1} von {questions.length}</span>
            <span className="font-bold text-fox">📖 {readingData.title}</span>
          </div>
          <div className="h-3 rounded-full bg-fox-light overflow-hidden">
            <div
              className="h-full rounded-full bg-fox transition-all duration-500"
              style={{ width: `${(currentQ / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="card mb-5 flex items-center gap-4">
          <span className="text-5xl">🦊</span>
          <p className="text-lg text-gray-700">
            {q.selected !== null
              ? q.selected === q.answer
                ? "Super! Das war richtig! 🎉"
                : "Fast! Die richtige Antwort war markiert."
              : "Beantworte die Frage!"}
          </p>
        </div>

        <div className="card mb-5 text-center">
          <p className="font-black text-xl">{q.question}</p>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {q.options.map((option) => {
            let state: "idle" | "correct" | "wrong" = "idle";
            if (q.selected !== null) {
              if (option === q.answer) state = "correct";
              else if (option === q.selected) state = "wrong";
            }
            const base = "rounded-2xl border-2 px-4 py-4 text-lg font-bold transition-colors text-left";
            const styles = {
              idle:    `${base} border-gray-200 bg-white hover:border-fox hover:text-fox`,
              correct: `${base} border-forest bg-forest-light text-forest-dark`,
              wrong:   `${base} border-red-400 bg-red-50 text-red-700`,
            };
            return (
              <button
                key={option}
                className={styles[state]}
                onClick={() => q.selected === null && handleAnswer(option)}
                disabled={q.selected !== null}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────

  const correctCount = questions.filter((q) => q.selected === q.answer).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const xpEarned = correctCount * 10;
  const stars = score === 100 ? 3 : score >= 66 ? 2 : score >= 33 ? 1 : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <div className="text-6xl mb-4">
        {stars === 3 ? "🦊🎉" : stars >= 2 ? "🦊😄" : "🦊💪"}
      </div>
      <h2 className="text-2xl font-black text-fox mb-2">Lesen fertig!</h2>
      <p className="text-lg mb-1">
        {stars === 3 ? "Perfekt! ⭐⭐⭐" : stars === 2 ? "Super! ⭐⭐" : stars === 1 ? "Gut! ⭐" : "Weiter üben! 💪"}
      </p>
      <p className="text-gray-500 mb-6">
        Du hast <strong className="text-fox">{xpEarned} XP</strong> verdient!
      </p>

      <div className="card mb-6 text-left">
        {questions.map((q, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <span className="text-xl">{q.selected === q.answer ? "✅" : "❌"}</span>
            <p className="text-sm flex-1">{q.question}</p>
            {q.selected !== q.answer && (
              <span className="text-xs font-bold text-forest-dark shrink-0">→ {q.answer}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          className="btn-primary w-full"
          onClick={() => { void loadText(klasse); }}
        >
          Neuer Text 📖
        </button>
      </div>
    </div>
  );
}
