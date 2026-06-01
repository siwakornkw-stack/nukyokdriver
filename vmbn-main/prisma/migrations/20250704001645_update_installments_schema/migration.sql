/*
  Warnings:

  - You are about to drop the column `TextAlert` on the `InstallmentsVehicle` table. All the data in the column will be lost.
  - Added the required column `Amount` to the `InstallmentsVehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PaymentEvidence` to the `InstallmentsVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InstallmentsVehicle" DROP COLUMN "TextAlert",
ADD COLUMN     "Amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "DatePay" TIMESTAMP(3),
ADD COLUMN     "PaymentEvidence" TEXT NOT NULL;
