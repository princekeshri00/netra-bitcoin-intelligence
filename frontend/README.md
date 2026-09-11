# NETRA — Frontend

**N**etwork **E**ntity **T**racking & **R**isk **A**nalysis — investigation dashboard for PS 26146 (NTRO, SIH 2026).

## Run it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. Runs entirely on mock data out of the box — no backend required to develop or demo the UI. Mock data is wire-accurate: shaped exactly like `docs/api.md` v1.0.0's example responses, so switching to live mode should need zero component changes.

## Switching from mock data to the live backend

Every backend call goes through `src/api/client.ts` — no component calls `fetch()` directly.

1. Copy `.env.local.example` to `.env.local`
2. Set `VITE_USE_MOCK=false`
3. Confirm `VITE_API_BASE` (default `http://localhost:8000/api/v1`) and `VITE_DATASET_ID` (default `demo_01`) match your backend
4. Restart `npm run dev`

### If the page hangs on "Loading…" forever with the live backend

Every request now times out after 6 seconds with a visible error banner instead of hanging silently. If you see that error, check in order:

1. Is `uvicorn` actually running? (`curl http://localhost:8000/api/v1/datasets/demo_01/`)
2. **CORS** — FastAPI blocks browser requests from `localhost:5173` unless explicitly allowed:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Does `VITE_DATASET_ID` match a dataset that's actually been imported on the backend?

## API contract

Matches `docs/api.md` v1.0.0 exactly — see `src/types/index.ts` for the full type definitions (kept in the backend's own snake_case, not converted to camelCase, to remove a whole class of mapping bugs).

**Known open item** — see `OPEN_QUESTION_FOR_BACKEND.txt`: there's no endpoint to fetch the current/latest `job_id` for a dataset, so the frontend currently persists it in `localStorage` after triggering `/analysis/`. Fine for a hackathon demo; flagged for a real fix.

## Structure

```
src/
  api/client.ts       — the only file that talks to the backend; pagination + timeout handling live here
  types/index.ts      — API contract, matches docs/api.md field-for-field
  data/mockData.ts    — wire-accurate mock data for offline dev/demo
  components/         — Sidebar, RiskBadge (4-tier), GraphView, WorkflowStepper, StatCard
  pages/
    DashboardHome     — dataset stats + drives the real analysis job lifecycle (trigger → poll → stats)
    AlertsPage        — paginated alert log with risk-level filtering
    InvestigationPage — composes alert detail + evidence + graph + propagation + wallet risk breakdown
```

## Design notes

- Graph rendered with Cytoscape.js — no external tiles/CDN, works fully offline.
- Risk levels shown as a stamped ring, not a colored pill; CRITICAL gets a double ring so it reads at a glance.
- The stage stepper on Alerts/Investigation reflects the actual investigator workflow from the pitch deck (Search → Trace → Connect → Analyse → Detect → Explain → Prioritize) — not decorative.
