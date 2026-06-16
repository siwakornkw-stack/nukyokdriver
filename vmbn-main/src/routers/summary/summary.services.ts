import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface IncomeSummaryRow {
  id: number
  vehicleId: string
  licensePlate: string
  vehicleType: string
  driverName: string
  totalIncome: number
  totalTrips: number
  averageIncome: number
  lastTripDate: string
  status: string
}

export interface FuelSummaryRow {
  id: number
  vehicleId: string
  licensePlate: string
  vehicleType: string
  driverName: string
  fuelType: string
  totalLiters: number
  totalCost: number
  averageCostPerLiter: number
  totalDistance: number
  fuelEfficiency: number
  lastFuelDate: string
  status: string
}

export async function getIncomeSummaryService(
  tenantId: string,
  startDate?: string,
  endDate?: string
): Promise<IncomeSummaryRow[]> {
  try {
    // สร้าง where condition สำหรับการกรองตามวันที่
    const dateFilter: any = { Status: 'active' }
    if (startDate && endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.DateTime = {
        gte: new Date(startDate),
        lte: end
      }
    }

    // ดึงข้อมูลยานพาหนะพร้อมรายได้
    const vehicles = await prisma.vehicle.findMany({
      where: {
        TenantId: tenantId
      },
      include: {
        VehicleType: true,
        VehicleDriver: true,
        VehicleStatus: true,
        IncomeVehicle: {
          where: dateFilter,
          orderBy: {
            DateTime: 'desc'
          }
        }
      }
    })

    // แปลงข้อมูลเป็นรูปแบบที่ต้องการ
    const summaryData: IncomeSummaryRow[] = vehicles.map((vehicle, index) => {
      const totalIncome = vehicle.IncomeVehicle.reduce((sum, income) => {
        return sum + Number(income.AmountReceive)
      }, 0)

      const totalTrips = vehicle.IncomeVehicle.length

      const averageIncome = totalTrips > 0 ? totalIncome / totalTrips : 0

      const lastTrip = vehicle.IncomeVehicle[0] // เรียงตาม DateTime desc แล้ว
      const lastTripDate = lastTrip ? lastTrip.DateTime.toISOString().split('T')[0] : ''

      return {
        id: vehicle.No,
        vehicleId: vehicle.VehicleId,
        licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
        vehicleType: vehicle.VehicleType?.Name || 'ไม่ระบุ',
        driverName: vehicle.VehicleDriver?.Name || 'ไม่ระบุ',
        totalIncome: totalIncome,
        totalTrips: totalTrips,
        averageIncome: Math.round(averageIncome),
        lastTripDate: lastTripDate,
        status: vehicle.VehicleStatus?.Name || 'ไม่ระบุ'
      }
    })

    // รายได้ที่ไม่ผูกกับรถ (ทะเบียนเป็น job-label เช่น รื้อถอน/ทำถนน/งานขนขยะ)
    // จัดกลุ่มตาม SourceLabel แล้วแสดงเป็นแถวแยกในรายงาน
    const unlinked = await prisma.incomeVehicle.findMany({
      where: { ...dateFilter, VehicleId: null, TenantId: tenantId },
      orderBy: { DateTime: 'desc' }
    })
    const groups = new Map<string, typeof unlinked>()
    for (const r of unlinked) {
      const k = r.SourceLabel || 'ไม่ระบุ'
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(r)
    }
    const unlinkedRows: IncomeSummaryRow[] = Array.from(groups.entries()).map(([label, items], i) => {
      const totalIncome = items.reduce((s, x) => s + Number(x.AmountReceive), 0)
      const totalTrips = items.length
      return {
        id: 1000000 + i,
        vehicleId: '',
        licensePlate: label,
        vehicleType: 'รายได้ไม่ผูกรถ',
        driverName: '-',
        totalIncome,
        totalTrips,
        averageIncome: totalTrips > 0 ? Math.round(totalIncome / totalTrips) : 0,
        lastTripDate: items[0].DateTime.toISOString().split('T')[0],
        status: '-'
      }
    })

    // เรียงลำดับตาม totalIncome จากมากไปน้อย
    return [...summaryData, ...unlinkedRows].sort((a, b) => b.totalIncome - a.totalIncome)

  } catch (error) {
    console.error('Error in getIncomeSummaryService:', error)
    throw error
  }
}

export interface FuelDetailRow {
  id: string
  vehicleId: string
  licensePlate: string
  vehicleType: string
  driverName: string
  date: string
  item: string
  taxInvoiceNumber: string
  liters: number
  amount: number
  odometerStart: number
  odometerEnd: number
  distance: number
}

export async function getFuelDetailService(
  tenantId: string,
  startDate?: string,
  endDate?: string
): Promise<FuelDetailRow[]> {
  try {
    const dateFilter: any = { Status: 'active' }
    if (startDate && endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.DateTime = {
        gte: new Date(startDate),
        lte: end
      }
    }

    const rows = await prisma.gasolineCost.findMany({
      where: {
        ...dateFilter,
        Vehicle: { TenantId: tenantId }
      },
      include: {
        Vehicle: { include: { VehicleType: true, VehicleDriver: true } }
      },
      orderBy: { DateTime: 'desc' }
    })

    return rows.map((r) => ({
      id: r.GasolineCostId,
      vehicleId: r.VehicleId,
      licensePlate: [r.Vehicle.LicensePlatePrefix, r.Vehicle.LicensePlateSuffix, r.Vehicle.LicensePlateProvince].filter(Boolean).join(' ').trim() || r.Vehicle.Model || `รถ ${r.Vehicle.No}`,
      vehicleType: r.Vehicle.VehicleType?.Name || 'ไม่ระบุ',
      driverName: r.Vehicle.VehicleDriver?.Name || 'ไม่ระบุ',
      date: r.DateTime.toISOString().split('T')[0],
      item: r.Item || '',
      taxInvoiceNumber: r.TaxInvoiceNumber || '',
      liters: r.Liters,
      amount: Number(r.Amount),
      odometerStart: r.OdometerStart,
      odometerEnd: r.OdometerEnd,
      distance: r.OdometerEnd - r.OdometerStart
    }))
  } catch (error) {
    console.error('Error in getFuelDetailService:', error)
    throw error
  }
}

export interface ExpenseSummaryRow {
  id: number
  vehicleId: string
  licensePlate: string
  vehicleType: string
  driverName: string
  fuelCost: number
  repairCost: number
  repairInsurancePay: number
  taxCost: number
  compulsoryCost: number
  insuranceCost: number
  installmentCost: number
  totalCost: number
  income: number
  profit: number
}

// แต่ละตารางต้นทุนใช้ field วันที่ต่างกัน จึงสร้าง where แยกต่อ relation
// anchor ขอบเขตวันทั้งสองด้านที่ start/end-of-day ฐานเดียวกัน (setHours) ไม่ปนกับ UTC midnight
// ของ new Date('YYYY-MM-DD') เพื่อให้ตรงกับ dashboard getCostBreakdown ในทุก timezone
function dateRange(field: string, startDate?: string, endDate?: string): any {
  const where: any = { Status: 'active' }
  if (startDate && endDate) {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    where[field] = { gte: start, lte: end }
  }
  return where
}

export async function getExpenseSummaryService(
  tenantId: string,
  startDate?: string,
  endDate?: string
): Promise<ExpenseSummaryRow[]> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { TenantId: tenantId },
      include: {
        VehicleType: true,
        VehicleDriver: true,
        GasolineCost: { where: dateRange('DateTime', startDate, endDate) },
        RepairVehicle: { where: dateRange('RepairDate', startDate, endDate) },
        Tax: { where: dateRange('EndDate', startDate, endDate) },
        CompulsoryMotorInsuranceVehicle: { where: dateRange('EndDate', startDate, endDate) },
        InsurancePolicyVehicle: { where: dateRange('EndDate', startDate, endDate) },
        // ต้นทุนค่างวด = เฉพาะงวดที่จ่ายจริง (DatePay) — งวดค้างในอนาคต (DatePay=null) ที่
        // generate ไว้สำหรับ AR ต้องไม่ถูกนับเป็นต้นทุน (รวมกรณี "ทั้งหมด" ที่ไม่มีช่วงวันที่)
        InstallmentsVehicle: { where: (startDate && endDate) ? dateRange('DatePay', startDate, endDate) : { Status: 'active', DatePay: { not: null } } },
        IncomeVehicle: { where: dateRange('DateTime', startDate, endDate) }
      }
    })

    const rows: ExpenseSummaryRow[] = vehicles.map((vehicle) => {
      const fuelCost = vehicle.GasolineCost.reduce((s, x) => s + Number(x.Amount), 0)
      const repairCost = vehicle.RepairVehicle.reduce((s, x) => s + Number(x.CompanyPay), 0)
      const repairInsurancePay = vehicle.RepairVehicle.reduce((s, x) => s + Number(x.InsurancePay), 0)
      const taxCost = vehicle.Tax.reduce((s, x) => s + Number(x.TotalPremium), 0)
      const compulsoryCost = vehicle.CompulsoryMotorInsuranceVehicle.reduce((s, x) => s + Number(x.TotalPremium), 0)
      const insuranceCost = vehicle.InsurancePolicyVehicle.reduce((s, x) => s + Number(x.TotalPremium), 0)
      const installmentCost = vehicle.InstallmentsVehicle.reduce((s, x) => s + Number(x.Amount), 0)
      const income = vehicle.IncomeVehicle.reduce((s, x) => s + Number(x.AmountReceive), 0)
      const totalCost = fuelCost + repairCost + taxCost + compulsoryCost + insuranceCost + installmentCost

      return {
        id: vehicle.No,
        vehicleId: vehicle.VehicleId,
        licensePlate: [vehicle.LicensePlatePrefix, vehicle.LicensePlateSuffix, vehicle.LicensePlateProvince].filter(Boolean).join(' ').trim() || vehicle.Model || `รถ ${vehicle.No}`,
        vehicleType: vehicle.VehicleType?.Name || 'ไม่ระบุ',
        driverName: vehicle.VehicleDriver?.Name || 'ไม่ระบุ',
        fuelCost,
        repairCost,
        repairInsurancePay,
        taxCost,
        compulsoryCost,
        insuranceCost,
        installmentCost,
        totalCost,
        income,
        profit: income - totalCost
      }
    })

    // รายได้ไม่ผูกรถ (VehicleId null) นับเป็นรายได้รวมด้วย แต่ไม่มีต้นทุน
    const unlinked = await prisma.incomeVehicle.findMany({
      where: { ...dateRange('DateTime', startDate, endDate), VehicleId: null, TenantId: tenantId }
    })
    const groups = new Map<string, number>()
    for (const r of unlinked) {
      const k = r.SourceLabel || 'ไม่ระบุ'
      groups.set(k, (groups.get(k) || 0) + Number(r.AmountReceive))
    }
    const unlinkedRows: ExpenseSummaryRow[] = Array.from(groups.entries()).map(([label, income], i) => ({
      id: 1000000 + i,
      vehicleId: '',
      licensePlate: label,
      vehicleType: 'รายได้ไม่ผูกรถ',
      driverName: '-',
      fuelCost: 0,
      repairCost: 0,
      repairInsurancePay: 0,
      taxCost: 0,
      compulsoryCost: 0,
      insuranceCost: 0,
      installmentCost: 0,
      totalCost: 0,
      income,
      profit: income
    }))

    return [...rows, ...unlinkedRows].sort((a, b) => b.totalCost - a.totalCost)
  } catch (error) {
    console.error('Error in getExpenseSummaryService:', error)
    throw error
  }
}

// ---- per-transaction cost detail (repair / installment / insurance / tax+พรบ) ----
// Mirrors the date filters of getExpenseSummaryService so each list sums to the
// matching summary card (repair=RepairDate/CompanyPay, insurance/tax/พรบ=EndDate/
// TotalPremium, installment=DatePay/Amount paid-only).
export interface RepairDetailRow { id: string; vehicleId: string; licensePlate: string; vehicleType: string; date: string; description: string; repairShop: string; insurancePay: number; companyPay: number }
export interface InstallmentDetailRow { id: string; vehicleId: string; licensePlate: string; vehicleType: string; datePay: string; dueDate: string; installmentNumber: number; amount: number; paymentEvidence: string }
export interface InsuranceDetailRow { id: string; vehicleId: string; licensePlate: string; vehicleType: string; endDate: string; insuranceCompany: string; type: string; premium: number }
export interface TaxDetailRow { id: string; vehicleId: string; licensePlate: string; vehicleType: string; kind: string; endDate: string; insuranceCompany: string; premium: number }
export interface CostDetailResponse { repair: RepairDetailRow[]; installment: InstallmentDetailRow[]; insurance: InsuranceDetailRow[]; taxCompulsory: TaxDetailRow[] }

const plateOf = (v: { LicensePlatePrefix: string; LicensePlateSuffix: string; LicensePlateProvince: string; Model: string; No: number }): string =>
  [v.LicensePlatePrefix, v.LicensePlateSuffix, v.LicensePlateProvince].filter(Boolean).join(' ').trim() || v.Model || `รถ ${v.No}`
const isoDay = (d: Date | null): string => (d ? d.toISOString().split('T')[0] : '')

export async function getCostDetailService(
  tenantId: string,
  startDate?: string,
  endDate?: string
): Promise<CostDetailResponse> {
  try {
    const ofTenant = { Vehicle: { TenantId: tenantId } }
    const vehInc = { include: { VehicleType: true } }
    const [repairs, installments, insurances, taxes, compulsories] = await Promise.all([
      prisma.repairVehicle.findMany({ where: { ...dateRange('RepairDate', startDate, endDate), ...ofTenant }, include: { Vehicle: vehInc }, orderBy: { RepairDate: 'desc' } }),
      prisma.installmentsVehicle.findMany({ where: { ...((startDate && endDate) ? dateRange('DatePay', startDate, endDate) : { Status: 'active', DatePay: { not: null } }), ...ofTenant }, include: { Vehicle: vehInc }, orderBy: { DatePay: 'desc' } }),
      prisma.insurancePolicyVehicle.findMany({ where: { ...dateRange('EndDate', startDate, endDate), ...ofTenant }, include: { Vehicle: vehInc }, orderBy: { EndDate: 'desc' } }),
      prisma.tax.findMany({ where: { ...dateRange('EndDate', startDate, endDate), ...ofTenant }, include: { Vehicle: vehInc }, orderBy: { EndDate: 'desc' } }),
      prisma.compulsoryMotorInsuranceVehicle.findMany({ where: { ...dateRange('EndDate', startDate, endDate), ...ofTenant }, include: { Vehicle: vehInc }, orderBy: { EndDate: 'desc' } }),
    ])

    const repair: RepairDetailRow[] = repairs.map((r) => ({
      id: r.RepairVehicleId, vehicleId: r.VehicleId, licensePlate: plateOf(r.Vehicle), vehicleType: r.Vehicle.VehicleType?.Name || 'ไม่ระบุ',
      date: isoDay(r.RepairDate), description: r.Description || '', repairShop: r.RepairShop || '', insurancePay: Number(r.InsurancePay), companyPay: Number(r.CompanyPay),
    }))
    const installment: InstallmentDetailRow[] = installments.map((r) => ({
      id: r.InstallmentsVehicleId, vehicleId: r.VehicleId, licensePlate: plateOf(r.Vehicle), vehicleType: r.Vehicle.VehicleType?.Name || 'ไม่ระบุ',
      datePay: isoDay(r.DatePay), dueDate: isoDay(r.DueDate), installmentNumber: r.InstallmentNumber, amount: Number(r.Amount), paymentEvidence: r.PaymentEvidence || '',
    }))
    const insurance: InsuranceDetailRow[] = insurances.map((r) => ({
      id: r.InsurancePolicyVehicleId, vehicleId: r.VehicleId, licensePlate: plateOf(r.Vehicle), vehicleType: r.Vehicle.VehicleType?.Name || 'ไม่ระบุ',
      endDate: isoDay(r.EndDate), insuranceCompany: r.InsuranceCompany || '', type: r.Type || '', premium: Number(r.TotalPremium),
    }))
    const taxCompulsory: TaxDetailRow[] = [
      ...taxes.map((r) => ({ id: r.TaxId, vehicleId: r.VehicleId, licensePlate: plateOf(r.Vehicle), vehicleType: r.Vehicle.VehicleType?.Name || 'ไม่ระบุ', kind: 'ภาษี', endDate: isoDay(r.EndDate), insuranceCompany: r.InsuranceCompany || '', premium: Number(r.TotalPremium) })),
      ...compulsories.map((r) => ({ id: r.CompulsoryMotorInsuranceVehicleId, vehicleId: r.VehicleId, licensePlate: plateOf(r.Vehicle), vehicleType: r.Vehicle.VehicleType?.Name || 'ไม่ระบุ', kind: 'พรบ', endDate: isoDay(r.EndDate), insuranceCompany: r.InsuranceCompany || '', premium: Number(r.TotalPremium) })),
    ].sort((a, b) => b.endDate.localeCompare(a.endDate))

    return { repair, installment, insurance, taxCompulsory }
  } catch (error) {
    console.error('Error in getCostDetailService:', error)
    throw error
  }
}

export async function getFuelSummaryService(
  tenantId: string,
  startDate?: string,
  endDate?: string
): Promise<FuelSummaryRow[]> {
  try {
    // สร้าง where condition สำหรับการกรองตามวันที่
    const dateFilter: any = { Status: 'active' }
    if (startDate && endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter.DateTime = {
        gte: new Date(startDate),
        lte: end
      }
    }

    // ดึงข้อมูลยานพาหนะพร้อมค่าน้ำมัน
    const vehicles = await prisma.vehicle.findMany({
      where: {
        TenantId: tenantId
      },
      include: {
        VehicleType: true,
        VehicleDriver: true,
        VehicleStatus: true,
        FuelType: true,
        GasolineCost: {
          where: dateFilter,
          orderBy: {
            DateTime: 'desc'
          }
        }
      }
    })

    // แปลงข้อมูลเป็นรูปแบบที่ต้องการ
    const summaryData: FuelSummaryRow[] = vehicles.map((vehicle, index) => {
      const totalLiters = vehicle.GasolineCost.reduce((sum, fuel) => {
        return sum + fuel.Liters
      }, 0)

      const totalCost = vehicle.GasolineCost.reduce((sum, fuel) => {
        return sum + Number(fuel.Amount)
      }, 0)

      const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

      // คำนวณระยะทางรวม (จาก OdometerEnd - OdometerStart)
      const totalDistance = vehicle.GasolineCost.reduce((sum, fuel) => {
        return sum + (fuel.OdometerEnd - fuel.OdometerStart)
      }, 0)

      // คำนวณประสิทธิภาพการใช้เชื้อเพลิง (กิโลเมตรต่อลิตร)
      const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0

      const lastFuel = vehicle.GasolineCost[0] // เรียงตาม DateTime desc แล้ว
      const lastFuelDate = lastFuel ? lastFuel.DateTime.toISOString().split('T')[0] : ''

      return {
        id: index + 1,
        vehicleId: vehicle.VehicleId,
        licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
        vehicleType: vehicle.VehicleType?.Name || 'ไม่ระบุ',
        driverName: vehicle.VehicleDriver?.Name || 'ไม่ระบุ',
        fuelType: vehicle.FuelType?.Name || 'ไม่ระบุ',
        totalLiters: totalLiters,
        totalCost: totalCost,
        averageCostPerLiter: Math.round(averageCostPerLiter),
        totalDistance: totalDistance,
        fuelEfficiency: Math.round(fuelEfficiency * 10) / 10, // ปัดเศษ 1 ตำแหน่ง
        lastFuelDate: lastFuelDate,
        status: vehicle.VehicleStatus?.Name || 'ไม่ระบุ'
      }
    })

    // เรียงลำดับตาม totalCost จากมากไปน้อย
    return summaryData.sort((a, b) => b.totalCost - a.totalCost)

  } catch (error) {
    console.error('Error in getFuelSummaryService:', error)
    throw error
  }
} 