"use client";

import { useState, useEffect } from "react";
import type { DiktatLesson, DiktatSentence, Klasse } from "@schreibfix/core";
import { diktatLessons } from "@schreibfix/core";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { usePaywall } from "@/components/SubscriptionProvider";
import { DiktatClient } from "./DiktatClient";
import type { DiktatSentenceAI } from "@/lib/ai-content";

type CompletedMap = Record<string, number>; // lessonId → best stars

function starsEmoji(stars: number) {
  if (stars <= 0) return null;
  return "⭐".repeat(stars);
}

const KLASSEN: Klasse[] = [1, 2, 3, 4];

// Build a flat lookup: sentenceId → DiktatSentence
const sentenceById = new Map<string, DiktatSentence>();
for (const lesson of diktatLessons) {
  for (const s of lesson.sentences) {
    sentenceById.set(s.id, s);
  }
}

type WeakWordRow = {
  word: string;
  sentence_id: string;
  wrong_count: number;
};

function buildSchwaechenLesson(weakWords: WeakWordRow[]): DiktatLesson | null {
  // Sort by wrong_count desc, pick top 5 unique sentence_ids
  const sorted = [...weakWords].sort((a, b) => b.wrong_count - a.wrong_count);
  const seenSentences = new Set<string>();
  const sentences: DiktatSentence[] = [];

  for (const row of sorted) {
    if (seenSentences.has(row.sentence_id)) continue;
    const s = sentenceById.get(row.sentence_id);
    if (!s) continue;
    seenSentences.add(row.sentence_id);
    sentences.push({
      ...s,
      hint: `Achte besonders auf das Wort "${row.word}".`,
    });
    if (sentences.length >= 5) break;
  }

  if (sentences.length === 0) return null;

  return {
    id: "meine-schwaerchen",
    title: "Meine Schwächen",
    klasse: 1,
    theme: "Deine Fehlerwörter",
    xpReward: 30,
    sentences,
  };
}

export function LessonPickerClient() {
  const { user } = useAuth();
  const { checkFeature } = usePaywall();
  const [selectedLesson, setSelectedLesson] = useState<DiktatLesson | null>(null);
  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [filterKlasse, setFilterKlasse] = useState<Klasse | null>(null);
  const [schwaechenLesson, setSchwaechenLesson] = useState<DiktatLesson | null>(null);
  const [userKlasse, setUserKlasse] = useState<Klasse>(2);
  const [weakWordsForAI, setWeakWordsForAI] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch user's klasse to pre-filter
    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.klasse) {
          setFilterKlasse(data.klasse as Klasse);
          setUserKlasse(data.klasse as Klasse);
        }
      });

    // Fetch best stars per lesson
    void supabase
      .from("progress")
      .select("lesson_id, stars")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const map: CompletedMap = {};
        for (const row of data) {
          const prev = map[row.lesson_id] ?? 0;
          if ((row.stars ?? 0) > prev) map[row.lesson_id] = row.stars;
        }
        setCompletedMap(map);
      });

    // Fetch weak words for "Meine Schwächen" lesson and KI-Diktat
    void supabase
      .from("weak_words")
      .select("word, sentence_id, wrong_count")
      .eq("user_id", user.id)
      .order("wrong_count", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const lesson = buildSchwaechenLesson(data as WeakWordRow[]);
        setSchwaechenLesson(lesson);
        setWeakWordsForAI((data as WeakWordRow[]).slice(0, 8).map((r) => r.word));
      });
  }, [user]);

  const handleAiDiktat = async () => {
    if (!checkFeature("aiDiktat")) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/diktat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: userKlasse, weakWords: weakWordsForAI }),
      });
      const aiSentences: DiktatSentenceAI[] = await res.json() as DiktatSentenceAI[];
      const lessonId = `ai-generated-${Date.now()}`;
      const lesson: DiktatLesson = {
        id: lessonId,
        title: "🤖 KI-Diktat",
        klasse: userKlasse,
        theme: "Vom Computer erstellt",
        xpReward: 40,
        sentences: aiSentences.map((s, i) => ({
          id: `${lessonId}-s${i}`,
          text: s.sentence,
          hint: s.tip,
        })),
      };
      setSelectedLesson(lesson);
    } catch (err) {
      console.error("KI-Diktat error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (selectedLesson) {
    return (
      <DiktatClient
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  const visibleLessons = filterKlasse
    ? diktatLessons.filter((l) => l.klasse === filterKlasse)
    : diktatLessons;

  // Group by Klasse for display
  const grouped = KLASSEN.reduce<Record<Klasse, DiktatLesson[]>>(
    (acc, k) => {
      acc[k] = visibleLessons.filter((l) => l.klasse === k);
      return acc;
    },
    { 1: [], 2: [], 3: [], 4: [] }
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <div className="text-5xl mb-2">🎙️</div>
        <h2 className="text-2xl font-black text-fox">Diktat</h2>
        <p className="text-gray-500 text-base">Wähle eine Lektion aus!</p>
      </div>

      {/* KI-Diktat special lesson */}
      <div className="mb-4">
        <button
          onClick={() => { void handleAiDiktat(); }}
          disabled={aiLoading}
          className="card flex items-center gap-4 text-left w-full border-2 border-violet-300
                     bg-violet-50 transition-transform active:scale-95 hover:-translate-y-0.5
                     disabled:opacity-60 disabled:cursor-wait"
        >
          <div className="text-3xl">{aiLoading ? "⏳" : "🤖"}</div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-lg">KI-Diktat</p>
            <p className="text-sm text-gray-500">
              {aiLoading
                ? "Schreibfix denkt nach…"
                : "Frisch vom Computer · Passend für deine Klasse"}
            </p>
          </div>
          {aiLoading ? (
            <div className="shrink-0 animate-spin text-2xl">🦊</div>
          ) : (
            <div className="shrink-0">
              <span className="text-sm font-bold text-violet-600">Neu!</span>
            </div>
          )}
        </button>
      </div>

      {/* "Meine Schwächen" special lesson */}
      {schwaechenLesson && (
        <div className="mb-6">
          <button
            onClick={() => setSelectedLesson(schwaechenLesson)}
            className="card flex items-center gap-4 text-left w-full border-2 border-red-300
                       bg-red-50 transition-transform active:scale-95 hover:-translate-y-0.5"
          >
            <div className="text-3xl">⚠️</div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg">Meine Schwächen</p>
              <p className="text-sm text-gray-500">
                {schwaechenLesson.sentences.length} Fehlerwörter · Übe deine Schwachstellen!
              </p>
            </div>
            <div className="shrink-0">
              <span className="text-sm font-bold text-red-500">Üben!</span>
            </div>
          </button>
        </div>
      )}

      {/* Grade filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterKlasse(null)}
          className={
            filterKlasse === null
              ? "btn-primary py-1.5 px-4 text-base"
              : "btn-secondary py-1.5 px-4 text-base"
          }
        >
          Alle
        </button>
        {KLASSEN.map((k) => (
          <button
            key={k}
            onClick={() => setFilterKlasse(k)}
            className={
              filterKlasse === k
                ? "btn-primary py-1.5 px-4 text-base"
                : "btn-secondary py-1.5 px-4 text-base"
            }
          >
            Klasse {k}
          </button>
        ))}
      </div>

      {/* Lesson groups */}
      {KLASSEN.filter((k) => grouped[k].length > 0).map((k) => (
        <div key={k} className="mb-6">
          {!filterKlasse && (
            <h3 className="text-lg font-black text-gray-500 mb-3 flex items-center gap-2">
              <span className="inline-block bg-fox text-white text-sm font-bold px-3 py-0.5 rounded-full">
                Klasse {k}
              </span>
            </h3>
          )}
          <div className="flex flex-col gap-3">
            {grouped[k].map((lesson) => {
              const bestStars = completedMap[lesson.id] ?? null;
              const done = bestStars !== null;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`card flex items-center gap-4 text-left w-full transition-transform
                    active:scale-95 hover:-translate-y-0.5 border-2
                    ${done ? "border-forest" : "border-transparent"}`}
                >
                  <div className="text-3xl">
                    {done ? "📗" : "📘"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg truncate">{lesson.title}</p>
                    <p className="text-sm text-gray-400">
                      {lesson.sentences.length} Sätze &middot; {lesson.xpReward} XP &middot; {lesson.theme}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {done ? (
                      <p className="text-xl">{starsEmoji(bestStars)}</p>
                    ) : (
                      <span className="text-sm text-gray-300 font-bold">Neu</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
