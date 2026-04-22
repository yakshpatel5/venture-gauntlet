import { AGENT_LABELS, AGENT_ORDER } from "../types";

interface Props {
  currentStatus: string;
}

const AGENT_ICONS: Record<string, string> = {
  "agent:market_cynic": "🔍",
  "agent:media_buyer": "💰",
  "agent:analytics_architect": "📊",
  "agent:lean_ops": "⚙️",
  "agent:verdict_engine": "⚖️",
  generating_outputs: "📦",
};

const AGENT_DESC: Record<string, string> = {
  "agent:market_cynic": "Mapping competitors & saturation",
  "agent:media_buyer": "Calculating CAC, LTV & payback",
  "agent:analytics_architect": "Building GTM + GA4 schema",
  "agent:lean_ops": "Designing MVP architecture",
  "agent:verdict_engine": "Computing final verdict",
  generating_outputs: "Writing files to /output",
};

export default function AgentSwarmPanel({ currentStatus }: Props) {
  const currentIdx = AGENT_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-2">
      <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-3">
        Agent Swarm
      </p>
      {AGENT_ORDER.map((agentKey, idx) => {
        const isDone = currentIdx > idx || currentStatus === "done";
        const isActive = currentStatus === agentKey;
        const isPending = currentIdx < idx && currentStatus !== "done";

        return (
          <div
            key={agentKey}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
              isActive
                ? "bg-primary/10 border border-primary/30"
                : isDone
                ? "bg-accent/40 border border-accent"
                : "bg-white/60 border border-sidebar"
            }`}
          >
            {/* Status indicator */}
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {isDone ? (
                <span className="text-green-500 text-sm">✓</span>
              ) : isActive ? (
                <span className="w-3 h-3 bg-primary rounded-full agent-running block" />
              ) : (
                <span className="w-3 h-3 bg-ink/10 rounded-full block" />
              )}
            </div>

            {/* Icon + Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{AGENT_ICONS[agentKey]}</span>
                <span
                  className={`text-sm font-semibold ${
                    isActive
                      ? "text-primary"
                      : isDone
                      ? "text-green-700"
                      : "text-ink/40"
                  }`}
                >
                  {AGENT_LABELS[agentKey]}
                </span>
              </div>
              {(isActive || isDone) && (
                <p
                  className={`text-xs mt-0.5 ${
                    isDone ? "text-green-600" : "text-ink/50"
                  }`}
                >
                  {isDone ? "Complete" : AGENT_DESC[agentKey]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
