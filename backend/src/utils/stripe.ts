import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.warn("⚠️  STRIPE_SECRET_KEY not set — payments disabled");
}

export const stripe = key ? new Stripe(key) : null;

// Credit pack definitions — must match products created in Stripe dashboard
export const CREDIT_PACKS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",  // $9 for 3 credits
    credits: 3,
    label: "Starter — 3 runs",
    price: "$9",
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO ?? "",      // $25 for 10 credits
    credits: 10,
    label: "Pro — 10 runs",
    price: "$25",
  },
} as const;

export type PackKey = keyof typeof CREDIT_PACKS;
