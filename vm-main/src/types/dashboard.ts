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
  costBreakdown: CostBreakdown;
  costBreakdownWeek: CostBreakdown;
  costBreakdownYear: CostBreakdown;
  fleetSummary: FleetSummary;
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

export type CostBreakdown = {
  fuel: number;
  repair: number;
  tax: number;
  compulsory: number;
  insurance: number;
  installment: number;
  total: number;
}

export type FleetSummary = {
  total: number;
  byType: { name: string; count: number }[];
  expiringTax: number;
  expiringCompulsory: number;
  expiringInsurance: number;
}

export type InstallmentArResponse = {
  code: number;
  message: string;
  data: InstallmentArSummary;
}

export type InstallmentArItem = {
  uuid: string;
  vehicleId: string;
  vehicleNo: number | null;
  licensePlate: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'due' | 'overdue';
  daysOverdue: number;
}

export type InstallmentArSummary = {
  dueThisWeek: { count: number; amount: number };
  overdue: { count: number; amount: number };
  paidThisMonth: { count: number; amount: number };
  collectionRate: number | null;
  aging: { notYetDue: number; d1_30: number; d31_60: number; d61_90: number; d90plus: number };
  items: InstallmentArItem[];
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