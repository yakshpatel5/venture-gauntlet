import express from "express";
import type { Request, Response } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/runs — last 10 runs for the authenticated user
router.get("/runs", requireAuth, async (req: Request, res: Response) => {
  if (!supabase || !req.userId) {
    res.status(503).json({ error: "Persistence not configured" });
    return;
  }

  const { data, error } = await supabase
    .from("runs")
    .select("id, idea, audience, geography, price_point, decision, probability, created_at, result")
    .eq("user_id", req.userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ runs: data });
});

export default router;
