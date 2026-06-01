import type { ApiResponse, WrapResponse } from "../types/utils";
import { wrapResponse } from "../types/utils";
import { errorWrapper, getDomain, removeAllCookies } from "../helpers/helper";
import type { LoginRequestData, LoginResponseData, SignUpRequestData, SignUpResponseData } from "../types/auth";
import Cookies from 'js-cookie';
import type { CheckLineResponse, UploadImageUserDTO, UploadImageUserResponse, UserResponse, UserUpdate } from "@/types/user";

function parseExpiration(duration: string): number {
    const value = parseInt(duration.slice(0, -1));
    const unit = duration.slice(-1);
    
    switch(unit) {
        case 'd': return value; // วัน
        case 'h': return value / 24; // ชั่วโมงเป็นวัน
        case 'm': return value / (24 * 60); // นาทีเป็นวัน
        default: return 1; // ค่าเริ่มต้น 1 วัน
    }
}

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

export async function login(data: LoginRequestData): Promise<WrapResponse<LoginResponseData>> {
	try {
        const domain = getDomain();
		const response = await fetch(`${urlApi}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
                'x-domain': domain
			},
			body: JSON.stringify(data)
		});

		const result = await wrapResponse<LoginResponseData>(response);

		if (result.ok && result.data) {			
			try {
				const { access_token, refresh_token, expires_in, customer_id } = result.data.data;
				
				const expires = parseExpiration(expires_in);


				Cookies.set('access_token', access_token, { expires });
				Cookies.set('refresh_token', refresh_token, { expires });
				Cookies.set('customer_id', customer_id, { expires });

				localStorage.setItem('customer_id', customer_id);
				localStorage.setItem('access_token', access_token);
				localStorage.setItem('refresh_token', refresh_token);

				console.log('login', result.data);
			} catch (error) {
				console.error('Error setting cookies:', error);
				localStorage.clear();
				removeAllCookies();
			}
		}

		return result;
	} catch (error: unknown) {
		return wrapResponse({ status: 500, message: errorWrapper(error, 'login') });
	}
}

export async function signUp(data: SignUpRequestData): Promise<WrapResponse<SignUpResponseData>> {
	try {
        const domain = getDomain();
		const response = await fetch(`${urlApi}/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
                'x-domain': domain
			},
			body: JSON.stringify(data)
		});

		const result = await wrapResponse<LoginResponseData>(response);

		if (result.ok && result.data) {			
			try {
				const { access_token, refresh_token, expires_in, customer_id } = result.data.data;
				
				const expires = parseExpiration(expires_in);


				Cookies.set('access_token', access_token, { expires });
				Cookies.set('refresh_token', refresh_token, { expires });
				Cookies.set('customer_id', customer_id, { expires });

				localStorage.setItem('customer_id', customer_id);
				localStorage.setItem('access_token', access_token);
				localStorage.setItem('refresh_token', refresh_token);

				console.log('login', result.data);
			} catch (error) {
				console.error('Error setting cookies:', error);
				localStorage.clear();
				removeAllCookies();
			}
		}

		return result;
	} catch (error: unknown) {
		return wrapResponse({ status: 500, message: errorWrapper(error, 'login') });
	}
}

export async function getUser(): Promise<WrapResponse<UserResponse>> {
	try {
		const accessToken = Cookies.get('access_token');
		console.log('accessToken', accessToken);
		if (!accessToken)
			return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
		console.log('domain', domain);
		if (!domain)
			return wrapResponse({ status: 401, message: 'Unauthorized' });
		
		const response = await fetch(`${urlApi}/users`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
			}
		});

		const result = await wrapResponse<UserResponse>(response);

		return result;
	} catch (error: unknown) {
		
		localStorage.clear();
		removeAllCookies();
		return wrapResponse({ status: 500, message: errorWrapper(error, 'login') });
	}
}

export async function checkLine(): Promise<WrapResponse<CheckLineResponse>> {
	try {
		const accessToken = Cookies.get('access_token');
		console.log('accessToken', accessToken);
		if (!accessToken)
			return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
		console.log('domain', domain);
		if (!domain)
			return wrapResponse({ status: 401, message: 'Unauthorized' });
		
		const response = await fetch(`${urlApi}/users/check-line`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
			}
		});

		const result = await wrapResponse<CheckLineResponse>(response);

		return result;
	} catch (error: unknown) {
		
		localStorage.clear();
		removeAllCookies();
		return wrapResponse({ status: 500, message: errorWrapper(error, 'checkLine') });
	}
}

export async function uploadUserImage(data: UploadImageUserDTO): Promise<WrapResponse<UploadImageUserResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });

		const formData = new FormData();
        formData.append('file', data.file[0]);

        const response = await fetch(`${urlApi}/users/image`, {
            method: 'POST',
            headers: {
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const result = await wrapResponse<UploadImageUserResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'uploadUserImage') });
    }
}

export async function updateUser(data: UserUpdate): Promise<WrapResponse<ApiResponse>> {
    try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken)
            return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
        if (!domain)
            return wrapResponse({ status: 401, message: 'Unauthorized' });	

        const response = await fetch(`${urlApi}/users/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        });

        const result = await wrapResponse<ApiResponse>(response);

        return result;
    } catch (error: unknown) {
        return wrapResponse({ status: 500, message: errorWrapper(error, 'updateUser') });
    }
}
