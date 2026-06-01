/*
  Warnings:

  - Added the required column `Status` to the `Tax` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FuelType" DROP CONSTRAINT "FuelType_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "Tax" DROP CONSTRAINT "Tax_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleBrand" DROP CONSTRAINT "VehicleBrand_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleDepartment" DROP CONSTRAINT "VehicleDepartment_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleDriver" DROP CONSTRAINT "VehicleDriver_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleOwner" DROP CONSTRAINT "VehicleOwner_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleStatus" DROP CONSTRAINT "VehicleStatus_TenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleType" DROP CONSTRAINT "VehicleType_TenantId_fkey";

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "Status" VARCHAR(15) NOT NULL;

-- CreateTable
CREATE TABLE "CompulsoryMotorInsuranceVehicle" (
    "TenantId" VARCHAR(36) NOT NULL,
    "CompulsoryMotorInsuranceVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Year" INTEGER NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "TotalPremium" DECIMAL(10,2) NOT NULL,
    "InsuranceCompany" TEXT NOT NULL,
    "BrokerName" TEXT NOT NULL,

    CONSTRAINT "CompulsoryMotorInsuranceVehicle_pkey" PRIMARY KEY ("CompulsoryMotorInsuranceVehicleId")
);
