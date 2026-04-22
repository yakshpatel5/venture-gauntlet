import { useState } from "react";
import InputForm from "./components/InputForm";
import AgentSwarmPanel from "./components/AgentSwarmPanel";
import ProbabilityGauge from "./components/ProbabilityGauge";
import AcquisitionChart from "./components/AcquisitionChart";
import CompetitorMap from "./components/CompetitorMap";
import TechStackTree from "./components/TechStackTree";
import VerdictPanel from "./components/VerdictPanel";
import OutputFiles from "./components/OutputFiles";
import { useSwarmJob } from "./hooks/useSwarmJob";

type DashTab = "verdict" | "market" | "acquisition" | "tech";

const TABS: { key: DashTab; label: string; emoji: string }[] = [
  { key: "verdict", label: "Verdict", emoji: "⚖️" },
  { key: "market", label: "Market", emoji: "🔍" },
  { key: "acquisition", label: "Acquisition", emoji: "💰" },
  { key: "tech", label: "Tech Stack", emoji: "⚙️" },
];

export default function App() {
  const { jobState, isLoading, error, submit, reset } = useSwarmJob();
  const [activeTab, setActiveTab] = useState<DashTab>("verdict");

  const result = jobState?.result;
  const isDone = jobState?.status === "done";
  const currentStatus = jobState?.status || "";

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <header className="border-b border-sidebar bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <span className="font-mono font-bold text-ink tracking-tight">
              Venture Gauntlet
            </span>
            <span className="text-xs font-mono text-ink/30 border border-ink/10 px-2 py-0.5 rounded-full">
              AI Validation Engine
            </span>
          </div>
          {isDone && (
            <button
              onClick={reset}
              className="text-xs font-mono text-ink/40 hover:text-ink transition-colors border border-sidebar px-3 py-1.5 rounded-lg"
            >
              ↩ New Analysis
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6 flex gap-6">
        {/* LEFT: Input + Swarm */}
        <aside className="w-80 flex-shrink-0 space-y-5">
          <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm">
            <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-4">
              Idea Input
            </p>
            <InputForm onSubmit={submit} isLoading={isLoading} />
          </div>

          {(isLoading || isDone) && currentStatus && (
            <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm">
              <AgentSwarmPanel currentStatus={currentStatus} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">Error</p>
              <p className="text-xs text-red-600">{error}</p>
              <p className="text-xs text-red-400 mt-2">
                Make sure backend is running on port 3001 with a valid ANTHROPIC_API_KEY.
              </p>
            </div>
          )}

          {isDone && (
            <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm">
              <OutputFiles />
            </div>
          )}
        </aside>

        {/* RIGHT: Dashboard */}
        <main className="flex-1 min-w-0">
          {!isDone && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">⚡</div>
                <h1 className="text-2xl font-bold text-ink mb-2 font-mono">
                  Ready to stress-test your idea?
                </h1>
                <p className="text-ink/50 text-sm leading-relaxed">
                  Submit your business idea and let 5 AI agents brutally validate it — market saturation, CAC/LTV economics, GTM plan, tech stack, and a final verdict.
                </p>
              </div>
            </div>
          )}

          {isLoading && !isDone && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
                  <div className="absolute inset-2 border-4 border-transparent border-t-accent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                </div>
                <p className="font-mono font-bold text-ink text-lg">
                  Swarm Active
                </p>
                <p className="text-ink/40 text-sm mt-1">
                  {currentStatus.replace("agent:", "").replace(/_/g, " ")} running…
                </p>
              </div>
            </div>
          )}

          {isDone && result && (
            <div className="space-y-5">
              {/* Gauge + tabs header */}
              <div className="bg-white border border-sidebar rounded-xl p-5 shadow-sm flex items-center justify-between gap-6">
                <ProbabilityGauge
                  probability={result.verdict.success_probability}
                  decision={result.verdict.decision}
                />
                <div className="flex-1">
                  <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-2">
                    North Star Metrics
                  </p>
                  <div className="space-y-2">
                    {result.analyticsArchitect.north_star_metrics.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 bg-sidebar/40 rounded-lg px-3 py-2">
                        <span className="font-mono text-xs text-primary font-bold flex-shrink-0 mt-0.5">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-ink">{m.name}</div>
                          <div className="text-xs text-ink/50">{m.definition}</div>
                          <div className="text-xs text-green-600 font-mono mt-0.5">
                            Target: {m.target}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border border-sidebar rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-sidebar">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
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
                  {activeTab === "verdict" && <VerdictPanel verdict={result.verdict} />}
                  {activeTab === "market" && <CompetitorMap data={result.marketCynic} />}
                  {activeTab === "acquisition" && <AcquisitionChart data={result.mediaBuyer} />}
                  {activeTab === "tech" && <TechStackTree data={result.leanOps} />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
