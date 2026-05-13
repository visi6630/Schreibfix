"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/components/SubscriptionProvider";
import { BackButton } from "@/components/BackButton";

interface PlanDef {
  id: "free" | "plus" | "pro" | "school";
  name: string;
  monthlyPrice: string;
  yearlyPrice?: string;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  monthlyPlanKey?: string;
  yearlyPlanKey?: string;
  highlight?: boolean;
  schoolContact?: boolean;
  features: string[];
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Kostenlos",
    monthlyPrice: "€0",
    features: [
      "✓ Alle 20 Diktat-Lektionen",
      "✓ Alle 9 Übungsarten",
      "✓ 1 Kind",
      "✓ Fortschritt verfolgen",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthlyPrice: "€2,99/Mo",
    yearlyPrice: "€24,99/Jahr",
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PLUS_MONTHLY ?? "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PLUS_YEARLY ?? "",
    monthlyPlanKey: "plus_monthly",
    yearlyPlanKey: "plus_yearly",
    features: [
      "✓ Alles in Kostenlos",
      "✓ Bis zu 4 Kinder",
      "✓ Leseübungen 📖",
      "✓ Fortschritt exportieren",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "€3,99/Mo",
    yearlyPrice: "€35,99/Jahr",
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY ?? "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY ?? "",
    monthlyPlanKey: "pro_monthly",
    yearlyPlanKey: "pro_yearly",
    highlight: true,
    features: [
      "✓ Alles in Plus",
      "✓ KI-Diktat 🤖",
      "✓ KI-Übungen 🤖",
      "✓ Bessere Stimme 🔊",
      "✓ Leseanalyse",
      "✓ 7 Tage kostenlos testen",
    ],
  },
  {
    id: "school",
    name: "Schule",
    monthlyPrice: "€49,99/Mo",
    schoolContact: true,
    features: [
      "✓ Bis zu 35 Schüler",
      "✓ Lehrer-Dashboard",
      "✓ Alle Pro-Features",
      "✓ Klassen-Fortschritt",
      "✓ Prioritäts-Support",
    ],
  },
];

export function SubscriptionClient() {
  const { tier, status, trialDaysRemaining, subscription } = useSubscription();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [paypalLoading, setPaypalLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isCurrent = (planId: string) => tier === planId;

  async function handleStripeCheckout(plan: PlanDef) {
    const priceId = billing === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId;
    if (!priceId) {
      setError("Stripe nicht konfiguriert. Bitte kontaktiere uns.");
      return;
    }

    setLoading(plan.id);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/auth"); return; }

      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, tier: plan.id }),
      });

      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Fehler");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler aufgetreten");
      setLoading(null);
    }
  }

  async function handlePayPalCheckout(plan: PlanDef) {
    const planKey = billing === "yearly" ? plan.yearlyPlanKey : plan.monthlyPlanKey;
    if (!planKey) return;

    setPaypalLoading(plan.id);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/auth"); return; }

      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planKey }),
      });

      const json = (await res.json()) as { approvalUrl?: string; error?: string };
      if (!res.ok || !json.approvalUrl) throw new Error(json.error ?? "PayPal-Fehler");
      window.location.href = json.approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayPal-Fehler");
      setPaypalLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <BackButton href="/" />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🦊</div>
          <h1 className="text-3xl font-black text-gray-800">Pläne & Preise</h1>
          <p className="text-gray-500 mt-2">Wähle den passenden Plan für deine Familie</p>
        </div>

        {/* Current subscription status */}
        {tier !== "free" && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-center">
            <p className="font-bold text-orange-700">
              Aktuelles Abo: <span className="uppercase">{tier}</span>
              {" · "}
              <span className="capitalize">{status}</span>
              {status === "trialing" && trialDaysRemaining > 0 && (
                <span> · Noch {trialDaysRemaining} Tage Testphase</span>
              )}
            </p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full border border-gray-200 p-1 flex gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                billing === "monthly"
                  ? "bg-fox text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                billing === "yearly"
                  ? "bg-fox text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Jährlich
              <span className="ml-1 text-xs bg-green-100 text-green-700 rounded-full px-1.5 py-0.5">
                -17%
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center text-red-700 font-bold text-sm">
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl border-2 p-5 flex flex-col relative ${
                plan.highlight
                  ? "border-fox shadow-lg shadow-orange-100"
                  : "border-gray-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-fox text-white text-xs font-black px-3 py-1 rounded-full">
                    Beliebt
                  </span>
                </div>
              )}

              <h2 className="font-black text-lg text-gray-800 mb-1">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-2xl font-black text-gray-900">
                  {billing === "yearly" && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {billing === "yearly" && plan.yearlyPrice && (
                  <p className="text-xs text-gray-400 mt-0.5">statt {plan.monthlyPrice} × 12</p>
                )}
              </div>

              <ul className="space-y-1.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600">
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <div className="text-center text-xs text-gray-400 font-bold py-2">
                  Dein aktueller Plan
                </div>
              ) : plan.schoolContact ? (
                <a
                  href="mailto:schule@schreibfix.de"
                  className="btn-secondary text-center text-sm w-full block"
                >
                  Kontakt aufnehmen
                </a>
              ) : isCurrent(plan.id) ? (
                <div className="text-center text-xs text-green-600 font-black py-2">
                  ✓ Aktueller Plan
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => { void handleStripeCheckout(plan); }}
                    disabled={loading === plan.id}
                    className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-wait"
                  >
                    {loading === plan.id ? "⏳ Wird geladen…" : "Mit Karte zahlen"}
                  </button>
                  <button
                    onClick={() => { void handlePayPalCheckout(plan); }}
                    disabled={paypalLoading === plan.id}
                    className="w-full py-2 px-4 rounded-xl font-bold text-sm border-2 border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition-colors disabled:opacity-60"
                  >
                    {paypalLoading === plan.id ? "⏳ PayPal…" : "Mit PayPal zahlen"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active subscription management */}
        {subscription.stripe_subscription_id && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Abo verwalten, Zahlungsdaten ändern oder kündigen:
            </p>
            <button
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) return;
                const res = await fetch("/api/stripe/portal", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const json = (await res.json()) as { url?: string };
                if (json.url) window.location.href = json.url;
              }}
              className="btn-secondary"
            >
              Abo verwalten (Stripe)
            </button>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-black text-gray-700 mb-3">Häufige Fragen</h3>
          {[
            {
              q: "Kann ich jederzeit kündigen?",
              a: "Ja, du kannst jederzeit kündigen. Dein Abo läuft bis zum Ende des bezahlten Zeitraums.",
            },
            {
              q: "Was passiert nach der Testphase?",
              a: "Nach 7 Tagen wirst du automatisch auf den kostenlosen Plan zurückgesetzt — es sei denn, du hast ein Abo abgeschlossen.",
            },
            {
              q: "Wie kann ich die Klasse für die Schullizenz bestellen?",
              a: "Schreib uns an schule@schreibfix.de — wir richten eine individuelle Schullizenz für euch ein.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="font-bold text-gray-800 text-sm">{q}</p>
              <p className="text-gray-500 text-sm mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
