-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_FuelTypeId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "FuelTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_FuelTypeId_fkey" FOREIGN KEY ("FuelTypeId") REFERENCES "FuelType"("FuelTypeId") ON DELETE SET NULL ON UPDATE CASCADE;
