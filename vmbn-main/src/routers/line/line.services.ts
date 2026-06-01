import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'

export const saveWebhook = async (body: any, tenantId: string) => {
  await db.lineWebhook.create({
    data: {
      Body: body,
      TenantId: tenantId,
      CreatedAt: new Date()
    }
  })
}

export const verifyPin = async (userId: string, pin: string, tenantId: string) => {
  const customer = await db.customer.findFirst({
    where: {
      AND: [
        {
          OR: [
            { LinePinVerify: null },
            { LinePinVerify: false }
          ]
        },
        { PinLine: { equals: pin } },
        /* { TenantId: tenantId } */
      ]
    },
    include: {
      Tenant: {
        select: {
          LineChannelAccessToken: true,
          TenantId: true
        }
      }
    }
  });

  if (customer) {
    console.log('LINE: Found', pin, customer?.CustomerId)
    await db.customer.update({
      where: {
        TenantId: customer.Tenant.TenantId,
        CustomerId: customer.CustomerId
      },
      data: {
        LinePinVerify: true,
        LineUserId: userId
      }
    })
    return customer
  }else{
    console.log('LINE: Not Found', pin, tenantId)
    return null
  }
}

export interface LineMessage {
  type: string;
  text?: string;
}

interface LineReplyRequest {
  replyToken: string;
  messages: LineMessage[];
}

// Push arbitrary LINE messages (text, template, flex, ...) to a user.
export const pushMessage = async (channelAccessToken: string, to: string, messages: any[]) => {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({ to, messages })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE push error: ${response.status} ${detail}`);
  }
  return await response.json();
}

export const replyMessage = async (channelAccessToken: string, replyToken: string, messages: LineMessage[]) => {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: messages
      } as LineReplyRequest)
    });

    if (!response.ok) {
      throw new Error(`LINE API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending LINE reply:', error);
    throw error;
  }
}