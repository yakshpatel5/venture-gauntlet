import express from "express";
import type { Request, Response } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/public/:runId — fetch a public run (no auth required)
router.get("/public/:runId", async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ error: "Not available" });
    return;
  }

  const { data, error } = await supabase
    .from("runs")
    .select("id, idea, audience, geography, price_point, decision, probability, result, created_at")
    .eq("id", req.params.runId)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Run not found or not public" });
    return;
  }

  res.json(data);
});

// PATCH /api/runs/:runId/publish — toggle is_public (owner only)
router.patch("/runs/:runId/publish", requireAuth, async (req: Request, res: Response) => {
  if (!supabase || !req.userId) {
    res.status(503).json({ error: "Not available" });
    return;
  }

  const { is_public } = req.body as { is_public: boolean };

  const { data, error } = await supabase
    .from("runs")
    .update({ is_public })
    .eq("id", req.params.runId)
    .eq("user_id", req.userId) // ownership check
    .select("id, is_public")
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Run not found or not owned by you" });
    return;
  }

  res.json(data);
});

export default router;
