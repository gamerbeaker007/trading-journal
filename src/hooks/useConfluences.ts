"use client";

import { createConfluenceAction, deleteConfluenceAction } from "@/lib/db/trades";
import { useTransition } from "react";

export function useConfluences() {
  const [isPending, startTransition] = useTransition();

  const handleAdd = (name: string, onSuccess: () => void) => {
    if (!name.trim()) return;
    startTransition(async () => {
      await createConfluenceAction(name.trim());
      onSuccess();
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (
      !confirm(`Delete confluence "${name}"? It will be removed from all trades.`)
    )
      return;
    startTransition(() => deleteConfluenceAction(id));
  };

  return { isPending, handleAdd, handleDelete };
}
