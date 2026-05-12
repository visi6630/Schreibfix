import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const PRODUCTS = [
  {
    name: "Schreibfix Plus",
    description: "4 Kinder, Leseübungen, Fortschritt exportieren",
    prices: [
      { nickname: "schreibfix_plus_monthly", unit_amount: 299, recurring: { interval: "month" as const } },
      { nickname: "schreibfix_plus_yearly", unit_amount: 2499, recurring: { interval: "year" as const } },
    ],
  },
  {
    name: "Schreibfix Pro",
    description: "KI-Übungen, KI-Diktat, Bessere Stimme, Leseanalyse",
    prices: [
      { nickname: "schreibfix_pro_monthly", unit_amount: 399, recurring: { interval: "month" as const } },
      { nickname: "schreibfix_pro_yearly", unit_amount: 3599, recurring: { interval: "year" as const } },
    ],
  },
  {
    name: "Schreibfix Schule",
    description: "Bis zu 35 Schüler, Lehrer-Dashboard, alle Pro-Features",
    prices: [
      { nickname: "schreibfix_school_monthly", unit_amount: 4999, recurring: { interval: "month" as const } },
    ],
  },
];

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 });
  }
  const stripe = getStripe();

  const results = [];

  for (const product of PRODUCTS) {
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
    });

    const createdPrices = [];
    for (const price of product.prices) {
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        currency: "eur",
        unit_amount: price.unit_amount,
        recurring: price.recurring,
        nickname: price.nickname,
      });
      createdPrices.push({ id: stripePrice.id, nickname: price.nickname });
    }

    results.push({ product: stripeProduct.id, name: product.name, prices: createdPrices });
  }

  return NextResponse.json({ products: results });
}
