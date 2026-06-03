-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "LineChannelSecret" TEXT;

-- AlterTable
ALTER TABLE "DriverJob" ADD COLUMN     "JobNo" INTEGER;

-- CreateTable
CREATE TABLE "LineCommand" (
    "LineCommandId" VARCHAR(36) NOT NULL,
    "TenantId" VARCHAR(36) NOT NULL,
    "LineUserId" TEXT NOT NULL,
    "Role" VARCHAR(15) NOT NULL,
    "RawText" TEXT NOT NULL,
    "ParsedAction" TEXT,
    "ResultStatus" VARCHAR(15) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineCommand_pkey" PRIMARY KEY ("LineCommandId")
);

-- CreateIndex
CREATE INDEX "DriverJob_TenantId_JobNo_idx" ON "DriverJob"("TenantId", "JobNo");

-- CreateIndex
CREATE INDEX "LineCommand_TenantId_idx" ON "LineCommand"("TenantId");

-- CreateIndex
CREATE INDEX "LineCommand_LineUserId_idx" ON "LineCommand"("LineUserId");
