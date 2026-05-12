import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const serviceRoleConfigured = serviceRoleKey.length > 10;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({
      serviceRoleConfigured,
      error: "No Authorization header — are you logged in?",
    });
  }
  const token = authHeader.slice(7);

  // 1. Verify JWT with anon client (works regardless of service role key)
  const anonClient = createClient(url, anonKey);
  const {
    data: { user },
    error: jwtError,
  } = await anonClient.auth.getUser(token);

  if (jwtError || !user) {
    return NextResponse.json({
      serviceRoleConfigured,
      jwtError: jwtError?.message ?? "getUser returned null",
      userId: null,
      email: null,
    });
  }

  const result: Record<string, unknown> = {
    serviceRoleConfigured,
    userId: user.id,
    email: user.email,
    jwtOk: true,
  };

  // 2. Query profile with user-context client (subject to RLS)
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: profileViaRls, error: rlsError } = await userClient
    .from("profiles")
    .select("id, email, is_admin, klasse")
    .eq("id", user.id)
    .maybeSingle();
  result.profileViaRls = profileViaRls;
  result.rlsError = rlsError?.message ?? null;

  // 3. Query profile with service role client (bypasses RLS) — only if key is set
  if (serviceRoleConfigured) {
    const adminClient = createClient(url, serviceRoleKey);
    const { data: profileViaAdmin, error: adminError } = await adminClient
      .from("profiles")
      .select("id, email, is_admin, klasse")
      .eq("id", user.id)
      .maybeSingle();
    result.profileViaAdmin = profileViaAdmin;
    result.adminError = adminError?.message ?? null;
    result.isAdminViaServiceRole = profileViaAdmin?.is_admin === true;
  }

  result.isAdminViaRls = profileViaRls?.is_admin === true;

  // 4. Check RLS policies on profiles table (requires service role key)
  if (serviceRoleConfigured) {
    const adminClient = createClient(url, serviceRoleKey);
    const { data: policies, error: policiesError } = await adminClient
      .from("pg_policies")
      .select("policyname, cmd, qual, with_check")
      .eq("tablename", "profiles");
    result.rlsPolicies = policies ?? [];
    result.rlsPoliciesError = policiesError?.message ?? null;
  }

  return NextResponse.json(result);
}
