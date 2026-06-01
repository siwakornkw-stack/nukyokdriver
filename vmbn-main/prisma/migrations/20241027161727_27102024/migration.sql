/*
  Warnings:

  - Added the required column `TenantId` to the `RefreshTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `RefreshTokensAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RefreshTokens_CustomerId_idx";

-- DropIndex
DROP INDEX "RefreshTokensAdmin_AdminId_idx";

-- AlterTable
ALTER TABLE "RefreshTokens" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "RefreshTokensAdmin" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX "RefreshTokens_CustomerId_TenantId_idx" ON "RefreshTokens"("CustomerId", "TenantId");

-- CreateIndex
CREATE INDEX "RefreshTokensAdmin_AdminId_TenantId_idx" ON "RefreshTokensAdmin"("AdminId", "TenantId");

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshTokensAdmin" ADD CONSTRAINT "RefreshTokensAdmin_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE CASCADE ON UPDATE CASCADE;
