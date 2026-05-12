import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  // Verify JWT
  const verifier = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: jwtError } = await verifier.auth.getUser(token);
  if (jwtError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    vorname: string | null;
    nachname: string | null;
    klasse: number | null;
    avatar: string;
  };

  // Use service role key — bypasses RLS so INSERT and UPDATE both work
  // even if the profile row doesn't exist yet (no trigger ran at signup)
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await adminClient
    .from("profiles")
    .upsert(
      {
        id: user.id,
        vorname: body.vorname,
        nachname: body.nachname,
        klasse: body.klasse,
        avatar: body.avatar,
      },
      { onConflict: "id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
