"use client";

import { calcPosition, type Direction } from "@/lib/trade-calc";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

// ─── Number field helper ───────────────────────────────────────────────────────

function NumField({
  label,
  value,
  onChange,
  end,
  tooltip,
  step = "any",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  end?: string;
  tooltip?: string;
  step?: string;
}) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        htmlInput: { step },
        input: {
          endAdornment: end ? (
            <InputAdornment position="end">{end}</InputAdornment>
          ) : undefined,
          startAdornment: tooltip ? (
            <InputAdornment position="start">
              <Tooltip title={tooltip}>
                <InfoOutlinedIcon fontSize="small" color="action" />
              </Tooltip>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.6,
        px: 1,
        borderRadius: 1,
        bgcolor: highlight ? "action.selected" : "transparent",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={highlight ? 700 : 400}
        color={color ?? "text.primary"}
      >
        {value}
      </Typography>
    </Box>
  );
}

function fmt(n: number | null | undefined, decimals = 2, suffix = ""): string {
  if (n == null || isNaN(n) || !isFinite(n)) return "—";
  return `${n.toFixed(decimals)}${suffix}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PositionCalcPage() {
  // Section 2 — exact calc
  const [acct2, setAcct2] = useState("100");
  const [risk2, setRisk2] = useState("1");
  const [direction, setDirection] = useState<Direction>("Short");
  const [entry, setEntry] = useState("1000");
  const [tp, setTp] = useState("900");
  const [sl2, setSl2] = useState("1050");
  const [useIntermediateTP, setUseIntermediateTP] = useState(false);
  const [tpInter, setTpInter] = useState("950");
  const [tpInterPct, setTpInterPct] = useState("75");

  const n = (s: string) => parseFloat(s) || 0;

  const s2 = useMemo(
    () =>
      calcPosition({
        accountAmount: n(acct2),
        riskPct: n(risk2),
        direction,
        entryPrice: n(entry),
        takeProfit: n(tp),
        stopLoss: n(sl2),
        tpIntermediate: useIntermediateTP ? n(tpInter) : undefined,
        tpIntermediatePct: useIntermediateTP ? n(tpInterPct) : undefined,
      }),
    [
      acct2,
      risk2,
      direction,
      entry,
      tp,
      sl2,
      useIntermediateTP,
      tpInter,
      tpInterPct,
    ],
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Position Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Converted from the <strong>Position calc</strong> sheet. Calculates
        position size, risk, Risk-Reward Ratio and optional intermediate TP
        splits.
      </Typography>

      <Grid container spacing={3}>
        {/* ── Section 2: Exact calc ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              {/* Direction toggle */}
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Typography variant="body2">Direction:</Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={direction}
                  onChange={(_, v) => v && setDirection(v)}
                >
                  <ToggleButton value="Long" color="success">
                    <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Long
                  </ToggleButton>
                  <ToggleButton value="Short" color="error">
                    <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Short
                  </ToggleButton>
                </ToggleButtonGroup>
                <Chip
                  label={direction}
                  color={direction === "Long" ? "success" : "error"}
                  size="small"
                />
              </Stack>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <NumField
                    label="Account Amount"
                    value={acct2}
                    onChange={setAcct2}
                    end="$"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <NumField
                    label="Risk %"
                    value={risk2}
                    onChange={setRisk2}
                    end="%"
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <NumField
                    label="Entry Price"
                    value={entry}
                    onChange={setEntry}
                    end="$"
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <NumField
                    label="Take Profit"
                    value={tp}
                    onChange={setTp}
                    end="$"
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <NumField
                    label="Stop Loss"
                    value={sl2}
                    onChange={setSl2}
                    end="$"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Results */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.5}>
                    <ResultRow
                      label="Profit % to TP"
                      value={fmt(s2.profitPct, 2, "%")}
                      color="success.main"
                    />
                    <ResultRow
                      label="SL %"
                      value={fmt(s2.slPct, 2, "%")}
                      color="error.main"
                    />
                    <ResultRow
                      label="Position size"
                      value={`$${fmt(s2.totalAmount)} / ${fmt(s2.totalAmountBtc, 4)} BTC`}
                      highlight
                    />
                    <ResultRow
                      label="SL cost"
                      value={`$${fmt(s2.slCost)}`}
                      color="error.main"
                    />
                    <ResultRow
                      label="Profit at TP"
                      value={`$${fmt(s2.profitAtTP)} / ${fmt(s2.profitAtTPBtc, 4)} BTC`}
                      color="success.main"
                    />
                    <ResultRow
                      label="Risk-Reward Ratio (RRR)"
                      value={fmt(s2.plannedRiskReward, 3)}
                      highlight
                      color={
                        (s2.plannedRiskReward ?? 0) >= 2
                          ? "success.main"
                          : (s2.plannedRiskReward ?? 0) >= 1
                            ? "warning.main"
                            : "error.main"
                      }
                    />
                    <ResultRow
                      label="Leverage needed"
                      value={`${fmt(s2.leverageNeeded)}×`}
                    />
                  </Stack>
                </Grid>

                {/* Intermediate TP */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Intermediate TP
                    </Typography>
                    <ToggleButton
                      value="inter"
                      selected={useIntermediateTP}
                      onChange={() => setUseIntermediateTP((p) => !p)}
                      size="small"
                    >
                      {useIntermediateTP ? "Enabled" : "Disabled"}
                    </ToggleButton>
                  </Stack>

                  {useIntermediateTP && (
                    <>
                      <Stack spacing={1.5} mb={1.5}>
                        <NumField
                          label="Intermediate TP Price"
                          value={tpInter}
                          onChange={setTpInter}
                          end="$"
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel>Close % at inter. TP</InputLabel>
                          <Select
                            label="Close % at inter. TP"
                            value={tpInterPct}
                            onChange={(e) =>
                              setTpInterPct(String(e.target.value))
                            }
                          >
                            {[1, 10, 25, 50, 75, 100].map((v) => (
                              <MenuItem key={v} value={String(v)}>
                                {v}%
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                      <Stack spacing={0.5}>
                        <ResultRow
                          label={`Profit % to inter. TP`}
                          value={fmt(s2.intermediateTPProfitPct, 2, "%")}
                          color="success.main"
                        />
                        <ResultRow
                          label={`Amount at inter. TP (${tpInterPct}%)`}
                          value={`$${fmt(s2.intermediateQtyAmount)}`}
                        />
                        <ResultRow
                          label="Profit at inter. TP"
                          value={`$${fmt(s2.intermediateProfit)}`}
                          color="success.main"
                        />
                        <Divider sx={{ my: 0.5 }} />
                        <ResultRow
                          label="Remainder profit %"
                          value={fmt(s2.remainderProfitPct, 2, "%")}
                        />
                        <ResultRow
                          label="Remainder amount"
                          value={`$${fmt(s2.remainderAmount)}`}
                        />
                        <ResultRow
                          label="Remainder profit"
                          value={`$${fmt(s2.remainderProfit)}`}
                        />
                        <Divider sx={{ my: 0.5 }} />
                        <ResultRow
                          label="Total profit %"
                          value={fmt(s2.totalProfitPct, 2, "%")}
                          highlight
                          color="success.main"
                        />
                        <ResultRow
                          label="Total profit"
                          value={`$${fmt(s2.totalProfit)}`}
                          highlight
                          color="success.main"
                        />
                      </Stack>
                    </>
                  )}
                  {!useIntermediateTP && (
                    <Typography variant="caption" color="text.secondary">
                      Enable to split your position — take partial profit at an
                      intermediate level and let the rest run to full TP.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
