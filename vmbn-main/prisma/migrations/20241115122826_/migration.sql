/*
  Warnings:

  - Made the column `LineNotifyToken` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "RegistrationDate" DROP NOT NULL,
ALTER COLUMN "StartDate" DROP NOT NULL,
ALTER COLUMN "LineNotifyToken" SET NOT NULL;
