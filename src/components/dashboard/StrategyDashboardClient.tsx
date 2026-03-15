"use client";

import {
  DashboardView,
  type DashboardStats,
  type PnlPoint,
} from "@/components/dashboard/DashboardView";
import type { Asset, Strategy } from "@/generated/prisma";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useDashboard } from "../../hooks/useDashboard";

export function StrategyDashboardClient({
  strategies,
  assets,
  initialStats,
  initialPnl,
}: {
  strategies: Strategy[];
  assets: Asset[];
  initialStats: DashboardStats;
  initialPnl: PnlPoint[];
}) {
  const {
    selectedStrategyId,
    selectedAssetId,
    stats,
    pnl,
    title,
    handleStrategyChange,
    handleAssetChange,
  } = useDashboard({ strategies, assets, initialStats, initialPnl });

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
        flexWrap="wrap"
      >
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Asset</InputLabel>
          <Select
            label="Asset"
            value={selectedAssetId}
            onChange={(e) => handleAssetChange(e.target.value)}
          >
            <MenuItem value="">All assets</MenuItem>
            {assets.map((a) => (
              <MenuItem key={a.id} value={String(a.id)}>
                {a.ticker}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select strategy</InputLabel>
          <Select
            label="Select strategy"
            value={selectedStrategyId}
            onChange={(e) => handleStrategyChange(e.target.value)}
          >
            <MenuItem value="">All strategies</MenuItem>
            {strategies.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <DashboardView stats={stats} pnlSeries={pnl} title={title} />
    </Box>
  );
}
