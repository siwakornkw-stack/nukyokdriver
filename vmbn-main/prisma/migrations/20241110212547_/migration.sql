-- CreateTable
CREATE TABLE "AttachFileVehicle" (
    "AttachFileVehicleId" VARCHAR(36) NOT NULL,
    "FileName" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Url" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "AttachFileVehicle_pkey" PRIMARY KEY ("AttachFileVehicleId")
);

-- AddForeignKey
ALTER TABLE "AttachFileVehicle" ADD CONSTRAINT "AttachFileVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
