import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface ApiKey {
  id: string;
  key_prefix: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface Props {
  session: Session | null;
}

export default function ApiKeysPanel({ session }: Props) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null); // shown once after creation
  const [label, setLabel] = useState("");
  const [showForm, setShowForm] = useState(false);

  const authHeader = { Authorization: `Bearer ${session?.access_token ?? ""}` };

  const fetchKeys = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/keys`, { headers: authHeader });
      if (res.ok) {
        const data = await res.json() as { keys: ApiKey[] };
        setKeys(data.keys.filter((k) => k.is_active));
      }
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { void fetchKeys(); }, [fetchKeys]);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/keys`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || "Default key" }),
      });
      if (res.ok) {
        const data = await res.json() as { key: string };
        setNewKey(data.key);
        setLabel("");
        setShowForm(false);
        await fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    await fetch(`${API_BASE}/keys/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    setKeys((k) => k.filter((key) => key.id !== id));
  };

  if (!session) return null;

  return (
    <div className="bg-white border border-sidebar rounded-xl p-4 md:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest">
          API Keys
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-semibold text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-colors"
        >
          {showForm ? "Cancel" : "+ New key"}
        </button>
      </div>

      {/* One-time key display */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-green-700">
            ✓ Key created — copy it now. You won't see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono text-green-800 bg-white border border-green-200 rounded px-2 py-1.5 break-all">
              {newKey}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(newKey); }}
              className="text-xs text-green-600 border border-green-200 px-2 py-1.5 rounded hover:bg-green-100 flex-shrink-0"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="text-xs text-green-500 underline"
          >
            I've copied it — dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={createKey} className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Key label (optional)"
            className="flex-1 bg-bg border border-sidebar rounded-lg px-2.5 py-1.5 text-xs text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={creating}
            className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-blue-600 transition-colors"
          >
            {creating ? "…" : "Create"}
          </button>
        </form>
      )}

      {/* Keys list */}
      {loading && <div className="h-8 bg-sidebar/50 rounded animate-pulse" />}

      {!loading && keys.length === 0 && !showForm && (
        <p className="text-xs text-ink/30 text-center py-2">
          No active keys — create one to use the API.
        </p>
      )}

      <div className="space-y-1.5">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center gap-2 bg-sidebar/30 rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-ink font-semibold">{k.key_prefix}…</p>
              <p className="text-xs text-ink/40">{k.label}</p>
            </div>
            <button
              onClick={() => revokeKey(k.id)}
              className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>

      <div className="pt-1 border-t border-sidebar">
        <p className="text-xs text-ink/30 leading-relaxed">
          Use key as: <code className="font-mono">Authorization: Bearer vg_live_...</code>
        </p>
      </div>
    </div>
  );
}
