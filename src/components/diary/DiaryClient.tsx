"use client";

import type { DailyJournalEntry, ProjectGoal } from "@/generated/prisma";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DailyEntryDialog } from "./DailyEntryDialog";
import { DiaryEntryViewDialog } from "./DiaryEntryViewDialog";
import { useDiary } from "@/hooks/useDiary";
import { parseSnapshots } from "@/lib/journal-utils";

export function DiaryClient({
  entries,
  goals,
}: {
  entries: DailyJournalEntry[];
  goals: ProjectGoal[];
}) {
  const {
    entryDialogOpen,
    setEntryDialogOpen,
    editEntry,
    viewEntry,
    setViewEntry,
    newGoal,
    setNewGoal,
    isPending,
    openAddEntry,
    openEditEntry,
    handleDeleteEntry,
    handleAddGoal,
    handleDeleteGoal,
  } = useDiary();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Diary
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Daily trading journal — track your effort, analysis, and progress toward
        your trading goals.
      </Typography>

      <Grid container spacing={3}>
        {/* Goals panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <EmojiObjectsIcon color="warning" />
                <Typography variant="h6">Goals</Typography>
              </Stack>
              {goals.length === 0 && (
                <Typography variant="body2" color="text.secondary" mb={1}>
                  No goals yet. Add some below.
                </Typography>
              )}
              <Stack spacing={1} mb={2}>
                {goals.map((goal) => (
                  <Stack
                    key={goal.id}
                    direction="row"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Typography variant="body2" sx={{ flexGrow: 1, pt: 0.5 }}>
                      • {goal.goal}
                    </Typography>
                    <Tooltip title="Remove goal">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={isPending}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Add goal"
                  size="small"
                  fullWidth
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddGoal}
                  disabled={isPending || !newGoal.trim()}
                >
                  Add
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily entries */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <EditCalendarIcon color="primary" />
              <Typography variant="h6">Daily Entries</Typography>
              <Chip label={entries.length} size="small" />
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddEntry}
            >
              Add Entry
            </Button>
          </Stack>

          {entries.length === 0 && (
            <Alert severity="info">
              No entries yet. Start logging your daily analysis!
            </Alert>
          )}

          <Stack spacing={2}>
            {entries.map((entry) => (
              <Card
                key={entry.id}
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  "&:hover": { borderColor: "primary.main" },
                }}
                onClick={() => setViewEntry(entry)}
              >
                <CardContent sx={{ pb: "12px !important" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {entry.date?.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                        {entry.dayOfWeek && (
                          <Chip
                            label={entry.dayOfWeek}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      {entry.effort && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                        >
                          {entry.effort}
                        </Typography>
                      )}
                      {entry.snapshots && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          mt={0.5}
                        >
                          {parseSnapshots(entry.snapshots).map((url, i) => (
                            <Chip key={i} label={`[${i + 1}]`} size="small" />
                          ))}
                        </Stack>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditEntry(entry)}
                        >
                          <EditCalendarIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <DailyEntryDialog
        open={entryDialogOpen}
        onClose={() => setEntryDialogOpen(false)}
        initial={editEntry}
        allEntries={entries}
      />
      <DiaryEntryViewDialog
        open={viewEntry !== null}
        onClose={() => setViewEntry(null)}
        entry={viewEntry}
      />
    </Box>
  );
}
