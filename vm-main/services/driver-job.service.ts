import Cookies from 'js-cookie';
import { getDomain } from '../helpers/helper';

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-domain': getDomain(),
    Authorization: `Bearer ${Cookies.get('access_token') ?? ''}`,
  };
}

export interface DriverWithLine {
  VehicleDriverId: string;
  Name: string;
  Status: string;
  LineUserId: string | null;
}

export interface DriverJob {
  DriverJobId: string;
  VehicleDriverId: string;
  VehicleNo: string | null;
  Origin: string;
  Destination: string;
  ScheduledAt: string | null;
  Note: string | null;
  Status: string;
  RespondedAt: string | null;
  CreatedAt: string;
  VehicleDriver?: { Name: string };
}

export interface AddJobPayload {
  VehicleDriverId: string;
  VehicleNo?: string;
  Origin: string;
  Destination: string;
  ScheduledAt?: string;
  Note?: string;
}

export async function getDrivers(): Promise<{ success: boolean; data: DriverWithLine[] }> {
  const r = await fetch(`${urlApi}/driver-job/drivers`, { headers: authHeaders() });
  return r.json();
}

export async function setDriverLine(id: string, lineUserId: string): Promise<{ success: boolean; message?: string }> {
  const r = await fetch(`${urlApi}/driver-job/drivers/line/${id}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ lineUserId }),
  });
  return r.json();
}

export async function getJobs(): Promise<{ success: boolean; data: DriverJob[] }> {
  const r = await fetch(`${urlApi}/driver-job`, { headers: authHeaders() });
  return r.json();
}

export async function addJob(payload: AddJobPayload): Promise<{ success: boolean; message?: string; pushed?: boolean }> {
  const r = await fetch(`${urlApi}/driver-job/add`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function cancelJob(id: string): Promise<{ success: boolean; message?: string }> {
  const r = await fetch(`${urlApi}/driver-job/cancel/${id}`, { method: 'POST', headers: authHeaders() });
  return r.json();
}
