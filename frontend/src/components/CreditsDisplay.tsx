interface Props {
  credits: number | null;
  onBuy: () => void;
  loading: boolean;
}

export default function CreditsDisplay({ credits, onBuy, loading }: Props) {
  if (credits === null) return null; // not signed in — hide

  const low = credits <= 1;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
        low
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-accent/60 border-green-200 text-green-700"
      }`}>
        <span>{low ? "⚠" : "⚡"}</span>
        <span>{credits} {credits === 1 ? "credit" : "credits"}</span>
      </div>
      <button
        onClick={onBuy}
        disabled={loading}
        className="text-xs font-semibold text-white bg-primary hover:bg-blue-600 disabled:opacity-40 px-2.5 py-1 rounded-lg transition-colors"
      >
        {loading ? "…" : "+ Buy"}
      </button>
    </div>
  );
}
