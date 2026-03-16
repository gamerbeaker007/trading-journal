# Trading Journal

A personal trading journal built with **Next.js 16**, **Prisma**, **SQLite**, and **Material UI**. Tracks entries, exits, risk metrics, emotions, and daily analysis across multiple assets (BTC, ETH, stocks, etc.).

## Features

- **Multi-asset support** — Log trades for BTC, ETH, SOL, stocks, or any custom ticker
- **Strategy dashboard** — Filter P&L equity curves and statistics by asset and/or strategy
- **Risk metrics** — Planned RR (entry vs TP/SL) and Actual RR (after close)
- **Dynamic tranches** — Multiple entry, TP, and exit levels stored as JSON
- **Daily journal** — Analysis notes with TradingView snapshot embeds
- **Project-24 goals** — Goal tracking module
- **Position calculator** — Stop-loss sizing helper
- **Dark / light theme** — Persisted via MUI

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Material UI v7 |
| ORM | Prisma 7 (SQLite via `better-sqlite3`) |
| Charts | Plotly.js / react-plotly.js |
| Language | TypeScript 5 |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure database URL
cp .env.example .env
# Edit DATABASE_URL=file:./dev.db

# 3. Apply migrations and generate Prisma client
npx prisma migrate deploy
npx prisma generate

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Path to the SQLite file | `file:./dev.db` |

## Database

Uses **SQLite** via Prisma. Migrations live in `prisma/migrations/`. Since SQLite has limited ALTER TABLE support (no column renames/drops), schema changes require new migrations that recreate tables. Prisma handles this automatically with `prisma migrate dev`.

To reset and re-apply from scratch (dev only):

```bash
npx prisma migrate reset
```

## Docker

```bash
# Build image
docker build -t trading-journal .

# Run (mount a volume for the SQLite database)
docker run -p 3000:3000 \
  -e DATABASE_URL=file:/data/journal.db \
  -v $(pwd)/data:/data \
  trading-journal
```

The GitHub Actions workflow (`.github/workflows/docker.yml`) automatically builds and pushes to Docker Hub on every push to `main` (tagged `latest`) or a `push_*` branch (tagged `pre_*`), and on published releases.

Required GitHub secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Docker Compose Setup

A ready-to-use `compose.yml` is included in the repository root.

1. **Edit the environment variables** in `compose.yml`:

   | Variable | Description |
   |---|---|
   | `ADMIN_PASSWORD` | Password shown on the login page. Leave blank to disable login. |
   | `AUTH_SECRET` | Random secret for session signing. Generate with `openssl rand -base64 32`. |

2. **Start the container** via SSH:
   ```bash
   docker compose up -d
   ```
3. Open the app at `http://<host>:3000`.

> **Data persistence**: the SQLite database is stored in the `./data` subfolder next to `compose.yml`. Back this folder up to keep your trade history safe.

### Updating to a new version

```bash
docker compose pull
docker compose up -d
```

## Using the Application

### First-time setup

After the app starts, navigate to **Config** (gear icon in the sidebar) and:

1. **Add Assets** — Add the tickers you trade (e.g. BTC, ETH, SOL, AAPL). Set the decimal precision for native P&L display.
2. **Add Strategies** — Name your trading strategies (e.g. "Breakout", "Mean Reversion").
3. **Add Confluences** — Define your signal checklist items (e.g. "HTF trend aligned", "Volume spike", "Key level").

### Logging a trade

Go to **Journal** → click **New Trade**.

The form has four tabs:

| Tab | What to fill in |
|---|---|
| **Entry** | Asset, strategy, direction (Long/Short), entry tranches (price + size), stop-loss, TP levels |
| **Context** | Confluences that were present, reasoning, TradingView snapshot URLs |
| **Psychology** | Pre-trade emotion, post-trade reflection, mistakes made |
| **Results** | Exit tranches (price + size), close date, realized P&L |

Trades can be partially filled — e.g. log entry first, then come back to fill in exits after closing.

### Dashboard

The **Dashboard** page shows aggregated stats filterable by **asset** and **strategy**:

- Total trades, win rate, average RR
- Cumulative P&L equity curve
- Stats are shown in **native asset units** when filtered by asset, or **USD** otherwise

### Daily Journal

The **Diary** page lets you log daily analysis notes and attach TradingView chart snapshot URLs. Use it to record market observations and how you felt before/after trading sessions.

### Position Calculator

The **Position Calc** page helps size a position given your account size, risk percentage, entry price, and stop-loss level.

---

## Project Structure

```
src/
  actions/          Server actions (data mutations & aggregations)
  app/              Next.js pages (App Router)
    dashboard/      Strategy + asset dashboard
    journal/        Trade journal list & form
    config/         Strategy configuration
    position-calc/  Position sizing calculator
    project24/      Project-24 goal tracker
  components/       Shared UI (AppShell, DashboardView, PlotlyChart)
  lib/
    trade-calc.ts   Pure calculation functions (RR, weighted avg, etc.)
    trade-utils.ts  Derived metrics + TradeFormData type
    prisma.ts       Prisma singleton
prisma/
  schema.prisma     Database schema
  migrations/       SQL migration files
```

## Key Concepts

### Planned RR vs Actual RR

- **Planned RR** — Calculated at trade entry: `expectedProfit / expectedSlCost`, based on average entry price, TP levels, and stop-loss.
- **Actual RR** — Calculated after close: `(avgExit − avgEntry) / (avgEntry − SL)`.

### Assets

The `asset` field on each trade defaults to `"BTC"`. You can select any ticker (BTC, ETH, SOL, BNB, AAPL, TSLA, etc.) when logging a trade. The dashboard filters and formats P&L labels according to the selected asset.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Prettier format |
| `npm run format:all` | Format + lint + type-check |


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
