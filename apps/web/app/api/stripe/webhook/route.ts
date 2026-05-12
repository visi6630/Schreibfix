import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase-server";
import type { SubscriptionTier, SubscriptionStatus } from "@schreibfix/core";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function tierFromMetadata(metadata: Record<string, string> | null): SubscriptionTier {
  const t = metadata?.tier;
  if (t === "plus" || t === "pro" || t === "school") return t;
  return "free";
}

// Safely extract current_period_end from Stripe subscription (handles API version differences)
function getPeriodEnd(sub: unknown): string | null {
  const record = sub as Record<string, unknown>;
  const ts = record["current_period_end"];
  if (typeof ts === "number" && ts > 0) {
    return new Date(ts * 1000).toISOString();
  }
  return null;
}

function getSubId(invoice: unknown): string | null {
  const record = invoice as Record<string, unknown>;
  const sub = record["subscription"];
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object") {
    return (sub as Record<string, unknown>)["id"] as string ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const tier = tierFromMetadata(session.metadata);
      if (!userId) break;

      const stripeSubscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      let periodEnd: string | null = null;
      let status: SubscriptionStatus = "active";

      if (stripeSubscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          periodEnd = getPeriodEnd(sub);
          if (sub.status === "trialing") status = "trialing";
        } catch {
          // non-fatal: proceed without period end
        }
      }

      await admin.from("subscriptions").upsert(
        {
          family_id: userId,
          tier,
          status,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscriptionId,
          current_period_ends_at: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_id" },
      );
      break;
    }

    case "customer.subscription.updated": {
      const raw = event.data.object as unknown as Record<string, unknown>;
      const userId = (raw["metadata"] as Record<string, string> | null)?.supabase_user_id;
      if (!userId) break;

      const tier = tierFromMetadata(raw["metadata"] as Record<string, string> | null);
      const stripeStatus = raw["status"] as string | undefined;
      let status: SubscriptionStatus = "active";
      if (stripeStatus === "trialing") status = "trialing";
      else if (stripeStatus === "past_due") status = "past_due";
      else if (stripeStatus === "canceled") status = "cancelled";

      await admin.from("subscriptions").upsert(
        {
          family_id: userId,
          tier,
          status,
          stripe_subscription_id: raw["id"] as string,
          current_period_ends_at: getPeriodEnd(raw),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_id" },
      );
      break;
    }

    case "customer.subscription.deleted": {
      const raw = event.data.object as unknown as Record<string, unknown>;
      const userId = (raw["metadata"] as Record<string, string> | null)?.supabase_user_id;
      if (!userId) break;

      await admin.from("subscriptions").upsert(
        {
          family_id: userId,
          tier: "free",
          status: "cancelled",
          stripe_subscription_id: raw["id"] as string,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_id" },
      );
      break;
    }

    case "invoice.payment_failed": {
      const subId = getSubId(event.data.object);
      if (!subId) break;

      await admin
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
