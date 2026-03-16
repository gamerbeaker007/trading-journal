"use client";

import type { Asset, Confluence, Strategy } from "@/generated/prisma";
import {
  FLOWS,
  TF_OPTIONS,
  TRADE_TYPES,
  parseSnapshots,
  serializeSnapshots,
} from "@/lib/journal-utils";
import type { TradeFormData } from "@/lib/trade-utils";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="caption" color="text.secondary">
            TradingView Snapshots
          </Typography>
          <Button
            size="small"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => {
              const imgs = parseSnapshots(form.snapshots);
              set(
                "snapshots",
                serializeSnapshots([...imgs, { url: "", comment: "" }]),
              );
            }}
          >
            Add Image
          </Button>
        </Stack>
        <Stack spacing={1.5}>
          {parseSnapshots(form.snapshots).map((img, i) => {
            const imgs = parseSnapshots(form.snapshots);
            const updateImage = (field: "url" | "comment", value: string) => {
              const updated = imgs.map((m, idx) =>
                idx === i ? { ...m, [field]: value } : m,
              );
              set("snapshots", serializeSnapshots(updated));
            };
            const removeImage = () => {
              set(
                "snapshots",
                serializeSnapshots(imgs.filter((_, idx) => idx !== i)),
              );
            };
            return (
              <Stack key={i} spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label={`Image ${i + 1} URL`}
                    size="small"
                    fullWidth
                    value={img.url}
                    onChange={(e) => updateImage("url", e.target.value)}
                    placeholder="https://www.tradingview.com/x/..."
                  />
                  <IconButton size="small" color="error" onClick={removeImage}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <TextField
                  label="Comment (optional)"
                  size="small"
                  fullWidth
                  value={img.comment}
                  onChange={(e) => updateImage("comment", e.target.value)}
                />
              </Stack>
            );
          })}
          {!parseSnapshots(form.snapshots).length && (
            <Typography variant="caption" color="text.secondary">
              No images yet. Click &quot;Add Image&quot; to attach TradingView
              snapshots.
            </Typography>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
