import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", version: "1.0.0" }));

app.use("/api", analyzeRouter);

app.listen(PORT, () => {
  console.log(`🚀 Venture Gauntlet Backend running on port ${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY not set — agent calls will fail");
  }
});
