import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { canUseFeature, getTrialDaysRemaining, isTrialing } from "@schreibfix/core";
import type { SubscriptionTier, SubscriptionStatus, Subscription } from "@schreibfix/core";

const FREE_SUBSCRIPTION: Subscription = {
  tier: "free",
  status: "active",
};

export async function GET(req: NextRequest) {
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

  const { data: row } = await admin
    .from("subscriptions")
    .select("*")
    .eq("family_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let subscription: Subscription = FREE_SUBSCRIPTION;

  if (row) {
    const sub: Subscription = {
      id: row.id as string,
      family_id: row.family_id as string,
      tier: row.tier as SubscriptionTier,
      status: row.status as SubscriptionStatus,
      stripe_customer_id: row.stripe_customer_id as string | null,
      stripe_subscription_id: row.stripe_subscription_id as string | null,
      paypal_subscription_id: row.paypal_subscription_id as string | null,
      trial_ends_at: row.trial_ends_at as string | null,
      current_period_ends_at: row.current_period_ends_at as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };

    // If trialing but trial expired, treat as free
    if (sub.status === "trialing" && !isTrialing(sub)) {
      subscription = FREE_SUBSCRIPTION;
    } else if (sub.status === "cancelled" || sub.status === "expired") {
      subscription = FREE_SUBSCRIPTION;
    } else {
      subscription = sub;
    }
  }

  const tier = subscription.tier;
  const features = {
    diktat: canUseFeature(tier, "diktat"),
    uebungen: canUseFeature(tier, "uebungen"),
    aiDiktat: canUseFeature(tier, "aiDiktat"),
    aiUebungen: canUseFeature(tier, "aiUebungen"),
    elevenlabsTTS: canUseFeature(tier, "elevenlabsTTS"),
    lesen: canUseFeature(tier, "lesen"),
    maxChildren: subscription.tier === "school" ? 35 : tier === "pro" || tier === "plus" ? 4 : 1,
    progressTracking: canUseFeature(tier, "progressTracking"),
    exportProgress: canUseFeature(tier, "exportProgress"),
    teacherDashboard: canUseFeature(tier, "teacherDashboard"),
  };

  return NextResponse.json({
    tier,
    status: subscription.status,
    trialDaysRemaining: getTrialDaysRemaining(subscription),
    features,
    subscription,
  });
}
