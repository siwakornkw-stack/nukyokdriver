/*
  Warnings:

  - You are about to drop the column `TenantId` on the `CompulsoryMotorInsuranceVehicle` table. All the data in the column will be lost.
  - You are about to drop the column `TenantId` on the `Tax` table. All the data in the column will be lost.
  - Added the required column `VehicleId` to the `CompulsoryMotorInsuranceVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompulsoryMotorInsuranceVehicle" DROP COLUMN "TenantId",
ADD COLUMN     "VehicleId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "TenantId";

-- AddForeignKey
ALTER TABLE "CompulsoryMotorInsuranceVehicle" ADD CONSTRAINT "CompulsoryMotorInsuranceVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
