import { callClaude, parseJSON } from "../utils/claude.js";
import type {
  AgentRunInput,
  MarketCynicResult,
  MediaBuyerResult,
  LeanOpsResult,
  VerdictResult,
} from "./types.js";

const SYSTEM = `You are the Verdict Engine — the final AI judge that synthesizes all agent outputs into a go/no-go decision.
You calculate success probability mathematically and generate an actionable 30-day GTM plan.
Return ONLY valid JSON. No prose, no markdown.`;

export async function runVerdictEngine(
  input: AgentRunInput,
  marketData: MarketCynicResult,
  buyerData: MediaBuyerResult,
  opsData: LeanOpsResult
): Promise<VerdictResult> {
  const prompt = `Generate final verdict for this startup based on agent data:

IDEA: ${input.idea} | Audience: ${input.audience} | Geography: ${input.geography} | Price: $${input.pricePoint}/mo

MARKET CYNIC FINDINGS:
- Saturation Score: ${marketData.market_saturation_score}/100
- Failure Reasons: ${marketData.failure_reasons.join(", ")}
- Sentiment Gaps: ${marketData.sentiment_gaps.join(", ")}

MEDIA BUYER ECONOMICS:
- CAC: $${buyerData.estimated_cac}
- LTV: $${buyerData.ltv}
- LTV:CAC Ratio: ${buyerData.ltv_cac_ratio}
- Payback Period: ${buyerData.payback_period_months} months

LEAN OPS:
- MVP Time: ${opsData.mvp_weeks} weeks
- Tech Stack: ${opsData.tech_stack.map((t) => t.technology).join(", ")}

SCORING FORMULA:
- Start at 50
- LTV:CAC > 3: +15, < 1: -25, 1-3: +5
- Market Saturation < 40: +10, 40-70: 0, > 70: -20
- MVP < 8 weeks: +10, > 16 weeks: -10
- Sentiment gaps found: +5 per gap (max +15)

Return ONLY this JSON (no markdown):
{
  "success_probability": number,
  "decision": "PROCEED" | "PIVOT" | "KILL",
  "decision_rationale": "string",
  "gtm_plan_30_days": [
    {"week": 1, "actions": ["string"], "kpis": ["string"]},
    {"week": 2, "actions": ["string"], "kpis": ["string"]},
    {"week": 3, "actions": ["string"], "kpis": ["string"]},
    {"week": 4, "actions": ["string"], "kpis": ["string"]}
  ],
  "risk_factors": ["string"],
  "confidence": 0-100
}

Rules:
- success_probability: 0-100 based on formula above
- decision: PROCEED if >60, PIVOT if 35-60, KILL if <35
- decision_rationale: 2-sentence explanation of the decision
- gtm_plan_30_days: specific weekly actions and measurable KPIs
- risk_factors: top 4 risks that could derail this venture
- confidence: 0-100`;

  const raw = await callClaude(SYSTEM, prompt);
  return parseJSON<VerdictResult>(raw);
}
