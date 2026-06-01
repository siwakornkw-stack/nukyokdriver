import { Response, Request, NextFunction, response } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import { Prisma } from '@prisma/client'
import * as LineService from './line.services'
import * as DriverJobService from '../driverjob/driverjob.services'
import { LineWebhookEvent } from './line.type'
import { LineMessage } from './line.services'
import { sseService } from '../../services/sse.service'

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let tenantId = req.params.tenantId;

        const webhookData: LineWebhookEvent = req.body

        for (const event of webhookData.events) {
            const userId = event.source?.userId

            // Driver tapped accept/reject on a job card.
            if (event.type === 'postback' && event.postback?.data) {
                await DriverJobService.handlePostback(userId, event.postback.data, event.replyToken, tenantId)
                continue
            }

            if (event.type !== 'message' || event.message?.type !== 'text' || !userId) continue
            const message = event.message.text

            const isOTP = /^\d{4}$/.test(message)
            if (isOTP) {
                console.log('LINE: Found OTP:', tenantId, userId, message)
                const customer = await LineService.verifyPin(userId, message, tenantId)
                if (customer) {
                    const channelAccessToken = customer.Tenant.LineChannelAccessToken
                    if (channelAccessToken && event.replyToken) {
                        const messages: LineMessage[] = [
                            { type: 'text', text: 'ยืนยันการสมัครสมาชิกสำเร็จ' }
                        ]

                        LineService.replyMessage(channelAccessToken, event.replyToken, messages)

                        sseService.sendMessage(customer.CustomerId, {
                            type: 'notification',
                            data: {
                                title: 'ยืนยันการสมัครสมาชิก',
                                message: 'ยืนยันการสมัครสมาชิกสำเร็จ',
                                timestamp: new Date()
                            }
                        })
                    }

                    tenantId = customer.Tenant.TenantId
                }
            }
        }

        await LineService.saveWebhook(JSON.stringify(req.body), tenantId)
        res.send('ok')
    } catch (error) {
        next(error)
    }
}