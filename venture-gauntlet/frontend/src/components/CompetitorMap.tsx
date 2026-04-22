import type { MarketCynicResult } from "../types";

interface Props {
  data: MarketCynicResult;
}

function SaturationBar({ score }: { score: number }) {
  const color =
    score < 40 ? "bg-green-400" : score < 70 ? "bg-amber-400" : "bg-red-400";
  const label =
    score < 40 ? "Blue Ocean" : score < 70 ? "Contested" : "Red Ocean";
  const textColor =
    score < 40 ? "text-green-600" : score < 70 ? "text-amber-600" : "text-red-600";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-mono font-semibold text-ink/50 uppercase tracking-widest">
          Market Saturation
        </span>
        <span className={`text-xs font-mono font-bold ${textColor}`}>
          {score}/100 — {label}
        </span>
      </div>
      <div className="h-2.5 bg-sidebar rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function CompetitorMap({ data }: Props) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-ink mb-3">Competitive Landscape</h3>
      <SaturationBar score={data.market_saturation_score} />

      <div className="space-y-2 mb-4">
        {data.competitors.map((c, i) => (
          <div key={i} className="bg-white border border-sidebar rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-ink">{c.name}</span>
              <span className="text-xs text-ink/30 font-mono">{c.url}</span>
            </div>
            <div className="flex gap-3 mt-1">
              <span className="text-xs text-green-600">✓ {c.strength}</span>
              <span className="text-xs text-red-500">✗ {c.weakness}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-2">
          Sentiment Gaps (Your Opportunities)
        </p>
        <div className="space-y-1.5">
          {data.sentiment_gaps.map((gap, i) => (
            <div key={i} className="flex items-start gap-2 bg-accent/40 border border-green-200 rounded-lg px-3 py-2">
              <span className="text-green-500 text-sm flex-shrink-0">→</span>
              <span className="text-xs text-ink/80">{gap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
