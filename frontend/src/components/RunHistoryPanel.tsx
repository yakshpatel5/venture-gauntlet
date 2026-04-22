import type { HistoryRun } from "../hooks/useRunHistory";
import type { SwarmResult } from "../types";

interface Props {
  runs: HistoryRun[];
  loading: boolean;
  onSelect: (result: SwarmResult) => void;
}

const DECISION_STYLES = {
  PROCEED: "bg-green-100 text-green-700",
  PIVOT:   "bg-amber-100 text-amber-700",
  KILL:    "bg-red-100   text-red-600",
};

const DECISION_EMOJI = { PROCEED: "🚀", PIVOT: "🔄", KILL: "💀" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RunHistoryPanel({ runs, loading, onSelect }: Props) {
  return (
    <div className="bg-white border border-sidebar rounded-xl p-4 md:p-5 shadow-sm">
      <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-3">
        Run History
      </p>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-sidebar/60 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && runs.length === 0 && (
        <p className="text-xs text-ink/30 text-center py-4">
          No runs yet — your analyses will appear here.
        </p>
      )}

      {!loading && runs.length > 0 && (
        <div className="space-y-1.5">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelect(run.result)}
              className="w-full text-left bg-sidebar/30 hover:bg-sidebar border border-transparent hover:border-sidebar rounded-lg px-3 py-2.5 transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-full ${DECISION_STYLES[run.decision]}`}>
                  {DECISION_EMOJI[run.decision]} {run.decision}
                </span>
                <span className="text-xs font-mono text-primary font-bold">{run.probability}%</span>
              </div>
              <p className="text-xs text-ink font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {run.idea}
              </p>
              <p className="text-xs text-ink/30 mt-0.5">{formatDate(run.created_at)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
