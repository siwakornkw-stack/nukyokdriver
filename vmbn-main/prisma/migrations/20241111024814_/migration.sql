-- CreateTable
CREATE TABLE "CarTires" (
    "CarTiresId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "ChangeDate" TIMESTAMP(3) NOT NULL,
    "Position" TEXT NOT NULL,
    "Brand" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "CarTires_pkey" PRIMARY KEY ("CarTiresId")
);

-- AddForeignKey
ALTER TABLE "CarTires" ADD CONSTRAINT "CarTires_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
