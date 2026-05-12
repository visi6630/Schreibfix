import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { capturePayPalOrder } from "@/lib/paypal";

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

  const { orderId } = (await req.json()) as { orderId: string };
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    const captured = await capturePayPalOrder(orderId);
    if (captured.status !== "COMPLETED") {
      return NextResponse.json({ error: "Order not completed" }, { status: 400 });
    }

    // Find the pending subscription row we created in create-order
    const { data: existing } = await admin
      .from("subscriptions")
      .select("tier")
      .eq("family_id", user.id)
      .maybeSingle();

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await admin.from("subscriptions").upsert(
      {
        family_id: user.id,
        tier: existing?.tier ?? "pro",
        status: "active",
        paypal_subscription_id: orderId,
        current_period_ends_at: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "family_id" },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PayPal capture-order error:", err);
    return NextResponse.json({ error: "PayPal capture error" }, { status: 500 });
  }
}
