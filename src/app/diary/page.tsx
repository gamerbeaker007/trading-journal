import { prisma } from "@/lib/prisma";
import { DiaryClient } from "@/components/diary/DiaryClient";

export default async function DiaryPage() {
  const [entries, goals] = await Promise.all([
    prisma.dailyJournalEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.projectGoal.findMany({ orderBy: { id: "asc" } }),
  ]);

  return <DiaryClient entries={entries} goals={goals} />;
}
