import { useState, useEffect } from "react";
import ProbabilityGauge from "./ProbabilityGauge";
import AcquisitionChart from "./AcquisitionChart";
import CompetitorMap from "./CompetitorMap";
import TechStackTree from "./TechStackTree";
import VerdictPanel from "./VerdictPanel";
import type { SwarmResult } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

type Tab = "verdict" | "market" | "acquisition" | "tech";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "verdict",     label: "Verdict",     emoji: "⚖️" },
  { key: "market",      label: "Market",      emoji: "🔍" },
  { key: "acquisition", label: "Acquisition", emoji: "💰" },
  { key: "tech",        label: "Tech Stack",  emoji: "⚙️" },
];

interface RunData {
  id: string;
  idea: string;
  audience: string;
  geography: string;
  price_point: number;
  decision: "PROCEED" | "PIVOT" | "KILL";
  probability: number;
  result: SwarmResult;
  created_at: string;
}

interface Props {
  runId: string;
}

export default function PublicVerdictPage({ runId }: Props) {
  const [run, setRun] = useState<RunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("verdict");

  useEffect(() => {
    fetch(`${API_BASE}/public/${runId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json() as Promise<RunData>;
      })
      .then((data) => { if (data) setRun(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [runId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !run) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-ink font-mono mb-2">Run not found</h1>
          <p className="text-sm text-ink/50">
            This run is private or doesn't exist.
          </p>
          <a href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Back to Venture Gauntlet
          </a>
        </div>
      </div>
    );
  }

  const { result } = run;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-sidebar bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-mono font-bold text-ink tracking-tight flex items-center gap-2 hover:text-primary transition-colors">
              <span>⚡</span> Venture Gauntlet
            </a>
            <span className="text-ink/20">·</span>
            <span className="text-xs text-ink/40 font-mono">Public Report</span>
          </div>
          <a
            href="/"
            className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Validate my idea →
          </a>
        </div>
      </header>

      <div className="flex-1 max-w-screen-lg mx-auto w-full px-4 md:px-6 py-6 space-y-5">
        {/* Meta card */}
        <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-mono text-ink/40 uppercase tracking-widest mb-1">Idea</p>
              <h1 className="text-lg font-bold text-ink leading-snug">{run.idea}</h1>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-xs text-ink/50">👥 {run.audience}</span>
                <span className="text-xs text-ink/50">🌍 {run.geography}</span>
                <span className="text-xs text-ink/50">💰 ${run.price_point}/mo</span>
              </div>
            </div>
            <ProbabilityGauge
              probability={result.verdict.success_probability}
              decision={result.verdict.decision}
            />
          </div>
        </div>

        {/* North star metrics */}
        <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm">
          <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-3">
            North Star Metrics
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {result.analyticsArchitect.north_star_metrics.map((m, i) => (
              <div key={i} className="bg-sidebar/40 rounded-lg px-3 py-2.5">
                <span className="font-mono text-xs text-primary font-bold">#{i + 1}</span>
                <div className="text-sm font-semibold text-ink mt-1">{m.name}</div>
                <div className="text-xs text-ink/50 mt-0.5">{m.definition}</div>
                <div className="text-xs text-green-600 font-mono mt-1">Target: {m.target}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabbed detail */}
        <div className="bg-white border border-sidebar rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-sidebar overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-ink/40 hover:text-ink"
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "verdict"     && <VerdictPanel verdict={result.verdict} />}
            {activeTab === "market"      && <CompetitorMap data={result.marketCynic} />}
            {activeTab === "acquisition" && <AcquisitionChart data={result.mediaBuyer} />}
            {activeTab === "tech"        && <TechStackTree data={result.leanOps} />}
          </div>
        </div>

        {/* CTA footer */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
          <p className="text-sm font-semibold text-ink mb-1">
            Want to validate your own startup idea?
          </p>
          <p className="text-xs text-ink/50 mb-3">
            5 AI agents stress-test your idea in under 3 minutes.
          </p>
          <a
            href="/"
            className="inline-block bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            ⚡ Try Venture Gauntlet free
          </a>
        </div>
      </div>
    </div>
  );
}
