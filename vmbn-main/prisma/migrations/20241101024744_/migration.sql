-- CreateTable
CREATE TABLE "Vehicle" (
    "VehicleId" VARCHAR(36) NOT NULL,
    "No" SERIAL NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "LicensePlatePrefix" TEXT NOT NULL,
    "LicensePlateSuffix" TEXT NOT NULL,
    "LicensePlateProvince" TEXT NOT NULL,
    "VehicleTypeId" VARCHAR(36) NOT NULL,
    "VehicleCharacteristic" TEXT NOT NULL,
    "Brand" TEXT NOT NULL,
    "Model" TEXT NOT NULL,
    "Generation" TEXT NOT NULL,
    "Color" TEXT NOT NULL,
    "ChassisNumber" TEXT NOT NULL,
    "EngineNumber" TEXT NOT NULL,
    "EngineBrand" TEXT NOT NULL,
    "FuelTypeId" VARCHAR(36) NOT NULL,
    "TankSize" INTEGER NOT NULL,
    "FuelConsumption" INTEGER NOT NULL,
    "CylinderCount" INTEGER NOT NULL,
    "Cylinder" INTEGER NOT NULL,
    "VehicleSize" TEXT NOT NULL,
    "CargoSize" TEXT NOT NULL,
    "GasSerialNumber" TEXT NOT NULL,
    "VehicleWeight" INTEGER NOT NULL,
    "CargoWeight" INTEGER NOT NULL,
    "WheelCount" INTEGER NOT NULL,
    "SeatCount" INTEGER NOT NULL,
    "RegistrationDate" TIMESTAMP(3) NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "Age" INTEGER NOT NULL,
    "Ownership" TEXT NOT NULL,
    "LineNotifyToken" TEXT NOT NULL,
    "Owner" TEXT NOT NULL,
    "Department" TEXT NOT NULL,
    "Driver" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Note" TEXT NOT NULL,
    "Img" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TaxId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("VehicleId")
);

-- CreateTable
CREATE TABLE "FuelType" (
    "FuelTypeId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("FuelTypeId")
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "VehicleTypeId" VARCHAR(36) NOT NULL,
    "Status" VARCHAR(15) NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("VehicleTypeId")
);

-- CreateTable
CREATE TABLE "Tax" (
    "TaxId" VARCHAR(36) NOT NULL,
    "Year" INTEGER NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "TotalPremium" INTEGER NOT NULL,
    "InsuranceCompany" TEXT NOT NULL,
    "BrokerName" TEXT NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("TaxId")
);

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("TenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_VehicleTypeId_fkey" FOREIGN KEY ("VehicleTypeId") REFERENCES "VehicleType"("VehicleTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_FuelTypeId_fkey" FOREIGN KEY ("FuelTypeId") REFERENCES "FuelType"("FuelTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_TaxId_fkey" FOREIGN KEY ("TaxId") REFERENCES "Tax"("TaxId") ON DELETE RESTRICT ON UPDATE CASCADE;
