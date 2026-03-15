/**
 * Trading calculation utilities
 * Converted from Excel formulas in BitcoinJournal_v1.1_DC.xlsx
 * and Project-24-Journal_v1.1.xlsx
 */

export type Direction = "Long" | "Short";

// ─── Weighted Average ─────────────────────────────────────────────────────────

/** Weighted average of up to 4 price×quantity tranches (mirrors AN/AO/BC cols) */
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

/** Total quantity across up to 4 tranches (mirrors AM col) */
export function totalQty(tranches: Array<{ qty?: number | null }>): number {
  return tranches.reduce((s, t) => s + (t.qty ?? 0), 0);
}

// ─── Profit / SL percentages ─────────────────────────────────────────────────

/**
 * Profit % to TP from avg entry  (mirrors AP col)
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
 * SL % from avg entry  (mirrors AQ col)
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
 * Expected SL cost in quantity units  (mirrors AR col)
 * expSlCost = totalQty / 100 * slPct
 */
export function expectedSlCost(qty: number, slPctValue: number): number {
  return (qty / 100) * slPctValue;
}

/**
 * Expected profit in quantity units  (mirrors AS col)
 * expProfit = totalQty / 100 * profitPct
 */
export function expectedProfit(qty: number, profitPctValue: number): number {
  return (qty / 100) * profitPctValue;
}

/**
 * Planned Risk-Reward Ratio  (mirrors AT col)
 * Planned RR = expProfit / expSlCost  — calculated at trade entry from entry/TP vs SL
 */
export function rrr(exp: number, slCost: number): number | null {
  if (slCost === 0) return null;
  return exp / slCost;
}

/**
 * Actual Risk-Reward Ratio after close  (mirrors BF/BI col)
 * Actual RR = (avgExit - avgEntry) / (avgEntry - sl)
 * Note: same formula for both Long and Short in the workbook
 */
export function realRR(
  avgEntry: number,
  avgExit: number,
  sl: number,
): number | null {
  const denom = avgEntry - sl;
  if (denom === 0) return null;
  return (avgExit - avgEntry) / denom;
}

/**
 * Win/Loss classification  (mirrors BG/BJ col)
 */
export function winLoss(realRrValue: number | null): "WIN" | "LOSS" | "NA" {
  if (realRrValue === null) return "NA";
  return realRrValue > 0 ? "WIN" : "LOSS";
}

// ─── Position Calculator (Position calc sheet) ───────────────────────────────

export interface PositionCalcSection1 {
  /** Account amount in $ */
  accountAmount: number;
  /** Risk percentage (%) */
  riskPct: number;
  /** Stop loss percentage (%) */
  stopLossPct: number;
}

export interface PositionCalcSection1Result {
  /** Willing to risk = accountAmount * riskPct / 100  (B6) */
  willingToRisk: number;
  /** Total position size = willingToRisk / (stopLossPct / 100)  (B7) */
  totalAmount: number;
  /** Leverage needed = totalAmount / accountAmount  (B8) */
  leverageNeeded: number;
}

/**
 * Section 1: Stop Loss % Calculation
 * =B2/100*B3  → willing to risk
 * =(B2/100*B3)/(B4/100) → total amount (position size)
 * =B7/B2 → leverage
 */
export function calcPositionSection1(
  p: PositionCalcSection1,
): PositionCalcSection1Result {
  const willingToRisk = (p.accountAmount / 100) * p.riskPct;
  const totalAmount = willingToRisk / (p.stopLossPct / 100);
  const leverageNeeded = totalAmount / p.accountAmount;
  return { willingToRisk, totalAmount, leverageNeeded };
}

export interface PositionCalcSection2 {
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

export interface PositionCalcSection2Result {
  /** Profit % to TP  (B16) */
  profitPct: number;
  /** SL % from entry  (B17) */
  slPct: number;
  /** Total position size in $  (B18) */
  totalAmount: number;
  /** Total position size in BTC  (C18) */
  totalAmountBtc: number;
  /** Expected SL cost in $  (B19) */
  slCost: number;
  /** Expected profit at TP in $  (B20) */
  profitAtTP: number;
  /** Expected profit at TP in BTC  (C20) */
  profitAtTPBtc: number;
  /** Risk-Reward Ratio  (B21) */
  rrr: number;
  /** Leverage needed  (B24) */
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
 * Section 2: Exact calculation with optional intermediate TP
 * Based on Position calc sheet formulas (B11:D33)
 */
export function calcPositionSection2(
  p: PositionCalcSection2,
): PositionCalcSection2Result {
  const willingToRisk = (p.accountAmount / 100) * p.riskPct;

  // Profit % to full TP  (B16)
  const profitPctVal =
    p.direction === "Long"
      ? round(((p.takeProfit - p.entryPrice) / p.entryPrice) * 100, 2)
      : round(((p.entryPrice - p.takeProfit) / p.entryPrice) * 100, 2);

  // SL %  (B17)
  const slPctVal =
    p.direction === "Long"
      ? round(((p.entryPrice - p.stopLoss) / p.entryPrice) * 100, 2)
      : round(((p.stopLoss - p.entryPrice) / p.entryPrice) * 100, 2);

  // Total position size  (B18): willingToRisk / (slPct / 100)
  const totalAmount = round(willingToRisk / (slPctVal / 100), 2);
  const totalAmountBtc = round(totalAmount / p.entryPrice, 4);

  // SL cost  (B19)
  const slCost = round((totalAmount / 100) * slPctVal, 2);

  // Profit at TP  (B20)
  const profitAtTP = round((totalAmount / 100) * profitPctVal, 2);
  const profitAtTPBtc = round(profitAtTP / p.takeProfit, 4);

  // RRR  (B21)
  const rrrVal = round(profitAtTP / slCost, 3);

  // Leverage  (B24)
  const leverageNeeded = round(totalAmount / p.accountAmount, 2);

  // Intermediate TP  (B26-B33)
  let intermediateTPProfitPct: number | null = null;
  let intermediateQtyAmount: number | null = null;
  let intermediateProfit: number | null = null;
  let remainderProfitPct: number | null = null;
  let remainderAmount: number | null = null;
  let remainderProfit: number | null = null;
  let totalProfitPct: number | null = null;
  let totalProfit: number | null = null;

  if (p.tpIntermediate != null && p.tpIntermediatePct != null) {
    // B27: profit % to intermediate TP from entry
    intermediateTPProfitPct =
      p.direction === "Long"
        ? round(((p.tpIntermediate - p.entryPrice) / p.entryPrice) * 100, 2)
        : round(((p.entryPrice - p.tpIntermediate) / p.entryPrice) * 100, 2);

    // C27: amount at intermediate TP  = totalAmount / 100 * tpIntermediatePct
    intermediateQtyAmount = round((totalAmount / 100) * p.tpIntermediatePct, 2);

    // B28: profit at intermediate = intermediateQtyAmount / 100 * intermediateTPProfitPct
    intermediateProfit = round(
      (intermediateQtyAmount / 100) * intermediateTPProfitPct,
      2,
    );

    // B29: remainder profit % = from intermediate to full TP
    remainderProfitPct =
      p.direction === "Long"
        ? round(((p.takeProfit - p.tpIntermediate) / p.tpIntermediate) * 100, 2)
        : round(((p.entryPrice - p.takeProfit) / p.entryPrice) * 100, 2);

    // C29: remaining amount = totalAmount - intermediateQtyAmount
    remainderAmount = round(totalAmount - intermediateQtyAmount, 2);

    // B30: remainder profit
    remainderProfit = round((remainderAmount / 100) * remainderProfitPct!, 2);

    // B32: total profit %
    totalProfitPct = round(remainderProfitPct! + intermediateTPProfitPct, 2);

    // B33: total profit
    totalProfit = round(intermediateProfit + remainderProfit, 2);
  }

  return {
    profitPct: profitPctVal,
    slPct: slPctVal,
    totalAmount,
    totalAmountBtc,
    slCost,
    profitAtTP,
    profitAtTPBtc,
    rrr: rrrVal,
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

/** Win rate from a list of trade summaries  (mirrors B3 Dashboard) */
export function calcWinRate(trades: TradeSummary[]): number | null {
  const closed = trades.filter(
    (t) => t.realRR !== null && t.closedPnlUsd !== null,
  );
  if (closed.length === 0) return null;
  const wins = closed.filter((t) => (t.realRR ?? 0) > 0).length;
  return wins / closed.length;
}

/** Cumulative P&L in BTC  (mirrors A10 Dashboard) */
export function cumulativePnlBtc(trades: TradeSummary[]): number {
  return trades.reduce((s, t) => s + (t.closedPnlBtc ?? 0), 0);
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
