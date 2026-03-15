"use client";

import type { Asset, Confluence, Strategy } from "@/generated/prisma";
import { FLOWS, TF_OPTIONS, TRADE_TYPES } from "@/lib/journal-utils";
import type { TradeFormData } from "@/lib/trade-utils";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { type Dayjs } from "dayjs";

type SetField = <K extends keyof TradeFormData>(
  field: K,
  value: TradeFormData[K],
) => void;

export function TradeContextTab({
  form,
  set,
  assets,
  strategies,
  confluences,
  onOpenAddAsset,
}: {
  form: TradeFormData;
  set: SetField;
  assets: Asset[];
  strategies: Strategy[];
  confluences: Confluence[];
  onOpenAddAsset: () => void;
}) {
  const toggleConfluence = (id: number) => {
    const ids = form.confluenceIds ?? [];
    set(
      "confluenceIds",
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <DateTimePicker
          label="Entry Date"
          ampm={false}
          value={form.entryDate ? dayjs(form.entryDate) : null}
          onChange={(v: Dayjs | null) =>
            set("entryDate", v?.format("YYYY-MM-DDTHH:mm") ?? undefined)
          }
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <DateTimePicker
          label="Exit Date"
          ampm={false}
          value={form.exitDate ? dayjs(form.exitDate) : null}
          onChange={(v: Dayjs | null) =>
            set("exitDate", v?.format("YYYY-MM-DDTHH:mm") ?? undefined)
          }
          slotProps={{ textField: { size: "small", fullWidth: true } }}
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
                e.target.value === "" ? undefined : Number(e.target.value),
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
      <Grid size={{ xs: 1 }} sx={{ display: "flex", alignItems: "center" }}>
        <Tooltip title="Add new asset">
          <IconButton size="small" onClick={onOpenAddAsset}>
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
            value={form.strategyId != null ? String(form.strategyId) : ""}
            onChange={(e) =>
              set(
                "strategyId",
                e.target.value === "" ? undefined : Number(e.target.value),
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
        <TextField
          label="Other Confluence / Reason"
          size="small"
          fullWidth
          value={form.otherConfluence ?? ""}
          onChange={(e) => set("otherConfluence", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="TradingView Snapshots"
          size="small"
          fullWidth
          multiline
          rows={3}
          placeholder={
            "https://www.tradingview.com/x/abc123/\nhttps://www.tradingview.com/x/def456/"
          }
          helperText="One URL per line"
          value={(form.snapshots ?? "").replace(/,\s*/g, "\n")}
          onChange={(e) =>
            set(
              "snapshots",
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .join(","),
            )
          }
        />
      </Grid>
    </Grid>
  );
}
