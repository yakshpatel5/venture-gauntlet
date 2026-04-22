import { useState, useRef, useCallback } from "react";
import type { SwarmResult } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface BatchItem {
  index: number;
  idea: string;
  status: string;
  result?: SwarmResult;
  error?: string;
}

export interface BatchState {
  batchId: string;
  total: number;
  items: BatchItem[];
}

export function useBatchJob() {
  const [batchState, setBatchState] = useState<BatchState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const submit = useCallback(async (
    ideas: Array<{ idea: string; audience: string; geography: string; pricePoint: number }>,
    accessToken?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setBatchState(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`${API_BASE}/batch`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ideas }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error || "Batch failed to start");
      }

      const { batchId } = await res.json() as { batchId: string };

      esRef.current?.close();
      const es = new EventSource(`${API_BASE}/batch/${batchId}/stream`);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as BatchState & { type: string };
          if (data.type === "update") {
            setBatchState({ batchId: data.batchId, total: data.total, items: data.items });
            const allDone = data.items.every((i) => i.status === "done" || i.status === "error");
            if (allDone) {
              es.close();
              setIsLoading(false);
            }
          }
        } catch { /* ignore */ }
      };

      es.onerror = () => {
        es.close();
        setIsLoading(false);
        setError("Connection lost");
      };
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const reset = useCallback(() => {
    esRef.current?.close();
    setBatchState(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { batchState, isLoading, error, submit, reset };
}
