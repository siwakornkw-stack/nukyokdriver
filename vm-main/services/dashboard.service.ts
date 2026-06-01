import type { WrapResponse } from "../types/utils";
import { wrapResponse } from "../types/utils";
import { errorWrapper, getDomain } from "../helpers/helper";
import Cookies from 'js-cookie';
import type { DashboardResponse, SummaryResponse } from "@/types/dashboard";

const urlApi = process.env.NEXT_PUBLIC_URL_API ?? '';

export async function getDashboard(): Promise<WrapResponse<DashboardResponse | null>> {
	try {
		const accessToken = Cookies.get('access_token');
		if (!accessToken)
			return wrapResponse({ status: 401, message: 'Unauthorized' });
        const domain = getDomain();
		if (!domain)
			return wrapResponse({ status: 401, message: 'Unauthorized' });

		const response = await fetch(`${urlApi}/dashboard/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
                'x-domain': domain,
                'Authorization': `Bearer ${accessToken}`
			}
		});
		const result = await wrapResponse<DashboardResponse>(response);

		return result;
	} catch (error: unknown) {
		return wrapResponse({ status: 500, message: errorWrapper(error, 'getDashboard') });
	}
}

export async function getSummary(startDate: Date, endDate: Date): Promise<WrapResponse<SummaryResponse | null>> {
    const accessToken = Cookies.get('access_token');
    if (!accessToken)
        return wrapResponse({ status: 401, message: 'Unauthorized' });
    const domain = getDomain();
    if (!domain)
        return wrapResponse({ status: 401, message: 'Unauthorized' });

	const payload = {
		startDate,
		endDate
	}

    const response = await fetch(`${urlApi}/dashboard/summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-domain': domain,
            'Authorization': `Bearer ${accessToken}`
        },
		body: JSON.stringify(payload)
    });

	const result = await wrapResponse<SummaryResponse>(response);

	return result;
}