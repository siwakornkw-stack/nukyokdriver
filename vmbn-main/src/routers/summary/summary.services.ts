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