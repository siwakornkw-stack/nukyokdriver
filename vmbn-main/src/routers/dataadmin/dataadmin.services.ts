import { Prisma } from '@prisma/client'
import { db } from '../../utils/db.server'

// Admin data management: list / preview-count / delete per-vehicle sub-records.
// Every query is scoped to the caller's tenant via the Vehicle relation so an
// admin can never read or delete another tenant's rows.

export type DataType = 'fuel' | 'repair' | 'accident' | 'oil' | 'installment' | 'income'

interface TypeCfg {
  model: string            // prisma delegate name
  id: string               // primary key field
  date: string             // date field used for range filter + display
  select: Record<string, true>
  summary: (r: any) => string
  label: string
}

const dec = (v: any): string => { const n = Number(v); return isNaN(n) ? '0' : n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }

const CONFIG: Record<DataType, TypeCfg> = {
  fuel: {
    model: 'gasolineCost', id: 'GasolineCostId', date: 'DateTime', label: 'ค่าน้ำมัน',
    select: { Item: true, Liters: true, Amount: true, OdometerStart: true, OdometerEnd: true },
    summary: (r) => `${r.Item || 'น้ำมัน'} ${r.Liters} ลิตร ${dec(r.Amount)} บาท (ไมล์ ${r.OdometerStart}-${r.OdometerEnd})`,
  },
  repair: {
    model: 'repairVehicle', id: 'RepairVehicleId', date: 'RepairDate', label: 'ซ่อม',
    select: { RepairShop: true, InsurancePay: true, CompanyPay: true },
    summary: (r) => `อู่ ${r.RepairShop || '-'} ประกันจ่าย ${dec(r.InsurancePay)} บริษัทจ่าย ${dec(r.CompanyPay)}`,
  },
  accident: {
    model: 'accidentVehicle', id: 'AccidentVehicleId', date: 'Date', label: 'อุบัติเหตุ',
    select: { Time: true, Party: true, Opponent: true },
    summary: (r) => `${r.Time || ''} คู่กรณี ${r.Party || '-'} ${r.Opponent || ''}`.trim(),
  },
  oil: {
    model: 'drainTheOilVehicle', id: 'DrainTheOilVehicleId', date: 'Date', label: 'เปลี่ยนน้ำมัน',
    select: { Odometer: true, TextAlert: true },
    summary: (r) => `ไมล์ ${r.Odometer} ${r.TextAlert || ''}`.trim(),
  },
  installment: {
    model: 'installmentsVehicle', id: 'InstallmentsVehicleId', date: 'DueDate', label: 'ค่างวด',
    select: { InstallmentNumber: true, Amount: true, DatePay: true },
    summary: (r) => `งวด ${r.InstallmentNumber} ${dec(r.Amount)} บาท${r.DatePay ? ' (จ่ายแล้ว)' : ''}`,
  },
  income: {
    model: 'incomeVehicle', id: 'IncomeVehicleId', date: 'DateTime', label: 'รายได้',
    select: { Description: true, InvoiceNumber: true, AmountReceive: true, SourceLabel: true },
    summary: (r) => `${r.Description || '-'} บิล ${r.InvoiceNumber || '-'} รับ ${dec(r.AmountReceive)} บาท`,
  },
}

// Tenant scope: income can have null VehicleId (unlinked job-label rows) so it is
// scoped by its own TenantId column; every other type scopes via the Vehicle relation.
const tenantScope = (type: DataType, tenantId: string): any =>
  type === 'income' ? { TenantId: tenantId } : { Vehicle: { TenantId: tenantId } }

export const isDataType = (t: string): t is DataType => t in CONFIG
export const dataTypeList = (): { value: DataType; label: string }[] =>
  (Object.keys(CONFIG) as DataType[]).map((value) => ({ value, label: CONFIG[value].label }))

export interface Filter { vehicleId?: string; from?: string; to?: string }

// Build the Prisma where-clause: always tenant-scoped, plus optional vehicle/date.
function buildWhere(type: DataType, tenantId: string, filter: Filter): any {
  const cfg = CONFIG[type]
  const where: any = tenantScope(type, tenantId)
  if (filter.vehicleId) where.VehicleId = filter.vehicleId
  const range: any = {}
  if (filter.from) { const d = new Date(filter.from); if (!isNaN(d.getTime())) range.gte = d }
  if (filter.to) { const d = new Date(filter.to); if (!isNaN(d.getTime())) { d.setHours(23, 59, 59, 999); range.lte = d } }
  if (Object.keys(range).length) where[cfg.date] = range
  return where
}

const plateLabel = (v: any): string => {
  if (!v) return '-'
  const plate = [v.LicensePlatePrefix, v.LicensePlateSuffix].filter(Boolean).join(' ').trim()
  return plate || v.Model || '-'
}

export interface DataRow { id: string; date: string | null; vehicle: string; summary: string }

export async function listRecords(type: DataType, tenantId: string, filter: Filter, limit = 200, offset = 0): Promise<{ rows: DataRow[]; total: number }> {
  const cfg = CONFIG[type]
  const where = buildWhere(type, tenantId, filter)
  const select = { [cfg.id]: true, [cfg.date]: true, ...cfg.select, Vehicle: { select: { LicensePlatePrefix: true, LicensePlateSuffix: true, Model: true } } }
  const [rows, total] = await Promise.all([
    (db as any)[cfg.model].findMany({ where, select, orderBy: { [cfg.date]: 'desc' }, take: Math.min(limit, 500), skip: offset }),
    (db as any)[cfg.model].count({ where }),
  ])
  return {
    total,
    rows: rows.map((r: any) => ({
      id: r[cfg.id],
      date: r[cfg.date] instanceof Date ? r[cfg.date].toISOString() : null,
      vehicle: r.Vehicle ? plateLabel(r.Vehicle) : (r.SourceLabel || '-'),
      summary: cfg.summary(r),
    })),
  }
}

export async function previewCount(type: DataType, tenantId: string, body: { ids?: string[]; filter?: Filter }): Promise<number> {
  const cfg = CONFIG[type]
  if (body.ids && body.ids.length) {
    return (db as any)[cfg.model].count({ where: { [cfg.id]: { in: body.ids }, ...tenantScope(type, tenantId) } })
  }
  return (db as any)[cfg.model].count({ where: buildWhere(type, tenantId, body.filter ?? {}) })
}

// Delete by explicit ids OR by filter. Refuses an empty/unscoped delete so an
// admin can't wipe a whole type by accident (a filter with no vehicle/date is
// allowed only when explicitly confirmed by passing allowAll).
export async function deleteRecords(type: DataType, tenantId: string, body: { ids?: string[]; filter?: Filter; allowAll?: boolean }): Promise<number> {
  const cfg = CONFIG[type]
  if (body.ids && body.ids.length) {
    const res = await (db as any)[cfg.model].deleteMany({ where: { [cfg.id]: { in: body.ids }, ...tenantScope(type, tenantId) } })
    return res.count
  }
  const filter = body.filter ?? {}
  const hasScope = Boolean(filter.vehicleId || filter.from || filter.to)
  if (!hasScope && !body.allowAll) throw new Error('ต้องเลือกรถหรือช่วงวันที่ก่อนลบ (หรือยืนยันลบทั้งหมด)')
  const res = await (db as any)[cfg.model].deleteMany({ where: buildWhere(type, tenantId, filter) })
  return res.count
}

// ---------- vehicle deletion (admin) ----------
// Child tables that reference Vehicle via VehicleId; deleted before the vehicle
// itself because the FKs have no ON DELETE CASCADE.
const VEHICLE_CHILDREN = [
  'tax', 'compulsoryMotorInsuranceVehicle', 'insurancePolicyVehicle',
  'attachFileVehicle', 'carTires', 'accidentVehicle', 'repairVehicle',
  'gasolineCost', 'drainTheOilVehicle', 'installmentsVehicle',
  'imageVehicle', 'incomeVehicle',
] as const

export interface VehicleRow { id: string; plate: string; model: string; status: string }

export async function listVehicles(tenantId: string, search?: string): Promise<{ rows: VehicleRow[]; total: number }> {
  const where: any = { TenantId: tenantId }
  const q = search?.trim()
  if (q) where.OR = [
    { LicensePlatePrefix: { contains: q } },
    { LicensePlateSuffix: { contains: q } },
    { Model: { contains: q } },
  ]
  const [rows, total] = await Promise.all([
    db.vehicle.findMany({ where, select: { VehicleId: true, LicensePlatePrefix: true, LicensePlateSuffix: true, Model: true, Status: true }, orderBy: { CreatedAt: 'desc' }, take: 500 }),
    db.vehicle.count({ where }),
  ])
  return {
    total,
    rows: rows.map((v) => ({
      id: v.VehicleId,
      plate: [v.LicensePlatePrefix, v.LicensePlateSuffix].filter(Boolean).join(' ').trim(),
      model: v.Model,
      status: v.Status,
    })),
  }
}

// Validate ids belong to the tenant, then count how many child rows would be
// removed alongside the vehicles.
async function tenantVehicleIds(tenantId: string, ids: string[]): Promise<string[]> {
  const valid = await db.vehicle.findMany({ where: { VehicleId: { in: ids }, TenantId: tenantId }, select: { VehicleId: true } })
  return valid.map((v) => v.VehicleId)
}

export async function previewVehicleDelete(tenantId: string, ids: string[]): Promise<{ vehicles: number; children: number }> {
  if (!ids?.length) return { vehicles: 0, children: 0 }
  const vids = await tenantVehicleIds(tenantId, ids)
  if (!vids.length) return { vehicles: 0, children: 0 }
  let children = 0
  for (const model of VEHICLE_CHILDREN) children += await (db as any)[model].count({ where: { VehicleId: { in: vids } } })
  return { vehicles: vids.length, children }
}

export async function deleteVehicles(tenantId: string, ids: string[]): Promise<{ vehicles: number; children: number }> {
  if (!ids?.length) throw new Error('ไม่ได้เลือกรถ')
  const vids = await tenantVehicleIds(tenantId, ids)
  if (!vids.length) throw new Error('ไม่พบรถที่เลือก')
  const ops = VEHICLE_CHILDREN.map((model) => (db as any)[model].deleteMany({ where: { VehicleId: { in: vids } } }))
  ops.push(db.vehicle.deleteMany({ where: { VehicleId: { in: vids }, TenantId: tenantId } }))
  const res = await db.$transaction(ops)
  const children = res.slice(0, VEHICLE_CHILDREN.length).reduce((a: number, r: any) => a + r.count, 0)
  return { vehicles: res[res.length - 1].count, children }
}
