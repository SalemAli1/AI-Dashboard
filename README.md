# OpenClaw Dashboard

A real-time monitoring and management dashboard for AI agents. Track token usage, view sessions, monitor system health, and manage scheduled jobs — all with live updates via Server-Sent Events.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, React Router 7

**Backend:** Express 5, TypeScript, Node.js, SSE for real-time updates

## Pages

- **Dashboard** — Token burn tracking, system status, active agents, and per-agent performance cards
- **Agent Detail** — Deep dive into a single agent's stats, token usage over time, and session history
- **Sessions** — All conversations across every agent with sortable columns
- **Health** — Live system diagnostics log stream with health state indicators
- **Cron** — Scheduled jobs with run history and status

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
# Frontend
cd frontend && npm install

# Server
cd server && npm install
```

### Development

```bash
# Start the backend
cd server && npm run dev

# Start the frontend (in another terminal)
cd frontend && npm run dev
```

### Production

```bash
# Build the frontend
cd frontend && npm run build

# Start the server (serves the built frontend)
cd server && npm start
```

The app runs on port **3847** by default.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/overview` | Dashboard summary |
| `GET /api/agents` | All agents with stats |
| `GET /api/agents/:id` | Agent detail |
| `GET /api/sessions` | All sessions |
| `GET /api/health` | System health events |
| `GET /api/cron` | Scheduled jobs |
| `GET /api/sse` | SSE stream for live updates |
