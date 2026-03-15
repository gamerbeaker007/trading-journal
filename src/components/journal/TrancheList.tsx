"use client";

import type { Tranche } from "@/lib/trade-utils";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";

export function TrancheList({
  label,
  tranches,
  onChange,
  priceLabel = "Price",
  qtyLabel = "Qty ($)",
}: {
  label: string;
  tranches: Tranche[];
  onChange: (t: Tranche[]) => void;
  priceLabel?: string;
  qtyLabel?: string;
}) {
  const update = (i: number, field: keyof Tranche, val: string) => {
    const next = tranches.map((t, idx) =>
      idx === i ? { ...t, [field]: val === "" ? undefined : Number(val) } : t,
    );
    onChange(next);
  };

  const add = () => onChange([...tranches, {}]);
  const remove = (i: number) =>
    onChange(
      tranches.length > 1 ? tranches.filter((_, idx) => idx !== i) : [{}],
    );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="subtitle2">{label}</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={add}>
          Add
        </Button>
      </Stack>
      {tranches.map((t, i) => (
        <Stack key={i} direction="row" spacing={1} mb={1} alignItems="center">
          <TextField
            label={`${priceLabel} ${i + 1}`}
            type="number"
            size="small"
            sx={{ flex: 1 }}
            value={t.price ?? ""}
            onChange={(e) => update(i, "price", e.target.value)}
          />
          <TextField
            label={`${qtyLabel} ${i + 1}`}
            type="number"
            size="small"
            sx={{ flex: 1 }}
            value={t.qty ?? ""}
            onChange={(e) => update(i, "qty", e.target.value)}
          />
          <IconButton
            size="small"
            onClick={() => remove(i)}
            disabled={tranches.length === 1 && !t.price && !t.qty}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
    </Box>
  );
}
