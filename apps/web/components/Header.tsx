"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [avatar, setAvatar] = useState("🦊");
  const [vorname, setVorname] = useState("");

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("avatar, vorname")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          if (data.avatar) setAvatar(data.avatar as string);
          if (data.vorname) setVorname(data.vorname as string);
        }
      });
  }, [user]);

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
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/profil"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/30 transition-colors"
          >
            <span>{avatar}</span>
            {vorname ? (
              <span className="hidden sm:inline max-w-[80px] truncate">{vorname}</span>
            ) : (
              <span className="hidden sm:inline">Profil</span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/30 transition-colors"
          >
            Abmelden
          </button>
        </div>
      )}
    </header>
  );
}
