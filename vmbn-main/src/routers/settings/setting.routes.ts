import { Router } from 'express'
import { validateRequest, GetTenantId } from '../middlewares'
import {
  getSettingsSchema,
  createSettingSchema,
  updateSettingSchema,
  deleteSettingSchema,
} from './setting.schemas'
import {
  getSettings,
  getSetting,
  createSettingHandler,
  updateSettingHandler,
  deleteSettingHandler,
} from './setting.controllers'

const router = Router()

// Get all settings for a tenant (with optional filters)
router.get(
  '/',
  GetTenantId,
  validateRequest(getSettingsSchema),
  getSettings
)

// Get settings by keys array
router.post(
  '/get',
  GetTenantId,
  getSetting
)

// Create a new setting
router.post(
  '/create',
  validateRequest(createSettingSchema),
  createSettingHandler
)

// Update a setting by key
router.post(
  '/update',
  GetTenantId,
  validateRequest(updateSettingSchema),
  updateSettingHandler
)

// Delete a setting
router.delete(
  '/delete',
  validateRequest(deleteSettingSchema),
  deleteSettingHandler
)

export default router 