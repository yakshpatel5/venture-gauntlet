import { callClaude, parseJSON } from "../utils/claude.js";
import type { AgentRunInput, LeanOpsResult } from "./types.js";

const SYSTEM = `You are the Lean Ops Engineer agent. You design the minimal viable technical architecture for startups.
You select the leanest tech stack, design n8n automation workflows, and estimate MVP build time.
Return ONLY valid JSON. No prose, no markdown.`;

export async function runLeanOps(input: AgentRunInput): Promise<LeanOpsResult> {
  const prompt = `Design the MVP technical architecture for:
Idea: ${input.idea}
Target Audience: ${input.audience}
Geography: ${input.geography}
Price Point: $${input.pricePoint}/month

Return ONLY this JSON (no markdown):
{
  "tech_stack": [
    {"layer": "string", "technology": "string", "reason": "string"}
  ],
  "n8n_workflow": {
    "name": "string",
    "nodes": [
      {"id": "string", "name": "string", "type": "string", "position": [0, 0], "parameters": {}}
    ],
    "connections": {}
  },
  "architecture_diagram": "string",
  "mvp_weeks": number,
  "confidence": 0-100
}

Rules:
- tech_stack: 6-8 layers (Frontend, Backend, DB, Auth, Payments, Hosting, Email, etc.)
- n8n_workflow: a real n8n workflow JSON with 4-6 nodes for the core automation (lead capture → CRM → email)
- architecture_diagram: ASCII art diagram showing the system components and data flow
- mvp_weeks: realistic weeks to build MVP with 2 developers
- confidence: 0-100`;

  const raw = await callClaude(SYSTEM, prompt);
  return parseJSON<LeanOpsResult>(raw);
}
