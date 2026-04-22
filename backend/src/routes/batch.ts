import express from "express";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { runMarketCynic } from "../agents/marketCynic.js";
import { runMediaBuyer } from "../agents/mediaBuyer.js";
import { runAnalyticsArchitect } from "../agents/analyticsArchitect.js";
import { runLeanOps } from "../agents/leanOps.js";
import { runVerdictEngine } from "../agents/verdictEngine.js";
import { requireAuth } from "../middleware/auth.js";
import { getCredits, deductCredit } from "../utils/credits.js";
import { supabase } from "../utils/supabase.js";
import type { AgentRunInput, SwarmResult } from "../agents/types.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const batchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3, // max 3 batch runs per hour per IP
  message: { error: "Too many batch requests. Limit: 3 per hour." },
});

interface BatchInput {
  ideas: AgentRunInput[]; // max 5
}

interface BatchJobState {
  batchId: string;
  total: number;
  items: Array<{
    index: number;
    idea: string;
    status: string;
    result?: SwarmResult;
    error?: string;
  }>;
}

const batchJobs = new Map<string, BatchJobState>();

// POST /api/batch — submit up to 5 ideas
router.post("/batch", batchLimiter, requireAuth, async (req: Request, res: Response) => {
  const { ideas } = req.body as BatchInput;

  if (!Array.isArray(ideas) || ideas.length === 0) {
    res.status(400).json({ error: "ideas must be a non-empty array" });
    return;
  }
  if (ideas.length > 5) {
    res.status(400).json({ error: "Maximum 5 ideas per batch" });
    return;
  }

  // Check credits upfront — need one per idea
  if (req.userId) {
    const balance = await getCredits(req.userId);
    if (balance < ideas.length) {
      res.status(402).json({
        error: `Need ${ideas.length} credits for batch of ${ideas.length}. You have ${balance}.`,
        code: "INSUFFICIENT_CREDITS",
      });
      return;
    }
  }

  const batchId = uuidv4();
  const state: BatchJobState = {
    batchId,
    total: ideas.length,
    items: ideas.map((idea, i) => ({
      index: i,
      idea: idea.idea,
      status: "queued",
    })),
  };
  batchJobs.set(batchId, state);

  res.json({ batchId });

  // Run sequentially (not parallel — avoids rate limit hammering)
  void runBatch(batchId, ideas, req.userId);
});

// GET /api/batch/:batchId/stream — SSE for batch progress
router.get("/batch/:batchId/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const interval = setInterval(() => {
    const job = batchJobs.get(req.params.batchId);
    if (!job) {
      send({ type: "error", message: "Batch not found" });
      clearInterval(interval);
      res.end();
      return;
    }

    send({ type: "update", ...job });

    const allDone = job.items.every(
      (i) => i.status === "done" || i.status === "error"
    );
    if (allDone) {
      clearInterval(interval);
      setTimeout(() => res.end(), 100);
    }
  }, 800);

  req.on("close", () => clearInterval(interval));
});

async function runBatch(
  batchId: string,
  ideas: AgentRunInput[],
  userId?: string
): Promise<void> {
  const state = batchJobs.get(batchId)!;

  for (let i = 0; i < ideas.length; i++) {
    const input = ideas[i];
    state.items[i].status = "agent:market_cynic";
    batchJobs.set(batchId, { ...state });

    try {
      const updateStatus = (status: string) => {
        state.items[i].status = status;
        batchJobs.set(batchId, { ...state });
      };

      updateStatus("agent:market_cynic");
      const marketCynic = await runMarketCynic(input);

      updateStatus("agent:media_buyer");
      const mediaBuyer = await runMediaBuyer(input);

      updateStatus("agent:analytics_architect");
      const analyticsArchitect = await runAnalyticsArchitect(input);

      updateStatus("agent:lean_ops");
      const leanOps = await runLeanOps(input);

      updateStatus("agent:verdict_engine");
      const verdict = await runVerdictEngine(input, marketCynic, mediaBuyer, analyticsArchitect, leanOps);

      const swarmResult: SwarmResult = { marketCynic, mediaBuyer, analyticsArchitect, leanOps, verdict };

      state.items[i].status = "done";
      state.items[i].result = swarmResult;

      // Persist + deduct credit per completed idea
      if (supabase && userId) {
        await supabase.from("runs").insert({
          user_id: userId,
          idea: input.idea,
          audience: input.audience,
          geography: input.geography,
          price_point: input.pricePoint,
          result: swarmResult,
          decision: verdict.decision,
          probability: verdict.success_probability,
        });
        await deductCredit(userId);
      }
    } catch (err) {
      state.items[i].status = "error";
      state.items[i].error = String(err);
    }

    batchJobs.set(batchId, { ...state });
  }
}

export default router;
