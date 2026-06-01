-- Update existing NULL values
UPDATE "IncomeVehicle" 
SET 
  "Time" = '1 วัน' 
WHERE "Time" = '00:00';

-- AlterTable
ALTER TABLE "IncomeVehicle" 
ALTER COLUMN "Time" SET DEFAULT '1 วัน'; 