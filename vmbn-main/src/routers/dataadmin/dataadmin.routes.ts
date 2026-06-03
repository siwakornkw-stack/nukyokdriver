import { Router } from 'express'
import { requireUser, requireRole } from '../middlewares'
import * as DataAdminController from './dataadmin.controllers'

const router = Router()

// Admin-only data management (list / preview / delete per-vehicle records).
router.use(requireUser, requireRole('admin'))

router.get('/types', DataAdminController.types)

// Vehicle deletion (admin) — registered before the generic /:type routes so
// "vehicles" isn't captured as a data type.
router.get('/vehicles', DataAdminController.vehicleList)
router.post('/vehicles/preview', DataAdminController.vehiclePreview)
router.post('/vehicles/delete', DataAdminController.vehicleRemove)

router.get('/:type', DataAdminController.list)
router.post('/:type/preview', DataAdminController.preview)
router.post('/:type/delete', DataAdminController.remove)

export default router
