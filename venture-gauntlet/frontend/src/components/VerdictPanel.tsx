import type { VerdictResult } from "../types";

interface Props {
  verdict: VerdictResult;
}

export default function VerdictPanel({ verdict }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-2">
          Rationale
        </p>
        <p className="text-sm text-ink/80 leading-relaxed bg-white border border-sidebar rounded-lg px-3 py-2.5">
          {verdict.decision_rationale}
        </p>
      </div>

      <div>
        <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-2">
          30-Day GTM Plan
        </p>
        <div className="space-y-2">
          {verdict.gtm_plan_30_days.map((week) => (
            <div key={week.week} className="bg-white border border-sidebar rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  Week {week.week}
                </span>
              </div>
              <ul className="space-y-1 mb-2">
                {week.actions.map((a, i) => (
                  <li key={i} className="text-xs text-ink/80 flex gap-2">
                    <span className="text-primary flex-shrink-0">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1 mt-2">
                {week.kpis.map((kpi, i) => (
                  <span key={i} className="text-xs bg-accent/60 text-green-700 px-2 py-0.5 rounded-full font-mono">
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-2">
          Risk Factors
        </p>
        <div className="space-y-1.5">
          {verdict.risk_factors.map((risk, i) => (
            <div key={i} className="flex gap-2 items-start bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <span className="text-red-400 flex-shrink-0 text-sm">⚠</span>
              <span className="text-xs text-red-700">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
