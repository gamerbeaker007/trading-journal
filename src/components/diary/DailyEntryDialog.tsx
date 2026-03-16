"use client";

import type { DailyJournalEntry } from "@/generated/prisma";
import { upsertDailyEntryAction } from "@/lib/db/diary";
import {
  fmtDate,
  parseSnapshots,
  serializeSnapshots,
  type SnapshotItem,
} from "@/lib/journal-utils";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useState, useTransition } from "react";

// Inner form — state is initialized directly from props on mount.
// The parent renders this conditionally so it remounts fresh each time the dialog opens.
function DailyEntryForm({
  onClose,
  initial,
  allEntries,
}: {
  onClose: () => void;
  initial?: DailyJournalEntry;
  allEntries: DailyJournalEntry[];
}) {
  const today = new Date().toISOString().split("T")[0];
  const defaultDate = initial?.date?.toISOString().split("T")[0] ?? today;
  const existing = !initial
    ? allEntries.find((e) => fmtDate(e.date) === defaultDate)
    : undefined;

  const [date, setDate] = useState(defaultDate);
  const [effort, setEffort] = useState(
    initial?.effort ?? existing?.effort ?? "",
  );
  const [images, setImages] = useState<SnapshotItem[]>(
    parseSnapshots(initial?.snapshots ?? existing?.snapshots),
  );
  const [isPending, startTransition] = useTransition();

  const addImage = () =>
    setImages((prev) => [...prev, { url: "", comment: "" }]);

  const updateImage = (i: number, field: keyof SnapshotItem, value: string) =>
    setImages((prev) =>
      prev.map((img, idx) => (idx === i ? { ...img, [field]: value } : img)),
    );

  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    startTransition(async () => {
      await upsertDailyEntryAction({
        date,
        effort,
        snapshots: serializeSnapshots(images) ?? "",
      });
      onClose();
    });
  };

  return (
    <>
      <DialogTitle>
        {initial ? "Edit Daily Entry" : "Add Daily Journal Entry"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <DatePicker
            label="Date"
            value={dayjs(date)}
            onChange={(v: Dayjs | null) => {
              const newDate = v?.format("YYYY-MM-DD") ?? today;
              setDate(newDate);
              // In add mode, auto-fill if an entry already exists for this date
              if (!initial) {
                const ex = allEntries.find((e) => fmtDate(e.date) === newDate);
                if (ex) {
                  setEffort(ex.effort ?? "");
                  setImages(parseSnapshots(ex.snapshots));
                } else {
                  setEffort("");
                  setImages([]);
                }
              }
            }}
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
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" fontWeight={600}>
                TradingView Snapshots
              </Typography>
              <Button
                size="small"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={addImage}
              >
                Add Image
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {images.map((img, i) => (
                <Stack key={i} spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label={`Image ${i + 1} URL`}
                      size="small"
                      fullWidth
                      value={img.url}
                      onChange={(e) => updateImage(i, "url", e.target.value)}
                      placeholder="https://www.tradingview.com/x/..."
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeImage(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    label="Comment (optional)"
                    size="small"
                    fullWidth
                    value={img.comment}
                    onChange={(e) => updateImage(i, "comment", e.target.value)}
                  />
                </Stack>
              ))}
              {images.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No images yet. Click &quot;Add Image&quot; to attach
                  TradingView snapshots.
                </Typography>
              )}
            </Stack>
          </Box>
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
    </>
  );
}

export function DailyEntryDialog({
  open,
  onClose,
  initial,
  allEntries = [],
}: {
  open: boolean;
  onClose: () => void;
  initial?: DailyJournalEntry;
  allEntries?: DailyJournalEntry[];
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open && (
        <DailyEntryForm
          key={initial?.id ?? "new"}
          onClose={onClose}
          initial={initial}
          allEntries={allEntries}
        />
      )}
    </Dialog>
  );
}
