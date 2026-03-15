"use client";

import { createTradeAction, updateTradeAction } from "@/lib/db/trades";
import { deriveTradeMetrics, type TradeFormData } from "@/lib/trade-utils";
import type { Asset, Confluence, Strategy } from "@/generated/prisma";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState, useTransition } from "react";
import { emptyForm, fmt, FLOWS, TF_OPTIONS, TRADE_TYPES } from "@/lib/journal-utils";
import { TrancheList } from "./TrancheList";
import { AddAssetDialog } from "./AddAssetDialog";

export function TradeFormDialog({
  open,
  onClose,
  initial,
  strategies,
  assets: initialAssets,
  confluences,
}: {
  open: boolean;
  onClose: () => void;
  initial?: { id: number; data: TradeFormData };
  strategies: Strategy[];
  assets: Asset[];
  confluences: Confluence[];
}) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<TradeFormData>(initial?.data ?? emptyForm());
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) setForm(initial?.data ?? emptyForm());
    setTab(0);
  }, [open, initial]);

  React.useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  const set = <K extends keyof TradeFormData>(field: K, value: TradeFormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleConfluence = (id: number) => {
    const ids = form.confluenceIds ?? [];
    set(
      "confluenceIds",
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const numField = (label: string, field: keyof TradeFormData, end?: string) => (
    <TextField
      label={label}
      type="number"
      size="small"
      fullWidth
      value={(form[field] as number | undefined) ?? ""}
      onChange={(e) =>
        set(
          field,
          (e.target.value === ""
            ? undefined
            : Number(e.target.value)) as TradeFormData[typeof field],
        )
      }
      InputProps={{
        endAdornment: end ? (
          <span style={{ fontSize: 12, color: "#888" }}>{end}</span>
        ) : undefined,
      }}
    />
  );

  const textField = (
    label: string,
    field: keyof TradeFormData,
    multi?: boolean,
  ) => (
    <TextField
      label={label}
      size="small"
      fullWidth
      multiline={multi}
      rows={multi ? 3 : 1}
      value={(form[field] as string | undefined) ?? ""}
      onChange={(e) =>
        set(field, e.target.value as TradeFormData[typeof field])
      }
    />
  );

  const handleSubmit = () => {
    startTransition(async () => {
      if (initial) {
        await updateTradeAction(initial.id, form);
      } else {
        await createTradeAction(form);
      }
      onClose();
    });
  };

  const metrics = deriveTradeMetrics(form);
  const selectedAsset = assets.find((a) => a.id === form.assetId) ?? null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {initial ? "Edit Trade" : "Log New Trade"}
          {metrics.winLoss !== "NA" && (
            <Chip
              label={metrics.winLoss}
              color={metrics.winLoss === "WIN" ? "success" : "error"}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2 }}
            variant="scrollable"
          >
            <Tab label="Context" />
            <Tab label="Trade Preparation (Entry)" />
            <Tab label="Trade Results" />
            <Tab label="Psychology" />
          </Tabs>

          {/* Tab 0: Context */}
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Entry Date"
                  type="datetime-local"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.entryDate ?? ""}
                  onChange={(e) => set("entryDate", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Exit Date"
                  type="datetime-local"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.exitDate ?? ""}
                  onChange={(e) => set("exitDate", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Asset</InputLabel>
                  <Select
                    label="Asset"
                    value={form.assetId != null ? String(form.assetId) : ""}
                    onChange={(e) =>
                      set(
                        "assetId",
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {assets.map((a) => (
                      <MenuItem key={a.id} value={String(a.id)}>
                        {a.ticker} — {a.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{ xs: 1 }}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Tooltip title="Add new asset">
                  <IconButton size="small" onClick={() => setAddAssetOpen(true)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    label="Direction"
                    value={form.direction}
                    onChange={(e) => set("direction", e.target.value)}
                  >
                    <MenuItem value="Long">Long</MenuItem>
                    <MenuItem value="Short">Short</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trade Type</InputLabel>
                  <Select
                    label="Trade Type"
                    value={form.tradeType ?? ""}
                    onChange={(e) => set("tradeType", e.target.value)}
                  >
                    {TRADE_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    label="Strategy"
                    value={
                      form.strategyId != null ? String(form.strategyId) : ""
                    }
                    onChange={(e) =>
                      set(
                        "strategyId",
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {strategies.map((s) => (
                      <MenuItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Entry TF</InputLabel>
                  <Select
                    label="Entry TF"
                    value={form.entryPointTF ?? ""}
                    onChange={(e) => set("entryPointTF", e.target.value)}
                  >
                    {TF_OPTIONS.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Analyse TF</InputLabel>
                  <Select
                    label="Analyse TF"
                    value={form.analyseTF ?? ""}
                    onChange={(e) => set("analyseTF", e.target.value)}
                  >
                    {TF_OPTIONS.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Daily Order Flow</InputLabel>
                  <Select
                    label="Daily Order Flow"
                    value={form.dailyOrderFlow ?? ""}
                    onChange={(e) => set("dailyOrderFlow", e.target.value)}
                  >
                    {FLOWS.map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>4h Order Flow</InputLabel>
                  <Select
                    label="4h Order Flow"
                    value={form.orderFlow4h ?? ""}
                    onChange={(e) => set("orderFlow4h", e.target.value)}
                  >
                    {FLOWS.map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>1h Order Flow</InputLabel>
                  <Select
                    label="1h Order Flow"
                    value={form.orderFlow1h ?? ""}
                    onChange={(e) => set("orderFlow1h", e.target.value)}
                  >
                    {FLOWS.map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Confluences
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {confluences.map((c) => {
                    const selected = (form.confluenceIds ?? []).includes(c.id);
                    return (
                      <Chip
                        key={c.id}
                        label={c.name}
                        size="small"
                        onClick={() => toggleConfluence(c.id)}
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        clickable
                      />
                    );
                  })}
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                {textField("Other Confluence / Reason", "otherConfluence")}
              </Grid>
              <Grid size={{ xs: 12 }}>
                {textField(
                  "TradingView Snapshots (comma-separated URLs)",
                  "snapshots",
                )}
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Trade Preparation (Entry) */}
          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TrancheList
                  label="Entries"
                  tranches={form.entries}
                  onChange={(t) => set("entries", t)}
                  priceLabel="Entry Price"
                  qtyLabel="Qty"
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
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 6 }}>
                {numField("Stop Loss", "stopLoss", "$")}
              </Grid>
              {metrics.avgEntry && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">
                    <Stack direction="row" spacing={3} flexWrap="wrap">
                      <span>Avg Entry: ${fmt(metrics.avgEntry)}</span>
                      <span>Avg TP: ${fmt(metrics.avgTp)}</span>
                      <span>Total Qty: {fmt(metrics.totalQuantity)}</span>
                      <span>Profit %: {fmt(metrics.profitPct)}%</span>
                      <span>SL %: {fmt(metrics.slPct)}%</span>
                      <span>PRR: {fmt(metrics.plannedRiskReward, 3)}</span>
                    </Stack>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 2: Trade Results */}
          {tab === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TrancheList
                  label="Exits"
                  tranches={form.exits}
                  onChange={(t) => set("exits", t)}
                  priceLabel="Exit Price"
                  qtyLabel="Qty"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider />
              </Grid>
              <Grid size={{ xs: 6 }}>
                {numField(
                  `Closed P&L (${selectedAsset?.ticker ?? "native"})`,
                  "closedPnlAsset",
                )}
              </Grid>
              <Grid size={{ xs: 6 }}>
                {numField("Closed P&L (USD)", "closedPnlUsd", "$")}
              </Grid>
              <Grid size={{ xs: 6 }}>
                {numField("Account Balance", "accountBalance", "$")}
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
                      <span>ARR: {fmt(metrics.actualRiskReward, 3)}</span>
                      <strong>Result: {metrics.winLoss}</strong>
                    </Stack>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* Tab 3: Psychology */}
          {tab === 3 && (
            <Grid container spacing={2}>
              {(
                [
                  ["feelAboutTrade", "How do you feel about the trade?"],
                  ["feelGeneral", "How do you feel in general?"],
                  ["followedPlan", "Did you follow your plan?"],
                  ["happyWithResult", "Happy with results?"],
                ] as [keyof TradeFormData, string][]
              ).map(([field, label]) => (
                <Grid size={{ xs: 6 }} key={field}>
                  {textField(label, field)}
                </Grid>
              ))}
              <Grid size={{ xs: 12 }}>
                {textField("Notes", "notes", true)}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : null}
          >
            {initial ? "Save Changes" : "Log Trade"}
          </Button>
        </DialogActions>
      </Dialog>
      <AddAssetDialog
        open={addAssetOpen}
        onClose={() => setAddAssetOpen(false)}
        onAdded={(a) => {
          setAssets((prev) => [...prev, a]);
          set("assetId", a.id);
        }}
      />
    </>
  );
}
