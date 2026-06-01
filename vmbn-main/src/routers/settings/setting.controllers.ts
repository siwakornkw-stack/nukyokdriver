import { Request, Response } from 'express'
import { IGetUserAuthInfoRequest, IGetRequestTenant } from '../../typings/express'
import {
  getSettingsByTenantId,
  getSettingsByKeys,
  createSetting,
  updateSetting,
  deleteSetting,
  findSettingByKey,
  findSettingById,
  updateSettingByKey,
} from './setting.services'

export const getSettings = async (req: IGetRequestTenant, res: Response) => {
  try {
    const tenantId = req.tenantId
    const { category, key } = req.query as { category?: string; key?: string }

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      })
    }

    const filters = {
      ...(category && { category }),
      ...(key && { key }),
    }

    const settings = await getSettingsByTenantId(tenantId, filters)

    res.json({
      success: true,
      data: settings,
      message: 'Settings retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get settings',
    })
  }
}

export const getSetting = async (req: IGetRequestTenant, res: Response) => {
  try {
    const tenantId = req.tenantId
    const { keys, category } = req.body

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      })
    }

    if (!Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        message: 'Keys must be an array',
      })
    }

    const settings = await getSettingsByKeys(tenantId, keys, category)

    // Convert to key-value object
    const result: { [key: string]: string | null } = {}
    keys.forEach(key => {
      const setting = settings.find(s => s.Key === key)
      result[key] = setting ? setting.Value : null
    })

    res.json({
      success: true,
      data: result,
      message: 'Settings retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get settings',
    })
  }
}

export const createSettingHandler = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const tenantId = req.parsedToken?.tenantId
    const { key, value, category } = req.body

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      })
    }

    const setting = await createSetting(tenantId, { key, value, category })

    res.status(201).json({
      success: true,
      data: setting,
      message: 'Setting created successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create setting',
    })
  }
}

export const updateSettingHandler = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const tenantId = req.parsedToken?.tenantId
    const { key, value, category } = req.body

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      })
    }

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key is required',
      })
    }

    // Check if setting exists
    const existingSetting = await findSettingByKey(key, tenantId)

    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      })
    }

    const result = await updateSettingByKey(key, tenantId, { value, category })

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found or no changes made',
      })
    }

    res.json({
      success: true,
      message: 'Setting updated successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update setting',
    })
  }
}

export const deleteSettingHandler = async (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const tenantId = req.parsedToken?.tenantId
    const { id } = req.params

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required',
      })
    }

    // Check if setting exists and delete
    const existingSetting = await findSettingById(id, tenantId)
    
    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      })
    }

    const result = await deleteSetting(id, tenantId)

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      })
    }

    res.json({
      success: true,
      message: 'Setting deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete setting',
    })
  }
} 