-- CreateTable
CREATE TABLE "DrainTheOilVehicle" (
    "DrainTheOilVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "TextAlert" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "DrainTheOilVehicle_pkey" PRIMARY KEY ("DrainTheOilVehicleId")
);

-- AddForeignKey
ALTER TABLE "DrainTheOilVehicle" ADD CONSTRAINT "DrainTheOilVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
