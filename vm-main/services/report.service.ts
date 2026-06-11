import type { WrapResponse } from "../types/utils";
import { wrapResponse } from "../types/utils";
import { errorWrapper, getDomain } from "../helpers/helper";
import Cookies from 'js-cookie';
import dayjs from 'dayjs';

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

export interface FuelSummaryRow {
  id: number;
  vehicleId: string;
  licensePlate: string;
  vehicleType: string;
  driverName: string;
  fuelType: string;
  totalLiters: number;
  totalCost: number;
  averageCostPerLiter: number;
  totalDistance: number;
  fuelEfficiency: number;
  lastFuelDate: string;
  status: string;
}

export interface FuelDetailRow {
  id: string;
  vehicleId: string;
  licensePlate: string;
  vehicleType: string;
  driverName: string;
  date: string;
  item: string;
  taxInvoiceNumber: string;
  liters: number;
  amount: number;
  odometerStart: number;
  odometerEnd: number;
  distance: number;
}

export interface IncomeSummaryRow {
  id: number;
  vehicleId: string;
  licensePlate: string;
  vehicleType: string;
  driverName: string;
  totalIncome: number;
  totalTrips: number;
  averageIncome: number;
  lastTripDate: string;
  status: string;
}

export interface ExpenseSummaryRow {
  id: number;
  vehicleId: string;
  licensePlate: string;
  vehicleType: string;
  driverName: string;
  fuelCost: number;
  repairCost: number;
  repairInsurancePay: number;
  taxCost: number;
  compulsoryCost: number;
  insuranceCost: number;
  installmentCost: number;
  totalCost: number;
  income: number;
  profit: number;
}

interface SummaryEnvelope<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

async function fetchSummary<T>(path: string, startDate: Date | null, endDate: Date | null): Promise<WrapResponse<SummaryEnvelope<T> | null>> {
  try {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) return wrapResponse({ status: 401, message: 'Unauthorized' });
    const domain = getDomain();
    if (!domain) return wrapResponse({ status: 401, message: 'Unauthorized' });

    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('startDate', dayjs(startDate).format('YYYY-MM-DD'));
      params.set('endDate', dayjs(endDate).format('YYYY-MM-DD'));
    }
    const qs = params.toString();
    const response = await fetch(`${urlApi}${path}${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-domain': domain,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return await wrapResponse<SummaryEnvelope<T>>(response);
  } catch (error: unknown) {
    return wrapResponse({ status: 500, message: errorWrapper(error, `fetchSummary ${path}`) });
  }
}

export function getFuelSummary(startDate: Date | null, endDate: Date | null): Promise<WrapResponse<SummaryEnvelope<FuelSummaryRow[]> | null>> {
  return fetchSummary<FuelSummaryRow[]>('/summary/fuel', startDate, endDate);
}

export function getIncomeSummary(startDate: Date | null, endDate: Date | null): Promise<WrapResponse<SummaryEnvelope<IncomeSummaryRow[]> | null>> {
  return fetchSummary<IncomeSummaryRow[]>('/summary/income', startDate, endDate);
}

export function getFuelDetail(startDate: Date | null, endDate: Date | null): Promise<WrapResponse<SummaryEnvelope<FuelDetailRow[]> | null>> {
  return fetchSummary<FuelDetailRow[]>('/summary/fuel-detail', startDate, endDate);
}

export function getExpenseSummary(startDate: Date | null, endDate: Date | null): Promise<WrapResponse<SummaryEnvelope<ExpenseSummaryRow[]> | null>> {
  return fetchSummary<ExpenseSummaryRow[]>('/summary/expense', startDate, endDate);
}
