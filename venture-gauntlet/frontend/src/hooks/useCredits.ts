import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export function useCredits(session: Session | null) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!session?.access_token) { setCredits(null); return; }
    try {
      const res = await fetch(`${API_BASE}/credits`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { credits: number };
      setCredits(data.credits);
    } catch { /* silent */ }
  }, [session?.access_token]);

  useEffect(() => { void fetchCredits(); }, [fetchCredits]);

  const startCheckout = useCallback(async (pack: "starter" | "pro") => {
    if (!session?.access_token) return;
    setLoadingCheckout(true);
    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pack }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingCheckout(false);
    }
  }, [session?.access_token]);

  return { credits, fetchCredits, startCheckout, loadingCheckout };
}
