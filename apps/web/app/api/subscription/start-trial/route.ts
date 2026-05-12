import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const admin = createAdminClient();
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already has/had a subscription (trial can only be used once)
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("family_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Du hast die Testphase bereits genutzt." },
      { status: 409 }
    );
  }

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const { data: newSub, error: insertError } = await admin
    .from("subscriptions")
    .insert({
      family_id: user.id,
      tier: "pro",
      status: "trialing",
      trial_ends_at: trialEnd.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("start-trial insert error:", insertError);
    return NextResponse.json({ error: "Fehler beim Starten der Testphase" }, { status: 500 });
  }

  return NextResponse.json({ subscription: newSub });
}
