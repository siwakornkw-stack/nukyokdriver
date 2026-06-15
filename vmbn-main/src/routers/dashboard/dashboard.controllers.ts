import { Response, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import { getDailyIncomeForWeek, getGasolineCostFromDateRange, getIncomeVehicleFromDateRange, getIncomeVehicleLastDay, getIncomeVehicleLastMonth, getIncomeVehicleLastWeek, getIncomeVehicleLastYear, getIncomeVehicleThisDay, getIncomeVehicleThisMonth, getIncomeVehicleThisWeek, getIncomeVehicleThisYear, getMonthlyIncomeForYear, getRepairVehicleFromDateRange, getWeeklyIncomeForMonth, getCostBreakdown, getFleetSummary, getInstallmentsArService } from './dashboard.services'

export async function getDashboardController(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const tenantId = parsedToken.tenantId
    const income = await getIncomeVehicleThisMonth(tenantId)
    const incomeWeek = await getIncomeVehicleThisWeek(tenantId)
    const incomeDay = await getIncomeVehicleThisDay(tenantId)
    const incomeYear = await getIncomeVehicleThisYear(tenantId)

    const incomeLastMonth = await getIncomeVehicleLastMonth(tenantId)
    const incomeLastWeek = await getIncomeVehicleLastWeek(tenantId)
    const incomeLastDay = await getIncomeVehicleLastDay(tenantId)
    const incomeLastYear = await getIncomeVehicleLastYear(tenantId)

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? lastYear : currentYear;
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const currentWeek = Math.ceil(((currentDate.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const lastWeek = currentWeek - 1;

    const currentYearData = await getMonthlyIncomeForYear(tenantId, currentYear);
    const lastYearData = await getMonthlyIncomeForYear(tenantId, lastYear);
    const currentMonthData = await getWeeklyIncomeForMonth(tenantId, currentYear, currentMonth);
    const lastMonthData = await getWeeklyIncomeForMonth(tenantId, lastMonthYear, lastMonth);
    const currentWeekData = await getDailyIncomeForWeek(tenantId, currentYear, currentWeek);
    const lastWeekData = await getDailyIncomeForWeek(tenantId, currentYear, lastWeek);

    // ขอบเขตวันที่ของแต่ละช่วง (ใช้กับ getCostBreakdown ที่รวมต้นทุนทุกหมวด)
    const now = new Date()
    const eod = (d: Date): Date => { d.setHours(23, 59, 59, 999); return d }
    const sow = (offsetWeeks: number): Date => { const d = new Date(now); d.setDate(now.getDate() - now.getDay() + offsetWeeks * 7); d.setHours(0, 0, 0, 0); return d }
    const eow = (offsetWeeks: number): Date => eod(new Date(sow(offsetWeeks).getTime() + 6 * 86400000))
    const bounds = {
      year: [new Date(currentYear, 0, 1), eod(new Date(currentYear, 11, 31))] as const,
      lastYear: [new Date(lastYear, 0, 1), eod(new Date(lastYear, 11, 31))] as const,
      month: [new Date(now.getFullYear(), now.getMonth(), 1), eod(new Date(now.getFullYear(), now.getMonth() + 1, 0))] as const,
      lastMonth: [new Date(now.getFullYear(), now.getMonth() - 1, 1), eod(new Date(now.getFullYear(), now.getMonth(), 0))] as const,
      week: [sow(0), eow(0)] as const,
      lastWeek: [sow(-1), eow(-1)] as const,
      day: [(() => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d })(), eod(new Date(now))] as const,
      lastDay: [(() => { const d = new Date(now); d.setDate(now.getDate() - 1); d.setHours(0, 0, 0, 0); return d })(), eod((() => { const d = new Date(now); d.setDate(now.getDate() - 1); return d })())] as const,
    }

    const [cbYear, cbMonth, cbWeek, cbDay, cbLastYear, cbLastMonth, cbLastWeek, cbLastDay, fleetSummary] = await Promise.all([
      getCostBreakdown(tenantId, bounds.year[0], bounds.year[1]),
      getCostBreakdown(tenantId, bounds.month[0], bounds.month[1]),
      getCostBreakdown(tenantId, bounds.week[0], bounds.week[1]),
      getCostBreakdown(tenantId, bounds.day[0], bounds.day[1]),
      getCostBreakdown(tenantId, bounds.lastYear[0], bounds.lastYear[1]),
      getCostBreakdown(tenantId, bounds.lastMonth[0], bounds.lastMonth[1]),
      getCostBreakdown(tenantId, bounds.lastWeek[0], bounds.lastWeek[1]),
      getCostBreakdown(tenantId, bounds.lastDay[0], bounds.lastDay[1]),
      getFleetSummary(tenantId),
    ])

    const outgoings = cbMonth.total
    const outgoingsYear = cbYear.total
    const outgoingsWeek = cbWeek.total
    const outgoingsDay = cbDay.total

    const outgoingsLastMonth = cbLastMonth.total
    const outgoingsLastYear = cbLastYear.total
    const outgoingsLastWeek = cbLastWeek.total
    const outgoingsLastDay = cbLastDay.total

    // Percent change magnitude vs previous period: |current - base| / base.
    // Divide by the base (previous), not the current value. Direction is conveyed
    // by the separate *Trend field, so return the absolute magnitude here.
    // base === 0 -> 100% if grew from nothing, 0% if both zero.
    const pctChange = (cur: number, prev: number): number =>
      prev === 0 ? (cur === 0 ? 0 : 100) : Math.abs((cur - prev) / prev) * 100

    const outgoingsDiff = pctChange(outgoings, outgoingsLastMonth)
    const outgoingsYearDiff = pctChange(outgoingsYear, outgoingsLastYear)
    const outgoingsWeekDiff = pctChange(outgoingsWeek, outgoingsLastWeek)
    const outgoingsDayDiff = pctChange(outgoingsDay, outgoingsLastDay)

    const incomeTotal = income.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeWeekTotal = incomeWeek.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeDayTotal = incomeDay.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeYearTotal = incomeYear.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)

    const incomeLastYearTotal = incomeLastYear.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeLastMonthTotal = incomeLastMonth.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeLastWeekTotal = incomeLastWeek.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeLastDayTotal = incomeLastDay.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)

    const incomeDiff = pctChange(incomeTotal, incomeLastMonthTotal)
    const incomeWeekDiff = pctChange(incomeWeekTotal, incomeLastWeekTotal)
    const incomeDayDiff = pctChange(incomeDayTotal, incomeLastDayTotal)
    const incomeYearDiff = pctChange(incomeYearTotal, incomeLastYearTotal)

    const incomePercentage = outgoings === 0 ? 100 : (incomeTotal / outgoings) * 100
    const incomeWeekPercentage = outgoingsWeek === 0 ? 100 : (incomeWeekTotal / outgoingsWeek) * 100
    const incomeDayPercentage = outgoingsDay === 0 ? 100 : (incomeDayTotal / outgoingsDay) * 100
    const incomeYearPercentage = outgoingsYear === 0 ? 100 : (incomeYearTotal / outgoingsYear) * 100
    const profit = incomeTotal - outgoings
    const profitWeek = incomeWeekTotal - outgoingsWeek
    const profitDay = incomeDayTotal - outgoingsDay
    const profitYear = incomeYearTotal - outgoingsYear

    const response = {
      outgoingsDiff: outgoingsDiff.toFixed(0),
      outgoingsWeekDiff: outgoingsWeekDiff.toFixed(0),
      outgoingsDayDiff: outgoingsDayDiff.toFixed(0),
      outgoingsYearDiff: outgoingsYearDiff.toFixed(0),
      outgoingsTrend: outgoings > outgoingsLastMonth ? 'up' : 'down',
      outgoingsWeekTrend: outgoingsWeek > outgoingsLastWeek ? 'up' : 'down',
      outgoingsDayTrend: outgoingsDay > outgoingsLastDay ? 'up' : 'down',
      outgoingsYearTrend: outgoingsYear > outgoingsLastYear ? 'up' : 'down',
      outgoingsWeek,
      outgoingsDay,
      outgoingsYear,
      incomeDiff: incomeDiff.toFixed(0),
      incomeWeekDiff: incomeWeekDiff.toFixed(0),
      incomeDayDiff: incomeDayDiff.toFixed(0),
      incomeYearDiff: incomeYearDiff.toFixed(0),
      incomeTrend: incomeTotal > incomeLastMonthTotal ? 'up' : 'down',
      incomeWeekTrend: incomeWeekTotal > incomeLastWeekTotal ? 'up' : 'down',
      incomeDayTrend: incomeDayTotal > incomeLastDayTotal ? 'up' : 'down',
      incomeYearTrend: incomeYearTotal > incomeLastYearTotal ? 'up' : 'down',
      income: incomeTotal,
      incomeWeek: incomeWeekTotal,
      incomeDay: incomeDayTotal,
      incomeYear: incomeYearTotal,
      incomePercentage: incomePercentage.toFixed(0),
      incomeWeekPercentage: incomeWeekPercentage.toFixed(0),
      incomeDayPercentage: incomeDayPercentage.toFixed(0),
      incomeYearPercentage: incomeYearPercentage.toFixed(0),
      profit,
      profitWeek,
      profitDay,
      profitYear,
      costBreakdown: cbMonth,
      costBreakdownWeek: cbWeek,
      costBreakdownYear: cbYear,
      fleetSummary,
      graphData: [
        { name: 'ปีนี้', data: currentYearData },
        { name: 'ปีก่อนหน้า', data: lastYearData },
      ],
      graphDataMonth: [
        { name: 'เดือนนี้', data: currentMonthData },
        { name: 'เดือนก่อนหน้า', data: lastMonthData },
      ],
      graphDataWeek: [
        { name: 'สัปดาห์นี้', data: currentWeekData },
        { name: 'สัปดาห์ก่อนหน้า', data: lastWeekData },
      ]
    }
    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}


export async function getInstallmentsAr(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const data = await getInstallmentsArService(parsedToken.tenantId)
    res.json({
      success: true,
      code: 200,
      message: 'success',
      data
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getSummaryFromDateRange(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const tenantId = parsedToken.tenantId
    const { startDate, endDate } = req.body
    
    // ตรวจสอบความถูกต้องของวันที่
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุด'
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'รูปแบบวันที่ไม่ถูกต้อง'
      })
    }

    end.setHours(23, 59, 59, 999)

    const income = await getIncomeVehicleFromDateRange(tenantId, start, end)
    const gasolineCost = await getGasolineCostFromDateRange(tenantId, start, end)
    const repairCost = await getRepairVehicleFromDateRange(tenantId, start, end)
    const outgoings =
      gasolineCost.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0) +
      repairCost.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const totalIncome = income.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const profit = totalIncome - outgoings

    const vehicleSummary = new Map()
    const entry = (item: { VehicleId: string; Vehicle: any }) => {
      let cur = vehicleSummary.get(item.VehicleId)
      if (!cur) {
        cur = {
          no: item.Vehicle.No,
          license: item.Vehicle.LicensePlatePrefix + item.Vehicle.LicensePlateSuffix + ' ' + item.Vehicle.LicensePlateProvince,
          income: 0,
          outgoings: 0
        }
        vehicleSummary.set(item.VehicleId, cur)
      }
      return cur
    }

    // Per-vehicle breakdown for linked income; unlinked income (VehicleId null) is
    // grouped separately below so the rows still sum to totalIncome.
    income.forEach(item => { if (item.VehicleId && item.Vehicle) entry({ VehicleId: item.VehicleId, Vehicle: item.Vehicle }).income += item.AmountReceive.toNumber() })
    gasolineCost.forEach(item => { entry(item).outgoings += item.Amount.toNumber() })
    repairCost.forEach(item => { entry(item).outgoings += item.CompanyPay.toNumber() })

    // Unlinked income: income rows whose ทะเบียน matched no vehicle in the fleet
    // (often an import that couldn't link). Group by SourceLabel so they show as
    // their own rows — this is where "the file is wrong" surfaces.
    const unlinked = new Map<string, number>()
    income.forEach(item => {
      if (!item.VehicleId) {
        const key = item.SourceLabel || '(ไม่มีทะเบียน)'
        unlinked.set(key, (unlinked.get(key) || 0) + item.AmountReceive.toNumber())
      }
    })
    const unlinkedRows = Array.from(unlinked.entries()).map(([label, inc]) => ({
      no: '', license: label, income: inc, outgoings: 0, unlinked: true,
    }))

    const response = {
      income: totalIncome,
      outgoings: outgoings,
      profit: profit,
      vehicleSummary: [...Array.from(vehicleSummary.values()), ...unlinkedRows]
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}