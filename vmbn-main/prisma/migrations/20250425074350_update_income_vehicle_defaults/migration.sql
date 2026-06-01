/*
  Warnings:

  - Made the column `AmountReceive` on table `IncomeVehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Date` on table `IncomeVehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `InvoiceNumber` on table `IncomeVehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `StatusPayment` on table `IncomeVehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Time` on table `IncomeVehicle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `WorkOrderNumber` on table `IncomeVehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- Update NULL values to default values
UPDATE "IncomeVehicle" 
SET 
  "AmountReceive" = 0 
WHERE "AmountReceive" IS NULL;

UPDATE "IncomeVehicle" 
SET 
  "Date" = CURRENT_TIMESTAMP 
WHERE "Date" IS NULL;

UPDATE "IncomeVehicle" 
SET 
  "InvoiceNumber" = '' 
WHERE "InvoiceNumber" IS NULL;

UPDATE "IncomeVehicle" 
SET 
  "StatusPayment" = 'รอดำเนินการ' 
WHERE "StatusPayment" IS NULL;

UPDATE "IncomeVehicle" 
SET 
  "Time" = '00:00' 
WHERE "Time" IS NULL;

UPDATE "IncomeVehicle" 
SET 
  "WorkOrderNumber" = '' 
WHERE "WorkOrderNumber" IS NULL;

-- AlterTable
ALTER TABLE "IncomeVehicle" ALTER COLUMN "AmountReceive" SET NOT NULL,
ALTER COLUMN "AmountReceive" SET DEFAULT 0,
ALTER COLUMN "Date" SET NOT NULL,
ALTER COLUMN "Date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "InvoiceNumber" SET NOT NULL,
ALTER COLUMN "InvoiceNumber" SET DEFAULT '',
ALTER COLUMN "StatusPayment" SET NOT NULL,
ALTER COLUMN "StatusPayment" SET DEFAULT 'รอดำเนินการ',
ALTER COLUMN "Time" SET NOT NULL,
ALTER COLUMN "Time" SET DEFAULT '00:00',
ALTER COLUMN "WorkOrderNumber" SET NOT NULL,
ALTER COLUMN "WorkOrderNumber" SET DEFAULT '';
