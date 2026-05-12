"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthCtx = { user: User | null; loading: boolean; isAdmin: boolean };
const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAdmin: false,
});

function updateLastSeen(userId: string, email?: string | null): void {
  void supabase.from("profiles").upsert(
    { id: userId, email: email ?? null, last_seen: new Date().toISOString() },
    { onConflict: "id", ignoreDuplicates: false },
  );
}

async function loadAdminFlag(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error) console.warn("loadAdminFlag error:", error.message);
  return (data as { is_admin: boolean } | null)?.is_admin === true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Initial session check — await admin flag so loading: false only when fully resolved
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) {
        updateLastSeen(u.id, u.email);
        const admin = await loadAdminFlag(u.id);
        setIsAdmin(admin);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
      } else {
        updateLastSeen(u.id, u.email);
        void loadAdminFlag(u.id).then(setIsAdmin);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
