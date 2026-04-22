import { useState } from "react";
import type { Session } from "@supabase/supabase-js";

interface Props {
  runId: string | null;
  session: Session | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default function PublishToggle({ runId, session }: Props) {
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!runId || !session) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/runs/${runId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_public: !isPublic }),
      });
      if (res.ok) setIsPublic((v) => !v);
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = `${window.location.origin}/public/${runId}`;
  const embedSnippet = `<script src="${window.location.origin}/embed.js" data-run="${runId}"></script>`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-2 pt-3 border-t border-sidebar">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink">Public page</p>
          <p className="text-xs text-ink/40">Share verdict with anyone</p>
        </div>
        <button
          onClick={toggle}
          disabled={loading}
          className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-40 ${isPublic ? "bg-primary" : "bg-sidebar"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {isPublic && (
        <div className="space-y-1.5">
          <button
            onClick={() => copy(publicUrl)}
            className="w-full text-left bg-sidebar/50 border border-sidebar rounded-lg px-2.5 py-2 text-xs font-mono text-ink/60 hover:text-primary transition-colors truncate"
          >
            {copied ? "✓ Copied!" : publicUrl}
          </button>
          <button
            onClick={() => copy(embedSnippet)}
            className="w-full text-xs text-ink/40 hover:text-primary border border-dashed border-sidebar rounded-lg py-1.5 transition-colors"
          >
            {"</>"} Copy embed snippet
          </button>
        </div>
      )}
    </div>
  );
}
