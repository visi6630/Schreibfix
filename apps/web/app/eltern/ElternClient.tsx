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

type ChildProfile = {
  id: string;
  name: string;
  grade: Klasse;
  avatar: string;
};

// ─── XP helpers ───────────────────────────────────────────────────────────────

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
  klasse: Klasse,
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

// ─── Child form modal ─────────────────────────────────────────────────────────

const AVATARS = ["🦊", "🦝", "🐺", "🦁", "🐯"];

function AddChildModal({
  onSave,
  onClose,
}: {
  onSave: (name: string, grade: Klasse, avatar: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Klasse>(1);
  const [avatar, setAvatar] = useState("🦊");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-black mb-4">Kind hinzufügen</h3>

        {/* Avatar picker */}
        <div className="flex gap-3 mb-4 justify-center">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`text-3xl rounded-xl p-2 transition-all ${
                avatar === a ? "bg-fox-light scale-110 ring-2 ring-fox" : "hover:bg-gray-50"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-500 mb-1">Name des Kindes</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Emma"
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-base font-bold focus:border-fox focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-500 mb-1">Klasse</label>
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as Klasse[]).map((k) => (
              <button
                key={k}
                onClick={() => setGrade(k)}
                className={`rounded-xl py-2 font-black transition-all ${
                  grade === k
                    ? "bg-fox text-white"
                    : "border-2 border-gray-200 hover:border-fox"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:border-gray-300"
          >
            Abbrechen
          </button>
          <button
            onClick={() => {
              if (name.trim()) onSave(name.trim(), grade, avatar);
            }}
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-xl bg-fox text-white font-black hover:bg-fox/90 disabled:opacity-50"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function ElternClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [klasse, setKlasse] = useState<Klasse>(1);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [weakWords, setWeakWords] = useState<WeakWordRow[]>([]);
  const [encouragement, setEncouragement] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  // Multi-child state
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [savingChild, setSavingChild] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const [profileRes, progressRes, weakRes, childrenRes] = await Promise.all([
        supabase.from("profiles").select("klasse").eq("id", user.id).maybeSingle(),
        supabase.from("progress").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }),
        supabase.from("weak_words").select("word, wrong_count").eq("user_id", user.id).order("wrong_count", { ascending: false }).limit(5),
        supabase.from("children").select("*").eq("parent_id", user.id).order("created_at", { ascending: true }),
      ]);

      const k = (profileRes.data?.klasse as Klasse) ?? 1;
      setKlasse(k);
      setProgress((progressRes.data as ProgressRow[]) ?? []);
      setWeakWords((weakRes.data as WeakWordRow[]) ?? []);
      if (childrenRes.data) setChildren(childrenRes.data as ChildProfile[]);
      setLoading(false);

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

  const handleAddChild = async (name: string, grade: Klasse, avatar: string) => {
    if (!user || children.length >= 4) return;
    setSavingChild(true);
    const { data, error } = await supabase
      .from("children")
      .insert({ parent_id: user.id, name, grade, avatar })
      .select()
      .single();
    if (!error && data) {
      setChildren((prev) => [...prev, data as ChildProfile]);
    }
    setSavingChild(false);
    setShowAddChild(false);
  };

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

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekExercises = progress.filter((p) => new Date(p.completed_at) >= weekAgo);

  const days = last7Days();
  const activityByDay: DayActivity[] = days.map((date) => ({
    date,
    count: progress.filter((p) => p.completed_at.startsWith(date)).length,
  }));
  const maxActivity = Math.max(...activityByDay.map((d) => d.count), 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {showAddChild && (
        <AddChildModal
          onSave={(n, g, a) => { void handleAddChild(n, g, a); }}
          onClose={() => setShowAddChild(false)}
        />
      )}

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

      {/* Children profiles */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Meine Kinder
          </h2>
          {children.length < 4 && (
            <button
              onClick={() => setShowAddChild(true)}
              disabled={savingChild}
              className="text-sm font-bold text-orange-500 hover:underline disabled:opacity-50"
            >
              + Kind hinzufügen
            </button>
          )}
        </div>

        {children.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-3">Noch keine Kindprofile angelegt.</p>
            <button
              onClick={() => setShowAddChild(true)}
              className="text-sm font-bold text-orange-500 border border-orange-200 rounded-lg px-4 py-2 hover:bg-orange-50"
            >
              Erstes Kind hinzufügen
            </button>
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex flex-col items-center gap-1 bg-orange-50 rounded-xl p-3 min-w-[72px]"
              >
                <span className="text-3xl">{child.avatar}</span>
                <span className="text-sm font-black text-gray-700">{child.name}</span>
                <span className="text-xs text-gray-400">Klasse {child.grade}</span>
              </div>
            ))}
          </div>
        )}
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
