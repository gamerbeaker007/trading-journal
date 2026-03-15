"use server";

import { prisma } from "@/lib/prisma";
import { type TradeFormData } from "@/lib/trade-utils";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATHS = ["/journal", "/", "/dashboard/strategy"];
function revalidateAll() {
  for (const p of REVALIDATE_PATHS) revalidatePath(p);
}

// --- Trade CRUD ---

export async function getTradesAction(strategyId?: number, assetId?: number) {
  return prisma.trade.findMany({
    where: {
      ...(strategyId ? { strategyId } : {}),
      ...(assetId ? { assetId } : {}),
    },
    include: {
      strategy: true,
      asset: true,
      confluences: { include: { confluence: true } },
    },
    orderBy: { entryDate: "desc" },
  });
}

export async function createTradeAction(data: TradeFormData) {
  const trade = await prisma.trade.create({
    data: {
      assetId: data.assetId ?? undefined,
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
      exitDate: data.exitDate ? new Date(data.exitDate) : undefined,
      entryPointTF: data.entryPointTF,
      analyseTF: data.analyseTF,
      tradeType: data.tradeType,
      strategyId: data.strategyId,
      dailyOrderFlow: data.dailyOrderFlow,
      orderFlow4h: data.orderFlow4h,
      orderFlow1h: data.orderFlow1h,
      otherConfluence: data.otherConfluence,
      snapshots: data.snapshots,
      direction: data.direction,
      entries: JSON.stringify(data.entries ?? []),
      tps: JSON.stringify(data.tps ?? []),
      exits: JSON.stringify(data.exits ?? []),
      stopLoss: data.stopLoss,
      closedPnlAsset: data.closedPnlAsset,
      closedPnlUsd: data.closedPnlUsd,
      accountBalance: data.accountBalance,
      feelAboutTrade: data.feelAboutTrade,
      feelGeneral: data.feelGeneral,
      followedPlan: data.followedPlan,
      happyWithResult: data.happyWithResult,
      notes: data.notes,
    },
  });

  if (data.confluenceIds?.length) {
    await prisma.tradeConfluence.createMany({
      data: data.confluenceIds.map((confluenceId) => ({
        tradeId: trade.id,
        confluenceId,
      })),
    });
  }

  revalidateAll();
}

export async function updateTradeAction(id: number, data: TradeFormData) {
  await prisma.trade.update({
    where: { id },
    data: {
      assetId: data.assetId ?? null,
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
      exitDate: data.exitDate ? new Date(data.exitDate) : undefined,
      entryPointTF: data.entryPointTF,
      analyseTF: data.analyseTF,
      tradeType: data.tradeType,
      strategyId: data.strategyId,
      dailyOrderFlow: data.dailyOrderFlow,
      orderFlow4h: data.orderFlow4h,
      orderFlow1h: data.orderFlow1h,
      otherConfluence: data.otherConfluence,
      snapshots: data.snapshots,
      direction: data.direction,
      entries: JSON.stringify(data.entries ?? []),
      tps: JSON.stringify(data.tps ?? []),
      exits: JSON.stringify(data.exits ?? []),
      stopLoss: data.stopLoss,
      closedPnlAsset: data.closedPnlAsset,
      closedPnlUsd: data.closedPnlUsd,
      accountBalance: data.accountBalance,
      feelAboutTrade: data.feelAboutTrade,
      feelGeneral: data.feelGeneral,
      followedPlan: data.feelGeneral,
      happyWithResult: data.happyWithResult,
      notes: data.notes,
      confluences: {
        deleteMany: {},
        createMany: {
          data: (data.confluenceIds ?? []).map((confluenceId) => ({
            confluenceId,
          })),
        },
      },
    },
  });
  revalidateAll();
}

export async function deleteTradeAction(id: number) {
  await prisma.trade.delete({ where: { id } });
  revalidateAll();
}

// --- Strategy ---

export async function getStrategiesAction() {
  return prisma.strategy.findMany({ orderBy: { name: "asc" } });
}

export async function createStrategyAction(name: string) {
  await prisma.strategy.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  revalidatePath("/config");
}

export async function deleteStrategyAction(id: number) {
  await prisma.strategy.delete({ where: { id } });
  revalidatePath("/config");
}

// --- Asset ---

export async function getAssetsAction() {
  return prisma.asset.findMany({ orderBy: { ticker: "asc" } });
}

export async function createAssetAction(
  ticker: string,
  name: string,
  decimals = 8,
) {
  const asset = await prisma.asset.upsert({
    where: { ticker: ticker.toUpperCase() },
    update: { name, decimals },
    create: { ticker: ticker.toUpperCase(), name, decimals },
  });
  revalidatePath("/config");
  revalidatePath("/journal");
  revalidatePath("/dashboard/strategy");
  return asset;
}

export async function deleteAssetAction(id: number) {
  await prisma.asset.delete({ where: { id } });
  revalidatePath("/config");
}

// --- Confluence ---

export async function getConfluencesAction() {
  return prisma.confluence.findMany({ orderBy: { name: "asc" } });
}

export async function createConfluenceAction(name: string) {
  await prisma.confluence.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  revalidatePath("/config");
}

export async function deleteConfluenceAction(id: number) {
  await prisma.confluence.delete({ where: { id } });
  revalidatePath("/config");
}

// --- Dashboard aggregations ---

export async function getDashboardStatsAction(
  strategyId?: number,
  assetId?: number,
) {
  const where = {
    ...(strategyId ? { strategyId } : {}),
    ...(assetId ? { assetId } : {}),
  };

  const [trades, assetRecord] = await Promise.all([
    prisma.trade.findMany({
      where,
      select: { closedPnlAsset: true, closedPnlUsd: true, exits: true },
    }),
    assetId
      ? prisma.asset.findUnique({
          where: { id: assetId },
          select: { ticker: true, decimals: true },
        })
      : null,
  ]);

  const closed = trades.filter((t) => {
    try {
      return (JSON.parse(t.exits ?? "[]") as unknown[]).length > 0;
    } catch {
      return false;
    }
  });

  const total = closed.length;
  const winners = closed.filter((t) => (t.closedPnlUsd ?? 0) > 0).length;
  const losers = total - winners;
  const winRate = total > 0 ? winners / total : null;

  const usd = (t: { closedPnlUsd: number | null }) => t.closedPnlUsd ?? 0;
  const totalPnlUsd = trades.reduce((s, t) => s + usd(t), 0);
  const amountWin = trades.filter((t) => usd(t) > 0).reduce((s, t) => s + usd(t), 0);
  const amountLoss = trades.filter((t) => usd(t) < 0).reduce((s, t) => s + usd(t), 0);
  const maxWin = Math.max(0, ...trades.map(usd));
  const maxLoss = Math.min(0, ...trades.map(usd));
  const winAvg = winners > 0 ? amountWin / winners : null;
  const lossAvg = losers > 0 ? amountLoss / losers : null;

  const totalPnlNative =
    assetId != null
      ? trades.reduce((s, t) => s + (t.closedPnlAsset ?? 0), 0)
      : null;

  return {
    total,
    winners,
    losers,
    winRate,
    totalPnlNative,
    totalPnlUsd,
    amountWin,
    amountLoss,
    maxWin,
    maxLoss,
    winAvg,
    lossAvg,
    assetTicker: assetRecord?.ticker ?? null,
    assetDecimals: assetRecord?.decimals ?? 8,
  };
}

export async function getPnlSeriesAction(
  strategyId?: number,
  assetId?: number,
) {
  const where = {
    ...(strategyId ? { strategyId } : {}),
    ...(assetId ? { assetId } : {}),
  };
  const trades = await prisma.trade.findMany({
    where: { ...where, closedPnlUsd: { not: null } },
    select: { exitDate: true, closedPnlUsd: true },
    orderBy: { exitDate: "asc" },
  });

  let cumulative = 0;
  return trades.map((t) => {
    const pnl = t.closedPnlUsd ?? 0;
    cumulative += pnl;
    return {
      date: t.exitDate?.toISOString().split("T")[0] ?? "",
      pnl,
      cumulative,
    };
  });
}

export type TradeWithRelations = Awaited<
  ReturnType<typeof getTradesAction>
>[number];
