import { db } from '../../utils/db.server'
// NOTE: income/gasoline dashboard filters use "DateTime" (actual transaction date),
// not the row insert date, so imported historical data lands in the correct period.

export async function getIncomeVehicle(tenantId: string) {
    return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId } })
}

export async function getIncomeVehicleThisYear(tenantId: string) {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
    return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfYear, lte: endOfYear } } })
}

export async function getIncomeVehicleThisMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfMonth, lte: endOfMonth } } })
}
export async function getIncomeVehicleThisWeek(tenantId: string) {
  const today = new Date()
  // คำนวณวันแรกของสัปดาห์ (วันอาทิตย์)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  // คำนวณวันสุดท้ายของสัปดาห์ (วันเสาร์)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)
  
  return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfWeek, lte: endOfWeek } } })
}

export async function getIncomeVehicleThisDay(tenantId: string) {
  const today = new Date()
  // ตั้งเวลาเริ่มต้นของวัน (00:00:00.000)
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  // ตั้งเวลาสิ้นสุดของวัน (23:59:59.999)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)
  
  return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfDay, lte: endOfDay } } })
}

export async function getGasolineCostThisYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
  return await db.gasolineCost.findMany({ 
      where: { 
          Status: 'active', Vehicle: { TenantId: tenantId },
          DateTime: { 
              gte: startOfYear, 
              lte: endOfYear 
          } 
      } 
  })
}
export async function getGasolineCostThisMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    return await db.gasolineCost.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfMonth, lte: endOfMonth } } })
}
export async function getGasolineCostThisWeek(tenantId: string) {
  const today = new Date()
  // คำนวณวันแรกของสัปดาห์ (วันอาทิตย์)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  // คำนวณวันสุดท้ายของสัปดาห์ (วันเสาร์)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)
  
  return await db.gasolineCost.findMany({ 
      where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfWeek, lte: endOfWeek } } 
  })
}

export async function getGasolineCostThisDay(tenantId: string) {
  const today = new Date()
  // ตั้งเวลาเริ่มต้นของวัน (00:00:00.000)
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  // ตั้งเวลาสิ้นสุดของวัน (23:59:59.999)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)
  
  return await db.gasolineCost.findMany({ 
      where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfDay, lte: endOfDay } } 
  })
}

export async function getGasolineCostLastYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear() - 1, 0, 1)
  const endOfYear = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
  return await db.gasolineCost.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfYear, lte: endOfYear } } })
}


export async function getRepairVehicleThisYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
  return await db.repairVehicle.findMany({ 
      where: { 
          Status: 'active', Vehicle: { TenantId: tenantId },
          ReceiveDate: { 
              gte: startOfYear, 
              lte: endOfYear 
          } 
      } 
  })
}
export async function getRepairVehicleThisMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    return await db.repairVehicle.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfMonth, lte: endOfMonth } } })
}
export async function getRepairVehicleThisWeek(tenantId: string) {
  const today = new Date()
  // คำนวณวันแรกของสัปดาห์ (วันอาทิตย์)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  // คำนวณวันสุดท้ายของสัปดาห์ (วันเสาร์)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)
  
  return await db.repairVehicle.findMany({ 
      where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfWeek, lte: endOfWeek } } 
  })
}

export async function getRepairVehicleThisDay(tenantId: string) {
  const today = new Date()
  // ตั้งเวลาเริ่มต้นของวัน (00:00:00.000)
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  // ตั้งเวลาสิ้นสุดของวัน (23:59:59.999)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)
  
  return await db.repairVehicle.findMany({ 
      where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfDay, lte: endOfDay } } 
  })
}

export async function getRepairVehicleLastYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear() - 1, 0, 1)
  const endOfYear = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
  return await db.repairVehicle.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfYear, lte: endOfYear } } })
}


export async function getIncomeVehicleLastMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
    return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfMonth, lte: endOfMonth } } })
}
export async function getIncomeVehicleLastWeek(tenantId: string) {
  const today = new Date()
  // คำนวณวันแรกของสัปดาห์ที่แล้ว
  const startOfLastWeek = new Date(today)
  startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
  startOfLastWeek.setHours(0, 0, 0, 0)
  
  // คำนวณวันสุดท้ายของสัปดาห์ที่แล้ว
  const endOfLastWeek = new Date(today)
  endOfLastWeek.setDate(today.getDate() - today.getDay() - 1)
  endOfLastWeek.setHours(23, 59, 59, 999)
  
  return await db.incomeVehicle.findMany({
      where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfLastWeek, lte: endOfLastWeek } }
  })
}

export async function getIncomeVehicleLastYear(tenantId: string) {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear() - 1, 0, 1)
    const endOfYear = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
    return await db.incomeVehicle.findMany({ where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfYear, lte: endOfYear } } })
}

export async function getIncomeVehicleLastDay(tenantId: string) {
  const today = new Date()
  // ตั้งเวลาเริ่มต้นของเมื่อวาน
  const startOfYesterday = new Date(today)
  startOfYesterday.setDate(today.getDate() - 1)
  startOfYesterday.setHours(0, 0, 0, 0)
  
  // ตั้งเวลาสิ้นสุดของเมื่อวาน
  const endOfYesterday = new Date(today)
  endOfYesterday.setDate(today.getDate() - 1)
  endOfYesterday.setHours(23, 59, 59, 999)
  
  return await db.incomeVehicle.findMany({
      where: { Status: 'active', TenantId: tenantId, DateTime: { gte: startOfYesterday, lte: endOfYesterday } }
  })
}

export async function getOutgoingsLastMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
    return await db.gasolineCost.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfMonth, lte: endOfMonth } } })
}
export async function getOutgoingsLastWeek(tenantId: string) {
  const today = new Date()
  // คำนวณวันแรกของสัปดาห์ที่แล้ว
  const startOfLastWeek = new Date(today)
  startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
  startOfLastWeek.setHours(0, 0, 0, 0)
  
  // คำนวณวันสุดท้ายของสัปดาห์ที่แล้ว
  const endOfLastWeek = new Date(today)
  endOfLastWeek.setDate(today.getDate() - today.getDay() - 1)
  endOfLastWeek.setHours(23, 59, 59, 999)
  
  return await db.gasolineCost.findMany({ 
      where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfLastWeek, lte: endOfLastWeek } } 
  })
}

export async function getOutgoingsLastDay(tenantId: string) {
  const today = new Date()
  // ตั้งเวลาเริ่มต้นของเมื่อวาน
  const startOfYesterday = new Date(today)
  startOfYesterday.setDate(today.getDate() - 1)
  startOfYesterday.setHours(0, 0, 0, 0)
  
  // ตั้งเวลาสิ้นสุดของเมื่อวาน
  const endOfYesterday = new Date(today)
  endOfYesterday.setDate(today.getDate() - 1)
  endOfYesterday.setHours(23, 59, 59, 999)
  
  return await db.gasolineCost.findMany({ 
      where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: startOfYesterday, lte: endOfYesterday } } 
  })
}

export async function getRepairVehicleLastMonth(tenantId: string) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)
  return await db.repairVehicle.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfMonth, lte: endOfMonth } } })
}
export async function getRepairVehicleLastWeek(tenantId: string) {
const today = new Date()
// คำนวณวันแรกของสัปดาห์ที่แล้ว
const startOfLastWeek = new Date(today)
startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
startOfLastWeek.setHours(0, 0, 0, 0)

// คำนวณวันสุดท้ายของสัปดาห์ที่แล้ว
const endOfLastWeek = new Date(today)
endOfLastWeek.setDate(today.getDate() - today.getDay() - 1)
endOfLastWeek.setHours(23, 59, 59, 999)

return await db.repairVehicle.findMany({ 
    where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfLastWeek, lte: endOfLastWeek } } 
})
}

export async function getRepairVehicleLastDay(tenantId: string) {
const today = new Date()
// ตั้งเวลาเริ่มต้นของเมื่อวาน
const startOfYesterday = new Date(today)
startOfYesterday.setDate(today.getDate() - 1)
startOfYesterday.setHours(0, 0, 0, 0)

// ตั้งเวลาสิ้นสุดของเมื่อวาน
const endOfYesterday = new Date(today)
endOfYesterday.setDate(today.getDate() - 1)
endOfYesterday.setHours(23, 59, 59, 999)

return await db.repairVehicle.findMany({ 
    where: { Status: 'active', Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfYesterday, lte: endOfYesterday } } 
})
}


interface MonthlyData {
    month: number;
    total: string | number;
}
export async function getMonthlyIncomeForYear(tenantId: string, year: number) {
    const monthlyData = await db.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "DateTime") as month,
        SUM("AmountReceive") as total
      FROM "IncomeVehicle"
      WHERE "Status" = 'active' AND EXTRACT(YEAR FROM "DateTime") = ${year} AND "TenantId" = ${tenantId}
      GROUP BY EXTRACT(MONTH FROM "DateTime")
      ORDER BY month
    `;
  
    // สร้างอาเรย์ 12 เดือน เริ่มต้นด้วยค่า 0
    const monthlyIncome = Array<number>(12).fill(0);
    
    // นำข้อมูลจาก DB มาใส่ในตำแหน่งที่ถูกต้อง
    (monthlyData as MonthlyData[]).forEach((data) => {
      monthlyIncome[data.month - 1] = Number(data.total);
    });
  
    return monthlyIncome;
}

interface WeeklyData {
  week_number: number;  // เปลี่ยนจาก week เป็น week_number ให้ตรงกับ SQL query
  total: string | number;
}
export async function getWeeklyIncomeForMonth(tenantId: string, year: number, month: number) {
  const weeklyData = await db.$queryRaw`
    WITH WeeklyRanges AS (
      SELECT 
        date_trunc('week', "DateTime") as week_start,
        SUM("AmountReceive") as total
      FROM "IncomeVehicle"
      WHERE
        "Status" = 'active'
        AND EXTRACT(YEAR FROM "DateTime") = ${year}
        AND EXTRACT(MONTH FROM "DateTime") = ${month}
        AND "TenantId" = ${tenantId}
      GROUP BY date_trunc('week', "DateTime")
      ORDER BY week_start
    )
    SELECT 
      EXTRACT(DAY FROM week_start)::integer as week_number,
      total
    FROM WeeklyRanges
  `;

  // สร้างอาเรย์สำหรับสัปดาห์ในเดือน (สูงสุด 5 สัปดาห์)
  const weeklyIncome = Array<number>(5).fill(0);
  
  (weeklyData as WeeklyData[]).forEach((data) => {
    // คำนวณสัปดาห์ที่ของเดือนจาก day
    const weekIndex = Math.min(Math.max(Math.floor((data.week_number - 1) / 7), 0), 4);
    weeklyIncome[weekIndex] += Number(data.total);
  });

  return weeklyIncome;
}

interface DailyData {
  day_of_week: number;
  total: string | number;
}
export async function getDailyIncomeForWeek(tenantId: string, year: number, week: number) {
  const dailyData = await db.$queryRaw`
    WITH WeekDays AS (
      SELECT 
        EXTRACT(DOW FROM "DateTime") as day_of_week,
        SUM("AmountReceive") as total
      FROM "IncomeVehicle"
      WHERE 
        "Status" = 'active'
        AND date_trunc('week', "DateTime") = date_trunc('week',
          to_date(${year.toString()} || '-01-01', 'YYYY-MM-DD') + ((${week - 1})::integer || ' weeks')::interval
        ) AND "TenantId" = ${tenantId}
      GROUP BY EXTRACT(DOW FROM "DateTime")
      ORDER BY day_of_week
    )
    SELECT * FROM WeekDays
  `;

  // สร้างอาเรย์ 7 วัน เริ่มต้นด้วยค่า 0
  const dailyIncome = Array<number>(7).fill(0);

  (dailyData as DailyData[]).forEach((data) => {
    dailyIncome[data.day_of_week] = Number(data.total);
  });

  return dailyIncome;
}

export async function getIncomeVehicleFromDateRange(tenantId: string, start: Date, end: Date) {
  return await db.incomeVehicle.findMany({
    where: { Status: 'active', TenantId: tenantId, DateTime: { gte: start, lte: end } },
    include: {
      Vehicle: true
    }
  })
}

export async function getGasolineCostFromDateRange(tenantId: string, start: Date, end: Date) {
  return await db.gasolineCost.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, DateTime: { gte: start, lte: end } },
    include: {
      Vehicle: true
    }
  })
}

export async function getRepairVehicleFromDateRange(tenantId: string, start: Date, end: Date) {
  return await db.repairVehicle.findMany({ where: { Status: 'active', Vehicle: { TenantId: tenantId }, RepairDate: { gte: start, lte: end } },
    include: {
      Vehicle: true
    }
  })
}

// ต้นทุนเต็มทุกหมวดในช่วงเวลา [start, end] แต่ละหมวด filter ตาม field วันที่ของตัวเอง
// (สอดคล้องกับ /summary/expense ในหน้า report)
export interface CostBreakdown {
  fuel: number
  repair: number
  tax: number
  compulsory: number
  insurance: number
  installment: number
  total: number
}

export async function getCostBreakdown(tenantId: string, start: Date, end: Date): Promise<CostBreakdown> {
  // Scope = ทุกคันของ tenant (ไม่กรอง Vehicle.Status) โดยตั้งใจ: ต้นทุนที่เกิดจริงในช่วงเวลา
  // รวมรถที่ถูก soft-delete ไปแล้วด้วย เพื่อให้ตรงกับหน้า report (getExpenseSummaryService).
  // ต่างจาก getFleetSummary ที่นับเฉพาะ active = "กองรถปัจจุบัน" คนละความหมายโดยตั้งใจ.
  const ofTenant = { Vehicle: { TenantId: tenantId } }
  const [gas, repair, tax, comp, ins, inst] = await Promise.all([
    db.gasolineCost.findMany({ where: { Status: 'active', ...ofTenant, DateTime: { gte: start, lte: end } } }),
    db.repairVehicle.findMany({ where: { Status: 'active', ...ofTenant, RepairDate: { gte: start, lte: end } } }),
    db.tax.findMany({ where: { Status: 'active', ...ofTenant, EndDate: { gte: start, lte: end } } }),
    db.compulsoryMotorInsuranceVehicle.findMany({ where: { Status: 'active', ...ofTenant, EndDate: { gte: start, lte: end } } }),
    db.insurancePolicyVehicle.findMany({ where: { Status: 'active', ...ofTenant, EndDate: { gte: start, lte: end } } }),
    // ต้นทุนค่างวด = เฉพาะงวดที่จ่ายจริงในช่วงเวลา (DatePay) — งวดค้างในอนาคต (DatePay=null)
    // ที่ generate ไว้สำหรับ AR ต้องไม่ถูกนับเป็นต้นทุน. DatePay:{gte,lte} ตัด null อัตโนมัติ.
    db.installmentsVehicle.findMany({ where: { Status: 'active', ...ofTenant, DatePay: { gte: start, lte: end } } }),
  ])
  const fuel = gas.reduce((s, x) => s + x.Amount.toNumber(), 0)
  const repairTotal = repair.reduce((s, x) => s + x.CompanyPay.toNumber(), 0)
  const taxTotal = tax.reduce((s, x) => s + x.TotalPremium.toNumber(), 0)
  const compTotal = comp.reduce((s, x) => s + x.TotalPremium.toNumber(), 0)
  const insTotal = ins.reduce((s, x) => s + x.TotalPremium.toNumber(), 0)
  const instTotal = inst.reduce((s, x) => s + x.Amount.toNumber(), 0)
  const total = fuel + repairTotal + taxTotal + compTotal + insTotal + instTotal
  return { fuel, repair: repairTotal, tax: taxTotal, compulsory: compTotal, insurance: insTotal, installment: instTotal, total }
}

export interface FleetSummary {
  total: number
  byType: { name: string; count: number }[]
  expiringTax: number
  expiringCompulsory: number
  expiringInsurance: number
}

// สรุปกองรถ + จำนวนที่ภาษี/พรบ./ประกัน ใกล้หมดอายุภายใน 30 วัน (นับจาก policy ล่าสุดของแต่ละคัน)
export async function getFleetSummary(tenantId: string): Promise<FleetSummary> {
  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const vehicles = await db.vehicle.findMany({
    where: { TenantId: tenantId, Status: 'active' },
    include: {
      VehicleType: true,
      Tax: { where: { Status: 'active' }, orderBy: { EndDate: 'desc' }, take: 1 },
      CompulsoryMotorInsuranceVehicle: { where: { Status: 'active' }, orderBy: { EndDate: 'desc' }, take: 1 },
      InsurancePolicyVehicle: { where: { Status: 'active' }, orderBy: { EndDate: 'desc' }, take: 1 },
    }
  })
  const within = (d?: Date | null): boolean => d != null && d >= now && d <= in30
  const typeMap = new Map<string, number>()
  let expiringTax = 0, expiringCompulsory = 0, expiringInsurance = 0
  for (const v of vehicles) {
    const t = v.VehicleType?.Name || 'ไม่ระบุ'
    typeMap.set(t, (typeMap.get(t) || 0) + 1)
    if (within(v.Tax[0]?.EndDate)) expiringTax++
    if (within(v.CompulsoryMotorInsuranceVehicle[0]?.EndDate)) expiringCompulsory++
    if (within(v.InsurancePolicyVehicle[0]?.EndDate)) expiringInsurance++
  }
  const byType = Array.from(typeMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  return { total: vehicles.length, byType, expiringTax, expiringCompulsory, expiringInsurance }
}

// สรุปสถานะค่างวด (AR) ของทั้งกองรถ: ครบกำหนดสัปดาห์นี้ / เกินกำหนด / รับชำระเดือนนี้ /
// อัตราเก็บเงินของเดือน / aging ของยอดค้าง + รายการที่ยังไม่ชำระ (due + overdue)
// สถานะการชำระเป็นค่า derived จาก DueDate + DatePay (DB.Status เป็นแค่ flag soft-delete)
export interface InstallmentArItem {
  uuid: string
  vehicleId: string
  vehicleNo: number | null
  licensePlate: string
  installmentNumber: number
  dueDate: Date
  amount: number
  status: 'due' | 'overdue'
  daysOverdue: number
}

export interface InstallmentArSummary {
  dueThisWeek: { count: number; amount: number }
  overdue: { count: number; amount: number }
  paidThisMonth: { count: number; amount: number }
  collectionRate: number | null
  aging: { notYetDue: number; d1_30: number; d31_60: number; d61_90: number; d90plus: number }
  items: InstallmentArItem[]
}

export async function getInstallmentsArService(tenantId: string): Promise<InstallmentArSummary> {
  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + (6 - now.getDay())); endOfWeek.setHours(23, 59, 59, 999)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const dayMs = 24 * 60 * 60 * 1000

  const installments = await db.installmentsVehicle.findMany({
    where: { Status: 'active', Vehicle: { TenantId: tenantId } },
    include: { Vehicle: true },
    orderBy: { DueDate: 'asc' },
  })

  const plate = (v: { LicensePlatePrefix: string; LicensePlateSuffix: string; LicensePlateProvince: string } | null): string =>
    v ? `${v.LicensePlatePrefix}${v.LicensePlateSuffix} ${v.LicensePlateProvince}`.trim() : ''

  const dueThisWeek = { count: 0, amount: 0 }
  const overdue = { count: 0, amount: 0 }
  const paidThisMonth = { count: 0, amount: 0 }
  let dueThisMonthAmount = 0
  let dueThisMonthPaidAmount = 0
  const aging = { notYetDue: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 }
  const items: InstallmentArItem[] = []

  for (const inst of installments) {
    const amount = inst.Amount.toNumber()
    const due = inst.DueDate
    const paid = inst.DatePay != null

    // ตัวหารของ collection rate = ยอดที่ครบกำหนดในเดือนนี้ (นับทั้งจ่ายแล้ว/ยังไม่จ่าย)
    if (due >= startOfMonth && due <= endOfMonth) {
      dueThisMonthAmount += amount
      if (paid) dueThisMonthPaidAmount += amount
    }

    if (paid) {
      const datePay = inst.DatePay as Date
      if (datePay >= startOfMonth && datePay <= endOfMonth) {
        paidThisMonth.count++
        paidThisMonth.amount += amount
      }
      continue
    }

    // ยังไม่ชำระ
    if (due < today) {
      overdue.count++
      overdue.amount += amount
      const days = Math.floor((today.getTime() - due.getTime()) / dayMs)
      if (days <= 30) aging.d1_30 += amount
      else if (days <= 60) aging.d31_60 += amount
      else if (days <= 90) aging.d61_90 += amount
      else aging.d90plus += amount
      items.push({ uuid: inst.InstallmentsVehicleId, vehicleId: inst.VehicleId, vehicleNo: inst.Vehicle?.No ?? null, licensePlate: plate(inst.Vehicle), installmentNumber: inst.InstallmentNumber, dueDate: due, amount, status: 'overdue', daysOverdue: days })
    } else {
      aging.notYetDue += amount
      if (due <= endOfWeek) {
        dueThisWeek.count++
        dueThisWeek.amount += amount
      }
      items.push({ uuid: inst.InstallmentsVehicleId, vehicleId: inst.VehicleId, vehicleNo: inst.Vehicle?.No ?? null, licensePlate: plate(inst.Vehicle), installmentNumber: inst.InstallmentNumber, dueDate: due, amount, status: 'due', daysOverdue: 0 })
    }
  }

  const collectionRate = dueThisMonthAmount === 0 ? null : (dueThisMonthPaidAmount / dueThisMonthAmount) * 100

  // เกินกำหนดก่อน (เร่งสุด เรียงค้างนานสุดขึ้นก่อน) แล้วตามด้วยใกล้ครบกำหนด
  items.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'overdue' ? -1 : 1
    if (a.status === 'overdue') return b.daysOverdue - a.daysOverdue
    return a.dueDate.getTime() - b.dueDate.getTime()
  })

  return { dueThisWeek, overdue, paidThisMonth, collectionRate, aging, items }
}
