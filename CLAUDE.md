# CLAUDE.md — AI Coding Instructions for Trading Journal

This file provides guidance for AI assistants (Claude, Copilot, etc.) working on this codebase. Keep it updated whenever the architecture or conventions change.

## Project Overview

Personal trading journal — Next.js 16 App Router, Prisma + SQLite, Material UI v7, TypeScript 5.  
No authentication (single-user, local/self-hosted).

## Architecture

### Data flow
```
Browser → Server Action (src/actions/) → Prisma → SQLite
```
All database mutations use Next.js **Server Actions** (`"use server"`). Pages that need interactive filtering use a `*Client.tsx` component pattern where the server page fetches initial data and passes it as props.

### Key files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Single source of truth for DB schema |
| `src/lib/trade-calc.ts` | Pure calculation functions — no side effects |
| `src/lib/trade-utils.ts` | `TradeFormData` type + `deriveTradeMetrics()` |
| `src/lib/db/trades.ts` | All trade CRUD + dashboard aggregations + Asset/Confluence CRUD (server actions) |
| `src/lib/db/diary.ts` | Daily journal entry + goal CRUD — revalidates `/diary` (server actions) |
| `src/components/DashboardView.tsx` | Shared dashboard UI (stats + charts) |
| `src/components/journal/JournalClient.tsx` | Main trade table with edit/delete |
| `src/components/journal/TradeFormDialog.tsx` | Trade form dialog (create/edit) |
| `src/components/journal/TradeViewDialog.tsx` | Trade detail view dialog |
| `src/components/journal/useJournal.ts` | Hook managing journal dialog state |
| `src/components/dashboard/StrategyDashboardClient.tsx` | Filterable dashboard UI |
| `src/components/dashboard/useDashboard.ts` | Hook managing dashboard filter state |
| `src/components/diary/DiaryClient.tsx` | Daily diary + goals UI |
| `src/components/diary/useDiary.ts` | Hook managing diary state |
| `src/components/config/ConfigClient.tsx` | Unified config page with tabs |
| `src/components/config/AssetsSection.tsx` | Asset management tab |
| `src/components/config/ConfluencesSection.tsx` | Confluence management tab |
| `src/components/config/StrategiesSection.tsx` | Strategy management tab |
| `src/components/config/OptionsSection.tsx` | Reference options display |

## Conventions

### Schema changes
1. Edit `prisma/schema.prisma`
2. If nothing is live → delete the old migration folder and write a fresh `migration.sql` matching the schema
3. If live data exists → run `npx prisma migrate dev --name <desc>` to generate an incremental migration
4. **SQLite limitation**: cannot rename or drop columns without recreating the table. Prisma wraps this in a shadow database during `migrate dev`.
5. Always regenerate the client: `npx prisma generate`

### Adding a new field to Trade
1. Add to `prisma/schema.prisma` → `Trade` model
2. Add to `TradeFormData` in `src/lib/trade-utils.ts`
3. Add to `createTradeAction` and `updateTradeAction` in `src/actions/trade-actions.ts`
4. Add to the `openEdit` mapping in `JournalClient.tsx`
5. Add field to the form dialog (appropriate Tab) in `JournalClient.tsx`
6. Add column to the journal table if it should be visible at a glance
7. Update migration SQL

### Adding a new asset
Assets are stored in the `Asset` table (`id, ticker, name, decimals`).  
Manage them via `/config/assets` in the UI or via `createAssetAction(ticker, name, decimals)`.  
The trade form shows a dropdown of all assets with an inline "+" button to add a new one without leaving the form.

### Adding a new confluence signal
Confluences are stored in the `Confluence` table (`id, name`).  
Manage them via `/config/confluences` in the UI or via `createConfluenceAction(name)`.  
Trades link to confluences through the `TradeConfluence` junction table.

### Dashboard filters
The dashboard (`src/app/dashboard/strategy/`) supports filtering by:
- **Asset** — populated via `getAssetsAction()` from the `Asset` table; filter uses `assetId`
- **Strategy** — fetched from the `Strategy` table

Both filters call `getDashboardStatsAction(strategyId?, assetId?)` and `getPnlSeriesAction(strategyId?, assetId?)`.
When `assetId` is set, stats aggregate `closedPnlAsset` (native); otherwise `closedPnlUsd`.

## Risk Metric Definitions

| Label | Code name | Formula |
|---|---|---|
| **PRR** (Planned RR) | `rrr` | `expectedProfit / expectedSlCost` (calculated at entry from TP vs SL) |
| **ARR** (Actual RR) | `realRR` | `(avgExit − avgEntry) / (avgEntry − SL)` (calculated after close) |

Do **not** rename the function names `rrr` / `realRR` in `trade-calc.ts` — they map to Excel column references. UI abbreviations are PRR / ARR.

## P&L Fields

- `closedPnlAsset` — native asset P&L (e.g. BTC for Bitcoin trades, ETH for Ethereum trades)
- `closedPnlUsd` — USD equivalent at time of close

The dashboard formats native P&L using `fmtNative(n, ticker, decimals)` in `DashboardView.tsx`, where `ticker` and `decimals` come from the `DashboardStats` response (`assetTicker`, `assetDecimals`).

## Docker & CI/CD

- `Dockerfile` — multi-stage-free build (alpine node); mounts `DATABASE_URL` via env at runtime
- `.github/workflows/docker.yml` — pushes to Docker Hub on `main` (tag: `latest`), `push_*` branches (tag: `pre_*`), and releases
- Secrets needed: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

The SQLite database **must** be persisted via a Docker volume — it is not baked into the image.

## Common Tasks

### After a schema change
```bash
npx prisma generate
npm run dev
```

### Reset dev database
```bash
npx prisma migrate reset   # drops + re-applies all migrations
```

### Type-check + lint
```bash
npm run format:all   # prettier + eslint fix + tsc --noEmit
```

## What NOT to Do

- Do not add authentication — this is intentionally a local single-user app
- Do not move from SQLite without a full migration strategy discussion
- Do not add global state management (Redux, Zustand) — server actions + `useTransition` is enough
- Do not convert Server Actions to API routes without a clear reason
