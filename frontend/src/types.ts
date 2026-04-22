export interface AnalyzeInput {
  idea: string;
  audience: string;
  geography: string;
  pricePoint: number;
}

export interface Competitor {
  name: string;
  url: string;
  strength: string;
  weakness: string;
}

export interface MarketCynicResult {
  competitors: Competitor[];
  failure_reasons: string[];
  market_saturation_score: number;
  sentiment_gaps: string[];
  confidence: number;
}

export interface MediaBuyerResult {
  avg_cpc: number;
  estimated_cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  budget_for_1000_customers: number;
  payback_period_months: number;
  breakeven_customers: number;
  confidence: number;
}

export interface NorthStarMetric {
  name: string;
  definition: string;
  target: string;
}

export interface GAEvent {
  name: string;
  trigger: string;
  parameters: Record<string, string>;
}

export interface AnalyticsArchitectResult {
  north_star_metrics: NorthStarMetric[];
  events: GAEvent[];
  gtm_container: Record<string, unknown>;
  confidence: number;
}

export interface TechLayer {
  layer: string;
  technology: string;
  reason: string;
}

export interface LeanOpsResult {
  tech_stack: TechLayer[];
  n8n_workflow: Record<string, unknown>;
  architecture_diagram: string;
  mvp_weeks: number;
  confidence: number;
}

export interface GTMWeek {
  week: number;
  actions: string[];
  kpis: string[];
}

export interface VerdictResult {
  success_probability: number;
  decision: "PROCEED" | "PIVOT" | "KILL";
  decision_rationale: string;
  gtm_plan_30_days: GTMWeek[];
  risk_factors: string[];
  confidence: number;
}

export interface SwarmResult {
  marketCynic: MarketCynicResult;
  mediaBuyer: MediaBuyerResult;
  analyticsArchitect: AnalyticsArchitectResult;
  leanOps: LeanOpsResult;
  verdict: VerdictResult;
}

export interface JobState {
  status: string;
  result?: SwarmResult;
  error?: string;
}

export const AGENT_LABELS: Record<string, string> = {
  queued: "Queued",
  "agent:market_cynic": "Market Cynic",
  "agent:media_buyer": "Media Buyer",
  "agent:analytics_architect": "Analytics Architect",
  "agent:lean_ops": "Lean Ops Engineer",
  "agent:verdict_engine": "Verdict Engine",
  generating_outputs: "Generating Outputs",
  done: "Complete",
  error: "Error",
};

export const AGENT_ORDER = [
  "agent:market_cynic",
  "agent:media_buyer",
  "agent:analytics_architect",
  "agent:lean_ops",
  "agent:verdict_engine",
  "generating_outputs",
];
