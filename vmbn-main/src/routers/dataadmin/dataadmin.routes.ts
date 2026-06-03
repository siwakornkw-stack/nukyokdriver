import { Router } from 'express'
import { requireUser, requireRole } from '../middlewares'
import * as DataAdminController from './dataadmin.controllers'

const router = Router()

// Admin-only data management (list / preview / delete per-vehicle records).
router.use(requireUser, requireRole('admin'))

router.get('/types', DataAdminController.types)
router.get('/:type', DataAdminController.list)
router.post('/:type/preview', DataAdminController.preview)
router.post('/:type/delete', DataAdminController.remove)

export default router
