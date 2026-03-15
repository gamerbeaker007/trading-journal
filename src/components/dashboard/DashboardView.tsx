"use client";

import PlotlyChart from "@/components/charts/PlotlyChart";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";

// ─── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "success" | "error" | "warning" | "info";
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography
          variant="h5"
          fontWeight={700}
          color={color ? `${color}.main` : "text.primary"}
          mt={0.5}
        >
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard stats grid ─────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  winners: number;
  losers: number;
  winRate: number | null;
  /** Native asset P&L — only set when filtering by a specific asset */
  totalPnlNative: number | null;
  /** Always USD */
  totalPnlUsd: number;
  amountWin: number;
  amountLoss: number;
  maxWin: number;
  maxLoss: number;
  winAvg: number | null;
  lossAvg: number | null;
  assetTicker: string | null;
  assetDecimals: number;
}

export interface PnlPoint {
  date: string;
  pnl: number;
  cumulative: number;
}

function assetSymbol(ticker: string | null): string {
  if (!ticker || ticker === "BTC") return "₿";
  if (ticker === "ETH") return "Ξ";
  if (ticker === "SOL") return "◎";
  return ticker;
}

function fmtNative(
  n: number,
  ticker: string | null,
  decimals: number,
  signed = false,
) {
  const sign = signed ? (n >= 0 ? "+" : "") : "";
  const sym = assetSymbol(ticker);
  const isCrypto = ["BTC", "ETH", "SOL", "BNB"].includes(ticker ?? "BTC");
  return isCrypto
    ? `${sign}${sym} ${n.toFixed(decimals)}`
    : `${sign}${n.toFixed(decimals)} ${sym}`;
}

function fmtPct(n: number | null) {
  if (n == null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function fmtUsd(n: number, signed = false) {
  const sign = signed ? (n >= 0 ? "+" : "-") : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function DashboardView({
  stats,
  pnlSeries,
  title,
}: {
  stats: DashboardStats;
  pnlSeries: PnlPoint[];
  title: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ticker = stats.assetTicker;
  const decimals = stats.assetDecimals;

  const plotLayout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: isDark ? "#e0e0e0" : "#333", size: 12 },
    margin: { l: 60, r: 20, t: 20, b: 60 },
    xaxis: { gridcolor: isDark ? "#2a2a2a" : "#e0e0e0" },
    yaxis: { gridcolor: isDark ? "#2a2a2a" : "#e0e0e0", tickprefix: "$" },
  };

  const greenColor = "#4caf50";
  const redColor = "#f44336";

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Win Rate"
            value={fmtPct(stats.winRate)}
            sub={`${stats.winners}W / ${stats.losers}L`}
            color={
              (stats.winRate ?? 0) >= 0.5
                ? "success"
                : (stats.winRate ?? 0) >= 0.35
                  ? "warning"
                  : "error"
            }
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Total Trades"
            value={stats.total}
            sub="closed trades"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Cumulative P&L (USD)"
            value={fmtUsd(stats.totalPnlUsd, true)}
            color={stats.totalPnlUsd >= 0 ? "success" : "error"}
          />
        </Grid>
        {stats.totalPnlNative != null && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={`Cumulative P&L (${ticker})`}
              value={fmtNative(stats.totalPnlNative, ticker, decimals, true)}
              color={stats.totalPnlNative >= 0 ? "success" : "error"}
            />
          </Grid>
        )}
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Amount Won (USD)"
            value={fmtUsd(stats.amountWin, true)}
            sub={`Avg win: ${stats.winAvg != null ? fmtUsd(stats.winAvg) : "—"}`}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Amount Lost (USD)"
            value={fmtUsd(stats.amountLoss, true)}
            sub={`Avg loss: ${stats.lossAvg != null ? fmtUsd(stats.lossAvg) : "—"}`}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Max Win (USD)"
            value={fmtUsd(stats.maxWin)}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Max Loss (USD)"
            value={fmtUsd(stats.maxLoss)}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      {pnlSeries.length > 0 ? (
        <Grid container spacing={3}>
          {/* Cumulative P&L equity curve */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Equity Curve (Cumulative P&L)
                </Typography>
                <PlotlyChart
                  data={[
                    {
                      x: pnlSeries.map((p) => p.date),
                      y: pnlSeries.map((p) => p.cumulative),
                      type: "scatter",
                      mode: "lines+markers",
                      line: {
                        color:
                          pnlSeries[pnlSeries.length - 1]?.cumulative >= 0
                            ? greenColor
                            : redColor,
                        width: 2,
                      },
                      marker: { size: 5 },
                      fill: "tozeroy",
                      fillcolor:
                        pnlSeries[pnlSeries.length - 1]?.cumulative >= 0
                          ? "rgba(76,175,80,0.1)"
                          : "rgba(244,67,54,0.1)",
                      name: "Cumulative P&L",
                    },
                  ]}
                  layout={{ ...plotLayout, height: 300 } as never}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: "100%" }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Per-trade P&L bars */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Per-Trade P&L
                </Typography>
                <PlotlyChart
                  data={[
                    {
                      x: pnlSeries.map((_, i) => `T${i + 1}`),
                      y: pnlSeries.map((p) => p.pnl),
                      type: "bar",
                      marker: {
                        color: pnlSeries.map((p) =>
                          p.pnl >= 0 ? greenColor : redColor,
                        ),
                      },
                      name: "P&L (USD)",
                    },
                  ]}
                  layout={{ ...plotLayout, height: 300 } as never}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: "100%" }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center" py={4}>
              No closed trades yet — P&L charts will appear here once trades
              have exit data.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
