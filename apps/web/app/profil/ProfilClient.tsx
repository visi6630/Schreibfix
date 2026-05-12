"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// Required Supabase migration (run once in dashboard):
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vorname TEXT;
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nachname TEXT;
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🦊';

const AVATARS = ["🦊", "🦁", "🐺", "🦝", "🐻", "🐯", "🐸", "🦔"];

const KLASSEN = [1, 2, 3, 4] as const;

type ProfileData = {
  vorname: string;
  nachname: string;
  klasse: number | null;
  avatar: string;
};

export function ProfilClient() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData>({
    vorname: "",
    nachname: "",
    klasse: null,
    avatar: "🦊",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("vorname, nachname, klasse, avatar")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            vorname: (data.vorname as string) ?? "",
            nachname: (data.nachname as string) ?? "",
            klasse: data.klasse as number | null,
            avatar: (data.avatar as string) ?? "🦊",
          });
        }
        setLoading(false);
      });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          vorname: profile.vorname.trim() || null,
          nachname: profile.nachname.trim() || null,
          klasse: profile.klasse,
          avatar: profile.avatar,
        },
        { onConflict: "id" },
      );

    setSaving(false);
    if (error) {
      setSaveMsg({ type: "err", text: "Fehler beim Speichern: " + error.message });
    } else {
      setSaveMsg({ type: "ok", text: "Profil gespeichert! ✓" });
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);

    if (!newPw || !confirmPw) {
      setPwMsg({ type: "err", text: "Bitte alle Felder ausfüllen." });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: "err", text: "Das neue Passwort muss mindestens 8 Zeichen haben." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: "err", text: "Die Passwörter stimmen nicht überein." });
      return;
    }
    if (!/[A-Z]/.test(newPw) || !/[0-9]/.test(newPw)) {
      setPwMsg({
        type: "err",
        text: "Das Passwort muss mindestens einen Großbuchstaben und eine Zahl enthalten.",
      });
      return;
    }

    setPwLoading(true);

    // Re-authenticate first with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPw,
    });
    if (signInError) {
      setPwLoading(false);
      setPwMsg({ type: "err", text: "Aktuelles Passwort ist falsch." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) {
      setPwMsg({ type: "err", text: "Fehler: " + error.message });
    } else {
      setPwMsg({ type: "ok", text: "Passwort erfolgreich geändert! ✓" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwMsg(null), 4000);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-400 text-sm">Profil wird geladen…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-fox">Mein Profil</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {user?.email}
        </p>
      </div>

      {/* ── Avatar selector ──────────────────────────────────────────────────── */}
      <div className="card mb-5">
        <p className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">
          Mein Avatar
        </p>
        <div className="flex gap-3 flex-wrap">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setProfile((p) => ({ ...p, avatar: a }))}
              className={`text-3xl rounded-xl p-2 border-2 transition-colors
                ${profile.avatar === a
                  ? "border-fox bg-orange-50"
                  : "border-gray-100 hover:border-gray-300"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* ── Profile form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="card mb-5 flex flex-col gap-4">
        <p className="text-sm font-black text-gray-500 uppercase tracking-wider">
          Meine Daten
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Vorname</label>
            <input
              type="text"
              value={profile.vorname}
              onChange={(e) => setProfile((p) => ({ ...p, vorname: e.target.value }))}
              placeholder="Vorname"
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-base focus:border-fox focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Nachname</label>
            <input
              type="text"
              value={profile.nachname}
              onChange={(e) => setProfile((p) => ({ ...p, nachname: e.target.value }))}
              placeholder="Nachname"
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-base focus:border-fox focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={user?.email ?? ""}
            disabled
            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 py-2.5 text-base text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Die E-Mail kann nicht geändert werden.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Meine Klasse</label>
          <div className="flex gap-3">
            {KLASSEN.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setProfile((p) => ({ ...p, klasse: k }))}
                className={`flex-1 rounded-xl border-2 py-2.5 text-base font-black transition-colors
                  ${profile.klasse === k
                    ? "border-fox bg-orange-50 text-fox"
                    : "border-gray-200 hover:border-fox/50"}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {saveMsg && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-bold
              ${saveMsg.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {saveMsg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:opacity-60"
        >
          {saving ? "Wird gespeichert…" : "Speichern"}
        </button>
      </form>

      {/* ── Password change ───────────────────────────────────────────────────── */}
      <form onSubmit={handlePasswordChange} className="card mb-5 flex flex-col gap-4">
        <p className="text-sm font-black text-gray-500 uppercase tracking-wider">
          Passwort ändern
        </p>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">
            Aktuelles Passwort
          </label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Aktuelles Passwort"
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-base focus:border-fox focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Neues Passwort</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Zahl"
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-base focus:border-fox focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Mindestens 8 Zeichen, ein Großbuchstabe und eine Zahl.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">
            Neues Passwort bestätigen
          </label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Passwort wiederholen"
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-base focus:border-fox focus:outline-none"
          />
        </div>

        {pwMsg && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-bold
              ${pwMsg.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {pwMsg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={pwLoading}
          className="btn-secondary w-full disabled:opacity-60"
        >
          {pwLoading ? "Wird geändert…" : "Passwort ändern"}
        </button>
      </form>

      {/* ── Abmelden ─────────────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl border-2 border-red-200 bg-red-50 py-3 text-base font-black text-red-600 hover:bg-red-100 transition-colors"
      >
        Abmelden
      </button>
    </div>
  );
}
