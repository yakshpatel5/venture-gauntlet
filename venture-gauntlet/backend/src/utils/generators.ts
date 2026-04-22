import type { AgentRunInput, SwarmResult } from "../agents/types.js";
import { callClaude } from "./claude.js";

export async function generateLandingPage(
  input: AgentRunInput,
  result: SwarmResult
): Promise<string> {
  const prompt = `Generate a complete, production-ready single-file HTML landing page for this startup:

Idea: ${input.idea}
Target Audience: ${input.audience}
Price Point: $${input.pricePoint}/month
Key Sentiment Gaps (use as value props): ${result.marketCynic.sentiment_gaps.join(", ")}
North Star Metrics (use in social proof section): ${result.analyticsArchitect.north_star_metrics.map((m) => m.name).join(", ")}
Decision: ${result.verdict.decision}

Requirements:
- Modern, clean hero section with a strong headline
- 3 value proposition cards
- Pricing section showing the $${input.pricePoint}/month plan
- Simple email signup CTA form
- Responsive design with CSS variables
- Inline CSS and JS (single file)
- Use a blue/dark professional color scheme
- Include a simple JavaScript form handler that shows a "You're on the waitlist!" message

Return ONLY the raw HTML (no markdown fences, no explanation).`;

  return callClaude(
    "You are an expert frontend developer. Return only raw HTML code, no markdown.",
    prompt
  );
}

export function generateMetricsSchema(result: SwarmResult): Record<string, unknown> {
  return {
    version: "1.0",
    generated_at: new Date().toISOString(),
    north_star_metrics: result.analyticsArchitect.north_star_metrics,
    events: result.analyticsArchitect.events,
    acquisition: {
      avg_cpc: result.mediaBuyer.avg_cpc,
      estimated_cac: result.mediaBuyer.estimated_cac,
      ltv: result.mediaBuyer.ltv,
      ltv_cac_ratio: result.mediaBuyer.ltv_cac_ratio,
      payback_period_months: result.mediaBuyer.payback_period_months,
    },
    verdict: {
      success_probability: result.verdict.success_probability,
      decision: result.verdict.decision,
      risk_factors: result.verdict.risk_factors,
    },
  };
}
