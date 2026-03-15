import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const OPTIONS_DATA = {
  "Direction Types": ["Long", "Short"],
  "Trade Types": ["Swing Trade", "Short Term Trade", "Day Trade & Scalps"],
  "Order Flow": ["Bullish", "Bearish", "Ranging"],
  "TP % Presets": ["1%", "10%", "25%", "50%", "75%", "100%"],
} as const;

export function OptionsSection() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Options / Reference Data
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        These are the fixed dropdown options baked into the Trade Journal form.
        To customise strategies, use the <strong>Strategies</strong> tab.
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(OPTIONS_DATA).map(([category, values]) => (
          <Grid size={{ xs: 12, sm: 6 }} key={category}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                  {category}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {values.map((v) => (
                    <Chip key={v} label={v} size="small" variant="outlined" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Technical Signal Toggles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            These are boolean toggles available per trade:
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {[
              "Order Block",
              "Fibonacci Level",
              "S/R Level",
              "Fixed POC",
              "Highs/Lows (Liquidity)",
            ].map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
