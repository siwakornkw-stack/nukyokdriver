import { Response, Request, NextFunction } from 'express'
import * as LineService from './line.services'
import * as DriverJobService from '../driverjob/driverjob.services'
import * as LineCommands from './line.commands'
import { resolveLineUser } from './line.roles'
import { LineWebhookEvent } from './line.type'
import { LineMessage } from './line.services'
import { db } from '../../utils/db.server'

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.params.tenantId

    const tenant = await db.tenant.findFirst({
      where: { TenantId: tenantId },
      select: { TenantId: true, LineChannelAccessToken: true, LineChannelSecret: true },
    })
    if (!tenant) return res.status(404).send('tenant not found')

    // Verify the LINE signature when a channel secret is configured. Tenants that
    // have not set a secret yet fall through with a warning (migration path).
    const signature = req.header('x-line-signature')
    if (tenant.LineChannelSecret) {
      const ok = LineService.verifySignature(tenant.LineChannelSecret, (req as any).rawBody, signature)
      if (!ok) return res.status(401).send('invalid signature')
    } else {
      console.warn('LINE: no channel secret configured for tenant', tenantId, '- skipping signature check')
    }

    const channelAccessToken = tenant.LineChannelAccessToken
    const webhookData: LineWebhookEvent = req.body

    const reply = async (replyToken: string | undefined, text: string) => {
      if (channelAccessToken && replyToken) {
        const messages: LineMessage[] = [{ type: 'text', text }]
        try { await LineService.replyMessage(channelAccessToken, replyToken, messages) } catch (e) { console.error('LINE reply failed:', e) }
      }
    }

    for (const event of webhookData.events ?? []) {
      // Skip events we've already processed (LINE redelivery).
      const fresh = await LineService.markEventOnce((event as any).webhookEventId)
      if (!fresh) continue

      const userId = event.source?.userId
      const who = await resolveLineUser(tenantId, userId)

      // --- Postback (button taps) -------------------------------------------
      if (event.type === 'postback' && event.postback?.data) {
        if (who.role === 'driver') {
          await DriverJobService.handlePostback(userId, event.postback.data, event.replyToken, tenantId)
        } else if (who.role === 'dispatcher') {
          const ctx: LineCommands.DispatcherCtx = { tenantId, userId: userId!, replyToken: event.replyToken, channelAccessToken, customerId: who.customerId, name: who.name }
          const action = await LineCommands.handleDispatcherPostback(ctx, event.postback.data, event.postback.params)
          await LineService.logCommand(tenantId, userId!, 'dispatcher', `postback:${event.postback.data}`, action, 'ok')
        }
        continue
      }

      // --- Text messages -----------------------------------------------------
      if (event.type !== 'message' || event.message?.type !== 'text' || !userId) continue
      const message = event.message.text

      if (who.role === 'dispatcher') {
        const ctx: LineCommands.DispatcherCtx = { tenantId, userId, replyToken: event.replyToken, channelAccessToken, customerId: who.customerId, name: who.name }
        const action = await LineCommands.handleDispatcherText(ctx, message)
        await LineService.logCommand(tenantId, userId, 'dispatcher', message, action, action === 'unknown' ? 'invalid' : 'ok')
        continue
      }

      if (who.role === 'driver') {
        if (/^(งานฉัน|งานของฉัน|my)$/i.test(message.trim())) {
          const jobs = await DriverJobService.listActiveJobsForDriver(tenantId, who.driverId!)
          const text = jobs.length === 0
            ? 'คุณไม่มีงานที่กำลังดำเนินการ'
            : ['งานของคุณ', ...jobs.map((j) => `#${j.JobNo ?? '-'} ${j.Origin}→${j.Destination} [${j.Status}]`)].join('\n')
          await reply(event.replyToken, text)
          await LineService.logCommand(tenantId, userId, 'driver', message, 'my_jobs', 'ok')
        }
        continue
      }

      // --- Unknown user: account-linking PIN (existing flow) -----------------
      const isOTP = /^\d{4}$/.test(message)
      if (isOTP) {
        console.log('LINE: Found OTP:', tenantId, userId, message)
        const customer = await LineService.verifyPin(userId, message, tenantId)
        if (customer) {
          await reply(event.replyToken, 'ยืนยันการสมัครสมาชิกสำเร็จ')
          await db.notification.create({
            data: { CustomerId: customer.CustomerId, Title: 'ยืนยันการสมัครสมาชิก', Message: 'ยืนยันการสมัครสมาชิกสำเร็จ' },
          })
        }
      }
    }

    await LineService.saveWebhook(JSON.stringify(req.body), tenantId)
    res.send('ok')
  } catch (error) {
    next(error)
  }
}
