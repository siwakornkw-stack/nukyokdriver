export type DashboardResponse = {
  code: number;
  message: string;
  data: DashboardData;
}

export type DashboardData = {
  outgoingsDiff: number;
  outgoingsWeekDiff: number;
  outgoingsDayDiff: number;
  outgoingsYearDiff: number;
  outgoingsTrend: 'up' | 'down';
  outgoingsWeekTrend: 'up' | 'down';
  outgoingsDayTrend: 'up' | 'down';
  outgoingsYearTrend: 'up' | 'down';
  outgoings: number;
  outgoingsWeek: number;
  outgoingsDay: number;
  outgoingsYear: number;
  incomeDiff: number;
  incomeWeekDiff: number;
  incomeDayDiff: number;
  incomeYearDiff: number;
  incomeTrend: 'up' | 'down';
  incomeWeekTrend: 'up' | 'down';
  incomeDayTrend: 'up' | 'down';
  incomeYearTrend: 'up' | 'down';
  income: number;
  incomeWeek: number;
  incomeDay: number;
  incomeYear: number;
  incomePercentage: number;
  incomeWeekPercentage: number;
  incomeDayPercentage: number;
  incomeYearPercentage: number;
  profit: number;
  profitWeek: number;
  profitDay: number;
  profitYear: number;
  graphData: [
    { name: string; data: number[] }
  ]
  graphDataMonth: [
    { name: string; data: number[] }
  ]
  graphDataWeek: [
    { name: string; data: number[] }
  ]
}

export type SummaryResponse = {
  code: number;
  message: string;
  data: SummaryData;
}

export type SummaryData = {
  income: number;
  outgoings: number;
  profit: number;
  vehicleSummary: VehicleSummary[];
}

export type VehicleSummary = {
  no: string;
  license: string;
  income: number;
  outgoings: number;
  unlinked?: boolean;
}