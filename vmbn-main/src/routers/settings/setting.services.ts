import { db } from '../../utils/db.server'

export interface SettingFilters {
  category?: string
  key?: string
}

export const getSettingsByTenantId = async (tenantId: string, filters?: SettingFilters) => {
  try {
    const whereClause: any = {
      TenantId: tenantId,
    }

    if (filters?.category) {
      whereClause.Category = filters.category
    }

    if (filters?.key) {
      whereClause.Key = filters.key
    }

    const settings = await db.setting.findMany({
      where: whereClause,
      orderBy: {
        Category: 'asc',
        Key: 'asc',
      },
    })

    return settings
  } catch (error) {
    throw new Error(`Failed to get settings: ${error}`)
  }
}

export const getSettingByKey = async (key: string, tenantId: string) => {
  try {
    const setting = await db.setting.findFirst({
      where: {
        Key: key,
        TenantId: tenantId,
      },
    })

    return setting
  } catch (error) {
    throw new Error(`Failed to get setting: ${error}`)
  }
}

export const createSetting = async (tenantId: string, data: { key: string; value: string; category: string }) => {
  try {
    const setting = await db.setting.create({
      data: {
        TenantId: tenantId,
        Key: data.key,
        Value: data.value,
        Category: data.category,
      },
    })

    return setting
  } catch (error) {
    throw new Error(`Failed to create setting: ${error}`)
  }
}

export const updateSetting = async (settingId: string, tenantId: string, data: { key?: string; value?: string; category?: string }) => {
  try {
    const setting = await db.setting.updateMany({
      where: {
        SettingConfigId: settingId,
        TenantId: tenantId,
      },
      data: {
        ...(data.key && { Key: data.key }),
        ...(data.value && { Value: data.value }),
        ...(data.category && { Category: data.category }),
      },
    })

    return setting
  } catch (error) {
    throw new Error(`Failed to update setting: ${error}`)
  }
}

export const deleteSetting = async (settingId: string, tenantId: string) => {
  try {
    const setting = await db.setting.deleteMany({
      where: {
        SettingConfigId: settingId,
        TenantId: tenantId,
      },
    })

    return setting
  } catch (error) {
    throw new Error(`Failed to delete setting: ${error}`)
  }
}

export const getSettingsByKeys = async (tenantId: string, keys: string[], category?: string) => {
  try {
    const whereClause: any = {
      TenantId: tenantId,
      Key: {
        in: keys
      }
    }

    if (category) {
      whereClause.Category = category
    }

    const settings = await db.setting.findMany({
      where: whereClause,
    })

    return settings
  } catch (error) {
    throw new Error(`Failed to get settings by keys: ${error}`)
  }
}

export const findSettingByKey = async (key: string, tenantId: string) => {
  try {
    const setting = await db.setting.findFirst({
      where: {
        Key: key,
        TenantId: tenantId,
      },
    })
    return setting
  } catch (error) {
    throw new Error(`Failed to find setting by key: ${error}`)
  }
}

export const findSettingById = async (id: string, tenantId: string) => {
  try {
    const setting = await db.setting.findFirst({
      where: {
        SettingConfigId: id,
        TenantId: tenantId,
      },
    })
    return setting
  } catch (error) {
    throw new Error(`Failed to find setting by id: ${error}`)
  }
}

export const updateSettingByKey = async (key: string, tenantId: string, data: { value?: string; category?: string }) => {
  try {
    const result = await db.setting.updateMany({
      where: {
        Key: key,
        TenantId: tenantId,
      },
      data: {
        ...(data.value && { Value: data.value }),
        ...(data.category && { Category: data.category }),
      },
    })
    return result
  } catch (error) {
    throw new Error(`Failed to update setting by key: ${error}`)
  }
} 