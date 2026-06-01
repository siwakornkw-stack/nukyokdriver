import { Router } from 'express'
import { requireUser } from '../middlewares'
import * as DashboardController from './dashboard.controllers'
import multer from 'multer'
import path from 'path'
import * as crypto from 'node:crypto'

const router = Router()
router.get(
    '/',
    requireUser,
    DashboardController.getDashboardController
)

router.post(
    '/summary',
    requireUser,
    DashboardController.getSummaryFromDateRange
)

export default router