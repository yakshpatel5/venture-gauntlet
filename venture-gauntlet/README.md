# ⚡ Venture Gauntlet — AI Business Validation Engine

> Stress-test your startup idea with a 5-agent AI swarm in under 3 minutes.

![Venture Gauntlet](https://img.shields.io/badge/Powered%20by-Claude%20AI-blue)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20TypeScript-informational)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What It Does

Venture Gauntlet runs your business idea through 5 specialized AI agents in sequence:

| Agent | Role | Output |
|-------|------|--------|
| 🔍 **Market Cynic** | Breaks your idea | Competitors, saturation score, sentiment gaps |
| 💰 **Media Buyer** | Calculates acquisition reality | CPC, CAC, LTV, payback period |
| 📊 **Analytics Architect** | Builds tracking infra | North star metrics, GA4 events, GTM container |
| ⚙️ **Lean Ops Engineer** | Designs MVP | Tech stack, n8n workflow, architecture diagram |
| ⚖️ **Verdict Engine** | Final decision | PROCEED / PIVOT / KILL + 30-day GTM plan |

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/venture-gauntlet.git
cd venture-gauntlet

# Backend
cd backend
cp ../.env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run dev    # Starts on http://localhost:3001

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev    # Starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Docker Deploy (Production)

```bash
# 1. Set your API key
cp .env.example .env
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env

# 2. Build & start everything
docker compose up --build -d

# 3. Open http://localhost:80
```

To stop:
```bash
docker compose down
```

---

## API Reference

### POST `/api/analyze`

Start a new validation job.

**Request body:**
```json
{
  "idea": "AI-powered resume builder for developers",
  "audience": "Mid-level software engineers at startups",
  "geography": "United States",
  "pricePoint": 29
}
```

**Response:**
```json
{ "jobId": "uuid-v4-here" }
```

---

### GET `/api/stream/:jobId`

Server-Sent Events stream for real-time updates.

**Event payloads:**
```json
{ "status": "agent:market_cynic" }
{ "status": "agent:media_buyer" }
{ "status": "agent:analytics_architect" }
{ "status": "agent:lean_ops" }
{ "status": "agent:verdict_engine" }
{ "status": "generating_outputs" }
{ "status": "done", "result": { ... } }
{ "status": "error", "error": "message" }
```

---

### GET `/api/job/:jobId`

Poll for job result (alternative to SSE).

---

### GET `/api/output/:filename`

Download generated files:
- `gtm-container.json` — Import into Google Tag Manager
- `metrics-schema.json` — North star metrics + GA4 event schema
- `landing-page.html` — Deploy-ready landing page

---

## Project Structure

```
venture-gauntlet/
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── marketCynic.ts      # Agent 1
│   │   │   ├── mediaBuyer.ts       # Agent 2
│   │   │   ├── analyticsArchitect.ts # Agent 3
│   │   │   ├── leanOps.ts          # Agent 4
│   │   │   ├── verdictEngine.ts    # Agent 5
│   │   │   └── types.ts
│   │   ├── routes/
│   │   │   └── analyze.ts          # Orchestrator + SSE
│   │   ├── utils/
│   │   │   ├── claude.ts           # Anthropic API wrapper
│   │   │   └── generators.ts       # File generators
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.tsx
│   │   │   ├── AgentSwarmPanel.tsx
│   │   │   ├── ProbabilityGauge.tsx
│   │   │   ├── AcquisitionChart.tsx
│   │   │   ├── CompetitorMap.tsx
│   │   │   ├── TechStackTree.tsx
│   │   │   ├── VerdictPanel.tsx
│   │   │   └── OutputFiles.tsx
│   │   ├── hooks/
│   │   │   └── useSwarmJob.ts
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── output/                          # Auto-generated files land here
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Deploy to Cloud

### Backend → Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set `ANTHROPIC_API_KEY` environment variable
3. Railway auto-detects Node.js — deploy

### Frontend → Vercel

1. Import the `/frontend` folder to [Vercel](https://vercel.com)
2. Set `VITE_API_URL=https://your-railway-backend.up.railway.app/api`
3. Deploy

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | — | Your Anthropic API key |
| `PORT` | ❌ | `3001` | Backend port |
| `FRONTEND_URL` | ❌ | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | ❌ | `development` | Environment |

Frontend:
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ❌ | `http://localhost:3001/api` | Backend API base URL |

---

## License

MIT — build whatever you want.
