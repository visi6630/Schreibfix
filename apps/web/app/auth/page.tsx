"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── German error messages ────────────────────────────────────────────────────

const GERMAN_ERRORS: Record<string, string> = {
  "Invalid login credentials": "E-Mail oder Passwort ist falsch.",
  "Email not confirmed": "Bitte bestätige zuerst deine E-Mail-Adresse.",
  "User already registered": "Diese E-Mail-Adresse ist bereits registriert.",
  "Password should be at least 6 characters":
    "Das Passwort muss mindestens 6 Zeichen haben.",
};

function toGerman(message: string): string {
  return (
    GERMAN_ERRORS[message] ??
    "Etwas hat nicht geklappt. Bitte versuche es nochmal."
  );
}

// ─── Password validation ──────────────────────────────────────────────────────

const SPECIAL_CHARS = /[!@#$%^&*]/;

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("Das Passwort muss mindestens 8 Zeichen haben.");
  if (!/[A-Z]/.test(pw)) errors.push("Das Passwort muss mindestens einen Großbuchstaben enthalten.");
  if (!/[0-9]/.test(pw)) errors.push("Das Passwort muss mindestens eine Zahl enthalten.");
  if (!SPECIAL_CHARS.test(pw)) errors.push("Das Passwort muss mindestens ein Sonderzeichen enthalten (!@#$%^&*).");
  return errors;
}

type Strength = "weak" | "medium" | "strong";

function getPasswordStrength(pw: string): Strength | null {
  if (!pw) return null;
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), SPECIAL_CHARS.test(pw)].filter(Boolean).length;
  if (checks <= 1) return "weak";
  if (checks <= 3) return "medium";
  return "strong";
}

const STRENGTH_LABEL: Record<Strength, string> = { weak: "Schwach", medium: "Mittel", strong: "Stark" };
const STRENGTH_COLOR: Record<Strength, string> = { weak: "bg-red-400", medium: "bg-yellow-400", strong: "bg-green-500" };
const STRENGTH_WIDTH: Record<Strength, string> = { weak: "w-1/3", medium: "w-2/3", strong: "w-full" };

const BUNDESLAENDER = [
  "Bayern", "Baden-Württemberg", "Berlin", "Brandenburg", "Bremen",
  "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
  "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
  "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register extra fields
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [rolle, setRolle] = useState<"kind" | "elternteil">("kind");
  const [klasse, setKlasse] = useState<1 | 2 | 3 | 4>(2);
  const [bundesland, setBundesland] = useState("Bayern");
  const [dsgvo, setDsgvo] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = mode === "register" ? getPasswordStrength(password) : null;
  const passwordErrors = mode === "register" && password ? validatePassword(password) : [];

  function switchMode(next: "login" | "register" | "forgot") {
    setMode(next);
    setError("");
    setInfo("");
    setPassword("");
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }
    setLoading(true);
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset`
        : "/auth/reset";
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );
    setLoading(false);
    if (resetError) {
      setError(toGerman(resetError.message));
    } else {
      setInfo(
        "Wir haben dir einen Link zum Zurücksetzen geschickt. Bitte schau in deinem Postfach nach!",
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "register") {
      if (!vorname.trim()) { setError("Bitte gib deinen Vornamen ein."); return; }
      if (!nachname.trim()) { setError("Bitte gib deinen Nachnamen ein."); return; }
      if (!dsgvo) { setError("Bitte akzeptiere die Datenschutzerklärung."); return; }
      const pwErrors = validatePassword(password);
      if (pwErrors.length > 0) { setError(pwErrors[0] ?? "Ungültiges Passwort."); return; }
    }

    setLoading(true);

    if (mode === "login") {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError(toGerman(loginError.message));
      } else {
        router.push("/");
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            vorname: vorname.trim(),
            nachname: nachname.trim(),
            rolle,
            bundesland,
          },
        },
      });

      if (signUpError) {
        setError(toGerman(signUpError.message));
      } else {
        // If the user got a session (email confirmation disabled), save klasse
        if (data.session && rolle === "kind") {
          await supabase.from("profiles").upsert({ id: data.user!.id, klasse });
        }
        setInfo(
          "Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte schau in deinem Postfach nach!",
        );
      }
    }

    setLoading(false);
  }

  // ── Forgot-password view ────────────────────────────────────────────────────
  if (mode === "forgot") {
    return (
      <div className="mx-auto max-w-sm px-4 py-10">
        <div className="text-center mb-8">
          <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">🦊</div>
          <h2 className="text-3xl font-black text-fox">Passwort vergessen?</h2>
          <p className="mt-1 text-gray-500">
            Gib deine E-Mail-Adresse ein
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-4">
            Wir schicken dir einen Link zum Zurücksetzen deines Passworts.
          </p>
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-bold text-gray-500 mb-1">
                E-Mail-Adresse
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@beispiel.de"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold focus:border-fox focus:outline-none"
              />
            </div>
            {error && (
              <div role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base font-bold text-red-700">
                ⚠️ {error}
              </div>
            )}
            {info && (
              <div role="status" className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-base font-bold text-green-700">
                ✅ {info}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Bitte warten …" : "Link senden →"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 text-center"
          >
            ← Zurück zum Anmelden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">🦊</div>
        <h2 className="text-3xl font-black text-fox">
          {mode === "login" ? "Willkommen zurück!" : "Konto erstellen"}
        </h2>
        <p className="mt-1 text-gray-500">
          {mode === "login" ? "Melde dich an und lern weiter!" : "Erstelle ein kostenloses Konto!"}
        </p>
      </div>

      <div className="card">
        {/* Mode toggle */}
        <div className="flex rounded-2xl bg-amber-50 p-1 mb-6 gap-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={["flex-1 rounded-xl py-2 text-base font-bold transition-all",
              mode === "login" ? "bg-fox text-white shadow" : "text-gray-400 hover:text-gray-600"].join(" ")}
          >
            Anmelden
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={["flex-1 rounded-xl py-2 text-base font-bold transition-all",
              mode === "register" ? "bg-fox text-white shadow" : "text-gray-400 hover:text-gray-600"].join(" ")}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Register-only: Name fields */}
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Vorname *</label>
                <input
                  type="text"
                  value={vorname}
                  onChange={(e) => setVorname(e.target.value)}
                  required
                  placeholder="Emma"
                  className="w-full rounded-2xl border-2 border-gray-200 px-3 py-3 text-base font-bold focus:border-fox focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Nachname *</label>
                <input
                  type="text"
                  value={nachname}
                  onChange={(e) => setNachname(e.target.value)}
                  required
                  placeholder="Müller"
                  className="w-full rounded-2xl border-2 border-gray-200 px-3 py-3 text-base font-bold focus:border-fox focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-500 mb-1">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@beispiel.de"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold focus:border-fox focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-500 mb-1">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold focus:border-fox focus:outline-none"
            />

            {mode === "register" && password && strength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Passwortstärke</span>
                  <span className={`text-xs font-bold ${strength === "strong" ? "text-green-600" : strength === "medium" ? "text-yellow-600" : "text-red-500"}`}>
                    {STRENGTH_LABEL[strength]}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLOR[strength]} ${STRENGTH_WIDTH[strength]}`} />
                </div>
              </div>
            )}

            {mode === "register" && password && passwordErrors.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {[
                  { check: password.length >= 8, label: "Mindestens 8 Zeichen" },
                  { check: /[A-Z]/.test(password), label: "Einen Großbuchstaben" },
                  { check: /[0-9]/.test(password), label: "Eine Zahl" },
                  { check: SPECIAL_CHARS.test(password), label: "Ein Sonderzeichen (!@#$%^&*)" },
                ].map(({ check, label }) => (
                  <li key={label} className={`text-xs flex items-center gap-1.5 ${check ? "text-green-600" : "text-gray-400"}`}>
                    <span>{check ? "✓" : "○"}</span>
                    {label}
                  </li>
                ))}
              </ul>
            )}

            {mode === "login" && (
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-gray-400 hover:text-fox underline"
                >
                  Passwort vergessen?
                </button>
              </div>
            )}
          </div>

          {/* Register-only: Role */}
          {mode === "register" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">Ich bin …</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["kind", "elternteil"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRolle(r)}
                      className={`rounded-2xl border-2 py-3 font-black transition-all ${
                        rolle === r ? "border-fox bg-fox-light text-fox" : "border-gray-200 hover:border-fox/50"
                      }`}
                    >
                      {r === "kind" ? "🧒 Ein Kind" : "👪 Ein Elternteil"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Klasse — only shown for Kinder */}
              {rolle === "kind" && (
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Meine Klasse</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([1, 2, 3, 4] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKlasse(k)}
                        className={`rounded-2xl border-2 py-3 font-black transition-all ${
                          klasse === k ? "border-fox bg-fox-light text-fox" : "border-gray-200 hover:border-fox/50"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bundesland */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Bundesland</label>
                <select
                  value={bundesland}
                  onChange={(e) => setBundesland(e.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-base font-bold focus:border-fox focus:outline-none bg-white"
                >
                  {BUNDESLAENDER.map((bl) => (
                    <option key={bl} value={bl}>{bl}</option>
                  ))}
                </select>
              </div>

              {/* DSGVO */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dsgvo}
                  onChange={(e) => setDsgvo(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-fox shrink-0"
                />
                <span className="text-sm text-gray-600">
                  Ich akzeptiere die{" "}
                  <a href="/datenschutz" className="text-fox underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                    Datenschutzerklärung
                  </a>{" "}
                  (DSGVO). *
                </span>
              </label>
            </>
          )}

          {/* Error / Info */}
          {error && (
            <div role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base font-bold text-red-700">
              ⚠️ {error}
            </div>
          )}
          {info && (
            <div role="status" className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-base font-bold text-green-700">
              ✅ {info}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Bitte warten …" : mode === "login" ? "Anmelden →" : "Konto erstellen →"}
          </button>
        </form>
      </div>
    </div>
  );
}
