"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// ─── Grade selector overlay ───────────────────────────────────────────────────

function GradeSelector({ onSelect }: { onSelect: (klasse: number) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-50 px-8 text-center">
      <div className="text-7xl mb-4">🦊</div>
      <h2 className="text-3xl font-black text-fox mb-2">Hallo! Ich bin der Schreibfix.</h2>
      <p className="text-lg text-gray-600 mb-8">In welche Klasse gehst du?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4].map((k) => (
          <button
            key={k}
            onClick={() => onSelect(k)}
            className="btn-primary text-2xl py-6 rounded-3xl"
          >
            Klasse {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Home cards ───────────────────────────────────────────────────────────────

const cards = [
  {
    href: "/diktat",
    icon: "🎙️",
    title: "Diktat",
    desc: "Hör zu und schreib nach!",
    color: "bg-fox-light border-fox",
  },
  {
    href: "/uebungen",
    icon: "✏️",
    title: "Übungen",
    desc: "Rechtschreibung & Grammatik",
    color: "bg-forest-light border-forest",
  },
  {
    href: "/lesen",
    icon: "📖",
    title: "Lesen",
    desc: "Texte lesen & verstehen",
    color: "bg-blue-50 border-blue-300",
  },
  {
    href: "/fortschritt",
    icon: "⭐",
    title: "Fortschritt",
    desc: "Deine Punkte & Sterne",
    color: "bg-amber-100 border-amber-400",
  },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export function HomeClient() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [klasse, setKlasse] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    void supabase
      .from("profiles")
      .select("klasse")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setKlasse(data?.klasse ?? null);
        setProfileLoading(false);
      });
  }, [user]);

  const handleGradeSelect = async (k: number) => {
    setKlasse(k);
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, klasse: k });
    }
  };

  // Show grade selector only when logged in and klasse not set yet
  const showSelector =
    !authLoading && !profileLoading && user !== null && klasse === null;

  return (
    <>
      {showSelector && <GradeSelector onSelect={handleGradeSelect} />}

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-8 text-center">
          <div className="text-7xl mb-3" role="img" aria-label="Schreibfix">
            🦊
          </div>
          <h2 className="text-3xl font-black text-fox">
            Hallo! Ich bin der Schreibfix.
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Was möchtest du heute lernen?
          </p>
          {klasse !== null && (
            <span className="mt-3 inline-block bg-fox text-white font-bold px-4 py-1 rounded-full text-sm">
              Klasse {klasse}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {cards.map(({ href, icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className={`card flex items-center gap-5 border-2 transition-transform
                active:scale-95 hover:-translate-y-0.5 ${color}`}
            >
              <span className="text-5xl" role="img" aria-hidden="true">
                {icon}
              </span>
              <div>
                <p className="text-xl font-black">{title}</p>
                <p className="text-base text-gray-600">{desc}</p>
              </div>
              <span className="ml-auto text-2xl text-gray-300">›</span>
            </Link>
          ))}
        </div>

        {klasse !== null && user && (
          <p className="text-center text-sm text-gray-400 mt-6">
            <button
              onClick={() => setKlasse(null)}
              className="underline hover:text-fox"
            >
              Klasse ändern
            </button>
          </p>
        )}

        <div className="mt-10 text-center flex justify-center gap-5">
          <Link href="/eltern" className="text-xs text-gray-300 hover:text-gray-400 underline">
            Elternportal
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-xs text-gray-300 hover:text-gray-400 underline">
              Admin
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
