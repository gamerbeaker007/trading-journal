"use client";

import {
  createConfluenceAction,
  deleteConfluenceAction,
} from "@/lib/db/trades";
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

type ConfluenceWithCount = {
  id: number;
  name: string;
  _count: { trades: number };
};

export function ConfluencesClient({
  confluences,
}: {
  confluences: ConfluenceWithCount[];
}) {
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      await createConfluenceAction(newName.trim());
      setNewName("");
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (
      !confirm(
        `Delete confluence "${name}"? It will be removed from all trades.`,
      )
    )
      return;
    startTransition(() => deleteConfluenceAction(id));
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" gutterBottom>
        Confluences
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage confluence signals that appear as multi-select chips in the trade
        form.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="New confluence name"
              size="small"
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              variant="contained"
              startIcon={
                isPending ? <CircularProgress size={16} /> : <AddIcon />
              }
              onClick={handleAdd}
              disabled={isPending || !newName.trim()}
            >
              Add
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {confluences.length === 0 && (
        <Alert severity="info">No confluences yet. Add one above.</Alert>
      )}

      <Stack spacing={1}>
        {confluences.map((c) => (
          <Card key={c.id} variant="outlined">
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ flex: 1 }}>{c.name}</Typography>
                <Chip
                  label={`${c._count.trades} trade${c._count.trades !== 1 ? "s" : ""}`}
                  size="small"
                />
                <Tooltip title="Delete">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={isPending || c._count.trades > 0}
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
