-- CreateTable
CREATE TABLE "AccidentVehicle" (
    "AccidentVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "Time" TEXT NOT NULL,
    "Party" TEXT NOT NULL,
    "LicensePlate" TEXT NOT NULL,
    "DriverName" TEXT NOT NULL,
    "Opponent" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "AccidentVehicle_pkey" PRIMARY KEY ("AccidentVehicleId")
);

-- AddForeignKey
ALTER TABLE "AccidentVehicle" ADD CONSTRAINT "AccidentVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
