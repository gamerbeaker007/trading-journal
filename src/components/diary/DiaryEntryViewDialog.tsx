"use client";

import type { DailyJournalEntry } from "@/generated/prisma";
import { parseSnapshots } from "@/lib/journal-utils";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export function DiaryEntryViewDialog({
  open,
  onClose,
  entry,
}: {
  open: boolean;
  onClose: () => void;
  entry: DailyJournalEntry | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  if (!entry) return null;

  const images = parseSnapshots(entry.snapshots).filter((i) => i.url.trim());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>
            {entry.date?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {entry.dayOfWeek && (
            <Chip label={entry.dayOfWeek} size="small" variant="outlined" />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {entry.effort ? (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Effort / Analysis Notes
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
              {entry.effort}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" mb={2}>
            No notes for this day.
          </Typography>
        )}

        {images.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              TradingView Snapshots ({images.length})
            </Typography>
            <Grid container spacing={1}>
              {images.map((img, i) => (
                <Grid key={i} size={{ xs: 12, sm: images.length > 1 ? 6 : 12 }}>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                    onClick={() => setPreviewUrl(img.url)}
                  >
                    <Box
                      component="img"
                      src={img.url}
                      alt={`Snapshot ${i + 1}`}
                      sx={{
                        width: "100%",
                        height: 180,
                        objectFit: "contain",
                        display: "block",
                        bgcolor: "action.selected",
                      }}
                    />
                    <Box sx={{ px: 1, py: 0.5, bgcolor: "action.hover" }}>
                      {img.comment && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mb: 0.25, fontStyle: "italic" }}
                        >
                          {img.comment}
                        </Typography>
                      )}
                      <MuiLink
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        display="block"
                        onClick={(e) => e.stopPropagation()}
                        noWrap
                      >
                        {img.url}
                      </MuiLink>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Full-size preview */}
      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Snapshot Preview</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={previewUrl ?? ""}
            alt="Snapshot preview"
            sx={{ width: "100%", objectFit: "contain", maxHeight: "80vh" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            href={previewUrl ?? ""}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in TradingView
          </Button>
          <Button onClick={() => setPreviewUrl(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
