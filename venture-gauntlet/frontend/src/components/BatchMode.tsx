import { useState } from "react";
import { useBatchJob, type BatchItem } from "../hooks/useBatchJob";
import type { SwarmResult } from "../types";

const DECISION_COLORS = {
  PROCEED: "text-green-600 bg-green-50 border-green-200",
  PIVOT: "text-amber-600 bg-amber-50 border-amber-200",
  KILL: "text-red-600 bg-red-50 border-red-100",
};

const AGENT_LABELS: Record<string, string> = {
  queued: "Queued",
  "agent:market_cynic": "Market Cynic",
  "agent:media_buyer": "Media Buyer",
  "agent:analytics_architect": "Analytics",
  "agent:lean_ops": "Lean Ops",
  "agent:verdict_engine": "Verdict",
  done: "Done",
  error: "Error",
};

interface Props {
  accessToken?: string;
  onSelectResult: (result: SwarmResult) => void;
}

const EMPTY_ROW = { idea: "", audience: "", geography: "United States", pricePoint: 29 };

export default function BatchMode({ accessToken, onSelectResult }: Props) {
  const { batchState, isLoading, error, submit, reset } = useBatchJob();
  const [rows, setRows] = useState([{ ...EMPTY_ROW }, { ...EMPTY_ROW }]);

  const addRow = () => {
    if (rows.length < 5) setRows((r) => [...r, { ...EMPTY_ROW }]);
  };

  const removeRow = (i: number) => {
    if (rows.length > 1) setRows((r) => r.filter((_, idx) => idx !== i));
  };

  const updateRow = (i: number, field: keyof typeof EMPTY_ROW, value: string | number) => {
    setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.idea.trim() && r.audience.trim());
    if (valid.length === 0) return;
    void submit(valid.map((r) => ({ ...r, pricePoint: Number(r.pricePoint) })), accessToken);
  };

  function ItemCard({ item }: { item: BatchItem }) {
    const isDone = item.status === "done";
    const isError = item.status === "error";
    const decision = item.result?.verdict.decision;

    return (
      <div className={`border rounded-xl p-3 ${isDone ? "bg-white border-sidebar" : isError ? "bg-red-50 border-red-100" : "bg-sidebar/30 border-sidebar"}`}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-xs font-semibold text-ink line-clamp-2">{item.idea}</p>
          <span className="text-xs font-mono text-ink/30 flex-shrink-0">#{item.index + 1}</span>
        </div>

        {isDone && decision && item.result ? (
          <>
            <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border mb-2 ${DECISION_COLORS[decision]}`}>
              {decision} · {item.result.verdict.success_probability}%
            </div>
            <button
              onClick={() => onSelectResult(item.result!)}
              className="w-full text-xs text-primary font-semibold border border-primary/30 rounded-lg py-1.5 hover:bg-primary/5 transition-colors"
            >
              View full report →
            </button>
          </>
        ) : isError ? (
          <p className="text-xs text-red-500">{item.error ?? "Failed"}</p>
        ) : (
          <p className="text-xs text-ink/40 font-mono">{AGENT_LABELS[item.status] ?? item.status}…</p>
        )}
      </div>
    );
  }

  if (batchState) {
    const done = batchState.items.filter((i) => i.status === "done").length;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest">Batch Progress</p>
            <p className="text-xs text-ink/50 mt-0.5">{done} of {batchState.total} complete</p>
          </div>
          {!isLoading && (
            <button onClick={reset} className="text-xs text-ink/40 hover:text-ink border border-sidebar px-2.5 py-1 rounded-lg">
              ↩ New batch
            </button>
          )}
        </div>
        <div className="space-y-2">
          {batchState.items.map((item) => <ItemCard key={item.index} item={item} />)}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest">
        Batch Mode — up to 5 ideas
      </p>

      {rows.map((row, i) => (
        <div key={i} className="bg-sidebar/30 border border-sidebar rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-ink/40">Idea #{i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(i)} className="text-xs text-ink/30 hover:text-red-400">✕</button>
            )}
          </div>
          <textarea
            value={row.idea}
            onChange={(e) => updateRow(i, "idea", e.target.value)}
            placeholder="Business idea…"
            rows={2}
            required
            className="w-full bg-white border border-sidebar rounded-lg px-2.5 py-2 text-xs text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary resize-none"
          />
          <input
            value={row.audience}
            onChange={(e) => updateRow(i, "audience", e.target.value)}
            placeholder="Target audience"
            required
            className="w-full bg-white border border-sidebar rounded-lg px-2.5 py-2 text-xs text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={row.geography}
              onChange={(e) => updateRow(i, "geography", e.target.value)}
              placeholder="Geography"
              className="bg-white border border-sidebar rounded-lg px-2.5 py-2 text-xs text-ink focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              value={row.pricePoint}
              onChange={(e) => updateRow(i, "pricePoint", e.target.value)}
              min={1}
              className="bg-white border border-sidebar rounded-lg px-2.5 py-2 text-xs text-ink focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      ))}

      {rows.length < 5 && (
        <button
          type="button"
          onClick={addRow}
          className="w-full text-xs text-ink/40 hover:text-primary border border-dashed border-sidebar hover:border-primary rounded-xl py-2 transition-colors"
        >
          + Add idea ({rows.length}/5)
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors"
      >
        {isLoading ? "Running batch…" : `Run ${rows.length} idea${rows.length > 1 ? "s" : ""} ⚡`}
      </button>
    </form>
  );
}
