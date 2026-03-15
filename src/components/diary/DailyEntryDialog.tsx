"use client";

import type { DailyJournalEntry } from "@/generated/prisma";
import { upsertDailyEntryAction } from "@/lib/db/diary";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useState, useTransition } from "react";

export function DailyEntryDialog({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: DailyJournalEntry;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(
    initial?.date?.toISOString().split("T")[0] ?? today,
  );
  const [effort, setEffort] = useState(initial?.effort ?? "");
  const [snapshots, setSnapshots] = useState(initial?.snapshots ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      await upsertDailyEntryAction({ date, effort, snapshots });
      onClose();
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initial ? "Edit Daily Entry" : "Add Daily Journal Entry"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <DatePicker
            label="Date"
            value={dayjs(date)}
            onChange={(v: Dayjs | null) =>
              setDate(v?.format("YYYY-MM-DD") ?? today)
            }
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />
          <TextField
            label="Effort / Analysis Notes"
            multiline
            rows={6}
            fullWidth
            size="small"
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
            placeholder="What did you analyse today? What trades did you identify? How did you feel?"
          />
          <TextField
            label="TradingView Snapshot URLs (comma-separated)"
            fullWidth
            size="small"
            value={snapshots}
            onChange={(e) => setSnapshots(e.target.value)}
          />
        </Stack>
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
