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

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setInfo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
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
          "Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte schau in deinem Postfach nach!"
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
              className="rounded-2xl border-2 border-forest bg-forest-light px-4 py-3
                         text-base font-bold text-forest-dark"
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
