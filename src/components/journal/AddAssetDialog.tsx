"use client";

import { createAssetAction } from "@/lib/db/trades";
import type { Asset } from "@/generated/prisma";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState, useTransition } from "react";

export function AddAssetDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (asset: Asset) => void;
}) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [decimals, setDecimals] = useState("8");
  const [isPending, startTransition] = useTransition();

  const resetFields = () => {
    setTicker("");
    setName("");
    setDecimals("8");
  };

  const handleAdd = () => {
    if (!ticker.trim() || !name.trim()) return;
    startTransition(async () => {
      const newAsset = await createAssetAction(
        ticker.trim().toUpperCase(),
        name.trim(),
        Number(decimals) || 8,
      );
      onAdded(newAsset);
      onClose();
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionProps={{ onEnter: resetFields }}>
      <DialogTitle>Add New Asset</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Ticker (e.g. ETH)"
            size="small"
            fullWidth
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
          />
          <TextField
            label="Full Name (e.g. Ethereum)"
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Decimal places"
            type="number"
            size="small"
            fullWidth
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            helperText="8 for crypto (BTC), 6 for ETH/SOL, 2 for stocks"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={isPending || !ticker.trim() || !name.trim()}
        >
          {isPending ? <CircularProgress size={16} /> : "Add Asset"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
