-- CreateTable
CREATE TABLE "LineWebhook" (
    "LineWebhookId" VARCHAR(36) NOT NULL,
    "Body" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineWebhook_pkey" PRIMARY KEY ("LineWebhookId")
);

-- CreateIndex
CREATE INDEX "LineWebhook_LineWebhookId_idx" ON "LineWebhook"("LineWebhookId");
