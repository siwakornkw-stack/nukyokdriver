/*
  Warnings:

  - Added the required column `TenantId` to the `FuelType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `Tax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `VehicleBrand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `VehicleDepartment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `VehicleDriver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `VehicleOwner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `VehicleStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TenantId` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FuelType" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleBrand" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleDepartment" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleDriver" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleOwner" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleStatus" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "TenantId" VARCHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE "FuelType" ADD CONSTRAINT "FuelType_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleType" ADD CONSTRAINT "VehicleType_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleBrand" ADD CONSTRAINT "VehicleBrand_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleOwner" ADD CONSTRAINT "VehicleOwner_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDepartment" ADD CONSTRAINT "VehicleDepartment_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDriver" ADD CONSTRAINT "VehicleDriver_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleStatus" ADD CONSTRAINT "VehicleStatus_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
