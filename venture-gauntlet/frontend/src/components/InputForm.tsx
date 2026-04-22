import React, { useState } from "react";
import type { AnalyzeInput } from "../types";

interface Props {
  onSubmit: (input: AnalyzeInput) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<AnalyzeInput>({
    idea: "",
    audience: "",
    geography: "United States",
    pricePoint: 29,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idea.trim() || !form.audience.trim()) return;
    onSubmit(form);
  };

  const set = (key: keyof AnalyzeInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: key === "pricePoint" ? Number(e.target.value) : e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-mono font-semibold text-ink/50 uppercase tracking-widest mb-1.5">
          Business Idea
        </label>
        <textarea
          value={form.idea}
          onChange={set("idea")}
          placeholder="e.g. AI-powered resume builder for software engineers"
          rows={3}
          required
          className="w-full bg-white border border-sidebar rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-mono font-semibold text-ink/50 uppercase tracking-widest mb-1.5">
          Target Audience
        </label>
        <input
          value={form.audience}
          onChange={set("audience")}
          placeholder="e.g. Mid-level software engineers at startups"
          required
          className="w-full bg-white border border-sidebar rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-mono font-semibold text-ink/50 uppercase tracking-widest mb-1.5">
            Geography
          </label>
          <input
            value={form.geography}
            onChange={set("geography")}
            placeholder="United States"
            className="w-full bg-white border border-sidebar rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-mono font-semibold text-ink/50 uppercase tracking-widest mb-1.5">
            Price / Month ($)
          </label>
          <input
            type="number"
            value={form.pricePoint}
            onChange={set("pricePoint")}
            min={1}
            max={9999}
            className="w-full bg-white border border-sidebar rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !form.idea.trim()}
        className="w-full bg-primary text-white font-semibold text-sm py-3 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Swarm Running…
          </>
        ) : (
          <>
            <span>⚡</span> Run Venture Gauntlet
          </>
        )}
      </button>
    </form>
  );
}
