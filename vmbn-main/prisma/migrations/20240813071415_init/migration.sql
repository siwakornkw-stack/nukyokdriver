-- CreateTable
CREATE TABLE "Partner" (
    "PartnerId" VARCHAR(36) NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "MobileNo" VARCHAR(50) NOT NULL,
    "LineId" TEXT,
    "BankCode" VARCHAR(10) NOT NULL,
    "AccountNo" VARCHAR(50) NOT NULL,
    "AccountName" VARCHAR(400) NOT NULL,
    "LoginToken" TEXT NOT NULL,
    "AffiliateToken" TEXT NOT NULL,
    "ReferByPartnerId" VARCHAR(36),
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

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("PartnerId")
);

-- CreateTable
CREATE TABLE "Setting" (
    "SettingConfigId" VARCHAR(36) NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "Key" TEXT NOT NULL,
    "Value" TEXT NOT NULL,
    "Category" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("SettingConfigId")
);

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ReferByCustomerId_fkey" FOREIGN KEY ("ReferByCustomerId") REFERENCES "Customer"("CustomerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ReferByPartnerId_fkey" FOREIGN KEY ("ReferByPartnerId") REFERENCES "Partner"("PartnerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_ReferByPartnerId_fkey" FOREIGN KEY ("ReferByPartnerId") REFERENCES "Partner"("PartnerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
