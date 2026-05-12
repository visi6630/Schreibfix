"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  email: string | null;
  vorname: string | null;
  nachname: string | null;
  klasse: number | null;
  is_admin: boolean;
  xp: number;
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

type Subscription = {
  id: string;
  family_id: string;
  tier: string;
  status: string;
  stripe_subscription_id: string | null;
  paypal_subscription_id: string | null;
  current_period_ends_at: string | null;
  created_at: string;
  updated_at: string;
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

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
  school: "School",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  plus: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  school: "bg-amber-100 text-amber-800",
};

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

// ─── Subscription Manager ─────────────────────────────────────────────────────

function SubscriptionManager({
  profiles,
  token,
}: {
  profiles: Profile[];
  token: string;
}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editTier, setEditTier] = useState<Record<string, string>>({});
  const [editExpiry, setEditExpiry] = useState<Record<string, string>>({});

  const loadSubs = useCallback(async () => {
    const res = await fetch("/api/admin/subscriptions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { subscriptions?: Subscription[] };
    setSubscriptions(data.subscriptions ?? []);
    setLoading(false);
  }, [token]);

  useEffect(() => { void loadSubs(); }, [loadSubs]);

  const subMap = new Map(subscriptions.map((s) => [s.family_id, s]));

  const getEffectiveTier = (userId: string) => {
    return editTier[userId] ?? subMap.get(userId)?.tier ?? "free";
  };

  const getEffectiveExpiry = (userId: string) => {
    if (editExpiry[userId] !== undefined) return editExpiry[userId];
    const exp = subMap.get(userId)?.current_period_ends_at;
    return exp ? exp.slice(0, 10) : "";
  };

  const isManual = (userId: string) => {
    return subMap.get(userId)?.stripe_subscription_id === "MANUAL";
  };

  const handleSave = async (userId: string) => {
    setSaving(userId);
    const tier = getEffectiveTier(userId);
    const expiry = getEffectiveExpiry(userId);
    await fetch("/api/admin/subscriptions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        tier,
        expiresAt: expiry || null,
      }),
    });
    await loadSubs();
    setSaving(null);
    // Clear local edits
    setEditTier((prev) => { const n = { ...prev }; delete n[userId]; return n; });
    setEditExpiry((prev) => { const n = { ...prev }; delete n[userId]; return n; });
  };

  if (loading) {
    return <p className="text-gray-400 text-sm p-6">Lade Abonnements…</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3">E-Mail</th>
            <th className="text-left px-4 py-3">Aktuell</th>
            <th className="text-left px-4 py-3">Neues Tier</th>
            <th className="text-left px-4 py-3">Läuft ab</th>
            <th className="text-right px-4 py-3">Aktion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {profiles.map((profile) => {
            const sub = subMap.get(profile.id);
            const currentTier = sub?.tier ?? "free";
            const manual = isManual(profile.id);
            const isSavingThis = saving === profile.id;

            return (
              <tr key={profile.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    {profile.email ?? <span className="text-gray-300">—</span>}
                    {profile.is_admin && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">Admin</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[currentTier] ?? "bg-gray-100 text-gray-600"}`}>
                      {TIER_LABELS[currentTier] ?? currentTier}
                    </span>
                    {manual && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold">
                        Manuell gesetzt
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    value={getEffectiveTier(profile.id)}
                    onChange={(e) => setEditTier((prev) => ({ ...prev, [profile.id]: e.target.value }))}
                  >
                    {["free", "plus", "pro", "school"].map((t) => (
                      <option key={t} value={t}>{TIER_LABELS[t]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    value={getEffectiveExpiry(profile.id)}
                    onChange={(e) => setEditExpiry((prev) => ({ ...prev, [profile.id]: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { void handleSave(profile.id); }}
                    disabled={isSavingThis}
                    className="text-xs font-bold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {isSavingThis ? "…" : "Speichern"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [checkStatus, setCheckStatus] = useState<"loading" | "ok" | "denied">("loading");
  const [adminToken, setAdminToken] = useState<string>("");

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
          setAdminToken(token);
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
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? "";

      const [usersRes, progressRes, apiLogsRes, errorLogsRes] =
        await Promise.all([
          fetch("/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json() as Promise<{ users?: Profile[] }>),
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

      // Show ALL users (including admin) sorted by registration date
      const sortedUsers = (usersRes.users ?? []).sort(
        (a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime(),
      );
      setProfiles(sortedUsers);
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

  // ── Section A: Stats ────────────────────────────────────────────────────────
  const regularUsers = profiles.filter((p) => !p.is_admin);

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
            {profiles.length} Nutzer gesamt ({regularUsers.length} regulär)
          </span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          {profiles.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">Keine Nutzer gefunden.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">E-Mail</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Klasse</th>
                  <th className="text-right px-4 py-3">XP</th>
                  <th className="text-left px-4 py-3">Registriert</th>
                  <th className="text-left px-4 py-3">Zuletzt aktiv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      <div className="flex items-center gap-2">
                        {profile.email ?? (
                          <span className="text-gray-300">—</span>
                        )}
                        {profile.is_admin && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {profile.vorname || profile.nachname
                        ? `${profile.vorname ?? ""} ${profile.nachname ?? ""}`.trim()
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {profile.klasse ? `Kl. ${profile.klasse}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      {profile.xp ?? 0}
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

      {/* ── Section: Subscription Management ─────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-700">
            Abonnement-Verwaltung
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Test-Modus</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <SubscriptionManager profiles={profiles} token={adminToken} />
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
          <StatCard label="Reguläre Nutzer" value={regularUsers.length} />
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
