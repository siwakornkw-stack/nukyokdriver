-- AlterTable
ALTER TABLE "DrainTheOilVehicle" ADD COLUMN     "DueDate" TIMESTAMP(3),
ADD COLUMN     "Odometer" INTEGER NOT NULL DEFAULT 0;
