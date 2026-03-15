import type { Tranche, TradeFormData } from "@/lib/trade-utils";

export const TRADE_TYPES = [
  "Swing Trade",
  "Short Term Trade",
  "Day Trade & Scalps",
];
export const FLOWS = ["Bullish", "Bearish", "Ranging"];
export const TF_OPTIONS = [
  "1m", "3m", "5m", "15m", "30m", "1h", "4h", "1D", "1W",
];

export function fmt(n: number | null | undefined, d = 2) {
  if (n == null) return "—";
  return n.toFixed(d);
}

export function fmtNativePnl(
  n: number | null | undefined,
  asset: { ticker: string; decimals: number } | null | undefined,
): string {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  const abs = Math.abs(n);
  const dec = asset?.decimals ?? 8;
  const ticker = asset?.ticker ?? "BTC";
  const symbol =
    ticker === "BTC" ? "₿"
    : ticker === "ETH" ? "Ξ"
    : ticker === "SOL" ? "◎"
    : "";
  if (symbol) return `${sign}${symbol} ${abs.toFixed(dec)}`;
  return `${sign}${abs.toFixed(dec)} ${ticker}`;
}

export function fmtUsd(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : "-"}$${Math.abs(n).toFixed(2)}`;
}

export function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseTranches(json: string | null | undefined): Tranche[] {
  if (!json) return [{}];
  try {
    const parsed = JSON.parse(json) as Tranche[];
    return parsed.length > 0 ? parsed : [{}];
  } catch {
    return [{}];
  }
}

export const emptyForm = (): TradeFormData => ({
  direction: "Long",
  tradeType: "Short Term Trade",
  entries: [{}],
  tps: [{}],
  exits: [{}],
  confluenceIds: [],
});
