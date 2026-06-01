-- CreateTable
CREATE TABLE "RepairVehicle" (
    "RepairVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "RepairDate" TIMESTAMP(3) NOT NULL,
    "LicensePlate" TEXT NOT NULL,
    "RepairShop" TEXT NOT NULL,
    "ReceiveDate" TIMESTAMP(3) NOT NULL,
    "InsurancePay" DECIMAL(10,2) NOT NULL,
    "CompanyPay" DECIMAL(10,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "RepairVehicle_pkey" PRIMARY KEY ("RepairVehicleId")
);

-- AddForeignKey
ALTER TABLE "RepairVehicle" ADD CONSTRAINT "RepairVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
