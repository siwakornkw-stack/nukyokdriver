import * as z from 'zod'

export const registerSchema = z.object({
  name: z
  .string({ required_error: 'Name is required' })
  .min(3, 'Name must be at least 3 characters long'),
  username: z
    .string({
      required_error: 'Username is required',
    })
    .min(3, 'Username must be at least 3 characters long'),
  password: z
    .string({ required_error: 'Password is required' }) 
    .min(8, 'Password must be at least 8 characters long'),
  mobileNo: z
    .string({ required_error: 'MobileNo is required' })
    .min(10, 'MobileNo must be 10 characters')
    .max(10, 'MobileNo must be 10 characters'),  
  email: z
  .string({ required_error: 'Email is required' }),
  lineId: z
  .string().optional(),
  mobilePhone: z
  .string().optional(),
  imageUrl: z
  .string().optional(),
});

export const registerQuerySchema = z.object({
  refreshTokenInCookie: z.enum(['true', 'false']).default('false'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterQuerySchema = z.infer<typeof registerQuerySchema>

export const loginSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
    })
    .min(3, 'Username must be at least 3 characters long'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(3, 'Password must be at least 3 characters long'),
})

export const loginQuerySchema = z.object({
  refreshTokenInCookie: z.enum(['true', 'false']).default('false'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type LoginQuerySchema = z.infer<typeof loginQuerySchema>

export const refreshTokenSchema = z.object({
  refresh_token: z.string().optional(),
})

export type RefreshInput = z.infer<typeof refreshTokenSchema>
