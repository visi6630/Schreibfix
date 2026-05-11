"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  if (pw.length < 8)
    errors.push("Das Passwort muss mindestens 8 Zeichen haben.");
  if (!/[A-Z]/.test(pw))
    errors.push("Das Passwort muss mindestens einen Großbuchstaben enthalten.");
  if (!/[0-9]/.test(pw))
    errors.push("Das Passwort muss mindestens eine Zahl enthalten.");
  if (!SPECIAL_CHARS.test(pw))
    errors.push(
      "Das Passwort muss mindestens ein Sonderzeichen enthalten (!@#$%^&*).",
    );
  return errors;
}

type Strength = "weak" | "medium" | "strong";

function getPasswordStrength(pw: string): Strength | null {
  if (!pw) return null;
  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    SPECIAL_CHARS.test(pw),
  ].filter(Boolean).length;
  if (checks <= 1) return "weak";
  if (checks <= 3) return "medium";
  return "strong";
}

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Schwach",
  medium: "Mittel",
  strong: "Stark",
};

const STRENGTH_COLOR: Record<Strength, string> = {
  weak: "bg-red-400",
  medium: "bg-yellow-400",
  strong: "bg-green-500",
};

const STRENGTH_WIDTH: Record<Strength, string> = {
  weak: "w-1/3",
  medium: "w-2/3",
  strong: "w-full",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = mode === "register" ? getPasswordStrength(password) : null;
  const passwordErrors =
    mode === "register" && password ? validatePassword(password) : [];

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setInfo("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "register") {
      const errors = validatePassword(password);
      if (errors.length > 0) {
        setError(errors[0] ?? "Ungültiges Passwort.");
        return;
      }
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(toGerman(error.message));
      } else {
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(toGerman(error.message));
      } else {
        setInfo(
          "Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte schau in deinem Postfach nach!",
        );
      }
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">
          🦊
        </div>
        <h2 className="text-3xl font-black text-fox">
          {mode === "login" ? "Willkommen zurück!" : "Konto erstellen"}
        </h2>
        <p className="mt-1 text-gray-500">
          {mode === "login"
            ? "Melde dich an und lern weiter!"
            : "Erstelle ein kostenloses Konto!"}
        </p>
      </div>

      <div className="card">
        {/* Mode toggle */}
        <div className="flex rounded-2xl bg-amber-50 p-1 mb-6 gap-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={[
              "flex-1 rounded-xl py-2 text-base font-bold transition-all",
              mode === "login"
                ? "bg-fox text-white shadow"
                : "text-gray-400 hover:text-gray-600",
            ].join(" ")}
          >
            Anmelden
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={[
              "flex-1 rounded-xl py-2 text-base font-bold transition-all",
              mode === "register"
                ? "bg-fox text-white shadow"
                : "text-gray-400 hover:text-gray-600",
            ].join(" ")}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-gray-500 mb-1"
            >
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
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold
                         focus:border-fox focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-500 mb-1"
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="••••••••"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold
                         focus:border-fox focus:outline-none"
            />

            {/* Password strength indicator (register only) */}
            {mode === "register" && password && strength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Passwortstärke</span>
                  <span
                    className={`text-xs font-bold ${
                      strength === "strong"
                        ? "text-green-600"
                        : strength === "medium"
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {STRENGTH_LABEL[strength]}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLOR[strength]} ${STRENGTH_WIDTH[strength]}`}
                  />
                </div>
              </div>
            )}

            {/* Password requirements list (register only) */}
            {mode === "register" && password && passwordErrors.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {[
                  { check: password.length >= 8, label: "Mindestens 8 Zeichen" },
                  { check: /[A-Z]/.test(password), label: "Einen Großbuchstaben" },
                  { check: /[0-9]/.test(password), label: "Eine Zahl" },
                  { check: SPECIAL_CHARS.test(password), label: "Ein Sonderzeichen (!@#$%^&*)" },
                ].map(({ check, label }) => (
                  <li
                    key={label}
                    className={`text-xs flex items-center gap-1.5 ${
                      check ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <span>{check ? "✓" : "○"}</span>
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3
                         text-base font-bold text-red-700"
            >
              ⚠️ {error}
            </div>
          )}

          {info && (
            <div
              role="status"
              className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3
                         text-base font-bold text-green-700"
            >
              ✅ {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading
              ? "Bitte warten …"
              : mode === "login"
              ? "Anmelden →"
              : "Konto erstellen →"}
          </button>
        </form>
      </div>
    </div>
  );
}
