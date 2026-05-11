"use client";

import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-fox px-4 py-3 shadow-md">
      <span className="text-3xl" role="img" aria-label="Fuchs">
        🦊
      </span>
      <h1 className="text-xl font-black text-white tracking-wide">Schreibfix</h1>
      {user && (
        <button
          onClick={handleLogout}
          className="ml-auto rounded-xl bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/30 transition-colors"
        >
          Abmelden
        </button>
      )}
    </header>
  );
}
