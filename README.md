# Property Management Dashboard

React + TypeScript admin dashboard for managing rental properties, tenants, bookings, and payments. Uses mock JSON seed data with a localStorage-backed API layer (simulated latency) so loading states behave like a real app.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

```bash
npm run build   # typecheck + production bundle
npm run lint
```

## Features

- **Dashboard** — KPIs, revenue chart, occupancy breakdown, recent bookings, overdue payments
- **Properties** — grid/list views, search & filters (URL query params), pagination, add/edit/delete
- **Property details** — gallery, specs, tenant, bookings, payments
- **Tenants, Bookings, Payments** — filterable lists with responsive table/card layouts
- **Reset demo** — top bar action restores seed data from JSON

## Project structure

| Path | Purpose |
|------|---------|
| `src/data/*.json` | Initial seed data |
| `src/services/api.ts` | Async CRUD + `localStorage` persistence |
| `src/pages/` | Route-level screens |
| `src/components/` | Layout, UI primitives, property widgets, charts |

## Swapping in a real backend

Replace the functions in `src/services/api.ts` with `fetch` calls to your API. Keep the same return types from `src/types/index.ts` so pages and forms stay unchanged. Remove or narrow `localStorage` usage once the server is the source of truth.

Regenerate seed JSON (optional):

```bash
node scripts/generate-seed.mjs
```
