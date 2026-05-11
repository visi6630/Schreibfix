"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { diktatLessons } from "@schreibfix/core";

type ProgressRow = {
  id: string;
  lesson_id: string;
  score: number;
  stars: number;
  completed_at: string;
};

// ─── XP helpers ──────────────────────────────────────────────────────────────

const lessonMap = Object.fromEntries(diktatLessons.map((l) => [l.id, l]));

function computeXp(rows: ProgressRow[]): number {
  return rows.reduce((sum, row) => {
    if (row.lesson_id.startsWith("grammatik-")) {
      return sum + Math.round((row.score / 100) * 25);
    }
    const lesson = lessonMap[row.lesson_id];
    return sum + Math.round((row.score / 100) * (lesson?.xpReward ?? 30));
  }, 0);
}

type Level = { title: string; emoji: string; nextXp: number | null };

function getLevel(xp: number): Level {
  if (xp >= 500) return { title: "Schreibfix-Held",   emoji: "🏆", nextXp: null };
  if (xp >= 400) return { title: "Super-Fuchs",       emoji: "🦊", nextXp: 500  };
  if (xp >= 300) return { title: "Toller Fuchs",      emoji: "🦊", nextXp: 400  };
  if (xp >= 200) return { title: "Schlauer Fuchs",    emoji: "🦊", nextXp: 300  };
  if (xp >= 100) return { title: "Fleißiger Fuchs",   emoji: "🦊", nextXp: 200  };
  if (xp >= 50)  return { title: "Neugieriger Fuchs", emoji: "🦊", nextXp: 100  };
  return             { title: "Junger Fuchs",       emoji: "🦊", nextXp: 50   };
}

function getLevelStart(xp: number): number {
  if (xp >= 500) return 500;
  if (xp >= 400) return 400;
  if (xp >= 300) return 300;
  if (xp >= 200) return 200;
  if (xp >= 100) return 100;
  if (xp >= 50)  return 50;
  return 0;
}

function getMotivation(xp: number): string {
  if (xp >= 500) return "Du bist ein Schreibfix-Held! Ich bin so stolz auf dich! 🏆";
  if (xp >= 300) return "Wow, du bist ein echter Lernstar! Weiter so! 🌟";
  if (xp >= 100) return "Super! Du lernst wirklich fleißig. Mach weiter so! 💪";
  if (xp >= 50)  return "Toll, du machst Fortschritte! Ich freu mich für dich!";
  return "Super, dass du dabei bist! Jede Übung macht dich besser!";
}

// ─── Streak helper ────────────────────────────────────────────────────────────

function computeStreak(rows: ProgressRow[]): number {
  if (rows.length === 0) return 0;
  const activeDays = new Set(rows.map((r) => r.completed_at.slice(0, 10)));
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (!activeDays.has(todayStr) && !activeDays.has(yesterdayStr)) return 0;

  let streak = 0;
  const start = activeDays.has(todayStr) ? new Date(today) : new Date(yesterday);
  while (true) {
    const dateStr = start.toISOString().slice(0, 10);
    if (activeDays.has(dateStr)) {
      streak++;
      start.setDate(start.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function starsDisplay(stars: number) {
  if (stars <= 0) return "—";
  return "⭐".repeat(stars);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const GRAMMAR_LABELS: Record<string, string> = {
  "grammatik-verben":  "Verbkonjugation",
  "grammatik-artikel": "Artikel: der/die/das",
  "grammatik-plural":  "Einzahl & Mehrzahl",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function FortschrittClient() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .then(({ data }) => {
        setProgress((data as ProgressRow[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-fox text-2xl font-black">
        🦊 Laden …
      </div>
    );
  }

  const totalXp = computeXp(progress);
  const level = getLevel(totalXp);
  const levelStart = getLevelStart(totalXp);
  const levelEnd = level.nextXp ?? totalXp;
  const levelProgress =
    level.nextXp === null
      ? 100
      : Math.round(((totalXp - levelStart) / (levelEnd - levelStart)) * 100);
  const streak = computeStreak(progress);

  const diktatRows = progress.filter((p) => !p.lesson_id.startsWith("grammatik-"));
  const grammatikRows = progress.filter((p) => p.lesson_id.startsWith("grammatik-"));

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h2 className="text-2xl font-black text-fox mb-6">Mein Fortschritt</h2>

      {/* XP / Level card */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-5xl">{level.emoji}</div>
          <div>
            <p className="text-sm text-gray-400 font-bold">{level.title}</p>
            <p className="text-2xl font-black text-fox">{totalXp} XP</p>
          </div>
          {streak > 0 && (
            <div className="ml-auto text-center">
              <p className="text-2xl">🔥</p>
              <p className="text-sm font-black text-fox">{streak}</p>
              <p className="text-xs text-gray-400">Tage</p>
            </div>
          )}
        </div>
        <div className="h-4 rounded-full bg-fox-light overflow-hidden">
          <div
            className="h-full rounded-full bg-fox transition-all duration-700"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        {level.nextXp !== null ? (
          <p className="text-xs text-gray-400 mt-1">
            {totalXp - levelStart} / {levelEnd - levelStart} XP bis zum nächsten Level
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Maximales Level erreicht! 🏆</p>
        )}
      </div>

      {/* Fox motivation */}
      <div className="card mb-5 flex items-center gap-3 bg-fox-light border-0">
        <span className="text-3xl">🦊</span>
        <p className="text-base font-bold text-fox-dark">{getMotivation(totalXp)}</p>
      </div>

      {/* Diktat results */}
      <h3 className="text-lg font-black mb-3">🎙️ Diktate</h3>
      {diktatRows.length === 0 ? (
        <div className="card text-center py-8 mb-5">
          <p className="text-gray-400">Noch kein Diktat gemacht!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {diktatRows.map((p) => {
            const lesson = lessonMap[p.lesson_id];
            return (
              <div key={p.id} className="card flex items-center gap-4">
                <span className="text-2xl w-14 text-center shrink-0">
                  {starsDisplay(p.stars)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black truncate">
                    {lesson?.title ?? p.lesson_id}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDate(p.completed_at)}
                    {lesson ? ` · Klasse ${lesson.klasse}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-fox">{p.score}%</p>
                  <p className="text-xs text-gray-400">
                    +{Math.round((p.score / 100) * (lesson?.xpReward ?? 30))} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grammatik results */}
      <h3 className="text-lg font-black mb-3">✏️ Grammatik-Übungen</h3>
      {grammatikRows.length === 0 ? (
        <div className="card text-center py-8 mb-5">
          <p className="text-gray-400">Noch keine Übungen gemacht!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {grammatikRows.map((p) => (
            <div key={p.id} className="card flex items-center gap-4">
              <span className="text-2xl w-14 text-center shrink-0">
                {starsDisplay(p.stars)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-black truncate">
                  {GRAMMAR_LABELS[p.lesson_id] ?? p.lesson_id}
                </p>
                <p className="text-sm text-gray-400">{formatDate(p.completed_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-fox">{p.score}%</p>
                <p className="text-xs text-gray-400">
                  +{Math.round((p.score / 100) * 25)} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
