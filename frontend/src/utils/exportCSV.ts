import type { AnalyzeInput, SwarmResult } from "../types";

function esc(v: string | number): string {
  return `"${String(v).replace(/"/g, '""')}"`;
}

function row(section: string, field: string, value: string | number): string {
  return [esc(section), esc(field), esc(value)].join(",");
}

export function exportToCSV(input: AnalyzeInput, result: SwarmResult): void {
  const { marketCynic, mediaBuyer, analyticsArchitect, leanOps, verdict } = result;

  const rows: string[] = [
    "Section,Field,Value",
    row("Idea", "Concept", input.idea),
    row("Idea", "Audience", input.audience),
    row("Idea", "Geography", input.geography),
    row("Idea", "Price/mo", `$${input.pricePoint}`),
    row("Verdict", "Decision", verdict.decision),
    row("Verdict", "Success Probability", `${verdict.success_probability}%`),
    row("Verdict", "Rationale", verdict.decision_rationale),
    row("Market", "Saturation Score", `${marketCynic.market_saturation_score}/100`),
    ...marketCynic.competitors.map((c, i) => row("Market", `Competitor ${i + 1}`, `${c.name} - ${c.url}`)),
    ...marketCynic.failure_reasons.map((r, i) => row("Market", `Failure Risk ${i + 1}`, r)),
    ...marketCynic.sentiment_gaps.map((g, i) => row("Market", `Opportunity ${i + 1}`, g)),
    row("Acquisition", "Avg CPC", `$${mediaBuyer.avg_cpc}`),
    row("Acquisition", "Est. CAC", `$${mediaBuyer.estimated_cac}`),
    row("Acquisition", "LTV", `$${mediaBuyer.ltv}`),
    row("Acquisition", "LTV:CAC Ratio", `${mediaBuyer.ltv_cac_ratio}x`),
    row("Acquisition", "Payback Period", `${mediaBuyer.payback_period_months} months`),
    row("Acquisition", "Budget for 1K Users", `$${mediaBuyer.budget_for_1000_customers}`),
    ...analyticsArchitect.north_star_metrics.map((m, i) =>
      row("Analytics", `North Star ${i + 1}`, `${m.name}: ${m.definition} (target: ${m.target})`)
    ),
    ...leanOps.tech_stack.map((t) => row("Tech Stack", t.layer, `${t.technology} - ${t.reason}`)),
    row("Tech Stack", "MVP Timeline", `${leanOps.mvp_weeks} weeks`),
    ...verdict.gtm_plan_30_days.flatMap((week) =>
      week.actions.map((a) => row("GTM Plan", `Week ${week.week}`, a))
    ),
    ...verdict.risk_factors.map((r, i) => row("Risks", `Risk ${i + 1}`, r)),
  ];

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vg-${verdict.decision.toLowerCase()}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
