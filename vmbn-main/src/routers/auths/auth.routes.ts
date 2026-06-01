import { Router } from 'express'
import { requireUser, validateRequest } from '../middlewares'
import * as AuthControllers from './auth.controllers'
import {
  loginQuerySchema,
  loginSchema,
  registerQuerySchema,
  registerSchema,
  refreshTokenSchema,
} from './auth.schemas'

const router = Router()
router.post(
  '/test',
  requireUser,
  AuthControllers.test
)

router.post(
  '/register',
  validateRequest({ query: registerQuerySchema, body: registerSchema }),
  AuthControllers.register
)

router.post(
  '/login',
  validateRequest({ query: loginQuerySchema, body: loginSchema }),
  AuthControllers.login
)
router.post(
  '/logout',
  AuthControllers.logout
)

router.post(
  '/refreshToken',
  validateRequest({ query: loginQuerySchema, body: refreshTokenSchema }),
  AuthControllers.refreshTokens
)

export default router