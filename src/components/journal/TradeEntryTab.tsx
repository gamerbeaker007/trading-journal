"use client";

import { fmt } from "@/lib/journal-utils";
import { calcPosition, type Direction } from "@/lib/trade-calc";
import { deriveTradeMetrics, type TradeFormData } from "@/lib/trade-utils";
import {
  Alert,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TrancheList } from "./TrancheList";

type SetField = <K extends keyof TradeFormData>(
  field: K,
  value: TradeFormData[K],
) => void;

export function TradeEntryTab({
  form,
  set,
  assetDecimals,
  calcAcct,
  setCalcAcct,
  calcRisk,
  setCalcRisk,
}: {
  form: TradeFormData;
  set: SetField;
  assetDecimals: number;
  calcAcct: number;
  setCalcAcct: (v: number) => void;
  calcRisk: number;
  setCalcRisk: (v: number) => void;
}) {
  const metrics = deriveTradeMetrics(form);

  const posSizing =
    calcAcct > 0 &&
    metrics.avgEntry != null &&
    form.stopLoss != null &&
    metrics.avgTp != null
      ? calcPosition({
          accountAmount: calcAcct,
          riskPct: calcRisk,
          direction: form.direction as Direction,
          entryPrice: metrics.avgEntry,
          takeProfit: metrics.avgTp,
          stopLoss: form.stopLoss,
        })
      : null;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <TrancheList
          label="Entries"
          tranches={form.entries}
          onChange={(t) => set("entries", t)}
          priceLabel="Entry Price"
          qtyLabel="Qty"
          decimals={assetDecimals}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TrancheList
          label="Take Profits"
          tranches={form.tps}
          onChange={(t) => set("tps", t)}
          priceLabel="TP Price"
          qtyLabel="Qty"
          decimals={assetDecimals}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <TextField
          label="Stop Loss"
          type="number"
          size="small"
          fullWidth
          value={form.stopLoss ?? ""}
          onChange={(e) =>
            set(
              "stopLoss",
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
          slotProps={{
            input: {
              endAdornment: (
                <span style={{ fontSize: 12, color: "#888" }}>$</span>
              ),
            },
          }}
        />
      </Grid>

      {/* Position Sizing calculator */}
      <Grid size={{ xs: 12 }}>
        <Alert
          severity="warning"
          variant="outlined"
          icon={false}
          sx={{ py: 0.5 }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="caption" fontWeight="bold">
              Position Sizing
            </Typography>
            <TextField
              label="Account ($)"
              type="number"
              size="small"
              value={calcAcct || ""}
              onChange={(e) =>
                setCalcAcct(e.target.value === "" ? 0 : Number(e.target.value))
              }
              sx={{ width: 140 }}
            />
            <TextField
              label="Risk %"
              type="number"
              size="small"
              value={calcRisk}
              onChange={(e) =>
                setCalcRisk(e.target.value === "" ? 1 : Number(e.target.value))
              }
              sx={{ width: 90 }}
            />
            {posSizing != null ? (
              <>
                <Divider orientation="vertical" flexItem />
                <span>
                  Risk: <strong>${fmt(posSizing.slCost)}</strong>
                </span>
                <span>
                  Qty:{" "}
                  <strong>
                    {(posSizing.totalAmount / metrics.avgEntry!).toFixed(
                      assetDecimals,
                    )}
                  </strong>
                </span>
                <span>
                  Pos. value: <strong>${fmt(posSizing.totalAmount)}</strong>
                </span>
                <span>
                  Leverage: <strong>{fmt(posSizing.leverageNeeded, 2)}×</strong>
                </span>
                <span>
                  PRRR: <strong>{fmt(posSizing.plannedRiskReward, 3)}</strong>
                </span>
              </>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Enter account, entry, TP &amp; stop loss to size position
              </Typography>
            )}
          </Stack>
        </Alert>
      </Grid>

      {/* Trade metrics summary */}
      {metrics.avgEntry && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="info">
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <span>Avg Entry: ${fmt(metrics.avgEntry)}</span>
              <span>Avg TP: ${fmt(metrics.avgTp)}</span>
              <span>Total Qty: {fmt(metrics.totalQuantity)}</span>
              <span>Profit %: {fmt(metrics.profitPct)}%</span>
              <span>SL %: {fmt(metrics.slPct)}%</span>
              <span>PRRR: {fmt(metrics.plannedRiskRewardRatio, 3)}</span>
            </Stack>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}
