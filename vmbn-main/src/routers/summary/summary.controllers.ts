import { Response, Request, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import { getIncomeSummaryService, getFuelSummaryService, getFuelDetailService, getExpenseSummaryService, getCostDetailService } from './summary.services'

export async function getIncomeSummary(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('getIncomeSummary');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    // รับพารามิเตอร์ startDate และ endDate จาก query
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    console.log('startDate:', startDate)
    console.log('endDate:', endDate)

    // ตรวจสอบรูปแบบวันที่ (ถ้ามีการส่งมา)
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'
        });
      }
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const summaryData = await getIncomeSummaryService(
      parsedToken.tenantId,
      startDate,
      endDate
    )

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: summaryData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getFuelSummary(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('getFuelSummary');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    // รับพารามิเตอร์ startDate และ endDate จาก query
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    console.log('startDate:', startDate)
    console.log('endDate:', endDate)

    // ตรวจสอบรูปแบบวันที่ (ถ้ามีการส่งมา)
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'
        });
      }
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const summaryData = await getFuelSummaryService(
      parsedToken.tenantId,
      startDate,
      endDate
    )

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: summaryData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getFuelDetail(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'
        });
      }
    }

    const detailData = await getFuelDetailService(
      parsedToken.tenantId,
      startDate,
      endDate
    )

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: detailData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getExpenseSummary(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'
        });
      }
    }

    const expenseData = await getExpenseSummaryService(
      parsedToken.tenantId,
      startDate,
      endDate
    )

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: expenseData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getCostDetail(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'
        });
      }
    }

    const detailData = await getCostDetailService(
      parsedToken.tenantId,
      startDate,
      endDate
    )

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: detailData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}