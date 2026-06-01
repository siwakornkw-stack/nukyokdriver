-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_VehicleBrandId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_VehicleTypeId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "VehicleTypeId" DROP NOT NULL,
ALTER COLUMN "VehicleBrandId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleTypeId_fkey" FOREIGN KEY ("VehicleTypeId") REFERENCES "VehicleType"("VehicleTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleBrandId_fkey" FOREIGN KEY ("VehicleBrandId") REFERENCES "VehicleBrand"("VehicleBrandId") ON DELETE SET NULL ON UPDATE CASCADE;
