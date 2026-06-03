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
const decOrZero = (v: any): Prisma.Decimal => { const s = str(v).replace(/[^0-9.]/g, ''); return s && !isNaN(parseFloat(s)) ? new Prisma.Decimal(s) : new Prisma.Decimal(0) }

// ---------- dedup key normalizers ----------
// Stable string parts so a fetched DB row and a to-be-created record produce the
// same key. Dates -> epoch ms; decimals -> fixed(2) so "7470" == Decimal "7470.00".
const kdate = (v: any): string => (v instanceof Date && !isNaN(v.getTime()) ? String(v.getTime()) : '')
const kdec = (v: any): string => { const n = Number(v); return isNaN(n) ? '' : n.toFixed(2) }

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
const norm = (s: any): string => str(s).toLowerCase().replace(/[\s.\-_/]/g, '')

const SYNONYMS: Record<string, string[]> = {
  // old English export keys still supported
  license: ['ทะเบียน', 'ป้ายทะเบียน', 'ทะเบียนรถ', 'เลขทะเบียน', 'licenseplate', 'licenseplateprefix'],
  licenseSuffix: ['licenseplatesuffix'],
  province: ['licenseplateprovince', 'จังหวัด'],
  model: ['รายการทรัพย์สิน', 'รายการ', 'ชื่อรถ', 'ยี่ห้อรุ่น', 'รุ่น', 'model'],
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
  taxEnd: ['ภาษีสั้น', 'ภาษี', 'ภาษีหมด'],
  // job columns (driver dispatch via LINE)
  origin: ['เนื้อหางาน', 'เนื้องาน', 'ต้นทาง', 'จุดรับ', 'origin'],
  destination: ['จุดหมายปลายทาง', 'จุดหมาย', 'ปลายทาง', 'จุดส่ง', 'หน้างาน', 'แผนที่', 'googlemap', 'destination'],
  scheduledAt: ['วันเวลา', 'เวลา', 'วันที่', 'scheduledat'],
  // per-vehicle sub-data columns
  repairDate: ['วันที่ซ่อม', 'วันซ่อม'],
  repairShop: ['อู่', 'ร้านซ่อม', 'อู่ซ่อม', 'ชื่ออู่'],
  receiveDate: ['วันรับรถ', 'วันที่รับรถ', 'รับรถ'],
  insurancePay: ['ประกันจ่าย', 'ประกันออก'],
  companyPay: ['บริษัทจ่าย', 'บริษัทออก'],
  accidentDate: ['วันที่เกิดเหตุ', 'วันเกิดเหตุ'],
  accidentTime: ['เวลาเกิดเหตุ'],
  party: ['คู่กรณี', 'จำนวนคู่กรณี'],
  opponent: ['ฝ่ายตรงข้าม', 'คู่กรณีฝ่ายตรงข้าม'],
  fuelItem: ['รายการน้ำมัน', 'ชนิดน้ำมัน', 'ประเภทน้ำมัน'],
  liters: ['ลิตร', 'จำนวนลิตร'],
  amount: ['จำนวนเงิน', 'ยอดเงิน', 'amount'],
  odometerStart: ['เลขไมล์เริ่ม', 'ไมล์เริ่ม', 'เลขไมล์เริ่มต้น'],
  odometerEnd: ['เลขไมล์สิ้นสุด', 'ไมล์สิ้นสุด'],
  odometer: ['เลขไมล์', 'ไมล์', 'odometer'],
  oilDate: ['วันที่เปลี่ยนน้ำมัน', 'วันเปลี่ยนน้ำมัน', 'วันถ่ายน้ำมัน'],
  oilDueDate: ['ครบกำหนดเปลี่ยน', 'รอบถัดไป'],
  textAlert: ['ข้อความแจ้งเตือน', 'ข้อความ'],
  installmentNumber: ['งวดที่', 'งวด'],
  dueDate: ['วันครบกำหนด', 'ครบกำหนด', 'วันที่ครบกำหนด'],
  datePay: ['วันจ่าย', 'วันที่จ่าย', 'วันชำระ'],
  incomeDescription: ['รายละเอียดงาน', 'รายละเอียด'],
  customerName: ['ชื่อลูกค้า', 'ลูกค้า'],
  workOrderNumber: ['เลขใบสั่งงาน', 'ใบสั่งงาน', 'เลขที่งาน'],
  invoiceNumber: ['เลขใบแจ้งหนี้', 'ใบแจ้งหนี้', 'เลขที่บิล'],
  amountReceive: ['จำนวนรับ', 'ยอดรับ', 'เงินที่ได้รับ'],
}

// Map a header cell to a canonical field name (or null).
function canonical(header: string): string | null {
  const n = norm(header)
  if (!n) return null
  for (const [field, syns] of Object.entries(SYNONYMS)) {
    if (syns.some((s) => { const sn = norm(s); return n === sn || n.includes(sn) })) return field
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

export type SheetType = 'vehicles' | 'jobs' | 'repair' | 'accident' | 'fuel' | 'oil' | 'installment' | 'income' | 'unknown'

export interface SheetResult {
  sheet: string
  type: SheetType
  created: number
  updated: number
  sub: number
  skipped: number
  errors: string[]
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
async function importVehicles(tenantId: string, username: string | undefined, rows: any[][], colMap: Record<string, number>): Promise<Omit<SheetResult, 'sheet' | 'type'>> {
  let created = 0, updated = 0, sub = 0, skipped = 0
  const errors: string[] = []

  const [typeMap, brandMap, driverMap, statusMap] = await Promise.all([
    loadRefMap('vehicleType', 'VehicleTypeId', tenantId),
    loadRefMap('vehicleBrand', 'VehicleBrandId', tenantId),
    loadRefMap('vehicleDriver', 'VehicleDriverId', tenantId),
    loadRefMap('vehicleStatus', 'VehicleStatusId', tenantId),
  ])
  const existing = await db.vehicle.findMany({ where: { TenantId: tenantId }, select: { VehicleId: true, LicensePlatePrefix: true, LicensePlateSuffix: true, Model: true } })
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
      let prefix = str(cell(row, colMap, 'license'))
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
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const origin = str(cell(row, colMap, 'origin'))
    const destination = str(cell(row, colMap, 'destination'))
    const driverName = str(cell(row, colMap, 'driver'))
    try {
      if (!origin && !destination && !driverName) { skipped++; continue }
      if (!origin) throw new Error('ต้องมีเนื้อหางาน')
      let driverId: string | null = null
      if (driverName) {
        if (driverCache.has(driverName)) driverId = driverCache.get(driverName) as string | null
        else { driverId = await getOrCreateRef('vehicleDriver', 'VehicleDriverId', tenantId, driverName, username); driverCache.set(driverName, driverId) }
      }
      await db.driverJob.create({
        data: {
          TenantId: tenantId, JobNo: jobNo++, VehicleDriverId: driverId,
          Origin: origin, Destination: destination || '-',
          ScheduledAt: dateOrNull(cell(row, colMap, 'scheduledAt')),
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
async function importCategory<T extends { VehicleId: string }>(
  tenantId: string, username: string | undefined, sheetName: string,
  rows: any[][], colMap: Record<string, number>,
  build: (row: any[], vid: string) => T | null,
  create: (data: T[]) => Promise<unknown>,
  // Skip rows that already exist. `load` fetches existing rows for the involved
  // vehicles; `keyOf` builds the same natural key from both a DB row and a
  // to-create record. Without this, re-uploading the same file double-inserts.
  dedup: { keyOf: (rec: any) => string; load: (vehicleIds: string[]) => Promise<any[]> },
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
        if (sheetVid === undefined) sheetVid = await resolveSheetVehicle(tenantId, username, sheetName, vmap)
        vid = sheetVid
      }
      if (!vid) { skipped++; continue }
      const rec = build(rows[i], vid)
      if (!rec) { skipped++; continue }
      toCreate.push(rec)
    } catch (e: any) { errors.push(`แถว ${i + 1}: ${e?.message ?? 'error'}`) }
  }

  // Dedup against existing DB rows AND within this file (same key twice -> once).
  let fresh = toCreate
  if (toCreate.length) {
    const vids = [...new Set(toCreate.map((r) => r.VehicleId))]
    const seen = new Set<string>((await dedup.load(vids)).map(dedup.keyOf))
    fresh = []
    for (const rec of toCreate) {
      const k = dedup.keyOf(rec)
      if (seen.has(k)) { skipped++; continue }
      seen.add(k)
      fresh.push(rec)
    }
  }
  if (fresh.length) await create(fresh)
  return { created: fresh.length, updated: 0, sub: 0, skipped, errors }
}

function importRepair(tenantId: string, username: string | undefined, sheetName: string, rows: any[][], colMap: Record<string, number>): Promise<CatResult> {
  return importCategory<Prisma.RepairVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const d = dateOrNull(cell(row, colMap, 'repairDate')) ?? dateOrNull(cell(row, colMap, 'receiveDate'))
    if (!d) return null
    return { VehicleId: vid, Status: 'active', RepairDate: d, LicensePlate: str(cell(row, colMap, 'license')), RepairShop: str(cell(row, colMap, 'repairShop')), ReceiveDate: dateOrNull(cell(row, colMap, 'receiveDate')) ?? d, InsurancePay: decOrZero(cell(row, colMap, 'insurancePay')), CompanyPay: decOrZero(cell(row, colMap, 'companyPay')), CreatedByUsername: username ?? 'import' }
  }, (data) => db.repairVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${kdate(r.RepairDate)}|${str(r.RepairShop)}|${kdec(r.InsurancePay)}|${kdec(r.CompanyPay)}`,
    load: (vids) => db.repairVehicle.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, RepairDate: true, RepairShop: true, InsurancePay: true, CompanyPay: true } }),
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
    return { VehicleId: vid, Status: 'active', Item: str(cell(row, colMap, 'fuelItem')), Liters: int0(cell(row, colMap, 'liters')), Amount: decOrZero(cell(row, colMap, 'amount')), OdometerStart: int0(cell(row, colMap, 'odometerStart')), OdometerEnd: int0(cell(row, colMap, 'odometerEnd')), DateTime: d, CreatedByUsername: username ?? 'import' }
  }, (data) => db.gasolineCost.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${kdate(r.DateTime)}|${kdec(r.Amount)}|${r.Liters}|${r.OdometerStart}|${r.OdometerEnd}`,
    load: (vids) => db.gasolineCost.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, DateTime: true, Amount: true, Liters: true, OdometerStart: true, OdometerEnd: true } }),
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
  return importCategory<Prisma.IncomeVehicleCreateManyInput>(tenantId, username, sheetName, rows, colMap, (row, vid) => {
    const d = dateOrNull(cell(row, colMap, 'scheduledAt')) ?? dateOrNull(cell(row, colMap, 'receiveDate')) ?? new Date()
    return { VehicleId: vid, Status: 'active', Description: str(cell(row, colMap, 'incomeDescription')) || str(cell(row, colMap, 'note')), CustomerName: str(cell(row, colMap, 'customerName')) || null, DateTime: d, ReceiveDate: dateOrNull(cell(row, colMap, 'receiveDate')), Time: str(cell(row, colMap, 'accidentTime')), WorkOrderNumber: str(cell(row, colMap, 'workOrderNumber')), InvoiceNumber: str(cell(row, colMap, 'invoiceNumber')), AmountReceive: decOrZero(cell(row, colMap, 'amountReceive')) , CreatedByUsername: username ?? 'import' }
  }, (data) => db.incomeVehicle.createMany({ data }), {
    keyOf: (r) => `${r.VehicleId}|${str(r.InvoiceNumber)}|${str(r.WorkOrderNumber)}|${kdate(r.DateTime)}|${kdec(r.AmountReceive)}|${str(r.Description)}`,
    load: (vids) => db.incomeVehicle.findMany({ where: { VehicleId: { in: vids } }, select: { VehicleId: true, InvoiceNumber: true, WorkOrderNumber: true, DateTime: true, AmountReceive: true, Description: true } }),
  })
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
  const ai = await aiMapSheet(sheetName, matrix)
  if (ai && ai.type !== 'unknown' && Object.keys(ai.columns).length >= 1) {
    return { type: ai.type, headerRow: ai.headerRow, colMap: ai.columns, via: 'ai' }
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

export async function importWorkbook(tenantId: string, username: string | undefined, buffer: Buffer): Promise<SheetResult[]> {
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
    if (matrix.length === 0) { results.push({ sheet: name, type: 'unknown', created: 0, updated: 0, sub: 0, skipped: 0, errors: ['ว่าง'] }); continue }
    const m = mappings[i]
    if (!m || m.type === 'unknown' || Object.keys(m.colMap).length === 0) {
      results.push({ sheet: name, type: 'unknown', created: 0, updated: 0, sub: 0, skipped: 0, errors: ['ไม่รู้จักรูปแบบคอลัมน์ (ข้าม)'] })
      continue
    }
    const dataRows = matrix.slice(m.headerRow + 1)
    let r: CatResult
    if (m.type === 'vehicles') r = await importVehicles(tenantId, username, dataRows, m.colMap)
    else if (m.type === 'jobs') r = await importJobs(tenantId, username, dataRows, m.colMap)
    else r = await CATEGORY_IMPORTERS[m.type](tenantId, username, name, dataRows, m.colMap)
    results.push({ sheet: name, type: m.type, ...r })
  }
  return results
}
