"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDailyEntriesAction() {
  return prisma.dailyJournalEntry.findMany({
    orderBy: { date: "desc" },
  });
}

export async function upsertDailyEntryAction(data: {
  date: string;
  effort?: string;
  snapshots?: string;
}) {
  const dateObj = new Date(data.date);
  await prisma.dailyJournalEntry.upsert({
    where: { date: dateObj },
    update: {
      effort: data.effort,
      snapshots: data.snapshots,
      dayOfWeek: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
    },
    create: {
      date: dateObj,
      dayOfWeek: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
      effort: data.effort,
      snapshots: data.snapshots,
    },
  });
  revalidatePath("/diary");
}

export async function deleteDailyEntryAction(id: number) {
  await prisma.dailyJournalEntry.delete({ where: { id } });
  revalidatePath("/diary");
}

export async function getGoalsAction() {
  return prisma.projectGoal.findMany({ orderBy: { id: "asc" } });
}

export async function createGoalAction(goal: string) {
  await prisma.projectGoal.create({ data: { goal } });
  revalidatePath("/diary");
}

export async function deleteGoalAction(id: number) {
  await prisma.projectGoal.delete({ where: { id } });
  revalidatePath("/diary");
}
