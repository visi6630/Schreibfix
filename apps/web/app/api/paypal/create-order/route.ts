import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createPayPalOrder } from "@/lib/paypal";
import type { SubscriptionTier } from "@schreibfix/core";

const TIER_AMOUNTS: Record<string, { amount: number; label: string; tier: SubscriptionTier }> = {
  plus_monthly: { amount: 299, label: "Schreibfix Plus (monatlich)", tier: "plus" },
  plus_yearly: { amount: 2499, label: "Schreibfix Plus (jährlich)", tier: "plus" },
  pro_monthly: { amount: 399, label: "Schreibfix Pro (monatlich)", tier: "pro" },
  pro_yearly: { amount: 3599, label: "Schreibfix Pro (jährlich)", tier: "pro" },
};

export async function POST(req: NextRequest) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
  }

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

  const { planKey } = (await req.json()) as { planKey: string };
  const plan = TIER_AMOUNTS[planKey];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const order = await createPayPalOrder(plan.amount, plan.label);
    const approvalLink = order.links.find((l) => l.rel === "approve");

    // Store pending intent so capture route knows which tier to activate
    await admin.from("subscriptions").upsert(
      {
        family_id: user.id,
        tier: plan.tier,
        status: "expired", // placeholder until captured
        paypal_subscription_id: `pending_${order.id}`,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "family_id" },
    );

    return NextResponse.json({ orderId: order.id, approvalUrl: approvalLink?.href });
  } catch (err) {
    console.error("PayPal create-order error:", err);
    return NextResponse.json({ error: "PayPal error" }, { status: 500 });
  }
}
