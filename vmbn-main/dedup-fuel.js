// One-off: remove duplicate GasolineCost rows created by a double file import.
// Same natural key as the importer. Keeps the earliest row per key, deletes rest.
// Scope: DateTime within this year (CE). Dry-run by default; pass --apply to delete.
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const APPLY = process.argv.includes('--apply')
const YEAR = Number(process.argv.find((a) => /^--year=\d+$/.test(a))?.split('=')[1]) || 2026

const kdec = (v) => { const n = Number(v); return isNaN(n) ? '' : n.toFixed(2) }
const kstr = (v) => (v === undefined || v === null ? '' : String(v).trim())
const keyOf = (r) =>
  `${r.VehicleId}|${r.DateTime ? r.DateTime.getTime() : ''}|${kdec(r.Amount)}|${r.Liters}|${r.OdometerStart}|${r.OdometerEnd}|${kstr(r.TaxInvoiceNumber)}`

async function main() {
  const start = new Date(Date.UTC(YEAR, 0, 1))
  const end = new Date(Date.UTC(YEAR + 1, 0, 1))
  const rows = await db.gasolineCost.findMany({
    where: { DateTime: { gte: start, lt: end } },
    select: { GasolineCostId: true, VehicleId: true, DateTime: true, Amount: true, Liters: true, OdometerStart: true, OdometerEnd: true, TaxInvoiceNumber: true, CreatedAt: true },
    orderBy: [{ CreatedAt: 'asc' }, { GasolineCostId: 'asc' }],
  })

  const seen = new Set()
  const toDelete = []
  for (const r of rows) {
    const k = keyOf(r)
    if (seen.has(k)) toDelete.push(r.GasolineCostId)
    else seen.add(k)
  }

  console.log(`year ${YEAR}: ${rows.length} rows, ${seen.size} unique, ${toDelete.length} duplicate(s) to remove`)
  if (!toDelete.length) { console.log('nothing to clean'); return }

  if (!APPLY) {
    console.log('DRY RUN — no rows deleted. Re-run with --apply to delete.')
    return
  }
  const res = await db.gasolineCost.deleteMany({ where: { GasolineCostId: { in: toDelete } } })
  console.log(`deleted ${res.count} duplicate row(s)`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
