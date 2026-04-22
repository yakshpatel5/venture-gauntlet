import { callClaude, parseJSON } from "../utils/claude.js";
import type { AgentRunInput, AnalyticsArchitectResult } from "./types.js";

const SYSTEM = `You are the Analytics Architect agent. You design tracking infrastructure for startups.
You define north star metrics, GA4 event schemas, and GTM container configurations.
Return ONLY valid JSON. No prose, no markdown.`;

export async function runAnalyticsArchitect(
  input: AgentRunInput
): Promise<AnalyticsArchitectResult> {
  const prompt = `Design the analytics tracking system for:
Idea: ${input.idea}
Target Audience: ${input.audience}
Geography: ${input.geography}

Return ONLY this JSON (no markdown):
{
  "north_star_metrics": [
    {"name": "string", "definition": "string", "target": "string"}
  ],
  "events": [
    {"name": "string", "trigger": "string", "parameters": {"key": "value"}}
  ],
  "gtm_container": {
    "exportFormatVersion": 2,
    "containerVersion": {
      "tag": [],
      "trigger": [],
      "variable": []
    }
  },
  "confidence": 0-100
}

Rules:
- north_star_metrics: exactly 3 metrics that define success
- events: exactly 8 GA4 custom events with snake_case names and realistic parameters
- gtm_container: a minimal but real GTM container JSON with at least 2 tags (GA4 config + pageview)
- confidence: 0-100`;

  const raw = await callClaude(SYSTEM, prompt);
  return parseJSON<AnalyticsArchitectResult>(raw);
}
