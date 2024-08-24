/*
  Warnings:

  - You are about to drop the column `configurationId` on the `Log` table. All the data in the column will be lost.
  - Made the column `metadata` on table `Log` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_configurationId_fkey";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "configurationId",
ALTER COLUMN "metadata" SET NOT NULL;

-- CreateTable
CREATE TABLE "ModelCost" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokenCost" DOUBLE PRECISION NOT NULL,
    "outputTokenCost" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),

    CONSTRAINT "ModelCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelCost_provider_model_validFrom_key" ON "ModelCost"("provider", "model", "validFrom");

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp");
