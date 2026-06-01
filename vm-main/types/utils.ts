
export function getResponseData<T>(wrap: WrapResponse<T>): T | null {
	return (wrap.ok && wrap.data) ? wrap.data : null;
}

export async function wrapResponse<T>(resp: Response | Omit<WrapResponse<T>, 'ok'>): Promise<WrapResponse<T>> {
	if (resp instanceof Response) {

		const data: T | ApiResponse = await resp.json();

		const result: WrapResponse<T> = {
			ok: resp.ok,
			status: resp.status,
			message: data ? (data as ApiResponse).message : resp.statusText
		};

		if ((data as ApiResponse).errors || (data as ApiResponse).error) {
			result.code = (data as ApiResponse).code;
			result.message = (data as ApiResponse).error ?? (data as ApiResponse).message;
			// result.errors = (data as ApiResponse).errors;
		} else if (data as T) {
			result.data = (data as T);
		}

		return result;
	}

	const result: WrapResponse<T> = {
		ok: (resp.status === 200),
		status: resp.status,
		message: resp.message
	};

	if (resp.data) {
		const data: T | ApiResponse = resp.data;

		if ((data as ApiResponse).errors) {
			result.code = (data as ApiResponse).code;
			result.message = (data as ApiResponse).message;
			// result.errors = (data as ApiResponse).errors;
		} else if (data as T) {
			result.data = (data as T);
		}
	}

	return result;
}

type ApiResponseErrors = { [key: string]: string[] };

export interface ApiResponse {
	success?: boolean;
	data?: any;
	code?: number;
	message?: string;
	error?: string;
	errors?: ApiResponseErrors;
}

export interface WrapResponse<T> {
	ok: boolean;
	code?: number;
	status?: number;
	message?: string;
	data?: T;
	errors?: ApiResponseErrors;
}

export interface ApiResponseLinks {
	first: string;
	last: string;
	prev: string | null;
	next: string | null;
}

export interface ApiResponseMeta {
	current_page: number;
	from: number;
	last_page: number;
	links: {
		url?: string;
		label: string;
		active: boolean;
	}[];
	path: string;
	per_page: number;
	to: number;
	total: number;
}
