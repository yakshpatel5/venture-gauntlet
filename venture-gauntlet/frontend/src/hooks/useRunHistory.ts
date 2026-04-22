import { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import type { SwarmResult } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface HistoryRun {
  id: string;
  idea: string;
  audience: string;
  geography: string;
  price_point: number;
  decision: "PROCEED" | "PIVOT" | "KILL";
  probability: number;
  created_at: string;
  result: SwarmResult;
}

export function useRunHistory(session: Session | null) {
  const [runs, setRuns] = useState<HistoryRun[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await window.fetch(`${API_BASE}/runs`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { runs: HistoryRun[] };
      setRuns(data.runs);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  // Fetch on mount and when session changes
  useEffect(() => { void fetch(); }, [fetch]);

  return { runs, loading, refetch: fetch };
}
