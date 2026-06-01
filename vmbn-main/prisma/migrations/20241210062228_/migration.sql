/*
  Warnings:

  - Added the required column `TenantId` to the `LineWebhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LineWebhook" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX "LineWebhook_TenantId_idx" ON "LineWebhook"("TenantId");
