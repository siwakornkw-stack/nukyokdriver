/*
  Warnings:

  - Added the required column `Status` to the `AttachFileVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttachFileVehicle" ADD COLUMN     "Status" VARCHAR(15) NOT NULL;
