import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

interface Props {
  user: User | null;
  onSendMagicLink: (email: string) => Promise<{ error: string | null }>;
  onSignOut: () => void;
}

export default function AuthPanel({ user, onSendMagicLink, onSignOut }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Auth not configured — hide panel entirely
  if (!supabase) return null;

  if (user) {
    return (
      <div className="bg-white border border-sidebar rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-ink/40 uppercase tracking-widest">Signed in</p>
          <p className="text-xs text-ink font-semibold truncate">{user.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="text-xs text-ink/40 hover:text-ink border border-sidebar px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Sign out
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const { error } = await onSendMagicLink(email.trim());
    setSending(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="bg-accent/50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold text-green-700">✓ Check your email</p>
        <p className="text-xs text-green-600 mt-0.5">Magic link sent to {email}</p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-xs text-green-600 underline mt-1.5"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-sidebar rounded-xl p-4 shadow-sm space-y-2">
      <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest">
        Sign in to save history
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 bg-bg border border-sidebar rounded-lg px-3 py-2 text-xs text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          disabled={sending}
          className="text-xs font-semibold bg-primary text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors flex-shrink-0"
        >
          {sending ? "…" : "Send link"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
