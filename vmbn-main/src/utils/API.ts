import { Decimal } from '@prisma/client/runtime/library';
import axios from 'axios';
import crypto from 'crypto';
import { HeaderAgent, ReqAgentBalance, ReqBalance, ReqChangePassword, ReqCommission, ReqCreditHistory, ReqDirectPlay, ReqGameSetting, ReqListsGameProvider, ReqRegister, ReqTransfer, ResRegister } from '../typings/agent';
import { date } from 'zod';
import qs from 'qs';
import { APIResponse } from '../typings/api';
export function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export function generateSignature(url: string, key: string): string {
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(url);
    const signature = hmac.digest('base64');
    return signature;
}

export function generateRandomPassword(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
}

export async function fetchStatusAPI(agent: HeaderAgent) {
    try {
        const headers = {
            'x-api-key': agent.xApiKey,
        };
        const url: string = process.env.AGENT_URL + '/v4/status';
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}

export async function fetchRegisterAPI(agent: HeaderAgent,payload: ReqRegister): Promise<APIResponse<ResRegister>> {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/user/register';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        if (response.status === 200) {
            return {
                code: response.status,
                status: "success",
                data: response.data
            };
        } else {
            return {
                code: response.status,
                status: "error",
                message: `Unexpected response code: ${response.status}`
            };
        }
    } catch (error: any) {
        console.error("API Error:", error.message);
        return {
            code: error.response?.status || 500,
            status: "error",
            message: error.response?.data?.message || error.message
        };
    }
}

export async function fetchBalanceAPI(agent: HeaderAgent,payload: ReqBalance) {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/user/balance';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}
export async function fetchChangePasswordAPI(agent: HeaderAgent,payload: ReqChangePassword) {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/user/changePassword';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}
export async function fetchTransferAPI(agent: HeaderAgent,payload: ReqTransfer ) {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/user/transfer';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}

export async function fetchCreditHistoryAPI(agent: HeaderAgent,payload: ReqCreditHistory ) {
    try {
        const headers = {
            'x-api-key': agent.xApiKey,
        };
        const queryString = qs.stringify(payload);
        const url: string = process.env.AGENT_URL + `/v4/user/creditHistory?${queryString}`;

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}
export async function fetchGameSettingAPI(agent: HeaderAgent,payload: ReqGameSetting ) {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/user/gameSetting';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}export async function fetchCommissionAPI(agent: HeaderAgent,payload: ReqCommission ) {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/user/commission';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}









//play
export async function fetchDirectPlayAPI(agent: HeaderAgent,payload: ReqDirectPlay ) {
    try {
        const headers = {
            'x-api-cat': agent.xApiCat,
            'x-api-key': agent.xApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url: string = process.env.AGENT_URL + '/v4/play/login';
        const data = qs.stringify(payload);

        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}
export async function fetchListsGameProviderAPI(agent: HeaderAgent,payload: ReqListsGameProvider ) {
    try {
        const headers = {
            'x-api-key': agent.xApiKey,
        };
        const queryString = qs.stringify(payload);
        const url: string = process.env.AGENT_GAME_ENTRANCE_HOSTNAME + `/games_share/${queryString}`;

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}

//Agent
export async function fetchAgentBalanceAPI(agent: HeaderAgent,payload: ReqAgentBalance ) {
    try {
        const headers = {
            'x-api-key': agent.xApiKey,
        };
        const queryString = qs.stringify(payload);
        const url: string = process.env.AGENT_URL + `/v4/agent/balance?${queryString}`;

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error: any) {
        console.log(error.message)
        return {
            status: "error",
            message: error.message
        }
    }
}
