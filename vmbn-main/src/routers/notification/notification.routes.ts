import { Router, Response } from 'express'
import { requireUser } from '../middlewares'
import { IGetUserAuthInfoRequest } from '../../typings/express'
import { db } from '../../utils/db.server'

const router = Router()

// Polling endpoint (replaces the old SSE push). Returns this customer's unread
// notifications and marks them read so each one is delivered once.
router.get('/', requireUser, async (req: IGetUserAuthInfoRequest, res: Response, next) => {
    try {
        const customerId = req.parsedToken?.customerId
        if (!customerId) {
            res.status(401)
            throw new Error('Unauthorized')
        }

        const items = await db.notification.findMany({
            where: { CustomerId: customerId, IsRead: false },
            orderBy: { CreatedTime: 'asc' }
        })

        if (items.length > 0) {
            await db.notification.updateMany({
                where: { NotificationId: { in: items.map((n) => n.NotificationId) } },
                data: { IsRead: true }
            })
        }

        res.json({
            success: true,
            data: items.map((n) => ({
                type: 'notification',
                data: { title: n.Title, message: n.Message, timestamp: n.CreatedTime }
            }))
        })
    } catch (error) {
        next(error)
    }
})

export default router
