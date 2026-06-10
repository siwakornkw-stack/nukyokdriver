/*
 * Income import verification / reconciliation.
 *
 * Reconciles an income workbook against what is actually stored in the DB:
 *   - sums real job rows in the file (skips subtotal / "รวม" / 0-baht rows)
 *   - finds in-file duplicate rows (same natural key) that import dedup collapses
 *   - compares file total vs DB total for the tenant
 *   - lists past import batches (grouped by CreatedAt minute)
 *
 * Parsing reuses the project's own detectHeader/classify so it matches the
 * importer exactly. DB credentials are read from <tmp>/prod.env (DATABASE_URL).
 *
 * Usage:
 *   node scripts/verify-income-import.cjs "<path-to-xlsx>" [tenantId]
 *   node scripts/verify-income-import.cjs --history-only [tenantId]
 */
const fs = require('fs'), os = require('os'), path = require('path')

// --- load prod.env into process.env (DATABASE_URL etc.) ---
const envPath = path.join(os.tmpdir(), 'prod.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const XLSX = require('xlsx')
require('ts-node/register/transpile-only')
const { detectHeader, classify } = require('../src/routers/importdata/importdata.services')
const { PrismaClient } = require('@prisma/client')

const NUKYOK = 'aa612b9f-91e3-4184-9658-dac9c1979d6b'
const args = process.argv.slice(2)
const historyOnly = args.includes('--history-only')
const file = args.find((a) => !a.startsWith('--') && /\.(xlsx|xls|json)$/i.test(a))
const tenantId = args.find((a) => /^[0-9a-f-]{36}$/i.test(a)) || NUKYOK

// Amount parsing mirrors importIncome's decOrZero EXACTLY: strip to [0-9.-] then
// take the leading numeric token. A stray "99-4929" (a plate dropped into the
// amount column) becomes 99 — same as what the importer actually stored.
const dec = (v) => { const m = String(v == null ? '' : v).replace(/[^0-9.-]/g, '').match(/^-?\d*\.?\d+/); return m ? Number(m[0]) : 0 }
const int0 = (v) => { const n = parseInt(String(v == null ? '' : v).replace(/[^0-9.-]/g, ''), 10); return isNaN(n) ? 0 : n }
const kdec = (v) => Number(v).toFixed(2)
const str = (v) => (v == null ? '' : String(v)).trim()
const isTotal = (s) => /รวม|ทั้งหมด|total/i.test(s)
const money = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// --- faithful copies of importdata.services date helpers (so keys match exactly) ---
const excelSerialToDate = (n) => { const d = new Date(Math.round((n - 25569) * 86400 * 1000)); return isNaN(d.getTime()) ? null : d }
const adjustBE = (d) => { if (!d) return null; if (d.getFullYear() >= 2400) { const x = new Date(d.getTime()); x.setFullYear(x.getFullYear() - 543); return x } return d }
const dateOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null
  if (v instanceof Date) return adjustBE(isNaN(v.getTime()) ? null : v)
  if (typeof v === 'number') return v > 10000 && v < 400000 ? adjustBE(excelSerialToDate(v)) : null
  const s = String(v).trim()
  if (!s) return null
  if (/^\d+(\.\d+)?$/.test(s)) { const n = parseFloat(s); return n > 10000 && n < 400000 ? adjustBE(excelSerialToDate(n)) : null }
  const d = new Date(s)
  return adjustBE(isNaN(d.getTime()) ? null : d)
}
const kdate = (d) => (d instanceof Date && !isNaN(d.getTime()) ? String(d.getTime()) : '')

// Replicate importIncome's day -> date derivation from the sheet's billing cycle.
function makeDateFromDay(sheetName) {
  const cyc = str(sheetName).match(/\((\d{1,2})-(\d{2})\)/)
  const cycMonth = cyc ? parseInt(cyc[1], 10) : 0
  const cycYearBE = cyc ? 2500 + parseInt(cyc[2], 10) : 0
  return (day) => {
    if (!cycMonth || day < 1 || day > 31) return null
    let mo = cycMonth, yr = cycYearBE
    if (day >= 26) { mo -= 1; if (mo < 1) { mo = 12; yr -= 1 } }
    return new Date(Date.UTC(yr - 543, mo - 1, day))
  }
}

// Dedup key WITHOUT vehicle identity. The DB rows are already deduped per
// VehicleId, and a stored linked row no longer carries its source plate, so we
// can't reconstruct the importer's full key from the DB side. Dropping the
// vehicle term is safe for *counting* collapses: for any key, (file copies -
// DB copies) is exactly how many rows the importer's dedup dropped, because the
// DB count already reflects the per-vehicle survivors.
function rowKey(r) {
  return [r.invoice, r.wo, kdate(r.date), kdec(r.amount), r.desc].join('|')
}

function parseFile(filePath) {
  const wb = XLSX.read(fs.readFileSync(filePath), { type: 'buffer', cellDates: false })
  const rows = []
  const perSheet = []
  for (const name of wb.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false, defval: '' })
    const d = detectHeader(matrix)
    if (!d || classify(d.colMap) !== 'income') continue
    const c = d.colMap
    if (c.amountReceive == null) continue
    const dfd = makeDateFromDay(name)
    let n = 0, sum = 0
    for (let i = d.headerRow + 1; i < matrix.length; i++) {
      const row = matrix[i]
      const amount = dec(row[c.amountReceive])
      if (!(amount > 0)) continue
      const plate = c.license == null ? '' : str(row[c.license])
      if (!plate || isTotal(plate)) continue
      // mirror importIncome: scheduledAt -> receiveDate -> day-of-month from cycle -> now
      const date = dateOrNull(c.scheduledAt == null ? '' : row[c.scheduledAt])
        || dateOrNull(c.receiveDate == null ? '' : row[c.receiveDate])
        || dfd(int0(row[0]))
        || new Date()
      const rec = {
        sheet: name, excelRow: i + 1, plate, amount, date,
        invoice: c.invoiceNumber == null ? '' : str(row[c.invoiceNumber]),
        wo: c.workOrderNumber == null ? '' : str(row[c.workOrderNumber]),
        desc: c.incomeDescription == null ? '' : str(row[c.incomeDescription]),
      }
      rows.push(rec); n++; sum += amount
    }
    perSheet.push({ name, rows: n, sum })
  }
  return { rows, perSheet }
}

;(async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL } } })
  try {
    console.log(`tenant: ${tenantId}\n`)

    if (!historyOnly) {
      if (!file) { console.error('ระบุ path ไฟล์ xlsx (หรือใช้ --history-only)'); process.exit(1) }
      const { rows, perSheet } = parseFile(file)

      console.log(`=== FILE: ${path.basename(file)} ===`)
      for (const s of perSheet) console.log(`  ${String(s.name).slice(0, 28).padEnd(28)} rows=${String(s.rows).padStart(4)} sum=${money(s.sum)}`)
      const rawSum = rows.reduce((a, r) => a + r.amount, 0)
      console.log(`  FILE RAW: rows=${rows.length} sum=${money(rawSum)}`)

      const dbAgg = await prisma.incomeVehicle.aggregate({ where: { TenantId: tenantId }, _count: true, _sum: { AmountReceive: true } })
      const dbSum = Number(dbAgg._sum.AmountReceive || 0)
      console.log(`\n=== DB (tenant) ===`)
      console.log(`  income rows=${dbAgg._count} sum=${money(dbSum)}`)

      // RECONCILE: file-raw minus what's actually stored = what dedup collapsed.
      console.log(`\n=== RECONCILE ===`)
      const diff = rawSum - dbSum
      console.log(`  FILE RAW ${money(rawSum)} - DB ${money(dbSum)} = ${money(diff)}  (${rows.length - dbAgg._count} แถวที่ dedup ตัด)`)

      // DB-grounded duplicate detection. Build the same vehicle-less key from both
      // the file rows and the stored rows; per key, (file copies - DB copies) is
      // exactly how many the importer collapsed.
      const dbRows = await prisma.incomeVehicle.findMany({ where: { TenantId: tenantId }, select: { InvoiceNumber: true, WorkOrderNumber: true, DateTime: true, AmountReceive: true, Description: true } })
      const dbKey = (r) => [str(r.InvoiceNumber), str(r.WorkOrderNumber), kdate(r.DateTime), kdec(r.AmountReceive), str(r.Description)].join('|')
      const dbCount = new Map()
      for (const r of dbRows) dbCount.set(dbKey(r), (dbCount.get(dbKey(r)) || 0) + 1)

      const groups = new Map()
      for (const r of rows) { const k = rowKey(r); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r) }

      let cutRows = 0, cutAmt = 0
      const collapsed = []
      for (const [k, g] of groups) {
        const cut = g.length - (dbCount.get(k) || 0)
        if (cut > 0) { collapsed.push({ g, db: dbCount.get(k) || 0, cut }); cutRows += cut; cutAmt += cut * g[0].amount }
      }
      console.log(`\n=== จุดที่ซ้ำในไฟล์ (dedup ตัด ${cutRows} แถว = ${money(cutAmt)}) ===`)
      for (const { g, db, cut } of collapsed.sort((a, b) => b.cut - a.cut)) {
        console.log(`  "${g[0].desc.slice(0, 24)}" inv=${g[0].invoice || '-'} ${g[0].date.toISOString().slice(0, 10)} ${money(g[0].amount)}  ไฟล์ x${g.length} -> DB ${db} (ตัด ${cut})`)
        for (const r of g) console.log(`      [${r.sheet} แถว ${r.excelRow}] ทะเบียน=${r.plate} wo=${r.wo || '-'}`)
      }

      // Parse-drift guard: any DB key the file parse can't reproduce means the
      // script read a row differently from the importer. Healthy output = none.
      const fileCount = new Map()
      for (const r of rows) fileCount.set(rowKey(r), (fileCount.get(rowKey(r)) || 0) + 1)
      const drift = []
      for (const [k, n] of dbCount) { const f = fileCount.get(k) || 0; if (n > f) drift.push({ k, db: n, file: f }) }
      if (drift.length) {
        console.log(`\n  [!] parse drift: ${drift.length} key DB>file (script อ่านต่างจาก importer):`)
        for (const d of drift) console.log(`      db${d.db} file${d.file}  ${d.k.slice(0, 70)}`)
      }
    }

    // import history: group by CreatedAt minute
    const all = await prisma.incomeVehicle.findMany({ where: { TenantId: tenantId }, select: { CreatedAt: true, AmountReceive: true, CreatedByUsername: true } })
    const batches = new Map()
    for (const r of all) {
      const k = r.CreatedAt.toISOString().slice(0, 16) + '|' + (r.CreatedByUsername || '-')
      const b = batches.get(k) || { n: 0, sum: 0 }
      b.n++; b.sum += Number(r.AmountReceive); batches.set(k, b)
    }
    console.log(`\n=== IMPORT HISTORY (จับกลุ่มตาม CreatedAt นาที) ===`)
    for (const [k, b] of Array.from(batches.entries()).sort()) {
      const [t, u] = k.split('|')
      console.log(`  ${t.replace('T', ' ')}  user=${u.padEnd(8)} rows=${String(b.n).padStart(5)} sum=${money(b.sum)}`)
    }
  } finally {
    await prisma.$disconnect()
  }
})().catch((e) => { console.error('FAIL:', e); process.exit(1) })
