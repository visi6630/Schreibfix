"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FeatureKey } from "@schreibfix/core";

const FEATURE_LABELS: Partial<Record<FeatureKey, string>> = {
  aiDiktat: "KI-Diktat",
  aiUebungen: "KI-Übungen",
  lesen: "Leseübungen",
  elevenlabsTTS: "Bessere Stimme",
  exportProgress: "Fortschritt exportieren",
  teacherDashboard: "Lehrer-Dashboard",
};

interface Plan {
  id: "free" | "plus" | "pro";
  name: string;
  price: string;
  yearlyPrice?: string;
  yearlyLabel?: string;
  color: string;
  badge?: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "KOSTENLOS",
    price: "€0",
    color: "border-gray-200 bg-gray-50",
    features: [
      "✓ Alle 20 Diktat-Lektionen",
      "✓ Alle 9 Übungsarten",
      "✓ 1 Kind",
      "✓ Fortschritt verfolgen",
    ],
  },
  {
    id: "plus",
    name: "PLUS",
    price: "€2,99/Mo",
    yearlyPrice: "€24,99/Jahr",
    yearlyLabel: "spare 2 Monate",
    color: "border-blue-300 bg-blue-50",
    features: [
      "✓ Alles in Kostenlos",
      "✓ 4 Kinder",
      "✓ Leseübungen 📖",
      "✓ Fortschritt exportieren",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    price: "€3,99/Mo",
    yearlyPrice: "€35,99/Jahr",
    yearlyLabel: "spare 2 Monate",
    color: "border-orange-300 bg-orange-50",
    badge: "Beliebt",
    features: [
      "✓ Alles in Plus",
      "✓ KI-Übungen 🤖",
      "✓ KI-Diktat 🤖",
      "✓ Bessere Stimme 🔊",
      "✓ Leseanalyse",
    ],
  },
];

interface PaywallModalProps {
  feature: FeatureKey;
  onClose: () => void;
  onTrialStart: () => void;
}

export function PaywallModal({ feature, onClose, onTrialStart }: PaywallModalProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const featureLabel = FEATURE_LABELS[feature] ?? "Diese Funktion";

  const handleStartTrial = async () => {
    setStarting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Nicht eingeloggt");

      const res = await fetch("/api/subscription/start-trial", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setError("Du hast die Testphase bereits genutzt.");
        return;
      }
      if (!res.ok) throw new Error("Fehler beim Starten");

      setStarted(true);
      onTrialStart();
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler aufgetreten");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <div className="text-6xl mb-3">🦊</div>
          <h2 className="text-2xl font-black text-gray-800 leading-tight">
            Diese Funktion ist in Schreibfix Pro! 🚀
          </h2>
          <p className="text-gray-500 mt-2 text-base">
            <span className="font-bold text-fox">{featureLabel}</span> ist ab dem Pro-Tarif verfügbar.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-3 gap-3 px-4 pb-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 p-3 relative ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="bg-fox text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              <p className="font-black text-xs text-gray-500 mb-1">{plan.name}</p>
              <p className="font-black text-lg text-gray-800 leading-tight">{plan.price}</p>
              {plan.yearlyPrice && (
                <p className="text-xs text-gray-400 mb-2">
                  {plan.yearlyPrice} ({plan.yearlyLabel})
                </p>
              )}
              <div className="space-y-1 mt-2">
                {plan.features.map((f) => (
                  <p key={f} className="text-xs text-gray-600 leading-snug">
                    {f}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 text-center">
          {started ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <p className="text-green-700 font-black text-lg">🎉 Testphase gestartet!</p>
              <p className="text-green-600 text-sm mt-1">Du hast jetzt 7 Tage Pro kostenlos.</p>
            </div>
          ) : (
            <>
              {error && (
                <p className="text-red-500 text-sm mb-3 font-bold">{error}</p>
              )}
              <button
                onClick={() => { void handleStartTrial(); }}
                disabled={starting}
                className="btn-primary w-full text-lg mb-3 disabled:opacity-60 disabled:cursor-wait"
              >
                {starting ? "⏳ Wird gestartet…" : "7 Tage kostenlos testen 🚀"}
              </button>
              <p className="text-xs text-gray-400 mb-4">
                Kein Kreditkarte erforderlich · Jederzeit kündbar
              </p>
            </>
          )}
          <button
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Vielleicht später
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Pro ab €3,99/Mo · Plus ab €2,99/Mo
          </p>
        </div>
      </div>
    </div>
  );
}
