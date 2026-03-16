export const dynamic = "force-dynamic";

import { ConfigClient } from "@/components/config/ConfigClient";
import { prisma } from "@/lib/prisma";
import { Typography } from "@mui/material";

export default async function ConfigPage() {
  const [strategies, assets, confluences] = await Promise.all([
    prisma.strategy.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { trades: true } } },
    }),
    prisma.asset.findMany({
      orderBy: { ticker: "asc" },
      include: { _count: { select: { trades: true } } },
    }),
    prisma.confluence.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { trades: true } } },
    }),
  ]);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Configuration
      </Typography>
      <ConfigClient
        strategies={strategies}
        assets={assets}
        confluences={confluences}
      />
    </>
  );
}
