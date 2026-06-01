/*
  Warnings:

  - Made the column `DateTime` on table `GasolineCost` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GasolineCost" ALTER COLUMN "DateTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "IncomeVehicle" ALTER COLUMN "ReceiveDate" DROP NOT NULL,
ALTER COLUMN "InvoiceNumber" DROP DEFAULT,
ALTER COLUMN "StatusPayment" DROP DEFAULT,
ALTER COLUMN "Time" DROP DEFAULT,
ALTER COLUMN "WorkOrderNumber" DROP DEFAULT;
