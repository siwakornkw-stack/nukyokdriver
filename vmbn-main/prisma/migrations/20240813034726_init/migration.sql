/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Tenant" (
    "TenantId" VARCHAR(36) NOT NULL,
    "Name" TEXT NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "AgentApiKey" TEXT NOT NULL,
    "AgentApiCat" TEXT NOT NULL,
    "AgentPrefix" TEXT NOT NULL,
    "AutoSystemExpiredDate" TIMESTAMP(3) NOT NULL,
    "Theme" TEXT NOT NULL,
    "Remark" TEXT,
    "CreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("TenantId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "CustomerId" VARCHAR(36) NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "GameUsername" TEXT NOT NULL,
    "GamePassword" TEXT NOT NULL,
    "MobileNo" VARCHAR(50) NOT NULL,
    "LineId" TEXT,
    "BankCode" VARCHAR(10) NOT NULL,
    "AccountNo" VARCHAR(50) NOT NULL,
    "AccountName" VARCHAR(400) NOT NULL,
    "LoginToken" TEXT NOT NULL,
    "AffiliateToken" TEXT NOT NULL,
    "ReferByCustomerId" VARCHAR(36),
    "ReferType" TEXT,
    "ReferByPartnerId" VARCHAR(36),
    "AmountFirstDeposit" DECIMAL(18,2),
    "LatestIpAddress" VARCHAR(20) NOT NULL,
    "LatestLogin" TIMESTAMP(3),
    "TotalDeposit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalWithdraw" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalBonus" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "TotalWithdrawWallet" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "Status" VARCHAR(15),
    "CreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT NOT NULL DEFAULT 'auto',
    "UpdatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedByUsername" TEXT NOT NULL DEFAULT 'auto',
    "DeletedTime" TIMESTAMP(3),
    "DeletedByUsername" TEXT,
    "IsOnline" BOOLEAN,
    "LatestOnline" TIMESTAMP(3),
    "IsAutoDeposit" BOOLEAN NOT NULL DEFAULT true,
    "IsAutoWithdraw" BOOLEAN NOT NULL DEFAULT true,
    "WithdrawConditionMinTurnover" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "WithdrawConditionMinCredit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "WithdrawConditionMaxWithdraw" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "WithdrawConditionIsSetCreditZero" BOOLEAN NOT NULL DEFAULT false,
    "MaxCreditToClearTurnover" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "CustomerGroupId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("CustomerId")
);
