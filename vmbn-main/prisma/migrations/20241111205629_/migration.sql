-- CreateTable
CREATE TABLE "InstallmentsVehicle" (
    "InstallmentsVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "InstallmentNumber" INTEGER NOT NULL,
    "DueDate" TIMESTAMP(3) NOT NULL,
    "TextAlert" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "InstallmentsVehicle_pkey" PRIMARY KEY ("InstallmentsVehicleId")
);

-- AddForeignKey
ALTER TABLE "InstallmentsVehicle" ADD CONSTRAINT "InstallmentsVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
