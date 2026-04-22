import express from "express";
import expressWs from "express-ws";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { runMarketCynic } from "../agents/marketCynic.js";
import { runMediaBuyer } from "../agents/mediaBuyer.js";
import { runAnalyticsArchitect } from "../agents/analyticsArchitect.js";
import { runLeanOps } from "../agents/leanOps.js";
import { runVerdictEngine } from "../agents/verdictEngine.js";
import { generateLandingPage, generateMetricsSchema } from "../utils/generators.js";
import type { AgentRunInput, SwarmResult } from "../agents/types.js";
import fs from "fs";
import path from "path";

const router = express.Router();
const { app } = expressWs(express());

// In-memory job store
const jobs = new Map<string, { status: string; result?: SwarmResult; error?: string }>();

// Kick off an analysis job
router.post("/analyze", async (req: Request, res: Response) => {
  const { idea, audience, geography, pricePoint } = req.body as AgentRunInput;

  if (!idea || !audience || !geography || !pricePoint) {
    res.status(400).json({ error: "Missing required fields: idea, audience, geography, pricePoint" });
    return;
  }

  const jobId = uuidv4();
  jobs.set(jobId, { status: "queued" });

  // Return job ID immediately
  res.json({ jobId });

  // Run async
  runSwarm({ idea, audience, geography, pricePoint: Number(pricePoint) }, jobId).catch(
    (err) => {
      console.error("Swarm error:", err);
      jobs.set(jobId, { status: "error", error: String(err) });
    }
  );
});

// Get job status/result
router.get("/job/:jobId", (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

// SSE stream for real-time updates
router.get("/stream/:jobId", (req: Request, res: Response) => {
  const { jobId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const sendEvent = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Poll until done
  const interval = setInterval(() => {
    const job = jobs.get(jobId);
    if (!job) {
      sendEvent({ type: "error", message: "Job not found" });
      clearInterval(interval);
      res.end();
      return;
    }

    sendEvent({ type: "status", ...job });

    if (job.status === "done" || job.status === "error") {
      clearInterval(interval);
      setTimeout(() => res.end(), 100);
    }
  }, 500);

  req.on("close", () => clearInterval(interval));
});

// Download generated file
router.get("/output/:filename", (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "output", req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.download(filePath);
});

async function runSwarm(input: AgentRunInput, jobId: string): Promise<void> {
  const updateJob = (status: string, partial?: Partial<SwarmResult>) => {
    const existing = jobs.get(jobId) || { status };
    jobs.set(jobId, { ...existing, status, ...(partial ? { partialResult: partial } : {}) });
  };

  try {
    updateJob("agent:market_cynic");
    const marketCynic = await runMarketCynic(input);

    updateJob("agent:media_buyer");
    const mediaBuyer = await runMediaBuyer(input);

    updateJob("agent:analytics_architect");
    const analyticsArchitect = await runAnalyticsArchitect(input);

    updateJob("agent:lean_ops");
    const leanOps = await runLeanOps(input);

    updateJob("agent:verdict_engine");
    const verdict = await runVerdictEngine(input, marketCynic, mediaBuyer, leanOps);

    const swarmResult: SwarmResult = {
      marketCynic,
      mediaBuyer,
      analyticsArchitect,
      leanOps,
      verdict,
    };

    // Generate output files
    updateJob("generating_outputs");

    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // GTM Container
    fs.writeFileSync(
      path.join(outputDir, "gtm-container.json"),
      JSON.stringify(analyticsArchitect.gtm_container, null, 2)
    );

    // Metrics Schema
    fs.writeFileSync(
      path.join(outputDir, "metrics-schema.json"),
      JSON.stringify(generateMetricsSchema(swarmResult), null, 2)
    );

    // Landing Page
    const landingPageHtml = await generateLandingPage(input, swarmResult);
    fs.writeFileSync(path.join(outputDir, "landing-page.html"), landingPageHtml);

    jobs.set(jobId, { status: "done", result: swarmResult });
  } catch (err) {
    jobs.set(jobId, { status: "error", error: String(err) });
    throw err;
  }
}

export default router;
