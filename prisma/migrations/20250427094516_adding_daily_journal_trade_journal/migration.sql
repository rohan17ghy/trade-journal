-- CreateTable
CREATE TABLE "TradeJournalEntry" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "setup" TEXT,
    "direction" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "positionSize" DOUBLE PRECISION NOT NULL,
    "profitLoss" DOUBLE PRECISION,
    "profitLossPercentage" DOUBLE PRECISION,
    "fees" DOUBLE PRECISION,
    "duration" TEXT,
    "entryTime" TIMESTAMP(3),
    "exitTime" TIMESTAMP(3),
    "psychology" TEXT,
    "notes" TEXT,
    "lessonsLearned" TEXT,
    "screenshots" TEXT[],
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyJournalId" TEXT,

    CONSTRAINT "TradeJournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyJournal" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "marketOverview" TEXT,
    "mood" TEXT,
    "physicalCondition" TEXT,
    "goals" TEXT,
    "achievements" TEXT,
    "challenges" TEXT,
    "insights" TEXT,
    "improvementAreas" TEXT,
    "planForTomorrow" TEXT,
    "gratitude" TEXT,
    "screenshots" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RuleToTradeJournalEntry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RuleToTradeJournalEntry_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyJournal_date_key" ON "DailyJournal"("date");

-- CreateIndex
CREATE INDEX "_RuleToTradeJournalEntry_B_index" ON "_RuleToTradeJournalEntry"("B");

-- AddForeignKey
ALTER TABLE "TradeJournalEntry" ADD CONSTRAINT "TradeJournalEntry_dailyJournalId_fkey" FOREIGN KEY ("dailyJournalId") REFERENCES "DailyJournal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuleToTradeJournalEntry" ADD CONSTRAINT "_RuleToTradeJournalEntry_A_fkey" FOREIGN KEY ("A") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuleToTradeJournalEntry" ADD CONSTRAINT "_RuleToTradeJournalEntry_B_fkey" FOREIGN KEY ("B") REFERENCES "TradeJournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
