# Atlas — Frontend

The Atlas Intelligence web client: a premium React experience for the autonomous student
command center (Morning Brief, Triage, knowledge graph, study lab, and the Atlas Orb).

- **Stack:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion, tsParticles
- **State:** Zustand
- **Default dev URL:** `http://localhost:5173`

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm
- The [backend](../backend/README.md) running locally if you want live data

## Setup

From the `frontend/` directory:

```bash
npm install
```

### Point the app at a backend

By default the app talks to the hosted backend. To use your **local** backend instead,
create a `.env` (or `.env.local`) file in `frontend/`:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

The client appends `/api` automatically. If `VITE_API_URL` is unset, it falls back to the
hosted production API (`https://hey-atlas.up.railway.app`).

## Run

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

## Other scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (hot reload) |
| `npm run build` | Type-check (`tsc -b`) and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Run the full app locally

1. Start the backend — see [backend/README.md](../backend/README.md) — on
   `http://127.0.0.1:8000`.
2. Set `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env`.
3. Run `npm run dev` and open <http://localhost:5173>.

The backend already allows CORS from the Vite dev server, so the two connect with no extra
configuration.
