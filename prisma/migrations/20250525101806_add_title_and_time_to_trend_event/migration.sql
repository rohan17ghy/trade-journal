/*
  Warnings:

  - You are about to drop the column `screenshot` on the `TrendEvent` table. All the data in the column will be lost.
  - You are about to drop the column `timeframe` on the `TrendEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TrendEvent" DROP COLUMN "screenshot",
DROP COLUMN "timeframe",
ADD COLUMN     "time" TEXT,
ADD COLUMN     "title" TEXT;
