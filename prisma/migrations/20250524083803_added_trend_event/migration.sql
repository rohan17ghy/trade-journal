-- CreateTable
CREATE TABLE "TrendEvent" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "direction" TEXT,
    "timeframe" TEXT,
    "screenshot" TEXT,
    "ruleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrendEvent" ADD CONSTRAINT "TrendEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
