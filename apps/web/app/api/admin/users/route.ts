import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function verifyAdmin(token: string): Promise<boolean> {
  const verifier = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error } = await verifier.auth.getUser(token);
  if (error || !user) return false;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.is_admin === true;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.length < 10) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
  }

  const isAdmin = await verifyAdmin(token);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch all auth users (paginated — listUsers returns up to 1000)
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("id, vorname, nachname, klasse, is_admin, xp, created_at, last_seen");
  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const users = authData.users.map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      vorname: profile?.vorname ?? null,
      nachname: profile?.nachname ?? null,
      klasse: profile?.klasse ?? null,
      is_admin: profile?.is_admin ?? false,
      xp: profile?.xp ?? 0,
      registered_at: u.created_at,
      last_seen: profile?.last_seen ?? null,
    };
  });

  return NextResponse.json({ users });
}
