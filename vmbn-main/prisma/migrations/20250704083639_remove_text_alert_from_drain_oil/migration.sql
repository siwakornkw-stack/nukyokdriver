/*
  Warnings:

  - Added the required column `TextAlert` to the `DrainTheOilVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DrainTheOilVehicle" ADD COLUMN     "TextAlert" TEXT NOT NULL;
