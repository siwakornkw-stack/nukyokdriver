import { db } from "../utils/db.server"

export async function getAllTenant() {
    return await db.tenant.findMany({
        where: {
            Status: 'active',
            LineChannelAccessToken: {
                not: null
            }
        },
        select: {
            TenantId: true,
            LineChannelAccessToken: true
        }
    })
}
export async function getAllCustomerTenant(TenantId: string) {
    const today = new Date()

    return await db.customer.findMany({
        where: {
            Status: 'active',
            TenantId: TenantId,
            LinePinVerify: true
        },
        select: {
            LineUserId: true
        }
    })
}

export async function sendLineMessage(channelToken: string, to: string, message: string) {
    const LINE_CHANNEL_ACCESS_TOKEN = channelToken;

    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: to,
                messages: [{
                    type: 'text',
                    text: message
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`LINE API Error: ${response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error sending LINE message:', error);
        throw error;
    }
}