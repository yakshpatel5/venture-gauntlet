import { callClaude, parseJSON } from "../utils/claude.js";
import type { AgentRunInput, MediaBuyerResult } from "./types.js";

const SYSTEM = `You are the Media Buyer agent — a performance marketer who calculates the cold economics of customer acquisition.
You estimate real CPC, CAC, LTV, payback periods, and break-even points based on the market vertical and geography.
Return ONLY valid JSON. No prose, no markdown.`;

export async function runMediaBuyer(
  input: AgentRunInput
): Promise<MediaBuyerResult> {
  const prompt = `Calculate acquisition economics for this startup:
Idea: ${input.idea}
Target Audience: ${input.audience}
Geography: ${input.geography}
Price Point: $${input.pricePoint}/month

Assume:
- Google Ads + Meta as primary channels
- SaaS/subscription model if not specified
- Average churn rates for the vertical

Return ONLY this JSON (no markdown):
{
  "avg_cpc": number,
  "estimated_cac": number,
  "ltv": number,
  "ltv_cac_ratio": number,
  "budget_for_1000_customers": number,
  "payback_period_months": number,
  "breakeven_customers": number,
  "confidence": 0-100
}

Rules:
- avg_cpc: realistic Google Ads CPC in USD for this vertical/geography
- estimated_cac: realistic total cost to acquire 1 customer (ad spend + overhead)
- ltv: lifetime value in USD (price * avg_months_retained)
- ltv_cac_ratio: ltv / estimated_cac
- budget_for_1000_customers: estimated_cac * 1000
- payback_period_months: how many months to recoup CAC
- breakeven_customers: monthly fixed costs / monthly margin per customer (estimate $5k/mo fixed costs for MVP)
- confidence: 0-100`;

  const raw = await callClaude(SYSTEM, prompt);
  return parseJSON<MediaBuyerResult>(raw);
}
