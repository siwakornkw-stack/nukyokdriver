// import cuid from 'cuid'
import { Response, Request, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { TokensResponseInterface } from '../interfaces/TokensResponse'
import { generateTokens, verifyRefreshToken } from '../../utils/jwt'
import { sendRefreshToken } from '../../utils/sendRefreshToken'
import {
  createUser,
  findUserById,
  findUserByUsername,
  updateUserLogin,
} from '../users/users.services'
import {
  LoginInput,
  LoginQuerySchema,
  RefreshInput,
  RegisterInput,
  RegisterQuerySchema,
} from './auth.schemas'
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
  revokeTokens,
} from './auth.services'
import * as bcrypt from 'bcrypt'
import { hashToken } from '../../utils/hashToken'
import { randomInt, randomUUID } from 'crypto'
import { Prisma } from '@prisma/client'
import { ParsedToken } from '../../typings/token'
import { getTenant, getTenantId } from '../tenant/tenant.services'
import { string } from 'zod'
import { fetchRegisterAPI, generateRandomPassword } from '../../utils/API'
import { config } from '../../utils/config'
import { ApiResponse } from '../interfaces/ApiResponse'

export async function register(
  req: Request<{}, ApiResponse<TokensResponseInterface>, RegisterInput, RegisterQuerySchema>,
  res: Response<ApiResponse<TokensResponseInterface>>,
  next: NextFunction
) {
  try {
    const { name, username, password, mobileNo, email, lineId } = req.body
    const { refreshTokenInCookie } = req.query
    const TenantId = await getTenantId(req);
    if (!TenantId) throw new Error('get tenant id err.');
    
    const existingUser = await findUserByUsername(TenantId, username)

    if (existingUser) {
      res.status(400)
      throw new Error('username already in use.');
    }
    const Tenant = await getTenant(TenantId);
    if (!Tenant) throw new Error('get Tenant err.');

    const userCreated: Prisma.CustomerCreateInput = {
      Tenant: {
        connect: { TenantId: TenantId }
      },
      Name: name,
      Username: username,
      Password: password,
      PasswordHash: password,
      MobileNo: mobileNo,
      Email: email,
      LineId: lineId,
      PinLine: String(randomInt(0, 9999)).padStart(4, '0'),
      LatestIpAddress: req.ip,
      CreatedByUsername: 'user',
      Status: 'active',
      CreatedTime: new Date(),
      UpdatedTime: new Date()
    }

    const user = await createUser(userCreated)

    const jti = randomUUID()
    const { accessToken, refreshToken } = generateTokens(TenantId, user, jti)

    await addRefreshTokenToWhitelist({ jti, refreshToken, CustomerId: user.CustomerId, TenantId: TenantId })

    await updateUserLogin({
      CustomerId: user.CustomerId,
      RefreshTokensId: jti,
      LatestIpAddress: req.ip
    });

    if (refreshTokenInCookie === 'true') {
      sendRefreshToken(res, refreshToken)
      res.json({
        success: true,
        message: 'register success.',
        data: {
          customer_id: user.CustomerId,
          access_token: accessToken,
          expires_in: config.jwt_access_lifetime
        }
      })
    } else {
      res.json({
        success: true,
        message: 'register success.',
        data: {
          customer_id: user.CustomerId,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: config.jwt_access_lifetime
        }
      })
    }
  } catch (error: any) {
    console.log('register error', error);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

export async function login(
  req: Request<{}, ApiResponse<TokensResponseInterface>, LoginInput, LoginQuerySchema>,
  res: Response<ApiResponse<TokensResponseInterface>>,
  next: NextFunction
) {
  try {
    const { username, password } = req.body
    const { refreshTokenInCookie } = req.query

    const TenantId = await getTenantId(req);
    if (!TenantId) throw new Error('get tenant id err.')
    
    const existingUser = await findUserByUsername(TenantId, username)
    if (!existingUser || existingUser === null) {
      res.status(401)
      throw new Error('username หรือ password ไม่ถูกต้อง.')
    }
    

    const validPassword = await bcrypt.compare(password, existingUser.PasswordHash)
    if (!validPassword) {
      res.status(401)
      throw new Error('username หรือ password ไม่ถูกต้อง.')
    }

    const jti = randomUUID()
    const { accessToken, refreshToken } = generateTokens(TenantId, existingUser, jti)

    await Promise.all([
      addRefreshTokenToWhitelist({
        jti,
        refreshToken,
        CustomerId: existingUser.CustomerId,
        TenantId: TenantId
      }),
      updateUserLogin({
        CustomerId: existingUser.CustomerId,
        RefreshTokensId: jti,
        LatestIpAddress: req.ip
      })
    ]);
    if (refreshTokenInCookie === 'true') {
      sendRefreshToken(res, refreshToken)
      res.json({
        success: true,
        message: 'login success.',
        data: {
          customer_id: existingUser.CustomerId,
          access_token: accessToken,
          expires_in: config.jwt_access_lifetime
        }
      })
    } else {
      res.json({
        success: true,
        message: 'login success.',
        data: {
          customer_id: existingUser.CustomerId,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: config.jwt_access_lifetime
        }
      })
    }
  } catch (error: any) {
    console.log('login error', error);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

export async function refreshTokens(
  req: Request<{}, TokensResponseInterface, RefreshInput>,
  res: Response<TokensResponseInterface>,
  next: NextFunction
) {
  try {
    const refreshToken = req.body.refresh_token || req.cookies?.refresh_token
    if (!refreshToken) {
      res.status(400)
      throw new Error('Missing refresh token.')
    }
    const payload = verifyRefreshToken(refreshToken) as {
      jti: string
      TenantId: string,
      customerId: string,
      username: string,
    }
    const savedRefreshToken = await findRefreshTokenById(payload.jti)
    if (!savedRefreshToken || savedRefreshToken.Revoked === true) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    const hashedToken = hashToken(refreshToken)
    if (hashedToken !== savedRefreshToken.HashedToken) {
      res.status(401)
      throw new Error('Unauthorized')
    }
    const user = await findUserById(payload.customerId)

    if (!user) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    await deleteRefreshToken(savedRefreshToken.RefreshTokenId)
    const jti = randomUUID()
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user.TenantId,
        user,
        jti
    )
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      CustomerId: user.CustomerId,
      TenantId: user.TenantId
    })

    const { refreshTokenInCookie } = req.query

    if (refreshTokenInCookie === 'true') {
      sendRefreshToken(res, newRefreshToken)
      res.json({
        customer_id: user.CustomerId,
        access_token: accessToken,
        expires_in: config.jwt_access_lifetime
      })
    } else {
      res.json({
        customer_id: user.CustomerId,
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_in: config.jwt_access_lifetime
      })
    }
  } catch (error: any) {
    if (
      error instanceof Error &&
      (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError')
    ) {
      return res.status(401).end();
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    return res.status(statusCode).json(error)
  }
}
export async function logout(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    await revokeTokens(parsedToken.customerId)    
    res.status(204).json("logout success.");   
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function test(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const result = {
      TenantId: parsedToken.tenantId,
      CustomerId: parsedToken.customerId,
      Username: parsedToken.username,
      jti: parsedToken.jti
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}