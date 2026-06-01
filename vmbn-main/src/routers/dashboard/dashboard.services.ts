import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'
import type { Customer, Prisma, Vehicle } from '@prisma/client'
import type { CreateVehicleDTO, VehicleModelResponse } from '../../typings/vehicle'
import { create } from 'node:domain'

export async function getIncomeVehicle(tenantId: string) {
    return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId } } })
}

export async function getIncomeVehicleThisYear(tenantId: string) {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const endOfYear = new Date(today.getFullYear(), 11, 31)
    return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfYear, lte: endOfYear } } })
}

export async function getIncomeVehicleThisMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfMonth, lte: endOfMonth } } })
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
  
  return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfWeek, lte: endOfWeek } } })
}

export async function getIncomeVehicleThisDay(tenantId: string) {
  const today = new Date()
  // ตั้งเวลาเริ่มต้นของวัน (00:00:00.000)
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  // ตั้งเวลาสิ้นสุดของวัน (23:59:59.999)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)
  
  return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfDay, lte: endOfDay } } })
}

export async function getGasolineCostThisYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31)
  return await db.gasolineCost.findMany({ 
      where: { 
          Vehicle: { TenantId: tenantId },
          CreatedAt: { 
              gte: startOfYear, 
              lte: endOfYear 
          } 
      } 
  })
}
export async function getGasolineCostThisMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return await db.gasolineCost.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfMonth, lte: endOfMonth } } })
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
      where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfWeek, lte: endOfWeek } } 
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
      where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfDay, lte: endOfDay } } 
  })
}

export async function getGasolineCostLastYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear() - 1, 0, 1)
  const endOfYear = new Date(today.getFullYear() - 1, 11, 31)
  return await db.gasolineCost.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfYear, lte: endOfYear } } })
}


export async function getRepairVehicleThisYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const endOfYear = new Date(today.getFullYear(), 11, 31)
  return await db.repairVehicle.findMany({ 
      where: { 
          Vehicle: { TenantId: tenantId },
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
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return await db.repairVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfMonth, lte: endOfMonth } } })
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
      where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfWeek, lte: endOfWeek } } 
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
      where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfDay, lte: endOfDay } } 
  })
}

export async function getRepairVehicleLastYear(tenantId: string) {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear() - 1, 0, 1)
  const endOfYear = new Date(today.getFullYear() - 1, 11, 31)
  return await db.repairVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfYear, lte: endOfYear } } })
}


export async function getIncomeVehicleLastMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfMonth, lte: endOfMonth } } })
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
      where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfLastWeek, lte: endOfLastWeek } } 
  })
}

export async function getIncomeVehicleLastYear(tenantId: string) {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear() - 1, 0, 1)
    const endOfYear = new Date(today.getFullYear() - 1, 11, 31)
    return await db.incomeVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfYear, lte: endOfYear } } })
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
      where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfYesterday, lte: endOfYesterday } } 
  })
}

export async function getOutgoingsLastMonth(tenantId: string) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    return await db.gasolineCost.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfMonth, lte: endOfMonth } } })
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
      where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfLastWeek, lte: endOfLastWeek } } 
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
      where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: startOfYesterday, lte: endOfYesterday } } 
  })
}

export async function getRepairVehicleLastMonth(tenantId: string) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0)
  return await db.repairVehicle.findMany({ where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfMonth, lte: endOfMonth } } })
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
    where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfLastWeek, lte: endOfLastWeek } } 
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
    where: { Vehicle: { TenantId: tenantId }, ReceiveDate: { gte: startOfYesterday, lte: endOfYesterday } } 
})
}


interface MonthlyData {
    month: number;
    total: string | number;
}
export async function getMonthlyIncomeForYear(tenantId: string, year: number) {
    const monthlyData = await db.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "CreatedAt") as month,
        SUM("AmountReceive") as total
      FROM "IncomeVehicle"
      WHERE EXTRACT(YEAR FROM "CreatedAt") = ${year} AND "VehicleId" IN (SELECT "VehicleId" FROM "Vehicle" WHERE "TenantId" = ${tenantId})
      GROUP BY EXTRACT(MONTH FROM "CreatedAt")
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
        date_trunc('week', "CreatedAt") as week_start,
        SUM("AmountReceive") as total
      FROM "IncomeVehicle"
      WHERE 
        EXTRACT(YEAR FROM "CreatedAt") = ${year} 
        AND EXTRACT(MONTH FROM "CreatedAt") = ${month}
        AND "VehicleId" IN (SELECT "VehicleId" FROM "Vehicle" WHERE "TenantId" = ${tenantId})
      GROUP BY date_trunc('week', "CreatedAt")
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
    const weekIndex = Math.floor((data.week_number - 1) / 7);
    weeklyIncome[weekIndex] = Number(data.total);
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
        EXTRACT(DOW FROM "CreatedAt") as day_of_week,
        SUM("AmountReceive") as total
      FROM "IncomeVehicle"
      WHERE 
        date_trunc('week', "CreatedAt") = date_trunc('week', 
          to_date(${year.toString()} || '-01-01', 'YYYY-MM-DD') + ((${week - 1})::integer || ' weeks')::interval
        ) AND "VehicleId" IN (SELECT "VehicleId" FROM "Vehicle" WHERE "TenantId" = ${tenantId})
      GROUP BY EXTRACT(DOW FROM "CreatedAt")
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
    where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: start, lte: end } },
    include: {
      Vehicle: true
    }
  })
}

export async function getGasolineCostFromDateRange(tenantId: string, start: Date, end: Date) {
  return await db.gasolineCost.findMany({ where: { Vehicle: { TenantId: tenantId }, CreatedAt: { gte: start, lte: end } },
    include: {
      Vehicle: true
    }
  })
}
