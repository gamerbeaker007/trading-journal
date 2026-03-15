"use client";

import { createStrategyAction, deleteStrategyAction } from "@/lib/db/trades";
import { useTransition } from "react";

const DEFAULT_STRATEGIES = [
  "TA",
  "BB Scalping Strategy",
  "CCV",
  "CCW",
  "CCSS Scalping Strategy",
  "MACD + MTF",
];

export function useStrategies() {
  const [isPending, startTransition] = useTransition();

  const handleAdd = (name: string, onSuccess: () => void) => {
    if (!name.trim()) return;
    startTransition(async () => {
      await createStrategyAction(name.trim());
      onSuccess();
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (
      !confirm(
        `Delete strategy "${name}"? This will unlink it from all trades.`,
      )
    )
      return;
    startTransition(() => deleteStrategyAction(id));
  };

  const seedDefaults = () => {
    startTransition(async () => {
      for (const name of DEFAULT_STRATEGIES) {
        await createStrategyAction(name);
      }
    });
  };

  return { isPending, handleAdd, handleDelete, seedDefaults };
}
