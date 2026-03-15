"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { AssetsSection } from "./AssetsSection";
import { ConfluencesSection } from "./ConfluencesSection";
import { OptionsSection } from "./OptionsSection";
import { StrategiesSection } from "./StrategiesSection";

type StrategyWithCount = {
  id: number;
  name: string;
  _count: { trades: number };
};
type AssetWithCount = {
  id: number;
  ticker: string;
  name: string;
  decimals: number;
  _count: { trades: number };
};
type ConfluenceWithCount = {
  id: number;
  name: string;
  _count: { trades: number };
};

export function ConfigClient({
  strategies,
  assets,
  confluences,
}: {
  strategies: StrategyWithCount[];
  assets: AssetWithCount[];
  confluences: ConfluenceWithCount[];
}) {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Strategies" />
        <Tab label="Assets" />
        <Tab label="Confluences" />
        <Tab label="Options" />
      </Tabs>

      {tab === 0 && <StrategiesSection strategies={strategies} />}
      {tab === 1 && <AssetsSection assets={assets} />}
      {tab === 2 && <ConfluencesSection confluences={confluences} />}
      {tab === 3 && <OptionsSection />}
    </Box>
  );
}
