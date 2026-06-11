import { Router } from 'express'
import { requireUser } from '../middlewares'
import * as SummaryController from './summary.controllers'

const router = Router()

router.get(
    '/income',
    requireUser,
    SummaryController.getIncomeSummary
)

router.get(
    '/fuel',
    requireUser,
    SummaryController.getFuelSummary
)

router.get(
    '/fuel-detail',
    requireUser,
    SummaryController.getFuelDetail
)

router.get(
    '/expense',
    requireUser,
    SummaryController.getExpenseSummary
)

export default router 