import express from "express";
import type { Request, Response } from "express";
import { stripe, CREDIT_PACKS } from "../utils/stripe.js";
import { addCredits, getCredits } from "../utils/credits.js";
import { requireAuth } from "../middleware/auth.js";
import type { PackKey } from "../utils/stripe.js";

const router = express.Router();

// GET /api/credits — current balance for authed user
router.get("/credits", requireAuth, async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const credits = await getCredits(req.userId);
  res.json({ credits });
});

// POST /api/checkout — create Stripe Checkout session, return hosted URL
router.post("/checkout", requireAuth, async (req: Request, res: Response) => {
  if (!stripe) {
    res.status(503).json({ error: "Payments not configured" });
    return;
  }
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { pack } = req.body as { pack: PackKey };
  const packConfig = CREDIT_PACKS[pack];
  if (!packConfig?.priceId) {
    res.status(400).json({ error: "Invalid pack. Choose: starter | pro" });
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: packConfig.priceId, quantity: 1 }],
    success_url: `${frontendUrl}?payment=success`,
    cancel_url:  `${frontendUrl}?payment=cancelled`,
    metadata: {
      user_id: req.userId,
      credits: String(packConfig.credits),
      pack,
    },
  });

  res.json({ url: session.url });
});

// POST /api/webhook — Stripe sends events here after payment
// Must be registered with raw body (before express.json()) — handled in index.ts
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    if (!stripe) {
      res.status(503).send("Payments not configured");
      return;
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      res.status(400).send("Missing signature or webhook secret");
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      res.status(400).send("Invalid signature");
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits ?? "0", 10);

      if (userId && credits > 0) {
        await addCredits(userId, credits, session.id);
        console.log(`✓ Added ${credits} credits to user ${userId}`);
      }
    }

    res.json({ received: true });
  }
);

export default router;
