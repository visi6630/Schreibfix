"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  email: string | null;
  klasse: number | null;
  is_admin: boolean;
  registered_at: string;
  last_seen: string | null;
};

type Progress = {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  completed_at: string;
};

type ApiLog = {
  id: string;
  user_id: string | null;
  api_type: string;
  endpoint: string | null;
  tokens_used: number;
  characters_used: number;
  cost_estimate: number;
  created_at: string;
};

type ErrorLog = {
  id: string;
  user_id: string | null;
  error_type: string;
  error_message: string;
  page: string | null;
  created_at: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeXpForProgress(rows: Progress[]): number {
  return rows.reduce((sum, row) => {
    const base =
      row.lesson_id.startsWith("grammatik-") || row.lesson_id === "lesen-ai"
        ? 25
        : 30;
    return sum + Math.round((row.score / 100) * base);
  }, 0);
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
      <p className="text-2xl font-bold text-orange-500">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
}

function DauBar({
  date,
  count,
  max,
}: {
  date: string;
  count: number;
  max: number;
}) {
  const height = max > 0 ? Math.round((count / max) * 56) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400">{count || ""}</span>
      <div className="w-8 bg-gray-100 rounded-t" style={{ height: 60 }}>
        <div
          className="w-full rounded-t bg-orange-400 transition-all duration-500"
          style={{ height: `${height}px`, marginTop: `${60 - height}px` }}
        />
      </div>
      <span className="text-xs text-gray-300">
        {new Date(date).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        })}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
      {children}
    </h2>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Admin check state — independent from AuthProvider.isAdmin to avoid race conditions
  const [checkStatus, setCheckStatus] = useState<"loading" | "ok" | "denied">("loading");

  const [dataLoading, setDataLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allProgress, setAllProgress] = useState<Progress[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  // ── Step 1: Verify admin via /api/admin/check ──────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    const verify = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setCheckStatus("denied");
        router.replace("/");
        return;
      }

      try {
        const res = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as { isAdmin: boolean };

        if (data.isAdmin === true) {
          setCheckStatus("ok");
        } else {
          setCheckStatus("denied");
          router.replace("/");
        }
      } catch {
        setCheckStatus("denied");
        router.replace("/");
      }
    };

    void verify();
  }, [user, authLoading, router]);

  // ── Step 2: Load dashboard data once admin is confirmed ────────────────────
  useEffect(() => {
    if (checkStatus !== "ok") return;

    const fetchAll = async () => {
      const [profilesRes, progressRes, apiLogsRes, errorLogsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .order("registered_at", { ascending: false }),
          supabase
            .from("progress")
            .select("*")
            .order("completed_at", { ascending: false }),
          supabase
            .from("api_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500),
          supabase
            .from("error_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(30),
        ]);

      setProfiles((profilesRes.data as Profile[]) ?? []);
      setAllProgress((progressRes.data as Progress[]) ?? []);
      setApiLogs((apiLogsRes.data as ApiLog[]) ?? []);
      setErrorLogs((errorLogsRes.data as ErrorLog[]) ?? []);
      setDataLoading(false);
    };

    void fetchAll();
  }, [checkStatus]);

  // ── Loading / access-denied states ────────────────────────────────────────
  if (checkStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-300 text-sm">Admin-Zugang wird geprüft…</p>
      </div>
    );
  }

  if (checkStatus !== "ok") {
    return null;
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400 text-sm">Admin-Daten werden geladen…</p>
      </div>
    );
  }

  // ── Section A: Users ────────────────────────────────────────────────────────
  const regularUsers = profiles.filter((p) => !p.is_admin);

  const xpByUser: Record<string, number> = {};
  for (const p of allProgress) {
    const base =
      p.lesson_id.startsWith("grammatik-") || p.lesson_id === "lesen-ai"
        ? 25
        : 30;
    xpByUser[p.user_id] = (xpByUser[p.user_id] ?? 0) + Math.round((p.score / 100) * base);
  }

  // ── Section B: Usage stats ──────────────────────────────────────────────────
  const totalXp = computeXpForProgress(allProgress);
  const totalDiktate = allProgress.filter(
    (p) => !p.lesson_id.startsWith("grammatik-") && p.lesson_id !== "lesen-ai",
  ).length;

  const last7Days = getLast7Days();
  const dauByDay = last7Days.map((date) => {
    const users = new Set(
      allProgress
        .filter((p) => p.completed_at.startsWith(date))
        .map((p) => p.user_id),
    );
    return { date, count: users.size };
  });
  const maxDau = Math.max(...dauByDay.map((d) => d.count), 1);

  const exerciseCounts: Record<string, number> = {};
  for (const p of allProgress) {
    exerciseCounts[p.lesson_id] = (exerciseCounts[p.lesson_id] ?? 0) + 1;
  }
  const topExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // ── Section C: API usage (this month) ─────────────────────────────────────
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthLogs = apiLogs.filter(
    (l) => new Date(l.created_at) >= startOfMonth,
  );

  const elevenLabsLogs = monthLogs.filter((l) => l.api_type === "elevenlabs");
  const claudeLogs = monthLogs.filter((l) => l.api_type === "claude");

  const elevenLabsChars = elevenLabsLogs.reduce(
    (s, l) => s + l.characters_used,
    0,
  );
  const claudeTokens = claudeLogs.reduce((s, l) => s + l.tokens_used, 0);
  const totalCost = monthLogs.reduce(
    (s, l) => s + Number(l.cost_estimate),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin-Konsole</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Schreibfix · {user?.email}
          </p>
        </div>
        <Link href="/" className="text-sm text-orange-500 hover:underline">
          ← Zur App
        </Link>
      </div>

      {/* ── Section A: Users Overview ─────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-700">
            Benutzerübersicht
          </h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {regularUsers.length} Nutzer
          </span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          {regularUsers.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">Keine Nutzer gefunden.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">E-Mail</th>
                  <th className="text-left px-4 py-3">Klasse</th>
                  <th className="text-right px-4 py-3">XP</th>
                  <th className="text-left px-4 py-3">Registriert</th>
                  <th className="text-left px-4 py-3">Zuletzt aktiv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {regularUsers.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {profile.email ?? (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {profile.klasse ? `Kl. ${profile.klasse}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      {xpByUser[profile.id] ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {fmt(profile.registered_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {profile.last_seen ? fmt(profile.last_seen) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Section B: Usage Statistics ───────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Nutzungsstatistiken
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Übungen gesamt" value={allProgress.length} />
          <StatCard label="Diktate" value={totalDiktate} />
          <StatCard label="XP gesamt" value={totalXp} />
          <StatCard label="Aktive Nutzer" value={regularUsers.length} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <SectionTitle>Aktive Nutzer (letzte 7 Tage)</SectionTitle>
          <div className="flex items-end gap-3 justify-between">
            {dauByDay.map(({ date, count }) => (
              <DauBar key={date} date={date} count={count} max={maxDau} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <SectionTitle>Beliebteste Übungstypen</SectionTitle>
          {topExercises.length === 0 ? (
            <p className="text-gray-400 text-sm">Noch keine Übungen.</p>
          ) : (
            <div className="space-y-2">
              {topExercises.map(([id, count]) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-44 truncate font-mono">
                    {id}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-300 h-2 rounded-full"
                      style={{
                        width: `${Math.round(
                          (count / (topExercises[0]?.[1] ?? 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section C: API Usage ──────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          API-Nutzung{" "}
          <span className="text-sm font-normal text-gray-400">
            (dieser Monat)
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="API-Aufrufe" value={monthLogs.length} />
          <StatCard
            label="ElevenLabs"
            value={elevenLabsLogs.length}
            sub={`${elevenLabsChars.toLocaleString()} Zeichen`}
          />
          <StatCard
            label="Claude"
            value={claudeLogs.length}
            sub={`${claudeTokens.toLocaleString()} Token`}
          />
          <StatCard
            label="Est. Kosten"
            value={`€${totalCost.toFixed(4)}`}
          />
        </div>

        {apiLogs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <div className="px-5 py-3 border-b border-gray-50">
              <SectionTitle>Letzte Aufrufe</SectionTitle>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2">Zeitpunkt</th>
                  <th className="text-left px-4 py-2">Typ</th>
                  <th className="text-left px-4 py-2">Endpoint</th>
                  <th className="text-right px-4 py-2">Token/Zeichen</th>
                  <th className="text-right px-4 py-2">Kosten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apiLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-5 py-2 text-gray-400">
                      {fmtDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          log.api_type === "claude"
                            ? "bg-purple-100 text-purple-700"
                            : log.api_type === "elevenlabs"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {log.api_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {log.endpoint ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {log.api_type === "claude"
                        ? `${log.tokens_used} tok`
                        : `${log.characters_used} chr`}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400">
                      €{Number(log.cost_estimate).toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section D: Error Monitoring ───────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-700">Fehlermeldungen</h2>
          {errorLogs.length > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {errorLogs.length}
            </span>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {errorLogs.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">
              Keine Fehler aufgezeichnet. 🎉
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-2">Zeitpunkt</th>
                    <th className="text-left px-4 py-2">Typ</th>
                    <th className="text-left px-4 py-2">Seite</th>
                    <th className="text-left px-4 py-2">Meldung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {errorLogs.map((err) => (
                    <tr key={err.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2 text-gray-400 whitespace-nowrap">
                        {fmtDateTime(err.created_at)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                          {err.error_type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {err.page ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                        {err.error_message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
