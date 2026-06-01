-- AlterTable
ALTER TABLE "VehicleBrand" ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "CreatedByUsername" TEXT,
ADD COLUMN     "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "UpdatedByUsername" TEXT;

-- CreateIndex
CREATE INDEX "VehicleType_TenantId_idx" ON "VehicleType"("TenantId");

-- CreateIndex
CREATE INDEX "VehicleType_VehicleTypeId_idx" ON "VehicleType"("VehicleTypeId");
