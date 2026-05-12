import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ isAdmin: false, error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  // Verify JWT using anon client — works regardless of whether service role key is set
  const verifier = createClient(SUPABASE_URL, ANON_KEY);
  const {
    data: { user },
    error: jwtError,
  } = await verifier.auth.getUser(token);

  if (jwtError || !user) {
    return NextResponse.json(
      { isAdmin: false, error: jwtError?.message ?? "Invalid token" },
      { status: 401 },
    );
  }

  // Query profiles — prefer service role key (bypasses RLS entirely).
  // Falls back to user-context query if service role key not configured;
  // that path requires an RLS policy: USING (auth.uid() = id)
  const useServiceRole = SERVICE_ROLE_KEY.length > 10;
  const queryClient = useServiceRole
    ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    : createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

  const { data: profile, error: profileError } = await queryClient
    .from("profiles")
    .select("id, email, klasse, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ isAdmin: false, error: profileError.message });
  }

  return NextResponse.json({
    isAdmin: profile?.is_admin === true,
    userId: user.id,
    email: user.email,
    profile: profile ?? null,
  });
}
