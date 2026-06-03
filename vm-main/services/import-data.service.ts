import Cookies from 'js-cookie';
import { getDomain } from '../helpers/helper';

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

export interface ImportSheetResult {
  sheet: string;
  type: string;
  created: number;
  updated: number;
  sub: number;
  skipped: number;
  errors: string[];
}

export interface ImportResponse {
  success: boolean;
  message?: string;
  fileName?: string;
  results?: ImportSheetResult[];
}

export type AiStatus = 'ok' | 'quota' | 'unavailable' | 'no_key' | 'error';

export interface AiProviderHealth {
  name: string;
  status: AiStatus;
  httpCode?: number;
}

export interface AiStatusResponse {
  success: boolean;
  status: AiStatus;
  message: string;
  providers?: AiProviderHealth[];
}

export async function checkAiStatus(): Promise<AiStatusResponse> {
  const res = await fetch(`${urlApi}/import/ai-status`, {
    headers: {
      'x-domain': getDomain(),
      Authorization: `Bearer ${Cookies.get('access_token') ?? ''}`,
    },
  });
  return res.json();
}

export async function importAuto(file: File): Promise<ImportResponse> {
  const form = new FormData();
  form.append('file', file);
  // Note: do NOT set Content-Type — the browser adds the multipart boundary.
  const res = await fetch(`${urlApi}/import/auto`, {
    method: 'POST',
    headers: {
      'x-domain': getDomain(),
      Authorization: `Bearer ${Cookies.get('access_token') ?? ''}`,
    },
    body: form,
  });
  return res.json();
}
