import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ isAdmin: false, error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const admin = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await admin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ isAdmin: false, error: "Invalid token" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email, klasse, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[check-admin] profile query error:", profileError.message);
    return NextResponse.json({ isAdmin: false });
  }

  console.log("[check-admin] profile for", user.email, ":", profile);

  return NextResponse.json({
    isAdmin: profile?.is_admin === true,
    profile: profile ?? null,
  });
}
