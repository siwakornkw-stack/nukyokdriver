import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { IGetUserAuthInfoRequest, IGetUserAuthInfoRequestAdmin, IGetRequestTenant } from "../typings/express"
import ErrorResponse from './interfaces/ErrorResponse'
import RequestValidators from './interfaces/RequestValidators'
import { ParsedToken, ParsedTokenAdmin } from '../typings/token'
import { config } from '../utils/config'
import { verifyAccessToken } from '../utils/jwt'
import { findRefreshTokenById, findRefreshTokenByIdAdmin } from './auths/auth.services'

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  if (res.headersSent) return next(err)
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({
    status: statusCode,
    message: err.message,
    stack: config.environment === 'development' ? err.stack : '🥞',
  })
}

export function validateRequest(validators: RequestValidators) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params)
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body)
      }
      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: error.errors[0].message
        });
      }
      next(error)
    }
  }
}

export function deserializeUser(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = (req.headers.authorization || '').replace(
      /^Bearer\s/,
      ''
    )
    if (!accessToken) {
      return next()
    }

    next()
  } catch (error) {
    next()
  }
}

export async function requireUser(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    
    const accessToken = (req.headers.authorization || '').replace(
      /^Bearer\s/,
      ''
    )
    const payload = verifyAccessToken(accessToken) as ParsedToken
    req.parsedToken = payload
    const parsedToken = req.parsedToken
    if (!parsedToken || !parsedToken.customerId || !parsedToken.jti) {
      res.status(401)
      throw new Error('Unauthorized.')
    }

    const savedRefreshToken = await findRefreshTokenById(parsedToken.jti)
    if (!savedRefreshToken || savedRefreshToken.Revoked === true) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Must run after requireUser. Legacy tokens without a role are treated as 'admin'
// so existing sessions are not locked out before they refresh.
export function requireRole(...allowed: string[]) {
  return (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const role = req.parsedToken?.role ?? 'admin'
    if (!allowed.includes(role)) {
      res.status(403)
      return next(new Error('ไม่มีสิทธิ์เข้าถึงเมนูนี้'))
    }
    next()
  }
}

// Blocks write actions for read-only (viewer) users.
export function requireWrite(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  const role = req.parsedToken?.role ?? 'admin'
  if (role === 'viewer') {
    res.status(403)
    return next(new Error('บัญชีนี้เป็นแบบดูอย่างเดียว ไม่สามารถแก้ไขข้อมูลได้'))
  }
  next()
}

export async function requireUserAdmin(req: IGetUserAuthInfoRequestAdmin, res: Response, next: NextFunction) {
  try {
    const accessToken = (req.headers.authorization || '').replace(
      /^Bearer\s/,
      ''
    )
    const payload = verifyAccessToken(accessToken) as ParsedTokenAdmin
    req.parsedToken = payload
    const parsedToken = req.parsedToken
    if (!parsedToken || !parsedToken.adminId || !parsedToken.jti) {
      res.status(401)
      throw new Error('Unauthorized.')
    }

    const savedRefreshToken = await findRefreshTokenByIdAdmin(parsedToken.jti)
    if (!savedRefreshToken || savedRefreshToken.Revoked === true) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    next()
  } catch (error) {
    next(error)
  }
}

export async function GetTenantId(req: IGetRequestTenant, res: Response, next: NextFunction) {
  try {
    // Get domain from headers
    const headers = req.headers as unknown as { [key: string]: string | undefined };
    const domain = headers['x-domain'] || headers['host'] || req.get('host');
    
    if (!domain) {
      res.status(400)
      throw new Error('Domain is required')
    }

    // Find tenant by domain
    const { getTenantId } = require('./tenant/tenant.services')
    
    const tenantId = await getTenantId(req)

    if (!tenantId) {
      res.status(404)
      throw new Error('Tenant not found for this domain')
    }

    // Add tenant info to request
    req.tenantId = tenantId

    next()
  } catch (error) {
    next(error)
  }
}