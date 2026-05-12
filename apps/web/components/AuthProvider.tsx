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

async function loadAdminFlag(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch("/api/check-admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { isAdmin: boolean };
    return data.isAdmin === true;
  } catch (e) {
    console.warn("loadAdminFlag error:", e);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      const token = data.session?.access_token;
      setUser(u);
      if (u && token) {
        updateLastSeen(u.id, u.email);
        const admin = await loadAdminFlag(token);
        setIsAdmin(admin);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      const token = session?.access_token;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
      } else {
        updateLastSeen(u.id, u.email);
        if (token) {
          void loadAdminFlag(token).then(setIsAdmin);
        }
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
