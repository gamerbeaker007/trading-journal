"use client";

import type { TradeFormData } from "@/lib/trade-utils";
import { Grid, TextField } from "@mui/material";

type SetField = <K extends keyof TradeFormData>(
  field: K,
  value: TradeFormData[K],
) => void;

const FIELDS: [keyof TradeFormData, string][] = [
  ["feelAboutTrade", "How do you feel about the trade?"],
  ["feelGeneral", "How do you feel in general?"],
  ["followedPlan", "Did you follow your plan?"],
  ["happyWithResult", "Happy with results?"],
];

export function TradePsychologyTab({
  form,
  set,
}: {
  form: TradeFormData;
  set: SetField;
}) {
  return (
    <Grid container spacing={2}>
      {FIELDS.map(([field, label]) => (
        <Grid size={{ xs: 6 }} key={field}>
          <TextField
            label={label}
            size="small"
            fullWidth
            value={(form[field] as string | undefined) ?? ""}
            onChange={(e) =>
              set(field, e.target.value as TradeFormData[typeof field])
            }
          />
        </Grid>
      ))}
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Notes"
          size="small"
          fullWidth
          multiline
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
