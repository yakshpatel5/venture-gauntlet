import { useState, useRef, useCallback } from "react";
import type { AnalyzeInput, JobState } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export function useSwarmJob() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<JobState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const submit = useCallback(async (input: AnalyzeInput) => {
    setIsLoading(true);
    setError(null);
    setJobState(null);
    setJobId(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start analysis");
      }

      const { jobId: newJobId } = await res.json();
      setJobId(newJobId);

      // Open SSE stream
      if (esRef.current) esRef.current.close();
      const es = new EventSource(`${API_BASE}/stream/${newJobId}`);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as JobState & { type?: string };
          setJobState(data);

          if (data.status === "done" || data.status === "error") {
            es.close();
            setIsLoading(false);
            if (data.status === "error") {
              setError(data.error || "Unknown error");
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
        setIsLoading(false);
        setError("Connection lost. Check backend is running.");
      };
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const reset = useCallback(() => {
    esRef.current?.close();
    setJobId(null);
    setJobState(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { jobId, jobState, isLoading, error, submit, reset };
}
