"use client";

import { getDashboardStatsAction, getPnlSeriesAction } from "@/lib/db/trades";
import type {
  DashboardStats,
  PnlPoint,
} from "@/components/dashboard/DashboardView";
import type { Asset, Strategy } from "@/generated/prisma";
import { useState, useTransition } from "react";

export function useDashboard({
  strategies,
  assets,
  initialStats,
  initialPnl,
}: {
  strategies: Strategy[];
  assets: Asset[];
  initialStats: DashboardStats;
  initialPnl: PnlPoint[];
}) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [stats, setStats] = useState(initialStats);
  const [pnl, setPnl] = useState(initialPnl);
  const [isPending, startTransition] = useTransition();

  const refresh = (strategyId: string, assetId: string) => {
    const sid = strategyId === "" ? undefined : Number(strategyId);
    const aid = assetId === "" ? undefined : Number(assetId);
    startTransition(async () => {
      const [s, p] = await Promise.all([
        getDashboardStatsAction(sid, aid),
        getPnlSeriesAction(sid, aid),
      ]);
      setStats(s);
      setPnl(p);
    });
  };

  const handleStrategyChange = (value: string) => {
    setSelectedStrategyId(value);
    refresh(value, selectedAssetId);
  };

  const handleAssetChange = (value: string) => {
    setSelectedAssetId(value);
    refresh(selectedStrategyId, value);
  };

  const selectedStrategy = strategies.find(
    (s) => String(s.id) === selectedStrategyId,
  );
  const selectedAsset = assets.find((a) => String(a.id) === selectedAssetId);

  const title = [
    selectedAsset ? selectedAsset.ticker : "All Assets",
    selectedStrategy ? `Strategy: ${selectedStrategy.name}` : "All Strategies",
  ].join(" · ");

  return {
    selectedStrategyId,
    selectedAssetId,
    stats,
    pnl,
    isPending,
    title,
    handleStrategyChange,
    handleAssetChange,
  };
}
