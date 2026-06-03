import Cookies from 'js-cookie';
import { getDomain } from '../helpers/helper';

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

export type DataType = 'fuel' | 'repair' | 'accident' | 'oil' | 'installment' | 'income';

export interface DataTypeOption { value: DataType; label: string }
export interface DataRow { id: string; date: string | null; vehicle: string; summary: string }
export interface DataFilter { vehicleId?: string; from?: string; to?: string }

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-domain': getDomain(),
    Authorization: `Bearer ${Cookies.get('access_token') ?? ''}`,
  };
}

export async function getDataTypes(): Promise<DataTypeOption[]> {
  const res = await fetch(`${urlApi}/data-admin/types`, { headers: headers() });
  const json = await res.json();
  return json.types ?? [];
}

export async function listData(type: DataType, filter: DataFilter): Promise<{ rows: DataRow[]; total: number }> {
  const qs = new URLSearchParams();
  if (filter.vehicleId) qs.set('vehicleId', filter.vehicleId);
  if (filter.from) qs.set('from', filter.from);
  if (filter.to) qs.set('to', filter.to);
  const res = await fetch(`${urlApi}/data-admin/${type}?${qs.toString()}`, { headers: headers() });
  const json = await res.json();
  return { rows: json.rows ?? [], total: json.total ?? 0 };
}

export async function previewDelete(type: DataType, body: { ids?: string[]; filter?: DataFilter }): Promise<number> {
  const res = await fetch(`${urlApi}/data-admin/${type}/preview`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  const json = await res.json();
  return json.count ?? 0;
}

export async function deleteData(type: DataType, body: { ids?: string[]; filter?: DataFilter; allowAll?: boolean }): Promise<{ success: boolean; deleted: number; message: string }> {
  const res = await fetch(`${urlApi}/data-admin/${type}/delete`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  return res.json();
}
