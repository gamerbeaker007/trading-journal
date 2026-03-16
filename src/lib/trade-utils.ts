import {
  applyPct,
  profitPct,
  RiskRewardRatio,
  slPct,
  totalQty,
  weightedAvg,
  winLoss,
  type Direction,
} from "@/lib/trade-calc";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tranche = { price?: number; qty?: number };

export type TradeFormData = {
  assetId?: number;
  confluenceIds?: number[];
  otherConfluence?: string;
  entryDate?: string;
  exitDate?: string;
  entryPointTF?: string;
  analyseTF?: string;
  tradeType?: string;
  strategyId?: number;
  dailyOrderFlow?: string;
  orderFlow4h?: string;
  orderFlow1h?: string;
  snapshots?: string;
  direction: string;
  entries: Tranche[];
  tps: Tranche[];
  exits: Tranche[];
  stopLoss?: number;
  closedPnlAsset?: number;
  closedPnlUsd?: number;
  accountBalance?: number;
  feelAboutTrade?: string;
  feelGeneral?: string;
  followedPlan?: string;
  happyWithResult?: string;
  notes?: string;
};

// ─── Derived metrics ─────────────────────────────────────────────────────────

export function deriveTradeMetrics(d: TradeFormData) {
  const dir = d.direction as Direction;
  const totalQuantity = totalQty(d.entries ?? []);
  const avgEntry = weightedAvg(d.entries ?? []);
  const avgTp = weightedAvg(d.tps ?? []);
  const avgExit = weightedAvg(d.exits ?? []);

  const sl = d.stopLoss ?? null;

  const profPct = avgEntry && avgTp ? profitPct(dir, avgEntry, avgTp) : null;
  const slPctVal = sl && avgEntry ? slPct(dir, avgEntry, sl) : null;
  const expSl =
    totalQuantity && slPctVal != null
      ? applyPct(totalQuantity, slPctVal)
      : null;
  const expProfit =
    totalQuantity && profPct != null ? applyPct(totalQuantity, profPct) : null;
  const prrrVal =
    avgEntry && avgTp && sl ? RiskRewardRatio(avgEntry, avgTp, sl) : null;
  const arrrVal =
    avgEntry && avgExit && sl ? RiskRewardRatio(avgEntry, avgExit, sl) : null;
  const result = winLoss(arrrVal);

  return {
    totalQuantity,
    avgEntry,
    avgTp,
    avgExit,
    profitPct: profPct,
    slPct: slPctVal,
    expSlCost: expSl,
    expProfit,
    plannedRiskRewardRatio: prrrVal,
    actualRiskRewardRatio: arrrVal,
    winLoss: result,
  };
}
