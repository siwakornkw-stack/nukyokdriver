/*
  Warnings:

  - Made the column `Status` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "CreatedByUsername" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "Rank" VARCHAR(15),
ADD COLUMN     "UpdatedByUsername" TEXT;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "Status" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AccidentVehicle_VehicleId_idx" ON "AccidentVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "AccidentVehicle_AccidentVehicleId_idx" ON "AccidentVehicle"("AccidentVehicleId");

-- CreateIndex
CREATE INDEX "Admin_TenantId_idx" ON "Admin"("TenantId");

-- CreateIndex
CREATE INDEX "Admin_AdminId_idx" ON "Admin"("AdminId");

-- CreateIndex
CREATE INDEX "AttachFileVehicle_VehicleId_idx" ON "AttachFileVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "AttachFileVehicle_AttachFileVehicleId_idx" ON "AttachFileVehicle"("AttachFileVehicleId");

-- CreateIndex
CREATE INDEX "CarTires_VehicleId_idx" ON "CarTires"("VehicleId");

-- CreateIndex
CREATE INDEX "CarTires_CarTiresId_idx" ON "CarTires"("CarTiresId");

-- CreateIndex
CREATE INDEX "CompulsoryMotorInsuranceVehicle_VehicleId_idx" ON "CompulsoryMotorInsuranceVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "CompulsoryMotorInsuranceVehicle_CompulsoryMotorInsuranceVeh_idx" ON "CompulsoryMotorInsuranceVehicle"("CompulsoryMotorInsuranceVehicleId");

-- CreateIndex
CREATE INDEX "Customer_TenantId_idx" ON "Customer"("TenantId");

-- CreateIndex
CREATE INDEX "Customer_CustomerId_idx" ON "Customer"("CustomerId");

-- CreateIndex
CREATE INDEX "DomainName_TenantId_idx" ON "DomainName"("TenantId");

-- CreateIndex
CREATE INDEX "DomainName_HostName_idx" ON "DomainName"("HostName");

-- CreateIndex
CREATE INDEX "DrainTheOilVehicle_VehicleId_idx" ON "DrainTheOilVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "DrainTheOilVehicle_DrainTheOilVehicleId_idx" ON "DrainTheOilVehicle"("DrainTheOilVehicleId");

-- CreateIndex
CREATE INDEX "FuelType_TenantId_idx" ON "FuelType"("TenantId");

-- CreateIndex
CREATE INDEX "FuelType_FuelTypeId_idx" ON "FuelType"("FuelTypeId");

-- CreateIndex
CREATE INDEX "GasolineCost_VehicleId_idx" ON "GasolineCost"("VehicleId");

-- CreateIndex
CREATE INDEX "GasolineCost_GasolineCostId_idx" ON "GasolineCost"("GasolineCostId");

-- CreateIndex
CREATE INDEX "ImageVehicle_VehicleId_idx" ON "ImageVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "ImageVehicle_ImageVehicleId_idx" ON "ImageVehicle"("ImageVehicleId");

-- CreateIndex
CREATE INDEX "InstallmentsVehicle_VehicleId_idx" ON "InstallmentsVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "InstallmentsVehicle_InstallmentsVehicleId_idx" ON "InstallmentsVehicle"("InstallmentsVehicleId");

-- CreateIndex
CREATE INDEX "InsurancePolicyVehicle_VehicleId_idx" ON "InsurancePolicyVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "InsurancePolicyVehicle_InsurancePolicyVehicleId_idx" ON "InsurancePolicyVehicle"("InsurancePolicyVehicleId");

-- CreateIndex
CREATE INDEX "RefreshTokens_RefreshTokenId_idx" ON "RefreshTokens"("RefreshTokenId");

-- CreateIndex
CREATE INDEX "RefreshTokensAdmin_RefreshTokenId_idx" ON "RefreshTokensAdmin"("RefreshTokenId");

-- CreateIndex
CREATE INDEX "RepairVehicle_VehicleId_idx" ON "RepairVehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "RepairVehicle_RepairVehicleId_idx" ON "RepairVehicle"("RepairVehicleId");

-- CreateIndex
CREATE INDEX "Setting_TenantId_idx" ON "Setting"("TenantId");

-- CreateIndex
CREATE INDEX "Setting_SettingConfigId_idx" ON "Setting"("SettingConfigId");

-- CreateIndex
CREATE INDEX "Tax_VehicleId_idx" ON "Tax"("VehicleId");

-- CreateIndex
CREATE INDEX "Tax_TaxId_idx" ON "Tax"("TaxId");

-- CreateIndex
CREATE INDEX "Tenant_TenantId_idx" ON "Tenant"("TenantId");

-- CreateIndex
CREATE INDEX "Vehicle_TenantId_idx" ON "Vehicle"("TenantId");

-- CreateIndex
CREATE INDEX "Vehicle_VehicleId_idx" ON "Vehicle"("VehicleId");

-- CreateIndex
CREATE INDEX "VehicleBrand_TenantId_idx" ON "VehicleBrand"("TenantId");

-- CreateIndex
CREATE INDEX "VehicleBrand_VehicleBrandId_idx" ON "VehicleBrand"("VehicleBrandId");

-- CreateIndex
CREATE INDEX "VehicleDepartment_TenantId_idx" ON "VehicleDepartment"("TenantId");

-- CreateIndex
CREATE INDEX "VehicleDepartment_VehicleDepartmentId_idx" ON "VehicleDepartment"("VehicleDepartmentId");

-- CreateIndex
CREATE INDEX "VehicleDriver_TenantId_idx" ON "VehicleDriver"("TenantId");

-- CreateIndex
CREATE INDEX "VehicleDriver_VehicleDriverId_idx" ON "VehicleDriver"("VehicleDriverId");

-- CreateIndex
CREATE INDEX "VehicleOwner_TenantId_idx" ON "VehicleOwner"("TenantId");

-- CreateIndex
CREATE INDEX "VehicleOwner_VehicleOwnerId_idx" ON "VehicleOwner"("VehicleOwnerId");

-- CreateIndex
CREATE INDEX "VehicleStatus_TenantId_idx" ON "VehicleStatus"("TenantId");

-- CreateIndex
CREATE INDEX "VehicleStatus_VehicleStatusId_idx" ON "VehicleStatus"("VehicleStatusId");
