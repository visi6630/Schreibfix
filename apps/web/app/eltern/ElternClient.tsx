"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { Klasse } from "@schreibfix/core";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressRow = {
  id: string;
  lesson_id: string;
  score: number;
  stars: number;
  completed_at: string;
};

type WeakWordRow = {
  word: string;
  wrong_count: number;
};

type DayActivity = {
  date: string;
  count: number;
};

// ─── XP helpers (matching FortschrittClient) ─────────────────────────────────

function computeXp(rows: ProgressRow[]): number {
  return rows.reduce((sum, row) => {
    if (row.lesson_id.startsWith("grammatik-") || row.lesson_id === "lesen-ai") {
      return sum + Math.round((row.score / 100) * 25);
    }
    return sum + Math.round((row.score / 100) * 30);
  }, 0);
}

function getLevel(xp: number): string {
  if (xp >= 500) return "Schreibfix-Held 🏆";
  if (xp >= 400) return "Super-Fuchs 🦊";
  if (xp >= 300) return "Toller Fuchs 🦊";
  if (xp >= 200) return "Schlauer Fuchs 🦊";
  if (xp >= 100) return "Fleißiger Fuchs 🦊";
  if (xp >= 50)  return "Neugieriger Fuchs 🦊";
  return "Junger Fuchs 🦊";
}

function last7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { weekday: "short" });
}

// ─── AI encouragement ─────────────────────────────────────────────────────────

async function fetchEncouragement(
  xp: number,
  totalExercises: number,
  topWeakWords: string[],
  klasse: Klasse
): Promise<string> {
  try {
    const res = await fetch("/api/ai/encouragement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xp, totalExercises, topWeakWords, klasse }),
    });
    const data = await res.json() as { text: string };
    return data.text ?? "";
  } catch {
    return "";
  }
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function ActivityBar({ day, count, max }: { day: DayActivity; count: number; max: number }) {
  const height = max > 0 ? Math.round((count / max) * 60) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500 font-medium">{count || ""}</span>
      <div className="w-8 bg-gray-100 rounded-t" style={{ height: 64 }}>
        <div
          className="w-full rounded-t bg-orange-400 transition-all duration-500"
          style={{ height: `${height}px`, marginTop: `${64 - height}px` }}
        />
      </div>
      <span className="text-xs text-gray-400">{shortDay(day.date)}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ElternClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [klasse, setKlasse] = useState<Klasse>(1);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [weakWords, setWeakWords] = useState<WeakWordRow[]>([]);
  const [encouragement, setEncouragement] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const [profileRes, progressRes, weakRes] = await Promise.all([
        supabase.from("profiles").select("klasse").eq("id", user.id).maybeSingle(),
        supabase.from("progress").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }),
        supabase.from("weak_words").select("word, wrong_count").eq("user_id", user.id).order("wrong_count", { ascending: false }).limit(5),
      ]);

      const k = (profileRes.data?.klasse as Klasse) ?? 1;
      setKlasse(k);
      setProgress((progressRes.data as ProgressRow[]) ?? []);
      setWeakWords((weakRes.data as WeakWordRow[]) ?? []);
      setLoading(false);

      // AI encouragement — fetch separately so it doesn't block
      const rows = (progressRes.data as ProgressRow[]) ?? [];
      const xp = computeXp(rows);
      const words = ((weakRes.data as WeakWordRow[]) ?? []).map((w) => w.word);
      setAiLoading(true);
      const text = await fetchEncouragement(xp, rows.length, words, k);
      setEncouragement(text);
      setAiLoading(false);
    };

    void fetchAll();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Bitte einloggen, um das Elternportal zu sehen.</p>
        <Link href="/auth" className="text-orange-500 font-bold hover:underline">
          Zum Login →
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-400 text-lg">Daten werden geladen…</p>
      </div>
    );
  }

  const totalXp = computeXp(progress);
  const levelTitle = getLevel(totalXp);

  // This week's exercises
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekExercises = progress.filter(
    (p) => new Date(p.completed_at) >= weekAgo
  );

  // Daily activity for bar chart
  const days = last7Days();
  const activityByDay: DayActivity[] = days.map((date) => ({
    date,
    count: progress.filter((p) => p.completed_at.startsWith(date)).length,
  }));
  const maxActivity = Math.max(...activityByDay.map((d) => d.count), 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Elternportal</h1>
          <p className="text-sm text-gray-400 mt-0.5">Schreibfix · {user.email}</p>
        </div>
        <Link href="/" className="text-sm text-orange-500 hover:underline">
          ← Zur App
        </Link>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{totalXp}</p>
          <p className="text-xs text-gray-400 mt-1">Gesamt-XP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{weekExercises.length}</p>
          <p className="text-xs text-gray-400 mt-1">Übungen (Woche)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-lg font-bold text-orange-500">Kl. {klasse}</p>
          <p className="text-xs text-gray-400 mt-1">Klasse</p>
        </div>
      </div>

      {/* Level */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Aktuelles Level
        </h2>
        <p className="text-xl font-bold text-gray-800">{levelTitle}</p>
      </div>

      {/* AI encouragement */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">
          🤖 KI-Einschätzung
        </h2>
        {aiLoading ? (
          <p className="text-gray-400 text-sm italic">Wird erstellt…</p>
        ) : encouragement ? (
          <p className="text-gray-700 text-sm leading-relaxed">{encouragement}</p>
        ) : (
          <p className="text-gray-400 text-sm italic">Kein API-Schlüssel hinterlegt.</p>
        )}
      </div>

      {/* Activity chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Aktivität (letzte 7 Tage)
        </h2>
        <div className="flex items-end gap-2 justify-between">
          {activityByDay.map((day) => (
            <ActivityBar key={day.date} day={day} count={day.count} max={maxActivity} />
          ))}
        </div>
      </div>

      {/* Top weak words */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Top 5 Fehlerwörter
        </h2>
        {weakWords.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Fehlerwörter vorhanden.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {weakWords.map((w, i) => (
              <div key={w.word} className="flex items-center gap-3">
                <span className="text-xs text-gray-300 w-4 font-bold">{i + 1}.</span>
                <span className="font-semibold text-gray-700 flex-1">{w.word}</span>
                <div className="flex items-center gap-1">
                  <div
                    className="h-2 rounded-full bg-orange-300"
                    style={{ width: `${Math.min(w.wrong_count * 12, 80)}px` }}
                  />
                  <span className="text-xs text-gray-400 ml-1">{w.wrong_count}×</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent exercises */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Letzte Übungen
        </h2>
        {progress.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Übungen absolviert.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {progress.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-1">
                <span className="text-sm text-gray-300 w-14 shrink-0">
                  {new Date(p.completed_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className="text-sm text-gray-600 flex-1 truncate">{p.lesson_id}</span>
                <span
                  className={`text-sm font-semibold ${
                    p.score >= 80 ? "text-green-600" : p.score >= 50 ? "text-orange-500" : "text-red-500"
                  }`}
                >
                  {p.score}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
