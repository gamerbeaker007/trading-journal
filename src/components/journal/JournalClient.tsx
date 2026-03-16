"use client";

import type { Asset, Confluence, Strategy } from "@/generated/prisma";
import type { TradeWithRelations } from "@/lib/db/trades";
import {
  fmt,
  fmtDate,
  fmtNativePnl,
  fmtUsd,
  parseTranches,
} from "@/lib/journal-utils";
import { deriveTradeMetrics } from "@/lib/trade-utils";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useJournal } from "../../hooks/useJournal";
import { TradeFormDialog } from "./TradeFormDialog";
import { TradeViewDialog } from "./TradeViewDialog";

export function JournalClient({
  trades,
  strategies,
  assets,
  confluences,
}: {
  trades: TradeWithRelations[];
  strategies: Strategy[];
  assets: Asset[];
  confluences: Confluence[];
}) {
  const {
    dialogOpen,
    setDialogOpen,
    viewTrade,
    setViewTrade,
    editTarget,
    isPending,
    openAdd,
    openEdit,
    handleDelete,
  } = useJournal();

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Trade Journal</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Log Trade
        </Button>
      </Stack>

      {trades.length === 0 && (
        <Alert severity="info">
          No trades logged yet. Click &quot;Log Trade&quot; to add your first
          trade.
        </Alert>
      )}

      <Box sx={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(128,128,128,0.2)" }}>
              {[
                "Entry Date",
                "Exit Date",
                "Asset",
                "Dir",
                "Strategy",
                "Entry TF",
                "Avg Entry",
                "Avg TP",
                "SL",
                "PRRR",
                "Avg Exit",
                "ARRR",
                "P&L",
                "P&L USD",
                "Result",
                "",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 8px",
                    textAlign: "left",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    opacity: 0.7,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
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
              const result = metrics.winLoss;

              return (
                <tr
                  key={trade.id}
                  style={{
                    borderBottom: "1px solid rgba(128,128,128,0.15)",
                    cursor: "pointer",
                  }}
                  onClick={() => setViewTrade(trade)}
                >
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                    {fmtDate(trade.entryDate)}
                  </td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                    {fmtDate(trade.exitDate)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {trade.asset?.ticker ?? "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <Chip
                      label={trade.direction}
                      color={trade.direction === "Long" ? "success" : "error"}
                      size="small"
                    />
                  </td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                    {trade.strategy?.name ?? "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {trade.entryPointTF ?? "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {metrics.avgEntry ? `$${fmt(metrics.avgEntry)}` : "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {metrics.avgTp ? `$${fmt(metrics.avgTp)}` : "—"}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {trade.stopLoss ? `$${fmt(trade.stopLoss)}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color:
                        (metrics.plannedRiskRewardRatio ?? 0) >= 2
                          ? "#4caf50"
                          : (metrics.plannedRiskRewardRatio ?? 0) >= 1
                            ? "#ff9800"
                            : "#f44336",
                      fontWeight: 600,
                    }}
                  >
                    {fmt(metrics.plannedRiskRewardRatio, 2)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color:
                        (metrics.actualRiskRewardRatio ?? 0) >= 2
                          ? "#4caf50"
                          : (metrics.actualRiskRewardRatio ?? 0) >= 1
                            ? "#ff9800"
                            : "#f44336",
                      fontWeight: 600,
                    }}
                  >
                    {fmt(metrics.actualRiskRewardRatio, 2)}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {metrics.avgExit ? `$${fmt(metrics.avgExit)}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color:
                        (trade.closedPnlAsset ?? 0) >= 0
                          ? "#4caf50"
                          : "#f44336",
                    }}
                  >
                    {fmtNativePnl(trade.closedPnlAsset, trade.asset)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color:
                        (trade.closedPnlUsd ?? 0) >= 0 ? "#4caf50" : "#f44336",
                    }}
                  >
                    {fmtUsd(trade.closedPnlUsd)}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {result !== "NA" && (
                      <Chip
                        label={result}
                        color={result === "WIN" ? "success" : "error"}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </td>
                  <td
                    style={{ padding: "4px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Stack direction="row" spacing={0}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => setViewTrade(trade)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEdit(trade)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(trade.id)}
                          disabled={isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      <TradeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editTarget}
        strategies={strategies}
        assets={assets}
        confluences={confluences}
      />
      <TradeViewDialog
        open={viewTrade !== null}
        onClose={() => setViewTrade(null)}
        trade={viewTrade}
      />
    </Box>
  );
}
