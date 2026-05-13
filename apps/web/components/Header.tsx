"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [vorname, setVorname] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("vorname")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.vorname) setVorname(data.vorname as string);
      });
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/auth");
  }

  const initial = vorname ? vorname[0]!.toUpperCase() : null;

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-fox px-4 py-3 shadow-md">
      <span className="text-3xl" role="img" aria-label="Fuchs">
        🦊
      </span>
      <h1 className="text-xl font-black text-white tracking-wide">Schreibfix</h1>
      {user && (
        <div className="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white font-black text-sm hover:bg-white/30 transition-colors"
            aria-label="Profil-Menü öffnen"
          >
            {initial ?? "🦊"}
          </button>
          {open && (
            <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-40 z-40">
              <Link
                href="/profil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-fox transition-colors"
              >
                👤 Mein Profil
              </Link>
              <button
                onClick={() => { void handleLogout(); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-fox transition-colors"
              >
                🚪 Abmelden
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
