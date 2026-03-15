"use client";

import { createAssetAction, deleteAssetAction } from "@/lib/db/trades";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useTransition } from "react";

type AssetWithCount = {
  id: number;
  ticker: string;
  name: string;
  decimals: number;
  _count: { trades: number };
};

export function AssetsClient({ assets }: { assets: AssetWithCount[] }) {
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [decimals, setDecimals] = useState("8");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!ticker.trim() || !name.trim()) return;
    startTransition(async () => {
      await createAssetAction(
        ticker.trim().toUpperCase(),
        name.trim(),
        Number(decimals) || 8,
      );
      setTicker("");
      setName("");
      setDecimals("8");
    });
  };

  const handleDelete = (id: number, t: string) => {
    if (!confirm(`Delete asset "${t}"? This will unlink it from all trades.`))
      return;
    startTransition(() => deleteAssetAction(id));
  };

  return (
    <Box maxWidth={700}>
      <Typography variant="h5" gutterBottom>
        Assets
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage tradable assets. These appear in the trade form and dashboard
        filter.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              label="Ticker (e.g. ETH)"
              size="small"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              sx={{ width: 130 }}
            />
            <TextField
              label="Full name"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Decimals"
              type="number"
              size="small"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              sx={{ width: 100 }}
              helperText="8=BTC, 6=ETH, 2=stocks"
            />
            <Button
              variant="contained"
              startIcon={
                isPending ? <CircularProgress size={16} /> : <AddIcon />
              }
              onClick={handleAdd}
              disabled={isPending || !ticker.trim() || !name.trim()}
              sx={{ mt: 0.25 }}
            >
              Add
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {assets.length === 0 && (
        <Alert severity="info">No assets yet. Add one above.</Alert>
      )}

      <Stack spacing={1}>
        {assets.map((a) => (
          <Card key={a.id} variant="outlined">
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight={700} sx={{ minWidth: 60 }}>
                  {a.ticker}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flex: 1 }}
                >
                  {a.name}
                </Typography>
                <Chip
                  label={`${a.decimals} dec`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${a._count.trades} trade${a._count.trades !== 1 ? "s" : ""}`}
                  size="small"
                />
                <Tooltip title="Delete">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(a.id, a.ticker)}
                      disabled={isPending || a._count.trades > 0}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
