-- CreateTable
CREATE TABLE "InsurancePolicyVehicle" (
    "InsurancePolicyVehicleId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Year" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "InsuranceCompany" TEXT NOT NULL,
    "BrokerName" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "TotalPremium" DECIMAL(10,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "VehicleId" VARCHAR(36) NOT NULL,

    CONSTRAINT "InsurancePolicyVehicle_pkey" PRIMARY KEY ("InsurancePolicyVehicleId")
);

-- AddForeignKey
ALTER TABLE "InsurancePolicyVehicle" ADD CONSTRAINT "InsurancePolicyVehicle_VehicleId_fkey" FOREIGN KEY ("VehicleId") REFERENCES "Vehicle"("VehicleId") ON DELETE RESTRICT ON UPDATE CASCADE;
