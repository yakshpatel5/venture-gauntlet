import { callClaude, parseJSON } from "../utils/claude.js";
import type { AgentRunInput, MarketCynicResult } from "./types.js";

const SYSTEM = `You are the Market Cynic agent. Your job is to ruthlessly stress-test startup ideas.
You identify real competitors, calculate market saturation, find sentiment gaps from reviews, and predict failure reasons.
You MUST return ONLY valid JSON matching the exact schema requested. No prose, no markdown, just JSON.`;

export async function runMarketCynic(
  input: AgentRunInput
): Promise<MarketCynicResult> {
  const prompt = `Analyze this startup idea with brutal honesty:
Idea: ${input.idea}
Target Audience: ${input.audience}
Geography: ${input.geography}
Price Point: $${input.pricePoint}/month

Return ONLY this JSON (no markdown, no extra text):
{
  "competitors": [
    {"name": "string", "url": "string", "strength": "string", "weakness": "string"}
  ],
  "failure_reasons": ["string"],
  "market_saturation_score": 0-100,
  "sentiment_gaps": ["string"],
  "confidence": 0-100
}

Rules:
- competitors: exactly 5 real companies that compete in this space
- failure_reasons: top 4 reasons this idea typically fails
- market_saturation_score: 0=blue ocean, 100=totally saturated
- sentiment_gaps: 4 pain points existing solutions miss (opportunities)
- confidence: your confidence in this analysis 0-100`;

  const raw = await callClaude(SYSTEM, prompt);
  return parseJSON<MarketCynicResult>(raw);
}
