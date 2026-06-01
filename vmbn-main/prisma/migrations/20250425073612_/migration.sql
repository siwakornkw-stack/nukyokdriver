-- AlterTable
ALTER TABLE "GasolineCost" ADD COLUMN     "DateTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "IncomeVehicle" ADD COLUMN     "AmountReceive" DECIMAL(10,2),
ADD COLUMN     "Date" TIMESTAMP(3),
ADD COLUMN     "InvoiceNumber" VARCHAR(50),
ADD COLUMN     "StatusPayment" VARCHAR(50),
ADD COLUMN     "Time" TEXT,
ADD COLUMN     "VehicleDriverId" VARCHAR(36),
ADD COLUMN     "WorkOrderNumber" VARCHAR(50);

-- AddForeignKey
ALTER TABLE "IncomeVehicle" ADD CONSTRAINT "IncomeVehicle_VehicleDriverId_fkey" FOREIGN KEY ("VehicleDriverId") REFERENCES "VehicleDriver"("VehicleDriverId") ON DELETE SET NULL ON UPDATE CASCADE;
