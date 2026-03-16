"use client";

import {
  createGoalAction,
  deleteDailyEntryAction,
  deleteGoalAction,
} from "@/lib/db/diary";
import type { DailyJournalEntry } from "@/generated/prisma";
import { useState, useTransition } from "react";

export function useDiary() {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<DailyJournalEntry | undefined>();
  const [viewEntry, setViewEntry] = useState<DailyJournalEntry | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [isPending, startTransition] = useTransition();

  const openAddEntry = () => {
    setEditEntry(undefined);
    setEntryDialogOpen(true);
  };

  const openEditEntry = (entry: DailyJournalEntry) => {
    setEditEntry(entry);
    setEntryDialogOpen(true);
  };

  const handleDeleteEntry = (id: number) => {
    if (!confirm("Delete this journal entry?")) return;
    startTransition(() => deleteDailyEntryAction(id));
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    startTransition(async () => {
      await createGoalAction(newGoal.trim());
      setNewGoal("");
    });
  };

  const handleDeleteGoal = (id: number) => {
    startTransition(() => deleteGoalAction(id));
  };

  return {
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
  };
}
