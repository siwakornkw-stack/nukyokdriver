-- CreateTable
CREATE TABLE "RefreshTokens" (
    "RefreshTokenId" VARCHAR(36) NOT NULL,
    "HashedToken" TEXT NOT NULL,
    "Revoked" BOOLEAN NOT NULL DEFAULT false,
    "CreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedTime" TIMESTAMP(3),
    "CreatedByUsername" TEXT,
    "UpdatedByUsername" TEXT,
    "CustomerId" VARCHAR(36) NOT NULL,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("RefreshTokenId")
);

-- CreateIndex
CREATE INDEX "RefreshTokens_CustomerId_idx" ON "RefreshTokens"("CustomerId");

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_CustomerId_fkey" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE CASCADE ON UPDATE CASCADE;
