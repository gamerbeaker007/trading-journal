"use client";

import { createAssetAction, deleteAssetAction } from "@/lib/db/trades";
import { useTransition } from "react";

export function useAssets() {
  const [isPending, startTransition] = useTransition();

  const handleAdd = (
    ticker: string,
    name: string,
    decimals: number,
    onSuccess: () => void,
  ) => {
    if (!ticker.trim() || !name.trim()) return;
    startTransition(async () => {
      await createAssetAction(ticker.trim().toUpperCase(), name.trim(), decimals);
      onSuccess();
    });
  };

  const handleDelete = (id: number, ticker: string) => {
    if (
      !confirm(
        `Delete asset "${ticker}"? This will unlink it from all trades.`,
      )
    )
      return;
    startTransition(() => deleteAssetAction(id));
  };

  return { isPending, handleAdd, handleDelete };
}
