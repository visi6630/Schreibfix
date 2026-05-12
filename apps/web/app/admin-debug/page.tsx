"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DebugInfo = {
  serviceRoleConfigured?: boolean;
  userId?: string | null;
  email?: string | null;
  jwtOk?: boolean;
  jwtError?: string | null;
  profileViaRls?: Record<string, unknown> | null;
  rlsError?: string | null;
  profileViaAdmin?: Record<string, unknown> | null;
  adminError?: string | null;
  isAdminViaRls?: boolean;
  isAdminViaServiceRole?: boolean;
  rlsPolicies?: Array<{ policyname: string; cmd: string; qual: string; with_check: string }>;
  rlsPoliciesError?: string | null;
  error?: string;
};

function Row({ label, value, ok }: { label: string; value: React.ReactNode; ok?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="w-56 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm font-mono break-all ${
          ok === true
            ? "text-green-600 font-bold"
            : ok === false
            ? "text-red-500 font-bold"
            : "text-gray-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function AdminDebugPage() {
  const [info, setInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // Get session client-side
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;
      const token = sessionData.session?.access_token ?? null;
      setClientEmail(user?.email ?? null);
      setClientId(user?.id ?? null);

      if (!token) {
        setInfo({ error: "Nicht eingeloggt — bitte zuerst anmelden." });
        setLoading(false);
        return;
      }

      const res = await fetch("/api/debug/admin-info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as DebugInfo;
      setInfo(data);
      setLoading(false);
    };

    void run();
  }, []);

  const rlsSelectPolicy = `CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Debug</h1>
        <p className="text-sm text-gray-400 mt-1">Temporäre Diagnoseseite — nach dem Fix löschen.</p>
      </div>

      {/* ── Client-side session ── */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          1. Client-seitige Session
        </h2>
        <Row label="E-Mail (Client)" value={clientEmail ?? "—"} ok={!!clientEmail} />
        <Row label="User-ID (Client)" value={clientId ?? "—"} ok={!!clientId} />
      </section>

      {loading && (
        <div className="text-gray-400 text-sm py-6 text-center">Lade Debug-Infos vom Server…</div>
      )}

      {!loading && info && (
        <>
          {info.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm font-bold text-red-600">
              ⚠️ {info.error}
            </div>
          )}

          {/* ── Server-side JWT check ── */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              2. Server-seitige JWT-Verifikation (Anon-Key)
            </h2>
            <Row label="JWT gültig" value={info.jwtOk ? "✓ Ja" : "✗ Nein"} ok={info.jwtOk} />
            {info.jwtError && <Row label="Fehler" value={info.jwtError} ok={false} />}
            <Row label="User-ID (Server)" value={info.userId ?? "—"} />
            <Row label="E-Mail (Server)" value={info.email ?? "—"} />
          </section>

          {/* ── RLS profile query ── */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              3. Profil-Abfrage mit RLS (Anon-Key + User-JWT)
            </h2>
            <Row
              label="Profil gefunden"
              value={info.profileViaRls ? "✓ Ja" : "✗ Nein / geblockt"}
              ok={!!info.profileViaRls}
            />
            {info.rlsError && <Row label="RLS-Fehler" value={info.rlsError} ok={false} />}
            {info.profileViaRls && (
              <Row label="Profil (raw)" value={JSON.stringify(info.profileViaRls)} />
            )}
            <Row
              label="is_admin (via RLS)"
              value={String(info.isAdminViaRls ?? false)}
              ok={info.isAdminViaRls}
            />
          </section>

          {/* ── Service role check ── */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              4. Profil-Abfrage mit Service-Role-Key (bypasses RLS)
            </h2>
            <Row
              label="Service-Role konfiguriert"
              value={info.serviceRoleConfigured ? "✓ Ja" : "✗ Nein (leer in .env.local)"}
              ok={info.serviceRoleConfigured}
            />
            {info.serviceRoleConfigured && (
              <>
                <Row
                  label="Profil gefunden"
                  value={info.profileViaAdmin ? "✓ Ja" : "✗ Nein"}
                  ok={!!info.profileViaAdmin}
                />
                {info.adminError && (
                  <Row label="Admin-Fehler" value={info.adminError} ok={false} />
                )}
                {info.profileViaAdmin && (
                  <Row label="Profil (raw)" value={JSON.stringify(info.profileViaAdmin)} />
                )}
                <Row
                  label="is_admin (via Service Role)"
                  value={String(info.isAdminViaServiceRole ?? false)}
                  ok={info.isAdminViaServiceRole}
                />
              </>
            )}
          </section>

          {/* ── RLS policies ── */}
          {info.serviceRoleConfigured && (
            <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                5. RLS-Policies auf der profiles-Tabelle
              </h2>
              {info.rlsPoliciesError && (
                <p className="text-sm text-red-500 mb-2">{info.rlsPoliciesError}</p>
              )}
              {!info.rlsPolicies?.length ? (
                <p className="text-sm text-red-500 font-bold">
                  ✗ Keine SELECT-Policies gefunden — RLS blockiert alle Lesezugriffe ohne Service-Role-Key.
                </p>
              ) : (
                <div className="space-y-2">
                  {info.rlsPolicies.map((p) => (
                    <div key={p.policyname} className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                      <span className="font-bold text-gray-700">{p.policyname}</span>
                      <span className="text-gray-400 ml-2">[{p.cmd}]</span>
                      <div className="text-gray-500 mt-1">USING: {p.qual}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Fix instructions ── */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">
              Diagnose &amp; Fix
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              {!info.serviceRoleConfigured && (
                <div>
                  <p className="font-bold text-red-600 mb-1">
                    ✗ SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local
                  </p>
                  <p className="text-gray-500 text-xs">
                    Supabase Dashboard → Project Settings → API → service_role key (secret). In .env.local eintragen und Server neu starten.
                  </p>
                </div>
              )}
              {!info.profileViaRls && !info.serviceRoleConfigured && (
                <div>
                  <p className="font-bold text-red-600 mb-1">✗ RLS blockiert profiles-SELECT</p>
                  <p className="text-gray-500 text-xs mb-2">
                    Folgendes SQL im Supabase SQL-Editor ausführen:
                  </p>
                  <pre className="bg-gray-800 text-green-300 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {rlsSelectPolicy}
                  </pre>
                </div>
              )}
              {info.serviceRoleConfigured && info.isAdminViaServiceRole && (
                <p className="font-bold text-green-600">
                  ✓ Service-Role-Key funktioniert und is_admin = true — alles sollte funktionieren!
                </p>
              )}
              {info.serviceRoleConfigured && !info.isAdminViaServiceRole && info.profileViaAdmin && (
                <p className="font-bold text-red-600">
                  ✗ is_admin ist false in der Datenbank für diesen Nutzer. Bitte im Supabase SQL-Editor prüfen: UPDATE profiles SET is_admin = true WHERE email = &apos;{info.email}&apos;;
                </p>
              )}
            </div>
          </section>

          {/* ── Raw JSON ── */}
          <details className="bg-gray-50 border border-gray-200 rounded-xl">
            <summary className="px-4 py-2 cursor-pointer text-xs text-gray-400 font-mono select-none">
              Raw JSON response
            </summary>
            <pre className="px-4 pb-4 pt-2 text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(info, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
