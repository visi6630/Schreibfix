"use client";

import { useState, useEffect } from "react";
import type { DiktatLesson, Klasse } from "@schreibfix/core";
import { diktatLessons } from "@schreibfix/core";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { DiktatClient } from "./DiktatClient";

type CompletedMap = Record<string, number>; // lessonId → best stars

function starsEmoji(stars: number) {
  if (stars <= 0) return null;
  return "⭐".repeat(stars);
}

const KLASSEN: Klasse[] = [1, 2, 3, 4];

export function LessonPickerClient() {
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<DiktatLesson | null>(null);
  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [filterKlasse, setFilterKlasse] = useState<Klasse | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch user's klasse to pre-filter
    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.klasse) setFilterKlasse(data.klasse as Klasse);
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
  }, [user]);

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
