"use client";

import type { Asset } from "@/generated/prisma";
import { fmt } from "@/lib/journal-utils";
import { deriveTradeMetrics, type TradeFormData } from "@/lib/trade-utils";
import { Alert, Divider, Grid, Stack, TextField } from "@mui/material";
import { TrancheList } from "./TrancheList";

type SetField = <K extends keyof TradeFormData>(
  field: K,
  value: TradeFormData[K],
) => void;

export function TradeResultsTab({
  form,
  set,
  assetDecimals,
  selectedAsset,
}: {
  form: TradeFormData;
  set: SetField;
  assetDecimals: number;
  selectedAsset: Asset | null;
}) {
  const metrics = deriveTradeMetrics(form);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <TrancheList
          label="Exits"
          tranches={form.exits}
          onChange={(t) => set("exits", t)}
          priceLabel="Exit Price"
          qtyLabel="Qty"
          decimals={assetDecimals}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider />
      </Grid>

      <Grid size={{ xs: 6 }}>
        <TextField
          label={`Closed P&L (${selectedAsset?.ticker ?? "native"})`}
          type="number"
          size="small"
          fullWidth
          value={form.closedPnlAsset ?? ""}
          onChange={(e) =>
            set(
              "closedPnlAsset",
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Closed P&L (USD)"
          type="number"
          size="small"
          fullWidth
          value={form.closedPnlUsd ?? ""}
          onChange={(e) =>
            set(
              "closedPnlUsd",
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
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Account Balance"
          type="number"
          size="small"
          fullWidth
          value={form.accountBalance ?? ""}
          onChange={(e) =>
            set(
              "accountBalance",
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

      {metrics.avgEntry && metrics.avgExit && (
        <Grid size={{ xs: 12 }}>
          <Alert
            severity={
              metrics.winLoss === "WIN"
                ? "success"
                : metrics.winLoss === "LOSS"
                  ? "error"
                  : "info"
            }
          >
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <span>Avg Exit: ${fmt(metrics.avgExit)}</span>
              <span>ARRR: {fmt(metrics.actualRiskRewardRatio, 3)}</span>
              <strong>Result: {metrics.winLoss}</strong>
            </Stack>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}
