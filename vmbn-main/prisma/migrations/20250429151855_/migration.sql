-- AlterTable
ALTER TABLE "IncomeVehicle" ADD COLUMN     "PaymentStatusId" VARCHAR(36);

-- CreateTable
CREATE TABLE "PaymentStatus" (
    "TenantId" VARCHAR(36) NOT NULL,
    "PaymentStatusId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,

    CONSTRAINT "PaymentStatus_pkey" PRIMARY KEY ("PaymentStatusId")
);

-- CreateIndex
CREATE INDEX "PaymentStatus_TenantId_idx" ON "PaymentStatus"("TenantId");

-- CreateIndex
CREATE INDEX "PaymentStatus_PaymentStatusId_idx" ON "PaymentStatus"("PaymentStatusId");

-- AddForeignKey
ALTER TABLE "IncomeVehicle" ADD CONSTRAINT "IncomeVehicle_PaymentStatusId_fkey" FOREIGN KEY ("PaymentStatusId") REFERENCES "PaymentStatus"("PaymentStatusId") ON DELETE SET NULL ON UPDATE CASCADE;
