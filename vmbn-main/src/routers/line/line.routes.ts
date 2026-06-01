import { Router } from 'express'
import { requireUser } from '../middlewares'
import multer from 'multer'
import path from 'path'
import * as crypto from 'node:crypto'
import * as LineController from './line.controllers'


const router = Router()

router.post('/webhook/:tenantId', LineController.webhook)

export default router