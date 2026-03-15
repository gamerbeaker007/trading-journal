/**
 * Trading calculation utilities
 */

export type Direction = "Long" | "Short";

// ─── Weighted Average ─────────────────────────────────────────────────────────

/** Weighted average of up to 4 price×quantity tranches */
export function weightedAvg(
  tranches: Array<{ price?: number | null; qty?: number | null }>,
): number | null {
  const filled = tranches.filter((t) => t.price && t.qty);
  if (filled.length === 0) return null;
  const totalQty = filled.reduce((s, t) => s + t.qty!, 0);
  if (totalQty === 0) return null;
  const totalValue = filled.reduce((s, t) => s + t.price! * t.qty!, 0);
  return totalValue / totalQty;
}

/** Total quantity across up to 4 tranches */
export function totalQty(tranches: Array<{ qty?: number | null }>): number {
  return tranches.reduce((s, t) => s + (t.qty ?? 0), 0);
}

// ─── Profit / SL percentages ─────────────────────────────────────────────────

/**
 * Profit % to TP from avg entry
 * Long:  (avgTP - avgEntry) / avgEntry * 100
 * Short: (avgEntry - avgTP) / avgEntry * 100
 */
export function profitPct(
  direction: Direction,
  avgEntry: number,
  avgTp: number,
): number {
  return direction === "Long"
    ? ((avgTp - avgEntry) / avgEntry) * 100
    : ((avgEntry - avgTp) / avgEntry) * 100;
}

/**
 * SL % from avg entry
 * Long:  (avgEntry - sl) / avgEntry * 100
 * Short: (sl - avgEntry) / avgEntry * 100
 */
export function slPct(
  direction: Direction,
  avgEntry: number,
  sl: number,
): number {
  return direction === "Long"
    ? ((avgEntry - sl) / avgEntry) * 100
    : ((sl - avgEntry) / avgEntry) * 100;
}

/**
 * Apply a percentage to a base value: base * pct / 100
 * Used for both expected SL cost and expected profit.
 */
export function applyPct(base: number, pct: number): number {
  return (base / 100) * pct;
}

/**
 * Risk-Reward Ratio — covers both Planned and Actual RR:
 *   PRRR: RiskRewardRatio(avgEntry, avgTp,   sl)
 *   ARRR: RiskRewardRatio(avgEntry, avgExit, sl)
 *
 * Formula: (target - entry) / (entry - sl)
 * This is equivalent to profitPct / slPct once the qty cancels.
 */
export function RiskRewardRatio(
  avgEntry: number,
  target: number,
  sl: number,
): number | null {
  const denom = avgEntry - sl;
  if (denom === 0) return null;
  return (target - avgEntry) / denom;
}

/**
 * Win/Loss classification
 */
export function winLoss(realRrValue: number | null): "WIN" | "LOSS" | "NA" {
  if (realRrValue === null) return "NA";
  return realRrValue > 0 ? "WIN" : "LOSS";
}

// ─── Position Calculator (Position calc sheet) ───────────────────────────────
export interface PositionCalc {
  accountAmount: number;
  riskPct: number;
  direction: Direction;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  /** Intermediate TP price */
  tpIntermediate?: number;
  /** Percentage of position to close at intermediate TP (0-100) */
  tpIntermediatePct?: number;
}

export interface PositionCalcResult {
  profitPct: number;
  slPct: number;
  totalAmount: number;
  totalAmountBtc: number;
  slCost: number;
  profitAtTP: number;
  profitAtTPBtc: number;
  plannedRiskReward: number;
  leverageNeeded: number;
  // Intermediate TP breakdown (B26-B33)
  intermediateTPProfitPct: number | null;
  intermediateQtyAmount: number | null;
  intermediateProfit: number | null;
  remainderProfitPct: number | null;
  remainderAmount: number | null;
  remainderProfit: number | null;
  totalProfitPct: number | null;
  totalProfit: number | null;
}

/**
 * Position calculation with optional intermediate TP
 */
export function calcPosition(p: PositionCalc): PositionCalcResult {
  const willingToRisk = (p.accountAmount / 100) * p.riskPct;

  const profitPctVal =
    p.direction === "Long"
      ? round(((p.takeProfit - p.entryPrice) / p.entryPrice) * 100, 2)
      : round(((p.entryPrice - p.takeProfit) / p.entryPrice) * 100, 2);

  const slPctVal =
    p.direction === "Long"
      ? round(((p.entryPrice - p.stopLoss) / p.entryPrice) * 100, 2)
      : round(((p.stopLoss - p.entryPrice) / p.entryPrice) * 100, 2);

  const totalAmount = round(willingToRisk / (slPctVal / 100), 2);
  const totalAmountBtc = round(totalAmount / p.entryPrice, 4);

  const slCost = round(applyPct(totalAmount, slPctVal), 2);

  const profitAtTP = round(applyPct(totalAmount, profitPctVal), 2);
  const profitAtTPBtc = round(profitAtTP / p.takeProfit, 4);

  const plannedRiskReward = round(
    RiskRewardRatio(p.entryPrice, p.takeProfit, p.stopLoss) ?? 0,
    3,
  );

  const leverageNeeded = round(totalAmount / p.accountAmount, 2);

  let intermediateTPProfitPct: number | null = null;
  let intermediateQtyAmount: number | null = null;
  let intermediateProfit: number | null = null;
  let remainderProfitPct: number | null = null;
  let remainderAmount: number | null = null;
  let remainderProfit: number | null = null;
  let totalProfitPct: number | null = null;
  let totalProfit: number | null = null;

  if (p.tpIntermediate != null && p.tpIntermediatePct != null) {
    intermediateTPProfitPct =
      p.direction === "Long"
        ? round(((p.tpIntermediate - p.entryPrice) / p.entryPrice) * 100, 2)
        : round(((p.entryPrice - p.tpIntermediate) / p.entryPrice) * 100, 2);

    intermediateQtyAmount = round(
      applyPct(totalAmount, p.tpIntermediatePct),
      2,
    );

    intermediateProfit = round(
      applyPct(intermediateQtyAmount, intermediateTPProfitPct),
      2,
    );

    // Remainder still has cost basis at entry price, not at the intermediate TP
    remainderProfitPct =
      p.direction === "Long"
        ? round(((p.takeProfit - p.entryPrice) / p.entryPrice) * 100, 2)
        : round(((p.entryPrice - p.takeProfit) / p.entryPrice) * 100, 2);

    remainderAmount = round(totalAmount - intermediateQtyAmount, 2);
    remainderProfit = round(applyPct(remainderAmount, remainderProfitPct!), 2);
    totalProfit = round(intermediateProfit + remainderProfit, 2);
    // Effective yield on the full position
    totalProfitPct = round((totalProfit / totalAmount) * 100, 2);
  }

  return {
    profitPct: profitPctVal,
    slPct: slPctVal,
    totalAmount,
    totalAmountBtc,
    slCost,
    profitAtTP,
    profitAtTPBtc,
    plannedRiskReward,
    leverageNeeded,
    intermediateTPProfitPct,
    intermediateQtyAmount,
    intermediateProfit,
    remainderProfitPct,
    remainderAmount,
    remainderProfit,
    totalProfitPct,
    totalProfit,
  };
}

// ─── Dashboard aggregations ───────────────────────────────────────────────────

export interface TradeSummary {
  closedPnlBtc: number | null;
  closedPnlUsd: number | null;
  realRR: number | null;
}

/** Win rate from a list of trade summaries */
export function calcWinRate(trades: TradeSummary[]): number | null {
  const closed = trades.filter(
    (t) => t.realRR !== null && t.closedPnlUsd !== null,
  );
  if (closed.length === 0) return null;
  const wins = closed.filter((t) => (t.realRR ?? 0) > 0).length;
  return wins / closed.length;
}

/** Cumulative P&L in BTC */
export function cumulativePnlBtc(trades: TradeSummary[]): number {
  return trades.reduce((s, t) => s + (t.closedPnlBtc ?? 0), 0);
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
