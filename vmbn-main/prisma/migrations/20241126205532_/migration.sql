/*
  Warnings:

  - Changed the type of `Body` on the `LineWebhook` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "LineWebhook" DROP COLUMN "Body",
ADD COLUMN     "Body" JSONB NOT NULL;
