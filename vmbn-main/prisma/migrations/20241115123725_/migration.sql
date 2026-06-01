-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_VehicleDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_VehicleDriverId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_VehicleOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_VehicleStatusId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "VehicleDepartmentId" DROP NOT NULL,
ALTER COLUMN "VehicleDriverId" DROP NOT NULL,
ALTER COLUMN "VehicleOwnerId" DROP NOT NULL,
ALTER COLUMN "VehicleStatusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleOwnerId_fkey" FOREIGN KEY ("VehicleOwnerId") REFERENCES "VehicleOwner"("VehicleOwnerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleDepartmentId_fkey" FOREIGN KEY ("VehicleDepartmentId") REFERENCES "VehicleDepartment"("VehicleDepartmentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleDriverId_fkey" FOREIGN KEY ("VehicleDriverId") REFERENCES "VehicleDriver"("VehicleDriverId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleStatusId_fkey" FOREIGN KEY ("VehicleStatusId") REFERENCES "VehicleStatus"("VehicleStatusId") ON DELETE SET NULL ON UPDATE CASCADE;
