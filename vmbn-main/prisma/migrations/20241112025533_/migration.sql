-- CreateTable
CREATE TABLE "ImageVehicle" (
    "ImageVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Url" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "ImageVehicle_pkey" PRIMARY KEY ("ImageVehicleId")
);

-- AddForeignKey
ALTER TABLE "ImageVehicle" ADD CONSTRAINT "ImageVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
