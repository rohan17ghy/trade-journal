/*
  Warnings:

  - The `description` column on the `TrendEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TrendEvent" DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL DEFAULT '{"type": "doc", "content": []}';
