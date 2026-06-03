-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "Role" VARCHAR(20) NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "VehicleDriver" ADD COLUMN     "ImageUrl" TEXT,
ADD COLUMN     "LicenseNo" VARCHAR(50),
ADD COLUMN     "MobileNo" VARCHAR(50);
