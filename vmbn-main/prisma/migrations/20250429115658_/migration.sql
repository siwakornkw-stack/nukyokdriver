/*
  Warnings:

  - You are about to drop the column `Date` on the `IncomeVehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IncomeVehicle" DROP COLUMN "Date",
ADD COLUMN     "DateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
