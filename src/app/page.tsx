import {
  getDashboardStatsAction,
  getAssetsAction,
  getPnlSeriesAction,
} from "@/lib/db/trades";
import { prisma } from "@/lib/prisma";
import { StrategyDashboardClient } from "@/components/dashboard/StrategyDashboardClient";

export default async function StrategyDashboardPage() {
  const [strategies, assets, stats, pnl] = await Promise.all([
    prisma.strategy.findMany({ orderBy: { name: "asc" } }),
    getAssetsAction(),
    getDashboardStatsAction(),
    getPnlSeriesAction(),
  ]);

  return (
    <StrategyDashboardClient
      strategies={strategies}
      assets={assets}
      initialStats={stats}
      initialPnl={pnl}
    />
  );
}
