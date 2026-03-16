"use client";

import type { TradeWithRelations } from "@/lib/db/trades";
import {
  fmt,
  fmtDate,
  fmtNativePnl,
  fmtUsd,
  parseTranches,
  parseSnapshots,
} from "@/lib/journal-utils";
import { deriveTradeMetrics } from "@/lib/trade-utils";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export function TradeViewDialog({
  open,
  onClose,
  trade,
}: {
  open: boolean;
  onClose: () => void;
  trade: TradeWithRelations | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  if (!trade) return null;

  const entries = parseTranches(trade.entries);
  const tps = parseTranches(trade.tps);
  const exits = parseTranches(trade.exits);
  const metrics = deriveTradeMetrics({
    direction: trade.direction,
    entries,
    tps,
    exits,
    stopLoss: trade.stopLoss ?? undefined,
  });
  const snapImages = parseSnapshots(trade.snapshots).filter((i) =>
    i.url.trim(),
  );
  const confluenceNames = trade.confluences.map((tc) => tc.confluence.name);

  const row = (label: string, value: React.ReactNode) => (
    <Stack direction="row" spacing={1} mb={0.5}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 140 }}
      >
        {label}
      </Typography>
      <Typography variant="caption">{value}</Typography>
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Trade #{trade.id}{" "}
        <Chip
          label={trade.direction}
          color={trade.direction === "Long" ? "success" : "error"}
          size="small"
          sx={{ ml: 1 }}
        />
        {trade.asset && (
          <Chip
            label={trade.asset.ticker}
            size="small"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        )}
        {metrics.winLoss !== "NA" && (
          <Chip
            label={metrics.winLoss}
            color={metrics.winLoss === "WIN" ? "success" : "error"}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Context
            </Typography>
            {row("Entry Date", fmtDate(trade.entryDate))}
            {row("Exit Date", fmtDate(trade.exitDate))}
            {row("Asset", trade.asset?.ticker ?? "—")}
            {row("Strategy", trade.strategy?.name ?? "—")}
            {row("Trade Type", trade.tradeType ?? "—")}
            {row("Entry TF", trade.entryPointTF ?? "—")}
            {row("Analyse TF", trade.analyseTF ?? "—")}
            {row("Daily Flow", trade.dailyOrderFlow ?? "—")}
            {row("4h Flow", trade.orderFlow4h ?? "—")}
            {row("1h Flow", trade.orderFlow1h ?? "—")}
            {confluenceNames.length > 0 &&
              row("Confluences", confluenceNames.join(", "))}
            {trade.otherConfluence &&
              row("Other Confluence", trade.otherConfluence)}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Metrics
            </Typography>
            {row(
              "Avg Entry",
              metrics.avgEntry ? `$${fmt(metrics.avgEntry)}` : "—",
            )}
            {row("Avg TP", metrics.avgTp ? `$${fmt(metrics.avgTp)}` : "—")}
            {row(
              "Avg Exit",
              metrics.avgExit ? `$${fmt(metrics.avgExit)}` : "—",
            )}
            {row("Stop Loss", trade.stopLoss ? `$${fmt(trade.stopLoss)}` : "—")}
            {row("Profit %", fmt(metrics.profitPct) + "%")}
            {row("SL %", fmt(metrics.slPct) + "%")}
            {row(
              "PRRR (Planned Risk-Reward Ratio)",
              fmt(metrics.plannedRiskRewardRatio, 3),
            )}
            {row(
              "ARRR (Actual Risk-Reward Ratio)",
              fmt(metrics.actualRiskRewardRatio, 3),
            )}
            {row(
              "P&L (native)",
              fmtNativePnl(trade.closedPnlAsset, trade.asset),
            )}
            {row("P&L (USD)", fmtUsd(trade.closedPnlUsd))}
            {row(
              "Acct Balance",
              trade.accountBalance ? `$${fmt(trade.accountBalance)}` : "—",
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Entries
            </Typography>
            {entries
              .filter((t) => t.price || t.qty)
              .map((t, i) => (
                <Typography key={i} variant="caption" display="block">
                  #{i + 1}: ${fmt(t.price)} × {fmt(t.qty, 4)}
                </Typography>
              ))}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Take Profits
            </Typography>
            {tps
              .filter((t) => t.price || t.qty)
              .map((t, i) => (
                <Typography key={i} variant="caption" display="block">
                  #{i + 1}: ${fmt(t.price)} × {fmt(t.qty, 4)}
                </Typography>
              ))}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              Exits
            </Typography>
            {exits
              .filter((t) => t.price || t.qty)
              .map((t, i) => (
                <Typography key={i} variant="caption" display="block">
                  #{i + 1}: ${fmt(t.price)} × {fmt(t.qty, 4)}
                </Typography>
              ))}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              Psychology &amp; Notes
            </Typography>
            {row("Feel about trade", trade.feelAboutTrade ?? "—")}
            {row("Feel general", trade.feelGeneral ?? "—")}
            {row("Followed plan", trade.followedPlan ?? "—")}
            {row("Happy with result", trade.happyWithResult ?? "—")}
            {trade.notes && (
              <Typography
                variant="caption"
                display="block"
                mt={0.5}
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {trade.notes}
              </Typography>
            )}
          </Grid>
          {snapImages.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                TradingView Snapshots ({snapImages.length})
              </Typography>
              <Grid container spacing={1}>
                {snapImages.map((img, i) => (
                  <Grid
                    key={i}
                    size={{ xs: 12, sm: snapImages.length > 1 ? 6 : 12 }}
                  >
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() => setPreviewUrl(img.url)}
                    >
                      <Box
                        component="img"
                        src={img.url}
                        alt={`Snapshot ${i + 1}`}
                        sx={{
                          width: "100%",
                          height: 180,
                          objectFit: "contain",
                          display: "block",
                          bgcolor: "action.selected",
                        }}
                      />
                      <Box sx={{ px: 1, py: 0.5, bgcolor: "action.hover" }}>
                        {img.comment && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ mb: 0.25, fontStyle: "italic" }}
                          >
                            {img.comment}
                          </Typography>
                        )}
                        <MuiLink
                          suppressHydrationWarning
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="caption"
                          display="block"
                          onClick={(e) => e.stopPropagation()}
                          noWrap
                        >
                          {img.url}
                        </MuiLink>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Snapshot Preview</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={previewUrl ?? ""}
            alt="Snapshot preview"
            sx={{ width: "100%", objectFit: "contain", maxHeight: "80vh" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            href={previewUrl ?? ""}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in TradingView
          </Button>
          <Button onClick={() => setPreviewUrl(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
