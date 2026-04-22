export interface AgentRunInput {
  idea: string;
  audience: string;
  geography: string;
  pricePoint: number;
}

export interface MarketCynicResult {
  competitors: Array<{ name: string; url: string; strength: string; weakness: string }>;
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

export interface AnalyticsArchitectResult {
  north_star_metrics: Array<{ name: string; definition: string; target: string }>;
  events: Array<{ name: string; trigger: string; parameters: Record<string, string> }>;
  gtm_container: Record<string, unknown>;
  confidence: number;
}

export interface LeanOpsResult {
  tech_stack: Array<{ layer: string; technology: string; reason: string }>;
  n8n_workflow: Record<string, unknown>;
  architecture_diagram: string;
  mvp_weeks: number;
  confidence: number;
}

export interface VerdictResult {
  success_probability: number;
  decision: "PROCEED" | "PIVOT" | "KILL";
  decision_rationale: string;
  gtm_plan_30_days: Array<{ week: number; actions: string[]; kpis: string[] }>;
  risk_factors: string[];
  confidence: number;
}

export interface AgentUpdate {
  agent: string;
  status: "running" | "done" | "error";
  result?: unknown;
  error?: string;
}

export interface SwarmResult {
  marketCynic: MarketCynicResult;
  mediaBuyer: MediaBuyerResult;
  analyticsArchitect: AnalyticsArchitectResult;
  leanOps: LeanOpsResult;
  verdict: VerdictResult;
}
