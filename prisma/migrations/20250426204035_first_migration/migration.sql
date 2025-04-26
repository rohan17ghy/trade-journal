-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RulePerformanceEntry" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ruleId" TEXT NOT NULL,

    CONSTRAINT "RulePerformanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RulePerformanceEntry_date_idx" ON "RulePerformanceEntry"("date");

-- CreateIndex
CREATE INDEX "RulePerformanceEntry_ruleId_idx" ON "RulePerformanceEntry"("ruleId");

-- AddForeignKey
ALTER TABLE "RulePerformanceEntry" ADD CONSTRAINT "RulePerformanceEntry_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
