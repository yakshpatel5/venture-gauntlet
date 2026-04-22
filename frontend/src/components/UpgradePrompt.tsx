interface Props {
  onBuy: (pack: "starter" | "pro") => void;
  loading: boolean;
  onDismiss: () => void;
}

const PACKS = [
  {
    key: "starter" as const,
    label: "Starter",
    price: "$9",
    credits: 3,
    perRun: "$3/run",
    highlight: false,
  },
  {
    key: "pro" as const,
    label: "Pro",
    price: "$25",
    credits: 10,
    perRun: "$2.50/run",
    highlight: true,
  },
];

export default function UpgradePrompt({ onBuy, loading, onDismiss }: Props) {
  return (
    <div className="bg-white border border-sidebar rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">Out of credits</p>
          <p className="text-xs text-ink/50 mt-0.5">
            Purchase a pack to keep validating ideas.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-ink/20 hover:text-ink/50 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PACKS.map((pack) => (
          <button
            key={pack.key}
            onClick={() => onBuy(pack.key)}
            disabled={loading}
            className={`relative text-left rounded-xl p-3 border transition-all disabled:opacity-40 ${
              pack.highlight
                ? "bg-primary border-primary text-white hover:bg-blue-600"
                : "bg-sidebar/40 border-sidebar hover:border-primary text-ink"
            }`}
          >
            {pack.highlight && (
              <span className="absolute -top-2 left-3 text-xs bg-green-400 text-white font-bold px-2 py-0.5 rounded-full">
                Best value
              </span>
            )}
            <div className="font-bold text-sm">{pack.price}</div>
            <div className={`text-xs mt-0.5 ${pack.highlight ? "text-white/80" : "text-ink/60"}`}>
              {pack.credits} runs · {pack.perRun}
            </div>
          </button>
        ))}
      </div>

      <p className={`text-xs text-ink/30 text-center`}>
        Powered by Stripe · Secure checkout
      </p>
    </div>
  );
}
