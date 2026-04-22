interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  const isBackendDown =
    message.toLowerCase().includes("fetch") ||
    message.toLowerCase().includes("connection") ||
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("port 3001");

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-700">Analysis failed</p>
          <p className="text-xs text-red-500 mt-0.5 break-words">{message}</p>
        </div>
      </div>

      {isBackendDown && (
        <div className="bg-red-100/60 rounded-lg px-3 py-2">
          <p className="text-xs font-mono font-semibold text-red-600 mb-1">Quick fix:</p>
          <code className="text-xs text-red-700 block">
            cd backend && npm run dev
          </code>
          <p className="text-xs text-red-400 mt-1">
            Verify ANTHROPIC_API_KEY is set in .env
          </p>
        </div>
      )}

      <button
        onClick={onRetry}
        className="w-full text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-100 rounded-lg py-2 transition-colors"
      >
        ↩ Try again
      </button>
    </div>
  );
}
