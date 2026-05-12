import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
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

  const { priceId, tier } = (await req.json()) as { priceId: string; tier: string };

  // Find or create Stripe customer
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  let customerId: string | undefined;
  const { data: subRow } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("family_id", user.id)
    .maybeSingle();

  if (subRow?.stripe_customer_id) {
    customerId = subRow.stripe_customer_id as string;
  } else {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // Store stripe_customer_id on profiles table
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customer.id } as Record<string, string>)
      .eq("id", user.id);
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3001";
  const isPro = tier === "pro";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: isPro
      ? { trial_period_days: 7, metadata: { tier, supabase_user_id: user.id } }
      : { metadata: { tier, supabase_user_id: user.id } },
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscription/cancel`,
    metadata: { supabase_user_id: user.id, tier },
  });

  return NextResponse.json({ url: session.url });
}
