import type { LeanOpsResult } from "../types";

interface Props {
  data: LeanOpsResult;
}

const LAYER_COLORS: Record<string, string> = {
  Frontend: "bg-blue-100 text-blue-700 border-blue-200",
  Backend: "bg-purple-100 text-purple-700 border-purple-200",
  Database: "bg-amber-100 text-amber-700 border-amber-200",
  Auth: "bg-green-100 text-green-700 border-green-200",
  Payments: "bg-pink-100 text-pink-700 border-pink-200",
  Hosting: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Email: "bg-orange-100 text-orange-700 border-orange-200",
  Analytics: "bg-teal-100 text-teal-700 border-teal-200",
};

function getLayerColor(layer: string): string {
  return (
    LAYER_COLORS[layer] ||
    Object.entries(LAYER_COLORS).find(([k]) =>
      layer.toLowerCase().includes(k.toLowerCase())
    )?.[1] ||
    "bg-gray-100 text-gray-700 border-gray-200"
  );
}

export default function TechStackTree({ data }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-ink">MVP Tech Stack</h3>
        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {data.mvp_weeks}w build
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {data.tech_stack.map((t, i) => (
          <div
            key={i}
            className={`border rounded-lg px-3 py-2 ${getLayerColor(t.layer)}`}
          >
            <div className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">
              {t.layer}
            </div>
            <div className="font-semibold text-sm mt-0.5">{t.technology}</div>
            <div className="text-xs opacity-70 mt-0.5 leading-tight">{t.reason}</div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-2">
          Architecture
        </p>
        <pre className="bg-ink text-green-400 text-xs rounded-lg p-3 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
          {data.architecture_diagram}
        </pre>
      </div>
    </div>
  );
}
