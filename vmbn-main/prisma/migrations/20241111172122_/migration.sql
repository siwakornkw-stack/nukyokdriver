-- CreateTable
CREATE TABLE "GasolineCost" (
    "GasolineCostId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Item" TEXT NOT NULL,
    "Liters" INTEGER NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "OdometerStart" INTEGER NOT NULL,
    "OdometerEnd" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "GasolineCost_pkey" PRIMARY KEY ("GasolineCostId")
);

-- AddForeignKey
ALTER TABLE "GasolineCost" ADD CONSTRAINT "GasolineCost_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
