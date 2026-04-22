const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const FILES = [
  { filename: "gtm-container.json", label: "GTM Container", desc: "Import into Google Tag Manager", icon: "📦" },
  { filename: "metrics-schema.json", label: "Metrics Schema", desc: "North star metrics + events", icon: "📊" },
  { filename: "landing-page.html", label: "Landing Page", desc: "Deploy-ready HTML page", icon: "🌐" },
];

export default function OutputFiles() {
  return (
    <div>
      <p className="text-xs font-mono font-semibold text-ink/40 uppercase tracking-widest mb-3">
        Generated Files
      </p>
      <div className="space-y-2">
        {FILES.map((f) => (
          <a
            key={f.filename}
            href={`${API_BASE}/output/${f.filename}`}
            download={f.filename}
            className="flex items-center gap-3 bg-white border border-sidebar hover:border-primary rounded-lg px-3 py-2.5 transition-colors group"
          >
            <span className="text-xl flex-shrink-0">{f.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                {f.label}
              </div>
              <div className="text-xs text-ink/40 font-mono">{f.desc}</div>
            </div>
            <span className="text-ink/20 group-hover:text-primary transition-colors text-sm">↓</span>
          </a>
        ))}
      </div>
    </div>
  );
}
