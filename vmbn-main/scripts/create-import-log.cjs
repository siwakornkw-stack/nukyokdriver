// One-off: create the ImportLog table on prod (additive, surgical — does not
// touch any other table). Matches the Prisma model exactly (PascalCase columns).
const fs = require('fs')
const os = require('os')
const path = require('path')

const envPath = path.join(os.tmpdir(), 'prod.env')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/)
  if (m) process.env[m[1]] = m[2]
}

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL } } })

const DDL = `
CREATE TABLE IF NOT EXISTS "ImportLog" (
  "ImportLogId" VARCHAR(36) PRIMARY KEY,
  "TenantId" VARCHAR(36) NOT NULL,
  "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "CreatedByUsername" TEXT,
  "FileName" TEXT,
  "FileRows" INTEGER NOT NULL DEFAULT 0,
  "FileSum" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "CreatedRows" INTEGER NOT NULL DEFAULT 0,
  "CreatedSum" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "DupRows" INTEGER NOT NULL DEFAULT 0,
  "DupSum" DECIMAL(16,2) NOT NULL DEFAULT 0,
  "ExistRows" INTEGER NOT NULL DEFAULT 0,
  "ExistSum" DECIMAL(16,2) NOT NULL DEFAULT 0
);
`

;(async () => {
  await db.$executeRawUnsafe(DDL)
  await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "ImportLog_TenantId_idx" ON "ImportLog" ("TenantId");')
  const n = await db.$queryRawUnsafe('SELECT COUNT(*)::int AS c FROM "ImportLog";')
  console.log('ImportLog ready, rows =', n[0].c)
  await db.$disconnect()
})().catch((e) => { console.error(e); process.exit(1) })
