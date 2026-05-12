"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SPECIAL_CHARS = /[!@#$%^&*]/;

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("Das Passwort muss mindestens 8 Zeichen haben.");
  if (!/[A-Z]/.test(pw)) errors.push("Das Passwort muss mindestens einen Großbuchstaben enthalten.");
  if (!/[0-9]/.test(pw)) errors.push("Das Passwort muss mindestens eine Zahl enthalten.");
  if (!SPECIAL_CHARS.test(pw)) errors.push("Das Passwort muss mindestens ein Sonderzeichen enthalten (!@#$%^&*).");
  return errors;
}

type Status = "loading" | "ready" | "success" | "error";

export default function ResetPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Handle PKCE code-based reset link (?code=...)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (err) {
          setError("Ungültiger oder abgelaufener Link. Bitte fordere einen neuen an.");
          setStatus("error");
        } else {
          setStatus("ready");
        }
      });
      return;
    }

    // Handle hash-based token (legacy Supabase flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setStatus("ready");
        }
      },
    );

    // If no code and no PASSWORD_RECOVERY after 3s, assume bad link
    const timeout = setTimeout(() => {
      setStatus((prev) => {
        if (prev === "loading") {
          setError("Ungültiger oder abgelaufener Link. Bitte fordere einen neuen an.");
          return "error";
        }
        return prev;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) {
      setError(pwErrors[0] ?? "Ungültiges Passwort.");
      return;
    }
    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setStatus("success");
      setTimeout(() => router.replace("/auth"), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">🦊</div>
        <h2 className="text-3xl font-black text-fox">Neues Passwort festlegen</h2>
      </div>

      <div className="card">
        {status === "loading" && (
          <p className="text-gray-400 text-center py-6">Link wird überprüft…</p>
        )}

        {status === "error" && (
          <div className="flex flex-col gap-4">
            <div role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base font-bold text-red-700">
              ⚠️ {error}
            </div>
            <a href="/auth" className="btn-primary w-full text-center mt-2">
              Zurück zum Anmelden
            </a>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col gap-4 text-center">
            <div role="status" className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-base font-bold text-green-700">
              ✅ Passwort erfolgreich geändert!
            </div>
            <p className="text-sm text-gray-400">
              Du wirst gleich weitergeleitet…
            </p>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-bold text-gray-500 mb-1">
                Neues Passwort
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-bold focus:border-fox focus:outline-none"
              />
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
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold text-gray-500 mb-1">
                Passwort bestätigen
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-2xl border-2 px-4 py-3 text-lg font-bold focus:outline-none ${
                  confirm && password !== confirm
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200 focus:border-fox"
                }`}
              />
              {confirm && password !== confirm && (
                <p className="mt-1 text-xs text-red-500">Die Passwörter stimmen nicht überein.</p>
              )}
            </div>

            {error && (
              <div role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base font-bold text-red-700">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? "Bitte warten …" : "Passwort speichern →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
