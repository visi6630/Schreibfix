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

// GET — fetch all subscriptions joined with user emails
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  if (!await verifyAdmin(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: subs, error } = await adminClient
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: subs ?? [] });
}

// PUT — upsert a subscription for a user (manual admin override)
export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  if (!await verifyAdmin(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    userId: string;
    tier: string;
    expiresAt: string | null;
  };

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await adminClient
    .from("subscriptions")
    .upsert({
      family_id: body.userId,
      tier: body.tier,
      status: "active",
      stripe_subscription_id: "MANUAL",
      paypal_subscription_id: null,
      current_period_ends_at: body.expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "family_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
