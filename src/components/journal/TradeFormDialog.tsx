"use client";
import type { Asset, Confluence, Strategy } from "@/generated/prisma";
import { createTradeAction, updateTradeAction } from "@/lib/db/trades";
import { emptyForm } from "@/lib/journal-utils";
import { deriveTradeMetrics, type TradeFormData } from "@/lib/trade-utils";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from "@mui/material";
import React, { useState, useTransition } from "react";
import { AddAssetDialog } from "./AddAssetDialog";
import { TradeContextTab } from "./TradeContextTab";
import { TradeEntryTab } from "./TradeEntryTab";
import { TradePsychologyTab } from "./TradePsychologyTab";
import { TradeResultsTab } from "./TradeResultsTab";
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
  const [calcAcct, setCalcAcct] = useState(0);
  const [calcRisk, setCalcRisk] = useState(1);
  const [isPending, startTransition] = useTransition();
  React.useEffect(() => {
    if (open) setForm(initial?.data ?? emptyForm());
    setTab(0);
  }, [open, initial]);
  React.useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);
  const set = <K extends keyof TradeFormData>(
    field: K,
    value: TradeFormData[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));
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
  const assetDecimals = selectedAsset?.decimals ?? 8;
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

            <Tab label="Context" /> <Tab label="Trade Preparation (Entry)" />
            <Tab label="Trade Results" /> <Tab label="Psychology" />
          </Tabs>
          {tab === 0 && (
            <TradeContextTab
              form={form}
              set={set}
              assets={assets}
              strategies={strategies}
              confluences={confluences}
              onOpenAddAsset={() => setAddAssetOpen(true)}
            />
          )}
          {tab === 1 && (
            <TradeEntryTab
              form={form}
              set={set}
              assetDecimals={assetDecimals}
              calcAcct={calcAcct}
              setCalcAcct={setCalcAcct}
              calcRisk={calcRisk}
              setCalcRisk={setCalcRisk}
            />
          )}
          {tab === 2 && (
            <TradeResultsTab
              form={form}
              set={set}
              assetDecimals={assetDecimals}
              selectedAsset={selectedAsset}
            />
          )}
          {tab === 3 && <TradePsychologyTab form={form} set={set} />}
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
