/*
  Warnings:

  - You are about to drop the column `Brand` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Department` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Driver` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Owner` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `VehicleBrandId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VehicleDepartmentId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VehicleDriverId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VehicleOwnerId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VehicleStatusId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "Brand",
DROP COLUMN "Department",
DROP COLUMN "Driver",
DROP COLUMN "Owner",
DROP COLUMN "Status",
ADD COLUMN     "VehicleBrandId" VARCHAR(36) NOT NULL,
ADD COLUMN     "VehicleDepartmentId" VARCHAR(36) NOT NULL,
ADD COLUMN     "VehicleDriverId" VARCHAR(36) NOT NULL,
ADD COLUMN     "VehicleOwnerId" VARCHAR(36) NOT NULL,
ADD COLUMN     "VehicleStatusId" VARCHAR(36) NOT NULL;

-- CreateTable
CREATE TABLE "VehicleBrand" (
    "VehicleBrandId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "VehicleBrand_pkey" PRIMARY KEY ("VehicleBrandId")
);

-- CreateTable
CREATE TABLE "VehicleOwner" (
    "VehicleOwnerId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "VehicleOwner_pkey" PRIMARY KEY ("VehicleOwnerId")
);

-- CreateTable
CREATE TABLE "VehicleDepartment" (
    "VehicleDepartmentId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "VehicleDepartment_pkey" PRIMARY KEY ("VehicleDepartmentId")
);

-- CreateTable
CREATE TABLE "VehicleDriver" (
    "VehicleDriverId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "VehicleDriver_pkey" PRIMARY KEY ("VehicleDriverId")
);

-- CreateTable
CREATE TABLE "VehicleStatus" (
    "VehicleStatusId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "VehicleStatus_pkey" PRIMARY KEY ("VehicleStatusId")
);

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleBrandId_fkey" FOREIGN KEY ("VehicleBrandId") REFERENCES "VehicleBrand"("VehicleBrandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleOwnerId_fkey" FOREIGN KEY ("VehicleOwnerId") REFERENCES "VehicleOwner"("VehicleOwnerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleDepartmentId_fkey" FOREIGN KEY ("VehicleDepartmentId") REFERENCES "VehicleDepartment"("VehicleDepartmentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleDriverId_fkey" FOREIGN KEY ("VehicleDriverId") REFERENCES "VehicleDriver"("VehicleDriverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleStatusId_fkey" FOREIGN KEY ("VehicleStatusId") REFERENCES "VehicleStatus"("VehicleStatusId") ON DELETE RESTRICT ON UPDATE CASCADE;
