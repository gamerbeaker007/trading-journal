-- CreateTable: Asset
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 8
);

-- CreateTable: Confluence
CREATE TABLE "Confluence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable: Strategy
CREATE TABLE "Strategy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable: Trade
CREATE TABLE "Trade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assetId" INTEGER,
    "entryDate" DATETIME,
    "exitDate" DATETIME,
    "entryPointTF" TEXT,
    "analyseTF" TEXT,
    "tradeType" TEXT,
    "strategyId" INTEGER,
    "dailyOrderFlow" TEXT,
    "orderFlow4h" TEXT,
    "orderFlow1h" TEXT,
    "otherConfluence" TEXT,
    "snapshots" TEXT,
    "direction" TEXT NOT NULL,
    "entries" TEXT,
    "tps" TEXT,
    "exits" TEXT,
    "stopLoss" REAL,
    "closedPnlAsset" REAL,
    "closedPnlUsd" REAL,
    "accountBalance" REAL,
    "feelAboutTrade" TEXT,
    "feelGeneral" TEXT,
    "followedPlan" TEXT,
    "happyWithResult" TEXT,
    "notes" TEXT,
    CONSTRAINT "Trade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trade_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: TradeConfluence
CREATE TABLE "TradeConfluence" (
    "tradeId" INTEGER NOT NULL,
    "confluenceId" INTEGER NOT NULL,
    CONSTRAINT "TradeConfluence_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradeConfluence_confluenceId_fkey" FOREIGN KEY ("confluenceId") REFERENCES "Confluence" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("tradeId", "confluenceId")
);

-- CreateTable: DailyJournalEntry
CREATE TABLE "DailyJournalEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "dayOfWeek" TEXT,
    "effort" TEXT,
    "snapshots" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable: ProjectGoal
CREATE TABLE "ProjectGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "goal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_ticker_key" ON "Asset"("ticker");
CREATE UNIQUE INDEX "Confluence_name_key" ON "Confluence"("name");
CREATE UNIQUE INDEX "Strategy_name_key" ON "Strategy"("name");
CREATE UNIQUE INDEX "DailyJournalEntry_date_key" ON "DailyJournalEntry"("date");

-- Seed default assets
INSERT INTO "Asset" ("ticker", "name", "decimals") VALUES
    ('BTC', 'Bitcoin', 8);

-- Seed default confluences
INSERT INTO "Confluence" ("name") VALUES
    ('Order Block'),
    ('Fibonacci Level'),
    ('S/R Level'),
    ('Fixed POC'),
    ('Highs/Lows (Liquidity)');

-- Seed default strategies
INSERT INTO "Strategy" ("name") VALUES
    ('Technical Analysis (TA)');
