import { Router } from 'express'
import { requireUser } from '../middlewares'
import * as AdminController from './admin.controllers'

const router = Router()

router.get(
    '/',
    requireUser,
    AdminController.user
)

export default router