/*
  Warnings:

  - You are about to alter the column `TotalPremium` on the `Tax` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to drop the column `TaxId` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `VehicleId` to the `Tax` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_TaxId_fkey";

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "VehicleId" VARCHAR(36) NOT NULL,
ALTER COLUMN "TotalPremium" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "TaxId";

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
