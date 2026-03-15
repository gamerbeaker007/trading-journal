import { getTradesAction } from "@/lib/db/trades";
import { prisma } from "@/lib/prisma";
import { JournalClient } from "@/components/journal/JournalClient";

export default async function JournalPage() {
  const [trades, strategies, assets, confluences] = await Promise.all([
    getTradesAction(),
    prisma.strategy.findMany({ orderBy: { name: "asc" } }),
    prisma.asset.findMany({ orderBy: { ticker: "asc" } }),
    prisma.confluence.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <JournalClient
      trades={trades}
      strategies={strategies}
      assets={assets}
      confluences={confluences}
    />
  );
}
