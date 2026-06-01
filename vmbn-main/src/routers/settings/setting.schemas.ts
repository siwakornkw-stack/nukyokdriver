import { z } from 'zod'

export const getSettingsSchema = {
  query: z.object({
    category: z.string().optional(),
    key: z.string().optional(),
  }),
}

export const createSettingSchema = {
  body: z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required'),
    category: z.string().min(1, 'Category is required'),
  }),
}

export const updateSettingSchema = {
  body: z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required').optional(),
    category: z.string().min(1, 'Category is required').optional(),
  }),
}

export const deleteSettingSchema = {
  params: z.object({
    id: z.string().min(1, 'Setting ID is required'),
  }),
} 