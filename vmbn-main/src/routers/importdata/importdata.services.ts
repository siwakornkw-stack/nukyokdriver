import * as XLSX from 'xlsx'
import { Prisma, PrismaClient } from '@prisma/client'
import { aiMapSheet } from './aiMapper'

// Bulk import = many writes. Use a DIRECT (non-pooled) connection so writes can run
// concurrently — the pooled PgBouncer connection caps concurrency to 1 and times out.
// Falls back to the pooled URL when no unpooled URL is configured.
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL } } })

// Run async work over items with bounded concurrency. Sequential per-row DB writes
// time out; running them in parallel batches is far faster.
async function runChunked<T>(items: T[], size: number, fn: (item: T) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn))
  }
}

// ---------- value parsers ----------
const str = (v: any): string => (v === undefined || v === null ? '' : String(v).trim())
const int0 = (v: any): number => { const n = parseInt(str(v).replace(/[^0-9.-]/g, ''), 10); return isNaN(n) ? 0 : n }
const decOrZero = (v: any): Prisma.Decimal => { const m = str(v).replace(/[^0-9.-]/g, '').match(/^-?\d*\.?\d+/); return m ? new Prisma.Decimal(m[0]) : new Prisma.Decimal(0) }

// ---------- dedup key normalizers ----------
// Stable string parts so a fetched DB row and a to-be-created record produce the
// same key. Dates -> epoch ms; decimals -> fixed(2) so "7470" == Decimal "7470.00".
const kdate = (v: any): string => (v instanceof Date && !isNaN(v.getTime()) ? String(v.getTime()) : '')
const kdec = (v: any): string => {
  if (v === null || v === undefined || v === '') return ''
  const s = String(v).replace(/[^0-9.-]/g, '')
  if (!s) return ''
  try { return new Prisma.Decimal(s).toFixed(2, 4) } catch { return '' }
}

const excelSerialToDate = (n: number): Date | null => {
  const d = new Date(Math.round((n - 25569) * 86400 * 1000))
  return isNaN(d.getTime()) ? null : d
}
// Thai data often stores Buddhist-era years (e.g. 2570). A serial/year >= 2400
// means BE was entered; convert to CE by subtracting 543 years.
const adjustBE = (d: Date | null): Date | null => {
  if (!d) return null
  if (d.getFullYear() >= 2400) { const x = new Date(d.getTime()); x.setFullYear(x.getFullYear() - 543); return x }
  return d
}
const dateOrNull = (v: any): Date | null => {
  if (v === undefined || v === null || v === '') return null
  if (v instanceof Date) return adjustBE(isNaN(v.getTime()) ? null : v)
  if (typeof v === 'number') return v > 10000 && v < 400000 ? adjustBE(excelSerialToDate(v)) : null
  const s = String(v).trim()
  if (!s) return null
  if (/^\d+(\.\d+)?$/.test(s)) { const n = parseFloat(s); return n > 10000 && n < 400000 ? adjustBE(excelSerialToDate(n)) : null }
  const d = new Date(s)
  return adjustBE(isNaN(d.getTime()) ? null : d)
}

// Split a single license string into prefix / number / province.
// Handles "81-2993", "บม 7933", "81-0644 ภก.", "SK 140", "81-2801 ภูเก็ต".
export function parseLicense(raw: string): { prefix: string; suffix: string; province: string } {
  const s = str(raw)
  if (!s) return { prefix: '', suffix: '', province: '' }
  const parts = s.split(/\s+/)
  let province = ''
  if (parts.length > 1 && /^[ก-๙.]+$/.test(parts[parts.length - 1]) && !/\d/.test(parts[parts.length - 1])) {
    province = (parts.pop() as string).replace(/\.$/, '')
  }
  const core = parts.join(' ')
  const m = core.match(/^(.*?)[\s-]*(\d+)\s*$/)
  if (m) return { prefix: m[1].trim(), suffix: m[2], province }
  return { prefix: core, suffix: '', province }
}

// ---------- header synonym mapping ----------
const norm = (s: any): string => str(s).toLowerCase().replace(/[\s.\-_/()（）]/g, '')

const SYNONYMS: Record<string, string[]> = {
  // old English export keys still supported
  license: ['ทะเบียน', 'ป้ายทะเบียน', 'ทะเบียนรถ', 'เลขทะเบียน', 'licenseplate', 'licenseplateprefix'],
  licenseSuffix: ['licenseplatesuffix'],
  province: ['licenseplateprovince', 'จังหวัด'],
  model: ['รายการทรัพย์สิน', 'ชื่อรถ', 'ยี่ห้อรุ่น', 'รุ่น', 'model'],
  brand: ['ยี่ห้อ', 'brand'],
  driver: ['คนขับ', 'ชื่อคนขับ', 'ผู้ขับ', 'ผู้ขับขี่', 'ผู้ประจำรถ', 'ผู้ปฏิบัติงาน', 'ผู้ปฏิบัตงาน', 'driver'],
  vehicleType: ['ประเภทรถ', 'ประเภท', 'ชนิดรถ', 'vehicletype'],
  note: ['หมายเหตุ', 'note', 'remark'],
  registrationDate: ['วันที่ซื้อ', 'วันที่ครอบครอง', 'วันที่จดทะเบียน', 'registrationdate'],
  installmentAmount: ['ผ่อนเดือนละ', 'ค่างวด', 'installmentamount'],
  status: ['สถานะ', 'status'],
  // insurance / tax columns
  insuranceEnd: ['ประกันหมดวันที่', 'วันหมดประกัน', 'ประกันหมด'],
  insuranceClass: ['ประกันชั้น', 'ชั้นประกัน'],
  insuranceCompany: ['ชื่อประกัน', 'บริษัทประกัน'],
  brokerName: ['โบรกเกอร์', 'ชื่อโบรกเกอร์', 'broker', 'brokername'],
  premium: ['ค่าเบี้ย', 'เบี้ยประกัน', 'ค่าเบี้ยรวม', 'เบี้ยรวม', 'ค่าเบี้ยประกัน', 'totalpremium'],
  compulsoryEnd: ['พรบยาว', 'พรบ', 'พรบหมด', 'พ.ร.บ.'],
  // Must precede taxEnd: "เลขที่ใบกำกับภาษี" contains "ภาษี" and would otherwise
  // be captured as taxEnd. The tax-invoice number is the natural key that tells
  // two same-day fuel fills apart, so it feeds the fuel dedup key.
  taxInvoiceNumber: ['เลขที่ใบกำกับภาษี', 'ใบกำกับภาษี', 'เลขที่ใบกำกับ', 'เลขใบกำกับ'],
  taxEnd: ['ภาษีสั้น', 'ภาษี', 'ภาษีหมด'],
  // odometer columns: matched before origin/destination so "เลขไมล์(ต้นทาง)/
  // (ปลายทาง)" map to odometer instead of being mistaken for job origin/destination.
  odometerStart: ['เลขไมล์เริ่ม', 'ไมล์เริ่ม', 'เลขไมล์เริ่มต้น', 'เลขไมล์ต้นทาง', 'ไมล์ต้นทาง'],
  odometerEnd: ['เลขไมล์สิ้นสุด', 'ไมล์สิ้นสุด', 'เลขไมล์ปลายทาง', 'ไมล์ปลายทาง'],
  odometer: ['เลขไมล์', 'ไมล์', 'odometer'],
  // job columns (driver dispatch via LINE)
  origin: ['เนื้อหางาน', 'เนื้องาน', 'ต้นทาง', 'จุดรับ', 'origin'],
  destination: ['จุดหมายปลายทาง', 'จุดหมาย', 'ปลายทาง', 'จุดส่ง', 'หน้างาน', 'แผนที่', 'googlemap', 'destination'],
  scheduledAt: ['วันเวลา', 'เวลา', 'วันที่', 'scheduledat'],
  // per-vehicle sub-data columns
  repairDate: ['วันที่ซ่อม', 'วันซ่อม'],
  repairShop: ['อู่', 'ร้านซ่อม', 'อู่ซ่อม', 'ชื่ออู่', 'ผู้ซ่อม', 'ช่างซ่อม'],
  receiveDate: ['วันรับรถ', 'วันที่รับรถ', 'รับรถ'],
  insurancePay: ['ประกันจ่าย', 'ประกันออก'],
  // ตาราง MA repair sheets put the line cost under a bare ราคา header.
  companyPay: ['บริษัทจ่าย', 'บริษัทออก', '^ราคา'],
  accidentDate: ['วันที่เกิดเหตุ', 'วันเกิดเหตุ'],
  accidentTime: ['เวลาเกิดเหตุ'],
  party: ['คู่กรณี', 'จำนวนคู่กรณี'],
  opponent: ['ฝ่ายตรงข้าม', 'คู่กรณีฝ่ายตรงข้าม'],
  fuelItem: ['รายการน้ำมัน', 'ชนิดน้ำมัน', 'ประเภทน้ำมัน'],
  fuelDate: ['วันเดือนปี'],
  liters: ['ลิตร', 'จำนวนลิตร'],
  amount: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
  oilDate: ['วันที่เปลี่ยนน้ำมัน', 'วันเปลี่ยนน้ำมัน', 'วันถ่ายน้ำมัน'],
  oilDueDate: ['ครบกำหนดเปลี่ยน', 'รอบถัดไป'],
  textAlert: ['ข้อความแจ้งเตือน', 'ข้อความ'],
  installmentNumber: ['งวดที่', 'งวด'],
  dueDate: ['วันครบกำหนด', 'ครบกำหนด', 'วันที่ครบกำหนด'],
  datePay: ['วันจ่าย', 'วันที่จ่าย', 'วันชำระ'],
  incomeDescription: ['รายละเอียดงาน', 'รายละเอียด'],
  customerName: ['ชื่อลูกค้า', 'ลูกค้า'],
  workOrderNumber: ['เลขใบสั่งงาน', 'ใบสั่งงาน', 'เลขที่งาน', 'เลขที่ใบงาน', 'ใบงาน'],
  invoiceNumber: ['เลขใบแจ้งหนี้', 'ใบแจ้งหนี้', 'เลขที่บิล'],
  // "รวม" is the daily-summary income total column. liters ('จำนวนรับ (ลิตร)') and
  // premium ('เบี้ยรวม') are defined earlier in this map, so they still win on fuel /
  // vehicle sheets — only a bare "รวม" header falls through to amountReceive here.
  amountReceive: ['จำนวนรับ', 'ยอดรับ', 'เงินที่ได้รับ', 'รวม'],
  // Bare จำนวน (quantity) — must stay LAST so จำนวนเงิน/จำนวนลิตร/จำนวนรับ/
  // จำนวนคู่กรณี keep matching their earlier, more specific fields.
  qty: ['จำนวน'],
}

// Map a header cell to a canonical field name (or null).
// Synonyms prefixed with '^' require exact match (prevents short words like 'ราคา'
// from matching longer headers like 'ราคารวม' via substring inclusion).
function canonical(header: string): string | null {
  const n = norm(header)
  if (!n) return null
  for (const [field, syns] of Object.entries(SYNONYMS)) {
    if (syns.some((s) => {
      const exact = s.startsWith('^')
      const sn = norm(exact ? s.slice(1) : s)
      return exact ? n === sn : (n === sn || n.includes(sn))
    })) return field
  }
  return null
}

// Scan the first rows to find the row that is actually the header, returning the
// row index and a map of canonical field -> column index.
export function detectHeader(matrix: any[][]): { headerRow: number; colMap: Record<string, number> } | null {
  const limit = Math.min(matrix.length, 12)
  let best: { headerRow: number; colMap: Record<string, number>; score: number } | null = null
  for (let r = 0; r < limit; r++) {
    const row = matrix[r] || []
    const colMap: Record<string, number> = {}
    for (let c = 0; c < row.length; c++) {
      const field = canonical(row[c])
      if (field && !(field in colMap)) colMap[field] = c
    }
    const score = Object.keys(colMap).length
    if (score >= 2 && (!best || score > best.score)) best = { headerRow: r, colMap, score }
  }
  return best ? { headerRow: best.headerRow, colMap: best.colMap } : null
}

export type SheetType = 'vehicles' | 'jobs' | 'repair' | 'accident' | 'fuel' | 'oil' | 'installment' | 'installment-matrix' | 'income' | 'unknown'

export interface SheetResult {
  sheet: string
  type: SheetType
  created: number
  updated: number
  sub: number
  skipped: number
  errors: string[]
  // Human-readable lines for rows the in-file dedup collapsed (same key twice in
  // the upload). Distinct from `skipped`, which also counts re-upload/existing rows.
  duplicates?: string[]
  // Reconcile numbers (income only): file totals vs what entered the DB, and how
  // much was cut as in-file duplicates or already-present (re-upload) rows.
  stats?: ImportStats
}

export interface ImportStats {
  fileRows: number; fileSum: number
  createdSum: number
  dupRows: number; dupSum: number
  existRows: number; existSum: number
}

async function getOrCreateRef(
  model: 'vehicleBrand' | 'vehicleType' | 'fuelType' | 'vehicleOwner' | 'vehicleDepartment' | 'vehicleDriver' | 'vehicleStatus',
  idField: string, tenantId: string, name: string, username?: string,
): Promise<string | null> {
  const clean = str(name)
  if (!clean) return null
  const existing = await (db as any)[model].findFirst({ where: { TenantId: tenantId, Name: clean } })
  if (existing) return existing[idField]
  const created = await (db as any)[model].create({
    data: { TenantId: tenantId, Name: clean, Status: 'active', CreatedByUsername: username ?? 'import' },
  })
  return created[idField]
}

// cell(row, colMap, field) -> value at the mapped column
const cell = (row: any[], colMap: Record<string, number>, field: string): any =>
  field in colMap ? row[colMap[field]] : undefined

// Preload all rows of a reference table into a name->id map (one query).
async function loadRefMap(model: string, idField: string, tenantId: string): Promise<Map<string, string>> {
  const rows = await (db as any)[model].findMany({ where: { TenantId: tenantId }, select: { [idField]: true, Name: true } })
  const map = new Map<string, string>()
  for (const r of rows) map.set(str(r.Name), r[idField])
  return map
}
// Resolve a name from the cached map, creating (and caching) it only when new.
async function ensureRef(model: string, idField: string, tenantId: string, name: string, map: Map<string, string>, username?: string): Promise<string | null> {
  const clean = str(name)
  if (!clean) return null
  const hit = map.get(clean)
  if (hit) return hit
  const created = await (db as any)[model].create({ data: { TenantId: tenantId, Name: clean, Status: 'active', CreatedByUsername: username ?? 'import' } })
  map.set(clean, created[idField])
  return created[idField]
}

// match key ignoring province (so "81-0494 ภก." and "81-0494" are the same truck)
const plateKey = (prefix: string, suffix: string, model: string): string =>
  prefix || suffix ? `${norm(prefix)}|${norm(suffix)}` : `model:${norm(model)}`

// Plate-less machines are keyed by model name (e.g. "CAT 313 GC"). The same
// machine is often written at different specificity ("CAT 313" vs "CAT 313 GC"),
// so exact key match misses it. Tokenize the model and treat one as the same
// vehicle when its tokens are a leading subset of the other's.
const modelToks = (model: string): string[] =>
  str(model).toLowerCase().split(/[\s.\-_/]+/).map((t) => t.replace(/[^a-z0-9ก-๙]/g, '')).filter(Boolean)
const toksPrefix = (a: string[], b: string[]): boolean => a.length <= b.length && a.every((t, i) => b[i] === t)
// Find the most specific (longest-token) model-only vehicle matching `model`.
const matchModelId = (idx: { toks: string[]; id: string }[], model: string): string | null => {
  const toks = modelToks(model)
  if (!toks.length) return null
  let best: { toks: string[]; id: string } | null = null
  for (const e of idx) {
    if (toksPrefix(toks, e.toks) || toksPrefix(e.toks, toks)) {
      if (!best || e.toks.length > best.toks.length) best = e
    }
  }
  return best ? best.id : null
}

const ZERO = new Prisma.Decimal(0)
const MAX_PRICE = new Prisma.Decimal('99999999.99')

// compact(x) = norm(strip paren-groups). Differs from norm(): compact('CAT313(ใหม่)') = 'cat313'
const compact = (s: string): string => norm(str(s).replace(/\([^)]*\)/g, ''))

function isSubsequence(a: string, b: string): boolean {
  let ai = 0
  for (let bi = 0; bi < b.length && ai < a.length; bi++) { if (b[bi] === a[ai]) ai++ }
  return ai === a.length
}

type VehicleForResolver = { VehicleId: string; LicensePlatePrefix: string; LicensePlateSuffix: string; Model: string; CreatedAt: Date }

// Fuzzy vehicle finder (steps 2-3b). Does NOT create.
// Step 2: suffix-unique — same suffix, candidate prefix is a subsequence of file prefix.
// Step 3: compact-identity (EXACT) on parsed prefix+suffix or raw string vs plate compact or
//   Model compact. compact() strips paren-groups so "CAT307(-)" == "CAT 307".
// Deliberately conservative — no loose prefix-probe: "SANY 140 C" must NOT collapse into model
// "Sany140", nor "รถบด 10 T / xCMG" into plate "รถบด 10". Under-matching mints a recoverable
// duplicate; over-matching silently attaches insurance/installments to the wrong vehicle.
// Ambiguity: prefer the one plate-keyed candidate; else pick by oldest CreatedAt.
export function fuzzyFindVehicle(vehicles: VehicleForResolver[], prefix: string, suffix: string, raw: string): string | null {
  const fNormSuffix = norm(suffix)
  const fNormPrefix = norm(prefix)

  if (fNormSuffix) {
    const sameSuffix = vehicles.filter((v) => norm(v.LicensePlateSuffix) === fNormSuffix)
    const survivors = sameSuffix.filter((v) => {
      const cPrefix = norm(v.LicensePlatePrefix)
      if (!cPrefix) return false
      if (/[ก-๙]/.test(cPrefix[0])) { if (!fNormPrefix || cPrefix[0] !== fNormPrefix[0]) return false }
      return cPrefix === fNormPrefix || isSubsequence(cPrefix, fNormPrefix)
    })
    if (survivors.length === 1) return survivors[0].VehicleId
  }

  const fC1 = compact(prefix + suffix)
  const fC2 = compact(raw)
  const hits: VehicleForResolver[] = []
  const seen = new Set<string>()
  for (const v of vehicles) {
    const vCPlate = compact(v.LicensePlatePrefix + v.LicensePlateSuffix)
    const vCModel = compact(v.Model)
    let match = false
    if (fC1 && (vCPlate === fC1 || vCModel === fC1)) match = true
    if (!match && fC2 && fC2 !== fC1 && (vCPlate === fC2 || vCModel === fC2)) match = true
    if (match && !seen.has(v.VehicleId)) { seen.add(v.VehicleId); hits.push(v) }
  }
  if (hits.length === 0) return null
  if (hits.length === 1) return hits[0].VehicleId
  const plateKeyed = hits.filter((v) => v.LicensePlatePrefix || v.LicensePlateSuffix)
  if (plateKeyed.length === 1) return plateKeyed[0].VehicleId
  hits.sort((a, b) => a.CreatedAt.getTime() - b.CreatedAt.getTime())
  return hits[0].VehicleId
}

interface SubBatches {
  ins: Prisma.InsurancePolicyVehicleCreateManyInput[]
  comp: Prisma.CompulsoryMotorInsuranceVehicleCreateManyInput[]
  tax: Prisma.TaxCreateManyInput[]
  insSet: Set<string>; compSet: Set<string>; taxSet: Set<string>
}

// Collect insurance / compulsory / tax records into batches (no DB calls here).
// Dedup against preloaded + in-run sets keyed by vehicle+endDate. Returns count.
function collectSubRecords(vehicleId: string, row: any[], colMap: Record<string, number>, username: string | undefined, b: SubBatches): number {
  let n = 0
  const company = str(cell(row, colMap, 'insuranceCompany')) || '-'
  const broker = str(cell(row, colMap, 'brokerName'))
  const premium = decOrZero(cell(row, colMap, 'premium'))

  const insEnd = dateOrNull(cell(row, colMap, 'insuranceEnd'))
  if (insEnd) {
    const k = `${vehicleId}|${insEnd.getTime()}`
    if (!b.insSet.has(k)) {
      b.insSet.add(k)
      const start = new Date(insEnd.getTime()); start.setFullYear(start.getFullYear() - 1)
      b.ins.push({ VehicleId: vehicleId, Status: 'active', Year: insEnd.getFullYear(), Type: str(cell(row, colMap, 'insuranceClass')) || '-', InsuranceCompany: company, BrokerName: broker, StartDate: start, EndDate: insEnd, TotalPremium: premium, CreatedByUsername: username ?? 'import' })
      n++
    }
  }

  const compEnd = dateOrNull(cell(row, colMap, 'compulsoryEnd'))
  if (compEnd) {
    const k = `${vehicleId}|${compEnd.getTime()}`
    if (!b.compSet.has(k)) {
      b.compSet.add(k)
      b.comp.push({ VehicleId: vehicleId, Status: 'active', Year: compEnd.getFullYear(), EndDate: compEnd, TotalPremium: premium, InsuranceCompany: company, BrokerName: broker, CreatedByUsername: username ?? 'import' })
      n++
    }
  }

  const taxEnd = dateOrNull(cell(row, colMap, 'taxEnd'))
  if (taxEnd) {
    const k = `${vehicleId}|${taxEnd.getTime()}`
    if (!b.taxSet.has(k)) {
      b.taxSet.add(k)
      b.tax.push({ VehicleId: vehicleId, Status: 'active', Year: taxEnd.getFullYear(), EndDate: taxEnd, TotalPremium: premium, InsuranceCompany: company, BrokerName: broker, CreatedByUsername: username ?? 'import' })
      n++
    }
  }
  return n
}

// Upsert: update the existing vehicle (matched by plate, ignoring province) or
// create a new one, then attach any insurance/tax records found in the row.
async function importVehicles(tenantId: string, username: string | undefined, rows: any[][], colMap: Record<string, number>, matchFallback?: boolean): Promise<Omit<SheetResult, 'sheet' | 'type'>> {
  let created = 0, updated = 0, sub = 0, skipped = 0
  const errors: string[] = []

  const [typeMap, brandMap, driverMap, statusMap] = await Promise.all([
    loadRefMap('vehicleType', 'VehicleTypeId', tenantId),
    loadRefMap('vehicleBrand', 'VehicleBrandId', tenantId),
    loadRefMap('vehicleDriver', 'VehicleDriverId', tenantId),
    loadRefMap('vehicleStatus', 'VehicleStatusId', tenantId),
  ])
  const existing = await db.vehicle.findMany({ where: { TenantId: tenantId }, select: { VehicleId: true, LicensePlatePrefix: true, LicensePlateSuffix: true, Model: true, CreatedAt: true } })
  const vmap = new Map<string, string>()
  const modelIdx: { toks: string[]; id: string }[] = []
  for (const v of existing) {
    const k = plateKey(v.LicensePlatePrefix, v.LicensePlateSuffix, v.Model)
    if (!vmap.has(k)) vmap.set(k, v.VehicleId)
    if (k.startsWith('model:')) { const toks = modelToks(v.Model ?? ''); if (toks.length) modelIdx.push({ toks, id: v.VehicleId }) }
  }

  // Preload existing insurance/tax records (only if this sheet carries them) so
  // dedup is in-memory and inserts can be batched — avoids per-row round-trips.
  const batches: SubBatches = { ins: [], comp: [], tax: [], insSet: new Set(), compSet: new Set(), taxSet: new Set() }
  const wantSub = ['insuranceEnd', 'compulsoryEnd', 'taxEnd'].some((k) => k in colMap)
  if (wantSub) {
    const [pi, pc, pt] = await Promise.all([
      db.insurancePolicyVehicle.findMany({ where: { Vehicle: { TenantId: tenantId } }, select: { VehicleId: true, EndDate: true } }),
      db.compulsoryMotorInsuranceVehicle.findMany({ where: { Vehicle: { TenantId: tenantId } }, select: { VehicleId: true, EndDate: true } }),
      db.tax.findMany({ where: { Vehicle: { TenantId: tenantId } }, select: { VehicleId: true, EndDate: true } }),
    ])
    pi.forEach((x) => batches.insSet.add(`${x.VehicleId}|${x.EndDate.getTime()}`))
    pc.forEach((x) => batches.compSet.add(`${x.VehicleId}|${x.EndDate.getTime()}`))
    pt.forEach((x) => batches.taxSet.add(`${x.VehicleId}|${x.EndDate.getTime()}`))
  }

  // phase 1: parse + resolve refs (cached) and plan create/update ops (no writes yet)
  const updateOps: { vehicleId: string; data: Prisma.VehicleUpdateInput; row: any[] }[] = []
  const createOps: { data: Prisma.VehicleUncheckedCreateInput; row: any[]; vehicleId?: string }[] = []
  const planned = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      const rawLic = str(cell(row, colMap, 'license'))
      let prefix = rawLic
      let suffix = str(cell(row, colMap, 'licenseSuffix'))
      let province = str(cell(row, colMap, 'province'))
      if (!suffix) { const p = parseLicense(prefix); prefix = p.prefix; suffix = p.suffix; if (!province) province = p.province }
      const model = str(cell(row, colMap, 'model'))
      if (!prefix && !suffix && !model) { skipped++; continue }

      const typeId = await ensureRef('vehicleType', 'VehicleTypeId', tenantId, str(cell(row, colMap, 'vehicleType')), typeMap, username)
      const brandId = await ensureRef('vehicleBrand', 'VehicleBrandId', tenantId, str(cell(row, colMap, 'brand')), brandMap, username)
      const driverId = await ensureRef('vehicleDriver', 'VehicleDriverId', tenantId, str(cell(row, colMap, 'driver')), driverMap, username)
      const statusId = await ensureRef('vehicleStatus', 'VehicleStatusId', tenantId, str(cell(row, colMap, 'status')), statusMap, username)
      const regDate = dateOrNull(cell(row, colMap, 'registrationDate'))
      const note = str(cell(row, colMap, 'note'))
      const instAmount = str(cell(row, colMap, 'installmentAmount'))
      const instDec = instAmount && /\d/.test(instAmount) ? new Prisma.Decimal(instAmount.replace(/[^0-9.]/g, '') || '0') : null

      const key = plateKey(prefix, suffix, model)
      const isModelKey = key.startsWith('model:')
      let existingId = vmap.get(key)
      let fuzzy = false
      if (!existingId && isModelKey) { const m = matchModelId(modelIdx, model); if (m) { existingId = m; fuzzy = true } }
      if (!existingId && !isModelKey && matchFallback) {
        const matched = fuzzyFindVehicle(existing, prefix, suffix, rawLic)
        if (matched) existingId = matched
      }

      if (existingId) {
        const upd: Prisma.VehicleUpdateInput = { UpdatedByUsername: username ?? 'import' }
        if (typeId) upd.VehicleType = { connect: { VehicleTypeId: typeId } }
        if (brandId) upd.VehicleBrand = { connect: { VehicleBrandId: brandId } }
        if (driverId) upd.VehicleDriver = { connect: { VehicleDriverId: driverId } }
        if (statusId) upd.VehicleStatus = { connect: { VehicleStatusId: statusId } }
        // On a fuzzy model match keep the existing (richer) name, e.g. don't let
        // a row "CAT 313" overwrite an existing "CAT 313 GC".
        if (model && !fuzzy) upd.Model = model
        if (regDate) upd.RegistrationDate = regDate
        if (note) upd.Note = note
        if (instDec) upd.InstallmentAmount = instDec
        updateOps.push({ vehicleId: existingId, data: upd, row })
      } else {
        if (planned.has(key)) { skipped++; continue } // same plate appears twice in this file
        planned.add(key)
        createOps.push({ row, data: {
          TenantId: tenantId, Status: 'active',
          LicensePlatePrefix: prefix, LicensePlateSuffix: suffix, LicensePlateProvince: province,
          VehicleTypeId: typeId, VehicleCharacteristic: '', VehicleBrandId: brandId,
          Model: model, Generation: '', Color: '', ChassisNumber: '', EngineNumber: '', EngineBrand: '',
          TankSize: 0, FuelConsumption: 0, CylinderCount: 0, Cylinder: 0,
          VehicleSize: '', CargoSize: '', GasSerialNumber: '',
          VehicleWeight: 0, CargoWeight: 0, WheelCount: 0, SeatCount: 0,
          RegistrationDate: regDate, Age: '', Ownership: '',
          VehicleDriverId: driverId, VehicleStatusId: statusId,
          InstallmentAmount: instDec, Note: note || null,
          CreatedByUsername: username ?? 'import', UpdatedByUsername: username ?? 'import',
        } })
      }
    } catch (e: any) {
      errors.push(`แถว ${i + 1}: ${e?.message ?? 'error'}`)
    }
  }

  // phase 2: run writes in parallel batches (pooled connection handles concurrency well)
  await runChunked(createOps, 8, async (op) => {
    const v = await db.vehicle.create({ data: op.data, select: { VehicleId: true } })
    op.vehicleId = v.VehicleId
  })
  await runChunked(updateOps, 10, async (op) => {
    await db.vehicle.update({ where: { VehicleId: op.vehicleId }, data: op.data })
  })
  created = createOps.length
  updated = updateOps.length

  // phase 3: collect insurance/tax sub-records (now that every vehicle has an id) and batch-insert
  for (const op of createOps) if (op.vehicleId) sub += collectSubRecords(op.vehicleId, op.row, colMap, username, batches)
  for (const op of updateOps) sub += collectSubRecords(op.vehicleId, op.row, colMap, username, batches)

  if (batches.ins.length) await db.insurancePolicyVehicle.createMany({ data: batches.ins })
  if (batches.comp.length) await db.compulsoryMotorInsuranceVehicle.createMany({ data: batches.comp })
  if (batches.tax.length) await db.tax.createMany({ data: batches.tax })

  return { created, updated, sub, skipped, errors }
}

// Import driver-dispatch jobs (สั่งงานคนขับผ่าน LINE). The new dispatch model
// keys a job on its content (เนื้อหางาน -> Origin); destination is an optional
// map link and a driver is optional. With a driver the job is 'pending' (a
// dispatcher still re-sends the LINE card from the page); without one it stays
// 'unassigned' for a driver to be picked later. No LINE push happens on import.
async function importJobs(tenantId: string, username: string | undefined, rows: any[][], colMap: Record<string, number>): Promise<Omit<SheetResult, 'sheet' | 'type'>> {
  let created = 0, skipped = 0
  const errors: string[] = []
  const last = await db.driverJob.findFirst({ where: { TenantId: tenantId, JobNo: { not: null } }, orderBy: { JobNo: 'desc' }, select: { JobNo: true } })
  let jobNo = (last?.JobNo ?? 0) + 1
  const driverCache = new Map<string, string | null>()
  const seenJobs = new Set<string>()
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const origin = str(cell(row, colMap, 'origin'))
    const destination = str(cell(row, colMap, 'destination'))
    const driverName = str(cell(row, colMap, 'driver'))
    try {
      if (!origin && !destination && !driverName) { skipped++; continue }
      if (!origin) throw new Error('ต้องมีเนื้อหางาน')
      const scheduledRaw = str(cell(row, colMap, 'scheduledAt'))
      const jobKey = `${origin}|${destination}|${driverName}|${scheduledRaw}`
      if (seenJobs.has(jobKey)) { skipped++; continue }
      seenJobs.add(jobKey)
      let driverId: string | null = null
      if (driverName) {
        if (driverCache.has(driverName)) driverId = driverCache.get(driverName) as string | null
        else { driverId = await getOrCreateRef('vehicleDriver', 'VehicleDriverId', tenantId, driverName, username); driverCache.set(driverName, driverId) }
      }
      await db.driverJob.create({
        data: {
          TenantId: tenantId, JobNo: jobNo++, VehicleDriverId: driverId,
          Origin: origin, Destination: destination || '-',
          ScheduledAt: dateOrNull(scheduledRaw),
          Note: str(cell(row, colMap, 'note')) || null,
          Status: driverId ? 'pending' : 'unassigned', CreatedByUsername: username ?? 'import',
        },
      })
      created++
    } catch (e: any) {
      errors.push(`แถว ${i + 1}: ${e?.message ?? 'error'}`)
    }
  }
  return { created, updated: 0, sub: 0, skipped, errors }
}

// ---------- per-vehicle sub-data importers (match existing vehicle by plate) ----------
interface VehicleMap { exact: Map<string, string>; models: { toks: string[]; id: string }[] }
async function loadVehicleMap(tenantId: string): Promise<VehicleMap> {
  const ex = await db.vehicle.findMany({ where: { TenantId: tenantId }, select: { VehicleId: true, LicensePlatePrefix: true, LicensePlateSuffix: true, Model: true } })
  const exact = new Map<string, string>()
  const models: { toks: string[]; id: string }[] = []
  for (const v of ex) {
    const k = plateKey(v.LicensePlatePrefix, v.LicensePlateSuffix, v.Model)
    if (!exact.has(k)) exact.set(k, v.VehicleId)
    if (k.startsWith('model:')) { const toks = modelToks(v.Model ?? ''); if (toks.length) models.push({ toks, id: v.VehicleId }) }
  }
  return { exact, models }
}
function rowVehicleId(row: any[], colMap: Record<string, number>, vmap: VehicleMap): string | null {
  let prefix = str(cell(row, colMap, 'license'))
  let suffix = str(cell(row, colMap, 'licenseSuffix'))
  if (!suffix) { const p = parseLicense(prefix); prefix = p.prefix; suffix = p.suffix }
  const model = str(cell(row, colMap, 'model'))
  if (!prefix && !suffix && !model) return null
  const key = plateKey(prefix, suffix, model)
  const hit = vmap.exact.get(key)
  if (hit) return hit
  if (key.startsWith('model:')) return matchModelId(vmap.models, model)
  return null
}
type CatResult = Omit<SheetResult, 'sheet' | 'type'>

// For workbooks that put one vehicle per sheet (no plate column in the rows),
// resolve the vehicle from the sheet name: match an existing vehicle (plate or
// fuzzy model), otherwise create a minimal record so the sheet's data isn't lost.
async function resolveSheetVehicle(tenantId: string, username: string | undefined, sheetName: string, vmap: VehicleMap): Promise<string | null> {
  const name = str(sheetName)
  if (!name) return null
  let id = vmap.exact.get(plateKey('', '', name)) ?? matchModelId(vmap.models, name)
  let prefix = '', suffix = '', province = ''
  if (!id) {
    const p = parseLicense(name)
    if (p.suffix) { prefix = p.prefix; suffix = p.suffix; province = p.province; id = vmap.exact.get(plateKey(prefix, suffix, '')) ?? null }
  }
  if (id) return id
  // Sheet names often wrap the plate in noise: "ดั้มพ์ บม-7933", "82-8380 (คันฟ้า)".
  // Retry the paren-stripped name, then each plate-looking token right-to-left.
  // A token must carry >=3 digits AND a non-digit (Thai prefix or dash) so bare
  // numbers ("บด 10 T", a ปี 2569 year) can't false-match a plate. Lookup only —
  // the create below keeps the original parse, so vehicles minted by earlier
  // imports keep matching.
  const cleaned = name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
  const toks = cleaned.split(' ').filter((t) => /\d{3,}/.test(t) && /\D/.test(t)).reverse()
  for (const cand of [cleaned, ...toks]) {
    if (!cand || cand === name) continue
    const p = parseLicense(cand)
    if (!p.suffix) continue
    const hit = vmap.exact.get(plateKey(p.prefix, p.suffix, ''))
    if (hit) return hit
  }
  const model = prefix || suffix ? '' : name
  const created = await db.vehicle.create({
    data: {
      TenantId: tenantId, Status: 'active',
      LicensePlatePrefix: prefix, LicensePlateSuffix: suffix, LicensePlateProvince: province,
      VehicleTypeId: null, VehicleCharacteristic: '', VehicleBrandId: null,
      Model: model, Generation: '', Color: '', ChassisNumber: '', EngineNumber: '', EngineBrand: '',
      TankSize: 0, FuelConsumption: 0, CylinderCount: 0, Cylinder: 0,
      VehicleSize: '', CargoSize: '', GasSerialNumber: '',
      VehicleWeight: 0, CargoWeight: 0, WheelCount: 0, SeatCount: 0,
      RegistrationDate: null, Age: '', Ownership: '',
      VehicleDriverId: null, VehicleStatusId: null,
      InstallmentAmount: null, Note: null,
      CreatedByUsername: username ?? 'import', UpdatedByUsername: username ?? 'import',
    }, select: { VehicleId: true },
  })
  const key = plateKey(prefix, suffix, model)
  vmap.exact.set(key, created.VehicleId)
  if (key.startsWith('model:')) { const toks = modelToks(model); if (toks.length) vmap.models.push({ toks, id: created.VehicleId }) }
  return created.VehicleId
}

// Generic runner: build a record per row (or null to skip), then bulk-create.
async function importCategory<T extends { VehicleId?: string | null }>(
  tenantId: string, username: string | undefined, sheetName: string,
  rows: any[][], colMap: Record<string, number>,
  build: (row: any[], vid: string) => T | null,
  create: (data: T[]) => Promise<unknown>,
  // Skip rows that already exist. `load` fetches existing rows for the involved
  // vehicles; `keyOf` builds the same natural key from both a DB row and a
  // to-create record. Without this, re-uploading the same file double-inserts.
  dedup: { keyOf: (rec: any) => string; load: (vehicleIds: string[]) => Promise<any[]>; label?: (rec: any) => string; amount?: (rec: any) => number },
  // Opt-in: when a row carries a vehicle identity that matches no vehicle, keep it
  // (returning a record) instead of skipping. Income uses this to retain job-label
  // rows (รื้อถอน/ทำถนน) as unlinked income; other categories pass nothing and skip.
  onUnmatched?: (row: any[]) => T | null,
): Promise<CatResult> {
  const vmap = await loadVehicleMap(tenantId)
  // When rows carry no vehicle identity, the sheet name names the vehicle.
  const rowsCarryVehicle = 'license' in colMap || 'licenseSuffix' in colMap || 'model' in colMap
  let sheetVid: string | null | undefined
  const toCreate: T[] = []
  let skipped = 0
  const errors: string[] = []
  for (let i = 0; i < rows.length; i++) {
    try {
      let vid = rowVehicleId(rows[i], colMap, vmap)
      if (!vid && !rowsCarryVehicle) {
        if (sheetVid === undefined) {
          // Probe the row before resolving (and possibly CREATING) the sheet
          // vehicle, so template sheets ("ต้นฉบับ") whose rows all build to null
          // don't mint a junk vehicle named after the sheet. Builders are
          // idempotent per row, so the real build below can run again safely.
          if (!build(rows[i], '__probe__')) { skipped++; continue }
          sheetVid = await resolveSheetVehicle(tenantId, username, sheetName, vmap)
        }
        vid = sheetVid
      }
      if (!vid) {
        const rec = onUnmatched ? onUnmatched(rows[i]) : null
        if (!rec) { skipped++; continue }
        toCreate.push(rec)
        continue
      }
      const rec = build(rows[i], vid)
      if (!rec) { skipped++; continue }
      toCreate.push(rec)
    } catch (e: any) { errors.push(`แถว ${i + 1}: ${e?.message ?? 'error'}`) }
  }

  // Dedup against existing DB rows AND within this file (same key twice -> once).
  // `existing` = already stored (re-upload); `seen` = first copy in this upload.
  // A second copy whose key is only in `seen` is a genuine in-file duplicate, so
  // we record a readable line for it (the importer's own keyOf is authoritative).
  let fresh = toCreate
  const duplicates: string[] = []
  const amt = dedup.amount ?? (() => 0)
  let fileRows = 0, fileSum = 0, createdSum = 0, dupRows = 0, dupSum = 0, existRows = 0, existSum = 0
  if (toCreate.length) {
    const vids = [...new Set(toCreate.map((r) => r.VehicleId).filter((v): v is string => !!v))]
    const existing = new Set<string>((await dedup.load(vids)).map(dedup.keyOf))
    const seen = new Set<string>()
    fresh = []
    fileRows = toCreate.length
    for (const rec of toCreate) {
      const a = amt(rec)
      fileSum += a
      const k = dedup.keyOf(rec)
      if (existing.has(k)) { skipped++; existRows++; existSum += a; continue }
      if (seen.has(k)) { skipped++; dupRows++; dupSum += a; if (dedup.label) duplicates.push(`[${sheetName}] ${dedup.label(rec)}`); continue }
      seen.add(k)
      createdSum += a
      fresh.push(rec)
    }
  }
  if (fresh.length) await create(fresh)
  const stats: ImportStats | undefined = dedup.amount ? { fileRows, fileSum, createdSum, dupRows, dupSum, existRows, existSum } : undefined
  return { created: fresh.length, updated: 0, sub: 0, skipped, errors, duplicates, stats }
}

// Strict DD/MM/YYYY (CE or BE year). dateOrNull can't take these: new Date("29/09/2023")
// reads 29 as a month and yields Invalid Date. Local to repair so the income/fuel
// date semantics (and their re-upload dedup keys) stay byte-identical.
const dmyOrNull = (v: any): Date | null => {
  const m = str(v).match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2}|\d{4})$/)
  if (!m) return null
  const [, dd, mm, yy] = m.map(Number)
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  // 2-digit years parse as 19yy here; the caller's 1950-1999 window fix then
  // resolves them as short BE years ("20/6/68" -> 1968 -> 2025).
  const d = new Date(Date.UTC(yy < 100 ? 1900 + yy : yy, mm - 1, dd))
  if (d.getUTCDate() !== dd) return null // 31/2 would silently roll into March
  return adjustBE(d)
}

function importRepair(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  // ตาราง MA workbooks: one vehicle per sheet, columns ลำดับ|วันที่|รายละเอียด|
  // ผู้ซ่อม|จำนวน|ราคา. Line items of one visit leave วันที่ blank on continuation
  // rows, so the last seen date carries forward. ราคา is the line total ->
  // CompanyPay (the dashboard sums outgoings from CompanyPay). The row-skip and
  // carry-forward rules only engage when the sheet has a รายละเอียด column
  // (hasDesc); the date-sanity window and Thai-price guard apply to the old
  // repair layout too, where they only block garbage values.
  const hasDesc = 'incomeDescription' in colMap
  let lastDate: Date | null = null
  return importCategory<Prisma.RepairVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const desc = str(cell(row, colMap, 'incomeDescription'))
    if (hasDesc) {
      // Blank/template rows carry no item; per-shop subtotal rows ("ยอดรวมร้าน...")
      // would double-count the costs above them.
      if (!desc) return null
      if (/ยอดรวม/.test(`${str(cell(row, colMap, 'scheduledAt'))} ${desc}`)) return null
    }
    let d = dateOrNull(cell(row, colMap, 'repairDate')) ?? dateOrNull(cell(row, colMap, 'receiveDate'))
    if (!d && 'scheduledAt' in colMap) {
      const raw = cell(row, colMap, 'scheduledAt')
      // dmyOrNull FIRST: JS new Date("6/5/68") parses M/D/Y successfully, so
      // letting dateOrNull go first would swap day and month for any hand-typed
      // slash date whose day is <= 12. Serials/ISO fall through to dateOrNull.
      d = dmyOrNull(raw) ?? dateOrNull(raw)
    }
    // Hand-typed "6/5/68" means BE 2568, but Excel windows 2-digit years to 19xx,
    // so both serials (24964) and strings land in 1950-1999. Real CE year =
    // 19yy + 600 - 543 = 19yy + 57 (1968 -> 2025).
    if (d) { const y = d.getFullYear(); if (y >= 1950 && y <= 1999) { d = new Date(d.getTime()); d.setFullYear(y + 57) } }
    // Remaining out-of-range years are typos; treat as unparsed so the visit date
    // carries forward instead of importing garbage.
    if (d && (d.getFullYear() < 1990 || d.getFullYear() > 2100)) d = null
    if (!d && hasDesc) d = lastDate
    if (!d) return null
    lastDate = d
    const qty = str(cell(row, colMap, 'qty'))
    // Apply same dmyOrNull-first + BE 1950-1999 window to ReceiveDate.
    const rawRd = cell(row, colMap, 'receiveDate')
    let rd = (dmyOrNull(rawRd) ?? dateOrNull(rawRd))
    if (rd) { const ry = rd.getFullYear(); if (ry >= 1950 && ry <= 1999) { rd = new Date(rd.getTime()); rd.setFullYear(ry + 57) } }
    // Annotation text in the price cell ("52884 (รอบถัดไป)", "ยังไม่วางบิล",
    // "ฟรี") is never a price — decOrZero would strip the Thai and read the
    // leftover digits as baht. Cap at Decimal(10,2) max to prevent DB overflow
    // from garbage values like phone numbers.
    const rawPay = cell(row, colMap, 'companyPay')
    const pay = /[ก-๙]/.test(str(rawPay)) ? ZERO : decOrZero(rawPay)
    return { VehicleId: vid, Status: 'active', RepairDate: d,
      Description: hasDesc ? (qty && qty !== '1' ? `${desc} (จำนวน ${qty})` : desc) : null,
      LicensePlate: str(cell(row, colMap, 'license')), RepairShop: str(cell(row, colMap, 'repairShop')),
      ReceiveDate: rd ?? d,
      InsurancePay: decOrZero(cell(row, colMap, 'insurancePay')),
      CompanyPay: pay.greaterThan(MAX_PRICE) ? ZERO : pay,
      CreatedByUsername: username ?? 'import' }
  }, (data) => db.repairVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${kdate(r.RepairDate)}|${str(r.RepairShop)}|${str(r.Description ?? '')}|${kdec(r.InsurancePay)}|${kdec(r.CompanyPay)}`,
    load: (vids) => db.repairVehicle.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, RepairDate: true, RepairShop: true, Description: true, InsurancePay: true, CompanyPay: true } }),
    label: (r) => `${str(r.Description) || str(r.RepairShop) || '-'} ${kdec(r.CompanyPay)} บาท`,
  })
}
function importAccident(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  return importCategory<Prisma.AccidentVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const d = dateOrNull(cell(row, colMap, 'accidentDate')) ?? dateOrNull(cell(row, colMap, 'scheduledAt'))
    if (!d) return null
    return { VehicleId: vid, Status: 'active', Date: d, Time: str(cell(row, colMap, 'accidentTime')), Party: str(cell(row, colMap, 'party')), LicensePlate: str(cell(row, colMap, 'license')), DriverName: str(cell(row, colMap, 'driver')), Opponent: str(cell(row, colMap, 'opponent')), CreatedByUsername: username ?? 'import' }
  }, (data) => db.accidentVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${kdate(r.Date)}|${str(r.Time)}|${str(r.Opponent)}`,
    load: (vids) => db.accidentVehicle.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, Date: true, Time: true, Opponent: true } }),
  })
}
function importFuel(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  return importCategory<Prisma.GasolineCostCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const d = dateOrNull(cell(row, colMap, 'fuelDate')) ?? dateOrNull(cell(row, colMap, 'scheduledAt'))
    if (!d) return null
    return { VehicleId: vid, Status: 'active', Item: str(cell(row, colMap, 'fuelItem')), TaxInvoiceNumber: str(cell(row, colMap, 'taxInvoiceNumber')) || null, Liters: int0(cell(row, colMap, 'liters')), Amount: decOrZero(cell(row, colMap, 'amount')), OdometerStart: int0(cell(row, colMap, 'odometerStart')), OdometerEnd: int0(cell(row, colMap, 'odometerEnd')), DateTime: d, CreatedByUsername: username ?? 'import' }
  }, (data) => db.gasolineCost.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${kdate(r.DateTime)}|${kdec(r.Amount)}|${r.Liters}|${r.OdometerStart}|${r.OdometerEnd}|${str(r.TaxInvoiceNumber)}`,
    load: (vids) => db.gasolineCost.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, DateTime: true, Amount: true, Liters: true, OdometerStart: true, OdometerEnd: true, TaxInvoiceNumber: true } }),
  })
}
function importOil(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  return importCategory<Prisma.DrainTheOilVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const d = dateOrNull(cell(row, colMap, 'oilDate')) ?? dateOrNull(cell(row, colMap, 'scheduledAt'))
    if (!d) return null
    return { VehicleId: vid, Status: 'active', Date: d, DueDate: dateOrNull(cell(row, colMap, 'oilDueDate')), Odometer: int0(cell(row, colMap, 'odometer')), TextAlert: str(cell(row, colMap, 'textAlert')) || str(cell(row, colMap, 'note')), CreatedByUsername: username ?? 'import' }
  }, (data) => db.drainTheOilVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${kdate(r.Date)}|${r.Odometer}`,
    load: (vids) => db.drainTheOilVehicle.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, Date: true, Odometer: true } }),
  })
}
function importInstallment(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  return importCategory<Prisma.InstallmentsVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const d = dateOrNull(cell(row, colMap, 'dueDate')) ?? dateOrNull(cell(row, colMap, 'scheduledAt'))
    if (!d) return null
    return { VehicleId: vid, Status: 'active', InstallmentNumber: int0(cell(row, colMap, 'installmentNumber')), DueDate: d, Amount: decOrZero(cell(row, colMap, 'amount')) , DatePay: dateOrNull(cell(row, colMap, 'datePay')), CreatedByUsername: username ?? 'import' }
  }, (data) => db.installmentsVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${r.InstallmentNumber}|${kdate(r.DueDate)}|${kdec(r.Amount)}`,
    load: (vids) => db.installmentsVehicle.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, InstallmentNumber: true, DueDate: true, Amount: true } }),
  })
}
function importIncome(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  // Daily-summary sheets ("แบบสรุปงานรายวัน (6-69)") name the billing cycle:
  // month 6, B.E. year 2569. Each row's date column holds only the day-of-month,
  // and the cycle runs the 26th of the previous month to the 25th of the titled
  // month, so a day >= 26 belongs to the previous month.
  const cyc = str(sheetName).match(/\((\d{1,2})-(\d{2})\)/)
  const cycMonth = cyc ? parseInt(cyc[1], 10) : 0
  const cycYearBE = cyc ? 2500 + parseInt(cyc[2], 10) : 0
  const dateFromDay = (day: number): Date | null => {
    if (!cycMonth || day < 1 || day > 31) return null
    let mo = cycMonth, yr = cycYearBE
    if (day >= 26) { mo -= 1; if (mo < 1) { mo = 12; yr -= 1 } }
    return new Date(Date.UTC(yr - 543, mo - 1, day))
  }
  // Build an income record. `vid` is the matched vehicle (or null for a job-label
  // row); `label` is the ทะเบียน text to keep when there is no real vehicle.
  const mk = (row: any[], vid: string | null, label: string | null): Prisma.IncomeVehicleCreateManyInput | null => {
    const amount = decOrZero(cell(row, colMap, 'amountReceive'))
    // Skip no-job / zero-income rows ("ไม่มีงาน", "รถซ่อม") that would otherwise
    // import as a flood of 0-baht entries.
    if (!(Number(amount) > 0)) return null
    // The daily-summary date column holds only a day-of-month and its header
    // varies ("วันที่" vs " วัน"), so the first column is the reliable source for
    // the day. A real serial date (old English export) is still honoured first.
    const d = dateOrNull(cell(row, colMap, 'scheduledAt'))
      ?? dateOrNull(cell(row, colMap, 'receiveDate'))
      ?? dateFromDay(int0(row[0]))
      ?? new Date()
    return { VehicleId: vid, TenantId: tenantId, SourceLabel: label, Status: 'active', Description: str(cell(row, colMap, 'incomeDescription')) || str(cell(row, colMap, 'note')), CustomerName: str(cell(row, colMap, 'customerName')) || null, DateTime: d, ReceiveDate: dateOrNull(cell(row, colMap, 'receiveDate')), Time: str(cell(row, colMap, 'accidentTime')), WorkOrderNumber: str(cell(row, colMap, 'workOrderNumber')), InvoiceNumber: str(cell(row, colMap, 'invoiceNumber')), AmountReceive: amount, CreatedByUsername: username ?? 'import' }
  }
  return importCategory<Prisma.IncomeVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap,
    (row, vid) => mk(row, vid, null),
    (data) => db.incomeVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${str(r.SourceLabel)}|${str(r.InvoiceNumber)}|${str(r.WorkOrderNumber)}|${kdate(r.DateTime)}|${kdec(r.AmountReceive)}|${str(r.Description)}`,
    load: (vids) => db.incomeVehicle.findMany({ where: { OR: [{ VehicleId: { in: vids } }, { VehicleId: null, TenantId: tenantId }] }, select: { VehicleId: true, SourceLabel: true, InvoiceNumber: true, WorkOrderNumber: true, DateTime: true, AmountReceive: true, Description: true } }),
    label: (r) => `${str(r.Description) || '-'} ${kdec(r.AmountReceive)} บาท บิล ${str(r.InvoiceNumber) || '-'}${r.SourceLabel ? ` [${r.SourceLabel}]` : ''}`,
    amount: (r) => Number(r.AmountReceive),
  },
    // Unmatched ทะเบียน: keep job-label rows (รื้อถอน/ทำถนน/งานขนขยะ) as unlinked
    // income. Drop blank-plate rows and subtotal/grand-total rows ("รวม", "ทั้งหมด").
    (row) => {
      const label = str(cell(row, colMap, 'license'))
      if (!label || /รวม|ทั้งหมด|total/i.test(label)) return null
      return mk(row, null, label)
    },
  )
}

// ---------- installment-matrix importer ----------
interface MatrixGroupCol { date: number; inst: number; invDate: number | null; invNo: number }
interface InstallmentMatrixLayout {
  bandRow: number; groupRow: number
  seqCol: number | null; modelCol: number; licenseCol: number; amountCol: number; noteCol: number | null
  monthGroups: MatrixGroupCol[]
}

// Structural detector for wide month-matrix installment sheets.
// Looks for a sub-header row with >=3 adjacent groups of (วันที่ชำระ, งวด, เลขที่ใบกำกับ within 2 cols)
// AND a band row above with ทะเบียน + รายการทรัพย์สิน + ผ่อน-prefixed column.
// Returns layout or null. Runs before the AI call so unrecognised shapes don't waste an AI call.
export function detectInstallmentMatrix(matrix: any[][]): InstallmentMatrixLayout | null {
  const limit = Math.min(matrix.length, 12)
  for (let r = 1; r < limit; r++) {
    const row = matrix[r] ?? []
    const groups: MatrixGroupCol[] = []
    for (let c = 0; c < row.length - 2; c++) {
      if (norm(row[c]) !== 'วันที่ชำระ') continue
      if (norm(row[c + 1]) !== 'งวด') continue
      let invNoCol: number | null = null, invDateCol: number | null = null
      for (let offset = 1; offset <= 2; offset++) {
        const n = norm(row[c + 1 + offset] ?? '')
        if (n.includes('เลขที่ใบกำกับ') && !n.includes('ภาษี')) { invNoCol = c + 1 + offset; break }
        if (n.includes('วันที่ใบกำกับ')) invDateCol = c + 1 + offset
      }
      if (invNoCol === null) continue
      groups.push({ date: c, inst: c + 1, invDate: invDateCol, invNo: invNoCol })
    }
    if (groups.length < 3) continue
    const band = matrix[r - 1] ?? []
    let licenseCol = -1, modelCol = -1, amountCol = -1, seqCol: number | null = null, noteCol: number | null = null
    for (let c = 0; c < band.length; c++) {
      const n = norm(band[c])
      if (n === 'ทะเบียน' || n === 'ป้ายทะเบียน') licenseCol = c
      else if (n === 'รายการทรัพย์สิน' || n === 'ชื่อรถ') modelCol = c
      else if (n.startsWith('ผ่อน')) amountCol = c
      else if (n === 'ลำดับ' || n === 'ลำดับที่') seqCol = c
      else if (n === 'หมายเหตุ') noteCol = c
    }
    if (licenseCol < 0 || modelCol < 0 || amountCol < 0) continue
    return { bandRow: r - 1, groupRow: r, seqCol, modelCol, licenseCol, amountCol, noteCol, monthGroups: groups }
  }
  return null
}

async function importInstallmentMatrix(tenantId: string, username: string | undefined, sheetName: string, matrix: any[][]): Promise<CatResult> {
  const layout = detectInstallmentMatrix(matrix)
  if (!layout) return { created: 0, updated: 0, sub: 0, skipped: 0, errors: ['detector mismatch'] }

  const allVehicles = await db.vehicle.findMany({
    where: { TenantId: tenantId },
    select: { VehicleId: true, LicensePlatePrefix: true, LicensePlateSuffix: true, Model: true, CreatedAt: true },
  })

  const existingInst = await db.installmentsVehicle.findMany({
    where: { Vehicle: { TenantId: tenantId } },
    select: { VehicleId: true, InstallmentNumber: true },
  })
  const existSet = new Set<string>(existingInst.map((i) => `${i.VehicleId}|${i.InstallmentNumber}`))
  const seenSet = new Set<string>()

  const toCreate: Prisma.InstallmentsVehicleCreateManyInput[] = []
  let skipped = 0
  const errors: string[] = []
  const dataRows = matrix.slice(layout.groupRow + 1)

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const rawLicense = str(row[layout.licenseCol] ?? '')
    if (!rawLicense || norm(rawLicense) === 'ทะเบียน') { skipped++; continue }

    // Collect paid month-groups where วันที่ชำระ parses as a date
    const payments: { date: Date; instNum: number; instRaw: string; invNo: string }[] = []
    for (const grp of layout.monthGroups) {
      const d = dateOrNull(row[grp.date])
      if (!d) continue
      const instRaw = str(row[grp.inst])
      const m = instRaw.match(/งวดที่\s*(\d+)/)
      if (!m) { if (instRaw) errors.push(`แถว ${i + 1}: งวดที่ parse fail: "${instRaw}"`); continue }
      payments.push({ date: d, instNum: parseInt(m[1], 10), instRaw, invNo: str(row[grp.invNo]) })
    }
    if (payments.length === 0) { skipped++; continue }

    // Lazy-resolve vehicle (create only if >= 1 payment parsed)
    const { prefix, suffix } = parseLicense(rawLicense)
    const vKey = plateKey(prefix, suffix, '')
    let vid: string | null = (prefix || suffix) ? (allVehicles.find((v) => plateKey(v.LicensePlatePrefix, v.LicensePlateSuffix, v.Model) === vKey)?.VehicleId ?? null) : null
    if (!vid) vid = fuzzyFindVehicle(allVehicles, prefix, suffix, rawLicense)
    if (!vid) {
      const model = str(row[layout.modelCol] ?? '')
      const newV = await db.vehicle.create({
        data: {
          TenantId: tenantId, Status: 'active',
          LicensePlatePrefix: prefix, LicensePlateSuffix: suffix, LicensePlateProvince: '',
          VehicleTypeId: null, VehicleCharacteristic: '', VehicleBrandId: null,
          Model: model, Generation: '', Color: '', ChassisNumber: '', EngineNumber: '', EngineBrand: '',
          TankSize: 0, FuelConsumption: 0, CylinderCount: 0, Cylinder: 0,
          VehicleSize: '', CargoSize: '', GasSerialNumber: '',
          VehicleWeight: 0, CargoWeight: 0, WheelCount: 0, SeatCount: 0,
          RegistrationDate: null, Age: '', Ownership: '',
          VehicleDriverId: null, VehicleStatusId: null, InstallmentAmount: null, Note: null,
          CreatedByUsername: username ?? 'import', UpdatedByUsername: username ?? 'import',
        }, select: { VehicleId: true, CreatedAt: true },
      })
      vid = newV.VehicleId
      allVehicles.push({ VehicleId: vid, LicensePlatePrefix: prefix, LicensePlateSuffix: suffix, Model: model, CreatedAt: newV.CreatedAt })
    }

    const amount = decOrZero(row[layout.amountCol] ?? '')
    for (const p of payments) {
      const k = `${vid}|${p.instNum}`
      if (existSet.has(k) || seenSet.has(k)) { skipped++; continue }
      seenSet.add(k)
      toCreate.push({
        VehicleId: vid, Status: 'active',
        InstallmentNumber: p.instNum, DueDate: p.date, DatePay: p.date, Amount: amount,
        PaymentEvidence: p.invNo ? `${p.instRaw} ใบกำกับ ${p.invNo}` : p.instRaw,
        CreatedByUsername: username ?? 'import',
      })
    }
  }

  if (toCreate.length) await db.installmentsVehicle.createMany({ data: toCreate })
  return { created: toCreate.length, updated: 0, sub: 0, skipped, errors }
}

const CATEGORY_IMPORTERS: Record<string, (t: string, u: string | undefined, sheet: string, r: any[][], c: Record<string, number>) => Promise<CatResult>> = {
  repair: importRepair, accident: importAccident, fuel: importFuel, oil: importOil, installment: importInstallment, income: importIncome,
}

export function classify(colMap: Record<string, number>): SheetType {
  const has = (f: string) => f in colMap
  if (has('origin') && (has('destination') || has('driver') || has('scheduledAt'))) return 'jobs'
  if (has('repairDate') || has('repairShop')) return 'repair'
  if (has('accidentDate') || has('opponent') || has('party')) return 'accident'
  if (has('liters') || has('odometerStart') || has('fuelItem')) return 'fuel'
  if (has('oilDate') || has('oilDueDate') || has('textAlert')) return 'oil'
  if (has('installmentNumber')) return 'installment'
  if (has('workOrderNumber') || has('invoiceNumber') || has('amountReceive') || has('incomeDescription')) return 'income'
  if (has('license') || has('licenseSuffix')) return 'vehicles'
  return 'unknown'
}

// Resolve a sheet's mapping: ask Gemini first; fall back to the heuristic if the
// AI is unavailable or can't classify it. Returns type/headerRow/colMap + how mapped.
async function resolveMapping(sheetName: string, matrix: any[][]): Promise<{ type: SheetResult['type']; headerRow: number; colMap: Record<string, number>; via: string }> {
  // B1: structural detector runs before the AI call — avoids wasting an AI call on
  // the wide month-matrix layout that no general header heuristic can classify.
  const matrixLayout = detectInstallmentMatrix(matrix)
  if (matrixLayout) return { type: 'installment-matrix', headerRow: matrixLayout.groupRow, colMap: {}, via: 'heuristic' }

  const ai = await aiMapSheet(sheetName, matrix)
  if (ai && ai.type !== 'unknown' && Object.keys(ai.columns).length >= 1) {
    // Merge AI + heuristic mappings. The heuristic wins on conflicts: it matches
    // curated Thai header synonyms exactly and is deterministic, whereas the AI is
    // non-deterministic and occasionally mis-maps a column (e.g. mapping the amount
    // column to liters/distance on one sheet, silently corrupting that sheet's totals).
    // The AI only fills fields the heuristic could not classify, and supplies the type.
    // Also prefer the heuristic's structurally-detected headerRow — the AI's is often
    // off by one, which slices away the first data row of every sheet sharing that layout.
    const det = detectHeader(matrix)
    // Repair headers (ผู้ซ่อม/อู่/วันที่ซ่อม) are curated and unambiguous, but the
    // AI sometimes reads a repair sheet's รายละเอียด column as income — which would
    // import repair costs as revenue (or as garbage vehicles). Override ONLY those
    // two catastrophic misreads: for accident/oil/fuel sheets that happen to carry
    // an อู่ column the AI is the one that can tell the types apart.
    const hType = det ? classify(det.colMap) : 'unknown'
    // 'oil' counts as a misread only when the sheet has no oil column at all —
    // a real oil sheet always carries วันที่เปลี่ยนน้ำมัน/ครบกำหนดเปลี่ยน.
    const aiMisread = ai.type === 'income' || ai.type === 'vehicles'
      || (ai.type === 'oil' && !('oilDate' in (det?.colMap ?? {})) && !('oilDueDate' in (det?.colMap ?? {})))
    let type: SheetResult['type'] = hType === 'repair' && aiMisread ? 'repair' : ai.type

    // A2: force 'vehicles' when heuristic says vehicles AND insurance/tax cols present AND
    // AI returned a different type. Guards against AI misclassifying insurance sheets.
    // Named negative: MA 'SK140' has taxEnd but hType='repair' — conjoin hType==='vehicles' prevents it.
    const hasInsuranceCols = det && ['insuranceEnd', 'compulsoryEnd', 'taxEnd'].some((k) => k in det.colMap)
    if (hType === 'vehicles' && hasInsuranceCols && ai.type !== 'vehicles') type = 'vehicles'

    // A3: if A2 forced vehicles, strip AI-supplied 'model' mapping unless heuristic also found it,
    // to prevent AI mapping 'ลักษณะ' → model which would corrupt Model on matched vehicles.
    let mergedColMap: Record<string, number> = { ...ai.columns, ...(det?.colMap ?? {}) }
    if (hType === 'vehicles' && hasInsuranceCols && ai.type !== 'vehicles') {
      if (det && !('model' in det.colMap) && 'model' in ai.columns) {
        const { model: _m, ...rest } = mergedColMap
        mergedColMap = rest
      }
    }

    return {
      type,
      headerRow: det ? det.headerRow : ai.headerRow,
      colMap: mergedColMap,
      via: 'ai',
    }
  }
  const detected = detectHeader(matrix)
  if (!detected) return { type: 'unknown', headerRow: 0, colMap: {}, via: ai ? 'ai+heuristic' : 'heuristic' }
  return { type: classify(detected.colMap), headerRow: detected.headerRow, colMap: detected.colMap, via: 'heuristic' }
}

// Build {name, matrix} sheets from either a JSON file (array of objects, or an
// object whose values are arrays) or an xlsx/csv workbook.
function bufferToSheets(buffer: Buffer): { name: string; matrix: any[][] }[] {
  const head = buffer.slice(0, 64).toString('utf8').replace(/^﻿/, '').trimStart()
  if (head.startsWith('{') || head.startsWith('[')) {
    try {
      const json = JSON.parse(buffer.toString('utf8').replace(/^﻿/, ''))
      const toMatrix = (arr: any[]): any[][] => {
        const keys = Array.from(new Set(arr.flatMap((o) => (o && typeof o === 'object' ? Object.keys(o) : []))))
        return [keys, ...arr.map((o) => keys.map((k) => (o && typeof o === 'object' ? o[k] : '')))]
      }
      if (Array.isArray(json)) return [{ name: 'data', matrix: toMatrix(json) }]
      if (json && typeof json === 'object') {
        const out: { name: string; matrix: any[][] }[] = []
        for (const [name, val] of Object.entries(json)) {
          if (Array.isArray(val)) out.push({ name, matrix: toMatrix(val) })
        }
        if (out.length) return out
        return [{ name: 'data', matrix: toMatrix([json]) }]
      }
    } catch { /* fall through to xlsx */ }
  }
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false })
  return wb.SheetNames.map((name) => ({ name, matrix: XLSX.utils.sheet_to_json<any[]>(wb.Sheets[name], { header: 1, blankrows: false, defval: '' }) as any[][] }))
}

// Structural signature of a sheet, ignoring per-sheet data values. Workbooks
// that hold one sheet per vehicle repeat the same header layout dozens of times;
// sheets sharing a fingerprint can reuse a single (expensive) AI mapping call.
function headerFingerprint(matrix: any[][]): string {
  const d = detectHeader(matrix)
  if (d) return 'h:' + JSON.stringify((matrix[d.headerRow] ?? []).map((c) => str(c)))
  const labels: string[] = []
  for (let r = 0; r < Math.min(12, matrix.length); r++)
    for (const c of matrix[r] ?? []) { const s = str(c); if (s && !/^[\d.,/\s:-]+$/.test(s)) labels.push(`${r}:${s}`) }
  return 'r:' + labels.join('|')
}

type Mapping = { type: SheetType; headerRow: number; colMap: Record<string, number>; via: string }

export async function importWorkbook(tenantId: string, username: string | undefined, buffer: Buffer, fileName?: string): Promise<SheetResult[]> {
  const sheets = bufferToSheets(buffer)

  // Resolve mappings (AI calls) with bounded concurrency — no DB writes here.
  // Dedupe by header fingerprint so identical layouts cost one AI call, not N.
  const mappings: (Mapping | null)[] = new Array(sheets.length).fill(null)
  const fps = sheets.map((s) => (s.matrix.length ? headerFingerprint(s.matrix) : ''))
  const uniq = [...new Set(fps.filter(Boolean))]
  const byFp = new Map<string, Mapping>()
  await runChunked(uniq.map((fp) => ({ fp })), 4, async ({ fp }) => {
    const i = fps.indexOf(fp)
    byFp.set(fp, await resolveMapping(sheets[i].name, sheets[i].matrix))
  })
  for (let i = 0; i < sheets.length; i++) mappings[i] = fps[i] ? (byFp.get(fps[i]) ?? null) : null

  // Import sheet by sheet (DB writes are sequential per sheet).
  const results: SheetResult[] = []
  for (let i = 0; i < sheets.length; i++) {
    const { name, matrix } = sheets[i]
    try {
      if (matrix.length === 0) { results.push({ sheet: name, type: 'unknown', created: 0, updated: 0, sub: 0, skipped: 0, errors: ['ว่าง'] }); continue }
      const m = mappings[i]
      // installment-matrix carries an empty colMap by design (cols come from its own
      // structural layout, not the synonym map) — exempt it from the empty-colMap skip.
      if (!m || m.type === 'unknown' || (m.type !== 'installment-matrix' && Object.keys(m.colMap).length === 0)) {
        results.push({ sheet: name, type: 'unknown', created: 0, updated: 0, sub: 0, skipped: 0, errors: ['ไม่รู้จักรูปแบบคอลัมน์ (ข้าม)'] })
        continue
      }
      // The mapping is shared across sheets with the same header layout (one AI
      // call for all), but the header can sit on a different row per sheet — the
      // fingerprint keys on header text, not position. Re-detect the header row
      // for THIS sheet so we don't slice away its first data row.
      const sheetHeaderRow = detectHeader(matrix)?.headerRow ?? m.headerRow
      const dataRows = matrix.slice(sheetHeaderRow + 1)
      let r: CatResult
      if (m.type === 'vehicles') {
        const matchFallback = ['insuranceEnd', 'compulsoryEnd', 'taxEnd'].some((k) => k in m.colMap)
        r = await importVehicles(tenantId, username, dataRows, m.colMap, matchFallback)
      } else if (m.type === 'jobs') {
        r = await importJobs(tenantId, username, dataRows, m.colMap)
      } else if (m.type === 'installment-matrix') {
        r = await importInstallmentMatrix(tenantId, username, name, matrix)
      } else {
        r = await CATEGORY_IMPORTERS[m.type](tenantId, username, name, dataRows, m.colMap)
      }
      results.push({ sheet: name, type: m.type, ...r })
    } catch (e: any) {
      results.push({ sheet: name, type: mappings[i]?.type ?? 'unknown', created: 0, updated: 0, sub: 0, skipped: 0, errors: [`import error: ${e?.message ?? 'unknown'}`] })
    }
  }

  // Persist one reconcile log per import (income sheets only). Lets the history
  // page show file vs DB totals and how much was cut as dup/already-present.
  const incomeStats = results.filter((r) => r.stats)
  if (incomeStats.length) {
    const agg = incomeStats.reduce((s, r) => {
      const t = r.stats as ImportStats
      s.fileRows += t.fileRows; s.fileSum += t.fileSum
      s.createdRows += r.created; s.createdSum += t.createdSum
      s.dupRows += t.dupRows; s.dupSum += t.dupSum
      s.existRows += t.existRows; s.existSum += t.existSum
      return s
    }, { fileRows: 0, fileSum: 0, createdRows: 0, createdSum: 0, dupRows: 0, dupSum: 0, existRows: 0, existSum: 0 })
    await db.importLog.create({
      data: {
        TenantId: tenantId, CreatedByUsername: username ?? 'import', FileName: fileName ?? null,
        FileRows: agg.fileRows, FileSum: agg.fileSum,
        CreatedRows: agg.createdRows, CreatedSum: agg.createdSum,
        DupRows: agg.dupRows, DupSum: agg.dupSum,
        ExistRows: agg.existRows, ExistSum: agg.existSum,
      },
    })
  }
  return results
}

export interface ImportBatch {
  time: string; user: string; fileName: string | null
  fileRows: number; fileSum: number
  createdRows: number; createdSum: number
  dupRows: number; dupSum: number
  existRows: number; existSum: number
}

// Past income imports, read from the ImportLog written on each upload. Each row
// is one import with full reconcile numbers (file vs DB, dup/already-present cuts).
// Newest first. Imports done before this log existed are not listed.
export async function getImportHistory(tenantId: string): Promise<ImportBatch[]> {
  const logs = await db.importLog.findMany({ where: { TenantId: tenantId }, orderBy: { CreatedAt: 'desc' } })
  return logs.map((l) => ({
    time: l.CreatedAt.toISOString(), user: l.CreatedByUsername || '-', fileName: l.FileName,
    fileRows: l.FileRows, fileSum: Number(l.FileSum),
    createdRows: l.CreatedRows, createdSum: Number(l.CreatedSum),
    dupRows: l.DupRows, dupSum: Number(l.DupSum),
    existRows: l.ExistRows, existSum: Number(l.ExistSum),
  }))
}
