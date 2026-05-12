"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/components/SubscriptionProvider";

interface StudentStats {
  id: string;
  vorname: string | null;
  nachname: string | null;
  avatar: string;
  klasse: number | null;
  xp: number;
  last_seen: string | null;
  exercisesThisWeek: number;
  totalExercises: number;
}

interface ClassStats {
  totalStudents: number;
  activeThisWeek: number;
  avgXP: number;
  topStudent: StudentStats | null;
}

const LEVEL_TITLES = [
  { min: 0, title: "Junger Fuchs" },
  { min: 50, title: "Neugieriger" },
  { min: 150, title: "Fleißiger" },
  { min: 300, title: "Schlauer" },
  { min: 500, title: "Super-Fuchs" },
  { min: 800, title: "Schreibfix-Held" },
];

function getLevelTitle(xp: number) {
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    const entry = LEVEL_TITLES[i];
    if (entry && xp >= entry.min) return entry.title;
  }
  return "Junger Fuchs";
}

function isActiveThisWeek(lastSeen: string | null): boolean {
  if (!lastSeen) return false;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return new Date(lastSeen) > weekAgo;
}

export function LehrerClient() {
  const router = useRouter();
  const { tier, loading: subLoading } = useSubscription();
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKlasse, setSelectedKlasse] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"xp" | "name" | "activity">("xp");

  useEffect(() => {
    if (subLoading) return;
    if (tier !== "school") {
      router.replace("/subscription");
    }
  }, [tier, subLoading, router]);

  useEffect(() => {
    if (subLoading || tier !== "school") return;
    void loadData();
  }, [subLoading, tier]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/auth"); return; }

      const res = await fetch("/api/lehrer/students", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Fehler beim Laden");
      }

      const json = (await res.json()) as { students: StudentStats[] };
      const data = json.students;
      setStudents(data);

      const active = data.filter((s) => isActiveThisWeek(s.last_seen));
      setClassStats({
        totalStudents: data.length,
        activeThisWeek: active.length,
        avgXP: data.length > 0 ? Math.round(data.reduce((s, st) => s + st.xp, 0) / data.length) : 0,
        topStudent: data.length > 0 ? data.reduce((a, b) => (a.xp >= b.xp ? a : b)) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  const klassen = [...new Set(students.map((s) => s.klasse).filter(Boolean))].sort() as number[];
  const filtered = students
    .filter((s) => selectedKlasse === null || s.klasse === selectedKlasse)
    .sort((a, b) => {
      if (sortBy === "xp") return b.xp - a.xp;
      if (sortBy === "name") return (a.vorname ?? "").localeCompare(b.vorname ?? "");
      const aActive = isActiveThisWeek(a.last_seen) ? 1 : 0;
      const bActive = isActiveThisWeek(b.last_seen) ? 1 : 0;
      return bActive - aActive;
    });

  if (subLoading || (tier !== "school" && !subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-fox border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Lehrer-Dashboard</h1>
            <p className="text-gray-500 text-sm">Klassenübersicht & Schülerfortschritt</p>
          </div>
          <div className="text-3xl">🏫</div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-red-700 font-bold text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-fox border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Class-level stats */}
            {classStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Schüler", value: classStats.totalStudents, icon: "👦" },
                  { label: "Diese Woche aktiv", value: classStats.activeThisWeek, icon: "🔥" },
                  { label: "Ø XP", value: classStats.avgXP, icon: "⭐" },
                  {
                    label: "Bester Schüler",
                    value: classStats.topStudent
                      ? `${classStats.topStudent.avatar} ${classStats.topStudent.vorname ?? "–"}`
                      : "–",
                    icon: "🏆",
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <p className="text-xl font-black text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedKlasse(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                    selectedKlasse === null
                      ? "bg-fox text-white border-fox"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Alle Klassen
                </button>
                {klassen.map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedKlasse(k)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                      selectedKlasse === k
                        ? "bg-fox text-white border-fox"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Klasse {k}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                {(["xp", "name", "activity"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      sortBy === s
                        ? "bg-gray-700 text-white border-gray-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {s === "xp" ? "Nach XP" : s === "name" ? "A–Z" : "Aktivität"}
                  </button>
                ))}
              </div>
            </div>

            {/* Student table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-4xl mb-2">🎒</p>
                  <p className="font-bold">Noch keine Schüler registriert</p>
                  <p className="text-sm mt-1">Schüler melden sich über die App an und erscheinen hier.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Schüler</th>
                      <th className="text-center p-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Klasse</th>
                      <th className="text-center p-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Level</th>
                      <th className="text-center p-3 text-xs font-bold text-gray-500 uppercase tracking-wide">XP</th>
                      <th className="text-center p-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Diese Woche</th>
                      <th className="text-center p-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Zuletzt aktiv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((student, idx) => {
                      const active = isActiveThisWeek(student.last_seen);
                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{student.avatar}</span>
                              <div>
                                <p className="font-bold text-sm text-gray-800">
                                  {student.vorname ?? "–"} {student.nachname ?? ""}
                                </p>
                                {idx === 0 && students.length > 1 && (
                                  <span className="text-xs text-yellow-600 font-bold">🏆 Bester</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm text-gray-600">
                              {student.klasse ? `${student.klasse}` : "–"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-xs text-gray-500">{getLevelTitle(student.xp)}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-black text-orange-500">{student.xp}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-sm ${student.exercisesThisWeek > 0 ? "text-green-600" : "text-gray-400"}`}>
                              {student.exercisesThisWeek} Übungen
                            </span>
                          </td>
                          <td className="p-3 text-center hidden sm:table-cell">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                              {active ? "🟢 Aktiv" : "⚪ Inaktiv"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Export button */}
            {filtered.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    const rows = ["Name,Klasse,XP,Level,Übungen diese Woche"]
                      .concat(
                        filtered.map(
                          (s) =>
                            `"${s.vorname ?? ""} ${s.nachname ?? ""}",${s.klasse ?? ""},${s.xp},"${getLevelTitle(s.xp)}",${s.exercisesThisWeek}`,
                        ),
                      )
                      .join("\n");
                    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "schreibfix-klasse.csv";
                    a.click();
                  }}
                  className="btn-secondary text-sm"
                >
                  📥 Als CSV exportieren
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
