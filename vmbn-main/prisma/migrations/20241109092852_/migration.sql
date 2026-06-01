-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "CreatedByUsername" TEXT,
ADD COLUMN     "UpdatedByUsername" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "CreatedByUsername" TEXT,
ADD COLUMN     "UpdatedByUsername" TEXT;
