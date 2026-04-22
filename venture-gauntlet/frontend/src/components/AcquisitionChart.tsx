import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { MediaBuyerResult } from "../types";

interface Props {
  data: MediaBuyerResult;
}

export default function AcquisitionChart({ data }: Props) {
  const chartData = [
    { label: "CPC", value: data.avg_cpc, color: "#93c5fd" },
    { label: "CAC", value: data.estimated_cac, color: "#3A86FF" },
    { label: "LTV", value: data.ltv, color: "#D0F4DE" === "#D0F4DE" ? "#22c55e" : "#22c55e" },
  ];

  const ratio = data.ltv_cac_ratio;
  const ratioColor = ratio >= 3 ? "text-green-600" : ratio >= 1 ? "text-amber-600" : "text-red-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-ink">Acquisition Economics</h3>
        <div className={`font-mono text-sm font-bold ${ratioColor}`}>
          LTV:CAC {ratio.toFixed(1)}x
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E1E8ED" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(v: number) => [`$${v.toFixed(0)}`, ""]}
            contentStyle={{ fontFamily: "DM Sans", fontSize: 12, border: "1px solid #E1E8ED", borderRadius: 8 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: "Payback", value: `${data.payback_period_months}mo` },
          { label: "Break-even", value: `${data.breakeven_customers} users` },
          { label: "1K Users Cost", value: `$${(data.budget_for_1000_customers / 1000).toFixed(0)}K` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-sidebar/50 rounded-lg p-2 text-center">
            <div className="font-mono text-xs font-bold text-ink">{value}</div>
            <div className="text-xs text-ink/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
