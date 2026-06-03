import { Response, Request, NextFunction } from 'express'
import { IGetUserAuthInfoRequestAdmin } from "../../typings/express"
import { ParsedTokenAdmin } from '../../typings/token'
import { findUserAdminByIdMVC } from './admin.services'

export async function user(req: IGetUserAuthInfoRequestAdmin, res: Response, next: NextFunction) {
  try {
    
    const parsedToken: ParsedTokenAdmin | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const response = await findUserAdminByIdMVC(parsedToken.adminId);

    if (!response) {
      res.status(404)
      throw new Error('User not found.')
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    res.status(statusCode).json({
      success: false,
      code: statusCode,
      message: error.message
    });
  }
}