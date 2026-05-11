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

async function loadAdminFlag(userId: string, email?: string | null): Promise<boolean> {
  // Upsert email + last_seen without touching klasse/is_admin
  void supabase.from("profiles").upsert(
    { id: userId, email: email ?? null, last_seen: new Date().toISOString() },
    { onConflict: "id" },
  );
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return (data as { is_admin: boolean } | null)?.is_admin ?? false;
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
        const admin = await loadAdminFlag(u.id, u.email);
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
        // Fire-and-forget: update profile and refresh admin flag
        void loadAdminFlag(u.id, u.email).then(setIsAdmin);
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
