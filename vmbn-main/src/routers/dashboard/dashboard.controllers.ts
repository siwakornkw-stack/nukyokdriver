import { Response, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import { getDailyIncomeForWeek, getGasolineCostFromDateRange, getGasolineCostLastYear, getGasolineCostThisDay, getGasolineCostThisMonth, getGasolineCostThisWeek, getGasolineCostThisYear, getIncomeVehicle, getIncomeVehicleFromDateRange, getIncomeVehicleLastDay, getIncomeVehicleLastMonth, getIncomeVehicleLastWeek, getIncomeVehicleLastYear, getIncomeVehicleThisDay, getIncomeVehicleThisMonth, getIncomeVehicleThisWeek, getIncomeVehicleThisYear, getMonthlyIncomeForYear, getRepairVehicleFromDateRange, getOutgoingsLastDay, getOutgoingsLastMonth, getOutgoingsLastWeek, getRepairVehicleLastDay, getRepairVehicleLastMonth, getRepairVehicleLastWeek, getRepairVehicleLastYear, getRepairVehicleThisDay, getRepairVehicleThisMonth, getRepairVehicleThisWeek, getRepairVehicleThisYear, getWeeklyIncomeForMonth } from './dashboard.services'

export async function getDashboardController(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const tenantId = parsedToken.tenantId
    const income = await getIncomeVehicleThisMonth(tenantId)
    const incomeWeek = await getIncomeVehicleThisWeek(tenantId)
    const incomeDay = await getIncomeVehicleThisDay(tenantId)
    const incomeYear = await getIncomeVehicleThisYear(tenantId)

    const gasolineCostYear = await getGasolineCostThisYear(tenantId)
    const gasolineCost = await getGasolineCostThisMonth(tenantId)
    const gasolineCostWeek = await getGasolineCostThisWeek(tenantId)
    const gasolineCostDay = await getGasolineCostThisDay(tenantId)

    const repairVehicleYear = await getRepairVehicleThisYear(tenantId)
    const repairVehicle = await getRepairVehicleThisMonth(tenantId)
    const repairVehicleWeek = await getRepairVehicleThisWeek(tenantId)
    const repairVehicleDay = await getRepairVehicleThisDay(tenantId)

    const incomeLastMonth = await getIncomeVehicleLastMonth(tenantId)
    const incomeLastWeek = await getIncomeVehicleLastWeek(tenantId)
    const incomeLastDay = await getIncomeVehicleLastDay(tenantId)
    const incomeLastYear = await getIncomeVehicleLastYear(tenantId)

    const gasolineCostLastYear = await getGasolineCostLastYear(tenantId)
    const gasolineCostLastMonth = await getOutgoingsLastMonth(tenantId)
    const gasolineCostLastWeek = await getOutgoingsLastWeek(tenantId)
    const gasolineCostLastDay = await getOutgoingsLastDay(tenantId)

    const repairVehicleLastYear = await getRepairVehicleLastYear(tenantId)
    const repairVehicleLastMonth = await getRepairVehicleLastMonth(tenantId)
    const repairVehicleLastWeek = await getRepairVehicleLastWeek(tenantId)
    const repairVehicleLastDay = await getRepairVehicleLastDay(tenantId)

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
    const lastWeekData = await getDailyIncomeForWeek(tenantId, lastYear, lastWeek);

    const outgoingsGasoline = gasolineCost.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)
    const outgoingsGasolineYear = gasolineCostYear.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)
    const outgoingsGasolineWeek = gasolineCostWeek.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)
    const outgoingsGasolineDay = gasolineCostDay.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)

    const outgoingsRepair = repairVehicle.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const outgoingsRepairYear = repairVehicleYear.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const outgoingsRepairWeek = repairVehicleWeek.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const outgoingsRepairDay = repairVehicleDay.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)

    const outgoings = outgoingsGasoline + outgoingsRepair
    const outgoingsYear = outgoingsGasolineYear + outgoingsRepairYear
    const outgoingsWeek = outgoingsGasolineWeek + outgoingsRepairWeek
    const outgoingsDay = outgoingsGasolineDay + outgoingsRepairDay

    const outgoingsLastMonthGasoline = gasolineCostLastMonth.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)
    const outgoingsLastYearGasoline = gasolineCostLastYear.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)
    const outgoingsLastWeekGasoline = gasolineCostLastWeek.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)
    const outgoingsLastDayGasoline = gasolineCostLastDay.reduce((acc, curr) => acc + curr.Amount.toNumber(), 0)    

    const outgoingsLastMonthRepair = repairVehicleLastMonth.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const outgoingsLastYearRepair = repairVehicleLastYear.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const outgoingsLastWeekRepair = repairVehicleLastWeek.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    const outgoingsLastDayRepair = repairVehicleLastDay.reduce((acc, curr) => acc + curr.CompanyPay.toNumber(), 0)
    
    const outgoingsLastMonth = outgoingsLastMonthGasoline + outgoingsLastMonthRepair
    const outgoingsLastYear = outgoingsLastYearGasoline + outgoingsLastYearRepair
    const outgoingsLastWeek = outgoingsLastWeekGasoline + outgoingsLastWeekRepair
    const outgoingsLastDay = outgoingsLastDayGasoline + outgoingsLastDayRepair

    const outgoingsDiff = outgoings === 0 ? 0 : ((outgoings - outgoingsLastMonth) / outgoings) * 100
    const outgoingsYearDiff = outgoingsYear === 0 ? 0 : ((outgoingsYear - outgoingsLastYear) / outgoingsYear) * 100
    const outgoingsWeekDiff = outgoingsWeek === 0 ? 0 : ((outgoingsWeek - outgoingsLastWeek) / outgoingsWeek) * 100
    const outgoingsDayDiff = outgoingsDay === 0 ? 0 : ((outgoingsDay - outgoingsLastDay) / outgoingsDay) * 100

    const incomeTotal = income.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeWeekTotal = incomeWeek.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeDayTotal = incomeDay.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeYearTotal = incomeYear.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)

    const incomeLastYearTotal = incomeLastYear.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeLastMonthTotal = incomeLastMonth.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeLastWeekTotal = incomeLastWeek.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)
    const incomeLastDayTotal = incomeLastDay.reduce((acc, curr) => acc + curr.AmountReceive.toNumber(), 0)

    const incomeDiff = incomeTotal === 0 ? 0 : ((incomeTotal - incomeLastMonthTotal) / incomeTotal) * 100
    const incomeWeekDiff = incomeWeekTotal === 0 ? 0 : ((incomeWeekTotal - incomeLastWeekTotal) / incomeWeekTotal) * 100
    const incomeDayDiff = incomeDayTotal === 0 ? 0 : ((incomeDayTotal - incomeLastDayTotal) / incomeDayTotal) * 100
    const incomeYearDiff = incomeYearTotal === 0 ? 0 : ((incomeYearTotal - incomeLastYearTotal) / incomeYearTotal) * 100

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

    income.forEach(item => { entry(item).income += item.AmountReceive.toNumber() })
    gasolineCost.forEach(item => { entry(item).outgoings += item.Amount.toNumber() })
    repairCost.forEach(item => { entry(item).outgoings += item.CompanyPay.toNumber() })

    const response = {
      income: totalIncome,
      outgoings: outgoings,
      profit: profit,
      vehicleSummary: Array.from(vehicleSummary.values())
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