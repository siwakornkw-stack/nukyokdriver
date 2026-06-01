import { Response, Request, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import { findUserByIdMVC, checkLineService, updateUserService, updatePasswordService, verifyPasswordService } from './users.services'
import { MulterFile } from '../../typings/vehicle'

export async function user(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {

    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const response = await findUserByIdMVC(parsedToken.customerId);

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
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function checkLine(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const payload = {
      TenantId: parsedToken.tenantId,
      CustomerId: parsedToken.customerId,
    }
    const response = await checkLineService(payload);
  
    const responseData  = {
      hasLine: response?.LineUserId ? true : false,
      pid: response?.PinLine || '',
      lineImgUrl: response?.Tenant?.LineImgUrl || null,
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: responseData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function uploadImageUser(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start uploadImageUser');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const file = req.file as MulterFile;

    if (!file) {
      throw new Error('ไม่พบไฟล์ที่อัพโหลด')
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        url: `/uploads/users/${file.filename}`
      }
    })
  } catch (error: any) {
    console.error('Error in uploadImageUser:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function updateUser(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!parsedToken.customerId) throw new Error('CustomerId is required')
    if (!parsedToken.tenantId) throw new Error('TenantId is required')
    
    const data = req.body

    if (!data) throw new Error('Data is required')

    console.log('data', data)

    const response = await updateUserService(data, parsedToken.customerId, parsedToken.tenantId)

    if (!response) throw new Error('User not found')

    res.json({
      success: true,
      code: 200,
      message: 'success'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function updatePassword(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!parsedToken.customerId) throw new Error('CustomerId is required')
    if (!parsedToken.tenantId) throw new Error('TenantId is required')
    
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new Error('รหัสผ่านปัจจุบัน รหัสผ่านใหม่ และยืนยันรหัสผ่านใหม่จำเป็น')
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isCurrentPasswordValid = await verifyPasswordService(parsedToken.customerId, parsedToken.tenantId, oldPassword)
    if (!isCurrentPasswordValid) {
      throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง')
    }

    if (newPassword !== confirmPassword) {
      throw new Error('รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน')
    }

    if (newPassword.length < 6) {
      throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    }

    // ตรวจสอบว่ารหัสผ่านใหม่ไม่เหมือนกับรหัสผ่านปัจจุบัน
    if (oldPassword === newPassword) {
      throw new Error('รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน')
    }

    const response = await updatePasswordService(parsedToken.customerId, parsedToken.tenantId, newPassword)

    if (!response) throw new Error('ไม่พบผู้ใช้')

    res.json({
      success: true,
      code: 200,
      message: 'อัปเดตรหัสผ่านสำเร็จ'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
