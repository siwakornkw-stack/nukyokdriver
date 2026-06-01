/*
  Warnings:

  - You are about to drop the column `AccountName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `AccountNo` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `AffiliateToken` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `AmountFirstDeposit` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `BankCode` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `CustomerGroupId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `GamePassword` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `GameUsername` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `IsAutoDeposit` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `IsAutoWithdraw` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `LoginToken` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `MaxCreditToClearTurnover` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `ReferByCustomerId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `ReferByPartnerId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `ReferType` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `TotalBonus` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `TotalDeposit` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `TotalWithdraw` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `TotalWithdrawWallet` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `WithdrawConditionIsSetCreditZero` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `WithdrawConditionMaxWithdraw` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `WithdrawConditionMinCredit` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `WithdrawConditionMinTurnover` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `AgentApiCat` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `AgentApiKey` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `AgentPrefix` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `AutoSystemExpiredDate` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `Theme` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the `Partner` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `PasswordHash` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SystemExpiredDate` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_ReferByCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_ReferByPartnerId_fkey";

-- DropForeignKey
ALTER TABLE "Partner" DROP CONSTRAINT "Partner_ReferByPartnerId_fkey";

-- DropForeignKey
ALTER TABLE "Partner" DROP CONSTRAINT "Partner_TenantId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "AccountName",
DROP COLUMN "AccountNo",
DROP COLUMN "AffiliateToken",
DROP COLUMN "AmountFirstDeposit",
DROP COLUMN "BankCode",
DROP COLUMN "CustomerGroupId",
DROP COLUMN "GamePassword",
DROP COLUMN "GameUsername",
DROP COLUMN "IsAutoDeposit",
DROP COLUMN "IsAutoWithdraw",
DROP COLUMN "LoginToken",
DROP COLUMN "MaxCreditToClearTurnover",
DROP COLUMN "ReferByCustomerId",
DROP COLUMN "ReferByPartnerId",
DROP COLUMN "ReferType",
DROP COLUMN "TotalBonus",
DROP COLUMN "TotalDeposit",
DROP COLUMN "TotalWithdraw",
DROP COLUMN "TotalWithdrawWallet",
DROP COLUMN "WithdrawConditionIsSetCreditZero",
DROP COLUMN "WithdrawConditionMaxWithdraw",
DROP COLUMN "WithdrawConditionMinCredit",
DROP COLUMN "WithdrawConditionMinTurnover",
ADD COLUMN     "Email" TEXT,
ADD COLUMN     "ImageUrl" TEXT,
ADD COLUMN     "PasswordHash" TEXT NOT NULL,
ALTER COLUMN "UpdatedTime" DROP NOT NULL,
ALTER COLUMN "UpdatedTime" DROP DEFAULT,
ALTER COLUMN "UpdatedByUsername" DROP NOT NULL,
ALTER COLUMN "UpdatedByUsername" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "AgentApiCat",
DROP COLUMN "AgentApiKey",
DROP COLUMN "AgentPrefix",
DROP COLUMN "AutoSystemExpiredDate",
DROP COLUMN "Theme",
ADD COLUMN     "SystemExpiredDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Partner";

-- CreateTable
CREATE TABLE "DomainName" (
    "DomainNameId" VARCHAR(36) NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "HostName" TEXT NOT NULL,
    "Type" VARCHAR(15) NOT NULL,

    CONSTRAINT "DomainName_pkey" PRIMARY KEY ("DomainNameId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "AdminId" VARCHAR(36) NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "ImageUrl" TEXT,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "MobileNo" VARCHAR(50) NOT NULL,
    "LineId" TEXT,
    "Status" VARCHAR(15) NOT NULL,
    "LatestIpAddress" VARCHAR(20) NOT NULL,
    "LatestLogin" TIMESTAMP(3),
    "CreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeletedTime" TIMESTAMP(3),
    "DeletedByUsername" TEXT,
    "IsOnline" BOOLEAN,
    "LatestOnline" TIMESTAMP(3),
    "PasswordHash" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("AdminId")
);

-- CreateTable
CREATE TABLE "RefreshTokensAdmin" (
    "RefreshTokenId" VARCHAR(36) NOT NULL,
    "HashedToken" TEXT NOT NULL,
    "Revoked" BOOLEAN NOT NULL DEFAULT false,
    "CreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedTime" TIMESTAMP(3),
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "AdminId" VARCHAR(36) NOT NULL,

    CONSTRAINT "RefreshTokensAdmin_pkey" PRIMARY KEY ("RefreshTokenId")
);

-- CreateIndex
CREATE INDEX "RefreshTokensAdmin_AdminId_idx" ON "RefreshTokensAdmin"("AdminId");

-- AddForeignKey
ALTER TABLE "DomainName" ADD CONSTRAINT "DomainName_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshTokensAdmin" ADD CONSTRAINT "RefreshTokensAdmin_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES "Admin"("AdminId") ON DELETE CASCADE ON UPDATE CASCADE;
