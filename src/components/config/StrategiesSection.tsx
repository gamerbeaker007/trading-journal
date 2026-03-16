"use client";

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
import { useState } from "react";
import { useStrategies } from "../../hooks/useStrategies";

type StrategyWithCount = {
  id: number;
  name: string;
  _count: { trades: number };
};

export function StrategiesSection({
  strategies,
}: {
  strategies: StrategyWithCount[];
}) {
  const [newName, setNewName] = useState("");
  const { isPending, handleAdd, handleDelete, seedDefaults } = useStrategies();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Strategies
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Manage trading strategies. These appear as dropdown options in the Trade
        Journal and filter the Strategy Dashboard.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="New strategy name"
              size="small"
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleAdd(newName, () => setNewName(""))
              }
            />
            <Button
              variant="contained"
              startIcon={
                isPending ? <CircularProgress size={16} /> : <AddIcon />
              }
              onClick={() => handleAdd(newName, () => setNewName(""))}
              disabled={isPending || !newName.trim()}
            >
              Add
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {strategies.length === 0 && (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={seedDefaults}
              disabled={isPending}
            >
              Seed defaults
            </Button>
          }
        >
          No strategies yet. Add one above or seed the defaults from the
          workbook.
        </Alert>
      )}

      <Stack spacing={1}>
        {strategies.map((s) => (
          <Card key={s.id} variant="outlined">
            <CardContent sx={{ py: "10px !important" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body1">{s.name}</Typography>
                  <Chip
                    label={`${s._count.trades} trade${s._count.trades !== 1 ? "s" : ""}`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Tooltip title="Delete strategy">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={isPending || s._count.trades > 0}
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
