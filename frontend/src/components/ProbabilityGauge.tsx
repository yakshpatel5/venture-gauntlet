interface Props {
  probability: number;
  decision: "PROCEED" | "PIVOT" | "KILL";
}

const DECISION_COLORS = {
  PROCEED: { stroke: "#22c55e", text: "text-green-600", bg: "bg-green-50" },
  PIVOT: { stroke: "#f59e0b", text: "text-amber-600", bg: "bg-amber-50" },
  KILL: { stroke: "#ef4444", text: "text-red-600", bg: "bg-red-50" },
};

const DECISION_EMOJI = {
  PROCEED: "🚀",
  PIVOT: "🔄",
  KILL: "💀",
};

export default function ProbabilityGauge({ probability, decision }: Props) {
  const colors = DECISION_COLORS[decision];
  const radius = 80;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Track */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#E1E8ED"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${offset}`}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
              transformOrigin: "center",
            }}
          />
          {/* Center text */}
          <text x="100" y="88" textAnchor="middle" fontSize="32" fontWeight="700" fill="#1A1C1E" fontFamily="DM Sans">
            {probability}
          </text>
          <text x="100" y="106" textAnchor="middle" fontSize="11" fill="#1A1C1E" opacity="0.4" fontFamily="DM Sans">
            VIABILITY SCORE
          </text>
        </svg>
      </div>

      <div className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg}`}>
        <span className="text-lg">{DECISION_EMOJI[decision]}</span>
        <span className={`font-mono font-bold text-lg tracking-wider ${colors.text}`}>
          {decision}
        </span>
      </div>
    </div>
  );
}
