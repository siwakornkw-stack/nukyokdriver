import * as bcrypt from 'bcrypt'
import * as crypto from 'node:crypto'
import { db } from '../../utils/db.server'
import redis, { connectRedis } from '../../utils/redisClient'

// LINE signs every webhook with HMAC-SHA256(channelSecret, rawBody), base64.
// Returns false on any mismatch or missing input so callers can reject (401).
export const verifySignature = (channelSecret: string | null | undefined, rawBody: Buffer | undefined, signature: string | undefined): boolean => {
  if (!channelSecret || !rawBody || !signature) return false
  const expected = crypto.createHmac('sha256', channelSecret).update(rawBody).digest('base64')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export const saveWebhook = async (body: any, tenantId: string) => {
  await db.lineWebhook.create({
    data: {
      Body: body,
      TenantId: tenantId,
      CreatedAt: new Date()
    }
  })
}

export const logCommand = async (tenantId: string, lineUserId: string, role: string, rawText: string, parsedAction: string | null, resultStatus: string) => {
  try {
    await db.lineCommand.create({
      data: { TenantId: tenantId, LineUserId: lineUserId, Role: role, RawText: rawText, ParsedAction: parsedAction, ResultStatus: resultStatus },
    })
  } catch (e) {
    console.error('LINE: logCommand failed', e)
  }
}

// LINE may redeliver a webhook event (deliveryContext.isRedelivery). Mark each
// webhookEventId in Redis with a short TTL so we process it exactly once.
export const markEventOnce = async (eventId: string | undefined): Promise<boolean> => {
  if (!eventId) return true
  try {
    await connectRedis()
    const set = await redis.set(`line:evt:${eventId}`, '1', { NX: true, EX: 3600 })
    return set === 'OK'
  } catch {
    return true // if Redis is unavailable, don't block processing
  }
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

// Fetch a LINE user's profile (displayName, picture). Returns null on any error
// so callers can fall back to the bare userId.
export const getProfile = async (channelAccessToken: string, userId: string): Promise<{ displayName: string; pictureUrl?: string } | null> => {
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
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