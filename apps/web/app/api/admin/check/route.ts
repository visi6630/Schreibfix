import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[admin/check] No Authorization header");
    return NextResponse.json({ isAdmin: false, error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  console.log("[admin/check] Token received, length:", token.length);

  const adminClient = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);

  if (authError || !user) {
    console.log("[admin/check] Auth error:", authError?.message ?? "no user");
    return NextResponse.json(
      { isAdmin: false, error: authError?.message ?? "Invalid token" },
      { status: 401 },
    );
  }

  console.log("[admin/check] Verified user:", user.email, "id:", user.id);

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, email, klasse, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[admin/check] Profile query error:", profileError.message);
    return NextResponse.json({ isAdmin: false, error: profileError.message });
  }

  console.log("[admin/check] Profile found:", profile);

  return NextResponse.json({
    isAdmin: profile?.is_admin === true,
    userId: user.id,
    email: user.email,
    profile: profile ?? null,
  });
}
