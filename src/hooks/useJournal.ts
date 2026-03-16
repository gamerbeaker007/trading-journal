"use client";

import { deleteTradeAction, type TradeWithRelations } from "@/lib/db/trades";
import { type TradeFormData } from "@/lib/trade-utils";
import { useState, useTransition } from "react";
import { parseTranches } from "@/lib/journal-utils";

export function useJournal() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewTrade, setViewTrade] = useState<TradeWithRelations | null>(null);
  const [editTarget, setEditTarget] = useState<
    { id: number; data: TradeFormData } | undefined
  >();
  const [isPending, startTransition] = useTransition();

  const openAdd = () => {
    setEditTarget(undefined);
    setDialogOpen(true);
  };

  const openEdit = (trade: TradeWithRelations) => {
    const data: TradeFormData = {
      assetId: trade.assetId ?? undefined,
      entryDate: trade.entryDate?.toISOString().slice(0, 16),
      exitDate: trade.exitDate?.toISOString().slice(0, 16),
      entryPointTF: trade.entryPointTF ?? undefined,
      analyseTF: trade.analyseTF ?? undefined,
      tradeType: trade.tradeType ?? undefined,
      strategyId: trade.strategyId ?? undefined,
      dailyOrderFlow: trade.dailyOrderFlow ?? undefined,
      orderFlow4h: trade.orderFlow4h ?? undefined,
      orderFlow1h: trade.orderFlow1h ?? undefined,
      confluenceIds: trade.confluences.map((tc) => tc.confluenceId),
      otherConfluence: trade.otherConfluence ?? undefined,
      snapshots: trade.snapshots ?? undefined,
      direction: trade.direction,
      entries: parseTranches(trade.entries),
      tps: parseTranches(trade.tps),
      exits: parseTranches(trade.exits),
      stopLoss: trade.stopLoss ?? undefined,
      closedPnlAsset: trade.closedPnlAsset ?? undefined,
      closedPnlUsd: trade.closedPnlUsd ?? undefined,
      accountBalance: trade.accountBalance ?? undefined,
      feelAboutTrade: trade.feelAboutTrade ?? undefined,
      feelGeneral: trade.feelGeneral ?? undefined,
      followedPlan: trade.followedPlan ?? undefined,
      happyWithResult: trade.happyWithResult ?? undefined,
      notes: trade.notes ?? undefined,
    };
    setEditTarget({ id: trade.id, data });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this trade?")) return;
    startTransition(() => deleteTradeAction(id));
  };

  return {
    dialogOpen,
    setDialogOpen,
    viewTrade,
    setViewTrade,
    editTarget,
    isPending,
    openAdd,
    openEdit,
    handleDelete,
  };
}
