-- CreateTable
CREATE TABLE "IncomeVehicle" (
    "IncomeVehicleId" VARCHAR(36) NOT NULL,
    "Description" TEXT NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "IncomeVehicle_pkey" PRIMARY KEY ("IncomeVehicleId")
);

-- CreateIndex
CREATE INDEX "IncomeVehicle_VehicleId_idx" ON "IncomeVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "IncomeVehicle_IncomeVehicleId_idx" ON "IncomeVehicle"("IncomeVehicleId");

-- AddForeignKey
ALTER TABLE "IncomeVehicle" ADD CONSTRAINT "IncomeVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
